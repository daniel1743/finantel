// =====================================================
// FASE 5: SEGURIDAD EN FRONTEND
// =====================================================
// Helpers de seguridad para el cliente
// =====================================================

// =====================================================
// 1. SANITIZACIÓN BÁSICA (CLIENT-SIDE)
// =====================================================

export function sanitizeInput(input: string): string {
  if (typeof input !== 'string') {
    return '';
  }

  // Remover tags HTML
  const div = document.createElement('div');
  div.textContent = input;
  let sanitized = div.innerHTML;

  // Remover caracteres especiales peligrosos
  sanitized = sanitized.replace(/[<>'"&]/g, '');

  // Limitar longitud
  sanitized = sanitized.substring(0, 10000);

  return sanitized.trim();
}

// =====================================================
// 2. VALIDACIÓN DE EMAIL
// =====================================================

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
}

// =====================================================
// 3. VALIDACIÓN DE UUID
// =====================================================

export function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

// =====================================================
// 4. VALIDACIÓN DE NÚMERO
// =====================================================

export function isValidNumber(value: any, min?: number, max?: number): boolean {
  const num = typeof value === 'number' ? value : parseFloat(value);
  
  if (isNaN(num) || !isFinite(num)) {
    return false;
  }

  if (min !== undefined && num < min) {
    return false;
  }

  if (max !== undefined && num > max) {
    return false;
  }

  return true;
}

// =====================================================
// 5. NO EXPONER API KEYS
// =====================================================

// Esta función asegura que nunca se expongan API keys en el código
export function getApiKey(keyName: string): string {
  // Solo usar variables de entorno
  const key = import.meta.env[`VITE_${keyName}`];
  
  if (!key) {
    console.error(`API key ${keyName} not found in environment variables`);
    return '';
  }

  return key;
}

// =====================================================
// 6. CIFRADO BÁSICO (CLIENT-SIDE)
// =====================================================

export async function hashString(input: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// =====================================================
// 7. VALIDACIÓN DE TOKEN JWT BÁSICA
// =====================================================

export function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const exp = payload.exp * 1000; // Convertir a milisegundos
    return Date.now() >= exp;
  } catch {
    return true;
  }
}

// =====================================================
// 8. LIMPIAR DATOS SENSIBLES DE LOGS
// =====================================================

export function sanitizeForLogging(data: any): any {
  if (typeof data !== 'object' || data === null) {
    return '[REDACTED]';
  }

  const sensitiveKeys = [
    'password',
    'token',
    'secret',
    'key',
    'authorization',
    'api_key',
    'access_token',
    'refresh_token'
  ];

  const sanitized: any = Array.isArray(data) ? [] : {};

  for (const [key, value] of Object.entries(data)) {
    const lowerKey = key.toLowerCase();
    const isSensitive = sensitiveKeys.some(sk => lowerKey.includes(sk));

    if (isSensitive) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeForLogging(value);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}

// =====================================================
// 9. RATE LIMITING CLIENT-SIDE BÁSICO
// =====================================================

const requestTimestamps: Map<string, number[]> = new Map();

export function checkClientRateLimit(
  identifier: string,
  maxRequests: number = 10,
  windowMs: number = 60000
): boolean {
  const now = Date.now();
  const timestamps = requestTimestamps.get(identifier) || [];

  // Limpiar timestamps antiguos
  const recentTimestamps = timestamps.filter(ts => now - ts < windowMs);

  if (recentTimestamps.length >= maxRequests) {
    return false;
  }

  recentTimestamps.push(now);
  requestTimestamps.set(identifier, recentTimestamps);

  return true;
}

// =====================================================
// FIN DE SEGURIDAD FRONTEND
// =====================================================

