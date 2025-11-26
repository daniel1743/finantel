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
// HELPER: Generar resumen con IA
// ============================================================================
async function generateAISummary(
  metrics: FinancialMetrics,
  projection: ScenarioProjection,
  scenarioType: string,
  horizonMonths: number
): Promise<{ summary: string; actions: any[] }> {
  const scenarioNames: { [key: string]: string } = {
    current_trend: "continuar con tus hábitos actuales",
    improved: "mejorar tus hábitos financieros",
    worst_case: "un escenario más desafiante",
  };

  const scenarioName = scenarioNames[scenarioType] || scenarioType;

  // Construir prompt para IA
  const prompt = buildAIPrompt(metrics, projection, scenarioType, horizonMonths);

  // Intentar llamar a IA con fallback
  try {
    const aiResponse = await callAIWithFallback(prompt);
    return {
      summary: aiResponse.summary || generateDefaultSummary(metrics, projection, scenarioType, horizonMonths),
      actions: aiResponse.actions || [],
    };
  } catch (error) {
    console.error("Error calling AI:", error);
    return {
      summary: generateDefaultSummary(metrics, projection, scenarioType, horizonMonths),
      actions: [],
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
  horizonMonths: number
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

Formato de respuesta JSON:
{
  "summary": "Texto motivacional aquí...",
  "actions": [
    {"action": "reduce_delivery", "impact": 50000, "description": "Reducir delivery a 8 veces/mes ahorraría $50,000/mes"}
  ]
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
// HELPER: Generar resumen por defecto (sin IA)
// ============================================================================
function generateDefaultSummary(
  metrics: FinancialMetrics,
  projection: ScenarioProjection,
  scenarioType: string,
  horizonMonths: number
): string {
  const scenarioTexts: { [key: string]: string } = {
    current_trend: `Si continúas con tus hábitos actuales, en ${horizonMonths} meses podrías tener aproximadamente $${projection.projected_net_worth.toLocaleString()} en patrimonio neto.`,
    improved: `Si mejoras tus hábitos financieros reduciendo gastos no esenciales, en ${horizonMonths} meses podrías alcanzar aproximadamente $${projection.projected_net_worth.toLocaleString()} en patrimonio neto.`,
    worst_case: `En un escenario más desafiante, en ${horizonMonths} meses tu patrimonio neto podría ser de aproximadamente $${projection.projected_net_worth.toLocaleString()}.`,
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

    // 2. Calcular los 3 escenarios
    const scenarios: ScenarioResult[] = [];
    const scenarioTypes = ["current_trend", "improved", "worst_case"];

    for (const scenarioType of scenarioTypes) {
      // Verificar si ya existe (y no forzar recálculo)
      if (!force_recalculate) {
        const { data: existing } = await supabase
          .from("future_self_scenarios")
          .select("*")
          .eq("user_id", user_id)
          .eq("horizon_months", horizon_months)
          .eq("scenario_type", scenarioType)
          .single();

        if (existing) {
          console.log(`✅ Using cached scenario: ${scenarioType}`);
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
        }
      }

      // Calcular proyección
      const projection = await calculateProjection(supabase, metrics, horizon_months, scenarioType);
      console.log(`📈 Projection for ${scenarioType}:`, projection);

      // Generar resumen con IA
      const { summary, actions } = await generateAISummary(metrics, projection, scenarioType, horizon_months);

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
          suggested_actions: actions,
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
        suggested_actions: actions,
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

