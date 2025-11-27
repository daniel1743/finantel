// =====================================================
// HEALTH CHECK ENDPOINT
// =====================================================
// Endpoint para monitoreo de uptime
// =====================================================

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

serve(async (req) => {
  const checks = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: {} as Record<string, string>,
  };

  try {
    // 1. Verificar conexión a Supabase
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const { error: dbError } = await supabase
      .from('categories')
      .select('id')
      .limit(1);

    checks.services.database = dbError ? 'unhealthy' : 'healthy';

    // 2. Verificar Edge Functions (si hay service role key)
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (serviceKey) {
      const supabaseAdmin = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        serviceKey
      );
      
      const { error: adminError } = await supabaseAdmin
        .from('categories')
        .select('id')
        .limit(1);
      
      checks.services.edgeFunctions = adminError ? 'unhealthy' : 'healthy';
    } else {
      checks.services.edgeFunctions = 'not_configured';
    }

    // 3. Verificar variables de entorno críticas
    const requiredEnvVars = [
      'SUPABASE_URL',
      'SUPABASE_ANON_KEY',
    ];

    const missingEnvVars = requiredEnvVars.filter(
      (varName) => !Deno.env.get(varName)
    );

    if (missingEnvVars.length > 0) {
      checks.services.environment = 'unhealthy';
      checks.status = 'degraded';
    } else {
      checks.services.environment = 'healthy';
    }

    // Determinar estado general
    const unhealthyServices = Object.values(checks.services).filter(
      (status) => status === 'unhealthy'
    );

    if (unhealthyServices.length > 0) {
      checks.status = 'unhealthy';
    }

    return new Response(
      JSON.stringify(checks, null, 2),
      {
        status: checks.status === 'healthy' ? 200 : 503,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
        },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString(),
      }),
      {
        status: 503,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
});

