// ============================================================================
// COMPONENTE: Gestión de Apelaciones - Panel Admin
// ============================================================================

import React, { useState, useEffect } from 'react';
import { useSupabaseClient } from '@supabase/auth-helpers-react';

interface Appeal {
  id: string;
  user_id: string | null;
  email: string;
  ip_address: string;
  device_fingerprint: string | null;
  appeal_reason: string;
  status: string;
  admin_notes: string | null;
  resolution: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
  event_data: any;
}

interface AppealsStats {
  total: number;
  pending: number;
  under_review: number;
  approved: number;
  rejected: number;
  dismissed: number;
  approval_rate: number;
  avg_response_time_hours: number | null;
}

export function AppealsManagement() {
  const supabase = useSupabaseClient();
  const [appeals, setAppeals] = useState<Appeal[]>([]);
  const [stats, setStats] = useState<AppealsStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('pending');
  const [selectedAppeal, setSelectedAppeal] = useState<Appeal | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [resolution, setResolution] = useState('');
  const [reviewStatus, setReviewStatus] = useState<string>('approved');
  const [reviewing, setReviewing] = useState(false);

  useEffect(() => {
    loadAppeals();
    loadStats();
  }, [filter]);

  const loadAppeals = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('get_ip_risk_appeals', {
        p_status: filter === 'all' ? null : filter,
        p_limit: 100,
        p_offset: 0,
      });

      if (error) throw error;
      setAppeals(data || []);
    } catch (error) {
      console.error('Error al cargar apelaciones:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const { data, error } = await supabase.rpc('get_appeals_stats');
      if (error) throw error;
      setStats(data);
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
    }
  };

  const handleReviewAppeal = async () => {
    if (!selectedAppeal) return;

    setReviewing(true);
    try {
      const { error } = await supabase.rpc('review_ip_risk_appeal', {
        p_appeal_id: selectedAppeal.id,
        p_status: reviewStatus,
        p_admin_notes: reviewNotes || null,
        p_resolution: resolution || null,
      });

      if (error) throw error;

      // Recargar datos
      await loadAppeals();
      await loadStats();
      setSelectedAppeal(null);
      setReviewNotes('');
      setResolution('');
    } catch (error: any) {
      console.error('Error al revisar apelación:', error);
      alert('Error al revisar apelación: ' + error.message);
    } finally {
      setReviewing(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'under_review':
        return 'bg-blue-100 text-blue-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'dismissed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading && !stats) {
    return <div className="p-4">Cargando...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Gestión de Apelaciones</h1>
        <div className="flex gap-2">
          {['all', 'pending', 'under_review', 'approved', 'rejected'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded ${
                filter === status
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              {status === 'all' ? 'Todas' : status.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Estadísticas */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-sm text-gray-600">Pendientes</p>
            <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-sm text-gray-600">Aprobadas</p>
            <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-sm text-gray-600">Rechazadas</p>
            <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-sm text-gray-600">Tasa de aprobación</p>
            <p className="text-2xl font-bold">{stats.approval_rate}%</p>
          </div>
        </div>
      )}

      {/* Lista de apelaciones */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Apelaciones</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {appeals.map((appeal) => (
            <div
              key={appeal.id}
              className="p-6 hover:bg-gray-50 transition-colors cursor-pointer"
              onClick={() => setSelectedAppeal(appeal)}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(
                        appeal.status
                      )}`}
                    >
                      {appeal.status.toUpperCase()}
                    </span>
                    <span className="text-sm font-medium">{appeal.email}</span>
                    <span className="text-xs text-gray-400">
                      {new Date(appeal.created_at).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 mb-2">{appeal.appeal_reason}</p>
                  <div className="flex gap-4 text-xs text-gray-500">
                    <span className="font-mono">IP: {appeal.ip_address}</span>
                    {appeal.event_data?.event_risk_level && (
                      <span>
                        Riesgo: {appeal.event_data.event_risk_level} (
                        {appeal.event_data.event_risk_score})
                      </span>
                    )}
                  </div>
                  {appeal.resolution && (
                    <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
                      <p className="font-medium">Resolución:</p>
                      <p>{appeal.resolution}</p>
                    </div>
                  )}
                </div>
                {appeal.status === 'pending' && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedAppeal(appeal);
                      setReviewStatus('under_review');
                    }}
                    className="ml-4 px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Revisar
                  </button>
                )}
              </div>
            </div>
          ))}
          {appeals.length === 0 && (
            <div className="p-6 text-center text-gray-500">
              No hay apelaciones {filter !== 'all' ? `con status ${filter}` : ''}
            </div>
          )}
        </div>
      </div>

      {/* Modal de revisión */}
      {selectedAppeal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">Revisar Apelación</h2>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <p className="mt-1 text-sm">{selectedAppeal.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">IP</label>
                  <p className="mt-1 text-sm font-mono">{selectedAppeal.ip_address}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Razón de apelación
                  </label>
                  <p className="mt-1 text-sm bg-gray-50 p-3 rounded">{selectedAppeal.appeal_reason}</p>
                </div>
                {selectedAppeal.event_data && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Información del evento
                    </label>
                    <div className="mt-1 text-sm bg-gray-50 p-3 rounded">
                      <p>Nivel de riesgo: {selectedAppeal.event_data.event_risk_level}</p>
                      <p>Score: {selectedAppeal.event_data.event_risk_score}</p>
                      <p>Razón: {selectedAppeal.event_data.event_reason}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Decisión
                  </label>
                  <select
                    value={reviewStatus}
                    onChange={(e) => setReviewStatus(e.target.value)}
                    className="block w-full rounded-md border-gray-300 shadow-sm"
                  >
                    <option value="approved">Aprobar</option>
                    <option value="rejected">Rechazar</option>
                    <option value="dismissed">Descartar</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notas internas (opcional)
                  </label>
                  <textarea
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
                    rows={3}
                    className="block w-full rounded-md border-gray-300 shadow-sm"
                    placeholder="Notas para otros admins..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Respuesta al usuario (opcional)
                  </label>
                  <textarea
                    value={resolution}
                    onChange={(e) => setResolution(e.target.value)}
                    rows={3}
                    className="block w-full rounded-md border-gray-300 shadow-sm"
                    placeholder="Mensaje que se enviará al usuario..."
                  />
                </div>
              </div>

              <div className="flex gap-2 mt-6">
                <button
                  onClick={handleReviewAppeal}
                  disabled={reviewing}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  {reviewing ? 'Procesando...' : 'Confirmar Decisión'}
                </button>
                <button
                  onClick={() => {
                    setSelectedAppeal(null);
                    setReviewNotes('');
                    setResolution('');
                  }}
                  className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

