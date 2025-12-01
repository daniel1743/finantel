// ============================================================================
// EDGE FUNCTION: Restore Previous Cycle
// ============================================================================
// Permite restaurar transacciones del ciclo anterior (últimos 7 días del mes anterior)
// cuando el sistema hace reset mensual automático.
// ============================================================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

/**
 * Obtiene la fecha local en formato YYYY-MM-DD sin problemas de zona horaria
 * @param date - Fecha opcional (por defecto fecha actual)
 * @returns Fecha en formato YYYY-MM-DD
 */
function getLocalDateString(date: Date = new Date()): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

serve(async (req) => {
  // Manejar CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Obtener token de autorización
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No autorizado' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Crear cliente Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } }
    })

    // Obtener usuario autenticado
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Usuario no autenticado' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Parsear request
    const { action, ...params } = await req.json()

    switch (action) {
      case 'check_restorable_data': {
        // Verificar si hay transacciones restaurables del mes anterior
        const now = new Date()
        const currentMonth = now.getMonth()
        const currentYear = now.getFullYear()
        
        // Calcular rango: últimos 7 días del mes anterior
        const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1
        const previousYear = currentMonth === 0 ? currentYear - 1 : currentYear
        
        // Obtener último día del mes anterior
        const lastDayOfPreviousMonth = new Date(previousYear, previousMonth + 1, 0).getDate()
        const startDay = Math.max(1, lastDayOfPreviousMonth - 6) // Últimos 7 días
        
        const startDate = new Date(previousYear, previousMonth, startDay)
        const endDate = new Date(previousYear, previousMonth, lastDayOfPreviousMonth)
        
        // Formatear fechas para PostgreSQL (usar fecha local para evitar problemas de zona horaria)
        const startDateStr = getLocalDateString(startDate)
        const endDateStr = getLocalDateString(endDate)
        
        // Buscar transacciones en ese rango que NO hayan sido restauradas
        const { data: restorableTransactions, error: fetchError } = await supabase
          .from('transactions')
          .select('id, description, amount, type, date, category_id')
          .eq('user_id', user.id)
          .gte('date', startDateStr)
          .lte('date', endDateStr)
          .eq('restored_from_previous_cycle', false)
          .order('date', { ascending: false })
        
        if (fetchError) {
          return new Response(
            JSON.stringify({ error: fetchError.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
        
        // Verificar si ya hay transacciones restauradas en el mes actual
        const currentMonthStart = new Date(currentYear, currentMonth, 1)
        const currentMonthStartStr = getLocalDateString(currentMonthStart)
        
        const { data: alreadyRestored, error: restoredError } = await supabase
          .from('transactions')
          .select('id')
          .eq('user_id', user.id)
          .gte('date', currentMonthStartStr)
          .eq('restored_from_previous_cycle', true)
          .limit(1)
        
        if (restoredError) {
          return new Response(
            JSON.stringify({ error: restoredError.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
        
        const hasAlreadyRestored = (alreadyRestored?.length || 0) > 0
        const hasRestorableData = (restorableTransactions?.length || 0) > 0
        
        return new Response(
          JSON.stringify({
            has_restorable_data: hasRestorableData && !hasAlreadyRestored,
            count: hasRestorableData ? restorableTransactions.length : 0,
            transactions: hasRestorableData ? restorableTransactions : [],
            already_restored: hasAlreadyRestored,
            date_range: {
              start: startDateStr,
              end: endDateStr
            }
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'restore_previous_cycle': {
        // Restaurar transacciones del ciclo anterior
        const now = new Date()
        const currentMonth = now.getMonth()
        const currentYear = now.getFullYear()
        
        // Calcular rango: últimos 7 días del mes anterior
        const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1
        const previousYear = currentMonth === 0 ? currentYear - 1 : currentYear
        
        // Obtener último día del mes anterior
        const lastDayOfPreviousMonth = new Date(previousYear, previousMonth + 1, 0).getDate()
        const startDay = Math.max(1, lastDayOfPreviousMonth - 6) // Últimos 7 días
        
        const startDate = new Date(previousYear, previousMonth, startDay)
        const endDate = new Date(previousYear, previousMonth, lastDayOfPreviousMonth)
        
        // Formatear fechas para PostgreSQL (usar fecha local para evitar problemas de zona horaria)
        const startDateStr = getLocalDateString(startDate)
        const endDateStr = getLocalDateString(endDate)
        
        // Verificar si ya se restauró antes
        const currentMonthStart = new Date(currentYear, currentMonth, 1)
        const currentMonthStartStr = getLocalDateString(currentMonthStart)
        
        const { data: alreadyRestored, error: checkError } = await supabase
          .from('transactions')
          .select('id')
          .eq('user_id', user.id)
          .gte('date', currentMonthStartStr)
          .eq('restored_from_previous_cycle', true)
          .limit(1)
        
        if (checkError) {
          return new Response(
            JSON.stringify({ error: checkError.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
        
        if (alreadyRestored && alreadyRestored.length > 0) {
          return new Response(
            JSON.stringify({ 
              error: 'Ya se restauraron datos del ciclo anterior para este mes',
              already_restored: true
            }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
        
        // Obtener transacciones restaurables
        const { data: restorableTransactions, error: fetchError } = await supabase
          .from('transactions')
          .select('*')
          .eq('user_id', user.id)
          .gte('date', startDateStr)
          .lte('date', endDateStr)
          .eq('restored_from_previous_cycle', false)
        
        if (fetchError) {
          return new Response(
            JSON.stringify({ error: fetchError.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
        
        if (!restorableTransactions || restorableTransactions.length === 0) {
          return new Response(
            JSON.stringify({ 
              error: 'No hay transacciones restaurables',
              has_restorable_data: false
            }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
        
        // Crear nuevas transacciones con fecha del mes actual pero manteniendo la fecha original en metadata
        const currentDate = getLocalDateString()
        const transactionsToInsert = restorableTransactions.map(tx => ({
          user_id: user.id,
          category_id: tx.category_id,
          budget_id: tx.budget_id,
          type: tx.type,
          amount: tx.amount,
          currency: tx.currency || 'USD',
          description: tx.description,
          date: currentDate, // Fecha actual para que aparezca en el dashboard
          payment_method: tx.payment_method,
          reference_number: tx.reference_number,
          is_recurring: tx.is_recurring || false,
          recurring_frequency: tx.recurring_frequency,
          tags: tx.tags || [],
          metadata: {
            ...(tx.metadata || {}),
            original_date: tx.date, // Guardar fecha original
            restored_at: new Date().toISOString(),
            restored_from_id: tx.id // ID de la transacción original
          },
          restored_from_previous_cycle: true
        }))
        
        // Insertar transacciones restauradas
        const { data: insertedTransactions, error: insertError } = await supabase
          .from('transactions')
          .insert(transactionsToInsert)
          .select('id, description, amount, type, date')
        
        if (insertError) {
          return new Response(
            JSON.stringify({ error: insertError.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
        
        return new Response(
          JSON.stringify({
            success: true,
            restored_count: insertedTransactions.length,
            transactions: insertedTransactions,
            message: `Se restauraron ${insertedTransactions.length} transacciones del ciclo anterior`
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      default:
        return new Response(
          JSON.stringify({ error: 'Acción no válida' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

