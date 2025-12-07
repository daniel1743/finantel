// =====================================================
// COMPONENTE: PatternCard
// =====================================================
// Visualización de patrones detectados en los gastos
// =====================================================

import React from 'react';
import Icon from '@/components/ui/Icon';
import { motion } from 'framer-motion';
import { Calendar, Clock, TrendingUp, TrendingDown, BarChart3, AlertCircle } from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';

const PatternCard = ({ patterns = [] }) => {
  if (!patterns || patterns.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-[#0f1624] rounded-2xl border-2 border-gray-200 dark:border-[#1C8FA0]/30 p-4 md:p-6 shadow-lg overflow-hidden min-w-0"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-xl bg-[#1C8FA0]/10 border border-[#1C8FA0]/20">
            <Icon component={BarChart3} size="md" color="primary" />
          </div>
          <h3 className="text-lg font-bold text-[#1a1a1a] dark:text-white">Patrones Detectados</h3>
        </div>
        <p className="text-sm text-[#6E6E73] dark:text-gray-400 text-center py-4">
          No se detectaron patrones significativos en tus gastos
        </p>
      </motion.div>
    );
  }

  // Procesar patrones desde diferentes formatos (array, objeto, JSONB de BD)
  const processedPatterns = Array.isArray(patterns) 
    ? patterns 
    : typeof patterns === 'object' 
      ? Object.values(patterns) 
      : [];

  const dayNames = {
    'Domingo': 'Domingo',
    'Lunes': 'Lunes',
    'Martes': 'Martes',
    'Miércoles': 'Miércoles',
    'Jueves': 'Jueves',
    'Viernes': 'Viernes',
    'Sábado': 'Sábado',
    0: 'Domingo',
    1: 'Lunes',
    2: 'Martes',
    3: 'Miércoles',
    4: 'Jueves',
    5: 'Viernes',
    6: 'Sábado'
  };

  const getPatternIcon = (type) => {
    switch (type?.toLowerCase() || '') {
      case 'day':
      case 'dayofweek':
        return Calendar;
      case 'hour':
      case 'time':
        return Clock;
      case 'category':
        return BarChart3;
      case 'trend':
      case 'monthly':
        return TrendingUp;
      default:
        return BarChart3;
    }
  };

  const getPatternColor = (type) => {
    switch (type?.toLowerCase() || '') {
      case 'day':
      case 'dayofweek':
        return 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800';
      case 'hour':
      case 'time':
        return 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800';
      case 'category':
        return 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800';
      case 'trend':
      case 'monthly':
        return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
      default:
        return 'text-[#1C8FA0] bg-[#1C8FA0]/10 border-[#1C8FA0]/20';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-[#0f1624] rounded-2xl border-2 border-gray-200 dark:border-[#1C8FA0]/30 p-4 md:p-6 shadow-lg overflow-hidden min-w-0"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-xl bg-[#1C8FA0]/10 border border-[#1C8FA0]/20">
          <Icon component={BarChart3} size="md" color="primary" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-[#1a1a1a] dark:text-white">Patrones Detectados</h3>
          <p className="text-xs text-[#6E6E73] dark:text-gray-400">
            {processedPatterns.length} patrón{processedPatterns.length !== 1 ? 'es' : ''} encontrado{processedPatterns.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {processedPatterns.slice(0, 5).map((pattern, index) => {
          const Icon = getPatternIcon(pattern.type || pattern.pattern_type);
          const colorClasses = getPatternColor(pattern.type || pattern.pattern_type);
          
          // Extraer información del patrón
          const description = pattern.description || pattern.pattern_description || '';
          const day = pattern.day || pattern.day_of_week || pattern.dayName;
          const hour = pattern.hour || pattern.hour_of_day;
          const category = pattern.category || pattern.category_name;
          const trend = pattern.trend || pattern.trend_type;
          const impact = pattern.impact || pattern.percentage || pattern.difference;

          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={cn(
                'p-4 rounded-xl border-2 flex items-start gap-4 transition-all hover:shadow-md',
                colorClasses
              )}
            >
              <div className={cn(
                'p-2 rounded-lg border shrink-0',
                colorClasses
              )}>
                <Icon className="w-4 h-4" />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h4 className="font-semibold text-sm text-[#1a1a1a] dark:text-white break-words min-w-0" style={{ wordBreak: 'break-word' }}>
                    {description || 
                     (day && `Mayor gasto los ${dayNames[day] || day}`) ||
                     (hour && `Gastos frecuentes a las ${hour}:00`) ||
                     (category && `Categoría dominante: ${category}`) ||
                     (trend && `Tendencia: ${trend}`) ||
                     'Patrón detectado'}
                  </h4>
                  {impact && (
                    <span className="text-xs font-bold px-2 py-1 rounded-md bg-white/50 dark:bg-black/20">
                      {typeof impact === 'number' 
                        ? `${impact > 0 ? '+' : ''}${impact.toFixed(1)}%`
                        : impact}
                    </span>
                  )}
                </div>
                
                {(day || hour || category || trend) && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {day && (
                      <span className="text-xs px-2 py-1 rounded-md bg-white/50 dark:bg-black/20 text-[#1a1a1a] dark:text-white">
                        {dayNames[day] || day}
                      </span>
                    )}
                    {hour !== undefined && (
                      <span className="text-xs px-2 py-1 rounded-md bg-white/50 dark:bg-black/20 text-[#1a1a1a] dark:text-white">
                        {hour}:00
                      </span>
                    )}
                    {category && (
                      <span className="text-xs px-2 py-1 rounded-md bg-white/50 dark:bg-black/20 text-[#1a1a1a] dark:text-white">
                        {category}
                      </span>
                    )}
                    {trend && (
                      <span className="text-xs px-2 py-1 rounded-md bg-white/50 dark:bg-black/20 text-[#1a1a1a] dark:text-white">
                        {trend}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {processedPatterns.length > 5 && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-[#1C8FA0]/20">
          <p className="text-xs text-center text-[#6E6E73] dark:text-gray-400">
            Y {processedPatterns.length - 5} patrón{processedPatterns.length - 5 !== 1 ? 'es' : ''} más
          </p>
        </div>
      )}
    </motion.div>
  );
};

export default PatternCard;

