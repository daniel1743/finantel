import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';

export const useSupportTickets = (userId) => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const { toast } = useToast();

  const fetchTickets = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('support_tickets')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTickets(data || []);
    } catch (error) {
      console.error('Error fetching tickets:', error);
      toast({
        variant: 'destructive',
        title: 'Error al cargar tickets',
        description: error.message || 'No pudimos obtener tus solicitudes de soporte.',
      });
    } finally {
      setLoading(false);
    }
  }, [userId, toast]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const createTicket = async (payload) => {
    if (!userId) {
      toast({ variant: 'destructive', title: 'Inicia sesión para crear un ticket.' });
      return;
    }

    setCreating(true);
    try {
      const { error } = await supabase.from('support_tickets').insert([{
        user_id: userId,
        subject: payload.subject,
        category: payload.category,
        priority: payload.priority,
        message: payload.message,
        ai_context: payload.ai_context || {},
      }]);

      if (error) throw error;

      toast({
        title: 'Ticket creado',
        description: 'Nuestro equipo te contactará dentro de las próximas horas.',
      });
      fetchTickets();
    } catch (error) {
      console.error('Error creating ticket:', error);
      toast({
        variant: 'destructive',
        title: 'No pudimos enviar tu solicitud',
        description: error.message || 'Intenta nuevamente en unos minutos.',
      });
    } finally {
      setCreating(false);
    }
  };

  return {
    tickets,
    loading,
    creating,
    createTicket,
    refresh: fetchTickets,
  };
};

