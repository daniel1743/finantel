import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';

/**
 * Hook para obtener métricas de administración
 */
export const useAdminMetrics = (period = '7d') => {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState(null);
  const [error, setError] = useState(null);
  const { toast } = useToast();

  const fetchMetrics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: rpcError } = await supabase.rpc('get_admin_metrics_overview', {
        p_period: period
      });

      if (rpcError) throw rpcError;
      setMetrics(data);
    } catch (err) {
      console.error('Error fetching admin metrics:', err);
      setError(err);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudieron cargar las métricas',
      });
    } finally {
      setLoading(false);
    }
  }, [period, toast]);

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  return { metrics, loading, error, refetch: fetchMetrics };
};

/**
 * Hook para obtener uso de herramientas
 */
export const useToolUsage = () => {
  const [loading, setLoading] = useState(true);
  const [toolUsage, setToolUsage] = useState([]);
  const [error, setError] = useState(null);

  const fetchToolUsage = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: rpcError } = await supabase.rpc('get_tool_usage_stats');

      if (rpcError) throw rpcError;
      setToolUsage(data || []);
    } catch (err) {
      console.error('Error fetching tool usage:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchToolUsage();
  }, [fetchToolUsage]);

  return { toolUsage, loading, error, refetch: fetchToolUsage };
};

/**
 * Hook para obtener analytics del landing
 */
export const useLandingAnalytics = (startDate, endDate) => {
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);
  const [error, setError] = useState(null);

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: rpcError } = await supabase.rpc('get_landing_analytics', {
        p_start_date: startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        p_end_date: endDate || new Date().toISOString()
      });

      if (rpcError) throw rpcError;
      setAnalytics(data);
    } catch (err) {
      console.error('Error fetching landing analytics:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  return { analytics, loading, error, refetch: fetchAnalytics };
};

/**
 * Hook para obtener funnel de conversión
 */
export const useConversionFunnel = (startDate, endDate) => {
  const [loading, setLoading] = useState(true);
  const [funnel, setFunnel] = useState(null);
  const [error, setError] = useState(null);

  const fetchFunnel = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: rpcError } = await supabase.rpc('get_conversion_funnel', {
        p_start_date: startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        p_end_date: endDate || new Date().toISOString()
      });

      if (rpcError) throw rpcError;
      setFunnel(data);
    } catch (err) {
      console.error('Error fetching conversion funnel:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate]);

  useEffect(() => {
    fetchFunnel();
  }, [fetchFunnel]);

  return { funnel, loading, error, refetch: fetchFunnel };
};

/**
 * Hook para obtener métricas de engagement
 */
export const useEngagementMetrics = (period = '7d') => {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState(null);
  const [error, setError] = useState(null);

  const fetchMetrics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: rpcError } = await supabase.rpc('get_engagement_metrics', {
        p_period: period
      });

      if (rpcError) throw rpcError;
      setMetrics(data);
    } catch (err) {
      console.error('Error fetching engagement metrics:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  return { metrics, loading, error, refetch: fetchMetrics };
};

/**
 * Hook para obtener estadísticas de impresiones
 */
export const useImpressionsStats = (startDate, endDate) => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: rpcError } = await supabase.rpc('get_impressions_stats', {
        p_start_date: startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        p_end_date: endDate || new Date().toISOString()
      });

      if (rpcError) throw rpcError;
      setStats(data);
    } catch (err) {
      console.error('Error fetching impressions stats:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, loading, error, refetch: fetchStats };
};

/**
 * Hook para obtener métricas de engagement (usuarios anónimos, IA, tickets, feedback)
 */
export const useEngagementMetricsDetailed = (period = '7d') => {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState(null);
  const [error, setError] = useState(null);

  const fetchMetrics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: rpcError } = await supabase.rpc('get_engagement_metrics_detailed', {
        p_period: period
      });

      if (rpcError) throw rpcError;
      setMetrics(data);
    } catch (err) {
      console.error('Error fetching engagement metrics detailed:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  return { metrics, loading, error, refetch: fetchMetrics };
};

