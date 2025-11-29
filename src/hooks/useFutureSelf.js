// ============================================================================
// HOOK: useFutureSelf
// ============================================================================
// Hook para consumir la Edge Function future-self-simulator
// ============================================================================

import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';

export function useFutureSelf(horizonMonths = 12) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [scenarios, setScenarios] = useState(null);
  const [currentMetrics, setCurrentMetrics] = useState(null);
  const [error, setError] = useState(null);
  
  // Usar refs para evitar loops
  const isLoadingRef = useRef(false);
  const lastHorizonRef = useRef(horizonMonths);
  const lastUserIdRef = useRef(user?.id);

  // Cargar escenarios desde BD (cache)
  const loadCachedScenarios = useCallback(async () => {
    if (!user?.id) return false;

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
  }, [user?.id, horizonMonths]);

  // Calcular nuevos escenarios
  const calculateScenarios = useCallback(async (forceRecalculate = false) => {
    if (!user?.id) {
      setError('Usuario no autenticado');
      return;
    }

    // Evitar múltiples llamadas simultáneas
    if (isLoadingRef.current && !forceRecalculate) {
      return;
    }

    setLoading(true);
    setError(null);
    isLoadingRef.current = true;

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
      isLoadingRef.current = false;
    }
  }, [user?.id, horizonMonths]);

  // Cargar al montar o cambiar horizonte
  useEffect(() => {
    if (!user?.id) {
      setScenarios(null);
      setCurrentMetrics(null);
      setError(null);
      lastUserIdRef.current = null;
      lastHorizonRef.current = horizonMonths;
      return;
    }

    // Solo cargar si cambió el usuario o el horizonte
    const userIdChanged = lastUserIdRef.current !== user.id;
    const horizonChanged = lastHorizonRef.current !== horizonMonths;
    
    if (!userIdChanged && !horizonChanged) {
      // Ya cargamos estos datos, no hacer nada
      return;
    }

    // Actualizar refs antes de cargar
    lastUserIdRef.current = user.id;
    lastHorizonRef.current = horizonMonths;

    const loadData = async () => {
      // Primero intentar cargar desde cache
      const hasCache = await loadCachedScenarios();

      // Si no hay cache, calcular nuevos
      if (!hasCache) {
        await calculateScenarios();
      }
    };

    loadData();
  }, [user?.id, horizonMonths, loadCachedScenarios, calculateScenarios]);

  return {
    scenarios,
    currentMetrics,
    loading,
    error,
    calculateScenarios,
    refresh: () => calculateScenarios(true),
  };
}

