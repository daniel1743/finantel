// =====================================================
// EDGE FUNCTION: AI Planner
// =====================================================
// Sistema completo de IA Planificadora Proactiva
// - Detecta eventos próximos
// - Analiza historial de gastos
// - Genera planes de ahorro
// - Hace seguimiento semanal
// - Recalcula planes si es necesario
// =====================================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface PlanRequest {
  action: 'detect_events' | 'analyze_expenses' | 'create_plan' | 'track_plan' | 'recalculate_plan' | 'get_user_plans'
  user_id?: string
  event_id?: string
  plan_id?: string
  days_ahead?: number
  months_back?: number
  auto_create?: boolean
}

interface ExpenseAnalysis {
  recurring_services: any[]
  impulsive_expenses: any[]
  unnecessary_purchases: any[]
  saving_opportunities: any[]
  analysis_date: string
  months_analyzed: number
}

// =====================================================
// FUNCIÓN 1: Detectar próximos eventos
// =====================================================
async function detectUpcomingEvents(
  supabase: any,
  userId: string,
  daysAhead: number = 30
) {
  try {
    const { data, error } = await supabase.rpc('detect_upcoming_events', {
      p_user_id: userId,
      p_days_ahead: daysAhead
    })

    if (error) throw error

    return {
      success: true,
      events: data || [],
      count: data?.length || 0
    }
  } catch (error) {
    console.error('Error detecting events:', error)
    throw error
  }
}

// =====================================================
// FUNCIÓN 2: Analizar historial de gastos
// =====================================================
async function analyzeExpenses(
  supabase: any,
  userId: string,
  monthsBack: number = 3
): Promise<ExpenseAnalysis> {
  try {
    const { data, error } = await supabase.rpc('analyze_recurring_expenses', {
      p_user_id: userId,
      p_months_back: monthsBack
    })

    if (error) throw error

    return data as ExpenseAnalysis
  } catch (error) {
    console.error('Error analyzing expenses:', error)
    throw error
  }
}

// =====================================================
// FUNCIÓN 3: Generar propuesta de plan
// =====================================================
async function generatePlanProposal(
  supabase: any,
  userId: string,
  eventId: string,
  analysis: ExpenseAnalysis
) {
  try {
    // Obtener información del evento
    const { data: event, error: eventError } = await supabase
      .from('seasonal_events')
      .select('*')
      .eq('id', eventId)
      .single()

    if (eventError) throw eventError

    // Calcular días hasta el evento
    const eventDate = new Date(event.date)
    const today = new Date()
    const daysUntil = Math.ceil((eventDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

    // Calcular meta de ahorro (estimación basada en gastos históricos)
    const { data: recentExpenses } = await supabase
      .from('transactions')
      .select('amount')
      .eq('user_id', userId)
      .eq('type', 'expense')
      .gte('date', new Date(today.getFullYear(), today.getMonth() - 3, 1).toISOString().split('T')[0])
      .order('date', { ascending: false })
      .limit(50)

    const avgMonthlyExpense = recentExpenses?.reduce((sum: number, t: any) => sum + parseFloat(t.amount), 0) / (recentExpenses?.length || 1) || 0
    const estimatedEventCost = avgMonthlyExpense * 0.3 // 30% del gasto mensual promedio
    const goalAmount = Math.max(estimatedEventCost, 100000) // Mínimo $100,000 CLP

    // Generar sugerencias basadas en el análisis
    const suggestions = []

    // Sugerencias de servicios recurrentes
    if (analysis.recurring_services && analysis.recurring_services.length > 0) {
      for (const service of analysis.recurring_services.slice(0, 3)) {
        suggestions.push({
          type: 'pause_service',
          description: `Pausar ${service.description} por 1 mes`,
          estimated_saving: parseFloat(service.avg_monthly || service.amount || 0),
          metadata: {
            service_name: service.description,
            original_amount: service.amount
          }
        })
      }
    }

    // Sugerencias de gastos impulsivos
    if (analysis.impulsive_expenses && analysis.impulsive_expenses.length > 0) {
      for (const expense of analysis.impulsive_expenses.slice(0, 2)) {
        suggestions.push({
          type: 'reduction',
          description: `Reducir ${expense.description} en 50%`,
          estimated_saving: parseFloat(expense.total_amount || 0) * 0.5,
          metadata: {
            expense_name: expense.description,
            current_frequency: expense.count
          }
        })
      }
    }

    // Sugerencias de optimización
    if (analysis.saving_opportunities && analysis.saving_opportunities.length > 0) {
      for (const opp of analysis.saving_opportunities.slice(0, 2)) {
        suggestions.push({
          type: 'optimize',
          description: opp.description || 'Optimizar gastos recurrentes',
          estimated_saving: parseFloat(opp.estimated_saving || 0),
          metadata: opp
        })
      }
    }

    // Calcular ahorro total estimado
    const totalEstimatedSaving = suggestions.reduce((sum, s) => sum + (s.estimated_saving || 0), 0)

    return {
      event: {
        id: event.id,
        name: event.name,
        date: event.date,
        days_until: daysUntil
      },
      goal_amount: goalAmount,
      estimated_savings: totalEstimatedSaving,
      suggestions: suggestions,
      weeks_available: Math.ceil(daysUntil / 7),
      weekly_target: goalAmount / Math.ceil(daysUntil / 7)
    }
  } catch (error) {
    console.error('Error generating plan proposal:', error)
    throw error
  }
}

// =====================================================
// FUNCIÓN 4: Crear plan
// =====================================================
async function createPlan(
  supabase: any,
  userId: string,
  proposal: any,
  autoCreate: boolean = false
) {
  try {
    const eventDate = new Date(proposal.event.date)
    const today = new Date()

    // Crear el plan
    const { data: plan, error: planError } = await supabase
      .from('ai_plans')
      .insert({
        user_id: userId,
        event_id: proposal.event.id,
        goal_amount: proposal.goal_amount,
        saved_amount: 0,
        status: 'active',
        start_date: today.toISOString().split('T')[0],
        target_date: eventDate.toISOString().split('T')[0],
        weekly_adjustment: proposal.suggestions.map((s: any) => ({
          week: 1,
          adjustment: s.estimated_saving,
          type: s.type
        })),
        metadata: {
          auto_created: autoCreate,
          estimated_savings: proposal.estimated_savings,
          weekly_target: proposal.weekly_target
        }
      })
      .select()
      .single()

    if (planError) throw planError

    // Crear las sugerencias
    const suggestionsData = proposal.suggestions.map((s: any) => ({
      plan_id: plan.id,
      type: s.type,
      description: s.description,
      estimated_saving: s.estimated_saving,
      accepted: autoCreate ? true : null, // Si es auto-creado, aceptar automáticamente
      metadata: s.metadata || {}
    }))

    const { data: suggestions, error: suggestionsError } = await supabase
      .from('ai_suggestions')
      .insert(suggestionsData)
      .select()

    if (suggestionsError) throw suggestionsError

    // Crear notificación
    const notificationMessage = autoCreate
      ? `¡Plan de ahorro creado automáticamente para ${proposal.event.name}! Meta: $${proposal.goal_amount.toLocaleString('es-CL')}`
      : `Nuevo plan disponible para ${proposal.event.name}. ¿Quieres activarlo?`

    await supabase
      .from('ai_notifications')
      .insert({
        user_id: userId,
        message: notificationMessage,
        type: autoCreate ? 'plan_offer' : 'plan_offer',
        action_url: `/dashboard/ai-planner?plan_id=${plan.id}`,
        metadata: {
          plan_id: plan.id,
          event_name: proposal.event.name
        }
      })

    return {
      success: true,
      plan: plan,
      suggestions: suggestions
    }
  } catch (error) {
    console.error('Error creating plan:', error)
    throw error
  }
}

// =====================================================
// FUNCIÓN 5: Seguimiento del plan
// =====================================================
async function trackPlan(
  supabase: any,
  planId: string
) {
  try {
    // Evaluar progreso usando la función SQL
    const { data: evaluation, error: evalError } = await supabase.rpc('evaluate_plan_progress', {
      p_plan_id: planId
    })

    if (evalError) throw evalError

    // Obtener información del plan
    const { data: plan, error: planError } = await supabase
      .from('ai_plans')
      .select('*, seasonal_events(*)')
      .eq('id', planId)
      .single()

    if (planError) throw planError

    // Si necesita recalculación, crear notificación
    if (evaluation.needs_recalculation) {
      await supabase
        .from('ai_notifications')
        .insert({
          user_id: plan.user_id,
          message: `Tu plan para ${plan.seasonal_events.name} se ha desviado ${Math.abs(evaluation.deviation_percentage).toFixed(1)}%. ¿Quieres recalcularlo?`,
          type: 'plan_deviation',
          action_url: `/dashboard/ai-planner?plan_id=${planId}&action=recalculate`,
          metadata: {
            plan_id: planId,
            deviation: evaluation.deviation_percentage
          }
        })
    }

    // Si está en buen camino, crear notificación positiva
    if (evaluation.is_on_track && evaluation.weeks_passed > 0) {
      await supabase
        .from('ai_notifications')
        .insert({
          user_id: plan.user_id,
          message: `¡Excelente! Estás cumpliendo tu plan para ${plan.seasonal_events.name}. Sigue así.`,
          type: 'plan_update',
          metadata: {
            plan_id: planId
          }
        })
    }

    return {
      success: true,
      evaluation: evaluation,
      plan: plan
    }
  } catch (error) {
    console.error('Error tracking plan:', error)
    throw error
  }
}

// =====================================================
// FUNCIÓN 6: Recalcular plan
// =====================================================
async function recalculatePlan(
  supabase: any,
  planId: string
) {
  try {
    // Obtener el plan actual
    const { data: plan, error: planError } = await supabase
      .from('ai_plans')
      .select('*, seasonal_events(*)')
      .eq('id', planId)
      .single()

    if (planError) throw planError

    // Re-analizar gastos
    const analysis = await analyzeExpenses(supabase, plan.user_id, 3)

    // Generar nueva propuesta
    const proposal = await generatePlanProposal(
      supabase,
      plan.user_id,
      plan.event_id,
      analysis
    )

    // Actualizar el plan con nuevos valores
    const eventDate = new Date(plan.seasonal_events.date)
    const today = new Date()
    const daysRemaining = Math.ceil((eventDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

    // Ajustar meta si es necesario
    const newGoalAmount = Math.max(plan.goal_amount - plan.saved_amount, proposal.goal_amount * 0.7)

    const { data: updatedPlan, error: updateError } = await supabase
      .from('ai_plans')
      .update({
        goal_amount: newGoalAmount,
        weekly_adjustment: proposal.suggestions.map((s: any) => ({
          week: Math.ceil(daysRemaining / 7),
          adjustment: s.estimated_saving,
          type: s.type
        })),
        metadata: {
          ...plan.metadata,
          recalculated_at: new Date().toISOString(),
          previous_goal: plan.goal_amount
        }
      })
      .eq('id', planId)
      .select()
      .single()

    if (updateError) throw updateError

    // Actualizar sugerencias existentes o crear nuevas
    const { data: existingSuggestions } = await supabase
      .from('ai_suggestions')
      .select('*')
      .eq('plan_id', planId)

    // Eliminar sugerencias no aceptadas
    if (existingSuggestions) {
      for (const suggestion of existingSuggestions) {
        if (!suggestion.accepted) {
          await supabase
            .from('ai_suggestions')
            .delete()
            .eq('id', suggestion.id)
        }
      }
    }

    // Agregar nuevas sugerencias
    const newSuggestions = proposal.suggestions.map((s: any) => ({
      plan_id: planId,
      type: s.type,
      description: s.description,
      estimated_saving: s.estimated_saving,
      accepted: null,
      metadata: s.metadata || {}
    }))

    await supabase
      .from('ai_suggestions')
      .insert(newSuggestions)

    // Crear notificación
    await supabase
      .from('ai_notifications')
      .insert({
        user_id: plan.user_id,
        message: `Plan recalculado para ${plan.seasonal_events.name}. Nueva meta: $${newGoalAmount.toLocaleString('es-CL')}`,
        type: 'plan_update',
        action_url: `/dashboard/ai-planner?plan_id=${planId}`,
        metadata: {
          plan_id: planId
        }
      })

    return {
      success: true,
      plan: updatedPlan,
      new_suggestions: newSuggestions.length
    }
  } catch (error) {
    console.error('Error recalculating plan:', error)
    throw error
  }
}

// =====================================================
// FUNCIÓN 7: Obtener planes del usuario
// =====================================================
async function getUserPlans(
  supabase: any,
  userId: string
) {
  try {
    const { data: plans, error } = await supabase
      .from('ai_plans')
      .select(`
        *,
        seasonal_events(*),
        ai_suggestions(*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error

    return {
      success: true,
      plans: plans || []
    }
  } catch (error) {
    console.error('Error getting user plans:', error)
    throw error
  }
}

// =====================================================
// HANDLER PRINCIPAL
// =====================================================
serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Verificar autenticación
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    // Crear cliente Supabase con service_role para bypass RLS
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Verificar el usuario autenticado
    const supabaseUser = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    )

    const {
      data: { user },
      error: userError,
    } = await supabaseUser.auth.getUser()

    if (userError || !user) {
      throw new Error('Invalid user token')
    }

    // Parsear el body
    const requestData: PlanRequest = await req.json()

    if (!requestData.action) {
      throw new Error('Missing required field: action')
    }

    let result

    // Ejecutar acción según el tipo
    switch (requestData.action) {
      case 'detect_events':
        result = await detectUpcomingEvents(
          supabaseAdmin,
          requestData.user_id || user.id,
          requestData.days_ahead || 30
        )
        break

      case 'analyze_expenses':
        const analysis = await analyzeExpenses(
          supabaseAdmin,
          requestData.user_id || user.id,
          requestData.months_back || 3
        )
        result = {
          success: true,
          analysis: analysis
        }
        break

      case 'create_plan':
        if (!requestData.event_id) {
          throw new Error('Missing required field: event_id')
        }
        const expenseAnalysis = await analyzeExpenses(
          supabaseAdmin,
          requestData.user_id || user.id,
          requestData.months_back || 3
        )
        const proposal = await generatePlanProposal(
          supabaseAdmin,
          requestData.user_id || user.id,
          requestData.event_id,
          expenseAnalysis
        )
        result = await createPlan(
          supabaseAdmin,
          requestData.user_id || user.id,
          proposal,
          requestData.auto_create || false
        )
        break

      case 'track_plan':
        if (!requestData.plan_id) {
          throw new Error('Missing required field: plan_id')
        }
        result = await trackPlan(supabaseAdmin, requestData.plan_id)
        break

      case 'recalculate_plan':
        if (!requestData.plan_id) {
          throw new Error('Missing required field: plan_id')
        }
        result = await recalculatePlan(supabaseAdmin, requestData.plan_id)
        break

      case 'get_user_plans':
        result = await getUserPlans(
          supabaseAdmin,
          requestData.user_id || user.id
        )
        break

      default:
        throw new Error(`Unknown action: ${requestData.action}`)
    }

    return new Response(
      JSON.stringify(result),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error in ai-planner function:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})

