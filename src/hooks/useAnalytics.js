import { useCallback, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';

// Generar session ID único
const getSessionId = () => {
  let sessionId = sessionStorage.getItem('analytics_session_id');
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('analytics_session_id', sessionId);
  }
  return sessionId;
};

// Detectar si es bot
const isBot = (userAgent) => {
  const botPatterns = /bot|crawler|spider|crawling/i;
  return botPatterns.test(userAgent || '');
};

// Detectar motor de búsqueda
const getSearchEngine = (referrer) => {
  if (!referrer) return 'direct';
  const url = new URL(referrer);
  const hostname = url.hostname.toLowerCase();
  
  if (hostname.includes('google')) return 'google';
  if (hostname.includes('bing')) return 'bing';
  if (hostname.includes('yahoo')) return 'yahoo';
  if (hostname.includes('duckduckgo')) return 'duckduckgo';
  return 'other';
};

export const useAnalytics = () => {
  const { user } = useAuth();
  const location = useLocation();
  const sessionIdRef = useRef(getSessionId());
  const pageStartTimeRef = useRef(Date.now());
  const scrollDepthRef = useRef(0);

  // Track evento genérico
  const trackEvent = useCallback(async (eventType, eventName, metadata = {}) => {
    try {
      const userAgent = navigator.userAgent;
      const referrer = document.referrer || null;
      
      // No trackear si es bot
      if (isBot(userAgent)) return;

      await supabase.from('analytics_events').insert({
        user_id: user?.id || null,
        event_type: eventType,
        event_name: eventName,
        page_path: location.pathname,
        metadata: metadata,
        user_agent: userAgent,
        referrer: referrer,
        session_id: sessionIdRef.current,
      });
    } catch (error) {
      console.error('Error tracking event:', error);
    }
  }, [user, location.pathname]);

  // Track page view
  const trackPageView = useCallback(async (pagePath, pageTitle) => {
    try {
      const userAgent = navigator.userAgent;
      const referrer = document.referrer || null;
      
      if (isBot(userAgent)) return;

      // Calcular tiempo en página anterior
      const timeOnPage = Math.floor((Date.now() - pageStartTimeRef.current) / 1000);
      
      await supabase.from('analytics_page_views').insert({
        user_id: user?.id || null,
        page_path: pagePath || location.pathname,
        page_title: pageTitle || document.title,
        referrer: referrer,
        user_agent: userAgent,
        session_id: sessionIdRef.current,
        time_on_page: timeOnPage > 0 ? timeOnPage : null,
        scroll_depth: scrollDepthRef.current,
      });

      // Reset para nueva página
      pageStartTimeRef.current = Date.now();
      scrollDepthRef.current = 0;
    } catch (error) {
      console.error('Error tracking page view:', error);
    }
  }, [user, location.pathname]);

  // Track uso de herramienta
  const trackToolUsage = useCallback(async (toolName, actionType = 'view', metadata = {}) => {
    try {
      await supabase.from('analytics_tool_usage').insert({
        user_id: user?.id,
        tool_name: toolName,
        action_type: actionType,
        metadata: metadata,
        session_id: sessionIdRef.current,
      });
    } catch (error) {
      console.error('Error tracking tool usage:', error);
    }
  }, [user]);

  // Track impresión (SEO)
  const trackImpression = useCallback(async (pagePath, pageTitle) => {
    try {
      const userAgent = navigator.userAgent;
      const referrer = document.referrer || null;
      
      const searchEngine = getSearchEngine(referrer);
      const isBotUser = isBot(userAgent);

      await supabase.from('analytics_impressions').insert({
        page_path: pagePath || location.pathname,
        page_title: pageTitle || document.title,
        referrer: referrer,
        user_agent: userAgent,
        search_engine: searchEngine,
        is_bot: isBotUser,
      });
    } catch (error) {
      console.error('Error tracking impression:', error);
    }
  }, [location.pathname]);

  // Track sección del landing
  const trackLandingSection = useCallback(async (sectionName) => {
    await trackEvent('landing_section_view', sectionName, {
      section: sectionName,
    });
  }, [trackEvent]);

  // Track scroll depth
  useEffect(() => {
    const handleScroll = () => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollTop = window.scrollY;
      const scrollPercent = Math.round((scrollTop / (documentHeight - windowHeight)) * 100);
      
      if (scrollPercent > scrollDepthRef.current) {
        scrollDepthRef.current = scrollPercent;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Track page view cuando cambia la ruta
  useEffect(() => {
    trackPageView(location.pathname, document.title);
  }, [location.pathname, trackPageView]);

  // Track impresión al cargar
  useEffect(() => {
    if (location.pathname === '/') {
      trackImpression('/', document.title);
    }
  }, [location.pathname, trackImpression]);

  return {
    trackEvent,
    trackPageView,
    trackToolUsage,
    trackImpression,
    trackLandingSection,
  };
};
