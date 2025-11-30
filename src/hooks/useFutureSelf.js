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
  
  // Usar refs para evitar loops y reintentos
  const isLoadingRef = useRef(false);
  const lastHorizonRef = useRef(horizonMonths);
  const lastUserIdRef = useRef(user?.id);
  const lastErrorTimeRef = useRef(0);
  const retryCountRef = useRef(0);
  const isServiceUnavailableRef = useRef(false);
  const errorLogCountRef = useRef(0);

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

    // Si el servicio no está disponible, no intentar de nuevo inmediatamente
    const now = Date.now();
    const timeSinceLastError = now - lastErrorTimeRef.current;
    const COOLDOWN_TIME = 60000; // 1 minuto de cooldown después de un error 503

    if (isServiceUnavailableRef.current && timeSinceLastError < COOLDOWN_TIME && !forceRecalculate) {
      // Solo loguear el primer error para no saturar la consola
      if (errorLogCountRef.current === 0) {
        if (import.meta.env.MODE === 'development') {
          console.warn('[useFutureSelf] Servicio no disponible. Esperando antes de reintentar...');
        }
        errorLogCountRef.current = 1;
      }
      return;
    }

    // Resetear contador de errores si pasó suficiente tiempo
    if (timeSinceLastError > COOLDOWN_TIME) {
      isServiceUnavailableRef.current = false;
      retryCountRef.current = 0;
      errorLogCountRef.current = 0;
    }

    setLoading(true);
    setError(null);
    isLoadingRef.current = true;

    try {
      let data, invokeError;
      
      try {
        const result = await supabase.functions.invoke(
          'future-self-simulator',
          {
            body: {
              user_id: user.id,
              horizon_months: horizonMonths,
              force_recalculate: forceRecalculate,
            },
          }
        );
        
        data = result?.data;
        invokeError = result?.error;
      } catch (fetchError) {
        // Capturar errores de red, CORS, o respuestas malformadas
        const errorMessage = fetchError?.message || String(fetchError) || 'Error de conexión';
        const isNetworkError = 
          errorMessage.includes('fetch') ||
          errorMessage.includes('network') ||
          errorMessage.includes('CORS') ||
          errorMessage.includes('Failed to fetch') ||
          errorMessage.includes('Cannot read properties of undefined') ||
          errorMessage.includes('headers') ||
          fetchError?.name === 'TypeError';
        
        if (isNetworkError) {
          // Crear un error estructurado para manejo consistente
          const networkError = new Error('Error de conexión con el servidor. El servicio puede estar temporalmente no disponible.');
          networkError.status = 503;
          networkError.isNetworkError = true;
          throw networkError;
        }
        
        throw fetchError;
      }

      // Manejar errores de invocación
      if (invokeError) {
        // Si el error no tiene estructura esperada, crear uno
        const errorObj = invokeError instanceof Error 
          ? invokeError 
          : new Error(invokeError?.message || 'Error al invocar la función');
        
        // Agregar información de estado si está disponible
        if (invokeError?.status || invokeError?.statusCode) {
          errorObj.status = invokeError.status || invokeError.statusCode;
        }
        
        throw errorObj;
      }

      if (data?.success) {
        setScenarios(data.scenarios);
        setCurrentMetrics(data.current_metrics);
        // Resetear flags de error si fue exitoso
        isServiceUnavailableRef.current = false;
        retryCountRef.current = 0;
        errorLogCountRef.current = 0;
      } else {
        throw new Error(data?.error || 'Error al calcular escenarios');
      }
    } catch (err) {
      // Detectar errores 503 (Service Unavailable) y CORS
      const is503Error = 
        err.message?.includes('503') ||
        err.message?.includes('Service Unavailable') ||
        err.message?.includes('non-2xx status code') ||
        err.status === 503 ||
        err.statusCode === 503 ||
        (err.message?.includes('Sin conexión') && err.message?.includes('future-self')) ||
        err.message?.includes('CORS') ||
        err.message?.includes('Cannot read properties of undefined');
      
      // Detectar errores de CORS específicamente
      const isCORSError = 
        err.message?.includes('CORS') ||
        err.message?.includes('blocked by CORS policy') ||
        err.message?.includes('preflight');

      if (is503Error || isCORSError) {
        isServiceUnavailableRef.current = true;
        lastErrorTimeRef.current = Date.now();
        retryCountRef.current += 1;

        // Solo mostrar error en consola la primera vez o cada 10 intentos para evitar spam
        if (errorLogCountRef.current === 0 || retryCountRef.current % 10 === 0) {
          if (import.meta.env.MODE === 'development') {
            const errorType = isCORSError ? 'CORS' : '503';
            console.warn(`[useFutureSelf] Edge Function no disponible (${errorType}). Intento ${retryCountRef.current}. Reintentando más tarde...`);
          }
          errorLogCountRef.current += 1;
        }

        const errorMessage = isCORSError
          ? 'El simulador de futuro no está disponible debido a un problema de configuración. Por favor, contacta al soporte.'
          : 'El simulador de futuro no está disponible temporalmente. Por favor, intenta más tarde o usa el botón "Recalcular" para reintentar.';
        
        setError(errorMessage);
      } else {
        // Para otros errores, mostrar normalmente pero limitar logs
        if (errorLogCountRef.current < 2) {
          if (import.meta.env.MODE === 'development') {
            console.error('[useFutureSelf] Error calculating scenarios:', err);
          }
          errorLogCountRef.current += 1;
        }
        setError(err.message || 'Error al calcular escenarios futuros');
      }
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
      // Resetear flags cuando no hay usuario
      isServiceUnavailableRef.current = false;
      retryCountRef.current = 0;
      errorLogCountRef.current = 0;
      return;
    }

    // Solo cargar si cambió el usuario o el horizonte
    const userIdChanged = lastUserIdRef.current !== user.id;
    const horizonChanged = lastHorizonRef.current !== horizonMonths;
    
    if (!userIdChanged && !horizonChanged) {
      // Ya cargamos estos datos, no hacer nada
      return;
    }

    // Si el servicio no está disponible y no ha pasado suficiente tiempo, no intentar
    const now = Date.now();
    const timeSinceLastError = now - lastErrorTimeRef.current;
    const COOLDOWN_TIME = 60000; // 1 minuto

    if (isServiceUnavailableRef.current && timeSinceLastError < COOLDOWN_TIME) {
      // Solo intentar cargar desde cache, no calcular nuevos
      loadCachedScenarios();
      return;
    }

    // Actualizar refs antes de cargar
    lastUserIdRef.current = user.id;
    lastHorizonRef.current = horizonMonths;

    const loadData = async () => {
      // Primero intentar cargar desde cache
      const hasCache = await loadCachedScenarios();

      // Si no hay cache y el servicio está disponible, calcular nuevos
      if (!hasCache && !isServiceUnavailableRef.current) {
        await calculateScenarios();
      } else if (!hasCache && isServiceUnavailableRef.current) {
        // Si no hay cache y el servicio no está disponible, mostrar mensaje
        setError('El simulador de futuro no está disponible temporalmente. Por favor, intenta más tarde.');
      }
    };

    loadData();
  }, [user?.id, horizonMonths, loadCachedScenarios, calculateScenarios]);

  // Función de refresh que fuerza el recálculo incluso si hay error
  const forceRefresh = useCallback(() => {
    // Resetear flags de error para permitir reintento
    isServiceUnavailableRef.current = false;
    lastErrorTimeRef.current = 0;
    retryCountRef.current = 0;
    errorLogCountRef.current = 0;
    setError(null);
    calculateScenarios(true);
  }, [calculateScenarios]);

  return {
    scenarios,
    currentMetrics,
    loading,
    error,
    calculateScenarios,
    refresh: forceRefresh,
  };
}

