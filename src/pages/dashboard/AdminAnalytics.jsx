import React, { useState, useEffect } from 'react';
import Icon from '@/components/ui/Icon';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import {
  BarChart3,
  Loader2,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import HealthCheck from '@/components/admin/dashboard/HealthCheck';
import MetricasOverview from '@/components/admin/dashboard/MetricasOverview';
import AlertasPanel from '@/components/admin/dashboard/AlertasPanel';
import UserEngagementMetrics from '@/components/admin/dashboard/UserEngagementMetrics';
import ToolUsageMetrics from '@/components/admin/dashboard/ToolUsageMetrics';
import {
  useAdminMetrics,
  useToolUsage,
  useLandingAnalytics,
  useConversionFunnel,
  useEngagementMetrics,
  useImpressionsStats,
  useEngagementMetricsDetailed,
} from '@/hooks/useAdminMetrics';

const AdminAnalytics = () => {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingAdmin, setCheckingAdmin] = useState(true);
  const [period, setPeriod] = useState('7d');
  
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

  // Hooks para obtener datos reales
  const { metrics, loading: metricsLoading, refetch: refetchMetrics } = useAdminMetrics(period);
  const { toolUsage, loading: toolUsageLoading } = useToolUsage();
  const { analytics: landingAnalytics, loading: landingLoading } = useLandingAnalytics();
  const { funnel, loading: funnelLoading } = useConversionFunnel();
  const { metrics: engagementMetrics, loading: engagementLoading } = useEngagementMetrics(period);
  const { stats: impressionsStats, loading: impressionsLoading } = useImpressionsStats();
  const { metrics: engagementDetailed, loading: engagementDetailedLoading } = useEngagementMetricsDetailed(period);

  // Combinar todos los estados de carga (solo para mostrar indicador, no para bloquear)
  const loading = metricsLoading || toolUsageLoading || landingLoading || funnelLoading || engagementLoading || impressionsLoading || engagementDetailedLoading;

  // Procesar tool usage para separar más usadas y menos usadas
  const mostUsed = toolUsage?.filter(t => t.totalUsers > 0).sort((a, b) => (b.totalUsers || 0) - (a.totalUsers || 0)) || [];
  const leastUsed = toolUsage?.filter(t => t.totalUsers > 0).sort((a, b) => (a.totalUsers || 0) - (b.totalUsers || 0)) || [];

  useEffect(() => {
    checkAdminStatus();
  }, [user?.id]);

  if (checkingAdmin) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Icon component={Loader2} size="lg" color="primary" className="animate-spin" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Icon component={AlertCircle} size="xl" color="default" className="mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Acceso Restringido</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Solo los administradores pueden acceder a esta sección.
          </p>
        </div>
      </div>
    );
  }

  // NO bloquear la vista mientras carga - mostrar todas las tarjetas siempre

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase font-semibold text-[#1C8FA0] flex items-center gap-2">
            <Icon component={BarChart3} size="sm" color="default" />
            Panel de Administración
          </p>
          <h1 className="text-3xl font-bold text-[#1a1a1a] dark:text-white font-['Inter_Tight']">
            Analytics y Métricas
          </h1>
          <p className="text-[#6E6E73] dark:text-gray-400">
            Análisis completo de usuarios, herramientas y comportamiento en la plataforma.
          </p>
        </div>

        {/* Time Range Selector */}
        <div className="flex gap-2">
          {['1d', '7d', '30d'].map((range) => (
            <Button
              key={range}
              variant={period === range ? 'default' : 'outline'}
              size="sm"
              onClick={() => setPeriod(range)}
            >
              {range === '1d' ? 'Hoy' : range === '7d' ? '7 días' : '30 días'}
            </Button>
          ))}
          <Button
            variant="outline"
            size="sm"
            onClick={refetchMetrics}
            disabled={loading}
          >
            <Icon component={RefreshCw} size="sm" color="default" className={loading ? 'animate-spin' : ''} />
          </Button>
        </div>
      </div>

      {/* Health Check */}
      <HealthCheck />

      {/* Métricas Overview */}
      <MetricasOverview metrics={metrics} period={period} onPeriodChange={setPeriod} />

      {/* Métricas de Engagement y Usuarios */}
      <UserEngagementMetrics metrics={engagementDetailed} />

      {/* Uso de Herramientas */}
      <ToolUsageMetrics 
        toolUsage={{ totalUsers: toolUsage?.reduce((sum, t) => sum + (t.totalUsers || 0), 0) || 0 }}
        mostUsed={mostUsed}
        leastUsed={leastUsed}
      />

      {/* Alertas Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AlertasPanel />
        {/* Aquí irán más componentes cuando los creemos */}
      </div>
    </div>
  );
};

export default AdminAnalytics;

