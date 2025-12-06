// ============================================================================
// HOOK: useFutureSelf
// ============================================================================
// Hook para consumir la Edge Function future-self-simulator
// ============================================================================

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';

// Cache para evitar spam de errores
let futureSelfFunctionUnavailable = false;
let lastFutureSelfErrorTime = 0;
const ERROR_COOLDOWN = 60000; // 1 minuto entre errores mostrados

export function useFutureSelf(horizonMonths = 12) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [scenarios, setScenarios] = useState(null);
  const [currentMetrics, setCurrentMetrics] = useState(null);
  const [error, setError] = useState(null);
  const [functionAvailable, setFunctionAvailable] = useState(true);

  // Helper para cargar escenarios desde caché (BD)
  const loadCachedScenarios = async () => {
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
        // ========================================================================
        // CORRECCIÓN CRÍTICA: Normalizar datos desde caché
        // Los datos de BD ya vienen planos, pero verificamos estructura
        // ========================================================================
        const normalizedScenarios = data.map(scenario => {
          // Si tiene projection anidado, normalizar
          if (scenario.projection) {
            return {
              ...scenario,
              projected_income: scenario.projection.projected_income || scenario.projected_income,
              projected_expenses: scenario.projection.projected_expenses || scenario.projected_expenses,
              projected_savings: scenario.projection.projected_savings || scenario.projected_savings,
              projected_debt: scenario.projection.projected_debt || scenario.projected_debt,
              projected_net_worth: scenario.projection.projected_net_worth || scenario.projected_net_worth,
              monthly_income: scenario.projection.monthly_income || scenario.projected_income / horizonMonths,
              monthly_expenses: scenario.projection.monthly_expenses || scenario.projected_expenses / horizonMonths,
            };
          }
          // Si ya viene plano, devolver tal cual
          return scenario;
        });
        
        console.log('[SIMULADOR-FIX] [HOOK] Datos desde caché normalizados:', {
          count: normalizedScenarios.length,
          sample: normalizedScenarios[0]
        });
        
        setScenarios(normalizedScenarios);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error loading cached scenarios:', err);
      return false;
    }
  };

  // Calcular nuevos escenarios
  const calculateScenarios = async (forceRecalculate = false, silent = false) => {
    if (!user?.id) {
      setError('Usuario no autenticado');
      return;
    }

    // Si la función está marcada como no disponible, no intentar
    if (futureSelfFunctionUnavailable && !forceRecalculate) {
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

      // Detectar si la función está caída (503, 502, 504, o error genérico)
      const errorMessage = invokeError?.message || '';
      const isServiceUnavailable = 
        invokeError?.status === 503 ||
        invokeError?.status === 502 ||
        invokeError?.status === 504 ||
        errorMessage.includes('503') ||
        errorMessage.includes('502') ||
        errorMessage.includes('504') ||
        errorMessage.includes('non-2xx') ||
        errorMessage.includes('Service Unavailable') ||
        errorMessage.includes('Bad Gateway') ||
        errorMessage.includes('Gateway Timeout');

      if (isServiceUnavailable) {
        futureSelfFunctionUnavailable = true;
        setFunctionAvailable(false);
        
        // Intentar cargar desde caché si hay datos guardados
        const hasCache = await loadCachedScenarios();
        if (hasCache && !forceRecalculate) {
          // Si hay datos en caché, no mostrar error
          setError(null);
        } else if (!silent) {
          const now = Date.now();
          if ((now - lastFutureSelfErrorTime) > ERROR_COOLDOWN) {
            lastFutureSelfErrorTime = now;
            setError('El simulador no está disponible temporalmente. Se mostrarán los últimos datos guardados si están disponibles.');
          }
        }
        return;
      }

      if (invokeError) throw invokeError;

      // Si la función funciona, resetear el flag
      if (futureSelfFunctionUnavailable) {
        futureSelfFunctionUnavailable = false;
        setFunctionAvailable(true);
      }

      if (data?.success) {
        // ========================================================================
        // CORRECCIÓN CRÍTICA: Normalizar estructura de datos
        // La Edge Function devuelve datos anidados en 'projection', pero el UI espera datos planos
        // ========================================================================
        const normalizedScenarios = data.scenarios.map(scenario => {
          // Si viene de Edge Function, tiene estructura anidada: scenario.projection.*
          if (scenario.projection) {
            return {
              ...scenario,
              projected_income: scenario.projection.projected_income,
              projected_expenses: scenario.projection.projected_expenses,
              projected_savings: scenario.projection.projected_savings,
              projected_debt: scenario.projection.projected_debt,
              projected_net_worth: scenario.projection.projected_net_worth,
              monthly_income: scenario.projection.monthly_income,
              monthly_expenses: scenario.projection.monthly_expenses,
              // Mantener projection para compatibilidad, pero los valores planos tienen prioridad
            };
          }
          // Si ya viene plano (desde caché), devolver tal cual
          return scenario;
        });
        
        console.log('[SIMULADOR-FIX] [HOOK] Datos normalizados:', {
          original: data.scenarios.length,
          normalized: normalizedScenarios.length,
          sample: normalizedScenarios[0]
        });
        
        setScenarios(normalizedScenarios);
        setCurrentMetrics(data.current_metrics);
        setError(null);
      } else {
        throw new Error(data?.error || 'Error al calcular escenarios');
      }
    } catch (err) {
      const errorMessage = err.message || '';
      const isServiceUnavailable = 
        errorMessage.includes('503') ||
        errorMessage.includes('502') ||
        errorMessage.includes('504') ||
        errorMessage.includes('non-2xx') ||
        errorMessage.includes('Service Unavailable') ||
        errorMessage.includes('Bad Gateway') ||
        errorMessage.includes('Gateway Timeout') ||
        errorMessage.includes('fetch') ||
        errorMessage.includes('CORS') ||
        errorMessage.includes('NetworkError');

      // Si es un error de servicio no disponible, manejar de forma especial
      if (isServiceUnavailable) {
        futureSelfFunctionUnavailable = true;
        setFunctionAvailable(false);
        
        // Intentar cargar desde caché
        const hasCache = await loadCachedScenarios();
        if (hasCache && !forceRecalculate) {
          setError(null); // No mostrar error si hay caché
        } else if (!silent) {
          const now = Date.now();
          if ((now - lastFutureSelfErrorTime) > ERROR_COOLDOWN) {
            lastFutureSelfErrorTime = now;
            setError('El simulador no está disponible temporalmente. Se mostrarán los últimos datos guardados si están disponibles.');
          }
        }
      } else {
        // Otros errores - solo loguear si no es un error esperado
        if (!errorMessage.includes('fetch') && 
            !errorMessage.includes('CORS') && 
            !errorMessage.includes('non-2xx') &&
            !errorMessage.includes('503') &&
            !errorMessage.includes('502') &&
            !errorMessage.includes('504')) {
          console.error('Error calculating scenarios:', err);
        }
        
      // No mostrar errores si están relacionados con función no disponible
      if (!silent && !isServiceUnavailable) {
        const now = Date.now();
        if ((now - lastFutureSelfErrorTime) > ERROR_COOLDOWN) {
          lastFutureSelfErrorTime = now;
          setError('Error al calcular escenarios futuros. Intenta recargar la página.');
        }
      }
      }
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

      // Si no hay cache y la función está disponible, calcular nuevos
      if (!hasCache && functionAvailable) {
        await calculateScenarios(false, true); // Silent mode para evitar spam
      }
    };

    loadData();
  }, [user?.id, horizonMonths, functionAvailable]);

  return {
    scenarios,
    currentMetrics,
    loading,
    error,
    calculateScenarios,
    refresh: () => calculateScenarios(true),
  };
}

