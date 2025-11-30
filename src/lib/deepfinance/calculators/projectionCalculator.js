// =====================================================
// CALCULADORA: ProjectionCalculator
// =====================================================
// Calcula proyecciones futuras basadas en tendencias
// =====================================================

export class ProjectionCalculator {
  /**
   * Calcula proyecciones futuras basadas en tendencias históricas
   * @param {Object} analysis - Resultado del análisis completo
   * @param {Object} options - Opciones de proyección
   * @returns {Object} Objeto con proyecciones a diferentes plazos
   */
  calculateProjections(analysis, options = {}) {
    const {
      monthsAhead = 12, // Proyectar 12 meses por defecto
      includeOptimistic = true,
      includePessimistic = true,
      includeRealistic = true,
    } = options;

    if (!analysis) {
      return this.getEmptyProjections();
    }

    // Obtener tendencias históricas
    const trends = this.analyzeHistoricalTrends(analysis);
    
    // Calcular proyecciones base
    const projections = {
      income: this.projectIncome(analysis, trends, monthsAhead),
      expenses: this.projectExpenses(analysis, trends, monthsAhead),
      savings: this.projectSavings(analysis, trends, monthsAhead),
      scenarios: {
        realistic: null,
        optimistic: null,
        pessimistic: null,
      },
      milestones: [],
      riskFactors: [],
    };

    // Generar escenarios
    if (includeRealistic) {
      projections.scenarios.realistic = this.generateRealisticScenario(
        analysis,
        trends,
        monthsAhead
      );
    }

    if (includeOptimistic) {
      projections.scenarios.optimistic = this.generateOptimisticScenario(
        analysis,
        trends,
        monthsAhead
      );
    }

    if (includePessimistic) {
      projections.scenarios.pessimistic = this.generatePessimisticScenario(
        analysis,
        trends,
        monthsAhead
      );
    }

    // Identificar hitos importantes
    projections.milestones = this.identifyMilestones(projections, analysis);

    // Identificar factores de riesgo
    projections.riskFactors = this.identifyRiskFactors(projections, trends);

    return projections;
  }

  /**
   * Analiza tendencias históricas de los datos
   * @param {Object} analysis
   * @returns {Object}
   */
  analyzeHistoricalTrends(analysis) {
    const monthlyBreakdown = analysis.monthlyBreakdown || {};
    const months = Object.entries(monthlyBreakdown)
      .map(([month, data]) => ({
        month,
        income: parseFloat(data.income || data.totalIncome || 0),
        expenses: parseFloat(data.expenses || data.totalExpenses || 0),
        savings: parseFloat(data.savings || data.netSavings || 0),
      }))
      .filter(m => m.income > 0 || m.expenses > 0)
      .sort((a, b) => new Date(a.month) - new Date(b.month));

    if (months.length < 2) {
      return {
        incomeTrend: 'stable',
        expenseTrend: 'stable',
        savingsTrend: 'stable',
        incomeGrowthRate: 0,
        expenseGrowthRate: 0,
        savingsGrowthRate: 0,
        volatility: 'low',
        monthsAnalyzed: months.length,
      };
    }

    // Calcular tendencias de ingresos
    const incomeTrend = this.calculateTrend(months.map(m => m.income));
    const incomeGrowthRate = this.calculateGrowthRate(months.map(m => m.income));

    // Calcular tendencias de gastos
    const expenseTrend = this.calculateTrend(months.map(m => m.expenses));
    const expenseGrowthRate = this.calculateGrowthRate(months.map(m => m.expenses));

    // Calcular tendencias de ahorro
    const savingsTrend = this.calculateTrend(months.map(m => m.savings));
    const savingsGrowthRate = this.calculateGrowthRate(months.map(m => m.savings));

    // Calcular volatilidad
    const volatility = this.calculateVolatility(months);

    return {
      incomeTrend,
      expenseTrend,
      savingsTrend,
      incomeGrowthRate: Math.round(incomeGrowthRate * 100) / 100,
      expenseGrowthRate: Math.round(expenseGrowthRate * 100) / 100,
      savingsGrowthRate: Math.round(savingsGrowthRate * 100) / 100,
      volatility,
      monthsAnalyzed: months.length,
      lastMonth: months[months.length - 1],
      averageIncome: months.reduce((sum, m) => sum + m.income, 0) / months.length,
      averageExpenses: months.reduce((sum, m) => sum + m.expenses, 0) / months.length,
      averageSavings: months.reduce((sum, m) => sum + m.savings, 0) / months.length,
    };
  }

  /**
   * Calcula la tendencia general (increasing, decreasing, stable)
   * @param {Array<number>} values
   * @returns {string}
   */
  calculateTrend(values) {
    if (values.length < 2) return 'stable';

    const firstHalf = values.slice(0, Math.floor(values.length / 2));
    const secondHalf = values.slice(Math.floor(values.length / 2));

    const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;

    const change = ((secondAvg - firstAvg) / firstAvg) * 100;

    if (change > 5) return 'increasing';
    if (change < -5) return 'decreasing';
    return 'stable';
  }

  /**
   * Calcula la tasa de crecimiento mensual promedio
   * @param {Array<number>} values
   * @returns {number}
   */
  calculateGrowthRate(values) {
    if (values.length < 2) return 0;

    const growthRates = [];
    for (let i = 1; i < values.length; i++) {
      if (values[i - 1] > 0) {
        const rate = ((values[i] - values[i - 1]) / values[i - 1]) * 100;
        growthRates.push(rate);
      }
    }

    if (growthRates.length === 0) return 0;
    return growthRates.reduce((a, b) => a + b, 0) / growthRates.length;
  }

  /**
   * Calcula la volatilidad de los datos
   * @param {Array<Object>} months
   * @returns {string}
   */
  calculateVolatility(months) {
    if (months.length < 2) return 'low';

    const incomes = months.map(m => m.income);
    const expenses = months.map(m => m.expenses);

    const incomeStdDev = this.calculateStandardDeviation(incomes);
    const expenseStdDev = this.calculateStandardDeviation(expenses);

    const avgIncome = incomes.reduce((a, b) => a + b, 0) / incomes.length;
    const avgExpense = expenses.reduce((a, b) => a + b, 0) / expenses.length;

    const incomeCV = avgIncome > 0 ? (incomeStdDev / avgIncome) * 100 : 0;
    const expenseCV = avgExpense > 0 ? (expenseStdDev / avgExpense) * 100 : 0;

    const avgCV = (incomeCV + expenseCV) / 2;

    if (avgCV > 30) return 'high';
    if (avgCV > 15) return 'medium';
    return 'low';
  }

  /**
   * Calcula la desviación estándar
   * @param {Array<number>} values
   * @returns {number}
   */
  calculateStandardDeviation(values) {
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    const squareDiffs = values.map(value => Math.pow(value - avg, 2));
    const avgSquareDiff = squareDiffs.reduce((a, b) => a + b, 0) / squareDiffs.length;
    return Math.sqrt(avgSquareDiff);
  }

  /**
   * Proyecta ingresos futuros
   * @param {Object} analysis
   * @param {Object} trends
   * @param {number} monthsAhead
   * @returns {Object}
   */
  projectIncome(analysis, trends, monthsAhead) {
    const currentIncome = analysis.totalIncome || 0;
    const monthlyIncome = currentIncome / (analysis.period?.days || 90) * 30;
    
    const monthlyGrowth = trends.incomeGrowthRate / 100;
    const projections = [];

    for (let month = 1; month <= monthsAhead; month++) {
      const projected = monthlyIncome * Math.pow(1 + monthlyGrowth, month);
      projections.push({
        month,
        amount: Math.round(projected * 100) / 100,
        cumulative: Math.round(monthlyIncome * month * Math.pow(1 + monthlyGrowth, month / 2) * 100) / 100,
      });
    }

    return {
      current: Math.round(monthlyIncome * 100) / 100,
      monthlyGrowth,
      trend: trends.incomeTrend,
      projections,
      annualProjection: Math.round(monthlyIncome * 12 * (1 + monthlyGrowth) * 100) / 100,
    };
  }

  /**
   * Proyecta gastos futuros
   * @param {Object} analysis
   * @param {Object} trends
   * @param {number} monthsAhead
   * @returns {Object}
   */
  projectExpenses(analysis, trends, monthsAhead) {
    const currentExpenses = analysis.totalExpenses || 0;
    const monthlyExpenses = currentExpenses / (analysis.period?.days || 90) * 30;
    
    const monthlyGrowth = trends.expenseGrowthRate / 100;
    const projections = [];

    for (let month = 1; month <= monthsAhead; month++) {
      const projected = monthlyExpenses * Math.pow(1 + monthlyGrowth, month);
      projections.push({
        month,
        amount: Math.round(projected * 100) / 100,
        cumulative: Math.round(monthlyExpenses * month * Math.pow(1 + monthlyGrowth, month / 2) * 100) / 100,
      });
    }

    return {
      current: Math.round(monthlyExpenses * 100) / 100,
      monthlyGrowth,
      trend: trends.expenseTrend,
      projections,
      annualProjection: Math.round(monthlyExpenses * 12 * (1 + monthlyGrowth) * 100) / 100,
    };
  }

  /**
   * Proyecta ahorros futuros
   * @param {Object} analysis
   * @param {Object} trends
   * @param {number} monthsAhead
   * @returns {Object}
   */
  projectSavings(analysis, trends, monthsAhead) {
    const incomeProjections = this.projectIncome(analysis, trends, monthsAhead);
    const expenseProjections = this.projectExpenses(analysis, trends, monthsAhead);
    
    const projections = [];
    let cumulativeSavings = analysis.netSavings || 0;

    for (let month = 1; month <= monthsAhead; month++) {
      const monthlyIncome = incomeProjections.projections[month - 1]?.amount || 0;
      const monthlyExpenses = expenseProjections.projections[month - 1]?.amount || 0;
      const monthlySavings = monthlyIncome - monthlyExpenses;
      
      cumulativeSavings += monthlySavings;

      projections.push({
        month,
        amount: Math.round(monthlySavings * 100) / 100,
        cumulative: Math.round(cumulativeSavings * 100) / 100,
      });
    }

    return {
      current: analysis.netSavings || 0,
      monthlyAverage: Math.round(
        projections.reduce((sum, p) => sum + p.amount, 0) / projections.length * 100
      ) / 100,
      trend: trends.savingsTrend,
      projections,
      projectedTotal: Math.round(cumulativeSavings * 100) / 100,
    };
  }

  /**
   * Genera escenario realista
   * @param {Object} analysis
   * @param {Object} trends
   * @param {number} monthsAhead
   * @returns {Object}
   */
  generateRealisticScenario(analysis, trends, monthsAhead) {
    const incomeProj = this.projectIncome(analysis, trends, monthsAhead);
    const expenseProj = this.projectExpenses(analysis, trends, monthsAhead);
    const savingsProj = this.projectSavings(analysis, trends, monthsAhead);

    return {
      name: 'Realista',
      description: 'Basado en tendencias históricas actuales',
      assumptions: [
        `Los ingresos crecen ${Math.abs(trends.incomeGrowthRate).toFixed(1)}% mensual`,
        `Los gastos crecen ${Math.abs(trends.expenseGrowthRate).toFixed(1)}% mensual`,
        'Se mantienen los patrones de gasto actuales',
      ],
      income: incomeProj,
      expenses: expenseProj,
      savings: savingsProj,
      finalSavings: savingsProj.projectedTotal,
      monthlyAverage: savingsProj.monthlyAverage,
    };
  }

  /**
   * Genera escenario optimista
   * @param {Object} analysis
   * @param {Object} trends
   * @param {number} monthsAhead
   * @returns {Object}
   */
  generateOptimisticScenario(analysis, trends, monthsAhead) {
    const optimisticTrends = {
      ...trends,
      incomeGrowthRate: Math.max(trends.incomeGrowthRate, 0) + 2, // +2% adicional
      expenseGrowthRate: Math.min(trends.expenseGrowthRate, 0) - 1, // -1% (reducir gastos)
    };

    const incomeProj = this.projectIncome(analysis, optimisticTrends, monthsAhead);
    const expenseProj = this.projectExpenses(analysis, optimisticTrends, monthsAhead);
    
    const projections = [];
    let cumulativeSavings = analysis.netSavings || 0;

    for (let month = 1; month <= monthsAhead; month++) {
      const monthlyIncome = incomeProj.projections[month - 1]?.amount || 0;
      const monthlyExpenses = expenseProj.projections[month - 1]?.amount || 0;
      const monthlySavings = monthlyIncome - monthlyExpenses;
      cumulativeSavings += monthlySavings;

      projections.push({
        month,
        amount: Math.round(monthlySavings * 100) / 100,
        cumulative: Math.round(cumulativeSavings * 100) / 100,
      });
    }

    return {
      name: 'Optimista',
      description: 'Supone mejoras en ingresos y reducción de gastos',
      assumptions: [
        'Aumento de ingresos del 2% adicional por mes',
        'Reducción de gastos del 1% mensual',
        'Implementación de recomendaciones de ahorro',
        'Mejora en disciplina financiera',
      ],
      income: incomeProj,
      expenses: expenseProj,
      savings: {
        current: analysis.netSavings || 0,
        monthlyAverage: Math.round(projections.reduce((sum, p) => sum + p.amount, 0) / projections.length * 100) / 100,
        trend: 'increasing',
        projections,
        projectedTotal: Math.round(cumulativeSavings * 100) / 100,
      },
      finalSavings: Math.round(cumulativeSavings * 100) / 100,
      monthlyAverage: Math.round(projections.reduce((sum, p) => sum + p.amount, 0) / projections.length * 100) / 100,
    };
  }

  /**
   * Genera escenario pesimista
   * @param {Object} analysis
   * @param {Object} trends
   * @param {number} monthsAhead
   * @returns {Object}
   */
  generatePessimisticScenario(analysis, trends, monthsAhead) {
    const pessimisticTrends = {
      ...trends,
      incomeGrowthRate: Math.min(trends.incomeGrowthRate, 0) - 1, // -1% adicional
      expenseGrowthRate: Math.max(trends.expenseGrowthRate, 0) + 1.5, // +1.5% adicional
    };

    const incomeProj = this.projectIncome(analysis, pessimisticTrends, monthsAhead);
    const expenseProj = this.projectExpenses(analysis, pessimisticTrends, monthsAhead);
    
    const projections = [];
    let cumulativeSavings = analysis.netSavings || 0;

    for (let month = 1; month <= monthsAhead; month++) {
      const monthlyIncome = incomeProj.projections[month - 1]?.amount || 0;
      const monthlyExpenses = expenseProj.projections[month - 1]?.amount || 0;
      const monthlySavings = monthlyIncome - monthlyExpenses;
      cumulativeSavings += monthlySavings;

      projections.push({
        month,
        amount: Math.round(monthlySavings * 100) / 100,
        cumulative: Math.round(cumulativeSavings * 100) / 100,
      });
    }

    return {
      name: 'Pesimista',
      description: 'Supone reducción de ingresos y aumento de gastos',
      assumptions: [
        'Reducción de ingresos del 1% adicional por mes',
        'Aumento de gastos del 1.5% mensual',
        'Posibles gastos inesperados',
        'Mantener patrones actuales sin mejoras',
      ],
      income: incomeProj,
      expenses: expenseProj,
      savings: {
        current: analysis.netSavings || 0,
        monthlyAverage: Math.round(projections.reduce((sum, p) => sum + p.amount, 0) / projections.length * 100) / 100,
        trend: 'decreasing',
        projections,
        projectedTotal: Math.round(cumulativeSavings * 100) / 100,
      },
      finalSavings: Math.round(cumulativeSavings * 100) / 100,
      monthlyAverage: Math.round(projections.reduce((sum, p) => sum + p.amount, 0) / projections.length * 100) / 100,
    };
  }

  /**
   * Identifica hitos importantes en las proyecciones
   * @param {Object} projections
   * @param {Object} analysis
   * @returns {Array}
   */
  identifyMilestones(projections, analysis) {
    const milestones = [];
    const savingsProj = projections.savings;

    if (!savingsProj || !savingsProj.projections) return milestones;

    // Hito: Primer mes con ahorro positivo
    const firstPositiveMonth = savingsProj.projections.find(p => p.cumulative > 0);
    if (firstPositiveMonth && (analysis.netSavings || 0) < 0) {
      milestones.push({
        type: 'positive_savings',
        month: firstPositiveMonth.month,
        description: 'Proyección de ahorros positivos',
        amount: firstPositiveMonth.cumulative,
      });
    }

    // Hito: Ahorro acumulado significativo (10x el ingreso mensual)
    const monthlyIncome = analysis.totalIncome / (analysis.period?.days || 90) * 30;
    const targetSavings = monthlyIncome * 10;
    const targetMonth = savingsProj.projections.find(p => p.cumulative >= targetSavings);
    if (targetMonth) {
      milestones.push({
        type: 'emergency_fund',
        month: targetMonth.month,
        description: 'Fondo de emergencia (10 meses de ingresos)',
        amount: targetMonth.cumulative,
      });
    }

    // Hito: Duplicar ahorro actual
    const currentSavings = analysis.netSavings || 0;
    if (currentSavings > 0) {
      const doubleMonth = savingsProj.projections.find(p => p.cumulative >= currentSavings * 2);
      if (doubleMonth) {
        milestones.push({
          type: 'double_savings',
          month: doubleMonth.month,
          description: 'Duplicar ahorros actuales',
          amount: doubleMonth.cumulative,
        });
      }
    }

    return milestones;
  }

  /**
   * Identifica factores de riesgo en las proyecciones
   * @param {Object} projections
   * @param {Object} trends
   * @returns {Array}
   */
  identifyRiskFactors(projections, trends) {
    const risks = [];

    // Riesgo de gastos crecientes
    if (trends.expenseGrowthRate > 2) {
      risks.push({
        type: 'expense_growth',
        severity: 'high',
        description: 'Los gastos están creciendo más rápido que los ingresos',
        impact: 'Puede llevar a ahorros negativos',
      });
    }

    // Riesgo de alta volatilidad
    if (trends.volatility === 'high') {
      risks.push({
        type: 'volatility',
        severity: 'medium',
        description: 'Alta variabilidad en ingresos y gastos',
        impact: 'Proyecciones pueden ser menos precisas',
      });
    }

    // Riesgo de tendencia negativa
    if (trends.savingsTrend === 'decreasing' && trends.savingsGrowthRate < -5) {
      risks.push({
        type: 'negative_trend',
        severity: 'high',
        description: 'Tendencia decreciente en ahorros',
        impact: 'Puede agotar ahorros existentes',
      });
    }

    // Riesgo de falta de datos
    if (trends.monthsAnalyzed < 3) {
      risks.push({
        type: 'insufficient_data',
        severity: 'medium',
        description: 'Datos históricos limitados para proyecciones precisas',
        impact: 'Las proyecciones pueden ser menos confiables',
      });
    }

    return risks;
  }

  /**
   * Retorna proyecciones vacías
   * @returns {Object}
   */
  getEmptyProjections() {
    return {
      income: { current: 0, monthlyGrowth: 0, trend: 'stable', projections: [], annualProjection: 0 },
      expenses: { current: 0, monthlyGrowth: 0, trend: 'stable', projections: [], annualProjection: 0 },
      savings: { current: 0, monthlyAverage: 0, trend: 'stable', projections: [], projectedTotal: 0 },
      scenarios: {
        realistic: null,
        optimistic: null,
        pessimistic: null,
      },
      milestones: [],
      riskFactors: [],
    };
  }
}

