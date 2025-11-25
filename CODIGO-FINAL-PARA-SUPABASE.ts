// Edge Function: voice-to-transaction
// Procesa audio → Whisper → NLP → Transaction
// ✅ VERSIÓN FINAL CORREGIDA

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
  if (!amount) {
    const moneyMatch = lowerText.match(/\$?\s*(\d+\.?\d*)\s*(pesos|clp|usd)?/);
    if (moneyMatch) {
      amount = parseFloat(moneyMatch[1]);
    }
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
  if (!merchant) {
    const verbMatch = lowerText.match(/(?:gasté|pagué|compré|di)\s+.*?\s+(?:en\s+)?([a-záéíóúñ]+)/i);
    if (verbMatch) {
      merchant = verbMatch[1].trim();
    }
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
    'mercado': 'Alimentación',

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

    // Salud
    'farmacia': 'Salud',
    'cruz verde': 'Salud',
    'salcobrand': 'Salud',

    // Servicios
    'luz': 'Servicios básicos',
    'agua': 'Servicios básicos',
    'internet': 'Servicios básicos',
  };

  // Buscar coincidencia exacta
  for (const [key, categoryName] of Object.entries(merchantCategories)) {
    if (merchantLower.includes(key)) {
      return categoryName;
    }
  }

  // Clasificación por palabras clave
  if (merchantLower.includes('super') || merchantLower.includes('market')) {
    return 'Alimentación';
  }
  if (merchantLower.includes('restaurante') || merchantLower.includes('comida')) {
    return 'Restaurantes';
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
    // ======================
    // 1. Leer FormData
    // ======================
    const formData = await req.formData();
    const audio = formData.get('audio') as File;
    const userId = formData.get('userId') as string;

    if (!audio) {
      return new Response(
        JSON.stringify({ success: false, error: "No se recibió archivo de audio" }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    if (!userId) {
      return new Response(
        JSON.stringify({ success: false, error: "Falta el userId" }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    console.log('✅ Audio recibido. Tamaño:', audio.size, 'bytes');
    console.log('✅ UserId:', userId);

    // ======================
    // 2. Transcribir con Whisper
    // ======================
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    if (!OPENAI_API_KEY) {
      throw new Error("Falta OPENAI_API_KEY en secretos");
    }

    console.log('🎤 Enviando audio a Whisper...');

    const whisperFormData = new FormData();
    whisperFormData.append('file', audio, 'audio.webm');
    whisperFormData.append('model', 'whisper-1');
    whisperFormData.append('language', 'es');

    const whisperRes = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: whisperFormData,
    });

    if (!whisperRes.ok) {
      const errorText = await whisperRes.text();
      console.error('❌ Error de Whisper:', errorText);
      throw new Error('Error al transcribir con Whisper: ' + errorText);
    }

    const whisperJson = await whisperRes.json();
    const transcript = whisperJson.text || '';

    if (!transcript) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "No se pudo transcribir el audio. Intenta hablar más claro.",
          whisperResponse: whisperJson
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    console.log('✅ Transcripción:', transcript);

    // ======================
    // 3. Parsear transcripción
    // ======================
    const parsed = parseTranscript(transcript);

    console.log('🧠 Datos parseados:', JSON.stringify(parsed));

    if (!parsed.amount || parsed.amount <= 0) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'No se pudo detectar el monto. Intenta decir algo como "Gasté 50 mil en Jumbo"',
          transcript,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // ======================
    // 4. Buscar categoría en DB
    // ======================
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SERVICE_ROLE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!SUPABASE_URL || !SERVICE_ROLE) {
      throw new Error('Faltan SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY');
    }

    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE);

    // Buscar categoría por nombre
    const { data: categories, error: catError } = await supabase
      .from('categories')
      .select('id')
      .eq('user_id', userId)
      .ilike('name', parsed.category)
      .limit(1);

    let categoryId = null;
    if (categories && categories.length > 0) {
      categoryId = categories[0].id;
      console.log('✅ Categoría encontrada:', parsed.category, '→', categoryId);
    } else {
      // Si no existe, buscar "Otros"
      const { data: otherCat } = await supabase
        .from('categories')
        .select('id')
        .eq('user_id', userId)
        .ilike('name', 'Otros')
        .limit(1);

      categoryId = otherCat && otherCat.length > 0 ? otherCat[0].id : null;
      console.log('⚠️ Categoría no encontrada, usando "Otros":', categoryId);
    }

    // ======================
    // 5. Insertar transacción
    // ======================
    const { data: transaction, error: txError } = await supabase
      .from('transactions')
      .insert({
        user_id: userId,
        amount: parsed.amount,
        description: parsed.description,
        category_id: categoryId,
        type: parsed.type,
        date: new Date().toISOString().split('T')[0], // YYYY-MM-DD
        payment_method: 'cash',
        metadata: {
          created_via: 'voice',
          transcript: transcript,
          parsed_merchant: parsed.merchant,
          parsed_category: parsed.category,
        }
      })
      .select()
      .single();

    if (txError) {
      console.error('❌ Error al insertar transacción:', txError);
      throw new Error('Error al guardar transacción: ' + txError.message);
    }

    console.log('✅ Transacción creada:', transaction.id);

    // ======================
    // 6. Respuesta exitosa
    // ======================
    return new Response(
      JSON.stringify({
        success: true,
        message: "Transacción creada desde voz",
        transcript,
        parsed,
        transaction,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );

  } catch (error) {
    console.error('❌ Error en voice-to-transaction:', error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
