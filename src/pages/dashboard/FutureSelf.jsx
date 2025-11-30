// ============================================================================
// FUTURE SELF VIEW - Componente Principal
// ============================================================================
// Muestra simulaciones financieras futuras del usuario
// ============================================================================

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
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
} from 'lucide-react';
import { useFutureSelf } from '@/hooks/useFutureSelf';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useUserCurrency } from '@/hooks/useUserCurrency';

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
  // Obtener el valor del patrimonio neto de la estructura correcta
  const netWorth = scenario.projection?.projected_net_worth ?? scenario.projected_net_worth ?? 0;
  const isPositive = netWorth >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className={`${config.bgColor} rounded-[22px] border-2 ${config.borderColor} p-6 shadow-sm`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
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
      <div className="mb-4">
        <p className="text-xs font-medium text-[#6E6E73] dark:text-gray-400 mb-1">
          Patrimonio Neto Proyectado
        </p>
        <p
          className={`text-3xl font-bold font-['Inter_Tight'] ${
            isPositive
              ? 'text-green-600 dark:text-green-400'
              : 'text-red-600 dark:text-red-400'
          }`}
        >
          {formatCurrency(scenario.projection?.projected_net_worth ?? scenario.projected_net_worth, currency)}
        </p>
      </div>

      {/* Métricas */}
      <div className="space-y-2 mb-4">
        <div className="flex justify-between text-sm">
          <span className="text-[#6E6E73] dark:text-gray-400">Ahorros proyectados</span>
          <span className="font-medium text-[#1a1a1a] dark:text-white">
            {formatCurrency(scenario.projection?.projected_savings ?? scenario.projected_savings, currency)}
          </span>
        </div>
        {((scenario.projection?.projected_debt ?? scenario.projected_debt ?? 0) > 0) && (
          <div className="flex justify-between text-sm">
            <span className="text-[#6E6E73] dark:text-gray-400">Deuda proyectada</span>
            <span className="font-medium text-red-600 dark:text-red-400">
              {formatCurrency(scenario.projection?.projected_debt ?? scenario.projected_debt, currency)}
            </span>
          </div>
        )}
      </div>

      {/* Resumen generado por IA */}
      {scenario.summary_text && (
        <div className="bg-white/50 dark:bg-black/20 rounded-xl p-4 mb-4">
          <div className="flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-[#1C8FA0] mt-0.5 flex-shrink-0" />
            <p className="text-sm text-[#1a1a1a] dark:text-white leading-relaxed">
              {scenario.summary_text}
            </p>
          </div>
        </div>
      )}

      {/* Acciones sugeridas */}
      {scenario.suggested_actions && scenario.suggested_actions.length > 0 ? (
        <div className="space-y-2">
          <p className="text-xs font-bold text-[#6E6E73] dark:text-gray-400 uppercase tracking-wider">
            Recomendaciones Personalizadas
          </p>
          {scenario.suggested_actions.slice(0, 3).map((action, idx) => (
            <div
              key={idx}
              className="flex items-start gap-2 bg-white/30 dark:bg-black/10 rounded-lg p-2"
            >
              <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-xs font-medium text-[#1a1a1a] dark:text-white">
                  {action.description}
                </p>
                {action.impact && action.impact > 0 && (
                  <p className="text-xs text-green-600 dark:text-green-400">
                    Ahorro estimado: {formatCurrency(action.impact, currency)}/mes
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        scenario.scenario_type === 'improved' && (
          <div className="space-y-2">
            <p className="text-xs font-bold text-[#6E6E73] dark:text-gray-400 uppercase tracking-wider">
              Recomendaciones Personalizadas
            </p>
            <div className="bg-white/30 dark:bg-black/10 rounded-lg p-3">
              <p className="text-xs text-[#6E6E73] dark:text-gray-400 italic">
                Tus finanzas están equilibradas. No se detectaron oportunidades claras de reducción en este período. Agrega más transacciones para recibir recomendaciones personalizadas basadas en tus gastos reales.
              </p>
            </div>
          </div>
        )
      )}
    </motion.div>
  );
};

// ============================================================================
// HELPER: Formatear moneda
// ============================================================================
function formatCurrency(amount, currency = 'CLP') {
  // Validar que amount sea un número válido
  if (amount === null || amount === undefined || isNaN(amount)) {
    return '$0';
  }

  const numAmount = Number(amount);
  
  if (isNaN(numAmount)) {
    return '$0';
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
  const location = useLocation();
  // Obtener horizonte desde el estado de navegación si existe
  const initialHorizon = location.state?.horizon || 12;
  const [horizonMonths, setHorizonMonths] = useState(initialHorizon);
  const { scenarios, currentMetrics, loading, error, refresh } = useFutureSelf(horizonMonths);
  
  // Actualizar horizonte si viene desde navegación
  useEffect(() => {
    if (location.state?.horizon && location.state.horizon !== horizonMonths) {
      setHorizonMonths(location.state.horizon);
    }
  }, [location.state, horizonMonths]);
  const { currency } = useUserCurrency();
  const { toast } = useToast();

  const handleRefresh = async () => {
    // Limpiar cache y forzar recálculo con datos reales
    toast({
      title: 'Recalculando escenarios',
      description: 'Analizando tus transacciones reales para generar consejos personalizados...',
    });
    
    await refresh();
    
    toast({
      title: 'Escenarios actualizados',
      description: 'Se han recalculado los escenarios con tus datos reales. Los consejos son 100% personalizados.',
    });
  };

  return (
    <div className="space-y-6 pb-12">
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
          <Calendar className="w-5 h-5 text-[#1C8FA0]" />
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
          <Loader2 className="w-8 h-8 text-[#1C8FA0] animate-spin" />
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-[22px] p-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-amber-800 dark:text-amber-200 font-medium mb-1">
                {error}
              </p>
              <p className="text-sm text-amber-700 dark:text-amber-300">
                Puedes intentar recalculando más tarde o contactar al soporte si el problema persiste.
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
            <div className="bg-white dark:bg-[#1a1a1a] rounded-[22px] border border-gray-100 dark:border-white/5 p-6">
              <h3 className="font-semibold text-[#1a1a1a] dark:text-white mb-4">
                Tu Situación Actual
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-[#6E6E73] dark:text-gray-400 mb-1">
                    Ingresos Mensuales
                  </p>
                  <p className="text-lg font-bold text-[#1a1a1a] dark:text-white">
                    {formatCurrency(currentMetrics?.current_monthly_income ?? 0, currency)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[#6E6E73] dark:text-gray-400 mb-1">
                    Gastos Mensuales
                  </p>
                  <p className="text-lg font-bold text-[#1a1a1a] dark:text-white">
                    {formatCurrency(currentMetrics?.current_monthly_expenses ?? 0, currency)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[#6E6E73] dark:text-gray-400 mb-1">
                    Ahorros Actuales
                  </p>
                  <p className="text-lg font-bold text-green-600 dark:text-green-400">
                    {formatCurrency(currentMetrics?.current_savings ?? 0, currency)}
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
          <div className="grid md:grid-cols-3 gap-6">
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
          <Target className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
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

