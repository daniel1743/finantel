// =====================================================
// COMPONENTE: SavingsProjection
// =====================================================
// Card para mostrar proyecciones de ahorro potencial
// =====================================================

import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, DollarSign, Calendar, Target, Zap, ArrowRight } from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';

const SavingsProjection = ({ projections = {} }) => {
  if (!projections || Object.keys(projections).length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-[#0f1624] rounded-2xl border-2 border-gray-200 dark:border-[#1C8FA0]/30 p-6 shadow-lg"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-xl bg-green-500/10 border border-green-500/20">
            <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
          </div>
          <h3 className="text-lg font-bold text-[#1a1a1a] dark:text-white">Proyecciones de Ahorro</h3>
        </div>
        <p className="text-sm text-[#6E6E73] dark:text-gray-400 text-center py-4">
          Calculando proyecciones...
        </p>
      </motion.div>
    );
  }

  // Extraer escenarios principales
  const scenario30 = projections['30days'] || {};
  const scenario90 = projections['90days'] || {};
  const scenario180 = projections['180days'] || {};
  const eliminateLeakages = projections['eliminate_leakages'] || {};
  const reduceEmotional = projections['reduce_emotional'] || {};

  // Calcular mejor escenario
  const bestScenario = [
    { ...scenario30, key: '30days', label: '30 días' },
    { ...scenario90, key: '90days', label: '90 días' },
    { ...scenario180, key: '180days', label: '180 días' },
  ].reduce((best, current) => 
    (current.potential || 0) > (best.potential || 0) ? current : best
  , scenario30);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-[#0f1624] rounded-2xl border-2 border-gray-200 dark:border-[#1C8FA0]/30 p-6 shadow-lg"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-xl bg-green-500/10 border border-green-500/20">
          <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-[#1a1a1a] dark:text-white">Proyecciones de Ahorro</h3>
          <p className="text-xs text-[#6E6E73] dark:text-gray-400">
            Potencial de ahorro optimizando tus finanzas
          </p>
        </div>
      </div>

      {/* Proyecciones por Período */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {scenario30.potential !== undefined && (
          <ProjectionPeriodCard
            period="30 días"
            amount={scenario30.potential || 0}
            breakdown={scenario30.breakdown}
            delay={0.1}
          />
        )}
        {scenario90.potential !== undefined && (
          <ProjectionPeriodCard
            period="90 días"
            amount={scenario90.potential || 0}
            breakdown={scenario90.breakdown}
            delay={0.2}
          />
        )}
        {scenario180.potential !== undefined && (
          <ProjectionPeriodCard
            period="180 días"
            amount={scenario180.potential || 0}
            breakdown={scenario180.breakdown}
            delay={0.3}
          />
        )}
      </div>

      {/* Escenarios Específicos */}
      <div className="space-y-4">
        {eliminateLeakages.potential > 0 && (
          <ScenarioCard
            icon={Zap}
            title="Eliminando Fugas"
            description={eliminateLeakages.description || 'Elimina todas las fugas financieras detectadas'}
            monthly={eliminateLeakages.monthly || 0}
            annual={eliminateLeakages.annual || eliminateLeakages.potential || 0}
            color="purple"
            delay={0.4}
          />
        )}

        {reduceEmotional.potential > 0 && (
          <ScenarioCard
            icon={Target}
            title={`Reduciendo Gastos Emocionales (${reduceEmotional.reductionPercentage || 50}%)`}
            description={reduceEmotional.description || 'Reduce tus gastos emocionales'}
            monthly={reduceEmotional.monthly || 0}
            annual={reduceEmotional.annual || reduceEmotional.potential || 0}
            currentMonthly={reduceEmotional.currentMonthly}
            color="orange"
            delay={0.5}
          />
        )}
      </div>
    </motion.div>
  );
};

// Componente para tarjeta de período
const ProjectionPeriodCard = ({ period, amount, breakdown, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ delay }}
    className="p-4 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-2 border-green-200 dark:border-green-800"
  >
    <div className="flex items-center gap-2 mb-2">
      <Calendar className="w-4 h-4 text-green-600 dark:text-green-400" />
      <span className="text-xs font-semibold text-green-900 dark:text-green-100">
        {period}
      </span>
    </div>
    <p className="text-2xl font-bold text-green-900 dark:text-green-100 mb-1">
      {formatCurrency(amount)}
    </p>
    {breakdown && (
      <div className="mt-2 pt-2 border-t border-green-200 dark:border-green-800">
        <div className="flex flex-col gap-1 text-xs">
          {breakdown.leakages > 0 && (
            <div className="flex justify-between">
              <span className="text-green-700 dark:text-green-300">Fugas:</span>
              <span className="font-medium text-green-900 dark:text-green-100">
                {formatCurrency(breakdown.leakages)}
              </span>
            </div>
          )}
          {breakdown.emotional > 0 && (
            <div className="flex justify-between">
              <span className="text-green-700 dark:text-green-300">Emocional:</span>
              <span className="font-medium text-green-900 dark:text-green-100">
                {formatCurrency(breakdown.emotional)}
              </span>
            </div>
          )}
          {breakdown.unnecessary > 0 && (
            <div className="flex justify-between">
              <span className="text-green-700 dark:text-green-300">Innecesario:</span>
              <span className="font-medium text-green-900 dark:text-green-100">
                {formatCurrency(breakdown.unnecessary)}
              </span>
            </div>
          )}
        </div>
      </div>
    )}
  </motion.div>
);

// Componente para escenario específico
const ScenarioCard = ({ icon: Icon, title, description, monthly, annual, currentMonthly, color, delay = 0 }) => {
  const colorClasses = {
    purple: 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800 text-purple-900 dark:text-purple-100',
    orange: 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800 text-orange-900 dark:text-orange-100',
    blue: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-100',
  };

  const currentColor = colorClasses[color] || colorClasses.blue;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay }}
      className={cn('p-4 rounded-xl border-2', currentColor)}
    >
      <div className="flex items-start gap-3 mb-3">
        <div className={cn('p-2 rounded-lg border shrink-0', currentColor)}>
          <Icon className="w-4 h-4" />
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-sm mb-1">{title}</h4>
          <p className="text-xs opacity-80">{description}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mt-4">
        <div>
          <p className="text-xs opacity-80 mb-1">Mensual</p>
          <p className="text-xl font-bold">{formatCurrency(monthly)}</p>
        </div>
        <div>
          <p className="text-xs opacity-80 mb-1">Anual</p>
          <p className="text-xl font-bold">{formatCurrency(annual)}</p>
        </div>
      </div>

      {currentMonthly && currentMonthly > 0 && (
        <div className="mt-3 pt-3 border-t border-current opacity-30">
          <p className="text-xs opacity-80">
            Actualmente gastas {formatCurrency(currentMonthly)}/mes en esta categoría
          </p>
        </div>
      )}
    </motion.div>
  );
};

export default SavingsProjection;

