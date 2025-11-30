// =====================================================
// HOOK: useMercadoPagoCallback
// =====================================================
// Maneja el callback de Mercado Pago después del pago
// =====================================================

import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { MercadoPagoService } from '@/lib/mercadoPago';
import { CreditManager } from '@/lib/deepfinance/creditManager';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/SupabaseAuthContext';

export const useMercadoPagoCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    const paymentId = searchParams.get('payment_id');
    const status = searchParams.get('status');
    const preferenceId = searchParams.get('preference_id');

    // Verificar si hay un pago pendiente en localStorage
    const pendingPurchase = localStorage.getItem('deepfinance_pending_purchase');
    
    if (pendingPurchase && user?.id) {
      try {
        const purchaseData = JSON.parse(pendingPurchase);
        const isRecent = Date.now() - purchaseData.timestamp < 3600000; // 1 hora

        if (isRecent && (paymentId || status)) {
          processPaymentCallback(paymentId, status, preferenceId, purchaseData);
        }
      } catch (error) {
        console.error('[useMercadoPagoCallback] Error processing pending purchase:', error);
      }
    }
  }, [searchParams, user]);

  const processPaymentCallback = async (paymentId, status, preferenceId, purchaseData) => {
    if (processing) return;

    setProcessing(true);

    try {
      // Verificar estado del pago
      const paymentStatus = await MercadoPagoService.checkPaymentStatus(paymentId);

      if (paymentStatus.status === 'completed') {
        // Acreditar créditos
        const creditManager = new CreditManager(user.id);
        const result = await creditManager.creditPurchase(
          purchaseData.credits,
          paymentId
        );

        if (result.success) {
          // Limpiar localStorage
          localStorage.removeItem('deepfinance_pending_purchase');

          // Mostrar éxito
          toast({
            title: '¡Pago exitoso!',
            description: `${purchaseData.credits} créditos han sido acreditados a tu cuenta`,
          });

          // Limpiar parámetros de URL
          navigate('/dashboard/deepfinance', { replace: true });

          // Recargar créditos (trigger reload)
          window.dispatchEvent(new CustomEvent('deepfinance-credits-updated'));
        } else {
          throw new Error(result.error || 'Error al acreditar créditos');
        }
      } else if (paymentStatus.status === 'failed' || status === 'failure') {
        toast({
          variant: 'destructive',
          title: 'Pago fallido',
          description: 'El pago no pudo ser procesado. Por favor, intenta nuevamente.',
        });

        localStorage.removeItem('deepfinance_pending_purchase');
        navigate('/dashboard/deepfinance', { replace: true });
      } else if (paymentStatus.status === 'pending' || status === 'pending') {
        toast({
          title: 'Pago pendiente',
          description: 'Tu pago está siendo procesado. Los créditos se acreditarán cuando se confirme.',
        });

        navigate('/dashboard/deepfinance', { replace: true });
      }

    } catch (error) {
      console.error('[useMercadoPagoCallback] Error:', error);
      toast({
        variant: 'destructive',
        title: 'Error al procesar pago',
        description: error.message || 'Ocurrió un error. Por favor, contacta a soporte.',
      });
    } finally {
      setProcessing(false);
    }
  };

  return { processing };
};

