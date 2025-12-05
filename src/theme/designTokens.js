/**
 * DESIGN TOKENS - Sistema Centralizado
 * Todos los valores visuales deben venir de aquí
 */

export const designTokens = {
  colors: {
    primary: {
      50: '#E6F3F6',
      100: '#CCE7ED',
      200: '#99CFDB',
      300: '#66B7C9',
      400: '#339FB7',
      500: '#1C8FA0',  // Color principal
      600: '#167a8a',  // Hover principal
      700: '#0D3A47',
      800: '#092D37',
      900: '#052027',
    },
    secondary: {
      50: '#FDF4F0',
      100: '#FBE9E1',
      200: '#F7D3C3',
      300: '#F3BDA5',
      400: '#EFA787',
      500: '#E47B45',  // Color secundario
      600: '#D66B35',
      700: '#B85A2D',
      800: '#9A4925',
      900: '#7C381D',
    },
    neutral: {
      50: '#FAFAFA',
      100: '#F5F7F9',
      200: '#E5E7EB',
      300: '#D1D5DB',
      400: '#9CA3AF',
      500: '#6E6E73',
      600: '#4B5563',
      700: '#374151',
      800: '#1F2937',
      900: '#1a1a1a',  // Texto principal
    },
    success: {
      500: '#10B981',
      600: '#059669',
    },
    warning: {
      500: '#F59E0B',
      600: '#D97706',
    },
    error: {
      500: '#EF4444',
      600: '#DC2626',
    },
  },
  borderRadius: {
    none: '0',
    sm: '8px',
    base: '10px',      // Botones, inputs
    md: '12px',
    lg: '16px',       // Tarjetas estándar
    xl: '24px',       // Tarjetas grandes, modales
    '2xl': '32px',    // Tarjetas extra grandes
    full: '9999px',   // Botones CTA, badges
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    '2xl': '48px',
    '3xl': '64px',
  },
  typography: {
    fontFamily: {
      sans: ['Inter', 'sans-serif'],
      display: ['Inter Tight', 'sans-serif'],
    },
    fontSize: {
      xs: ['12px', { lineHeight: '1.5' }],
      sm: ['14px', { lineHeight: '1.5' }],
      base: ['16px', { lineHeight: '1.5' }],
      lg: ['18px', { lineHeight: '1.4' }],
      xl: ['20px', { lineHeight: '1.4' }],
      '2xl': ['24px', { lineHeight: '1.3' }],
      '3xl': ['30px', { lineHeight: '1.2' }],
      '4xl': ['36px', { lineHeight: '1.1' }],
      '5xl': ['48px', { lineHeight: '1.1' }],
      '6xl': ['60px', { lineHeight: '1' }],
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
  },
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    primary: '0 10px 30px -10px rgba(28, 143, 160, 0.2)',
    'primary-lg': '0 20px 40px -12px rgba(28, 143, 160, 0.3)',
  },
  zIndex: {
    base: 0,
    dropdown: 1000,
    sticky: 1020,
    fixed: 1030,
    modalBackdrop: 1040,
    modal: 1050,
    popover: 1060,
    tooltip: 1070,
  },
};

export default designTokens;
