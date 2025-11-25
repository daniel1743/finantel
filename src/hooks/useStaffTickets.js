import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';

export const useStaffTickets = (userId) => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isStaff, setIsStaff] = useState(false);
  const [checkingStaff, setCheckingStaff] = useState(true);
  const [stats, setStats] = useState(null);
  const { toast } = useToast();

  // Verificar si el usuario es staff
  const checkStaffStatus = useCallback(async () => {
    if (!userId) {
      setIsStaff(false);
      setCheckingStaff(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('profile_preferences')
        .select('is_staff')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) throw error;
      setIsStaff(data?.is_staff || false);
    } catch (error) {
      console.error('Error checking staff status:', error);
      setIsStaff(false);
    } finally {
      setCheckingStaff(false);
    }
  }, [userId]);

  // Obtener todos los tickets (solo staff)
  const fetchAllTickets = useCallback(async (filters = {}) => {
    if (!isStaff) return;

    setLoading(true);
    try {
      let query = supabase
        .from('support_tickets')
        .select('*')
        .order('created_at', { ascending: false });

      // Aplicar filtros
      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      if (filters.priority) {
        query = query.eq('priority', filters.priority);
      }
      if (filters.category) {
        query = query.eq('category', filters.category);
      }
      if (filters.assigned_to) {
        if (filters.assigned_to === 'unassigned') {
          query = query.is('assigned_to', null);
        } else {
          query = query.eq('assigned_to', filters.assigned_to);
        }
      }
      if (filters.search) {
        query = query.or(`subject.ilike.%${filters.search}%,message.ilike.%${filters.search}%`);
      }

      const { data, error } = await query;

      if (error) throw error;
      setTickets(data || []);
    } catch (error) {
      console.error('Error fetching tickets:', error);
      toast({
        variant: 'destructive',
        title: 'Error al cargar tickets',
        description: error.message || 'No pudimos obtener los tickets.',
      });
    } finally {
      setLoading(false);
    }
  }, [isStaff, toast]);

  // Obtener estadísticas
  const fetchStats = useCallback(async () => {
    if (!isStaff) return;

    try {
      const { data, error } = await supabase.rpc('get_ticket_stats');

      if (error) throw error;
      setStats(data?.[0] || null);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  }, [isStaff]);

  // Responder como staff
  const respondAsStaff = async (ticketId, message, staffName) => {
    if (!isStaff) {
      toast({
        variant: 'destructive',
        title: 'Sin permisos',
        description: 'Solo el staff puede responder tickets.',
      });
      return null;
    }

    try {
      const { data, error } = await supabase.rpc('add_ticket_response', {
        p_ticket_id: ticketId,
        p_message: message,
        p_is_staff: true,
        p_staff_name: staffName || null,
        p_attachments: [],
      });

      if (error) throw error;

      toast({
        title: 'Respuesta enviada',
        description: 'Tu respuesta ha sido agregada al ticket.',
      });

      // Refrescar tickets
      fetchAllTickets();
      return data;
    } catch (error) {
      console.error('Error responding to ticket:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'No se pudo enviar la respuesta.',
      });
      return null;
    }
  };

  // Actualizar estado del ticket
  const updateTicketStatus = async (ticketId, status) => {
    if (!isStaff) {
      toast({
        variant: 'destructive',
        title: 'Sin permisos',
        description: 'Solo el staff puede actualizar tickets.',
      });
      return false;
    }

    try {
      const { error } = await supabase
        .from('support_tickets')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', ticketId);

      if (error) throw error;

      toast({
        title: 'Estado actualizado',
        description: `El ticket ahora está ${status}.`,
      });

      fetchAllTickets();
      return true;
    } catch (error) {
      console.error('Error updating ticket status:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'No se pudo actualizar el estado.',
      });
      return false;
    }
  };

  // Asignar ticket a staff
  const assignTicket = async (ticketId, staffUserId) => {
    if (!isStaff) {
      toast({
        variant: 'destructive',
        title: 'Sin permisos',
        description: 'Solo el staff puede asignar tickets.',
      });
      return false;
    }

    try {
      const { error } = await supabase.rpc('assign_ticket_to_staff', {
        p_ticket_id: ticketId,
        p_staff_user_id: staffUserId,
      });

      if (error) throw error;

      toast({
        title: 'Ticket asignado',
        description: 'El ticket ha sido asignado exitosamente.',
      });

      fetchAllTickets();
      return true;
    } catch (error) {
      console.error('Error assigning ticket:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'No se pudo asignar el ticket.',
      });
      return false;
    }
  };

  // Obtener lista de staff
  const getStaffList = async () => {
    if (!isStaff) return [];

    try {
      const { data, error } = await supabase
        .from('profile_preferences')
        .select('user_id, is_staff')
        .eq('is_staff', true);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching staff list:', error);
      return [];
    }
  };

  useEffect(() => {
    checkStaffStatus();
  }, [checkStaffStatus]);

  useEffect(() => {
    if (isStaff) {
      fetchAllTickets();
      fetchStats();
    }
  }, [isStaff, fetchAllTickets, fetchStats]);

  return {
    tickets,
    loading,
    isStaff,
    checkingStaff,
    stats,
    fetchAllTickets,
    fetchStats,
    respondAsStaff,
    updateTicketStatus,
    assignTicket,
    getStaffList,
    refresh: () => {
      fetchAllTickets();
      fetchStats();
    },
  };
};


