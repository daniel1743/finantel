import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Send,
  Loader2,
  Clock,
  User,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  Archive,
  MessageSquare
} from 'lucide-react';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Button } from '@/components/ui/button';
import customSupabaseClient from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';

const statusConfig = {
  abierto: {
    label: 'Abierto',
    icon: AlertCircle,
    color: 'text-amber-600 bg-amber-100 dark:bg-amber-900/20',
  },
  en_progreso: {
    label: 'En Progreso',
    icon: Clock,
    color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/20',
  },
  resuelto: {
    label: 'Resuelto',
    icon: CheckCircle2,
    color: 'text-emerald-600 bg-emerald-100 dark:bg-emerald-900/20',
  },
  archivado: {
    label: 'Archivado',
    icon: Archive,
    color: 'text-gray-600 bg-gray-100 dark:bg-gray-900/20',
  },
};

const priorityConfig = {
  baja: { label: 'Baja', color: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300' },
  normal: { label: 'Normal', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' },
  alta: { label: 'Alta', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300' },
  critica: { label: 'Crítica', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' },
};

const SupportTicketDetail = () => {
  const { ticketId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const messagesEndRef = useRef(null);

  const [ticket, setTicket] = useState(null);
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);

  // Cargar ticket y respuestas
  useEffect(() => {
    if (!ticketId || !user) return;

    const loadTicketData = async () => {
      try {
        // Cargar ticket
        const { data: ticketData, error: ticketError } = await customSupabaseClient
          .from('support_tickets')
          .select('*')
          .eq('id', ticketId)
          .eq('user_id', user.id)
          .single();

        if (ticketError) throw ticketError;
        setTicket(ticketData);

        // Cargar respuestas
        const { data: responsesData, error: responsesError } = await customSupabaseClient
          .from('support_ticket_responses')
          .select('*')
          .eq('ticket_id', ticketId)
          .order('created_at', { ascending: true });

        if (responsesError) throw responsesError;
        setResponses(responsesData || []);
      } catch (error) {
        console.error('Error loading ticket:', error);
        toast({
          title: 'Error',
          description: 'No se pudo cargar el ticket',
          variant: 'destructive',
        });
        navigate('/dashboard/support');
      } finally {
        setLoading(false);
      }
    };

    loadTicketData();
  }, [ticketId, user]);

  // Scroll to bottom cuando hay nuevas respuestas
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [responses]);

  // Enviar respuesta
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    setSending(true);
    try {
      const { data, error } = await customSupabaseClient.rpc('add_ticket_response', {
        p_ticket_id: ticketId,
        p_message: newMessage.trim(),
        p_is_staff: false,
      });

      if (error) throw error;

      // Agregar respuesta localmente
      const newResponse = {
        id: data,
        ticket_id: ticketId,
        user_id: user.id,
        message: newMessage.trim(),
        is_staff_response: false,
        created_at: new Date().toISOString(),
      };

      setResponses([...responses, newResponse]);
      setNewMessage('');

      toast({
        title: 'Respuesta enviada',
        description: 'Tu mensaje ha sido agregado al ticket',
      });
    } catch (error) {
      console.error('Error sending response:', error);
      toast({
        title: 'Error',
        description: 'No se pudo enviar la respuesta',
        variant: 'destructive',
      });
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 text-[#1C8FA0] animate-spin" />
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600 dark:text-gray-400">Ticket no encontrado</p>
        <Button
          onClick={() => navigate('/dashboard/support')}
          className="mt-4"
          variant="outline"
        >
          Volver a Soporte
        </Button>
      </div>
    );
  }

  const StatusIcon = statusConfig[ticket.status]?.icon || AlertCircle;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/dashboard/support')}
          className="gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver
        </Button>
      </div>

      {/* Ticket Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-[#1a1a1a] rounded-2xl p-6 border border-gray-200 dark:border-white/10"
      >
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-[#1a1a1a] dark:text-white">
                {ticket.subject}
              </h1>
              <span className={cn(
                'px-3 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1.5',
                statusConfig[ticket.status]?.color
              )}>
                <StatusIcon className="w-3.5 h-3.5" />
                {statusConfig[ticket.status]?.label}
              </span>
            </div>
            <div className="flex items-center gap-4 text-sm text-[#6E6E73] dark:text-gray-400">
              <span>Ticket #{ticket.id.slice(0, 8)}</span>
              <span>•</span>
              <span className={cn('px-2 py-0.5 rounded text-xs font-medium', priorityConfig[ticket.priority]?.color)}>
                {priorityConfig[ticket.priority]?.label}
              </span>
              <span>•</span>
              <span>{new Date(ticket.created_at).toLocaleDateString('es-ES')}</span>
            </div>
          </div>
        </div>

        {/* Mensaje inicial */}
        <div className="bg-gray-50 dark:bg-white/5 rounded-xl p-4">
          <p className="text-sm text-[#1a1a1a] dark:text-white whitespace-pre-wrap">
            {ticket.message}
          </p>
        </div>
      </motion.div>

      {/* Conversación */}
      <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl border border-gray-200 dark:border-white/10 overflow-hidden">
        {/* Messages */}
        <div className="p-6 space-y-4 max-h-[500px] overflow-y-auto">
          {responses.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Aún no hay respuestas. Nuestro equipo responderá pronto.
              </p>
            </div>
          ) : (
            responses.map((response) => (
              <motion.div
                key={response.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  'flex gap-3',
                  response.is_staff_response ? 'flex-row' : 'flex-row-reverse'
                )}
              >
                {/* Avatar */}
                <div className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0',
                  response.is_staff_response
                    ? 'bg-[#1C8FA0] text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                )}>
                  <User className="w-4 h-4" />
                </div>

                {/* Message */}
                <div className={cn(
                  'flex-1 max-w-[80%]',
                  response.is_staff_response ? '' : 'text-right'
                )}>
                  <div className={cn(
                    'inline-block px-4 py-3 rounded-2xl',
                    response.is_staff_response
                      ? 'bg-[#1C8FA0]/10 text-[#1a1a1a] dark:text-white'
                      : 'bg-[#1C8FA0] text-white'
                  )}>
                    {response.is_staff_response && response.staff_name && (
                      <p className="text-xs font-semibold text-[#1C8FA0] mb-1">
                        {response.staff_name}
                      </p>
                    )}
                    <p className="text-sm whitespace-pre-wrap">{response.message}</p>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 px-1">
                    {new Date(response.created_at).toLocaleString('es-ES', {
                      hour: '2-digit',
                      minute: '2-digit',
                      day: '2-digit',
                      month: 'short',
                    })}
                  </p>
                </div>
              </motion.div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        {ticket.status !== 'resuelto' && ticket.status !== 'archivado' && (
          <form onSubmit={handleSendMessage} className="border-t border-gray-200 dark:border-white/10 p-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Escribe tu respuesta..."
                className="flex-1 px-4 py-2 rounded-xl border border-gray-300 dark:border-white/20 bg-white dark:bg-white/5 text-[#1a1a1a] dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1C8FA0]"
                disabled={sending}
              />
              <Button
                type="submit"
                disabled={!newMessage.trim() || sending}
                className="bg-[#1C8FA0] hover:bg-[#167a8a] text-white px-6"
              >
                {sending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Enviar
                  </>
                )}
              </Button>
            </div>
          </form>
        )}

        {(ticket.status === 'resuelto' || ticket.status === 'archivado') && (
          <div className="bg-emerald-50 dark:bg-emerald-900/20 border-t border-emerald-200 dark:border-emerald-800 p-4">
            <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300">
              <CheckCircle2 className="w-5 h-5" />
              <p className="text-sm font-medium">
                Este ticket está {ticket.status === 'resuelto' ? 'resuelto' : 'archivado'}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SupportTicketDetail;
