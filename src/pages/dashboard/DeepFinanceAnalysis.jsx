// =====================================================
// PÁGINA: DeepFinance Analysis Dashboard
// =====================================================
// Dashboard para visualizar análisis históricos de DeepFinance
// =====================================================

import React, { useState, useEffect } from 'react';
import Icon from '@/components/ui/Icon';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  BarChart3,
  Loader2,
  Zap,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useToast } from '@/components/ui/use-toast';
import { useDeepFinance } from '@/hooks/useDeepFinance';
import customSupabaseClient from '@/lib/customSupabaseClient';
import ScoreCard from '@/components/deepfinance/ScoreCard';
import LeakagesList from '@/components/deepfinance/LeakagesList';
import PatternsList from '@/components/deepfinance/PatternsList';
import AnalysisSummary from '@/components/deepfinance/AnalysisSummary';
import HistoricalChart from '@/components/deepfinance/HistoricalChart';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const DeepFinanceAnalysis = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { runAnalysis, loading: analysisLoading } = useDeepFinance(user?.id);

  const [currentAnalysis, setCurrentAnalysis] = useState(null);
  const [historicalAnalyses, setHistoricalAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [runningNewAnalysis, setRunningNewAnalysis] = useState(false);

  // Verificar autenticación
  useEffect(() => {
    if (!user) {
      navigate('/auth?redirect=/dashboard/deepfinance');
    }
  }, [user, navigate]);

  // Cargar análisis actual e histórico
  useEffect(() => {
    if (user?.id) {
      loadAnalyses();
    }
  }, [user?.id]);

  const loadAnalyses = async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      // Cargar análisis más reciente
      const { data: latest, error: latestError } = await customSupabaseClient
        .from('deepfinance_analyses')
        .select('*')
        .eq('user_id', user.id)
        .order('analysis_date', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (latestError && latestError.code !== 'PGRST116') {
        throw latestError;
      }

      // Cargar histórico (últimos 10 análisis para el gráfico)
      const { data: history, error: historyError } = await customSupabaseClient
        .from('deepfinance_analyses')
        .select('id, analysis_date, score, total_transactions, summary')
        .eq('user_id', user.id)
        .order('analysis_date', { ascending: false })
        .limit(10);

      if (historyError) {
        throw historyError;
      }

      setCurrentAnalysis(latest);
      setHistoricalAnalyses(history || []);
    } catch (error) {
      console.error('[DeepFinanceAnalysis] Error loading analyses:', error);
      toast({
        variant: 'destructive',
        title: 'Error al cargar análisis',
        description: 'No se pudieron cargar los análisis. Intenta nuevamente.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRunNewAnalysis = async () => {
    if (!user?.id) return;

    setRunningNewAnalysis(true);
    try {
      await runAnalysis('90days');
      // Recargar datos después del análisis
      await loadAnalyses();
      toast({
        title: 'Análisis completado',
        description: 'El nuevo análisis se ha generado correctamente.',
      });
    } catch (error) {
      console.error('[DeepFinanceAnalysis] Error running analysis:', error);
      toast({
        variant: 'destructive',
        title: 'Error al ejecutar análisis',
        description: error.message || 'No se pudo completar el análisis.',
      });
    } finally {
      setRunningNewAnalysis(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Icon component={Loader2} size="xl" color="primary" className="animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row lg:items-center justify-between gap-6"
      >
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-xl bg-gradient-to-br from-[#1C8FA0]/10 to-purple-500/10 border border-[#1C8FA0]/20">
              <Icon component={BarChart3} size="lg" color="primary" />
            </div>
            <h1 className="text-3xl font-bold text-[#1a1a1a] dark:text-white font-['Inter_Tight']">
              DeepFinance Analysis Dashboard
            </h1>
          </div>
          <p className="text-[#6E6E73] dark:text-gray-400">
            Visualiza y analiza tus evaluaciones financieras históricas
          </p>
        </div>

        <div className="flex gap-3">
          <Button
            onClick={loadAnalyses}
            variant="outline"
            className="gap-2"
            disabled={loading}
          >
            <RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} />
            Actualizar
          </Button>
          <Button
            onClick={handleRunNewAnalysis}
            disabled={runningNewAnalysis || analysisLoading}
            className="bg-[#1C8FA0] hover:bg-[#167a8a] text-white gap-2"
          >
            {runningNewAnalysis || analysisLoading ? (
              <>
                <Icon component={Loader2} size="sm" color="default" className="animate-spin" />
                Ejecutando...
              </>
            ) : (
              <>
                <Icon component={Zap} size="sm" color="default" />
                Ejecutar nuevo análisis
              </>
            )}
          </Button>
        </div>
      </motion.div>

      {/* Sin análisis */}
      {!currentAnalysis && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-[#1a1a1a] rounded-2xl border-2 border-gray-200 dark:border-white/10 p-12 text-center"
        >
          <div className="inline-flex p-4 rounded-2xl bg-[#1C8FA0]/10 border border-[#1C8FA0]/20 mb-6">
            <Icon component={BarChart3} size="md" color="primary" />
          </div>
          <h2 className="text-2xl font-bold text-[#1a1a1a] dark:text-white mb-3">
            No hay análisis disponibles
          </h2>
          <p className="text-[#6E6E73] dark:text-gray-400 mb-6 max-w-md mx-auto">
            Ejecuta tu primer análisis de DeepFinance para comenzar a visualizar tus evaluaciones financieras.
          </p>
          <Button
            onClick={handleRunNewAnalysis}
            disabled={runningNewAnalysis || analysisLoading}
            className="bg-[#1C8FA0] hover:bg-[#167a8a] text-white gap-2"
          >
            {runningNewAnalysis || analysisLoading ? (
              <>
                <Icon component={Loader2} size="sm" color="default" className="animate-spin" />
                Ejecutando análisis...
              </>
            ) : (
              <>
                <Icon component={Zap} size="sm" color="default" />
                Ejecutar primer análisis
              </>
            )}
          </Button>
        </motion.div>
      )}

      {/* Con análisis */}
      {currentAnalysis && (
        <div className="space-y-6">
          {/* Score Card Principal */}
          <ScoreCard
            score={currentAnalysis.score}
            analysisDate={currentAnalysis.analysis_date}
            periodStart={currentAnalysis.period_start}
            periodEnd={currentAnalysis.period_end}
            totalTransactions={currentAnalysis.total_transactions}
          />

          {/* Grid de información */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Fugas de dinero */}
            <LeakagesList leakages={currentAnalysis.leakages} />

            {/* Patrones */}
            <PatternsList patterns={currentAnalysis.patterns} />
          </div>

          {/* Resumen del análisis */}
          <AnalysisSummary
            summary={currentAnalysis.summary}
            insights={currentAnalysis.metadata?.insights || currentAnalysis.metadata?.ai_insights}
          />

          {/* Gráfico histórico */}
          {historicalAnalyses.length > 0 && (
            <HistoricalChart analyses={historicalAnalyses} />
          )}

          {/* Información adicional */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-[#1a1a1a] rounded-2xl border-2 border-gray-200 dark:border-white/10 p-6 shadow-lg"
          >
            <div className="flex items-start gap-3">
              <Icon component={AlertCircle} size="md" color="primary" className="mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-[#1a1a1a] dark:text-white mb-2">
                  Información del análisis
                </h3>
                <div className="grid md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-[#6E6E73] dark:text-gray-400 mb-1">Período analizado</p>
                    <p className="font-medium text-[#1a1a1a] dark:text-white">
                      {currentAnalysis.period_days || 'N/A'} días
                    </p>
                  </div>
                  <div>
                    <p className="text-[#6E6E73] dark:text-gray-400 mb-1">Total de transacciones</p>
                    <p className="font-medium text-[#1a1a1a] dark:text-white">
                      {currentAnalysis.total_transactions?.toLocaleString('es-ES') || '0'}
                    </p>
                  </div>
                  <div>
                    <p className="text-[#6E6E73] dark:text-gray-400 mb-1">Nivel de riesgo</p>
                    <p className="font-medium text-[#1a1a1a] dark:text-white capitalize">
                      {currentAnalysis.risk_level || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default DeepFinanceAnalysis;

