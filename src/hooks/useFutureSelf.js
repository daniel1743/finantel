// ============================================================================
// HOOK: useFutureSelf
// ============================================================================
// Hook para consumir la Edge Function future-self-simulator
// ============================================================================

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';

export function useFutureSelf(horizonMonths = 12) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [scenarios, setScenarios] = useState(null);
  const [currentMetrics, setCurrentMetrics] = useState(null);
  const [error, setError] = useState(null);

  // Cargar escenarios desde BD (cache)
  const loadCachedScenarios = async () => {
    if (!user?.id) return;

    try {
      const { data, error: dbError } = await supabase
        .from('future_self_scenarios')
        .select('*')
        .eq('user_id', user.id)
        .eq('horizon_months', horizonMonths)
        .order('scenario_type', { ascending: true });

      if (dbError) throw dbError;

      if (data && data.length > 0) {
        setScenarios(data);
        return true; // Hay datos en cache
      }
      return false; // No hay datos
    } catch (err) {
      console.error('Error loading cached scenarios:', err);
      return false;
    }
  };

  // Calcular nuevos escenarios
  const calculateScenarios = async (forceRecalculate = false) => {
    if (!user?.id) {
      setError('Usuario no autenticado');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error: invokeError } = await supabase.functions.invoke(
        'future-self-simulator',
        {
          body: {
            user_id: user.id,
            horizon_months: horizonMonths,
            force_recalculate: forceRecalculate,
          },
        }
      );

      if (invokeError) throw invokeError;

      if (data?.success) {
        setScenarios(data.scenarios);
        setCurrentMetrics(data.current_metrics);
      } else {
        throw new Error(data?.error || 'Error al calcular escenarios');
      }
    } catch (err) {
      console.error('Error calculating scenarios:', err);
      setError(err.message || 'Error al calcular escenarios futuros');
    } finally {
      setLoading(false);
    }
  };

  // Cargar al montar o cambiar horizonte
  useEffect(() => {
    if (!user?.id) return;

    const loadData = async () => {
      // Primero intentar cargar desde cache
      const hasCache = await loadCachedScenarios();

      // Si no hay cache, calcular nuevos
      if (!hasCache) {
        await calculateScenarios();
      }
    };

    loadData();
  }, [user?.id, horizonMonths]);

  return {
    scenarios,
    currentMetrics,
    loading,
    error,
    calculateScenarios,
    refresh: () => calculateScenarios(true),
  };
}

