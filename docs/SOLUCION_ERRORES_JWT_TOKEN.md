# 🔧 SOLUCIÓN DE ERRORES: JWT Token Expirado y Conexiones

## 📋 Errores Identificados

### 1. **InvalidJWTToken: Invalid value for JWT claim "exp"**
```
Uncaught (in promise) InvalidJWTToken: Invalid value for JWT claim "exp" with value 1764163254
```

**Causa:**
- El token JWT de Supabase ha expirado
- No hay manejo automático de refresh de tokens
- El cliente no detecta cuando el token está próximo a expirar

### 2. **WebSocket Connection Failed**
```
WebSocket connection to 'wss://yzakmqxbzwzbsdsadzej.supabase.co/realtime/v1/websocket?...' failed
```

**Causa:**
- La conexión WebSocket falla porque el token JWT está expirado
- Supabase Realtime requiere un token válido para establecer la conexión

### 3. **Vite Dev Server Connection Lost**
```
[vite] server connection lost. polling for restart...
Failed to load resource: net::ERR_CONNECTION_REFUSED
```

**Causa:**
- El servidor de desarrollo de Vite (`localhost:3000`) se detuvo o perdió la conexión
- Esto impide cargar módulos dinámicamente (lazy loading)

### 4. **Failed to Fetch Dynamically Imported Module**
```
Failed to fetch dynamically imported module: http://localhost:3000/src/pages/dashboard/Profile.jsx
```

**Causa:**
- El servidor de desarrollo no está corriendo
- Los módulos lazy-loaded no pueden cargarse

---

## ✅ Soluciones Implementadas

### 1. **Refresh Automático de Tokens**

**Archivo:** `src/contexts/SupabaseAuthContext.jsx`

**Cambios:**
- ✅ Agregada función `refreshSession()` para refrescar tokens automáticamente
- ✅ Manejo de errores cuando el token está expirado
- ✅ Refresh automático cada 55 minutos (los tokens duran 1 hora)
- ✅ Detección de eventos de autenticación (`TOKEN_REFRESHED`, `SIGNED_OUT`, etc.)
- ✅ Manejo de errores mejorado en `signIn()`

**Código Clave:**
```javascript
// Función para refrescar el token automáticamente
const refreshSession = useCallback(async () => {
  try {
    const { data: { session }, error } = await supabase.auth.refreshSession();
    if (error) {
      // Si el refresh falla, limpiar la sesión
      if (error.message?.includes('exp') || error.message?.includes('Invalid')) {
        await supabase.auth.signOut();
        handleSession(null);
        toast({
          variant: "destructive",
          title: "Sesión Expirada",
          description: "Por favor, inicia sesión nuevamente.",
        });
      }
      return;
    }
    handleSession(session);
  } catch (err) {
    console.error('Error in refreshSession:', err);
    handleSession(null);
  }
}, [handleSession, toast]);

// Refresh automático cada 55 minutos
const refreshInterval = setInterval(() => {
  if (session) {
    refreshSession();
  }
}, 55 * 60 * 1000); // 55 minutos
```

### 2. **Configuración Mejorada del Cliente Supabase**

**Archivo:** `src/lib/customSupabaseClient.js`

**Cambios:**
- ✅ `autoRefreshToken: true` - Refrescar tokens automáticamente
- ✅ `persistSession: true` - Persistir sesión en localStorage
- ✅ `detectSessionInUrl: true` - Detectar sesión en URL (para callbacks)
- ✅ `flowType: 'pkce'` - Usar PKCE flow para mejor seguridad
- ✅ Interceptor para eventos de autenticación

**Código Clave:**
```javascript
const customSupabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true, // Refrescar tokens automáticamente
    persistSession: true, // Persistir sesión en localStorage
    detectSessionInUrl: true, // Detectar sesión en URL
    storage: window.localStorage, // Usar localStorage
    flowType: 'pkce', // Usar PKCE flow
  },
  realtime: {
    params: {
      eventsPerSecond: 10, // Limitar eventos por segundo
    },
  },
});
```

### 3. **Verificación de Sesión en ProtectedRoute**

**Archivo:** `src/components/ProtectedRoute.jsx`

**Cambios:**
- ✅ Verificación automática de expiración del token
- ✅ Refresh proactivo si el token expira en menos de 5 minutos
- ✅ Manejo de errores mejorado
- ✅ Mensaje de carga más informativo

**Código Clave:**
```javascript
useEffect(() => {
  const checkSession = async () => {
    if (session) {
      try {
        // Verificar si el token está expirado
        const expiresAt = session.expires_at;
        const now = Math.floor(Date.now() / 1000);
        
        // Si el token expira en menos de 5 minutos, refrescarlo
        if (expiresAt && (expiresAt - now) < 300) {
          console.log('🔄 Token próximo a expirar, refrescando...');
          const { data, error } = await supabase.auth.refreshSession();
          if (error) {
            console.error('Error refreshing session:', error);
          }
        }
      } catch (err) {
        console.error('Error checking session:', err);
      }
    }
  };

  if (!loading && session) {
    checkSession();
  }
}, [session, loading]);
```

---

## 🚀 Cómo Resolver los Errores

### Paso 1: Reiniciar el Servidor de Desarrollo

```bash
# Detener el servidor actual (Ctrl+C)
# Luego reiniciar:
npm run dev
# o
vite
```

### Paso 2: Limpiar el LocalStorage (Si el Token Está Corrupto)

1. Abre las DevTools del navegador (F12)
2. Ve a la pestaña "Application" o "Aplicación"
3. En el menú lateral, selecciona "Local Storage"
4. Busca la entrada de tu dominio (ej: `http://localhost:3000`)
5. Elimina todas las entradas relacionadas con Supabase (busca `sb-` o `supabase`)
6. Recarga la página (F5)

### Paso 3: Cerrar Sesión y Volver a Iniciar

Si el token está completamente expirado:

1. Ve a `/auth`
2. Cierra sesión si estás logueado
3. Inicia sesión nuevamente con tus credenciales

### Paso 4: Verificar Variables de Entorno

Asegúrate de que tu archivo `.env` tenga las variables correctas:

```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu_anon_key_aqui
```

---

## 🔍 Verificación de la Solución

### Verificar que el Refresh Funciona

1. Abre las DevTools (F12)
2. Ve a la pestaña "Console"
3. Busca mensajes como:
   - `✅ Token refrescado exitosamente`
   - `🔄 Token próximo a expirar, refrescando...`
   - `Auth state changed: TOKEN_REFRESHED`

### Verificar la Sesión

En la consola del navegador, ejecuta:

```javascript
// Verificar la sesión actual
const { data: { session } } = await supabase.auth.getSession();
console.log('Sesión:', session);
console.log('Expira en:', new Date(session.expires_at * 1000));
```

### Verificar el Cliente Supabase

```javascript
// Verificar configuración del cliente
console.log('Auto refresh:', supabase.auth.autoRefreshToken);
console.log('Persist session:', supabase.auth.persistSession);
```

---

## 📊 Flujo de Refresh Automático

```
1. Usuario inicia sesión
   ↓
2. Token JWT se guarda (expira en 1 hora)
   ↓
3. Cada 55 minutos → Refresh automático
   ↓
4. Si el token expira en < 5 minutos → Refresh proactivo
   ↓
5. Si el refresh falla → Cerrar sesión y redirigir a /auth
```

---

## ⚠️ Errores Comunes y Soluciones

### Error: "InvalidJWTToken" después de implementar la solución

**Solución:**
1. Limpia el localStorage completamente
2. Cierra todas las pestañas del navegador
3. Reinicia el servidor de desarrollo
4. Inicia sesión nuevamente

### Error: "WebSocket connection failed" persistente

**Solución:**
1. Verifica que el token no esté expirado
2. Verifica tu conexión a internet
3. Verifica que Supabase Realtime esté habilitado en tu proyecto
4. Intenta refrescar la página (F5)

### Error: "ERR_CONNECTION_REFUSED" en localhost:3000

**Solución:**
1. Asegúrate de que el servidor de desarrollo esté corriendo
2. Verifica que el puerto 3000 no esté ocupado por otro proceso
3. Reinicia el servidor con `npm run dev`

---

## 🎯 Mejoras Futuras Recomendadas

1. **Error Boundary para Tokens Expirados**
   - Crear un componente ErrorBoundary que capture errores de autenticación
   - Mostrar un mensaje amigable cuando el token expire

2. **Notificación de Sesión Próxima a Expirar**
   - Mostrar un toast 5 minutos antes de que expire
   - Permitir al usuario refrescar manualmente

3. **Retry Logic para WebSocket**
   - Implementar reintentos automáticos si la conexión WebSocket falla
   - Backoff exponencial para evitar spam de conexiones

4. **Métricas de Sesión**
   - Trackear cuántas veces se refresca el token
   - Monitorear errores de autenticación

---

## 📝 Notas Técnicas

### Duración de Tokens Supabase

- **Access Token:** 1 hora (3600 segundos)
- **Refresh Token:** Variable (depende de la configuración)
- **Refresh Automático:** Cada 55 minutos (5 minutos antes de expirar)

### Eventos de Autenticación

- `SIGNED_IN` - Usuario inició sesión
- `SIGNED_OUT` - Usuario cerró sesión
- `TOKEN_REFRESHED` - Token fue refrescado
- `USER_UPDATED` - Información del usuario fue actualizada
- `PASSWORD_RECOVERY` - Recuperación de contraseña iniciada

---

## ✅ Checklist de Verificación

- [x] Refresh automático de tokens implementado
- [x] Manejo de errores de token expirado
- [x] Configuración mejorada del cliente Supabase
- [x] Verificación proactiva de expiración
- [x] Mensajes de error amigables
- [x] Logging para debugging
- [ ] Error Boundary para autenticación (pendiente)
- [ ] Notificación de sesión próxima a expirar (pendiente)
- [ ] Retry logic para WebSocket (pendiente)

---

*Última actualización: 26 de Enero 2025*


