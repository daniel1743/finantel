import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/SupabaseAuthContext';

export const useAIPlanner = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [plans, setPlans] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [analysis, setAnalysis] = useState(null);

  // Llamar a la Edge Function
  const callAIPlanner = useCallback(async (action, params = {}) => {
    if (!user) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Debes iniciar sesión para usar el planificador IA',
      });
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

      if (!response.ok) {
        // Manejar errores 503 (función no desplegada) de forma más clara
        if (response.status === 503) {
          throw new Error('El planificador de IA no está disponible. Por favor, contacta al soporte o verifica que la función esté desplegada.');
        }
        
        const errorData = await response.json().catch(() => ({ error: 'Error en la solicitud' }));
        throw new Error(errorData.error || 'Error en la solicitud');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      // Solo loguear errores no relacionados con funciones no desplegadas
      const is503Error = error.message?.includes('503') || error.message?.includes('no está disponible');
      if (!is503Error) {
        console.error(`Error in ${action}:`, error);
      }
      
      toast({
        variant: 'destructive',
        title: 'Error en Planificador IA',
        description: error.message || 'El planificador de IA no está disponible. Verifica que la función esté desplegada en Supabase.',
      });
      return null;
    }
  }, [user, toast]);

  // Detectar eventos próximos
  const detectEvents = useCallback(async (daysAhead = 30) => {
    setLoading(true);
    try {
      const result = await callAIPlanner('detect_events', { days_ahead: daysAhead });
      if (result?.success) {
        setUpcomingEvents(result.events || []);
        return result.events;
      }
      return [];
    } catch (error) {
      console.error('Error detecting events:', error);
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
    if (!user) return;
    setLoading(true);
    try {
      const result = await callAIPlanner('get_user_plans');
      if (result?.success) {
        setPlans(result.plans || []);
        return result.plans;
      }
      return [];
    } catch (error) {
      console.error('Error fetching plans:', error);
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

  // Cargar planes al montar
  useEffect(() => {
    if (user) {
      fetchPlans();
      detectEvents();
    }
  }, [user, fetchPlans, detectEvents]);

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

