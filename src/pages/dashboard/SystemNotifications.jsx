import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/lib/customSupabaseClient';
import { Button } from '@/components/ui/button';
import {
  Bell,
  AlertTriangle,
  AlertCircle,
  Info,
  Activity,
  Loader2,
  CheckCircle2,
  Filter,
  RefreshCw,
  Trash2,
  Eye,
  EyeOff
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { motion, AnimatePresence } from 'framer-motion';

const SystemNotifications = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const [notifications, setNotifications] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingAdmin, setCheckingAdmin] = useState(true);

  // Filtros
  const [filterType, setFilterType] = useState('all');
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [showOnlyUnread, setShowOnlyUnread] = useState(false);

  // =====================================================
  // Verificar si el usuario es admin
  // =====================================================
  const checkAdminStatus = async () => {
    if (!user?.id) {
      setIsAdmin(false);
      setCheckingAdmin(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('profile_preferences')
        .select('is_staff')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
      } else {
        setIsAdmin(data?.is_staff || false);
      }
    } catch (error) {
      console.error('Error in checkAdminStatus:', error);
      setIsAdmin(false);
    } finally {
      setCheckingAdmin(false);
    }
  };

  // =====================================================
  // Cargar notificaciones
  // =====================================================
  const loadNotifications = async (showLoadingState = true) => {
    // Solo cargar si el usuario es admin
    if (!isAdmin) {
      setLoading(false);
      return;
    }

    if (showLoadingState) {
      setLoading(true);
    }

    try {
      let query = supabase
        .from('system_notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      // Aplicar filtros
      if (filterType !== 'all') {
        query = query.eq('type', filterType);
      }

      if (filterSeverity !== 'all') {
        query = query.eq('severity', filterSeverity);
      }

      if (showOnlyUnread) {
        query = query.eq('is_read', false);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      setNotifications(data || []);
    } catch (error) {
      console.error('Error loading notifications:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudieron cargar las notificaciones',
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // =====================================================
  // Cargar estadísticas
  // =====================================================
  const loadStats = async () => {
    try {
      const { data, error } = await supabase.rpc('get_notification_stats');

      if (error) {
        throw error;
      }

      if (data && data.length > 0) {
        setStats(data[0]);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  // Verificar si es admin primero
  useEffect(() => {
    checkAdminStatus();
  }, [user?.id]);

  // Cargar notificaciones solo si es admin
  useEffect(() => {
    if (!isAdmin || checkingAdmin) {
      return;
    }

    loadNotifications();
    loadStats();

    // Suscripción en tiempo real
    const subscription = supabase
      .channel('system_notifications_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'system_notifications',
        },
        (payload) => {
          console.log('Nueva notificación recibida:', payload);
          loadNotifications(false);
          loadStats();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [isAdmin, checkingAdmin]);

  // Recargar cuando cambien los filtros
  useEffect(() => {
    loadNotifications();
  }, [filterType, filterSeverity, showOnlyUnread]);

  // =====================================================
  // Marcar como leída
  // =====================================================
  const markAsRead = async (notificationId) => {
    try {
      const { error } = await supabase.rpc('mark_notification_read', {
        p_notification_id: notificationId,
      });

      if (error) {
        throw error;
      }

      // Actualizar estado local
      setNotifications((prev) =>
        prev.map((notif) =>
          notif.id === notificationId ? { ...notif, is_read: true } : notif
        )
      );

      loadStats();
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  // =====================================================
  // Marcar todas como leídas
  // =====================================================
  const markAllAsRead = async () => {
    try {
      const { error } = await supabase
        .from('system_notifications')
        .update({ is_read: true })
        .eq('is_read', false);

      if (error) {
        throw error;
      }

      toast({
        title: '✅ Listo',
        description: 'Todas las notificaciones marcadas como leídas',
      });

      loadNotifications(false);
      loadStats();
    } catch (error) {
      console.error('Error marking all as read:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudieron marcar las notificaciones',
      });
    }
  };

  // =====================================================
  // Refrescar
  // =====================================================
  const handleRefresh = () => {
    setRefreshing(true);
    loadNotifications();
    loadStats();
  };

  // =====================================================
  // Helpers de UI
  // =====================================================
  const getTypeIcon = (type) => {
    const icons = {
      error: AlertCircle,
      warning: AlertTriangle,
      info: Info,
      usage: Activity,
    };
    return icons[type] || Bell;
  };

  const getTypeColor = (type, severity) => {
    if (severity === 'critical') {
      return 'text-red-600 bg-red-50 dark:bg-red-900/20';
    }

    const colors = {
      error: 'text-red-500 bg-red-50 dark:bg-red-900/20',
      warning: 'text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20',
      info: 'text-blue-500 bg-blue-50 dark:bg-blue-900/20',
      usage: 'text-green-500 bg-green-50 dark:bg-green-900/20',
    };
    return colors[type] || 'text-gray-500 bg-gray-50 dark:bg-gray-900/20';
  };

  const getSeverityBadge = (severity) => {
    const badges = {
      low: { label: 'Bajo', className: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300' },
      medium: { label: 'Medio', className: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' },
      high: { label: 'Alto', className: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' },
      critical: { label: 'CRÍTICO', className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 font-bold' },
    };
    return badges[severity] || badges.low;
  };

  // Verificando si es admin
  if (checkingAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-[#1C8FA0]" />
      </div>
    );
  }

  // NO ES ADMIN - Acceso denegado (PRIVACIDAD PRIMERO)
  if (!isAdmin) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white dark:bg-[#1a1a1a] rounded-xl p-12 border border-red-200 dark:border-red-900/30 text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
            <AlertTriangle className="w-10 h-10 text-red-600 dark:text-red-400" />
          </div>
          <h1 className="text-2xl font-bold text-[#1a1a1a] dark:text-white mb-4">
            Acceso Denegado
          </h1>
          <p className="text-[#6E6E73] mb-6 max-w-md mx-auto">
            Esta sección contiene información sensible del sistema y está restringida únicamente al administrador.
          </p>
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 max-w-md mx-auto">
            <p className="text-sm text-blue-700 dark:text-blue-300 font-medium">
              🔒 Privacidad Primero
            </p>
            <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
              Protegemos la privacidad de nuestros usuarios con el más alto estándar de seguridad.
              Solo personal autorizado puede acceder a esta información.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Cargando notificaciones
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-[#1C8FA0]" />
      </div>
    );
  }

  // USUARIO ES ADMIN - Mostrar notificaciones
  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-[#1a1a1a] dark:text-white">
            Sistema de Notificaciones
          </h1>
          <p className="text-[#6E6E73] mt-1">
            Monitoreo en tiempo real de eventos, errores y uso del sistema
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleRefresh}
            disabled={refreshing}
            variant="outline"
            className="border-gray-200"
          >
            {refreshing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
          </Button>
          <Button
            onClick={markAllAsRead}
            variant="outline"
            className="border-gray-200"
          >
            <CheckCircle2 className="w-4 h-4 mr-2" />
            Marcar todas como leídas
          </Button>
        </div>
      </div>

      {/* Estadísticas */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          <div className="bg-white dark:bg-[#1a1a1a] rounded-xl p-4 border border-gray-100 dark:border-white/5">
            <div className="text-2xl font-bold text-[#1a1a1a] dark:text-white">
              {stats.total_count || 0}
            </div>
            <div className="text-xs text-[#6E6E73]">Total</div>
          </div>
          <div className="bg-white dark:bg-[#1a1a1a] rounded-xl p-4 border border-gray-100 dark:border-white/5">
            <div className="text-2xl font-bold text-blue-500">
              {stats.unread_count || 0}
            </div>
            <div className="text-xs text-[#6E6E73]">No leídas</div>
          </div>
          <div className="bg-white dark:bg-[#1a1a1a] rounded-xl p-4 border border-gray-100 dark:border-white/5">
            <div className="text-2xl font-bold text-red-500">
              {stats.error_count || 0}
            </div>
            <div className="text-xs text-[#6E6E73]">Errores</div>
          </div>
          <div className="bg-white dark:bg-[#1a1a1a] rounded-xl p-4 border border-gray-100 dark:border-white/5">
            <div className="text-2xl font-bold text-yellow-500">
              {stats.warning_count || 0}
            </div>
            <div className="text-xs text-[#6E6E73]">Advertencias</div>
          </div>
          <div className="bg-white dark:bg-[#1a1a1a] rounded-xl p-4 border border-gray-100 dark:border-white/5">
            <div className="text-2xl font-bold text-blue-500">
              {stats.info_count || 0}
            </div>
            <div className="text-xs text-[#6E6E73]">Info</div>
          </div>
          <div className="bg-white dark:bg-[#1a1a1a] rounded-xl p-4 border border-gray-100 dark:border-white/5">
            <div className="text-2xl font-bold text-green-500">
              {stats.usage_count || 0}
            </div>
            <div className="text-xs text-[#6E6E73]">Uso</div>
          </div>
          <div className="bg-white dark:bg-[#1a1a1a] rounded-xl p-4 border border-gray-100 dark:border-white/5">
            <div className="text-2xl font-bold text-red-600">
              {stats.critical_count || 0}
            </div>
            <div className="text-xs text-[#6E6E73]">Críticos</div>
          </div>
        </div>
      )}

      {/* Filtros */}
      <div className="bg-white dark:bg-[#1a1a1a] rounded-xl p-4 border border-gray-100 dark:border-white/5">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-[#6E6E73]" />
            <span className="text-sm font-medium text-[#1a1a1a] dark:text-white">Filtros:</span>
          </div>

          {/* Filtro por tipo */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-sm"
          >
            <option value="all">Todos los tipos</option>
            <option value="error">Errores</option>
            <option value="warning">Advertencias</option>
            <option value="info">Información</option>
            <option value="usage">Uso</option>
          </select>

          {/* Filtro por severidad */}
          <select
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-sm"
          >
            <option value="all">Todas las severidades</option>
            <option value="low">Baja</option>
            <option value="medium">Media</option>
            <option value="high">Alta</option>
            <option value="critical">Crítica</option>
          </select>

          {/* Mostrar solo no leídas */}
          <Button
            onClick={() => setShowOnlyUnread(!showOnlyUnread)}
            variant={showOnlyUnread ? 'default' : 'outline'}
            size="sm"
            className={showOnlyUnread ? 'bg-[#1C8FA0] hover:bg-[#167a8a]' : ''}
          >
            {showOnlyUnread ? <Eye className="w-4 h-4 mr-2" /> : <EyeOff className="w-4 h-4 mr-2" />}
            Solo no leídas
          </Button>
        </div>
      </div>

      {/* Lista de notificaciones */}
      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {notifications.length === 0 ? (
            <div className="bg-white dark:bg-[#1a1a1a] rounded-xl p-12 border border-gray-100 dark:border-white/5 text-center">
              <Bell className="w-12 h-12 mx-auto mb-4 text-[#6E6E73]" />
              <p className="text-[#6E6E73]">No hay notificaciones con los filtros seleccionados</p>
            </div>
          ) : (
            notifications.map((notification) => {
              const Icon = getTypeIcon(notification.type);
              const severityBadge = getSeverityBadge(notification.severity);

              return (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className={`
                    bg-white dark:bg-[#1a1a1a] rounded-xl p-6 border
                    ${
                      notification.is_read
                        ? 'border-gray-100 dark:border-white/5 opacity-60'
                        : 'border-gray-200 dark:border-white/10'
                    }
                    hover:shadow-md transition-all duration-200
                  `}
                >
                  <div className="flex gap-4">
                    {/* Icono */}
                    <div className={`flex-shrink-0 w-12 h-12 rounded-full ${getTypeColor(notification.type, notification.severity)} flex items-center justify-center`}>
                      <Icon className="w-6 h-6" />
                    </div>

                    {/* Contenido */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div className="flex-1">
                          <h3 className="font-bold text-[#1a1a1a] dark:text-white mb-1">
                            {notification.count > 1 && (
                              <span className="inline-block mr-2 px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-xs font-bold">
                                {notification.count}x
                              </span>
                            )}
                            {notification.title}
                          </h3>
                          <p className="text-sm text-[#6E6E73] mb-2">{notification.message}</p>
                          <div className="flex items-center gap-2 text-xs text-[#6E6E73]">
                            <span className="font-mono bg-gray-100 dark:bg-white/5 px-2 py-1 rounded">
                              {notification.origin}
                            </span>
                            <span>•</span>
                            <span>{new Date(notification.created_at).toLocaleString('es-ES')}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${severityBadge.className}`}>
                            {severityBadge.label}
                          </span>
                          {!notification.is_read && (
                            <Button
                              onClick={() => markAsRead(notification.id)}
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </div>

                      {/* Payload (JSON) */}
                      {notification.payload && Object.keys(notification.payload).length > 0 && (
                        <details className="mt-3">
                          <summary className="cursor-pointer text-xs text-[#1C8FA0] font-medium">
                            Ver detalles técnicos
                          </summary>
                          <pre className="mt-2 p-3 bg-gray-50 dark:bg-white/5 rounded-lg text-xs overflow-x-auto">
                            {JSON.stringify(notification.payload, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default SystemNotifications;
