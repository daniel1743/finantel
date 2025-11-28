// =====================================================
// HOOK: useDeepFinance
// =====================================================
// Hook principal para el DeepFinance Engine
// =====================================================

import { useState, useCallback } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { DeepFinanceEngine } from '@/lib/deepfinance/engine';
import { captureError } from '@/lib/sentry';

export const useDeepFinance = (userId) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState(null);

  /**
   * Ejecuta un análisis completo
   * @param {string} period - '30days', '90days', '180days', 'all'
   * @returns {Promise<Object>}
   */
  const runAnalysis = useCallback(async (period = '90days') => {
    if (!userId) {
      throw new Error('User ID is required');
    }

    setLoading(true);
    setError(null);

    try {
      // 1. Verificar si puede hacer análisis
      const canAnalyze = await checkCanAnalyze(userId);
      if (!canAnalyze.can_analyze) {
        throw new Error(canAnalyze.reason || 'No se puede realizar el análisis');
      }

      // 2. Inicializar motor
      const engine = new DeepFinanceEngine(userId);

      // 3. Ejecutar análisis
      const result = await engine.analyze(period);

      // 4. Guardar en base de datos
      const savedAnalysis = await saveAnalysis(userId, result);

      // 5. Descontar crédito o actualizar límites
      await updateCreditsAfterAnalysis(userId, canAnalyze);

      // 6. Actualizar estado
      setAnalysis(savedAnalysis);

      toast({
        title: 'Análisis completado',
        description: `Puntaje financiero: ${result.score}/100`,
      });

      return savedAnalysis;

    } catch (error) {
      console.error('[useDeepFinance] Error:', error);
      captureError(error, { section: 'deepfinance', action: 'run_analysis', userId });
      
      setError(error.message);
      toast({
        variant: 'destructive',
        title: 'Error en análisis',
        description: error.message || 'No se pudo completar el análisis',
      });

      throw error;
    } finally {
      setLoading(false);
    }
  }, [userId, toast]);

  /**
   * Obtiene el último análisis guardado
   * @returns {Promise<Object|null>}
   */
  const getLastAnalysis = useCallback(async () => {
    if (!userId) return null;

    try {
      const { data, error } = await supabase
        .from('deepfinance_analyses')
        .select('*')
        .eq('user_id', userId)
        .order('analysis_date', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows

      if (data) {
        setAnalysis(data);
        return data;
      }

      return null;
    } catch (error) {
      console.error('[useDeepFinance] Error getting last analysis:', error);
      return null;
    }
  }, [userId]);

  /**
   * Obtiene historial de análisis
   * @param {number} limit
   * @returns {Promise<Array>}
   */
  const getAnalysisHistory = useCallback(async (limit = 10) => {
    if (!userId) return [];

    try {
      const { data, error } = await supabase
        .from('deepfinance_analyses')
        .select('id, analysis_date, score, total_transactions, summary')
        .eq('user_id', userId)
        .order('analysis_date', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('[useDeepFinance] Error getting history:', error);
      return [];
    }
  }, [userId]);

  return {
    analysis,
    loading,
    error,
    runAnalysis,
    getLastAnalysis,
    getAnalysisHistory,
  };
};

/**
 * Verifica si el usuario puede hacer análisis
 * @param {string} userId
 * @returns {Promise<Object>}
 */
async function checkCanAnalyze(userId) {
  try {
    const { data, error } = await supabase.rpc('can_run_analysis', {
      p_user_id: userId,
    });

    if (error) throw error;

    return data[0] || { can_analyze: false, reason: 'Error verificando créditos' };
  } catch (error) {
    console.error('[useDeepFinance] Error checking credits:', error);
    // Si la función no existe, permitir análisis (para desarrollo)
    return { can_analyze: true, reason: 'OK' };
  }
}

/**
 * Guarda el análisis en la base de datos
 * @param {string} userId
 * @param {Object} analysis
 * @returns {Promise<Object>}
 */
async function saveAnalysis(userId, analysis) {
  try {
    const { data, error } = await supabase
      .from('deepfinance_analyses')
      .insert({
        user_id: userId,
        analysis_date: analysis.analysisDate,
        score: analysis.score,
        total_transactions: analysis.totalTransactions,
        period_start: analysis.period.start,
        period_end: analysis.period.end,
        period_days: analysis.period.days,
        summary: analysis.summary,
        patterns: analysis.patterns || [],
        recommendations: [], // Fase 1: vacío, se llenará en Fase 3
        savings_potential: {}, // Fase 1: vacío, se llenará en Fase 3
        total_income: analysis.totalIncome,
        total_expenses: analysis.totalExpenses,
        net_savings: analysis.netSavings,
        savings_rate: analysis.savingsRate,
        category_breakdown: analysis.categoryBreakdown || {},
        emotional_analysis: analysis.emotional || {},
        risk_level: analysis.risk?.level || 'medium',
        risk_factors: analysis.risk?.factors || [],
        metadata: analysis.metadata || {},
      })
      .select()
      .single();

    if (error) throw error;

    return data;
  } catch (error) {
    console.error('[useDeepFinance] Error saving analysis:', error);
    throw error;
  }
}

/**
 * Actualiza créditos después del análisis
 * @param {string} userId
 * @param {Object} canAnalyze
 */
async function updateCreditsAfterAnalysis(userId, canAnalyze) {
  try {
    // Obtener créditos actuales
    const { data: credits, error: fetchError } = await supabase
      .from('deepfinance_credits')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') throw fetchError;

    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());

    const updates = {
      last_analysis_date: now.toISOString().split('T')[0],
      updated_at: now.toISOString(),
    };

    // Si usó crédito premium, descontarlo
    if (canAnalyze.credits_remaining > 0 && !canAnalyze.weekly_limit_reached) {
      updates.credits_remaining = Math.max(0, (credits?.credits_remaining || 0) - 1);
    } else {
      // Usó análisis gratuito
      updates.free_analyses_used = (credits?.free_analyses_used || 0) + 1;
      updates.analyses_this_week = (credits?.analyses_this_week || 0) + 1;
      updates.analyses_this_month = (credits?.analyses_this_month || 0) + 1;
    }

    if (credits) {
      // Actualizar existente
      const { error: updateError } = await supabase
        .from('deepfinance_credits')
        .update(updates)
        .eq('user_id', userId);

      if (updateError) throw updateError;
    } else {
      // Crear nuevo registro
      const { error: insertError } = await supabase
        .from('deepfinance_credits')
        .insert({
          user_id: userId,
          ...updates,
        });

      if (insertError) throw insertError;
    }
  } catch (error) {
    console.error('[useDeepFinance] Error updating credits:', error);
    // No lanzar error, solo loguear (no crítico)
  }
}

