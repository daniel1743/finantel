import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/SupabaseAuthContext';

// Cache para evitar spam de errores
let edgeFunctionUnavailable = false;
let lastErrorTime = 0;
const ERROR_COOLDOWN = 60000; // 1 minuto entre errores mostrados

export const useAIPlanner = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [plans, setPlans] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [analysis, setAnalysis] = useState(null);
  const [functionAvailable, setFunctionAvailable] = useState(true);

  // Llamar a la Edge Function
  const callAIPlanner = useCallback(async (action, params = {}, silent = false) => {
    if (!user) {
      if (!silent) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Debes iniciar sesión para usar el planificador IA',
        });
      }
      return null;
    }

    // Si la función está marcada como no disponible, no intentar
    if (edgeFunctionUnavailable && !params.forceRetry) {
      return null;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No session');

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-planner`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
        },
        body: JSON.stringify({
          action,
          user_id: user.id,
          ...params,
        }),
      });

      // Si la función devuelve 503 o 502, marcar como no disponible
      if (response.status === 503 || response.status === 502 || response.status === 504) {
        edgeFunctionUnavailable = true;
        setFunctionAvailable(false);
        
        // Solo mostrar error si pasó el cooldown
        const now = Date.now();
        if (!silent && (now - lastErrorTime) > ERROR_COOLDOWN) {
          lastErrorTime = now;
          toast({
            variant: 'destructive',
            title: 'Servicio temporalmente no disponible',
            description: 'El planificador IA no está disponible en este momento. Intenta más tarde.',
          });
        }
        return null;
      }

      // Si la función funciona, resetear el flag
      if (edgeFunctionUnavailable) {
        edgeFunctionUnavailable = false;
        setFunctionAvailable(true);
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Error en la solicitud');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      // Solo loguear errores de red/otros, no errores esperados
      if (!error.message.includes('503') && !error.message.includes('502') && !error.message.includes('504')) {
        console.error(`Error in ${action}:`, error);
      }
      
      // Si es un error de red/CORS relacionado con función no disponible
      if (error.message.includes('fetch') || error.message.includes('CORS')) {
        edgeFunctionUnavailable = true;
        setFunctionAvailable(false);
      }

      if (!silent) {
        const now = Date.now();
        if ((now - lastErrorTime) > ERROR_COOLDOWN) {
          lastErrorTime = now;
          toast({
            variant: 'destructive',
            title: 'Error',
            description: error.message || 'Ocurrió un error al procesar la solicitud',
          });
        }
      }
      return null;
    }
  }, [user, toast]);

  // Detectar eventos próximos
  const detectEvents = useCallback(async (daysAhead = 30) => {
    if (edgeFunctionUnavailable) return [];
    
    setLoading(true);
    try {
      const result = await callAIPlanner('detect_events', { days_ahead: daysAhead }, true); // Silent mode
      if (result?.success) {
        setUpcomingEvents(result.events || []);
        return result.events;
      }
      return [];
    } catch (error) {
      // Silenciar errores esperados
      if (!error.message.includes('503') && !error.message.includes('502')) {
        console.error('Error detecting events:', error);
      }
      return [];
    } finally {
      setLoading(false);
    }
  }, [callAIPlanner]);

  // Analizar gastos
  const analyzeExpenses = useCallback(async (monthsBack = 3) => {
    setLoading(true);
    try {
      const result = await callAIPlanner('analyze_expenses', { months_back: monthsBack });
      if (result?.success) {
        setAnalysis(result.analysis);
        return result.analysis;
      }
      return null;
    } catch (error) {
      console.error('Error analyzing expenses:', error);
      return null;
    } finally {
      setLoading(false);
    }
  }, [callAIPlanner]);

  // Crear plan
  const createPlan = useCallback(async (eventId, autoCreate = false) => {
    setLoading(true);
    try {
      const result = await callAIPlanner('create_plan', {
        event_id: eventId,
        auto_create: autoCreate,
      });
      if (result?.success) {
        toast({
          title: 'Plan creado',
          description: 'Tu plan de ahorro ha sido creado exitosamente',
        });
        // Refrescar planes
        await fetchPlans();
        return result.plan;
      }
      return null;
    } catch (error) {
      console.error('Error creating plan:', error);
      return null;
    } finally {
      setLoading(false);
    }
  }, [callAIPlanner, toast]);

  // Seguimiento del plan
  const trackPlan = useCallback(async (planId) => {
    setLoading(true);
    try {
      const result = await callAIPlanner('track_plan', { plan_id: planId });
      if (result?.success) {
        // Actualizar el plan en el estado local
        setPlans(prev => prev.map(p => p.id === planId ? { ...p, evaluation: result.evaluation } : p));
        return result.evaluation;
      }
      return null;
    } catch (error) {
      console.error('Error tracking plan:', error);
      return null;
    } finally {
      setLoading(false);
    }
  }, [callAIPlanner]);

  // Recalcular plan
  const recalculatePlan = useCallback(async (planId) => {
    setLoading(true);
    try {
      const result = await callAIPlanner('recalculate_plan', { plan_id: planId });
      if (result?.success) {
        toast({
          title: 'Plan recalculado',
          description: 'Tu plan ha sido recalculado con nuevas sugerencias',
        });
        await fetchPlans();
        return result.plan;
      }
      return null;
    } catch (error) {
      console.error('Error recalculating plan:', error);
      return null;
    } finally {
      setLoading(false);
    }
  }, [callAIPlanner, toast]);

  // Obtener planes del usuario
  const fetchPlans = useCallback(async () => {
    if (!user || edgeFunctionUnavailable) return [];
    
    setLoading(true);
    try {
      const result = await callAIPlanner('get_user_plans', {}, true); // Silent mode
      if (result?.success) {
        setPlans(result.plans || []);
        return result.plans;
      }
      return [];
    } catch (error) {
      // Silenciar errores esperados
      if (!error.message.includes('503') && !error.message.includes('502')) {
        console.error('Error fetching plans:', error);
      }
      return [];
    } finally {
      setLoading(false);
    }
  }, [user, callAIPlanner]);

  // Aceptar/rechazar sugerencia
  const updateSuggestion = useCallback(async (suggestionId, accepted) => {
    try {
      const { error } = await supabase
        .from('ai_suggestions')
        .update({
          accepted,
          applied_at: accepted ? new Date().toISOString() : null,
        })
        .eq('id', suggestionId);

      if (error) throw error;

      toast({
        title: accepted ? 'Sugerencia aceptada' : 'Sugerencia rechazada',
        description: accepted
          ? 'La sugerencia ha sido aplicada a tu plan'
          : 'La sugerencia ha sido descartada',
      });

      await fetchPlans();
      return true;
    } catch (error) {
      console.error('Error updating suggestion:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudo actualizar la sugerencia',
      });
      return false;
    }
  }, [toast, fetchPlans]);

  // Actualizar monto ahorrado del plan
  const updateSavedAmount = useCallback(async (planId, savedAmount) => {
    try {
      const { error } = await supabase
        .from('ai_plans')
        .update({ saved_amount: savedAmount })
        .eq('id', planId);

      if (error) throw error;

      await fetchPlans();
      return true;
    } catch (error) {
      console.error('Error updating saved amount:', error);
      return false;
    }
  }, [fetchPlans]);

  // Cargar planes al montar (solo si la función está disponible)
  useEffect(() => {
    if (user && functionAvailable) {
      fetchPlans();
      detectEvents();
    }
  }, [user, functionAvailable, fetchPlans, detectEvents]);

  return {
    loading,
    plans,
    upcomingEvents,
    analysis,
    detectEvents,
    analyzeExpenses,
    createPlan,
    trackPlan,
    recalculatePlan,
    fetchPlans,
    updateSuggestion,
    updateSavedAmount,
  };
};

