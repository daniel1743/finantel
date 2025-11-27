// =====================================================
// SENTRY PARA EDGE FUNCTIONS (DENO)
// =====================================================
// Configuración de Sentry para Edge Functions
// =====================================================

import * as Sentry from "https://deno.land/x/sentry@7.77.0/index.js";

// Inicializar Sentry para Edge Functions
export const initSentryEdge = () => {
  const dsn = Deno.env.get('SENTRY_DSN');
  const environment = Deno.env.get('ENVIRONMENT') || 'production';
  
  if (!dsn) {
    console.log('Sentry no inicializado (DSN faltante)');
    return;
  }

  Sentry.init({
    dsn,
    environment,
    tracesSampleRate: 0.1, // 10% de transacciones
    beforeSend(event, hint) {
      // Filtrar errores no críticos
      if (event.exception) {
        const error = hint.originalException;
        const errorMessage = error?.message || '';
        
        // Ignorar errores de validación comunes
        if (
          errorMessage.includes('validation') ||
          errorMessage.includes('Invalid input')
        ) {
          return null;
        }
      }
      
      // Agregar contexto
      event.tags = {
        ...event.tags,
        service: 'edge-function',
        app: 'finantel',
      };
      
      return event;
    },
  });
};

// Función helper para capturar errores
export const captureError = (error: Error, context: Record<string, any> = {}) => {
  Sentry.captureException(error, {
    contexts: {
      custom: context,
    },
    tags: {
      edge_function: true,
    },
  });
};

// Función para capturar mensajes
export const captureMessage = (message: string, level: Sentry.SeverityLevel = 'info', context: Record<string, any> = {}) => {
  Sentry.captureMessage(message, {
    level,
    contexts: {
      custom: context,
    },
  });
};

// Función para marcar errores críticos
export const captureCriticalError = (error: Error, context: Record<string, any> = {}) => {
  Sentry.captureException(error, {
    level: 'fatal',
    tags: {
      critical: true,
      edge_function: true,
      ...context,
    },
    contexts: {
      custom: {
        ...context,
        timestamp: new Date().toISOString(),
      },
    },
  });
};

// Función para monitorear performance
export const monitorPerformance = async <T>(
  name: string,
  fn: () => Promise<T>,
  context: Record<string, any> = {}
): Promise<T> => {
  const transaction = Sentry.startTransaction({
    name,
    op: 'edge_function',
  });

  try {
    const result = await fn();
    transaction.setStatus('ok');
    return result;
  } catch (error) {
    transaction.setStatus('internal_error');
    captureError(error as Error, { ...context, function: name });
    throw error;
  } finally {
    transaction.finish();
  }
};

// Función para agregar contexto de usuario
export const setUserContext = (userId: string, email?: string) => {
  Sentry.setUser({
    id: userId,
    email,
  });
};

// Función para agregar breadcrumb
export const addBreadcrumb = (
  message: string,
  category: string,
  level: Sentry.SeverityLevel = 'info',
  data: Record<string, any> = {}
) => {
  Sentry.addBreadcrumb({
    message,
    category,
    level,
    data: {
      ...data,
      timestamp: new Date().toISOString(),
    },
  });
};

// Exportar Sentry
export { Sentry };

