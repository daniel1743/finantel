// =====================================================
// COMPONENTE: LeakageCard
// =====================================================
// Lista de fugas financieras detectadas
// =====================================================

import React from 'react';
import Icon from '@/components/ui/Icon';
import { motion } from 'framer-motion';
import { Droplet, AlertTriangle, DollarSign, TrendingUp, Calendar } from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';

const LeakageCard = ({ leakages = [] }) => {
  if (!leakages || leakages.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-[#0f1624] rounded-2xl border-2 border-gray-200 dark:border-[#1C8FA0]/30 p-6 shadow-lg"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-xl bg-green-500/10 border border-green-500/20">
            <Icon component={Droplet} size="md" color="success" className="dark:" />
          </div>
          <h3 className="text-lg font-bold text-[#1a1a1a] dark:text-white">Fugas Financieras</h3>
        </div>
        <div className="text-center py-6">
          <div className="inline-flex p-3 rounded-full bg-green-500/10 mb-3">
            <Icon component={TrendingUp} size="lg" color="success" className="dark:" />
          </div>
          <p className="text-sm font-medium text-[#1a1a1a] dark:text-white mb-1">
            ¡Excelente! No se detectaron fugas
          </p>
          <p className="text-xs text-[#6E6E73] dark:text-gray-400">
            Tus gastos están bajo control
          </p>
        </div>
      </motion.div>
    );
  }

  // Procesar fugas desde diferentes formatos
  const processedLeakages = Array.isArray(leakages) 
    ? leakages 
    : typeof leakages === 'object' 
      ? Object.values(leakages) 
      : [];

  // Calcular total de fugas
  const totalMonthly = processedLeakages.reduce((sum, leak) => {
    return sum + (parseFloat(leak.monthly_impact || leak.monthlyImpact || 0));
  }, 0);

  const totalAnnual = processedLeakages.reduce((sum, leak) => {
    return sum + (parseFloat(leak.annual_impact || leak.annualImpact || leak.monthly_impact * 12 || 0));
  }, 0);

  const getLeakageIcon = (type) => {
    switch (type?.toLowerCase() || '') {
      case 'subscription':
      case 'suscripción':
        return Calendar;
      case 'micro_expense':
      case 'micro':
        return DollarSign;
      case 'duplicate':
        return AlertTriangle;
      default:
        return Droplet;
    }
  };

  const getLeakageColor = (type) => {
    switch (type?.toLowerCase() || '') {
      case 'subscription':
      case 'suscripción':
        return 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800';
      case 'micro_expense':
      case 'micro':
        return 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800';
      case 'duplicate':
        return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
      default:
        return 'text-[#1C8FA0] bg-[#1C8FA0]/10 border-[#1C8FA0]/20';
    }
  };

  const getLeakageLabel = (type) => {
    switch (type?.toLowerCase() || '') {
      case 'subscription':
      case 'suscripción':
        return 'Suscripción';
      case 'micro_expense':
      case 'micro':
        return 'Micro gastos';
      case 'duplicate':
        return 'Duplicado';
      default:
        return 'Fuga';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-[#0f1624] rounded-2xl border-2 border-gray-200 dark:border-[#1C8FA0]/30 p-6 shadow-lg"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-red-500/10 border border-red-500/20">
            <Icon component={Droplet} size="md" color="error" className="dark:" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-[#1a1a1a] dark:text-white">Fugas Financieras</h3>
            <p className="text-xs text-[#6E6E73] dark:text-gray-400">
              {processedLeakages.length} fuga{processedLeakages.length !== 1 ? 's' : ''} detectada{processedLeakages.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
      </div>

      {/* Resumen de impacto */}
      {(totalMonthly > 0 || totalAnnual > 0) && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-red-900 dark:text-red-200">
              Impacto Total Estimado
            </span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-red-700 dark:text-red-300 mb-1">Mensual</p>
              <p className="text-2xl font-bold text-red-900 dark:text-red-100">
                {formatCurrency(totalMonthly)}
              </p>
            </div>
            <div>
              <p className="text-xs text-red-700 dark:text-red-300 mb-1">Anual</p>
              <p className="text-2xl font-bold text-red-900 dark:text-red-100">
                {formatCurrency(totalAnnual)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Lista de fugas */}
      <div className="space-y-3">
        {processedLeakages.slice(0, 6).map((leakage, index) => {
          const Icon = getLeakageIcon(leakage.type || leakage.leakage_type);
          const colorClasses = getLeakageColor(leakage.type || leakage.leakage_type);
          
          const description = leakage.description || leakage.leakage_description || 'Fuga detectada';
          const monthly = parseFloat(leakage.monthly_impact || leakage.monthlyImpact || 0);
          const annual = parseFloat(leakage.annual_impact || leakage.annualImpact || monthly * 12);
          const frequency = leakage.frequency || leakage.recurring_frequency || '';
          const count = leakage.count || leakage.occurrences || '';

          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={cn(
                'p-4 rounded-xl border-2 flex items-start justify-between gap-4 hover:shadow-md transition-all',
                colorClasses
              )}
            >
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <div className={cn(
                  'p-2 rounded-lg border shrink-0',
                  colorClasses
                )}>
                  <Icon className="w-4 h-4" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-sm text-[#1a1a1a] dark:text-white">
                      {description}
                    </h4>
                    <span className="text-xs px-2 py-0.5 rounded-md bg-white/50 dark:bg-black/20 text-[#1a1a1a] dark:text-white">
                      {getLeakageLabel(leakage.type || leakage.leakage_type)}
                    </span>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-3 mt-2 text-xs">
                    {monthly > 0 && (
                      <span className="text-[#6E6E73] dark:text-gray-400">
                        {formatCurrency(monthly)}/mes
                      </span>
                    )}
                    {annual > monthly && (
                      <span className="text-[#6E6E73] dark:text-gray-400">
                        {formatCurrency(annual)}/año
                      </span>
                    )}
                    {frequency && (
                      <span className="text-[#6E6E73] dark:text-gray-400">
                        {frequency}
                      </span>
                    )}
                    {count && (
                      <span className="text-[#6E6E73] dark:text-gray-400">
                        {count} ocurrencias
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {processedLeakages.length > 6 && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-[#1C8FA0]/20">
          <p className="text-xs text-center text-[#6E6E73] dark:text-gray-400">
            Y {processedLeakages.length - 6} fuga{processedLeakages.length - 6 !== 1 ? 's' : ''} más
          </p>
        </div>
      )}
    </motion.div>
  );
};

export default LeakageCard;

