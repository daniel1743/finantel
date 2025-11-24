
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';

export const useBilling = (userId) => {
  const [subscription, setSubscription] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (!userId) return;

    const fetchBilling = async () => {
      try {
        const { data: subData, error: subError } = await supabase
          .from('billing_subscriptions')
          .select('*')
          .eq('user_id', userId)
          .maybeSingle(); // Usar maybeSingle en lugar de single para evitar errores si no existe
        
        // It's okay if no subscription exists yet
        if (!subError && subData) {
          setSubscription(subData);
        } else if (subError && subError.code !== 'PGRST116') {
          // Solo loguear errores que no sean "no encontrado"
          console.error('Error fetching subscription:', subError);
        }

        // Mock fetching history if table existed, or just use empty
        setHistory([]); 

      } catch (error) {
        // Si la tabla no existe, simplemente no establecer suscripción
        if (error.message && error.message.includes('billing_subscriptions')) {
          console.warn('Tabla billing_subscriptions no existe aún. Ejecuta la migración 020_create_billing_subscriptions.sql');
        } else {
          console.error('Error in fetchBilling:', error);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchBilling();
  }, [userId]);

  const createCheckoutSession = async (planId, provider = 'mercadopago') => {
    // This would typically call a Supabase Edge Function
    toast({
      title: "Procesando pago...",
      description: `Iniciando checkout con ${provider} para el plan ${planId}`,
    });

    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ url: provider === 'stripe' ? 'https://stripe.com/checkout-mock' : 'https://mercadopago.com/checkout-mock' });
      }, 1500);
    });
  };

  const cancelSubscription = async () => {
    if (!subscription) return;
    
    const { error } = await supabase
      .from('billing_subscriptions')
      .update({ status: 'cancelled', current_period_end: new Date().toISOString() })
      .eq('id', subscription.id);

    if (error) {
      toast({ variant: "destructive", title: "Error", description: "Could not cancel subscription." });
    } else {
      setSubscription(prev => ({ ...prev, status: 'cancelled' }));
      toast({ title: "Subscription Cancelled", description: "You will retain access until the end of the period." });
    }
  };

  return {
    subscription,
    history,
    loading,
    createCheckoutSession,
    cancelSubscription
  };
};
