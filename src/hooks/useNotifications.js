import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';

/**
 * Hook para gestionar notificaciones del usuario
 * Consulta la tabla 'alerts' de Supabase y mantiene el conteo de no leídas
 */
export const useNotifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Función para obtener notificaciones
  const fetchNotifications = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('alerts')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_dismissed', false)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Error fetching notifications:', error);
        return;
      }

      setNotifications(data || []);
      // Contar notificaciones no leídas
      const unread = (data || []).filter(alert => !alert.is_read).length;
      setUnreadCount(unread);
    } catch (error) {
      console.error('Error in fetchNotifications:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // Marcar notificación como leída
  const markAsRead = useCallback(async (alertId) => {
    if (!user?.id) return;

    try {
      const { error } = await supabase
        .from('alerts')
        .update({ 
          is_read: true, 
          read_at: new Date().toISOString() 
        })
        .eq('id', alertId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error marking notification as read:', error);
        return false;
      }

      // Actualizar estado local
      setNotifications(prev => 
        prev.map(alert => 
          alert.id === alertId 
            ? { ...alert, is_read: true, read_at: new Date().toISOString() }
            : alert
        )
      );

      // Recalcular contador
      setUnreadCount(prev => Math.max(0, prev - 1));
      return true;
    } catch (error) {
      console.error('Error in markAsRead:', error);
      return false;
    }
  }, [user?.id]);

  // Marcar todas como leídas
  const markAllAsRead = useCallback(async () => {
    if (!user?.id || unreadCount === 0) return;

    try {
      const { error } = await supabase
        .from('alerts')
        .update({ 
          is_read: true, 
          read_at: new Date().toISOString() 
        })
        .eq('user_id', user.id)
        .eq('is_read', false)
        .eq('is_dismissed', false);

      if (error) {
        console.error('Error marking all as read:', error);
        return false;
      }

      // Actualizar estado local
      setNotifications(prev => 
        prev.map(alert => ({ 
          ...alert, 
          is_read: true, 
          read_at: new Date().toISOString() 
        }))
      );

      setUnreadCount(0);
      return true;
    } catch (error) {
      console.error('Error in markAllAsRead:', error);
      return false;
    }
  }, [user?.id, unreadCount]);

  // Cargar notificaciones al montar y cuando cambie el usuario
  useEffect(() => {
    fetchNotifications();

    // Suscribirse a cambios en tiempo real
    if (!user?.id) return;

    const channel = supabase
      .channel('alerts_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'alerts',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          // Recargar notificaciones cuando haya cambios
          fetchNotifications();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, fetchNotifications]);

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    refresh: fetchNotifications,
  };
};




