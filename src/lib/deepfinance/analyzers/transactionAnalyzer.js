// =====================================================
// TRANSACTION ANALYZER - DeepFinance Engine
// =====================================================
// Análisis básico por transacción
// =====================================================

export class TransactionAnalyzer {
  constructor(transactions, budgets, categories) {
    this.transactions = transactions || [];
    this.budgets = budgets || [];
    this.categories = categories || [];
  }

  /**
   * Analiza todas las transacciones
   * @returns {Object}
   */
  analyzeAll() {
    const expenses = this.transactions.filter(tx => tx.type === 'expense');
    const income = this.transactions.filter(tx => tx.type === 'income');

    return {
      total: this.transactions.length,
      expenses: expenses.length,
      income: income.length,
      byTransaction: expenses.map(tx => this.analyzeTransaction(tx)),
      summary: this.calculateSummary(expenses, income),
      categoryBreakdown: this.analyzeByCategory(expenses),
      monthlyBreakdown: this.analyzeByMonth(expenses),
    };
  }

  /**
   * Analiza una transacción individual
   * @param {Object} transaction
   * @returns {Object}
   */
  analyzeTransaction(transaction) {
    const amount = parseFloat(transaction.amount || 0);
    const category = transaction.categories;
    const budget = transaction.budgets;

    return {
      id: transaction.id,
      date: transaction.date,
      amount,
      description: transaction.description,
      category: category?.name || 'Sin categoría',
      categoryId: transaction.category_id,
      
      // Clasificaciones
      necessity: this.classifyNecessity(transaction, category),
      impulse: this.classifyImpulse(transaction),
      emotional: this.classifyEmotional(transaction),
      
      // Impacto en presupuesto
      budgetImpact: this.calculateBudgetImpact(transaction, budget),
      
      // Comparación con promedio
      vsAverage: this.compareToAverage(transaction, category),
      
      // Repetición
      isRecurring: transaction.is_recurring || false,
      recurringFrequency: transaction.recurring_frequency,
    };
  }

  /**
   * Clasifica si el gasto es necesario o innecesario
   * @param {Object} transaction
   * @param {Object} category
   * @returns {string} 'necessary' | 'unnecessary' | 'optional'
   */
  classifyNecessity(transaction, category) {
    // Categorías típicamente necesarias
    const necessaryCategories = [
      'Alimentación básica',
      'Transporte',
      'Servicios básicos',
      'Salud',
      'Vivienda',
      'Educación'
    ];

    // Categorías típicamente innecesarias
    const unnecessaryCategories = [
      'Entretenimiento',
      'Compras impulsivas',
      'Lujos',
      'Suscripciones',
      'Comida rápida'
    ];

    const categoryName = category?.name?.toLowerCase() || '';
    const description = (transaction.description || '').toLowerCase();

    // Verificar en categorías necesarias
    if (necessaryCategories.some(cat => 
      categoryName.includes(cat.toLowerCase()) || 
      description.includes(cat.toLowerCase())
    )) {
      return 'necessary';
    }

    // Verificar en categorías innecesarias
    if (unnecessaryCategories.some(cat => 
      categoryName.includes(cat.toLowerCase()) || 
      description.includes(cat.toLowerCase())
    )) {
      return 'unnecessary';
    }

    return 'optional';
  }

  /**
   * Clasifica si el gasto es impulsivo
   * @param {Object} transaction
   * @returns {boolean}
   */
  classifyImpulse(transaction) {
    // Indicadores de gasto impulsivo:
    // 1. Sin categoría asignada
    // 2. Descripción muy corta o genérica
    // 3. Monto redondo (sospechoso)
    // 4. En fin de semana
    // 5. Sin presupuesto asociado

    const date = new Date(transaction.date);
    const dayOfWeek = date.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const amount = parseFloat(transaction.amount || 0);
    const isRoundAmount = amount % 10 === 0 && amount >= 10;
    const hasNoCategory = !transaction.category_id;
    const hasShortDescription = !transaction.description || transaction.description.length < 5;
    const hasNoBudget = !transaction.budget_id;

    // Si cumple 3+ criterios, es probablemente impulsivo
    const indicators = [
      isWeekend,
      isRoundAmount,
      hasNoCategory,
      hasShortDescription,
      hasNoBudget
    ].filter(Boolean).length;

    return indicators >= 3;
  }

  /**
   * Clasifica si el gasto es emocional
   * @param {Object} transaction
   * @returns {boolean}
   */
  classifyEmotional(transaction) {
    // Similar a impulsivo pero con más énfasis en patrones
    const isImpulsive = this.classifyImpulse(transaction);
    
    // Gastos emocionales típicos:
    const emotionalKeywords = [
      'comida rápida',
      'delivery',
      'shopping',
      'compra',
      'regalo',
      'sorpresa'
    ];

    const description = (transaction.description || '').toLowerCase();
    const hasEmotionalKeyword = emotionalKeywords.some(keyword => 
      description.includes(keyword)
    );

    return isImpulsive || hasEmotionalKeyword;
  }

  /**
   * Calcula impacto en el presupuesto
   * @param {Object} transaction
   * @param {Object} budget
   * @returns {Object}
   */
  calculateBudgetImpact(transaction, budget) {
    if (!budget) {
      return {
        hasBudget: false,
        impact: null,
      };
    }

    const budgetAmount = parseFloat(budget.amount || 0);
    const transactionAmount = parseFloat(transaction.amount || 0);
    const impact = (transactionAmount / budgetAmount) * 100;

    return {
      hasBudget: true,
      budgetId: budget.id,
      budgetName: budget.name,
      budgetAmount,
      transactionAmount,
      impact,
      status: impact > 10 ? 'high' : impact > 5 ? 'medium' : 'low',
    };
  }

  /**
   * Compara con el promedio de la categoría
   * @param {Object} transaction
   * @param {Object} category
   * @returns {Object}
   */
  compareToAverage(transaction, category) {
    if (!category) {
      return { hasComparison: false };
    }

    // Calcular promedio de esta categoría
    const categoryTransactions = this.transactions.filter(
      tx => tx.category_id === transaction.category_id && tx.type === 'expense'
    );

    if (categoryTransactions.length < 2) {
      return { hasComparison: false };
    }

    const amounts = categoryTransactions.map(tx => parseFloat(tx.amount || 0));
    const average = amounts.reduce((a, b) => a + b, 0) / amounts.length;
    const current = parseFloat(transaction.amount || 0);
    const difference = current - average;
    const percentageDiff = average > 0 ? (difference / average) * 100 : 0;

    return {
      hasComparison: true,
      average,
      current,
      difference,
      percentageDiff,
      isAboveAverage: current > average,
      isSignificantlyAbove: percentageDiff > 50,
    };
  }

  /**
   * Calcula resumen de gastos e ingresos
   * @param {Array} expenses
   * @param {Array} income
   * @returns {Object}
   */
  calculateSummary(expenses, income) {
    const totalExpenses = expenses.reduce(
      (sum, tx) => sum + parseFloat(tx.amount || 0), 0
    );
    const totalIncome = income.reduce(
      (sum, tx) => sum + parseFloat(tx.amount || 0), 0
    );
    const netSavings = totalIncome - totalExpenses;
    const savingsRate = totalIncome > 0 
      ? (netSavings / totalIncome) * 100 
      : 0;

    return {
      totalExpenses,
      totalIncome,
      netSavings,
      savingsRate: Math.round(savingsRate * 100) / 100,
      averageExpense: expenses.length > 0 
        ? totalExpenses / expenses.length 
        : 0,
      averageIncome: income.length > 0 
        ? totalIncome / income.length 
        : 0,
    };
  }

  /**
   * Analiza gastos por categoría
   * @param {Array} expenses
   * @returns {Object}
   */
  analyzeByCategory(expenses) {
    const categoryTotals = {};
    const categoryCounts = {};

    expenses.forEach(tx => {
      const categoryName = tx.categories?.name || 'Sin categoría';
      const amount = parseFloat(tx.amount || 0);

      if (!categoryTotals[categoryName]) {
        categoryTotals[categoryName] = 0;
        categoryCounts[categoryName] = 0;
      }

      categoryTotals[categoryName] += amount;
      categoryCounts[categoryName] += 1;
    });

    const total = Object.values(categoryTotals).reduce((a, b) => a + b, 0);

    return Object.entries(categoryTotals).map(([name, amount]) => ({
      name,
      amount,
      count: categoryCounts[name],
      percentage: total > 0 ? (amount / total) * 100 : 0,
      average: categoryCounts[name] > 0 
        ? amount / categoryCounts[name] 
        : 0,
    })).sort((a, b) => b.amount - a.amount);
  }

  /**
   * Analiza gastos por mes
   * @param {Array} expenses
   * @returns {Array}
   */
  analyzeByMonth(expenses) {
    const monthlyTotals = {};

    expenses.forEach(tx => {
      const date = new Date(tx.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const amount = parseFloat(tx.amount || 0);

      if (!monthlyTotals[monthKey]) {
        monthlyTotals[monthKey] = {
          month: monthKey,
          total: 0,
          count: 0,
        };
      }

      monthlyTotals[monthKey].total += amount;
      monthlyTotals[monthKey].count += 1;
    });

    return Object.values(monthlyTotals)
      .sort((a, b) => a.month.localeCompare(b.month))
      .map(month => ({
        ...month,
        average: month.count > 0 ? month.total / month.count : 0,
      }));
  }
}

