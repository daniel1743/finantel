// ============================================================================
// CHECK-IP-RISK FUNCTION (Edge Function)
// Llama directamente a la función check_ip_risk() del SQL
// ============================================================================

import { serve } from "https://deno.land/std@0.214.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Headers CORS
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// Crear cliente Supabase con service_role
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

  // Solo permitir POST
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ success: false, error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    // Obtener IP del cliente (probar múltiples headers)
    const ip =
      req.headers.get("x-forwarded-for")?.split(',')[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      req.headers.get("cf-connecting-ip") ||
      req.headers.get("x-client-ip") ||
      "0.0.0.0";

    // Parsear request body
    let body;
    try {
      body = await req.json();
    } catch (e) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Invalid JSON in request body",
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { fingerprint, device_fingerprint, email } = body;

    // Aceptar tanto 'fingerprint' como 'device_fingerprint' para compatibilidad
    const deviceFingerprint = fingerprint || device_fingerprint;

    // Validar fingerprint
    if (!deviceFingerprint) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Missing or invalid fingerprint object",
          details: "Se requiere 'fingerprint' o 'device_fingerprint' en el body",
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (typeof deviceFingerprint !== "object" || Array.isArray(deviceFingerprint)) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Fingerprint must be a valid object",
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validar campos mínimos del fingerprint
    const requiredFields = ['browser', 'userAgent', 'platform'];
    const missingFields = requiredFields.filter(field => !deviceFingerprint[field]);
    
    if (missingFields.length > 0) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Fingerprint missing required fields",
          missing_fields: missingFields,
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validar formato de email si se proporciona
    if (email && typeof email === 'string') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return new Response(
          JSON.stringify({
            success: false,
            error: "Invalid email format",
          }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Llamar al SQL check_ip_risk()
    const { data, error } = await supabase.rpc("check_ip_risk", {
      p_ip_address: ip,
      p_device_fingerprint: deviceFingerprint,
      p_email: email || null,
    });

    if (error) {
      console.error("SQL ERROR:", error);
      console.error("IP:", ip);
      console.error("Fingerprint keys:", Object.keys(deviceFingerprint));
      
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: error.message || 'Error al verificar riesgo',
          code: error.code,
          details: error.details,
        }), 
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Si data es null o undefined, retornar error
    if (!data) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "No data returned from check_ip_risk function",
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Retornar resultado exitoso
    return new Response(
      JSON.stringify({ 
        success: true, 
        result: data,
        ip_address: ip, // Incluir IP para debugging (opcional, puede removerse en producción)
      }), 
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (e: any) {
    console.error("Exception in check-ip-risk:", e);
    console.error("Stack:", e.stack);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: e.message || 'Internal server error',
        type: e.name,
      }), 
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

