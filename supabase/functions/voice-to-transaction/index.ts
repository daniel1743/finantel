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

  // 1. DETECTAR TIPO DE TRANSACCIÓN (income vs expense)
  let type = 'expense'; // Por defecto es gasto
  
  // Palabras clave para INGRESOS
  const incomeKeywords = ['cobré', 'cobre', 'recibí', 'recibi', 'ingresé', 'ingrese', 'gané', 'gane', 
                          'vendí', 'vendi', 'cobro', 'ingreso', 'pago recibido', 'sueldo', 'salario'];
  
  // Palabras clave para GASTOS
  const expenseKeywords = ['gasté', 'gaste', 'pagué', 'pague', 'compré', 'compre', 'di', 'dé', 'de'];
  
  const hasIncomeKeyword = incomeKeywords.some(keyword => lowerText.includes(keyword));
  const hasExpenseKeyword = expenseKeywords.some(keyword => lowerText.includes(keyword));
  
  if (hasIncomeKeyword && !hasExpenseKeyword) {
    type = 'income';
  }

  // 2. EXTRAER MONTO (mejorado para formato chileno)
  let amount = 0;

  // Detectar formato "50k", "30k", etc
  const kMatch = lowerText.match(/(\d+)\s*k\b/);
  if (kMatch) {
    amount = parseInt(kMatch[1]) * 1000;
  }

  // Detectar números grandes con separadores (formato chileno: 950.000 o 2.300)
  // En Chile: punto = separador de miles, coma = decimal (pero raro en montos grandes)
  // Patrón: número con punto(s) como separador de miles
  const chileanFormatMatch = lowerText.match(/\$?\s*(\d{1,3}(?:\.\d{3})+)\s*(?:pesos|clp|usd)?/);
  if (!amount && chileanFormatMatch) {
    // Formato chileno: remover puntos (son separadores de miles)
    let numStr = chileanFormatMatch[1].replace(/\./g, '');
    amount = parseFloat(numStr);
    console.log('Formato chileno detectado:', chileanFormatMatch[1], '→', amount);
  }

  // Detectar números con comas como separador de miles (formato internacional: 950,000)
  const internationalFormatMatch = lowerText.match(/\$?\s*(\d{1,3}(?:,\d{3})+)\s*(?:pesos|clp|usd)?/);
  if (!amount && internationalFormatMatch) {
    // Formato internacional: remover comas (son separadores de miles)
    let numStr = internationalFormatMatch[1].replace(/,/g, '');
    amount = parseFloat(numStr);
    console.log('Formato internacional detectado:', internationalFormatMatch[1], '→', amount);
  }

  // Detectar números con coma como decimal (formato: 2,30 o 28,50)
  const decimalCommaMatch = lowerText.match(/\$?\s*(\d+),(\d{1,2})\s*(?:pesos|clp|usd)?/);
  if (!amount && decimalCommaMatch) {
    // Coma como decimal: reemplazar coma por punto
    let numStr = decimalCommaMatch[1] + '.' + decimalCommaMatch[2];
    amount = parseFloat(numStr);
    console.log('Formato decimal con coma detectado:', decimalCommaMatch[0], '→', amount);
  }

  // Detectar formato simple "$1200", "1200 pesos", etc (sin separadores)
  if (!amount) {
    const simpleMatch = lowerText.match(/\$?\s*(\d+)\s*(?:pesos|clp|usd)?/);
    if (simpleMatch) {
      amount = parseFloat(simpleMatch[1]);
      console.log('Formato simple detectado:', simpleMatch[1], '→', amount);
    }
  }

  // Detectar palabras numéricas: "mil", "dos mil", etc
  if (!amount) {
    const palabrasNumericas: { [key: string]: number } = {
      'mil': 1000,
      'dos mil': 2000,
      'tres mil': 3000,
      'cuatro mil': 4000,
      'cinco mil': 5000,
      'seis mil': 6000,
      'siete mil': 7000,
      'ocho mil': 8000,
      'nueve mil': 9000,
      'diez mil': 10000,
      'veinte mil': 20000,
      'treinta mil': 30000,
      'cuarenta mil': 40000,
      'cincuenta mil': 50000,
      'sesenta mil': 60000,
      'setenta mil': 70000,
      'ochenta mil': 80000,
      'noventa mil': 90000,
      'cien mil': 100000,
      'doscientos mil': 200000,
      'trescientos mil': 300000,
      'cuatrocientos mil': 400000,
      'quinientos mil': 500000,
      'seiscientos mil': 600000,
      'setecientos mil': 700000,
      'ochocientos mil': 800000,
      'novecientos mil': 900000,
      'un millón': 1000000,
      'dos millones': 2000000,
      'tres millones': 3000000,
      'cinco millones': 5000000,
      'diez millones': 10000000,
    };

    for (const [palabra, valor] of Object.entries(palabrasNumericas)) {
      if (lowerText.includes(palabra)) {
        amount = valor;
        console.log('Palabra numérica detectada:', palabra, '→', amount);
        break;
      }
    }

    // Detectar combinaciones como "novecientos cincuenta mil"
    if (!amount) {
      const millonesMatch = lowerText.match(/(\d+)\s*millones?/);
      if (millonesMatch) {
        amount = parseInt(millonesMatch[1]) * 1000000;
        console.log('Millones detectados:', millonesMatch[0], '→', amount);
      } else {
        const milesMatch = lowerText.match(/(\d+)\s*mil/);
        if (milesMatch) {
          amount = parseInt(milesMatch[1]) * 1000;
          console.log('Miles detectados:', milesMatch[0], '→', amount);
        }
      }
    }
  }
  
  console.log('Monto final parseado:', amount);

  // 3. EXTRAER DESCRIPCIÓN
  let description = text.trim();
  
  // Limpiar la descripción: remover verbos comunes al inicio
  const verbosPattern = /^(?:cobré|cobre|recibí|recibi|ingresé|ingrese|gané|gane|vendí|vendi|gasté|gaste|pagué|pague|compré|compre|di|dé|de)\s+/i;
  description = description.replace(verbosPattern, '');
  
  // Remover montos de la descripción
  description = description.replace(/\$?\s*\d{1,3}(?:[.,]\d{3})*(?:[.,]\d+)?\s*(?:pesos|clp|usd)?/gi, '').trim();
  
  // Si la descripción está vacía, usar el texto original (limitado)
  if (!description || description.length < 3) {
    description = text.slice(0, 100).trim();
  }
  
  // Limitar longitud
  if (description.length > 200) {
    description = description.slice(0, 197) + '...';
  }

  // 4. CLASIFICACIÓN AUTOMÁTICA MEJORADA
  const category = classifyTransaction(description, lowerText);

  return {
    amount,
    description,
    category,
    type,
    rawTranscript: text,
  };
}

// ====================================
// CLASIFICADOR DE TRANSACCIONES MEJORADO
// ====================================
function classifyTransaction(description: string, lowerText: string): string {
  const descLower = description.toLowerCase();
  const textLower = lowerText;

  // Base de datos de palabras clave por categoría
  const categoryKeywords: { [key: string]: string[] } = {
    'Alimentación': [
      'arepa', 'empanada', 'harina', 'pan', 'comida', 'supermercado', 'jumbo', 'lider', 
      'santa isabel', 'tottus', 'unimarc', 'ekono', 'super', 'market', 'despensa',
      'abarrotes', 'verduras', 'frutas', 'carne', 'pescado', 'pollo', 'lácteos'
    ],
    'Restaurantes': [
      'restaurante', 'comida rápida', 'mcdonalds', 'burger king', 'subway', 'starbucks',
      'doggis', 'pizza', 'hamburguesa', 'sushi', 'comida china', 'comida mexicana'
    ],
    'Transporte': [
      'uber', 'cabify', 'taxi', 'metro', 'bus', 'bencinera', 'copec', 'shell', 'gasolina',
      'combustible', 'estacionamiento', 'peaje', 'transporte público'
    ],
    'Salud': [
      'farmacia', 'cruz verde', 'salcobrand', 'medicina', 'medicamento', 'doctor', 'médico',
      'hospital', 'clínica', 'consulta', 'examen', 'laboratorio'
    ],
    'Servicios básicos': [
      'luz', 'electricidad', 'agua', 'gas', 'internet', 'teléfono', 'telefono', 'wifi',
      'cable', 'tv', 'televisión', 'servicio básico', 'cuenta', 'factura'
    ],
    'Suscripciones': [
      'netflix', 'spotify', 'hbo', 'disney', 'amazon prime', 'youtube premium', 'suscripción',
      'suscripcion', 'streaming', 'membresía', 'membresia'
    ],
    'Entretenimiento': [
      'cine', 'película', 'pelicula', 'teatro', 'concierto', 'evento', 'fiesta', 'diversión',
      'diversion', 'juego', 'videojuego', 'playstation', 'xbox', 'nintendo'
    ],
    'Ropa': [
      'ropa', 'zapatos', 'zapato', 'camisa', 'pantalón', 'pantalon', 'vestido', 'chaqueta',
      'tienda de ropa', 'boutique', 'moda'
    ],
    'Educación': [
      'colegio', 'universidad', 'curso', 'clase', 'libro', 'material', 'educación', 'educacion',
      'matrícula', 'matricula', 'colegiatura'
    ],
    'Hogar': [
      'mueble', 'decoración', 'decoracion', 'herramienta', 'pintura', 'reparación', 'reparacion',
      'mantenimiento', 'limpieza', 'producto de limpieza'
    ],
  };

  // Buscar coincidencias por categoría
  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    for (const keyword of keywords) {
      if (descLower.includes(keyword) || textLower.includes(keyword)) {
        return category;
      }
    }
  }

  // Si es un ingreso, categoría por defecto
  if (textLower.includes('cobré') || textLower.includes('cobre') || 
      textLower.includes('recibí') || textLower.includes('recibi') ||
      textLower.includes('ingresé') || textLower.includes('ingrese')) {
    return 'Ingresos';
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
    const contentType = req.headers.get('content-type') || ''
    let userId: string | null = null
    let audioBlob: Blob | null = null

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData()
      const audioFile = formData.get('audio')
      const userField = formData.get('userId')

      if (audioFile && audioFile instanceof File) {
        audioBlob = audioFile
      }

      if (typeof userField === 'string') {
        userId = userField
      }
    } else {
      const body = await req.json()
      if (body?.audio) {
        const audioBuffer = Uint8Array.from(atob(body.audio), (c) => c.charCodeAt(0))
        audioBlob = new Blob([audioBuffer], { type: body.mimeType || 'audio/webm' })
      }
      if (body?.userId) {
        userId = body.userId
      }
    }

    if (!audioBlob || !userId) {
      throw new Error('Faltan parámetros: audio o userId')
    }

    // 1. TRANSCRIBIR CON WHISPER
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openaiApiKey) {
      throw new Error('OPENAI_API_KEY no configurada')
    }

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

    console.log('=== TRANSCRIPCIÓN ORIGINAL ===');
    console.log('Texto:', transcript);
    console.log('Usuario ID:', userId);

    // 2. PARSEAR TRANSCRIPCIÓN
    const parsed = parseTranscript(transcript)

    console.log('=== DATOS PARSEADOS ===');
    console.log('Monto:', parsed.amount);
    console.log('Tipo:', parsed.type);
    console.log('Descripción:', parsed.description);
    console.log('Categoría:', parsed.category);

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

    // 3. OBTENER PREFERENCIAS DEL USUARIO (moneda)
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Obtener moneda del usuario
    const { data: preferences } = await supabase
      .from('profile_preferences')
      .select('currency')
      .eq('user_id', userId)
      .maybeSingle()

    // Default CLP para Chile (ya que la app está orientada a Chile)
    const userCurrency = preferences?.currency || 'CLP'
    
    console.log('Moneda del usuario:', userCurrency, 'Preferencias:', preferences)

    // 4. OBTENER O CREAR CATEGORÍA
    let categoryId = null
    
    // Buscar categoría por nombre
    const { data: categories } = await supabase
      .from('categories')
      .select('id')
      .eq('user_id', userId)
      .eq('name', parsed.category)
      .limit(1)

    if (categories && categories.length > 0) {
      categoryId = categories[0].id
    } else {
      // Si no existe, buscar "Otros" o la categoría por defecto
      const { data: otherCat } = await supabase
        .from('categories')
        .select('id')
        .eq('user_id', userId)
        .eq('name', 'Otros')
        .limit(1)

      if (otherCat && otherCat.length > 0) {
        categoryId = otherCat[0].id
      } else {
        // Si no existe "Otros", buscar cualquier categoría del usuario
        const { data: anyCat } = await supabase
          .from('categories')
          .select('id')
          .eq('user_id', userId)
          .eq('type', parsed.type) // Buscar categoría del mismo tipo (income/expense)
          .limit(1)
        
        categoryId = anyCat && anyCat.length > 0 ? anyCat[0].id : null
      }
    }

    // 5. CREAR TRANSACCIÓN
    const { data: transaction, error: txError } = await supabase
      .from('transactions')
      .insert({
        user_id: userId,
        amount: parsed.amount,
        description: parsed.description,
        category_id: categoryId,
        type: parsed.type,
        currency: userCurrency, // Usar la moneda del usuario
        date: new Date().toISOString().split('T')[0], // Solo la fecha, sin hora
        payment_method: 'cash', // Por defecto
        metadata: {
          created_via: 'voice',
          raw_transcript: parsed.rawTranscript,
        },
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
