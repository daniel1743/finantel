// =====================================================
// SERVICIO: AdminNotificationsService
// =====================================================
// Servicio para gestionar notificaciones administrativas
// =====================================================

import { supabase } from '@/lib/customSupabaseClient';

/**
 * Obtener todas las notificaciones administrativas
 */
export async function getAdminNotifications(filters = {}) {
  try {
    let query = supabase
      .from('admin_notifications')
      .select('*')
      .order('created_at', { ascending: false });

    // Aplicar filtros
    if (filters.type) {
      query = query.eq('type', filters.type);
    }
    if (filters.source) {
      query = query.eq('source', filters.source);
    }
    if (filters.is_read !== undefined) {
      query = query.eq('is_read', filters.is_read);
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
    console.error('Error fetching admin notifications:', error);
    return { data: null, error };
  }
}

/**
 * Marcar notificación como leída
 */
export async function markNotificationAsRead(notificationId) {
  try {
    const { error } = await supabase.rpc('mark_admin_notification_read', {
      p_notification_id: notificationId,
    });

    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return { error };
  }
}

/**
 * Marcar todas las notificaciones como leídas
 */
export async function markAllNotificationsAsRead() {
  try {
    const { error } = await supabase
      .from('admin_notifications')
      .update({ is_read: true })
      .eq('is_read', false);

    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    return { error };
  }
}

/**
 * Suscribirse a notificaciones administrativas en tiempo real
 */
export function subscribeToAdminNotificationsRealtime(callback) {
  const subscription = supabase
    .channel('admin_notifications_changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'admin_notifications',
      },
      (payload) => {
        callback(payload);
      }
    )
    .subscribe();

  return subscription;
}

/**
 * Obtener estadísticas de notificaciones administrativas
 */
export async function getAdminNotificationStats() {
  try {
    const { data, error } = await supabase.rpc('get_admin_notification_stats');

    if (error) throw error;
    return { data: data?.[0] || null, error: null };
  } catch (error) {
    console.error('Error fetching admin notification stats:', error);
    return { data: null, error };
  }
}

