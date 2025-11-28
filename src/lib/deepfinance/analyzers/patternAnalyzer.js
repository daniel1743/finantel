// =====================================================
// PATTERN ANALYZER - DeepFinance Engine
// =====================================================
// Detecta patrones temporales, de comportamiento y tendencias
// =====================================================

export class PatternAnalyzer {
  constructor(transactions, budgets = [], categories = []) {
    this.transactions = transactions || [];
    this.budgets = budgets || [];
    this.categories = categories || [];
  }

  /**
   * Analiza todos los patrones disponibles
   * @returns {Object}
   */
  analyzeAll() {
    return {
      // Patrones temporales
      temporal: this.analyzeTemporalPatterns(),
      
      // Patrones por categoría
      category: this.analyzeCategoryPatterns(),
      
      // Patrones de comportamiento
      behavioral: this.analyzeBehavioralPatterns(),
      
      // Tendencias
      trends: this.analyzeTrends(),
      
      // Cumplimiento de presupuestos
      budgetCompliance: this.analyzeBudgetCompliance(),
      
      // Resumen ejecutivo
      summary: this.generatePatternSummary()
    };
  }

  /**
   * Analiza patrones temporales (día de semana, hora, mes)
   * @returns {Object}
   */
  analyzeTemporalPatterns() {
    if (this.transactions.length === 0) {
      return {
        dayOfWeek: null,
        hourOfDay: null,
        monthly: null,
        weekendVsWeekday: null
      };
    }

    const dayOfWeek = this.analyzeDayOfWeekPattern();
    const hourOfDay = this.analyzeHourOfDayPattern();
    const monthly = this.analyzeMonthlyPattern();
    const weekendVsWeekday = this.analyzeWeekendPattern();

    return {
      dayOfWeek,
      hourOfDay,
      monthly,
      weekendVsWeekday
    };
  }

  /**
   * Analiza qué día de la semana tiene más gastos
   * @returns {Object}
   */
  analyzeDayOfWeekPattern() {
    const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const dayTotals = {};
    const dayCounts = {};

    this.transactions.forEach(tx => {
      if (tx.type === 'expense' && tx.date) {
        const date = new Date(tx.date);
        const day = date.getDay();
        const amount = parseFloat(tx.amount || 0);

        if (!dayTotals[day]) {
          dayTotals[day] = 0;
          dayCounts[day] = 0;
        }

        dayTotals[day] += amount;
        dayCounts[day] += 1;
      }
    });

    // Encontrar día con más gastos
    let maxDay = null;
    let maxAmount = 0;

    Object.entries(dayTotals).forEach(([day, amount]) => {
      if (amount > maxAmount) {
        maxAmount = amount;
        maxDay = parseInt(day);
      }
    });

    if (maxDay === null) return null;

    const breakdown = dayNames.map((name, index) => ({
      day: name,
      dayIndex: index,
      total: dayTotals[index] || 0,
      count: dayCounts[index] || 0,
      average: dayCounts[index] > 0 ? (dayTotals[index] / dayCounts[index]) : 0
    }));

    return {
      dominantDay: dayNames[maxDay],
      dominantDayIndex: maxDay,
      dominantDayTotal: maxAmount,
      breakdown,
      description: `El día con más gastos es ${dayNames[maxDay]} con un total de $${maxAmount.toLocaleString('es-CL')}`
    };
  }

  /**
   * Analiza patrones por hora del día
   * @returns {Object}
   */
  analyzeHourOfDayPattern() {
    const hourTotals = {};
    const hourCounts = {};

    this.transactions.forEach(tx => {
      if (tx.type === 'expense' && tx.date) {
        const date = new Date(tx.date);
        const hour = date.getHours();
        const amount = parseFloat(tx.amount || 0);

        if (!hourTotals[hour]) {
          hourTotals[hour] = 0;
          hourCounts[hour] = 0;
        }

        hourTotals[hour] += amount;
        hourCounts[hour] += 1;
      }
    });

    // Encontrar hora con más gastos
    let maxHour = null;
    let maxAmount = 0;

    Object.entries(hourTotals).forEach(([hour, amount]) => {
      if (amount > maxAmount) {
        maxAmount = amount;
        maxHour = parseInt(hour);
      }
    });

    if (maxHour === null) return null;

    // Clasificar en períodos
    const periods = {
      morning: { start: 6, end: 12, total: 0, count: 0 },
      afternoon: { start: 12, end: 18, total: 0, count: 0 },
      evening: { start: 18, end: 22, total: 0, count: 0 },
      night: { start: 22, end: 6, total: 0, count: 0 }
    };

    Object.entries(hourTotals).forEach(([hour, amount]) => {
      const h = parseInt(hour);
      const count = hourCounts[hour];

      if (h >= 6 && h < 12) {
        periods.morning.total += amount;
        periods.morning.count += count;
      } else if (h >= 12 && h < 18) {
        periods.afternoon.total += amount;
        periods.afternoon.count += count;
      } else if (h >= 18 && h < 22) {
        periods.evening.total += amount;
        periods.evening.count += count;
      } else {
        periods.night.total += amount;
        periods.night.count += count;
      }
    });

    return {
      dominantHour: maxHour,
      dominantHourTotal: maxAmount,
      periods,
      description: `La hora con más gastos es las ${maxHour}:00 con un total de $${maxAmount.toLocaleString('es-CL')}`
    };
  }

  /**
   * Analiza patrones mensuales
   * @returns {Object}
   */
  analyzeMonthlyPattern() {
    const monthTotals = {};
    const monthCounts = {};

    this.transactions.forEach(tx => {
      if (tx.type === 'expense' && tx.date) {
        const date = new Date(tx.date);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        const amount = parseFloat(tx.amount || 0);

        if (!monthTotals[monthKey]) {
          monthTotals[monthKey] = 0;
          monthCounts[monthKey] = 0;
        }

        monthTotals[monthKey] += amount;
        monthCounts[monthKey] += 1;
      }
    });

    const months = Object.keys(monthTotals).sort();
    if (months.length === 0) return null;

    const monthlyData = months.map(month => ({
      month,
      total: monthTotals[month],
      count: monthCounts[month],
      average: monthCounts[month] > 0 ? (monthTotals[month] / monthCounts[month]) : 0
    }));

    // Calcular tendencia
    if (monthlyData.length >= 2) {
      const first = monthlyData[0].total;
      const last = monthlyData[monthlyData.length - 1].total;
      const change = last - first;
      const changePercent = first > 0 ? ((change / first) * 100) : 0;

      return {
        monthlyData,
        trend: change > 0 ? 'increasing' : change < 0 ? 'decreasing' : 'stable',
        trendAmount: change,
        trendPercent: Math.round(changePercent * 100) / 100,
        description: change > 0 
          ? `Los gastos han aumentado un ${Math.abs(changePercent).toFixed(1)}% en el período analizado`
          : change < 0
          ? `Los gastos han disminuido un ${Math.abs(changePercent).toFixed(1)}% en el período analizado`
          : 'Los gastos se han mantenido estables'
      };
    }

    return {
      monthlyData,
      trend: 'stable',
      description: 'No hay suficientes datos para determinar tendencia'
    };
  }

  /**
   * Compara gastos de fin de semana vs días laborables
   * @returns {Object}
   */
  analyzeWeekendPattern() {
    let weekendTotal = 0;
    let weekendCount = 0;
    let weekdayTotal = 0;
    let weekdayCount = 0;

    this.transactions.forEach(tx => {
      if (tx.type === 'expense' && tx.date) {
        const date = new Date(tx.date);
        const day = date.getDay();
        const amount = parseFloat(tx.amount || 0);

        // 0 = Domingo, 6 = Sábado
        if (day === 0 || day === 6) {
          weekendTotal += amount;
          weekendCount += 1;
        } else {
          weekdayTotal += amount;
          weekdayCount += 1;
        }
      }
    });

    if (weekendCount === 0 && weekdayCount === 0) return null;

    const weekendAvg = weekendCount > 0 ? (weekendTotal / weekendCount) : 0;
    const weekdayAvg = weekdayCount > 0 ? (weekdayTotal / weekdayCount) : 0;

    return {
      weekend: {
        total: weekendTotal,
        count: weekendCount,
        average: weekendAvg
      },
      weekday: {
        total: weekdayTotal,
        count: weekdayCount,
        average: weekdayAvg
      },
      difference: weekendTotal - weekdayTotal,
      differencePercent: weekdayTotal > 0 
        ? ((weekendTotal - weekdayTotal) / weekdayTotal) * 100 
        : 0,
      description: weekendTotal > weekdayTotal
        ? `Gastas más en fin de semana (${((weekendTotal / (weekendTotal + weekdayTotal)) * 100).toFixed(1)}% del total)`
        : `Gastas más en días laborables (${((weekdayTotal / (weekendTotal + weekdayTotal)) * 100).toFixed(1)}% del total)`
    };
  }

  /**
   * Analiza patrones por categoría
   * @returns {Object}
   */
  analyzeCategoryPatterns() {
    if (this.transactions.length === 0) return null;

    const categoryTotals = {};
    const categoryCounts = {};

    this.transactions.forEach(tx => {
      if (tx.type === 'expense') {
        const categoryId = tx.category_id;
        const categoryName = tx.categories?.name || 'Sin categoría';
        const amount = parseFloat(tx.amount || 0);

        if (!categoryTotals[categoryId]) {
          categoryTotals[categoryId] = {
            id: categoryId,
            name: categoryName,
            total: 0,
            count: 0
          };
        }

        categoryTotals[categoryId].total += amount;
        categoryTotals[categoryId].count += 1;
      }
    });

    const categories = Object.values(categoryTotals)
      .sort((a, b) => b.total - a.total);

    if (categories.length === 0) return null;

    const totalExpenses = categories.reduce((sum, cat) => sum + cat.total, 0);
    const topCategory = categories[0];

    // Categorías que crecen
    const growingCategories = this.detectGrowingCategories(categories);

    return {
      topCategory: {
        id: topCategory.id,
        name: topCategory.name,
        total: topCategory.total,
        count: topCategory.count,
        percentage: totalExpenses > 0 ? (topCategory.total / totalExpenses) * 100 : 0
      },
      allCategories: categories.map(cat => ({
        ...cat,
        percentage: totalExpenses > 0 ? (cat.total / totalExpenses) * 100 : 0,
        average: cat.count > 0 ? (cat.total / cat.count) : 0
      })),
      growingCategories,
      description: `La categoría dominante es "${topCategory.name}" con $${topCategory.total.toLocaleString('es-CL')} (${((topCategory.total / totalExpenses) * 100).toFixed(1)}% del total)`
    };
  }

  /**
   * Detecta categorías que están creciendo
   * @param {Array} categories
   * @returns {Array}
   */
  detectGrowingCategories(categories) {
    // Agrupar transacciones por categoría y mes
    const categoryMonthly = {};

    this.transactions.forEach(tx => {
      if (tx.type === 'expense' && tx.category_id && tx.date) {
        const date = new Date(tx.date);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        const categoryId = tx.category_id;

        if (!categoryMonthly[categoryId]) {
          categoryMonthly[categoryId] = {};
        }

        if (!categoryMonthly[categoryId][monthKey]) {
          categoryMonthly[categoryId][monthKey] = 0;
        }

        categoryMonthly[categoryId][monthKey] += parseFloat(tx.amount || 0);
      }
    });

    const growing = [];

    Object.entries(categoryMonthly).forEach(([categoryId, monthlyData]) => {
      const months = Object.keys(monthlyData).sort();
      if (months.length < 2) return;

      const first = monthlyData[months[0]];
      const last = monthlyData[months[months.length - 1]];
      const growth = last - first;
      const growthPercent = first > 0 ? ((growth / first) * 100) : 0;

      if (growthPercent > 20) { // Creció más del 20%
        const category = categories.find(c => c.id === categoryId);
        if (category) {
          growing.push({
            categoryId,
            categoryName: category.name,
            growth,
            growthPercent: Math.round(growthPercent * 100) / 100,
            firstMonth: months[0],
            lastMonth: months[months.length - 1],
            firstAmount: first,
            lastAmount: last
          });
        }
      }
    });

    return growing.sort((a, b) => b.growthPercent - a.growthPercent);
  }

  /**
   * Analiza patrones de comportamiento
   * @returns {Object}
   */
  analyzeBehavioralPatterns() {
    if (this.transactions.length === 0) return null;

    const repetitive = this.detectRepetitiveSpending();
    const irregular = this.detectIrregularSpending();
    const consistency = this.analyzeConsistency();

    return {
      repetitive,
      irregular,
      consistency,
      description: this.generateBehavioralDescription(repetitive, irregular, consistency)
    };
  }

  /**
   * Detecta gastos repetitivos (posibles suscripciones)
   * @returns {Array}
   */
  detectRepetitiveSpending() {
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

    const repetitive = [];

    Object.entries(groups).forEach(([key, txs]) => {
      if (txs.length >= 2) {
        const dates = txs.map(t => new Date(t.date)).sort();
        const intervals = [];

        for (let i = 1; i < dates.length; i++) {
          const diff = dates[i] - dates[i - 1];
          const days = diff / (1000 * 60 * 60 * 24);
          intervals.push(days);
        }

        const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;

        // Si el intervalo promedio es ~30 días, podría ser suscripción mensual
        if (avgInterval >= 25 && avgInterval <= 35) {
          repetitive.push({
            description: txs[0].description,
            amount: parseFloat(txs[0].amount),
            frequency: 'monthly',
            occurrences: txs.length,
            averageInterval: Math.round(avgInterval),
            totalSpent: txs.reduce((sum, t) => sum + parseFloat(t.amount || 0), 0),
            annualEstimate: parseFloat(txs[0].amount) * 12
          });
        }
      }
    });

    return repetitive.sort((a, b) => b.annualEstimate - a.annualEstimate);
  }

  /**
   * Detecta gastos irregulares (fuera de lo normal)
   * @returns {Array}
   */
  detectIrregularSpending() {
    if (this.transactions.length < 10) return [];

    // Calcular promedio y desviación estándar
    const expenses = this.transactions
      .filter(tx => tx.type === 'expense')
      .map(tx => parseFloat(tx.amount || 0))
      .filter(amount => amount > 0);

    if (expenses.length === 0) return [];

    const avg = expenses.reduce((a, b) => a + b, 0) / expenses.length;
    const variance = expenses.reduce((sum, amount) => sum + Math.pow(amount - avg, 2), 0) / expenses.length;
    const stdDev = Math.sqrt(variance);

    // Gastos que están a más de 2 desviaciones estándar del promedio
    const threshold = avg + (2 * stdDev);

    const irregular = this.transactions
      .filter(tx => tx.type === 'expense' && parseFloat(tx.amount || 0) > threshold)
      .map(tx => ({
        id: tx.id,
        description: tx.description,
        amount: parseFloat(tx.amount),
        date: tx.date,
        category: tx.categories?.name || 'Sin categoría',
        deviation: parseFloat(tx.amount) - avg,
        deviationPercent: ((parseFloat(tx.amount) - avg) / avg) * 100
      }))
      .sort((a, b) => b.amount - a.amount);

    return irregular.slice(0, 10); // Top 10
  }

  /**
   * Analiza consistencia en los gastos
   * @returns {Object}
   */
  analyzeConsistency() {
    if (this.transactions.length < 10) {
      return {
        score: 50,
        level: 'insufficient_data',
        description: 'No hay suficientes datos para analizar consistencia'
      };
    }

    // Calcular variabilidad mensual
    const monthlyTotals = {};

    this.transactions.forEach(tx => {
      if (tx.type === 'expense' && tx.date) {
        const date = new Date(tx.date);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        const amount = parseFloat(tx.amount || 0);

        if (!monthlyTotals[monthKey]) {
          monthlyTotals[monthKey] = 0;
        }

        monthlyTotals[monthKey] += amount;
      }
    });

    const totals = Object.values(monthlyTotals);
    if (totals.length < 2) {
      return {
        score: 50,
        level: 'insufficient_data',
        description: 'No hay suficientes meses para analizar consistencia'
      };
    }

    const avg = totals.reduce((a, b) => a + b, 0) / totals.length;
    const variance = totals.reduce((sum, total) => sum + Math.pow(total - avg, 2), 0) / totals.length;
    const stdDev = Math.sqrt(variance);
    const coefficientOfVariation = avg > 0 ? (stdDev / avg) : 0;

    // Score: 0-100 (menor variación = mayor score)
    const score = Math.max(0, Math.min(100, 100 - (coefficientOfVariation * 100)));

    let level = 'high';
    if (score < 50) level = 'low';
    else if (score < 75) level = 'medium';

    return {
      score: Math.round(score),
      level,
      coefficientOfVariation: Math.round(coefficientOfVariation * 100) / 100,
      monthlyTotals,
      description: level === 'high'
        ? 'Tus gastos son muy consistentes mes a mes'
        : level === 'medium'
        ? 'Tus gastos tienen variabilidad moderada'
        : 'Tus gastos varían significativamente entre meses'
    };
  }

  /**
   * Analiza tendencias generales
   * @returns {Object}
   */
  analyzeTrends() {
    const monthly = this.analyzeMonthlyPattern();
    
    if (!monthly || !monthly.monthlyData || monthly.monthlyData.length < 2) {
      return {
        overall: 'stable',
        description: 'No hay suficientes datos para determinar tendencia'
      };
    }

    return {
      overall: monthly.trend,
      direction: monthly.trend === 'increasing' ? 'up' : monthly.trend === 'decreasing' ? 'down' : 'stable',
      changePercent: monthly.trendPercent,
      monthlyData: monthly.monthlyData,
      description: monthly.description
    };
  }

  /**
   * Analiza cumplimiento de presupuestos
   * @returns {Object}
   */
  analyzeBudgetCompliance() {
    if (this.budgets.length === 0) {
      return {
        hasBudgets: false,
        description: 'No hay presupuestos configurados'
      };
    }

    const compliance = [];

    this.budgets.forEach(budget => {
      const categoryTransactions = this.transactions.filter(
        tx => tx.type === 'expense' && tx.category_id === budget.category_id
      );

      const spent = categoryTransactions.reduce(
        (sum, tx) => sum + parseFloat(tx.amount || 0), 0
      );

      const budgetAmount = parseFloat(budget.amount || 0);
      const percentage = budgetAmount > 0 ? (spent / budgetAmount) * 100 : 0;

      compliance.push({
        budgetId: budget.id,
        categoryId: budget.category_id,
        categoryName: budget.categories?.name || 'Sin categoría',
        budgetAmount,
        spent,
        remaining: budgetAmount - spent,
        percentage: Math.round(percentage * 100) / 100,
        status: percentage > 100 ? 'exceeded' : percentage > 80 ? 'warning' : 'ok'
      });
    });

    const exceeded = compliance.filter(c => c.status === 'exceeded');
    const warnings = compliance.filter(c => c.status === 'warning');
    const ok = compliance.filter(c => c.status === 'ok');

    const overallScore = compliance.length > 0
      ? compliance.reduce((sum, c) => {
          if (c.status === 'ok') return sum + 100;
          if (c.status === 'warning') return sum + 50;
          return sum + 0;
        }, 0) / compliance.length
      : 0;

    return {
      hasBudgets: true,
      totalBudgets: compliance.length,
      exceeded: exceeded.length,
      warnings: warnings.length,
      ok: ok.length,
      overallScore: Math.round(overallScore),
      compliance,
      description: exceeded.length > 0
        ? `${exceeded.length} presupuesto(s) excedido(s)`
        : warnings.length > 0
        ? `${warnings.length} presupuesto(s) cerca del límite`
        : 'Todos los presupuestos están bajo control'
    };
  }

  /**
   * Genera resumen ejecutivo de patrones
   * @returns {string}
   */
  generatePatternSummary() {
    const patterns = this.analyzeAll();
    const summaries = [];

    if (patterns.temporal?.dayOfWeek) {
      summaries.push(patterns.temporal.dayOfWeek.description);
    }

    if (patterns.category) {
      summaries.push(patterns.category.description);
    }

    if (patterns.trends?.overall !== 'stable') {
      summaries.push(patterns.trends.description);
    }

    if (patterns.budgetCompliance?.hasBudgets) {
      summaries.push(patterns.budgetCompliance.description);
    }

    return summaries.length > 0
      ? summaries.join('. ')
      : 'No se detectaron patrones significativos en el período analizado';
  }

  /**
   * Genera descripción de patrones de comportamiento
   * @param {Array} repetitive
   * @param {Array} irregular
   * @param {Object} consistency
   * @returns {string}
   */
  generateBehavioralDescription(repetitive, irregular, consistency) {
    const parts = [];

    if (repetitive && repetitive.length > 0) {
      parts.push(`${repetitive.length} posible(s) suscripción(es) detectada(s)`);
    }

    if (irregular && irregular.length > 0) {
      parts.push(`${irregular.length} gasto(s) inusual(es) detectado(s)`);
    }

    if (consistency && consistency.level) {
      parts.push(`Consistencia: ${consistency.level}`);
    }

    return parts.length > 0
      ? parts.join('. ')
      : 'No se detectaron patrones de comportamiento significativos';
  }
}

