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
  Globe,
  Bell,
  Smartphone,
  Monitor,
  Tablet,
  Target,
  Heart,
  Brain,
  Zap
} from 'lucide-react';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';
import Icon from '@/components/ui/Icon';
import GlobalNotificationPanel from '@/components/admin/GlobalNotificationPanel';

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
  const [conversionFunnel, setConversionFunnel] = useState(null);
  const [healthScore, setHealthScore] = useState(null);
  const [temporalComparison, setTemporalComparison] = useState(null);
  const [userSegmentation, setUserSegmentation] = useState(null);
  const [financialMetrics, setFinancialMetrics] = useState(null);
  const [behaviorTrends, setBehaviorTrends] = useState(null);
  const [smartAlerts, setSmartAlerts] = useState(null);
  const [aiSuggestions, setAiSuggestions] = useState(null);
  const [showNotificationPanel, setShowNotificationPanel] = useState(false);

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

      // Funnel de conversión
      const { data: funnelData, error: funnelError } = await supabase.rpc(
        'get_conversion_funnel',
        { start_date: startDate.toISOString(), end_date: endDate.toISOString() }
      );
      if (!funnelError) setConversionFunnel(funnelData);

      // Health Score
      const { data: healthData, error: healthError } = await supabase.rpc(
        'get_platform_health_score',
        { start_date: startDate.toISOString(), end_date: endDate.toISOString() }
      );
      if (!healthError) setHealthScore(healthData);

      // Comparación temporal
      const { data: temporalData, error: temporalError } = await supabase.rpc(
        'get_temporal_comparison',
        { current_start: startDate.toISOString(), current_end: endDate.toISOString() }
      );
      if (!temporalError) setTemporalComparison(temporalData);

      // Segmentación de usuarios
      const { data: segmentationData, error: segmentationError } = await supabase.rpc(
        'get_user_segmentation',
        { start_date: startDate.toISOString(), end_date: endDate.toISOString() }
      );
      if (!segmentationError) setUserSegmentation(segmentationData);

      // Métricas financieras globales
      const { data: financialData, error: financialError } = await supabase.rpc(
        'get_global_financial_metrics',
        { start_date: startDate.toISOString(), end_date: endDate.toISOString() }
      );
      if (!financialError) setFinancialMetrics(financialData);

      // Comportamiento y tendencias
      const { data: behaviorData, error: behaviorError } = await supabase.rpc(
        'get_behavior_trends',
        { start_date: startDate.toISOString(), end_date: endDate.toISOString() }
      );
      if (!behaviorError) setBehaviorTrends(behaviorData);

      // Alertas inteligentes
      const { data: alertsData, error: alertsError } = await supabase.rpc(
        'get_smart_alerts',
        { start_date: startDate.toISOString(), end_date: endDate.toISOString() }
      );
      if (!alertsError) setSmartAlerts(alertsData);

      // Sugerencias de IA
      const { data: suggestionsData, error: suggestionsError } = await supabase.rpc(
        'get_ai_suggestions',
        { start_date: startDate.toISOString(), end_date: endDate.toISOString() }
      );
      if (!suggestionsError) setAiSuggestions(suggestionsData);

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
          
          {/* Date Range Selector & Actions */}
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
            <button
              onClick={() => setShowNotificationPanel(true)}
              className="px-4 py-2 bg-[#1C8FA0] text-white rounded-lg hover:bg-[#1a7a8a] transition-colors flex items-center gap-2"
            >
              <Icon component={Bell} size="sm" />
              <span className="hidden sm:inline">Notificación Global</span>
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Icon component={Activity} size="xl" className="animate-spin text-[#1C8FA0]" />
          </div>
        ) : (
          <>
            {/* Health Score Card */}
            {healthScore && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  'bg-white dark:bg-[#1a1a1a] rounded-xl p-6 shadow-sm border-2',
                  healthScore.status === 'excellent' ? 'border-green-500' :
                  healthScore.status === 'good' ? 'border-blue-500' :
                  healthScore.status === 'warning' ? 'border-yellow-500' :
                  'border-red-500'
                )}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      'p-3 rounded-lg',
                      healthScore.status === 'excellent' ? 'bg-green-500/10 text-green-500' :
                      healthScore.status === 'good' ? 'bg-blue-500/10 text-blue-500' :
                      healthScore.status === 'warning' ? 'bg-yellow-500/10 text-yellow-500' :
                      'bg-red-500/10 text-red-500'
                    )}>
                      <Icon component={Heart} size="lg" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-[#1a1a1a] dark:text-white">
                        Health Score de la Plataforma
                      </h2>
                      <p className="text-sm text-[#6E6E73] dark:text-gray-400">
                        Estado general del sistema
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={cn(
                      'text-4xl font-bold',
                      healthScore.status === 'excellent' ? 'text-green-500' :
                      healthScore.status === 'good' ? 'text-blue-500' :
                      healthScore.status === 'warning' ? 'text-yellow-500' :
                      'text-red-500'
                    )}>
                      {healthScore.health_score}
                    </div>
                    <p className="text-xs text-[#6E6E73] dark:text-gray-400 capitalize">
                      {healthScore.status}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 mt-4">
                  <div className="p-3 bg-gray-50 dark:bg-white/5 rounded-lg">
                    <p className="text-xs text-[#6E6E73] dark:text-gray-400 mb-1">Tasa de Errores</p>
                    <p className="text-lg font-bold text-[#1a1a1a] dark:text-white">
                      {healthScore.error_rate}%
                    </p>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-white/5 rounded-lg">
                    <p className="text-xs text-[#6E6E73] dark:text-gray-400 mb-1">Retención</p>
                    <p className="text-lg font-bold text-[#1a1a1a] dark:text-white">
                      {healthScore.retention_rate}%
                    </p>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-white/5 rounded-lg">
                    <p className="text-xs text-[#6E6E73] dark:text-gray-400 mb-1">Crecimiento</p>
                    <p className={cn(
                      'text-lg font-bold',
                      healthScore.user_growth >= 0 ? 'text-green-500' : 'text-red-500'
                    )}>
                      {healthScore.user_growth >= 0 ? '+' : ''}{healthScore.user_growth}%
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

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

            {/* Funnel de Conversión */}
            {conversionFunnel && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-[#1a1a1a] rounded-xl p-6 shadow-sm border border-gray-100 dark:border-white/10"
              >
                <div className="flex items-center gap-2 mb-6">
                  <Icon component={Target} size="lg" className="text-[#1C8FA0]" />
                  <h2 className="text-xl font-bold text-[#1a1a1a] dark:text-white">
                    Funnel de Conversión
                  </h2>
                </div>
                <div className="space-y-4">
                  {[
                    { label: 'Visitantes Landing', value: conversionFunnel.landing_visitors, color: 'bg-blue-500' },
                    { label: 'Usuarios Registrados', value: conversionFunnel.registered_users, color: 'bg-green-500' },
                    { label: 'Usuarios que Iniciaron Sesión', value: conversionFunnel.logged_in_users, color: 'bg-yellow-500' },
                    { label: 'Usuarios Activos', value: conversionFunnel.active_users, color: 'bg-orange-500' },
                    { label: 'Power Users', value: conversionFunnel.power_users, color: 'bg-red-500' },
                  ].map((stage, index, array) => {
                    const maxValue = array[0].value;
                    const percentage = maxValue > 0 ? (stage.value / maxValue) * 100 : 0;
                    const conversionRate = index > 0 && array[index - 1].value > 0
                      ? ((stage.value / array[index - 1].value) * 100).toFixed(1)
                      : '100.0';
                    return (
                      <div key={stage.label} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-[#1a1a1a] dark:text-white">
                            {stage.label}
                          </span>
                          <div className="flex items-center gap-4">
                            <span className="text-sm text-[#6E6E73] dark:text-gray-400">
                              {stage.value?.toLocaleString() || 0}
                            </span>
                            {index > 0 && (
                              <span className="text-xs text-[#1C8FA0] font-medium">
                                {conversionRate}% conversión
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="w-full bg-gray-100 dark:bg-white/5 rounded-full h-3">
                          <div
                            className={cn('h-3 rounded-full transition-all', stage.color)}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* Comparación Temporal */}
            {temporalComparison && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-[#1a1a1a] rounded-xl p-6 shadow-sm border border-gray-100 dark:border-white/10"
              >
                <div className="flex items-center gap-2 mb-6">
                  <Icon component={TrendingUp} size="lg" className="text-[#1C8FA0]" />
                  <h2 className="text-xl font-bold text-[#1a1a1a] dark:text-white">
                    Comparación Temporal
                  </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {['landing_visitors', 'registered_users', 'active_users', 'total_transactions', 'total_revenue'].map((metric) => {
                    const current = temporalComparison.current?.[metric] || 0;
                    const previous = temporalComparison.previous?.[metric] || 0;
                    const change = previous > 0 ? ((current - previous) / previous) * 100 : 0;
                    const isPositive = change >= 0;
                    return (
                      <div key={metric} className="p-4 bg-gray-50 dark:bg-white/5 rounded-lg">
                        <p className="text-sm text-[#6E6E73] dark:text-gray-400 mb-2 capitalize">
                          {metric.replace(/_/g, ' ')}
                        </p>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-2xl font-bold text-[#1a1a1a] dark:text-white">
                              {typeof current === 'number' ? current.toLocaleString() : current}
                            </p>
                            <p className="text-xs text-[#6E6E73] dark:text-gray-400 mt-1">
                              Anterior: {typeof previous === 'number' ? previous.toLocaleString() : previous}
                            </p>
                          </div>
                          <div className={cn(
                            'flex items-center gap-1 text-sm font-medium',
                            isPositive ? 'text-green-500' : 'text-red-500'
                          )}>
                            {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                            <span>{Math.abs(change).toFixed(1)}%</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* Segmentación de Usuarios */}
            {userSegmentation && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-[#1a1a1a] rounded-xl p-6 shadow-sm border border-gray-100 dark:border-white/10"
              >
                <div className="flex items-center gap-2 mb-6">
                  <Icon component={Users} size="lg" className="text-[#1C8FA0]" />
                  <h2 className="text-xl font-bold text-[#1a1a1a] dark:text-white">
                    Segmentación de Usuarios
                  </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  {[
                    { label: 'Power Users', value: userSegmentation.power_users, color: 'bg-purple-500' },
                    { label: 'Activos', value: userSegmentation.active_users, color: 'bg-green-500' },
                    { label: 'Ocasionales', value: userSegmentation.casual_users, color: 'bg-yellow-500' },
                    { label: 'Inactivos', value: userSegmentation.inactive_users, color: 'bg-gray-500' },
                    { label: 'En Riesgo', value: userSegmentation.at_risk_users, color: 'bg-red-500' },
                  ].map((segment) => (
                    <div key={segment.label} className="p-4 bg-gray-50 dark:bg-white/5 rounded-lg text-center">
                      <div className={cn('w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center', segment.color)}>
                        <Icon component={Users} size="md" className="text-white" />
                      </div>
                      <p className="text-2xl font-bold text-[#1a1a1a] dark:text-white mb-1">
                        {segment.value?.toLocaleString() || 0}
                      </p>
                      <p className="text-xs text-[#6E6E73] dark:text-gray-400">{segment.label}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Métricas Financieras Globales */}
            {financialMetrics && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-[#1a1a1a] rounded-xl p-6 shadow-sm border border-gray-100 dark:border-white/10"
              >
                <div className="flex items-center gap-2 mb-6">
                  <Icon component={PieChart} size="lg" className="text-[#1C8FA0]" />
                  <h2 className="text-xl font-bold text-[#1a1a1a] dark:text-white">
                    Métricas Financieras Globales
                  </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="p-4 bg-green-50 dark:bg-green-900/10 rounded-lg">
                    <p className="text-sm text-[#6E6E73] dark:text-gray-400 mb-1">Total Ingresos</p>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                      ${parseFloat(financialMetrics.total_income || 0).toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div className="p-4 bg-red-50 dark:bg-red-900/10 rounded-lg">
                    <p className="text-sm text-[#6E6E73] dark:text-gray-400 mb-1">Total Gastos</p>
                    <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                      ${parseFloat(financialMetrics.total_expenses || 0).toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg">
                    <p className="text-sm text-[#6E6E73] dark:text-gray-400 mb-1">Total Ahorros</p>
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      ${parseFloat(financialMetrics.total_savings || 0).toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>
                {financialMetrics.category_breakdown && financialMetrics.category_breakdown.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-[#1a1a1a] dark:text-white mb-4">
                      Top Categorías de Gastos
                    </h3>
                    <div className="space-y-3">
                      {financialMetrics.category_breakdown.slice(0, 5).map((cat, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-white/5 rounded-lg">
                          <span className="text-sm font-medium text-[#1a1a1a] dark:text-white capitalize">
                            {cat.category_name}
                          </span>
                          <div className="flex items-center gap-4">
                            <span className="text-sm text-[#6E6E73] dark:text-gray-400">
                              ${parseFloat(cat.total_amount || 0).toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                            </span>
                            <span className="text-xs text-[#6E6E73] dark:text-gray-400">
                              {cat.transaction_count} transacciones
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* Comportamiento y Tendencias */}
            {behaviorTrends && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-[#1a1a1a] rounded-xl p-6 shadow-sm border border-gray-100 dark:border-white/10"
              >
                <div className="flex items-center gap-2 mb-6">
                  <Icon component={BarChart3} size="lg" className="text-[#1C8FA0]" />
                  <h2 className="text-xl font-bold text-[#1a1a1a] dark:text-white">
                    Comportamiento y Tendencias
                  </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {behaviorTrends.device_breakdown && (
                    <div>
                      <h3 className="text-lg font-semibold text-[#1a1a1a] dark:text-white mb-4">
                        Dispositivos
                      </h3>
                      <div className="space-y-3">
                        {[
                          { label: 'Móvil', value: behaviorTrends.device_breakdown.mobile, icon: Smartphone, color: 'bg-blue-500' },
                          { label: 'Desktop', value: behaviorTrends.device_breakdown.desktop, icon: Monitor, color: 'bg-green-500' },
                          { label: 'Tablet', value: behaviorTrends.device_breakdown.tablet, icon: Tablet, color: 'bg-yellow-500' },
                        ].map((device) => {
                          const total = behaviorTrends.device_breakdown.mobile + 
                                       behaviorTrends.device_breakdown.desktop + 
                                       behaviorTrends.device_breakdown.tablet;
                          const percentage = total > 0 ? (device.value / total) * 100 : 0;
                          return (
                            <div key={device.label} className="space-y-2">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <Icon component={device.icon} size="sm" className="text-[#6E6E73]" />
                                  <span className="text-sm font-medium text-[#1a1a1a] dark:text-white">
                                    {device.label}
                                  </span>
                                </div>
                                <span className="text-sm text-[#6E6E73] dark:text-gray-400">
                                  {percentage.toFixed(1)}%
                                </span>
                              </div>
                              <div className="w-full bg-gray-100 dark:bg-white/5 rounded-full h-2">
                                <div
                                  className={cn('h-2 rounded-full transition-all', device.color)}
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                  {behaviorTrends.peak_hours && behaviorTrends.peak_hours.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-[#1a1a1a] dark:text-white mb-4">
                        Horas Pico de Actividad
                      </h3>
                      <div className="space-y-2">
                        {behaviorTrends.peak_hours.slice(0, 5).map((hour, index) => (
                          <div key={hour.hour} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-white/5 rounded-lg">
                            <span className="text-sm font-medium text-[#1a1a1a] dark:text-white">
                              {hour.hour}:00
                            </span>
                            <div className="flex items-center gap-2">
                              <div className="w-24 bg-gray-100 dark:bg-white/5 rounded-full h-2">
                                <div
                                  className="bg-[#1C8FA0] h-2 rounded-full transition-all"
                                  style={{
                                    width: `${(hour.activity_count / behaviorTrends.peak_hours[0].activity_count) * 100}%`,
                                  }}
                                />
                              </div>
                              <span className="text-xs text-[#6E6E73] dark:text-gray-400 w-12 text-right">
                                {hour.activity_count} eventos
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Alertas Inteligentes */}
            {smartAlerts && smartAlerts.alerts && smartAlerts.alerts.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-[#1a1a1a] rounded-xl p-6 shadow-sm border border-gray-100 dark:border-white/10"
              >
                <div className="flex items-center gap-2 mb-6">
                  <Icon component={AlertCircle} size="lg" className="text-yellow-500" />
                  <h2 className="text-xl font-bold text-[#1a1a1a] dark:text-white">
                    Alertas del Sistema
                  </h2>
                </div>
                <div className="space-y-3">
                  {smartAlerts.alerts.map((alert, index) => (
                    <div
                      key={index}
                      className={cn(
                        'p-4 rounded-lg border-l-4',
                        alert.severity === 'high' ? 'bg-red-50 dark:bg-red-900/10 border-red-500' :
                        alert.severity === 'medium' ? 'bg-yellow-50 dark:bg-yellow-900/10 border-yellow-500' :
                        'bg-blue-50 dark:bg-blue-900/10 border-blue-500'
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <Icon
                          component={alert.severity === 'high' ? AlertCircle : AlertCircle}
                          size="md"
                          className={cn(
                            'mt-0.5',
                            alert.severity === 'high' ? 'text-red-500' :
                            alert.severity === 'medium' ? 'text-yellow-500' :
                            'text-blue-500'
                          )}
                        />
                        <div className="flex-1">
                          <h3 className="font-semibold text-[#1a1a1a] dark:text-white mb-1">
                            {alert.title}
                          </h3>
                          <p className="text-sm text-[#6E6E73] dark:text-gray-400">
                            {alert.message}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Sugerencias de IA */}
            {aiSuggestions && aiSuggestions.suggestions && aiSuggestions.suggestions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-br from-[#1C8FA0]/10 to-[#1C8FA0]/5 dark:from-[#1C8FA0]/20 dark:to-[#1C8FA0]/10 rounded-xl p-6 shadow-sm border border-[#1C8FA0]/20"
              >
                <div className="flex items-center gap-2 mb-6">
                  <Icon component={Brain} size="lg" className="text-[#1C8FA0]" />
                  <h2 className="text-xl font-bold text-[#1a1a1a] dark:text-white">
                    Sugerencias de IA
                  </h2>
                </div>
                <div className="space-y-4">
                  {aiSuggestions.suggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      className="p-4 bg-white dark:bg-[#1a1a1a] rounded-lg border border-[#1C8FA0]/20"
                    >
                      <div className="flex items-start gap-3">
                        <Icon component={Zap} size="md" className="text-[#1C8FA0] mt-0.5" />
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="font-semibold text-[#1a1a1a] dark:text-white">
                              {suggestion.title}
                            </h3>
                            <span className={cn(
                              'text-xs px-2 py-1 rounded-full',
                              suggestion.priority === 'high' ? 'bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400' :
                              suggestion.priority === 'medium' ? 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400' :
                              'bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                            )}>
                              {suggestion.priority}
                            </span>
                          </div>
                          <p className="text-sm text-[#6E6E73] dark:text-gray-400">
                            {suggestion.message}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

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

      {/* Panel de Notificaciones Globales */}
      <GlobalNotificationPanel
        isOpen={showNotificationPanel}
        onClose={() => setShowNotificationPanel(false)}
        onSent={() => {
          loadDashboardStats();
        }}
      />
    </div>
  );
};

export default AdminDashboard;

