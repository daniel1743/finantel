// =====================================================
// COMPONENTE: LeakagesList
// =====================================================
// Lista de fugas de dinero detectadas en el análisis
// =====================================================

import React from 'react';
import { motion } from 'framer-motion';
import { Droplet, AlertTriangle, DollarSign, Calendar, TrendingUp } from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';

const LeakagesList = ({ leakages = [] }) => {
  if (!leakages || leakages.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-[#1a1a1a] rounded-2xl border-2 border-gray-200 dark:border-white/10 p-6 shadow-lg"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-xl bg-green-500/10 border border-green-500/20">
            <Droplet className="w-5 h-5 text-green-600 dark:text-green-400" />
          </div>
          <h3 className="text-lg font-bold text-[#1a1a1a] dark:text-white">
            Fugas de Dinero Detectadas
          </h3>
        </div>
        <div className="text-center py-8">
          <div className="inline-flex p-3 rounded-full bg-green-500/10 mb-3">
            <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
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

  // Calcular totales
  const totalMonthly = processedLeakages.reduce((sum, leak) => {
    return sum + (parseFloat(leak.monthly_impact || leak.monthlyImpact || 0));
  }, 0);

  const totalAnnual = processedLeakages.reduce((sum, leak) => {
    return sum + (parseFloat(leak.annual_impact || leak.annualImpact || leak.monthly_impact * 12 || 0));
  }, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-[#1a1a1a] rounded-2xl border-2 border-orange-500/20 p-6 shadow-lg"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-orange-500/10 border border-orange-500/20">
            <Droplet className="w-5 h-5 text-orange-600 dark:text-orange-400" />
          </div>
          <h3 className="text-lg font-bold text-[#1a1a1a] dark:text-white">
            Fugas de Dinero Detectadas
          </h3>
        </div>
        <div className="text-right">
          <p className="text-xs text-[#6E6E73] dark:text-gray-400">Total mensual</p>
          <p className="text-lg font-bold text-orange-600 dark:text-orange-400">
            {formatCurrency(totalMonthly)}
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {processedLeakages.map((leakage, index) => {
          const monthly = parseFloat(leakage.monthly_impact || leakage.monthlyImpact || 0);
          const annual = parseFloat(leakage.annual_impact || leakage.annualImpact || monthly * 12 || 0);
          const category = leakage.category || leakage.category_name || 'Sin categoría';
          const description = leakage.description || leakage.reason || 'Fuga detectada';

          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-4 rounded-xl bg-orange-500/5 border border-orange-500/10 hover:border-orange-500/30 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                    <h4 className="font-semibold text-[#1a1a1a] dark:text-white">
                      {category}
                    </h4>
                  </div>
                  <p className="text-sm text-[#6E6E73] dark:text-gray-400 mb-3">
                    {description}
                  </p>
                  <div className="flex flex-wrap gap-4 text-xs">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-[#6E6E73]" />
                      <span className="text-[#6E6E73] dark:text-gray-400">
                        Mensual: <span className="font-semibold text-orange-600">{formatCurrency(monthly)}</span>
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <DollarSign className="w-3 h-3 text-[#6E6E73]" />
                      <span className="text-[#6E6E73] dark:text-gray-400">
                        Anual: <span className="font-semibold text-orange-600">{formatCurrency(annual)}</span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {totalAnnual > 0 && (
        <div className="mt-6 pt-6 border-t border-orange-500/20">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-[#1a1a1a] dark:text-white">
              Potencial de ahorro anual
            </p>
            <p className="text-xl font-bold text-orange-600 dark:text-orange-400">
              {formatCurrency(totalAnnual)}
            </p>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default LeakagesList;

