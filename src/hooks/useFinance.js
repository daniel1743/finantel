
import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';

// Límites para optimizar rendimiento
const TRANSACTIONS_LIMIT = 500; // Máximo de transacciones a cargar
const CATEGORIES_LIMIT = 100;
const BUDGETS_LIMIT = 50;
const GOALS_LIMIT = 50;

export const useFinance = (userId) => {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const toastRef = useRef(toast);

  // Mantener toast actualizado sin causar re-renders
  useEffect(() => {
    toastRef.current = toast;
  }, [toast]);

  // --- Fetching ---
  const fetchData = useCallback(async () => {
    if (!userId) return;
    try {
      setLoading(true);
      const [txRes, catRes, budRes, goalRes] = await Promise.all([
        supabase
          .from('transactions')
          .select('*, categories(name, icon, color)')
          .eq('user_id', userId)
          .order('date', { ascending: false })
          .limit(TRANSACTIONS_LIMIT),
        supabase
          .from('categories')
          .select('*')
          .eq('user_id', userId)
          .limit(CATEGORIES_LIMIT),
        supabase
          .from('budgets')
          .select('*')
          .eq('user_id', userId)
          .limit(BUDGETS_LIMIT),
        supabase
          .from('goals')
          .select('*')
          .eq('user_id', userId)
          .limit(GOALS_LIMIT)
      ]);

      if (txRes.error) throw txRes.error;
      
      setTransactions(txRes.data || []);
      setCategories(catRes.data || []);
      setBudgets(budRes.data || []);
      setGoals(goalRes.data || []);
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error fetching finance data:', error);
      }
      toastRef.current?.({ variant: "destructive", title: "Error", description: "Failed to load financial data." });
    } finally {
      setLoading(false);
    }
  }, [userId]); // Removido toast de dependencias

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

  // --- CRUD Actions con Actualizaciones Optimistas ---

  const addTransaction = async (data) => {
    // Optimistic update
    const tempId = `temp-${Date.now()}`;
    const optimisticTx = { ...data, id: tempId, user_id: userId, created_at: new Date().toISOString() };
    setTransactions(prev => [optimisticTx, ...prev]);

    try {
      const { data: newTx, error } = await supabase
        .from('transactions')
        .insert([{ ...data, user_id: userId }])
        .select('*, categories(name, icon, color)')
        .single();

      if (error) throw error;

      // Reemplazar optimista con real
      setTransactions(prev => prev.map(tx => tx.id === tempId ? newTx : tx));
      toastRef.current?.({ title: "Éxito", description: "Transacción creada." });
    } catch (error) {
      // Revertir optimista
      setTransactions(prev => prev.filter(tx => tx.id !== tempId));
      toastRef.current?.({ variant: "destructive", title: "Error", description: error.message });
      throw error;
    }
  };

  const updateTransaction = async (id, data) => {
    // Optimistic update
    const prevTx = transactions.find(t => t.id === id);
    setTransactions(prev => prev.map(tx => tx.id === id ? { ...tx, ...data } : tx));

    try {
      const { error } = await supabase
        .from('transactions')
        .update(data)
        .eq('id', id)
        .eq('user_id', userId);

      if (error) throw error;

      // Refrescar solo esta transacción
      const { data: updatedTx } = await supabase
        .from('transactions')
        .select('*, categories(name, icon, color)')
        .eq('id', id)
        .single();

      if (updatedTx) {
        setTransactions(prev => prev.map(tx => tx.id === id ? updatedTx : tx));
      }

      toastRef.current?.({ title: "Actualizado", description: "Transacción modificada correctamente." });
    } catch (error) {
      // Revertir optimista
      if (prevTx) {
        setTransactions(prev => prev.map(tx => tx.id === id ? prevTx : tx));
      }
      toastRef.current?.({ variant: "destructive", title: "Error", description: error.message });
      throw error;
    }
  };

  const deleteTransaction = async (id) => {
    // Optimistic update
    const prevTx = transactions.find(t => t.id === id);
    setTransactions(prev => prev.filter(tx => tx.id !== id));

    try {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);

      if (error) throw error;
      toastRef.current?.({ title: "Eliminado", description: "Transacción eliminada." });
    } catch (error) {
      // Revertir optimista
      if (prevTx) {
        setTransactions(prev => [prevTx, ...prev].sort((a, b) => new Date(b.date) - new Date(a.date)));
      }
      toastRef.current?.({ variant: "destructive", title: "Error", description: error.message });
      throw error;
    }
  };

  const duplicateTransaction = async (transaction) => {
    if (!transaction) return;
    const copy = {
      user_id: userId,
      description: transaction.description || 'Sin descripción',
      amount: transaction.amount,
      category_id: transaction.category_id,
      date: transaction.date || new Date().toISOString(),
      type: transaction.type || 'expense',
      metadata: transaction.metadata || {},
      notes: transaction.notes || null,
      created_via: transaction.created_via || 'manual',
    };

    // Optimistic update
    const tempId = `temp-${Date.now()}`;
    const optimisticTx = { ...copy, id: tempId, categories: transaction.categories, created_at: new Date().toISOString() };
    setTransactions(prev => [optimisticTx, ...prev]);

    try {
      const { data: newTx, error } = await supabase
        .from('transactions')
        .insert([copy])
        .select('*, categories(name, icon, color)')
        .single();

      if (error) throw error;

      setTransactions(prev => prev.map(tx => tx.id === tempId ? newTx : tx));
      toastRef.current?.({ title: "Duplicado", description: "Transacción duplicada." });
    } catch (error) {
      setTransactions(prev => prev.filter(tx => tx.id !== tempId));
      toastRef.current?.({ variant: "destructive", title: "Error", description: error.message });
      throw error;
    }
  };

  const addCategory = async (data) => {
    const categoryData = {
      ...data,
      user_id: userId,
      type: data.type || 'expense',
    };
    
    // Optimistic update
    const tempId = `temp-${Date.now()}`;
    const optimisticCat = { ...categoryData, id: tempId, created_at: new Date().toISOString() };
    setCategories(prev => [...prev, optimisticCat]);

    try {
      const { data: newCat, error } = await supabase
        .from('categories')
        .insert([categoryData])
        .select()
        .single();

      if (error) throw error;

      setCategories(prev => prev.map(cat => cat.id === tempId ? newCat : cat));
      toastRef.current?.({ title: "Success", description: "Category created." });
    } catch (error) {
      setCategories(prev => prev.filter(cat => cat.id !== tempId));
      if (process.env.NODE_ENV === 'development') {
        console.error('Error creating category:', error);
      }
      toastRef.current?.({ variant: "destructive", title: "Error", description: error.message });
      throw error;
    }
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
    
    // Optimistic update
    const tempId = `temp-${Date.now()}`;
    const optimisticGoal = { ...goalData, id: tempId, created_at: new Date().toISOString() };
    setGoals(prev => [...prev, optimisticGoal]);

    try {
      const { data: newGoal, error } = await supabase
        .from('goals')
        .insert([goalData])
        .select()
        .single();

      if (error) throw error;

      setGoals(prev => prev.map(goal => goal.id === tempId ? newGoal : goal));
      toastRef.current?.({ title: "Éxito", description: "Meta creada correctamente." });
    } catch (error) {
      setGoals(prev => prev.filter(goal => goal.id !== tempId));
      if (process.env.NODE_ENV === 'development') {
        console.error('Error creating goal:', error);
      }
      toastRef.current?.({ variant: "destructive", title: "Error", description: error.message });
      throw error;
    }
  };

  const updateGoalProgress = async (id, amount) => {
    // Optimistic update
    const prevGoal = goals.find(g => g.id === id);
    setGoals(prev => prev.map(goal => goal.id === id ? { ...goal, current_amount: amount } : goal));

    try {
      const { error } = await supabase.from('goals').update({ current_amount: amount }).eq('id', id);
      if (error) throw error;
    } catch (error) {
      if (prevGoal) {
        setGoals(prev => prev.map(goal => goal.id === id ? prevGoal : goal));
      }
      throw error;
    }
  };

  const deleteGoal = async (id) => {
    // Optimistic update
    const prevGoal = goals.find(g => g.id === id);
    setGoals(prev => prev.filter(goal => goal.id !== id));

    try {
      const { error } = await supabase
        .from('goals')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toastRef.current?.({ title: "Éxito", description: "Meta eliminada correctamente." });
    } catch (error) {
      // Revertir cambio optimista
      if (prevGoal) {
        setGoals(prev => [...prev, prevGoal].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
      }
      if (process.env.NODE_ENV === 'development') {
        console.error('Error deleting goal:', error);
      }
      toastRef.current?.({ variant: "destructive", title: "Error", description: error.message || "No se pudo eliminar la meta." });
      throw error;
    }
  };

  const addBudget = async (data) => {
    const budgetData = {
      ...data,
      user_id: userId,
      period: data.period || 'monthly',
      alert_threshold: data.alert_threshold || 80.00,
      is_active: data.is_active !== undefined ? data.is_active : true,
    };
    
    // Optimistic update
    const tempId = `temp-${Date.now()}`;
    const optimisticBudget = { ...budgetData, id: tempId, created_at: new Date().toISOString() };
    setBudgets(prev => [...prev, optimisticBudget]);

    try {
      const { data: newBudget, error } = await supabase
        .from('budgets')
        .insert([budgetData])
        .select()
        .single();

      if (error) throw error;

      setBudgets(prev => prev.map(budget => budget.id === tempId ? newBudget : budget));
      toastRef.current?.({ title: "Éxito", description: "Presupuesto creado correctamente." });
    } catch (error) {
      setBudgets(prev => prev.filter(budget => budget.id !== tempId));
      if (process.env.NODE_ENV === 'development') {
        console.error('Error creating budget:', error);
      }
      toastRef.current?.({ variant: "destructive", title: "Error", description: error.message });
      throw error;
    }
  };

  const updateBudget = async (id, data) => {
    // Optimistic update
    const prevBudget = budgets.find(b => b.id === id);
    setBudgets(prev => prev.map(budget => budget.id === id ? { ...budget, ...data } : budget));

    try {
      const { error } = await supabase.from('budgets').update(data).eq('id', id).eq('user_id', userId);
      if (error) throw error;
      toastRef.current?.({ title: "Éxito", description: "Presupuesto actualizado correctamente." });
    } catch (error) {
      if (prevBudget) {
        setBudgets(prev => prev.map(budget => budget.id === id ? prevBudget : budget));
      }
      if (process.env.NODE_ENV === 'development') {
        console.error('Error updating budget:', error);
      }
      toastRef.current?.({ variant: "destructive", title: "Error", description: error.message });
      throw error;
    }
  };

  return {
    transactions,
    categories,
    budgets,
    goals,
    loading,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    duplicateTransaction,
    addCategory,
    addGoal,
    updateGoalProgress,
    deleteGoal,
    addBudget,
    updateBudget,
    refresh: fetchData
  };
};
