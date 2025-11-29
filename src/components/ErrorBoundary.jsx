// =====================================================
// ERROR BOUNDARY CON SENTRY
// =====================================================
// Captura errores de React y los envía a Sentry
// =====================================================

import React from 'react';
import { ErrorBoundary as SentryErrorBoundary } from '@sentry/react';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Componente de UI para errores - versión sin Router
const ErrorFallbackNoRouter = ({ error, resetError }) => {
  const handleGoHome = () => {
    window.location.href = '/dashboard';
  };

  return (
    <div className="min-h-screen bg-[#F5F7F9] flex items-center justify-center p-6">
      <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl border border-gray-200 dark:border-white/10 shadow-lg max-w-2xl w-full p-8">
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center mb-6">
            <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          
          <h1 className="text-2xl font-bold text-[#1a1a1a] dark:text-white mb-2">
            Algo salió mal
          </h1>
          
          <p className="text-[#6E6E73] dark:text-gray-400 mb-6">
            Lo sentimos, ocurrió un error inesperado. Por favor, intenta recargar la página o volver al inicio.
          </p>

          {/* Detalles del error (solo en desarrollo) */}
          {import.meta.env.MODE === 'development' && error && (
            <div className="w-full mb-6 p-4 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-200 dark:border-white/10 text-left">
              <p className="text-xs font-semibold text-[#6E6E73] dark:text-gray-400 mb-2">
                Detalles del error (solo visible en desarrollo):
              </p>
              <pre className="text-xs text-red-600 dark:text-red-400 overflow-auto">
                {error.toString()}
                {error.stack && `\n\n${error.stack}`}
              </pre>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={resetError}
              className="px-6 py-3 bg-[#1C8FA0] text-white rounded-xl font-medium hover:bg-[#167a8a] transition-colors flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Intentar de nuevo
            </button>
            
            <button
              onClick={handleGoHome}
              className="px-6 py-3 bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-white/10 text-[#1a1a1a] dark:text-white rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-white/5 transition-colors flex items-center gap-2"
            >
              <Home className="w-4 h-4" />
              Volver al inicio
            </button>
          </div>

          <p className="text-sm text-[#6E6E73] dark:text-gray-400 mt-6">
            Si el problema persiste, por favor contacta a soporte.
          </p>
          
          <a
            href="/dashboard/support"
            className="text-sm text-[#1C8FA0] hover:underline mt-2"
          >
            Contactar Soporte
          </a>
        </div>
      </div>
    </div>
  );
};

// Componente de UI para errores - versión con Router
const ErrorFallbackWithRouter = ({ error, resetError }) => {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-[#F5F7F9] flex items-center justify-center p-6">
      <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl border border-gray-200 dark:border-white/10 shadow-lg max-w-2xl w-full p-8">
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center mb-6">
            <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          
          <h1 className="text-2xl font-bold text-[#1a1a1a] dark:text-white mb-2">
            Algo salió mal
          </h1>
          
          <p className="text-[#6E6E73] dark:text-gray-400 mb-6">
            Lo sentimos, ocurrió un error inesperado. Por favor, intenta recargar la página o volver al inicio.
          </p>

          {/* Detalles del error (solo en desarrollo) */}
          {import.meta.env.MODE === 'development' && error && (
            <div className="w-full mb-6 p-4 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-200 dark:border-white/10 text-left">
              <p className="text-xs font-semibold text-[#6E6E73] dark:text-gray-400 mb-2">
                Detalles del error (solo visible en desarrollo):
              </p>
              <pre className="text-xs text-red-600 dark:text-red-400 overflow-auto">
                {error.toString()}
                {error.stack && `\n\n${error.stack}`}
              </pre>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={resetError}
              className="px-6 py-3 bg-[#1C8FA0] text-white rounded-xl font-medium hover:bg-[#167a8a] transition-colors flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Intentar de nuevo
            </button>
            
            <button
              onClick={handleGoHome}
              className="px-6 py-3 bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-white/10 text-[#1a1a1a] dark:text-white rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-white/5 transition-colors flex items-center gap-2"
            >
              <Home className="w-4 h-4" />
              Volver al inicio
            </button>
          </div>

          <p className="text-sm text-[#6E6E73] dark:text-gray-400 mt-6">
            Si el problema persiste, por favor contacta a soporte.
          </p>
          
          <a
            href="/dashboard/support"
            className="text-sm text-[#1C8FA0] hover:underline mt-2"
          >
            Contactar Soporte
          </a>
        </div>
      </div>
    </div>
  );
};

// Error Boundary con Sentry
// Usa diferentes fallbacks dependiendo de si está dentro o fuera del Router
export const ErrorBoundary = ({ children, useRouterFallback = false }) => {
  // Si useRouterFallback es true, usar la versión con Router
  // Por defecto, usar la versión sin Router (para el ErrorBoundary externo)
  const FallbackComponent = useRouterFallback ? ErrorFallbackWithRouter : ErrorFallbackNoRouter;
  
  return (
    <SentryErrorBoundary
      fallback={FallbackComponent}
      showDialog={false} // No mostrar diálogo de Sentry, usar nuestro UI
      beforeCapture={(scope, error, errorInfo) => {
        // Agregar contexto adicional antes de capturar
        scope.setTag('error_boundary', true);
        scope.setContext('react_error_info', {
          componentStack: errorInfo.componentStack,
        });
      }}
    >
      {children}
    </SentryErrorBoundary>
  );
};

export default ErrorBoundary;
