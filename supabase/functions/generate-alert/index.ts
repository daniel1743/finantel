// =====================================================
// EDGE FUNCTION: Generate Alert
// =====================================================
// Esta función permite crear alertas desde el frontend
// de manera segura usando service_role
// =====================================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface AlertRequest {
  type: 'critical' | 'warning' | 'info' | 'opportunity' | 'trend'
  title: string
  message: string
  recommendation?: string
  category_id?: string
  budget_id?: string
  goal_id?: string
  transaction_id?: string
  priority?: number
  metadata?: Record<string, any>
  expires_at?: string
}

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
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Verificar el usuario autenticado usando el token del cliente
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
    const alertData: AlertRequest = await req.json()

    // Validaciones
    if (!alertData.type || !alertData.title || !alertData.message) {
      throw new Error('Missing required fields: type, title, message')
    }

    const validTypes = ['critical', 'warning', 'info', 'opportunity', 'trend']
    if (!validTypes.includes(alertData.type)) {
      throw new Error(`Invalid type. Must be one of: ${validTypes.join(', ')}`)
    }

    if (alertData.priority && (alertData.priority < 1 || alertData.priority > 10)) {
      throw new Error('Priority must be between 1 and 10')
    }

    // Llamar a la función de la base de datos
    const { data, error } = await supabaseClient.rpc('create_alert', {
      p_user_id: user.id,
      p_type: alertData.type,
      p_title: alertData.title,
      p_message: alertData.message,
      p_recommendation: alertData.recommendation || null,
      p_category_id: alertData.category_id || null,
      p_budget_id: alertData.budget_id || null,
      p_goal_id: alertData.goal_id || null,
      p_transaction_id: alertData.transaction_id || null,
      p_priority: alertData.priority || 5,
      p_metadata: alertData.metadata || {},
      p_expires_at: alertData.expires_at || null,
    })

    if (error) {
      console.error('Error creating alert:', error)
      throw error
    }

    return new Response(
      JSON.stringify({
        success: true,
        alert_id: data,
        message: 'Alert created successfully',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error in generate-alert function:', error)
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
