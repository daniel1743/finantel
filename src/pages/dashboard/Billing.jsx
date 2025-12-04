
import React, { useEffect } from 'react';
import Icon from '@/components/ui/Icon';
import { useBilling } from '@/hooks/useBilling';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Button } from '@/components/ui/button';
import { CreditCard, Download, ShieldCheck, AlertTriangle, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';

const Billing = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const { subscription, history, loading, processing, createCheckoutSession, cancelSubscription, refresh } = useBilling(user?.id);

  // Manejar redirección desde Mercado Pago
  useEffect(() => {
    const status = searchParams.get('status');
    if (status) {
      // Recargar datos después de redirección
      setTimeout(() => {
        refresh();
      }, 2000);
    }
  }, [searchParams, refresh]);

  const handleUpgrade = async (planSlug, provider = 'mercadopago') => {
    const session = await createCheckoutSession(planSlug, provider);
    if (session && session.url) {
      // Redirigir a Mercado Pago
      window.location.href = session.url;
    }
  };

  const handleCancel = async () => {
    if (window.confirm('¿Estás seguro de que quieres cancelar tu suscripción? Podrás seguir usando el servicio hasta el final del período actual.')) {
      await cancelSubscription(true); // Cancelar al final del período
    }
  };

  // Mostrar mensaje según status de redirección
  const paymentStatus = searchParams.get('status');
  const statusMessages = {
    success: { icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50', message: '¡Pago exitoso! Tu suscripción ha sido activada.' },
    failure: { icon: XCircle, color: 'text-red-600', bg: 'bg-red-50', message: 'El pago no pudo ser procesado. Intenta de nuevo.' },
    pending: { icon: AlertTriangle, color: 'text-yellow-600', bg: 'bg-yellow-50', message: 'Tu pago está siendo procesado. Te notificaremos cuando se complete.' },
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto p-6 flex items-center justify-center min-h-[400px]">
        <Icon component={Loader2} size="xl" color="primary" className="animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-[#1a1a1a] dark:text-white">Facturación y Planes</h1>
          <p className="text-[#6E6E73] mt-1">Gestiona tu suscripción y métodos de pago</p>
        </div>
      </div>

      {/* Mensaje de estado de pago */}
      {paymentStatus && statusMessages[paymentStatus] && (
        <div className={`${statusMessages[paymentStatus].bg} dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl p-4 flex items-center gap-3`}>
          {React.createElement(statusMessages[paymentStatus].icon, { className: `w-5 h-5 ${statusMessages[paymentStatus].color}` })}
          <p className={`${statusMessages[paymentStatus].color} font-medium`}>
            {statusMessages[paymentStatus].message}
          </p>
        </div>
      )}

      {/* Current Plan Card */}
      <div className="bg-white dark:bg-[#1a1a1a] rounded-[22px] p-8 border border-gray-100 dark:border-white/5 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#1C8FA0]/5 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl" />
        
        <div className="relative z-10 grid md:grid-cols-3 gap-8">
          <div className="col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <span className="px-3 py-1 rounded-full bg-[#1C8FA0]/10 text-[#1C8FA0] text-xs font-bold uppercase tracking-wider">
                {subscription?.plan || 'Free Plan'}
              </span>
              {subscription?.status === 'active' && (
                <span className="flex items-center gap-1 text-green-600 text-xs font-medium">
                  <Icon component={ShieldCheck} size="xs" color="default" /> Activo
                </span>
              )}
            </div>
            <h2 className="text-2xl font-bold text-[#1a1a1a] dark:text-white mb-2">
              {subscription ? `Plan ${subscription.plan.charAt(0).toUpperCase() + subscription.plan.slice(1)}` : 'Plan Gratuito'}
            </h2>
            <p className="text-[#6E6E73] dark:text-gray-400 mb-6 max-w-md">
              {subscription 
                ? `Tu próxima factura será el ${new Date(subscription.current_period_end).toLocaleDateString()}.`
                : "Actualiza a Premium para desbloquear IA ilimitada, exportación PDF y grupos familiares."}
            </p>
            
            {!subscription || subscription.plan === 'free' ? (
              <div className="flex flex-wrap gap-4">
                <Button 
                  onClick={() => handleUpgrade('starter', 'mercadopago')} 
                  disabled={processing}
                  className="bg-[#009EE3] hover:bg-[#0081b8] text-white border-none"
                >
                  {processing ? (
                    <>
                      <Icon component={Loader2} size="sm" color="default" className="mr-2 animate-spin" />
                      Procesando...
                    </>
                  ) : (
                    'Mejorar a Starter'
                  )}
                </Button>
                <Button 
                  onClick={() => handleUpgrade('pro', 'mercadopago')} 
                  disabled={processing}
                  className="bg-[#1C8FA0] hover:bg-[#167a8a] text-white border-none"
                >
                  {processing ? (
                    <>
                      <Icon component={Loader2} size="sm" color="default" className="mr-2 animate-spin" />
                      Procesando...
                    </>
                  ) : (
                    'Mejorar a Pro'
                  )}
                </Button>
                <Button 
                  onClick={() => handleUpgrade('premium', 'mercadopago')} 
                  disabled={processing}
                  variant="outline" 
                  className="border-gray-200"
                >
                  {processing ? (
                    <>
                      <Icon component={Loader2} size="sm" color="default" className="mr-2 animate-spin" />
                      Procesando...
                    </>
                  ) : (
                    'Mejorar a Premium'
                  )}
                </Button>
              </div>
            ) : (
              <div className="flex gap-4">
                <Button 
                  variant="outline" 
                  className="text-red-500 border-red-200 hover:bg-red-50" 
                  onClick={handleCancel}
                  disabled={processing}
                >
                  {processing ? (
                    <>
                      <Icon component={Loader2} size="sm" color="default" className="mr-2 animate-spin" />
                      Procesando...
                    </>
                  ) : (
                    'Cancelar Suscripción'
                  )}
                </Button>
              </div>
            )}
          </div>

          <div className="bg-gray-50 dark:bg-white/5 rounded-2xl p-6 flex flex-col justify-between">
             <div>
               <h3 className="font-bold text-[#1a1a1a] dark:text-white mb-4">Método de Pago</h3>
               <div className="flex items-center gap-3 text-[#6E6E73] mb-4">
                 <Icon component={CreditCard} size="md" color="default" />
                 <span>•••• •••• •••• 4242</span>
               </div>
               <div className="flex items-center gap-2 flex-wrap">
                 {/* Logo VISA */}
                 <div className="flex items-center justify-center w-16 h-10 bg-white dark:bg-white/10 rounded-md border border-gray-200 dark:border-white/20 p-1.5 shadow-sm">
                   <svg viewBox="0 0 84 47" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
                     <path fill="#1A1F71" d="M35.5 16.5h-7.2l-4.6 14.1h7.2l4.6-14.1zm15.1 9.1c-.3-1.1-1.2-2.2-2.3-2.8l0 0c-.9-.5-2.1-.7-3.3-.7h-5.6l-.1.4c4.1 1 6.8 3.3 7.8 6.4l-1.5 4.6h-7.4l1.4-4.3zm9.1-9.1l-5.5 14.1h-6.8l5.5-14.1h6.8zm-30.2 0l-4.3 10.1-.5-2.2c-.8-2.6-2.6-4.4-4.8-5.5l0 0c-1.8-.9-3.8-1.2-5.7-1l7.5 18.3h8.1l12.6-18.3h-8.5zm-20.1 0H.8l-.1.3c5.8 1.4 9.6 4.8 11.1 8.9l-1.6-4.8c-.5-1.4-1.6-2.5-3.1-3.2l0 0c-1.2-.6-2.5-.9-3.8-1.1l-.1-.1h-.1z"/>
                   </svg>
                 </div>
                 {/* Logo Mastercard */}
                 <div className="flex items-center justify-center w-16 h-10 bg-white dark:bg-white/10 rounded-md border border-gray-200 dark:border-white/20 p-1.5 shadow-sm">
                   <svg viewBox="0 0 48 30" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
                     <circle cx="18" cy="15" r="8" fill="#EB001B"/>
                     <circle cx="30" cy="15" r="8" fill="#F79E1B"/>
                     <path d="M24 10.5c-1.5 1-2.5 2.8-2.5 4.5s1 3.5 2.5 4.5c1.5-1 2.5-2.8 2.5-4.5s-1-3.5-2.5-4.5z" fill="#FF5F00"/>
                   </svg>
                 </div>
                 {/* Logo American Express */}
                 <div className="flex items-center justify-center w-16 h-10 bg-white dark:bg-white/10 rounded-md border border-gray-200 dark:border-white/20 p-1.5 shadow-sm">
                   <svg viewBox="0 0 84 24" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
                     <path fill="#006FCF" d="M0 0h84v24H0z"/>
                     <path fill="#FFFFFF" d="M12 6h2.5l1.5 4 1.5-4h2.5v12h-2v-6.5l-1.5 4h-1l-1.5-4V18h-2V6zm12 0h6v2h-4v2h4v2h-4v2h4v2h-4v2h6v2h-8V6zm12 0h2.5l3 5 3-5H52v12h-2v-5l-3 5h-1l-3-5v5h-2V6zm12 0h8v2h-6v10h-2V6z"/>
                   </svg>
                 </div>
                 {/* Logo Diners Club */}
                 <div className="flex items-center justify-center w-16 h-10 bg-white dark:bg-white/10 rounded-md border border-gray-200 dark:border-white/20 p-1.5 shadow-sm">
                   <svg viewBox="0 0 84 24" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
                     <rect width="84" height="24" rx="2" fill="#0079BE"/>
                     <circle cx="18" cy="12" r="7" fill="none" stroke="#FFFFFF" strokeWidth="1.5"/>
                     <circle cx="66" cy="12" r="7" fill="none" stroke="#FFFFFF" strokeWidth="1.5"/>
                     <path d="M42 5h-6v14h6V5z" fill="#FFFFFF"/>
                   </svg>
                 </div>
               </div>
             </div>
             <Button variant="link" className="text-[#1C8FA0] p-0 h-auto justify-start mt-4">
               Actualizar método
             </Button>
          </div>
        </div>
      </div>

      {/* Billing History */}
      <div className="bg-white dark:bg-[#1a1a1a] rounded-[22px] border border-gray-100 dark:border-white/5 overflow-hidden">
        <div className="p-6 border-b border-gray-100 dark:border-white/5">
          <h3 className="font-bold text-[#1a1a1a] dark:text-white">Historial de Pagos</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 dark:bg-white/5 text-[#6E6E73]">
              <tr>
                <th className="px-6 py-3 font-medium">Fecha</th>
                <th className="px-6 py-3 font-medium">Monto</th>
                <th className="px-6 py-3 font-medium">Estado</th>
                <th className="px-6 py-3 font-medium text-right">Factura</th>
              </tr>
            </thead>
            <tbody>
              {history.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-8 text-center text-[#6E6E73] dark:text-gray-400">
                    No hay historial de pagos aún
                  </td>
                </tr>
              ) : (
                history.map((payment) => {
                  const statusColors = {
                    approved: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
                    pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
                    rejected: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
                    refunded: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400',
                    cancelled: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400',
                  };

                  const statusLabels = {
                    approved: 'Pagado',
                    pending: 'Pendiente',
                    rejected: 'Rechazado',
                    refunded: 'Reembolsado',
                    cancelled: 'Cancelado',
                  };

                  return (
                    <tr key={payment.id} className="border-b border-gray-100 dark:border-white/5 last:border-0 hover:bg-gray-50 dark:hover:bg-white/5">
                      <td className="px-6 py-4 text-[#1a1a1a] dark:text-white">
                        {new Date(payment.created_at).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </td>
                      <td className="px-6 py-4 text-[#1a1a1a] dark:text-white font-medium">
                        {payment.currency === 'CLP' ? '$' : payment.currency} {payment.amount.toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${statusColors[payment.status] || statusColors.pending}`}>
                          {statusLabels[payment.status] || payment.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {payment.status === 'approved' && (
                          <Button size="sm" variant="ghost" className="h-8 w-8 p-0" title="Descargar factura">
                            <Icon component={Download} size="sm" color="default" />
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Billing;
