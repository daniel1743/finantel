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

  // Función para formatear porcentajes grandes
  const formatPercentage = (value) => {
    if (typeof value !== 'number') {
      const str = String(value);
      return str.length > 8 ? `${str.substring(0, 8)}...` : str;
    }
    
    // Si es muy grande (probablemente un error de cálculo), mostrar como "Muy alto"
    if (Math.abs(value) >= 100000) {
      return `${value > 0 ? '+' : ''}Muy alto`;
    }
    // Si es muy grande, usar formato compacto
    if (Math.abs(value) >= 1000) {
      return `${value > 0 ? '+' : ''}${(value / 1000).toFixed(1)}k%`;
    }
    return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-[#0f1624] rounded-2xl border-2 border-gray-200 dark:border-[#1C8FA0]/30 p-4 md:p-6 shadow-lg overflow-hidden min-w-0 w-full"
    >
      <div className="flex items-center gap-3 mb-4 md:mb-6">
        <div className="p-2 rounded-xl bg-[#1C8FA0]/10 border border-[#1C8FA0]/20 shrink-0">
          <Icon component={BarChart3} size="md" color="primary" />
        </div>
        <div className="min-w-0">
          <h3 className="text-lg font-bold text-[#1a1a1a] dark:text-white truncate">Patrones Detectados</h3>
          <p className="text-xs text-[#6E6E73] dark:text-gray-400">
            {processedPatterns.length} patrón{processedPatterns.length !== 1 ? 'es' : ''} encontrado{processedPatterns.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      <div className="space-y-3">
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

          // Construir texto del patrón
          const patternText = description || 
            (day && `Mayor gasto los ${dayNames[day] || day}`) ||
            (hour && `Gastos frecuentes a las ${hour}:00`) ||
            (category && `Categoría dominante: ${category}`) ||
            (trend && `Tendencia: ${trend}`) ||
            'Patrón detectado';

          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={cn(
                'p-3 md:p-4 rounded-xl border-2 transition-all hover:shadow-md w-full',
                colorClasses
              )}
              style={{ overflow: 'hidden', maxWidth: '100%' }}
            >
              <div className="flex items-start gap-3" style={{ width: '100%', minWidth: 0 }}>
                {/* Icono */}
                <div className={cn(
                  'p-2 rounded-lg border shrink-0',
                  colorClasses
                )} style={{ flexShrink: 0 }}>
                  <Icon className="w-4 h-4" />
                </div>
                
                {/* Contenido */}
                <div className="flex-1" style={{ minWidth: 0, width: '100%', overflow: 'hidden' }}>
                  {/* Título */}
                  <div className="mb-2">
                    <h4 
                      className="font-semibold text-sm text-[#1a1a1a] dark:text-white"
                      style={{ 
                        wordBreak: 'break-word',
                        overflowWrap: 'break-word',
                        lineHeight: '1.4',
                        whiteSpace: 'normal',
                        width: '100%',
                        display: 'block'
                      }}
                    >
                      {patternText}
                    </h4>
                  </div>
                  
                  {/* Porcentaje y badges en la misma línea */}
                  <div className="flex flex-wrap items-center gap-2">
                    {impact && (
                      <span 
                        className="text-xs font-bold px-2 py-1 rounded-md bg-white/50 dark:bg-black/20"
                        style={{ whiteSpace: 'nowrap', flexShrink: 0 }}
                      >
                        {typeof impact === 'number' 
                          ? formatPercentage(impact)
                          : String(impact).length > 10 
                            ? `${String(impact).substring(0, 10)}...`
                            : impact}
                      </span>
                    )}
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
                </div>
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
