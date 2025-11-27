
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';

export const useBilling = (userId) => {
  const [subscription, setSubscription] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const { toast } = useToast();

  // Función para obtener suscripción actual
  const getCurrentSubscription = async () => {
    if (!userId) return null;

    try {
      const { data, error } = await supabase
        .from('billing_subscriptions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching subscription:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in getCurrentSubscription:', error);
      return null;
    }
  };

  // Función para obtener historial de pagos
  const getBillingHistory = async () => {
    if (!userId) return [];

    try {
      const { data, error } = await supabase
        .from('billing_payments')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) {
        console.error('Error fetching payment history:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getBillingHistory:', error);
      return [];
    }
  };

  // Cargar datos iniciales
  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const fetchBilling = async () => {
      try {
        setLoading(true);
        
        // Cargar suscripción
        const subData = await getCurrentSubscription();
        if (subData) {
          setSubscription(subData);
        }

        // Cargar historial de pagos
        const paymentHistory = await getBillingHistory();
        setHistory(paymentHistory);

      } catch (error) {
        console.error('Error in fetchBilling:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "No se pudieron cargar los datos de facturación",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchBilling();
  }, [userId]);

  // Crear sesión de checkout
  const createCheckoutSession = async (planId, provider = 'mercadopago') => {
    if (processing) {
      toast({
        variant: "destructive",
        title: "Espera",
        description: "Ya hay un proceso de pago en curso",
      });
      return null;
    }

    setProcessing(true);
    
    try {
      toast({
        title: "Procesando pago...",
        description: `Iniciando checkout con ${provider} para el plan ${planId}`,
      });

      // Llamar a la Edge Function
      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: { planId, provider },
      });

      if (error) {
        throw error;
      }

      if (!data || !data.init_point) {
        throw new Error('No se recibió URL de checkout');
      }

      toast({
        title: "Redirigiendo...",
        description: "Serás redirigido a Mercado Pago para completar el pago",
      });

      // Retornar URL para redirección
      return {
        url: data.init_point,
        preference_id: data.preference_id,
      };

    } catch (error) {
      console.error('Error creating checkout session:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "No se pudo crear la sesión de pago. Intenta de nuevo.",
      });
      return null;
    } finally {
      setProcessing(false);
    }
  };

  // Cancelar suscripción
  const cancelSubscription = async (cancelAtPeriodEnd = true) => {
    if (!subscription) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No hay suscripción activa para cancelar",
      });
      return;
    }

    if (processing) {
      return;
    }

    setProcessing(true);

    try {
      // Llamar a la Edge Function
      const { data, error } = await supabase.functions.invoke('cancel-subscription', {
        body: {
          subscriptionId: subscription.id,
          cancelAtPeriodEnd,
        },
      });

      if (error) {
        throw error;
      }

      // Actualizar estado local
      if (data && data.subscription) {
        setSubscription(prev => ({
          ...prev,
          status: data.subscription.status,
          cancel_at_period_end: data.subscription.cancel_at_period_end,
        }));
      }

      toast({
        title: cancelAtPeriodEnd ? "Suscripción programada para cancelar" : "Suscripción cancelada",
        description: cancelAtPeriodEnd
          ? "Tu suscripción se cancelará al final del período actual"
          : "Tu suscripción ha sido cancelada inmediatamente",
      });

      // Recargar datos
      const subData = await getCurrentSubscription();
      if (subData) {
        setSubscription(subData);
      }

    } catch (error) {
      console.error('Error cancelling subscription:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "No se pudo cancelar la suscripción. Intenta de nuevo.",
      });
    } finally {
      setProcessing(false);
    }
  };

  // Función para recargar datos
  const refresh = async () => {
    if (!userId) return;

    try {
      const subData = await getCurrentSubscription();
      if (subData) {
        setSubscription(subData);
      }

      const paymentHistory = await getBillingHistory();
      setHistory(paymentHistory);
    } catch (error) {
      console.error('Error refreshing billing data:', error);
    }
  };

  return {
    subscription,
    history,
    loading,
    processing,
    createCheckoutSession,
    cancelSubscription,
    refresh,
    getCurrentSubscription,
    getBillingHistory,
  };
};
