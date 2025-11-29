# Configuración de Google OAuth para Finantel

## Error: redirect_uri_mismatch

Este error ocurre cuando la URL de redirección configurada en el código no coincide con las URLs autorizadas en Google Cloud Console.

## Pasos para solucionar:

### 1. Configurar en Google Cloud Console

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Selecciona tu proyecto
3. Ve a **APIs & Services** → **Credentials**
4. Encuentra tu **OAuth 2.0 Client ID** (o créalo si no existe)
5. Haz clic en el cliente OAuth para editarlo
6. En **Authorized redirect URIs**, agrega las siguientes URLs:

   **Para desarrollo (localhost):**
   ```
   http://localhost:3000/auth/callback
   http://localhost:5173/auth/callback
   http://127.0.0.1:3000/auth/callback
   http://127.0.0.1:5173/auth/callback
   ```

   **Para producción:**
   ```
   https://tu-dominio.com/auth/callback
   https://www.tu-dominio.com/auth/callback
   ```

   **IMPORTANTE:** También necesitas agregar la URL de Supabase:
   ```
   https://[TU-PROJECT-ID].supabase.co/auth/v1/callback
   ```

### 2. Configurar en Supabase Dashboard

1. Ve a tu [Supabase Dashboard](https://app.supabase.com/)
2. Selecciona tu proyecto
3. Ve a **Authentication** → **URL Configuration**
4. En **Redirect URLs**, agrega:

   **Para desarrollo:**
   ```
   http://localhost:3000/auth/callback
   http://localhost:5173/auth/callback
   ```

   **Para producción:**
   ```
   https://tu-dominio.com/auth/callback
   ```

5. Guarda los cambios

### 3. Verificar la configuración de Google Provider en Supabase

1. En Supabase Dashboard, ve a **Authentication** → **Providers**
2. Haz clic en **Google**
3. Asegúrate de que esté **habilitado**
4. Verifica que el **Client ID** y **Client Secret** sean correctos
5. Estos deben ser los mismos que configuraste en Google Cloud Console

### 4. Verificar el código

El código ya está configurado para usar:
```javascript
redirectTo: `${window.location.origin}/auth/callback`
```

Esto generará automáticamente:
- `http://localhost:3000/auth/callback` en desarrollo
- `https://tu-dominio.com/auth/callback` en producción

### 5. URLs comunes según el entorno

**Vite Dev Server (puerto 5173):**
- URL: `http://localhost:5173/auth/callback`

**Vite con puerto personalizado:**
- Verifica en la consola qué puerto está usando
- Agrega esa URL a Google Cloud Console

**Producción:**
- Usa tu dominio real
- Ejemplo: `https://finantel.com/auth/callback`

## ⚠️ IMPORTANTE: URL de Supabase es la crítica

**El problema:** Google recibe el `redirect_uri` de Supabase, NO la URL de tu aplicación directamente.

En la petición a Google, verás:
- `redirect_uri=https://yzakmqxbzwzbsdsadzej.supabase.co/auth/v1/callback` ← **Esta es la que Google valida**
- `redirect_to=http://localhost:3000/auth/callback` ← Esta es solo un parámetro que Supabase usa después

**Por lo tanto, DEBES tener en Google Cloud Console:**
1. ✅ `https://yzakmqxbzwzbsdsadzej.supabase.co/auth/v1/callback` (CRÍTICO - esta es la que Google valida)
2. ✅ `http://localhost:3000/auth/callback` (opcional, pero recomendado)

## Solución rápida

Si estás en desarrollo local:

1. **Asegúrate de tener la URL de Supabase** en Google Cloud Console:
   ```
   https://yzakmqxbzwzbsdsadzej.supabase.co/auth/v1/callback
   ```
   (Reemplaza `yzakmqxbzwzbsdsadzej` con tu Project ID de Supabase)

2. **Verifica que el Client ID en Supabase coincida** con el de Google Cloud Console
3. **Espera 5-10 minutos** para que los cambios se propaguen (Google puede tardar hasta unas horas)
4. **Intenta de nuevo**

## Verificación

Para verificar qué URL está usando el código:

1. Abre la consola del navegador (F12)
2. Intenta iniciar sesión con Google
3. Busca el log: `[Auth] Iniciando sesión con Google, redirectTo: ...`
4. Copia esa URL exacta y agrégala a Google Cloud Console

## Notas importantes

- ⚠️ Las URLs son **case-sensitive** (sensibles a mayúsculas/minúsculas)
- ⚠️ Debe incluir el protocolo (`http://` o `https://`)
- ⚠️ No debe terminar con `/` (excepto si es necesario)
- ⚠️ Los cambios en Google Cloud Console pueden tardar 1-2 minutos en aplicarse
- ⚠️ Asegúrate de que el **Client ID** y **Client Secret** en Supabase coincidan con los de Google Cloud Console

