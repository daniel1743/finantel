# 🎙️ GUÍA MANUAL COMPLETA: Google Speech-to-Text API

## 📋 QUÉ VAS A CONFIGURAR

- ✅ Google Cloud Project
- ✅ Speech-to-Text API activada
- ✅ Service Account con JSON Key
- ✅ Edge Function actualizada en Supabase
- ✅ Variables de entorno configuradas

---

## PARTE 1: CONFIGURAR GOOGLE CLOUD (10 minutos)

### Paso 1: Crear Proyecto en Google Cloud Console

1. **Ve a Google Cloud Console:**
   ```
   https://console.cloud.google.com/
   ```

2. **Inicia sesión** con tu cuenta de Google

3. **Crea un nuevo proyecto:**
   - Click en el selector de proyecto (arriba a la izquierda)
   - Click en "**Nuevo Proyecto**"
   - Nombre: `Finantel` (o el que prefieras)
   - Click en "**Crear**"
   - **Espera** que se cree el proyecto (30 segundos)

4. **Selecciona el proyecto recién creado**

### Paso 2: Activar Speech-to-Text API

1. **Ve a la página de APIs:**
   ```
   https://console.cloud.google.com/apis/library
   ```

2. **Busca "Speech-to-Text"** en el buscador

3. **Click en "Cloud Speech-to-Text API"**

4. **Click en "HABILITAR"** (botón azul)

5. **Espera** que se active (1-2 minutos)

### Paso 3: Crear Service Account

1. **Ve a IAM & Admin → Service Accounts:**
   ```
   https://console.cloud.google.com/iam-admin/serviceaccounts
   ```

2. **Click en "+ CREAR CUENTA DE SERVICIO"**

3. **Detalles de la cuenta de servicio:**
   - Nombre: `finantel-speech-to-text`
   - ID: (se genera automático)
   - Descripción: `Service Account para transcripción de voz en Finantel`
   - Click en "**CREAR Y CONTINUAR**"

4. **Otorgar permisos:**
   - En "Selecciona una función", busca: `Cloud Speech Usuario de cliente`
   - Click en el rol que aparece
   - Click en "**CONTINUAR**"

5. **Acceso de usuarios (opcional):**
   - Déjalo vacío
   - Click en "**LISTO**"

### Paso 4: Crear y Descargar JSON Key

1. **En la lista de Service Accounts:**
   - Busca tu service account recién creada
   - Click en los **3 puntos** (⋮) de la derecha
   - Selecciona "**Administrar claves**"

2. **Agregar clave:**
   - Click en "**AGREGAR CLAVE**" → "**Crear clave nueva**"
   - Tipo: **JSON**
   - Click en "**CREAR**"

3. **Se descargará un archivo JSON automáticamente**
   - Nombre parecido a: `finantel-xxxxx-xxxxxxxxxx.json`
   - **¡Guárdalo en un lugar seguro!**
   - **NO lo compartas públicamente**

4. **Abre el archivo JSON** con Notepad o VS Code
   - Verás algo como:
   ```json
   {
     "type": "service_account",
     "project_id": "finantel-xxxxx",
     "private_key_id": "...",
     "private_key": "-----BEGIN PRIVATE KEY-----\n...",
     "client_email": "finantel-speech-to-text@...",
     "client_id": "...",
     "auth_uri": "https://accounts.google.com/o/oauth2/auth",
     "token_uri": "https://oauth2.googleapis.com/token",
     ...
   }
   ```

5. **Copia TODO el contenido del JSON**
   - Selecciona todo: `Ctrl + A`
   - Copia: `Ctrl + C`
   - **Lo necesitarás en el siguiente paso**

---

## PARTE 2: CONFIGURAR SUPABASE (5 minutos)

### Paso 1: Desplegar Edge Function

1. **Abre el código actualizado:**
   ```
   C:\Users\Lenovo\Downloads\finantel version 2.1 funcional\CODIGO-GOOGLE-SPEECH-TO-TEXT.ts
   ```

2. **Copia TODO el código:**
   - `Ctrl + A` → `Ctrl + C`

3. **Ve a Supabase Dashboard:**
   ```
   https://supabase.com/dashboard/project/yzakmqxbzwzbsdsadzej/functions
   ```

4. **Edita o crea la función:**
   - Si existe `voice-to-transaction`: Click en ella
   - Si NO existe: Click en "Create a new function"
   - Nombre: `voice-to-transaction`

5. **Borra el código viejo y pega el nuevo:**
   - Borra todo: `Ctrl + A` → `Delete`
   - Pega nuevo código: `Ctrl + V`
   - Click en "**Deploy**"
   - **Espera 30-60 segundos**

### Paso 2: Configurar Secretos en Supabase

Ve a la pestaña **"Secrets"** o **"Environment Variables"** en el Dashboard.

#### Secret 1: GOOGLE_SERVICE_ACCOUNT_JSON (MUY IMPORTANTE) ⭐⭐⭐

```
Name: GOOGLE_SERVICE_ACCOUNT_JSON
Value: [PEGA TODO EL CONTENIDO DEL JSON QUE DESCARGASTE]
```

**IMPORTANTE:**
- Debe ser el JSON COMPLETO (desde `{` hasta `}`)
- Todo en una sola línea o tal cual está
- NO agregues comillas adicionales
- Ejemplo:
  ```json
  {"type":"service_account","project_id":"finantel-xxxxx","private_key_id":"...","private_key":"-----BEGIN PRIVATE KEY-----\n...-----END PRIVATE KEY-----\n",...}
  ```

**Click "Save"**

#### Secret 2: SUPABASE_URL

```
Name: SUPABASE_URL
Value: https://yzakmqxbzwzbsdsadzej.supabase.co
```

**Click "Save"**

#### Secret 3: SUPABASE_SERVICE_ROLE_KEY

```
Name: SUPABASE_SERVICE_ROLE_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl6YWttcXhiend6YnNkc2FkemVqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzkxMTMxNiwiZXhwIjoyMDc5NDg3MzE2fQ.2dxcZOhCgjewwQAC9GSfggjC9rGN1gaMhd8j9ZaY1tw
```

**Click "Save"**

#### ⚠️ Elimina secretos viejos (opcional):

Si existen, puedes eliminar:
- `OPENAI_API_KEY`
- `GEMINI_API_KEY`

---

## PARTE 3: PROBAR LA FUNCIONALIDAD (5 minutos)

### Test 1: Verifica el deployment

1. **Ve a:**
   ```
   https://supabase.com/dashboard/project/yzakmqxbzwzbsdsadzej/functions
   ```

2. **Verifica que `voice-to-transaction` tenga:**
   ```
   ✅ Active
   Last deployed: hace pocos minutos
   ```

### Test 2: Reinicia tu aplicación local

**En la terminal:**

```bash
# Detén el servidor (Ctrl + C si está corriendo)

# Reinicia
cd "C:\Users\Lenovo\Downloads\finantel version 2.1 funcional"
npm run dev
```

### Test 3: Prueba el micrófono

1. **Abre tu app:**
   ```
   http://localhost:3001/dashboard/transactions
   ```

2. **Recarga la página:**
   - Presiona: `Ctrl + Shift + R`

3. **Click en el micrófono** 🎤

4. **Permite permisos** del navegador

5. **Di claramente:**
   ```
   "Gasté mil pesos en Jumbo"
   ```

6. **Click nuevamente** para detener la grabación

7. **Deberías ver:**
   ```
   ✅ Gasto agregado: $1,000
   ```

### Test 4: Verifica en la base de datos

1. **Ve a:**
   ```
   https://supabase.com/dashboard/project/yzakmqxbzwzbsdsadzej/editor
   ```

2. **Abre la tabla `transactions`**

3. **Ordena por `created_at` descendente**

4. **La última fila debería tener:**
   ```json
   {
     "amount": 1000,
     "description": "jumbo",
     "type": "expense",
     "metadata": {
       "created_via": "voice",
       "transcript": "Gasté mil pesos en Jumbo",
       "transcription_service": "google-speech-to-text"
     }
   }
   ```

### Test 5: Revisa los logs (si hay problemas)

1. **Ve a:**
   ```
   https://supabase.com/dashboard/project/yzakmqxbzwzbsdsadzej/functions/voice-to-transaction
   ```

2. **Click en "Logs"**

3. **Haz una nueva prueba del micrófono**

4. **Busca en los logs:**
   ```
   ✅ Audio recibido. Tamaño: xxxxx bytes
   ✅ Service Account cargado. Project ID: finantel-xxxxx
   🔐 Obteniendo access token...
   ✅ Access token obtenido
   🎤 Enviando audio a Google Speech-to-Text...
   ✅ Transcripción: Gasté mil pesos en Jumbo
   🧠 Datos parseados: {...}
   ✅ Transacción creada: [id]
   ```

---

## PARTE 4: DESPLEGAR A PRODUCCIÓN (VERCEL) (Opcional)

Si vas a desplegar en Vercel, **NO necesitas hacer nada adicional** porque el archivo JSON se configura solo en Supabase Edge Functions.

Sin embargo, si quieres tener las credenciales también en el frontend:

### Opción: No configurar en Vercel
**Recomendado**: El JSON de Service Account solo debe estar en Supabase (backend), no en el frontend.

---

## ✅ CHECKLIST COMPLETO

### Google Cloud
- [ ] Proyecto creado
- [ ] Speech-to-Text API activada
- [ ] Service Account creada
- [ ] JSON Key descargado
- [ ] JSON copiado al portapapeles

### Supabase Edge Function
- [ ] Código `CODIGO-GOOGLE-SPEECH-TO-TEXT.ts` copiado
- [ ] Función `voice-to-transaction` actualizada
- [ ] Click en "Deploy" y esperado 30 segundos
- [ ] Estado: "Active"

### Secretos en Supabase
- [ ] `GOOGLE_SERVICE_ACCOUNT_JSON` agregado (JSON completo)
- [ ] `SUPABASE_URL` configurado
- [ ] `SUPABASE_SERVICE_ROLE_KEY` configurado
- [ ] Secretos viejos eliminados (opcional)

### Pruebas
- [ ] Servidor reiniciado
- [ ] App recargada (Ctrl + Shift + R)
- [ ] Micrófono probado con éxito
- [ ] Transacción visible en base de datos
- [ ] Logs revisados sin errores

---

## 🎯 COMANDOS DE VOZ QUE FUNCIONAN

| Comando | Resultado Esperado |
|---------|-------------------|
| "Gasté 50 mil en Jumbo" | $50,000 - Jumbo - Alimentación |
| "Pagué 30k en Uber" | $30,000 - Uber - Transporte |
| "Compré mil pesos en farmacia" | $1,000 - farmacia - Salud |
| "Gasté 15 mil en Starbucks" | $15,000 - Starbucks - Restaurantes |

---

## 🐛 SOLUCIÓN DE PROBLEMAS

### Error: "Falta GOOGLE_SERVICE_ACCOUNT_JSON"
**Solución:**
1. Ve a Supabase → Functions → voice-to-transaction → Secrets
2. Verifica que `GOOGLE_SERVICE_ACCOUNT_JSON` exista
3. El valor debe ser el JSON COMPLETO
4. Guarda y redeploy la función

### Error: "Error al transcribir"
**Posibles causas:**
1. JSON Key inválido o corrupto
2. Speech-to-Text API no activada
3. Service Account sin permisos

**Solución:**
1. Revisa los logs de la función
2. Verifica que el JSON esté completo
3. Confirma que la API esté activada en Google Cloud
4. Verifica los permisos del Service Account

### Error: "Access token failed"
**Solución:**
1. El formato del JSON puede estar mal
2. Verifica que no tenga caracteres extra
3. Asegúrate de que el `private_key` tenga `\n` correctos

### No detecta el monto
**Solución:**
Di el comando claramente:
```
"Gasté [monto] en [lugar]"
```

---

## 📞 SOPORTE

Si después de seguir todos los pasos sigue sin funcionar:

1. **Revisa los logs** en Supabase (paso detallado arriba)
2. **Copia el error completo** de la consola (F12)
3. **Verifica el JSON** en los secretos de Supabase
4. **Confirma la API** activada en Google Cloud

---

## 🎉 RESULTADO FINAL

```
Usuario: 🎤 "Gasté mil pesos en Jumbo"
        ↓
Frontend: Envía FormData con audio
        ↓
Edge Function: Recibe audio
        ↓
Google Speech-to-Text: Transcribe ✅
        ↓
Parser NLP: Detecta monto y comercio
        ↓
DB: Guarda transacción
        ↓
UI: ✅ "Gasto agregado: $1,000"
```

---

## 📚 FUENTES Y REFERENCIAS

- [Google Cloud Speech-to-Text Documentation](https://cloud.google.com/speech-to-text/docs)
- [Authentication Guide](https://cloud.google.com/speech-to-text/docs/authentication)
- [Service Account Setup](https://console.cloud.google.com/iam-admin/serviceaccounts)
- [Speech-to-Text API Reference](https://cloud.google.com/speech-to-text/docs/reference/rest)

---

**¡Todo listo para usar Google Speech-to-Text!** 🚀

**Tiempo estimado total: 20 minutos**
