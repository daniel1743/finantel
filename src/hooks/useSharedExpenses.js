// =====================================================
// HOOK: useSharedExpenses
// =====================================================
// Gestiona gastos compartidos y división
// =====================================================

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { captureError } from '@/lib/sentry';

export const useSharedExpenses = (groupId, userId) => {
  const { toast } = useToast();
  const [expenses, setExpenses] = useState([]);
  const [splits, setSplits] = useState({}); // { expenseId: [splits] }
  const [loading, setLoading] = useState(true);
  const [balance, setBalance] = useState({}); // Balance por usuario

  // Cargar gastos del grupo
  const fetchExpenses = useCallback(async () => {
    if (!groupId || !userId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // Cargar gastos
      const { data: expensesData, error: expensesError } = await supabase
        .from('shared_expenses')
        .select(`
          *,
          category:categories(id, name, icon, color),
          paid_by:auth.users!shared_expenses_paid_by_user_id_fkey(
            id,
            email,
            raw_user_meta_data
          )
        `)
        .eq('family_group_id', groupId)
        .order('expense_date', { ascending: false })
        .order('created_at', { ascending: false });

      if (expensesError) throw expensesError;

      setExpenses(expensesData || []);

      // Cargar splits de todos los gastos
      if (expensesData && expensesData.length > 0) {
        const expenseIds = expensesData.map(e => e.id);
        
        const { data: splitsData, error: splitsError } = await supabase
          .from('shared_expense_splits')
          .select(`
            *,
            user:auth.users!shared_expense_splits_user_id_fkey(
              id,
              email,
              raw_user_meta_data
            )
          `)
          .in('shared_expense_id', expenseIds);

        if (splitsError) throw splitsError;

        // Organizar splits por gasto
        const splitsByExpense = {};
        splitsData?.forEach(split => {
          if (!splitsByExpense[split.shared_expense_id]) {
            splitsByExpense[split.shared_expense_id] = [];
          }
          splitsByExpense[split.shared_expense_id].push(split);
        });

        setSplits(splitsByExpense);

        // Calcular balance
        calculateBalance(expensesData, splitsData);
      }
    } catch (error) {
      console.error('Error fetching expenses:', error);
      captureError(error, { section: 'shared_expenses', action: 'fetch', groupId });
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudieron cargar los gastos compartidos',
      });
    } finally {
      setLoading(false);
    }
  }, [groupId, userId, toast]);

  // Calcular balance entre usuarios
  const calculateBalance = useCallback((expensesData, splitsData) => {
    if (!expensesData || !splitsData) return;

    const balanceMap = {}; // { userId: amount }

    expensesData.forEach(expense => {
      const paidBy = expense.paid_by_user_id;
      const expenseSplits = splitsData.filter(s => s.shared_expense_id === expense.id);

      // El que pagó recibe el monto total
      balanceMap[paidBy] = (balanceMap[paidBy] || 0) + parseFloat(expense.amount);

      // Cada participante debe su parte
      expenseSplits.forEach(split => {
        balanceMap[split.user_id] = (balanceMap[split.user_id] || 0) - parseFloat(split.amount);
      });
    });

    setBalance(balanceMap);
  }, []);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  // Crear gasto compartido
  const createExpense = useCallback(async (expenseData) => {
    if (!groupId || !userId) return { error: new Error('Datos faltantes') };

    try {
      const {
        title,
        amount,
        expense_date,
        category_id,
        description,
        paid_by_user_id,
        split_type, // 'equal', 'percentage', 'amounts'
        participants, // [{ user_id, amount?, percentage? }]
      } = expenseData;

      // Validaciones
      if (!title || !amount || amount <= 0) {
        throw new Error('El título y monto son requeridos');
      }

      if (!participants || participants.length === 0) {
        throw new Error('Debe haber al menos un participante');
      }

      // Crear gasto
      const { data: expense, error: expenseError } = await supabase
        .from('shared_expenses')
        .insert({
          family_group_id: groupId,
          title,
          amount: parseFloat(amount),
          expense_date: expense_date || new Date().toISOString().split('T')[0],
          category_id: category_id || null,
          description: description || null,
          paid_by_user_id: paid_by_user_id || userId,
        })
        .select()
        .single();

      if (expenseError) throw expenseError;

      // Calcular y crear splits según el tipo
      const splitsToCreate = calculateSplits(amount, split_type, participants);

      const splitsData = splitsToCreate.map(split => ({
        shared_expense_id: expense.id,
        user_id: split.user_id,
        amount: split.amount,
        percentage: split.percentage || null,
      }));

      const { error: splitsError } = await supabase
        .from('shared_expense_splits')
        .insert(splitsData);

      if (splitsError) throw splitsError;

      toast({
        title: 'Gasto creado',
        description: 'El gasto compartido ha sido creado exitosamente',
      });

      await fetchExpenses();
      return { data: expense, error: null };
    } catch (error) {
      console.error('Error creating expense:', error);
      captureError(error, { section: 'shared_expenses', action: 'create', groupId });
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'No se pudo crear el gasto',
      });
      return { error };
    }
  }, [groupId, userId, toast, fetchExpenses]);

  // Calcular splits según el tipo de división
  const calculateSplits = (totalAmount, splitType, participants) => {
    const total = parseFloat(totalAmount);
    const splits = [];

    switch (splitType) {
      case 'equal':
        // División equitativa
        const amountPerPerson = total / participants.length;
        participants.forEach(p => {
          splits.push({
            user_id: p.user_id,
            amount: amountPerPerson,
            percentage: (100 / participants.length).toFixed(2),
          });
        });
        break;

      case 'percentage':
        // División por porcentaje
        const totalPercentage = participants.reduce((sum, p) => sum + parseFloat(p.percentage || 0), 0);
        if (Math.abs(totalPercentage - 100) > 0.01) {
          throw new Error('Los porcentajes deben sumar 100%');
        }
        participants.forEach(p => {
          const percentage = parseFloat(p.percentage || 0);
          splits.push({
            user_id: p.user_id,
            amount: (total * percentage) / 100,
            percentage: percentage,
          });
        });
        break;

      case 'amounts':
        // División por montos específicos
        const totalAmounts = participants.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);
        if (Math.abs(totalAmounts - total) > 0.01) {
          throw new Error('Los montos deben sumar el total del gasto');
        }
        participants.forEach(p => {
          const amount = parseFloat(p.amount || 0);
          splits.push({
            user_id: p.user_id,
            amount: amount,
            percentage: ((amount / total) * 100).toFixed(2),
          });
        });
        break;

      default:
        throw new Error('Tipo de división no válido');
    }

    return splits;
  };

  // Marcar split como pagado
  const settleSplit = useCallback(async (expenseId, userIdToSettle) => {
    try {
      const { error } = await supabase
        .from('shared_expense_splits')
        .update({
          is_settled: true,
          settled_at: new Date().toISOString(),
        })
        .eq('shared_expense_id', expenseId)
        .eq('user_id', userIdToSettle);

      if (error) throw error;

      // Verificar si todos los splits están pagados para actualizar el estado del gasto
      const { data: allSplits, error: splitsError } = await supabase
        .from('shared_expense_splits')
        .select('is_settled')
        .eq('shared_expense_id', expenseId);

      if (splitsError) throw splitsError;

      const allSettled = allSplits.every(s => s.is_settled);

      if (allSettled) {
        await supabase
          .from('shared_expenses')
          .update({ status: 'settled' })
          .eq('id', expenseId);
      }

      toast({
        title: 'Pago registrado',
        description: 'El pago ha sido registrado exitosamente',
      });

      await fetchExpenses();
      return { error: null };
    } catch (error) {
      console.error('Error settling split:', error);
      captureError(error, { section: 'shared_expenses', action: 'settle', expenseId });
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudo registrar el pago',
      });
      return { error };
    }
  }, [toast, fetchExpenses]);

  // Eliminar gasto
  const deleteExpense = useCallback(async (expenseId) => {
    try {
      // Verificar permisos (solo admin o quien creó el gasto)
      const expense = expenses.find(e => e.id === expenseId);
      if (!expense) {
        throw new Error('Gasto no encontrado');
      }

      // TODO: Verificar permisos de admin aquí si es necesario

      const { error } = await supabase
        .from('shared_expenses')
        .update({ status: 'cancelled' })
        .eq('id', expenseId);

      if (error) throw error;

      toast({
        title: 'Gasto eliminado',
        description: 'El gasto ha sido eliminado',
      });

      await fetchExpenses();
      return { error: null };
    } catch (error) {
      console.error('Error deleting expense:', error);
      captureError(error, { section: 'shared_expenses', action: 'delete', expenseId });
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'No se pudo eliminar el gasto',
      });
      return { error };
    }
  }, [expenses, toast, fetchExpenses]);

  return {
    expenses,
    splits,
    balance,
    loading,
    fetchExpenses,
    createExpense,
    settleSplit,
    deleteExpense,
    calculateSplits,
  };
};


