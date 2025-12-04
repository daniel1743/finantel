import React, { useState, useEffect } from 'react';
import Icon from '@/components/ui/Icon';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Calendar,
  Target,
  TrendingUp,
  DollarSign,
  CheckCircle2,
  X,
  AlertTriangle,
  Loader2,
  ArrowRight,
  RefreshCw,
  Lightbulb,
  Clock,
  Zap,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useAIPlanner } from '@/hooks/useAIPlanner';
import { useToast } from '@/components/ui/use-toast';

const AIPlanner = () => {
  const {
    loading,
    plans,
    upcomingEvents,
    analysis,
    detectEvents,
    createPlan,
    trackPlan,
    recalculatePlan,
    updateSuggestion,
    updateSavedAmount,
  } = useAIPlanner();

  const { toast } = useToast();
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showProposal, setShowProposal] = useState(false);
  const [proposal, setProposal] = useState(null);

  // Formatear fecha
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-CL', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  // Formatear moneda
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Calcular porcentaje de progreso
  const calculateProgress = (plan) => {
    if (!plan || plan.goal_amount === 0) return 0;
    return Math.min(100, Math.round((plan.saved_amount / plan.goal_amount) * 100));
  };

  // Manejar creación de plan
  const handleCreatePlan = async (event) => {
    setSelectedEvent(event);
    setShowProposal(true);
    // Aquí se generaría la propuesta, por ahora usamos datos mock
    // En producción, esto vendría de la Edge Function
  };

  // Componente: Tarjeta de evento próximo
  const EventCard = ({ event }) => {
    const daysUntil = event.days_until || 0;
    const hasPlan = event.has_active_plan;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-[#1a1a1a] rounded-[22px] p-6 border border-gray-100 dark:border-white/5 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.08)] hover:shadow-[0_25px_50px_-12px_rgba(28,143,160,0.15)] transition-all duration-300"
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-[#1a1a1a] dark:text-white mb-1">
              {event.event_name || event.name}
            </h3>
            <p className="text-sm text-[#6E6E73] dark:text-gray-400">
              {formatDate(event.event_date || event.date)}
            </p>
          </div>
          <div className={cn(
            "px-3 py-1 rounded-full text-xs font-semibold",
            hasPlan
              ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
              : "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
          )}>
            {hasPlan ? 'Con plan' : 'Sin plan'}
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm text-[#6E6E73] dark:text-gray-400 mb-4">
          <Icon component={Clock} size="sm" color="default" />
          <span>
            {daysUntil === 0
              ? 'Hoy'
              : daysUntil === 1
              ? 'Mañana'
              : `Faltan ${daysUntil} días`}
          </span>
        </div>

        {!hasPlan && (
          <Button
            onClick={() => handleCreatePlan(event)}
            className="w-full bg-gradient-to-r from-[#1C8FA0] to-[#167a8a] hover:from-[#167a8a] hover:to-[#0d5a66] text-white"
          >
            <Icon component={Sparkles} size="sm" color="default" className="mr-2" />
            Crear plan de ahorro
          </Button>
        )}
      </motion.div>
    );
  };

  // Componente: Tarjeta de plan activo
  const PlanCard = ({ plan }) => {
    const progress = calculateProgress(plan);
    const event = plan.seasonal_events;
    const suggestions = plan.ai_suggestions || [];
    const evaluation = plan.evaluation;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-[#1a1a1a] rounded-[22px] p-6 border border-gray-100 dark:border-white/5 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.08)] hover:shadow-[0_25px_50px_-12px_rgba(28,143,160,0.15)] transition-all duration-300"
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Icon component={Target} size="md" color="primary" />
              <h3 className="text-xl font-bold text-[#1a1a1a] dark:text-white">
                {event?.name || 'Plan de ahorro'}
              </h3>
            </div>
            <p className="text-sm text-[#6E6E73] dark:text-gray-400">
              Meta: {formatCurrency(plan.goal_amount)} • Fecha: {formatDate(plan.target_date)}
            </p>
          </div>
          <div className={cn(
            "px-3 py-1 rounded-full text-xs font-semibold",
            plan.status === 'active'
              ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
              : plan.status === 'completed'
              ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
              : "bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-400"
          )}>
            {plan.status === 'active' ? 'Activo' : plan.status === 'completed' ? 'Completado' : 'Pausado'}
          </div>
        </div>

        {/* Progreso */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-semibold text-[#1a1a1a] dark:text-white">
              Progreso
            </span>
            <span className="text-sm font-bold text-[#1C8FA0]">
              {progress}%
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-white/10 rounded-full h-3 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
              className="h-full bg-gradient-to-r from-[#1C8FA0] to-[#167a8a] rounded-full"
            />
          </div>
          <div className="flex justify-between items-center mt-2 text-xs text-[#6E6E73] dark:text-gray-400">
            <span>Ahorrado: {formatCurrency(plan.saved_amount)}</span>
            <span>Meta: {formatCurrency(plan.goal_amount)}</span>
          </div>
        </div>

        {/* Evaluación si existe */}
        {evaluation && (
          <div className={cn(
            "mb-6 p-4 rounded-xl border",
            evaluation.is_on_track
              ? "bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-900/30"
              : evaluation.needs_recalculation
              ? "bg-yellow-50 dark:bg-yellow-900/10 border-yellow-200 dark:border-yellow-900/30"
              : "bg-gray-50 dark:bg-gray-900/10 border-gray-200 dark:border-gray-900/30"
          )}>
            <div className="flex items-start gap-3">
              {evaluation.is_on_track ? (
                <Icon component={CheckCircle2} size="md" color="success" className="dark: mt-0.5" />
              ) : evaluation.needs_recalculation ? (
                <Icon component={AlertTriangle} size="md" color="warning" className="dark: mt-0.5" />
              ) : (
                <Icon component={Clock} size="md" color="muted" className="dark: mt-0.5" />
              )}
              <div className="flex-1">
                <p className="text-sm font-semibold text-[#1a1a1a] dark:text-white mb-1">
                  {evaluation.is_on_track
                    ? '¡Vas por buen camino!'
                    : evaluation.needs_recalculation
                    ? 'El plan necesita ajustes'
                    : 'Seguimiento en curso'}
                </p>
                <p className="text-xs text-[#6E6E73] dark:text-gray-400">
                  {evaluation.is_on_track
                    ? `Has ahorrado ${formatCurrency(evaluation.actual_savings)} de ${formatCurrency(evaluation.expected_savings)} esperados.`
                    : evaluation.needs_recalculation
                    ? `Desviación del ${Math.abs(evaluation.deviation_percentage).toFixed(1)}%. Considera recalcular.`
                    : 'Continúa siguiendo las sugerencias.'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Sugerencias */}
        {suggestions.length > 0 && (
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-[#1a1a1a] dark:text-white mb-3 flex items-center gap-2">
              <Icon component={Lightbulb} size="sm" color="primary" />
              Sugerencias de ahorro
            </h4>
            <div className="space-y-2">
              {suggestions.map((suggestion) => (
                <div
                  key={suggestion.id}
                  className="flex items-start justify-between p-3 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-100 dark:border-white/5"
                >
                  <div className="flex-1">
                    <p className="text-sm text-[#1a1a1a] dark:text-white mb-1">
                      {suggestion.description}
                    </p>
                    <p className="text-xs text-[#1C8FA0] font-semibold">
                      Ahorro estimado: {formatCurrency(suggestion.estimated_saving)}
                    </p>
                  </div>
                  {suggestion.accepted === null && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateSuggestion(suggestion.id, true)}
                        className="h-8 px-3"
                      >
                        <Icon component={CheckCircle2} size="sm" color="default" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateSuggestion(suggestion.id, false)}
                        className="h-8 px-3"
                      >
                        <Icon component={X} size="sm" color="default" />
                      </Button>
                    </div>
                  )}
                  {suggestion.accepted === true && (
                    <div className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-xs font-semibold">
                      Aceptada
                    </div>
                  )}
                  {suggestion.accepted === false && (
                    <div className="px-2 py-1 bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-400 rounded-full text-xs font-semibold">
                      Rechazada
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Acciones */}
        <div className="flex gap-2">
          {evaluation?.needs_recalculation && (
            <Button
              variant="outline"
              onClick={() => recalculatePlan(plan.id)}
              className="flex-1"
            >
              <Icon component={RefreshCw} size="sm" color="default" className="mr-2" />
              Recalcular plan
            </Button>
          )}
          <Button
            variant="outline"
            onClick={() => trackPlan(plan.id)}
            className="flex-1"
          >
            <Icon component={Zap} size="sm" color="default" className="mr-2" />
            Actualizar seguimiento
          </Button>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-[#1a1a1a] dark:text-white font-['Inter_Tight'] flex items-center gap-3">
            <Icon component={Sparkles} size="xl" color="primary" />
            Planificador IA Proactivo
          </h1>
          <p className="text-[#6E6E73] dark:text-gray-400 mt-1 text-lg">
            Anticipa eventos y crea planes de ahorro inteligentes
          </p>
        </div>
        <Button
          onClick={() => detectEvents(30)}
          variant="outline"
          disabled={loading}
        >
          {loading ? (
            <Icon component={Loader2} size="sm" color="default" className="mr-2 animate-spin" />
          ) : (
            <Icon component={RefreshCw} size="sm" color="default" className="mr-2" />
          )}
          Actualizar eventos
        </Button>
      </div>

      {/* Análisis de gastos (si está disponible) */}
      {analysis && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-[#1C8FA0] to-[#167a8a] rounded-[26px] p-6 text-white shadow-xl shadow-[#1C8FA0]/20"
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <Icon component={TrendingUp} size="lg" color="default" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold mb-2">Análisis de tus gastos</h3>
              <p className="text-sm text-white/90 mb-4">
                Hemos analizado tus últimos {analysis.months_analyzed} meses y encontrado oportunidades de ahorro.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-white/70 mb-1">Servicios recurrentes</p>
                  <p className="text-lg font-bold">
                    {analysis.recurring_services?.length || 0}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-white/70 mb-1">Gastos impulsivos</p>
                  <p className="text-lg font-bold">
                    {analysis.impulsive_expenses?.length || 0}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-white/70 mb-1">Oportunidades</p>
                  <p className="text-lg font-bold">
                    {analysis.saving_opportunities?.length || 0}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-white/70 mb-1">Compras grandes</p>
                  <p className="text-lg font-bold">
                    {analysis.unnecessary_purchases?.length || 0}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Planes activos */}
      {plans && plans.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-[#1a1a1a] dark:text-white mb-6">
            Tus planes activos
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {plans.map((plan) => (
              <PlanCard key={plan.id} plan={plan} />
            ))}
          </div>
        </div>
      )}

      {/* Eventos próximos */}
      {upcomingEvents && upcomingEvents.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-[#1a1a1a] dark:text-white mb-6">
            Eventos próximos
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingEvents
              .filter((event) => !event.has_active_plan)
              .map((event, index) => (
                <EventCard key={event.event_id || index} event={event} />
              ))}
          </div>
        </div>
      )}

      {/* Estado vacío */}
      {(!plans || plans.length === 0) && (!upcomingEvents || upcomingEvents.length === 0) && !loading && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12"
        >
          <Icon component={Sparkles} size="md" color="primary" className="mx-auto mb-4 opacity-50" />
          <h3 className="text-xl font-bold text-[#1a1a1a] dark:text-white mb-2">
            No hay planes activos
          </h3>
          <p className="text-[#6E6E73] dark:text-gray-400 mb-6">
            La IA detectará eventos próximos y te sugerirá planes de ahorro automáticamente.
          </p>
        </motion.div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Icon component={Loader2} size="xl" color="primary" className="animate-spin" />
        </div>
      )}
    </div>
  );
};

export default AIPlanner;

