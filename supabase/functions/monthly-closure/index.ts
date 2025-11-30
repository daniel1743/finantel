// ============================================================================
// EDGE FUNCTION: Monthly Closure
// ============================================================================
// Permite a los usuarios:
// 1. Cerrar mes manualmente
// 2. Descargar resúmenes mensuales
// 3. Ver notificaciones de cierre
// 4. Obtener datos históricos para IA
// ============================================================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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
      case 'close_month_manually': {
        // Cerrar mes manualmente
        const { target_month } = params
        
        const { data, error } = await supabase.rpc('close_month_automatically', {
          p_user_id: user.id,
          p_target_month: target_month || null
        })

        if (error) {
          return new Response(
            JSON.stringify({ error: error.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        return new Response(
          JSON.stringify({ 
            success: true, 
            summary_id: data,
            message: 'Mes cerrado exitosamente'
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'download_summary': {
        // Descargar resumen mensual
        const { monthly_summary_id, format = 'json' } = params

        if (!monthly_summary_id) {
          return new Response(
            JSON.stringify({ error: 'ID de resumen requerido' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        // Obtener IP y User-Agent
        const ip_address = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || null
        const user_agent = req.headers.get('user-agent') || null

        const { data, error } = await supabase.rpc('download_monthly_summary', {
          p_user_id: user.id,
          p_monthly_summary_id: monthly_summary_id,
          p_format: format,
          p_ip_address: ip_address,
          p_user_agent: user_agent
        })

        if (error) {
          return new Response(
            JSON.stringify({ error: error.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        // Verificar si puede descargar
        if (!data.success) {
          return new Response(
            JSON.stringify(data),
            { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        return new Response(
          JSON.stringify(data),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'get_notifications': {
        // Obtener notificaciones de cierre
        const { unread_only = false } = params

        let query = supabase
          .from('monthly_closure_notifications')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })

        if (unread_only) {
          query = query.eq('is_read', false)
        }

        const { data, error } = await query

        if (error) {
          return new Response(
            JSON.stringify({ error: error.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        return new Response(
          JSON.stringify({ notifications: data }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'mark_notification_read': {
        // Marcar notificación como leída
        const { notification_id } = params

        if (!notification_id) {
          return new Response(
            JSON.stringify({ error: 'ID de notificación requerido' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        const { data, error } = await supabase
          .from('monthly_closure_notifications')
          .update({ is_read: true })
          .eq('id', notification_id)
          .eq('user_id', user.id)
          .select()

        if (error) {
          return new Response(
            JSON.stringify({ error: error.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        return new Response(
          JSON.stringify({ success: true, notification: data[0] }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'get_historical_data': {
        // Obtener datos históricos para IA
        const { analysis_type = 'general' } = params

        const { data, error } = await supabase.rpc('get_historical_data_for_ai', {
          p_user_id: user.id,
          p_analysis_type: analysis_type
        })

        if (error) {
          return new Response(
            JSON.stringify({ error: error.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        return new Response(
          JSON.stringify(data),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'get_plan_limits': {
        // Obtener límites del plan del usuario
        const { data, error } = await supabase.rpc('get_plan_limits', {
          p_user_id: user.id
        })

        if (error) {
          return new Response(
            JSON.stringify({ error: error.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        return new Response(
          JSON.stringify(data[0] || {}),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'get_summaries': {
        // Obtener todos los resúmenes mensuales del usuario
        const { limit = 12, offset = 0 } = params

        const { data, error } = await supabase
          .from('monthly_summaries')
          .select('*')
          .eq('user_id', user.id)
          .order('month_year', { ascending: false })
          .range(offset, offset + limit - 1)

        if (error) {
          return new Response(
            JSON.stringify({ error: error.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        return new Response(
          JSON.stringify({ summaries: data }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'get_download_stats': {
        // Obtener estadísticas de descargas
        const current_month = new Date().toISOString().slice(0, 7) + '-01'

        const { data: downloads, error: downloadsError } = await supabase
          .from('monthly_downloads')
          .select('*')
          .eq('user_id', user.id)
          .gte('download_date', current_month)

        if (downloadsError) {
          return new Response(
            JSON.stringify({ error: downloadsError.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        // Obtener límites del plan
        const { data: limits, error: limitsError } = await supabase.rpc('get_plan_limits', {
          p_user_id: user.id
        })

        if (limitsError) {
          return new Response(
            JSON.stringify({ error: limitsError.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        const limit = limits[0]?.downloads_per_month || 2
        const used = downloads?.length || 0

        return new Response(
          JSON.stringify({
            downloads_this_month: used,
            limit: limit,
            remaining: Math.max(0, limit - used),
            plan: limits[0]?.plan_name || 'free'
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

