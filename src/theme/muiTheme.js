// =====================================================
// MUI THEME - AdminMart Style
// =====================================================
// Tema Material UI al estilo AdminMart para el Sidebar
// =====================================================

import { createTheme } from '@mui/material/styles';

export const lightTheme = createTheme({
  palette: {
    mode: 'light',
    background: {
      default: '#FFFFFF',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#2C3E50',
      secondary: '#90A4AE',
    },
    primary: {
      main: '#2196F3',
      light: '#E3F2FD',
      dark: '#1976D2',
    },
    action: {
      selected: '#E3F2FD',
      hover: '#F5F5F5',
    },
    divider: '#ECEFF1',
  },
  typography: {
    fontFamily: '"Plus Jakarta Sans", "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    h6: {
      fontSize: '11px',
      fontWeight: 600,
      letterSpacing: '0.5px',
      textTransform: 'uppercase',
      color: '#A0A0A0',
      marginTop: '16px',
      marginBottom: '8px',
    },
    body1: {
      fontSize: '14px',
      fontWeight: 500,
      color: '#2C3E50',
    },
    body2: {
      fontSize: '12px',
      fontWeight: 400,
      color: '#90A4AE',
    },
  },
  transitions: {
    duration: {
      shortest: 150,
      shorter: 250,
      short: 300,
      standard: 400,
      complex: 500,
    },
    easing: {
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
      easeOut: 'cubic-bezier(0.0, 0, 0.2, 1)',
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
      linear: 'linear',
    },
  },
});

export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    background: {
      default: '#1C2536',
      paper: '#1C2536',
    },
    text: {
      primary: '#FFFFFF',
      secondary: '#A0A0A0',
    },
    primary: {
      main: '#00A9FF',
      light: '#2A4563',
      dark: '#0088CC',
    },
    action: {
      selected: '#2A4563',
      hover: '#253447',
    },
    divider: '#2A3F5F',
  },
  typography: {
    fontFamily: '"Plus Jakarta Sans", "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    h6: {
      fontSize: '11px',
      fontWeight: 600,
      letterSpacing: '0.5px',
      textTransform: 'uppercase',
      color: '#A0A0A0',
      marginTop: '16px',
      marginBottom: '8px',
    },
    body1: {
      fontSize: '14px',
      fontWeight: 500,
      color: '#FFFFFF',
    },
    body2: {
      fontSize: '12px',
      fontWeight: 400,
      color: '#A0A0A0',
    },
  },
  transitions: {
    duration: {
      shortest: 150,
      shorter: 250,
      short: 300,
      standard: 400,
      complex: 500,
    },
    easing: {
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
      easeOut: 'cubic-bezier(0.0, 0, 0.2, 1)',
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
      linear: 'linear',
    },
  },
});

