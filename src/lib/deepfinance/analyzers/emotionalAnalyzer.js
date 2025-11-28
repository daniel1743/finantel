// =====================================================
// EMOTIONAL ANALYZER - DeepFinance Engine
// =====================================================
// Analiza gastos emocionales e impulsivos
// =====================================================

export class EmotionalAnalyzer {
  constructor(transactions, budgets = [], moodData = null) {
    this.transactions = transactions || [];
    this.budgets = budgets || [];
    this.moodData = moodData || null;
  }

  /**
   * Analiza todos los aspectos emocionales
   * @returns {Object}
   */
  analyzeAll() {
    return {
      // Gastos emocionales detectados
      emotionalSpending: this.analyzeEmotionalSpending(),
      
      // Gastos impulsivos
      impulsiveSpending: this.analyzeImpulsiveSpending(),
      
      // Patrones emocionales
      patterns: this.analyzeEmotionalPatterns(),
      
      // Impacto total
      impact: this.calculateEmotionalImpact(),
      
      // Resumen ejecutivo
      summary: this.generateEmotionalSummary()
    };
  }

  /**
   * Analiza gastos emocionales
   * @returns {Object}
   */
  analyzeEmotionalSpending() {
    const indicators = {
      // Transacciones en horarios nocturnos (22:00-02:00)
      lateNight: this.detectLateNightSpending(),
      
      // Transacciones en fines de semana
      weekend: this.detectWeekendSpending(),
      
      // Transacciones sin categoría o "otros"
      uncategorized: this.detectUncategorizedSpending(),
      
      // Transacciones repetitivas en corto tiempo
      repetitive: this.detectRepetitiveSpending(),
      
      // Transacciones que exceden presupuesto
      budgetExceeded: this.detectBudgetExceeded(),
      
      // Transacciones en categorías "emocionales"
      emotionalCategories: this.detectEmotionalCategories()
    };

    // Calcular totales
    const allEmotional = new Set();
    
    Object.values(indicators).forEach(indicator => {
      if (indicator && indicator.transactions) {
        indicator.transactions.forEach(tx => allEmotional.add(tx.id));
      }
    });

    const emotionalTransactions = this.transactions.filter(tx => 
      allEmotional.has(tx.id)
    );

    const totalEmotional = emotionalTransactions.reduce(
      (sum, tx) => sum + parseFloat(tx.amount || 0), 0
    );

    const totalExpenses = this.transactions
      .filter(tx => tx.type === 'expense')
      .reduce((sum, tx) => sum + parseFloat(tx.amount || 0), 0);

    const percentage = totalExpenses > 0 
      ? (totalEmotional / totalExpenses) * 100 
      : 0;

    return {
      total: Math.round(totalEmotional * 100) / 100,
      percentage: Math.round(percentage * 100) / 100,
      count: emotionalTransactions.length,
      indicators,
      transactions: emotionalTransactions.map(tx => ({
        id: tx.id,
        description: tx.description,
        amount: parseFloat(tx.amount || 0),
        date: tx.date,
        category: tx.categories?.name || 'Sin categoría',
        reason: this.getEmotionalReason(tx, indicators)
      })),
      severity: percentage > 40 ? 'high' : percentage > 25 ? 'medium' : 'low'
    };
  }

  /**
   * Detecta gastos en horarios nocturnos (22:00-02:00)
   * @returns {Object}
   */
  detectLateNightSpending() {
    const lateNight = this.transactions.filter(tx => {
      if (tx.type !== 'expense' || !tx.date) return false;
      
      const date = new Date(tx.date);
      const hour = date.getHours();
      
      // 22:00-23:59 o 00:00-02:00
      return (hour >= 22 || hour < 2);
    });

    if (lateNight.length === 0) return null;

    const total = lateNight.reduce(
      (sum, tx) => sum + parseFloat(tx.amount || 0), 0
    );

    return {
      type: 'late_night',
      description: 'Gastos en horarios nocturnos (22:00-02:00)',
      count: lateNight.length,
      total: Math.round(total * 100) / 100,
      transactions: lateNight
    };
  }

  /**
   * Detecta gastos en fines de semana
   * @returns {Object}
   */
  detectWeekendSpending() {
    const weekend = this.transactions.filter(tx => {
      if (tx.type !== 'expense' || !tx.date) return false;
      
      const date = new Date(tx.date);
      const day = date.getDay();
      
      // 0 = Domingo, 6 = Sábado
      return day === 0 || day === 6;
    });

    if (weekend.length === 0) return null;

    const total = weekend.reduce(
      (sum, tx) => sum + parseFloat(tx.amount || 0), 0
    );

    const allExpenses = this.transactions
      .filter(tx => tx.type === 'expense')
      .reduce((sum, tx) => sum + parseFloat(tx.amount || 0), 0);

    const percentage = allExpenses > 0 ? (total / allExpenses) * 100 : 0;

    return {
      type: 'weekend',
      description: 'Gastos en fines de semana',
      count: weekend.length,
      total: Math.round(total * 100) / 100,
      percentage: Math.round(percentage * 100) / 100,
      transactions: weekend
    };
  }

  /**
   * Detecta gastos sin categoría o en "otros"
   * @returns {Object}
   */
  detectUncategorizedSpending() {
    const uncategorized = this.transactions.filter(tx => {
      if (tx.type !== 'expense') return false;
      
      const categoryName = tx.categories?.name?.toLowerCase() || '';
      return !tx.category_id || 
             categoryName === 'otros' || 
             categoryName === 'sin categoría' ||
             categoryName === 'other' ||
             categoryName === 'uncategorized';
    });

    if (uncategorized.length === 0) return null;

    const total = uncategorized.reduce(
      (sum, tx) => sum + parseFloat(tx.amount || 0), 0
    );

    return {
      type: 'uncategorized',
      description: 'Gastos sin categoría o en "otros"',
      count: uncategorized.length,
      total: Math.round(total * 100) / 100,
      transactions: uncategorized
    };
  }

  /**
   * Detecta gastos repetitivos en corto tiempo
   * @returns {Object}
   */
  detectRepetitiveSpending() {
    // Agrupar por descripción similar en el mismo día o días consecutivos
    const groups = {};

    this.transactions.forEach(tx => {
      if (tx.type === 'expense' && tx.description && tx.date) {
        const date = new Date(tx.date);
        const dateKey = date.toISOString().split('T')[0];
        const normalizedDesc = tx.description.toLowerCase().trim();
        const key = `${normalizedDesc}_${dateKey}`;

        if (!groups[key]) {
          groups[key] = [];
        }

        groups[key].push(tx);
      }
    });

    const repetitive = [];

    Object.entries(groups).forEach(([key, txs]) => {
      if (txs.length >= 2) {
        const total = txs.reduce((sum, tx) => sum + parseFloat(tx.amount || 0), 0);
        repetitive.push({
          description: txs[0].description,
          date: txs[0].date,
          count: txs.length,
          total: Math.round(total * 100) / 100,
          transactions: txs
        });
      }
    });

    if (repetitive.length === 0) return null;

    const totalRepetitive = repetitive.reduce((sum, r) => sum + r.total, 0);

    return {
      type: 'repetitive',
      description: 'Gastos repetitivos en corto tiempo',
      count: repetitive.length,
      total: Math.round(totalRepetitive * 100) / 100,
      instances: repetitive
    };
  }

  /**
   * Detecta gastos que exceden presupuesto
   * @returns {Object}
   */
  detectBudgetExceeded() {
    if (this.budgets.length === 0) return null;

    const exceeded = [];

    this.budgets.forEach(budget => {
      const categoryTransactions = this.transactions.filter(
        tx => tx.type === 'expense' && tx.category_id === budget.category_id
      );

      const spent = categoryTransactions.reduce(
        (sum, tx) => sum + parseFloat(tx.amount || 0), 0
      );

      const budgetAmount = parseFloat(budget.amount || 0);
      const percentage = budgetAmount > 0 ? (spent / budgetAmount) * 100 : 0;

      if (percentage > 100) {
        exceeded.push({
          budgetId: budget.id,
          categoryId: budget.category_id,
          categoryName: budget.categories?.name || 'Sin categoría',
          budgetAmount,
          spent: Math.round(spent * 100) / 100,
          exceeded: Math.round((spent - budgetAmount) * 100) / 100,
          percentage: Math.round(percentage * 100) / 100
        });
      }
    });

    if (exceeded.length === 0) return null;

    const totalExceeded = exceeded.reduce((sum, e) => sum + e.exceeded, 0);

    return {
      type: 'budget_exceeded',
      description: 'Gastos que exceden presupuesto',
      count: exceeded.length,
      total: Math.round(totalExceeded * 100) / 100,
      budgets: exceeded
    };
  }

  /**
   * Detecta gastos en categorías típicamente emocionales
   * @returns {Object}
   */
  detectEmotionalCategories() {
    const emotionalCategoryNames = [
      'entretenimiento', 'entretenimiento',
      'comida rápida', 'fast food',
      'shopping', 'compras',
      'regalos', 'gifts',
      'ocio', 'recreación',
      'hobbies', 'pasatiempos'
    ].map(name => name.toLowerCase());

    const emotional = this.transactions.filter(tx => {
      if (tx.type !== 'expense') return false;
      
      const categoryName = tx.categories?.name?.toLowerCase() || '';
      return emotionalCategoryNames.some(emotionalName => 
        categoryName.includes(emotionalName)
      );
    });

    if (emotional.length === 0) return null;

    const total = emotional.reduce(
      (sum, tx) => sum + parseFloat(tx.amount || 0), 0
    );

    return {
      type: 'emotional_categories',
      description: 'Gastos en categorías típicamente emocionales',
      count: emotional.length,
      total: Math.round(total * 100) / 100,
      transactions: emotional
    };
  }

  /**
   * Analiza gastos impulsivos
   * @returns {Object}
   */
  analyzeImpulsiveSpending() {
    // Gastos que son significativamente mayores al promedio de la categoría
    const categoryAverages = {};
    
    this.transactions.forEach(tx => {
      if (tx.type === 'expense' && tx.category_id) {
        const catId = tx.category_id;
        if (!categoryAverages[catId]) {
          categoryAverages[catId] = {
            total: 0,
            count: 0,
            amounts: []
          };
        }
        
        const amount = parseFloat(tx.amount || 0);
        categoryAverages[catId].total += amount;
        categoryAverages[catId].count += 1;
        categoryAverages[catId].amounts.push(amount);
      }
    });

    // Calcular promedio y desviación estándar por categoría
    const categoryStats = {};
    Object.entries(categoryAverages).forEach(([catId, data]) => {
      const avg = data.total / data.count;
      const variance = data.amounts.reduce(
        (sum, amount) => sum + Math.pow(amount - avg, 2), 0
      ) / data.count;
      const stdDev = Math.sqrt(variance);

      categoryStats[catId] = {
        average: avg,
        stdDev: stdDev,
        threshold: avg + (1.5 * stdDev) // 1.5 desviaciones estándar
      };
    });

    // Encontrar gastos que exceden el threshold
    const impulsive = this.transactions.filter(tx => {
      if (tx.type !== 'expense' || !tx.category_id) return false;
      
      const stats = categoryStats[tx.category_id];
      if (!stats) return false;

      const amount = parseFloat(tx.amount || 0);
      return amount > stats.threshold && amount > stats.average * 1.5;
    });

    if (impulsive.length === 0) {
      return {
        total: 0,
        percentage: 0,
        count: 0,
        transactions: [],
        severity: 'low'
      };
    }

    const totalImpulsive = impulsive.reduce(
      (sum, tx) => sum + parseFloat(tx.amount || 0), 0
    );

    const totalExpenses = this.transactions
      .filter(tx => tx.type === 'expense')
      .reduce((sum, tx) => sum + parseFloat(tx.amount || 0), 0);

    const percentage = totalExpenses > 0 
      ? (totalImpulsive / totalExpenses) * 100 
      : 0;

    return {
      total: Math.round(totalImpulsive * 100) / 100,
      percentage: Math.round(percentage * 100) / 100,
      count: impulsive.length,
      transactions: impulsive.map(tx => ({
        id: tx.id,
        description: tx.description,
        amount: parseFloat(tx.amount || 0),
        date: tx.date,
        category: tx.categories?.name || 'Sin categoría',
        average: categoryStats[tx.category_id]?.average || 0,
        deviation: parseFloat(tx.amount || 0) - (categoryStats[tx.category_id]?.average || 0)
      })),
      severity: percentage > 20 ? 'high' : percentage > 10 ? 'medium' : 'low'
    };
  }

  /**
   * Analiza patrones emocionales
   * @returns {Object}
   */
  analyzeEmotionalPatterns() {
    const emotional = this.analyzeEmotionalSpending();
    
    return {
      // Día de la semana con más gastos emocionales
      dayOfWeek: this.getEmotionalDayOfWeek(),
      
      // Hora del día con más gastos emocionales
      hourOfDay: this.getEmotionalHourOfDay(),
      
      // Tendencia mensual
      monthlyTrend: this.getEmotionalMonthlyTrend(),
      
      // Categorías más emocionales
      topCategories: this.getTopEmotionalCategories(emotional)
    };
  }

  /**
   * Obtiene día de la semana con más gastos emocionales
   * @returns {Object|null}
   */
  getEmotionalDayOfWeek() {
    const emotional = this.analyzeEmotionalSpending();
    if (emotional.count === 0) return null;

    const dayTotals = {};
    const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

    emotional.transactions.forEach(tx => {
      const date = new Date(tx.date);
      const day = date.getDay();
      if (!dayTotals[day]) dayTotals[day] = 0;
      dayTotals[day] += parseFloat(tx.amount || 0);
    });

    const maxDay = Object.entries(dayTotals).reduce((a, b) => 
      dayTotals[a[0]] > dayTotals[b[0]] ? a : b
    );

    return {
      day: dayNames[maxDay[0]],
      dayIndex: parseInt(maxDay[0]),
      total: Math.round(dayTotals[maxDay[0]] * 100) / 100
    };
  }

  /**
   * Obtiene hora del día con más gastos emocionales
   * @returns {Object|null}
   */
  getEmotionalHourOfDay() {
    const emotional = this.analyzeEmotionalSpending();
    if (emotional.count === 0) return null;

    const hourTotals = {};

    emotional.transactions.forEach(tx => {
      const date = new Date(tx.date);
      const hour = date.getHours();
      if (!hourTotals[hour]) hourTotals[hour] = 0;
      hourTotals[hour] += parseFloat(tx.amount || 0);
    });

    const maxHour = Object.entries(hourTotals).reduce((a, b) => 
      hourTotals[a[0]] > hourTotals[b[0]] ? a : b
    );

    return {
      hour: parseInt(maxHour[0]),
      total: Math.round(hourTotals[maxHour[0]] * 100) / 100
    };
  }

  /**
   * Obtiene tendencia mensual de gastos emocionales
   * @returns {Object|null}
   */
  getEmotionalMonthlyTrend() {
    const emotional = this.analyzeEmotionalSpending();
    if (emotional.count === 0) return null;

    const monthlyTotals = {};

    emotional.transactions.forEach(tx => {
      const date = new Date(tx.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (!monthlyTotals[monthKey]) monthlyTotals[monthKey] = 0;
      monthlyTotals[monthKey] += parseFloat(tx.amount || 0);
    });

    const months = Object.keys(monthlyTotals).sort();
    if (months.length < 2) return null;

    const first = monthlyTotals[months[0]];
    const last = monthlyTotals[months[months.length - 1]];
    const change = last - first;
    const changePercent = first > 0 ? ((change / first) * 100) : 0;

    return {
      trend: change > 0 ? 'increasing' : change < 0 ? 'decreasing' : 'stable',
      changePercent: Math.round(changePercent * 100) / 100,
      monthlyData: months.map(month => ({
        month,
        total: Math.round(monthlyTotals[month] * 100) / 100
      }))
    };
  }

  /**
   * Obtiene categorías con más gastos emocionales
   * @param {Object} emotional
   * @returns {Array}
   */
  getTopEmotionalCategories(emotional) {
    if (emotional.count === 0) return [];

    const categoryTotals = {};

    emotional.transactions.forEach(tx => {
      const catId = tx.category_id || 'uncategorized';
      const catName = tx.categories?.name || 'Sin categoría';
      
      if (!categoryTotals[catId]) {
        categoryTotals[catId] = {
          id: catId,
          name: catName,
          total: 0,
          count: 0
        };
      }

      categoryTotals[catId].total += parseFloat(tx.amount || 0);
      categoryTotals[catId].count += 1;
    });

    return Object.values(categoryTotals)
      .sort((a, b) => b.total - a.total)
      .slice(0, 5)
      .map(cat => ({
        ...cat,
        total: Math.round(cat.total * 100) / 100
      }));
  }

  /**
   * Calcula impacto total emocional
   * @returns {Object}
   */
  calculateEmotionalImpact() {
    const emotional = this.analyzeEmotionalSpending();
    const impulsive = this.analyzeImpulsiveSpending();

    const totalEmotional = emotional.total + impulsive.total;
    
    const totalExpenses = this.transactions
      .filter(tx => tx.type === 'expense')
      .reduce((sum, tx) => sum + parseFloat(tx.amount || 0), 0);

    const percentage = totalExpenses > 0 
      ? (totalEmotional / totalExpenses) * 100 
      : 0;

    return {
      total: Math.round(totalEmotional * 100) / 100,
      percentage: Math.round(percentage * 100) / 100,
      emotional: emotional.total,
      impulsive: impulsive.total,
      severity: percentage > 40 ? 'high' : percentage > 25 ? 'medium' : 'low',
      description: percentage > 0
        ? `Gastos emocionales/impulsivos: ${percentage.toFixed(1)}% del total ($${totalEmotional.toLocaleString('es-CL')})`
        : 'No se detectaron gastos emocionales significativos'
    };
  }

  /**
   * Genera resumen ejecutivo
   * @returns {string}
   */
  generateEmotionalSummary() {
    const emotional = this.analyzeEmotionalSpending();
    const impulsive = this.analyzeImpulsiveSpending();
    const impact = this.calculateEmotionalImpact();

    if (impact.total === 0) {
      return 'No se detectaron gastos emocionales o impulsivos significativos en el período analizado';
    }

    const parts = [];

    if (emotional.percentage > 0) {
      parts.push(`${emotional.percentage.toFixed(1)}% de gastos emocionales`);
    }

    if (impulsive.percentage > 0) {
      parts.push(`${impulsive.percentage.toFixed(1)}% de gastos impulsivos`);
    }

    return `${parts.join(' y ')}. ${impact.description}`;
  }

  /**
   * Obtiene razón emocional de una transacción
   * @param {Object} tx
   * @param {Object} indicators
   * @returns {string}
   */
  getEmotionalReason(tx, indicators) {
    const reasons = [];

    if (indicators.lateNight?.transactions?.some(t => t.id === tx.id)) {
      reasons.push('Horario nocturno');
    }

    if (indicators.weekend?.transactions?.some(t => t.id === tx.id)) {
      reasons.push('Fin de semana');
    }

    if (indicators.uncategorized?.transactions?.some(t => t.id === tx.id)) {
      reasons.push('Sin categoría');
    }

    if (indicators.repetitive?.instances?.some(inst => 
      inst.transactions.some(t => t.id === tx.id)
    )) {
      reasons.push('Repetitivo');
    }

    if (indicators.budgetExceeded?.budgets?.some(b => 
      b.categoryId === tx.category_id
    )) {
      reasons.push('Excede presupuesto');
    }

    if (indicators.emotionalCategories?.transactions?.some(t => t.id === tx.id)) {
      reasons.push('Categoría emocional');
    }

    return reasons.length > 0 ? reasons.join(', ') : 'Múltiples indicadores';
  }
}

