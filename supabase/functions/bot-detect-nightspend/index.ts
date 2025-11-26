// ============================================================================
// BOT: DETECTAR COMPRAS NOCTURNAS
// ============================================================================
// Detecta compras realizadas en horas de la noche (potencialmente impulsivas)
// SIN IA - Solo analiza timestamps y suma totales
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
  NIGHT_START_HOUR: 22, // 10 PM
  NIGHT_END_HOUR: 4, // 4 AM
  MIN_NIGHT_PURCHASES: 8, // Mínimo 8 compras nocturnas para alertar
  MIN_TOTAL_SPENT: 25000, // Mínimo $25.000 total
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

interface NightspendPattern {
  user_id: string;
  total_night_purchases: number;
  night_purchases_per_month: number;
  total_spent: number;
  monthly_average: number;
  avg_per_purchase: number;
  peak_hours: Map<number, number>;
  top_categories: Map<string, { count: number; total: number }>;
  transaction_ids: string[];
  percentage_of_total: number;
}

// ============================================================================
// FUNCIONES AUXILIARES
// ============================================================================

/**
 * Verifica si una hora está en rango nocturno
 * 22:00 - 04:00 (10 PM - 4 AM)
 */
function isNightTime(dateString: string): boolean {
  const date = new Date(dateString);
  const hour = date.getHours();

  return (
    hour >= CONFIG.NIGHT_START_HOUR || hour < CONFIG.NIGHT_END_HOUR
  );
}

/**
 * Extrae la hora de una fecha
 */
function getHour(dateString: string): number {
  return new Date(dateString).getHours();
}

/**
 * Calcula severidad basada en gasto y frecuencia
 */
function calculateSeverity(
  monthlyTotal: number,
  nightPurchaseCount: number
): string {
  if (monthlyTotal >= 80000 || nightPurchaseCount >= 15) return "high";
  if (monthlyTotal >= 50000 || nightPurchaseCount >= 12) return "medium";
  return "low";
}

/**
 * Calcula confianza
 */
function calculateConfidence(nightPurchaseCount: number): number {
  let score = 80; // Base alta (es fácil identificar hora)
  score += Math.min(15, nightPurchaseCount);
  return Math.min(100, score);
}

// ============================================================================
// DETECCIÓN DE PATRONES
// ============================================================================

/**
 * Analiza patrón de compras nocturnas de un usuario
 */
function analyzeNightspendPattern(
  transactions: Transaction[]
): NightspendPattern | null {
  // Filtrar compras nocturnas
  const nightPurchases = transactions.filter((tx) => isNightTime(tx.date));

  if (nightPurchases.length < CONFIG.MIN_NIGHT_PURCHASES) {
    return null; // No hay suficientes compras nocturnas
  }

  const totalSpent = nightPurchases.reduce((sum, tx) => sum + tx.amount, 0);

  if (totalSpent < CONFIG.MIN_TOTAL_SPENT) {
    return null; // El total no es significativo
  }

  // Calcular estadísticas
  const avgPerPurchase = totalSpent / nightPurchases.length;
  const daysInPeriod = CONFIG.LOOKBACK_DAYS;
  const nightPurchasesPerMonth = (nightPurchases.length / daysInPeriod) * 30;
  const monthlyAverage = (totalSpent / daysInPeriod) * 30;

  // Calcular porcentaje del total de gastos
  const totalAllExpenses = transactions.reduce((sum, tx) => sum + tx.amount, 0);
  const percentageOfTotal = (totalSpent / totalAllExpenses) * 100;

  // Agrupar por hora pico
  const hourStats = new Map<number, number>();
  for (const np of nightPurchases) {
    const hour = getHour(np.date);
    hourStats.set(hour, (hourStats.get(hour) || 0) + 1);
  }

  // Agrupar por categoría
  const categoryStats = new Map<string, { count: number; total: number }>();
  for (const np of nightPurchases) {
    const category = np.category || "Sin categoría";
    const current = categoryStats.get(category) || { count: 0, total: 0 };
    current.count++;
    current.total += np.amount;
    categoryStats.set(category, current);
  }

  return {
    user_id: nightPurchases[0].user_id,
    total_night_purchases: nightPurchases.length,
    night_purchases_per_month: Math.round(nightPurchasesPerMonth),
    total_spent: totalSpent,
    monthly_average: monthlyAverage,
    avg_per_purchase: avgPerPurchase,
    peak_hours: hourStats,
    top_categories: categoryStats,
    transaction_ids: nightPurchases.map((tx) => tx.id),
    percentage_of_total: percentageOfTotal,
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

    console.log("🤖 BOT-DETECT-NIGHTSPEND: Iniciando...");

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

        // Analizar patrón de compras nocturnas
        const pattern = analyzeNightspendPattern(transactions);

        if (!pattern) continue; // No hay patrón significativo

        // Verificar si ya existe alerta similar
        const { data: existingAlerts } = await supabase
          .from("bot_alerts")
          .select("id")
          .eq("user_id", userId)
          .eq("bot_name", "bot-detect-nightspend")
          .eq("status", "pending")
          .limit(1);

        if (existingAlerts && existingAlerts.length > 0) {
          console.log(`⏭️  Alerta duplicada para compras nocturnas, omitiendo...`);
          continue;
        }

        // Preparar horas pico
        const peakHoursArray = Array.from(pattern.peak_hours.entries())
          .map(([hour, count]) => ({ hour, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 3);

        // Preparar top categorías
        const topCategoriesArray = Array.from(pattern.top_categories.entries())
          .map(([name, stats]) => ({
            category: name,
            count: stats.count,
            total: stats.total,
          }))
          .sort((a, b) => b.total - a.total)
          .slice(0, 5);

        // Calcular ahorro potencial (eliminar 50% de compras nocturnas)
        const potentialSavings = pattern.monthly_average * 0.5;

        // Crear alerta
        const alert = {
          user_id: userId,
          bot_name: "bot-detect-nightspend",
          anomaly_type: "compras_nocturnas",
          severity: calculateSeverity(
            pattern.monthly_average,
            pattern.total_night_purchases
          ),
          confidence_score: calculateConfidence(pattern.total_night_purchases),
          payload: {
            total_night_purchases: pattern.total_night_purchases,
            night_purchases_per_month: pattern.night_purchases_per_month,
            total_spent: pattern.total_spent,
            monthly_average: pattern.monthly_average,
            avg_per_purchase: pattern.avg_per_purchase,
            percentage_of_total: pattern.percentage_of_total,
            peak_hours: peakHoursArray,
            top_categories: topCategoriesArray,
            transaction_ids: pattern.transaction_ids,
            monthly_estimated_leak: potentialSavings,
            description: `Compras nocturnas (${CONFIG.NIGHT_START_HOUR}:00-${CONFIG.NIGHT_END_HOUR}:00): ${pattern.total_night_purchases} compras`,
            pattern_details: {
              time_range: `${CONFIG.NIGHT_START_HOUR}:00 - ${CONFIG.NIGHT_END_HOUR}:00`,
              behavior: "impulsivo/emocional",
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
            `🚨 Compras nocturnas detectadas: ${pattern.total_night_purchases} compras = $${Math.round(pattern.total_spent)}`
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
      bot_name: "bot-detect-nightspend",
      batch_timestamp: new Date().toISOString(),
      users_processed: usersProcessed,
      alerts_generated: alertsGenerated,
      execution_time_ms: executionTime,
      errors_count: errors.length,
      error_details: errors,
    });

    console.log(`✅ BOT-DETECT-NIGHTSPEND: Completado en ${executionTime}ms`);
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
    console.error("❌ Error en bot-detect-nightspend:", error);
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
