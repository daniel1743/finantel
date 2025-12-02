// =====================================================
// HELPER: Service Worker Helper
// =====================================================
// Utilidades para manejar Service Workers en desarrollo
// =====================================================

/**
 * Detecta si estamos en localhost (modo desarrollo)
 * @returns {boolean} true si estamos en localhost
 */
export function isLocalhost() {
  return (
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    window.location.hostname.includes('localhost')
  );
}

/**
 * Desregistra todos los Service Workers en desarrollo (localhost)
 * 
 * Esta función es útil para limpiar SWs viejos que puedan estar
 * causando problemas en desarrollo. Solo funciona en localhost.
 * 
 * @returns {Promise<void>}
 */
export async function unregisterServiceWorkersInDev() {
  if (!('serviceWorker' in navigator)) {
    return;
  }

  // Solo desregistrar si estamos en localhost
  if (!isLocalhost()) {
    return;
  }

  try {
    const registrations = await navigator.serviceWorker.getRegistrations();
    
    if (registrations.length > 0) {
      console.log(
        `[ServiceWorker] Encontradas ${registrations.length} service workers en dev. Desregistrando...`
      );
    }

    for (const registration of registrations) {
      await registration.unregister();
      console.log('[ServiceWorker] Service Worker desregistrado:', registration.scope);
    }

    if (registrations.length > 0) {
      console.log('[ServiceWorker] Todos los service workers desregistrados en localhost.');
    }
  } catch (error) {
    console.error('[ServiceWorker] Error al desregistrar en dev:', error);
  }
}

/**
 * Limpia todos los cachés del Service Worker en desarrollo
 * 
 * Útil para limpiar cachés viejos que puedan estar causando problemas.
 * Solo funciona en localhost.
 * 
 * @returns {Promise<void>}
 */
export async function clearServiceWorkerCachesInDev() {
  if (!isLocalhost()) {
    return;
  }

  try {
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      
      if (cacheNames.length > 0) {
        console.log(`[ServiceWorker] Limpiando ${cacheNames.length} cachés en dev...`);
        
        await Promise.all(
          cacheNames.map(cacheName => {
            console.log('[ServiceWorker] Eliminando caché:', cacheName);
            return caches.delete(cacheName);
          })
        );
        
        console.log('[ServiceWorker] Todos los cachés limpiados en localhost.');
      }
    }
  } catch (error) {
    console.error('[ServiceWorker] Error al limpiar cachés en dev:', error);
  }
}

