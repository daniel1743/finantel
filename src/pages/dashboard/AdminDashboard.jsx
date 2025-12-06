import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  LogIn, 
  UserPlus, 
  Activity, 
  Eye, 
  TrendingUp, 
  TrendingDown,
  Clock,
  MousePointerClick,
  BarChart3,
  PieChart,
  LineChart,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Search,
  Globe
} from 'lucide-react';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';
import Icon from '@/components/ui/Icon';

const AdminDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingAdmin, setCheckingAdmin] = useState(true);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30'); // días
  const [stats, setStats] = useState(null);
  const [toolUsage, setToolUsage] = useState([]);
  const [landingStats, setLandingStats] = useState(null);
  const [sessionStats, setSessionStats] = useState(null);

  // Verificar si es admin
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

  // Cargar estadísticas del dashboard
  const loadDashboardStats = async () => {
    if (!isAdmin) return;

    setLoading(true);
    try {
      const days = parseInt(dateRange);
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      const endDate = new Date();

      // Estadísticas generales
      const { data: statsData, error: statsError } = await supabase.rpc(
        'get_analytics_dashboard_stats',
        {
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString(),
        }
      );

      if (statsError) throw statsError;
      setStats(statsData);

      // Uso de herramientas
      const { data: toolData, error: toolError } = await supabase.rpc(
        'get_tool_usage_stats',
        {
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString(),
        }
      );

      if (toolError) throw toolError;
      setToolUsage(toolData || []);

      // Estadísticas del landing
      const { data: landingData, error: landingError } = await supabase.rpc(
        'get_landing_stats',
        {
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString(),
        }
      );

      if (landingError) throw landingError;
      setLandingStats(landingData);

      // Estadísticas de sesiones
      const { data: sessionData, error: sessionError } = await supabase
        .from('analytics_sessions')
        .select('*')
        .gte('started_at', startDate.toISOString())
        .lte('started_at', endDate.toISOString())
        .order('started_at', { ascending: false });

      if (sessionError) throw sessionError;

      // Calcular métricas de sesiones
      const totalSessions = sessionData?.length || 0;
      const avgDuration = sessionData?.reduce((sum, s) => sum + (s.duration_seconds || 0), 0) / totalSessions || 0;
      const bounceRate = sessionData?.filter(s => s.page_count <= 1).length / totalSessions * 100 || 0;

      setSessionStats({
        totalSessions,
        avgDuration: Math.round(avgDuration),
        bounceRate: Math.round(bounceRate * 100) / 100,
      });

    } catch (error) {
      console.error('Error loading dashboard stats:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudieron cargar las estadísticas',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAdminStatus();
  }, [user]);

  useEffect(() => {
    if (isAdmin) {
      loadDashboardStats();
    }
  }, [isAdmin, dateRange]);

  if (checkingAdmin) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Icon component={Activity} size="xl" className="animate-spin text-[#1C8FA0] mb-4" />
          <p className="text-[#6E6E73]">Verificando permisos...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#F5F7F9] dark:bg-[#0f0f11]">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center p-8 bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-lg max-w-md"
        >
          <Icon component={AlertCircle} size="xl" className="text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-[#1a1a1a] dark:text-white mb-2">
            Acceso Denegado
          </h1>
          <p className="text-[#6E6E73] dark:text-gray-400">
            Solo los administradores pueden acceder a esta sección.
          </p>
        </motion.div>
      </div>
    );
  }

  const StatCard = ({ title, value, icon: Icon, trend, subtitle, color = 'primary' }) => {
    const colorClasses = {
      primary: 'bg-[#1C8FA0]/10 text-[#1C8FA0]',
      success: 'bg-green-500/10 text-green-500',
      warning: 'bg-yellow-500/10 text-yellow-500',
      danger: 'bg-red-500/10 text-red-500',
    };

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-[#1a1a1a] rounded-xl p-6 shadow-sm border border-gray-100 dark:border-white/10"
      >
        <div className="flex items-start justify-between mb-4">
          <div className={cn('p-3 rounded-lg', colorClasses[color])}>
            <Icon className="w-6 h-6" />
          </div>
          {trend && (
            <div className={cn('flex items-center gap-1 text-sm', trend > 0 ? 'text-green-500' : 'text-red-500')}>
              {trend > 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              <span>{Math.abs(trend)}%</span>
            </div>
          )}
        </div>
        <h3 className="text-2xl font-bold text-[#1a1a1a] dark:text-white mb-1">
          {value?.toLocaleString() || '0'}
        </h3>
        <p className="text-sm text-[#6E6E73] dark:text-gray-400">{title}</p>
        {subtitle && (
          <p className="text-xs text-[#6E6E73] dark:text-gray-400 mt-1">{subtitle}</p>
        )}
      </motion.div>
    );
  };

  // Herramientas disponibles
  const allTools = [
    'transactions', 'goals', 'categories', 'ai-assistant', 'predictions',
    'analysis', 'deep-finance', 'future-self', 'family', 'export'
  ];

  const toolUsageMap = new Map(toolUsage.map(t => [t.tool_name, t]));
  const unusedTools = allTools.filter(t => !toolUsageMap.has(t));
  const neverUsedTools = allTools.filter(t => {
    const usage = toolUsageMap.get(t);
    return !usage || usage.usage_count === 0;
  });

  return (
    <div className="min-h-screen bg-[#F5F7F9] dark:bg-[#0f0f11] p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-[#1a1a1a] dark:text-white mb-2">
              Panel de Administración
            </h1>
            <p className="text-[#6E6E73] dark:text-gray-400">
              Analytics y métricas de uso de la plataforma
            </p>
          </div>
          
          {/* Date Range Selector */}
          <div className="flex items-center gap-2">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-4 py-2 bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-white/10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1C8FA0]/20"
            >
              <option value="7">Últimos 7 días</option>
              <option value="30">Últimos 30 días</option>
              <option value="90">Últimos 90 días</option>
              <option value="365">Último año</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Icon component={Activity} size="xl" className="animate-spin text-[#1C8FA0]" />
          </div>
        ) : (
          <>
            {/* Main Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <StatCard
                title="Visitantes Landing"
                value={stats?.landing_visitors || 0}
                icon={Globe}
                color="primary"
                subtitle="Solo visitaron la landing"
              />
              <StatCard
                title="Usuarios Registrados"
                value={stats?.registered_users || 0}
                icon={UserPlus}
                color="success"
                subtitle="Nuevos registros"
              />
              <StatCard
                title="Usuarios Activos"
                value={stats?.active_users || 0}
                icon={Activity}
                color="primary"
                subtitle="Usaron herramientas"
              />
              <StatCard
                title="Impresiones"
                value={stats?.total_impressions || 0}
                icon={Eye}
                color="warning"
                subtitle="En buscadores"
              />
            </div>

            {/* Tool Usage Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Herramientas Más Usadas */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-[#1a1a1a] rounded-xl p-6 shadow-sm border border-gray-100 dark:border-white/10"
              >
                <div className="flex items-center gap-2 mb-6">
                  <Icon component={BarChart3} size="lg" className="text-[#1C8FA0]" />
                  <h2 className="text-xl font-bold text-[#1a1a1a] dark:text-white">
                    Herramientas Más Usadas
                  </h2>
                </div>
                <div className="space-y-4">
                  {toolUsage.slice(0, 5).map((tool, index) => (
                    <div key={tool.tool_name} className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-[#1a1a1a] dark:text-white capitalize">
                            {tool.tool_name.replace('-', ' ')}
                          </span>
                          <span className="text-sm text-[#6E6E73] dark:text-gray-400">
                            {tool.usage_count} usos
                          </span>
                        </div>
                        <div className="w-full bg-gray-100 dark:bg-white/5 rounded-full h-2">
                          <div
                            className="bg-[#1C8FA0] h-2 rounded-full transition-all"
                            style={{
                              width: `${(tool.usage_count / (toolUsage[0]?.usage_count || 1)) * 100}%`,
                            }}
                          />
                        </div>
                        <p className="text-xs text-[#6E6E73] dark:text-gray-400 mt-1">
                          {tool.unique_users} usuarios únicos
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Herramientas No Usadas */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-[#1a1a1a] rounded-xl p-6 shadow-sm border border-gray-100 dark:border-white/10"
              >
                <div className="flex items-center gap-2 mb-6">
                  <Icon component={XCircle} size="lg" className="text-red-500" />
                  <h2 className="text-xl font-bold text-[#1a1a1a] dark:text-white">
                    Herramientas No Usadas
                  </h2>
                </div>
                <div className="space-y-2">
                  {neverUsedTools.length > 0 ? (
                    neverUsedTools.map((tool) => (
                      <div
                        key={tool}
                        className="flex items-center gap-2 p-2 rounded-lg bg-red-50 dark:bg-red-900/10"
                      >
                        <XCircle className="w-4 h-4 text-red-500" />
                        <span className="text-sm text-[#1a1a1a] dark:text-white capitalize">
                          {tool.replace('-', ' ')}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-[#6E6E73] dark:text-gray-400">
                      Todas las herramientas han sido usadas
                    </p>
                  )}
                </div>
              </motion.div>
            </div>

            {/* Landing Page Analytics */}
            {landingStats && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-[#1a1a1a] rounded-xl p-6 shadow-sm border border-gray-100 dark:border-white/10"
              >
                <div className="flex items-center gap-2 mb-6">
                  <Icon component={LineChart} size="lg" className="text-[#1C8FA0]" />
                  <h2 className="text-xl font-bold text-[#1a1a1a] dark:text-white">
                    Analytics del Landing Page
                  </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-lg">
                    <p className="text-sm text-[#6E6E73] dark:text-gray-400 mb-1">
                      Scroll Promedio
                    </p>
                    <p className="text-2xl font-bold text-[#1a1a1a] dark:text-white">
                      {Math.round(landingStats.average_scroll_depth || 0)}%
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-lg">
                    <p className="text-sm text-[#6E6E73] dark:text-gray-400 mb-1">
                      Tiempo Promedio
                    </p>
                    <p className="text-2xl font-bold text-[#1a1a1a] dark:text-white">
                      {Math.round((landingStats.average_time_on_page || 0) / 60)} min
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-lg">
                    <p className="text-sm text-[#6E6E73] dark:text-gray-400 mb-1">
                      Tasa de Rebote
                    </p>
                    <p className="text-2xl font-bold text-[#1a1a1a] dark:text-white">
                      {sessionStats?.bounceRate || 0}%
                    </p>
                  </div>
                </div>
                {landingStats.sections && landingStats.sections.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-[#1a1a1a] dark:text-white mb-4">
                      Secciones Más Vistas
                    </h3>
                    <div className="space-y-3">
                      {landingStats.sections.map((section) => (
                        <div key={section.section} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-white/5 rounded-lg">
                          <span className="text-sm font-medium text-[#1a1a1a] dark:text-white capitalize">
                            {section.section}
                          </span>
                          <div className="flex items-center gap-4">
                            <span className="text-sm text-[#6E6E73] dark:text-gray-400">
                              {section.views} vistas
                            </span>
                            <span className="text-sm text-[#6E6E73] dark:text-gray-400">
                              {section.unique_visitors} únicos
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* Session Stats */}
            {sessionStats && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-[#1a1a1a] rounded-xl p-6 shadow-sm border border-gray-100 dark:border-white/10"
              >
                <div className="flex items-center gap-2 mb-6">
                  <Icon component={Clock} size="lg" className="text-[#1C8FA0]" />
                  <h2 className="text-xl font-bold text-[#1a1a1a] dark:text-white">
                    Estadísticas de Sesiones
                  </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-lg">
                    <p className="text-sm text-[#6E6E73] dark:text-gray-400 mb-1">
                      Total de Sesiones
                    </p>
                    <p className="text-2xl font-bold text-[#1a1a1a] dark:text-white">
                      {sessionStats.totalSessions}
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-lg">
                    <p className="text-sm text-[#6E6E73] dark:text-gray-400 mb-1">
                      Duración Promedio
                    </p>
                    <p className="text-2xl font-bold text-[#1a1a1a] dark:text-white">
                      {Math.round(sessionStats.avgDuration / 60)} min
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-lg">
                    <p className="text-sm text-[#6E6E73] dark:text-gray-400 mb-1">
                      Tasa de Rebote
                    </p>
                    <p className="text-2xl font-bold text-[#1a1a1a] dark:text-white">
                      {sessionStats.bounceRate}%
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;

