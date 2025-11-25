// Edge Function: voice-to-transaction
// Procesa audio → GOOGLE SPEECH-TO-TEXT → NLP → Transaction
// ✅ VERSIÓN SIMPLIFICADA CON GOOGLE_APPLICATION_CREDENTIALS

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// ====================================
// PARSER NLP
// ====================================
function parseTranscript(text: string) {
  const lowerText = text.toLowerCase();
  let amount = 0;

  // Detectar formato "50k"
  const kMatch = lowerText.match(/(\d+)\s*k\b/);
  if (kMatch) {
    amount = parseInt(kMatch[1]) * 1000;
  }

  // Detectar números directos
  if (!amount) {
    const moneyMatch = lowerText.match(/\$?\s*(\d+\.?\d*)\s*(pesos|clp|usd)?/);
    if (moneyMatch) {
      amount = parseFloat(moneyMatch[1]);
    }
  }

  // Palabras numéricas
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

  // Extraer comercio
  let merchant = '';
  const enMatch = lowerText.match(/\ben\s+([a-záéíóúñ\s]+)/i);
  if (enMatch) {
    merchant = enMatch[1].trim();
  }

  const description = merchant || text.slice(0, 50);
  const category = classifyMerchant(merchant);

  return {
    amount,
    description,
    merchant,
    category,
    type: 'expense',
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
    'uber': 'Transporte',
    'cabify': 'Transporte',
    'metro': 'Transporte',
    'starbucks': 'Restaurantes',
    'farmacia': 'Salud',
  };

  for (const [key, categoryName] of Object.entries(merchantCategories)) {
    if (merchantLower.includes(key)) {
      return categoryName;
    }
  }

  return 'Otros';
}

// ====================================
// OBTENER ACCESS TOKEN (MÉTODO SIMPLIFICADO)
// ====================================
async function getAccessToken(serviceAccountJson: any): Promise<string> {
  // Usar el método más simple: Google OAuth con service account
  const privateKey = serviceAccountJson.private_key;
  const clientEmail = serviceAccountJson.client_email;
  const tokenUri = serviceAccountJson.token_uri || 'https://oauth2.googleapis.com/token';

  // Crear JWT assertion manualmente con jose library
  const header = {
    alg: 'RS256',
    typ: 'JWT'
  };

  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: clientEmail,
    scope: 'https://www.googleapis.com/auth/cloud-platform',
    aud: tokenUri,
    exp: now + 3600,
    iat: now
  };

  // Usar biblioteca jose para firmar (más confiable que crypto.subtle en Deno)
  try {
    // Importar jose
    const { SignJWT, importPKCS8 } = await import('https://deno.land/x/jose@v5.2.0/index.ts');

    // Importar clave privada correctamente
    const key = await importPKCS8(privateKey, 'RS256');

    // Firmar JWT
    const jwt = await new SignJWT(payload)
      .setProtectedHeader(header)
      .setIssuedAt(now)
      .setExpirationTime(now + 3600)
      .setIssuer(clientEmail)
      .setAudience(tokenUri)
      .sign(key);

    // Intercambiar JWT por access token
    const tokenResponse = await fetch(tokenUri, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      throw new Error('Error al obtener token: ' + errorText);
    }

    const tokenData = await tokenResponse.json();
    return tokenData.access_token;
  } catch (error) {
    console.error('Error en getAccessToken:', error);
    throw new Error('No se pudo obtener access token: ' + error.message);
  }
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
        JSON.stringify({ success: false, error: "Faltan parámetros (audio o userId)" }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    console.log('✅ Audio recibido:', audio.size, 'bytes');
    console.log('✅ UserId:', userId);

    // 2. Obtener Service Account JSON
    const GOOGLE_SERVICE_ACCOUNT_JSON = Deno.env.get('GOOGLE_SERVICE_ACCOUNT_JSON');
    if (!GOOGLE_SERVICE_ACCOUNT_JSON) {
      throw new Error("Falta GOOGLE_SERVICE_ACCOUNT_JSON en secretos");
    }

    let serviceAccountJson;
    try {
      serviceAccountJson = JSON.parse(GOOGLE_SERVICE_ACCOUNT_JSON);
    } catch (e) {
      throw new Error('JSON de Service Account inválido: ' + e.message);
    }

    console.log('✅ Service Account cargado');

    // 3. Obtener Access Token
    console.log('🔐 Obteniendo access token...');
    const accessToken = await getAccessToken(serviceAccountJson);
    console.log('✅ Access token obtenido');

    // 4. Convertir audio a base64
    const audioArrayBuffer = await audio.arrayBuffer();
    const audioBase64 = btoa(String.fromCharCode(...new Uint8Array(audioArrayBuffer)));

    // 5. Llamar a Speech-to-Text API
    console.log('🎤 Enviando audio a Speech-to-Text...');

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
      'https://speech.googleapis.com/v1/speech:recognize',
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
      console.error('❌ Error Speech-to-Text:', errorText);
      throw new Error('Error al transcribir: ' + errorText);
    }

    const speechData = await speechResponse.json();
    console.log('📝 Respuesta Speech-to-Text:', JSON.stringify(speechData));

    // Extraer transcripción
    let transcript = '';
    if (speechData.results && speechData.results[0]?.alternatives?.[0]?.transcript) {
      transcript = speechData.results[0].alternatives[0].transcript.trim();
    }

    if (!transcript) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "No se pudo transcribir. Intenta hablar más claro.",
          speechResponse: speechData
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    console.log('✅ Transcripción:', transcript);

    // 6. Parsear
    const parsed = parseTranscript(transcript);
    console.log('🧠 Parseado:', JSON.stringify(parsed));

    if (!parsed.amount || parsed.amount <= 0) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'No se detectó monto. Di: "Gasté 50 mil en Jumbo"',
          transcript,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // 7. Guardar en DB
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
      categoryId = otherCat?.[0]?.id || null;
    }

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
      throw new Error('Error al guardar: ' + txError.message);
    }

    console.log('✅ Transacción creada:', transaction.id);

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
