/**
 * =====================================================
 * SISTEMA DE ICONOGRAFÍA - TOKENS Y VARIABLES
 * =====================================================
 * Sistema centralizado de iconografía basado en el estilo del sidebar.
 * Todos los iconos deben usar estos tokens para mantener consistencia.
 * =====================================================
 */

/**
 * Escala de tamaños de iconos
 * Basado en el tamaño estándar del sidebar (24px = md)
 */
export const iconSizes = {
  xs: '12px',   // 0.75rem - Para badges o elementos muy secundarios
  sm: '16px',   // 1rem - Para textos secundarios o labels
  md: '20px',   // 1.25rem - Tamaño por defecto (referencia sidebar)
  lg: '24px',   // 1.5rem - Para iconos protagonistas (hero, tarjetas principales)
  xl: '32px',   // 2rem - Para iconos destacados o hero sections
};

/**
 * Clases Tailwind para tamaños de iconos
 */
export const iconSizeClasses = {
  xs: 'w-3 h-3',      // 12px
  sm: 'w-4 h-4',      // 16px
  md: 'w-5 h-5',      // 20px (default - sidebar)
  lg: 'w-6 h-6',      // 24px
  xl: 'w-8 h-8',      // 32px
};

/**
 * Clases Tailwind para tamaños de iconos RESPONSIVE
 * Se ajustan automáticamente en móviles
 */
export const iconSizeClassesResponsive = {
  xs: 'icon-xs-responsive',  // 12px -> 10px en mobile
  sm: 'icon-sm-responsive',  // 16px -> 14px en mobile
  md: 'icon-md-responsive',  // 20px -> 16px en mobile
  lg: 'icon-lg-responsive',  // 24px -> 20px en mobile
  xl: 'icon-xl-responsive',  // 32px -> 24px en mobile
};

/**
 * Colores de iconos según contexto
 * Migrado a Design Tokens 2025
 */
export const iconColors = {
  default: 'text-neutral-500 dark:text-gray-400',
  primary: 'text-primary-500 dark:text-primary-500',
  active: 'text-primary-500 dark:text-primary-500',
  muted: 'text-neutral-500 dark:text-gray-500',
  white: 'text-white dark:text-white',
  dark: 'text-neutral-900 dark:text-white',
  success: 'text-success-500 dark:text-green-400',
  warning: 'text-warning-500 dark:text-amber-400',
  error: 'text-error-500 dark:text-red-400',
};

/**
 * Estilo visual de iconos
 * - Outline (línea simple): estilo por defecto
 * - Grosor uniforme: stroke-width 1.5-2
 * - Alineación centrada
 */
export const iconStyle = {
  strokeWidth: 1.5,      // Grosor de línea uniforme
  fill: 'none',          // Sin relleno (outline)
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
};

/**
 * Configuración por defecto
 */
export const defaultIconConfig = {
  size: 'md',            // Tamaño por defecto (20px)
  color: 'default',      // Color por defecto
  className: '',         // Clases adicionales
};

