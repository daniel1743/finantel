// =====================================================
// EDGE FUNCTION: create-checkout-session
// =====================================================
// Crea una sesión de checkout en Mercado Pago
// y retorna la URL de redirección (init_point)
// =====================================================

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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
  // Manejar CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // 1. Autenticar usuario
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Crear cliente Supabase para verificar usuario
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser();

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid user token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 2. Parsear body
    const body: RequestBody = await req.json();
    const { planId, provider = 'mercadopago' } = body;

    if (!planId) {
      return new Response(
        JSON.stringify({ error: 'planId is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 3. Obtener plan desde la base de datos
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data: plan, error: planError } = await supabaseAdmin
      .from('billing_plans')
      .select('*')
      .eq('slug', planId)
      .eq('is_active', true)
      .single();

    if (planError || !plan) {
      return new Response(
        JSON.stringify({ error: 'Plan not found or inactive' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 4. Si el provider es Mercado Pago, crear preferencia
    if (provider === 'mercadopago') {
      const accessToken = Deno.env.get('MERCADOPAGO_ACCESS_TOKEN') || 
                         Deno.env.get('MERCADOPAGO_ACCESS_TOKEN_TEST');

      if (!accessToken) {
        return new Response(
          JSON.stringify({ error: 'Mercado Pago access token not configured' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Obtener URL base del frontend (puedes configurarlo como variable de entorno)
      const frontendUrl = Deno.env.get('FRONTEND_URL') || 'http://localhost:3000';

      // Construir preferencia de Mercado Pago
      const preference: MercadoPagoPreference = {
        items: [
          {
            title: `Plan ${plan.name} - Finantel`,
            quantity: 1,
            unit_price: parseFloat(plan.price_monthly.toString()),
            currency_id: plan.currency || 'CLP',
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
          installments: 12, // Máximo 12 cuotas
        },
        notification_url: `${Deno.env.get('SUPABASE_URL')}/functions/v1/mercadopago-webhook`,
        statement_descriptor: 'FINANTEL',
        external_reference: `user_${user.id}_plan_${plan.slug}_${Date.now()}`,
        metadata: {
          user_id: user.id,
          plan_id: plan.id,
          plan_slug: plan.slug,
        },
      };

      // 5. Crear preferencia en Mercado Pago
      const mpResponse = await fetch('https://api.mercadopago.com/checkout/preferences', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify(preference),
      });

      if (!mpResponse.ok) {
        const errorData = await mpResponse.text();
        console.error('Mercado Pago API Error:', errorData);
        return new Response(
          JSON.stringify({ error: 'Failed to create Mercado Pago preference', details: errorData }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const mpData = await mpResponse.json();

      // 6. Guardar intento de pago en la base de datos
      const { error: paymentError } = await supabaseAdmin
        .from('billing_payments')
        .insert({
          user_id: user.id,
          mercado_pago_preference_id: mpData.id,
          amount: plan.price_monthly,
          currency: plan.currency || 'CLP',
          status: 'pending',
          metadata: {
            preference_id: mpData.id,
            plan_id: plan.id,
            plan_slug: plan.slug,
          },
        });

      if (paymentError) {
        console.error('Error saving payment record:', paymentError);
        // No fallar si no se puede guardar, pero loguear el error
      }

      // 7. Retornar URL de checkout
      return new Response(
        JSON.stringify({
          init_point: mpData.init_point,
          preference_id: mpData.id,
          sandbox_init_point: mpData.sandbox_init_point, // Para testing
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Si es otro provider (ej: Stripe), retornar error por ahora
    return new Response(
      JSON.stringify({ error: `Provider ${provider} not yet implemented` }),
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

