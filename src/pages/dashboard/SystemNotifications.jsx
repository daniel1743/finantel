import React, { useState, useEffect } from 'react';
import Icon from '@/components/ui/Icon';
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
  EyeOff,
  XCircle
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
  const [filterSource, setFilterSource] = useState('all');
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
        .from('admin_notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      // Aplicar filtros
      if (filterType !== 'all') {
        query = query.eq('type', filterType);
      }

      if (filterSource !== 'all') {
        query = query.eq('source', filterSource);
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
      const { data, error } = await supabase.rpc('get_admin_notification_stats');

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
      .channel('admin_notifications_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'admin_notifications',
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
    if (isAdmin) {
      loadNotifications();
    }
  }, [filterType, showOnlyUnread, isAdmin]);

  // =====================================================
  // Marcar como leída
  // =====================================================
  const markAsRead = async (notificationId) => {
    try {
      const { error } = await supabase.rpc('mark_admin_notification_read', {
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
        .from('admin_notifications')
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
      payment_success: CheckCircle2,
      payment_error: XCircle,
      subscription: Activity,
      webhook_error: AlertCircle,
      system_alert: AlertTriangle,
      ticket_created: Info,
    };
    return icons[type] || Bell;
  };

  const getTypeColor = (type) => {
    const colors = {
      payment_success: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20',
      payment_error: 'text-red-500 bg-red-50 dark:bg-red-900/20',
      subscription: 'text-blue-500 bg-blue-50 dark:bg-blue-900/20',
      webhook_error: 'text-red-600 bg-red-50 dark:bg-red-900/20',
      system_alert: 'text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20',
      ticket_created: 'text-blue-500 bg-blue-50 dark:bg-blue-900/20',
    };
    return colors[type] || 'text-gray-500 bg-gray-50 dark:bg-gray-900/20';
  };

  const getTypeLabel = (type) => {
    const labels = {
      payment_success: 'Pago Exitoso',
      payment_error: 'Pago Fallido',
      subscription: 'Suscripción',
      webhook_error: 'Error Webhook',
      system_alert: 'Alerta Sistema',
      ticket_created: 'Ticket Creado',
    };
    return labels[type] || type;
  };

  // Verificando si es admin
  if (checkingAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Icon component={Loader2} size="xl" color="primary" className="animate-spin" />
      </div>
    );
  }

  // NO ES ADMIN - Acceso denegado (PRIVACIDAD PRIMERO)
  if (!isAdmin) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white dark:bg-[#1a1a1a] rounded-xl p-12 border border-red-200 dark:border-red-900/30 text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
            <Icon component={AlertTriangle} size="md" color="error" className="dark:" />
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
        <Icon component={Loader2} size="xl" color="primary" className="animate-spin" />
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
            Notificaciones del Sistema
          </h1>
          <p className="text-[#6E6E73] mt-1">
            Notificaciones administrativas: pagos, tickets, webhooks y eventos del sistema
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
              <Icon component={Loader2} size="sm" color="default" className="animate-spin" />
            ) : (
              <Icon component={RefreshCw} size="sm" color="default" />
            )}
          </Button>
          <Button
            onClick={markAllAsRead}
            variant="outline"
            className="border-gray-200"
          >
            <Icon component={CheckCircle2} size="sm" color="default" className="mr-2" />
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
            <Icon component={Filter} size="sm" color="default" />
            <span className="text-sm font-medium text-[#1a1a1a] dark:text-white">Filtros:</span>
          </div>

          {/* Filtro por tipo */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-sm"
          >
            <option value="all">Todos los tipos</option>
            <option value="payment_success">Pago Exitoso</option>
            <option value="payment_error">Pago Fallido</option>
            <option value="subscription">Suscripción</option>
            <option value="webhook_error">Error Webhook</option>
            <option value="system_alert">Alerta Sistema</option>
            <option value="ticket_created">Ticket Creado</option>
          </select>

          {/* Filtro por fuente */}
          <select
            value={filterSource}
            onChange={(e) => setFilterSource(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-sm"
          >
            <option value="all">Todas las fuentes</option>
            <option value="mercadopago">Mercado Pago</option>
            <option value="finantel">Finantel</option>
            <option value="system">Sistema</option>
          </select>

          {/* Mostrar solo no leídas */}
          <Button
            onClick={() => setShowOnlyUnread(!showOnlyUnread)}
            variant={showOnlyUnread ? 'default' : 'outline'}
            size="sm"
            className={showOnlyUnread ? 'bg-[#1C8FA0] hover:bg-[#167a8a]' : ''}
          >
            {showOnlyUnread ? <Icon component={Eye} size="sm" color="default" className="mr-2" /> : <Icon component={EyeOff} size="sm" color="default" className="mr-2" />}
            Solo no leídas
          </Button>
        </div>
      </div>

      {/* Lista de notificaciones */}
      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {notifications.length === 0 ? (
            <div className="bg-white dark:bg-[#1a1a1a] rounded-xl p-12 border border-gray-100 dark:border-white/5 text-center">
              <Icon component={Bell} size="md" color="default" className="mx-auto mb-4" />
              <p className="text-[#6E6E73]">No hay notificaciones con los filtros seleccionados</p>
            </div>
          ) : (
            notifications.map((notification) => {
              const Icon = getTypeIcon(notification.type);

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
                    <div className={`flex-shrink-0 w-12 h-12 rounded-full ${getTypeColor(notification.type)} flex items-center justify-center`}>
                      <Icon className="w-6 h-6" />
                    </div>

                    {/* Contenido */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div className="flex-1">
                          <h3 className="font-bold text-[#1a1a1a] dark:text-white mb-1">
                            {notification.title}
                          </h3>
                          <p className="text-sm text-[#6E6E73] mb-2">{notification.message}</p>
                          <div className="flex items-center gap-2 text-xs text-[#6E6E73]">
                            {notification.source && (
                              <>
                                <span className="font-mono bg-gray-100 dark:bg-white/5 px-2 py-1 rounded">
                                  {notification.source}
                                </span>
                                <span>•</span>
                              </>
                            )}
                            <span>{new Date(notification.created_at).toLocaleString('es-ES')}</span>
                            <span>•</span>
                            <span className="px-2 py-1 rounded-full bg-gray-100 dark:bg-white/5 text-xs">
                              {getTypeLabel(notification.type)}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {!notification.is_read && (
                            <Button
                              onClick={() => markAsRead(notification.id)}
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0"
                            >
                              <Icon component={CheckCircle2} size="sm" color="default" />
                            </Button>
                          )}
                        </div>
                      </div>

                      {/* Metadata (JSON) */}
                      {notification.metadata && Object.keys(notification.metadata).length > 0 && (
                        <details className="mt-3">
                          <summary className="cursor-pointer text-xs text-[#1C8FA0] font-medium">
                            Ver detalles técnicos
                          </summary>
                          <pre className="mt-2 p-3 bg-gray-50 dark:bg-white/5 rounded-lg text-xs overflow-x-auto">
                            {JSON.stringify(notification.metadata, null, 2)}
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
