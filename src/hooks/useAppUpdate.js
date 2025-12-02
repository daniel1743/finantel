// =====================================================
// HOOK: useAppUpdate
// =====================================================
// Hook para manejar actualizaciones de la app
// =====================================================

import { useState, useEffect, useCallback } from 'react';
import appUpdateService from '@/lib/appUpdateService';

export const useAppUpdate = () => {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [isRegistering, setIsRegistering] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Registrar Service Worker
    const registerSW = async () => {
      setIsRegistering(true);
      const registered = await appUpdateService.register();
      setIsRegistering(false);
      setIsMobile(appUpdateService.isMobile);

      if (registered) {
        // Escuchar actualizaciones y aplicar automáticamente
        appUpdateService.on('update-available', async () => {
          console.log('[useAppUpdate] Actualización disponible, aplicando automáticamente...');
          // Aplicar actualización automáticamente sin mostrar banner
          await appUpdateService.applyUpdate();
        });
      }
    };

    registerSW();

    // Cleanup
    return () => {
      appUpdateService.stopVersionCheck();
    };
  }, []);

  // Aplicar actualización
  const applyUpdate = useCallback(async () => {
    const success = await appUpdateService.applyUpdate();
    return success;
  }, []);

  // Limpiar caché
  const clearCache = useCallback(async () => {
    const success = await appUpdateService.clearCache();
    if (success) {
      // Recargar después de limpiar
      window.location.reload();
    }
    return success;
  }, []);

  // Verificar actualizaciones manualmente
  const checkForUpdates = useCallback(async () => {
    await appUpdateService.checkForUpdates();
  }, []);

  return {
    updateAvailable,
    isRegistering,
    isMobile,
    applyUpdate,
    clearCache,
    checkForUpdates,
    version: appUpdateService.getVersion(),
  };
};

