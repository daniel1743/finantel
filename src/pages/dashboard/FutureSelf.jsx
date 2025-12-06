// ============================================================================
// FUTURE SELF VIEW - Componente Principal
// ============================================================================
// Muestra simulaciones financieras futuras del usuario
// ============================================================================

import React, { useState, useEffect } from 'react';
import Icon from '@/components/ui/Icon';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Calendar,
  DollarSign,
  Target,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Loader2,
  X,
  Info,
} from 'lucide-react';
import { useFutureSelf } from '@/hooks/useFutureSelf';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useUserCurrency } from '@/hooks/useUserCurrency';
import { useToolTracking } from '@/hooks/useToolTracking';

// ============================================================================
// CONFIGURACIÓN DE ESCENARIOS
// ============================================================================
const SCENARIO_CONFIG = {
  current_trend: {
    title: 'Tendencia Actual',
    subtitle: 'Si continúas así',
    icon: Minus,
    color: '#6B7280',
    bgColor: 'bg-gray-50 dark:bg-gray-900/20',
    borderColor: 'border-gray-200 dark:border-gray-800',
    trend: 'stable',
  },
  improved: {
    title: 'Escenario Mejorado',
    subtitle: 'Si mejoras tus hábitos',
    icon: TrendingUp,
    color: '#10B981',
    bgColor: 'bg-green-50 dark:bg-green-900/20',
    borderColor: 'border-green-200 dark:border-green-800',
    trend: 'improving',
  },
  worst_case: {
    title: 'Escenario Desafiante',
    subtitle: 'Si las cosas empeoran',
    icon: TrendingDown,
    color: '#EF4444',
    bgColor: 'bg-red-50 dark:bg-red-900/20',
    borderColor: 'border-red-200 dark:border-red-800',
    trend: 'declining',
  },
};

const HORIZON_OPTIONS = [
  { value: 3, label: '3 Meses' },
  { value: 6, label: '6 Meses' },
  { value: 12, label: '12 Meses' },
  { value: 24, label: '24 Meses' },
];

// ============================================================================
// COMPONENTE: ScenarioCard
// ============================================================================
const ScenarioCard = ({ scenario, config, currency, delay = 0 }) => {
  const Icon = config.icon;
  
  // ========================================================================
  // CORRECCIÓN 1.6: Validación de datos antes de renderizar
  // ========================================================================
  const projectedNetWorth = scenario.projected_net_worth;
  const isValidNetWorth = projectedNetWorth !== null && 
                          projectedNetWorth !== undefined && 
                          !isNaN(projectedNetWorth);
  
  // Log de validación
  if (!isValidNetWorth) {
    console.warn('[SIMULADOR-FIX] [1.6] Valor inválido de patrimonio neto:', {
      scenario_type: scenario.scenario_type,
      projected_net_worth: projectedNetWorth,
      scenario: scenario
    });
  } else {
    console.log('[SIMULADOR-FIX] [1.6] Validando escenario:', {
      scenario_type: scenario.scenario_type,
      projected_net_worth: projectedNetWorth,
      isValid: true
    });
  }
  
  // Usar valor por defecto si es inválido
  const safeNetWorth = isValidNetWorth ? projectedNetWorth : 0;
  const isPositive = safeNetWorth >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className={`${config.bgColor} rounded-[22px] border-2 ${config.borderColor} pt-3 pb-4 px-4 md:pt-4 md:pb-6 md:px-6 shadow-sm overflow-hidden w-full max-w-full flex flex-col justify-start h-fit md:h-full`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3 shrink-0">
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: `${config.color}20` }}
          >
            <Icon className="w-6 h-6" style={{ color: config.color }} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-[#1a1a1a] dark:text-white">
              {config.title}
            </h3>
            <p className="text-xs text-[#6E6E73] dark:text-gray-400">
              {config.subtitle}
            </p>
          </div>
        </div>
      </div>

      {/* Patrimonio Neto Proyectado */}
      <div className="mb-3 shrink-0">
        <p className="text-xs font-medium text-[#6E6E73] dark:text-gray-400 mb-1">
          Patrimonio Neto Proyectado
        </p>
        <p
          className={`text-2xl md:text-3xl font-bold font-['Inter_Tight'] break-words ${
            isPositive
              ? 'text-green-600 dark:text-green-400'
              : 'text-red-600 dark:text-red-400'
          }`}
        >
          {formatCurrency(safeNetWorth, currency)}
        </p>
      </div>

      {/* Métricas */}
      <div className="space-y-2 mb-3 shrink-0">
        <div className="flex justify-between items-center gap-2 text-sm">
          <span className="text-[#6E6E73] dark:text-gray-400 flex-shrink-0">Ahorros proyectados</span>
          <span className="font-medium text-[#1a1a1a] dark:text-white text-right break-words">
            {formatCurrency(
              (scenario.projected_savings !== null && scenario.projected_savings !== undefined && !isNaN(scenario.projected_savings)) 
                ? scenario.projected_savings 
                : 0, 
              currency
            )}
          </span>
        </div>
        {scenario.projected_debt > 0 && (
          <div className="flex justify-between items-center gap-2 text-sm">
            <span className="text-[#6E6E73] dark:text-gray-400 flex-shrink-0">Deuda proyectada</span>
            <span className="font-medium text-red-600 dark:text-red-400 text-right break-words">
              {formatCurrency(
                (scenario.projected_debt !== null && scenario.projected_debt !== undefined && !isNaN(scenario.projected_debt)) 
                  ? scenario.projected_debt 
                  : 0, 
                currency
              )}
            </span>
          </div>
        )}
      </div>

      {/* Resumen generado por IA */}
      {scenario.summary_text && (
        <div className="bg-white/50 dark:bg-black/20 rounded-lg p-2.5 mb-3 w-full">
          <p className="text-xs md:text-sm text-[#1a1a1a] dark:text-white leading-relaxed break-words text-center w-full">
            {scenario.summary_text}
          </p>
        </div>
      )}

      {/* Acciones sugeridas */}
      {scenario.suggested_actions && scenario.suggested_actions.length > 0 && (
        <div className="space-y-2 mb-3">
          <p className="text-xs font-bold text-[#6E6E73] dark:text-gray-400 uppercase tracking-wider">
            Acciones Sugeridas
          </p>
          {scenario.suggested_actions.slice(0, 3).map((action, idx) => (
            <div
              key={idx}
              className="flex items-start gap-2 bg-white/30 dark:bg-black/10 rounded-lg p-2"
            >
              <Icon component={CheckCircle2} size="sm" color="success" className="mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-[#1a1a1a] dark:text-white break-words">
                  {action.description}
                </p>
                {action.impact && (
                  <p className="text-xs text-green-600 dark:text-green-400 break-words">
                    Ahorro estimado: {formatCurrency(action.impact, currency)}/mes
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Disclaimer profesional */}
      <div className="mt-auto pt-3 border-t border-gray-200/50 dark:border-white/5">
        <p className="text-[10px] leading-relaxed text-[#6E6E73] dark:text-gray-500 text-center italic">
          <span className="font-medium">Nota:</span> Esta proyección es una estimación basada en tus transacciones registradas, patrones de gasto históricos y tendencias financieras. No constituye una predicción exacta y puede variar según cambios en tus hábitos, ingresos o circunstancias económicas.
        </p>
      </div>
    </motion.div>
  );
};

// ============================================================================
// HELPER: Formatear moneda
// ============================================================================
function formatCurrency(amount, currency = 'CLP') {
  // Validar que amount sea un número válido
  if (amount === undefined || amount === null || isNaN(amount)) {
    return currency === 'CLP' ? '$0' : '$0.00';
  }
  
  // Convertir a número si es string
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (isNaN(numAmount)) {
    return currency === 'CLP' ? '$0' : '$0.00';
  }
  
  if (currency === 'CLP') {
    // CLP sin decimales para números enteros
    if (Number.isInteger(numAmount)) {
      return `$${numAmount.toLocaleString('es-CL')}`;
    }
    return `$${numAmount.toLocaleString('es-CL', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  } else {
    // USD, EUR, etc. con 2 decimales
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(numAmount);
  }
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================
export default function FutureSelfView() {
  const [horizonMonths, setHorizonMonths] = useState(12);
  const [showRecalculateModal, setShowRecalculateModal] = useState(false);
  const [previousHorizon, setPreviousHorizon] = useState(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  
  // ========================================================================
  // CORRECCIÓN 2.4: Validación de horizonte temporal
  // ========================================================================
  const validHorizons = [3, 6, 12, 24];
  
  useEffect(() => {
    const isValidHorizon = validHorizons.includes(horizonMonths);
    
    if (!isValidHorizon) {
      console.warn('[SIMULADOR-FIX] [2.4] Horizonte inválido detectado:', {
        horizonMonths,
        willReset: true
      });
      // Resetear a valor válido por defecto
      setHorizonMonths(12);
    } else {
      console.log('[SIMULADOR-FIX] [2.4] Validando horizonte:', {
        horizonMonths,
        isValid: true
      });
    }
  }, [horizonMonths]);
  
  // ========================================================================
  // Modal de Recalcular: Mostrar cuando cambia el horizonte
  // ========================================================================
  useEffect(() => {
    // Marcar que la carga inicial terminó después del primer render
    if (isInitialLoad) {
      setIsInitialLoad(false);
      setPreviousHorizon(horizonMonths);
      return;
    }
    
    // Solo mostrar modal si el horizonte cambió y no es la carga inicial
    if (horizonMonths !== previousHorizon && previousHorizon !== null) {
      setShowRecalculateModal(true);
    }
    setPreviousHorizon(horizonMonths);
  }, [horizonMonths, previousHorizon, isInitialLoad]);
  
  const { scenarios, currentMetrics, loading, error, refresh } = useFutureSelf(horizonMonths);
  const { currency } = useUserCurrency();
  const { toast } = useToast();

  const handleRefresh = async () => {
    setShowRecalculateModal(false);
    await refresh();
    toast({
      title: 'Escenarios actualizados',
      description: 'Se han recalculado los escenarios futuros',
    });
  };

  const handleRecalculateFromModal = async () => {
    setShowRecalculateModal(false);
    await handleRefresh();
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Modal de Recalcular */}
      <AnimatePresence>
        {showRecalculateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-[#1a1a1a] rounded-[22px] border border-gray-200 dark:border-white/10 shadow-xl p-6 max-w-md w-full mx-4"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#1C8FA0]/10 flex items-center justify-center">
                    <Icon component={Info} size="md" color="primary" />
                  </div>
                  <h3 className="text-lg font-bold text-[#1a1a1a] dark:text-white">
                    Actualizar Resultados
                  </h3>
                </div>
                <button
                  onClick={() => setShowRecalculateModal(false)}
                  className="text-[#6E6E73] dark:text-gray-400 hover:text-[#1a1a1a] dark:hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <p className="text-sm text-[#6E6E73] dark:text-gray-400 mb-6 leading-relaxed">
                Para ver resultados actualizados en este período ({HORIZON_OPTIONS.find(o => o.value === horizonMonths)?.label || `${horizonMonths} meses`}), 
                por favor haz clic en <strong>Recalcular</strong> para obtener proyecciones precisas y fiables.
              </p>
              
              <div className="flex gap-3">
                <Button
                  onClick={() => setShowRecalculateModal(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleRecalculateFromModal}
                  disabled={loading}
                  className="flex-1 bg-[#1C8FA0] hover:bg-[#1C8FA0]/90 text-white"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Calculando...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Recalcular
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#1a1a1a] dark:text-white font-['Inter_Tight']">
            Simulador de Futuro
          </h1>
          <p className="text-[#6E6E73] dark:text-gray-400 mt-1">
            Descubre cómo estará tu vida financiera en el futuro
          </p>
        </div>
        <Button
          onClick={handleRefresh}
          disabled={loading}
          variant="outline"
          className="flex items-center gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Recalcular
        </Button>
      </div>

      {/* Selector de Horizonte */}
      <div className="bg-white dark:bg-[#1a1a1a] rounded-[22px] border border-gray-100 dark:border-white/5 p-4">
        <div className="flex items-center gap-2 mb-3">
          <Icon component={Calendar} size="md" color="primary" />
          <h3 className="font-semibold text-[#1a1a1a] dark:text-white">
            Horizonte Temporal
          </h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {HORIZON_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => setHorizonMonths(option.value)}
              disabled={loading}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                horizonMonths === option.value
                  ? 'bg-[#1C8FA0] text-white shadow-md'
                  : 'bg-gray-100 dark:bg-white/5 text-[#6E6E73] dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Estado de carga */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Icon component={Loader2} size="xl" color="primary" className="animate-spin" />
        </div>
      )}

      {/* Error - Solo mostrar si hay error y no hay datos en caché */}
      {error && (!scenarios || scenarios.length === 0) && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-[22px] p-6">
          <div className="flex items-start gap-3">
            <Icon component={AlertCircle} size="md" color="warning" className="dark: shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-yellow-900 dark:text-yellow-100 mb-1">
                Simulador temporalmente no disponible
              </p>
              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                {error}
              </p>
              <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-2">
                Si tienes datos guardados previamente, se mostrarán automáticamente.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Advertencia si hay datos en caché pero hay error */}
      {error && scenarios && scenarios.length > 0 && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-[22px] p-4">
          <div className="flex items-start gap-3">
            <Icon component={AlertCircle} size="md" color="default" className="dark: shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-blue-900 dark:text-blue-100">
                Mostrando datos guardados. El simulador no está disponible para recalcular en este momento.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Escenarios */}
      {!loading && !error && scenarios && scenarios.length > 0 && (
        <>
          {/* Métricas Actuales */}
          {currentMetrics && (
            <div className="bg-white dark:bg-[#1a1a1a] rounded-[22px] border border-gray-100 dark:border-white/5 p-6 mb-4">
              <h3 className="font-semibold text-[#1a1a1a] dark:text-white mb-4">
                Tu Situación Actual
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-[#6E6E73] dark:text-gray-400 mb-1">
                    Ingresos Mensuales
                  </p>
                  <p className="text-lg font-bold text-[#1a1a1a] dark:text-white">
                    {formatCurrency(currentMetrics.current_monthly_income, currency)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[#6E6E73] dark:text-gray-400 mb-1">
                    Gastos Mensuales
                  </p>
                  <p className="text-lg font-bold text-[#1a1a1a] dark:text-white">
                    {formatCurrency(currentMetrics.current_monthly_expenses, currency)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[#6E6E73] dark:text-gray-400 mb-1">
                    Ahorros Actuales
                  </p>
                  <p className="text-lg font-bold text-green-600 dark:text-green-400">
                    {formatCurrency(currentMetrics.current_savings, currency)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[#6E6E73] dark:text-gray-400 mb-1">
                    Tasa de Ahorro
                  </p>
                  <p className="text-lg font-bold text-[#1a1a1a] dark:text-white">
                    {currentMetrics.avg_savings_rate.toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Cards de Escenarios */}
          <div className="grid md:grid-cols-3 gap-4 md:gap-6 -mt-2">
            {scenarios.map((scenario, index) => {
              const config = SCENARIO_CONFIG[scenario.scenario_type];
              if (!config) return null;

              return (
                <ScenarioCard
                  key={scenario.scenario_type}
                  scenario={scenario}
                  config={config}
                  currency={currency}
                  delay={index * 0.1}
                />
              );
            })}
          </div>
        </>
      )}

      {/* Sin datos */}
      {!loading && !error && (!scenarios || scenarios.length === 0) && (
        <div className="bg-white dark:bg-[#1a1a1a] rounded-[22px] border border-gray-100 dark:border-white/5 p-12 text-center">
          <Icon component={Target} size="md" color="default" className="dark: mx-auto mb-4" />
          <h3 className="text-xl font-bold text-[#1a1a1a] dark:text-white mb-2">
            No hay datos suficientes
          </h3>
          <p className="text-[#6E6E73] dark:text-gray-400 mb-6">
            Necesitas al menos 3 meses de transacciones para calcular escenarios futuros
          </p>
          <Button onClick={handleRefresh} disabled={loading}>
            {loading ? 'Calculando...' : 'Calcular Escenarios'}
          </Button>
        </div>
      )}
    </div>
  );
}

