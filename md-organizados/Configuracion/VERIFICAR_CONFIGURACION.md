# Verificación de Configuración de Google OAuth

## ✅ Checklist de Verificación

### 1. Google Cloud Console

**URLs que DEBEN estar en "Authorized redirect URIs":**

```
https://yzakmqxbzwzbsdsadzej.supabase.co/auth/v1/callback
http://localhost:3000/auth/callback
https://www.finantel.net/auth/callback
https://finantel.net/auth/callback
```

**IMPORTANTE:** La URL de Supabase (`https://yzakmqxbzwzbsdsadzej.supabase.co/auth/v1/callback`) es la **MÁS IMPORTANTE** porque es la que Google valida directamente.

### 2. Supabase Dashboard

**Authentication → URL Configuration → Redirect URLs:**
```
http://localhost:3000/auth/callback
https://www.finantel.net/auth/callback
https://finantel.net/auth/callback
```

**Authentication → Providers → Google:**
- ✅ Habilitado
- ✅ Client ID: `743459253652-0t3uumrfqnqjifvifc5j7ihvletfpeio.apps.googleusercontent.com`
- ✅ Client Secret: (debe coincidir con Google Cloud Console)

### 3. Verificar que los Client IDs coincidan

**En Google Cloud Console:**
- Client ID: `743459253652-0t3uumrfqnqjifvifc5j7ihvletfpeio.apps.googleusercontent.com`

**En Supabase Dashboard:**
- Client ID debe ser **exactamente el mismo**

### 4. Tiempo de propagación

- ⏱️ Google puede tardar **5 minutos a varias horas** en aplicar los cambios
- 🔄 Si acabas de agregar la URL, espera al menos 5-10 minutos
- 🧪 Prueba en modo incógnito para evitar caché del navegador

### 5. Verificación en la consola del navegador

Cuando hagas clic en "Iniciar sesión con Google", deberías ver en la consola:
```
🔗 URL de redirección que se usará: http://localhost:3000/auth/callback
```

Y en la petición a Supabase, el `redirect_uri` que Google valida será:
```
https://yzakmqxbzwzbsdsadzej.supabase.co/auth/v1/callback
```

## 🔍 Cómo verificar qué está pasando

1. Abre DevTools (F12) → Network tab
2. Haz clic en "Iniciar sesión con Google"
3. Busca la petición a `authorize?provider=google`
4. Mira el header `location` en la respuesta
5. Verifica que el `redirect_uri` en esa URL sea exactamente:
   ```
   https://yzakmqxbzwzbsdsadzej.supabase.co/auth/v1/callback
   ```
6. Esa URL exacta debe estar en Google Cloud Console

## 🚨 Si el error persiste después de 10 minutos

1. Verifica que el **Client ID en Supabase** sea exactamente el mismo que en Google Cloud Console
2. Verifica que el **Client Secret** también coincida
3. Intenta eliminar y volver a crear el OAuth client en Google Cloud Console
4. Asegúrate de que no haya espacios extra o caracteres especiales en las URLs
5. Prueba en modo incógnito para evitar problemas de caché

