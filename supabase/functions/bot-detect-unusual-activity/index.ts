// ============================================================================
// BOT: DETECTAR ACTIVIDAD INUSUAL
// ============================================================================
// Detecta gastos que se desvían significativamente del patrón normal del usuario
// SIN IA - Solo análisis estadístico (media, desviación estándar, outliers)
// ============================================================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// ============================================================================
// CONFIGURACIÓN
// ============================================================================
const CONFIG = {
  LOOKBACK_DAYS: 60, // Analizar últimos 2 meses
  COMPARISON_PERIOD_DAYS: 30, // Comparar últimos 30 días vs anteriores 30 días
  OUTLIER_THRESHOLD: 2.5, // Desviaciones estándar para considerar outlier
  SPIKE_THRESHOLD: 2.0, // Aumento de 2x o más en gasto
  MIN_TRANSACTIONS: 10, // Mínimo de transacciones para análisis confiable
  BATCH_SIZE: 100,
};

// ============================================================================
// INTERFACES
// ============================================================================
interface Transaction {
  id: string;
  user_id: string;
  description: string;
  amount: number;
  date: string;
  category: string;
}

interface SpendingStats {
  mean: number;
  median: number;
  stdDev: number;
  total: number;
  count: number;
  max: number;
  min: number;
}

interface UnusualPattern {
  user_id: string;
  anomaly_subtype: string;
  current_period_stats: SpendingStats;
  previous_period_stats: SpendingStats;
  deviation_factor: number;
  outlier_transactions: Transaction[];
  spike_categories: string[];
  confidence_score: number;
  severity: string;
}

// ============================================================================
// FUNCIONES ESTADÍSTICAS
// ============================================================================

/**
 * Calcula estadísticas de gasto
 */
function calculateStats(amounts: number[]): SpendingStats {
  if (amounts.length === 0) {
    return {
      mean: 0,
      median: 0,
      stdDev: 0,
      total: 0,
      count: 0,
      max: 0,
      min: 0,
    };
  }

  const sorted = [...amounts].sort((a, b) => a - b);
  const total = amounts.reduce((sum, a) => sum + a, 0);
  const mean = total / amounts.length;

  // Mediana
  const mid = Math.floor(sorted.length / 2);
  const median =
    sorted.length % 2 === 0
      ? (sorted[mid - 1] + sorted[mid]) / 2
      : sorted[mid];

  // Desviación estándar
  const variance =
    amounts.reduce((sum, a) => sum + Math.pow(a - mean, 2), 0) / amounts.length;
  const stdDev = Math.sqrt(variance);

  return {
    mean,
    median,
    stdDev,
    total,
    count: amounts.length,
    max: Math.max(...amounts),
    min: Math.min(...amounts),
  };
}

/**
 * Identifica outliers (valores atípicos)
 */
function findOutliers(
  transactions: Transaction[],
  mean: number,
  stdDev: number
): Transaction[] {
  const threshold = CONFIG.OUTLIER_THRESHOLD;

  return transactions.filter((tx) => {
    const zScore = Math.abs((tx.amount - mean) / stdDev);
    return zScore > threshold;
  });
}

/**
 * Identifica categorías con aumentos repentinos
 */
function findSpikeCategories(
  currentTxs: Transaction[],
  previousTxs: Transaction[]
): string[] {
  // Agrupar por categoría
  const currentByCategory = new Map<string, number>();
  const previousByCategory = new Map<string, number>();

  for (const tx of currentTxs) {
    const cat = tx.category || "Sin categoría";
    currentByCategory.set(cat, (currentByCategory.get(cat) || 0) + tx.amount);
  }

  for (const tx of previousTxs) {
    const cat = tx.category || "Sin categoría";
    previousByCategory.set(cat, (previousByCategory.get(cat) || 0) + tx.amount);
  }

  // Detectar spikes
  const spikeCategories: string[] = [];

  for (const [category, currentAmount] of currentByCategory.entries()) {
    const previousAmount = previousByCategory.get(category) || 0;

    if (previousAmount === 0 && currentAmount > 20000) {
      // Nueva categoría con gasto significativo
      spikeCategories.push(category);
    } else if (previousAmount > 0) {
      const ratio = currentAmount / previousAmount;
      if (ratio >= CONFIG.SPIKE_THRESHOLD) {
        spikeCategories.push(category);
      }
    }
  }

  return spikeCategories;
}

/**
 * Calcula severidad
 */
function calculateSeverity(
  deviationFactor: number,
  outlierCount: number
): string {
  if (deviationFactor >= 3.0 || outlierCount >= 5) return "high";
  if (deviationFactor >= 2.0 || outlierCount >= 3) return "medium";
  return "low";
}

/**
 * Calcula confianza
 */
function calculateConfidence(
  transactionCount: number,
  deviationFactor: number
): number {
  let score = 65; // Base

  // Más transacciones = más confiable el análisis
  if (transactionCount >= 30) score += 15;
  else if (transactionCount >= 20) score += 10;
  else if (transactionCount >= 10) score += 5;

  // Mayor desviación = más confianza en que es anómalo
  if (deviationFactor >= 3.0) score += 15;
  else if (deviationFactor >= 2.5) score += 10;
  else if (deviationFactor >= 2.0) score += 5;

  return Math.min(100, score);
}

// ============================================================================
// DETECCIÓN DE PATRONES
// ============================================================================

/**
 * Analiza actividad inusual del usuario
 */
function analyzeUnusualActivity(
  transactions: Transaction[]
): UnusualPattern | null {
  if (transactions.length < CONFIG.MIN_TRANSACTIONS) {
    return null; // No hay suficientes datos
  }

  // Dividir en dos períodos
  const sortedTxs = transactions.sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const midpoint = Math.floor(sortedTxs.length / 2);
  const previousPeriod = sortedTxs.slice(0, midpoint);
  const currentPeriod = sortedTxs.slice(midpoint);

  // Calcular estadísticas
  const previousStats = calculateStats(previousPeriod.map((tx) => tx.amount));
  const currentStats = calculateStats(currentPeriod.map((tx) => tx.amount));

  // Calcular factor de desviación
  const deviationFactor =
    previousStats.mean > 0
      ? currentStats.mean / previousStats.mean
      : currentStats.mean > 0
      ? 999
      : 1;

  // No alertar si el gasto bajó significativamente (es bueno)
  if (deviationFactor < 1.0) {
    return null;
  }

  // Detectar outliers
  const outliers = findOutliers(
    currentPeriod,
    previousStats.mean,
    previousStats.stdDev
  );

  // Detectar categorías con spikes
  const spikeCategories = findSpikeCategories(currentPeriod, previousPeriod);

  // Determinar si hay anomalía significativa
  const hasSignificantDeviation = deviationFactor >= 1.5;
  const hasOutliers = outliers.length > 0;
  const hasSpikes = spikeCategories.length > 0;

  if (!hasSignificantDeviation && !hasOutliers && !hasSpikes) {
    return null; // No hay actividad inusual
  }

  // Determinar subtipo de anomalía
  let anomalySubtype = "gasto_elevado_general";
  if (hasSpikes && spikeCategories.length > 0) {
    anomalySubtype = "spike_categoria";
  } else if (hasOutliers && outliers.length >= 3) {
    anomalySubtype = "transacciones_atipicas";
  }

  return {
    user_id: transactions[0].user_id,
    anomaly_subtype: anomalySubtype,
    current_period_stats: currentStats,
    previous_period_stats: previousStats,
    deviation_factor: deviationFactor,
    outlier_transactions: outliers,
    spike_categories: spikeCategories,
    confidence_score: calculateConfidence(transactions.length, deviationFactor),
    severity: calculateSeverity(deviationFactor, outliers.length),
  };
}

// ============================================================================
// LÓGICA PRINCIPAL
// ============================================================================

serve(async (req) => {
  // Manejo CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const startTime = Date.now();
    let usersProcessed = 0;
    let alertsGenerated = 0;
    const errors: any[] = [];

    console.log("🤖 BOT-DETECT-UNUSUAL-ACTIVITY: Iniciando...");

    // Obtener usuarios activos
    const { data: activeUsers, error: usersError } = await supabase
      .from("transactions")
      .select("user_id")
      .gte(
        "date",
        new Date(Date.now() - CONFIG.LOOKBACK_DAYS * 24 * 60 * 60 * 1000).toISOString()
      )
      .eq("type", "expense")
      .limit(CONFIG.BATCH_SIZE);

    if (usersError) throw usersError;

    const uniqueUserIds = [...new Set(activeUsers.map((u) => u.user_id))];
    console.log(`📊 Procesando ${uniqueUserIds.length} usuarios...`);

    // Procesar cada usuario
    for (const userId of uniqueUserIds) {
      try {
        // Obtener transacciones del usuario
        const { data: transactions, error: txError } = await supabase
          .from("transactions")
          .select("id, user_id, description, amount, date, category")
          .eq("user_id", userId)
          .eq("type", "expense")
          .gte(
            "date",
            new Date(Date.now() - CONFIG.LOOKBACK_DAYS * 24 * 60 * 60 * 1000).toISOString()
          );

        if (txError) throw txError;
        if (!transactions || transactions.length === 0) continue;

        // Analizar actividad inusual
        const pattern = analyzeUnusualActivity(transactions);

        if (!pattern) continue; // No hay actividad inusual

        // Verificar si ya existe alerta similar
        const { data: existingAlerts } = await supabase
          .from("bot_alerts")
          .select("id")
          .eq("user_id", userId)
          .eq("bot_name", "bot-detect-unusual-activity")
          .eq("status", "pending")
          .limit(1);

        if (existingAlerts && existingAlerts.length > 0) {
          console.log(`⏭️  Alerta duplicada para actividad inusual, omitiendo...`);
          continue;
        }

        // Calcular impacto mensual (diferencia entre períodos)
        const monthlyDifference =
          pattern.current_period_stats.mean - pattern.previous_period_stats.mean;

        // Crear alerta
        const alert = {
          user_id: userId,
          bot_name: "bot-detect-unusual-activity",
          anomaly_type: "actividad_inusual",
          severity: pattern.severity,
          confidence_score: pattern.confidence_score,
          payload: {
            anomaly_subtype: pattern.anomaly_subtype,
            current_period: {
              mean: pattern.current_period_stats.mean,
              total: pattern.current_period_stats.total,
              count: pattern.current_period_stats.count,
            },
            previous_period: {
              mean: pattern.previous_period_stats.mean,
              total: pattern.previous_period_stats.total,
              count: pattern.previous_period_stats.count,
            },
            deviation_factor: pattern.deviation_factor,
            outlier_count: pattern.outlier_transactions.length,
            outlier_ids: pattern.outlier_transactions.map((tx) => tx.id),
            spike_categories: pattern.spike_categories,
            monthly_estimated_leak: monthlyDifference > 0 ? monthlyDifference : 0,
            description: `Actividad inusual detectada: gasto aumentó ${Math.round((pattern.deviation_factor - 1) * 100)}%`,
            pattern_details: {
              analysis_type: "statistical",
              comparison_periods: "30d vs 30d",
              threshold: CONFIG.OUTLIER_THRESHOLD,
            },
          },
        };

        const { error: insertError } = await supabase
          .from("bot_alerts")
          .insert(alert);

        if (insertError) {
          errors.push({
            user_id: userId,
            error: insertError.message,
          });
        } else {
          alertsGenerated++;
          console.log(
            `🚨 Actividad inusual: gasto aumentó ${Math.round((pattern.deviation_factor - 1) * 100)}% (${pattern.outlier_transactions.length} outliers)`
          );
        }

        usersProcessed++;
      } catch (err) {
        errors.push({
          user_id: userId,
          error: err.message,
        });
      }
    }

    const executionTime = Date.now() - startTime;

    // Guardar estadísticas
    await supabase.from("bot_statistics").insert({
      bot_name: "bot-detect-unusual-activity",
      batch_timestamp: new Date().toISOString(),
      users_processed: usersProcessed,
      alerts_generated: alertsGenerated,
      execution_time_ms: executionTime,
      errors_count: errors.length,
      error_details: errors,
    });

    console.log(`✅ BOT-DETECT-UNUSUAL-ACTIVITY: Completado en ${executionTime}ms`);
    console.log(
      `📊 Usuarios: ${usersProcessed}, Alertas: ${alertsGenerated}, Errores: ${errors.length}`
    );

    return new Response(
      JSON.stringify({
        success: true,
        stats: {
          users_processed: usersProcessed,
          alerts_generated: alertsGenerated,
          execution_time_ms: executionTime,
          errors_count: errors.length,
        },
        errors: errors.length > 0 ? errors : undefined,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("❌ Error en bot-detect-unusual-activity:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
