// ============================================================================
// BOT: DETECTAR DELIVERY EXCESIVO
// ============================================================================
// Detecta cuando el usuario pide delivery muy frecuentemente
// SIN IA - Solo cuenta deliveries y calcula promedios
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
  EXCESSIVE_THRESHOLD: 12, // Más de 12 deliveries/mes es excesivo
  BATCH_SIZE: 100,

  // Keywords para identificar delivery
  DELIVERY_KEYWORDS: [
    "uber eats",
    "ubereats",
    "rappi",
    "pedidosya",
    "pedidos ya",
    "cornershop",
    "ifood",
    "doordash",
    "grubhub",
    "delivery",
    "domicilio",
    "just eat",
    "glovo",
    "didi food",
    "didifood",
  ],
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

interface DeliveryPattern {
  user_id: string;
  total_deliveries: number;
  deliveries_per_month: number;
  total_spent: number;
  monthly_average: number;
  avg_per_delivery: number;
  top_services: Map<string, { count: number; total: number }>;
  transaction_ids: string[];
}

// ============================================================================
// FUNCIONES AUXILIARES
// ============================================================================

/**
 * Verifica si una transacción es de delivery
 */
function isDelivery(description: string, category: string): boolean {
  const descLower = description.toLowerCase();

  // Verificar keywords
  const hasKeyword = CONFIG.DELIVERY_KEYWORDS.some((keyword) =>
    descLower.includes(keyword)
  );

  // Verificar categoría
  const isDeliveryCategory =
    category?.toLowerCase() === "comida" ||
    category?.toLowerCase() === "restaurantes" ||
    category?.toLowerCase() === "food";

  return hasKeyword || isDeliveryCategory;
}

/**
 * Extrae el nombre del servicio de delivery
 */
function extractServiceName(description: string): string {
  const descLower = description.toLowerCase();

  for (const keyword of CONFIG.DELIVERY_KEYWORDS) {
    if (descLower.includes(keyword)) {
      return keyword
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
    }
  }

  return "Delivery Genérico";
}

/**
 * Calcula severidad basada en frecuencia y gasto
 */
function calculateSeverity(
  deliveriesPerMonth: number,
  monthlyAverage: number
): string {
  if (deliveriesPerMonth >= 20 || monthlyAverage >= 150000) return "critical";
  if (deliveriesPerMonth >= 15 || monthlyAverage >= 100000) return "high";
  if (deliveriesPerMonth >= 12 || monthlyAverage >= 75000) return "medium";
  return "low";
}

/**
 * Calcula confianza
 */
function calculateConfidence(totalDeliveries: number): number {
  let score = 80; // Base alta porque es fácil identificar delivery
  score += Math.min(15, totalDeliveries);
  return Math.min(100, score);
}

// ============================================================================
// DETECCIÓN DE PATRONES
// ============================================================================

/**
 * Analiza patrón de delivery de un usuario
 */
function analyzeDeliveryPattern(transactions: Transaction[]): DeliveryPattern | null {
  const deliveries = transactions.filter((tx) =>
    isDelivery(tx.description, tx.category)
  );

  if (deliveries.length < CONFIG.EXCESSIVE_THRESHOLD) {
    return null; // No es excesivo
  }

  // Calcular estadísticas
  const totalSpent = deliveries.reduce((sum, tx) => sum + tx.amount, 0);
  const avgPerDelivery = totalSpent / deliveries.length;

  // Calcular deliveries por mes
  const daysInPeriod = CONFIG.LOOKBACK_DAYS;
  const deliveriesPerMonth = (deliveries.length / daysInPeriod) * 30;

  // Agrupar por servicio
  const serviceStats = new Map<string, { count: number; total: number }>();

  for (const delivery of deliveries) {
    const serviceName = extractServiceName(delivery.description);
    const current = serviceStats.get(serviceName) || { count: 0, total: 0 };
    current.count++;
    current.total += delivery.amount;
    serviceStats.set(serviceName, current);
  }

  return {
    user_id: deliveries[0].user_id,
    total_deliveries: deliveries.length,
    deliveries_per_month: Math.round(deliveriesPerMonth),
    total_spent: totalSpent,
    monthly_average: (totalSpent / daysInPeriod) * 30,
    avg_per_delivery: avgPerDelivery,
    top_services: serviceStats,
    transaction_ids: deliveries.map((tx) => tx.id),
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

    console.log("🤖 BOT-DETECT-DELIVERY: Iniciando...");

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

        // Analizar patrón de delivery
        const pattern = analyzeDeliveryPattern(transactions);

        if (!pattern) continue; // No hay patrón excesivo

        // Verificar si ya existe alerta similar
        const { data: existingAlerts } = await supabase
          .from("bot_alerts")
          .select("id")
          .eq("user_id", userId)
          .eq("bot_name", "bot-detect-delivery")
          .eq("status", "pending")
          .limit(1);

        if (existingAlerts && existingAlerts.length > 0) {
          console.log(`⏭️  Alerta duplicada para delivery, omitiendo...`);
          continue;
        }

        // Preparar top servicios
        const topServicesArray = Array.from(pattern.top_services.entries())
          .map(([name, stats]) => ({
            service: name,
            count: stats.count,
            total: stats.total,
          }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 3);

        // Calcular ahorro potencial (reducir a 10 deliveries/mes)
        const targetDeliveries = 10;
        const currentMonthly = pattern.monthly_average;
        const potentialSavings =
          pattern.deliveries_per_month > targetDeliveries
            ? ((pattern.deliveries_per_month - targetDeliveries) /
                pattern.deliveries_per_month) *
              currentMonthly
            : 0;

        // Crear alerta
        const alert = {
          user_id: userId,
          bot_name: "bot-detect-delivery",
          anomaly_type: "delivery_excesivo",
          severity: calculateSeverity(
            pattern.deliveries_per_month,
            pattern.monthly_average
          ),
          confidence_score: calculateConfidence(pattern.total_deliveries),
          payload: {
            total_deliveries: pattern.total_deliveries,
            deliveries_per_month: pattern.deliveries_per_month,
            total_spent: pattern.total_spent,
            monthly_average: pattern.monthly_average,
            avg_per_delivery: pattern.avg_per_delivery,
            top_services: topServicesArray,
            transaction_ids: pattern.transaction_ids,
            monthly_estimated_leak: potentialSavings,
            description: `Delivery excesivo: ${pattern.deliveries_per_month} pedidos/mes`,
            suggested_reduction: {
              target_deliveries: targetDeliveries,
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
            `🚨 Delivery excesivo detectado: ${pattern.deliveries_per_month} pedidos/mes ($${Math.round(pattern.monthly_average)})`
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
      bot_name: "bot-detect-delivery",
      batch_timestamp: new Date().toISOString(),
      users_processed: usersProcessed,
      alerts_generated: alertsGenerated,
      execution_time_ms: executionTime,
      errors_count: errors.length,
      error_details: errors,
    });

    console.log(`✅ BOT-DETECT-DELIVERY: Completado en ${executionTime}ms`);
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
    console.error("❌ Error en bot-detect-delivery:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
