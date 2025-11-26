// 🎤 VOICE EXPENSE TRACKER CON CATEGORIZACIÓN CHATGPT
// Supabase Edge Function - Versión 3.0 FINAL
// ✅ Parser extrae monto (rápido, sin costo)
// ✅ ChatGPT categoriza (inteligente, bajo costo)
// ✅ Respeta el monto del usuario (sin validación de precios)
// ✅ Diferencia gasto vs ingreso
// ✅ Formateo correcto según país

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// ============================================================================
// 🤖 SISTEMA PROMPT PARA CHATGPT (CATEGORIZACIÓN SOLAMENTE)
// Basado en PROMPT-CHATGPT-CATEGORIZATION-ONLY.md
// ============================================================================
const CATEGORIZATION_SYSTEM_PROMPT = `You are an AI Financial Assistant for Finantel - a Latin American personal finance management platform.

Your PRIMARY ROLE:
- Categorize expenses based on product/service descriptions
- Assign necessity levels (essential, important, discretionary)
- Provide clean, professional descriptions
- NEVER validate or modify prices - the user knows what they paid
- ALWAYS respond in JSON format

### WHY WE DON'T VALIDATE PRICES:
Prices vary significantly based on:
- Store: Jumbo vs Lider vs local markets (same product, different prices)
- Region: Santiago vs Valparaíso vs rural areas
- Promotions: Sales, discounts, bulk purchases
- Brands: Premium vs generic
- Time: Seasonal variations

**THE USER'S AMOUNT IS ALWAYS CORRECT** - Your job is ONLY to categorize.

---

## CATEGORÍAS DISPONIBLES (9):

### **Alimentación** (Food & Groceries)
Keywords: jumbo, lider, santa isabel, tottus, unimarc, ekono, supermercado, super, verduras, frutas, pan, comida, alimentos, almacén, mercado, arepa, empanada, restaurante, almuerzo, cena, desayuno, snacks, bebidas, lácteos, carnes, pescado, dulces, harina

Necessity: **essential** (basic food) or **discretionary** (restaurants, snacks)

---

### **Salud** (Health & Medicine)
Keywords: farmacia, cruz verde, salcobrand, ahumada, doctor, médico, hospital, clínica, medicamento, remedios, dentista, consulta, examen, análisis, terapia, sicólogo, vitaminas, primeros auxilios

Necessity: **essential**

---

### **Transporte** (Transportation)
Keywords: uber, cabify, beat, didi, indriver, metro, bus, colectivo, taxi, combustible, bencina, copec, shell, peaje, estacionamiento, bicicleta, scooter, TAG, bip

Necessity: **important**

---

### **Vivienda** (Housing & Utilities)
Keywords: arriendo, alquiler, renta, luz, agua, gas, internet, celular, teléfono, wifi, cable, tv, streaming, condominio, administración, mantención, reparación

Necessity: **essential** (rent, utilities) or **important** (internet, phone)

---

### **Vestuario y Calzado** (Clothing & Footwear)
Keywords: zapatos, zapatillas, polera, pantalón, camisa, vestido, falabella, paris, ripley, h&m, zara, nike, adidas, ropa, calzado, accesorios, cartera, reloj, joyería, maquillaje, perfume

Necessity: **discretionary** (unless explicitly stated as "urgente" or "necesario")

---

### **Educación** (Education)
Keywords: colegio, universidad, curso, taller, libro, cuaderno, matrícula, mensualidad, útiles, mochila, profesor, clase, capacitación, diplomado, maestría, doctorado

Necessity: **important**

---

### **Entretenimiento** (Entertainment)
Keywords: cine, película, teatro, concierto, parque, juegos, videojuegos, play station, xbox, nintendo, spotify, netflix, disney, hbo, amazon prime, youtube premium, evento, fiesta, bar, discoteca

Necessity: **discretionary**

---

### **Tecnología** (Electronics & Tech)
Keywords: celular, teléfono, computador, laptop, tablet, audífonos, cargador, cable, mouse, teclado, monitor, impresora, cámara, televisor, smart tv, consola, chip, sim card, memoria, disco duro

Necessity: **important** (work/study devices) or **discretionary** (entertainment devices)

---

### **Otros** (Others)
Anything that doesn't fit above categories.

Necessity: **discretionary** (default)

---

## DETECT TRANSACTION TYPE

Check for keywords indicating income vs expense:

**INCOME keywords:**
cobré, cobro, recibí, me pagaron, me dieron, ingreso, ganancia, sueldo, salario, pago recibido, transferencia recibida, depósito, entrada, gané, me transfirieron, honorarios, comisión, propina, reembolso, devolución, venta

**EXPENSE keywords:**
gasté, gasto, pagué, pago, compré, di, salida, egresos, deduje, transferí, envié, perdí, multa, cargo, cuenta

**Default:** If no keyword found → expense

---

## RESPONSE FORMAT

**ALWAYS return valid JSON with this exact structure:**

{
  "status": "success",
  "transaction": {
    "type": "expense" | "income",
    "description": "Clean description",
    "category": "Alimentación",
    "necessity": "essential" | "important" | "discretionary"
  },
  "confidence": {
    "category": 0.95,
    "necessity": 0.90,
    "overall": 0.92
  },
  "reasoning": {
    "categoryMatch": "Keywords: arepa, empanada → Alimentación",
    "necessityReason": "Essential because it's basic food",
    "typeDetected": "expense (keyword: gasté)"
  },
  "metadata": {
    "keywordsFound": ["arepa", "empanada"],
    "language": "es"
  }
}

---

## IMPORTANT RULES

1. **NEVER modify the amount** - Accept user's amount as-is
2. **NEVER suggest alternative prices** - User knows what they paid
3. **NEVER validate if price is "correct"** - Prices vary everywhere
4. **Focus ONLY on categorization** - That's your job
5. **Be confident** - Use context clues to categorize intelligently
6. **Default to "Alimentación"** - When totally unsure, it's likely food
7. **Respect user language** - If Spanish input, Spanish categories
8. **Use regional awareness** - Lider, Jumbo are Chilean; Éxito is Colombian

---

## EXAMPLES:

**Input:** "Compré harina por 23 mil pesos"
**Output:**
{
  "status": "success",
  "transaction": {
    "type": "expense",
    "description": "Harina",
    "category": "Alimentación",
    "necessity": "essential"
  },
  "confidence": {
    "category": 0.98,
    "necessity": 0.95,
    "overall": 0.96
  },
  "reasoning": {
    "categoryMatch": "Keyword: harina → Alimentación (basic food ingredient)",
    "necessityReason": "Essential - basic food item",
    "typeDetected": "expense (keyword: compré)"
  },
  "metadata": {
    "keywordsFound": ["harina", "compré"],
    "language": "es"
  }
}

**Input:** "Uber al trabajo 15000"
**Output:**
{
  "status": "success",
  "transaction": {
    "type": "expense",
    "description": "Uber al trabajo",
    "category": "Transporte",
    "necessity": "important"
  },
  "confidence": {
    "category": 0.99,
    "necessity": 0.92,
    "overall": 0.95
  },
  "reasoning": {
    "categoryMatch": "Keyword: uber → Transporte",
    "necessityReason": "Important - work-related transport",
    "typeDetected": "expense (implicit)"
  },
  "metadata": {
    "keywordsFound": ["uber", "trabajo"],
    "language": "es"
  }
}

**Input:** "Cobré 50000 de freelance"
**Output:**
{
  "status": "success",
  "transaction": {
    "type": "income",
    "description": "Freelance",
    "category": "Otros",
    "necessity": "discretionary"
  },
  "confidence": {
    "category": 0.70,
    "necessity": 0.80,
    "overall": 0.75
  },
  "reasoning": {
    "categoryMatch": "Income → Otros",
    "necessityReason": "Income doesn't have necessity level",
    "typeDetected": "income (keyword: cobré)"
  },
  "metadata": {
    "keywordsFound": ["cobré", "freelance"],
    "language": "es"
  }
}

END OF SYSTEM PROMPT`;

// ============================================================================
// 🔧 PARSER DE GASTOS (Extrae monto del texto transcrito)
// ============================================================================
function parseAmount(text: string, userCurrency: string = "CLP"): number {
  const lowerText = text.toLowerCase().trim();
  let amount = 0;

  console.log("🔍 Parseando monto:", text);

  // Patrón 0: Formato monetario "$28,000" o "$28.000" (PRIMERO)
  if (!amount) {
    const moneyFormatMatch = text.match(/\$\s*(\d{1,3}(?:[.,]\d{3})+)/i);
    if (moneyFormatMatch) {
      const cleanNumber = moneyFormatMatch[1].replace(/[.,]/g, "");
      amount = parseInt(cleanNumber);
      console.log(`✅ Monto detectado (formato monetario): ${amount} ${userCurrency}`);
    }
  }

  // Patrón 1: "60 mil", "50 mil pesos"
  if (!amount) {
    const milMatch = lowerText.match(/(\d+)\s*mil(?:\s+pesos)?/i);
    if (milMatch) {
      amount = parseInt(milMatch[1]) * 1000;
      console.log(`✅ Monto detectado (mil): ${amount} ${userCurrency}`);
    }
  }

  // Patrón 2: "50k"
  if (!amount) {
    const kMatch = lowerText.match(/(\d+)\s*k\b/i);
    if (kMatch) {
      amount = parseInt(kMatch[1]) * 1000;
      console.log(`✅ Monto detectado (k): ${amount} ${userCurrency}`);
    }
  }

  // Patrón 3: Separadores sin $: "50.000", "50,000"
  if (!amount) {
    const separatorMatch = lowerText.match(/\b(\d{1,3}(?:[.,]\d{3})+)\b/);
    if (separatorMatch) {
      const cleanNumber = separatorMatch[1].replace(/[.,]/g, "");
      amount = parseInt(cleanNumber);
      console.log(`✅ Monto detectado (separadores): ${amount} ${userCurrency}`);
    }
  }

  // Patrón 4: Números directos grandes (4+ dígitos)
  if (!amount) {
    const directMatch = lowerText.match(/\b(\d{4,})\b/);
    if (directMatch) {
      amount = parseInt(directMatch[1]);
      console.log(`✅ Monto detectado (directo): ${amount} ${userCurrency}`);
    }
  }

  // Patrón 5: Palabras numéricas
  if (!amount) {
    const palabrasNumericas: { [key: string]: number } = {
      "un millón": 1000000,
      "medio millón": 500000,
      "doscientos mil": 200000,
      "cien mil": 100000,
      "cincuenta mil": 50000,
      "cuarenta mil": 40000,
      "treinta mil": 30000,
      "veinte mil": 20000,
      "quince mil": 15000,
      "diez mil": 10000,
      "cinco mil": 5000,
      "tres mil": 3000,
      "dos mil": 2000,
      mil: 1000,
    };

    for (const [palabra, valor] of Object.entries(palabrasNumericas)) {
      if (lowerText.includes(palabra)) {
        amount = valor;
        console.log(`✅ Monto detectado (palabra): ${amount} ${userCurrency}`);
        break;
      }
    }
  }

  // Patrón 6: Números pequeños (último recurso)
  if (!amount) {
    const smallNumberMatch = lowerText.match(/\b(\d{1,3})\b/);
    if (smallNumberMatch) {
      amount = parseInt(smallNumberMatch[1]);
      console.log(`⚠️ Monto detectado (número pequeño): ${amount} ${userCurrency}`);
    }
  }

  return amount;
}

// ============================================================================
// 🎯 LLAMADA A CHATGPT PARA CATEGORIZACIÓN
// ============================================================================
async function categorizarConChatGPT(
  text: string,
  openaiApiKey: string
): Promise<{
  transaction: {
    type: string;
    description: string;
    category: string;
    necessity: string;
  };
  confidence: {
    category: number;
    necessity: number;
    overall: number;
  };
  reasoning: {
    categoryMatch: string;
    necessityReason: string;
    typeDetected: string;
  };
  metadata: {
    keywordsFound: string[];
    language: string;
  };
}> {
  try {
    console.log("🤖 Enviando a ChatGPT para categorización...");

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${openaiApiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini", // Modelo económico y rápido
        messages: [
          {
            role: "system",
            content: CATEGORIZATION_SYSTEM_PROMPT,
          },
          {
            role: "user",
            content: text,
          },
        ],
        temperature: 0.2, // Baja temperatura para respuestas consistentes
        max_tokens: 400,
        response_format: { type: "json_object" }, // Fuerza respuesta JSON
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Error ChatGPT:", errorText);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    const parsed = JSON.parse(content);

    console.log("✅ ChatGPT categorización:", JSON.stringify(parsed, null, 2));

    // Validar respuesta
    if (!parsed.transaction || !parsed.transaction.category) {
      throw new Error("Invalid ChatGPT response format");
    }

    return parsed;
  } catch (error) {
    console.error("Error en categorización ChatGPT:", error);
    // Fallback a categoría por defecto
    return {
      transaction: {
        type: "expense",
        description: text.substring(0, 50),
        category: "Otros",
        necessity: "discretionary",
      },
      confidence: {
        category: 0.5,
        necessity: 0.5,
        overall: 0.5,
      },
      reasoning: {
        categoryMatch: "Error en categorización → Otros",
        necessityReason: "Default discretionary",
        typeDetected: "expense (default)",
      },
      metadata: {
        keywordsFound: [],
        language: "es",
      },
    };
  }
}

// ============================================================================
// 🎤 TRANSCRIPCIÓN DE AUDIO CON WHISPER
// ============================================================================
async function transcribeAudio(audioBlob: Blob, openaiApiKey: string): Promise<string> {
  console.log("🎤 Enviando audio a Whisper...");

  const formData = new FormData();
  formData.append("file", audioBlob, "audio.webm");
  formData.append("model", "whisper-1");
  formData.append("language", "es");

  const response = await fetch("https://api.openai.com/v1/audio/transcriptions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${openaiApiKey}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("❌ Error Whisper:", errorText);
    throw new Error(`Whisper API error: ${response.status}`);
  }

  const data = await response.json();
  return data.text || "";
}

// ============================================================================
// 🚀 MAIN HANDLER
// ============================================================================
serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // 1. Validar variables de entorno
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const openaiApiKey = Deno.env.get("OPENAI_API_KEY");

    if (!supabaseUrl || !supabaseServiceKey || !openaiApiKey) {
      throw new Error("Missing environment variables");
    }

    // 2. Obtener datos del FormData
    const formData = await req.formData();
    const audioFile = formData.get("audio") as File;
    const userId = formData.get("userId") as string;

    if (!audioFile || !userId) {
      return new Response(
        JSON.stringify({ error: "Missing audio or userId" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("✅ Audio recibido:", audioFile.size, "bytes");
    console.log("✅ ID de usuario:", userId);

    // 3. Crear cliente Supabase
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 4. Obtener moneda del usuario
    const { data: prefs } = await supabase
      .from("profile_preferences")
      .select("currency")
      .eq("user_id", userId)
      .maybeSingle();

    const userCurrency = prefs?.currency || "USD";
    console.log("💰 Moneda del usuario:", userCurrency);

    // 5. Transcribir audio con Whisper
    const transcription = await transcribeAudio(audioFile, openaiApiKey);
    console.log("✅ Transcripción:", transcription);

    if (!transcription) {
      return new Response(
        JSON.stringify({ error: "No se pudo transcribir el audio" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 6. Extraer monto del texto transcrito (PARSER LOCAL)
    const amount = parseAmount(transcription, userCurrency);

    if (!amount || amount <= 0) {
      return new Response(
        JSON.stringify({
          error: 'No detecté el monto. Intenta: "Comida 50 mil pesos" o "Gasté $50,000"',
          transcription,
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 7. Categorizar con ChatGPT (SOLO CATEGORIZACIÓN)
    const chatGptResult = await categorizarConChatGPT(transcription, openaiApiKey);

    const transactionType = chatGptResult.transaction?.type || "expense";
    const description = chatGptResult.transaction?.description || transcription.slice(0, 50);
    const categoryName = chatGptResult.transaction?.category || "Otros";
    const necessityLevel = chatGptResult.transaction?.necessity || "discretionary";

    console.log("📊 Resultado final:", {
      amount,
      description,
      category: categoryName,
      necessity: necessityLevel,
      type: transactionType,
      confidence: chatGptResult.confidence,
    });

    // 8. Buscar categoría en base de datos
    const { data: categories } = await supabase
      .from("categories")
      .select("id, name")
      .eq("user_id", userId)
      .ilike("name", `%${categoryName}%`)
      .limit(1);

    let categoryId = categories?.[0]?.id || null;

    if (!categoryId) {
      const { data: otros } = await supabase
        .from("categories")
        .select("id")
        .eq("user_id", userId)
        .ilike("name", "otros")
        .limit(1);

      categoryId = otros?.[0]?.id || null;

      if (categoryId) {
        console.log('⚠️ Categoría no encontrada, usando "Otros":', categoryId);
      }
    }

    // 9. Insertar transacción en la base de datos
    const { data: transaction, error: txError } = await supabase
      .from("transactions")
      .insert({
        user_id: userId,
        amount: amount, // ← MONTO DEL USUARIO (NO VALIDADO)
        description: description,
        category_id: categoryId,
        type: transactionType,
        currency: userCurrency,
        necessity_level: necessityLevel,
        date: new Date().toISOString().split("T")[0],
        payment_method: "cash",
        metadata: {
          created_via: "voice",
          transcript: transcription,
          parsed_category: categoryName,
          transcription_service: "openai-whisper",
          categorization_service: "openai-chatgpt",
          chatgpt_confidence: chatGptResult.confidence,
          chatgpt_reasoning: chatGptResult.reasoning,
          chatgpt_metadata: chatGptResult.metadata,
          chatgpt_model: "gpt-4o-mini",
        },
      })
      .select()
      .single();

    if (txError) {
      console.error("❌ Error al insertar:", txError);
      throw new Error("Error al guardar: " + txError.message);
    }

    console.log("✅ Transacción creada:", transaction.id);

    // 10. Respuesta exitosa
    return new Response(
      JSON.stringify({
        success: true,
        message: "Transacción creada con ChatGPT",
        transcription,
        parsed: {
          amount,
          description,
          category: categoryName,
          necessity: necessityLevel,
          type: transactionType,
        },
        chatgpt: chatGptResult,
        transaction,
        currency: userCurrency,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("❌ Error:", error);
    return new Response(
      JSON.stringify({
        error: error.message || "Internal server error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
