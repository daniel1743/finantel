// =====================================================
// FASE 2: SISTEMA DE SEGURIDAD PARA EDGE FUNCTIONS
// =====================================================
// Validación estricta, rate limiting, y firewall lógico
// =====================================================

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { corsHeaders } from './cors.ts';

// =====================================================
// 1. CONFIGURACIÓN DE SEGURIDAD
// =====================================================

const MAX_REQUESTS_PER_MINUTE = 60;
const MAX_REQUESTS_PER_HOUR = 1000;
const BLOCK_DURATION_MINUTES = 60;

// =====================================================
// 2. INTERFACES
// =====================================================

interface SecurityContext {
  userId: string;
  ipAddress: string;
  userAgent: string;
  timestamp: number;
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
  blocked: boolean;
}

// =====================================================
// 3. CLIENTE SUPABASE CON SERVICE ROLE
// =====================================================

const getSupabaseAdmin = () => {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
};

// =====================================================
// 4. VALIDACIÓN DE SESIÓN PROFUNDA
// =====================================================

export async function validateSession(
  authHeader: string | null
): Promise<{ valid: boolean; userId?: string; error?: string }> {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { valid: false, error: 'Missing or invalid authorization header' };
  }

  const token = authHeader.replace('Bearer ', '');
  
  try {
    const supabase = getSupabaseAdmin();
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return { valid: false, error: 'Invalid or expired token' };
    }

    // Verificar que el usuario esté activo
    if (user.user_metadata?.is_active === false) {
      return { valid: false, error: 'User account is inactive' };
    }

    // Verificar que la cuenta no esté pausada o eliminada
    const { data: preferences } = await supabase
      .from('profile_preferences')
      .select('account_paused, account_deleted')
      .eq('user_id', user.id)
      .single();

    if (preferences?.account_paused || preferences?.account_deleted) {
      return { valid: false, error: 'User account is paused or deleted' };
    }

    return { valid: true, userId: user.id };
  } catch (error) {
    console.error('Session validation error:', error);
    return { valid: false, error: 'Session validation failed' };
  }
}

// =====================================================
// 5. VALIDACIÓN DE FIRMA (PARA WEBHOOKS)
// =====================================================

export function validateWebhookSignature(
  payload: string,
  signature: string | null,
  secret: string
): boolean {
  if (!signature) {
    return false;
  }

  try {
    // Usar Web Crypto API para validar HMAC
    const encoder = new TextEncoder();
    const keyData = encoder.encode(secret);
    const messageData = encoder.encode(payload);

    // Crear clave HMAC
    return crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    ).then(key => {
      return crypto.subtle.sign('HMAC', key, messageData);
    }).then(signatureBuffer => {
      const calculatedSignature = Array.from(new Uint8Array(signatureBuffer))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
      
      return calculatedSignature === signature.replace('sha256=', '');
    }).catch(() => false);
  } catch (error) {
    console.error('Signature validation error:', error);
    return false;
  }
}

// =====================================================
// 6. RATE LIMITING EXTREMO
// =====================================================

export async function checkRateLimit(
  identifier: string, // userId o IP
  endpoint: string
): Promise<RateLimitResult> {
  const supabase = getSupabaseAdmin();
  const now = Date.now();
  const minuteKey = `rate_limit:${identifier}:${endpoint}:${Math.floor(now / 60000)}`;
  const hourKey = `rate_limit:${identifier}:${endpoint}:${Math.floor(now / 3600000)}`;

  try {
    // Verificar si la IP está bloqueada
    const { data: blockedIp } = await supabase
      .rpc('is_ip_blocked', { p_ip_address: identifier.includes('.') ? identifier : null });

    if (blockedIp) {
      return {
        allowed: false,
        remaining: 0,
        resetAt: now + (BLOCK_DURATION_MINUTES * 60 * 1000),
        blocked: true
      };
    }

    // Contar requests en el último minuto (simulado con tabla)
    // En producción, usar Redis o similar
    const { data: recentAttempts } = await supabase
      .rpc('get_recent_failed_attempts', {
        p_user_id: identifier.includes('-') ? identifier : null,
        p_ip_address: identifier.includes('.') ? identifier : null,
        p_minutes: 1
      });

    const minuteCount = recentAttempts || 0;

    if (minuteCount >= MAX_REQUESTS_PER_MINUTE) {
      // Registrar intento fallido
      await supabase.rpc('register_failed_attempt', {
        p_user_id: identifier.includes('-') ? identifier : null,
        p_ip_address: identifier.includes('.') ? identifier : null,
        p_attempt_type: 'api_call',
        p_endpoint: endpoint
      });

      return {
        allowed: false,
        remaining: 0,
        resetAt: now + 60000,
        blocked: false
      };
    }

    return {
      allowed: true,
      remaining: MAX_REQUESTS_PER_MINUTE - minuteCount,
      resetAt: now + 60000,
      blocked: false
    };
  } catch (error) {
    console.error('Rate limit check error:', error);
    // En caso de error, permitir pero registrar
    return {
      allowed: true,
      remaining: MAX_REQUESTS_PER_MINUTE,
      resetAt: now + 60000,
      blocked: false
    };
  }
}

// =====================================================
// 7. OBTENER IP DEL REQUEST
// =====================================================

export function getClientIP(req: Request): string {
  // Intentar obtener IP de headers comunes
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }

  const realIp = req.headers.get('x-real-ip');
  if (realIp) {
    return realIp;
  }

  // Fallback
  return 'unknown';
}

// =====================================================
// 8. MIDDLEWARE DE SEGURIDAD COMPLETO
// =====================================================

export async function securityMiddleware(
  req: Request,
  requireAuth: boolean = true
): Promise<{
  authorized: boolean;
  userId?: string;
  error?: string;
  status?: number;
}> {
  const ipAddress = getClientIP(req);
  const userAgent = req.headers.get('user-agent') || 'unknown';
  const endpoint = new URL(req.url).pathname;

  // 1. Verificar rate limiting
  const rateLimit = await checkRateLimit(ipAddress, endpoint);
  if (!rateLimit.allowed) {
    return {
      authorized: false,
      error: rateLimit.blocked 
        ? 'IP address is blocked due to suspicious activity'
        : 'Rate limit exceeded. Please try again later.',
      status: rateLimit.blocked ? 403 : 429
    };
  }

  // 2. Validar autenticación si es requerida
  if (requireAuth) {
    const authHeader = req.headers.get('authorization');
    const sessionValidation = await validateSession(authHeader);

    if (!sessionValidation.valid) {
      // Registrar intento fallido
      const supabase = getSupabaseAdmin();
      await supabase.rpc('register_failed_attempt', {
        p_user_id: null,
        p_ip_address: ipAddress,
        p_attempt_type: 'api_call',
        p_endpoint: endpoint,
        p_user_agent: userAgent
      });

      return {
        authorized: false,
        error: sessionValidation.error || 'Unauthorized',
        status: 401
      };
    }

    return {
      authorized: true,
      userId: sessionValidation.userId
    };
  }

  return { authorized: true };
}

// =====================================================
// 9. RESPUESTA GENÉRICA (ANTI-FINGERPRINTING)
// =====================================================

export function genericErrorResponse(
  message: string = 'An error occurred',
  status: number = 500
): Response {
  // Respuesta genérica que no revela detalles internos
  return new Response(
    JSON.stringify({
      error: message,
      timestamp: new Date().toISOString()
    }),
    {
      status,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    }
  );
}

// =====================================================
// 10. VALIDACIÓN DE INPUTS
// =====================================================

export function validateInput(
  data: any,
  schema: Record<string, (value: any) => boolean>
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  for (const [key, validator] of Object.entries(schema)) {
    if (!(key in data)) {
      errors.push(`Missing required field: ${key}`);
      continue;
    }

    if (!validator(data[key])) {
      errors.push(`Invalid value for field: ${key}`);
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

// =====================================================
// FIN DE SISTEMA DE SEGURIDAD
// =====================================================

