// =====================================================
// CALCULADORA: SavingsCalculator
// =====================================================
// Calcula proyecciones de ahorro potencial
// =====================================================

export class SavingsCalculator {
  /**
   * Calcula todas las proyecciones de ahorro potencial
   * @param {Object} analysis - Resultado del análisis completo
   * @returns {Object} Objeto con todos los escenarios de ahorro
   */
  calculatePotentialSavings(analysis) {
    if (!analysis) {
      return this.getEmptyScenarios();
    }

    const scenarios = {
      '30days': this.calculate30Days(analysis),
      '90days': this.calculate90Days(analysis),
      '180days': this.calculate180Days(analysis),
      'eliminate_leakages': this.calculateLeakageElimination(analysis),
      'reduce_emotional': this.calculateEmotionalReduction(analysis),
      'reduce_category': this.calculateCategoryOptimization(analysis),
      'current_trend': this.calculateCurrentTrend(analysis),
    };

    return scenarios;
  }

  /**
   * Calcula ahorro potencial en 30 días
   * @param {Object} analysis
   * @returns {Object}
   */
  calculate30Days(analysis) {
    const monthlyLeakages = this.getMonthlyLeakages(analysis);
    const monthlyEmotional = this.getMonthlyEmotional(analysis);
    const monthlyUnnecessary = this.getMonthlyUnnecessary(analysis);
    
    const total = monthlyLeakages + monthlyEmotional + monthlyUnnecessary;

    return {
      period: '30 días',
      periodDays: 30,
      potential: Math.round(total * 100) / 100,
      breakdown: {
        leakages: Math.round(monthlyLeakages * 100) / 100,
        emotional: Math.round(monthlyEmotional * 100) / 100,
        unnecessary: Math.round(monthlyUnnecessary * 100) / 100,
      },
      description: 'Ahorro potencial si eliminas fugas y reduces gastos emocionales en 30 días',
    };
  }

  /**
   * Calcula ahorro potencial en 90 días
   * @param {Object} analysis
   * @returns {Object}
   */
  calculate90Days(analysis) {
    const monthlyLeakages = this.getMonthlyLeakages(analysis);
    const monthlyEmotional = this.getMonthlyEmotional(analysis);
    const monthlyUnnecessary = this.getMonthlyUnnecessary(analysis);
    
    const monthlyTotal = monthlyLeakages + monthlyEmotional + monthlyUnnecessary;
    const total = monthlyTotal * 3; // 3 meses

    return {
      period: '90 días',
      periodDays: 90,
      potential: Math.round(total * 100) / 100,
      breakdown: {
        leakages: Math.round(monthlyLeakages * 3 * 100) / 100,
        emotional: Math.round(monthlyEmotional * 3 * 100) / 100,
        unnecessary: Math.round(monthlyUnnecessary * 3 * 100) / 100,
      },
      description: 'Ahorro potencial si mantienes buenas prácticas financieras por 90 días',
    };
  }

  /**
   * Calcula ahorro potencial en 180 días
   * @param {Object} analysis
   * @returns {Object}
   */
  calculate180Days(analysis) {
    const monthlyLeakages = this.getMonthlyLeakages(analysis);
    const monthlyEmotional = this.getMonthlyEmotional(analysis);
    const monthlyUnnecessary = this.getMonthlyUnnecessary(analysis);
    
    const monthlyTotal = monthlyLeakages + monthlyEmotional + monthlyUnnecessary;
    const total = monthlyTotal * 6; // 6 meses

    return {
      period: '180 días',
      periodDays: 180,
      potential: Math.round(total * 100) / 100,
      breakdown: {
        leakages: Math.round(monthlyLeakages * 6 * 100) / 100,
        emotional: Math.round(monthlyEmotional * 6 * 100) / 100,
        unnecessary: Math.round(monthlyUnnecessary * 6 * 100) / 100,
      },
      description: 'Ahorro potencial si optimizas tus finanzas por 6 meses',
    };
  }

  /**
   * Calcula ahorro si se eliminan todas las fugas
   * @param {Object} analysis
   * @returns {Object}
   */
  calculateLeakageElimination(analysis) {
    const monthlyLeakages = this.getMonthlyLeakages(analysis);
    const annualLeakages = monthlyLeakages * 12;

    return {
      scenario: 'eliminate_leakages',
      potential: Math.round(annualLeakages * 100) / 100,
      monthly: Math.round(monthlyLeakages * 100) / 100,
      annual: Math.round(annualLeakages * 100) / 100,
      description: 'Ahorro anual si eliminas todas las fugas financieras detectadas',
      leakagesCount: this.getLeakagesCount(analysis),
    };
  }

  /**
   * Calcula ahorro si se reducen gastos emocionales
   * @param {Object} analysis
   * @returns {Object}
   */
  calculateEmotionalReduction(analysis) {
    const monthlyEmotional = this.getMonthlyEmotional(analysis);
    const reductionPercentage = 50; // Reducir 50% de gastos emocionales
    const monthlySavings = monthlyEmotional * (reductionPercentage / 100);
    const annualSavings = monthlySavings * 12;

    return {
      scenario: 'reduce_emotional',
      potential: Math.round(annualSavings * 100) / 100,
      monthly: Math.round(monthlySavings * 100) / 100,
      annual: Math.round(annualSavings * 100) / 100,
      reductionPercentage,
      description: `Ahorro anual si reduces tus gastos emocionales en un ${reductionPercentage}%`,
      currentMonthly: Math.round(monthlyEmotional * 100) / 100,
    };
  }

  /**
   * Calcula ahorro optimizando categorías de mayor gasto
   * @param {Object} analysis
   * @returns {Object}
   */
  calculateCategoryOptimization(analysis) {
    const categoryBreakdown = analysis.categoryBreakdown || {};
    const topCategories = this.getTopSpendingCategories(categoryBreakdown, 3);
    
    let totalPotential = 0;
    const breakdown = {};

    topCategories.forEach(cat => {
      // Asumir que se puede reducir 15% en las top 3 categorías
      const reduction = cat.total * 0.15;
      totalPotential += reduction;
      breakdown[cat.name || cat.category || 'Sin nombre'] = Math.round(reduction * 100) / 100;
    });

    const monthly = totalPotential;
    const annual = monthly * 12;

    return {
      scenario: 'optimize_categories',
      potential: Math.round(annual * 100) / 100,
      monthly: Math.round(monthly * 100) / 100,
      annual: Math.round(annual * 100) / 100,
      description: 'Ahorro anual optimizando tus 3 categorías de mayor gasto (reducción del 15%)',
      breakdown,
      categoriesOptimized: topCategories.length,
    };
  }

  /**
   * Calcula proyección basada en tendencia actual
   * @param {Object} analysis
   * @returns {Object}
   */
  calculateCurrentTrend(analysis) {
    const monthlyBreakdown = analysis.monthlyBreakdown || {};
    const trend = this.analyzeTrend(monthlyBreakdown);
    const currentSavings = analysis.netSavings || 0;
    
    // Proyectar basado en tendencia
    let projectedSavings = currentSavings;
    
    if (trend === 'increasing') {
      // Si la tendencia es positiva, proyectar un 5% más
      projectedSavings = currentSavings * 1.05;
    } else if (trend === 'decreasing') {
      // Si la tendencia es negativa, proyectar un 5% menos
      projectedSavings = currentSavings * 0.95;
    }

    return {
      scenario: 'current_trend',
      potential: Math.round(projectedSavings * 100) / 100,
      trend,
      description: `Proyección basada en tu tendencia actual (${trend === 'increasing' ? 'creciente' : trend === 'decreasing' ? 'decreciente' : 'estable'})`,
      current: Math.round(currentSavings * 100) / 100,
    };
  }

  // =====================================================
  // HELPERS
  // =====================================================

  /**
   * Obtiene impacto mensual total de fugas
   * @param {Object} analysis
   * @returns {number}
   */
  getMonthlyLeakages(analysis) {
    const leakages = analysis.leakages || analysis.leakage_analysis || [];
    if (!Array.isArray(leakages)) return 0;

    return leakages.reduce((sum, leak) => {
      return sum + parseFloat(leak.monthly_impact || leak.monthlyImpact || 0);
    }, 0);
  }

  /**
   * Obtiene impacto mensual de gastos emocionales
   * @param {Object} analysis
   * @returns {number}
   */
  getMonthlyEmotional(analysis) {
    const emotional = analysis.emotional || analysis.emotional_analysis || {};
    return parseFloat(emotional.monthly_impact || emotional.monthlyImpact || 0);
  }

  /**
   * Obtiene gastos innecesarios mensuales (estimado)
   * @param {Object} analysis
   * @returns {number}
   */
  getMonthlyUnnecessary(analysis) {
    // Estimar basado en transacciones sin categoría o marcadas como innecesarias
    const transactions = analysis.rawTransactions || [];
    if (!Array.isArray(transactions)) return 0;

    const unnecessary = transactions.filter(tx => {
      const necessity = tx.metadata?.necessity_level || tx.necessity_level;
      return necessity === 'innecesario' || necessity === 'unnecessary';
    });

    const total = unnecessary.reduce((sum, tx) => {
      return sum + parseFloat(tx.amount || 0);
    }, 0);

    // Calcular promedio mensual
    const months = this.getPeriodMonths(analysis);
    return months > 0 ? total / months : 0;
  }

  /**
   * Obtiene cantidad de fugas detectadas
   * @param {Object} analysis
   * @returns {number}
   */
  getLeakagesCount(analysis) {
    const leakages = analysis.leakages || analysis.leakage_analysis || [];
    return Array.isArray(leakages) ? leakages.length : 0;
  }

  /**
   * Obtiene las categorías de mayor gasto
   * @param {Object} categoryBreakdown
   * @param {number} limit
   * @returns {Array}
   */
  getTopSpendingCategories(categoryBreakdown, limit = 3) {
    if (!categoryBreakdown || typeof categoryBreakdown !== 'object') return [];

    const categories = Object.entries(categoryBreakdown)
      .map(([name, data]) => ({
        name,
        total: parseFloat(data.total || data.amount || 0),
        count: parseInt(data.count || 0),
        ...data,
      }))
      .filter(cat => cat.total > 0)
      .sort((a, b) => b.total - a.total)
      .slice(0, limit);

    return categories;
  }

  /**
   * Analiza tendencia de los gastos mensuales
   * @param {Object} monthlyBreakdown
   * @returns {string} 'increasing', 'decreasing', 'stable'
   */
  analyzeTrend(monthlyBreakdown) {
    if (!monthlyBreakdown || typeof monthlyBreakdown !== 'object') return 'stable';

    const months = Object.values(monthlyBreakdown)
      .map(m => parseFloat(m.total || m.amount || 0))
      .filter(val => val > 0);

    if (months.length < 2) return 'stable';

    // Calcular diferencia entre últimos meses
    const last = months[months.length - 1];
    const previous = months[months.length - 2];
    const diff = ((last - previous) / previous) * 100;

    if (diff > 5) return 'increasing';
    if (diff < -5) return 'decreasing';
    return 'stable';
  }

  /**
   * Obtiene períodos en meses del análisis
   * @param {Object} analysis
   * @returns {number}
   */
  getPeriodMonths(analysis) {
    const periodDays = analysis.period?.days || analysis.period_days || 90;
    return Math.max(1, Math.round(periodDays / 30));
  }

  /**
   * Retorna escenarios vacíos
   * @returns {Object}
   */
  getEmptyScenarios() {
    return {
      '30days': { potential: 0, period: '30 días', periodDays: 30 },
      '90days': { potential: 0, period: '90 días', periodDays: 90 },
      '180days': { potential: 0, period: '180 días', periodDays: 180 },
      'eliminate_leakages': { potential: 0, annual: 0, monthly: 0 },
      'reduce_emotional': { potential: 0, annual: 0, monthly: 0 },
      'reduce_category': { potential: 0, annual: 0, monthly: 0 },
      'current_trend': { potential: 0, trend: 'stable' },
    };
  }
}

