// =====================================================
// HELPER: Sistema de Logging de Eventos
// =====================================================
// Logger simple, eficiente y escalable para notificaciones
// del sistema administrativo
// =====================================================

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Tipos de eventos
export type EventType = 'error' | 'warning' | 'info' | 'usage';
export type EventSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface LogEventParams {
  type: EventType;
  title: string;
  message: string;
  severity?: EventSeverity;
  origin: string;
  payload?: Record<string, any>;
}

/**
 * Registra un evento en el sistema de notificaciones
 * Incluye anti-spam: no registra eventos duplicados en los últimos 5 minutos
 *
 * @param params - Parámetros del evento a registrar
 * @returns true si se registró exitosamente, false si fue bloqueado por anti-spam
 */
export async function logEvent(params: LogEventParams): Promise<boolean> {
  const {
    type,
    title,
    message,
    severity = 'low',
    origin,
    payload = {},
  } = params;

  try {
    // Crear cliente Supabase con service_role para bypass RLS
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // =====================================================
    // ANTI-SPAM: Verificar si existe el mismo evento en los últimos 5 minutos
    // =====================================================
    const fiveMinutesAgo = new Date();
    fiveMinutesAgo.setMinutes(fiveMinutesAgo.getMinutes() - 5);

    const { data: existingEvent, error: checkError } = await supabase
      .from('system_notifications')
      .select('id, count')
      .eq('title', title)
      .eq('origin', origin)
      .gte('created_at', fiveMinutesAgo.toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (checkError) {
      console.error('Error checking for duplicate events:', checkError);
      // Continuar con el insert aunque falle el check
    }

    if (existingEvent) {
      // Si existe un evento duplicado, incrementar el contador
      const { error: updateError } = await supabase
        .from('system_notifications')
        .update({
          count: (existingEvent.count || 1) + 1,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingEvent.id);

      if (updateError) {
        console.error('Error updating duplicate event count:', updateError);
      }

      console.log(`[ANTI-SPAM] Evento duplicado detectado: "${title}". Contador incrementado.`);
      return false; // No crear nuevo evento
    }

    // =====================================================
    // Insertar nuevo evento
    // =====================================================
    const { error: insertError } = await supabase
      .from('system_notifications')
      .insert({
        type,
        title,
        message,
        severity,
        origin,
        payload,
        count: 1,
      });

    if (insertError) {
      console.error('Error inserting notification:', insertError);
      return false;
    }

    console.log(`[LOGGER] Evento registrado: [${severity.toUpperCase()}] ${title}`);
    return true;

  } catch (error) {
    console.error('Error in logEvent:', error);
    return false;
  }
}

// =====================================================
// FUNCIONES PRECREADAS PARA EVENTOS COMUNES
// =====================================================

/**
 * Registra un error crítico del sistema
 */
export async function logError(title: string, message: string, origin: string, error?: any) {
  return await logEvent({
    type: 'error',
    severity: 'high',
    title,
    message,
    origin,
    payload: error ? { error: JSON.stringify(error, Object.getOwnPropertyNames(error)) } : {},
  });
}

/**
 * Registra un error crítico (nivel máximo)
 */
export async function logCriticalError(title: string, message: string, origin: string, error?: any) {
  return await logEvent({
    type: 'error',
    severity: 'critical',
    title,
    message,
    origin,
    payload: error ? { error: JSON.stringify(error, Object.getOwnPropertyNames(error)) } : {},
  });
}

/**
 * Registra una advertencia (warning)
 */
export async function logWarning(title: string, message: string, origin: string, details?: any) {
  return await logEvent({
    type: 'warning',
    severity: 'medium',
    title,
    message,
    origin,
    payload: details || {},
  });
}

/**
 * Registra información general del sistema
 */
export async function logInfo(title: string, message: string, origin: string, details?: any) {
  return await logEvent({
    type: 'info',
    severity: 'low',
    title,
    message,
    origin,
    payload: details || {},
  });
}

/**
 * Registra uso/actividad de usuarios
 */
export async function logUsage(title: string, message: string, origin: string, userId?: string) {
  return await logEvent({
    type: 'usage',
    severity: 'low',
    title,
    message,
    origin,
    payload: userId ? { user_id: userId } : {},
  });
}

/**
 * Registra métricas del sistema
 */
export async function logMetric(metricName: string, value: number, metadata?: Record<string, any>) {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { error } = await supabase
      .from('system_metrics')
      .insert({
        metric_name: metricName,
        value,
        metadata: metadata || {},
      });

    if (error) {
      console.error('Error inserting metric:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in logMetric:', error);
    return false;
  }
}

// =====================================================
// HUMANIZADOR DE NOTIFICACIONES
// =====================================================

/**
 * Convierte un evento en un mensaje humanizado y profesional
 */
export function humanizeNotification(notification: any): string {
  const { type, title, message, severity, origin, payload } = notification;

  let humanMessage = `${title}: ${message}`;

  // Agregar contexto del payload si existe
  if (payload && Object.keys(payload).length > 0) {
    if (payload.error_code) {
      humanMessage += `\nCódigo de error: ${payload.error_code}`;
    }
    if (payload.details) {
      humanMessage += `\nDetalles: ${payload.details}`;
    }
    if (payload.user_id) {
      humanMessage += `\nUsuario afectado: ${payload.user_id}`;
    }
  }

  // Agregar origen
  humanMessage += `\n\nOcurrió en: ${origin}`;

  // Agregar severidad
  const severityLabels = {
    low: 'Severidad baja',
    medium: 'Severidad media',
    high: 'Severidad alta',
    critical: 'CRÍTICO - Requiere atención inmediata',
  };
  humanMessage += `\n${severityLabels[severity as EventSeverity] || severity}`;

  return humanMessage;
}

/**
 * Obtiene un emoji según el tipo y severidad del evento
 */
export function getEventEmoji(type: EventType, severity: EventSeverity): string {
  if (severity === 'critical') return '🚨';

  const emojiMap: Record<EventType, string> = {
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️',
    usage: '📊',
  };

  return emojiMap[type] || '📝';
}

/**
 * Obtiene un color según la severidad
 */
export function getSeverityColor(severity: EventSeverity): string {
  const colorMap: Record<EventSeverity, string> = {
    low: '#10B981',      // green
    medium: '#F59E0B',   // yellow
    high: '#EF4444',     // red
    critical: '#DC2626', // dark red
  };

  return colorMap[severity] || '#6B7280';
}
