// ============================================================================
// LEAK HUNTER AI - Edge Function
// ============================================================================
// Detecta gastos "fuga" invisibles: suscripciones ocultas, delivery excesivo,
// compras nocturnas, servicios duplicados, etc.
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
  type: "income" | "expense";
  date: string;
  created_at: string;
  categories?: {
    name: string;
  };
}

interface LeakInsight {
  user_id: string;
  type: string;
  description: string;
  monthly_estimated_leak: number;
  severity: "low" | "medium" | "high" | "critical";
  confidence_score: number;
  details: any;
  suggested_actions: any[];
}

interface SubscriptionPattern {
  service_name: string;
  category: string;
  aliases: string[];
  typical_amount_min: number;
  typical_amount_max: number;
  common_duplicates: string[];
  has_free_tier: boolean;
}

// ============================================================================
// HELPER: Detectar suscripciones ocultas
// ============================================================================
function detectHiddenSubscriptions(transactions: Transaction[]): LeakInsight[] {
  const insights: LeakInsight[] = [];

  // Agrupar transacciones por descripción similar y monto
  const groups: { [key: string]: Transaction[] } = {};

  transactions.forEach((tx) => {
    // Normalizar descripción
    const normalizedDesc = tx.description
      .toLowerCase()
      .replace(/[0-9]/g, "")
      .replace(/\s+/g, " ")
      .trim()
      .substring(0, 30);

    const key = `${normalizedDesc}_${Math.round(tx.amount / 1000) * 1000}`;

    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(tx);
  });

  // Buscar patrones de recurrencia
  Object.entries(groups).forEach(([key, txs]) => {
    if (txs.length >= 3) {
      // Al menos 3 transacciones similares

      // Verificar si son mensuales
      const dates = txs.map((t) => new Date(t.date)).sort((a, b) => a.getTime() - b.getTime());
      const intervals: number[] = [];

      for (let i = 1; i < dates.length; i++) {
        const diff = (dates[i].getTime() - dates[i - 1].getTime()) / (1000 * 60 * 60 * 24);
        intervals.push(diff);
      }

      // Promedio de días entre transacciones
      const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;

      // Si el promedio es cercano a 30 días (±7 días), es mensual
      if (avgInterval >= 23 && avgInterval <= 37) {
        const avgAmount = txs.reduce((sum, t) => sum + t.amount, 0) / txs.length;

        insights.push({
          user_id: txs[0].user_id,
          type: "suscripcion_oculta",
          description: `Suscripción recurrente detectada: "${txs[0].description.substring(0, 40)}"`,
          monthly_estimated_leak: avgAmount,
          severity: avgAmount > 15000 ? "high" : avgAmount > 8000 ? "medium" : "low",
          confidence_score: Math.min(95, 70 + txs.length * 5),
          details: {
            service_name: txs[0].description,
            amount: avgAmount,
            frequency: "monthly",
            pattern_detected: `${txs.length} cargos en los últimos ${Math.round(
              (dates[dates.length - 1].getTime() - dates[0].getTime()) / (1000 * 60 * 60 * 24)
            )} días`,
            last_charges: txs.slice(-3).map((t) => ({
              date: t.date,
              amount: t.amount,
            })),
            avg_interval_days: Math.round(avgInterval),
            transactions_ids: txs.map((t) => t.id),
          },
          suggested_actions: [
            {
              action: "review",
              description: "Revisar si aún usas este servicio",
              estimated_saving: 0,
            },
            {
              action: "cancel",
              description: "Cancelar si no lo usas",
              estimated_saving: avgAmount,
            },
          ],
        });
      }
    }
  });

  return insights;
}

// ============================================================================
// HELPER: Detectar delivery excesivo
// ============================================================================
function detectExcessiveDelivery(transactions: Transaction[]): LeakInsight[] {
  const insights: LeakInsight[] = [];

  // Keywords de delivery
  const deliveryKeywords = [
    "uber eats",
    "ubereats",
    "rappi",
    "pedidosya",
    "pedidos ya",
    "delivery",
    "ifood",
    "cornershop",
    "justo",
    "getir",
  ];

  // Filtrar transacciones de delivery
  const deliveryTxs = transactions.filter((tx) =>
    deliveryKeywords.some((keyword) => tx.description.toLowerCase().includes(keyword))
  );

  if (deliveryTxs.length === 0) return insights;

  // Calcular estadísticas
  const totalDeliveries = deliveryTxs.length;
  const totalAmount = deliveryTxs.reduce((sum, tx) => sum + tx.amount, 0);
  const avgAmount = totalAmount / totalDeliveries;

  // Período de análisis (en meses)
  const oldestDate = new Date(Math.min(...deliveryTxs.map((tx) => new Date(tx.date).getTime())));
  const newestDate = new Date(Math.max(...deliveryTxs.map((tx) => new Date(tx.date).getTime())));
  const monthsDiff = (newestDate.getTime() - oldestDate.getTime()) / (1000 * 60 * 60 * 24 * 30);

  const deliveriesPerMonth = totalDeliveries / Math.max(monthsDiff, 1);
  const monthlyAvg = totalAmount / Math.max(monthsDiff, 1);

  // Umbral: más de 12 deliveries/mes = excesivo
  if (deliveriesPerMonth > 12) {
    insights.push({
      user_id: deliveryTxs[0].user_id,
      type: "delivery_excesivo",
      description: `Estás gastando aprox. $${Math.round(
        monthlyAvg
      ).toLocaleString()} al mes en delivery`,
      monthly_estimated_leak: monthlyAvg,
      severity:
        deliveriesPerMonth > 25
          ? "critical"
          : deliveriesPerMonth > 18
          ? "high"
          : "medium",
      confidence_score: 90,
      details: {
        total_deliveries: totalDeliveries,
        deliveries_per_month: Math.round(deliveriesPerMonth * 10) / 10,
        total_spent: totalAmount,
        monthly_average: monthlyAvg,
        avg_per_delivery: avgAmount,
        period_months: Math.round(monthsDiff * 10) / 10,
        top_services: getTopDeliveryServices(deliveryTxs),
      },
      suggested_actions: [
        {
          action: "reduce",
          description: `Reducir delivery a 8/mes ahorraría aprox. $${Math.round(
            monthlyAvg * 0.33
          ).toLocaleString()}/mes`,
          estimated_saving: monthlyAvg * 0.33,
        },
        {
          action: "meal_prep",
          description: "Planificar comidas puede ahorrar hasta 70%",
          estimated_saving: monthlyAvg * 0.7,
        },
        {
          action: "subscription",
          description:
            "Si pides mucho, considera suscripción para envíos gratis",
          estimated_saving: monthlyAvg * 0.15,
        },
      ],
    });
  }

  return insights;
}

function getTopDeliveryServices(txs: Transaction[]): any[] {
  const services: { [key: string]: { count: number; total: number } } = {};

  txs.forEach((tx) => {
    let service = "Otros";
    if (tx.description.toLowerCase().includes("uber eats")) service = "Uber Eats";
    else if (tx.description.toLowerCase().includes("rappi")) service = "Rappi";
    else if (tx.description.toLowerCase().includes("pedidosya"))
      service = "PedidosYa";
    else if (tx.description.toLowerCase().includes("ifood")) service = "iFood";

    if (!services[service]) {
      services[service] = { count: 0, total: 0 };
    }
    services[service].count++;
    services[service].total += tx.amount;
  });

  return Object.entries(services)
    .map(([name, data]) => ({
      name,
      count: data.count,
      total: data.total,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 3);
}

// ============================================================================
// HELPER: Detectar compras nocturnas
// ============================================================================
function detectNightPurchases(transactions: Transaction[]): LeakInsight[] {
  const insights: LeakInsight[] = [];

  // Filtrar compras entre 22:00 y 03:00
  const nightPurchases = transactions.filter((tx) => {
    const hour = new Date(tx.created_at).getHours();
    return hour >= 22 || hour <= 3;
  });

  if (nightPurchases.length === 0) return insights;

  // Filtrar solo categorías de ocio/snacks/entretenimiento
  const impulsiveNightPurchases = nightPurchases.filter((tx) => {
    const desc = tx.description.toLowerCase();
    const impulsiveKeywords = [
      "delivery",
      "uber eats",
      "rappi",
      "snack",
      "dulce",
      "juego",
      "app",
      "steam",
      "playstation",
      "netflix",
      "spotify",
    ];
    return impulsiveKeywords.some((k) => desc.includes(k));
  });

  const totalNightPurchases = impulsiveNightPurchases.length;
  const totalAmount = impulsiveNightPurchases.reduce((sum, tx) => sum + tx.amount, 0);

  // Período de análisis
  const oldestDate = new Date(
    Math.min(...impulsiveNightPurchases.map((tx) => new Date(tx.created_at).getTime()))
  );
  const newestDate = new Date(
    Math.max(...impulsiveNightPurchases.map((tx) => new Date(tx.created_at).getTime()))
  );
  const monthsDiff =
    (newestDate.getTime() - oldestDate.getTime()) / (1000 * 60 * 60 * 24 * 30);

  const purchasesPerMonth = totalNightPurchases / Math.max(monthsDiff, 1);
  const monthlyAvg = totalAmount / Math.max(monthsDiff, 1);

  // Umbral: más de 8 compras nocturnas/mes = patrón de gasto emocional
  if (purchasesPerMonth > 8) {
    insights.push({
      user_id: impulsiveNightPurchases[0].user_id,
      type: "compras_nocturnas",
      description: `${totalNightPurchases} compras impulsivas entre 10pm-3am en ${Math.round(
        monthsDiff
      )} meses`,
      monthly_estimated_leak: monthlyAvg,
      severity: purchasesPerMonth > 15 ? "high" : "medium",
      confidence_score: 85,
      details: {
        total_night_purchases: totalNightPurchases,
        purchases_per_month: Math.round(purchasesPerMonth * 10) / 10,
        total_spent: totalAmount,
        monthly_average: monthlyAvg,
        avg_per_purchase: totalAmount / totalNightPurchases,
        peak_hours: getPeakHours(impulsiveNightPurchases),
      },
      suggested_actions: [
        {
          action: "awareness",
          description:
            "Reconocer el patrón: compras nocturnas suelen ser emocionales",
          estimated_saving: 0,
        },
        {
          action: "delay",
          description: "Esperar hasta mañana antes de comprar",
          estimated_saving: monthlyAvg * 0.6,
        },
        {
          action: "limits",
          description: "Establecer límite de gasto nocturno en apps",
          estimated_saving: monthlyAvg * 0.4,
        },
      ],
    });
  }

  return insights;
}

function getPeakHours(txs: Transaction[]): any[] {
  const hours: { [key: number]: number } = {};

  txs.forEach((tx) => {
    const hour = new Date(tx.created_at).getHours();
    hours[hour] = (hours[hour] || 0) + 1;
  });

  return Object.entries(hours)
    .map(([hour, count]) => ({ hour: parseInt(hour), count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 3);
}

// ============================================================================
// HELPER: Detectar servicios duplicados
// ============================================================================
async function detectDuplicateServices(
  userId: string,
  supabase: any
): Promise<LeakInsight[]> {
  const insights: LeakInsight[] = [];

  // Obtener suscripciones duplicadas usando la función SQL
  const { data: duplicates } = await supabase.rpc(
    "detect_duplicate_subscriptions",
    {
      p_user_id: userId,
    }
  );

  if (!duplicates || duplicates.length === 0) return insights;

  duplicates.forEach((dup: any) => {
    insights.push({
      user_id: userId,
      type: "suscripcion_duplicada",
      description: `Tienes ${dup.service1} y ${dup.service2} al mismo tiempo (${dup.category})`,
      monthly_estimated_leak: dup.monthly_cost / 2, // Potencial ahorro cancelando uno
      severity: dup.monthly_cost > 20000 ? "high" : "medium",
      confidence_score: 95,
      details: {
        service1: dup.service1,
        service2: dup.service2,
        category: dup.category,
        combined_monthly_cost: dup.monthly_cost,
      },
      suggested_actions: [
        {
          action: "cancel_one",
          description: `Cancelar ${dup.service2} (menos usado)`,
          estimated_saving: dup.monthly_cost / 2,
        },
        {
          action: "review_usage",
          description: "Revisar cuál usas más y cancelar el otro",
          estimated_saving: dup.monthly_cost / 2,
        },
      ],
    });
  });

  return insights;
}

// ============================================================================
// HELPER: Detectar microcompras acumuladas
// ============================================================================
function detectAccumulatedMicroPurchases(transactions: Transaction[]): LeakInsight[] {
  const insights: LeakInsight[] = [];

  // Filtrar microcompras (menos de 5000)
  const microPurchases = transactions.filter(
    (tx) => tx.type === "expense" && tx.amount < 5000
  );

  if (microPurchases.length === 0) return insights;

  const totalMicro = microPurchases.reduce((sum, tx) => sum + tx.amount, 0);

  // Período
  const oldestDate = new Date(
    Math.min(...microPurchases.map((tx) => new Date(tx.date).getTime()))
  );
  const newestDate = new Date(
    Math.max(...microPurchases.map((tx) => new Date(tx.date).getTime()))
  );
  const monthsDiff = (newestDate.getTime() - oldestDate.getTime()) / (1000 * 60 * 60 * 24 * 30);

  const microPerMonth = microPurchases.length / Math.max(monthsDiff, 1);
  const monthlyAvg = totalMicro / Math.max(monthsDiff, 1);

  // Umbral: más de 20 microcompras/mes
  if (microPerMonth > 20) {
    insights.push({
      user_id: microPurchases[0].user_id,
      type: "microcompras_acumuladas",
      description: `${Math.round(microPerMonth)} microcompras/mes suman $${Math.round(
        monthlyAvg
      ).toLocaleString()}`,
      monthly_estimated_leak: monthlyAvg * 0.3, // Potencial ahorro reduciendo 30%
      severity: monthlyAvg > 50000 ? "high" : "medium",
      confidence_score: 80,
      details: {
        total_micro_purchases: microPurchases.length,
        micro_per_month: Math.round(microPerMonth * 10) / 10,
        total_spent: totalMicro,
        monthly_average: monthlyAvg,
        avg_per_micro: totalMicro / microPurchases.length,
      },
      suggested_actions: [
        {
          action: "track",
          description: "Anotar cada microcompra antes de hacerla",
          estimated_saving: monthlyAvg * 0.2,
        },
        {
          action: "eliminate",
          description: "Eliminar 30% de microcompras innecesarias",
          estimated_saving: monthlyAvg * 0.3,
        },
      ],
    });
  }

  return insights;
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
    const { user_id } = await req.json();

    if (!user_id) {
      return new Response(JSON.stringify({ error: "user_id is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`🔍 Hunting leaks for user: ${user_id}`);

    // Período de análisis: últimos 6 meses
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    // 1. Obtener transacciones del período
    const { data: transactions, error: txError } = await supabase
      .from("transactions")
      .select("*, categories(name)")
      .eq("user_id", user_id)
      .gte("date", sixMonthsAgo.toISOString().split("T")[0])
      .eq("type", "expense")
      .order("date", { ascending: false });

    if (txError) throw txError;

    console.log(`📊 Analyzing ${transactions?.length || 0} transactions`);

    if (!transactions || transactions.length < 10) {
      return new Response(
        JSON.stringify({
          error: "Not enough data",
          message: "Se necesitan al menos 10 transacciones para detectar fugas",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // 2. Ejecutar detecciones
    const allInsights: LeakInsight[] = [];

    // Detectar suscripciones ocultas
    console.log("🔎 Detecting hidden subscriptions...");
    const hiddenSubs = detectHiddenSubscriptions(transactions as Transaction[]);
    allInsights.push(...hiddenSubs);

    // Detectar delivery excesivo
    console.log("🍔 Detecting excessive delivery...");
    const excessiveDelivery = detectExcessiveDelivery(transactions as Transaction[]);
    allInsights.push(...excessiveDelivery);

    // Detectar compras nocturnas
    console.log("🌙 Detecting night purchases...");
    const nightPurchases = detectNightPurchases(transactions as Transaction[]);
    allInsights.push(...nightPurchases);

    // Detectar servicios duplicados
    console.log("🔁 Detecting duplicate services...");
    const duplicates = await detectDuplicateServices(user_id, supabase);
    allInsights.push(...duplicates);

    // Detectar microcompras
    console.log("💸 Detecting accumulated micro-purchases...");
    const microPurchases = detectAccumulatedMicroPurchases(transactions as Transaction[]);
    allInsights.push(...microPurchases);

    console.log(`✅ Found ${allInsights.length} leaks`);

    // 3. Guardar o actualizar insights en la BD
    const upsertPromises = allInsights.map((insight) =>
      supabase.from("leak_insights").upsert(
        {
          ...insight,
          last_detected_at: new Date().toISOString(),
          status: "active",
        },
        {
          onConflict: "user_id,type,details->service_name",
        }
      )
    );

    await Promise.all(upsertPromises);

    // 4. Calcular total de fugas
    const totalMonthlyLeak = allInsights.reduce(
      (sum, i) => sum + i.monthly_estimated_leak,
      0
    );

    // 5. Respuesta
    return new Response(
      JSON.stringify({
        success: true,
        summary: {
          total_leaks_found: allInsights.length,
          total_monthly_leak: Math.round(totalMonthlyLeak),
          total_yearly_leak: Math.round(totalMonthlyLeak * 12),
          breakdown: {
            suscripcion_oculta: allInsights.filter((i) => i.type === "suscripcion_oculta")
              .length,
            delivery_excesivo: allInsights.filter((i) => i.type === "delivery_excesivo")
              .length,
            compras_nocturnas: allInsights.filter((i) => i.type === "compras_nocturnas")
              .length,
            suscripcion_duplicada: allInsights.filter(
              (i) => i.type === "suscripcion_duplicada"
            ).length,
            microcompras_acumuladas: allInsights.filter(
              (i) => i.type === "microcompras_acumuladas"
            ).length,
          },
        },
        leaks: allInsights,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("❌ Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
