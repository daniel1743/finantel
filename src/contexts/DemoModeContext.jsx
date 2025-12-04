import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './SupabaseAuthContext';

const DemoModeContext = createContext();

export const DemoModeProvider = ({ children }) => {
  // ✅ useAuth ahora está disponible porque DemoModeProvider está dentro de AuthProvider
  const { user } = useAuth();

  const [isDemoMode, setIsDemoMode] = useState(false);
  const [demoStartTime, setDemoStartTime] = useState(null);
  const [showConversionModal, setShowConversionModal] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(null);

  const DEMO_DURATION = 60 * 60 * 1000; // 1 hora en milisegundos

  // Iniciar demo mode
  const startDemoMode = () => {
    const startTime = Date.now();
    setIsDemoMode(true);
    setDemoStartTime(startTime);
    localStorage.setItem('demo_start_time', startTime.toString());
    localStorage.setItem('demo_mode', 'true');
  };

  // Salir del demo mode
  const exitDemoMode = () => {
    setIsDemoMode(false);
    setDemoStartTime(null);
    setShowConversionModal(false);
    localStorage.removeItem('demo_start_time');
    localStorage.removeItem('demo_mode');
  };

  // Verificar si el demo ha expirado
  useEffect(() => {
    // Si el usuario está autenticado realmente, no es demo
    if (user && !user.email?.includes('demo_')) {
      exitDemoMode();
      return;
    }

    // Recuperar demo mode del localStorage al cargar
    const savedDemoMode = localStorage.getItem('demo_mode');
    const savedStartTime = localStorage.getItem('demo_start_time');

    if (savedDemoMode === 'true' && savedStartTime) {
      const start = parseInt(savedStartTime);
      const elapsed = Date.now() - start;

      if (elapsed < DEMO_DURATION) {
        setIsDemoMode(true);
        setDemoStartTime(start);
      } else {
        // Demo expirado
        setShowConversionModal(true);
        exitDemoMode();
      }
    }
  }, [user]);

  // Timer para actualizar tiempo restante
  useEffect(() => {
    if (!isDemoMode || !demoStartTime) return;

    const interval = setInterval(() => {
      const elapsed = Date.now() - demoStartTime;
      const remaining = DEMO_DURATION - elapsed;

      if (remaining <= 0) {
        setShowConversionModal(true);
        exitDemoMode();
      } else {
        setTimeRemaining(remaining);
      }
    }, 1000); // Actualizar cada segundo

    return () => clearInterval(interval);
  }, [isDemoMode, demoStartTime]);

  // Formatear tiempo restante
  const getFormattedTimeRemaining = () => {
    if (!timeRemaining) return '60:00';

    const minutes = Math.floor(timeRemaining / 60000);
    const seconds = Math.floor((timeRemaining % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const value = {
    isDemoMode,
    demoStartTime,
    timeRemaining,
    showConversionModal,
    startDemoMode,
    exitDemoMode,
    setShowConversionModal,
    getFormattedTimeRemaining,
  };

  return (
    <DemoModeContext.Provider value={value}>
      {children}
    </DemoModeContext.Provider>
  );
};

export const useDemoMode = () => {
  const context = useContext(DemoModeContext);
  if (!context) {
    throw new Error('useDemoMode must be used within a DemoModeProvider');
  }
  return context;
};
