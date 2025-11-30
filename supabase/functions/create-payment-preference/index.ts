// =====================================================
// EDGE FUNCTION: create-payment-preference
// =====================================================
// Crea una preferencia de pago en Mercado Pago para compra de créditos
// =====================================================

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

const MERCADOPAGO_ACCESS_TOKEN = Deno.env.get('MERCADOPAGO_ACCESS_TOKEN') || '';

interface RequestBody {
  userId: string;
  creditsAmount: number;
  amount: number;
  currency?: string;
  description?: string;
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
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
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Obtener usuario del token
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Token inválido' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parsear body
    const body: RequestBody = await req.json();
    const { userId, creditsAmount, amount, currency = 'USD', description } = body;

    // Validar que el userId coincida con el usuario autenticado
    if (userId !== user.id) {
      return new Response(
        JSON.stringify({ error: 'Usuario no autorizado' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validar datos
    if (!creditsAmount || creditsAmount <= 0 || !amount || amount <= 0) {
      return new Response(
        JSON.stringify({ error: 'Datos inválidos' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Obtener email del usuario para el pago
    const { data: userProfile } = await supabase
      .from('profile_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();

    // Crear preferencia en Mercado Pago
    const mpResponse = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${MERCADOPAGO_ACCESS_TOKEN}`,
      },
      body: JSON.stringify({
        items: [
          {
            title: description || `Paquete DeepFinance: ${creditsAmount} análisis`,
            quantity: 1,
            unit_price: amount,
            currency_id: currency,
          },
        ],
        payer: {
          email: user.email || userProfile?.email || '',
        },
        back_urls: {
          success: `${Deno.env.get('APP_URL') || 'https://finantel.app'}/dashboard/deepfinance?payment=success`,
          failure: `${Deno.env.get('APP_URL') || 'https://finantel.app'}/dashboard/deepfinance?payment=failure`,
          pending: `${Deno.env.get('APP_URL') || 'https://finantel.app'}/dashboard/deepfinance?payment=pending`,
        },
        notification_url: `${supabaseUrl}/functions/v1/mercadopago-webhook`,
        external_reference: `${userId}-${Date.now()}-${creditsAmount}`,
        metadata: {
          userId,
          creditsAmount,
          type: 'deepfinance_credits',
        },
        statement_descriptor: 'FINANTEL DEEPFINANCE',
      }),
    });

    if (!mpResponse.ok) {
      const errorData = await mpResponse.text();
      console.error('[create-payment-preference] Mercado Pago error:', errorData);
      return new Response(
        JSON.stringify({ error: 'Error al crear preferencia de pago', details: errorData }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const mpData = await mpResponse.json();

    // Guardar registro de compra pendiente
    await supabase
      .from('deepfinance_credit_purchases')
      .insert({
        user_id: userId,
        credits_purchased: creditsAmount,
        amount_paid: amount,
        currency,
        payment_id: mpData.id,
        status: 'pending',
      });

    return new Response(
      JSON.stringify({
        preference_id: mpData.id,
        init_point: mpData.init_point,
        sandbox_init_point: mpData.sandbox_init_point,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[create-payment-preference] Error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Error interno del servidor' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

