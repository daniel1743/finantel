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

// Inicializar Service Worker para actualizaciones
import appUpdateService from './lib/appUpdateService';
if ('serviceWorker' in navigator) {
  appUpdateService.register().catch((error) => {
    console.error('[Main] Error registrando Service Worker:', error);
  });
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
