// =====================================================
// HOOK: useFamilyGroups
// =====================================================
// Gestiona grupos familiares y miembros
// =====================================================

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { captureError } from '@/lib/sentry';

export const useFamilyGroups = (userId) => {
  const { toast } = useToast();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [members, setMembers] = useState({}); // { groupId: [members] }

  // Cargar grupos del usuario
  const fetchGroups = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // Obtener grupos donde el usuario es miembro
      const { data: groupsData, error: groupsError } = await supabase
        .from('family_groups')
        .select(`
          *,
          family_group_members!inner(
            user_id,
            role,
            is_active
          )
        `)
        .eq('family_group_members.user_id', userId)
        .eq('family_group_members.is_active', true)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (groupsError) throw groupsError;

      setGroups(groupsData || []);

      // Cargar miembros de cada grupo
      if (groupsData && groupsData.length > 0) {
        const groupIds = groupsData.map(g => g.id);
        
        const { data: membersData, error: membersError } = await supabase
          .from('family_group_members')
          .select(`
            *,
            user:auth.users!family_group_members_user_id_fkey(
              id,
              email,
              raw_user_meta_data
            )
          `)
          .in('family_group_id', groupIds)
          .eq('is_active', true);

        if (membersError) throw membersError;

        // Organizar miembros por grupo
        const membersByGroup = {};
        membersData?.forEach(member => {
          if (!membersByGroup[member.family_group_id]) {
            membersByGroup[member.family_group_id] = [];
          }
          membersByGroup[member.family_group_id].push(member);
        });

        setMembers(membersByGroup);
      }
    } catch (error) {
      console.error('Error fetching groups:', error);
      captureError(error, { section: 'family_groups', action: 'fetch' });
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudieron cargar los grupos familiares',
      });
    } finally {
      setLoading(false);
    }
  }, [userId, toast]);

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  // Crear grupo
  const createGroup = useCallback(async (name) => {
    if (!userId) return { error: new Error('Usuario no autenticado') };

    try {
      // Crear grupo
      const { data: groupData, error: groupError } = await supabase
        .from('family_groups')
        .insert({
          name,
          created_by: userId,
        })
        .select()
        .single();

      if (groupError) throw groupError;

      // Agregar creador como admin automáticamente
      const { error: memberError } = await supabase
        .from('family_group_members')
        .insert({
          family_group_id: groupData.id,
          user_id: userId,
          role: 'admin',
        });

      if (memberError) throw memberError;

      toast({
        title: 'Grupo creado',
        description: `El grupo "${name}" ha sido creado exitosamente`,
      });

      await fetchGroups();
      return { data: groupData, error: null };
    } catch (error) {
      console.error('Error creating group:', error);
      captureError(error, { section: 'family_groups', action: 'create', name });
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudo crear el grupo',
      });
      return { error };
    }
  }, [userId, toast, fetchGroups]);

  // Agregar miembro al grupo (puede recibir email o userId)
  const addMember = useCallback(async (groupId, emailOrUserId, role = 'member') => {
    if (!userId) return { error: new Error('Usuario no autenticado') };

    try {
      // Verificar que el usuario actual es admin
      const { data: currentMember, error: checkError } = await supabase
        .from('family_group_members')
        .select('role')
        .eq('family_group_id', groupId)
        .eq('user_id', userId)
        .single();

      if (checkError) throw checkError;
      if (currentMember.role !== 'admin') {
        throw new Error('Solo los administradores pueden agregar miembros');
      }

      let memberUserId = emailOrUserId;

      // Si es un email, buscar el usuario usando Edge Function
      if (emailOrUserId.includes('@')) {
        const { data, error: userError } = await supabase.functions.invoke('find-user-by-email', {
          body: { email: emailOrUserId },
        });

        if (userError || !data || !data.id) {
          throw new Error(data?.error || 'No se encontró un usuario con ese email');
        }

        memberUserId = data.id;
      }

      // Verificar que el usuario no esté ya en el grupo
      const { data: existingMember, error: checkExistingError } = await supabase
        .from('family_group_members')
        .select('id')
        .eq('family_group_id', groupId)
        .eq('user_id', memberUserId)
        .single();

      if (existingMember) {
        // Si existe pero está inactivo, reactivarlo
        if (!existingMember.is_active) {
          const { error: updateError } = await supabase
            .from('family_group_members')
            .update({ is_active: true, role })
            .eq('id', existingMember.id);

          if (updateError) throw updateError;
        } else {
          throw new Error('El usuario ya es miembro del grupo');
        }
      } else {
        // Crear nuevo miembro
        const { data, error } = await supabase
          .from('family_group_members')
          .insert({
            family_group_id: groupId,
            user_id: memberUserId,
            role,
          })
          .select()
          .single();

        if (error) throw error;
      }

      toast({
        title: 'Miembro agregado',
        description: 'El miembro ha sido agregado al grupo',
      });

      await fetchGroups();
      return { error: null };
    } catch (error) {
      console.error('Error adding member:', error);
      captureError(error, { section: 'family_groups', action: 'add_member', groupId });
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'No se pudo agregar el miembro',
      });
      return { error };
    }
  }, [userId, toast, fetchGroups]);

  // Eliminar miembro del grupo
  const removeMember = useCallback(async (groupId, memberUserId) => {
    if (!userId) return { error: new Error('Usuario no autenticado') };

    try {
      // Verificar permisos (admin o el mismo usuario)
      const { data: currentMember, error: checkError } = await supabase
        .from('family_group_members')
        .select('role')
        .eq('family_group_id', groupId)
        .eq('user_id', userId)
        .single();

      if (checkError) throw checkError;
      
      if (currentMember.role !== 'admin' && memberUserId !== userId) {
        throw new Error('No tienes permisos para eliminar este miembro');
      }

      const { error } = await supabase
        .from('family_group_members')
        .update({ is_active: false })
        .eq('family_group_id', groupId)
        .eq('user_id', memberUserId);

      if (error) throw error;

      toast({
        title: 'Miembro eliminado',
        description: 'El miembro ha sido eliminado del grupo',
      });

      await fetchGroups();
      return { error: null };
    } catch (error) {
      console.error('Error removing member:', error);
      captureError(error, { section: 'family_groups', action: 'remove_member', groupId });
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'No se pudo eliminar el miembro',
      });
      return { error };
    }
  }, [userId, toast, fetchGroups]);

  // Eliminar grupo
  const deleteGroup = useCallback(async (groupId) => {
    if (!userId) return { error: new Error('Usuario no autenticado') };

    try {
      // Verificar que el usuario es el creador
      const { data: group, error: checkError } = await supabase
        .from('family_groups')
        .select('created_by')
        .eq('id', groupId)
        .single();

      if (checkError) throw checkError;
      if (group.created_by !== userId) {
        throw new Error('Solo el creador puede eliminar el grupo');
      }

      const { error } = await supabase
        .from('family_groups')
        .update({ is_active: false })
        .eq('id', groupId);

      if (error) throw error;

      toast({
        title: 'Grupo eliminado',
        description: 'El grupo ha sido eliminado',
      });

      await fetchGroups();
      return { error: null };
    } catch (error) {
      console.error('Error deleting group:', error);
      captureError(error, { section: 'family_groups', action: 'delete', groupId });
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'No se pudo eliminar el grupo',
      });
      return { error };
    }
  }, [userId, toast, fetchGroups]);

  // Actualizar nombre del grupo
  const updateGroupName = useCallback(async (groupId, newName) => {
    if (!userId) return { error: new Error('Usuario no autenticado') };

    try {
      // Verificar que el usuario es admin
      const { data: currentMember, error: checkError } = await supabase
        .from('family_group_members')
        .select('role')
        .eq('family_group_id', groupId)
        .eq('user_id', userId)
        .single();

      if (checkError) throw checkError;
      if (currentMember.role !== 'admin') {
        throw new Error('Solo los administradores pueden editar el grupo');
      }

      const { error } = await supabase
        .from('family_groups')
        .update({ name: newName })
        .eq('id', groupId);

      if (error) throw error;

      toast({
        title: 'Grupo actualizado',
        description: 'El nombre del grupo ha sido actualizado',
      });

      await fetchGroups();
      return { error: null };
    } catch (error) {
      console.error('Error updating group:', error);
      captureError(error, { section: 'family_groups', action: 'update', groupId });
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'No se pudo actualizar el grupo',
      });
      return { error };
    }
  }, [userId, toast, fetchGroups]);

  // Verificar si el usuario es admin de un grupo
  const isAdmin = useCallback((groupId) => {
    if (!userId || !members[groupId]) return false;
    const member = members[groupId].find(m => m.user_id === userId);
    return member?.role === 'admin';
  }, [userId, members]);

  return {
    groups,
    members,
    loading,
    fetchGroups,
    createGroup,
    addMember,
    removeMember,
    deleteGroup,
    updateGroupName,
    isAdmin,
  };
};

