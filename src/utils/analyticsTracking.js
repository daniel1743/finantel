/**
 * Utilidades para tracking de eventos y analytics
 */

import { supabase } from '@/lib/customSupabaseClient';

/**
 * Generar ID de sesión único
 */
export const getSessionId = () => {
  let sessionId = sessionStorage.getItem('analytics_session_id');
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('analytics_session_id', sessionId);
  }
  return sessionId;
};

/**
 * Obtener información del dispositivo/navegador
 */
export const getDeviceInfo = () => {
  const ua = navigator.userAgent;
  let deviceType = 'desktop';
  let browser = 'unknown';
  let os = 'unknown';

  // Detectar dispositivo
  if (/mobile|android|iphone|ipad/i.test(ua)) {
    deviceType = 'mobile';
  } else if (/tablet|ipad/i.test(ua)) {
    deviceType = 'tablet';
  }

  // Detectar navegador
  if (ua.includes('Chrome')) browser = 'chrome';
  else if (ua.includes('Firefox')) browser = 'firefox';
  else if (ua.includes('Safari') && !ua.includes('Chrome')) browser = 'safari';
  else if (ua.includes('Edge')) browser = 'edge';

  // Detectar OS
  if (ua.includes('Windows')) os = 'windows';
  else if (ua.includes('Mac')) os = 'macos';
  else if (ua.includes('Linux')) os = 'linux';
  else if (ua.includes('Android')) os = 'android';
  else if (ua.includes('iOS')) os = 'ios';

  return { deviceType, browser, os, userAgent: ua };
};

/**
 * Trackear vista de página
 */
export const trackPageView = async (pagePath, pageTitle = null, user = null) => {
  try {
    const sessionId = getSessionId();
    const deviceInfo = getDeviceInfo();

    // Obtener IP (aproximada desde headers si está disponible)
    let ipAddress = null;
    // En producción, esto se obtendría del servidor

    await supabase.from('page_views').insert({
      user_id: user?.id || null,
      page_path: pagePath,
      page_title: pageTitle || document.title,
      referrer: document.referrer || null,
      user_agent: deviceInfo.userAgent,
      session_id: sessionId,
    });

    // Actualizar o crear sesión
    await updateUserSession(sessionId, user, deviceInfo);
  } catch (error) {
    console.error('Error tracking page view:', error);
  }
};

/**
 * Actualizar o crear sesión de usuario
 */
export const updateUserSession = async (sessionId, user, deviceInfo) => {
  try {
    // Verificar si la sesión existe
    const { data: existingSession } = await supabase
      .from('user_sessions')
      .select('id')
      .eq('session_id', sessionId)
      .maybeSingle();

    if (existingSession) {
      // Actualizar sesión existente
      await supabase
        .from('user_sessions')
        .update({
          page_views_count: supabase.raw('page_views_count + 1'),
          is_active: true,
        })
        .eq('session_id', sessionId);
    } else {
      // Crear nueva sesión
      await supabase.from('user_sessions').insert({
        user_id: user?.id || null,
        session_id: sessionId,
        device_type: deviceInfo.deviceType,
        browser: deviceInfo.browser,
        os: deviceInfo.os,
        is_active: true,
      });
    }
  } catch (error) {
    console.error('Error updating user session:', error);
  }
};

/**
 * Finalizar sesión
 */
export const endUserSession = async (sessionId) => {
  try {
    const { data: session } = await supabase
      .from('user_sessions')
      .select('started_at')
      .eq('session_id', sessionId)
      .eq('is_active', true)
      .maybeSingle();

    if (session) {
      const duration = Math.floor((Date.now() - new Date(session.started_at).getTime()) / 1000);

      await supabase
        .from('user_sessions')
        .update({
          ended_at: new Date().toISOString(),
          duration,
          is_active: false,
        })
        .eq('session_id', sessionId);
    }
  } catch (error) {
    console.error('Error ending user session:', error);
  }
};

/**
 * Trackear evento de usuario
 */
export const trackEvent = async (eventType, eventName, eventData = {}, user = null) => {
  try {
    const sessionId = getSessionId();

    await supabase.from('user_events').insert({
      user_id: user?.id || null,
      event_type: eventType,
      event_name: eventName,
      event_data: eventData,
      page_path: window.location.pathname,
      session_id: sessionId,
    });

    // Si es un evento de herramienta usada, actualizar tool_usage
    if (eventType === 'tool_used') {
      // El trigger en la BD lo manejará automáticamente
    }
  } catch (error) {
    console.error('Error tracking event:', error);
  }
};

/**
 * Trackear uso de herramienta
 */
export const trackToolUsage = async (toolName, user = null) => {
  await trackEvent('tool_used', toolName, { tool: toolName }, user);
};

/**
 * Trackear sección del landing vista
 */
export const trackLandingSection = async (section, timeSpent = null, user = null) => {
  try {
    const sessionId = getSessionId();

    await supabase.from('landing_analytics').insert({
      session_id: sessionId,
      user_id: user?.id || null,
      section_viewed: section,
      time_spent: timeSpent,
    });
  } catch (error) {
    console.error('Error tracking landing section:', error);
  }
};

/**
 * Trackear impresión (buscador/navegador)
 */
export const trackImpression = async (source, sourceDetail = null, pagePath = null, user = null) => {
  try {
    const sessionId = getSessionId();

    await supabase.from('impressions').insert({
      source,
      source_detail: sourceDetail,
      page_path: pagePath || window.location.pathname,
      user_id: user?.id || null,
      session_id: sessionId,
      referrer: document.referrer || null,
    });
  } catch (error) {
    console.error('Error tracking impression:', error);
  }
};

/**
 * Trackear evento de auditoría
 */
export const trackAuditLog = async (eventType, action, resourceType = null, resourceId = null, result = 'success', errorMessage = null, metadata = {}) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    await supabase.from('audit_logs').insert({
      user_id: user?.id || null,
      event_type: eventType,
      action,
      resource_type: resourceType,
      resource_id: resourceId,
      result,
      error_message: errorMessage,
      metadata,
      user_agent: navigator.userAgent,
    });
  } catch (error) {
    console.error('Error tracking audit log:', error);
  }
};

/**
 * Inicializar tracking en el landing page
 */
export const initLandingTracking = () => {
  // Detectar secciones del landing al hacer scroll
  const sections = ['hero', 'features', 'pricing', 'testimonials', 'footer'];
  const sectionElements = sections.map(section => ({
    name: section,
    element: document.getElementById(section) || document.querySelector(`[data-section="${section}"]`)
  })).filter(s => s.element);

  let currentSection = null;
  let sectionStartTime = Date.now();

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
        const sectionName = entry.target.id || entry.target.dataset.section;
        
        if (currentSection && currentSection !== sectionName) {
          // Finalizar tracking de sección anterior
          const timeSpent = Math.floor((Date.now() - sectionStartTime) / 1000);
          trackLandingSection(currentSection, timeSpent);
        }

        // Iniciar tracking de nueva sección
        currentSection = sectionName;
        sectionStartTime = Date.now();
        trackLandingSection(sectionName, null);
      }
    });
  }, {
    threshold: 0.5
  });

  sectionElements.forEach(({ element }) => {
    if (element) observer.observe(element);
  });

  // Trackear impresión cuando se carga la página
  const referrer = document.referrer;
  let source = 'direct';
  let sourceDetail = null;

  if (referrer) {
    try {
      const url = new URL(referrer);
      if (url.hostname.includes('google') || url.hostname.includes('bing') || url.hostname.includes('yahoo')) {
        source = 'search_engine';
        sourceDetail = url.hostname.split('.')[1] || 'unknown';
      } else {
        source = 'referral';
        sourceDetail = url.hostname;
      }
    } catch (e) {
      source = 'referral';
    }
  }

  trackImpression(source, sourceDetail, window.location.pathname);

  // Trackear cuando el usuario sale
  window.addEventListener('beforeunload', () => {
    if (currentSection) {
      const timeSpent = Math.floor((Date.now() - sectionStartTime) / 1000);
      trackLandingSection(currentSection, timeSpent);
    }
    endUserSession(getSessionId());
  });
};


