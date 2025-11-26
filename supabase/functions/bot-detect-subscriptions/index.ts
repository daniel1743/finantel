// ============================================================================
// BOT: DETECTAR SUSCRIPCIONES
// ============================================================================
// Detecta suscripciones recurrentes mediante reglas simples
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
  MIN_OCCURRENCES: 3, // Mínimo 3 ocurrencias para considerar suscripción
  INTERVAL_TOLERANCE: 7, // ±7 días de tolerancia en el intervalo
  MIN_INTERVAL_DAYS: 23, // Mínimo 23 días entre cargos (mensual)
  MAX_INTERVAL_DAYS: 37, // Máximo 37 días (mensual con variación)
  AMOUNT_TOLERANCE: 0.10, // 10% de tolerancia en el monto
  BATCH_SIZE: 100, // Procesar 100 usuarios por batch
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

interface SubscriptionPattern {
  user_id: string;
  normalized_description: string;
  average_amount: number;
  average_interval_days: number;
  occurrences: number;
  transaction_ids: string[];
  last_charge_date: string;
  confidence_score: number;
  severity: string;
}

interface BotAlert {
  user_id: string;
  bot_name: string;
  anomaly_type: string;
  severity: string;
  confidence_score: number;
  payload: Record<string, any>;
}

// ============================================================================
// FUNCIONES AUXILIARES
// ============================================================================

/**
 * Normaliza descripción de transacción
 * Ejemplo: "NETFLIX.COM 12345" → "netflix"
 */
function normalizeDescription(desc: string): string {
  return desc
    .toLowerCase()
    .replace(/[0-9]/g, "") // Quitar números
    .replace(/[^a-z\s]/g, "") // Quitar caracteres especiales
    .trim()
    .split(/\s+/)[0] || desc.toLowerCase(); // Tomar primera palabra
}

/**
 * Calcula intervalo promedio entre transacciones (en días)
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
 * Calcula desviación estándar de intervalos
 */
function calculateIntervalStdDev(dates: string[], avgInterval: number): number {
  if (dates.length < 2) return 0;

  const sortedDates = dates
    .map((d) => new Date(d).getTime())
    .sort((a, b) => a - b);

  const intervals: number[] = [];
  for (let i = 1; i < sortedDates.length; i++) {
    const daysDiff = (sortedDates[i] - sortedDates[i - 1]) / (1000 * 60 * 60 * 24);
    intervals.push(daysDiff);
  }

  const variance =
    intervals.reduce((sum, val) => sum + Math.pow(val - avgInterval, 2), 0) /
    intervals.length;

  return Math.sqrt(variance);
}

/**
 * Calcula severidad basada en monto y frecuencia
 */
function calculateSeverity(
  monthlyAmount: number,
  occurrences: number
): string {
  const annualAmount = monthlyAmount * 12;

  if (annualAmount >= 200000 || occurrences >= 12) return "high";
  if (annualAmount >= 100000 || occurrences >= 6) return "medium";
  return "low";
}

/**
 * Calcula score de confianza (0-100)
 */
function calculateConfidence(
  occurrences: number,
  avgInterval: number,
  stdDev: number,
  amountVariance: number
): number {
  let score = 70; // Base

  // Más ocurrencias = más confianza
  score += Math.min(20, occurrences * 3);

  // Intervalo más cercano a 30 días = más confianza
  const intervalDeviation = Math.abs(avgInterval - 30);
  score += Math.max(0, 10 - intervalDeviation);

  // Menor desviación estándar = más confianza
  if (stdDev < 3) score += 5;
  else if (stdDev < 7) score += 2;

  // Menor variación en monto = más confianza
  if (amountVariance < 0.05) score += 5;
  else if (amountVariance < 0.10) score += 2;

  return Math.min(100, Math.max(0, Math.round(score)));
}

// ============================================================================
// DETECCIÓN DE PATRONES
// ============================================================================

/**
 * Detecta patrones de suscripción en transacciones de un usuario
 */
function detectSubscriptionPatterns(
  transactions: Transaction[]
): SubscriptionPattern[] {
  const patterns: SubscriptionPattern[] = [];

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

    // Ordenar por fecha
    const sorted = txs.sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    // Calcular estadísticas
    const amounts = sorted.map((tx) => tx.amount);
    const dates = sorted.map((tx) => tx.date);

    const avgAmount = amounts.reduce((sum, a) => sum + a, 0) / amounts.length;
    const avgInterval = calculateAverageInterval(dates);
    const stdDev = calculateIntervalStdDev(dates, avgInterval);

    // Verificar si el intervalo es mensual
    if (
      avgInterval < CONFIG.MIN_INTERVAL_DAYS ||
      avgInterval > CONFIG.MAX_INTERVAL_DAYS
    ) {
      continue;
    }

    // Verificar consistencia del monto
    const minAmount = Math.min(...amounts);
    const maxAmount = Math.max(...amounts);
    const amountVariance = (maxAmount - minAmount) / avgAmount;

    if (amountVariance > CONFIG.AMOUNT_TOLERANCE) {
      continue;
    }

    // Calcular métricas
    const confidence = calculateConfidence(
      txs.length,
      avgInterval,
      stdDev,
      amountVariance
    );
    const severity = calculateSeverity(avgAmount, txs.length);

    // Crear patrón
    patterns.push({
      user_id: txs[0].user_id,
      normalized_description: normalizedDesc,
      average_amount: avgAmount,
      average_interval_days: avgInterval,
      occurrences: txs.length,
      transaction_ids: txs.map((tx) => tx.id),
      last_charge_date: sorted[sorted.length - 1].date,
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
  // Handle CORS
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

    console.log("🤖 BOT-DETECT-SUBSCRIPTIONS: Iniciando...");

    // Obtener usuarios activos (con transacciones recientes)
    const { data: activeUsers, error: usersError } = await supabase
      .from("transactions")
      .select("user_id")
      .gte("date", new Date(Date.now() - CONFIG.LOOKBACK_DAYS * 24 * 60 * 60 * 1000).toISOString())
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
          )
          .order("date", { ascending: true });

        if (txError) throw txError;
        if (!transactions || transactions.length === 0) continue;

        // Detectar patrones
        const patterns = detectSubscriptionPatterns(transactions);

        // Generar alertas para cada patrón detectado
        for (const pattern of patterns) {
          // Verificar si ya existe una alerta similar activa
          const { data: existingAlerts } = await supabase
            .from("bot_alerts")
            .select("id")
            .eq("user_id", userId)
            .eq("bot_name", "bot-detect-subscriptions")
            .eq("status", "pending")
            .ilike("payload->>normalized_description", pattern.normalized_description)
            .limit(1);

          if (existingAlerts && existingAlerts.length > 0) {
            console.log(`⏭️  Alerta duplicada para ${pattern.normalized_description}, omitiendo...`);
            continue;
          }

          // Crear alerta
          const alert: BotAlert = {
            user_id: userId,
            bot_name: "bot-detect-subscriptions",
            anomaly_type: "suscripcion_oculta",
            severity: pattern.severity,
            confidence_score: pattern.confidence_score,
            payload: {
              normalized_description: pattern.normalized_description,
              average_amount: pattern.average_amount,
              average_interval_days: pattern.average_interval_days,
              occurrences: pattern.occurrences,
              transaction_ids: pattern.transaction_ids,
              last_charge_date: pattern.last_charge_date,
              monthly_estimated_leak: pattern.average_amount,
              pattern_details: {
                description: `Patrón mensual detectado: ${pattern.normalized_description}`,
                frequency: "monthly",
                regularity: pattern.confidence_score >= 85 ? "high" : "medium",
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
            console.log(`🚨 Alerta generada: ${pattern.normalized_description} ($${pattern.average_amount})`);
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
      bot_name: "bot-detect-subscriptions",
      batch_timestamp: new Date().toISOString(),
      users_processed: usersProcessed,
      alerts_generated: alertsGenerated,
      execution_time_ms: executionTime,
      errors_count: errors.length,
      error_details: errors,
    });

    console.log(`✅ BOT-DETECT-SUBSCRIPTIONS: Completado en ${executionTime}ms`);
    console.log(`📊 Usuarios: ${usersProcessed}, Alertas: ${alertsGenerated}, Errores: ${errors.length}`);

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
    console.error("❌ Error en bot-detect-subscriptions:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
