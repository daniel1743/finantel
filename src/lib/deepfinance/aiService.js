// =====================================================
// AI SERVICE - DeepFinance Engine
// =====================================================
// Integración con DeepSeek (y Qwen como fallback) para análisis financiero
// =====================================================

const DEEPSEEK_API_KEY = import.meta.env.VITE_DEEPSEEK_API_KEY || 'sk-4d4cc3ac92254985b045a1881b85b12a';
const QWEN_API_KEY = import.meta.env.VITE_QWEN_API_KEY || 'sk-e6343f5b0abc42d294d2ad7f977e48e8';

const DEEPFINANCE_SYSTEM_PROMPT = `Eres un asesor financiero profesional de nivel ejecutivo con más de 20 años de experiencia en análisis financiero personal, planificación patrimonial y gestión de riesgos.

Tu rol es analizar datos financieros REALES del usuario y generar insights profesionales, accionables y precisos.

IDENTIDAD Y TONO:
- Profesional pero accesible
- Directo y claro, sin rodeos
- Empático pero objetivo
- Usas lenguaje financiero preciso pero comprensible
- Evitas jerga técnica innecesaria

REGLAS CRÍTICAS DE ÉTICA Y PRECISIÓN:

1. PROHIBIDO ABSOLUTO:
   - INVENTAR datos financieros (montos, categorías, transacciones, fechas)
   - Usar aproximaciones o estimaciones con números que no estén en los datos
   - Asumir información que no se te proporcionó
   - Generar análisis basado en suposiciones no verificables

2. SOLO USA DATOS REALES:
   - Todos los números deben venir de los datos proporcionados
   - Si no hay datos en una categoría, di "No hay datos suficientes"
   - Si un cálculo no es posible, explica por qué
   - Sé honesto cuando falte información

3. ANÁLISIS PROFESIONAL:
   - Detecta patrones REALES en los datos
   - Identifica riesgos basados en evidencia
   - Sugiere mejoras concretas y accionables
   - Proporciona contexto y explicaciones claras

4. FORMATO DE RESPUESTA:
   - Estructura clara y organizada
   - Párrafos concisos
   - Puntos clave destacados
   - Recomendaciones específicas y medibles

OBJETIVO:
Generar un análisis financiero profesional que el usuario pueda usar para tomar decisiones informadas, similar a lo que recibiría de un asesor financiero de banco o corredor de bolsa.`;

/**
 * Clase principal para el servicio de IA de DeepFinance
 */
export class DeepFinanceAIService {
  constructor() {
    // Constructor vacío, no requiere inicialización
  }

  /**
   * Llama a la API de IA (DeepSeek primero, Qwen como fallback)
   * @param {string} prompt
   * @returns {Promise<string>}
   */
  async callAI(prompt) {
    const messages = [
      { role: 'system', content: DEEPFINANCE_SYSTEM_PROMPT },
      { role: 'user', content: prompt }
    ];

    try {
      // Intento 1: DeepSeek
      const deepseekResponse = await fetch('https://api.deepseek.com/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: messages,
          temperature: 0.7, // Más conservador para análisis financiero
          stream: false
        })
      });

      if (deepseekResponse.ok) {
        const data = await deepseekResponse.json();
        if (data.choices && data.choices[0] && data.choices[0].message) {
          return data.choices[0].message.content;
        }
        throw new Error('DeepSeek API: Respuesta inválida');
      }
      
      // Obtener detalles del error
      const errorData = await deepseekResponse.json().catch(() => ({}));
      const errorMessage = errorData.error?.message || `HTTP ${deepseekResponse.status}`;
      throw new Error(`DeepSeek API failed: ${errorMessage}`);

    } catch (error) {
      console.warn('[DeepFinance AI] DeepSeek failed, trying Qwen:', error.message || error);
      
      // Verificar si hay API key de Qwen antes de intentar
      if (!QWEN_API_KEY || QWEN_API_KEY === 'sk-e6343f5b0abc42d294d2ad7f977e48e8') {
        console.warn('[DeepFinance AI] Qwen API key no configurada, usando fallback');
        throw new Error(`DeepSeek falló y Qwen no está configurado: ${error.message}`);
      }
      
      // Intento 2: Qwen (fallback)
      try {
        const qwenResponse = await fetch('https://dashscope-intl.aliyuncs.com/compatible-mode/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${QWEN_API_KEY}`
          },
          body: JSON.stringify({
            model: 'qwen-turbo',
            messages: messages,
            temperature: 0.7
          })
        });

        if (qwenResponse.ok) {
          const data = await qwenResponse.json();
          if (data.choices && data.choices[0] && data.choices[0].message) {
            return data.choices[0].message.content;
          }
          throw new Error('Qwen API: Respuesta inválida');
        }
        
        // Obtener detalles del error
        const errorData = await qwenResponse.json().catch(() => ({}));
        const errorMessage = errorData.error?.message || `HTTP ${qwenResponse.status}`;
        throw new Error(`Qwen API failed: ${errorMessage}`);

      } catch (finalError) {
        console.error('[DeepFinance AI] All AI services failed:', finalError.message || finalError);
        const errorMsg = finalError.message || 'Error desconocido';
        throw new Error(`No se pudo conectar con los servicios de IA: ${errorMsg}. Verifica tus API keys en .env`);
      }
    }
  }

  /**
   * Construye el contexto con datos reales
   * @param {Object} analysis
   * @param {Object} rawData
   * @returns {string}
   */
  buildAnalysisContext(analysis, rawData) {
    const context = {
      // Datos financieros básicos (REALES)
      financial: {
        totalIncome: analysis.totalIncome,
        totalExpenses: analysis.totalExpenses,
        netSavings: analysis.netSavings,
        savingsRate: analysis.savingsRate,
        totalTransactions: analysis.totalTransactions,
        period: {
          start: analysis.period.start,
          end: analysis.period.end,
          days: analysis.period.days,
        },
      },

      // Puntaje y componentes
      score: {
        global: analysis.score,
        breakdown: analysis.scoreBreakdown,
      },

      // Patrones detectados (solo los que existen)
      patterns: analysis.patterns || [],

      // Análisis emocional (solo si hay datos)
      emotional: analysis.emotional || null,

      // Análisis de riesgo
      risk: analysis.risk || null,

      // Desglose por categoría (top 10)
      topCategories: (analysis.categoryBreakdown || []).slice(0, 10),

      // Análisis mensual (últimos 6 meses)
      monthlyTrend: (analysis.monthlyBreakdown || []).slice(-6),

      // Presupuestos (solo si existen)
      budgets: analysis.budgets || [],

      // Metas (solo si existen)
      goals: rawData.goals || [],
    };

    return JSON.stringify(context, null, 2);
  }

  /**
   * Construye el prompt para la IA
   * @param {string} context
   * @param {Object} analysis
   * @returns {string}
   */
  buildAnalysisPrompt(context, analysis) {
    return `Analiza estos datos financieros REALES del usuario y genera un análisis profesional completo.

DATOS DEL ANÁLISIS:
${context}

INSTRUCCIONES ESPECÍFICAS:

1. RESUMEN EJECUTIVO:
   - Evalúa el puntaje financiero (${analysis.score}/100) y explica qué significa
   - Describe la salud financiera general en 2-3 oraciones
   - Identifica el aspecto más fuerte y el más débil

2. DIAGNÓSTICO POR ÁREA:
   - Analiza cada componente del puntaje (presupuestos, ahorro, disciplina, riesgo, etc.)
   - Explica qué está bien y qué necesita mejora
   - Usa SOLO los datos proporcionados

3. PATRONES Y TENDENCIAS:
   - Describe los patrones detectados (si existen)
   - Explica qué significan y su impacto
   - Si no hay patrones claros, dilo honestamente

4. RIESGOS IDENTIFICADOS:
   - Lista los riesgos financieros detectados (si existen)
   - Explica su severidad e impacto potencial
   - Si no hay riesgos críticos, dilo

5. RECOMENDACIONES ACCIONABLES:
   - Proporciona 3-5 recomendaciones específicas y medibles
   - Prioriza por impacto y facilidad de implementación
   - Basa las recomendaciones SOLO en los datos reales

6. PLAN DE ACCIÓN SUGERIDO:
   - Sugiere pasos concretos para los próximos 7, 30 y 90 días
   - Sé específico y realista
   - No inventes números ni metas

FORMATO DE RESPUESTA:
Responde en formato JSON estructurado:
{
  "summary": "Resumen ejecutivo de 2-3 oraciones",
  "diagnosis": {
    "strengths": ["Fortaleza 1", "Fortaleza 2"],
    "weaknesses": ["Debilidad 1", "Debilidad 2"],
    "byComponent": {
      "budgetCompliance": "Análisis del cumplimiento de presupuestos",
      "savingsRate": "Análisis de tasa de ahorro",
      // ... otros componentes
    }
  },
  "patterns": "Análisis de patrones detectados",
  "risks": ["Riesgo 1", "Riesgo 2"],
  "recommendations": [
    {
      "title": "Título de recomendación",
      "description": "Descripción detallada",
      "impact": "alto|medio|bajo",
      "priority": 1-5
    }
  ],
  "actionPlan": {
    "7days": ["Acción 1", "Acción 2"],
    "30days": ["Acción 1", "Acción 2"],
    "90days": ["Acción 1", "Acción 2"]
  }
}

IMPORTANTE: 
- Usa SOLO los datos proporcionados
- Si no hay datos en un área, di "No hay datos suficientes para analizar esta área"
- NUNCA inventes números, montos o categorías
- Sé honesto y profesional`;
  }

  /**
   * Parsea la respuesta de la IA
   * @param {string} aiResponse
   * @param {Object} analysis
   * @returns {Object}
   */
  parseAIResponse(aiResponse, analysis) {
    try {
      // Intentar extraer JSON de la respuesta
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          ...parsed,
          rawResponse: aiResponse,
          generatedAt: new Date().toISOString(),
        };
      }

      // Si no hay JSON, crear estructura básica con el texto
      return {
        summary: aiResponse.substring(0, 500),
        diagnosis: {
          strengths: [],
          weaknesses: [],
          byComponent: {},
        },
        patterns: '',
        risks: [],
        recommendations: [],
        actionPlan: {
          '7days': [],
          '30days': [],
          '90days': [],
        },
        rawResponse: aiResponse,
        generatedAt: new Date().toISOString(),
      };

    } catch (error) {
      console.error('[DeepFinance AI] Error parsing response:', error);
      return this.generateFallbackInsights(analysis);
    }
  }

  /**
   * Genera insights básicos si falla la IA
   * @param {Object} analysis
   * @returns {Object}
   */
  generateFallbackInsights(analysis) {
    const score = analysis.score;
    let summary = '';
    let healthStatus = '';

    if (score >= 80) {
      healthStatus = 'excelente';
      summary = 'Tu salud financiera es excelente. Mantienes un buen equilibrio entre ingresos y gastos, y sigues tus presupuestos consistentemente.';
    } else if (score >= 60) {
      healthStatus = 'buena';
      summary = 'Tu salud financiera es buena, pero hay oportunidades de mejora. Algunas áreas necesitan atención para optimizar tus finanzas.';
    } else if (score >= 40) {
      healthStatus = 'regular';
      summary = 'Tu salud financiera necesita atención. Hay áreas importantes que requieren mejoras para alcanzar una situación financiera más estable.';
    } else {
      healthStatus = 'crítica';
      summary = 'Tu salud financiera requiere acción inmediata. Es importante revisar tus hábitos de gasto y crear un plan de acción para mejorar.';
    }

    return {
      summary,
      healthStatus,
      diagnosis: {
        strengths: [],
        weaknesses: [],
        byComponent: {},
      },
      patterns: analysis.patterns?.map(p => p.description).join('. ') || 'No se detectaron patrones significativos.',
      risks: analysis.risk?.factors?.map(f => f.description) || [],
      recommendations: [],
      actionPlan: {
        '7days': ['Revisar tus gastos del mes', 'Identificar categorías con mayor gasto'],
        '30days': ['Crear o ajustar presupuestos', 'Establecer metas de ahorro'],
        '90days': ['Mejorar tasa de ahorro', 'Optimizar gastos recurrentes'],
      },
      rawResponse: null,
      generatedAt: new Date().toISOString(),
      isFallback: true,
    };
  }

  /**
   * Genera insights profesionales usando IA
   * @param {Object} analysis - Resultado del análisis del motor
   * @param {Object} rawData - Datos originales recolectados
   * @returns {Promise<Object>}
   */
  async generateAIInsights(analysis, rawData) {
    try {
      // Construir contexto con datos REALES
      const context = this.buildAnalysisContext(analysis, rawData);

      // Construir prompt especializado
      const prompt = this.buildAnalysisPrompt(context, analysis);

      // Llamar a la IA
      const insights = await this.callAI(prompt);

      // Parsear respuesta estructurada
      return this.parseAIResponse(insights, analysis);

    } catch (error) {
      console.error('[DeepFinance AI] Error generating insights:', error);
      // Retornar insights básicos si falla la IA
      return this.generateFallbackInsights(analysis);
    }
  }
}

// =====================================================
// FUNCIONES DE EXPORTACIÓN (compatibilidad)
// =====================================================

/**
 * Genera insights profesionales usando IA (función helper)
 * @param {Object} analysis - Resultado del análisis del motor
 * @param {Object} rawData - Datos originales recolectados
 * @returns {Promise<Object>}
 */
export async function generateAIInsights(analysis, rawData) {
  const service = new DeepFinanceAIService();
  return service.generateAIInsights(analysis, rawData);
}

/**
 * Genera recomendaciones personalizadas basadas en el análisis
 * @param {Object} analysis
 * @returns {Array}
 */
export function generateRecommendations(analysis) {
  const recommendations = [];

  // Recomendación basada en puntaje
  if (analysis.score < 40) {
    recommendations.push({
      title: 'Revisar gastos críticos',
      description: 'Tu puntaje financiero indica que hay áreas críticas que requieren atención inmediata. Revisa tus gastos más altos y considera reducirlos.',
      impact: 'alto',
      priority: 1,
    });
  }

  // Recomendación basada en tasa de ahorro
  if (analysis.savingsRate < 0) {
    recommendations.push({
      title: 'Equilibrar ingresos y gastos',
      description: `Estás gastando más de lo que ganas (${Math.abs(analysis.savingsRate).toFixed(1)}% negativo). Es crítico reducir gastos o aumentar ingresos.`,
      impact: 'crítico',
      priority: 1,
    });
  } else if (analysis.savingsRate < 10) {
    recommendations.push({
      title: 'Aumentar tasa de ahorro',
      description: `Tu tasa de ahorro es del ${analysis.savingsRate.toFixed(1)}%. Intenta llegar al menos al 10% para construir un colchón financiero.`,
      impact: 'alto',
      priority: 2,
    });
  }

  // Recomendación basada en presupuestos
  const exceededBudgets = analysis.budgets?.filter(b => b.percentage > 100) || [];
  if (exceededBudgets.length > 0) {
    recommendations.push({
      title: 'Controlar presupuestos excedidos',
      description: `Tienes ${exceededBudgets.length} presupuesto(s) que has excedido. Revisa estas categorías y ajusta tus gastos.`,
      impact: 'medio',
      priority: 3,
    });
  }

  // Recomendación basada en gastos emocionales
  if (analysis.emotional && analysis.emotional.percentage > 30) {
    recommendations.push({
      title: 'Reducir gastos emocionales',
      description: `El ${analysis.emotional.percentage.toFixed(1)}% de tus gastos son emocionales. Identifica estos gastos y considera reducirlos.`,
      impact: 'medio',
      priority: 4,
    });
  }

  // Recomendación basada en patrones
  const increasingPattern = analysis.patterns?.find(p => p.type === 'trend' && p.trend === 'increasing');
  if (increasingPattern) {
    recommendations.push({
      title: 'Revisar tendencia de gastos',
      description: 'Tus gastos han aumentado en los últimos meses. Revisa qué categorías están creciendo y considera ajustarlas.',
      impact: 'medio',
      priority: 3,
    });
  }

  return recommendations;
}

// Exportación default
export default DeepFinanceAIService;
