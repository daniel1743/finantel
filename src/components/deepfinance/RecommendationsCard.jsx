// =====================================================
// COMPONENTE: RecommendationsCard
// =====================================================
// Visualización de recomendaciones personalizadas de IA
// =====================================================

import React, { useState } from 'react';
import Icon from '@/components/ui/Icon';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Lightbulb, 
  AlertCircle, 
  TrendingUp, 
  CheckCircle2, 
  ArrowRight,
  Sparkles,
  Target,
  Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';

const RecommendationsCard = ({ recommendations = [], aiInsights = null }) => {
  // Procesar recomendaciones desde diferentes formatos
  const processedRecommendations = Array.isArray(recommendations) 
    ? recommendations 
    : recommendations?.recommendations || [];

  // Extraer recomendaciones de aiInsights si existen
  const aiRecommendations = aiInsights?.recommendations || [];
  
  // Combinar todas las recomendaciones
  const allRecommendations = [...processedRecommendations, ...aiRecommendations]
    .filter(rec => rec && (rec.title || rec.description))
    .sort((a, b) => (a.priority || 999) - (b.priority || 999))
    .slice(0, 10); // Máximo 10 recomendaciones

  const [expandedId, setExpandedId] = useState(null);

  if (allRecommendations.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-[#0f1624] rounded-2xl border-2 border-gray-200 dark:border-[#1C8FA0]/30 p-4 md:p-6 shadow-lg overflow-hidden min-w-0"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
            <Icon component={Lightbulb} size="md" color="warning" className="dark:" />
          </div>
          <h3 className="text-lg font-bold text-[#1a1a1a] dark:text-white">Recomendaciones</h3>
        </div>
        <p className="text-sm text-[#6E6E73] dark:text-gray-400 text-center py-4">
          Generando recomendaciones personalizadas...
        </p>
      </motion.div>
    );
  }

  const getImpactColor = (impact) => {
    switch (impact?.toLowerCase()) {
      case 'crítico':
      case 'critico':
      case 'critical':
        return {
          bg: 'bg-red-50 dark:bg-red-900/20',
          border: 'border-red-200 dark:border-red-800',
          text: 'text-red-900 dark:text-red-100',
          icon: 'text-red-600 dark:text-red-400',
          badge: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
        };
      case 'alto':
      case 'high':
        return {
          bg: 'bg-orange-50 dark:bg-orange-900/20',
          border: 'border-orange-200 dark:border-orange-800',
          text: 'text-orange-900 dark:text-orange-100',
          icon: 'text-orange-600 dark:text-orange-400',
          badge: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300',
        };
      case 'medio':
      case 'medium':
        return {
          bg: 'bg-yellow-50 dark:bg-yellow-900/20',
          border: 'border-yellow-200 dark:border-yellow-800',
          text: 'text-yellow-900 dark:text-yellow-100',
          icon: 'text-yellow-600 dark:text-yellow-400',
          badge: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300',
        };
      default:
        return {
          bg: 'bg-blue-50 dark:bg-blue-900/20',
          border: 'border-blue-200 dark:border-blue-800',
          text: 'text-blue-900 dark:text-blue-100',
          icon: 'text-blue-600 dark:text-blue-400',
          badge: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
        };
    }
  };

  const getImpactIcon = (impact) => {
    switch (impact?.toLowerCase()) {
      case 'crítico':
      case 'critico':
      case 'critical':
        return AlertCircle;
      case 'alto':
      case 'high':
        return TrendingUp;
      default:
        return Lightbulb;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-[#0f1624] rounded-2xl border-2 border-gray-200 dark:border-[#1C8FA0]/30 p-4 md:p-6 shadow-lg overflow-hidden min-w-0"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
          <Icon component={Sparkles} size="md" color="warning" className="dark:" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-[#1a1a1a] dark:text-white">Recomendaciones Personalizadas</h3>
          <p className="text-xs text-[#6E6E73] dark:text-gray-400">
            {allRecommendations.length} recomendación{allRecommendations.length !== 1 ? 'es' : ''} basada{allRecommendations.length !== 1 ? 's' : ''} en tu análisis
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {allRecommendations.map((recommendation, index) => {
          const impact = recommendation.impact || recommendation.priority_label || 'medio';
          const colors = getImpactColor(impact);
          const Icon = getImpactIcon(impact);
          const isExpanded = expandedId === index;
          const hasActions = recommendation.actions || recommendation.action_items || recommendation.steps;

          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={cn(
                'rounded-xl border-2 transition-all overflow-hidden',
                colors.bg,
                colors.border,
                isExpanded && 'shadow-lg'
              )}
            >
              <div
                className="p-4 cursor-pointer"
                onClick={() => setExpandedId(isExpanded ? null : index)}
              >
                <div className="flex items-start gap-3 w-full">
                  <div className={cn('p-2 rounded-lg border shrink-0', colors.border, colors.icon)}>
                    <Icon className="w-4 h-4 md:w-5 md:h-5" />
                  </div>
                  
                  <div className="flex-1 min-w-0 overflow-hidden">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-2">
                      <h4 className={cn('font-semibold text-sm min-w-0 flex-1', colors.text)} style={{ wordBreak: 'break-word', overflowWrap: 'break-word', lineHeight: '1.4' }}>
                        {recommendation.title || 'Recomendación'}
                      </h4>
                      <span className={cn(
                        'text-xs font-bold px-2 py-1 rounded-md shrink-0 whitespace-nowrap',
                        colors.badge
                      )}>
                        {impact.toUpperCase()}
                      </span>
                    </div>
                    
                    <p className={cn('text-xs leading-relaxed', colors.text, 'opacity-90')} style={{ wordBreak: 'break-word', overflowWrap: 'break-word', lineHeight: '1.4' }}>
                      {recommendation.description || recommendation.recommendation || 'Sin descripción'}
                    </p>

                    {/* Badges adicionales */}
                    {recommendation.category && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        <span className="text-xs px-2 py-1 rounded-md bg-white/50 dark:bg-black/20 text-[#1a1a1a] dark:text-white">
                          {recommendation.category}
                        </span>
                        {recommendation.priority && (
                          <span className="text-xs px-2 py-1 rounded-md bg-white/50 dark:bg-black/20 text-[#1a1a1a] dark:text-white">
                            Prioridad {recommendation.priority}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <ArrowRight
                    className={cn(
                      'w-4 h-4 shrink-0 transition-transform mt-1',
                      colors.icon,
                      isExpanded && 'rotate-90'
                    )}
                  />
                </div>
              </div>

              {/* Contenido expandido */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className={cn('px-4 pb-4 pt-0 border-t', colors.border)}>
                      {/* Acciones o pasos */}
                      {hasActions && (
                        <div className="mt-4">
                          <h5 className={cn('text-xs font-semibold mb-3', colors.text)}>
                            Acciones Recomendadas:
                          </h5>
                          <ul className="space-y-2">
                            {(recommendation.actions || recommendation.action_items || recommendation.steps || []).map((action, actionIndex) => (
                              <li key={actionIndex} className="flex items-start gap-2">
                                <Target className={cn('w-4 h-4 shrink-0 mt-0.5', colors.icon)} />
                                <span className={cn('text-xs', colors.text, 'opacity-90')}>
                                  {typeof action === 'string' ? action : action.description || action.action || action}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Impacto estimado */}
                      {recommendation.estimated_savings && (
                        <div className="mt-4 p-3 rounded-lg bg-white/50 dark:bg-black/20">
                          <div className="flex items-center gap-2 mb-1">
                            <Zap className={cn('w-4 h-4', colors.icon)} />
                            <span className={cn('text-xs font-semibold', colors.text)}>
                              Ahorro Estimado:
                            </span>
                          </div>
                          <p className={cn('text-sm font-bold', colors.text)}>
                            {typeof recommendation.estimated_savings === 'number'
                              ? `$${recommendation.estimated_savings.toFixed(2)}`
                              : recommendation.estimated_savings}
                          </p>
                        </div>
                      )}

                      {/* Tiempo estimado */}
                      {recommendation.timeframe && (
                        <div className="mt-3">
                          <span className={cn('text-xs', colors.text, 'opacity-70')}>
                            ⏱️ Tiempo estimado: {recommendation.timeframe}
                          </span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      {/* Resumen */}
      {allRecommendations.length > 0 && (
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-[#1C8FA0]/20">
          <div className="flex items-center gap-2 text-xs text-[#6E6E73] dark:text-gray-400">
            <Icon component={CheckCircle2} size="sm" color="default" />
            <span>
              Implementa estas recomendaciones para mejorar tu puntaje financiero y aumentar tus ahorros
            </span>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default RecommendationsCard;

