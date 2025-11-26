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

  // 1. DETECTAR TIPO DE TRANSACCIÓN (income vs expense) - MEJORADO
  let type = 'expense'; // Por defecto es gasto
  
  // Palabras clave para INGRESOS (más completas)
  const incomeKeywords = [
    // Verbos en pasado
    'cobré', 'cobre', 'recibí', 'recibi', 'ingresé', 'ingrese', 'gané', 'gane', 
    'vendí', 'vendi', 'entregaron', 'me pagaron', 'me dieron', 'me transfirieron',
    // Verbos en presente
    'cobro', 'recibo', 'ingreso', 'gano', 'vendo', 'recibo pago',
    // Sustantivos y frases
    'ingreso', 'pago recibido', 'sueldo', 'salario', 'pago de', 'transferencia recibida',
    'depósito', 'abono', 'entrada de dinero', 'dinero recibido', 'dinero que recibí',
    // Frases comunes
    'me pagaron', 'me dieron dinero', 'recibí dinero', 'cobré dinero', 'ingresó dinero',
    'dinero que cobré', 'dinero que recibí', 'pago que recibí'
  ];
  
  // Palabras clave para GASTOS (más completas)
  const expenseKeywords = [
    // Verbos en pasado
    'gasté', 'gaste', 'pagué', 'pague', 'compré', 'compre', 'di', 'dé', 'de',
    'compré', 'adquirí', 'adquiri', 'contraté', 'contrate', 'suscribí', 'suscribi',
    // Verbos en presente
    'gasto', 'pago', 'compro', 'comprar', 'pagar', 'gastar',
    // Sustantivos y frases
    'gasto de', 'pago de', 'compra de', 'gasto en', 'pago por', 'compré en',
    'dinero que gasté', 'dinero que pagué', 'dinero que di', 'dinero que invertí',
    // Frases comunes
    'gasté dinero', 'pagué dinero', 'di dinero', 'compré con', 'pagué por',
    'gasto en', 'pago a', 'compré a'
  ];
  
  // Detectar palabras clave con mejor precisión
  // Buscar al inicio de la frase (más confiable) o después de espacios
  // IMPORTANTE: Escapar caracteres especiales en las palabras clave para regex
  const escapedIncomeKeywords = incomeKeywords.map(k => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  const escapedExpenseKeywords = expenseKeywords.map(k => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  
  const incomePattern = new RegExp(`(?:^|\\s)(?:${escapedIncomeKeywords.join('|')})(?:\\s|$)`, 'i');
  const expensePattern = new RegExp(`(?:^|\\s)(?:${escapedExpenseKeywords.join('|')})(?:\\s|$)`, 'i');
  
  const hasIncomeKeyword = incomePattern.test(lowerText);
  const hasExpenseKeyword = expensePattern.test(lowerText);
  
  // También buscar palabras clave en cualquier parte (por si Whisper no transcribe perfectamente)
  const hasIncomeAnywhere = incomeKeywords.some(keyword => {
    // Escapar caracteres especiales para regex
    const escapedKeyword = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    // Buscar la palabra completa, no como parte de otra palabra
    const regex = new RegExp(`\\b${escapedKeyword}\\b`, 'i');
    return regex.test(lowerText);
  });
  
  const hasExpenseAnywhere = expenseKeywords.some(keyword => {
    const escapedKeyword = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`\\b${escapedKeyword}\\b`, 'i');
    return regex.test(lowerText);
  });
  
  // Decidir el tipo basado en las detecciones
  // Prioridad: si hay palabra de ingreso Y NO hay palabra de gasto → INGRESO
  // Si hay palabra de gasto Y NO hay palabra de ingreso → GASTO
  // Si hay ambas, dar prioridad a la que aparece primero o es más específica
  if ((hasIncomeKeyword || hasIncomeAnywhere) && !(hasExpenseKeyword || hasExpenseAnywhere)) {
    type = 'income';
    console.log('✅ Tipo detectado: INGRESO (income)');
  } else if ((hasExpenseKeyword || hasExpenseAnywhere) && !(hasIncomeKeyword || hasIncomeAnywhere)) {
    type = 'expense';
    console.log('✅ Tipo detectado: GASTO (expense)');
  } else if ((hasIncomeKeyword || hasIncomeAnywhere) && (hasExpenseKeyword || hasExpenseAnywhere)) {
    // Si hay ambas, buscar cuál aparece primero (más cerca del inicio = más importante)
    const incomeIndex = lowerText.search(incomePattern);
    const expenseIndex = lowerText.search(expensePattern);
    
    if (incomeIndex !== -1 && (expenseIndex === -1 || incomeIndex < expenseIndex)) {
      type = 'income';
      console.log('✅ Tipo detectado: INGRESO (income) - aparece primero');
    } else {
      type = 'expense';
      console.log('✅ Tipo detectado: GASTO (expense) - aparece primero o es más común');
    }
  } else {
    // Por defecto es gasto si no se detecta nada
    type = 'expense';
    console.log('⚠️ No se detectó tipo específico, usando GASTO por defecto');
  }
  
  console.log('📊 Análisis de tipo:', {
    texto: text,
    tieneIngreso: hasIncomeKeyword || hasIncomeAnywhere,
    tieneGasto: hasExpenseKeyword || hasExpenseAnywhere,
    tipoFinal: type
  });

  // 2. EXTRAER MONTO (mejorado para formato chileno e internacional)
  let amount = 0;
  console.log('🔍 Iniciando extracción de monto del texto:', text);

  // Detectar si el usuario menciona "pesos" o "clp" (indica formato chileno)
  const hasPesosKeyword = /\b(?:pesos?|clp)\b/i.test(text);
  console.log('🔍 ¿Menciona "pesos" o "clp"?', hasPesosKeyword);

  // PRIORIDAD 0: Detectar formato "50k", "30k", etc
  const kMatch = lowerText.match(/(\d+)\s*k\b/);
  if (kMatch) {
    amount = parseInt(kMatch[1]) * 1000;
    console.log('✅ Formato "k" detectado:', kMatch[0], '→', amount);
  }

  // PRIORIDAD 1: FORMATO CHILENO (PUNTO COMO SEPARADOR DE MILES)
  // Si el usuario menciona "pesos" o "clp", PRIORIZAR formato chileno
  // Esto es CRÍTICO: "60.000 pesos" debe ser 60000, NO 60.00
  if (!amount) {
    // Buscar números con punto seguido de exactamente 3 dígitos (formato chileno estándar)
    // Ejemplos: "60.000", "1.300", "950.000", "2.300"
    // Usar el texto ORIGINAL (no lowerText) para mantener la puntuación exacta
    const chileanFormatMatch = text.match(/(\d{1,3})\.(\d{3})\b/);
    if (chileanFormatMatch) {
      const parteEntera = chileanFormatMatch[1];
      const parteDecimal = chileanFormatMatch[2];
      // Si tiene exactamente 3 dígitos después del punto → separador de miles (60.000 = 60000)
      amount = parseFloat(parteEntera + parteDecimal);
      console.log('✅ FORMATO CHILENO detectado (punto + 3 dígitos):', chileanFormatMatch[0], '→', amount);
    }
  }

  // PRIORIDAD 1.5: Formato chileno con múltiples puntos (ej: 1.500.000)
  if (!amount) {
    const chileanMultiPointMatch = text.match(/(\d{1,3}(?:\.\d{3})+)/);
    if (chileanMultiPointMatch) {
      // Remover todos los puntos (son separadores de miles)
      let numStr = chileanMultiPointMatch[1].replace(/\./g, '');
      amount = parseFloat(numStr);
      console.log('✅ FORMATO CHILENO (múltiples puntos) detectado:', chileanMultiPointMatch[1], '→', amount);
    }
  }

  // PRIORIDAD 2: Si menciona "pesos" o "clp", cualquier número con punto es formato chileno
  // Esto captura casos como "10.50 pesos" que deberían ser 1050 (no 10.50)
  if (!amount && hasPesosKeyword) {
    const chileanWithPesosMatch = text.match(/(\d+)\.(\d{1,2})\s*(?:pesos|clp)/i);
    if (chileanWithPesosMatch) {
      const parteEntera = chileanWithPesosMatch[1];
      const parteDecimal = chileanWithPesosMatch[2];
      // Si menciona "pesos", el punto es separador de miles
      // "10.50 pesos" = 1050, "20.30 pesos" = 2030
      amount = parseFloat(parteEntera + parteDecimal.padEnd(3, '0'));
      console.log('✅ FORMATO CHILENO (con palabra "pesos"):', chileanWithPesosMatch[0], '→', amount);
    }
  }

  // PRIORIDAD 3: Detectar números con comas como separador de miles (formato internacional: 100,000, 500,000)
  // Solo si NO se menciona "pesos" o "clp" (para evitar conflictos)
  if (!amount && !hasPesosKeyword) {
    // Buscar números con comas (formato internacional)
    const internationalFormatMatch = text.match(/(\d{1,3}(?:,\d{3})+)/);
    if (internationalFormatMatch) {
      // Formato internacional: remover TODAS las comas (son separadores de miles)
      let numStr = internationalFormatMatch[1].replace(/,/g, '');
      amount = parseFloat(numStr);
      console.log('✅ Formato internacional (coma como miles) detectado:', internationalFormatMatch[1], '→', amount);
    }
  }
  
  // PRIORIDAD 3.5: Detectar números con coma seguidos de exactamente 3 dígitos (formato internacional)
  if (!amount && !hasPesosKeyword) {
    const commaThreeDigitsMatch = text.match(/(\d{1,3}),(\d{3})\b/);
    if (commaThreeDigitsMatch) {
      const parteEntera = commaThreeDigitsMatch[1];
      const parteDecimal = commaThreeDigitsMatch[2];
      // Si tiene exactamente 3 dígitos después de la coma → separador de miles (100,000 = 100000)
      amount = parseFloat(parteEntera + parteDecimal);
      console.log('✅ Coma como separador de miles (3 dígitos exactos):', commaThreeDigitsMatch[0], '→', amount);
    }
  }

  // PRIORIDAD 4: Detectar punto como decimal (solo si NO menciona "pesos" y tiene 1-2 dígitos después)
  // Esto es para casos como "1.50" o "28.30" cuando NO es formato chileno
  if (!amount && !hasPesosKeyword) {
    const decimalPointMatch = text.match(/(\d+)\.(\d{1,2})\b/);
    if (decimalPointMatch) {
      const parteEntera = parseInt(decimalPointMatch[1]);
      const parteDecimal = decimalPointMatch[2];
      // Si es pequeño (< 10) con 1-2 dígitos → decimal real (1.20 = 1.20)
      if (parteEntera < 10) {
        amount = parseFloat(parteEntera + '.' + parteDecimal);
        console.log('✅ Punto como decimal (número < 10):', decimalPointMatch[0], '→', amount);
      }
    }
  }


  // PRIORIDAD 4: Detectar patrones de texto como "950 mil", "2 mil 300", etc.
  if (!amount) {
    const milPattern = lowerText.match(/(\d+)\s*(?:mil|k)\s*(?:y\s*(\d+))?/);
    if (milPattern) {
      const miles = parseInt(milPattern[1]) * 1000;
      const unidades = milPattern[2] ? parseInt(milPattern[2]) : 0;
      amount = miles + unidades;
      console.log('✅ Patrón "mil" detectado:', milPattern[0], '→', amount);
    }
  }

  // PRIORIDAD 5: Detectar números con coma como decimal (formato: 2,30 o 28,50)
  // Solo si no se detectó como separador de miles (debe tener 1-2 dígitos después de la coma)
  if (!amount) {
    const decimalCommaMatch = lowerText.match(/(\d+),(\d{1,2})\b/);
    if (decimalCommaMatch) {
      // Coma como decimal: reemplazar coma por punto
      let numStr = decimalCommaMatch[1] + '.' + decimalCommaMatch[2];
      amount = parseFloat(numStr);
      console.log('✅ Formato decimal con coma detectado:', decimalCommaMatch[0], '→', amount);
    }
  }

  // PRIORIDAD 6: Detectar formato simple "$1200", "1200 pesos", etc (sin separadores)
  // ESTE DEBE IR AL FINAL para no capturar números que son parte de formatos más complejos
  // IMPORTANTE: Solo capturar números grandes (4+ dígitos) para evitar capturar números pequeños
  if (!amount) {
    // Buscar números de 4 o más dígitos (probablemente son montos reales)
    const largeNumberMatch = lowerText.match(/(\d{4,})/);
    if (largeNumberMatch) {
      amount = parseFloat(largeNumberMatch[1]);
      console.log('✅ Formato simple (número grande 4+ dígitos) detectado:', largeNumberMatch[1], '→', amount);
    } else {
      // Si no hay números grandes, buscar el número más grande en el texto
      const allNumbers = lowerText.match(/(\d+)/g);
      if (allNumbers && allNumbers.length > 0) {
        // Tomar el número más grande encontrado
        let maxAmount = 0;
        for (const numStr of allNumbers) {
          const num = parseFloat(numStr);
          if (num > maxAmount) {
            maxAmount = num;
          }
        }
        if (maxAmount > 0) {
          amount = maxAmount;
          console.log('✅ Formato simple detectado (número más grande):', maxAmount);
        }
      }
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

  // 3. EXTRAER DESCRIPCIÓN (limpiar completamente de números y montos)
  let description = text.trim();
  
  // Paso 1: Remover verbos comunes al inicio
  const verbosPattern = /^(?:cobré|cobre|recibí|recibi|ingresé|ingrese|gané|gane|vendí|vendi|gasté|gaste|pagué|pague|compré|compre|di|dé|de|gasto|gasto de)\s+/i;
  description = description.replace(verbosPattern, '');
  
  // Paso 2: Remover TODOS los números y montos de la descripción
  // Esto asegura que los números solo aparezcan en el campo "amount", no en "description"
  
  // - Remover símbolo de dólar y espacios alrededor
  description = description.replace(/\$\s*/g, '');
  
  // - Montos con formato chileno: $1.300, 950.000, 2.300 (punto como separador de miles)
  description = description.replace(/\d{1,3}(?:\.\d{3})+/g, '');
  
  // - Montos con formato internacional: $950,000, 1,300 (coma como separador de miles)
  description = description.replace(/\d{1,3}(?:,\d{3})+/g, '');
  
  // - Montos con punto como decimal: $1.20, 28.50, 1.82
  description = description.replace(/\d+\.\d{1,2}/g, '');
  
  // - Montos con coma como decimal: $1,20, 28,50
  description = description.replace(/\d+,\d{1,2}/g, '');
  
  // - TODOS los números sueltos (cualquier cantidad de dígitos)
  // Esto remueve números como "1300", "950", "28", etc.
  description = description.replace(/\d+/g, '');
  
  // - Palabras relacionadas con montos: "pesos", "clp", "usd"
  description = description.replace(/\s*(?:pesos|clp|usd)\s*/gi, '');
  
  // - Palabras numéricas: "mil", "dos mil", "millón", etc.
  description = description.replace(/\s+(?:mil|dos mil|tres mil|cuatro mil|cinco mil|seis mil|siete mil|ocho mil|nueve mil|diez mil|veinte mil|treinta mil|cuarenta mil|cincuenta mil|sesenta mil|setenta mil|ochenta mil|noventa mil|cien mil|doscientos mil|trescientos mil|cuatrocientos mil|quinientos mil|seiscientos mil|setecientos mil|ochocientos mil|novecientos mil|un millón|millones?)\s*/gi, '');
  
  // - Formato "k": 50k, 30k
  description = description.replace(/\s*\d+\s*k\b/gi, '');
  
  // Paso 3: Limpiar espacios múltiples y puntuación extra
  description = description.replace(/\s+/g, ' ').trim();
  description = description.replace(/^[.,;:\s]+|[.,;:\s]+$/g, ''); // Remover puntuación al inicio/final
  
  // Paso 4: Si la descripción está vacía o muy corta, extraer palabras descriptivas del texto original
  if (!description || description.length < 2) {
    // Extraer solo palabras descriptivas (sin números, verbos, ni palabras de moneda)
    const palabras = text.split(/\s+/).filter(palabra => {
      const palabraLimpia = palabra.replace(/[0-9$.,]/g, '').toLowerCase();
      // Filtrar:
      // - Palabras vacías o solo números
      if (!palabraLimpia || palabraLimpia.length === 0) return false;
      // - Verbos comunes
      if (/^(?:cobré|cobre|recibí|recibi|ingresé|ingrese|gané|gane|vendí|vendi|gasté|gaste|pagué|pague|compré|compre|di|dé|de|gasto)$/i.test(palabraLimpia)) return false;
      // - Palabras numéricas
      if (/^(?:mil|dos mil|tres mil|cuatro mil|cinco mil|seis mil|siete mil|ocho mil|nueve mil|diez mil|veinte mil|treinta mil|cuarenta mil|cincuenta mil|sesenta mil|setenta mil|ochenta mil|noventa mil|cien mil|doscientos mil|trescientos mil|cuatrocientos mil|quinientos mil|seiscientos mil|setecientos mil|ochocientos mil|novecientos mil|un millón|millones?)$/i.test(palabraLimpia)) return false;
      // - Palabras de moneda
      if (/^(?:pesos?|clp|usd)$/i.test(palabraLimpia)) return false;
      // - Números puros
      if (/^\d+$/.test(palabra)) return false;
      return true;
    });
    
    description = palabras.join(' ').trim();
    
    // Si aún está vacío después de filtrar, usar "Transacción" como fallback
    if (!description || description.length < 2) {
      description = 'Transacción';
    }
  }
  
  // Paso 5: Limpiar espacios múltiples y puntuación extra (de nuevo, por si acaso)
  description = description.replace(/\s+/g, ' ').trim();
  description = description.replace(/^[.,;:\s]+|[.,;:\s]+$/g, '');
  
  // Paso 6: Capitalizar primera letra y limitar longitud
  if (description.length > 0) {
    description = description.charAt(0).toUpperCase() + description.slice(1);
  }
  
  // Limitar longitud final
  if (description.length > 100) {
    description = description.slice(0, 97).trim() + '...';
  }
  
  // Verificar que no queden números en la descripción
  if (/\d/.test(description)) {
    console.warn('⚠️ ADVERTENCIA: La descripción aún contiene números:', description);
    // Remover cualquier número que haya quedado
    description = description.replace(/\d/g, '').trim();
  }
  
  console.log('✅ Descripción final limpia (sin números):', description);

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
    
    console.log('=== PREFERENCIAS DE USUARIO ===');
    console.log('Moneda encontrada en BD:', preferences?.currency);
    console.log('Moneda que se usará:', userCurrency);
    console.log('Preferencias completas:', preferences);

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
    const transactionData = {
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
    };

    console.log('=== DATOS DE TRANSACCIÓN A GUARDAR ===');
    console.log('Monto:', transactionData.amount);
    console.log('Moneda:', transactionData.currency);
    console.log('Tipo:', transactionData.type);
    console.log('Descripción:', transactionData.description);
    console.log('Categoría ID:', transactionData.category_id);
    console.log('Datos completos:', JSON.stringify(transactionData, null, 2));

    const { data: transaction, error: txError } = await supabase
      .from('transactions')
      .insert(transactionData)
      .select()
      .single()

    if (txError) {
      console.error('=== ERROR AL CREAR TRANSACCIÓN ===');
      console.error('Error completo:', txError);
      console.error('Datos que se intentaron guardar:', transactionData);
      throw new Error('Error al guardar la transacción: ' + txError.message)
    }

    console.log('=== TRANSACCIÓN CREADA EXITOSAMENTE ===');
    console.log('ID:', transaction.id);
    console.log('Monto guardado:', transaction.amount);
    console.log('Moneda guardada:', transaction.currency);

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
