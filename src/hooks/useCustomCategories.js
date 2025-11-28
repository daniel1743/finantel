// =====================================================
// HOOK: useCustomCategories
// =====================================================
// Gestiona categorías y niveles de necesidad personalizados
// =====================================================

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useToast } from '@/components/ui/use-toast';

export const useCustomCategories = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [customCategories, setCustomCategories] = useState([]);
  const [customNeeds, setCustomNeeds] = useState([]);
  const [loading, setLoading] = useState(true);

  // Cargar categorías personalizadas desde Supabase
  const loadCustomCategories = useCallback(async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('categories')
        .select('id, name, type, icon, color, created_at')
        .eq('user_id', user.id)
        .eq('is_default', false)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCustomCategories(data || []);
    } catch (error) {
      console.error('Error loading custom categories:', error);
    }
  }, [user?.id]);

  // Cargar necesidades personalizadas desde user_metadata
  const loadCustomNeeds = useCallback(async () => {
    if (!user?.id) return;

    try {
      const customNeedsData = user?.user_metadata?.custom_needs || [];
      setCustomNeeds(customNeedsData);
    } catch (error) {
      console.error('Error loading custom needs:', error);
    }
  }, [user]);

  // Cargar datos al montar
  useEffect(() => {
    if (user?.id) {
      loadCustomCategories();
      loadCustomNeeds();
      setLoading(false);
    }
  }, [user?.id, loadCustomCategories, loadCustomNeeds]);

  // Crear categoría personalizada
  const createCustomCategory = async (name, type = 'expense') => {
    if (!user?.id) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo identificar el usuario",
      });
      return null;
    }

    if (!name || !name.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "El nombre de la categoría no puede estar vacío",
      });
      return null;
    }

    try {
      // Verificar si ya existe
      const { data: existing } = await supabase
        .from('categories')
        .select('id')
        .eq('user_id', user.id)
        .eq('name', name.trim())
        .maybeSingle();

      if (existing) {
        return existing.id;
      }

      // Crear nueva categoría
      const { data, error } = await supabase
        .from('categories')
        .insert({
          user_id: user.id,
          name: name.trim(),
          type: type,
          icon: '💰',
          color: type === 'expense' ? '#E47B45' : '#1C8FA0',
          is_default: false,
          is_active: true
        })
        .select('id')
        .single();

      if (error) throw error;

      toast({
        title: "Categoría creada",
        description: `"${name.trim()}" ha sido agregada`,
      });

      await loadCustomCategories();
      return data.id;
    } catch (error) {
      console.error('Error creating custom category:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "No se pudo crear la categoría",
      });
      return null;
    }
  };

  // Eliminar categoría personalizada
  const deleteCustomCategory = async (categoryId) => {
    if (!user?.id) return;

    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', categoryId)
        .eq('user_id', user.id)
        .eq('is_default', false); // Solo eliminar personalizadas

      if (error) throw error;

      toast({
        title: "Categoría eliminada",
        description: "La categoría ha sido eliminada correctamente",
      });

      await loadCustomCategories();
    } catch (error) {
      console.error('Error deleting custom category:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "No se pudo eliminar la categoría",
      });
    }
  };

  // Crear necesidad personalizada
  const createCustomNeed = async (name) => {
    if (!user?.id) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo identificar el usuario",
      });
      return;
    }

    if (!name || !name.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "El nombre de la necesidad no puede estar vacío",
      });
      return;
    }

    try {
      const currentNeeds = user?.user_metadata?.custom_needs || [];
      
      // Verificar si ya existe
      if (currentNeeds.some(need => need.name.toLowerCase() === name.trim().toLowerCase())) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Esta necesidad personalizada ya existe",
        });
        return;
      }

      const newNeed = {
        id: `custom-${Date.now()}`,
        name: name.trim(),
        created_at: new Date().toISOString()
      };

      const updatedNeeds = [...currentNeeds, newNeed];

      const { error } = await supabase.auth.updateUser({
        data: {
          custom_needs: updatedNeeds
        }
      });

      if (error) throw error;

      setCustomNeeds(updatedNeeds);

      toast({
        title: "Necesidad creada",
        description: `"${name.trim()}" ha sido agregada`,
      });
    } catch (error) {
      console.error('Error creating custom need:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "No se pudo crear la necesidad",
      });
    }
  };

  // Eliminar necesidad personalizada
  const deleteCustomNeed = async (needId) => {
    if (!user?.id) return;

    try {
      const currentNeeds = user?.user_metadata?.custom_needs || [];
      const updatedNeeds = currentNeeds.filter(need => need.id !== needId);

      const { error } = await supabase.auth.updateUser({
        data: {
          custom_needs: updatedNeeds
        }
      });

      if (error) throw error;

      setCustomNeeds(updatedNeeds);

      toast({
        title: "Necesidad eliminada",
        description: "La necesidad ha sido eliminada correctamente",
      });
    } catch (error) {
      console.error('Error deleting custom need:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "No se pudo eliminar la necesidad",
      });
    }
  };

  return {
    customCategories,
    customNeeds,
    loading,
    createCustomCategory,
    deleteCustomCategory,
    createCustomNeed,
    deleteCustomNeed,
    refreshCategories: loadCustomCategories,
    refreshNeeds: loadCustomNeeds
  };
};

