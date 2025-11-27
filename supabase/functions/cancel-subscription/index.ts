// =====================================================
// EDGE FUNCTION: cancel-subscription
// =====================================================
// Cancela una suscripción activa en Mercado Pago
// y actualiza el estado en la base de datos
// =====================================================

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RequestBody {
  subscriptionId?: string;
  cancelAtPeriodEnd?: boolean;
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
    const { subscriptionId, cancelAtPeriodEnd = true } = body;

    // 3. Crear cliente admin para operaciones en DB
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // 4. Buscar suscripción del usuario
    let subscription;
    
    if (subscriptionId) {
      // Buscar por ID específico
      const { data, error } = await supabaseAdmin
        .from('billing_subscriptions')
        .select('*')
        .eq('id', subscriptionId)
        .eq('user_id', user.id)
        .single();

      if (error || !data) {
        return new Response(
          JSON.stringify({ error: 'Subscription not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      subscription = data;
    } else {
      // Buscar suscripción activa del usuario
      const { data, error } = await supabaseAdmin
        .from('billing_subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error || !data) {
        return new Response(
          JSON.stringify({ error: 'No active subscription found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      subscription = data;
    }

    // 5. Verificar que la suscripción pertenece al usuario
    if (subscription.user_id !== user.id) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 6. Si hay suscripción en Mercado Pago, cancelarla allí
    if (subscription.mercado_pago_subscription_id || subscription.mercado_pago_preapproval_id) {
      const accessToken = Deno.env.get('MERCADOPAGO_ACCESS_TOKEN') || 
                         Deno.env.get('MERCADOPAGO_ACCESS_TOKEN_TEST');

      if (accessToken) {
        try {
          // Intentar cancelar preapproval (suscripción recurrente)
          if (subscription.mercado_pago_preapproval_id) {
            const mpResponse = await fetch(
              `https://api.mercadopago.com/preapproval/${subscription.mercado_pago_preapproval_id}`,
              {
                method: 'PUT',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${accessToken}`,
                },
                body: JSON.stringify({
                  status: 'cancelled',
                }),
              }
            );

            if (!mpResponse.ok) {
              const errorText = await mpResponse.text();
              console.error('Error cancelling Mercado Pago preapproval:', errorText);
              // Continuar con la cancelación en DB aunque falle en MP
            }
          }

          // Si hay subscription_id, intentar cancelar suscripción
          if (subscription.mercado_pago_subscription_id) {
            const mpResponse = await fetch(
              `https://api.mercadopago.com/subscriptions/${subscription.mercado_pago_subscription_id}`,
              {
                method: 'PUT',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${accessToken}`,
                },
                body: JSON.stringify({
                  status: 'cancelled',
                }),
              }
            );

            if (!mpResponse.ok) {
              const errorText = await mpResponse.text();
              console.error('Error cancelling Mercado Pago subscription:', errorText);
              // Continuar con la cancelación en DB aunque falle en MP
            }
          }
        } catch (mpError) {
          console.error('Error communicating with Mercado Pago:', mpError);
          // Continuar con la cancelación en DB
        }
      }
    }

    // 7. Actualizar estado en base de datos
    const updateData: any = {
      status: cancelAtPeriodEnd ? 'active' : 'cancelled',
      cancel_at_period_end: cancelAtPeriodEnd,
      updated_at: new Date().toISOString(),
    };

    // Si se cancela inmediatamente, actualizar current_period_end
    if (!cancelAtPeriodEnd) {
      updateData.current_period_end = new Date().toISOString();
    }

    const { error: updateError } = await supabaseAdmin
      .from('billing_subscriptions')
      .update(updateData)
      .eq('id', subscription.id);

    if (updateError) {
      console.error('Error updating subscription:', updateError);
      return new Response(
        JSON.stringify({ error: 'Failed to update subscription' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 8. Retornar éxito
    return new Response(
      JSON.stringify({
        success: true,
        message: cancelAtPeriodEnd
          ? 'Subscription will be cancelled at the end of the current period'
          : 'Subscription cancelled immediately',
        subscription: {
          id: subscription.id,
          status: cancelAtPeriodEnd ? 'active' : 'cancelled',
          cancel_at_period_end: cancelAtPeriodEnd,
        },
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in cancel-subscription:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

