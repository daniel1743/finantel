// =====================================================
// COMPONENTE: RiskCard
// =====================================================
// Indicadores de riesgo financiero
// =====================================================

import React from 'react';
import Icon from '@/components/ui/Icon';
import { motion } from 'framer-motion';
import { Shield, AlertTriangle, CheckCircle2, XCircle, TrendingDown, TrendingUp } from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';

const RiskCard = ({ risk = {} }) => {
  // Procesar datos de riesgo desde diferentes formatos
  const riskData = typeof risk === 'object' && risk !== null ? risk : {};
  
  const level = riskData.level || riskData.risk_level || 'medium';
  const factors = riskData.factors || riskData.risk_factors || [];
  const score = riskData.score || riskData.risk_score || 0;

  const riskLevels = {
    'critical': {
      label: 'Crítico',
      color: 'text-red-600 dark:text-red-400',
      bg: 'bg-red-50 dark:bg-red-900/20',
      border: 'border-red-200 dark:border-red-800',
      icon: XCircle
    },
    'high': {
      label: 'Alto',
      color: 'text-orange-600 dark:text-orange-400',
      bg: 'bg-orange-50 dark:bg-orange-900/20',
      border: 'border-orange-200 dark:border-orange-800',
      icon: AlertTriangle
    },
    'medium': {
      label: 'Moderado',
      color: 'text-yellow-600 dark:text-yellow-400',
      bg: 'bg-yellow-50 dark:bg-yellow-900/20',
      border: 'border-yellow-200 dark:border-yellow-800',
      icon: AlertTriangle
    },
    'low': {
      label: 'Bajo',
      color: 'text-green-600 dark:text-green-400',
      bg: 'bg-green-50 dark:bg-green-900/20',
      border: 'border-green-200 dark:border-green-800',
      icon: CheckCircle2
    }
  };

  const currentRisk = riskLevels[level.toLowerCase()] || riskLevels['medium'];
  const RiskIcon = currentRisk.icon;

  const processedFactors = Array.isArray(factors) ? factors : [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-[#0f1624] rounded-2xl border-2 border-gray-200 dark:border-[#1C8FA0]/30 p-4 md:p-6 shadow-lg overflow-hidden min-w-0"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className={cn('p-2 rounded-xl border', currentRisk.bg, currentRisk.border)}>
            <Shield className={cn('w-5 h-5', currentRisk.color)} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-[#1a1a1a] dark:text-white">Nivel de Riesgo</h3>
            <p className="text-xs text-[#6E6E73] dark:text-gray-400">
              Evaluación de estabilidad financiera
            </p>
          </div>
        </div>
      </div>

      {/* Nivel de Riesgo Principal */}
      <div className={cn('mb-6 p-6 rounded-xl border-2', currentRisk.bg, currentRisk.border)}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <RiskIcon className={cn('w-6 h-6', currentRisk.color)} />
            <div>
              <h4 className="text-lg font-bold text-[#1a1a1a] dark:text-white">
                {currentRisk.label}
              </h4>
              <p className="text-xs text-[#6E6E73] dark:text-gray-400">
                {level === 'critical' && 'Requiere atención inmediata'}
                {level === 'high' && 'Se recomienda tomar medidas preventivas'}
                {level === 'medium' && 'Monitoreo continuo recomendado'}
                {level === 'low' && 'Situación financiera estable'}
              </p>
            </div>
          </div>
        </div>

        {score > 0 && (
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-[#6E6E73] dark:text-gray-400">
                Puntaje de Riesgo
              </span>
              <span className="text-xs font-bold">
                {score}/100
              </span>
            </div>
            <div className="w-full bg-white/30 dark:bg-black/20 rounded-full h-2">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${score}%` }}
                transition={{ duration: 1, delay: 0.3 }}
                className={cn('h-2 rounded-full', currentRisk.color.replace('text-', 'bg-').split(' ')[0])}
              />
            </div>
          </div>
        )}
      </div>

      {/* Factores de Riesgo */}
      {processedFactors.length > 0 ? (
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-[#1a1a1a] dark:text-white mb-3">
            Factores de Riesgo Detectados
          </h4>
          {processedFactors.slice(0, 6).map((factor, index) => {
            const factorText = typeof factor === 'string' 
              ? factor 
              : factor.description || factor.name || factor.factor || 'Factor de riesgo';
            
            const severity = factor.severity || factor.level || 'medium';
            const isCritical = severity === 'critical' || severity === 'high';

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={cn(
                  'p-3 md:p-4 rounded-xl border-2 flex items-start gap-3 overflow-hidden w-full',
                  isCritical
                    ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                    : 'bg-gray-50 dark:bg-[#1a1a2e] border-gray-200 dark:border-[#1C8FA0]/20'
                )}
              >
                {isCritical ? (
                  <Icon component={AlertTriangle} size="md" color="error" className="dark: shrink-0 mt-0.5" />
                ) : (
                  <Icon component={CheckCircle2} size="md" color="warning" className="dark: shrink-0 mt-0.5" />
                )}
                <div className="flex-1 min-w-0 overflow-hidden">
                  <p className="text-sm text-[#1a1a1a] dark:text-white" style={{ wordBreak: 'break-word', overflowWrap: 'break-word', lineHeight: '1.4' }}>
                    {factorText}
                  </p>
                  {factor.recommendation && (
                    <p className="text-xs text-[#6E6E73] dark:text-gray-400 mt-1" style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}>
                      💡 {factor.recommendation}
                    </p>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-6">
          <div className="inline-flex p-3 rounded-full bg-green-500/10 mb-3">
            <Icon component={CheckCircle2} size="lg" color="success" className="dark:" />
          </div>
          <p className="text-sm font-medium text-[#1a1a1a] dark:text-white mb-1">
            No se detectaron factores de riesgo críticos
          </p>
          <p className="text-xs text-[#6E6E73] dark:text-gray-400">
            Tu situación financiera es estable
          </p>
        </div>
      )}

      {processedFactors.length > 6 && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-[#1C8FA0]/20">
          <p className="text-xs text-center text-[#6E6E73] dark:text-gray-400">
            Y {processedFactors.length - 6} factor{processedFactors.length - 6 !== 1 ? 'es' : ''} más
          </p>
        </div>
      )}

      {/* Recomendaciones generales */}
      {(level === 'critical' || level === 'high') && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-6 p-4 rounded-xl bg-[#1C8FA0]/10 border-2 border-[#1C8FA0]/20"
        >
          <div className="flex items-start gap-3">
            <Icon component={TrendingUp} size="md" color="primary" className="shrink-0 mt-0.5" />
            <div>
              <h5 className="text-sm font-semibold text-[#1a1a1a] dark:text-white mb-1">
                Recomendación General
              </h5>
              <p className="text-xs text-[#6E6E73] dark:text-gray-400">
                {level === 'critical' 
                  ? 'Se recomienda revisar tus gastos urgentemente y considerar reducir gastos no esenciales para mejorar tu estabilidad financiera.'
                  : 'Considera revisar tus patrones de gasto y crear un fondo de emergencia para aumentar tu seguridad financiera.'}
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default RiskCard;

