// =====================================================
// COMPONENTE: EmotionalCard
// =====================================================
// Visualización de gastos emocionales e impulsivos
// =====================================================

import React from 'react';
import Icon from '@/components/ui/Icon';
import { motion } from 'framer-motion';
import { Heart, Zap, AlertCircle, TrendingDown, Brain } from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';

const EmotionalCard = ({ emotional = {} }) => {
  // Procesar datos emocionales desde diferentes formatos
  const emotionalData = typeof emotional === 'object' && emotional !== null 
    ? emotional 
    : {};

  const score = emotionalData.score || emotionalData.emotional_score || 0;
  const monthlyImpact = parseFloat(emotionalData.monthly_impact || emotionalData.monthlyImpact || 0);
  const emotionalSpending = emotionalData.emotional_spending || emotionalData.emotionalSpending || [];
  const impulsiveSpending = emotionalData.impulsive_spending || emotionalData.impulsiveSpending || [];
  const indicators = emotionalData.indicators || emotionalData.emotional_indicators || [];

  const hasData = score > 0 || monthlyImpact > 0 || 
                  (Array.isArray(emotionalSpending) && emotionalSpending.length > 0) ||
                  (Array.isArray(impulsiveSpending) && impulsiveSpending.length > 0);

  if (!hasData) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-[#0f1624] rounded-2xl border-2 border-gray-200 dark:border-[#1C8FA0]/30 p-4 md:p-6 shadow-lg"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-xl bg-green-500/10 border border-green-500/20">
            <Icon component={Brain} size="md" color="success" className="dark:" />
          </div>
          <h3 className="text-lg font-bold text-[#1a1a1a] dark:text-white">Gastos Emocionales</h3>
        </div>
        <div className="text-center py-6">
          <div className="inline-flex p-3 rounded-full bg-green-500/10 mb-3">
            <Icon component={TrendingDown} size="lg" color="success" className="dark:" />
          </div>
          <p className="text-sm font-medium text-[#1a1a1a] dark:text-white mb-1">
            Control emocional excelente
          </p>
          <p className="text-xs text-[#6E6E73] dark:text-gray-400">
            No se detectaron gastos emocionales significativos
          </p>
        </div>
      </motion.div>
    );
  }

  const getScoreColor = (score) => {
    if (score >= 70) return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
    if (score >= 50) return 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800';
    if (score >= 30) return 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800';
    return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
  };

  const getScoreLabel = (score) => {
    if (score >= 70) return 'Alto';
    if (score >= 50) return 'Moderado';
    if (score >= 30) return 'Bajo';
    return 'Muy bajo';
  };

  const allSpending = [
    ...(Array.isArray(emotionalSpending) ? emotionalSpending : []),
    ...(Array.isArray(impulsiveSpending) ? impulsiveSpending : [])
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-[#0f1624] rounded-2xl border-2 border-gray-200 dark:border-[#1C8FA0]/30 p-4 md:p-6 shadow-lg"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20">
            <Icon component={Heart} size="md" color="default" className="dark:" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-[#1a1a1a] dark:text-white">Gastos Emocionales</h3>
            <p className="text-xs text-[#6E6E73] dark:text-gray-400">
              Análisis de comportamiento de gasto
            </p>
          </div>
        </div>
      </div>

      {/* Score de Control Emocional */}
      {score > 0 && (
        <div className={cn('mb-6 p-4 rounded-xl border-2', getScoreColor(score))}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">
              Nivel de Gastos Emocionales
            </span>
            <span className="text-xs font-bold px-2 py-1 rounded-md bg-white/50 dark:bg-black/20">
              {getScoreLabel(score)} ({score}/100)
            </span>
          </div>
          <div className="w-full bg-white/30 dark:bg-black/20 rounded-full h-2 mb-2">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${score}%` }}
              transition={{ duration: 1, delay: 0.3 }}
              className={cn('h-2 rounded-full', getScoreColor(score).replace('text-', 'bg-').split(' ')[0])}
            />
          </div>
          {score >= 50 && (
            <p className="text-xs mt-2 opacity-90">
              Se detectaron gastos emocionales significativos que podrían reducirse
            </p>
          )}
        </div>
      )}

      {/* Impacto Mensual */}
      {monthlyImpact > 0 && (
        <div className="mb-6 p-4 rounded-xl bg-purple-50 dark:bg-purple-900/20 border-2 border-purple-200 dark:border-purple-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-purple-700 dark:text-purple-300 mb-1">
                Impacto Mensual Estimado
              </p>
              <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                {formatCurrency(monthlyImpact)}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-purple-100 dark:bg-purple-800/50">
              <Icon component={Zap} size="lg" color="default" className="dark:" />
            </div>
          </div>
        </div>
      )}

      {/* Indicadores */}
      {Array.isArray(indicators) && indicators.length > 0 && (
        <div className="mb-6 space-y-2">
          <h4 className="text-sm font-semibold text-[#1a1a1a] dark:text-white mb-3">
            Indicadores Detectados
          </h4>
          {indicators.slice(0, 4).map((indicator, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-[#1a1a2e] border border-gray-200 dark:border-[#1C8FA0]/20"
            >
              <Icon component={AlertCircle} size="sm" color="default" className="dark: shrink-0" />
              <span className="text-xs text-[#1a1a1a] dark:text-white">
                {typeof indicator === 'string' 
                  ? indicator 
                  : indicator.description || indicator.name || 'Indicador detectado'}
              </span>
            </motion.div>
          ))}
        </div>
      )}

      {/* Lista de gastos emocionales/impulsivos */}
      {allSpending.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-[#1a1a1a] dark:text-white mb-3">
            Gastos Detectados
          </h4>
          {allSpending.slice(0, 5).map((spending, index) => {
            const amount = parseFloat(spending.amount || spending.value || 0);
            const description = spending.description || spending.name || 'Gasto detectado';
            const type = spending.type || 'emotional';

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-[#1a1a2e] border border-gray-200 dark:border-[#1C8FA0]/20"
              >
                <div className="flex items-center gap-3">
                  {type === 'impulsive' ? (
                    <Icon component={Zap} size="sm" color="warning" className="dark:" />
                  ) : (
                    <Icon component={Heart} size="sm" color="default" className="dark:" />
                  )}
                  <span className="text-sm text-[#1a1a1a] dark:text-white">
                    {description}
                  </span>
                </div>
                <span className="text-sm font-semibold text-[#1a1a1a] dark:text-white">
                  {formatCurrency(amount)}
                </span>
              </motion.div>
            );
          })}
        </div>
      )}

      {allSpending.length > 5 && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-[#1C8FA0]/20">
          <p className="text-xs text-center text-[#6E6E73] dark:text-gray-400">
            Y {allSpending.length - 5} gasto{allSpending.length - 5 !== 1 ? 's' : ''} más
          </p>
        </div>
      )}
    </motion.div>
  );
};

export default EmotionalCard;

