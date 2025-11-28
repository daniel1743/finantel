// =====================================================
// RISK ANALYZER - DeepFinance Engine
// =====================================================
// Analiza riesgos financieros y estabilidad
// =====================================================

export class RiskAnalyzer {
  constructor(transactions, budgets = [], goals = []) {
    this.transactions = transactions || [];
    this.budgets = budgets || [];
    this.goals = goals || [];
  }

  /**
   * Analiza todos los riesgos financieros
   * @returns {Object}
   */
  analyzeAll() {
    return {
      // Nivel de riesgo general
      level: this.calculateRiskLevel(),
      
      // Factores de riesgo
      factors: this.identifyRiskFactors(),
      
      // Análisis de estabilidad
      stability: this.analyzeStability(),
      
      // Análisis de liquidez
      liquidity: this.analyzeLiquidity(),
      
      // Análisis de dependencia
      dependency: this.analyzeDependency(),
      
      // Resumen ejecutivo
      summary: this.generateRiskSummary()
    };
  }

  /**
   * Calcula nivel de riesgo general
   * @returns {string}
   */
  calculateRiskLevel() {
    const factors = this.identifyRiskFactors();
    const riskScore = this.calculateRiskScore(factors);

    if (riskScore >= 75) return 'critical';
    if (riskScore >= 50) return 'high';
    if (riskScore >= 25) return 'medium';
    return 'low';
  }

  /**
   * Calcula score de riesgo (0-100)
   * @param {Array} factors
   * @returns {number}
   */
  calculateRiskScore(factors) {
    let score = 0;

    factors.forEach(factor => {
      if (factor.severity === 'critical') score += 25;
      else if (factor.severity === 'high') score += 15;
      else if (factor.severity === 'medium') score += 10;
      else if (factor.severity === 'low') score += 5;
    });

    return Math.min(100, score);
  }

  /**
   * Identifica factores de riesgo
   * @returns {Array}
   */
  identifyRiskFactors() {
    const factors = [];

    // 1. Tasa de ahorro negativa
    const savingsRate = this.calculateSavingsRate();
    if (savingsRate < 0) {
      factors.push({
        type: 'negative_savings',
        severity: savingsRate < -20 ? 'critical' : 'high',
        description: `Tasa de ahorro negativa: ${savingsRate.toFixed(1)}%`,
        impact: 'Estás gastando más de lo que ganas',
        recommendation: 'Reducir gastos o aumentar ingresos inmediatamente'
      });
    } else if (savingsRate < 5) {
      factors.push({
        type: 'low_savings',
        severity: 'medium',
        description: `Tasa de ahorro muy baja: ${savingsRate.toFixed(1)}%`,
        impact: 'Poco margen para emergencias',
        recommendation: 'Aumentar tasa de ahorro al menos al 10%'
      });
    }

    // 2. Ratio de gastos vs ingresos
    const expenseRatio = this.calculateExpenseRatio();
    if (expenseRatio > 1) {
      factors.push({
        type: 'expense_exceeds_income',
        severity: 'critical',
        description: `Gastos exceden ingresos en ${((expenseRatio - 1) * 100).toFixed(1)}%`,
        impact: 'Déficit financiero',
        recommendation: 'Revisar gastos críticos y reducirlos'
      });
    } else if (expenseRatio > 0.9) {
      factors.push({
        type: 'high_expense_ratio',
        severity: 'high',
        description: `Gastas el ${(expenseRatio * 100).toFixed(1)}% de tus ingresos`,
        impact: 'Muy poco margen para ahorro',
        recommendation: 'Reducir gastos en al menos 10%'
      });
    }

    // 3. Presupuestos excedidos
    const exceededBudgets = this.getExceededBudgets();
    if (exceededBudgets.length > 0) {
      const totalExceeded = exceededBudgets.reduce((sum, b) => sum + b.exceeded, 0);
      factors.push({
        type: 'budgets_exceeded',
        severity: exceededBudgets.length > 3 ? 'high' : 'medium',
        description: `${exceededBudgets.length} presupuesto(s) excedido(s)`,
        impact: `Total excedido: $${totalExceeded.toLocaleString('es-CL')}`,
        recommendation: 'Revisar y ajustar presupuestos excedidos'
      });
    }

    // 4. Variabilidad alta en ingresos
    const incomeVariability = this.calculateIncomeVariability();
    if (incomeVariability > 0.3) {
      factors.push({
        type: 'income_instability',
        severity: incomeVariability > 0.5 ? 'high' : 'medium',
        description: `Alta variabilidad en ingresos: ${(incomeVariability * 100).toFixed(1)}%`,
        impact: 'Ingresos irregulares dificultan planificación',
        recommendation: 'Crear fondo de emergencia más grande'
      });
    }

    // 5. Gastos crecientes sin control
    const spendingTrend = this.analyzeSpendingTrend();
    if (spendingTrend === 'increasing' && spendingTrend.percent > 20) {
      factors.push({
        type: 'uncontrolled_spending_growth',
        severity: 'high',
        description: `Gastos aumentaron ${spendingTrend.percent.toFixed(1)}% en el período`,
        impact: 'Tendencia insostenible',
        recommendation: 'Identificar y controlar categorías que crecen'
      });
    }

    // 6. Sin presupuestos configurados
    if (this.budgets.length === 0) {
      factors.push({
        type: 'no_budgets',
        severity: 'medium',
        description: 'No hay presupuestos configurados',
        impact: 'Falta de control sobre gastos',
        recommendation: 'Crear presupuestos para categorías principales'
      });
    }

    // 7. Dependencia de una sola fuente de ingresos
    const incomeSources = this.countIncomeSources();
    if (incomeSources === 1) {
      factors.push({
        type: 'single_income_source',
        severity: 'medium',
        description: 'Solo una fuente de ingresos',
        impact: 'Vulnerabilidad ante pérdida de ingresos',
        recommendation: 'Considerar diversificar fuentes de ingresos'
      });
    }

    // 8. Gastos emocionales altos
    const emotionalPercentage = this.calculateEmotionalPercentage();
    if (emotionalPercentage > 30) {
      factors.push({
        type: 'high_emotional_spending',
        severity: emotionalPercentage > 40 ? 'high' : 'medium',
        description: `${emotionalPercentage.toFixed(1)}% de gastos emocionales`,
        impact: 'Gastos no planificados afectan estabilidad',
        recommendation: 'Identificar y reducir gastos emocionales'
      });
    }

    return factors.sort((a, b) => {
      const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      return severityOrder[b.severity] - severityOrder[a.severity];
    });
  }

  /**
   * Analiza estabilidad financiera
   * @returns {Object}
   */
  analyzeStability() {
    const incomeVariability = this.calculateIncomeVariability();
    const expenseVariability = this.calculateExpenseVariability();
    const savingsRate = this.calculateSavingsRate();

    const stabilityScore = Math.max(0, Math.min(100, 
      100 - (incomeVariability * 100) - (expenseVariability * 50) - (savingsRate < 0 ? 30 : 0)
    ));

    return {
      score: Math.round(stabilityScore),
      level: stabilityScore >= 75 ? 'high' : 
             stabilityScore >= 50 ? 'medium' : 
             stabilityScore >= 25 ? 'low' : 'critical',
      incomeVariability: Math.round(incomeVariability * 100) / 100,
      expenseVariability: Math.round(expenseVariability * 100) / 100,
      savingsRate: Math.round(savingsRate * 100) / 100,
      description: stabilityScore >= 75
        ? 'Estabilidad financiera sólida'
        : stabilityScore >= 50
        ? 'Estabilidad financiera moderada'
        : 'Estabilidad financiera baja'
    };
  }

  /**
   * Analiza liquidez
   * @returns {Object}
   */
  analyzeLiquidity() {
    const monthlyExpenses = this.calculateMonthlyExpenses();
    const monthlyIncome = this.calculateMonthlyIncome();
    const savingsRate = this.calculateSavingsRate();

    // Estimar meses de reserva (asumiendo ahorro actual = 0, solo basado en tasa)
    const monthsOfReserve = savingsRate > 0 
      ? Math.min(12, (savingsRate / 100) * 12) 
      : 0;

    return {
      monthlyExpenses: Math.round(monthlyExpenses * 100) / 100,
      monthlyIncome: Math.round(monthlyIncome * 100) / 100,
      monthlySavings: Math.round((monthlyIncome - monthlyExpenses) * 100) / 100,
      estimatedMonthsOfReserve: Math.round(monthsOfReserve * 10) / 10,
      level: monthsOfReserve >= 6 ? 'high' : 
             monthsOfReserve >= 3 ? 'medium' : 
             monthsOfReserve >= 1 ? 'low' : 'critical',
      description: monthsOfReserve >= 6
        ? 'Buena liquidez estimada'
        : monthsOfReserve >= 3
        ? 'Liquidez moderada'
        : 'Liquidez baja o crítica'
    };
  }

  /**
   * Analiza dependencia de ingresos
   * @returns {Object}
   */
  analyzeDependency() {
    const incomeSources = this.countIncomeSources();
    const topCategoryPercentage = this.getTopCategoryPercentage();

    return {
      incomeSources,
      topCategoryPercentage: Math.round(topCategoryPercentage * 100) / 100,
      dependency: incomeSources === 1 ? 'high' : 
                  topCategoryPercentage > 80 ? 'high' :
                  topCategoryPercentage > 60 ? 'medium' : 'low',
      description: incomeSources === 1
        ? 'Dependencia de una sola fuente de ingresos'
        : topCategoryPercentage > 80
        ? `Alta concentración en una categoría (${topCategoryPercentage.toFixed(1)}%)`
        : 'Diversificación adecuada'
    };
  }

  /**
   * Calcula tasa de ahorro
   * @returns {number}
   */
  calculateSavingsRate() {
    const totalIncome = this.transactions
      .filter(tx => tx.type === 'income')
      .reduce((sum, tx) => sum + parseFloat(tx.amount || 0), 0);

    const totalExpenses = this.transactions
      .filter(tx => tx.type === 'expense')
      .reduce((sum, tx) => sum + parseFloat(tx.amount || 0), 0);

    if (totalIncome === 0) return 0;

    return ((totalIncome - totalExpenses) / totalIncome) * 100;
  }

  /**
   * Calcula ratio de gastos vs ingresos
   * @returns {number}
   */
  calculateExpenseRatio() {
    const totalIncome = this.transactions
      .filter(tx => tx.type === 'income')
      .reduce((sum, tx) => sum + parseFloat(tx.amount || 0), 0);

    const totalExpenses = this.transactions
      .filter(tx => tx.type === 'expense')
      .reduce((sum, tx) => sum + parseFloat(tx.amount || 0), 0);

    if (totalIncome === 0) return totalExpenses > 0 ? Infinity : 0;

    return totalExpenses / totalIncome;
  }

  /**
   * Obtiene presupuestos excedidos
   * @returns {Array}
   */
  getExceededBudgets() {
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

    return exceeded;
  }

  /**
   * Calcula variabilidad de ingresos
   * @returns {number}
   */
  calculateIncomeVariability() {
    const monthlyIncome = {};

    this.transactions.forEach(tx => {
      if (tx.type === 'income' && tx.date) {
        const date = new Date(tx.date);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        
        if (!monthlyIncome[monthKey]) {
          monthlyIncome[monthKey] = 0;
        }

        monthlyIncome[monthKey] += parseFloat(tx.amount || 0);
      }
    });

    const amounts = Object.values(monthlyIncome);
    if (amounts.length < 2) return 0;

    const avg = amounts.reduce((a, b) => a + b, 0) / amounts.length;
    const variance = amounts.reduce((sum, amount) => sum + Math.pow(amount - avg, 2), 0) / amounts.length;
    const stdDev = Math.sqrt(variance);
    const coefficientOfVariation = avg > 0 ? (stdDev / avg) : 0;

    return coefficientOfVariation;
  }

  /**
   * Calcula variabilidad de gastos
   * @returns {number}
   */
  calculateExpenseVariability() {
    const monthlyExpenses = {};

    this.transactions.forEach(tx => {
      if (tx.type === 'expense' && tx.date) {
        const date = new Date(tx.date);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        
        if (!monthlyExpenses[monthKey]) {
          monthlyExpenses[monthKey] = 0;
        }

        monthlyExpenses[monthKey] += parseFloat(tx.amount || 0);
      }
    });

    const amounts = Object.values(monthlyExpenses);
    if (amounts.length < 2) return 0;

    const avg = amounts.reduce((a, b) => a + b, 0) / amounts.length;
    const variance = amounts.reduce((sum, amount) => sum + Math.pow(amount - avg, 2), 0) / amounts.length;
    const stdDev = Math.sqrt(variance);
    const coefficientOfVariation = avg > 0 ? (stdDev / avg) : 0;

    return coefficientOfVariation;
  }

  /**
   * Analiza tendencia de gastos
   * @returns {string|Object}
   */
  analyzeSpendingTrend() {
    const monthlyExpenses = {};

    this.transactions.forEach(tx => {
      if (tx.type === 'expense' && tx.date) {
        const date = new Date(tx.date);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        
        if (!monthlyExpenses[monthKey]) {
          monthlyExpenses[monthKey] = 0;
        }

        monthlyExpenses[monthKey] += parseFloat(tx.amount || 0);
      }
    });

    const months = Object.keys(monthlyExpenses).sort();
    if (months.length < 2) return 'stable';

    const first = monthlyExpenses[months[0]];
    const last = monthlyExpenses[months[months.length - 1]];
    const change = last - first;
    const changePercent = first > 0 ? ((change / first) * 100) : 0;

    return {
      trend: change > 0 ? 'increasing' : change < 0 ? 'decreasing' : 'stable',
      percent: Math.abs(changePercent),
      change: change
    };
  }

  /**
   * Cuenta fuentes de ingresos
   * @returns {number}
   */
  countIncomeSources() {
    const sources = new Set();

    this.transactions.forEach(tx => {
      if (tx.type === 'income' && tx.description) {
        const normalized = tx.description.toLowerCase().trim();
        sources.add(normalized);
      }
    });

    return sources.size || 1; // Mínimo 1
  }

  /**
   * Calcula porcentaje de gastos emocionales
   * @returns {number}
   */
  calculateEmotionalPercentage() {
    // Estimación básica: gastos en fines de semana + horarios nocturnos
    const weekend = this.transactions.filter(tx => {
      if (tx.type !== 'expense' || !tx.date) return false;
      const date = new Date(tx.date);
      return date.getDay() === 0 || date.getDay() === 6;
    });

    const lateNight = this.transactions.filter(tx => {
      if (tx.type !== 'expense' || !tx.date) return false;
      const date = new Date(tx.date);
      const hour = date.getHours();
      return hour >= 22 || hour < 2;
    });

    const emotionalSet = new Set();
    weekend.forEach(tx => emotionalSet.add(tx.id));
    lateNight.forEach(tx => emotionalSet.add(tx.id));

    const totalEmotional = Array.from(emotionalSet).reduce((sum, id) => {
      const tx = this.transactions.find(t => t.id === id);
      return sum + (tx ? parseFloat(tx.amount || 0) : 0);
    }, 0);

    const totalExpenses = this.transactions
      .filter(tx => tx.type === 'expense')
      .reduce((sum, tx) => sum + parseFloat(tx.amount || 0), 0);

    return totalExpenses > 0 ? (totalEmotional / totalExpenses) * 100 : 0;
  }

  /**
   * Calcula gastos mensuales promedio
   * @returns {number}
   */
  calculateMonthlyExpenses() {
    const monthlyExpenses = {};

    this.transactions.forEach(tx => {
      if (tx.type === 'expense' && tx.date) {
        const date = new Date(tx.date);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        
        if (!monthlyExpenses[monthKey]) {
          monthlyExpenses[monthKey] = 0;
        }

        monthlyExpenses[monthKey] += parseFloat(tx.amount || 0);
      }
    });

    const amounts = Object.values(monthlyExpenses);
    if (amounts.length === 0) return 0;

    return amounts.reduce((a, b) => a + b, 0) / amounts.length;
  }

  /**
   * Calcula ingresos mensuales promedio
   * @returns {number}
   */
  calculateMonthlyIncome() {
    const monthlyIncome = {};

    this.transactions.forEach(tx => {
      if (tx.type === 'income' && tx.date) {
        const date = new Date(tx.date);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        
        if (!monthlyIncome[monthKey]) {
          monthlyIncome[monthKey] = 0;
        }

        monthlyIncome[monthKey] += parseFloat(tx.amount || 0);
      }
    });

    const amounts = Object.values(monthlyIncome);
    if (amounts.length === 0) return 0;

    return amounts.reduce((a, b) => a + b, 0) / amounts.length;
  }

  /**
   * Obtiene porcentaje de la categoría dominante
   * @returns {number}
   */
  getTopCategoryPercentage() {
    const categoryTotals = {};

    this.transactions.forEach(tx => {
      if (tx.type === 'expense' && tx.category_id) {
        const catId = tx.category_id;
        if (!categoryTotals[catId]) categoryTotals[catId] = 0;
        categoryTotals[catId] += parseFloat(tx.amount || 0);
      }
    });

    const totals = Object.values(categoryTotals);
    if (totals.length === 0) return 0;

    const totalExpenses = totals.reduce((a, b) => a + b, 0);
    if (totalExpenses === 0) return 0;

    const max = Math.max(...totals);
    return (max / totalExpenses) * 100;
  }

  /**
   * Genera resumen ejecutivo de riesgos
   * @returns {string}
   */
  generateRiskSummary() {
    const level = this.calculateRiskLevel();
    const factors = this.identifyRiskFactors();
    const criticalCount = factors.filter(f => f.severity === 'critical').length;
    const highCount = factors.filter(f => f.severity === 'high').length;

    if (level === 'critical') {
      return `Riesgo crítico detectado. ${criticalCount} factor(es) crítico(s) y ${highCount} factor(es) de alto riesgo. Se requiere acción inmediata.`;
    }

    if (level === 'high') {
      return `Riesgo alto. ${criticalCount + highCount} factor(es) de riesgo identificado(s). Se recomienda revisar y corregir.`;
    }

    if (level === 'medium') {
      return `Riesgo moderado. ${factors.length} factor(es) de riesgo identificado(s). Monitorear y mejorar.`;
    }

    return `Riesgo bajo. Situación financiera estable. Continuar con buenas prácticas.`;
  }
}

