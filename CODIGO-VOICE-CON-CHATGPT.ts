// Edge Function: voice-to-transaction-with-chatgpt
// VERSIÓN CON CHATGPT - Categorización inteligente
// ✅ Parser para monto (rápido, sin costo)
// ✅ ChatGPT para categorización (inteligente, bajo costo)
// ✅ Respeta el monto del usuario (sin validación de precios)

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// ====================================
// CONFIGURACIÓN DE MONEDAS
// ====================================
const CURRENCY_CONFIG = {
  'CLP': { symbol: '$', name: 'Peso Chileno', decimals: 0 },
  'COP': { symbol: '$', name: 'Peso Colombiano', decimals: 0 },
  'USD': { symbol: '$', name: 'Dólar', decimals: 2 },
  'EUR': { symbol: '€', name: 'Euro', decimals: 2 },
  'MXN': { symbol: '$', name: 'Peso Mexicano', decimals: 2 },
  'ARS': { symbol: '$', name: 'Peso Argentino', decimals: 2 },
  'PEN': { symbol: 'S/', name: 'Sol Peruano', decimals: 2 },
};

// ====================================
// PROMPT DE CHATGPT (SOLO CATEGORIZACIÓN)
// ====================================
const CHATGPT_SYSTEM_PROMPT = `You are an AI Financial Assistant for Finantel - a Latin American personal finance management platform.

Your PRIMARY ROLE:
- Categorize expenses based on product/service descriptions
- Assign necessity levels (essential, important, discretionary)
- Extract clean descriptions from voice notes
- NEVER validate or question the amount - the user knows what they paid
- ALWAYS respond in JSON format

CATEGORIES:
1. Alimentación (Food): jumbo, lider, supermercado, arepa, empanada, comida, restaurante → essential (basic food) or discretionary (restaurants)
2. Salud (Health): farmacia, doctor, medicamento, hospital → essential
3. Transporte (Transport): uber, taxi, metro, bus, bencina → important
4. Vivienda (Housing): arriendo, luz, agua, gas, internet → essential (utilities) or important (internet)
5. Vestuario (Clothing): zapatos, ropa, zara, nike → discretionary
6. Educación (Education): colegio, universidad, libros, curso → important
7. Entretenimiento (Entertainment): cine, netflix, spotify → discretionary
8. Tecnología (Tech): celular, computador, audífonos → important
9. Otros (Others): anything else → discretionary

TRANSACTION TYPES:
- INCOME: cobré, recibí, me pagaron, sueldo, ingreso, ganancia, propina
- EXPENSE: gasté, pagué, compré, di (default if no keyword)

RESPONSE FORMAT (valid JSON only):
{
  "status": "success",
  "transaction": {
    "type": "expense" | "income",
    "description": "Clean description without amounts or filler words",
    "category": "Alimentación",
    "necessity": "essential" | "important" | "discretionary"
  },
  "confidence": {
    "category": 0.95,
    "necessity": 0.90,
    "overall": 0.92
  }
}

RULES:
1. NEVER modify the amount
2. Focus ONLY on categorization
3. Remove filler words from description
4. Default to "Alimentación" if unsure
5. Return ONLY valid JSON (no text before/after)
`;

// ====================================
// PARSER DE MONTO (RÁPIDO, SIN COSTO)
// ====================================
function parseAmount(text: string, userCurrency: string = 'CLP'): number {
  const lowerText = text.toLowerCase().trim();
  let amount = 0;

  console.log('🔍 Parseando monto:', text);

  // Patrón 0: Formato monetario "$28,000" o "$28.000" (PRIMERO)
  if (!amount) {
    const moneyFormatMatch = text.match(/\$\s*(\d{1,3}(?:[.,]\d{3})+)/i);
    if (moneyFormatMatch) {
      const cleanNumber = moneyFormatMatch[1].replace(/[.,]/g, '');
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
      const cleanNumber = separatorMatch[1].replace(/[.,]/g, '');
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
      'un millón': 1000000, 'medio millón': 500000,
      'doscientos mil': 200000, 'cien mil': 100000,
      'cincuenta mil': 50000, 'cuarenta mil': 40000,
      'treinta mil': 30000, 'veinte mil': 20000,
      'quince mil': 15000, 'diez mil': 10000,
      'cinco mil': 5000, 'tres mil': 3000,
      'dos mil': 2000, 'mil': 1000,
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

// ====================================
// LLAMADA A CHATGPT
// ====================================
async function categorizWithChatGPT(transcript: string): Promise<any> {
  const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
  if (!OPENAI_API_KEY) {
    throw new Error('Falta OPENAI_API_KEY');
  }

  console.log('🤖 Enviando a ChatGPT para categorización...');

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini', // Modelo más barato y rápido
      messages: [
        {
          role: 'system',
          content: CHATGPT_SYSTEM_PROMPT
        },
        {
          role: 'user',
          content: transcript
        }
      ],
      temperature: 0.2, // Bajo para respuestas consistentes
      max_tokens: 300,
      response_format: { type: 'json_object' }
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('❌ Error ChatGPT:', errorText);
    throw new Error('Error en categorización con ChatGPT');
  }

  const data = await response.json();
  const result = JSON.parse(data.choices[0].message.content);

  console.log('✅ ChatGPT categorización:', JSON.stringify(result));

  return result;
}

// ====================================
// FUNCIÓN PRINCIPAL
// ====================================
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // ======================
    // 1. Leer FormData
    // ======================
    const formData = await req.formData();
    const audio = formData.get('audio') as File;
    const userId = formData.get('userId') as string;

    if (!audio || !userId) {
      return new Response(
        JSON.stringify({ success: false, error: "Faltan datos requeridos" }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    console.log('✅ Audio recibido:', audio.size, 'bytes');
    console.log('✅ ID de usuario:', userId);

    // ======================
    // 2. Obtener moneda del usuario
    // ======================
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SERVICE_ROLE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!SUPABASE_URL || !SERVICE_ROLE) {
      throw new Error('Faltan variables de entorno');
    }

    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE);

    const { data: prefs } = await supabase
      .from('profile_preferences')
      .select('currency')
      .eq('user_id', userId)
      .single();

    const userCurrency = prefs?.currency || 'CLP';
    console.log('💰 Moneda del usuario:', userCurrency);

    // ======================
    // 3. Transcribir con Whisper
    // ======================
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    if (!OPENAI_API_KEY) {
      throw new Error("Falta OPENAI_API_KEY");
    }

    console.log('🎤 Enviando audio a Whisper...');

    const whisperFormData = new FormData();
    whisperFormData.append('file', audio, 'audio.webm');
    whisperFormData.append('model', 'whisper-1');
    whisperFormData.append('language', 'es');

    const whisperResponse = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${OPENAI_API_KEY}` },
      body: whisperFormData,
    });

    if (!whisperResponse.ok) {
      const errorText = await whisperResponse.text();
      console.error('❌ Error Whisper:', errorText);
      throw new Error('Error en transcripción');
    }

    const whisperData = await whisperResponse.json();
    const transcript = whisperData.text || '';

    if (!transcript) {
      return new Response(
        JSON.stringify({ success: false, error: "No se pudo transcribir" }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    console.log('✅ Transcripción:', transcript);

    // ======================
    // 4. PARSEAR MONTO (rápido, sin costo)
    // ======================
    const amount = parseAmount(transcript, userCurrency);

    if (!amount || amount <= 0) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'No detecté el monto. Intenta: "Comida 50 mil pesos" o "Gasté $50,000"',
          transcript,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // ======================
    // 5. CATEGORIZAR CON CHATGPT
    // ======================
    const chatGptResult = await categorizWithChatGPT(transcript);

    const transactionType = chatGptResult.transaction?.type || 'expense';
    const description = chatGptResult.transaction?.description || transcript.slice(0, 50);
    const categoryName = chatGptResult.transaction?.category || 'Otros';
    const necessityLevel = chatGptResult.transaction?.necessity || 'discretionary';

    console.log('📊 Resultado final:', {
      amount,
      description,
      category: categoryName,
      necessity: necessityLevel,
      type: transactionType,
      confidence: chatGptResult.confidence
    });

    // ======================
    // 6. Buscar categoría en DB
    // ======================
    const { data: categories } = await supabase
      .from('categories')
      .select('id, name')
      .eq('user_id', userId)
      .ilike('name', `%${categoryName}%`)
      .limit(1);

    let categoryId = categories?.[0]?.id || null;

    if (!categoryId) {
      const { data: otros } = await supabase
        .from('categories')
        .select('id')
        .eq('user_id', userId)
        .ilike('name', 'otros')
        .limit(1);

      categoryId = otros?.[0]?.id || null;

      if (categoryId) {
        console.log('⚠️ Categoría no encontrada, usando "Otros":', categoryId);
      }
    }

    // ======================
    // 7. Insertar transacción
    // ======================
    const { data: transaction, error: txError } = await supabase
      .from('transactions')
      .insert({
        user_id: userId,
        amount: amount,
        description: description,
        category_id: categoryId,
        type: transactionType,
        currency: userCurrency,
        necessity_level: necessityLevel,
        date: new Date().toISOString().split('T')[0],
        payment_method: 'cash',
        metadata: {
          created_via: 'voice',
          transcript: transcript,
          parsed_category: categoryName,
          transcription_service: 'openai-whisper',
          categorization_service: 'openai-chatgpt',
          chatgpt_confidence: chatGptResult.confidence,
          chatgpt_model: 'gpt-4o-mini'
        }
      })
      .select()
      .single();

    if (txError) {
      console.error('❌ Error al insertar:', txError);
      throw new Error('Error al guardar: ' + txError.message);
    }

    console.log('✅ Transacción creada:', transaction.id);

    // ======================
    // 8. Respuesta
    // ======================
    return new Response(
      JSON.stringify({
        success: true,
        message: "Transacción creada con ChatGPT",
        transcript,
        parsed: {
          amount,
          description,
          category: categoryName,
          necessity: necessityLevel,
          type: transactionType
        },
        chatgpt: chatGptResult,
        transaction,
        currency: userCurrency,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );

  } catch (error) {
    console.error('❌ Error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
