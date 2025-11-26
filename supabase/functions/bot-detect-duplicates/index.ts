// ============================================================================
// BOT: DETECTAR SUSCRIPCIONES DUPLICADAS
// ============================================================================
// Detecta cuando el usuario tiene múltiples servicios similares activos
// (Ej: Spotify + Apple Music, Netflix + Disney+)
// SIN IA - Solo usa la tabla subscription_patterns
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
  LOOKBACK_DAYS: 90, // Analizar últimos 3 meses
  MIN_CHARGES_PER_SERVICE: 2, // Mínimo 2 cargos para considerar activo
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

interface SubscriptionPattern {
  service_name: string;
  category: string;
  aliases: string[];
  common_duplicates: string[];
}

interface ActiveSubscription {
  service_name: string;
  category: string;
  avg_amount: number;
  charge_count: number;
  transaction_ids: string[];
  common_duplicates: string[];
}

interface DuplicateGroup {
  user_id: string;
  category: string;
  services: {
    service_name: string;
    avg_amount: number;
    charge_count: number;
    transaction_ids: string[];
  }[];
  total_monthly_cost: number;
  potential_savings: number;
}

// ============================================================================
// FUNCIONES AUXILIARES
// ============================================================================

/**
 * Verifica si una descripción coincide con algún alias de un servicio
 */
function matchesService(
  description: string,
  aliases: string[]
): boolean {
  const descLower = description.toLowerCase();
  return aliases.some((alias) =>
    descLower.includes(alias.toLowerCase().replace(/\*/g, ""))
  );
}

/**
 * Calcula severidad basada en costo mensual duplicado
 */
function calculateSeverity(monthlyCost: number): string {
  if (monthlyCost >= 30000) return "high";
  if (monthlyCost >= 15000) return "medium";
  return "low";
}

/**
 * Calcula confianza basada en número de cargos
 */
function calculateConfidence(totalCharges: number): number {
  let score = 75; // Base
  score += Math.min(20, totalCharges * 2);
  return Math.min(100, score);
}

// ============================================================================
// DETECCIÓN DE DUPLICADOS
// ============================================================================

/**
 * Detecta suscripciones activas del usuario
 */
function detectActiveSubscriptions(
  transactions: Transaction[],
  patterns: SubscriptionPattern[]
): Map<string, ActiveSubscription> {
  const activeServices = new Map<string, ActiveSubscription>();

  for (const pattern of patterns) {
    const matchingTxs = transactions.filter((tx) =>
      matchesService(tx.description, pattern.aliases)
    );

    if (matchingTxs.length >= CONFIG.MIN_CHARGES_PER_SERVICE) {
      const avgAmount =
        matchingTxs.reduce((sum, tx) => sum + tx.amount, 0) / matchingTxs.length;

      activeServices.set(pattern.service_name, {
        service_name: pattern.service_name,
        category: pattern.category,
        avg_amount: avgAmount,
        charge_count: matchingTxs.length,
        transaction_ids: matchingTxs.map((tx) => tx.id),
        common_duplicates: pattern.common_duplicates,
      });
    }
  }

  return activeServices;
}

/**
 * Encuentra duplicados entre servicios activos
 */
function findDuplicates(
  userId: string,
  activeServices: Map<string, ActiveSubscription>
): DuplicateGroup[] {
  const duplicates: DuplicateGroup[] = [];
  const processed = new Set<string>();

  for (const [serviceName, service] of activeServices.entries()) {
    if (processed.has(serviceName)) continue;

    const duplicateServices: ActiveSubscription[] = [service];

    // Buscar servicios duplicados configurados
    for (const duplicateName of service.common_duplicates) {
      if (activeServices.has(duplicateName) && !processed.has(duplicateName)) {
        duplicateServices.push(activeServices.get(duplicateName)!);
        processed.add(duplicateName);
      }
    }

    if (duplicateServices.length > 1) {
      const totalCost = duplicateServices.reduce(
        (sum, s) => sum + s.avg_amount,
        0
      );

      // Ahorro potencial = costo del más caro menos el más barato
      const amounts = duplicateServices.map((s) => s.avg_amount);
      const maxAmount = Math.max(...amounts);
      const minAmount = Math.min(...amounts);
      const potentialSavings = maxAmount - minAmount;

      duplicates.push({
        user_id: userId,
        category: service.category,
        services: duplicateServices.map((s) => ({
          service_name: s.service_name,
          avg_amount: s.avg_amount,
          charge_count: s.charge_count,
          transaction_ids: s.transaction_ids,
        })),
        total_monthly_cost: totalCost,
        potential_savings: potentialSavings,
      });

      processed.add(serviceName);
    }
  }

  return duplicates;
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

    console.log("🤖 BOT-DETECT-DUPLICATES: Iniciando...");

    // Obtener patrones de suscripciones conocidas
    const { data: patterns, error: patternsError } = await supabase
      .from("subscription_patterns")
      .select("service_name, category, aliases, common_duplicates");

    if (patternsError) throw patternsError;
    if (!patterns || patterns.length === 0) {
      console.log("⚠️  No hay patrones de suscripciones configurados");
      return new Response(
        JSON.stringify({ success: true, message: "No patterns configured" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`📚 ${patterns.length} patrones de suscripciones cargados`);

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
          );

        if (txError) throw txError;
        if (!transactions || transactions.length === 0) continue;

        // Detectar suscripciones activas
        const activeServices = detectActiveSubscriptions(transactions, patterns);

        if (activeServices.size === 0) continue;

        // Encontrar duplicados
        const duplicateGroups = findDuplicates(userId, activeServices);

        // Generar alertas
        for (const group of duplicateGroups) {
          // Verificar si ya existe alerta similar
          const { data: existingAlerts } = await supabase
            .from("bot_alerts")
            .select("id")
            .eq("user_id", userId)
            .eq("bot_name", "bot-detect-duplicates")
            .eq("status", "pending")
            .eq("payload->>category", group.category)
            .limit(1);

          if (existingAlerts && existingAlerts.length > 0) {
            console.log(
              `⏭️  Alerta duplicada para categoría ${group.category}, omitiendo...`
            );
            continue;
          }

          const serviceNames = group.services.map((s) => s.service_name).join(" + ");
          const allTransactionIds = group.services.flatMap((s) => s.transaction_ids);
          const totalCharges = group.services.reduce(
            (sum, s) => sum + s.charge_count,
            0
          );

          // Crear alerta
          const alert = {
            user_id: userId,
            bot_name: "bot-detect-duplicates",
            anomaly_type: "suscripcion_duplicada",
            severity: calculateSeverity(group.total_monthly_cost),
            confidence_score: calculateConfidence(totalCharges),
            payload: {
              category: group.category,
              services: group.services,
              total_monthly_cost: group.total_monthly_cost,
              potential_savings: group.potential_savings,
              monthly_estimated_leak: group.potential_savings,
              transaction_ids: allTransactionIds,
              description: `Servicios duplicados detectados: ${serviceNames}`,
            },
          };

          const { error: insertError } = await supabase
            .from("bot_alerts")
            .insert(alert);

          if (insertError) {
            errors.push({
              user_id: userId,
              category: group.category,
              error: insertError.message,
            });
          } else {
            alertsGenerated++;
            console.log(
              `🚨 Duplicado detectado: ${serviceNames} ($${group.total_monthly_cost})`
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
      bot_name: "bot-detect-duplicates",
      batch_timestamp: new Date().toISOString(),
      users_processed: usersProcessed,
      alerts_generated: alertsGenerated,
      execution_time_ms: executionTime,
      errors_count: errors.length,
      error_details: errors,
    });

    console.log(`✅ BOT-DETECT-DUPLICATES: Completado en ${executionTime}ms`);
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
    console.error("❌ Error en bot-detect-duplicates:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
