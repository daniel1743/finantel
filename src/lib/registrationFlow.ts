// ============================================================================
// FLUJO DE REGISTRO CON DETECCIÓN DE ABUSO
// ============================================================================
// Integra la verificación de riesgo de IP en el flujo de registro
// ============================================================================

import { checkIPRisk } from './deviceFingerprint';
import type { SupabaseClient } from '@supabase/supabase-js';

interface RegistrationResult {
  success: boolean;
  user?: any;
  requiresVerification: boolean;
  riskLevel: string;
  reason?: string;
  error?: string;
  eventId?: string;
  ipAddress?: string;
  deviceFingerprint?: string;
}

/**
 * Flujo completo de registro con verificación de riesgo
 */
export async function registerWithRiskCheck(
  supabase: SupabaseClient,
  email: string,
  password: string,
  metadata?: Record<string, any>
): Promise<RegistrationResult> {
  try {
    // PASO 1: Verificar riesgo de IP antes de crear cuenta
    console.log('Verificando riesgo de IP...');
    const riskCheck = await checkIPRisk(supabase, email);

    // Si está bloqueado, retornar error con información adicional
    if (!riskCheck.allowed) {
      return {
        success: false,
        requiresVerification: false,
        riskLevel: riskCheck.risk_level,
        reason: riskCheck.reason || 'Registro bloqueado por política de seguridad',
        error: 'REGISTRATION_BLOCKED',
        // Información adicional para el componente de apelación
        eventId: (riskCheck as any).event_id,
        ipAddress: (riskCheck as any).ip_address,
        deviceFingerprint: (riskCheck as any).device_fingerprint,
      };
    }

    // PASO 2: Crear cuenta en Supabase Auth
    console.log('Creando cuenta...');
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          ...metadata,
          risk_level: riskCheck.risk_level,
          risk_score: riskCheck.risk_score,
          registration_ip: 'detected', // Se detecta automáticamente en el backend
        },
      },
    });

    if (authError) {
      return {
        success: false,
        requiresVerification: riskCheck.requires_verification,
        riskLevel: riskCheck.risk_level,
        error: authError.message,
      };
    }

    // PASO 3: Si requiere verificación, marcar en metadata
    if (riskCheck.requires_verification && authData.user) {
      // Actualizar metadata del usuario
      await supabase.auth.updateUser({
        data: {
          requires_email_verification: true,
          risk_level: riskCheck.risk_level,
        },
      });
    }

    // PASO 4: Registrar evento de registro exitoso (opcional)
    if (authData.user) {
      // El evento ya fue registrado por check_ip_risk, pero podemos agregar metadata adicional
      console.log('Registro exitoso. Risk level:', riskCheck.risk_level);
    }

    return {
      success: true,
      user: authData.user,
      requiresVerification: riskCheck.requires_verification || !authData.session,
      riskLevel: riskCheck.risk_level,
      reason: riskCheck.reason,
    };
  } catch (error: any) {
    console.error('Error en registro:', error);
    return {
      success: false,
      requiresVerification: true,
      riskLevel: 'unknown',
      error: error.message || 'Error desconocido en el registro',
    };
  }
}

/**
 * Verificar si el email requiere verificación adicional
 */
export async function requiresEmailVerification(
  supabase: SupabaseClient,
  email: string
): Promise<boolean> {
  try {
    const riskCheck = await checkIPRisk(supabase, email);
    return riskCheck.requires_verification;
  } catch (error) {
    console.error('Error al verificar necesidad de verificación:', error);
    return true; // Por seguridad, requerir verificación si hay error
  }
}

/**
 * Componente de registro mejorado (para usar en formularios)
 */
export function createRegistrationHandler(
  supabase: SupabaseClient,
  onSuccess?: (result: RegistrationResult) => void,
  onError?: (error: string) => void
) {
  return async (email: string, password: string, metadata?: Record<string, any>) => {
    const result = await registerWithRiskCheck(supabase, email, password, metadata);

    if (result.success) {
      onSuccess?.(result);
    } else {
      onError?.(result.error || result.reason || 'Error en el registro');
    }

    return result;
  };
}

