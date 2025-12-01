// =====================================================
// COMPONENTE: ScoreCard
// =====================================================
// Muestra el score principal del análisis en formato circular
// =====================================================

import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

const ScoreCard = ({ score, analysisDate, periodStart, periodEnd, totalTransactions }) => {
  const numericScore = parseFloat(score) || 0;
  
  // Determinar color según score
  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600 dark:text-green-400';
    if (score >= 60) return 'text-[#1C8FA0]';
    if (score >= 40) return 'text-orange-600 dark:text-orange-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getScoreBg = (score) => {
    if (score >= 80) return 'bg-green-500/10 border-green-500/20';
    if (score >= 60) return 'bg-[#1C8FA0]/10 border-[#1C8FA0]/20';
    if (score >= 40) return 'bg-orange-500/10 border-orange-500/20';
    return 'bg-red-500/10 border-red-500/20';
  };

  const getScoreLabel = (score) => {
    if (score >= 80) return 'Excelente';
    if (score >= 60) return 'Bueno';
    if (score >= 40) return 'Regular';
    return 'Necesita atención';
  };

  // Calcular porcentaje para el círculo (0-100)
  const percentage = Math.min(100, Math.max(0, numericScore));
  const circumference = 2 * Math.PI * 45; // radio = 45
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  // Formatear fecha
  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Formatear período
  const formatPeriod = () => {
    if (!periodStart || !periodEnd) return 'Período no especificado';
    return `${formatDate(periodStart)} - ${formatDate(periodEnd)}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        'bg-white dark:bg-[#1a1a1a] rounded-2xl border-2 p-8 shadow-lg',
        getScoreBg(numericScore)
      )}
    >
      <div className="flex flex-col lg:flex-row items-center gap-8">
        {/* Círculo de Score */}
        <div className="relative flex-shrink-0">
          <svg className="w-32 h-32 transform -rotate-90">
            {/* Círculo de fondo */}
            <circle
              cx="50%"
              cy="50%"
              r="45"
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              className="text-gray-200 dark:text-gray-700"
            />
            {/* Círculo de progreso */}
            <circle
              cx="50%"
              cy="50%"
              r="45"
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className={getScoreColor(numericScore)}
              style={{ transition: 'stroke-dashoffset 0.5s ease-in-out' }}
            />
          </svg>
          {/* Score en el centro */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={cn('text-4xl font-bold', getScoreColor(numericScore))}>
              {Math.round(numericScore)}
            </span>
            <span className="text-xs text-[#6E6E73] dark:text-gray-400 mt-1">/ 100</span>
          </div>
        </div>

        {/* Información del análisis */}
        <div className="flex-1 space-y-4">
          <div>
            <h3 className="text-2xl font-bold text-[#1a1a1a] dark:text-white mb-2">
              Puntaje Financiero
            </h3>
            <p className={cn('text-lg font-semibold', getScoreColor(numericScore))}>
              {getScoreLabel(numericScore)}
            </p>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2 text-[#6E6E73] dark:text-gray-400">
              <span className="font-medium">Fecha del análisis:</span>
              <span>{formatDate(analysisDate)}</span>
            </div>
            <div className="flex items-center gap-2 text-[#6E6E73] dark:text-gray-400">
              <span className="font-medium">Período analizado:</span>
              <span>{formatPeriod()}</span>
            </div>
            {totalTransactions && (
              <div className="flex items-center gap-2 text-[#6E6E73] dark:text-gray-400">
                <span className="font-medium">Transacciones:</span>
                <span>{totalTransactions.toLocaleString('es-ES')}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ScoreCard;

