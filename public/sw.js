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
  console.log('[SW] Instalando Service Worker versión', APP_VERSION);
  
  // Forzar activación inmediata sin esperar a que se cierren las pestañas
  self.skipWaiting();
  
  event.waitUntil(
    Promise.all([
      // Limpiar TODAS las cachés antiguas primero
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            console.log('[SW] Eliminando caché antigua:', cacheName);
            return caches.delete(cacheName);
          })
        );
      }),
      // Cachear assets estáticos solo después de limpiar
      caches.open(STATIC_CACHE_NAME).then((cache) => {
        return cache.addAll(STATIC_ASSETS).catch((err) => {
          console.warn('[SW] Error cacheando assets estáticos:', err);
        });
      })
    ]).then(() => {
      console.log('[SW] Service Worker instalado correctamente');
      // Forzar activación inmediata
      return self.skipWaiting();
    })
  );
});

// Activación del Service Worker
self.addEventListener('activate', (event) => {
  console.log('[SW] Activando Service Worker versión', APP_VERSION);
  
  event.waitUntil(
    Promise.all([
      // Limpiar TODAS las cachés que no sean la versión actual
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
      // Tomar control inmediato de todas las páginas
      self.clients.claim()
    ]).then(() => {
      console.log('[SW] Service Worker activado');
      // Notificar a todos los clientes sobre la nueva versión (SIN forzar recarga)
      return self.clients.matchAll({ includeUncontrolled: true }).then((clients) => {
        clients.forEach((client) => {
          try {
            client.postMessage({
              type: 'SW_ACTIVATED',
              version: APP_VERSION
              // NO forzar recarga automáticamente para evitar bucles
            });
          } catch (err) {
            console.warn('[SW] Error notificando cliente:', err);
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

  // Ignorar requests de extensiones y chrome-extension
  if (url.protocol === 'chrome-extension:' || url.protocol === 'chrome:') {
    return;
  }

  // Para APIs: Network First (siempre obtener datos frescos)
  if (url.pathname.includes('/rest/v1/') || 
      url.pathname.includes('/functions/v1/') ||
      url.pathname.includes('/auth/v1/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Solo cachear respuestas exitosas de peticiones GET
          // No cachear POST, PUT, DELETE, etc.
          if (response.status === 200 && request.method === 'GET') {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone).catch((err) => {
                // Ignorar errores de caché (puede fallar si el request no es cacheable)
                console.warn('[SW] No se pudo cachear la respuesta:', err);
              });
            });
          }
          return response;
        })
        .catch(() => {
          // Fallback a caché solo para peticiones GET
          if (request.method === 'GET') {
            return caches.match(request).then((cachedResponse) => {
              if (cachedResponse) {
                return cachedResponse;
              }
            });
          }
          // Para POST/PUT/DELETE, devolver error de conexión
          return new Response(
            JSON.stringify({ error: 'Sin conexión' }),
            {
              headers: { 'Content-Type': 'application/json' },
              status: 503
            }
          );
        })
    );
    return;
  }

  // Para assets estáticos: Network First (siempre obtener la versión más reciente)
  if (request.destination === 'script' || 
      request.destination === 'style' ||
      request.destination === 'image' ||
      request.destination === 'font') {
    event.respondWith(
      fetch(request, { cache: 'no-cache' }) // Forzar obtener de red
        .then((response) => {
          // Solo cachear si la respuesta es exitosa
          if (response.status === 200) {
            const responseClone = response.clone();
            caches.open(STATIC_CACHE_NAME).then((cache) => {
              cache.put(request, responseClone).catch((err) => {
                console.warn('[SW] Error cacheando asset:', err);
              });
            });
          }
          return response;
        })
        .catch(() => {
          // Solo usar caché si no hay red
          return caches.match(request).then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }
            // Si no hay caché ni red, devolver error
            return new Response('Recurso no disponible', { status: 503 });
          });
        })
    );
    return;
  }

  // Para HTML: Network First (siempre obtener la última versión, sin caché)
  if (request.destination === 'document' || request.mode === 'navigate') {
    event.respondWith(
      fetch(request, { 
        cache: 'no-store', // No usar caché del navegador
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache'
        }
      })
        .then((response) => {
          // No cachear HTML para forzar siempre la última versión
          return response;
        })
        .catch(() => {
          // Fallback a caché solo si no hay red
          return caches.match(request).then((cachedResponse) => {
            return cachedResponse || new Response('Sin conexión', { status: 503 });
          });
        })
    );
    return;
  }

  // Default: Network First (sin caché)
  event.respondWith(
    fetch(request, { cache: 'no-cache' }).catch(() => {
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
          // Verificar que hay un puerto antes de enviar mensaje
          if (event.ports && event.ports[0]) {
            event.ports[0].postMessage({ success: true });
          }
          // También notificar a todos los clientes
          return self.clients.matchAll().then((clients) => {
            clients.forEach((client) => {
              try {
                client.postMessage({
                  type: 'CACHE_CLEARED',
                  success: true
                });
              } catch (err) {
                // Ignorar errores si el cliente ya no está disponible
                console.warn('[SW] No se pudo notificar al cliente:', err);
              }
            });
          });
        })
      );
      break;

    case 'GET_VERSION':
      event.ports[0].postMessage({ version: APP_VERSION });
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
          return clientList[0].focus().then((client) => {
            client.postMessage({
              type: 'FORCE_RELOAD',
              version: event.notification.data?.version
            });
            return client.navigate(event.notification.data?.url || '/');
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

