
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
    const { error } = await supabase.from('categories').insert([{ ...data, user_id: userId }]);
    if (error) throw error;
    toast({ title: "Success", description: "Category created." });
    fetchData();
  };

  const updateGoalProgress = async (id, amount) => {
    // Optimistic update could go here
    const { error } = await supabase.from('goals').update({ current_amount: amount }).eq('id', id);
    if (error) throw error;
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
    updateGoalProgress,
    refresh: fetchData
  };
};
