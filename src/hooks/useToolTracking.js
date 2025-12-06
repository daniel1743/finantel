import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAnalytics } from './useAnalytics';

// Mapeo de rutas a nombres de herramientas
const routeToToolMap = {
  '/dashboard/transactions': 'transactions',
  '/dashboard/goals': 'goals',
  '/dashboard/categories': 'categories',
  '/dashboard/ai-assistant': 'ai-assistant',
  '/dashboard/predictions': 'predictions',
  '/dashboard/analysis': 'analysis',
  '/dashboard/deep-finance': 'deep-finance',
  '/dashboard/future-self': 'future-self',
  '/dashboard/family': 'family',
  '/dashboard/export': 'export',
  '/dashboard/budgets': 'budgets',
  '/dashboard/alerts': 'alerts',
};

/**
 * Hook para trackear automáticamente el uso de herramientas
 * Se ejecuta cuando el componente se monta
 */
export const useToolTracking = (toolName = null, actionType = 'view') => {
  const location = useLocation();
  const { trackToolUsage } = useAnalytics();

  useEffect(() => {
    // Si se proporciona toolName, usarlo directamente
    // Si no, intentar mapear desde la ruta
    const tool = toolName || routeToToolMap[location.pathname];

    if (tool) {
      trackToolUsage(tool, actionType, {
        page_path: location.pathname,
        timestamp: new Date().toISOString(),
      });
    }
  }, [location.pathname, toolName, actionType, trackToolUsage]);
};

