// ============================================================================
// EDGE FUNCTION: Create Appeal
// ============================================================================
// Permite a usuarios crear apelaciones cuando son bloqueados
// ============================================================================

import { serve } from "https://deno.land/std@0.214.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  { auth: { persistSession: false } }
);

serve(async (req: Request) => {
  // Manejar CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ success: false, error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    const body = await req.json();
    const { email, ip_address, device_fingerprint, event_id, appeal_reason, metadata } = body;

    // Validaciones
    if (!email || !email.includes('@')) {
      return new Response(
        JSON.stringify({ success: false, error: 'Email válido es requerido' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!appeal_reason || appeal_reason.length < 10) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'La razón de apelación debe tener al menos 10 caracteres' 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!ip_address) {
      return new Response(
        JSON.stringify({ success: false, error: 'IP address es requerida' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Llamar a la función SQL
    const { data, error } = await supabase.rpc('create_ip_risk_appeal', {
      p_email: email,
      p_ip_address: ip_address,
      p_device_fingerprint: device_fingerprint || null,
      p_event_id: event_id || null,
      p_appeal_reason: appeal_reason,
      p_metadata: metadata || {},
    });

    if (error) {
      console.error('Error al crear apelación:', error);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: error.message || 'Error al crear apelación' 
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        appeal_id: data,
        message: 'Apelación creada exitosamente' 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (e: any) {
    console.error('Exception en create-appeal:', e);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: e.message || 'Error interno del servidor' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

