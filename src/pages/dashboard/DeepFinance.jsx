// =====================================================
// PÁGINA: DeepFinance - Análisis Premium
// =====================================================
// Motor Inteligente de Evaluación Financiera
// =====================================================

import React, { useState, useEffect } from 'react';
import Icon from '@/components/ui/Icon';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Zap,
  TrendingUp,
  AlertCircle,
  Loader2,
  ShieldCheck,
  CreditCard,
  BarChart3,
  FileText,
  CheckCircle2,
  X,
  Clock,
  Info,
} from 'lucide-react';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useDeepFinance } from '@/hooks/useDeepFinance';
import { useDeepFinanceCredits } from '@/hooks/useDeepFinanceCredits';
import { useMercadoPagoCallback } from '@/hooks/useMercadoPagoCallback';
import { useToast } from '@/components/ui/use-toast';
import { useToolTracking } from '@/hooks/useToolTracking';
import ScoreDisplay from '@/components/deepfinance/ScoreDisplay';
import PatternCard from '@/components/deepfinance/PatternCard';
import LeakageCard from '@/components/deepfinance/LeakageCard';
import EmotionalCard from '@/components/deepfinance/EmotionalCard';
import RiskCard from '@/components/deepfinance/RiskCard';
import SavingsProjection from '@/components/deepfinance/SavingsProjection';
import RecommendationsCard from '@/components/deepfinance/RecommendationsCard';
import ReportModal from '@/components/deepfinance/ReportModal';
import CreditPurchaseModal from '@/components/deepfinance/CreditPurchaseModal';
import { cn } from '@/lib/utils';

const DeepFinance = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { analysis, loading, error, runAnalysis, getLastAnalysis } = useDeepFinance(user?.id);
  const { credits, loading: creditsLoading, canAnalyze, reason, fetchCredits } = useDeepFinanceCredits(user?.id);
  
  // Manejar callback de Mercado Pago
  useMercadoPagoCallback();

  // Escuchar actualizaciones de créditos
  useEffect(() => {
    const handleCreditsUpdate = () => {
      fetchCredits();
    };
    window.addEventListener('deepfinance-credits-updated', handleCreditsUpdate);
    return () => window.removeEventListener('deepfinance-credits-updated', handleCreditsUpdate);
  }, [fetchCredits]);
  
  const [showCreditsModal, setShowCreditsModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [analysisPeriod, setAnalysisPeriod] = useState('90days');

  // Cargar último análisis al montar
  useEffect(() => {
    if (user?.id) {
      getLastAnalysis();
      fetchCredits();
    }
  }, [user?.id, getLastAnalysis, fetchCredits]);

  // Manejar ejecución de análisis
  const handleRunAnalysis = async () => {
    // Verificar créditos
    if (!canAnalyze) {
      setShowCreditsModal(true);
      return;
    }

    try {
      await runAnalysis(analysisPeriod);
      // Recargar créditos después del análisis
      await fetchCredits();
      toast({
        title: 'Análisis completado',
        description: 'Tu análisis financiero está listo',
      });
    } catch (error) {
      console.error('[DeepFinance] Error:', error);
      // El error ya se maneja en el hook
    }
  };

  // Obtener datos del análisis
  const currentScore = analysis?.score || analysis?.summary?.score || null;
  const patterns = analysis?.patterns || [];
  const leakages = analysis?.leakages || analysis?.leakage_analysis || [];
  const emotional = analysis?.emotional_analysis || analysis?.emotional || {};
  const risk = {
    level: analysis?.risk_level || analysis?.risk?.level || 'medium',
    factors: analysis?.risk_factors || analysis?.risk?.factors || [],
    score: analysis?.risk_score || analysis?.risk?.score || 0,
  };
  const savingsProjections = analysis?.savings_potential || analysis?.savingsProjections || {};
  const recommendations = analysis?.recommendations || [];
  const aiInsights = analysis?.ai_insights || analysis?.aiInsights || null;

  return (
    <div className="space-y-6 md:space-y-8 pb-12 h-full flex flex-col px-4 md:px-0">
      {/* Header Premium */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 md:gap-6"
      >
        <div className="flex-1">
          <div className="flex items-center gap-2 md:gap-3 mb-2">
            <div className="p-1.5 md:p-2 rounded-xl bg-gradient-to-br from-[#1C8FA0]/10 to-purple-500/10 border border-[#1C8FA0]/20">
              <Icon component={Sparkles} size="md" color="primary" className="md:w-6 md:h-6" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-[#1a1a1a] dark:text-white font-['Inter_Tight']">
              DeepFinance™
            </h1>
          </div>
          <p className="text-[#6E6E73] dark:text-gray-400 text-base md:text-lg">
            Motor Avanzado de Evaluación Financiera
          </p>
          <p className="text-xs md:text-sm text-[#6E6E73] dark:text-gray-400 mt-1">
            Análisis exhaustivo, profesional y accionable de tu situación financiera
          </p>
        </div>

        {/* Estado de créditos */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 md:gap-4 w-full sm:w-auto">
          {creditsLoading ? (
            <div className="flex justify-center sm:justify-start">
              <Icon component={Loader2} size="md" color="default" className="animate-spin" />
            </div>
          ) : (
            <>
              <div className="px-3 md:px-4 py-2 rounded-xl bg-white dark:bg-[#1a1a2e] border border-gray-200 dark:border-[#1C8FA0]/20 flex-1 sm:flex-none">
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <Icon component={Zap} size="sm" color="primary" />
                  <span className="text-sm font-medium text-[#1a1a1a] dark:text-white">
                    {credits?.credits_remaining || 0} créditos
                  </span>
                </div>
                {(credits?.free_analyses_used || 0) < 4 && (
                  <div className="text-xs text-[#6E6E73] dark:text-gray-400 mt-1 text-center sm:text-left">
                    {4 - (credits?.free_analyses_used || 0)} análisis gratis restantes este mes
                  </div>
                )}
              </div>
              <button
                onClick={() => setShowCreditsModal(true)}
                className="px-4 py-2 rounded-xl bg-[#1C8FA0] text-white text-sm font-medium hover:bg-[#1C8FA0]/90 transition-colors flex items-center justify-center gap-2 w-full sm:w-auto"
              >
                <Icon component={CreditCard} size="sm" color="default" />
                <span className="hidden sm:inline">Comprar créditos</span>
                <span className="sm:hidden">Comprar</span>
              </button>
            </>
          )}
        </div>
      </motion.div>

      {/* Alerta si no puede analizar */}
      {!creditsLoading && !canAnalyze && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-xl bg-orange-500/10 border-2 border-orange-500/20 flex items-start gap-3"
        >
          <Icon component={AlertCircle} size="md" color="default" className="dark: mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-orange-600 dark:text-orange-400">
              Límite alcanzado
            </p>
            <p className="text-xs text-orange-700 dark:text-orange-300 mt-1">
              {reason || 'Ya realizaste tu evaluación de esta semana. DeepFinance™ requiere muchísimo procesamiento y solo puedes usarlo 1 vez por semana. Para usarlo nuevamente hoy, debes tener un acceso Premium.'}
            </p>
          </div>
          <button
            onClick={() => setShowCreditsModal(true)}
            className="px-3 py-1.5 rounded-lg bg-orange-600 text-white text-xs font-medium hover:bg-orange-700 transition-colors"
          >
            Comprar créditos
          </button>
        </motion.div>
      )}

      {/* Panel de control de análisis */}
      {!analysis && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-[#0f1624] rounded-2xl border-2 border-gray-200 dark:border-[#1C8FA0]/30 p-4 md:p-6 lg:p-8 shadow-lg"
        >
          <div className="text-center space-y-6">
            <div className="inline-flex p-4 rounded-2xl bg-gradient-to-br from-[#1C8FA0]/10 to-purple-500/10 border border-[#1C8FA0]/20">
              <Icon component={BarChart3} size="md" color="primary" />
            </div>
            
            <div>
              <h2 className="text-2xl font-bold text-[#1a1a1a] dark:text-white mb-2">
                Análisis Premium - Motor Inteligente Finantel
              </h2>
              <p className="text-[#6E6E73] dark:text-gray-400 max-w-2xl mx-auto">
                Obtén un diagnóstico exhaustivo de tu situación financiera con análisis avanzados,
                detección de patrones, fugas financieras, gastos emocionales y recomendaciones personalizadas.
              </p>
            </div>

            {/* Selector de período */}
            <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-3">
              <span className="text-sm font-medium text-[#6E6E73] dark:text-gray-400 w-full sm:w-auto text-center sm:text-left">
                Período de análisis:
              </span>
              <div className="flex flex-wrap items-center justify-center gap-2 md:gap-3">
                {[
                  { value: '30days', label: '30 días' },
                  { value: '90days', label: '90 días' },
                  { value: '180days', label: '180 días' },
                  { value: 'all', label: 'Todo el historial' },
                ].map((period) => (
                  <button
                    key={period.value}
                    onClick={() => setAnalysisPeriod(period.value)}
                    className={cn(
                      'px-3 md:px-4 py-2 rounded-xl text-xs md:text-sm font-medium transition-all',
                      analysisPeriod === period.value
                        ? 'bg-[#1C8FA0] text-white shadow-lg'
                        : 'bg-gray-100 dark:bg-[#1a1a2e] text-[#1a1a1a] dark:text-white border border-gray-200 dark:border-[#1C8FA0]/20 hover:border-[#1C8FA0]/40'
                    )}
                  >
                    {period.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Botón de análisis */}
            <button
              onClick={handleRunAnalysis}
              disabled={loading || !canAnalyze || creditsLoading}
              className={cn(
                'px-8 py-4 rounded-xl text-lg font-semibold transition-all flex items-center gap-3 mx-auto',
                loading || !canAnalyze
                  ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-[#1C8FA0] to-purple-600 text-white hover:shadow-xl hover:scale-105'
              )}
            >
              {loading ? (
                <>
                  <Icon component={Loader2} size="md" color="default" className="animate-spin" />
                  Analizando tus finanzas...
                </>
              ) : (
                <>
                  <Icon component={Zap} size="md" color="default" />
                  Ejecutar Análisis Premium
                </>
              )}
            </button>

            {error && (
              <div className="p-4 rounded-xl bg-red-500/10 border-2 border-red-500/20 flex items-start gap-3 mt-4">
                <Icon component={AlertCircle} size="md" color="error" className="dark: mt-0.5" />
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium text-red-600 dark:text-red-400">
                    Error en el análisis
                  </p>
                  <p className="text-xs text-red-700 dark:text-red-300 mt-1">
                    {error}
                  </p>
                </div>
              </div>
            )}

            {/* Info adicional */}
            <div className="pt-6 border-t border-gray-200 dark:border-[#1C8FA0]/20">
              <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-[#6E6E73] dark:text-gray-400">
                <div className="flex items-center gap-2">
                  <Icon component={ShieldCheck} size="sm" color="default" />
                  <span>Análisis 100% privado</span>
                </div>
                <div className="flex items-center gap-2">
                  <Icon component={Clock} size="sm" color="default" />
                  <span>Toma 1-2 minutos</span>
                </div>
                <div className="flex items-center gap-2">
                  <Icon component={FileText} size="sm" color="default" />
                  <span>Reporte PDF incluido</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Resultados del análisis */}
      {analysis && (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Score Display */}
            <div className="bg-white dark:bg-[#0f1624] rounded-2xl border-2 border-gray-200 dark:border-[#1C8FA0]/30 p-4 md:p-6 lg:p-8 shadow-lg">
              <div className="flex items-center justify-center">
                <ScoreDisplay score={currentScore} size="large" />
              </div>
              
              {/* Fecha del análisis */}
              {analysis.analysis_date && (
                <div className="text-center mt-6">
                  <p className="text-xs text-[#6E6E73] dark:text-gray-400">
                    Análisis realizado el{' '}
                    {new Date(analysis.analysis_date).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              )}
            </div>

            {/* Grid de Cards de Análisis */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              {/* Pattern Card */}
              <PatternCard patterns={patterns} />
              
              {/* Risk Card */}
              <RiskCard risk={risk} />
              
              {/* Leakage Card */}
              <LeakageCard leakages={leakages} />
              
              {/* Emotional Card */}
              <EmotionalCard emotional={emotional} />
            </div>

            {/* Proyecciones de Ahorro */}
            {Object.keys(savingsProjections).length > 0 && (
              <SavingsProjection projections={savingsProjections} />
            )}

            {/* Recomendaciones */}
            <RecommendationsCard 
              recommendations={recommendations} 
              aiInsights={aiInsights}
            />

            {/* Botón para generar PDF */}
            {analysis && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-center mt-6"
              >
                <button
                  onClick={() => setShowReportModal(true)}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#1C8FA0] to-purple-600 text-white font-semibold hover:shadow-xl hover:scale-105 transition-all flex items-center gap-2"
                >
                  <Icon component={FileText} size="md" color="default" />
                  Generar Reporte PDF
                </button>
              </motion.div>
            )}

            {/* Botón para nuevo análisis */}
            <div className="flex justify-center">
              <button
                onClick={() => {
                  if (canAnalyze) {
                    handleRunAnalysis();
                  } else {
                    setShowCreditsModal(true);
                  }
                }}
                disabled={loading || !canAnalyze || creditsLoading}
                className={cn(
                  'px-6 py-3 rounded-xl text-sm font-medium transition-all flex items-center gap-2',
                  loading || !canAnalyze
                    ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
                    : 'bg-[#1C8FA0] text-white hover:bg-[#1C8FA0]/90'
                )}
              >
                {loading ? (
                  <>
                    <Icon component={Loader2} size="sm" color="default" className="animate-spin" />
                    Analizando...
                  </>
                ) : (
                  <>
                    <Icon component={BarChart3} size="sm" color="default" />
                    Realizar nuevo análisis
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      )}

      {/* Modal de reporte PDF */}
      <ReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        analysis={analysis}
        userName={user?.user_metadata?.full_name || user?.email || 'Usuario'}
        userEmail={user?.email || ''}
      />

      {/* Modal de créditos */}
      <CreditPurchaseModal
        isOpen={showCreditsModal}
        onClose={() => setShowCreditsModal(false)}
        userId={user?.id}
        currentCredits={credits?.credits_remaining || 0}
        onPurchaseSuccess={() => {
          fetchCredits();
          setShowCreditsModal(false);
          toast({
            title: 'Créditos acreditados',
            description: 'Tus créditos han sido acreditados exitosamente',
          });
        }}
      />
    </div>
  );
};

export default DeepFinance;

