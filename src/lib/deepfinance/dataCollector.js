// =====================================================
// DATA COLLECTOR - DeepFinance Engine
// =====================================================
// Recolecta todos los datos necesarios para el análisis
// =====================================================

import { supabase } from '@/lib/customSupabaseClient';

export class DataCollector {
  constructor(userId) {
    this.userId = userId;
  }

  /**
   * Recolecta todas las transacciones del usuario
   * @param {string} period - '30days', '90days', '180days', 'all'
   * @returns {Promise<Array>}
   */
  async collectTransactions(period = '90days') {
    if (!this.userId) {
      throw new Error('User ID is required');
    }

    try {
      let query = supabase
        .from('transactions')
        .select(`
          *,
          categories(name, icon, color, type),
          budgets(name, amount, period, start_date, end_date)
        `)
        .eq('user_id', this.userId)
        .order('date', { ascending: false });

      // Aplicar filtro de período
      if (period !== 'all') {
        const days = parseInt(period.replace('days', ''));
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        query = query.gte('date', startDate.toISOString().split('T')[0]);
      }

      // Limitar a 500 transacciones para performance
      query = query.limit(500);

      const { data, error } = await query;

      if (error) throw error;

      return this.filterByPeriod(data || [], period);
    } catch (error) {
      console.error('[DataCollector] Error collecting transactions:', error);
      throw error;
    }
  }

  /**
   * Filtra transacciones por período
   * @param {Array} transactions
   * @param {string} period
   * @returns {Array}
   */
  filterByPeriod(transactions, period) {
    if (period === 'all') return transactions;

    const days = parseInt(period.replace('days', ''));
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    return transactions.filter(tx => {
      const txDate = new Date(tx.date);
      return txDate >= cutoffDate;
    });
  }

  /**
   * Recolecta presupuestos activos
   * @returns {Promise<Array>}
   */
  async collectBudgets() {
    if (!this.userId) {
      throw new Error('User ID is required');
    }

    try {
      const { data, error } = await supabase
        .from('budgets')
        .select(`
          *,
          categories(name, icon, color)
        `)
        .eq('user_id', this.userId)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('[DataCollector] Error collecting budgets:', error);
      throw error;
    }
  }

  /**
   * Recolecta metas activas
   * @returns {Promise<Array>}
   */
  async collectGoals() {
    if (!this.userId) {
      throw new Error('User ID is required');
    }

    try {
      const { data, error } = await supabase
        .from('goals')
        .select(`
          *,
          categories(name, icon, color)
        `)
        .eq('user_id', this.userId)
        .eq('status', 'active')
        .order('priority', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('[DataCollector] Error collecting goals:', error);
      throw error;
    }
  }

  /**
   * Recolecta categorías del usuario
   * @returns {Promise<Array>}
   */
  async collectCategories() {
    if (!this.userId) {
      throw new Error('User ID is required');
    }

    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('user_id', this.userId)
        .eq('is_active', true)
        .order('name', { ascending: true });

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('[DataCollector] Error collecting categories:', error);
      throw error;
    }
  }

  /**
   * Recolecta todos los datos necesarios para el análisis
   * @param {string} period
   * @returns {Promise<Object>}
   */
  async collectAllData(period = '90days') {
    try {
      const [transactions, budgets, goals, categories] = await Promise.all([
        this.collectTransactions(period),
        this.collectBudgets(),
        this.collectGoals(),
        this.collectCategories(),
      ]);

      // Calcular período real
      const dates = transactions.map(tx => new Date(tx.date)).sort((a, b) => a - b);
      const periodStart = dates.length > 0 ? dates[0] : new Date();
      const periodEnd = dates.length > 0 ? dates[dates.length - 1] : new Date();
      const periodDays = Math.ceil((periodEnd - periodStart) / (1000 * 60 * 60 * 24)) || 1;

      return {
        transactions,
        budgets,
        goals,
        categories,
        period: {
          start: periodStart.toISOString().split('T')[0],
          end: periodEnd.toISOString().split('T')[0],
          days: periodDays,
          periodType: period,
        },
        metadata: {
          collectedAt: new Date().toISOString(),
          transactionCount: transactions.length,
          budgetCount: budgets.length,
          goalCount: goals.length,
          categoryCount: categories.length,
        },
      };
    } catch (error) {
      console.error('[DataCollector] Error collecting all data:', error);
      throw error;
    }
  }

  /**
   * Valida que hay datos suficientes para el análisis
   * @param {Object} data
   * @returns {Object} { valid: boolean, reason?: string }
   */
  validateMinimumData(data) {
    const minTransactions = 10;

    if (!data.transactions || data.transactions.length < minTransactions) {
      return {
        valid: false,
        reason: `Se requieren al menos ${minTransactions} transacciones para realizar el análisis. Actualmente tienes ${data.transactions?.length || 0}.`,
      };
    }

    // Verificar que hay al menos algunos gastos
    const expenses = data.transactions.filter(tx => tx.type === 'expense');
    if (expenses.length < 5) {
      return {
        valid: false,
        reason: 'Se requieren al menos 5 transacciones de gastos para realizar el análisis.',
      };
    }

    return { valid: true };
  }

  /**
   * Calcula datos del mood desde transacciones (si no hay Mood Engine)
   * @param {Array} transactions
   * @returns {Object}
   */
  calculateMoodFromTransactions(transactions) {
    // Análisis básico de patrones emocionales
    const expenses = transactions.filter(tx => tx.type === 'expense');
    
    // Gastos en horarios nocturnos (22:00-02:00) - indicador emocional
    const lateNightExpenses = expenses.filter(tx => {
      // Asumir que no tenemos hora, solo fecha
      // Esto es un placeholder para cuando tengamos más datos
      return false;
    });

    // Gastos en fines de semana
    const weekendExpenses = expenses.filter(tx => {
      const date = new Date(tx.date);
      const dayOfWeek = date.getDay();
      return dayOfWeek === 0 || dayOfWeek === 6; // Domingo o Sábado
    });

    return {
      lateNightCount: lateNightExpenses.length,
      weekendCount: weekendExpenses.length,
      weekendPercentage: expenses.length > 0 
        ? (weekendExpenses.length / expenses.length) * 100 
        : 0,
    };
  }
}

