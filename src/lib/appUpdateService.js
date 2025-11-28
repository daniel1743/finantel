// =====================================================
// SERVICIO: App Update Service
// =====================================================
// Detecta actualizaciones y maneja notificaciones
// =====================================================

const APP_VERSION = '2.1.0'; // ⚠️ ACTUALIZAR EN CADA DEPLOY
const VERSION_CHECK_INTERVAL = 5 * 60 * 1000; // 5 minutos

class AppUpdateService {
  constructor() {
    this.registration = null;
    this.updateAvailable = false;
    this.listeners = new Set();
    this.isMobile = this.detectMobile();
    this.versionCheckInterval = null;
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
    const newWorker = this.registration.installing;

    if (!newWorker) return;

    newWorker.addEventListener('statechange', () => {
      if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
        // Hay una nueva versión instalada
        this.updateAvailable = true;
        this.notifyListeners('update-available');
        
        // Mostrar notificación solo en móviles
        if (this.isMobile) {
          this.showUpdateNotification();
        }
      }
    });
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
    const { type, version } = event.data;

    switch (type) {
      case 'SW_ACTIVATED':
        console.log('[AppUpdate] Service Worker activado, versión:', version);
        if (version !== APP_VERSION) {
          this.updateAvailable = true;
          this.notifyListeners('update-available');
        }
        break;

      case 'FORCE_RELOAD':
        console.log('[AppUpdate] Forzando recarga...');
        this.forceReload();
        break;

      default:
        console.log('[AppUpdate] Mensaje desconocido:', type);
    }
  }

  // Forzar recarga de la aplicación
  forceReload() {
    // Limpiar caché del navegador
    if ('caches' in window) {
      caches.keys().then((cacheNames) => {
        cacheNames.forEach((cacheName) => {
          caches.delete(cacheName);
        });
      });
    }

    // Recargar la página
    window.location.reload(true);
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
        if (navigator.serviceWorker.controller && 'postMessage' in navigator.serviceWorker.controller) {
          try {
            navigator.serviceWorker.controller.postMessage({
              type: 'CLEAR_CACHE'
            });
          } catch (error) {
            console.warn('[AppUpdate] Error enviando mensaje CLEAR_CACHE:', error);
          }
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
    if (!this.registration) return;

    try {
      await this.registration.update();
    } catch (error) {
      console.error('[AppUpdate] Error verificando actualizaciones:', error);
    }
  }

  // Aplicar actualización
  async applyUpdate() {
    if (!this.updateAvailable || !this.registration) {
      return false;
    }

    try {
      // Limpiar caché antes de actualizar
      await this.clearCache();

      // Forzar actualización del Service Worker
      if (this.registration.waiting && 'postMessage' in this.registration.waiting) {
        try {
          this.registration.waiting.postMessage({ type: 'SKIP_WAITING' });
        } catch (error) {
          console.warn('[AppUpdate] Error enviando SKIP_WAITING:', error);
        }
      }

      // Recargar la página
      this.forceReload();
      return true;
    } catch (error) {
      console.error('[AppUpdate] Error aplicando actualización:', error);
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

