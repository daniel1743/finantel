# 🔍 DIAGNÓSTICO: Fetch No Se Envía a chat/completions

## ❌ PROBLEMA IDENTIFICADO

**Ubicación exacta del problema:**
- **Archivo:** `public/sw.js`
- **Líneas:** 148-182
- **Función:** `fetch` event listener del Service Worker

## 🔴 CAUSA RAÍZ

El Service Worker está interceptando **TODAS** las peticiones a `/functions/v1/` (incluyendo POST), pero el manejo de errores en el `catch` puede estar devolviendo un `Response` inválido o causando que la petición nunca se complete.

### Problema Específico:

```javascript:148:182:public/sw.js
// Para APIs: Network First (siempre obtener datos frescos)
if (url.pathname.includes('/rest/v1/') || 
    url.pathname.includes('/functions/v1/') ||
    url.pathname.includes('/auth/v1/')) {
  event.respondWith(
    fetch(request)
      .then((response) => {
        // Solo cachear respuestas exitosas GET (no cachear POST, PUT, DELETE)
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
      .catch(() => {
        // Fallback a caché si no hay red
        return caches.match(request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          return new Response(
            JSON.stringify({ error: 'Sin conexión' }),
            {
              headers: { 'Content-Type': 'application/json' },
              status: 503
            }
          );
        });
      })
  );
  return;
}
```

### Problemas Detectados:

1. **El `catch` devuelve un Response para POST requests**: Cuando hay un error de red, el Service Worker devuelve un Response con `{ error: 'Sin conexión' }` incluso para peticiones POST. Esto puede hacer que `supabase.functions.invoke` reciba una respuesta falsa en lugar de permitir que el error se propague.

2. **No hay validación de método HTTP**: El código no diferencia entre GET y POST en el manejo de errores. Para POST requests, NO debería devolver un Response del caché ni un Response de error genérico.

3. **El `catch` silencia errores reales**: Si hay un error de red real, el Service Worker lo convierte en un Response 503, lo que puede hacer que el código del frontend no detecte el error real.

## 🔍 VERIFICACIÓN ADICIONAL

### Archivo: `src/lib/ai-service.js`
**Líneas:** 4-23

```javascript:4:23:src/lib/ai-service.js
export const sendMessageToAI = async (messages) => {
  try {
    // Llamar a la Edge Function de Supabase (resuelve CORS y protege API keys)
    const { data, error } = await supabase.functions.invoke('ai-assistant', {
      body: { messages }
    });

    if (error) {
      console.error('AI Service Error:', error);
      return "Lo siento, estoy teniendo dificultades para conectar con mis servidores de análisis en este momento. Por favor, intenta de nuevo en unos segundos.";
    }

    // Retornar el contenido de la respuesta
    return data?.content || "Lo siento, no pude generar una respuesta. Por favor, intenta de nuevo.";

  } catch (error) {
    console.error('AI Service Error:', error);
    return "Lo siento, estoy teniendo dificultades para conectar con mis servidores de análisis en este momento. Por favor, intenta de nuevo en unos segundos.";
  }
};
```

**Análisis:**
- ✅ No hay early returns que eviten la ejecución
- ✅ El try/catch está bien estructurado
- ⚠️ **PROBLEMA**: Si `supabase.functions.invoke` falla silenciosamente (por ejemplo, si el Service Worker intercepta y devuelve un Response inválido), el error puede no propagarse correctamente.

### Archivo: `src/pages/dashboard/AIAssistant.jsx`
**Líneas:** 158-281

**Análisis:**
- ✅ No hay early returns que eviten `handleSend`
- ✅ El único guard es `if (!input.trim()) return;` que es correcto
- ✅ El try/catch maneja errores correctamente
- ⚠️ **PROBLEMA**: Si `sendMessageToAI` devuelve un string de error en lugar de lanzar una excepción, el código continúa normalmente y no se detecta el problema.

## 🎯 SOLUCIÓN PROPUESTA

### Solución 1: Corregir Service Worker para POST requests

**Archivo:** `public/sw.js`
**Líneas a modificar:** 148-182

```javascript
// Para APIs: Network First (siempre obtener datos frescos)
if (url.pathname.includes('/rest/v1/') || 
    url.pathname.includes('/functions/v1/') ||
    url.pathname.includes('/auth/v1/')) {
  
  // ⚠️ CRÍTICO: Para POST/PUT/DELETE, NO interceptar o manejar diferente
  if (request.method !== 'GET') {
    // Para métodos que modifican datos, dejar que el navegador maneje directamente
    // NO usar event.respondWith para evitar problemas con respuestas inválidas
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
          throw error;
        });
      })
  );
  return;
}
```

### Solución 2: Agregar logging detallado en ai-service.js

**Archivo:** `src/lib/ai-service.js`

```javascript
export const sendMessageToAI = async (messages) => {
  console.log('[AI Service] Iniciando llamada a Edge Function ai-assistant', {
    messagesCount: messages.length,
    timestamp: new Date().toISOString()
  });

  try {
    // Llamar a la Edge Function de Supabase (resuelve CORS y protege API keys)
    console.log('[AI Service] Invocando supabase.functions.invoke...');
    const { data, error } = await supabase.functions.invoke('ai-assistant', {
      body: { messages }
    });

    console.log('[AI Service] Respuesta recibida:', {
      hasData: !!data,
      hasError: !!error,
      errorDetails: error,
      dataKeys: data ? Object.keys(data) : null
    });

    if (error) {
      console.error('[AI Service] Error en invoke:', error);
      return "Lo siento, estoy teniendo dificultades para conectar con mis servidores de análisis en este momento. Por favor, intenta de nuevo en unos segundos.";
    }

    // Retornar el contenido de la respuesta
    const content = data?.content || "Lo siento, no pude generar una respuesta. Por favor, intenta de nuevo.";
    console.log('[AI Service] Retornando contenido:', { contentLength: content.length });
    return content;

  } catch (error) {
    console.error('[AI Service] Excepción capturada:', error);
    console.error('[AI Service] Stack trace:', error.stack);
    return "Lo siento, estoy teniendo dificultades para conectar con mis servidores de análisis en este momento. Por favor, intenta de nuevo en unos segundos.";
  }
};
```

### Solución 3: Verificar que el cliente de Supabase esté inicializado

**Archivo:** `src/lib/customSupabaseClient.js`
**Líneas:** 1-14

El código valida las variables de entorno y lanza un error si no están configuradas. Si este error se lanza, la aplicación no debería cargar. Sin embargo, si el error se captura en algún lugar, el cliente podría no estar inicializado.

**Verificación necesaria:**
- Confirmar que `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` están configuradas
- Verificar que el cliente se exporta correctamente

## 📋 CHECKLIST DE VERIFICACIÓN

1. ✅ **Service Worker intercepta peticiones POST** - PROBLEMA IDENTIFICADO
2. ✅ **Service Worker devuelve Response inválido en catch** - PROBLEMA IDENTIFICADO
3. ⚠️ **Verificar si hay errores de JS previos** - Revisar consola del navegador
4. ⚠️ **Verificar variables de entorno** - Confirmar que están configuradas
5. ⚠️ **Verificar que el cliente de Supabase esté inicializado** - Agregar logging

## 🎯 CONCLUSIÓN

**Causa más probable:** El Service Worker está interceptando las peticiones POST a `/functions/v1/ai-assistant` y, cuando hay un error de red, devuelve un Response genérico en lugar de permitir que el error se propague. Esto hace que `supabase.functions.invoke` reciba una respuesta falsa, pero el código del frontend no detecta el problema porque el Service Worker "resuelve" la petición con un Response 503.

**Solución inmediata:** Modificar el Service Worker para que NO intercepte peticiones POST/PUT/DELETE a `/functions/v1/`, permitiendo que el navegador maneje estas peticiones directamente.

**Solución a largo plazo:** Agregar logging detallado para rastrear exactamente dónde se pierde la petición.

---

## ✅ SOLUCIONES APLICADAS

### 1. Service Worker Corregido
**Archivo:** `public/sw.js`
**Líneas:** 148-182

**Cambio aplicado:**
- Agregada validación para NO interceptar peticiones POST/PUT/DELETE/PATCH
- Para métodos que modifican datos, el Service Worker ahora retorna `return;` sin usar `event.respondWith()`
- Esto permite que el navegador maneje estas peticiones directamente sin interferencia del SW

**Código corregido:**
```javascript
// ⚠️ CRÍTICO: Para POST/PUT/DELETE/PATCH, NO interceptar
if (request.method !== 'GET') {
  return; // Dejar que el navegador maneje directamente
}
```

### 2. Logging Detallado Agregado
**Archivo:** `src/lib/ai-service.js`
**Líneas:** 4-62

**Cambios aplicados:**
- Logging antes de invocar la función
- Verificación de que el cliente de Supabase esté inicializado
- Logging después de la invocación con detalles completos
- Logging de errores con stack trace completo
- Medición de tiempo de ejecución

**Beneficios:**
- Permite rastrear exactamente dónde se pierde la petición
- Identifica si el problema es antes o después del invoke
- Muestra detalles completos del error si ocurre

---

## 🧪 PRUEBAS RECOMENDADAS

1. **Limpiar Service Worker:**
   ```javascript
   // En la consola del navegador:
   navigator.serviceWorker.getRegistrations().then(registrations => {
     registrations.forEach(reg => reg.unregister());
   });
   ```

2. **Limpiar caché:**
   ```javascript
   // En la consola del navegador:
   caches.keys().then(names => {
     names.forEach(name => caches.delete(name));
   });
   ```

3. **Recargar la página** (Ctrl+Shift+R o Cmd+Shift+R)

4. **Abrir DevTools > Network** y filtrar por "ai-assistant" o "functions"

5. **Enviar un mensaje en el AI Assistant** y verificar:
   - Que aparezca la petición en Network
   - Que los logs en consola muestren el flujo completo
   - Que no haya errores de "Failed to convert value to Response"

---

## 📊 RESULTADO ESPERADO

Después de aplicar estas correcciones:

1. ✅ Las peticiones POST a `/functions/v1/ai-assistant` NO serán interceptadas por el Service Worker
2. ✅ El fetch se ejecutará normalmente y aparecerá en la pestaña Network
3. ✅ Los logs detallados mostrarán el flujo completo de la petición
4. ✅ Si hay errores, se mostrarán claramente en la consola con detalles completos

---

**Fecha de diagnóstico:** 2025-01-27
**Estado:** ✅ **SOLUCIONES APLICADAS**

