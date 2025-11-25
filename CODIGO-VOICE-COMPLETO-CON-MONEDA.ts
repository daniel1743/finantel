// =====================================================
// Edge Function: voice-to-transaction
// VERSIÓN COMPLETA CON MONEDA Y NECESIDAD
// =====================================================
// Características:
// ✅ Detecta moneda del usuario (CLP, COP, USD, etc.)
// ✅ Parser robusto: "50 mil" = 50,000 (no 50.00)
// ✅ Clasificación automática de necessity_level
// ✅ Reconoce patrones: "comida 50 mil necesario"
// ✅ Categorización inteligente
// =====================================================

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
// PARSER NLP MEJORADO CON MONEDA
// ====================================
function parseTranscript(text: string, userCurrency: string = 'CLP') {
  const lowerText = text.toLowerCase().trim();
  let amount = 0;
  let description = '';
  let necessityLevel = 'discretionary'; // Por defecto

  console.log('🔍 Parseando:', text);
  console.log('💰 Moneda del usuario:', userCurrency);

  // ==========================================
  // 1. DETECTAR NIVEL DE NECESIDAD (en el comando)
  // ==========================================
  if (lowerText.includes('necesario') || lowerText.includes('esencial') || lowerText.includes('urgente')) {
    necessityLevel = 'essential';
    console.log('✅ Necesidad detectada en comando: essential');
  } else if (lowerText.includes('importante')) {
    necessityLevel = 'important';
    console.log('✅ Necesidad detectada en comando: important');
  } else if (lowerText.includes('opcional') || lowerText.includes('lujo')) {
    necessityLevel = 'discretionary';
    console.log('✅ Necesidad detectada en comando: discretionary');
  }

  // ==========================================
  // 2. DETECTAR MONTO (ARREGLADO)
  // ==========================================

  // Patrón 1: "60 mil", "50 mil pesos" → 60,000
  const milMatch = lowerText.match(/(\d+)\s*mil(?:\s+pesos)?/i);
  if (milMatch) {
    amount = parseInt(milMatch[1]) * 1000;
    console.log(`✅ Monto detectado (mil): ${amount} ${userCurrency}`);
  }

  // Patrón 2: "50k" → 50,000
  if (!amount) {
    const kMatch = lowerText.match(/(\d+)\s*k\b/i);
    if (kMatch) {
      amount = parseInt(kMatch[1]) * 1000;
      console.log(`✅ Monto detectado (k): ${amount} ${userCurrency}`);
    }
  }

  // Patrón 3: Números con separadores: "50.000", "50,000"
  if (!amount) {
    const separatorMatch = lowerText.match(/(\d{1,3}(?:[.,]\d{3})+)/);
    if (separatorMatch) {
      const cleanNumber = separatorMatch[1].replace(/[.,]/g, '');
      amount = parseInt(cleanNumber);
      console.log(`✅ Monto detectado (separadores): ${amount} ${userCurrency}`);
    }
  }

  // Patrón 4: Números directos grandes: "5000", "50000"
  if (!amount) {
    const directMatch = lowerText.match(/\b(\d{3,})\b/);
    if (directMatch) {
      amount = parseInt(directMatch[1]);
      console.log(`✅ Monto detectado (directo): ${amount} ${userCurrency}`);
    }
  }

  // Patrón 5: Palabras numéricas exactas
  if (!amount) {
    const palabrasNumericas: { [key: string]: number } = {
      'un millón': 1000000,
      'medio millón': 500000,
      'doscientos mil': 200000,
      'cien mil': 100000,
      'cincuenta mil': 50000,
      'cuarenta mil': 40000,
      'treinta mil': 30000,
      'veinte mil': 20000,
      'quince mil': 15000,
      'diez mil': 10000,
      'cinco mil': 5000,
      'tres mil': 3000,
      'dos mil': 2000,
      'mil': 1000,
    };

    for (const [palabra, valor] of Object.entries(palabrasNumericas)) {
      if (lowerText.includes(palabra)) {
        amount = valor;
        console.log(`✅ Monto detectado (palabra): ${amount} ${userCurrency}`);
        break;
      }
    }
  }

  // ==========================================
  // 3. DETECTAR DESCRIPCIÓN (MEJORADO)
  // ==========================================

  // Remover palabras de monto del texto
  let cleanText = lowerText
    .replace(/\d+\s*mil(?:\s+pesos)?/gi, '')
    .replace(/\d+\s*k\b/gi, '')
    .replace(/\d{1,3}(?:[.,]\d{3})+/g, '')
    .replace(/\b\d{3,}\b/g, '')
    .replace(/gasté|pagué|compré|di|en|de|la|el|los|las|un|una/gi, ' ')
    .replace(/pesos|clp|cop|usd|dólares|dólar/gi, '')
    .replace(/necesario|esencial|urgente|importante|opcional|lujo/gi, '')
    .trim()
    .replace(/\s+/g, ' ');

  if (cleanText.length > 0) {
    description = cleanText;
    console.log('✅ Descripción detectada:', description);
  }

  // Fallback: extraer con "en"
  if (!description || description.length < 2) {
    const enMatch = lowerText.match(/\ben\s+([a-záéíóúñ\s]+?)(?:\s+\d|$)/i);
    if (enMatch) {
      description = enMatch[1].trim();
      console.log('✅ Descripción detectada (en):', description);
    }
  }

  // Último fallback
  if (!description || description.length < 2) {
    const words = lowerText
      .replace(/gasté|pagué|compré|di|pesos|clp|mil|k|necesario|importante|opcional/gi, '')
      .replace(/\d+/g, '')
      .trim()
      .split(/\s+/)
      .filter(w => w.length > 2);

    if (words.length > 0) {
      description = words.slice(0, 3).join(' ');
      console.log('✅ Descripción detectada (fallback):', description);
    }
  }

  if (!description) {
    description = text.slice(0, 50);
  }

  // Capitalizar
  description = description.charAt(0).toUpperCase() + description.slice(1);

  // ==========================================
  // 4. CLASIFICAR CATEGORÍA Y NECESIDAD
  // ==========================================
  const { category, autoNecessity } = classifyMerchant(description);

  // Si no se especificó en el comando, usar la automática
  if (necessityLevel === 'discretionary' && autoNecessity) {
    necessityLevel = autoNecessity;
    console.log('✅ Necesidad automática:', necessityLevel);
  }

  return {
    amount,
    description,
    merchant: description,
    category,
    necessityLevel,
    type: 'expense',
  };
}

// ====================================
// CLASIFICADOR CON NECESIDAD AUTOMÁTICA
// ====================================
function classifyMerchant(text: string): { category: string; autoNecessity: string } {
  const textLower = text.toLowerCase();

  // Mapeo: palabras clave → [categoría, nivel de necesidad]
  const categoryMap: { [key: string]: [string, string][] } = {
    // ESENCIALES
    'Alimentación': [
      ['jumbo', 'essential'], ['lider', 'essential'], ['santa isabel', 'essential'],
      ['tottus', 'essential'], ['unimarc', 'essential'], ['ekono', 'essential'],
      ['supermercado', 'essential'], ['super', 'essential'], ['market', 'essential'],
      ['verduras', 'essential'], ['frutas', 'essential'], ['pan', 'essential'],
      ['comida', 'essential'], ['alimentos', 'essential'], ['almacén', 'essential'],
      ['mercado', 'essential']
    ],
    'Salud': [
      ['farmacia', 'essential'], ['cruz verde', 'essential'], ['salcobrand', 'essential'],
      ['ahumada', 'essential'], ['doctor', 'essential'], ['médico', 'essential'],
      ['hospital', 'essential'], ['clínica', 'essential'], ['medicamento', 'essential'],
      ['remedios', 'essential'], ['dentista', 'essential'], ['consulta', 'essential']
    ],
    'Servicios': [
      ['luz', 'essential'], ['agua', 'essential'], ['gas', 'essential'],
      ['internet', 'important'], ['celular', 'important'], ['teléfono', 'important'],
      ['arriendo', 'essential'], ['alquiler', 'essential'], ['renta', 'essential']
    ],

    // IMPORTANTES
    'Transporte': [
      ['uber', 'important'], ['cabify', 'important'], ['beat', 'important'],
      ['metro', 'important'], ['bus', 'important'], ['colectivo', 'important'],
      ['taxi', 'important'], ['combustible', 'important'], ['bencina', 'important'],
      ['copec', 'important'], ['shell', 'important']
    ],
    'Educación': [
      ['colegio', 'important'], ['universidad', 'important'], ['curso', 'important'],
      ['libro', 'important'], ['cuaderno', 'important'], ['matrícula', 'important'],
      ['mensualidad', 'important'], ['útiles', 'important']
    ],

    // DISCRECIONALES
    'Restaurantes': [
      ['mcdonalds', 'discretionary'], ['burger', 'discretionary'], ['kfc', 'discretionary'],
      ['starbucks', 'discretionary'], ['café', 'discretionary'], ['restaurant', 'discretionary'],
      ['pizza', 'discretionary'], ['delivery', 'discretionary']
    ],
    'Ropa y Calzado': [
      ['zapatos', 'discretionary'], ['zapatillas', 'discretionary'], ['polera', 'discretionary'],
      ['pantalón', 'discretionary'], ['camisa', 'discretionary'], ['vestido', 'discretionary'],
      ['falabella', 'discretionary'], ['paris', 'discretionary'], ['ripley', 'discretionary'],
      ['h&m', 'discretionary'], ['zara', 'discretionary'], ['nike', 'discretionary'],
      ['ropa', 'discretionary'], ['calzado', 'discretionary']
    ],
    'Entretenimiento': [
      ['cine', 'discretionary'], ['película', 'discretionary'], ['teatro', 'discretionary'],
      ['concierto', 'discretionary'], ['parque', 'discretionary'], ['juegos', 'discretionary']
    ],
    'Suscripciones': [
      ['netflix', 'discretionary'], ['spotify', 'discretionary'], ['amazon', 'discretionary'],
      ['disney', 'discretionary'], ['hbo', 'discretionary'], ['youtube', 'discretionary']
    ],
  };

  // Buscar coincidencias
  for (const [category, keywords] of Object.entries(categoryMap)) {
    for (const [keyword, necessity] of keywords) {
      if (textLower.includes(keyword)) {
        console.log(`✅ Categoría: ${category}, Necesidad: ${necessity} (keyword: ${keyword})`);
        return { category, autoNecessity: necessity };
      }
    }
  }

  console.log('⚠️ Categoría no detectada → Otros (discretionary)');
  return { category: 'Otros', autoNecessity: 'discretionary' };
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
    console.log('✅ UserId:', userId);

    // ======================
    // 2. Obtener moneda del usuario
    // ======================
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SERVICE_ROLE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!SUPABASE_URL || !SERVICE_ROLE) {
      throw new Error('Faltan variables de entorno');
    }

    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE);

    // Buscar preferencias del usuario
    const { data: prefs } = await supabase
      .from('profile_preferences')
      .select('currency')
      .eq('user_id', userId)
      .single();

    const userCurrency = prefs?.currency || 'CLP'; // Default: Peso Chileno
    console.log('💰 Moneda del usuario:', userCurrency);

    // ======================
    // 3. Transcribir con OpenAI Whisper
    // ======================
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    if (!OPENAI_API_KEY) {
      throw new Error("Falta OPENAI_API_KEY");
    }

    console.log('🎤 Transcribiendo...');

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
    // 4. Parsear con moneda
    // ======================
    const parsed = parseTranscript(transcript, userCurrency);
    console.log('🧠 Parseado:', JSON.stringify(parsed));

    if (!parsed.amount || parsed.amount <= 0) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'No detecté el monto. Intenta: "Comida 50 mil pesos"',
          transcript,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // ======================
    // 5. Buscar categoría
    // ======================
    const { data: categories } = await supabase
      .from('categories')
      .select('id, name')
      .eq('user_id', userId)
      .ilike('name', `%${parsed.category}%`)
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
    }

    // ======================
    // 6. Insertar transacción
    // ======================
    const { data: transaction, error: txError } = await supabase
      .from('transactions')
      .insert({
        user_id: userId,
        amount: parsed.amount,
        description: parsed.description,
        category_id: categoryId,
        type: parsed.type,
        currency: userCurrency,
        necessity_level: parsed.necessityLevel,
        date: new Date().toISOString().split('T')[0],
        payment_method: 'cash',
        metadata: {
          created_via: 'voice',
          transcript: transcript,
          parsed_category: parsed.category,
          transcription_service: 'openai-whisper',
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
    // 7. Respuesta
    // ======================
    return new Response(
      JSON.stringify({
        success: true,
        message: "Transacción creada",
        transcript,
        parsed,
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
