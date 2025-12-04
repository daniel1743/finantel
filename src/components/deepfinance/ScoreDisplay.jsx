// =====================================================
// COMPONENTE: ScoreDisplay
// =====================================================
// Display circular del puntaje financiero (0-100)
// =====================================================

import React from 'react';
import Icon from '@/components/ui/Icon';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

const ScoreDisplay = ({ score, size = 'large', showLabel = true, className = '' }) => {
  // Validar score
  const validScore = Math.max(0, Math.min(100, score || 0));
  const percentage = validScore;

  // Determinar color basado en el puntaje
  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600 dark:text-green-400';
    if (score >= 60) return 'text-yellow-600 dark:text-yellow-400';
    if (score >= 40) return 'text-orange-600 dark:text-orange-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getScoreBgColor = (score) => {
    if (score >= 80) return 'bg-green-500/10 border-green-500/20';
    if (score >= 60) return 'bg-yellow-500/10 border-yellow-500/20';
    if (score >= 40) return 'bg-orange-500/10 border-orange-500/20';
    return 'bg-red-500/10 border-red-500/20';
  };

  const getScoreLabel = (score) => {
    if (score >= 80) return 'Excelente';
    if (score >= 60) return 'Bueno';
    if (score >= 40) return 'Regular';
    return 'Necesita Mejora';
  };

  const getScoreIcon = (score) => {
    if (score >= 70) return <Icon component={TrendingUp} size="md" color="default" />;
    if (score >= 40) return <Icon component={AlertCircle} size="md" color="default" />;
    return <Icon component={TrendingDown} size="md" color="default" />;
  };

  // Tamaños del círculo
  const sizeClasses = {
    small: 'w-32 h-32',
    medium: 'w-48 h-48',
    large: 'w-64 h-64',
  };

  const strokeWidths = {
    small: 8,
    medium: 12,
    large: 16,
  };

  const radius = {
    small: 52,
    medium: 80,
    large: 112,
  };

  const circumference = {
    small: 2 * Math.PI * 52,
    medium: 2 * Math.PI * 80,
    large: 2 * Math.PI * 112,
  };

  const currentSize = sizeClasses[size] || sizeClasses.large;
  const currentRadius = radius[size] || radius.large;
  const currentCircumference = circumference[size] || circumference.large;
  const currentStrokeWidth = strokeWidths[size] || strokeWidths.large;

  const offset = currentCircumference - (percentage / 100) * currentCircumference;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, type: 'spring' }}
      className={cn('relative flex flex-col items-center justify-center', className)}
    >
      {/* Contenedor del círculo */}
      <div className={cn('relative', currentSize)}>
        {/* SVG del círculo */}
        <svg
          className="transform -rotate-90"
          width={currentSize === sizeClasses.small ? 128 : currentSize === sizeClasses.medium ? 192 : 256}
          height={currentSize === sizeClasses.small ? 128 : currentSize === sizeClasses.medium ? 192 : 256}
        >
          {/* Círculo de fondo */}
          <circle
            cx={currentSize === sizeClasses.small ? 64 : currentSize === sizeClasses.medium ? 96 : 128}
            cy={currentSize === sizeClasses.small ? 64 : currentSize === sizeClasses.medium ? 96 : 128}
            r={currentRadius}
            stroke="currentColor"
            strokeWidth={currentStrokeWidth}
            fill="none"
            className="text-gray-200 dark:text-gray-700"
          />
          {/* Círculo de progreso */}
          <motion.circle
            cx={currentSize === sizeClasses.small ? 64 : currentSize === sizeClasses.medium ? 96 : 128}
            cy={currentSize === sizeClasses.small ? 64 : currentSize === sizeClasses.medium ? 96 : 128}
            r={currentRadius}
            stroke="currentColor"
            strokeWidth={currentStrokeWidth}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={currentCircumference}
            strokeDashoffset={offset}
            className={getScoreColor(validScore)}
            initial={{ strokeDashoffset: currentCircumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
          />
        </svg>

        {/* Contenido central */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className={cn('text-5xl font-bold', getScoreColor(validScore))}>
            {Math.round(validScore)}
          </div>
          {showLabel && (
            <>
              <div className="text-xs text-[#6E6E73] dark:text-gray-400 mt-1">/ 100</div>
              <div className={cn(
                'mt-2 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1',
                getScoreBgColor(validScore),
                getScoreColor(validScore)
              )}>
                {getScoreIcon(validScore)}
                {getScoreLabel(validScore)}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Badge de estado */}
      {showLabel && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className={cn(
            'mt-4 px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2',
            getScoreBgColor(validScore),
            'border-2',
            getScoreColor(validScore).includes('green') && 'border-green-500/30',
            getScoreColor(validScore).includes('yellow') && 'border-yellow-500/30',
            getScoreColor(validScore).includes('orange') && 'border-orange-500/30',
            getScoreColor(validScore).includes('red') && 'border-red-500/30'
          )}
        >
          <span className={getScoreColor(validScore)}>
            Puntaje Financiero Global
          </span>
        </motion.div>
      )}
    </motion.div>
  );
};

export default ScoreDisplay;

