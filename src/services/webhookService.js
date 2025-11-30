// =====================================================
// SERVICIO: WebhookService
// =====================================================
// Servicio para gestionar webhooks externos desde el panel admin
// =====================================================

import { supabase } from '@/lib/customSupabaseClient';

/**
 * Obtener todos los webhooks con filtros
 */
export async function getAllWebhooks(filters = {}) {
  try {
    let query = supabase
      .from('external_webhooks')
      .select('*')
      .order('created_at', { ascending: false });

    // Aplicar filtros
    if (filters.source) {
      query = query.eq('source', filters.source);
    }
    if (filters.event_type) {
      query = query.eq('event_type', filters.event_type);
    }
    if (filters.status) {
      query = query.eq('status', filters.status);
    }
    if (filters.from_date) {
      query = query.gte('created_at', filters.from_date);
    }
    if (filters.to_date) {
      query = query.lte('created_at', filters.to_date);
    }

    // Límite por defecto
    const limit = filters.limit || 100;
    query = query.limit(limit);

    const { data, error } = await query;

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching webhooks:', error);
    return { data: null, error };
  }
}

/**
 * Obtener un webhook por ID
 */
export async function getWebhook(webhookId) {
  try {
    const { data, error } = await supabase
      .from('external_webhooks')
      .select('*')
      .eq('id', webhookId)
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching webhook:', error);
    return { data: null, error };
  }
}

/**
 * Filtrar webhooks con parámetros avanzados
 */
export async function filterWebhooks(params = {}) {
  const {
    source,
    eventType,
    status,
    fromDate,
    toDate,
    limit = 100,
    offset = 0,
  } = params;

  try {
    let query = supabase
      .from('external_webhooks')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });

    if (source) query = query.eq('source', source);
    if (eventType) query = query.eq('event_type', eventType);
    if (status) query = query.eq('status', status);
    if (fromDate) query = query.gte('created_at', fromDate);
    if (toDate) query = query.lte('created_at', toDate);

    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) throw error;
    return { data, count, error: null };
  } catch (error) {
    console.error('Error filtering webhooks:', error);
    return { data: null, count: 0, error };
  }
}

/**
 * Suscribirse a webhooks en tiempo real (Realtime)
 */
export function subscribeToWebhooksRealtime(callback) {
  const subscription = supabase
    .channel('external_webhooks_changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'external_webhooks',
      },
      (payload) => {
        callback(payload);
      }
    )
    .subscribe();

  return subscription;
}

/**
 * Obtener estadísticas de webhooks
 */
export async function getWebhookStats() {
  try {
    const { data, error } = await supabase
      .from('external_webhooks')
      .select('source, status, event_type');

    if (error) throw error;

    // Calcular estadísticas
    const stats = {
      total: data.length,
      by_source: {},
      by_status: {},
      by_event_type: {},
    };

    data.forEach((webhook) => {
      // Por fuente
      stats.by_source[webhook.source] = (stats.by_source[webhook.source] || 0) + 1;
      
      // Por estado
      stats.by_status[webhook.status] = (stats.by_status[webhook.status] || 0) + 1;
      
      // Por tipo de evento
      stats.by_event_type[webhook.event_type] = (stats.by_event_type[webhook.event_type] || 0) + 1;
    });

    return { data: stats, error: null };
  } catch (error) {
    console.error('Error fetching webhook stats:', error);
    return { data: null, error };
  }
}

