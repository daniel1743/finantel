// =====================================================
// SERVICIO: Mercado Pago Integration
// =====================================================
// Maneja la integración con Mercado Pago para compra de créditos
// =====================================================

import { supabase } from '@/lib/customSupabaseClient';

const MERCADOPAGO_PUBLIC_KEY = import.meta.env.VITE_MERCADOPAGO_PUBLIC_KEY || '';
const MERCADOPAGO_ACCESS_TOKEN = import.meta.env.VITE_MERCADOPAGO_ACCESS_TOKEN || '';

export class MercadoPagoService {
  /**
   * Crea una preferencia de pago para comprar créditos
   * @param {string} userId
   * @param {number} creditsAmount
   * @returns {Promise<{preferenceId: string, initPoint: string, error: string|null}>}
   */
  static async createPaymentPreference(userId, creditsAmount = 10) {
    if (!userId) {
      return {
        preferenceId: null,
        initPoint: null,
        error: 'Usuario no identificado',
      };
    }

    // Calcular monto (10 créditos = $5 USD)
    const amountPerCredit = 5 / 10; // $0.50 por crédito
    const totalAmount = creditsAmount * amountPerCredit;

    try {
      // Obtener token de autenticación
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('No autenticado');
      }

      // Llamar a Edge Function de Supabase para crear preferencia
      const { data, error } = await supabase.functions.invoke('create-payment-preference', {
        body: {
          userId,
          creditsAmount,
          amount: totalAmount,
          currency: 'USD',
          description: `Paquete DeepFinance: ${creditsAmount} análisis`,
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;

      return {
        preferenceId: data.preference_id,
        initPoint: data.init_point,
        error: null,
      };

    } catch (error) {
      console.error('[MercadoPagoService] Error creating preference:', error);
      
      // Fallback: usar SDK de Mercado Pago en el cliente si está disponible
      // (Requiere tener el SDK instalado)
      try {
        if (typeof window !== 'undefined' && window.MercadoPago) {
          const mp = new window.MercadoPago(MERCADOPAGO_PUBLIC_KEY);
          
          // Crear preferencia localmente (menos seguro, pero funciona)
          const preference = await mp.preferences.create({
            items: [
              {
                title: `Paquete DeepFinance: ${creditsAmount} análisis`,
                quantity: 1,
                unit_price: totalAmount,
                currency_id: 'USD',
              },
            ],
            back_urls: {
              success: `${window.location.origin}/dashboard/deepfinance?payment=success`,
              failure: `${window.location.origin}/dashboard/deepfinance?payment=failure`,
              pending: `${window.location.origin}/dashboard/deepfinance?payment=pending`,
            },
            notification_url: `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/mercadopago-webhook`,
            external_reference: `${userId}-${Date.now()}`,
            metadata: {
              userId,
              creditsAmount,
              type: 'deepfinance_credits',
            },
          });

          return {
            preferenceId: preference.id,
            initPoint: preference.init_point,
            error: null,
          };
        }
      } catch (fallbackError) {
        console.error('[MercadoPagoService] Fallback error:', fallbackError);
      }

      return {
        preferenceId: null,
        initPoint: null,
        error: error.message || 'Error al crear preferencia de pago',
      };
    }
  }

  /**
   * Procesa el callback de pago y acredita créditos
   * @param {string} paymentId
   * @param {string} status
   * @returns {Promise<{success: boolean, credits: number, error: string|null}>}
   */
  static async processPaymentCallback(paymentId, status) {
    try {
      // Llamar a Edge Function para procesar el webhook
      const { data, error } = await supabase.functions.invoke('mercadopago-webhook', {
        body: {
          payment_id: paymentId,
          status,
        },
      });

      if (error) throw error;

      return {
        success: data.success || false,
        credits: data.credits || 0,
        error: data.error || null,
      };

    } catch (error) {
      console.error('[MercadoPagoService] Error processing callback:', error);
      return {
        success: false,
        credits: 0,
        error: error.message || 'Error al procesar el pago',
      };
    }
  }

  /**
   * Verifica el estado de un pago
   * @param {string} paymentId
   * @returns {Promise<{status: string, credits: number, error: string|null}>}
   */
  static async checkPaymentStatus(paymentId) {
    try {
      const { data, error } = await supabase
        .from('deepfinance_credit_purchases')
        .select('status, credits_purchased')
        .eq('payment_id', paymentId)
        .single();

      if (error) throw error;

      return {
        status: data.status || 'pending',
        credits: data.credits_purchased || 0,
        error: null,
      };

    } catch (error) {
      console.error('[MercadoPagoService] Error checking payment:', error);
      return {
        status: 'unknown',
        credits: 0,
        error: error.message || 'Error al verificar el pago',
      };
    }
  }
}

