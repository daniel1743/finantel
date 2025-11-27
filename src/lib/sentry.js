// =====================================================
// SENTRY - ERROR TRACKING Y MONITOREO
// =====================================================
// Configuración de Sentry para frontend
// =====================================================

// Importar Sentry
import * as Sentry from "@sentry/react";

// Inicializar Sentry solo en producción
export const initSentry = () => {
  const dsn = import.meta.env.VITE_SENTRY_DSN;
  const environment = import.meta.env.MODE || 'development';
  
  // Solo inicializar si hay DSN y estamos en producción
  if (!dsn || environment === 'development') {
    console.log('Sentry no inicializado (modo desarrollo o DSN faltante)');
    return;
  }

  Sentry.init({
    dsn,
    environment,
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],
    // Performance Monitoring
    tracesSampleRate: environment === 'production' ? 0.1 : 1.0, // 10% en producción
    // Session Replay
    replaysSessionSampleRate: 0.1, // 10% de sesiones
    replaysOnErrorSampleRate: 1.0, // 100% de sesiones con errores
    
    // Filtros de errores
    beforeSend(event, hint) {
      // Filtrar errores conocidos/no críticos
      if (event.exception) {
        const error = hint.originalException || hint.syntheticException;
        const errorMessage = error?.message || '';
        
        // Ignorar errores de red comunes
        if (
          errorMessage.includes('Failed to fetch') ||
          errorMessage.includes('NetworkError') ||
          errorMessage.includes('Network request failed')
        ) {
          return null; // No enviar este error
        }
        
        // Ignorar errores de CORS en desarrollo
        if (errorMessage.includes('CORS') && environment !== 'production') {
          return null;
        }
      }
      
      // Agregar contexto adicional
      event.tags = {
        ...event.tags,
        app: 'finantel',
        version: import.meta.env.VITE_APP_VERSION || '2.1',
      };
      
      return event;
    },
    
    // Configuración de release
    release: `finantel@${import.meta.env.VITE_APP_VERSION || '2.1'}`,
    
    // Ignorar URLs específicas
    ignoreErrors: [
      // Errores de navegador comunes
      'ResizeObserver loop limit exceeded',
      'Non-Error promise rejection captured',
      // Errores de extensiones del navegador
      /Extension context invalidated/,
      /chrome-extension:/,
    ],
  });
};

// Función helper para capturar errores manualmente
export const captureError = (error, context = {}) => {
  Sentry.captureException(error, {
    contexts: {
      custom: context,
    },
    tags: {
      manual: true,
    },
  });
};

// Función para capturar mensajes
export const captureMessage = (message, level = 'info', context = {}) => {
  Sentry.captureMessage(message, {
    level,
    contexts: {
      custom: context,
    },
  });
};

// Función para agregar contexto de usuario
export const setUserContext = (user) => {
  if (!user) {
    Sentry.setUser(null);
    return;
  }

  Sentry.setUser({
    id: user.id,
    email: user.email,
    username: user.user_metadata?.full_name || user.email?.split('@')[0],
    // NO incluir datos sensibles
  });
};

// Función para agregar contexto adicional
export const addBreadcrumb = (message, category, level = 'info', data = {}) => {
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

// Función para establecer contexto de transacción
export const startTransaction = (name, op = 'navigation') => {
  return Sentry.startSpan({
    name,
    op,
  });
};

// Función para marcar errores como críticos
export const captureCriticalError = (error, context = {}) => {
  Sentry.captureException(error, {
    level: 'fatal',
    tags: {
      critical: true,
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

// Función para monitorear performance de funciones
export const monitorPerformance = async (name, fn, context = {}) => {
  const transaction = Sentry.startTransaction({
    name,
    op: 'function',
  });

  try {
    const result = await fn();
    transaction.setStatus('ok');
    return result;
  } catch (error) {
    transaction.setStatus('internal_error');
    captureError(error, { ...context, function: name });
    throw error;
  } finally {
    transaction.finish();
  }
};

// Exportar Sentry para uso directo si es necesario
export { Sentry };

