// =====================================================
// LEAKAGE ANALYZER - DeepFinance Engine
// =====================================================
// Detecta fugas financieras: suscripciones invisibles, micro gastos, etc.
// =====================================================

export class LeakageAnalyzer {
  constructor(transactions, budgets = []) {
    this.transactions = transactions || [];
    this.budgets = budgets || [];
  }

  /**
   * Analiza todas las fugas financieras
   * @returns {Object}
   */
  analyzeAll() {
    return {
      // Suscripciones invisibles
      subscriptions: this.detectSubscriptions(),
      
      // Micro gastos repetitivos
      microExpenses: this.detectMicroExpenses(),
      
      // Categorías sin presupuesto que crecen
      unbudgetedGrowth: this.detectUnbudgetedGrowth(),
      
      // Gastos duplicados o errores
      duplicates: this.detectDuplicates(),
      
      // Gastos pequeños que suman mucho
      smallExpenses: this.detectSmallExpenses(),
      
      // Resumen ejecutivo
      summary: this.generateLeakageSummary(),
      
      // Impacto total
      totalImpact: this.calculateTotalImpact()
    };
  }

  /**
   * Detecta suscripciones invisibles (gastos recurrentes)
   * @returns {Array}
   */
  detectSubscriptions() {
    // Agrupar por descripción similar y monto similar
    const groups = {};
    
    this.transactions.forEach(tx => {
      if (tx.type === 'expense' && tx.description && tx.amount) {
        const normalizedDesc = tx.description.toLowerCase().trim();
        const roundedAmount = Math.round(parseFloat(tx.amount));
        const key = `${normalizedDesc}_${roundedAmount}`;

        if (!groups[key]) {
          groups[key] = [];
        }

        groups[key].push(tx);
      }
    });

    // Encontrar grupos con frecuencia mensual
    const subscriptions = [];
    Object.entries(groups).forEach(([key, txs]) => {
      if (txs.length >= 2) {
        const dates = txs.map(t => new Date(t.date)).sort();
        const avgInterval = this.calculateAverageInterval(dates);
        
        // Si el intervalo promedio es ~30 días, podría ser suscripción mensual
        if (avgInterval >= 25 && avgInterval <= 35) {
          const amount = parseFloat(txs[0].amount);
          subscriptions.push({
            type: 'subscription',
            description: txs[0].description,
            amount: amount,
            frequency: 'monthly',
            occurrences: txs.length,
            averageInterval: Math.round(avgInterval),
            totalSpent: txs.reduce((sum, t) => sum + parseFloat(t.amount || 0), 0),
            monthlyImpact: amount,
            annualImpact: amount * 12,
            firstDate: dates[0].toISOString().split('T')[0],
            lastDate: dates[dates.length - 1].toISOString().split('T')[0],
            severity: amount > 50 ? 'high' : amount > 20 ? 'medium' : 'low'
          });
        }
        // También detectar suscripciones semanales (~7 días)
        else if (avgInterval >= 5 && avgInterval <= 9) {
          const amount = parseFloat(txs[0].amount);
          subscriptions.push({
            type: 'subscription',
            description: txs[0].description,
            amount: amount,
            frequency: 'weekly',
            occurrences: txs.length,
            averageInterval: Math.round(avgInterval),
            totalSpent: txs.reduce((sum, t) => sum + parseFloat(t.amount || 0), 0),
            monthlyImpact: amount * 4.33, // Promedio de semanas por mes
            annualImpact: amount * 52,
            firstDate: dates[0].toISOString().split('T')[0],
            lastDate: dates[dates.length - 1].toISOString().split('T')[0],
            severity: (amount * 4.33) > 50 ? 'high' : (amount * 4.33) > 20 ? 'medium' : 'low'
          });
        }
      }
    });

    return subscriptions.sort((a, b) => b.annualImpact - a.annualImpact);
  }

  /**
   * Detecta micro gastos repetitivos que suman mucho
   * @returns {Array}
   */
  detectMicroExpenses() {
    // Gastos menores a $10 que se repiten frecuentemente
    const micro = this.transactions.filter(tx => 
      tx.type === 'expense' && 
      parseFloat(tx.amount || 0) < 10 && 
      parseFloat(tx.amount || 0) > 0
    );

    if (micro.length < 10) return [];

    // Agrupar por categoría
    const byCategory = {};
    micro.forEach(tx => {
      const catId = tx.category_id || 'uncategorized';
      const catName = tx.categories?.name || 'Sin categoría';
      
      if (!byCategory[catId]) {
        byCategory[catId] = {
          categoryId: catId,
          categoryName: catName,
          transactions: [],
          total: 0,
          count: 0
        };
      }
      
      byCategory[catId].transactions.push(tx);
      byCategory[catId].total += parseFloat(tx.amount || 0);
      byCategory[catId].count += 1;
    });

    const periodMonths = this.getPeriodMonths();
    const monthly = periodMonths > 0 ? periodMonths : 1;

    const microExpenses = Object.values(byCategory)
      .filter(cat => {
        const monthlyImpact = cat.total / monthly;
        return monthlyImpact > 50; // Más de $50/mes en micro gastos
      })
      .map(cat => {
        const monthlyImpact = cat.total / monthly;
        return {
          type: 'micro_expenses',
          categoryId: cat.categoryId,
          categoryName: cat.categoryName,
          monthlyImpact: Math.round(monthlyImpact * 100) / 100,
          annualImpact: Math.round(monthlyImpact * 12 * 100) / 100,
          count: cat.count,
          averageAmount: Math.round((cat.total / cat.count) * 100) / 100,
          totalSpent: Math.round(cat.total * 100) / 100,
          severity: monthlyImpact > 100 ? 'high' : monthlyImpact > 50 ? 'medium' : 'low'
        };
      })
      .sort((a, b) => b.monthlyImpact - a.monthlyImpact);

    return microExpenses;
  }

  /**
   * Detecta categorías sin presupuesto que están creciendo
   * @returns {Array}
   */
  detectUnbudgetedGrowth() {
    // Obtener categorías con presupuesto
    const budgetedCategories = new Set(
      this.budgets.map(b => b.category_id).filter(id => id)
    );

    // Agrupar transacciones por categoría y mes
    const categoryMonthly = {};

    this.transactions.forEach(tx => {
      if (tx.type === 'expense' && tx.category_id && tx.date) {
        const categoryId = tx.category_id;
        const categoryName = tx.categories?.name || 'Sin categoría';
        const date = new Date(tx.date);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

        if (!categoryMonthly[categoryId]) {
          categoryMonthly[categoryId] = {
            categoryId,
            categoryName,
            monthly: {}
          };
        }

        if (!categoryMonthly[categoryId].monthly[monthKey]) {
          categoryMonthly[categoryId].monthly[monthKey] = 0;
        }

        categoryMonthly[categoryId].monthly[monthKey] += parseFloat(tx.amount || 0);
      }
    });

    const unbudgetedGrowth = [];

    Object.entries(categoryMonthly).forEach(([categoryId, data]) => {
      // Solo categorías sin presupuesto
      if (budgetedCategories.has(categoryId)) return;

      const months = Object.keys(data.monthly).sort();
      if (months.length < 2) return;

      const first = data.monthly[months[0]];
      const last = data.monthly[months[months.length - 1]];
      const growth = last - first;
      const growthPercent = first > 0 ? ((growth / first) * 100) : 0;

      // Si creció más del 30% y el último mes es significativo (>$100)
      if (growthPercent > 30 && last > 100) {
        unbudgetedGrowth.push({
          type: 'unbudgeted_growth',
          categoryId: data.categoryId,
          categoryName: data.categoryName,
          growth: Math.round(growth * 100) / 100,
          growthPercent: Math.round(growthPercent * 100) / 100,
          firstMonth: months[0],
          lastMonth: months[months.length - 1],
          firstAmount: Math.round(first * 100) / 100,
          lastAmount: Math.round(last * 100) / 100,
          monthlyEstimate: Math.round(last * 100) / 100,
          annualEstimate: Math.round(last * 12 * 100) / 100,
          severity: last > 500 ? 'high' : last > 200 ? 'medium' : 'low'
        });
      }
    });

    return unbudgetedGrowth.sort((a, b) => b.growthPercent - a.growthPercent);
  }

  /**
   * Detecta gastos duplicados o posibles errores
   * @returns {Array}
   */
  detectDuplicates() {
    // Agrupar por descripción, monto y fecha (mismo día)
    const groups = {};

    this.transactions.forEach(tx => {
      if (tx.type === 'expense' && tx.description && tx.amount && tx.date) {
        const date = new Date(tx.date);
        const dateKey = date.toISOString().split('T')[0];
        const normalizedDesc = tx.description.toLowerCase().trim();
        const roundedAmount = Math.round(parseFloat(tx.amount) * 100) / 100;
        const key = `${normalizedDesc}_${roundedAmount}_${dateKey}`;

        if (!groups[key]) {
          groups[key] = [];
        }

        groups[key].push(tx);
      }
    });

    const duplicates = [];

    Object.entries(groups).forEach(([key, txs]) => {
      if (txs.length > 1) {
        // Mismo gasto en el mismo día = posible duplicado
        duplicates.push({
          type: 'duplicate',
          description: txs[0].description,
          amount: parseFloat(txs[0].amount),
          date: txs[0].date,
          count: txs.length,
          totalImpact: parseFloat(txs[0].amount) * txs.length,
          transactions: txs.map(t => ({
            id: t.id,
            date: t.date,
            amount: parseFloat(t.amount)
          })),
          severity: parseFloat(txs[0].amount) > 100 ? 'high' : 'medium'
        });
      }
    });

    return duplicates.sort((a, b) => b.totalImpact - a.totalImpact);
  }

  /**
   * Detecta gastos pequeños que individualmente no importan pero suman mucho
   * @returns {Array}
   */
  detectSmallExpenses() {
    // Gastos entre $1 y $5 que se repiten mucho
    const small = this.transactions.filter(tx => {
      const amount = parseFloat(tx.amount || 0);
      return tx.type === 'expense' && amount >= 1 && amount <= 5;
    });

    if (small.length < 20) return [];

    // Agrupar por descripción similar
    const groups = {};
    small.forEach(tx => {
      const normalizedDesc = tx.description?.toLowerCase().trim() || 'sin descripción';
      const key = normalizedDesc;

      if (!groups[key]) {
        groups[key] = {
          description: tx.description || 'Sin descripción',
          transactions: [],
          total: 0,
          count: 0,
          average: 0
        };
      }

      groups[key].transactions.push(tx);
      groups[key].total += parseFloat(tx.amount || 0);
      groups[key].count += 1;
    });

    const periodMonths = this.getPeriodMonths();
    const monthly = periodMonths > 0 ? periodMonths : 1;

    const smallExpenses = Object.values(groups)
      .filter(group => {
        const monthlyImpact = group.total / monthly;
        return monthlyImpact > 30 && group.count >= 5; // Al menos $30/mes y 5+ transacciones
      })
      .map(group => {
        const monthlyImpact = group.total / monthly;
        return {
          type: 'small_expenses',
          description: group.description,
          monthlyImpact: Math.round(monthlyImpact * 100) / 100,
          annualImpact: Math.round(monthlyImpact * 12 * 100) / 100,
          count: group.count,
          averageAmount: Math.round((group.total / group.count) * 100) / 100,
          totalSpent: Math.round(group.total * 100) / 100,
          severity: monthlyImpact > 50 ? 'high' : 'medium'
        };
      })
      .sort((a, b) => b.monthlyImpact - a.monthlyImpact);

    return smallExpenses;
  }

  /**
   * Calcula el impacto total de todas las fugas
   * @returns {Object}
   */
  calculateTotalImpact() {
    const leakages = this.analyzeAll();
    
    let totalMonthly = 0;
    let totalAnnual = 0;
    const byType = {
      subscriptions: 0,
      microExpenses: 0,
      unbudgetedGrowth: 0,
      smallExpenses: 0
    };

    // Sumar suscripciones
    leakages.subscriptions.forEach(sub => {
      totalMonthly += sub.monthlyImpact || 0;
      totalAnnual += sub.annualImpact || 0;
      byType.subscriptions += sub.annualImpact || 0;
    });

    // Sumar micro gastos
    leakages.microExpenses.forEach(micro => {
      totalMonthly += micro.monthlyImpact || 0;
      totalAnnual += micro.annualImpact || 0;
      byType.microExpenses += micro.annualImpact || 0;
    });

    // Sumar categorías sin presupuesto
    leakages.unbudgetedGrowth.forEach(growth => {
      totalMonthly += growth.monthlyEstimate || 0;
      totalAnnual += growth.annualEstimate || 0;
      byType.unbudgetedGrowth += growth.annualEstimate || 0;
    });

    // Sumar gastos pequeños
    leakages.smallExpenses.forEach(small => {
      totalMonthly += small.monthlyImpact || 0;
      totalAnnual += small.annualImpact || 0;
      byType.smallExpenses += small.annualImpact || 0;
    });

    return {
      monthly: Math.round(totalMonthly * 100) / 100,
      annual: Math.round(totalAnnual * 100) / 100,
      byType,
      severity: totalAnnual > 5000 ? 'critical' : 
                totalAnnual > 2000 ? 'high' : 
                totalAnnual > 1000 ? 'medium' : 'low',
      description: totalAnnual > 0
        ? `Fugas detectadas: $${totalAnnual.toLocaleString('es-CL')}/año ($${totalMonthly.toLocaleString('es-CL')}/mes)`
        : 'No se detectaron fugas significativas'
    };
  }

  /**
   * Genera resumen ejecutivo de fugas
   * @returns {string}
   */
  generateLeakageSummary() {
    const leakages = this.analyzeAll();
    const parts = [];

    if (leakages.subscriptions.length > 0) {
      parts.push(`${leakages.subscriptions.length} posible(s) suscripción(es) detectada(s)`);
    }

    if (leakages.microExpenses.length > 0) {
      parts.push(`${leakages.microExpenses.length} categoría(s) con micro gastos significativos`);
    }

    if (leakages.unbudgetedGrowth.length > 0) {
      parts.push(`${leakages.unbudgetedGrowth.length} categoría(s) sin presupuesto creciendo`);
    }

    if (leakages.duplicates.length > 0) {
      parts.push(`${leakages.duplicates.length} posible(s) gasto(s) duplicado(s)`);
    }

    if (leakages.smallExpenses.length > 0) {
      parts.push(`${leakages.smallExpenses.length} tipo(s) de gastos pequeños que suman mucho`);
    }

    const impact = leakages.totalImpact;

    if (parts.length > 0) {
      return `${parts.join('. ')}. ${impact.description}`;
    }

    return 'No se detectaron fugas financieras significativas en el período analizado';
  }

  /**
   * Calcula intervalo promedio entre fechas
   * @param {Array<Date>} dates
   * @returns {number}
   */
  calculateAverageInterval(dates) {
    if (dates.length < 2) return 0;

    const intervals = [];
    for (let i = 1; i < dates.length; i++) {
      const diff = dates[i] - dates[i - 1];
      const days = diff / (1000 * 60 * 60 * 24);
      intervals.push(days);
    }

    return intervals.reduce((a, b) => a + b, 0) / intervals.length;
  }

  /**
   * Obtiene el número de meses en el período analizado
   * @returns {number}
   */
  getPeriodMonths() {
    if (this.transactions.length === 0) return 0;

    const dates = this.transactions
      .map(tx => new Date(tx.date))
      .filter(date => !isNaN(date.getTime()))
      .sort((a, b) => a - b);

    if (dates.length === 0) return 0;

    const first = dates[0];
    const last = dates[dates.length - 1];
    const diff = last - first;
    const days = diff / (1000 * 60 * 60 * 24);
    const months = days / 30.44; // Promedio de días por mes

    return Math.max(1, Math.round(months * 10) / 10); // Redondear a 1 decimal, mínimo 1
  }
}

