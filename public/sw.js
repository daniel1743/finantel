// =====================================================
// SERVICE WORKER - FINANTEL
// =====================================================
// Maneja caché, actualizaciones y notificaciones push
// =====================================================

const APP_VERSION = '2.1.0'; // ⚠️ ACTUALIZAR EN CADA DEPLOY
const CACHE_NAME = `finantel-v${APP_VERSION}`;
const STATIC_CACHE_NAME = `finantel-static-v${APP_VERSION}`;

// Archivos críticos para cachear
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/finantel-logo.png',
  '/finantel-icon.svg'
];

// Instalación del Service Worker
self.addEventListener('install', (event) => {
  // ⚠️ CRÍTICO: NO instalar en localhost (desarrollo)
  const isLocalhost = 
    self.location.hostname === 'localhost' ||
    self.location.hostname === '127.0.0.1' ||
    self.location.hostname.includes('localhost');

  if (isLocalhost) {
    console.log('[SW] Service Worker NO se instala en localhost (desarrollo)');
    // Desactivar inmediatamente en localhost
    self.skipWaiting();
    return;
  }

  console.log('[SW] Instalando Service Worker versión', APP_VERSION);
  
  event.waitUntil(
    Promise.all([
      // Cachear assets estáticos
      caches.open(STATIC_CACHE_NAME).then((cache) => {
        return cache.addAll(STATIC_ASSETS);
      }),
      // Limpiar cachés antiguos
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME && cacheName !== STATIC_CACHE_NAME) {
              console.log('[SW] Eliminando caché antigua:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
    ]).then(() => {
      console.log('[SW] Service Worker instalado correctamente');
      return self.skipWaiting(); // Activar inmediatamente
    })
  );
});

// Activación del Service Worker
self.addEventListener('activate', (event) => {
  // ⚠️ CRÍTICO: NO activar en localhost (desarrollo)
  const isLocalhost = 
    self.location.hostname === 'localhost' ||
    self.location.hostname === '127.0.0.1' ||
    self.location.hostname.includes('localhost');

  if (isLocalhost) {
    console.log('[SW] Service Worker NO se activa en localhost (desarrollo)');
    // Desactivar todos los clientes en localhost
    event.waitUntil(
      self.clients.claim().then(() => {
        return self.registration.unregister();
      })
    );
    return;
  }

  console.log('[SW] Activando Service Worker versión', APP_VERSION);
  
  event.waitUntil(
    Promise.all([
      // Limpiar todos los cachés que no sean la versión actual
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME && cacheName !== STATIC_CACHE_NAME) {
              console.log('[SW] Eliminando caché obsoleta:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // Tomar control de todas las páginas
      self.clients.claim()
    ]).then(() => {
      console.log('[SW] Service Worker activado');
      // Notificar a todos los clientes sobre la nueva versión
      return self.clients.matchAll().then((clients) => {
        clients.forEach((client) => {
          if (client && 'postMessage' in client) {
            try {
              client.postMessage({
                type: 'SW_ACTIVATED',
                version: APP_VERSION
              });
            } catch (err) {
              console.error('[SW] Error enviando mensaje a cliente:', err);
            }
          }
        });
      });
    })
  );
});

// Estrategia de caché: Network First con fallback a caché
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // ⚠️ CRÍTICO: Desactivar completamente en localhost (desarrollo)
  // Si estamos en localhost, NO interceptar ninguna petición
  if (url.hostname === 'localhost' || 
      url.hostname === '127.0.0.1' ||
      url.hostname.includes('localhost')) {
    // En desarrollo, dejar que el navegador maneje las peticiones normalmente
    // NO usar event.respondWith() para que el navegador maneje la petición
    return;
  }

  // Ignorar requests de extensiones y chrome-extension
  if (url.protocol === 'chrome-extension:' || url.protocol === 'chrome:') {
    return;
  }

  // Ignorar archivos que no existen (evitar errores 404)
  if (url.pathname.includes('visual-editor-config.js')) {
    return;
  }

  // Ignorar favicon.ico si no existe (evitar errores)
  if (url.pathname === '/favicon.ico') {
    return;
  }

  // Para APIs: Network First (siempre obtener datos frescos)
  if (url.pathname.includes('/rest/v1/') || 
      url.pathname.includes('/functions/v1/') ||
      url.pathname.includes('/auth/v1/')) {
    
    // ⚠️ CRÍTICO: Para POST/PUT/DELETE/PATCH, NO interceptar
    // Dejar que el navegador maneje estas peticiones directamente
    // Esto evita problemas con respuestas inválidas que causan "Failed to convert value to Response"
    if (request.method !== 'GET') {
      // No usar event.respondWith para métodos que modifican datos
      // Esto permite que el fetch se ejecute normalmente sin interferencia del SW
      return;
    }
    
    // Solo para GET requests: Network First con fallback a caché
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Solo cachear respuestas exitosas GET
          if (response.status === 200 && request.method === 'GET') {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone).catch((err) => {
                console.error('[SW] Error cacheando request:', err);
              });
            });
          }
          return response;
        })
        .catch((error) => {
          // Para GET: Fallback a caché si no hay red
          return caches.match(request).then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }
            // Si no hay caché, re-lanzar el error para que el navegador lo maneje
            // NO devolver un Response genérico que pueda causar problemas
            throw error;
          });
        })
    );
    return;
  }

  // Para assets estáticos: Cache First con validación
  if (request.destination === 'script' || 
      request.destination === 'style' ||
      request.destination === 'image' ||
      request.destination === 'font') {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          // Verificar si hay actualización en background
          if (request.method === 'GET') {
            fetch(request).then((networkResponse) => {
              if (networkResponse.status === 200) {
                caches.open(STATIC_CACHE_NAME).then((cache) => {
                  cache.put(request, networkResponse.clone()).catch((err) => {
                    console.error('[SW] Error actualizando caché:', err);
                  });
                });
              }
            }).catch(() => {
              // Sin red, usar caché
            });
          }
          return cachedResponse;
        }
        // No está en caché, obtener de red
        return fetch(request).then((response) => {
          if (response && response.status === 200 && request.method === 'GET') {
            const responseClone = response.clone();
            caches.open(STATIC_CACHE_NAME).then((cache) => {
              cache.put(request, responseClone).catch((err) => {
                console.error('[SW] Error cacheando asset:', err);
              });
            });
          }
          // Asegurar que siempre devolvemos un Response válido
          return response || new Response('', { status: 404 });
        }).catch((error) => {
          // Si falla el fetch, dejar que el navegador maneje el error
          // NO devolver un Response falso que cause "Failed to convert value to 'Response'"
          console.error('[SW] Error obteniendo asset:', error);
          throw error; // Re-lanzar para que el navegador maneje el error
        });
      })
    );
    return;
  }

  // Para HTML: Network First (siempre obtener la última versión)
  if (request.destination === 'document' || request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cachear HTML solo si es exitoso y es GET
          if (response.status === 200 && request.method === 'GET') {
            const responseClone = response.clone();
            caches.open(STATIC_CACHE_NAME).then((cache) => {
              cache.put(request, responseClone).catch((err) => {
                console.error('[SW] Error cacheando HTML:', err);
              });
            });
          }
          return response;
        })
        .catch((error) => {
          // Fallback a caché si no hay red
          return caches.match(request).then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }
            // Si no hay caché y es una ruta SPA, devolver index.html
            if (request.mode === 'navigate') {
              return caches.match('/index.html').then((indexHtml) => {
                return indexHtml || new Response('Sin conexión', { 
                  status: 503,
                  headers: { 'Content-Type': 'text/html' }
                });
              });
            }
            // Para otros recursos, dejar que el navegador maneje el error
            throw error;
          });
        })
    );
    return;
  }

  // Default: Network First
  event.respondWith(
    fetch(request).catch(() => {
      return caches.match(request);
    })
  );
});

// Manejar mensajes del cliente
self.addEventListener('message', (event) => {
  const { type, data } = event.data;

  switch (type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;

    case 'CLEAR_CACHE':
      console.log('[SW] Limpiando caché por solicitud del cliente');
      event.waitUntil(
        caches.keys().then((cacheNames) => {
          return Promise.all(
            cacheNames.map((cacheName) => {
              console.log('[SW] Eliminando caché:', cacheName);
              return caches.delete(cacheName);
            })
          );
        }).then(() => {
          if (event.ports && event.ports[0] && 'postMessage' in event.ports[0]) {
            try {
              event.ports[0].postMessage({ success: true });
            } catch (err) {
              console.error('[SW] Error enviando mensaje de limpieza:', err);
            }
          }
        })
      );
      break;

    case 'GET_VERSION':
      if (event.ports && event.ports[0] && 'postMessage' in event.ports[0]) {
        try {
          event.ports[0].postMessage({ version: APP_VERSION });
        } catch (err) {
          console.error('[SW] Error enviando versión:', err);
        }
      }
      break;

    default:
      console.log('[SW] Mensaje desconocido:', type);
  }
});

// Notificaciones Push (solo para móviles)
self.addEventListener('push', (event) => {
  console.log('[SW] Push notification recibida');
  
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'Finantel';
  const options = {
    body: data.body || 'Nueva actualización disponible',
    icon: '/finantel-logo.png',
    badge: '/finantel-icon.svg',
    tag: 'update-notification',
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
      url: data.url || '/',
      version: data.version || APP_VERSION
    }
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Manejar clics en notificaciones
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Click en notificación:', event.action);
  
  event.notification.close();

  if (event.action === 'update' || !event.action) {
    // Abrir la app y forzar recarga
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
        if (clientList.length > 0) {
          // Ya hay una ventana abierta, enfocarla y recargar
          const client = clientList[0];
          if (client && 'postMessage' in client) {
            try {
              client.postMessage({
                type: 'FORCE_RELOAD',
                version: event.notification.data?.version
              });
            } catch (err) {
              console.error('[SW] Error enviando mensaje de recarga:', err);
            }
          }
          return client.focus().then(() => {
            if (client && 'navigate' in client) {
              return client.navigate(event.notification.data?.url || '/');
            }
            return Promise.resolve();
          });
        } else {
          // Abrir nueva ventana
          return clients.openWindow(event.notification.data?.url || '/');
        }
      })
    );
  }
});

// Sincronización en background (para cuando vuelve la conexión)
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync:', event.tag);
  
  if (event.tag === 'sync-data') {
    event.waitUntil(
      // Aquí puedes agregar lógica para sincronizar datos pendientes
      Promise.resolve()
    );
  }
});

