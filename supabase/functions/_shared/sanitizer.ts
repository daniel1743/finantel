// =====================================================
// FASE 3: SANITIZACIÓN NIVEL LABORATORIO
// =====================================================
// Sanitización extrema de todos los inputs
// =====================================================

// =====================================================
// 1. SANITIZACIÓN DE STRINGS
// =====================================================

export function sanitizeString(input: any): string {
  if (typeof input !== 'string') {
    return '';
  }

  // Remover caracteres de control
  let sanitized = input.replace(/[\x00-\x1F\x7F]/g, '');

  // Remover scripts y tags HTML
  sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  sanitized = sanitized.replace(/<[^>]+>/g, '');

  // Remover caracteres especiales peligrosos
  sanitized = sanitized.replace(/[<>'"&]/g, '');

  // Limitar longitud
  sanitized = sanitized.substring(0, 10000);

  // Trim
  sanitized = sanitized.trim();

  return sanitized;
}

// =====================================================
// 2. SANITIZACIÓN DE NÚMEROS
// =====================================================

export function sanitizeNumber(input: any, min?: number, max?: number): number | null {
  if (typeof input === 'number') {
    const num = input;
    if (isNaN(num) || !isFinite(num)) {
      return null;
    }
    if (min !== undefined && num < min) {
      return null;
    }
    if (max !== undefined && num > max) {
      return null;
    }
    return num;
  }

  if (typeof input === 'string') {
    const num = parseFloat(input);
    if (isNaN(num) || !isFinite(num)) {
      return null;
    }
    if (min !== undefined && num < min) {
      return null;
    }
    if (max !== undefined && num > max) {
      return null;
    }
    return num;
  }

  return null;
}

// =====================================================
// 3. SANITIZACIÓN DE EMAILS
// =====================================================

export function sanitizeEmail(input: any): string | null {
  if (typeof input !== 'string') {
    return null;
  }

  const email = input.trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(email)) {
    return null;
  }

  // Limitar longitud
  if (email.length > 254) {
    return null;
  }

  return email;
}

// =====================================================
// 4. SANITIZACIÓN DE UUIDs
// =====================================================

export function sanitizeUUID(input: any): string | null {
  if (typeof input !== 'string') {
    return null;
  }

  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  const sanitized = input.trim().toLowerCase();

  if (!uuidRegex.test(sanitized)) {
    return null;
  }

  return sanitized;
}

// =====================================================
// 5. SANITIZACIÓN DE URLs
// =====================================================

export function sanitizeURL(input: any): string | null {
  if (typeof input !== 'string') {
    return null;
  }

  try {
    const url = new URL(input);
    
    // Solo permitir HTTPS
    if (url.protocol !== 'https:') {
      return null;
    }

    // Validar dominio permitido (whitelist)
    const allowedDomains = [
      'mercadopago.com',
      'mercadolibre.com',
      'supabase.co',
      'vercel.app'
    ];

    const isAllowed = allowedDomains.some(domain => 
      url.hostname === domain || url.hostname.endsWith('.' + domain)
    );

    if (!isAllowed) {
      return null;
    }

    return url.toString();
  } catch {
    return null;
  }
}

// =====================================================
// 6. SANITIZACIÓN DE JSON
// =====================================================

export function sanitizeJSON(input: any): any {
  if (typeof input === 'string') {
    try {
      const parsed = JSON.parse(input);
      return sanitizeObject(parsed);
    } catch {
      return null;
    }
  }

  if (typeof input === 'object' && input !== null) {
    return sanitizeObject(input);
  }

  return null;
}

// =====================================================
// 7. SANITIZACIÓN DE OBJETOS
// =====================================================

export function sanitizeObject(obj: any, maxDepth: number = 10, currentDepth: number = 0): any {
  if (currentDepth > maxDepth) {
    return null;
  }

  if (obj === null || obj === undefined) {
    return null;
  }

  if (typeof obj === 'string') {
    return sanitizeString(obj);
  }

  if (typeof obj === 'number') {
    return sanitizeNumber(obj);
  }

  if (typeof obj === 'boolean') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj
      .slice(0, 100) // Limitar arrays a 100 elementos
      .map(item => sanitizeObject(item, maxDepth, currentDepth + 1))
      .filter(item => item !== null);
  }

  if (typeof obj === 'object') {
    const sanitized: Record<string, any> = {};
    const keys = Object.keys(obj).slice(0, 50); // Limitar a 50 propiedades

    for (const key of keys) {
      const sanitizedKey = sanitizeString(key);
      if (sanitizedKey) {
        sanitized[sanitizedKey] = sanitizeObject(obj[key], maxDepth, currentDepth + 1);
      }
    }

    return sanitized;
  }

  return null;
}

// =====================================================
// 8. SANITIZACIÓN DE FECHAS
// =====================================================

export function sanitizeDate(input: any): string | null {
  if (input instanceof Date) {
    const date = input.toISOString();
    return date;
  }

  if (typeof input === 'string') {
    const date = new Date(input);
    if (isNaN(date.getTime())) {
      return null;
    }
    return date.toISOString();
  }

  if (typeof input === 'number') {
    const date = new Date(input);
    if (isNaN(date.getTime())) {
      return null;
    }
    return date.toISOString();
  }

  return null;
}

// =====================================================
// 9. SANITIZACIÓN DE ENUMS
// =====================================================

export function sanitizeEnum<T extends string>(
  input: any,
  allowedValues: readonly T[]
): T | null {
  if (typeof input !== 'string') {
    return null;
  }

  const sanitized = input.trim().toLowerCase();
  const allowed = allowedValues.map(v => v.toLowerCase());

  if (!allowed.includes(sanitized)) {
    return null;
  }

  const index = allowed.indexOf(sanitized);
  return allowedValues[index];
}

// =====================================================
// 10. SANITIZACIÓN COMPLETA DE REQUEST
// =====================================================

export function sanitizeRequest(body: any): any {
  if (!body || typeof body !== 'object') {
    return {};
  }

  return sanitizeObject(body, 5);
}

// =====================================================
// FIN DE SANITIZACIÓN
// =====================================================

