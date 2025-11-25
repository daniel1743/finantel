// Edge Function: voice-to-transaction
// Procesa audio → GOOGLE SPEECH-TO-TEXT → NLP → Transaction
// ✅ VERSIÓN CON GOOGLE CLOUD SPEECH-TO-TEXT API

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

  // Detectar palabras numéricas
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

  // 2. EXTRAER COMERCIO
  let description = '';
  let merchant = '';

  const enMatch = lowerText.match(/\ben\s+([a-záéíóúñ\s]+)/i);
  if (enMatch) {
    merchant = enMatch[1].trim();
  }

  if (!merchant) {
    const verbMatch = lowerText.match(/(?:gasté|pagué|compré|di)\s+.*?\s+(?:en\s+)?([a-záéíóúñ]+)/i);
    if (verbMatch) {
      merchant = verbMatch[1].trim();
    }
  }

  description = merchant || text.slice(0, 50);

  // 3. CLASIFICACIÓN
  const category = classifyMerchant(merchant);
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
// CLASIFICADOR
// ====================================
function classifyMerchant(merchant: string): string {
  const merchantLower = merchant.toLowerCase();

  const merchantCategories: { [key: string]: string } = {
    'jumbo': 'Alimentación',
    'lider': 'Alimentación',
    'santa isabel': 'Alimentación',
    'tottus': 'Alimentación',
    'unimarc': 'Alimentación',
    'ekono': 'Alimentación',
    'uber': 'Transporte',
    'cabify': 'Transporte',
    'metro': 'Transporte',
    'mcdonalds': 'Restaurantes',
    'starbucks': 'Restaurantes',
    'farmacia': 'Salud',
    'cruz verde': 'Salud',
  };

  for (const [key, categoryName] of Object.entries(merchantCategories)) {
    if (merchantLower.includes(key)) {
      return categoryName;
    }
  }

  if (merchantLower.includes('super') || merchantLower.includes('market')) {
    return 'Alimentación';
  }

  return 'Otros';
}

// ====================================
// OBTENER ACCESS TOKEN DE SERVICE ACCOUNT
// ====================================
async function getAccessTokenFromServiceAccount(serviceAccountJson: any): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const expiry = now + 3600; // 1 hora

  // Crear JWT para solicitar el access token
  const header = {
    alg: 'RS256',
    typ: 'JWT'
  };

  const claim = {
    iss: serviceAccountJson.client_email,
    scope: 'https://www.googleapis.com/auth/cloud-platform',
    aud: 'https://oauth2.googleapis.com/token',
    exp: expiry,
    iat: now
  };

  // Codificar en base64url
  const base64url = (obj: any) => {
    const json = JSON.stringify(obj);
    return btoa(json).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  };

  const headerB64 = base64url(header);
  const claimB64 = base64url(claim);
  const signatureInput = `${headerB64}.${claimB64}`;

  // Importar clave privada
  const privateKey = serviceAccountJson.private_key;
  const pemKey = privateKey.replace(/\\n/g, '\n');

  const key = await crypto.subtle.importKey(
    'pkcs8',
    new TextEncoder().encode(pemKey),
    {
      name: 'RSASSA-PKCS1-v1_5',
      hash: 'SHA-256',
    },
    false,
    ['sign']
  );

  // Firmar
  const signature = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    key,
    new TextEncoder().encode(signatureInput)
  );

  const signatureB64 = btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  const jwt = `${signatureInput}.${signatureB64}`;

  // Intercambiar JWT por access token
  const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
  });

  const tokenData = await tokenResponse.json();
  return tokenData.access_token;
}

// ====================================
// FUNCIÓN PRINCIPAL
// ====================================
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // 1. Leer FormData
    const formData = await req.formData();
    const audio = formData.get('audio') as File;
    const userId = formData.get('userId') as string;

    if (!audio || !userId) {
      return new Response(
        JSON.stringify({ success: false, error: "Faltan parámetros" }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    console.log('✅ Audio recibido. Tamaño:', audio.size, 'bytes');

    // 2. Obtener Service Account JSON
    const GOOGLE_SERVICE_ACCOUNT_JSON = Deno.env.get('GOOGLE_SERVICE_ACCOUNT_JSON');
    if (!GOOGLE_SERVICE_ACCOUNT_JSON) {
      throw new Error("Falta GOOGLE_SERVICE_ACCOUNT_JSON en secretos");
    }

    const serviceAccountJson = JSON.parse(GOOGLE_SERVICE_ACCOUNT_JSON);
    const projectId = serviceAccountJson.project_id;

    console.log('✅ Service Account cargado. Project ID:', projectId);

    // 3. Obtener Access Token
    console.log('🔐 Obteniendo access token...');
    const accessToken = await getAccessTokenFromServiceAccount(serviceAccountJson);
    console.log('✅ Access token obtenido');

    // 4. Convertir audio a base64
    const audioArrayBuffer = await audio.arrayBuffer();
    const audioBase64 = btoa(String.fromCharCode(...new Uint8Array(audioArrayBuffer)));

    // 5. Llamar a Speech-to-Text API
    console.log('🎤 Enviando audio a Google Speech-to-Text...');

    const speechPayload = {
      config: {
        encoding: 'WEBM_OPUS',
        sampleRateHertz: 48000,
        languageCode: 'es-ES',
        alternativeLanguageCodes: ['es-MX', 'es-AR', 'es-CL'],
        model: 'latest_short',
        enableAutomaticPunctuation: true,
      },
      audio: {
        content: audioBase64,
      },
    };

    const speechResponse = await fetch(
      `https://speech.googleapis.com/v1/speech:recognize`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(speechPayload),
      }
    );

    if (!speechResponse.ok) {
      const errorText = await speechResponse.text();
      console.error('❌ Error de Speech-to-Text:', errorText);
      throw new Error('Error al transcribir: ' + errorText);
    }

    const speechData = await speechResponse.json();

    // Extraer transcripción
    let transcript = '';
    if (speechData.results && speechData.results[0]?.alternatives?.[0]?.transcript) {
      transcript = speechData.results[0].alternatives[0].transcript.trim();
    }

    if (!transcript) {
      console.error('❌ Respuesta de Speech-to-Text:', JSON.stringify(speechData));
      return new Response(
        JSON.stringify({
          success: false,
          error: "No se pudo transcribir el audio",
          speechResponse: speechData
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    console.log('✅ Transcripción:', transcript);

    // 6. Parsear transcripción
    const parsed = parseTranscript(transcript);
    console.log('🧠 Datos parseados:', JSON.stringify(parsed));

    if (!parsed.amount || parsed.amount <= 0) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'No se pudo detectar el monto. Intenta decir "Gasté 50 mil en Jumbo"',
          transcript,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // 7. Buscar categoría en DB
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SERVICE_ROLE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    const supabase = createClient(SUPABASE_URL!, SERVICE_ROLE!);

    const { data: categories } = await supabase
      .from('categories')
      .select('id')
      .eq('user_id', userId)
      .ilike('name', parsed.category)
      .limit(1);

    let categoryId = null;
    if (categories && categories.length > 0) {
      categoryId = categories[0].id;
    } else {
      const { data: otherCat } = await supabase
        .from('categories')
        .select('id')
        .eq('user_id', userId)
        .ilike('name', 'Otros')
        .limit(1);

      categoryId = otherCat && otherCat.length > 0 ? otherCat[0].id : null;
    }

    // 8. Insertar transacción
    const { data: transaction, error: txError } = await supabase
      .from('transactions')
      .insert({
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
          transcription_service: 'google-speech-to-text'
        }
      })
      .select()
      .single();

    if (txError) {
      console.error('❌ Error al insertar:', txError);
      throw new Error('Error al guardar: ' + txError.message);
    }

    console.log('✅ Transacción creada:', transaction.id);

    // 9. Respuesta exitosa
    return new Response(
      JSON.stringify({
        success: true,
        message: "Transacción creada con Google Speech-to-Text",
        transcript,
        parsed,
        transaction,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );

  } catch (error) {
    console.error('❌ Error:', error);

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
