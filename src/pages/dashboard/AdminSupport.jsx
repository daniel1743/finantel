import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  LifeBuoy,
  Search,
  Filter,
  Send,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Archive,
  User,
  Users,
  MessageSquare,
  Loader2,
  ChevronDown,
  X,
} from 'lucide-react';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useStaffTickets } from '@/hooks/useStaffTickets';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import customSupabaseClient from '@/lib/customSupabaseClient';

const statusOptions = [
  { value: '', label: 'Todos los estados' },
  { value: 'abierto', label: 'Abierto' },
  { value: 'en_progreso', label: 'En Progreso' },
  { value: 'resuelto', label: 'Resuelto' },
  { value: 'archivado', label: 'Archivado' },
];

const priorityOptions = [
  { value: '', label: 'Todas las prioridades' },
  { value: 'baja', label: 'Baja' },
  { value: 'normal', label: 'Normal' },
  { value: 'alta', label: 'Alta' },
  { value: 'critica', label: 'Crítica' },
];

const categoryOptions = [
  { value: '', label: 'Todas las categorías' },
  { value: 'general', label: 'General' },
  { value: 'facturacion', label: 'Facturación' },
  { value: 'dato', label: 'Datos & Privacidad' },
  { value: 'bug', label: 'Error en la app' },
  { value: 'sugerencia', label: 'Sugerencia' },
];

const statusConfig = {
  abierto: { label: 'Abierto', icon: AlertTriangle, color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/20' },
  en_progreso: { label: 'En Progreso', icon: Clock, color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/20' },
  resuelto: { label: 'Resuelto', icon: CheckCircle2, color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20' },
  archivado: { label: 'Archivado', icon: Archive, color: 'bg-gray-100 text-gray-700 dark:bg-gray-900/20' },
};

const priorityConfig = {
  baja: { label: 'Baja', color: 'bg-gray-100 text-gray-700' },
  normal: { label: 'Normal', color: 'bg-blue-100 text-blue-700' },
  alta: { label: 'Alta', color: 'bg-orange-100 text-orange-700' },
  critica: { label: 'Crítica', color: 'bg-red-100 text-red-700' },
};

const AdminSupport = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const {
    tickets,
    loading,
    isStaff,
    checkingStaff,
    stats,
    fetchAllTickets,
    respondAsStaff,
    updateTicketStatus,
    assignTicket,
    getStaffList,
  } = useStaffTickets(user?.id);

  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    category: '',
    assigned_to: '',
    search: '',
  });
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [responseMessage, setResponseMessage] = useState('');
  const [staffName, setStaffName] = useState('');
  const [sendingResponse, setSendingResponse] = useState(false);
  const [staffList, setStaffList] = useState([]);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    if (isStaff) {
      getStaffList().then(setStaffList);
      // Obtener nombre del staff desde el perfil
      if (user?.email) {
        setStaffName(user.email.split('@')[0] || 'Staff');
      }
    }
  }, [isStaff, user, getStaffList]);

  useEffect(() => {
    if (isStaff) {
      fetchAllTickets(filters);
    }
  }, [isStaff, filters, fetchAllTickets]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleRespond = async () => {
    if (!selectedTicket || !responseMessage.trim()) return;

    setSendingResponse(true);
    const responseId = await respondAsStaff(selectedTicket.id, responseMessage, staffName);
    if (responseId) {
      setShowResponseModal(false);
      setResponseMessage('');
      setSelectedTicket(null);
    }
    setSendingResponse(false);
  };

  const handleStatusChange = async (ticketId, newStatus) => {
    await updateTicketStatus(ticketId, newStatus);
  };

  const handleAssign = async (ticketId, staffUserId) => {
    await assignTicket(ticketId, staffUserId);
  };

  if (checkingStaff) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 text-[#1C8FA0] animate-spin" />
      </div>
    );
  }

  if (!isStaff) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="w-16 h-16 text-amber-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-[#1a1a1a] dark:text-white mb-2">
          Acceso Restringido
        </h2>
        <p className="text-[#6E6E73] dark:text-gray-400 mb-6">
          Solo el personal de soporte puede acceder a esta sección.
        </p>
        <Button onClick={() => navigate('/dashboard/support')} variant="outline">
          Volver a Soporte
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase font-semibold text-[#1C8FA0] flex items-center gap-2">
            <LifeBuoy className="w-4 h-4" />
            Panel de Administración
          </p>
          <h1 className="text-3xl font-bold text-[#1a1a1a] dark:text-white font-['Inter_Tight']">
            Gestión de Tickets
          </h1>
          <p className="text-[#6E6E73] dark:text-gray-400">
            Administra y responde a todas las solicitudes de soporte.
          </p>
        </div>
      </div>

      {/* Estadísticas */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {[
            { label: 'Total', value: stats.total_tickets, icon: MessageSquare, color: 'bg-[#1C8FA0]/10 text-[#1C8FA0]' },
            { label: 'Abiertos', value: stats.open_tickets, icon: AlertTriangle, color: 'bg-amber-50 text-amber-600' },
            { label: 'En Progreso', value: stats.in_progress_tickets, icon: Clock, color: 'bg-blue-50 text-blue-600' },
            { label: 'Resueltos', value: stats.resolved_tickets, icon: CheckCircle2, color: 'bg-emerald-50 text-emerald-600' },
            { label: 'Críticos', value: stats.critical_tickets, icon: AlertTriangle, color: 'bg-red-50 text-red-600' },
          ].map((stat, idx) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white dark:bg-[#1a1a1a] border border-gray-100 dark:border-white/5 rounded-2xl p-5 shadow-sm"
            >
              <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${stat.color} mb-3`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <p className="text-xs uppercase tracking-wide text-[#6E6E73] dark:text-gray-400">{stat.label}</p>
              <p className="text-2xl font-bold text-[#1a1a1a] dark:text-white">{stat.value || 0}</p>
            </motion.div>
          ))}
        </div>
      )}

      {/* Filtros */}
      <div className="bg-white dark:bg-[#1a1a1a] border border-gray-100 dark:border-white/5 rounded-2xl p-4">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-[#1a1a1a] dark:text-white flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filtros
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="gap-2"
            >
              {showFilters ? <X className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-semibold text-[#1a1a1a] dark:text-white mb-1">
                  Estado
                </label>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
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
                  Prioridad
                </label>
                <select
                  value={filters.priority}
                  onChange={(e) => handleFilterChange('priority', e.target.value)}
                  className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#1C8FA0]/30"
                >
                  {priorityOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#1a1a1a] dark:text-white mb-1">
                  Categoría
                </label>
                <select
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#1C8FA0]/30"
                >
                  {categoryOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#1a1a1a] dark:text-white mb-1">
                  Buscar
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6E6E73]" />
                  <input
                    type="text"
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    placeholder="Buscar por asunto o mensaje..."
                    className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 focus:outline-none focus:ring-2 focus:ring-[#1C8FA0]/30"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Lista de Tickets */}
      <div className="bg-white dark:bg-[#1a1a1a] border border-gray-100 dark:border-white/5 rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-[#1C8FA0] animate-spin" />
          </div>
        ) : tickets.length === 0 ? (
          <div className="text-center py-20 text-[#6E6E73] dark:text-gray-400">
            <LifeBuoy className="w-16 h-16 mx-auto mb-4 text-[#1C8FA0]" />
            <p>No hay tickets que coincidan con los filtros.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-white/5">
            {tickets.map((ticket) => {
              const StatusIcon = statusConfig[ticket.status]?.icon || AlertTriangle;
              const userEmail = ticket.user?.email || 'Usuario';
              const userName = ticket.user?.raw_user_meta_data?.name || userEmail.split('@')[0];

              return (
                <motion.div
                  key={ticket.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-6 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                >
                  <div className="flex flex-col lg:flex-row gap-4">
                    <div className="flex-1">
                      <div className="flex items-start gap-3 mb-2">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-[#1a1a1a] dark:text-white mb-1">
                            {ticket.subject}
                          </h3>
                          <p className="text-sm text-[#6E6E73] dark:text-gray-400 line-clamp-2">
                            {ticket.message}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 mt-3">
                        <div className="flex items-center gap-2 text-sm text-[#6E6E73] dark:text-gray-400">
                          <User className="w-4 h-4" />
                          <span>{userName}</span>
                          <span className="text-xs">({userEmail})</span>
                        </div>
                        <span className="text-[#6E6E73] dark:text-gray-400">•</span>
                        <span className="text-sm text-[#6E6E73] dark:text-gray-400">
                          {new Date(ticket.created_at).toLocaleString('es-ES', {
                            dateStyle: 'medium',
                            timeStyle: 'short',
                          })}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-3 lg:min-w-[200px]">
                      <div className="flex flex-wrap gap-2">
                        <span
                          className={cn(
                            'px-3 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1.5',
                            statusConfig[ticket.status]?.color
                          )}
                        >
                          <StatusIcon className="w-3.5 h-3.5" />
                          {statusConfig[ticket.status]?.label}
                        </span>
                        <span
                          className={cn(
                            'px-3 py-1 rounded-full text-xs font-semibold',
                            priorityConfig[ticket.priority]?.color
                          )}
                        >
                          {priorityConfig[ticket.priority]?.label}
                        </span>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedTicket(ticket);
                            navigate(`/dashboard/support/${ticket.id}`);
                          }}
                          className="flex-1"
                        >
                          Ver Detalles
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => {
                            setSelectedTicket(ticket);
                            setShowResponseModal(true);
                          }}
                          className="flex-1 bg-[#1C8FA0] hover:bg-[#167a8a] text-white"
                        >
                          <Send className="w-4 h-4" />
                        </Button>
                      </div>

                      <select
                        value={ticket.status}
                        onChange={(e) => handleStatusChange(ticket.id, e.target.value)}
                        className="text-xs px-2 py-1 rounded border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 focus:outline-none focus:ring-2 focus:ring-[#1C8FA0]/30"
                      >
                        <option value="abierto">Abierto</option>
                        <option value="en_progreso">En Progreso</option>
                        <option value="resuelto">Resuelto</option>
                        <option value="archivado">Archivado</option>
                      </select>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal de Respuesta Rápida */}
      {showResponseModal && selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-[#1a1a1a] rounded-2xl p-6 w-full max-w-2xl border border-gray-200 dark:border-white/10"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-[#1a1a1a] dark:text-white">
                Responder a Ticket
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowResponseModal(false);
                  setSelectedTicket(null);
                  setResponseMessage('');
                }}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="mb-4 p-4 bg-gray-50 dark:bg-white/5 rounded-xl">
              <p className="text-sm font-semibold text-[#1a1a1a] dark:text-white mb-1">
                {selectedTicket.subject}
              </p>
              <p className="text-sm text-[#6E6E73] dark:text-gray-400 line-clamp-3">
                {selectedTicket.message}
              </p>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-semibold text-[#1a1a1a] dark:text-white mb-2">
                Tu nombre (opcional)
              </label>
              <input
                type="text"
                value={staffName}
                onChange={(e) => setStaffName(e.target.value)}
                placeholder="Tu nombre o email"
                className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#1C8FA0]/30"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-semibold text-[#1a1a1a] dark:text-white mb-2">
                Respuesta
              </label>
              <textarea
                value={responseMessage}
                onChange={(e) => setResponseMessage(e.target.value)}
                rows={5}
                placeholder="Escribe tu respuesta..."
                className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#1C8FA0]/30 resize-none"
              />
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowResponseModal(false);
                  setSelectedTicket(null);
                  setResponseMessage('');
                }}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleRespond}
                disabled={!responseMessage.trim() || sendingResponse}
                className="flex-1 bg-[#1C8FA0] hover:bg-[#167a8a] text-white"
              >
                {sendingResponse ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Enviar Respuesta
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default AdminSupport;


