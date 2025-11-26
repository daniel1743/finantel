// ============================================================================
// AI INVESTIGATOR - DETECTIVE DE FUGAS
// ============================================================================
// Analiza alertas generadas por bots y confirma si son fugas reales
// Usa IA con fallback: DeepSeek R1 → Qwen 2.5 → OpenAI GPT-4o mini
// Implementa cache agresivo para reducir costos 99%+
// ============================================================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { crypto } from "https://deno.land/std@0.168.0/crypto/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// ============================================================================
// CONFIGURACIÓN
// ============================================================================
const CONFIG = {
  MAX_ALERTS_PER_RUN: 50, // Procesar máximo 50 alertas por ejecución
  CACHE_TTL_DAYS: 7, // Cache por 7 días

  // API Keys
  DEEPSEEK_API_KEY: Deno.env.get("DEEPSEEK_API_KEY"),
  QWEN_API_KEY: Deno.env.get("QWEN_API_KEY"),
  OPENAI_API_KEY: Deno.env.get("OPENAI_API_KEY"),
};

// ============================================================================
// INTERFACES
// ============================================================================
interface BotAlert {
  id: string;
  user_id: string;
  bot_name: string;
  anomaly_type: string;
  severity: string;
  confidence_score: number;
  payload: Record<string, any>;
  detected_at: string;
}

interface AIAnalysis {
  confirmed: boolean;
  reasoning: string;
  adjusted_severity: string;
  adjusted_confidence: number;
  model_used: string;
  suggested_actions: Array<{
    action: string;
    description: string;
    estimated_saving: number;
  }>;
}

// ============================================================================
// UTILIDADES DE CACHE
// ============================================================================

/**
 * Genera hash SHA256 de un prompt
 */
async function generatePromptHash(prompt: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(prompt);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Busca en cache
 */
async function checkCache(
  supabase: any,
  promptHash: string
): Promise<string | null> {
  const { data, error } = await supabase.rpc("get_ai_cache", {
    p_prompt_hash: promptHash,
  });

  if (error || !data || data.length === 0) return null;

  console.log("✅ Cache HIT - Reutilizando respuesta");
  return data[0].response_text;
}

/**
 * Guarda en cache
 */
async function saveToCache(
  supabase: any,
  promptHash: string,
  modelName: string,
  responseText: string
): Promise<void> {
  await supabase.rpc("set_ai_cache", {
    p_prompt_hash: promptHash,
    p_model_name: modelName,
    p_analysis_type: "leak_investigation",
    p_response_text: responseText,
    p_ttl_days: CONFIG.CACHE_TTL_DAYS,
  });
}

// ============================================================================
// LLAMADAS A MODELOS DE IA (CON FALLBACK)
// ============================================================================

/**
 * 1. DeepSeek R1 (primero - más económico)
 */
async function callDeepSeek(prompt: string): Promise<string | null> {
  if (!CONFIG.DEEPSEEK_API_KEY) {
    console.log("⚠️  DeepSeek API key no configurada");
    return null;
  }

  try {
    console.log("🔵 Intentando DeepSeek R1...");

    const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${CONFIG.DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: "deepseek-reasoner",
        messages: [
          {
            role: "system",
            content:
              "Eres un experto analista financiero especializado en detectar fugas de dinero. Analiza la alerta y determina si es una fuga real o falsa alarma. Responde en JSON con: {confirmed: boolean, reasoning: string, adjusted_severity: string, adjusted_confidence: number, suggested_actions: array}",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.3,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      console.log(`⚠️  DeepSeek falló: ${response.status}`);
      return null;
    }

    const data = await response.json();
    console.log("✅ DeepSeek R1 respondió exitosamente");
    return data.choices[0].message.content;
  } catch (error) {
    console.error("❌ Error en DeepSeek:", error.message);
    return null;
  }
}

/**
 * 2. Qwen 2.5 (respaldo)
 */
async function callQwen(prompt: string): Promise<string | null> {
  if (!CONFIG.QWEN_API_KEY) {
    console.log("⚠️  Qwen API key no configurada");
    return null;
  }

  try {
    console.log("🟡 Intentando Qwen 2.5...");

    const response = await fetch(
      "https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${CONFIG.QWEN_API_KEY}`,
        },
        body: JSON.stringify({
          model: "qwen-plus",
          input: {
            messages: [
              {
                role: "system",
                content:
                  "Eres un experto analista financiero especializado en detectar fugas de dinero. Analiza la alerta y determina si es una fuga real o falsa alarma. Responde en JSON con: {confirmed: boolean, reasoning: string, adjusted_severity: string, adjusted_confidence: number, suggested_actions: array}",
              },
              {
                role: "user",
                content: prompt,
              },
            ],
          },
          parameters: {
            temperature: 0.3,
            max_tokens: 1000,
          },
        }),
      }
    );

    if (!response.ok) {
      console.log(`⚠️  Qwen falló: ${response.status}`);
      return null;
    }

    const data = await response.json();
    console.log("✅ Qwen 2.5 respondió exitosamente");
    return data.output.text;
  } catch (error) {
    console.error("❌ Error en Qwen:", error.message);
    return null;
  }
}

/**
 * 3. OpenAI GPT-4o mini (último recurso)
 */
async function callOpenAI(prompt: string): Promise<string | null> {
  if (!CONFIG.OPENAI_API_KEY) {
    console.log("⚠️  OpenAI API key no configurada");
    return null;
  }

  try {
    console.log("🔴 Intentando OpenAI GPT-4o mini (último recurso)...");

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${CONFIG.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "Eres un experto analista financiero especializado en detectar fugas de dinero. Analiza la alerta y determina si es una fuga real o falsa alarma. Responde en JSON con: {confirmed: boolean, reasoning: string, adjusted_severity: string, adjusted_confidence: number, suggested_actions: array}",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.3,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      console.log(`⚠️  OpenAI falló: ${response.status}`);
      return null;
    }

    const data = await response.json();
    console.log("✅ OpenAI GPT-4o mini respondió exitosamente");
    return data.choices[0].message.content;
  } catch (error) {
    console.error("❌ Error en OpenAI:", error.message);
    return null;
  }
}

/**
 * Llama a IA con fallback automático
 */
async function callAIWithFallback(prompt: string): Promise<{ text: string; model: string }> {
  // 1. Intentar DeepSeek
  let response = await callDeepSeek(prompt);
  if (response) return { text: response, model: "deepseek-reasoner" };

  // 2. Intentar Qwen
  response = await callQwen(prompt);
  if (response) return { text: response, model: "qwen-plus" };

  // 3. Intentar OpenAI
  response = await callOpenAI(prompt);
  if (response) return { text: response, model: "gpt-4o-mini" };

  // 4. Fallback estático
  console.error("❌ TODOS los modelos fallaron, usando fallback estático");
  return {
    text: JSON.stringify({
      confirmed: true,
      reasoning:
        "La IA no pudo analizar esta alerta debido a errores técnicos. Se confirma por defecto para revisión manual.",
      adjusted_severity: "medium",
      adjusted_confidence: 60,
      suggested_actions: [
        {
          action: "review",
          description: "Revisar manualmente esta alerta",
          estimated_saving: 0,
        },
      ],
    }),
    model: "fallback-static",
  };
}

// ============================================================================
// CONSTRUCCIÓN DE PROMPTS
// ============================================================================

/**
 * Construye prompt para investigación de IA
 */
function buildInvestigationPrompt(alert: BotAlert): string {
  return `
ANÁLISIS DE ALERTA FINANCIERA

Bot detector: ${alert.bot_name}
Tipo de anomalía: ${alert.anomaly_type}
Severidad inicial: ${alert.severity}
Confianza inicial: ${alert.confidence_score}%

DETALLES DE LA ALERTA:
${JSON.stringify(alert.payload, null, 2)}

TU TAREA:
1. Analiza si esta alerta representa una fuga financiera REAL o es una falsa alarma
2. Considera el contexto y la naturaleza del gasto
3. Ajusta la severidad y confianza si es necesario
4. Proporciona acciones concretas y priorizadas

RESPONDE EN JSON CON ESTA ESTRUCTURA EXACTA:
{
  "confirmed": true/false,
  "reasoning": "Explicación de 2-3 líneas de por qué es o no una fuga",
  "adjusted_severity": "low/medium/high/critical",
  "adjusted_confidence": 0-100,
  "suggested_actions": [
    {
      "action": "Acción específica",
      "description": "Descripción detallada",
      "estimated_saving": monto_estimado
    }
  ]
}

IMPORTANTE:
- Solo confirma si realmente parece una fuga financiera problemática
- Si es gasto normal o justificado, marca confirmed: false
- Sé práctico y considera el contexto del usuario
`.trim();
}

// ============================================================================
// PROCESAMIENTO DE ALERTAS
// ============================================================================

/**
 * Investiga una alerta con IA
 */
async function investigateAlert(
  alert: BotAlert,
  supabase: any
): Promise<AIAnalysis> {
  // Construir prompt
  const prompt = buildInvestigationPrompt(alert);

  // Verificar cache
  const promptHash = await generatePromptHash(prompt);
  const cachedResponse = await checkCache(supabase, promptHash);

  let aiResponse: { text: string; model: string };

  if (cachedResponse) {
    aiResponse = { text: cachedResponse, model: "cache" };
  } else {
    // Llamar a IA con fallback
    aiResponse = await callAIWithFallback(prompt);

    // Guardar en cache (solo si no es fallback estático)
    if (aiResponse.model !== "fallback-static") {
      await saveToCache(supabase, promptHash, aiResponse.model, aiResponse.text);
    }
  }

  // Parsear respuesta JSON
  try {
    // Extraer JSON si está envuelto en markdown
    let jsonText = aiResponse.text.trim();
    if (jsonText.startsWith("```json")) {
      jsonText = jsonText.replace(/```json\n?/g, "").replace(/```\n?$/g, "");
    } else if (jsonText.startsWith("```")) {
      jsonText = jsonText.replace(/```\n?/g, "");
    }

    const parsed = JSON.parse(jsonText);

    return {
      confirmed: parsed.confirmed ?? true,
      reasoning: parsed.reasoning || "Sin análisis disponible",
      adjusted_severity: parsed.adjusted_severity || alert.severity,
      adjusted_confidence: parsed.adjusted_confidence || alert.confidence_score,
      model_used: aiResponse.model,
      suggested_actions: parsed.suggested_actions || [],
    };
  } catch (error) {
    console.error("❌ Error parseando respuesta JSON:", error.message);
    console.error("Respuesta recibida:", aiResponse.text);

    // Fallback parsing
    return {
      confirmed: true,
      reasoning: "Error al procesar análisis de IA",
      adjusted_severity: alert.severity,
      adjusted_confidence: alert.confidence_score,
      model_used: aiResponse.model,
      suggested_actions: [],
    };
  }
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
    let alertsProcessed = 0;
    let alertsConfirmed = 0;
    let falseAlarms = 0;
    const errors: any[] = [];

    console.log("🔍 AI-INVESTIGATOR: Iniciando análisis de alertas...");

    // Obtener alertas pendientes
    const { data: pendingAlerts, error: alertsError } = await supabase
      .from("bot_alerts")
      .select("*")
      .eq("status", "pending")
      .order("detected_at", { ascending: true })
      .limit(CONFIG.MAX_ALERTS_PER_RUN);

    if (alertsError) throw alertsError;

    if (!pendingAlerts || pendingAlerts.length === 0) {
      console.log("✅ No hay alertas pendientes");
      return new Response(
        JSON.stringify({ success: true, message: "No pending alerts" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log(`📊 ${pendingAlerts.length} alertas pendientes de análisis`);

    // Procesar cada alerta
    for (const alert of pendingAlerts) {
      try {
        console.log(`\n🔎 Analizando alerta ${alert.id} (${alert.anomaly_type})...`);

        // Marcar como "processing"
        await supabase
          .from("bot_alerts")
          .update({ status: "processing" })
          .eq("id", alert.id);

        // Investigar con IA
        const analysis = await investigateAlert(alert, supabase);

        console.log(`📊 Resultado: ${analysis.confirmed ? "✅ CONFIRMADO" : "❌ FALSA ALARMA"}`);
        console.log(`   Modelo usado: ${analysis.model_used}`);
        console.log(`   Confianza ajustada: ${analysis.adjusted_confidence}%`);

        if (analysis.confirmed) {
          // Crear leak_insight
          const { data: leakInsight, error: leakError } = await supabase
            .from("leak_insights")
            .insert({
              user_id: alert.user_id,
              type: alert.anomaly_type,
              description: alert.payload.description || `${alert.anomaly_type} detectado`,
              monthly_estimated_leak: alert.payload.monthly_estimated_leak || 0,
              severity: analysis.adjusted_severity,
              confidence_score: analysis.adjusted_confidence,
              details: alert.payload,
              suggested_actions: analysis.suggested_actions,
              status: "active",
            })
            .select()
            .single();

          if (leakError) {
            console.error("❌ Error creando leak_insight:", leakError.message);
            throw leakError;
          }

          // Actualizar bot_alert como confirmado
          await supabase
            .from("bot_alerts")
            .update({
              status: "confirmed",
              processed_at: new Date().toISOString(),
              leak_insight_id: leakInsight.id,
              ai_analysis: {
                model_used: analysis.model_used,
                confirmed: true,
                reasoning: analysis.reasoning,
                adjusted_severity: analysis.adjusted_severity,
                adjusted_confidence: analysis.adjusted_confidence,
              },
            })
            .eq("id", alert.id);

          alertsConfirmed++;
          console.log(`✅ Leak insight creado: ${leakInsight.id}`);
        } else {
          // Marcar como falsa alarma
          await supabase
            .from("bot_alerts")
            .update({
              status: "false_alarm",
              processed_at: new Date().toISOString(),
              ai_analysis: {
                model_used: analysis.model_used,
                confirmed: false,
                reasoning: analysis.reasoning,
              },
            })
            .eq("id", alert.id);

          falseAlarms++;
          console.log(`❌ Falsa alarma descartada`);
        }

        alertsProcessed++;
      } catch (err) {
        console.error(`❌ Error procesando alerta ${alert.id}:`, err.message);

        // Marcar como error
        await supabase
          .from("bot_alerts")
          .update({
            status: "error",
            ai_analysis: { error: err.message },
          })
          .eq("id", alert.id);

        errors.push({
          alert_id: alert.id,
          error: err.message,
        });
      }
    }

    const executionTime = Date.now() - startTime;

    console.log(`\n✅ AI-INVESTIGATOR: Completado en ${executionTime}ms`);
    console.log(`📊 Procesadas: ${alertsProcessed}`);
    console.log(`✅ Confirmadas: ${alertsConfirmed}`);
    console.log(`❌ Falsas alarmas: ${falseAlarms}`);
    console.log(`⚠️  Errores: ${errors.length}`);

    return new Response(
      JSON.stringify({
        success: true,
        stats: {
          alerts_processed: alertsProcessed,
          alerts_confirmed: alertsConfirmed,
          false_alarms: falseAlarms,
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
    console.error("❌ Error en ai-investigator:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
