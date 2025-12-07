import React, { useState, useEffect } from 'react';
import Icon from '@/components/ui/Icon';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/customSupabaseClient';
import { AlertTriangle, X, CheckCircle2, Info, Zap, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatRelativeTime } from '@/utils/metricsFormatter';

const AlertasPanel = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAlerts = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_alerts')
        .select('*')
        .eq('is_resolved', false)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setAlerts(data || []);
    } catch (error) {
      console.error('Error fetching alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 30000); // Cada 30 segundos
    return () => clearInterval(interval);
  }, []);

  const resolveAlert = async (alertId) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('admin_alerts')
        .update({
          is_resolved: true,
          resolved_at: new Date().toISOString(),
          resolved_by: user?.id || null,
        })
        .eq('id', alertId);

      if (error) throw error;
      setAlerts(prev => prev.filter(a => a.id !== alertId));
    } catch (error) {
      console.error('Error resolving alert:', error);
    }
  };

  const getAlertIcon = (alertType, severity) => {
    if (severity === 'critical') return XCircle;
    if (severity === 'warning') return AlertTriangle;
    return Info;
  };

  const getAlertColor = (severity) => {
    switch (severity) {
      case 'critical':
        return 'border-red-500 bg-red-50 dark:bg-red-900/20';
      case 'warning':
        return 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20';
      default:
        return 'border-blue-500 bg-blue-50 dark:bg-blue-900/20';
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-white/10">
        <div className="flex items-center justify-center py-8">
          <Icon component={Zap} size="lg" color="primary" className="animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-white/10">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Icon component={AlertTriangle} size="md" color="default" />
          Alertas del Sistema
          {alerts.length > 0 && (
            <span className="ml-2 px-2 py-1 bg-red-500 text-white text-xs font-bold rounded-full">
              {alerts.length}
            </span>
          )}
        </h2>
      </div>

      <div className="space-y-3 max-h-[500px] overflow-y-auto">
        <AnimatePresence>
          {alerts.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <CheckCircle2 className="w-12 h-12 mx-auto mb-2 text-green-500" />
              <p>No hay alertas activas</p>
            </div>
          ) : (
            alerts.map((alert) => {
              const AlertIcon = getAlertIcon(alert.alert_type, alert.severity);
              return (
                <motion.div
                  key={alert.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className={`rounded-lg p-4 border-l-4 ${getAlertColor(alert.severity)}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1">
                      <AlertIcon className={`w-5 h-5 mt-0.5 ${
                        alert.severity === 'critical' ? 'text-red-500' :
                        alert.severity === 'warning' ? 'text-yellow-500' : 'text-blue-500'
                      }`} />
                      <div className="flex-1">
                        <h3 className="font-semibold mb-1">{alert.title}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{alert.message}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                          <span>{formatRelativeTime(alert.created_at)}</span>
                          <span className="capitalize">{alert.alert_type}</span>
                        </div>
                        {alert.action_url && alert.action_label && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="mt-2"
                            onClick={() => window.location.href = alert.action_url}
                          >
                            {alert.action_label}
                          </Button>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => resolveAlert(alert.id)}
                      className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
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

export default AlertasPanel;


