import * as Sentry from "@sentry/react";

// Prevenir inicialización múltiple
if (!window.__SENTRY_INITIALIZED__ && import.meta.env.VITE_SENTRY_DSN) {
  try {
    Sentry.init({
      dsn: import.meta.env.VITE_SENTRY_DSN,
      sendDefaultPii: true,
      tracesSampleRate: 1.0,   // performance
      replaysSessionSampleRate: 0.1, 
      replaysOnErrorSampleRate: 1.0,
      integrations: [
        Sentry.browserTracingIntegration(),
        Sentry.replayIntegration(),
        Sentry.consoleLoggingIntegration({
          levels: ["error", "warn"],
        }),
      ],
    });
    window.__SENTRY_INITIALIZED__ = true;
  } catch (error) {
    console.error('[Sentry] Error inicializando Sentry:', error);
  }
}

export const captureError = (error, extra = {}) => {
  Sentry.captureException(error, { extra });
};

export const captureMessage = (msg, extra = {}) => {
  Sentry.captureMessage(msg, { extra });
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

// Exportar Sentry para uso directo
export { Sentry };
