import React, { useState, useEffect } from 'react';
import Icon from '@/components/ui/Icon';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/customSupabaseClient';
import { CheckCircle2, AlertTriangle, XCircle, Loader2, RefreshCw, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Definir las 5 tarjetas por defecto que siempre se deben mostrar
const DEFAULT_HEALTH_CHECKS = [
  { type: 'api', name: 'API', status: 'unknown', latency_ms: null },
  { type: 'database', name: 'Base de Datos', status: 'unknown', latency_ms: null },
  { type: 'storage', name: 'Almacenamiento', status: 'unknown', latency_ms: null },
  { type: 'email', name: 'Email Service', status: 'unknown', latency_ms: null },
  { type: 'payments', name: 'Pagos', status: 'unknown', latency_ms: null },
];

const HealthCheck = () => {
  const [healthData, setHealthData] = useState(DEFAULT_HEALTH_CHECKS);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(null);

  const fetchHealthData = async () => {
    setLoading(true);
    try {
      // Obtener últimos checks de salud
      const { data, error } = await supabase
        .from('system_health')
        .select('*')
        .order('checked_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      // Agrupar por tipo y obtener el más reciente
      const grouped = {};
      data?.forEach(check => {
        if (!grouped[check.check_type] || new Date(check.checked_at) > new Date(grouped[check.check_type].checked_at)) {
          grouped[check.check_type] = check;
        }
      });

      // Verificar estado actual de cada servicio
      const checks = [
        {
          type: 'api',
          name: 'API',
          ...(grouped.api || { status: 'unknown', latency_ms: null }),
        },
        {
          type: 'database',
          name: 'Base de Datos',
          ...(grouped.database || { status: 'unknown', latency_ms: null }),
        },
        {
          type: 'storage',
          name: 'Almacenamiento',
          ...(grouped.storage || { status: 'unknown', latency_ms: null }),
        },
        {
          type: 'email',
          name: 'Email Service',
          ...(grouped.email || { status: 'unknown', latency_ms: null }),
        },
        {
          type: 'payments',
          name: 'Pagos',
          ...(grouped.payments || { status: 'unknown', latency_ms: null }),
        },
      ];

      // Test real de latencia de base de datos (usar una tabla que existe)
      const dbStart = Date.now();
      try {
        await supabase.from('transactions').select('id').limit(1);
        const dbLatency = Date.now() - dbStart;
        checks[1].latency_ms = dbLatency;
        checks[1].status = dbLatency < 500 ? 'healthy' : dbLatency < 1000 ? 'degraded' : 'down';
      } catch (e) {
        checks[1].status = 'down';
        checks[1].latency_ms = null;
      }

      // Asegurar que siempre tengamos las 5 tarjetas
      const finalChecks = DEFAULT_HEALTH_CHECKS.map(defaultCheck => {
        const found = checks.find(c => c.type === defaultCheck.type);
        return found || defaultCheck;
      });
      
      setHealthData(finalChecks);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error fetching health data:', error);
      // En caso de error, mantener las tarjetas por defecto
      setHealthData(DEFAULT_HEALTH_CHECKS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealthData();
    const interval = setInterval(fetchHealthData, 30000); // Cada 30 segundos
    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case 'degraded':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'down':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'healthy':
        return 'border-green-500 bg-green-50 dark:bg-green-900/20';
      case 'degraded':
        return 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20';
      case 'down':
        return 'border-red-500 bg-red-50 dark:bg-red-900/20';
      default:
        return 'border-gray-300 bg-gray-50 dark:bg-gray-900/20';
    }
  };

  return (
    <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-white/10">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Icon component={Activity} size="md" color="default" />
          Estado del Sistema
        </h2>
        <div className="flex items-center gap-2">
          {lastUpdate && (
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Actualizado: {lastUpdate.toLocaleTimeString('es-ES')}
            </span>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchHealthData}
            disabled={loading}
          >
            <Icon component={RefreshCw} size="sm" color="default" className={loading ? 'animate-spin' : ''} />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Siempre mostrar las 5 tarjetas */}
        {healthData.map((check, idx) => (
          <motion.div
            key={check.type}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className={`rounded-xl p-4 border-2 ${getStatusColor(check.status)}`}
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-sm">{check.name}</h3>
              {loading && check.status === 'unknown' ? (
                <Icon component={Loader2} size="sm" color="primary" className="animate-spin" />
              ) : (
                getStatusIcon(check.status)
              )}
            </div>
            {check.latency_ms !== null ? (
              <p className="text-2xl font-bold">{check.latency_ms}ms</p>
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {loading ? 'Cargando...' : 'Sin datos'}
              </p>
            )}
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 capitalize">
              {check.status === 'healthy' ? 'Operativo' : check.status === 'degraded' ? 'Degradado' : check.status === 'down' ? 'Caído' : 'Desconocido'}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default HealthCheck;

