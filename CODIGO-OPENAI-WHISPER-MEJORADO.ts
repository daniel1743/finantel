// Edge Function: voice-to-transaction
// Procesa audio → OPENAI WHISPER → NLP MEJORADO → Transaction
// ✅ VERSIÓN MEJORADA CON PARSER MÁS ROBUSTO

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// ====================================
// PARSER NLP MEJORADO
// ====================================
function parseTranscript(text: string) {
  const lowerText = text.toLowerCase().trim();
  let amount = 0;
  let description = '';

  console.log('🔍 Parseando:', text);

  // ==========================================
  // 1. DETECTAR MONTO (mejorado)
  // ==========================================

  // Patrón 1: "60 mil", "50 mil", "100 mil pesos"
  const milMatch = lowerText.match(/(\d+)\s*mil(?:\s+pesos)?/i);
  if (milMatch) {
    amount = parseInt(milMatch[1]) * 1000;
    console.log('✅ Monto detectado (mil):', amount);
  }

  // Patrón 2: "50k", "60k"
  if (!amount) {
    const kMatch = lowerText.match(/(\d+)\s*k\b/i);
    if (kMatch) {
      amount = parseInt(kMatch[1]) * 1000;
      console.log('✅ Monto detectado (k):', amount);
    }
  }

  // Patrón 3: "$5000", "5000 pesos", números directos
  if (!amount) {
    const directMatch = lowerText.match(/\$?\s*(\d+(?:\.\d+)?)\s*(?:pesos|clp|usd)?/i);
    if (directMatch) {
      amount = parseFloat(directMatch[1]);
      console.log('✅ Monto detectado (directo):', amount);
    }
  }

  // Patrón 4: Palabras numéricas exactas ("mil", "dos mil", etc)
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
        console.log('✅ Monto detectado (palabra):', amount);
        break;
      }
    }
  }

  // ==========================================
  // 2. DETECTAR DESCRIPCIÓN (mejorado)
  // ==========================================

  // Estrategia: remover el monto del texto y quedarnos con la descripción

  // Primero, identificar qué patrón de monto se usó
  let montoPattern = '';

  if (lowerText.match(/(\d+)\s*mil(?:\s+pesos)?/i)) {
    montoPattern = lowerText.match(/(\d+)\s*mil(?:\s+pesos)?/i)![0];
  } else if (lowerText.match(/(\d+)\s*k\b/i)) {
    montoPattern = lowerText.match(/(\d+)\s*k\b/i)![0];
  } else if (lowerText.match(/\$?\s*(\d+(?:\.\d+)?)\s*(?:pesos|clp|usd)?/i)) {
    montoPattern = lowerText.match(/\$?\s*(\d+(?:\.\d+)?)\s*(?:pesos|clp|usd)?/i)![0];
  }

  // Remover el monto y palabras comunes
  let cleanText = lowerText
    .replace(montoPattern, '')
    .replace(/gasté|pagué|compré|di|en|de|la|el|los|las/gi, ' ')
    .replace(/pesos|clp|usd/gi, '')
    .trim()
    .replace(/\s+/g, ' '); // Normalizar espacios

  // Si después de limpiar hay algo, usarlo como descripción
  if (cleanText.length > 0) {
    description = cleanText;
    console.log('✅ Descripción detectada:', description);
  }

  // Fallback: si no hay descripción clara, intentar extraer con "en"
  if (!description || description.length < 2) {
    const enMatch = lowerText.match(/\ben\s+([a-záéíóúñ\s]+?)(?:\s+\d|$)/i);
    if (enMatch) {
      description = enMatch[1].trim();
      console.log('✅ Descripción detectada (en):', description);
    }
  }

  // Último fallback: tomar las primeras palabras
  if (!description || description.length < 2) {
    const words = lowerText
      .replace(/gasté|pagué|compré|di|pesos|clp|mil|k/gi, '')
      .replace(/\d+/g, '')
      .trim()
      .split(/\s+/)
      .filter(w => w.length > 2);

    if (words.length > 0) {
      description = words.slice(0, 3).join(' ');
      console.log('✅ Descripción detectada (fallback):', description);
    }
  }

  // Si aún no hay descripción, usar el texto original (primeras 50 chars)
  if (!description) {
    description = text.slice(0, 50);
  }

  // Capitalizar primera letra de la descripción
  description = description.charAt(0).toUpperCase() + description.slice(1);

  const category = classifyMerchant(description);

  return {
    amount,
    description,
    merchant: description, // Para compatibilidad
    category,
    type: 'expense',
  };
}

// ====================================
// CLASIFICADOR DE COMERCIOS (ampliado)
// ====================================
function classifyMerchant(text: string): string {
  const textLower = text.toLowerCase();

  // Mapeo extendido de palabras clave → categoría
  const categoryKeywords: { [key: string]: string[] } = {
    'Alimentación': [
      'jumbo', 'lider', 'santa isabel', 'tottus', 'unimarc', 'ekono',
      'supermercado', 'super', 'market', 'verduras', 'frutas', 'pan',
      'comida', 'alimentos', 'almacén', 'mercado'
    ],
    'Transporte': [
      'uber', 'cabify', 'beat', 'didi', 'metro', 'bus', 'colectivo',
      'taxi', 'combustible', 'bencina', 'copec', 'shell', 'petrobras',
      'peaje', 'estacionamiento', 'parking'
    ],
    'Restaurantes': [
      'mcdonalds', 'burger', 'kfc', 'subway', 'dominos', 'pizza',
      'starbucks', 'café', 'restaurant', 'comida rápida', 'delivery',
      'doggis', 'papa johns'
    ],
    'Ropa y Calzado': [
      'zapatos', 'zapatillas', 'polera', 'pantalón', 'camisa', 'vestido',
      'falabella', 'paris', 'ripley', 'h&m', 'zara', 'nike', 'adidas',
      'ropa', 'calzado', 'zapatería'
    ],
    'Salud': [
      'farmacia', 'cruz verde', 'salcobrand', 'ahumada', 'doctor',
      'médico', 'hospital', 'clínica', 'medicamento', 'remedios',
      'dentista', 'consulta'
    ],
    'Entretenimiento': [
      'cine', 'película', 'teatro', 'concierto', 'parque', 'juegos',
      'bowling', 'evento', 'entrada', 'ticket'
    ],
    'Suscripciones': [
      'netflix', 'spotify', 'amazon', 'disney', 'hbo', 'youtube',
      'premium', 'suscripción', 'membresía'
    ],
    'Servicios': [
      'luz', 'agua', 'gas', 'internet', 'celular', 'teléfono',
      'cable', 'servicio', 'cuenta', 'pago'
    ],
    'Educación': [
      'colegio', 'universidad', 'curso', 'libro', 'cuaderno',
      'matrícula', 'mensualidad', 'útiles'
    ],
  };

  // Buscar coincidencias
  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    for (const keyword of keywords) {
      if (textLower.includes(keyword)) {
        console.log(`✅ Categoría detectada: ${category} (keyword: ${keyword})`);
        return category;
      }
    }
  }

  console.log('⚠️ Categoría no detectada, usando "Otros"');
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
    // 2. Transcribir con OpenAI Whisper
    // ======================
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    if (!OPENAI_API_KEY) {
      throw new Error("Falta OPENAI_API_KEY en secretos de Supabase");
    }

    console.log('🎤 Enviando audio a OpenAI Whisper...');

    // Crear FormData para Whisper
    const whisperFormData = new FormData();
    whisperFormData.append('file', audio, 'audio.webm');
    whisperFormData.append('model', 'whisper-1');
    whisperFormData.append('language', 'es');

    const whisperResponse = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: whisperFormData,
    });

    if (!whisperResponse.ok) {
      const errorText = await whisperResponse.text();
      console.error('❌ Error de Whisper:', errorText);
      throw new Error('Error al transcribir con Whisper: ' + errorText);
    }

    const whisperData = await whisperResponse.json();
    const transcript = whisperData.text || '';

    if (!transcript) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "No se pudo transcribir el audio. Intenta hablar más claro.",
          whisperResponse: whisperData
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    console.log('✅ Transcripción:', transcript);

    // ======================
    // 3. Parsear transcripción (MEJORADO)
    // ======================
    const parsed = parseTranscript(transcript);

    console.log('🧠 Datos parseados:', JSON.stringify(parsed));

    if (!parsed.amount || parsed.amount <= 0) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'No se pudo detectar el monto. Intenta decir algo como "Gasté 50 mil en Jumbo" o "Zapatos 60 mil pesos"',
          transcript,
          parsed,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // ======================
    // 4. Buscar categoría en DB (MEJORADO)
    // ======================
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SERVICE_ROLE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!SUPABASE_URL || !SERVICE_ROLE) {
      throw new Error('Faltan SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY');
    }

    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE);

    // Buscar categoría por nombre (case-insensitive)
    console.log('🔍 Buscando categoría:', parsed.category);

    const { data: categories, error: catError } = await supabase
      .from('categories')
      .select('id, name')
      .eq('user_id', userId)
      .ilike('name', `%${parsed.category}%`)
      .limit(5);

    if (catError) {
      console.error('❌ Error buscando categoría:', catError);
    }

    let categoryId = null;

    if (categories && categories.length > 0) {
      // Si hay múltiples coincidencias, usar la primera
      categoryId = categories[0].id;
      console.log('✅ Categoría encontrada:', categories[0].name, '→', categoryId);
    } else {
      // Si no existe, buscar "Otros"
      console.log('⚠️ Categoría "' + parsed.category + '" no existe, buscando "Otros"...');

      const { data: otherCat } = await supabase
        .from('categories')
        .select('id, name')
        .eq('user_id', userId)
        .ilike('name', 'Otros')
        .limit(1);

      if (otherCat && otherCat.length > 0) {
        categoryId = otherCat[0].id;
        console.log('✅ Usando categoría "Otros":', categoryId);
      } else {
        // Si tampoco existe "Otros", tomar la primera categoría del usuario
        const { data: anyCat } = await supabase
          .from('categories')
          .select('id, name')
          .eq('user_id', userId)
          .limit(1);

        if (anyCat && anyCat.length > 0) {
          categoryId = anyCat[0].id;
          console.log('⚠️ Usando primera categoría disponible:', anyCat[0].name, '→', categoryId);
        } else {
          console.error('❌ No hay categorías para este usuario');
        }
      }
    }

    // ======================
    // 5. Insertar transacción
    // ======================
    const transactionData = {
      user_id: userId,
      amount: parsed.amount,
      description: parsed.description,
      category_id: categoryId,
      type: parsed.type,
      date: new Date().toISOString().split('T')[0],
      payment_method: 'cash',
      metadata: {
        created_via: 'voice',
        transcript: transcript,
        parsed_merchant: parsed.merchant,
        parsed_category: parsed.category,
        transcription_service: 'openai-whisper',
        category_id_used: categoryId,
      }
    };

    console.log('💾 Insertando transacción:', JSON.stringify(transactionData));

    const { data: transaction, error: txError } = await supabase
      .from('transactions')
      .insert(transactionData)
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
        message: "Transacción creada con éxito",
        transcript,
        parsed,
        transaction,
        category_found: categoryId ? true : false,
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
