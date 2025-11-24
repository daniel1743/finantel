
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';

export const useFinance = (userId) => {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // --- Fetching ---
  const fetchData = useCallback(async () => {
    if (!userId) return;
    try {
      setLoading(true);
      const [txRes, catRes, budRes, goalRes] = await Promise.all([
        supabase.from('transactions').select('*, categories(name, icon, color)').eq('user_id', userId).order('date', { ascending: false }),
        supabase.from('categories').select('*').eq('user_id', userId),
        supabase.from('budgets').select('*').eq('user_id', userId),
        supabase.from('goals').select('*').eq('user_id', userId)
      ]);

      if (txRes.error) throw txRes.error;
      
      setTransactions(txRes.data || []);
      setCategories(catRes.data || []);
      setBudgets(budRes.data || []);
      setGoals(goalRes.data || []);
    } catch (error) {
      console.error('Error fetching finance data:', error);
      toast({ variant: "destructive", title: "Error", description: "Failed to load financial data." });
    } finally {
      setLoading(false);
    }
  }, [userId, toast]);

  // --- Realtime Subscription ---
  useEffect(() => {
    if (!userId) return;
    fetchData();

    const channel = supabase
      .channel('finance_updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'transactions', filter: `user_id=eq.${userId}` }, 
        (payload) => {
           if(payload.eventType === 'INSERT') setTransactions(prev => [payload.new, ...prev]);
           else fetchData(); // Simplest strategy for others
        }
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [userId, fetchData]);

  // --- CRUD Actions ---

  const addTransaction = async (data) => {
    const { error } = await supabase.from('transactions').insert([{ ...data, user_id: userId }]);
    if (error) throw error;
    toast({ title: "Success", description: "Transaction added." });
    fetchData();
  };

  const addCategory = async (data) => {
    // Asegurar que type tenga un valor por defecto si no viene
    const categoryData = {
      ...data,
      user_id: userId,
      type: data.type || 'expense', // Fallback por si acaso
    };
    
    const { error } = await supabase.from('categories').insert([categoryData]);
    if (error) {
      console.error('Error creating category:', error);
      throw error;
    }
    toast({ title: "Success", description: "Category created." });
    fetchData();
  };

  const addGoal = async (data) => {
    const goalData = {
      ...data,
      user_id: userId,
      current_amount: data.current_amount || 0.00,
      currency: data.currency || 'USD',
      priority: data.priority || 'medium',
      status: data.status || 'active',
    };
    
    const { error } = await supabase.from('goals').insert([goalData]);
    if (error) {
      console.error('Error creating goal:', error);
      throw error;
    }
    toast({ title: "Éxito", description: "Meta creada correctamente." });
    fetchData();
  };

  const updateGoalProgress = async (id, amount) => {
    // Optimistic update could go here
    const { error } = await supabase.from('goals').update({ current_amount: amount }).eq('id', id);
    if (error) throw error;
    fetchData();
  };

  const addBudget = async (data) => {
    const budgetData = {
      ...data,
      user_id: userId,
      period: data.period || 'monthly',
      alert_threshold: data.alert_threshold || 80.00,
      is_active: data.is_active !== undefined ? data.is_active : true,
    };
    
    const { error } = await supabase.from('budgets').insert([budgetData]);
    if (error) {
      console.error('Error creating budget:', error);
      throw error;
    }
    toast({ title: "Éxito", description: "Presupuesto creado correctamente." });
    fetchData();
  };

  const updateBudget = async (id, data) => {
    const { error } = await supabase.from('budgets').update(data).eq('id', id).eq('user_id', userId);
    if (error) {
      console.error('Error updating budget:', error);
      throw error;
    }
    toast({ title: "Éxito", description: "Presupuesto actualizado correctamente." });
    fetchData();
  };

  return {
    transactions,
    categories,
    budgets,
    goals,
    loading,
    addTransaction,
    addCategory,
    addGoal,
    updateGoalProgress,
    addBudget,
    updateBudget,
    refresh: fetchData
  };
};
