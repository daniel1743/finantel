import React, { useState, useEffect } from 'react';
import Icon from '@/components/ui/Icon';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Inbox,
  Search,
  Filter,
  Eye,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Copy,
  RefreshCw,
} from 'lucide-react';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';
import { getAllWebhooks, getWebhook, filterWebhooks, subscribeToWebhooksRealtime, getWebhookStats } from '@/services/webhookService';
import { supabase } from '@/lib/customSupabaseClient';

const sourceOptions = [
  { value: '', label: 'Todas las fuentes' },
  { value: 'mercadopago', label: 'Mercado Pago' },
  { value: 'stripe', label: 'Stripe' },
  { value: 'system', label: 'Sistema' },
];

const statusOptions = [
  { value: '', label: 'Todos los estados' },
  { value: 'received', label: 'Recibido' },
  { value: 'processed', label: 'Procesado' },
  { value: 'error', label: 'Error' },
];

const statusConfig = {
  received: { label: 'Recibido', icon: Clock, color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/20' },
  processed: { label: 'Procesado', icon: CheckCircle2, color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20' },
  error: { label: 'Error', icon: XCircle, color: 'bg-red-100 text-red-700 dark:bg-red-900/20' },
};

const WebhookInbox = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [webhooks, setWebhooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingAdmin, setCheckingAdmin] = useState(true);
  const [selectedWebhook, setSelectedWebhook] = useState(null);
  const [expandedWebhooks, setExpandedWebhooks] = useState(new Set());
  const [stats, setStats] = useState(null);

  // Filtros
  const [filters, setFilters] = useState({
    source: '',
    event_type: '',
    status: '',
    from_date: '',
    to_date: '',
  });
  const [searchTerm, setSearchTerm] = useState('');

  // Verificar si el usuario es admin
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

      if (error) throw error;
      setIsAdmin(data?.is_staff || false);
    } catch (error) {
      console.error('Error checking admin status:', error);
      setIsAdmin(false);
    } finally {
      setCheckingAdmin(false);
    }
  };

  // Cargar webhooks
  const loadWebhooks = async (showLoading = true) => {
    if (!isAdmin) {
      setLoading(false);
      return;
    }

    if (showLoading) {
      setLoading(true);
    }

    try {
      const result = await filterWebhooks({
        source: filters.source || undefined,
        eventType: filters.event_type || undefined,
        status: filters.status || undefined,
        fromDate: filters.from_date || undefined,
        toDate: filters.to_date || undefined,
        limit: 100,
      });

      if (result.error) throw result.error;

      // Filtrar por búsqueda si existe
      let filteredData = result.data || [];
      if (searchTerm) {
        filteredData = filteredData.filter(
          (w) =>
            w.event_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            w.source?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            JSON.stringify(w.payload)?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      setWebhooks(filteredData);
    } catch (error) {
      console.error('Error loading webhooks:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudieron cargar los webhooks',
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Cargar estadísticas
  const loadStats = async () => {
    try {
      const result = await getWebhookStats();
      if (result.error) throw result.error;
      setStats(result.data);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  // Copiar JSON al portapapeles
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copiado',
      description: 'JSON copiado al portapapeles',
    });
  };

  // Formatear JSON para mostrar
  const formatJSON = (obj) => {
    try {
      return JSON.stringify(obj, null, 2);
    } catch {
      return String(obj);
    }
  };

  // Verificar admin primero
  useEffect(() => {
    checkAdminStatus();
  }, [user?.id]);

  // Cargar webhooks solo si es admin
  useEffect(() => {
    if (!isAdmin || checkingAdmin) return;

    loadWebhooks();
    loadStats();

    // Suscripción en tiempo real
    const subscription = subscribeToWebhooksRealtime((payload) => {
      console.log('Nuevo webhook recibido:', payload);
      loadWebhooks(false);
      loadStats();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [isAdmin, checkingAdmin]);

  // Recargar cuando cambien los filtros
  useEffect(() => {
    if (isAdmin) {
      loadWebhooks();
    }
  }, [filters, searchTerm]);

  if (checkingAdmin) {
    return (
      <div className="flex items-center justify-center h-96">
        <Icon component={Loader2} size="xl" color="primary" className="animate-spin" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="text-center py-12">
        <Icon component={Inbox} size="md" color="default" className="mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-[#1a1a1a] dark:text-white mb-2">
          Acceso Restringido
        </h2>
        <p className="text-[#6E6E73] dark:text-gray-400 mb-6">
          Solo los administradores pueden acceder a esta sección.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase font-semibold text-[#1C8FA0] flex items-center gap-2">
            <Icon component={Inbox} size="sm" color="default" />
            Panel de Administración
          </p>
          <h1 className="text-3xl font-bold text-[#1a1a1a] dark:text-white font-['Inter_Tight']">
            Webhook Inbox
          </h1>
          <p className="text-[#6E6E73] dark:text-gray-400">
            Centro universal para recibir, visualizar y gestionar todos los webhooks externos.
          </p>
        </div>
        <Button
          onClick={() => {
            setRefreshing(true);
            loadWebhooks();
            loadStats();
          }}
          disabled={refreshing}
          variant="outline"
          className="gap-2"
        >
          {refreshing ? (
            <Icon component={Loader2} size="sm" color="default" className="animate-spin" />
          ) : (
            <Icon component={RefreshCw} size="sm" color="default" />
          )}
          Actualizar
        </Button>
      </div>

      {/* Estadísticas */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-[#1a1a1a] border border-gray-100 dark:border-white/5 rounded-2xl p-5 shadow-sm">
            <div className="text-2xl font-bold text-[#1a1a1a] dark:text-white">{stats.total || 0}</div>
            <p className="text-xs uppercase tracking-wide text-[#6E6E73] dark:text-gray-400">Total</p>
          </div>
          <div className="bg-white dark:bg-[#1a1a1a] border border-gray-100 dark:border-white/5 rounded-2xl p-5 shadow-sm">
            <div className="text-2xl font-bold text-blue-600">{stats.by_status?.received || 0}</div>
            <p className="text-xs uppercase tracking-wide text-[#6E6E73] dark:text-gray-400">Recibidos</p>
          </div>
          <div className="bg-white dark:bg-[#1a1a1a] border border-gray-100 dark:border-white/5 rounded-2xl p-5 shadow-sm">
            <div className="text-2xl font-bold text-emerald-600">{stats.by_status?.processed || 0}</div>
            <p className="text-xs uppercase tracking-wide text-[#6E6E73] dark:text-gray-400">Procesados</p>
          </div>
          <div className="bg-white dark:bg-[#1a1a1a] border border-gray-100 dark:border-white/5 rounded-2xl p-5 shadow-sm">
            <div className="text-2xl font-bold text-red-600">{stats.by_status?.error || 0}</div>
            <p className="text-xs uppercase tracking-wide text-[#6E6E73] dark:text-gray-400">Errores</p>
          </div>
        </div>
      )}

      {/* Filtros */}
      <div className="bg-white dark:bg-[#1a1a1a] border border-gray-100 dark:border-white/5 rounded-2xl p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-semibold text-[#1a1a1a] dark:text-white mb-1">
              Fuente
            </label>
            <select
              value={filters.source}
              onChange={(e) => setFilters({ ...filters, source: e.target.value })}
              className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#1C8FA0]/30"
            >
              {sourceOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#1a1a1a] dark:text-white mb-1">
              Estado
            </label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#1C8FA0]/30"
            >
              {statusOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#1a1a1a] dark:text-white mb-1">
              Desde
            </label>
            <input
              type="date"
              value={filters.from_date}
              onChange={(e) => setFilters({ ...filters, from_date: e.target.value })}
              className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#1C8FA0]/30"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#1a1a1a] dark:text-white mb-1">
              Buscar
            </label>
            <div className="relative">
              <Icon component={Search} size="sm" color="default" className="absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar en webhooks..."
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 focus:outline-none focus:ring-2 focus:ring-[#1C8FA0]/30"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Lista de Webhooks */}
      <div className="bg-white dark:bg-[#1a1a1a] border border-gray-100 dark:border-white/5 rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Icon component={Loader2} size="xl" color="primary" className="animate-spin" />
          </div>
        ) : webhooks.length === 0 ? (
          <div className="text-center py-20 text-[#6E6E73] dark:text-gray-400">
            <Icon component={Inbox} size="md" color="primary" className="mx-auto mb-4" />
            <p>No hay webhooks que coincidan con los filtros.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-white/5">
            {webhooks.map((webhook) => {
              const StatusIcon = statusConfig[webhook.status]?.icon || Clock;
              const isExpanded = expandedWebhooks.has(webhook.id);

              return (
                <motion.div
                  key={webhook.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-6 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                >
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span
                            className={cn(
                              'px-3 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1.5',
                              statusConfig[webhook.status]?.color
                            )}
                          >
                            <StatusIcon className="w-3.5 h-3.5" />
                            {statusConfig[webhook.status]?.label}
                          </span>
                          <span className="text-sm font-semibold text-[#1a1a1a] dark:text-white">
                            {webhook.source}
                          </span>
                          <span className="text-sm text-[#6E6E73] dark:text-gray-400">
                            {webhook.event_type}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-[#6E6E73] dark:text-gray-400">
                          <span>{new Date(webhook.created_at).toLocaleString('es-ES')}</span>
                          {webhook.ip_address && (
                            <>
                              <span>•</span>
                              <span>IP: {webhook.ip_address}</span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            const newExpanded = new Set(expandedWebhooks);
                            if (isExpanded) {
                              newExpanded.delete(webhook.id);
                            } else {
                              newExpanded.add(webhook.id);
                            }
                            setExpandedWebhooks(newExpanded);
                          }}
                        >
                          {isExpanded ? (
                            <>
                              <Icon component={ChevronUp} size="sm" color="default" className="mr-2" />
                              Ocultar
                            </>
                          ) : (
                            <>
                              <Icon component={Eye} size="sm" color="default" className="mr-2" />
                              Ver Detalle
                            </>
                          )}
                        </Button>
                      </div>
                    </div>

                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="space-y-4 pt-4 border-t border-gray-100 dark:border-white/5"
                      >
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="text-sm font-semibold text-[#1a1a1a] dark:text-white">
                              Payload (JSON)
                            </h4>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => copyToClipboard(formatJSON(webhook.payload))}
                              className="h-8"
                            >
                              <Icon component={Copy} size="sm" color="default" />
                            </Button>
                          </div>
                          <pre className="p-4 bg-gray-50 dark:bg-white/5 rounded-xl text-xs overflow-x-auto max-h-96 overflow-y-auto">
                            {formatJSON(webhook.payload)}
                          </pre>
                        </div>

                        {webhook.error_message && (
                          <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-xl">
                            <p className="text-sm font-semibold text-red-700 dark:text-red-400 mb-1">
                              Error
                            </p>
                            <p className="text-sm text-red-600 dark:text-red-300">
                              {webhook.error_message}
                            </p>
                          </div>
                        )}

                        {webhook.signature && (
                          <div>
                            <p className="text-xs text-[#6E6E73] dark:text-gray-400 mb-1">
                              Firma
                            </p>
                            <p className="text-xs font-mono bg-gray-50 dark:bg-white/5 p-2 rounded">
                              {webhook.signature}
                            </p>
                          </div>
                        )}

                        <div className="grid grid-cols-2 gap-4 text-xs">
                          <div>
                            <p className="text-[#6E6E73] dark:text-gray-400">ID</p>
                            <p className="font-mono text-[#1a1a1a] dark:text-white">{webhook.id}</p>
                          </div>
                          {webhook.processed_at && (
                            <div>
                              <p className="text-[#6E6E73] dark:text-gray-400">Procesado</p>
                              <p className="text-[#1a1a1a] dark:text-white">
                                {new Date(webhook.processed_at).toLocaleString('es-ES')}
                              </p>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default WebhookInbox;

