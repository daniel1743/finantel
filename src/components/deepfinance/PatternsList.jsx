// =====================================================
// COMPONENTE: PatternsList
// =====================================================
// Lista de patrones financieros detectados
// =====================================================

import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Repeat, Calendar, DollarSign } from 'lucide-react';
import { cn } from '@/lib/utils';

const PatternsList = ({ patterns = [] }) => {
  if (!patterns || patterns.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-[#1a1a1a] rounded-2xl border-2 border-gray-200 dark:border-white/10 p-6 shadow-lg"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-xl bg-[#1C8FA0]/10 border border-[#1C8FA0]/20">
            <Repeat className="w-5 h-5 text-[#1C8FA0]" />
          </div>
          <h3 className="text-lg font-bold text-[#1a1a1a] dark:text-white">
            Patrones Detectados
          </h3>
        </div>
        <div className="text-center py-8">
          <p className="text-sm text-[#6E6E73] dark:text-gray-400">
            No se detectaron patrones en este período
          </p>
        </div>
      </motion.div>
    );
  }

  // Procesar patrones desde diferentes formatos
  const processedPatterns = Array.isArray(patterns)
    ? patterns
    : typeof patterns === 'object'
    ? Object.values(patterns)
    : [];

  const getPatternIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'recurring':
      case 'recurrente':
        return Repeat;
      case 'trending_up':
      case 'creciente':
        return TrendingUp;
      case 'trending_down':
      case 'decreciente':
        return TrendingDown;
      default:
        return Calendar;
    }
  };

  const getPatternColor = (type) => {
    switch (type?.toLowerCase()) {
      case 'recurring':
      case 'recurrente':
        return 'bg-blue-500/10 border-blue-500/20 text-blue-600 dark:text-blue-400';
      case 'trending_up':
      case 'creciente':
        return 'bg-green-500/10 border-green-500/20 text-green-600 dark:text-green-400';
      case 'trending_down':
      case 'decreciente':
        return 'bg-orange-500/10 border-orange-500/20 text-orange-600 dark:text-orange-400';
      default:
        return 'bg-[#1C8FA0]/10 border-[#1C8FA0]/20 text-[#1C8FA0]';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-[#1a1a1a] rounded-2xl border-2 border-gray-200 dark:border-white/10 p-6 shadow-lg"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-xl bg-[#1C8FA0]/10 border border-[#1C8FA0]/20">
          <Repeat className="w-5 h-5 text-[#1C8FA0]" />
        </div>
        <h3 className="text-lg font-bold text-[#1a1a1a] dark:text-white">
          Patrones Detectados
        </h3>
      </div>

      <div className="space-y-3">
        {processedPatterns.map((pattern, index) => {
          const Icon = getPatternIcon(pattern.type || pattern.pattern_type);
          const type = pattern.type || pattern.pattern_type || 'unknown';
          const description = pattern.description || pattern.summary || 'Patrón detectado';
          const category = pattern.category || pattern.category_name || 'General';
          const frequency = pattern.frequency || pattern.occurrence_count || 'N/A';

          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={cn(
                'p-4 rounded-xl border transition-colors',
                getPatternColor(type)
              )}
            >
              <div className="flex items-start gap-3">
                <div className={cn('p-2 rounded-lg', getPatternColor(type))}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-[#1a1a1a] dark:text-white capitalize">
                      {type.replace('_', ' ')}
                    </h4>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-white/50 dark:bg-black/20">
                      {category}
                    </span>
                  </div>
                  <p className="text-sm text-[#6E6E73] dark:text-gray-400 mb-2">
                    {description}
                  </p>
                  {frequency !== 'N/A' && (
                    <div className="flex items-center gap-1 text-xs text-[#6E6E73] dark:text-gray-400">
                      <Calendar className="w-3 h-3" />
                      <span>Frecuencia: {frequency}</span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default PatternsList;

