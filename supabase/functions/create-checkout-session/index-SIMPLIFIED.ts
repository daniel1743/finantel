// =====================================================
// EDGE FUNCTION: create-checkout-session (SIMPLIFICADA)
// =====================================================
// Versión sin dependencias de _shared para despliegue
// =====================================================

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// CORS Headers
const corsHeaders = {
  'Access-Control-Allow-Origin': Deno.env.get('FRONTEND_URL') || '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

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
    installments?: number;
  };
  notification_url?: string;
  statement_descriptor?: string;
  external_reference?: string;
  metadata?: Record<string, any>;
}

serve(async (req) => {
  // Manejar CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  // Solo permitir POST
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    // Verificar autenticación
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No autorizado' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Crear cliente Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseAdmin = createClient(
      supabaseUrl,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Obtener usuario del token
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Token inválido' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parsear body
    const body: RequestBody = await req.json();
    const { planId, provider = 'mercadopago' } = body;

    // Validar planId
    if (!planId || planId.length < 3) {
      return new Response(
        JSON.stringify({ error: 'planId inválido' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Obtener plan desde base de datos
    const { data: planData, error: planError } = await supabaseAdmin
      .from('billing_plans')
      .select('*')
      .eq('slug', planId)
      .eq('is_active', true)
      .single();

    if (planError || !planData) {
      return new Response(
        JSON.stringify({ error: 'Plan no encontrado' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Crear preferencia en Mercado Pago
    if (provider === 'mercadopago') {
      const accessToken = Deno.env.get('MERCADOPAGO_ACCESS_TOKEN') || 
                         Deno.env.get('MERCADOPAGO_ACCESS_TOKEN_TEST');

      if (!accessToken) {
        return new Response(
          JSON.stringify({ error: 'Payment provider not configured' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const frontendUrl = Deno.env.get('FRONTEND_URL') || 'https://finantel.app';

      const preference: MercadoPagoPreference = {
        items: [
          {
            title: `Plan ${planData.name} - Finantel`,
            quantity: 1,
            unit_price: parseFloat(planData.price_monthly.toString()),
            currency_id: planData.currency || 'CLP',
          },
        ],
        payer: {
          email: user.email || '',
          name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Usuario',
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
        external_reference: `user_${user.id}_plan_${planData.slug}_${Date.now()}`,
        metadata: {
          user_id: user.id,
          plan_id: planData.id,
          plan_slug: planData.slug,
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
        console.error('Mercado Pago API error:', errorData);
        return new Response(
          JSON.stringify({ error: 'Error al crear preferencia de pago', details: errorData }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const mpResponse = await response.json();

      // Guardar intento de pago
      await supabaseAdmin
        .from('billing_payments')
        .insert({
          user_id: user.id,
          mercado_pago_preference_id: mpResponse.id,
          amount: planData.price_monthly,
          currency: planData.currency || 'CLP',
          status: 'pending',
          metadata: {
            preference_id: mpResponse.id,
            plan_id: planData.id,
            plan_slug: planData.slug,
          },
        })
        .then(({ error }) => {
          if (error) {
            console.error('Error saving payment record:', error);
          }
        });

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
    return new Response(
      JSON.stringify({ error: 'Provider not yet implemented' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in create-checkout-session:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

