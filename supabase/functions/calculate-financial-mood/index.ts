// ============================================================================
// FINANCIAL MOOD ENGINE - Edge Function
// ============================================================================
// Analiza patrones de transacciones y calcula el "estado emocional financiero"
// del usuario, generando insights y alertas.
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
interface Transaction {
  id: string;
  user_id: string;
  amount: number;
  description: string;
  category_id: string;
  type: "income" | "expense";
  necessity_level: "essential" | "important" | "discretionary";
  date: string;
  created_at: string;
  categories?: {
    name: string;
  };
}

interface Budget {
  id: string;
  category_id: string;
  amount: number;
  spent?: number;
}

interface MoodMetrics {
  total_transactions: number;
  impulse_percentage: number;
  budget_compliance: number;
  week_over_week_change: number;
  avg_transaction_value: number;
  late_night_transactions: number;
  weekend_spending_ratio: number;
  saving_rate: number;
  week_over_week_volatility: number;
  max_category_percentage: number;
  frugal_days_streak: number;
}

interface MoodReason {
  factor: string;
  impact: number;
  description: string;
}

interface Alert {
  type: string;
  severity: "low" | "medium" | "high";
  message: string;
}

// ============================================================================
// HELPER: Calculate metrics from transactions
// ============================================================================
function calculateMetrics(
  transactions: Transaction[],
  budgets: Budget[],
  previousWeekTransactions: Transaction[]
): MoodMetrics {
  const now = new Date();
  const expenses = transactions.filter((t) => t.type === "expense");
  const incomes = transactions.filter((t) => t.type === "income");

  // 1. Total transactions
  const total_transactions = transactions.length;

  // 2. Impulse percentage (gastos discrecionales)
  const impulseTransactions = expenses.filter(
    (t) => t.necessity_level === "discretionary"
  );
  const impulse_percentage =
    expenses.length > 0
      ? (impulseTransactions.length / expenses.length) * 100
      : 0;

  // 3. Budget compliance
  let budget_compliance = 100;
  if (budgets.length > 0) {
    const compliantBudgets = budgets.filter(
      (b) => (b.spent || 0) <= b.amount
    );
    budget_compliance = (compliantBudgets.length / budgets.length) * 100;
  }

  // 4. Week over week change
  const currentWeekTotal = expenses.reduce((sum, t) => sum + t.amount, 0);
  const previousWeekTotal = previousWeekTransactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const week_over_week_change =
    previousWeekTotal > 0
      ? ((currentWeekTotal - previousWeekTotal) / previousWeekTotal) * 100
      : 0;

  // 5. Average transaction value
  const avg_transaction_value =
    expenses.length > 0
      ? expenses.reduce((sum, t) => sum + t.amount, 0) / expenses.length
      : 0;

  // 6. Late night transactions (11pm - 4am)
  const late_night_transactions = expenses.filter((t) => {
    const hour = new Date(t.created_at).getHours();
    return hour >= 23 || hour <= 4;
  }).length;

  // 7. Weekend spending ratio
  const weekendTransactions = expenses.filter((t) => {
    const day = new Date(t.date).getDay();
    return day === 0 || day === 6; // Domingo o Sábado
  });
  const weekend_spending_ratio =
    expenses.length > 0 ? weekendTransactions.length / expenses.length : 0;

  // 8. Saving rate
  const totalIncome = incomes.reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = expenses.reduce((sum, t) => sum + t.amount, 0);
  const saving_rate =
    totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome) * 100 : 0;

  // 9. Week volatility (desviación estándar por semana)
  const week_over_week_volatility = Math.abs(week_over_week_change);

  // 10. Max category percentage
  const categoryTotals: { [key: string]: number } = {};
  expenses.forEach((t) => {
    const catName = t.categories?.name || "Otros";
    categoryTotals[catName] = (categoryTotals[catName] || 0) + t.amount;
  });
  const maxCategoryAmount = Math.max(...Object.values(categoryTotals), 0);
  const max_category_percentage =
    totalExpense > 0 ? (maxCategoryAmount / totalExpense) * 100 : 0;

  // 11. Frugal days streak (días consecutivos sin gastos discrecionales)
  let frugal_days_streak = 0;
  const sortedTransactions = [...transactions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  for (const tx of sortedTransactions) {
    if (tx.type === "expense" && tx.necessity_level === "discretionary") {
      break;
    }
    if (tx.type === "expense") {
      const txDate = new Date(tx.date).toDateString();
      const prevDate = new Date(now);
      prevDate.setDate(prevDate.getDate() - frugal_days_streak);
      if (txDate === prevDate.toDateString()) {
        frugal_days_streak++;
      }
    }
  }

  return {
    total_transactions,
    impulse_percentage: Math.round(impulse_percentage * 10) / 10,
    budget_compliance: Math.round(budget_compliance * 10) / 10,
    week_over_week_change: Math.round(week_over_week_change * 10) / 10,
    avg_transaction_value: Math.round(avg_transaction_value),
    late_night_transactions,
    weekend_spending_ratio: Math.round(weekend_spending_ratio * 100) / 100,
    saving_rate: Math.round(saving_rate * 10) / 10,
    week_over_week_volatility: Math.round(week_over_week_volatility * 10) / 10,
    max_category_percentage: Math.round(max_category_percentage * 10) / 10,
    frugal_days_streak,
  };
}

// ============================================================================
// HELPER: Apply rules and calculate score
// ============================================================================
function applyRules(
  metrics: MoodMetrics,
  rules: any[]
): { score: number; reasons: MoodReason[] } {
  let baseScore = 70; // Score base neutral
  const reasons: MoodReason[] = [];

  for (const rule of rules) {
    if (!rule.is_active) continue;

    const condition = rule.condition_json;
    const metricValue = metrics[condition.metric as keyof MoodMetrics];

    if (metricValue === undefined) continue;

    let conditionMet = false;

    // Evaluar condición
    switch (condition.operator) {
      case "greater_than":
        conditionMet = metricValue > condition.threshold;
        break;
      case "less_than":
        conditionMet = metricValue < condition.threshold;
        break;
      case "equals":
        conditionMet = metricValue === condition.threshold;
        break;
      case "between":
        conditionMet =
          metricValue >= condition.min && metricValue <= condition.max;
        break;
    }

    if (conditionMet) {
      const impact = condition.impact * (rule.weight || 1);
      baseScore += impact;

      reasons.push({
        factor: condition.metric,
        impact: Math.round(impact),
        description: condition.message.replace(
          "{value}",
          metricValue.toString()
        ).replace(
          "{threshold}",
          condition.threshold?.toString() || ""
        ),
      });
    }
  }

  // Clamp score entre 0-100
  const finalScore = Math.max(0, Math.min(100, baseScore));

  return {
    score: Math.round(finalScore * 100) / 100,
    reasons: reasons.sort((a, b) => Math.abs(b.impact) - Math.abs(a.impact)),
  };
}

// ============================================================================
// HELPER: Generate alerts
// ============================================================================
function generateAlerts(
  metrics: MoodMetrics,
  score: number,
  budgets: Budget[]
): Alert[] {
  const alerts: Alert[] = [];

  // Alert 1: Score bajo
  if (score < 40) {
    alerts.push({
      type: "low_mood_score",
      severity: "high",
      message: `Tu salud financiera está en ${score}/100. Es momento de revisar tus gastos.`,
    });
  }

  // Alert 2: Gastos impulsivos muy altos
  if (metrics.impulse_percentage > 50) {
    alerts.push({
      type: "impulse_spike",
      severity: "high",
      message: `${metrics.impulse_percentage}% de tus gastos son impulsivos. Considera reducir gastos innecesarios.`,
    });
  }

  // Alert 3: Presupuestos excedidos
  const exceededBudgets = budgets.filter((b) => (b.spent || 0) > b.amount);
  if (exceededBudgets.length > 0) {
    alerts.push({
      type: "budget_exceeded",
      severity: "medium",
      message: `Has excedido ${exceededBudgets.length} presupuesto(s). Revisa tus límites.`,
    });
  }

  // Alert 4: Aumento drástico de gastos
  if (metrics.week_over_week_change > 40) {
    alerts.push({
      type: "spending_spike",
      severity: "medium",
      message: `Tus gastos aumentaron ${metrics.week_over_week_change}% esta semana. ¿Todo bien?`,
    });
  }

  // Alert 5: Muchas transacciones nocturnas (posible gasto emocional)
  if (metrics.late_night_transactions > 8) {
    alerts.push({
      type: "emotional_spending",
      severity: "low",
      message: `Detectamos ${metrics.late_night_transactions} compras nocturnas. ¿Compras por impulso?`,
    });
  }

  // Alert 6: No estás ahorrando
  if (metrics.saving_rate < 0) {
    alerts.push({
      type: "negative_savings",
      severity: "high",
      message: `Estás gastando más de lo que ganas. Tasa de ahorro: ${metrics.saving_rate}%`,
    });
  }

  return alerts;
}

// ============================================================================
// HELPER: Determine mood label
// ============================================================================
function determineMoodLabel(score: number, metrics: MoodMetrics): string {
  if (score >= 85 && metrics.saving_rate > 20) return "modo_ahorro";
  if (score >= 80 && metrics.budget_compliance > 90) return "disciplinado";
  if (score >= 65) return "estable";
  if (score >= 50) return "calmado";
  if (score >= 35 && metrics.impulse_percentage > 40) return "impulsivo";
  if (score >= 35) return "estresado";
  if (score >= 20) return "descontrolado";
  return "recuperacion";
}

// ============================================================================
// HELPER: Determine trend
// ============================================================================
function determineTrend(currentScore: number, previousScore: number | null): string {
  if (previousScore === null) return "unknown";
  const diff = currentScore - previousScore;
  if (diff > 5) return "improving";
  if (diff < -5) return "declining";
  return "stable";
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
    const { user_id, force_recalculate } = await req.json();

    if (!user_id) {
      return new Response(
        JSON.stringify({ error: "user_id is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`📊 Calculating mood for user: ${user_id}`);

    // Definir período de análisis (últimas 4 semanas)
    const now = new Date();
    const periodEnd = now.toISOString().split("T")[0];
    const periodStart = new Date(now.setDate(now.getDate() - 28))
      .toISOString()
      .split("T")[0];

    // Período anterior (para comparación)
    const prevPeriodEnd = new Date(now.setDate(now.getDate() - 7))
      .toISOString()
      .split("T")[0];
    const prevPeriodStart = new Date(now.setDate(now.getDate() - 7))
      .toISOString()
      .split("T")[0];

    // 1. Obtener transacciones del período
    const { data: transactions, error: txError } = await supabase
      .from("transactions")
      .select("*, categories(name)")
      .eq("user_id", user_id)
      .gte("date", periodStart)
      .lte("date", periodEnd)
      .order("date", { ascending: false });

    if (txError) throw txError;

    // 2. Obtener transacciones de semana anterior (para comparación)
    const { data: prevTransactions } = await supabase
      .from("transactions")
      .select("*")
      .eq("user_id", user_id)
      .gte("date", prevPeriodStart)
      .lte("date", prevPeriodEnd);

    // 3. Obtener presupuestos activos
    const { data: budgets } = await supabase
      .from("budgets")
      .select("*")
      .eq("user_id", user_id)
      .eq("period", "monthly");

    // 4. Obtener reglas activas
    const { data: rules } = await supabase
      .from("financial_mood_rules")
      .select("*")
      .eq("is_active", true);

    console.log(`📈 Transactions found: ${transactions?.length || 0}`);

    // Si no hay suficientes datos
    if (!transactions || transactions.length < 3) {
      return new Response(
        JSON.stringify({
          error: "Not enough data",
          message: "Se necesitan al menos 3 transacciones para calcular el mood",
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 5. Calcular métricas
    const metrics = calculateMetrics(
      transactions as Transaction[],
      budgets || [],
      (prevTransactions as Transaction[]) || []
    );

    console.log("📊 Metrics:", metrics);

    // 6. Aplicar reglas y calcular score
    const { score, reasons } = applyRules(metrics, rules || []);

    console.log(`💯 Score: ${score}`);

    // 7. Determinar mood label
    const mood_label = determineMoodLabel(score, metrics);

    // 8. Generar alertas
    const alerts = generateAlerts(metrics, score, budgets || []);

    // 9. Obtener snapshot anterior para determinar tendencia
    const { data: prevSnapshot } = await supabase
      .from("financial_mood_snapshots")
      .select("score")
      .eq("user_id", user_id)
      .order("date", { ascending: false })
      .limit(1)
      .single();

    const trend = determineTrend(score, prevSnapshot?.score || null);

    // 10. Insertar nuevo snapshot
    const { data: snapshot, error: insertError } = await supabase
      .from("financial_mood_snapshots")
      .upsert({
        user_id,
        date: new Date().toISOString().split("T")[0],
        mood_label,
        score,
        reasons,
        metrics,
        trend,
        analysis_period_start: periodStart,
        analysis_period_end: periodEnd,
        alerts,
      })
      .select()
      .single();

    if (insertError) throw insertError;

    console.log("✅ Mood snapshot saved");

    // 11. Respuesta
    return new Response(
      JSON.stringify({
        success: true,
        mood: {
          label: mood_label,
          score,
          trend,
          reasons: reasons.slice(0, 5), // Top 5 razones
          alerts,
          metrics,
          period: {
            start: periodStart,
            end: periodEnd,
          },
        },
        snapshot,
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
