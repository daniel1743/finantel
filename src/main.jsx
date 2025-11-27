// =====================================================
// MAIN ENTRY POINT - CON SENTRY INTEGRADO
// =====================================================

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Inicializar Sentry ANTES de renderizar la app
import { initSentry } from './lib/sentry';
initSentry();

// Inicializar Analytics
import { initAnalytics } from './lib/analytics';
initAnalytics();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
