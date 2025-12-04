// =====================================================
// COMPONENTE: CreditPurchaseModal
// =====================================================
// Modal completo para compra de créditos DeepFinance
// =====================================================

import React, { useState, useEffect } from 'react';
import Icon from '@/components/ui/Icon';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Zap,
  CheckCircle2,
  CreditCard,
  Loader2,
  AlertCircle,
  ShoppingCart,
  TrendingUp,
  Shield,
  Clock,
} from 'lucide-react';
import { supabase } from '@/lib/customSupabaseClient';
import { MercadoPagoService } from '@/lib/mercadoPago';
import { CreditManager } from '@/lib/deepfinance/creditManager';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';

const CREDIT_PACKAGES = [
  {
    id: 'basic',
    credits: 10,
    price: 5,
    currency: 'USD',
    name: 'Paquete Básico',
    description: '10 análisis DeepFinance™',
    features: [
      '10 análisis completos',
      'Priorización de análisis',
      'Acceso a todas las funciones',
    ],
    popular: false,
  },
  {
    id: 'premium',
    credits: 25,
    price: 10,
    currency: 'USD',
    name: 'Paquete Premium',
    description: '25 análisis DeepFinance™',
    features: [
      '25 análisis completos',
      'Priorización de análisis',
      'Acceso a todas las funciones',
      'Soporte prioritario',
    ],
    popular: true,
    savings: 'Ahorra $2.50',
  },
  {
    id: 'pro',
    credits: 60,
    price: 20,
    currency: 'USD',
    name: 'Paquete Pro',
    description: '60 análisis DeepFinance™',
    features: [
      '60 análisis completos',
      'Priorización de análisis',
      'Acceso a todas las funciones',
      'Soporte prioritario',
      'Actualizaciones anticipadas',
    ],
    popular: false,
    savings: 'Ahorra $10.00',
  },
];

const CreditPurchaseModal = ({ isOpen, onClose, userId, currentCredits = 0, onPurchaseSuccess }) => {
  const { toast } = useToast();
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [purchaseHistory, setPurchaseHistory] = useState([]);

  useEffect(() => {
    if (isOpen && userId) {
      loadPurchaseHistory();
    }
  }, [isOpen, userId]);

  const loadPurchaseHistory = async () => {
    try {
      // Cargar historial de compras
      const { data, error } = await supabase
        .from('deepfinance_credit_purchases')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setPurchaseHistory(data || []);
    } catch (err) {
      console.error('[CreditPurchaseModal] Error loading history:', err);
    }
  };

  const handlePurchase = async (pkg) => {
    if (!userId) {
      setError('Usuario no identificado');
      return;
    }

    setLoading(true);
    setError(null);
    setSelectedPackage(pkg);

    try {
      // Crear preferencia de pago
      const { preferenceId, initPoint, error: paymentError } = 
        await MercadoPagoService.createPaymentPreference(userId, pkg.credits);

      if (paymentError || !initPoint) {
        throw new Error(paymentError || 'Error al crear preferencia de pago');
      }

      // Abrir checkout de Mercado Pago
      window.location.href = initPoint;

      // El flujo continuará en el callback después del pago
      // Guardar información en localStorage para procesar después
      localStorage.setItem('deepfinance_pending_purchase', JSON.stringify({
        userId,
        packageId: pkg.id,
        credits: pkg.credits,
        preferenceId,
        timestamp: Date.now(),
      }));

    } catch (err) {
      console.error('[CreditPurchaseModal] Error:', err);
      setError(err.message || 'Error al procesar la compra. Por favor, intenta nuevamente.');
      setLoading(false);
      setSelectedPackage(null);
      
      toast({
        variant: 'destructive',
        title: 'Error en la compra',
        description: err.message || 'No se pudo procesar la compra',
      });
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative bg-white dark:bg-[#0f1624] rounded-2xl border-2 border-gray-200 dark:border-[#1C8FA0]/30 shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-[#1C8FA0] to-purple-600 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-white/20">
                  <Icon component={ShoppingCart} size="lg" color="white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">Comprar Créditos DeepFinance™</h3>
                  <p className="text-sm text-white/80">
                    Desbloquea análisis ilimitados y funciones premium
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-white/20 transition-colors"
                disabled={loading}
              >
                <Icon component={X} size="md" color="white" />
              </button>
            </div>

            {/* Créditos actuales */}
            <div className="mt-4 p-4 rounded-xl bg-white/10 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Icon component={Zap} size="md" color="white" />
                  <span className="text-white font-semibold">Créditos disponibles:</span>
                </div>
                <span className="text-2xl font-bold text-white">{currentCredits || 0}</span>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {/* Error */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800"
              >
                <div className="flex items-start gap-3">
                  <Icon component={AlertCircle} size="md" color="error" className="dark: shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-red-900 dark:text-red-100">
                      Error en la compra
                    </p>
                    <p className="text-xs text-red-700 dark:text-red-300 mt-1">{error}</p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Packages Grid */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              {CREDIT_PACKAGES.map((pkg) => (
                <motion.div
                  key={pkg.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * CREDIT_PACKAGES.indexOf(pkg) }}
                  className={cn(
                    'relative p-6 rounded-xl border-2 transition-all',
                    pkg.popular
                      ? 'border-[#1C8FA0] bg-gradient-to-br from-[#1C8FA0]/10 to-purple-500/10 shadow-lg scale-105'
                      : 'border-gray-200 dark:border-[#1C8FA0]/20 bg-white dark:bg-[#1a1a2e]',
                    loading && selectedPackage?.id === pkg.id && 'opacity-50'
                  )}
                >
                  {pkg.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-[#1C8FA0] text-white text-xs font-semibold">
                      Más Popular
                    </div>
                  )}

                  <div className="text-center mb-4">
                    <h4 className="text-lg font-bold text-[#1a1a1a] dark:text-white mb-1">
                      {pkg.name}
                    </h4>
                    <p className="text-sm text-[#6E6E73] dark:text-gray-400">
                      {pkg.description}
                    </p>
                  </div>

                  <div className="text-center mb-6">
                    <div className="text-4xl font-bold text-[#1a1a1a] dark:text-white mb-1">
                      {formatCurrency(pkg.price)}
                    </div>
                    <div className="text-xs text-[#6E6E73] dark:text-gray-400">
                      {formatCurrency(pkg.price / pkg.credits)} por análisis
                    </div>
                    {pkg.savings && (
                      <div className="mt-2 inline-block px-2 py-1 rounded-md bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs font-semibold">
                        {pkg.savings}
                      </div>
                    )}
                  </div>

                  <ul className="space-y-2 mb-6">
                    {pkg.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-[#1a1a1a] dark:text-gray-300">
                        <Icon component={CheckCircle2} size="sm" color="success" className="dark: shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => handlePurchase(pkg)}
                    disabled={loading}
                    className={cn(
                      'w-full px-4 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2',
                      pkg.popular
                        ? 'bg-gradient-to-r from-[#1C8FA0] to-purple-600 text-white hover:shadow-xl'
                        : 'bg-gray-200 dark:bg-gray-700 text-[#1a1a1a] dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600',
                      loading && selectedPackage?.id === pkg.id && 'opacity-50 cursor-not-allowed'
                    )}
                  >
                    {loading && selectedPackage?.id === pkg.id ? (
                      <>
                        <Icon component={Loader2} size="sm" color="default" className="animate-spin" />
                        Procesando...
                      </>
                    ) : (
                      <>
                        <Icon component={CreditCard} size="sm" color="default" />
                        Comprar ahora
                      </>
                    )}
                  </button>
                </motion.div>
              ))}
            </div>

            {/* Security & Info */}
            <div className="grid md:grid-cols-3 gap-4 mb-6">
              <div className="p-4 rounded-xl bg-gray-50 dark:bg-[#1a1a2e] border border-gray-200 dark:border-[#1C8FA0]/20">
                <Icon component={Shield} size="md" color="primary" className="mb-2" />
                <h5 className="font-semibold text-[#1a1a1a] dark:text-white text-sm mb-1">
                  Pago Seguro
                </h5>
                <p className="text-xs text-[#6E6E73] dark:text-gray-400">
                  Procesado por Mercado Pago
                </p>
              </div>
              <div className="p-4 rounded-xl bg-gray-50 dark:bg-[#1a1a2e] border border-gray-200 dark:border-[#1C8FA0]/20">
                <Icon component={Clock} size="md" color="primary" className="mb-2" />
                <h5 className="font-semibold text-[#1a1a1a] dark:text-white text-sm mb-1">
                  Inmediato
                </h5>
                <p className="text-xs text-[#6E6E73] dark:text-gray-400">
                  Los créditos se acreditan al instante
                </p>
              </div>
              <div className="p-4 rounded-xl bg-gray-50 dark:bg-[#1a1a2e] border border-gray-200 dark:border-[#1C8FA0]/20">
                <Icon component={TrendingUp} size="md" color="primary" className="mb-2" />
                <h5 className="font-semibold text-[#1a1a1a] dark:text-white text-sm mb-1">
                  Sin Vencimiento
                </h5>
                <p className="text-xs text-[#6E6E73] dark:text-gray-400">
                  Usa tus créditos cuando quieras
                </p>
              </div>
            </div>

            {/* Purchase History */}
            {purchaseHistory.length > 0 && (
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-[#1C8FA0]/20">
                <h4 className="font-semibold text-[#1a1a1a] dark:text-white mb-4">
                  Historial de Compras
                </h4>
                <div className="space-y-2">
                  {purchaseHistory.map((purchase) => (
                    <div
                      key={purchase.id}
                      className="p-3 rounded-lg bg-gray-50 dark:bg-[#1a1a2e] border border-gray-200 dark:border-[#1C8FA0]/20"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-[#1a1a1a] dark:text-white">
                            {purchase.credits_purchased} créditos
                          </p>
                          <p className="text-xs text-[#6E6E73] dark:text-gray-400">
                            {formatDate(purchase.created_at)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-[#1a1a1a] dark:text-white">
                            {formatCurrency(purchase.amount_paid)}
                          </p>
                          <span
                            className={cn(
                              'text-xs px-2 py-1 rounded-md',
                              purchase.status === 'completed'
                                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                                : purchase.status === 'pending'
                                ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
                                : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                            )}
                          >
                            {purchase.status === 'completed' ? 'Completado' : 
                             purchase.status === 'pending' ? 'Pendiente' : 'Fallido'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default CreditPurchaseModal;

