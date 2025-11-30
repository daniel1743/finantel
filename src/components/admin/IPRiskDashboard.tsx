// ============================================================================
// COMPONENTE: Panel de Administración - IP Risk Dashboard
// ============================================================================
// Muestra alertas y estadísticas de riesgo de IP
// ============================================================================

import React, { useState, useEffect } from 'react';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { AppealsManagement } from './AppealsManagement';

interface AdminAlert {
  id: string;
  alert_type: string;
  severity: string;
  ip_address: string;
  device_fingerprint: string;
  message: string;
  metadata: any;
  is_resolved: boolean;
  created_at: string;
}

interface IPRiskStats {
  ip_address: string;
  total_registrations_24h: number;
  total_registrations_7d: number;
  unique_fingerprints_24h: number;
  last_risk_level: string;
  last_risk_score: number;
}

export function IPRiskDashboard() {
  const supabase = useSupabaseClient();
  const [alerts, setAlerts] = useState<AdminAlert[]>([]);
  const [stats, setStats] = useState<IPRiskStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unresolved'>('unresolved');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'appeals'>('dashboard');

  useEffect(() => {
    loadData();
  }, [filter]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Cargar alertas
      let alertsQuery = supabase
        .from('admin_alerts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (filter === 'unresolved') {
        alertsQuery = alertsQuery.eq('is_resolved', false);
      }

      const { data: alertsData, error: alertsError } = await alertsQuery;

      if (alertsError) throw alertsError;
      setAlerts(alertsData || []);

      // Cargar estadísticas de IPs de alto riesgo
      const { data: statsData, error: statsError } = await supabase
        .from('ip_risk_stats')
        .select('*')
        .gte('total_registrations_24h', 4)
        .order('total_registrations_24h', { ascending: false })
        .limit(50);

      if (statsError) throw statsError;
      setStats(statsData || []);
    } catch (error) {
      console.error('Error al cargar datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const resolveAlert = async (alertId: string) => {
    try {
      const { error } = await supabase
        .from('admin_alerts')
        .update({
          is_resolved: true,
          resolved_at: new Date().toISOString(),
        })
        .eq('id', alertId);

      if (error) throw error;
      loadData();
    } catch (error) {
      console.error('Error al resolver alerta:', error);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low':
        return 'bg-yellow-100 text-yellow-800';
      case 'medium':
        return 'bg-orange-100 text-orange-800';
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'critical':
        return 'bg-red-200 text-red-900';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'low':
        return 'text-yellow-600';
      case 'medium':
        return 'text-orange-600';
      case 'high':
        return 'text-red-600';
      case 'very_high':
        return 'text-red-800 font-bold';
      default:
        return 'text-gray-600';
    }
  };

  if (loading) {
    return <div className="p-4">Cargando...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Panel de Riesgo de IP</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-4 py-2 rounded ${
              activeTab === 'dashboard'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('appeals')}
            className={`px-4 py-2 rounded ${
              activeTab === 'appeals'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            Apelaciones
          </button>
        </div>
      </div>

      {activeTab === 'appeals' ? (
        <AppealsManagement />
      ) : (
        <>
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('unresolved')}
              className={`px-4 py-2 rounded ${
                filter === 'unresolved'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              Sin resolver
            </button>
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded ${
                filter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              Todas
            </button>
          </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-600">Alertas sin resolver</p>
          <p className="text-2xl font-bold">
            {alerts.filter((a) => !a.is_resolved).length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-600">IPs de alto riesgo</p>
          <p className="text-2xl font-bold">
            {stats.filter((s) => s.last_risk_level === 'high' || s.last_risk_level === 'very_high').length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-600">Registros 24h (alto riesgo)</p>
          <p className="text-2xl font-bold">
            {stats.reduce((sum, s) => sum + s.total_registrations_24h, 0)}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-600">Fingerprints únicos 24h</p>
          <p className="text-2xl font-bold">
            {stats.reduce((sum, s) => sum + s.unique_fingerprints_24h, 0)}
          </p>
        </div>
      </div>

      {/* Tabla de IPs de alto riesgo */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">IPs de Alto Riesgo</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  IP
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Registros 24h
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Registros 7d
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fingerprints únicos
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nivel de riesgo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Score
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {stats.map((stat) => (
                <tr key={stat.ip_address}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono">
                    {stat.ip_address}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {stat.total_registrations_24h}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {stat.total_registrations_7d}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {stat.unique_fingerprints_24h}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`text-sm ${getRiskLevelColor(stat.last_risk_level)}`}>
                      {stat.last_risk_level.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {stat.last_risk_score}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Lista de alertas */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Alertas Recientes</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className="p-6 hover:bg-gray-50 transition-colors"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${getSeverityColor(
                        alert.severity
                      )}`}
                    >
                      {alert.severity.toUpperCase()}
                    </span>
                    <span className="text-sm text-gray-500">
                      {alert.alert_type}
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(alert.created_at).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm font-medium mb-1">{alert.message}</p>
                  {alert.ip_address && (
                    <p className="text-xs text-gray-500 font-mono">
                      IP: {alert.ip_address}
                    </p>
                  )}
                  {alert.metadata && Object.keys(alert.metadata).length > 0 && (
                    <details className="mt-2">
                      <summary className="text-xs text-gray-500 cursor-pointer">
                        Ver detalles
                      </summary>
                      <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto">
                        {JSON.stringify(alert.metadata, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
                {!alert.is_resolved && (
                  <button
                    onClick={() => resolveAlert(alert.id)}
                    className="ml-4 px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    Resolver
                  </button>
                )}
              </div>
            </div>
          ))}
          {alerts.length === 0 && (
            <div className="p-6 text-center text-gray-500">
              No hay alertas {filter === 'unresolved' ? 'sin resolver' : ''}
            </div>
          )}
        </div>
      </div>
        </>
      )}
    </div>
  );
}

