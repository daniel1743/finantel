// =====================================================
// MAIN ENTRY POINT - CON SENTRY INTEGRADO
// =====================================================

// Importar Sentry LO MÁS TEMPRANO POSIBLE (antes de todo)
import "@/lib/sentry";

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Inicializar Analytics
import { initAnalytics } from './lib/analytics';
initAnalytics();

// =====================================================
// SERVICE WORKER - Registro Condicional
// =====================================================
// ✅ Solo se registra en PRODUCCIÓN (NO en localhost)
// =====================================================

// Helper para detectar localhost
const isLocalhost = 
  window.location.hostname === 'localhost' ||
  window.location.hostname === '127.0.0.1' ||
  window.location.hostname.includes('localhost');

// En desarrollo: desregistrar cualquier SW viejo que pueda estar causando problemas
// ⚠️ CRÍTICO: Esto debe ejecutarse INMEDIATAMENTE, antes de que React renderice
if (import.meta.env.DEV && isLocalhost) {
  // Ejecutar sincrónicamente para desregistrar SWs viejos inmediatamente
  (async () => {
    try {
      const { unregisterServiceWorkersInDev, clearServiceWorkerCachesInDev } = await import('./utils/serviceWorkerHelper');
      // Desregistrar SWs viejos en desarrollo (CRÍTICO: debe ser primero)
      await unregisterServiceWorkersInDev();
      // Limpiar cachés viejos en desarrollo
      await clearServiceWorkerCachesInDev();
      console.log('[Main] Service Workers viejos desregistrados en localhost');
    } catch (error) {
      console.error('[Main] Error desregistrando Service Workers:', error);
    }
  })();
}

// Registrar Service Worker SOLO en producción (NO en localhost)
if ('serviceWorker' in navigator && !isLocalhost) {
  // Usar appUpdateService para manejar actualizaciones
  import('./lib/appUpdateService').then(({ default: appUpdateService }) => {
    appUpdateService.register().catch((error) => {
      console.error('[Main] Error registrando Service Worker:', error);
    });
  });
} else if (isLocalhost) {
  console.log('[ServiceWorker] No se registra en localhost (modo desarrollo).');
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
