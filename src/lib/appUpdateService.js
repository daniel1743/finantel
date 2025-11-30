// =====================================================
// SERVICIO: App Update Service
// =====================================================
// Detecta actualizaciones y maneja notificaciones
// =====================================================

const APP_VERSION = '2.1.0'; // ⚠️ ACTUALIZAR EN CADA DEPLOY
const VERSION_CHECK_INTERVAL = 1 * 60 * 1000; // 1 minuto (más frecuente para detectar actualizaciones rápido)

class AppUpdateService {
  constructor() {
    this.registration = null;
    this.updateAvailable = false;
    this.listeners = new Set();
    this.isMobile = this.detectMobile();
    this.versionCheckInterval = null;
    this.isUpdating = false; // Flag para evitar múltiples actualizaciones
    this.lastVersion = null; // Última versión detectada
    this.reloadAttempted = false; // Flag para evitar recargas múltiples
  }

  // Detectar si es dispositivo móvil
  detectMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    ) || window.innerWidth < 768;
  }

  // Registrar Service Worker
  async register() {
    if (!('serviceWorker' in navigator)) {
      console.warn('[AppUpdate] Service Worker no soportado');
      return false;
    }

    try {
      this.registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });

      console.log('[AppUpdate] Service Worker registrado:', this.registration.scope);

      // Escuchar actualizaciones
      this.registration.addEventListener('updatefound', () => {
        this.handleUpdateFound();
      });

      // Verificar actualizaciones periódicamente
      this.startVersionCheck();

      // Escuchar mensajes del Service Worker
      navigator.serviceWorker.addEventListener('message', (event) => {
        this.handleSWMessage(event);
      });

      return true;
    } catch (error) {
      console.error('[AppUpdate] Error registrando Service Worker:', error);
      return false;
    }
  }

  // Manejar cuando se encuentra una actualización
  handleUpdateFound() {
    console.log('[AppUpdate] Nueva versión encontrada');
    const newWorker = this.registration.installing || this.registration.waiting;

    if (!newWorker) return;

    // Evitar procesar múltiples veces
    if (this.isUpdating) {
      console.log('[AppUpdate] Ya hay una actualización en proceso, ignorando...');
      return;
    }

    newWorker.addEventListener('statechange', () => {
      if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
        // Hay una nueva versión instalada
        // Solo marcar como disponible, NO aplicar automáticamente
        this.updateAvailable = true;
        this.notifyListeners('update-available');
        console.log('[AppUpdate] Nueva versión disponible (esperando confirmación)');
      } else if (newWorker.state === 'activated') {
        // El nuevo worker está activo
        console.log('[AppUpdate] Nuevo Service Worker activado');
        // NO recargar automáticamente aquí para evitar bucles
      }
    });

    // NO activar automáticamente el worker esperando
    // Dejarlo para que el usuario o el sistema lo active cuando sea apropiado
  }

  // Mostrar notificación de actualización (solo móviles)
  async showUpdateNotification() {
    if (!('Notification' in window)) {
      console.warn('[AppUpdate] Notificaciones no soportadas');
      return;
    }

    // Solicitar permiso si no está concedido
    if (Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        console.warn('[AppUpdate] Permiso de notificaciones denegado');
        return;
      }
    }

    if (Notification.permission === 'granted') {
      // Usar Service Worker para mostrar notificación
      if (this.registration) {
        this.registration.showNotification('Nueva Actualización Disponible', {
          body: 'Hay una nueva versión de Finantel disponible. Toca para actualizar.',
          icon: '/finantel-logo.png',
          badge: '/finantel-icon.svg',
          tag: 'app-update',
          requireInteraction: false,
          actions: [
            {
              action: 'update',
              title: 'Actualizar ahora'
            },
            {
              action: 'dismiss',
              title: 'Más tarde'
            }
          ],
          data: {
            version: APP_VERSION,
            url: window.location.href
          }
        });
      }
    }
  }

  // Manejar mensajes del Service Worker
  handleSWMessage(event) {
    const { type, version, forceReload } = event.data;

    switch (type) {
      case 'SW_ACTIVATED':
        console.log('[AppUpdate] Service Worker activado, versión:', version);
        // Solo notificar si la versión es diferente y no hemos intentado recargar
        if (version !== APP_VERSION && version !== this.lastVersion && !this.reloadAttempted) {
          this.lastVersion = version;
          this.updateAvailable = true;
          this.notifyListeners('update-available');
          // NO recargar automáticamente para evitar bucles
        }
        break;

      case 'FORCE_RELOAD':
        // Solo recargar si no hemos intentado ya
        if (!this.reloadAttempted) {
        console.log('[AppUpdate] Forzando recarga...');
          this.reloadAttempted = true;
          setTimeout(() => this.forceReload(), 100);
        }
        break;

      case 'CACHE_CLEARED':
        console.log('[AppUpdate] Caché limpiado por Service Worker');
        // NO recargar automáticamente para evitar bucles
        break;

      default:
        console.log('[AppUpdate] Mensaje desconocido:', type);
    }
  }

  // Forzar recarga de la aplicación (con protección contra bucles)
  forceReload() {
    // Prevenir recargas múltiples
    if (this.reloadAttempted) {
      console.log('[AppUpdate] Recarga ya intentada, ignorando...');
      return;
    }

    this.reloadAttempted = true;
    this.isUpdating = true;

    // Limpiar caché del navegador completamente
    if ('caches' in window) {
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            console.log('[AppUpdate] Eliminando caché:', cacheName);
            return caches.delete(cacheName);
          })
        );
      }).then(() => {
        console.log('[AppUpdate] Recargando página...');
        // Recargar con bypass de caché
        window.location.reload(true);
      }).catch((err) => {
        console.error('[AppUpdate] Error limpiando caché:', err);
        // Recargar de todas formas
        window.location.reload(true);
      });
    } else {
      // Recargar con bypass de caché
    window.location.reload(true);
    }
  }

  // Aplicar actualización (solo cuando el usuario lo solicite o sea necesario)
  async applyUpdateImmediately() {
    if (!this.registration || this.isUpdating) {
      console.log('[AppUpdate] Actualización ya en proceso o sin registro');
      return;
    }

    this.isUpdating = true;

    try {
      // Si hay un worker esperando, activarlo
      if (this.registration.waiting) {
        this.registration.waiting.postMessage({ type: 'SKIP_WAITING' });
        // Esperar a que se active
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      // Limpiar caché y recargar
      await this.clearCache();
      this.forceReload();
    } catch (error) {
      console.error('[AppUpdate] Error aplicando actualización:', error);
      this.isUpdating = false;
      this.reloadAttempted = false;
    }
  }

  // Limpiar caché completamente
  async clearCache() {
    console.log('[AppUpdate] Limpiando caché...');

    try {
      // Limpiar caché del Service Worker
      if (this.registration) {
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames.map((cacheName) => caches.delete(cacheName))
        );

        // Enviar mensaje al Service Worker para limpiar
        if (navigator.serviceWorker.controller) {
          navigator.serviceWorker.controller.postMessage({
            type: 'CLEAR_CACHE'
          });
        }
      }

      // Limpiar localStorage y sessionStorage (opcional)
      // localStorage.clear();
      // sessionStorage.clear();

      console.log('[AppUpdate] Caché limpiado correctamente');
      return true;
    } catch (error) {
      console.error('[AppUpdate] Error limpiando caché:', error);
      return false;
    }
  }

  // Verificar actualizaciones periódicamente
  startVersionCheck() {
    // Verificar inmediatamente
    this.checkForUpdates();

    // Verificar cada intervalo
    this.versionCheckInterval = setInterval(() => {
      this.checkForUpdates();
    }, VERSION_CHECK_INTERVAL);
  }

  // Detener verificación de actualizaciones
  stopVersionCheck() {
    if (this.versionCheckInterval) {
      clearInterval(this.versionCheckInterval);
      this.versionCheckInterval = null;
    }
  }

  // Verificar si hay actualizaciones
  async checkForUpdates() {
    if (!this.registration || this.isUpdating) return;

    try {
      // Forzar verificación de actualizaciones
      await this.registration.update();
      
      // NO activar automáticamente el worker esperando
      // Solo notificar que hay una actualización disponible
      if (this.registration.waiting) {
        console.log('[AppUpdate] Worker esperando detectado (no activando automáticamente)');
        this.updateAvailable = true;
        this.notifyListeners('update-available');
      }
    } catch (error) {
      console.error('[AppUpdate] Error verificando actualizaciones:', error);
    }
  }

  // Aplicar actualización (método principal, llamado por el usuario)
  async applyUpdate() {
    if (!this.updateAvailable || !this.registration || this.isUpdating) {
      console.log('[AppUpdate] No se puede aplicar actualización:', {
        updateAvailable: this.updateAvailable,
        hasRegistration: !!this.registration,
        isUpdating: this.isUpdating
      });
      return false;
    }

    this.isUpdating = true;

    try {
      // Limpiar caché antes de actualizar
      await this.clearCache();

      // Forzar actualización del Service Worker
      if (this.registration.waiting) {
        this.registration.waiting.postMessage({ type: 'SKIP_WAITING' });
        // Esperar un momento para que se active
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      // Recargar la página
      this.forceReload();
      return true;
    } catch (error) {
      console.error('[AppUpdate] Error aplicando actualización:', error);
      this.isUpdating = false;
      this.reloadAttempted = false;
      return false;
    }
  }

  // Suscribirse a eventos de actualización
  on(event, callback) {
    this.listeners.add({ event, callback });
  }

  // Desuscribirse de eventos
  off(event, callback) {
    this.listeners.forEach((listener) => {
      if (listener.event === event && listener.callback === callback) {
        this.listeners.delete(listener);
      }
    });
  }

  // Notificar a los listeners
  notifyListeners(event, data = {}) {
    this.listeners.forEach((listener) => {
      if (listener.event === event) {
        listener.callback(data);
      }
    });
  }

  // Obtener versión actual
  getVersion() {
    return APP_VERSION;
  }

  // Verificar si hay actualización disponible
  hasUpdate() {
    return this.updateAvailable;
  }
}

// Instancia singleton
const appUpdateService = new AppUpdateService();

export default appUpdateService;

