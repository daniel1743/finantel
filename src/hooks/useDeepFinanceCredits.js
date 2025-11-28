// =====================================================
// HOOK: useDeepFinanceCredits
// =====================================================
// Maneja créditos y límites del DeepFinance Engine
// =====================================================

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';

export const useDeepFinanceCredits = (userId) => {
  const { toast } = useToast();
  const [credits, setCredits] = useState(null);
  const [loading, setLoading] = useState(true);
  const [canAnalyze, setCanAnalyze] = useState(false);
  const [reason, setReason] = useState('');

  /**
   * Carga los créditos del usuario
   */
  const fetchCredits = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // Obtener créditos
      const { data: creditsData, error: creditsError } = await supabase
        .from('deepfinance_credits')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (creditsError && creditsError.code !== 'PGRST116') {
        throw creditsError;
      }

      // Si no existe, inicializar
      if (!creditsData) {
        const { data: newCredits, error: initError } = await supabase
          .from('deepfinance_credits')
          .insert({
            user_id: userId,
            credits_remaining: 0,
            free_analyses_limit: 4,
          })
          .select()
          .single();

        if (initError) throw initError;
        setCredits(newCredits);
      } else {
        setCredits(creditsData);
      }

      // Verificar si puede hacer análisis
      const canAnalyzeResult = await checkCanAnalyze(userId, creditsData || newCredits);
      setCanAnalyze(canAnalyzeResult.can);
      setReason(canAnalyzeResult.reason || '');

    } catch (error) {
      console.error('[useDeepFinanceCredits] Error:', error);
      // En caso de error, permitir análisis (para desarrollo)
      setCanAnalyze(true);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchCredits();
  }, [fetchCredits]);

  /**
   * Compra créditos (redirige a checkout)
   */
  const purchaseCredits = useCallback(async () => {
    // TODO: Integrar con Mercado Pago en Fase 4
    // Por ahora, redirigir a página de billing
    window.location.href = '/dashboard/billing?product=deepfinance-credits';
  }, []);

  return {
    credits,
    loading,
    canAnalyze,
    reason,
    fetchCredits,
    purchaseCredits,
  };
};

/**
 * Verifica si puede hacer análisis
 * @param {string} userId
 * @param {Object} credits
 * @returns {Promise<Object>}
 */
async function checkCanAnalyze(userId, credits) {
  try {
    // Usar función RPC si está disponible
    const { data, error } = await supabase.rpc('can_run_analysis', {
      p_user_id: userId,
    });

    if (!error && data && data.length > 0) {
      return {
        can: data[0].can_analyze,
        reason: data[0].reason || '',
      };
    }

    // Fallback: verificación manual
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    // Contar análisis de esta semana
    const { count: weekCount } = await supabase
      .from('deepfinance_analyses')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('analysis_date', weekStart.toISOString());

    // Verificar límites
    const hasCredits = (credits?.credits_remaining || 0) > 0;
    const freeUsed = credits?.free_analyses_used || 0;
    const freeLimit = credits?.free_analyses_limit || 4;
    const weeklyLimitReached = (weekCount || 0) >= 1 && freeUsed >= freeLimit;

    if (weeklyLimitReached && !hasCredits) {
      return {
        can: false,
        reason: 'Límite semanal alcanzado. Compra créditos para continuar.',
      };
    }

    if (freeUsed >= freeLimit && !hasCredits) {
      return {
        can: false,
        reason: 'Límite mensual de análisis gratuitos alcanzado. Compra créditos para continuar.',
      };
    }

    return {
      can: true,
      reason: 'OK',
    };

  } catch (error) {
    console.error('[checkCanAnalyze] Error:', error);
    // En desarrollo, permitir siempre
    return {
      can: true,
      reason: 'OK',
    };
  }
}

