// ============================================================================
// FUTURE SELF SIMULATOR - Edge Function
// ============================================================================
// Simula cómo estará la vida financiera del usuario en diferentes horizontes
// temporales según su comportamiento actual
// ============================================================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// ============================================================================
// TYPES
// ============================================================================
interface FinancialMetrics {
  current_monthly_income: number;
  current_monthly_expenses: number;
  current_savings: number;
  current_debt: number;
  avg_savings_rate: number;
  non_essential_expenses: number;
}

interface ScenarioProjection {
  projected_income: number;
  projected_expenses: number;
  projected_savings: number;
  projected_debt: number;
  projected_net_worth: number;
  monthly_income: number;
  monthly_expenses: number;
}

interface ScenarioResult {
  scenario_type: string;
  horizon_months: number;
  projection: ScenarioProjection;
  summary_text: string;
  suggested_actions: any[];
}

// ============================================================================
// HELPER: Calcular métricas del usuario
// ============================================================================
async function getUserMetrics(
  supabase: any,
  userId: string,
  monthsBack: number = 6
): Promise<FinancialMetrics> {
  const { data, error } = await supabase.rpc("calculate_user_financial_metrics", {
    p_user_id: userId,
    p_months_back: monthsBack,
  });

  if (error) throw error;

  return {
    current_monthly_income: data.current_monthly_income || 0,
    current_monthly_expenses: data.current_monthly_expenses || 0,
    current_savings: data.current_savings || 0,
    current_debt: data.current_debt || 0,
    avg_savings_rate: data.avg_savings_rate || 0,
    non_essential_expenses: data.non_essential_expenses || 0,
  };
}

// ============================================================================
// HELPER: Calcular proyección de escenario
// ============================================================================
async function calculateProjection(
  supabase: any,
  metrics: FinancialMetrics,
  horizonMonths: number,
  scenarioType: string
): Promise<ScenarioProjection> {
  const { data, error } = await supabase.rpc("calculate_scenario_projection", {
    p_metrics: metrics,
    p_horizon_months: horizonMonths,
    p_scenario_type: scenarioType,
  });

  if (error) throw error;

  return {
    projected_income: data.projected_income || 0,
    projected_expenses: data.projected_expenses || 0,
    projected_savings: data.projected_savings || 0,
    projected_debt: data.projected_debt || 0,
    projected_net_worth: data.projected_net_worth || 0,
    monthly_income: data.monthly_income || 0,
    monthly_expenses: data.monthly_expenses || 0,
  };
}

// ============================================================================
// HELPER: Obtener insights de gastos reales desde la base de datos
// ============================================================================
async function getSpendingInsights(
  supabase: any,
  userId: string,
  monthsBack: number = 3
): Promise<any> {
  try {
    const { data, error } = await supabase.rpc("get_spending_insights", {
      p_user_id: userId,
      p_months_back: monthsBack,
    });

    if (error) {
      console.error("⚠️ Error obteniendo spending insights:", error);
      return null;
    }

    return data;
  } catch (err) {
    console.error("⚠️ Excepción obteniendo spending insights:", err);
    return null;
  }
}

// ============================================================================
// HELPER: Generar recomendaciones personalizadas basadas en insights reales
// ============================================================================
function generatePersonalizedRecommendations(
  insights: any,
  monthlyIncome: number
): any[] {
  if (!insights) {
    console.log("⚠️ No hay insights disponibles para generar recomendaciones");
    return [];
  }

  if (monthlyIncome === 0 || isNaN(monthlyIncome) || monthlyIncome < 100) {
    console.log(`⚠️ Ingresos mensuales inválidos: ${monthlyIncome}`);
    return [];
  }

  const recommendations: any[] = [];

  // 1. Usar oportunidades de ahorro (las más relevantes)
  const savingOpportunities = insights.saving_opportunities || [];
  savingOpportunities.forEach((opp: any) => {
    if (!opp.category || opp.category === "Sin categoría") return;
    
    const categoryName = opp.category;
    const currentMonthly = Number(opp.current_monthly) || 0;
    const reduction = Number(opp.recommended_reduction) || 0.1;
    const estimatedSaving = Number(opp.estimated_saving) || 0;
    const impactLevel = opp.impact_level || "medio";

    if (currentMonthly < 100 || estimatedSaving < 100) return;

    const percentage = (currentMonthly / monthlyIncome) * 100;

    // Solo incluir si es significativo (>3% de ingresos)
    if (percentage < 3) return;

    let description = "";
    if (impactLevel === "alto" && reduction >= 0.20) {
      description = `Reducir gastos en ${categoryName} en un ${Math.round(reduction * 100)}% podría ahorrarte ${formatCurrency(estimatedSaving)}/mes. Actualmente gastas ${formatCurrency(currentMonthly)} mensuales en esta categoría.`;
    } else if (impactLevel === "medio" && reduction >= 0.15) {
      description = `Optimizar tus compras de ${categoryName} (reducción del ${Math.round(reduction * 100)}%) puede liberar ${formatCurrency(estimatedSaving)} al mes.`;
    } else {
      description = `Revisa tus gastos en ${categoryName}. Un ajuste moderado puede ahorrarte aproximadamente ${formatCurrency(estimatedSaving)} mensuales.`;
    }

    recommendations.push({
      action: `optimize_${categoryName.toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "")}`,
      impact: Math.round(estimatedSaving),
      description: description,
      category: categoryName,
      impact_level: impactLevel,
      current_monthly: Math.round(currentMonthly),
      reduction_percentage: Math.round(reduction * 100),
    });
  });

  // 2. Si hay top categorías muy altas, agregar recomendaciones adicionales
  const topCategories = insights.top_categories || [];
  const processedCategories = new Set(
    savingOpportunities.map((opp: any) => opp.category)
  );

  topCategories.forEach((cat: any) => {
    const categoryName = cat.category;
    if (
      !categoryName ||
      categoryName === "Sin categoría" ||
      processedCategories.has(categoryName)
    )
      return;

    const monthlyAvg = Number(cat.monthly_average) || 0;
    const percentage = Number(cat.percentage_of_expenses) || 0;

    // Solo incluir si es >15% de gastos totales y no está ya en oportunidades
    if (percentage > 15 && monthlyAvg > 0) {
      const savings15 = Math.round(monthlyAvg * 0.15);
      recommendations.push({
        action: `review_${categoryName.toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "")}`,
        impact: savings15,
        description: `Tu categoría más alta esta semana es ${categoryName}: ${formatCurrency(monthlyAvg)}/mes (${percentage.toFixed(1)}% de tus gastos). Considera revisar esta área para identificar oportunidades de ahorro.`,
        category: categoryName,
        impact_level: "medio",
        current_monthly: Math.round(monthlyAvg),
        reduction_percentage: 15,
      });
    }
  });

  // Ordenar por impacto y limitar a 5
  const sorted = recommendations
    .sort((a, b) => b.impact - a.impact)
    .slice(0, 5);

  console.log(`💡 Generadas ${sorted.length} recomendaciones personalizadas basadas en datos reales`);
  if (sorted.length > 0) {
    console.log(
      `📝 Recomendaciones:`,
      sorted.map((r) => `${r.category}: ${r.description}`)
    );
  }

  return sorted;
}

// ============================================================================
// HELPER: Formatear moneda (función auxiliar)
// ============================================================================
function formatCurrency(amount: number): string {
  const num = Math.round(amount || 0);
  return `$${num.toLocaleString("es-CL")}`;
}

// ============================================================================
// HELPER: Generar resumen con IA
// ============================================================================
async function generateAISummary(
  metrics: FinancialMetrics,
  projection: ScenarioProjection,
  scenarioType: string,
  horizonMonths: number,
  personalizedAdvice: any[] = [],
  insights?: any
): Promise<{ summary: string; actions: any[] }> {
  const scenarioNames: { [key: string]: string } = {
    current_trend: "continuar con tus hábitos actuales",
    improved: "mejorar tus hábitos financieros",
    worst_case: "un escenario más desafiante",
  };

  const scenarioName = scenarioNames[scenarioType] || scenarioType;

  // Construir prompt para IA
  const prompt = buildAIPrompt(metrics, projection, scenarioType, horizonMonths, personalizedAdvice);

  // Intentar llamar a IA con fallback
  try {
    const aiResponse = await callAIWithFallback(prompt);
    return {
      summary: aiResponse.summary || generateDefaultSummary(metrics, projection, scenarioType, horizonMonths, insights),
      actions: aiResponse.actions || [],
    };
  } catch (error) {
    console.error("Error calling AI:", error);
    return {
      summary: generateDefaultSummary(metrics, projection, scenarioType, horizonMonths, insights),
      actions: personalizedAdvice.length > 0 ? personalizedAdvice : [],
    };
  }
}

// ============================================================================
// HELPER: Construir prompt para IA
// ============================================================================
function buildAIPrompt(
  metrics: FinancialMetrics,
  projection: ScenarioProjection,
  scenarioType: string,
  horizonMonths: number,
  personalizedAdvice: any[] = []
): string {
  const scenarioDescriptions: { [key: string]: string } = {
    current_trend:
      "El usuario continúa con sus hábitos financieros actuales sin cambios.",
    improved:
      "El usuario reduce sus gastos no esenciales en un 30% y mejora su tasa de ahorro.",
    worst_case:
      "El usuario enfrenta una reducción del 15% en ingresos y un aumento del 10% en gastos.",
  };

  return `
Eres un asesor financiero motivacional y empático. Tu trabajo es explicar en 2-3 frases cómo estará la situación financiera del usuario en ${horizonMonths} meses.

SITUACIÓN ACTUAL:
- Ingresos mensuales: $${metrics.current_monthly_income.toLocaleString()}
- Gastos mensuales: $${metrics.current_monthly_expenses.toLocaleString()}
- Ahorros actuales: $${metrics.current_savings.toLocaleString()}
- Deuda actual: $${metrics.current_debt.toLocaleString()}
- Tasa de ahorro: ${metrics.avg_savings_rate.toFixed(1)}%

ESCENARIO: ${scenarioDescriptions[scenarioType]}

PROYECCIÓN EN ${horizonMonths} MESES:
- Ahorros proyectados: $${projection.projected_savings.toLocaleString()}
- Patrimonio neto: $${projection.projected_net_worth.toLocaleString()}
- Deuda proyectada: $${projection.projected_debt.toLocaleString()}

Genera un texto motivacional de 2-3 frases que:
1. Explique claramente la situación proyectada
2. Sea empático y alentador (no alarmista)
3. Incluya sugerencias concretas si es el escenario "improved"
4. Use un tono positivo pero realista

${personalizedAdvice.length > 0 ? `
RECOMENDACIONES PERSONALIZADAS BASADAS EN GASTOS REALES DEL USUARIO:
${personalizedAdvice.map(a => `- ${a.description}`).join('\n')}

Usa SOLO estas recomendaciones en tu respuesta JSON. NO inventes recomendaciones sobre categorías que no aparecen arriba.
` : ''}

${personalizedAdvice.length > 0 ? `
⚠️ REGLA CRÍTICA ABSOLUTA: El usuario tiene transacciones reales. DEBES usar SOLO estas recomendaciones:

RECOMENDACIONES PERSONALIZADAS (BASADAS EN GASTOS REALES DEL USUARIO):
${personalizedAdvice.map(a => `- ${a.description}`).join('\n')}

PROHIBIDO ABSOLUTAMENTE:
- ❌ NO inventes recomendaciones sobre categorías que NO aparecen arriba
- ❌ NO menciones "delivery", "comida rápida", "restaurantes", "suscripciones" u otras categorías si NO están en la lista
- ❌ NO generes recomendaciones genéricas
- ❌ NO uses ejemplos como "reducir delivery" o "menos comida rápida" a menos que estén en la lista de arriba
- ❌ NO generes acciones con description que contenga "delivery", "8 veces", "veces/mes" a menos que esté en la lista
- ❌ Si no hay recomendaciones personalizadas arriba, significa que el usuario NO tiene gastos significativos en esas categorías

OBLIGATORIO:
- ✅ Usa SOLO las recomendaciones de la lista de arriba en tu respuesta JSON
- ✅ Si la lista está vacía, NO generes recomendaciones en el campo "actions"
- ✅ El campo "actions" debe ser un array vacío [] si no hay recomendaciones arriba
- ✅ Copia EXACTAMENTE las recomendaciones de arriba, NO las reescribas ni las modifiques
` : `
⚠️ IMPORTANTE: El usuario NO tiene suficientes transacciones para recomendaciones personalizadas.

PROHIBIDO ABSOLUTAMENTE:
- ❌ NO generes recomendaciones genéricas sobre "delivery", "comida rápida", "restaurantes", "suscripciones" u otras categorías
- ❌ NO inventes categorías específicas
- ❌ NO generes recomendaciones si no hay datos reales que los respalden
- ❌ NO uses ejemplos de categorías comunes como "delivery" o "comida rápida"

OBLIGATORIO:
- ✅ En el campo "actions" del JSON, devuelve un array vacío []
- ✅ El sistema mostrará un mensaje informativo al usuario si es necesario
- ✅ Solo menciona que necesita agregar más transacciones para obtener recomendaciones personalizadas
`}

Formato de respuesta JSON:
{
  "summary": "Texto motivacional aquí...",
  "actions": ${personalizedAdvice.length > 0 
    ? `[\n    ${personalizedAdvice.map(a => JSON.stringify(a)).join(',\n    ')}\n  ]`
    : '[]'
  }
}
`.trim();
}

// ============================================================================
// HELPER: Llamar a IA con fallback
// ============================================================================
async function callAIWithFallback(prompt: string): Promise<any> {
  const models = [
    { name: "deepseek-r1", url: "https://api.deepseek.com/v1/chat/completions", key: "DEEPSEEK_API_KEY" },
    { name: "qwen-plus", url: "https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation", key: "QWEN_API_KEY" },
    { name: "gpt-4o-mini", url: "https://api.openai.com/v1/chat/completions", key: "OPENAI_API_KEY" },
  ];

  for (const model of models) {
    try {
      const apiKey = Deno.env.get(model.key);
      if (!apiKey) continue;

      const response = await fetch(model.url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: model.name === "gpt-4o-mini" ? "gpt-4o-mini" : model.name,
          messages: [
            {
              role: "system",
              content:
                "Eres un asesor financiero motivacional. Responde SOLO con JSON válido, sin texto adicional.",
            },
            { role: "user", content: prompt },
          ],
          temperature: 0.7,
          max_tokens: 500,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const content = data.choices?.[0]?.message?.content || data.output?.text || "";
        const parsed = JSON.parse(content);
        return { ...parsed, ai_model_used: model.name };
      }
    } catch (error) {
      console.error(`Error with ${model.name}:`, error);
      continue;
    }
  }

  throw new Error("All AI models failed");
}

// ============================================================================
// HELPER: Generar resumen por defecto (sin IA) basado en datos reales
// ============================================================================
function generateDefaultSummary(
  metrics: FinancialMetrics,
  projection: ScenarioProjection,
  scenarioType: string,
  horizonMonths: number,
  insights?: any
): string {
  const netWorth = projection.projected_net_worth || 0;
  const savings = projection.projected_savings || 0;
  const isPositive = netWorth >= 0;
  
  // Obtener top categoría si hay insights
  const topCategory = insights?.top_categories?.[0];
  const topCategoryName = topCategory?.category || null;
  const topCategoryPercentage = topCategory?.percentage_of_expenses || 0;

  const scenarioTexts: { [key: string]: string } = {
    current_trend: topCategoryName && topCategoryPercentage > 15
      ? `Si continúas con tus hábitos actuales, en ${horizonMonths} meses podrías tener aproximadamente $${netWorth.toLocaleString()} en patrimonio neto. Actualmente, ${topCategoryName} representa el ${topCategoryPercentage.toFixed(1)}% de tus gastos.`
      : `Si continúas con tus hábitos actuales, en ${horizonMonths} meses podrías tener aproximadamente $${netWorth.toLocaleString()} en patrimonio neto.`,
    
    improved: topCategoryName && topCategoryPercentage > 10
      ? `Si optimizas tus gastos y mejoras tus hábitos financieros, especialmente en categorías como ${topCategoryName}, en ${horizonMonths} meses podrías alcanzar aproximadamente $${netWorth.toLocaleString()} en patrimonio neto.`
      : `Si mejoras tus hábitos financieros reduciendo gastos no esenciales, en ${horizonMonths} meses podrías alcanzar aproximadamente $${netWorth.toLocaleString()} en patrimonio neto.`,
    
    worst_case: `En un escenario más desafiante donde tus gastos aumentan o ingresos disminuyen, en ${horizonMonths} meses tu patrimonio neto podría ser de aproximadamente $${netWorth.toLocaleString()}.`,
  };

  return scenarioTexts[scenarioType] || scenarioTexts.current_trend;
}

// ============================================================================
// MAIN HANDLER
// ============================================================================
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parse request
    const { user_id, horizon_months = 12, force_recalculate = false } = await req.json();

    if (!user_id) {
      return new Response(
        JSON.stringify({ error: "user_id is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (![3, 6, 12, 24].includes(horizon_months)) {
      return new Response(
        JSON.stringify({ error: "horizon_months must be 3, 6, 12, or 24" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`🔮 Calculating future scenarios for user: ${user_id}, horizon: ${horizon_months} months`);

    // 1. Obtener métricas actuales del usuario
    const metrics = await getUserMetrics(supabase, user_id, 6);
    console.log("📊 User metrics:", metrics);

    // 1.5. Obtener insights de gastos reales desde la base de datos
    // IMPORTANTE: Usar la función SQL get_spending_insights para obtener datos reales y personalizados
    console.log("📊 Obteniendo insights de gastos reales desde la BD...");
    const spendingInsights = await getSpendingInsights(supabase, user_id, 3);
    
    if (spendingInsights) {
      console.log(`✅ Insights obtenidos:`);
      console.log(`   - Top categorías: ${spendingInsights.top_categories?.length || 0}`);
      console.log(`   - Oportunidades de ahorro: ${spendingInsights.saving_opportunities?.length || 0}`);
      console.log(`   - Servicios recurrentes: ${spendingInsights.recurring_services?.length || 0}`);
    } else {
      console.warn("⚠️ No se pudieron obtener insights de gastos. Se usarán datos mínimos.");
    }

    // 2. Calcular los 3 escenarios
    const scenarios: ScenarioResult[] = [];
    const scenarioTypes = ["current_trend", "improved", "worst_case"];

    // Generar recomendaciones personalizadas UNA VEZ para todos los escenarios
    // Esto asegura que se basen en datos reales de la BD, no en textos genéricos
    const personalizedRecommendations = generatePersonalizedRecommendations(
      spendingInsights,
      metrics.current_monthly_income
    );
    console.log(`💡 Recomendaciones personalizadas generadas: ${personalizedRecommendations.length}`);
    if (personalizedRecommendations.length > 0) {
      console.log("📝 Recomendaciones:", personalizedRecommendations.map(r => r.description));
    } else {
      console.warn("⚠️ No se generaron recomendaciones personalizadas. El usuario puede no tener suficientes gastos categorizados.");
    }

    for (const scenarioType of scenarioTypes) {
      // SIEMPRE recalcular si force_recalculate = true (botón "Recalcular")
      // Eliminar cache existente para forzar regeneración con datos reales
      if (force_recalculate) {
        console.log(`🗑️ Limpiando cache para ${scenarioType} (force_recalculate = true)`);
        // Eliminar escenarios existentes para forzar recálculo
        await supabase
          .from("future_self_scenarios")
          .delete()
          .eq("user_id", user_id)
          .eq("horizon_months", horizon_months)
          .eq("scenario_type", scenarioType);
      } else {
        // Solo usar cache si NO se fuerza recálculo Y hay cache válido
        const { data: existing } = await supabase
          .from("future_self_scenarios")
          .select("*")
          .eq("user_id", user_id)
          .eq("horizon_months", horizon_months)
          .eq("scenario_type", scenarioType)
          .single();

        if (existing) {
          // Solo usar cache si tiene recomendaciones personalizadas válidas (basadas en datos reales)
          // Verificar que NO sean consejos genéricos
          const hasValidPersonalizedRecommendations = 
            existing.suggested_actions && 
            Array.isArray(existing.suggested_actions) &&
            existing.suggested_actions.length > 0 &&
            existing.suggested_actions.some((a: any) => a.category && a.impact_level && !a.requires_data);
          
          // Verificar que NO contenga textos genéricos prohibidos
          const hasGenericText = existing.suggested_actions?.some((a: any) => {
            const desc = (a.description || "").toLowerCase();
            return desc.includes("delivery") || 
                   desc.includes("comida rápida") || 
                   (a.category && a.category.toLowerCase().includes("delivery"));
          });

          if (hasValidPersonalizedRecommendations && !hasGenericText) {
            console.log(`✅ Using cached scenario with personalized recommendations: ${scenarioType}`);
            scenarios.push({
              scenario_type: scenarioType,
              horizon_months: horizon_months,
              projection: {
                projected_income: existing.projected_income,
                projected_expenses: existing.projected_expenses,
                projected_savings: existing.projected_savings,
                projected_debt: existing.projected_debt,
                projected_net_worth: existing.projected_net_worth,
                monthly_income: existing.projected_income / horizon_months,
                monthly_expenses: existing.projected_expenses / horizon_months,
              },
              summary_text: existing.summary_text,
              suggested_actions: existing.suggested_actions || [],
            });
            continue;
          } else {
            console.log(`🔄 Cache inválido (consejos genéricos o sin datos reales), regenerando: ${scenarioType}`);
            // Eliminar cache inválido
            await supabase
              .from("future_self_scenarios")
              .delete()
              .eq("user_id", user_id)
              .eq("horizon_months", horizon_months)
              .eq("scenario_type", scenarioType);
          }
        }
      }

      // Calcular proyección
      const projection = await calculateProjection(supabase, metrics, horizon_months, scenarioType);
      console.log(`📈 Projection for ${scenarioType}:`, projection);

      // Generar resumen con IA (usando recomendaciones personalizadas si existen)
      // IMPORTANTE: Si hay recomendaciones personalizadas, la IA NO debe generar consejos genéricos
      const { summary, actions } = await generateAISummary(
        metrics, 
        projection, 
        scenarioType, 
        horizon_months,
        personalizedRecommendations,
        spendingInsights
      );
      
      // POLÍTICA ESTRICTA: SOLO recomendaciones personalizadas basadas en datos reales
      // NUNCA mostrar consejos genéricos como "delivery", "comida rápida", etc.
      let finalActions: any[] = [];
      
      if (personalizedRecommendations.length > 0) {
        // Usar SOLO recomendaciones personalizadas basadas en datos reales de la BD
        // FILTRAR cualquier acción que contenga texto genérico prohibido
        finalActions = personalizedRecommendations.filter((action: any) => {
          const desc = (action.description || "").toLowerCase();
          const category = (action.category || "").toLowerCase();
          // Eliminar acciones genéricas que no están basadas en datos reales
          const hasGenericText = desc.includes("delivery") && !category.includes("delivery") ||
                                 desc.includes("8 veces") ||
                                 desc.includes("veces/mes") && !desc.includes("reducir gastos");
          return !hasGenericText;
        });
        console.log(`✅ Usando ${finalActions.length} recomendaciones personalizadas REALES para ${scenarioType}`);
        if (personalizedRecommendations.length !== finalActions.length) {
          console.warn(`⚠️ Se filtraron ${personalizedRecommendations.length - finalActions.length} recomendaciones genéricas`);
        }
      } else {
        // NO hay datos suficientes para recomendaciones personalizadas
        // En lugar de consejos genéricos, mostrar mensaje claro y neutro
        finalActions = [];
        console.log(`⚠️ Sin datos suficientes para ${scenarioType}. No se mostrarán recomendaciones genéricas.`);
      }
      
      // FILTRAR acciones que vengan de la IA pero contengan texto genérico
      if (actions && Array.isArray(actions) && actions.length > 0) {
        const filteredAIActions = actions.filter((action: any) => {
          const desc = (action.description || "").toLowerCase();
          // Si la acción de la IA contiene texto genérico prohibido, ignorarla
          return !desc.includes("delivery") && 
                 !desc.includes("8 veces") && 
                 !desc.includes("veces/mes");
        });
        
        // Si hay acciones de IA válidas Y no hay recomendaciones personalizadas, usarlas
        if (filteredAIActions.length > 0 && finalActions.length === 0) {
          finalActions = filteredAIActions;
          console.log(`✅ Usando ${finalActions.length} acciones de IA válidas para ${scenarioType}`);
        } else if (filteredAIActions.length < actions.length) {
          console.warn(`⚠️ Se filtraron ${actions.length - filteredAIActions.length} acciones genéricas de la IA`);
        }
      }

      // Guardar en BD
      const { data: saved, error: saveError } = await supabase
        .from("future_self_scenarios")
        .upsert({
          user_id,
          horizon_months,
          scenario_type: scenarioType,
          projected_savings: projection.projected_savings,
          projected_debt: projection.projected_debt,
          projected_income: projection.projected_income,
          projected_expenses: projection.projected_expenses,
          projected_net_worth: projection.projected_net_worth,
          summary_text: summary,
          suggested_actions: finalActions,
          input_metrics: metrics,
          calculated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (saveError) {
        console.error(`Error saving scenario ${scenarioType}:`, saveError);
      }

      scenarios.push({
        scenario_type: scenarioType,
        horizon_months: horizon_months,
        projection,
        summary_text: summary,
        suggested_actions: finalActions,
      });
    }

    console.log("✅ All scenarios calculated");

    // 3. Respuesta
    return new Response(
      JSON.stringify({
        success: true,
        user_id,
        horizon_months,
        current_metrics: metrics,
        scenarios,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("❌ Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});


