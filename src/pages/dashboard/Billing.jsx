
import React from 'react';
import { useBilling } from '@/hooks/useBilling';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Button } from '@/components/ui/button';
import { CreditCard, Download, ShieldCheck, AlertTriangle } from 'lucide-react';

const Billing = () => {
  const { user } = useAuth();
  const { subscription, loading, createCheckoutSession, cancelSubscription } = useBilling(user?.id);

  const handleUpgrade = async (provider) => {
    const session = await createCheckoutSession('personal', provider);
    window.open(session.url, '_blank');
  };

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-[#1a1a1a] dark:text-white">Facturación y Planes</h1>
          <p className="text-[#6E6E73] mt-1">Gestiona tu suscripción y métodos de pago</p>
        </div>
      </div>

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
                  <ShieldCheck className="w-3 h-3" /> Activo
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
              <div className="flex gap-4">
                <Button onClick={() => handleUpgrade('mercadopago')} className="bg-[#009EE3] hover:bg-[#0081b8] text-white border-none">
                  Pagar con Mercado Pago
                </Button>
                <Button onClick={() => handleUpgrade('stripe')} variant="outline" className="border-gray-200">
                  Pagar con Tarjeta (Stripe)
                </Button>
              </div>
            ) : (
              <div className="flex gap-4">
                <Button variant="outline" className="text-red-500 border-red-200 hover:bg-red-50" onClick={cancelSubscription}>
                  Cancelar Suscripción
                </Button>
              </div>
            )}
          </div>

          <div className="bg-gray-50 dark:bg-white/5 rounded-2xl p-6 flex flex-col justify-between">
             <div>
               <h3 className="font-bold text-[#1a1a1a] dark:text-white mb-4">Método de Pago</h3>
               <div className="flex items-center gap-3 text-[#6E6E73]">
                 <CreditCard className="w-5 h-5" />
                 <span>•••• •••• •••• 4242</span>
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
              {/* Mock Data since history is empty initially */}
              {[
                { date: '2024-10-21', amount: '$12.00', status: 'Pagado' },
                { date: '2024-09-21', amount: '$12.00', status: 'Pagado' },
              ].map((invoice, i) => (
                <tr key={i} className="border-b border-gray-100 dark:border-white/5 last:border-0">
                  <td className="px-6 py-4 text-[#1a1a1a] dark:text-white">{invoice.date}</td>
                  <td className="px-6 py-4 text-[#1a1a1a] dark:text-white">{invoice.amount}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs font-bold">
                      {invoice.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                      <Download className="w-4 h-4 text-[#6E6E73]" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Billing;
