// =====================================================
// HOOK DE ANALYTICS
// =====================================================
// Hook para facilitar el uso de analytics en componentes
// =====================================================

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  trackEvent, 
  trackPageView, 
  identifyUser,
  AnalyticsEvents 
} from '@/lib/analytics';
import { useAuth } from '@/contexts/SupabaseAuthContext';

/**
 * Hook para trackear eventos y páginas automáticamente
 */
export const useAnalytics = () => {
  const location = useLocation();
  const { user } = useAuth();

  // Trackear cambio de página automáticamente
  useEffect(() => {
    const pageName = location.pathname;
    trackPageView(pageName, {
      path: location.pathname,
      search: location.search,
    });
  }, [location]);

  // Identificar usuario cuando cambia
  useEffect(() => {
    if (user) {
      identifyUser(user.id, {
        email: user.email,
        name: user.user_metadata?.full_name || user.email?.split('@')[0],
      });
    }
  }, [user]);

  return {
    trackEvent,
    trackPageView,
    AnalyticsEvents,
  };
};

/**
 * Hook para trackear eventos específicos de transacciones
 */
export const useTransactionAnalytics = () => {
  const { trackEvent, AnalyticsEvents } = useAnalytics();

  const trackTransactionCreated = (data) => {
    trackEvent(AnalyticsEvents.TRANSACTION_CREATED, {
      amount: data.amount,
      type: data.type,
      category: data.category,
      method: data.method || 'manual',
      ...data,
    });
  };

  const trackTransactionCreatedVoice = (data) => {
    trackEvent(AnalyticsEvents.TRANSACTION_CREATED_VOICE, {
      amount: data.amount,
      type: data.type,
      category: data.category,
      ...data,
    });
  };

  return {
    trackTransactionCreated,
    trackTransactionCreatedVoice,
  };
};

/**
 * Hook para trackear eventos de presupuestos
 */
export const useBudgetAnalytics = () => {
  const { trackEvent, AnalyticsEvents } = useAnalytics();

  const trackBudgetCreated = (data) => {
    trackEvent(AnalyticsEvents.BUDGET_CREATED, {
      amount: data.amount,
      period: data.period,
      category: data.category,
      ...data,
    });
  };

  const trackBudgetExceeded = (data) => {
    trackEvent(AnalyticsEvents.BUDGET_EXCEEDED, {
      budget_id: data.budget_id,
      percentage: data.percentage,
      amount: data.amount,
      ...data,
    });
  };

  return {
    trackBudgetCreated,
    trackBudgetExceeded,
  };
};

/**
 * Hook para trackear eventos de IA
 */
export const useAIAnalytics = () => {
  const { trackEvent, AnalyticsEvents } = useAnalytics();

  const trackAIMessageSent = (data) => {
    trackEvent(AnalyticsEvents.AI_MESSAGE_SENT, {
      message_length: data.message?.length || 0,
      mode: data.mode || 'finance',
      ...data,
    });
  };

  const trackAIResponseReceived = (data) => {
    trackEvent(AnalyticsEvents.AI_RESPONSE_RECEIVED, {
      response_length: data.response?.length || 0,
      response_time: data.responseTime,
      ...data,
    });
  };

  return {
    trackAIMessageSent,
    trackAIResponseReceived,
  };
};

/**
 * Hook para trackear eventos de pagos
 */
export const usePaymentAnalytics = () => {
  const { trackEvent, trackConversion, AnalyticsEvents } = useAnalytics();

  const trackSubscriptionStarted = (data) => {
    trackEvent(AnalyticsEvents.SUBSCRIPTION_STARTED, {
      plan: data.plan,
      amount: data.amount,
      currency: data.currency,
      ...data,
    });

    trackConversion('subscription', data.amount, data.currency, {
      plan: data.plan,
      provider: data.provider,
    });
  };

  const trackPaymentCompleted = (data) => {
    trackEvent(AnalyticsEvents.PAYMENT_COMPLETED, {
      amount: data.amount,
      currency: data.currency,
      method: data.method,
      ...data,
    });

    trackConversion('payment', data.amount, data.currency, {
      method: data.method,
    });
  };

  const trackPaymentFailed = (data) => {
    trackEvent(AnalyticsEvents.PAYMENT_FAILED, {
      amount: data.amount,
      currency: data.currency,
      error: data.error,
      ...data,
    });
  };

  return {
    trackSubscriptionStarted,
    trackPaymentCompleted,
    trackPaymentFailed,
  };
};

