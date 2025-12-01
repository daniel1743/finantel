# 🔧 SOLUCIÓN: Error ASN.1 DER tag 0x2d

## ❌ EL ERROR QUE TENÍAS

```
"unknown/unsupported ASN.1 DER tag: 0x2d"
```

**Causa**: El código anterior no podía importar correctamente la clave privada RSA del Service Account JSON.

---

## ✅ SOLUCIÓN

He creado una **versión SIMPLIFICADA** que usa la biblioteca `jose` de Deno, que maneja correctamente las claves RSA.

**Archivo nuevo:** `CODIGO-GOOGLE-SPEECH-SIMPLIFICADO.ts`

---

## 📋 PASOS PARA ARREGLAR (5 minutos)

### Paso 1: Abre el código simplificado

```
C:\Users\Lenovo\Downloads\finantel version 2.1 funcional\CODIGO-GOOGLE-SPEECH-SIMPLIFICADO.ts
```

### Paso 2: Copia TODO el código

- Presiona `Ctrl + A` (seleccionar todo)
- Presiona `Ctrl + C` (copiar)

### Paso 3: Ve a Supabase Dashboard

```
https://supabase.com/dashboard/project/yzakmqxbzwzbsdsadzej/functions/voice-to-transaction
```

### Paso 4: Reemplaza el código

1. **Selecciona todo** el código actual en el editor
2. **Bórralo** (Delete)
3. **Pega** el nuevo código (`Ctrl + V`)
4. **Click en "Deploy"** (botón azul)
5. **Espera 30-60 segundos**

### Paso 5: Verifica los secretos

Ve a la pestaña **"Secrets"** y confirma que existan:

✅ `GOOGLE_SERVICE_ACCOUNT_JSON` - El JSON completo del Service Account
✅ `SUPABASE_URL`
✅ `SUPABASE_SERVICE_ROLE_KEY`

### Paso 6: Prueba de nuevo

1. Recarga tu app: `Ctrl + Shift + R`
2. Click en el micrófono 🎤
3. Di: **"Gasté mil pesos en Jumbo"**
4. Click para detener
5. Deberías ver: ✅ **"Gasto agregado: $1,000"**

---

## 🔍 DIFERENCIAS DEL CÓDIGO NUEVO

### ❌ CÓDIGO ANTERIOR (con error):

```typescript
// Intentaba importar la clave con crypto.subtle
const key = await crypto.subtle.importKey(
  'pkcs8',
  new TextEncoder().encode(pemKey),  // ❌ Fallaba aquí
  ...
);
```

### ✅ CÓDIGO NUEVO (funciona):

```typescript
// Usa biblioteca jose de Deno (más confiable)
const { SignJWT, importPKCS8 } = await import('https://deno.land/x/jose@v5.2.0/index.ts');

const key = await importPKCS8(privateKey, 'RS256');  // ✅ Funciona
```

---

## 🧪 CÓMO VERIFICAR QUE FUNCIONA

### Test 1: Revisa los logs

1. Ve a: Supabase Dashboard → Functions → voice-to-transaction → **Logs**
2. Haz una prueba del micrófono
3. Deberías ver:

```
✅ Audio recibido: xxxxx bytes
✅ UserId: [tu user id]
✅ Service Account cargado
🔐 Obteniendo access token...
✅ Access token obtenido          ← ✅ ESTA LÍNEA ES CLAVE
🎤 Enviando audio a Speech-to-Text...
📝 Respuesta Speech-to-Text: {...}
✅ Transcripción: Gasté mil pesos en Jumbo
🧠 Parseado: {...}
✅ Transacción creada: [id]
```

### Test 2: Si aún falla

**Revisa el formato del JSON:**

1. Ve a Supabase → Functions → voice-to-transaction → **Secrets**
2. Edita `GOOGLE_SERVICE_ACCOUNT_JSON`
3. Verifica que sea el JSON **COMPLETO** incluyendo:
   - `"type": "service_account"`
   - `"project_id": "..."`
   - `"private_key": "-----BEGIN PRIVATE KEY-----\n...-----END PRIVATE KEY-----\n"`
   - `"client_email": "..."`

4. **NO debe tener:**
   - Comillas adicionales al inicio/final
   - Caracteres extraños
   - Líneas cortadas

---

## 📊 CHECKLIST

- [ ] Código `CODIGO-GOOGLE-SPEECH-SIMPLIFICADO.ts` copiado
- [ ] Pegado en Supabase Dashboard
- [ ] Click en "Deploy" y esperado 30 segundos
- [ ] Estado: "Active" con timestamp reciente
- [ ] Los 3 secretos verificados
- [ ] App recargada (Ctrl + Shift + R)
- [ ] Micrófono probado
- [ ] Logs revisados sin error de ASN.1

---

## 🎯 RESULTADO ESPERADO

**ANTES (con error):**
```
❌ Error: unknown/unsupported ASN.1 DER tag: 0x2d
```

**DESPUÉS (funcionando):**
```
✅ Access token obtenido
✅ Transcripción: Gasté mil pesos en Jumbo
✅ Transacción creada: [id]
```

---

## 🆘 SI SIGUE FALLANDO

### Opción 1: Verifica el JSON

El JSON debe verse exactamente así (sin omitir nada):

```json
{
  "type": "service_account",
  "project_id": "tu-proyecto-123456",
  "private_key_id": "abc123...",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBg...\n-----END PRIVATE KEY-----\n",
  "client_email": "tu-service-account@tu-proyecto.iam.gserviceaccount.com",
  "client_id": "123456789",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/..."
}
```

### Opción 2: Revisa el error en logs

Si ves otro error diferente al ASN.1:
1. Copia el error COMPLETO de los logs
2. Busca la línea que dice "Error:" o "❌"
3. Ese será el nuevo problema a resolver

---

**¡Con este código simplificado debería funcionar!** 🚀
