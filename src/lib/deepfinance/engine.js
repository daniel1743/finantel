// =====================================================
// DEEPFINANCE ENGINE - Motor Principal
// =====================================================
// Orquesta todos los análisis y genera el reporte final
// =====================================================

import { DataCollector } from './dataCollector';
import { ScoreCalculator } from './calculators/scoreCalculator';
import { TransactionAnalyzer } from './analyzers/transactionAnalyzer';
import { generateAIInsights, generateRecommendations } from './aiService';

export class DeepFinanceEngine {
  constructor(userId) {
    this.userId = userId;
    this.dataCollector = new DataCollector(userId);
    this.scoreCalculator = new ScoreCalculator();
    this.rawData = null;
  }

  /**
   * Ejecuta el análisis completo
   * @param {string} period - '30days', '90days', '180days', 'all'
   * @returns {Promise<Object>}
   */
  async analyze(period = '90days') {
    try {
      // 1. RECOLECTAR DATOS REALES
      console.log('[DeepFinance] Recolectando datos...');
      this.rawData = await this.dataCollector.collectAllData(period);

      // 2. VALIDAR DATOS MÍNIMOS
      const validation = this.dataCollector.validateMinimumData(this.rawData);
      if (!validation.valid) {
        throw new Error(`INSUFFICIENT_DATA: ${validation.reason}`);
      }

      // 3. ANÁLISIS POR TRANSACCIÓN
      console.log('[DeepFinance] Analizando transacciones...');
      const transactionAnalyzer = new TransactionAnalyzer(
        this.rawData.transactions,
        this.rawData.budgets,
        this.rawData.categories
      );
      const transactionAnalysis = transactionAnalyzer.analyzeAll();

      // 4. CALCULAR TOTALES REALES (NUNCA inventar)
      const totalIncome = this.calculateRealIncome();
      const totalExpenses = this.calculateRealExpenses();
      const netSavings = totalIncome - totalExpenses;
      const savingsRate = totalIncome > 0 
        ? (netSavings / totalIncome) * 100 
        : 0;

      // 5. ANÁLISIS BÁSICO DE PATRONES (Fase 1 - básico)
      const patterns = this.detectBasicPatterns(transactionAnalysis);

      // 6. ANÁLISIS EMOCIONAL BÁSICO (Fase 1 - básico)
      const emotional = this.analyzeEmotionalBasic(transactionAnalysis);

      // 7. ANÁLISIS DE RIESGO BÁSICO (Fase 1 - básico)
      const risk = this.analyzeRiskBasic(totalIncome, totalExpenses, savingsRate);

      // 8. PREPARAR DATOS PARA CÁLCULO DE PUNTAJE
      const analysisData = {
        budgets: this.analyzeBudgets(),
        totalIncome,
        totalExpenses,
        patterns,
        risk,
        emotional,
        goals: this.rawData.goals,
      };

      // 9. CALCULAR PUNTAJE GLOBAL
      console.log('[DeepFinance] Calculando puntaje...');
      const score = this.scoreCalculator.calculateGlobalScore(analysisData);
      const scoreBreakdown = this.scoreCalculator.calculateScoreBreakdown(analysisData);

      // 10. GENERAR RECOMENDACIONES (basadas en datos reales)
      console.log('[DeepFinance] Generando recomendaciones...');
      const recommendations = generateRecommendations({
        score,
        savingsRate: Math.round(savingsRate * 100) / 100,
        budgets: this.analyzeBudgets(),
        emotional,
        patterns,
      });

      // 11. GENERAR INSIGHTS CON IA (DeepSeek/Qwen)
      console.log('[DeepFinance] Generando insights con IA...');
      let aiInsights = null;
      try {
        aiInsights = await generateAIInsights(
          {
            score,
            scoreBreakdown,
            totalIncome,
            totalExpenses,
            netSavings,
            savingsRate: Math.round(savingsRate * 100) / 100,
            patterns,
            emotional,
            risk,
            categoryBreakdown: transactionAnalysis.categoryBreakdown,
            monthlyBreakdown: transactionAnalysis.monthlyBreakdown,
            budgets: this.analyzeBudgets(),
            period: this.rawData.period,
          },
          this.rawData
        );
      } catch (error) {
        console.warn('[DeepFinance] Error generando insights con IA, usando fallback:', error);
        // Continuar con análisis sin IA si falla
      }

      // 12. CONSTRUIR RESULTADO FINAL
      const analysis = {
        // Metadatos
        userId: this.userId,
        analysisDate: new Date().toISOString(),
        period: this.rawData.period,
        metadata: this.rawData.metadata,

        // Puntaje
        score,
        scoreBreakdown,

        // Datos financieros (SOLO REALES)
        totalTransactions: this.rawData.transactions.length,
        totalIncome,
        totalExpenses,
        netSavings,
        savingsRate: Math.round(savingsRate * 100) / 100,

        // Análisis
        transactionAnalysis,
        patterns,
        emotional,
        risk,

        // Desglose por categoría
        categoryBreakdown: transactionAnalysis.categoryBreakdown,

        // Análisis mensual
        monthlyBreakdown: transactionAnalysis.monthlyBreakdown,

        // Recomendaciones
        recommendations,

        // Insights de IA
        aiInsights,

        // Resumen ejecutivo
        summary: aiInsights?.summary || this.generateBasicSummary(score, totalIncome, totalExpenses, savingsRate),
      };

      // 13. VALIDAR RESULTADO
      this.validateAnalysis(analysis);

      console.log('[DeepFinance] Análisis completado. Puntaje:', score);
      return analysis;

    } catch (error) {
      console.error('[DeepFinance] Error en análisis:', error);
      throw error;
    }
  }

  /**
   * Calcula ingresos totales REALES
   * @returns {number}
   */
  calculateRealIncome() {
    if (!this.rawData || !this.rawData.transactions) return 0;
    
    return this.rawData.transactions
      .filter(tx => tx.type === 'income')
      .reduce((sum, tx) => sum + parseFloat(tx.amount || 0), 0);
  }

  /**
   * Calcula gastos totales REALES
   * @returns {number}
   */
  calculateRealExpenses() {
    if (!this.rawData || !this.rawData.transactions) return 0;
    
    return this.rawData.transactions
      .filter(tx => tx.type === 'expense')
      .reduce((sum, tx) => sum + parseFloat(tx.amount || 0), 0);
  }

  /**
   * Detecta patrones básicos (Fase 1)
   * @param {Object} transactionAnalysis
   * @returns {Array}
   */
  detectBasicPatterns(transactionAnalysis) {
    const patterns = [];

    // Patrón 1: Día de la semana con más gastos
    const dayPattern = this.detectDayOfWeekPattern();
    if (dayPattern) patterns.push(dayPattern);

    // Patrón 2: Categoría dominante
    const categoryPattern = this.detectCategoryPattern(transactionAnalysis.categoryBreakdown);
    if (categoryPattern) patterns.push(categoryPattern);

    // Patrón 3: Tendencia mensual
    const trendPattern = this.detectTrendPattern(transactionAnalysis.monthlyBreakdown);
    if (trendPattern) patterns.push(trendPattern);

    return patterns;
  }

  /**
   * Detecta patrón por día de la semana
   * @returns {Object|null}
   */
  detectDayOfWeekPattern() {
    const dayTotals = {};
    const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

    this.rawData.transactions
      .filter(tx => tx.type === 'expense')
      .forEach(tx => {
        const date = new Date(tx.date);
        const dayOfWeek = date.getDay();
        if (!dayTotals[dayOfWeek]) dayTotals[dayOfWeek] = 0;
        dayTotals[dayOfWeek] += parseFloat(tx.amount || 0);
      });

    if (Object.keys(dayTotals).length === 0) return null;

    const maxDay = Object.entries(dayTotals).reduce((a, b) => 
      dayTotals[a[0]] > dayTotals[b[0]] ? a : b
    );
    const avgDay = Object.values(dayTotals).reduce((a, b) => a + b, 0) / Object.keys(dayTotals).length;
    const difference = ((dayTotals[maxDay[0]] - avgDay) / avgDay) * 100;

    if (difference > 20) {
      return {
        type: 'day_of_week',
        description: `Gastas un ${Math.round(difference)}% más los ${dayNames[maxDay[0]]}s`,
        day: dayNames[maxDay[0]],
        impact: dayTotals[maxDay[0]],
        difference: Math.round(difference),
      };
    }

    return null;
  }

  /**
   * Detecta patrón de categoría dominante
   * @param {Array} categoryBreakdown
   * @returns {Object|null}
   */
  detectCategoryPattern(categoryBreakdown) {
    if (!categoryBreakdown || categoryBreakdown.length === 0) return null;

    const topCategory = categoryBreakdown[0];
    const totalIncome = this.calculateRealIncome();

    if (totalIncome > 0 && topCategory.percentage > 15) {
      return {
        type: 'dominant_category',
        description: `${topCategory.name} representa el ${Math.round(topCategory.percentage)}% de tus gastos`,
        category: topCategory.name,
        percentage: Math.round(topCategory.percentage),
        amount: topCategory.amount,
      };
    }

    return null;
  }

  /**
   * Detecta patrón de tendencia
   * @param {Array} monthlyBreakdown
   * @returns {Object|null}
   */
  detectTrendPattern(monthlyBreakdown) {
    if (!monthlyBreakdown || monthlyBreakdown.length < 2) return null;

    const recent = monthlyBreakdown.slice(-3);
    const older = monthlyBreakdown.slice(0, -3);

    if (older.length === 0) return null;

    const recentAvg = recent.reduce((sum, m) => sum + m.total, 0) / recent.length;
    const olderAvg = older.reduce((sum, m) => sum + m.total, 0) / older.length;

    const change = ((recentAvg - olderAvg) / olderAvg) * 100;

    if (Math.abs(change) > 10) {
      return {
        type: 'trend',
        description: change > 0 
          ? `Tus gastos han aumentado un ${Math.round(change)}% en los últimos meses`
          : `Tus gastos han disminuido un ${Math.abs(Math.round(change))}% en los últimos meses`,
        trend: change > 0 ? 'increasing' : 'decreasing',
        change: Math.round(change),
      };
    }

    return null;
  }

  /**
   * Análisis emocional básico (Fase 1)
   * @param {Object} transactionAnalysis
   * @returns {Object}
   */
  analyzeEmotionalBasic(transactionAnalysis) {
    const emotionalTransactions = transactionAnalysis.byTransaction.filter(
      tx => tx.emotional === true
    );

    const totalExpenses = this.calculateRealExpenses();
    const emotionalTotal = emotionalTransactions.reduce(
      (sum, tx) => sum + parseFloat(tx.amount || 0), 0
    );
    const emotionalPercentage = totalExpenses > 0 
      ? (emotionalTotal / totalExpenses) * 100 
      : 0;

    return {
      count: emotionalTransactions.length,
      total: emotionalTotal,
      percentage: Math.round(emotionalPercentage * 100) / 100,
      monthly_impact: emotionalTotal / (this.rawData.period.days / 30),
    };
  }

  /**
   * Análisis de riesgo básico (Fase 1)
   * @param {number} income
   * @param {number} expenses
   * @param {number} savingsRate
   * @returns {Object}
   */
  analyzeRiskBasic(income, expenses, savingsRate) {
    const riskFactors = [];
    let riskLevel = 'low';

    // Factor 1: Tasa de ahorro negativa
    if (savingsRate < 0) {
      riskFactors.push({
        type: 'negative_savings',
        description: 'Gastas más de lo que ganas',
        severity: 'high',
      });
      riskLevel = 'critical';
    } else if (savingsRate < 5) {
      riskFactors.push({
        type: 'low_savings',
        description: 'Tasa de ahorro muy baja',
        severity: 'medium',
      });
      riskLevel = riskLevel === 'low' ? 'medium' : riskLevel;
    }

    // Factor 2: Gastos muy cercanos a ingresos
    const expenseRatio = income > 0 ? (expenses / income) * 100 : 100;
    if (expenseRatio > 95) {
      riskFactors.push({
        type: 'high_expense_ratio',
        description: 'Gastas más del 95% de tus ingresos',
        severity: 'high',
      });
      riskLevel = 'high';
    }

    return {
      level: riskLevel,
      factors: riskFactors,
      savingsRate,
      expenseRatio: Math.round(expenseRatio * 100) / 100,
    };
  }

  /**
   * Analiza cumplimiento de presupuestos
   * @returns {Array}
   */
  analyzeBudgets() {
    if (!this.rawData.budgets || this.rawData.budgets.length === 0) {
      return [];
    }

    return this.rawData.budgets.map(budget => {
      const categoryTransactions = this.rawData.transactions.filter(
        tx => tx.category_id === budget.category_id && tx.type === 'expense'
      );

      const spent = categoryTransactions.reduce(
        (sum, tx) => sum + parseFloat(tx.amount || 0), 0
      );

      const budgetAmount = parseFloat(budget.amount || 0);
      const percentage = budgetAmount > 0 
        ? (spent / budgetAmount) * 100 
        : 0;

      return {
        budget_id: budget.id,
        category_id: budget.category_id,
        budget_amount: budgetAmount,
        spent,
        percentage: Math.round(percentage * 100) / 100,
        status: percentage > 100 ? 'exceeded' : 
                percentage > 80 ? 'warning' : 'ok',
      };
    });
  }

  /**
   * Genera resumen ejecutivo básico (Fase 1)
   * @param {number} score
   * @param {number} income
   * @param {number} expenses
   * @param {number} savingsRate
   * @returns {Object}
   */
  generateBasicSummary(score, income, expenses, savingsRate) {
    let healthStatus = 'excelente';
    if (score < 40) healthStatus = 'crítico';
    else if (score < 60) healthStatus = 'necesita_mejora';
    else if (score < 80) healthStatus = 'bueno';
    else if (score < 90) healthStatus = 'muy_bueno';

    return {
      score,
      healthStatus,
      totalIncome: income,
      totalExpenses: expenses,
      netSavings: income - expenses,
      savingsRate: Math.round(savingsRate * 100) / 100,
      message: this.generateSummaryMessage(score, savingsRate),
    };
  }

  /**
   * Genera mensaje de resumen
   * @param {number} score
   * @param {number} savingsRate
   * @returns {string}
   */
  generateSummaryMessage(score, savingsRate) {
    if (score >= 80) {
      return 'Tu salud financiera es excelente. Sigue así.';
    } else if (score >= 60) {
      return 'Tu salud financiera es buena, pero hay oportunidades de mejora.';
    } else if (score >= 40) {
      return 'Tu salud financiera necesita atención. Hay áreas importantes a mejorar.';
    } else {
      return 'Tu salud financiera requiere acción inmediata. Revisa las recomendaciones.';
    }
  }

  /**
   * Valida que el análisis es correcto
   * @param {Object} analysis
   */
  validateAnalysis(analysis) {
    // Verificar que los totales suman correctamente
    const calculatedNet = analysis.totalIncome - analysis.totalExpenses;
    if (Math.abs(calculatedNet - analysis.netSavings) > 0.01) {
      throw new Error('INVALID_ANALYSIS: Los totales no coinciden');
    }

    // Verificar que el puntaje está en rango
    if (analysis.score < 0 || analysis.score > 100) {
      throw new Error('INVALID_ANALYSIS: Puntaje fuera de rango');
    }

    // Verificar que no hay números negativos donde no debería
    if (analysis.totalIncome < 0 || analysis.totalExpenses < 0) {
      throw new Error('INVALID_ANALYSIS: Totales negativos detectados');
    }
  }
}

