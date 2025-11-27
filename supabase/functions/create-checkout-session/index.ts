// =====================================================
// EDGE FUNCTION: create-checkout-session (CON SENTRY)
// =====================================================
// Crea una sesión de checkout en Mercado Pago
// con validación estricta, rate limiting, sanitización y Sentry
// =====================================================

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { 
  securityMiddleware, 
  genericErrorResponse,
  getClientIP 
} from '../_shared/security.ts';
import { 
  sanitizeRequest, 
  sanitizeUUID, 
  sanitizeEnum,
  sanitizeString 
} from '../_shared/sanitizer.ts';
import { corsHeaders } from '../_shared/cors.ts';
import { 
  initSentryEdge, 
  captureError, 
  captureCriticalError,
  monitorPerformance,
  setUserContext 
} from '../_shared/sentry.ts';

// Inicializar Sentry
initSentryEdge();

interface RequestBody {
  planId: string;
  provider?: 'mercadopago' | 'stripe';
}

interface MercadoPagoPreference {
  items: Array<{
    title: string;
    quantity: number;
    unit_price: number;
    currency_id: string;
  }>;
  payer: {
    email: string;
    name?: string;
  };
  back_urls: {
    success?: string;
    failure?: string;
    pending?: string;
  };
  auto_return?: 'approved' | 'all';
  payment_methods: {
    excluded_payment_methods?: Array<{ id: string }>;
    excluded_payment_types?: Array<{ id: string }>;
    installments?: number;
  };
  notification_url?: string;
  statement_descriptor?: string;
  external_reference?: string;
  metadata?: Record<string, any>;
}

serve(async (req) => {
  // =====================================================
  // 1. MANEJAR CORS PREFLIGHT
  // =====================================================
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  // Solo permitir POST
  if (req.method !== 'POST') {
    return genericErrorResponse('Method not allowed', 405);
  }

  try {
    // =====================================================
    // 2. MIDDLEWARE DE SEGURIDAD
    // =====================================================
    const security = await securityMiddleware(req, true);
    if (!security.authorized) {
      return genericErrorResponse(security.error || 'Unauthorized', security.status || 401);
    }

    const userId = security.userId!;
    const ipAddress = getClientIP(req);

    // Establecer contexto de usuario en Sentry
    setUserContext(userId);

    // =====================================================
    // 3. SANITIZAR Y VALIDAR REQUEST
    // =====================================================
    const rawBody = await req.json();
    const sanitizedBody = sanitizeRequest(rawBody) as RequestBody;

    // Validar planId
    const planId = sanitizeString(sanitizedBody.planId);
    if (!planId || planId.length < 3) {
      return genericErrorResponse('Invalid planId', 400);
    }

    // Validar provider
    const provider = sanitizeEnum(sanitizedBody.provider || 'mercadopago', ['mercadopago', 'stripe'] as const);
    if (!provider) {
      return genericErrorResponse('Invalid provider', 400);
    }

    // =====================================================
    // 4. OBTENER PLAN DESDE BASE DE DATOS (CON MONITOREO)
    // =====================================================
    const plan = await monitorPerformance('fetch_plan', async () => {
      const supabaseAdmin = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
        {
          auth: {
            autoRefreshToken: false,
            persistSession: false
          }
        }
      );

      const { data: planData, error: planError } = await supabaseAdmin
        .from('billing_plans')
        .select('*')
        .eq('slug', planId)
        .eq('is_active', true)
        .single();

      if (planError || !planData) {
        throw new Error(`Plan not found: ${planError?.message || 'Unknown error'}`);
      }

      return planData;
    }, { planId, userId });

    // =====================================================
    // 5. OBTENER DATOS DEL USUARIO
    // =====================================================
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    const { data: user, error: userError } = await supabaseAdmin.auth.admin.getUserById(userId);
    if (userError || !user) {
      captureError(new Error('User not found'), { userId });
      return genericErrorResponse('User not found', 404);
    }

    // =====================================================
    // 6. CREAR PREFERENCIA EN MERCADO PAGO (CON MONITOREO)
    // =====================================================
    if (provider === 'mercadopago') {
      const mpResponse = await monitorPerformance('create_mp_preference', async () => {
        const accessToken = Deno.env.get('MERCADOPAGO_ACCESS_TOKEN') || 
                           Deno.env.get('MERCADOPAGO_ACCESS_TOKEN_TEST');

        if (!accessToken) {
          throw new Error('Payment provider not configured');
        }

        const frontendUrl = Deno.env.get('FRONTEND_URL') || 'https://finantel.app';
        const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';

        // Sanitizar datos antes de enviar
        const userEmail = sanitizeString(user.user?.email || '');
        const userName = sanitizeString(user.user?.user_metadata?.full_name || userEmail.split('@')[0] || 'Usuario');

        const preference: MercadoPagoPreference = {
          items: [
            {
              title: `Plan ${sanitizeString(plan.name)} - Finantel`,
              quantity: 1,
              unit_price: parseFloat(plan.price_monthly.toString()),
              currency_id: plan.currency || 'CLP',
            },
          ],
          payer: {
            email: userEmail,
            name: userName,
          },
          back_urls: {
            success: `${frontendUrl}/dashboard/billing?status=success`,
            failure: `${frontendUrl}/dashboard/billing?status=failure`,
            pending: `${frontendUrl}/dashboard/billing?status=pending`,
          },
          auto_return: 'approved',
          payment_methods: {
            installments: 12,
          },
          notification_url: `${supabaseUrl}/functions/v1/mercadopago-webhook`,
          statement_descriptor: 'FINANTEL',
          external_reference: `user_${userId}_plan_${plan.slug}_${Date.now()}`,
          metadata: {
            user_id: userId,
            plan_id: plan.id,
            plan_slug: plan.slug,
          },
        };

        // Crear preferencia en Mercado Pago
        const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
          body: JSON.stringify(preference),
        });

        if (!response.ok) {
          const errorData = await response.text();
          throw new Error(`Mercado Pago API error: ${errorData}`);
        }

        return await response.json();
      }, { planId, userId, provider });

      // =====================================================
      // 7. GUARDAR INTENTO DE PAGO
      // =====================================================
      try {
        const { error: paymentError } = await supabaseAdmin
          .from('billing_payments')
          .insert({
            user_id: userId,
            mercado_pago_preference_id: mpResponse.id,
            amount: plan.price_monthly,
            currency: plan.currency || 'CLP',
            status: 'pending',
            metadata: {
              preference_id: mpResponse.id,
              plan_id: plan.id,
              plan_slug: plan.slug,
              ip_address: ipAddress,
            },
          });

        if (paymentError) {
          // No fallar si no se puede guardar, pero registrar
          captureError(new Error('Error saving payment record'), {
            error: paymentError.message,
            userId,
            preferenceId: mpResponse.id,
          });
        }
      } catch (error) {
        captureError(error as Error, { userId, step: 'save_payment' });
      }

      // =====================================================
      // 8. RETORNAR RESPUESTA
      // =====================================================
      return new Response(
        JSON.stringify({
          url: mpResponse.init_point || mpResponse.sandbox_init_point,
          id: mpResponse.id,
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Otro provider no implementado
    return genericErrorResponse('Provider not yet implemented', 400);

  } catch (error) {
    // Capturar error crítico en Sentry
    captureCriticalError(error as Error, {
      endpoint: 'create-checkout-session',
      method: req.method,
      url: req.url,
    });

    console.error('Error in create-checkout-session:', error);
    return genericErrorResponse('Internal server error', 500);
  }
});
