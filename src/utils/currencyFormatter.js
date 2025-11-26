// 💰 FORMATEADOR DE MONEDA SEGÚN PAÍS
// Usa la configuración de moneda del perfil del usuario

/**
 * Configuración de formatos por moneda
 * - locale: formato regional para toLocaleString
 * - decimals: cantidad de decimales a mostrar
 * - symbol: símbolo de la moneda
 */
export const CURRENCY_FORMATS = {
  // América Latina - Sin decimales, separador de miles con punto
  'CLP': { locale: 'es-CL', decimals: 0, symbol: '$', name: 'Peso Chileno' },
  'COP': { locale: 'es-CO', decimals: 0, symbol: '$', name: 'Peso Colombiano' },
  'ARS': { locale: 'es-AR', decimals: 2, symbol: '$', name: 'Peso Argentino' },

  // Norte América - Con decimales, separador de miles con coma
  'USD': { locale: 'en-US', decimals: 2, symbol: '$', name: 'Dólar Estadounidense' },
  'CAD': { locale: 'en-CA', decimals: 2, symbol: 'C$', name: 'Dólar Canadiense' },
  'MXN': { locale: 'es-MX', decimals: 2, symbol: '$', name: 'Peso Mexicano' },

  // Sudamérica
  'BRL': { locale: 'pt-BR', decimals: 2, symbol: 'R$', name: 'Real Brasileño' },
  'PEN': { locale: 'es-PE', decimals: 2, symbol: 'S/', name: 'Sol Peruano' },
  'UYU': { locale: 'es-UY', decimals: 2, symbol: '$', name: 'Peso Uruguayo' },
  'VES': { locale: 'es-VE', decimals: 2, symbol: 'Bs.', name: 'Bolívar Venezolano' },

  // Centroamérica
  'GTQ': { locale: 'es-GT', decimals: 2, symbol: 'Q', name: 'Quetzal Guatemalteco' },
  'CRC': { locale: 'es-CR', decimals: 2, symbol: '₡', name: 'Colón Costarricense' },
  'PAB': { locale: 'es-PA', decimals: 2, symbol: 'B/.', name: 'Balboa Panameño' },
  'DOP': { locale: 'es-DO', decimals: 2, symbol: '$', name: 'Peso Dominicano' },

  // Europa
  'EUR': { locale: 'de-DE', decimals: 2, symbol: '€', name: 'Euro' },
  'GBP': { locale: 'en-GB', decimals: 2, symbol: '£', name: 'Libra Esterlina' },
  'CHF': { locale: 'de-CH', decimals: 2, symbol: 'CHF', name: 'Franco Suizo' },
  'RUB': { locale: 'ru-RU', decimals: 2, symbol: '₽', name: 'Rublo Ruso' },
  'PLN': { locale: 'pl-PL', decimals: 2, symbol: 'zł', name: 'Złoty Polaco' },
  'SEK': { locale: 'sv-SE', decimals: 2, symbol: 'kr', name: 'Corona Sueca' },
  'NOK': { locale: 'nb-NO', decimals: 2, symbol: 'kr', name: 'Corona Noruega' },
  'DKK': { locale: 'da-DK', decimals: 2, symbol: 'kr', name: 'Corona Danesa' },

  // Asia
  'JPY': { locale: 'ja-JP', decimals: 0, symbol: '¥', name: 'Yen Japonés' },
  'CNY': { locale: 'zh-CN', decimals: 2, symbol: '¥', name: 'Yuan Chino' },
  'INR': { locale: 'hi-IN', decimals: 2, symbol: '₹', name: 'Rupia India' },
  'KRW': { locale: 'ko-KR', decimals: 0, symbol: '₩', name: 'Won Surcoreano' },
  'SGD': { locale: 'en-SG', decimals: 2, symbol: 'S$', name: 'Dólar de Singapur' },
  'HKD': { locale: 'zh-HK', decimals: 2, symbol: 'HK$', name: 'Dólar de Hong Kong' },
  'THB': { locale: 'th-TH', decimals: 2, symbol: '฿', name: 'Baht Tailandés' },
  'IDR': { locale: 'id-ID', decimals: 0, symbol: 'Rp', name: 'Rupia Indonesia' },
  'MYR': { locale: 'ms-MY', decimals: 2, symbol: 'RM', name: 'Ringgit Malayo' },
  'PHP': { locale: 'en-PH', decimals: 2, symbol: '₱', name: 'Peso Filipino' },

  // África
  'ZAR': { locale: 'en-ZA', decimals: 2, symbol: 'R', name: 'Rand Sudafricano' },
  'EGP': { locale: 'ar-EG', decimals: 2, symbol: 'E£', name: 'Libra Egipcia' },
  'NGN': { locale: 'en-NG', decimals: 2, symbol: '₦', name: 'Naira Nigeriana' },
  'KES': { locale: 'en-KE', decimals: 2, symbol: 'KSh', name: 'Chelín Keniano' },
  'MAD': { locale: 'ar-MA', decimals: 2, symbol: 'DH', name: 'Dirham Marroquí' },
};

/**
 * Formatea un número como moneda según el código de moneda
 *
 * @param {number} amount - Monto a formatear
 * @param {string} currencyCode - Código ISO de moneda (ej: 'CLP', 'USD')
 * @param {object} options - Opciones adicionales
 * @returns {string} Monto formateado (ej: "$30.000" para CLP, "$30,000.00" para USD)
 *
 * @example
 * formatCurrency(30000, 'CLP') // → "$30.000"
 * formatCurrency(30000, 'USD') // → "$30,000.00"
 * formatCurrency(1500.50, 'EUR') // → "1.500,50 €"
 */
export function formatCurrency(amount, currencyCode = 'USD', options = {}) {
  const config = CURRENCY_FORMATS[currencyCode] || CURRENCY_FORMATS['USD'];

  const {
    showSymbol = true,
    symbolPosition = 'before', // 'before' o 'after'
    forceDecimals = null, // null = usar config, 0 = sin decimales, 2 = con decimales
  } = options;

  // Determinar cantidad de decimales
  const decimals = forceDecimals !== null ? forceDecimals : config.decimals;

  // Formatear número según locale
  const formattedNumber = amount.toLocaleString(config.locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  // Agregar símbolo si corresponde
  if (!showSymbol) {
    return formattedNumber;
  }

  if (symbolPosition === 'after') {
    return `${formattedNumber} ${config.symbol}`;
  }

  return `${config.symbol}${formattedNumber}`;
}

/**
 * Formatea moneda con signo + o - para ingresos/gastos
 *
 * @param {number} amount - Monto
 * @param {string} type - 'income' o 'expense'
 * @param {string} currencyCode - Código de moneda
 * @returns {string} Monto formateado con signo
 *
 * @example
 * formatTransactionAmount(30000, 'income', 'CLP') // → "+$30.000"
 * formatTransactionAmount(30000, 'expense', 'CLP') // → "-$30.000"
 */
export function formatTransactionAmount(amount, type, currencyCode = 'USD') {
  const formatted = formatCurrency(Math.abs(amount), currencyCode);
  const sign = type === 'income' ? '+' : '-';
  return `${sign}${formatted}`;
}

/**
 * Obtiene el símbolo de una moneda
 *
 * @param {string} currencyCode - Código de moneda
 * @returns {string} Símbolo de la moneda
 *
 * @example
 * getCurrencySymbol('CLP') // → "$"
 * getCurrencySymbol('EUR') // → "€"
 */
export function getCurrencySymbol(currencyCode) {
  const config = CURRENCY_FORMATS[currencyCode] || CURRENCY_FORMATS['USD'];
  return config.symbol;
}

/**
 * Obtiene el nombre completo de una moneda
 *
 * @param {string} currencyCode - Código de moneda
 * @returns {string} Nombre de la moneda
 *
 * @example
 * getCurrencyName('CLP') // → "Peso Chileno"
 */
export function getCurrencyName(currencyCode) {
  const config = CURRENCY_FORMATS[currencyCode] || CURRENCY_FORMATS['USD'];
  return config.name;
}

/**
 * Hook React para formatear moneda con la moneda del usuario
 * Usa el hook useUserCurrency internamente
 */
export function useFormatCurrency() {
  // Este hook se puede usar en componentes React
  // Por ahora retornamos una función que acepta el currencyCode
  return {
    formatCurrency,
    formatTransactionAmount,
    getCurrencySymbol,
    getCurrencyName,
  };
}

/**
 * Formatea un monto compacto (ej: 1.2k, 45.8k, 1.2M)
 * Útil para gráficos y vistas resumidas
 *
 * @param {number} amount - Monto a formatear
 * @param {string} currencyCode - Código de moneda
 * @returns {string} Monto formateado compacto
 *
 * @example
 * formatCompactCurrency(1500, 'CLP') // → "$1.5k"
 * formatCompactCurrency(45000, 'USD') // → "$45k"
 * formatCompactCurrency(1200000, 'CLP') // → "$1.2M"
 */
export function formatCompactCurrency(amount, currencyCode = 'USD') {
  const config = CURRENCY_FORMATS[currencyCode] || CURRENCY_FORMATS['USD'];
  const symbol = config.symbol;

  if (amount >= 1000000) {
    return `${symbol}${(amount / 1000000).toFixed(1)}M`;
  }
  if (amount >= 1000) {
    return `${symbol}${(amount / 1000).toFixed(1)}k`;
  }
  return formatCurrency(amount, currencyCode);
}

// Export default para importación simple
export default {
  formatCurrency,
  formatTransactionAmount,
  getCurrencySymbol,
  getCurrencyName,
  formatCompactCurrency,
  CURRENCY_FORMATS,
};
