// =====================================================
// SCORE CALCULATOR - DeepFinance Engine
// =====================================================
// Calcula el puntaje financiero global (0-100)
// =====================================================

export class ScoreCalculator {
  /**
   * Calcula el puntaje financiero global
   * @param {Object} analysis - Datos del análisis
   * @returns {number} Puntaje de 0 a 100
   */
  calculateGlobalScore(analysis) {
    const weights = {
      budgetCompliance: 0.25,    // 25% - Cumplimiento de presupuestos
      savingsRate: 0.20,         // 20% - Tasa de ahorro
      spendingDiscipline: 0.15, // 15% - Disciplina de gastos
      riskLevel: 0.15,          // 15% - Nivel de riesgo
      patternHealth: 0.10,       // 10% - Salud de patrones
      goalProgress: 0.10,        // 10% - Progreso de metas
      emotionalControl: 0.05     // 5% - Control emocional
    };

    const scores = {
      budgetCompliance: this.calculateBudgetScore(analysis.budgets || []),
      savingsRate: this.calculateSavingsScore(
        analysis.totalIncome || 0,
        analysis.totalExpenses || 0
      ),
      spendingDiscipline: this.calculateDisciplineScore(analysis.patterns || []),
      riskLevel: this.calculateRiskScore(analysis.risk || {}),
      patternHealth: this.calculatePatternScore(analysis.patterns || []),
      goalProgress: this.calculateGoalScore(analysis.goals || []),
      emotionalControl: this.calculateEmotionalScore(analysis.emotional || {})
    };

    // Calcular promedio ponderado
    let totalScore = 0;
    Object.keys(weights).forEach(key => {
      totalScore += scores[key] * weights[key];
    });

    // Asegurar que está entre 0 y 100
    return Math.max(0, Math.min(100, Math.round(totalScore)));
  }

  /**
   * Calcula puntaje de cumplimiento de presupuestos
   * @param {Array} budgets - Array de presupuestos con análisis
   * @returns {number} 0-100
   */
  calculateBudgetScore(budgets) {
    if (!budgets || budgets.length === 0) {
      return 50; // Neutral si no hay presupuestos
    }

    const complianceRates = budgets.map(budget => {
      const percentage = budget.percentage || 0;
      
      if (percentage > 100) return 0;        // Excedido: 0 puntos
      if (percentage > 90) return 25;       // Casi excedido: 25 puntos
      if (percentage > 80) return 50;        // Advertencia: 50 puntos
      if (percentage > 50) return 75;       // Bueno: 75 puntos
      return 100;                            // Excelente: 100 puntos
    });

    const average = complianceRates.reduce((a, b) => a + b, 0) / complianceRates.length;
    return Math.round(average);
  }

  /**
   * Calcula puntaje de tasa de ahorro
   * @param {number} income - Ingresos totales
   * @param {number} expenses - Gastos totales
   * @returns {number} 0-100
   */
  calculateSavingsScore(income, expenses) {
    if (!income || income === 0) {
      return 0; // Sin ingresos: 0 puntos
    }

    const savings = income - expenses;
    const savingsRate = (savings / income) * 100;

    // Escala de puntuación
    if (savingsRate >= 30) return 100;      // Excelente: ≥30%
    if (savingsRate >= 20) return 90;      // Muy bueno: 20-29%
    if (savingsRate >= 15) return 80;      // Bueno: 15-19%
    if (savingsRate >= 10) return 70;      // Aceptable: 10-14%
    if (savingsRate >= 5) return 60;       // Regular: 5-9%
    if (savingsRate >= 0) return 40;       // Bajo: 0-4%
    if (savingsRate >= -5) return 20;      // Crítico: -5 a -1%
    return 0;                               // Muy crítico: <-5%
  }

  /**
   * Calcula puntaje de disciplina de gastos
   * @param {Array} patterns - Patrones detectados
   * @returns {number} 0-100
   */
  calculateDisciplineScore(patterns) {
    if (!patterns || patterns.length === 0) {
      return 50; // Neutral si no hay patrones
    }

    // Contar patrones negativos (gastos impulsivos, inconsistencias)
    const negativePatterns = patterns.filter(p => 
      p.type === 'impulsive' || 
      p.type === 'inconsistent' || 
      p.type === 'excessive'
    ).length;

    const totalPatterns = patterns.length;
    const negativeRatio = negativePatterns / totalPatterns;

    // Menos patrones negativos = mejor puntaje
    if (negativeRatio === 0) return 100;
    if (negativeRatio < 0.2) return 80;
    if (negativeRatio < 0.4) return 60;
    if (negativeRatio < 0.6) return 40;
    return 20;
  }

  /**
   * Calcula puntaje de nivel de riesgo
   * @param {Object} risk - Análisis de riesgo
   * @returns {number} 0-100
   */
  calculateRiskScore(risk) {
    if (!risk || !risk.level) {
      return 50; // Neutral si no hay análisis de riesgo
    }

    const riskMap = {
      'low': 100,
      'medium': 70,
      'high': 40,
      'critical': 10
    };

    return riskMap[risk.level] || 50;
  }

  /**
   * Calcula puntaje de salud de patrones
   * @param {Array} patterns - Patrones detectados
   * @returns {number} 0-100
   */
  calculatePatternScore(patterns) {
    if (!patterns || patterns.length === 0) {
      return 50; // Neutral
    }

    // Patrones saludables (consistentes, predecibles)
    const healthyPatterns = patterns.filter(p => 
      p.type === 'consistent' || 
      p.type === 'predictable' ||
      p.type === 'improving'
    ).length;

    const totalPatterns = patterns.length;
    const healthyRatio = healthyPatterns / totalPatterns;

    return Math.round(healthyRatio * 100);
  }

  /**
   * Calcula puntaje de progreso de metas
   * @param {Array} goals - Metas del usuario
   * @returns {number} 0-100
   */
  calculateGoalScore(goals) {
    if (!goals || goals.length === 0) {
      return 50; // Neutral si no hay metas
    }

    // Calcular progreso promedio de todas las metas
    const progressRates = goals.map(goal => {
      if (!goal.target_amount || goal.target_amount === 0) return 0;
      const progress = (goal.current_amount || 0) / goal.target_amount;
      return Math.min(100, progress * 100); // Máximo 100%
    });

    const averageProgress = progressRates.reduce((a, b) => a + b, 0) / progressRates.length;
    return Math.round(averageProgress);
  }

  /**
   * Calcula puntaje de control emocional
   * @param {Object} emotional - Análisis emocional
   * @returns {number} 0-100
   */
  calculateEmotionalScore(emotional) {
    if (!emotional || !emotional.percentage) {
      return 50; // Neutral si no hay datos
    }

    const emotionalPercentage = emotional.percentage || 0;

    // Menos gastos emocionales = mejor puntaje
    if (emotionalPercentage < 10) return 100;  // Excelente
    if (emotionalPercentage < 20) return 80;  // Muy bueno
    if (emotionalPercentage < 30) return 60;  // Bueno
    if (emotionalPercentage < 40) return 40;  // Regular
    if (emotionalPercentage < 50) return 20;  // Malo
    return 0;                                   // Muy malo
  }

  /**
   * Calcula desglose del puntaje por componente
   * @param {Object} analysis
   * @returns {Object}
   */
  calculateScoreBreakdown(analysis) {
    const weights = {
      budgetCompliance: 0.25,
      savingsRate: 0.20,
      spendingDiscipline: 0.15,
      riskLevel: 0.15,
      patternHealth: 0.10,
      goalProgress: 0.10,
      emotionalControl: 0.05
    };

    const scores = {
      budgetCompliance: this.calculateBudgetScore(analysis.budgets || []),
      savingsRate: this.calculateSavingsScore(
        analysis.totalIncome || 0,
        analysis.totalExpenses || 0
      ),
      spendingDiscipline: this.calculateDisciplineScore(analysis.patterns || []),
      riskLevel: this.calculateRiskScore(analysis.risk || {}),
      patternHealth: this.calculatePatternScore(analysis.patterns || []),
      goalProgress: this.calculateGoalScore(analysis.goals || []),
      emotionalControl: this.calculateEmotionalScore(analysis.emotional || {})
    };

    // Calcular contribución de cada componente
    const breakdown = {};
    Object.keys(weights).forEach(key => {
      breakdown[key] = {
        score: scores[key],
        weight: weights[key],
        contribution: scores[key] * weights[key]
      };
    });

    return breakdown;
  }
}

