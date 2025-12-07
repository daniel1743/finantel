import React from 'react';
import Icon from '@/components/ui/Icon';
import { motion } from 'framer-motion';
import { Users, TrendingUp, DollarSign, Target, ArrowUp, ArrowDown, Activity } from 'lucide-react';
import { formatNumber, formatPercentage, formatCurrency, formatChange } from '@/utils/metricsFormatter';

const MetricasOverview = ({ metrics, period, onPeriodChange }) => {
  // Forzar mostrar todas las tarjetas siempre, incluso sin datos
  const safeMetrics = metrics || {};

  const cards = [
    {
      title: 'Usuarios Activos',
      value: safeMetrics.activeUsers || 0,
      change: formatChange(safeMetrics.activeUsers, safeMetrics.activeUsersPrev),
      icon: Users,
      color: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
      trend: 'up',
    },
    {
      title: 'Nuevos Registros',
      value: safeMetrics.newSignups || 0,
      change: formatChange(safeMetrics.newSignups, safeMetrics.newSignupsPrev),
      icon: TrendingUp,
      color: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400',
      trend: 'up',
    },
    {
      title: 'Retención',
      value: `${formatPercentage(safeMetrics.retention || 0)}`,
      change: null,
      icon: Target,
      color: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400',
      trend: 'neutral',
    },
    {
      title: 'Revenue Hoy',
      value: formatCurrency(safeMetrics.revenue || 0),
      change: formatChange(safeMetrics.revenue, safeMetrics.revenuePrev),
      icon: DollarSign,
      color: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400',
      trend: 'up',
    },
    {
      title: 'Tasa de Conversión',
      value: `${formatPercentage(safeMetrics.conversionRate || 0)}`,
      change: null,
      icon: Activity,
      color: 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400',
      trend: 'neutral',
    },
    {
      title: 'Churn Rate',
      value: `${formatPercentage(safeMetrics.churnRate || 0)}`,
      change: null,
      icon: TrendingUp,
      color: (safeMetrics.churnRate || 0) > 10 ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400' : 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400',
      trend: 'down',
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Métricas Principales</h2>
        <div className="flex gap-2">
          {['1d', '7d', '30d'].map((p) => (
            <button
              key={p}
              onClick={() => onPeriodChange?.(p)}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                period === p
                  ? 'bg-[#1C8FA0] text-white'
                  : 'bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10'
              }`}
            >
              {p === '1d' ? 'Hoy' : p === '7d' ? '7 días' : '30 días'}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((card, idx) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white dark:bg-[#1a1a1a] rounded-xl p-6 shadow-sm border border-gray-100 dark:border-white/10 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`p-3 rounded-lg ${card.color}`}>
                <Icon component={card.icon} size="md" color="default" />
              </div>
              {card.change && (
                <div className={`flex items-center gap-1 text-sm font-medium ${card.change.color}`}>
                  {card.change.isPositive ? (
                    <ArrowUp className="w-4 h-4" />
                  ) : (
                    <ArrowDown className="w-4 h-4" />
                  )}
                  {card.change.text}
                </div>
              )}
            </div>
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">{card.title}</h3>
            <p 
              className={`font-bold text-[#1a1a1a] dark:text-white break-words overflow-hidden ${
                String(card.value).length > 15 ? 'text-xl' : 'text-3xl'
              }`}
              style={{ 
                wordBreak: 'break-word',
                maxWidth: '100%',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}
              title={card.value}
            >
              {card.value}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default MetricasOverview;


