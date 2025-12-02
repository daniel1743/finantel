/**
 * =====================================================
 * DESIGN TOKENS - FINANTEL 2025
 * =====================================================
 * Sistema de tokens de diseño profesional
 * Reemplazo de colores hardcodeados por tokens centralizados
 * =====================================================
 */

export const designTokens = {
  // =====================================================
  // COLORES PRIMARIOS (Reemplazo de #1C8FA0)
  // =====================================================
  primary: {
    50: '#E6F3F6',
    100: '#CCE7ED',
    500: '#2E7D8C',
    600: '#1A5A6E',
    700: '#0D3A47',
    DEFAULT: '#2E7D8C', // primary-500
  },

  // =====================================================
  // COLORES NEUTRALES
  // =====================================================
  neutral: {
    text: '#1A1A1A',
    textSecondary: '#6E6E73',
    background: '#FFFFFF',
    backgroundSoft: '#F9FAFB',
    border: '#E5E7EB',
  },

  // =====================================================
  // COLORES DE ESTADO
  // =====================================================
  status: {
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
  },

  // =====================================================
  // DARK MODE
  // =====================================================
  dark: {
    background: '#0F0F11',
    text: '#F5F7F9',
    border: '#2D2D33',
  },

  // =====================================================
  // TIPOGRAFÍA
  // =====================================================
  typography: {
    fontFamily: {
      sans: ['Inter', 'sans-serif'],
      heading: ['Inter Tight', 'sans-serif'],
    },
    fontSize: {
      xs: '11px',      // labels
      sm: '14px',
      base: '16px',
      lg: '18px',
      xl: '20px',
      '2xl': '24px',
      '3xl': '30px',
      '4xl': '36px',
      '6xl': '60px',   // hero
    },
    fontWeight: {
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
  },

  // =====================================================
  // ESPACIADO
  // =====================================================
  spacing: {
    1: '8px',
    1.5: '12px',
    2: '16px',
    3: '24px',
    4: '32px',
    5: '40px',
    6: '48px',
    8: '64px',
  },

  // =====================================================
  // BORDER RADIUS
  // =====================================================
  borderRadius: {
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '20px',
    '2xl': '24px',
    full: '9999px',
  },

  // =====================================================
  // SHADOWS
  // =====================================================
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
    primary: '0 20px 40px -12px rgba(46, 125, 140, 0.3)', // primary-500 con opacidad
  },
};

/**
 * Helper para obtener tokens en componentes
 * @example
 * import { getToken } from '@/lib/design-tokens';
 * const primaryColor = getToken('primary.500');
 */
export function getToken(path) {
  const keys = path.split('.');
  let value = designTokens;
  
  for (const key of keys) {
    if (value && typeof value === 'object' && key in value) {
      value = value[key];
    } else {
      console.warn(`[DesignTokens] Token no encontrado: ${path}`);
      return null;
    }
  }
  
  return value;
}

/**
 * Exportar tokens como objeto plano para uso en CSS
 */
export const tokensForCSS = {
  // Primarios
  '--primary-50': designTokens.primary[50],
  '--primary-100': designTokens.primary[100],
  '--primary-500': designTokens.primary[500],
  '--primary-600': designTokens.primary[600],
  '--primary-700': designTokens.primary[700],
  
  // Neutrales
  '--neutral-text': designTokens.neutral.text,
  '--neutral-text-secondary': designTokens.neutral.textSecondary,
  '--neutral-background': designTokens.neutral.background,
  '--neutral-background-soft': designTokens.neutral.backgroundSoft,
  '--neutral-border': designTokens.neutral.border,
  
  // Estados
  '--status-success': designTokens.status.success,
  '--status-warning': designTokens.status.warning,
  '--status-error': designTokens.status.error,
  
  // Dark Mode
  '--dark-background': designTokens.dark.background,
  '--dark-text': designTokens.dark.text,
  '--dark-border': designTokens.dark.border,
};

