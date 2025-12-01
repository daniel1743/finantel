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

/**
 * Obtiene la fecha local en formato YYYY-MM-DD sin problemas de zona horaria
 * @param {Date} date - Fecha opcional (por defecto fecha actual)
 * @returns {string} - Fecha en formato YYYY-MM-DD
 */
export function getLocalDateString(date = new Date()) {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, '0');
	const day = String(date.getDate()).padStart(2, '0');
	return `${year}-${month}-${day}`;
}

/**
 * Parsea una fecha desde la base de datos (string YYYY-MM-DD) a un objeto Date local
 * sin problemas de zona horaria. Evita que fechas como '2025-12-01' se interpreten
 * como UTC y retrocedan un día.
 * @param {string} dateString - Fecha en formato YYYY-MM-DD
 * @returns {Date} - Objeto Date en hora local
 */
export function parseLocalDate(dateString) {
	if (!dateString) return null;
	
	// Si ya es un objeto Date, devolverlo
	if (dateString instanceof Date) {
		return dateString;
	}
	
	// Parsear el string YYYY-MM-DD directamente
	const match = dateString.match(/^(\d{4})-(\d{2})-(\d{2})/);
	if (match) {
		const year = parseInt(match[1], 10);
		const month = parseInt(match[2], 10) - 1; // Los meses en Date son 0-indexed
		const day = parseInt(match[3], 10);
		return new Date(year, month, day);
	}
	
	// Si no coincide el formato, intentar parsear normalmente
	return new Date(dateString);
}