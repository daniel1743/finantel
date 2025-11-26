// ============================================================================
// BOT: DETECTAR CARGOS FIJOS SOSPECHOSOS
// ============================================================================
// Detecta cargos recurrentes de monto exacto que no coinciden con
// suscripciones conocidas (potencialmente fraudulentos o no reconocidos)
// SIN IA - Solo patrones matemáticos
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
  LOOKBACK_DAYS: 180, // Analizar últimos 6 meses
  MIN_OCCURRENCES: 3, // Mínimo 3 ocurrencias
  EXACT_AMOUNT_TOLERANCE: 0.01, // Tolerancia 1% (monto casi exacto)
  MIN_INTERVAL_DAYS: 20, // Mínimo 20 días entre cargos
  MAX_INTERVAL_DAYS: 40, // Máximo 40 días
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
}

interface FixedChargePattern {
  user_id: string;
  normalized_description: string;
  exact_amount: number;
  occurrences: number;
  average_interval_days: number;
  transaction_ids: string[];
  last_charge_date: string;
  is_known_subscription: boolean;
  confidence_score: number;
  severity: string;
}

// ============================================================================
// FUNCIONES AUXILIARES
// ============================================================================

/**
 * Normaliza descripción
 */
function normalizeDescription(desc: string): string {
  return desc
    .toLowerCase()
    .replace(/[0-9]/g, "")
    .replace(/[^a-z\s]/g, "")
    .trim();
}

/**
 * Calcula intervalo promedio entre transacciones
 */
function calculateAverageInterval(dates: string[]): number {
  if (dates.length < 2) return 0;

  const sortedDates = dates
    .map((d) => new Date(d).getTime())
    .sort((a, b) => a - b);

  const intervals: number[] = [];
  for (let i = 1; i < sortedDates.length; i++) {
    const daysDiff = (sortedDates[i] - sortedDates[i - 1]) / (1000 * 60 * 60 * 24);
    intervals.push(daysDiff);
  }

  return intervals.reduce((sum, val) => sum + val, 0) / intervals.length;
}

/**
 * Verifica si coincide con suscripción conocida
 */
async function isKnownSubscription(
  description: string,
  supabase: any
): Promise<boolean> {
  const { data: patterns } = await supabase
    .from("subscription_patterns")
    .select("aliases");

  if (!patterns) return false;

  const descLower = description.toLowerCase();

  for (const pattern of patterns) {
    if (pattern.aliases) {
      for (const alias of pattern.aliases) {
        if (descLower.includes(alias.toLowerCase().replace(/\*/g, ""))) {
          return true;
        }
      }
    }
  }

  return false;
}

/**
 * Calcula severidad
 */
function calculateSeverity(monthlyAmount: number, occurrences: number): string {
  const annualAmount = monthlyAmount * 12;

  if (annualAmount >= 150000 || occurrences >= 10) return "high";
  if (annualAmount >= 75000 || occurrences >= 6) return "medium";
  return "low";
}

/**
 * Calcula confianza
 */
function calculateConfidence(occurrences: number, amountVariance: number): number {
  let score = 70; // Base

  // Más ocurrencias = más confianza
  score += Math.min(20, occurrences * 3);

  // Menor variación en monto = más confianza
  if (amountVariance < 0.01) score += 10;
  else if (amountVariance < 0.05) score += 5;

  return Math.min(100, score);
}

// ============================================================================
// DETECCIÓN DE PATRONES
// ============================================================================

/**
 * Detecta cargos fijos sospechosos
 */
async function detectFixedCharges(
  transactions: Transaction[],
  supabase: any
): Promise<FixedChargePattern[]> {
  const patterns: FixedChargePattern[] = [];

  // Agrupar por descripción normalizada
  const groups: Map<string, Transaction[]> = new Map();

  for (const tx of transactions) {
    const normalized = normalizeDescription(tx.description);
    if (!groups.has(normalized)) {
      groups.set(normalized, []);
    }
    groups.get(normalized)!.push(tx);
  }

  // Analizar cada grupo
  for (const [normalizedDesc, txs] of groups.entries()) {
    if (txs.length < CONFIG.MIN_OCCURRENCES) continue;

    // Verificar si los montos son casi exactos
    const amounts = txs.map((tx) => tx.amount);
    const avgAmount = amounts.reduce((sum, a) => sum + a, 0) / amounts.length;
    const maxDeviation = Math.max(...amounts.map((a) => Math.abs(a - avgAmount)));
    const amountVariance = maxDeviation / avgAmount;

    if (amountVariance > CONFIG.EXACT_AMOUNT_TOLERANCE) {
      continue; // Montos varían demasiado
    }

    // Verificar intervalos regulares
    const sorted = txs.sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    const dates = sorted.map((tx) => tx.date);
    const avgInterval = calculateAverageInterval(dates);

    if (
      avgInterval < CONFIG.MIN_INTERVAL_DAYS ||
      avgInterval > CONFIG.MAX_INTERVAL_DAYS
    ) {
      continue; // No es recurrente mensual
    }

    // Verificar si es suscripción conocida
    const isKnown = await isKnownSubscription(
      txs[0].description,
      supabase
    );

    if (isKnown) {
      continue; // Es suscripción conocida, no es sospechosa
    }

    // Calcular métricas
    const confidence = calculateConfidence(txs.length, amountVariance);
    const severity = calculateSeverity(avgAmount, txs.length);

    patterns.push({
      user_id: txs[0].user_id,
      normalized_description: normalizedDesc,
      exact_amount: avgAmount,
      occurrences: txs.length,
      average_interval_days: avgInterval,
      transaction_ids: txs.map((tx) => tx.id),
      last_charge_date: sorted[sorted.length - 1].date,
      is_known_subscription: false,
      confidence_score: confidence,
      severity: severity,
    });
  }

  return patterns;
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

    console.log("🤖 BOT-DETECT-FIXED-CHARGES: Iniciando...");

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
          .select("id, user_id, description, amount, date")
          .eq("user_id", userId)
          .eq("type", "expense")
          .gte(
            "date",
            new Date(Date.now() - CONFIG.LOOKBACK_DAYS * 24 * 60 * 60 * 1000).toISOString()
          )
          .order("date", { ascending: true });

        if (txError) throw txError;
        if (!transactions || transactions.length === 0) continue;

        // Detectar cargos fijos sospechosos
        const patterns = await detectFixedCharges(transactions, supabase);

        // Generar alertas
        for (const pattern of patterns) {
          // Verificar si ya existe alerta similar
          const { data: existingAlerts } = await supabase
            .from("bot_alerts")
            .select("id")
            .eq("user_id", userId)
            .eq("bot_name", "bot-detect-fixed-charges")
            .eq("status", "pending")
            .ilike(
              "payload->>normalized_description",
              pattern.normalized_description
            )
            .limit(1);

          if (existingAlerts && existingAlerts.length > 0) {
            console.log(
              `⏭️  Alerta duplicada para ${pattern.normalized_description}, omitiendo...`
            );
            continue;
          }

          // Crear alerta
          const alert = {
            user_id: userId,
            bot_name: "bot-detect-fixed-charges",
            anomaly_type: "cargo_fijo_sospechoso",
            severity: pattern.severity,
            confidence_score: pattern.confidence_score,
            payload: {
              normalized_description: pattern.normalized_description,
              exact_amount: pattern.exact_amount,
              occurrences: pattern.occurrences,
              average_interval_days: pattern.average_interval_days,
              transaction_ids: pattern.transaction_ids,
              last_charge_date: pattern.last_charge_date,
              monthly_estimated_leak: pattern.exact_amount,
              description: `Cargo fijo no reconocido: ${pattern.normalized_description} ($${Math.round(pattern.exact_amount)})`,
              pattern_details: {
                frequency: "monthly",
                is_known: false,
                regularity: "high",
              },
            },
          };

          const { error: insertError } = await supabase
            .from("bot_alerts")
            .insert(alert);

          if (insertError) {
            errors.push({
              user_id: userId,
              pattern: pattern.normalized_description,
              error: insertError.message,
            });
          } else {
            alertsGenerated++;
            console.log(
              `🚨 Cargo fijo sospechoso: ${pattern.normalized_description} ($${Math.round(pattern.exact_amount)})`
            );
          }
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
      bot_name: "bot-detect-fixed-charges",
      batch_timestamp: new Date().toISOString(),
      users_processed: usersProcessed,
      alerts_generated: alertsGenerated,
      execution_time_ms: executionTime,
      errors_count: errors.length,
      error_details: errors,
    });

    console.log(`✅ BOT-DETECT-FIXED-CHARGES: Completado en ${executionTime}ms`);
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
    console.error("❌ Error en bot-detect-fixed-charges:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
