import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  LifeBuoy,
  MessageSquare,
  PhoneCall,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Send,
  Loader2,
  Inbox,
  Mail,
  Robot
} from 'lucide-react';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useSupportTickets } from '@/hooks/useSupportTickets';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const categories = [
  { value: 'general', label: 'General' },
  { value: 'facturacion', label: 'Facturación' },
  { value: 'dato', label: 'Datos & privacidad' },
  { value: 'bug', label: 'Error en la app' },
  { value: 'sugerencia', label: 'Sugerencia' },
];

const priorities = [
  { value: 'baja', label: 'Baja', color: 'bg-gray-200 text-gray-700' },
  { value: 'normal', label: 'Normal', color: 'bg-blue-100 text-blue-700' },
  { value: 'alta', label: 'Alta', color: 'bg-orange-100 text-orange-700' },
  { value: 'critica', label: 'Crítica', color: 'bg-red-100 text-red-700' },
];

const statusStyles = {
  abierto: 'bg-amber-100 text-amber-700',
  en_progreso: 'bg-blue-100 text-blue-700',
  resuelto: 'bg-emerald-100 text-emerald-700',
  archivado: 'bg-gray-100 text-gray-600',
};

const Support = () => {
  const { user } = useAuth();
  const { tickets, loading, creating, createTicket } = useSupportTickets(user?.id);
  const [form, setForm] = useState({
    subject: '',
    category: 'general',
    priority: 'normal',
    message: '',
  });

  const stats = useMemo(() => {
    if (!tickets.length) {
      return {
        total: 0,
        open: 0,
        lastResponse: 'Sin datos',
        avgSla: '24h',
      };
    }

    const open = tickets.filter(t => t.status !== 'resuelto' && t.status !== 'archivado');
    const last = tickets[0]?.updated_at
      ? new Date(tickets[0].updated_at).toLocaleString('es-ES', { dateStyle: 'short', timeStyle: 'short' })
      : 'Sin registro';

    const averageSla = Math.round(
      tickets.reduce((acc, curr) => acc + (curr.sla_hours || 24), 0) / tickets.length
    );

    return {
      total: tickets.length,
      open: open.length,
      lastResponse: last,
      avgSla: `${averageSla} h`,
    };
  }, [tickets]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.subject.trim() || !form.message.trim()) return;

    createTicket({
      subject: form.subject.trim(),
      category: form.category,
      priority: form.priority,
      message: form.message.trim(),
      ai_context: { source: 'support_center' },
    });
    setForm({
      subject: '',
      category: 'general',
      priority: 'normal',
      message: '',
    });
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase font-semibold text-[#1C8FA0] flex items-center gap-2">
            <LifeBuoy className="w-4 h-4" />
            Centro de Ayuda
          </p>
          <h1 className="text-3xl font-bold text-[#1a1a1a] dark:text-white font-['Inter_Tight']">Estamos contigo 24/7</h1>
          <p className="text-[#6E6E73] dark:text-gray-400">
            Revisa tus tickets, habla con un humano o lanza nuestra IA con contexto de soporte.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button asChild variant="outline" className="gap-2">
            <a href="mailto:soporte@finantel.app?subject=Necesito%20ayuda">
              <Mail className="w-4 h-4" />
              Escribir al equipo
            </a>
          </Button>
          <Button asChild className="bg-[#1C8FA0] hover:bg-[#167a8a] gap-2">
            <a href="https://wa.me/51987654321?text=Necesito%20ayuda%20con%20mi%20cuenta%20Finantel" target="_blank" rel="noreferrer">
              <PhoneCall className="w-4 h-4" />
              Hablar con una persona
            </a>
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Tickets totales', value: stats.total, icon: Inbox, color: 'bg-[#1C8FA0]/10 text-[#1C8FA0]' },
          { label: 'En seguimiento', value: stats.open, icon: AlertTriangle, color: 'bg-amber-50 text-amber-600' },
          { label: 'Última respuesta', value: stats.lastResponse, icon: Clock, color: 'bg-blue-50 text-blue-600' },
          { label: 'SLA promedio', value: stats.avgSla, icon: CheckCircle2, color: 'bg-emerald-50 text-emerald-600' },
        ].map((card, idx) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white dark:bg-[#1a1a1a] border border-gray-100 dark:border-white/5 rounded-2xl p-5 shadow-sm flex items-center gap-4"
          >
            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${card.color}`}>
              <card.icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-[#6E6E73] dark:text-gray-400">{card.label}</p>
              <p className="text-xl font-bold text-[#1a1a1a] dark:text-white">{card.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Ticket form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2 bg-white dark:bg-[#1a1a1a] border border-gray-100 dark:border-white/5 rounded-[26px] p-6 shadow-sm"
        >
          <div className="flex items-center gap-3 mb-4">
            <ShieldCheck className="w-5 h-5 text-[#1C8FA0]" />
            <div>
              <h2 className="text-lg font-bold text-[#1a1a1a] dark:text-white">Crear ticket</h2>
              <p className="text-sm text-[#6E6E73] dark:text-gray-400">Tiempo de respuesta estimado: 2 horas hábiles</p>
            </div>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-[#1a1a1a] dark:text-white mb-1">Asunto</label>
              <input
                type="text"
                value={form.subject}
                onChange={(e) => setForm((prev) => ({ ...prev, subject: e.target.value }))}
                placeholder="Ej. Error al sincronizar mis datos"
                className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#1C8FA0]/30"
                required
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-[#1a1a1a] dark:text-white mb-1">Categoría</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))}
                  className="w-full rounded-xl border border-gray-200 dark:border.white/10 bg-gray-50 dark:bg.white/5 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#1C8FA0]/30"
                >
                  {categories.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#1a1a1a] dark:text.white mb-1">Prioridad</label>
                <select
                  value={form.priority}
                  onChange={(e) => setForm((prev) => ({ ...prev, priority: e.target.value }))}
                  className="w-full rounded-xl border border-gray-200 dark:border.white/10 bg-gray-50 dark:bg.white/5 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#1C8FA0]/30"
                >
                  {priorities.map((prio) => (
                    <option key={prio.value} value={prio.value}>
                      {prio.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#1a1a1a] dark:text.white mb-1">Cuéntanos más</label>
              <textarea
                value={form.message}
                onChange={(e) => setForm((prev) => ({ ...prev, message: e.target.value }))}
                rows={5}
                placeholder="Describe qué ocurrió, cuándo y qué esperabas que pasara."
                className="w-full rounded-2xl border border-gray-200 dark:border.white/10 bg-gray-50 dark:bg.white/5 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#1C8FA0]/30 resize-none"
                required
              />
            </div>

            <Button
              type="submit"
              disabled={creating}
              className="w-full bg-[#1C8FA0] hover:bg-[#167a8a] text-white gap-2"
            >
              {creating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Enviar ticket
                </>
              )}
            </Button>
          </form>
        </motion.div>

        {/* AI + human card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="bg-white dark:bg-[#1a1a1a] border border-gray-100 dark:border.white/10 rounded-[26px] p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <Robot className="w-5 h-5 text-purple-500" />
              <div>
                <p className="text-sm uppercase text-purple-500 font-semibold">IA con contexto</p>
                <h3 className="text-lg font-bold text-[#1a1a1a] dark:text-white">Pregúntale a FinanBot</h3>
              </div>
            </div>
            <p className="text-sm text-[#6E6E73] dark:text-gray-400 mb-4">
              Nuestro asistente ya conoce tus últimas alertas y tickets. Puedes pedirle actualizaciones o soluciones rápidas.
            </p>
            <Button asChild variant="outline" className="w-full justify-center gap-2">
              <Link to="/dashboard/ai-assistant?topic=support">
                <Sparkles className="w-4 h-4" />
                Abrir FinanBot con contexto
              </Link>
            </Button>
          </div>

          <div className="bg-white dark:bg-[#1a1a1a] border border-gray-100 dark:border.white/10 rounded-[26px] p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <MessageSquare className="w-5 h-5 text-[#1C8FA0]" />
              <h3 className="text-lg font-bold text-[#1a1a1a] dark:text-white">Contactos directos</h3>
            </div>
            <ul className="space-y-3 text-sm text-[#6E6E73] dark:text-gray-400">
              <li className="flex items-start gap-2">
                <Mail className="w-4 h-4 text-[#1C8FA0] mt-1" />
                soporte@finantel.app<br />
                <span className="text-xs">Respuesta promedio: 2h</span>
              </li>
              <li className="flex items-start gap-2">
                <PhoneCall className="w-4 h-4 text-[#1C8FA0] mt-1" />
                WhatsApp +51 987 654 321<br />
                <span className="text-xs">De lunes a domingo</span>
              </li>
            </ul>
          </div>
        </motion.div>
      </div>

      {/* Tickets list */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-[#1a1a1a] border border-gray-100 dark:border-white/5 rounded-[26px] shadow-sm"
      >
        <div className="p-6 border-b border-gray-100 dark:border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-[#1a1a1a] dark:text-white">Historial de tickets</h3>
            <p className="text-sm text-[#6E6E73] dark:text-gray-400">Seguimiento de tus solicitudes y estado actual.</p>
          </div>
          <Button asChild variant="ghost" className="gap-2">
            <Link to="/dashboard/alerts">
              <AlertTriangle className="w-4 h-4" />
              Revisar alertas automáticas
            </Link>
          </Button>
        </div>
        <div className="p-6 space-y-3">
          {loading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="w-6 h-6 text-[#1C8FA0] animate-spin" />
            </div>
          ) : tickets.length === 0 ? (
            <div className="text-center py-10 text-[#6E6E73] dark:text-gray-400">
              <LifeBuoy className="w-12 h-12 mx-auto mb-3 text-[#1C8FA0]" />
              Aún no has creado tickets. Usa el formulario para enviarnos tu primera solicitud.
            </div>
          ) : (
            <div className="space-y-4">
              {tickets.map((ticket) => (
                <div key={ticket.id} className="border border-gray-100 dark:border-white/5 rounded-2xl p-4 hover:border-[#1C8FA0]/40 transition-colors">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div>
                      <p className="text-sm text-[#6E6E73] dark:text-gray-400">
                        Ticket • {new Date(ticket.created_at).toLocaleDateString('es-ES', { dateStyle: 'medium' })}
                      </p>
                      <h4 className="text-lg font-semibold text-[#1a1a1a] dark:text-white">{ticket.subject}</h4>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <span className={cn('px-3 py-1 rounded-full text-xs font-semibold', priorities.find(p => p.value === ticket.priority)?.color)}>
                        Prioridad {priorities.find(p => p.value === ticket.priority)?.label}
                      </span>
                      <span className={cn('px-3 py-1 rounded-full text-xs font-semibold capitalize', statusStyles[ticket.status] || 'bg-gray-100 text-gray-600')}>
                        {ticket.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                  <p className="mt-2 text-sm text-[#6E6E73] dark:text-gray-400 line-clamp-3">{ticket.message}</p>
                  <div className="mt-3 flex flex-wrap gap-4 text-xs text-[#94A3B8] dark:text-gray-500">
                    <span>Categoría: {categories.find(c => c.value === ticket.category)?.label || ticket.category}</span>
                    <span>Última actualización: {ticket.updated_at ? new Date(ticket.updated_at).toLocaleString('es-ES', { dateStyle: 'short', timeStyle: 'short' }) : 'Sin respuesta'}</span>
                    <span>SLA asignado: {ticket.sla_hours || 24}h</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default Support;
