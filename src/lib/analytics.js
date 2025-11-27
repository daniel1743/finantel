// =====================================================
// ANALYTICS - MIXPANEL Y GOOGLE ANALYTICS 4
// =====================================================
// Sistema de analytics unificado
// =====================================================

// =====================================================
// 1. MIXPANEL
// =====================================================

let mixpanel = null;

const initMixpanel = () => {
  const token = import.meta.env.VITE_MIXPANEL_TOKEN;
  
  if (!token) {
    console.log('Mixpanel no configurado (token faltante)');
    return;
  }

  // Cargar Mixpanel dinámicamente
  import('mixpanel-browser')
    .then((Mixpanel) => {
      if (Mixpanel && Mixpanel.default) {
        Mixpanel.default.init(token, {
          debug: import.meta.env.MODE === 'development',
          track_pageview: true,
          persistence: 'localStorage',
        });
        
        mixpanel = Mixpanel.default;
        
        // Configurar propiedades por defecto
        mixpanel.register({
          app: 'finantel',
          version: import.meta.env.VITE_APP_VERSION || '2.1',
          environment: import.meta.env.MODE || 'development',
        });
        
        console.log('Mixpanel inicializado');
      }
    })
    .catch((error) => {
      // No mostrar error si la dependencia no está instalada
      if (error.message && error.message.includes('Failed to resolve module')) {
        console.log('Mixpanel no disponible (dependencia no instalada)');
      } else {
        console.error('Error cargando Mixpanel:', error);
      }
    });
};

// =====================================================
// 2. GOOGLE ANALYTICS 4
// =====================================================

let gtag = null;

const initGA4 = () => {
  const measurementId = import.meta.env.VITE_GA4_MEASUREMENT_ID;
  
  if (!measurementId) {
    console.log('GA4 no configurado (measurement ID faltante)');
    return;
  }

  // Cargar gtag dinámicamente
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  function gtag() {
    window.dataLayer.push(arguments);
  }
  window.gtag = gtag;
  gtag('js', new Date());
  gtag('config', measurementId, {
    page_path: window.location.pathname,
    app_name: 'finantel',
    app_version: import.meta.env.VITE_APP_VERSION || '2.1',
  });

  console.log('GA4 inicializado');
};

// =====================================================
// 3. FUNCIONES UNIFICADAS
// =====================================================

/**
 * Inicializar todos los servicios de analytics
 */
export const initAnalytics = () => {
  initMixpanel();
  initGA4();
};

/**
 * Identificar usuario
 */
export const identifyUser = (userId, userProperties = {}) => {
  // Mixpanel
  if (mixpanel) {
    mixpanel.identify(userId);
    mixpanel.people.set({
      ...userProperties,
      $name: userProperties.name || userProperties.email,
      $email: userProperties.email,
      $created: new Date().toISOString(),
    });
  }

  // GA4
  if (window.gtag) {
    window.gtag('set', 'user_id', userId);
    window.gtag('config', import.meta.env.VITE_GA4_MEASUREMENT_ID, {
      user_id: userId,
    });
  }
};

/**
 * Track evento
 */
export const trackEvent = (eventName, properties = {}) => {
  // Mixpanel
  if (mixpanel) {
    mixpanel.track(eventName, {
      ...properties,
      timestamp: new Date().toISOString(),
    });
  }

  // GA4
  if (window.gtag) {
    window.gtag('event', eventName, {
      ...properties,
      event_category: properties.category || 'general',
      event_label: properties.label || eventName,
    });
  }
};

/**
 * Track página vista
 */
export const trackPageView = (pageName, properties = {}) => {
  // Mixpanel
  if (mixpanel) {
    mixpanel.track('Page Viewed', {
      page_name: pageName,
      page_path: window.location.pathname,
      ...properties,
    });
  }

  // GA4
  if (window.gtag) {
    window.gtag('config', import.meta.env.VITE_GA4_MEASUREMENT_ID, {
      page_path: window.location.pathname,
      page_title: pageName,
    });
  }
};

/**
 * Track conversión (pago, suscripción, etc.)
 */
export const trackConversion = (conversionType, value = 0, currency = 'CLP', properties = {}) => {
  // Mixpanel
  if (mixpanel) {
    mixpanel.track('Conversion', {
      conversion_type: conversionType,
      value,
      currency,
      ...properties,
    });
    
    // Incrementar revenue en perfil de usuario
    if (value > 0) {
      mixpanel.people.increment('total_revenue', value);
    }
  }

  // GA4 - Evento de conversión
  if (window.gtag) {
    window.gtag('event', 'conversion', {
      conversion_type: conversionType,
      value,
      currency,
      ...properties,
    });
    
    // Ecommerce tracking si aplica
    if (conversionType === 'subscription' || conversionType === 'payment') {
      window.gtag('event', 'purchase', {
        transaction_id: properties.transaction_id || Date.now().toString(),
        value,
        currency,
        items: properties.items || [],
      });
    }
  }
};

/**
 * Track error
 */
export const trackError = (error, context = {}) => {
  // Mixpanel
  if (mixpanel) {
    mixpanel.track('Error Occurred', {
      error_message: error.message,
      error_stack: error.stack,
      error_name: error.name,
      ...context,
    });
  }

  // GA4
  if (window.gtag) {
    window.gtag('event', 'exception', {
      description: error.message,
      fatal: context.critical || false,
      ...context,
    });
  }
};

/**
 * Track performance
 */
export const trackPerformance = (metricName, value, unit = 'ms', properties = {}) => {
  // Mixpanel
  if (mixpanel) {
    mixpanel.track('Performance Metric', {
      metric_name: metricName,
      value,
      unit,
      ...properties,
    });
  }

  // GA4 - Web Vitals
  if (window.gtag) {
    window.gtag('event', 'web_vitals', {
      metric_name: metricName,
      value: Math.round(value),
      ...properties,
    });
  }
};

/**
 * Reset usuario (logout)
 */
export const resetUser = () => {
  // Mixpanel
  if (mixpanel) {
    mixpanel.reset();
  }

  // GA4
  if (window.gtag) {
    window.gtag('config', import.meta.env.VITE_GA4_MEASUREMENT_ID, {
      user_id: null,
    });
  }
};

// =====================================================
// 4. EVENTOS PREDEFINIDOS PARA FINANTEL
// =====================================================

export const AnalyticsEvents = {
  // Autenticación
  USER_SIGNED_UP: 'user_signed_up',
  USER_LOGGED_IN: 'user_logged_in',
  USER_LOGGED_OUT: 'user_logged_out',
  
  // Transacciones
  TRANSACTION_CREATED: 'transaction_created',
  TRANSACTION_UPDATED: 'transaction_updated',
  TRANSACTION_DELETED: 'transaction_deleted',
  TRANSACTION_CREATED_VOICE: 'transaction_created_voice',
  
  // Presupuestos
  BUDGET_CREATED: 'budget_created',
  BUDGET_UPDATED: 'budget_updated',
  BUDGET_EXCEEDED: 'budget_exceeded',
  
  // Metas
  GOAL_CREATED: 'goal_created',
  GOAL_COMPLETED: 'goal_completed',
  
  // IA
  AI_MESSAGE_SENT: 'ai_message_sent',
  AI_RESPONSE_RECEIVED: 'ai_response_received',
  
  // Pagos
  SUBSCRIPTION_STARTED: 'subscription_started',
  SUBSCRIPTION_CANCELLED: 'subscription_cancelled',
  PAYMENT_COMPLETED: 'payment_completed',
  PAYMENT_FAILED: 'payment_failed',
  
  // Exportación
  DATA_EXPORTED: 'data_exported',
  
  // Errores
  ERROR_OCCURRED: 'error_occurred',
  CRITICAL_ERROR: 'critical_error',
};

// =====================================================
// FIN DE ANALYTICS
// =====================================================

