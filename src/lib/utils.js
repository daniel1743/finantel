import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
	return twMerge(clsx(inputs));
}

/**
 * Formatea un número como moneda según la configuración del usuario
 * @param {number} amount - El monto a formatear
 * @param {string} currency - Código de moneda (USD, CLP, EUR, etc)
 * @returns {string} - Monto formateado (ej: $15.000 para CLP, $15.00 para USD)
 */
export function formatCurrency(amount, currency = 'USD') {
	if (amount === null || amount === undefined || isNaN(amount)) {
		return '$0';
	}

	const absAmount = Math.abs(amount);

	// Configuración específica por moneda
	const currencyConfig = {
		// Monedas latinoamericanas (sin decimales, punto como separador de miles)
		'CLP': { decimals: 0, locale: 'es-CL', symbol: '$' },     // Peso Chileno
		'ARS': { decimals: 0, locale: 'es-AR', symbol: '$' },     // Peso Argentino
		'COP': { decimals: 0, locale: 'es-CO', symbol: '$' },     // Peso Colombiano
		'MXN': { decimals: 2, locale: 'es-MX', symbol: '$' },     // Peso Mexicano
		'PEN': { decimals: 2, locale: 'es-PE', symbol: 'S/' },    // Sol Peruano

		// Monedas internacionales (con decimales)
		'USD': { decimals: 2, locale: 'en-US', symbol: '$' },     // Dólar
		'EUR': { decimals: 2, locale: 'de-DE', symbol: '€' },     // Euro
		'GBP': { decimals: 2, locale: 'en-GB', symbol: '£' },     // Libra
	};

	// Obtener configuración (default a USD si no existe)
	const config = currencyConfig[currency] || currencyConfig['USD'];

	// Formatear con Intl.NumberFormat
	const formatter = new Intl.NumberFormat(config.locale, {
		minimumFractionDigits: config.decimals,
		maximumFractionDigits: config.decimals,
	});

	const formattedAmount = formatter.format(absAmount);

	// Retornar con símbolo
	return `${config.symbol}${formattedAmount}`;
}