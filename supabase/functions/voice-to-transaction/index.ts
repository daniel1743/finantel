// Edge Function: voice-to-transaction
// Procesa audio → Whisper → NLP → Transaction

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// ====================================
// PARSER NLP: Extraer datos del texto
// ====================================
function parseTranscript(text: string) {
  const lowerText = text.toLowerCase();

  // 1. EXTRAER MONTO
  let amount = 0;

  // Detectar formato "50k", "30k", etc
  const kMatch = lowerText.match(/(\d+)\s*k\b/);
  if (kMatch) {
    amount = parseInt(kMatch[1]) * 1000;
  }

  // Detectar formato "$1200", "1200 pesos", etc
  const moneyMatch = lowerText.match(/\$?\s*(\d+\.?\d*)\s*(pesos|clp|usd)?/);
  if (!amount && moneyMatch) {
    amount = parseFloat(moneyMatch[1]);
  }

  // Detectar palabras numéricas: "mil", "dos mil", etc
  if (!amount) {
    const palabrasNumericas: { [key: string]: number } = {
      'mil': 1000,
      'dos mil': 2000,
      'tres mil': 3000,
      'cinco mil': 5000,
      'diez mil': 10000,
      'veinte mil': 20000,
      'treinta mil': 30000,
      'cincuenta mil': 50000,
      'cien mil': 100000,
    };

    for (const [palabra, valor] of Object.entries(palabrasNumericas)) {
      if (lowerText.includes(palabra)) {
        amount = valor;
        break;
      }
    }
  }

  // 2. EXTRAER COMERCIO/DESCRIPCIÓN
  let description = '';
  let merchant = '';

  // Buscar después de "en"
  const enMatch = lowerText.match(/\ben\s+([a-záéíóúñ\s]+)/i);
  if (enMatch) {
    merchant = enMatch[1].trim();
  }

  // Si no hay "en", buscar después de verbos comunes
  const verbMatch = lowerText.match(/(?:gasté|pagué|compré|di)\s+.*?\s+(?:en\s+)?([a-záéíóúñ]+)/i);
  if (!merchant && verbMatch) {
    merchant = verbMatch[1].trim();
  }

  description = merchant || text.slice(0, 50);

  // 3. CLASIFICACIÓN AUTOMÁTICA
  const category = classifyMerchant(merchant);

  // 4. TIPO (gasto por defecto)
  const type = 'expense';

  return {
    amount,
    description,
    merchant,
    category,
    type,
    rawTranscript: text,
  };
}

// ====================================
// CLASIFICADOR DE COMERCIOS
// ====================================
function classifyMerchant(merchant: string): string {
  const merchantLower = merchant.toLowerCase();

  // Base de datos de comercios conocidos
  const merchantCategories: { [key: string]: string } = {
    // Supermercados
    'jumbo': 'Alimentación',
    'lider': 'Alimentación',
    'santa isabel': 'Alimentación',
    'tottus': 'Alimentación',
    'unimarc': 'Alimentación',
    'ekono': 'Alimentación',

    // Transporte
    'uber': 'Transporte',
    'cabify': 'Transporte',
    'metro': 'Transporte',
    'bencinera': 'Transporte',
    'copec': 'Transporte',
    'shell': 'Transporte',

    // Restaurantes
    'mcdonalds': 'Restaurantes',
    'burger king': 'Restaurantes',
    'subway': 'Restaurantes',
    'starbucks': 'Restaurantes',
    'doggis': 'Restaurantes',

    // Entretenimiento
    'cine': 'Entretenimiento',
    'netflix': 'Suscripciones',
    'spotify': 'Suscripciones',
    'hbo': 'Suscripciones',

    // Salud
    'farmacia': 'Salud',
    'cruz verde': 'Salud',
    'salcobrand': 'Salud',

    // Servicios
    'luz': 'Servicios básicos',
    'agua': 'Servicios básicos',
    'internet': 'Servicios básicos',
    'telefono': 'Servicios básicos',
  };

  // Buscar coincidencia exacta
  for (const [key, category] of Object.entries(merchantCategories)) {
    if (merchantLower.includes(key)) {
      return category;
    }
  }

  // Clasificación por palabras clave
  if (merchantLower.includes('super') || merchantLower.includes('market')) {
    return 'Alimentación';
  }
  if (merchantLower.includes('restaurante') || merchantLower.includes('comida')) {
    return 'Restaurantes';
  }
  if (merchantLower.includes('taxi') || merchantLower.includes('bus')) {
    return 'Transporte';
  }

  // Por defecto
  return 'Otros';
}

// ====================================
// FUNCIÓN PRINCIPAL
// ====================================
serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { audio, userId } = await req.json()

    if (!audio || !userId) {
      throw new Error('Faltan parámetros: audio o userId')
    }

    // 1. TRANSCRIBIR CON WHISPER
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openaiApiKey) {
      throw new Error('OPENAI_API_KEY no configurada')
    }

    // Convertir base64 a blob
    const audioBuffer = Uint8Array.from(atob(audio), c => c.charCodeAt(0))
    const audioBlob = new Blob([audioBuffer], { type: 'audio/webm' })

    // Crear FormData para Whisper
    const formData = new FormData()
    formData.append('file', audioBlob, 'audio.webm')
    formData.append('model', 'whisper-1')
    formData.append('language', 'es') // Español

    // Llamar a Whisper API
    const whisperResponse = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
      },
      body: formData,
    })

    if (!whisperResponse.ok) {
      const errorData = await whisperResponse.text()
      console.error('Error de Whisper:', errorData)
      throw new Error('Error al transcribir audio')
    }

    const whisperData = await whisperResponse.json()
    const transcript = whisperData.text

    console.log('Transcripción:', transcript)

    // 2. PARSEAR TRANSCRIPCIÓN
    const parsed = parseTranscript(transcript)

    console.log('Datos parseados:', parsed)

    if (!parsed.amount || parsed.amount <= 0) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'No se pudo detectar el monto. Intenta decir algo como "Gasté 50 mil en Jumbo"',
          transcript,
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      )
    }

    // 3. OBTENER CATEGORÍA ID
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Buscar categoría por nombre
    const { data: categories, error: catError } = await supabase
      .from('categories')
      .select('id')
      .eq('user_id', userId)
      .eq('name', parsed.category)
      .limit(1)

    let categoryId = null
    if (categories && categories.length > 0) {
      categoryId = categories[0].id
    } else {
      // Si no existe, buscar "Otros"
      const { data: otherCat } = await supabase
        .from('categories')
        .select('id')
        .eq('user_id', userId)
        .eq('name', 'Otros')
        .limit(1)

      categoryId = otherCat && otherCat.length > 0 ? otherCat[0].id : null
    }

    // 4. CREAR TRANSACCIÓN
    const { data: transaction, error: txError } = await supabase
      .from('transactions')
      .insert({
        user_id: userId,
        amount: parsed.amount,
        description: parsed.description,
        category_id: categoryId,
        type: parsed.type,
        date: new Date().toISOString(),
        payment_method: 'cash', // Por defecto
        created_via: 'voice', // Marcador especial
      })
      .select()
      .single()

    if (txError) {
      console.error('Error al crear transacción:', txError)
      throw new Error('Error al guardar la transacción')
    }

    // 5. RETORNAR ÉXITO
    return new Response(
      JSON.stringify({
        success: true,
        transcript,
        parsed,
        transaction,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Error en voice-to-transaction:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})
