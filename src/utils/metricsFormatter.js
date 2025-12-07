/**
 * Utilidades para formatear métricas y números
 */

/**
 * Formatear número con separadores de miles
 */
export const formatNumber = (num, decimals = 0) => {
  if (num === null || num === undefined) return '0';
  return new Intl.NumberFormat('es-ES', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num);
};

/**
 * Formatear porcentaje
 */
export const formatPercentage = (value, decimals = 1) => {
  if (value === null || value === undefined) return '0%';
  return `${parseFloat(value).toFixed(decimals)}%`;
};

/**
 * Formatear moneda
 */
export const formatCurrency = (amount, currency = 'USD', decimals = 2) => {
  if (amount === null || amount === undefined) return '$0.00';
  
  // Para números muy grandes, usar formato compacto
  if (amount >= 1000000) {
    return `$${(amount / 1000000).toFixed(1)}M`;
  }
  if (amount >= 1000) {
    return `$${(amount / 1000).toFixed(1)}k`;
  }
  
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency,
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(amount);
};

/**
 * Formatear duración (segundos a minutos/horas)
 */
export const formatDuration = (seconds) => {
  if (!seconds || seconds === 0) return '0s';
  
  if (seconds < 60) {
    return `${Math.floor(seconds)}s`;
  } else if (seconds < 3600) {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return secs > 0 ? `${minutes}m ${secs}s` : `${minutes}m`;
  } else {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
  }
};

/**
 * Formatear tiempo relativo
 */
export const formatRelativeTime = (date) => {
  if (!date) return 'Nunca';
  
  const now = new Date();
  const then = new Date(date);
  const diffMs = now - then;
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return 'Hace unos segundos';
  if (diffMins < 60) return `Hace ${diffMins} minuto${diffMins > 1 ? 's' : ''}`;
  if (diffHours < 24) return `Hace ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
  if (diffDays < 7) return `Hace ${diffDays} día${diffDays > 1 ? 's' : ''}`;
  
  return then.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
};

/**
 * Calcular cambio porcentual
 */
export const calculateChange = (current, previous) => {
  if (!previous || previous === 0) return null;
  const change = ((current - previous) / previous) * 100;
  return {
    value: Math.abs(change).toFixed(1),
    isPositive: change >= 0,
    isNegative: change < 0,
  };
};

/**
 * Formatear cambio con flecha
 */
export const formatChange = (current, previous, showSign = true) => {
  const change = calculateChange(current, previous);
  if (!change) return null;
  
  const sign = change.isPositive ? '↑' : '↓';
  const color = change.isPositive ? 'text-green-600' : 'text-red-600';
  
  return {
    text: showSign ? `${sign} ${change.value}%` : `${change.value}%`,
    color,
    isPositive: change.isPositive,
  };
};

/**
 * Formatear tamaño de archivo
 */
export const formatFileSize = (bytes) => {
  if (!bytes || bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

/**
 * Formatear fecha completa
 */
export const formatDate = (date, includeTime = false) => {
  if (!date) return 'N/A';
  
  const d = new Date(date);
  const options = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };
  
  if (includeTime) {
    options.hour = '2-digit';
    options.minute = '2-digit';
  }
  
  return d.toLocaleDateString('es-ES', options);
};

/**
 * Obtener color según valor (verde/amarillo/rojo)
 */
export const getValueColor = (value, thresholds = { good: 70, warning: 50 }) => {
  if (value >= thresholds.good) return 'text-green-600';
  if (value >= thresholds.warning) return 'text-yellow-600';
  return 'text-red-600';
};

/**
 * Obtener color de fondo según valor
 */
export const getValueBgColor = (value, thresholds = { good: 70, warning: 50 }) => {
  if (value >= thresholds.good) return 'bg-green-50 dark:bg-green-900/20';
  if (value >= thresholds.warning) return 'bg-yellow-50 dark:bg-yellow-900/20';
  return 'bg-red-50 dark:bg-red-900/20';
};


