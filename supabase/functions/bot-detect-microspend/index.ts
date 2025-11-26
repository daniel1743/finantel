// ============================================================================
// BOT: DETECTAR MICROCOMPRAS ACUMULADAS
// ============================================================================
// Detecta cuando muchas compras pequeñas suman un monto significativo
// SIN IA - Solo cuenta microcompras y suma totales
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
  LOOKBACK_DAYS: 30, // Analizar último mes
  MICROSPEND_THRESHOLD: 5000, // Compras menores a $5.000
  MIN_MICROSPENDS: 20, // Mínimo 20 microcompras para alertar
  SIGNIFICANT_TOTAL: 30000, // Total significativo: $30.000+
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

interface MicrospendPattern {
  user_id: string;
  total_microspends: number;
  microspends_per_month: number;
  total_spent: number;
  monthly_average: number;
  avg_per_purchase: number;
  top_categories: Map<string, { count: number; total: number }>;
  transaction_ids: string[];
  daily_average: number;
}

// ============================================================================
// FUNCIONES AUXILIARES
// ============================================================================

/**
 * Calcula severidad basada en gasto total y frecuencia
 */
function calculateSeverity(
  monthlyTotal: number,
  microspendCount: number
): string {
  if (monthlyTotal >= 100000 || microspendCount >= 50) return "high";
  if (monthlyTotal >= 50000 || microspendCount >= 30) return "medium";
  return "low";
}

/**
 * Calcula confianza
 */
function calculateConfidence(microspendCount: number): number {
  let score = 75; // Base
  score += Math.min(20, microspendCount);
  return Math.min(100, score);
}

// ============================================================================
// DETECCIÓN DE PATRONES
// ============================================================================

/**
 * Analiza patrón de microcompras de un usuario
 */
function analyzeMicrospendPattern(
  transactions: Transaction[]
): MicrospendPattern | null {
  // Filtrar microcompras
  const microspends = transactions.filter(
    (tx) => tx.amount > 0 && tx.amount < CONFIG.MICROSPEND_THRESHOLD
  );

  if (microspends.length < CONFIG.MIN_MICROSPENDS) {
    return null; // No hay suficientes microcompras
  }

  const totalSpent = microspends.reduce((sum, tx) => sum + tx.amount, 0);

  if (totalSpent < CONFIG.SIGNIFICANT_TOTAL) {
    return null; // El total no es significativo
  }

  // Calcular estadísticas
  const avgPerPurchase = totalSpent / microspends.length;
  const daysInPeriod = CONFIG.LOOKBACK_DAYS;
  const microspendsPerMonth = (microspends.length / daysInPeriod) * 30;
  const monthlyAverage = (totalSpent / daysInPeriod) * 30;

  // Agrupar por categoría
  const categoryStats = new Map<string, { count: number; total: number }>();

  for (const ms of microspends) {
    const category = ms.category || "Sin categoría";
    const current = categoryStats.get(category) || { count: 0, total: 0 };
    current.count++;
    current.total += ms.amount;
    categoryStats.set(category, current);
  }

  return {
    user_id: microspends[0].user_id,
    total_microspends: microspends.length,
    microspends_per_month: Math.round(microspendsPerMonth),
    total_spent: totalSpent,
    monthly_average: monthlyAverage,
    avg_per_purchase: avgPerPurchase,
    top_categories: categoryStats,
    transaction_ids: microspends.map((tx) => tx.id),
    daily_average: totalSpent / daysInPeriod,
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

    console.log("🤖 BOT-DETECT-MICROSPEND: Iniciando...");

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

        // Analizar patrón de microcompras
        const pattern = analyzeMicrospendPattern(transactions);

        if (!pattern) continue; // No hay patrón significativo

        // Verificar si ya existe alerta similar
        const { data: existingAlerts } = await supabase
          .from("bot_alerts")
          .select("id")
          .eq("user_id", userId)
          .eq("bot_name", "bot-detect-microspend")
          .eq("status", "pending")
          .limit(1);

        if (existingAlerts && existingAlerts.length > 0) {
          console.log(`⏭️  Alerta duplicada para microcompras, omitiendo...`);
          continue;
        }

        // Preparar top categorías
        const topCategoriesArray = Array.from(pattern.top_categories.entries())
          .map(([name, stats]) => ({
            category: name,
            count: stats.count,
            total: stats.total,
          }))
          .sort((a, b) => b.total - a.total)
          .slice(0, 5);

        // Calcular ahorro potencial (reducir 30% de microcompras)
        const potentialSavings = pattern.monthly_average * 0.3;

        // Crear alerta
        const alert = {
          user_id: userId,
          bot_name: "bot-detect-microspend",
          anomaly_type: "microcompras_acumuladas",
          severity: calculateSeverity(
            pattern.monthly_average,
            pattern.total_microspends
          ),
          confidence_score: calculateConfidence(pattern.total_microspends),
          payload: {
            total_microspends: pattern.total_microspends,
            microspends_per_month: pattern.microspends_per_month,
            total_spent: pattern.total_spent,
            monthly_average: pattern.monthly_average,
            avg_per_purchase: pattern.avg_per_purchase,
            daily_average: pattern.daily_average,
            top_categories: topCategoriesArray,
            transaction_ids: pattern.transaction_ids,
            monthly_estimated_leak: potentialSavings,
            description: `Microcompras acumuladas: ${pattern.total_microspends} compras <$${CONFIG.MICROSPEND_THRESHOLD}`,
            pattern_details: {
              threshold: CONFIG.MICROSPEND_THRESHOLD,
              reduction_target: "30%",
              potential_savings: potentialSavings,
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
            `🚨 Microcompras detectadas: ${pattern.total_microspends} compras = $${Math.round(pattern.total_spent)}`
          );
        }

        usersProcessed++;
      } catch (err) {
        errors.push({
          user_id: userId,
          error: err instanceof Error ? err.message : String(err),
        });
      }
    }

    const executionTime = Date.now() - startTime;

    // Guardar estadísticas
    await supabase.from("bot_statistics").insert({
      bot_name: "bot-detect-microspend",
      batch_timestamp: new Date().toISOString(),
      users_processed: usersProcessed,
      alerts_generated: alertsGenerated,
      execution_time_ms: executionTime,
      errors_count: errors.length,
      error_details: errors,
    });

    console.log(`✅ BOT-DETECT-MICROSPEND: Completado en ${executionTime}ms`);
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
    console.error("❌ Error en bot-detect-microspend:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : String(error) 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
