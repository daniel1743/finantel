// =====================================================
// EDGE FUNCTION: mercadopago-webhook
// =====================================================
// Recibe y procesa notificaciones de Mercado Pago
// Actualiza pagos y suscripciones en la base de datos
// =====================================================

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface MercadoPagoNotification {
  id: string;
  live_mode: boolean;
  type: string;
  date_created: string;
  application_id: string;
  user_id: string;
  version: number;
  api_version: string;
  action: string;
  data: {
    id: string;
  };
}

interface MercadoPagoPayment {
  id: string;
  status: string;
  status_detail: string;
  transaction_amount: number;
  currency_id: string;
  payment_method_id: string;
  payment_type_id: string;
  installments: number;
  date_created: string;
  date_approved?: string;
  date_last_updated: string;
  payer: {
    id: string;
    email: string;
    identification?: {
      type: string;
      number: string;
    };
  };
  external_reference?: string;
  metadata?: Record<string, any>;
  subscription_id?: string;
  preapproval_id?: string;
}

// Función para validar firma del webhook (opcional, Mercado Pago no siempre envía firma)
function validateWebhookSignature(signature: string | null, payload: string): boolean {
  // Mercado Pago no siempre envía X-Signature, pero si lo envía, deberías validarlo
  // Por ahora, retornamos true. En producción, implementa validación real.
  const webhookSecret = Deno.env.get('MERCADOPAGO_WEBHOOK_SECRET');
  if (!webhookSecret || !signature) {
    return true; // Si no hay secret configurado, aceptar (no recomendado en producción)
  }
  // Implementar validación de firma aquí si es necesario
  return true;
}

// Función para obtener información del pago desde Mercado Pago
async function getPaymentFromMercadoPago(paymentId: string): Promise<MercadoPagoPayment | null> {
  const accessToken = Deno.env.get('MERCADOPAGO_ACCESS_TOKEN') || 
                     Deno.env.get('MERCADOPAGO_ACCESS_TOKEN_TEST');

  if (!accessToken) {
    throw new Error('Mercado Pago access token not configured');
  }

  const response = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`Error fetching payment ${paymentId}:`, errorText);
    return null;
  }

  return await response.json();
}

// Función para mapear estado de Mercado Pago a estado interno
function mapPaymentStatus(mpStatus: string): 'pending' | 'approved' | 'rejected' | 'refunded' | 'cancelled' {
  const statusMap: Record<string, 'pending' | 'approved' | 'rejected' | 'refunded' | 'cancelled'> = {
    'pending': 'pending',
    'approved': 'approved',
    'authorized': 'approved',
    'in_process': 'pending',
    'in_mediation': 'pending',
    'rejected': 'rejected',
    'cancelled': 'cancelled',
    'refunded': 'refunded',
    'charged_back': 'refunded',
  };

  return statusMap[mpStatus.toLowerCase()] || 'pending';
}

// Función para procesar notificación de pago
async function processPaymentNotification(
  supabase: any,
  payment: MercadoPagoPayment
): Promise<void> {
  // Buscar pago existente por mercado_pago_payment_id
  const { data: existingPayment, error: findError } = await supabase
    .from('billing_payments')
    .select('*')
    .eq('mercado_pago_payment_id', payment.id)
    .maybeSingle();

  const paymentData = {
    mercado_pago_payment_id: payment.id,
    amount: payment.transaction_amount,
    currency: payment.currency_id,
    status: mapPaymentStatus(payment.status),
    payment_method: payment.payment_method_id,
    payment_type: payment.payment_type_id,
    installments: payment.installments,
    paid_at: payment.date_approved ? new Date(payment.date_approved).toISOString() : null,
    metadata: {
      ...payment.metadata,
      status_detail: payment.status_detail,
      payer_id: payment.payer.id,
      payer_email: payment.payer.email,
    },
    updated_at: new Date().toISOString(),
  };

  if (existingPayment) {
    // Actualizar pago existente (idempotencia)
    const { error: updateError } = await supabase
      .from('billing_payments')
      .update(paymentData)
      .eq('id', existingPayment.id);

    if (updateError) {
      console.error('Error updating payment:', updateError);
      throw updateError;
    }

    // Si el pago fue aprobado y hay external_reference, actualizar suscripción
    if (payment.status === 'approved' && payment.external_reference) {
      await updateSubscriptionFromPayment(supabase, payment, existingPayment);
    }
  } else {
    // Extraer user_id del external_reference o metadata
    let userId: string | null = null;
    
    if (payment.external_reference) {
      const match = payment.external_reference.match(/user_([^_]+)/);
      if (match) {
        userId = match[1];
      }
    }

    if (!userId && payment.metadata?.user_id) {
      userId = payment.metadata.user_id;
    }

    if (!userId) {
      console.error('Could not extract user_id from payment:', payment.id);
      return;
    }

    // Crear nuevo registro de pago
    const { error: insertError } = await supabase
      .from('billing_payments')
      .insert({
        user_id: userId,
        ...paymentData,
      });

    if (insertError) {
      console.error('Error inserting payment:', insertError);
      throw insertError;
    }

    // Si el pago fue aprobado, actualizar suscripción
    if (payment.status === 'approved') {
      const { data: newPayment } = await supabase
        .from('billing_payments')
        .select('*')
        .eq('mercado_pago_payment_id', payment.id)
        .single();

      if (newPayment) {
        await updateSubscriptionFromPayment(supabase, payment, newPayment);
      }
    }
  }
}

// Función para actualizar suscripción basada en un pago aprobado
async function updateSubscriptionFromPayment(
  supabase: any,
  payment: MercadoPagoPayment,
  paymentRecord: any
): Promise<void> {
  if (!payment.external_reference) {
    return;
  }

  // Extraer información del external_reference
  const match = payment.external_reference.match(/user_([^_]+)_plan_([^_]+)/);
  if (!match) {
    return;
  }

  const userId = match[1];
  const planSlug = match[2];

  // Obtener plan
  const { data: plan } = await supabase
    .from('billing_plans')
    .select('*')
    .eq('slug', planSlug)
    .single();

  if (!plan) {
    console.error('Plan not found:', planSlug);
    return;
  }

  // Calcular fechas de período
  const now = new Date();
  const periodStart = now;
  const periodEnd = new Date(now);
  periodEnd.setMonth(periodEnd.getMonth() + 1); // Suscripción mensual

  // Buscar suscripción existente o crear nueva
  const { data: existingSubscription } = await supabase
    .from('billing_subscriptions')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  const subscriptionData = {
    user_id: userId,
    plan: planSlug,
    status: 'active',
    provider: 'mercadopago',
    current_period_start: periodStart.toISOString(),
    current_period_end: periodEnd.toISOString(),
    next_payment_date: periodEnd.toISOString(),
    last_payment_id: paymentRecord.id,
    updated_at: new Date().toISOString(),
  };

  if (existingSubscription) {
    // Actualizar suscripción existente
    const { error: updateError } = await supabase
      .from('billing_subscriptions')
      .update(subscriptionData)
      .eq('id', existingSubscription.id);

    if (updateError) {
      console.error('Error updating subscription:', updateError);
    }
  } else {
    // Crear nueva suscripción
    const { error: insertError } = await supabase
      .from('billing_subscriptions')
      .insert(subscriptionData);

    if (insertError) {
      console.error('Error creating subscription:', insertError);
    }
  }
}

serve(async (req) => {
  // Manejar CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // 1. Validar que es una petición POST
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 2. Validar firma del webhook (opcional)
    const signature = req.headers.get('X-Signature');
    const payload = await req.text();
    
    if (!validateWebhookSignature(signature, payload)) {
      return new Response(
        JSON.stringify({ error: 'Invalid signature' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 3. Parsear notificación
    const notification: MercadoPagoNotification = JSON.parse(payload);

    // 4. Crear cliente Supabase con service_role para bypass RLS
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // 5. Procesar según el tipo de notificación
    if (notification.type === 'payment') {
      // Obtener información completa del pago desde Mercado Pago
      const paymentId = notification.data.id;
      const payment = await getPaymentFromMercadoPago(paymentId);

      if (!payment) {
        return new Response(
          JSON.stringify({ error: 'Payment not found in Mercado Pago' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Procesar notificación de pago
      await processPaymentNotification(supabase, payment);

      // Si es un pago de créditos DeepFinance, procesarlo
      if (payment.metadata?.type === 'deepfinance_credits' && payment.status === 'approved') {
        await processDeepFinanceCredits(supabase, payment);
      }

      return new Response(
        JSON.stringify({ success: true, message: 'Payment processed' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Otros tipos de notificaciones (subscription, etc.)
    if (notification.type === 'subscription') {
      // Implementar lógica de suscripciones si es necesario
      console.log('Subscription notification received:', notification);
      return new Response(
        JSON.stringify({ success: true, message: 'Subscription notification received' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Tipo de notificación no manejado
    return new Response(
      JSON.stringify({ success: true, message: 'Notification received but not processed' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in mercadopago-webhook:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

