/**
 * =====================================================
 * SISTEMA DE CONTROLES - TOKENS Y VARIABLES
 * =====================================================
 * Sistema centralizado para inputs y botones.
 * Todos los controles deben usar estos tokens para mantener consistencia.
 * =====================================================
 */

/**
 * Escala de alturas de controles
 * Mínimo 44px para accesibilidad táctil (WCAG)
 */
export const controlHeights = {
  sm: '36px',      // Variante pequeña
  base: '44px',    // Altura base (mínimo accesible)
  lg: '52px',      // Variante grande
};

/**
 * Escala de padding horizontal
 */
export const controlPaddingX = {
  sm: '12px',
  base: '16px',
  lg: '20px',
};

/**
 * Escala de border radius
 */
export const controlRadius = {
  sm: '8px',
  base: '10px',
  lg: '12px',
};

/**
 * Escala de tamaños tipográficos
 */
export const controlFontSizes = {
  sm: '14px',
  base: '15px',
  lg: '16px',
};

/**
 * Configuración por defecto
 */
export const defaultControlConfig = {
  height: 'base',
  paddingX: 'base',
  radius: 'base',
  fontSize: 'base',
};

/**
 * Valores responsive
 * En mobile, se ajustan automáticamente vía CSS
 */
export const responsiveControlConfig = {
  mobile: {
    height: '48px',    // Más grande en mobile para mejor accesibilidad
    paddingX: '14px',
    fontSize: '16px',  // Evitar zoom automático en iOS
  },
};

