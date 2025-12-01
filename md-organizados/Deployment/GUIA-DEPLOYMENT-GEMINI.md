# 🚀 GUÍA COMPLETA: Deployment con Gemini API

## 📋 RESUMEN DE CAMBIOS

**ANTES:** OpenAI Whisper para voz a texto
**AHORA:** Google Gemini API para voz a texto

**Ventajas:**
- ✅ API de Google (más confiable)
- ✅ Soporte nativo de audio
- ✅ Mejor precisión en español
- ✅ Más económico

---

## 🔧 PARTE 1: OBTENER API KEY DE GEMINI

### Opción A: Ya tienes la API Key
Si ya tienes tu API Key de Gemini, pégala cuando te la pidan.

### Opción B: Crear nueva API Key

1. **Ve a Google AI Studio:**
   ```
   https://makersuite.google.com/app/apikey
   ```

2. **Inicia sesión** con tu cuenta de Google

3. **Click en "Create API Key"**

4. **Selecciona un proyecto** (o crea uno nuevo)

5. **Copia la API Key** que se genera
   - Formato: `AIzaSy...` (39 caracteres)
   - **Guárdala en un lugar seguro**

---

## 📝 PARTE 2: ACTUALIZAR ARCHIVO .ENV

### Paso 1: Abre el archivo .env
```
C:\Users\Lenovo\Downloads\finantel version 2.1 funcional\.env
```

### Paso 2: Agrega la API Key de Gemini
Agrega esta línea al final del archivo:

```env
# Gemini API Key (para voz a texto)
VITE_GEMINI_API_KEY=TU_API_KEY_AQUI
```

Reemplaza `TU_API_KEY_AQUI` con tu API Key real.

### Paso 3: (Opcional) Comenta la línea de OpenAI
Ya no necesitas OpenAI Whisper, así que puedes comentarla:

```env
# OpenAI API Key (YA NO SE USA - ahora usamos Gemini)
# VITE_OPENAI_API_KEY=sk-proj-LmZeVPyQcS0VmYhraWU1aVLsZ9AKWWjV7gD_aB-1hQ
```

### Paso 4: Guarda el archivo
Presiona `Ctrl + S` para guardar.

---

## 🚀 PARTE 3: DESPLEGAR EDGE FUNCTION EN SUPABASE

### Paso 1: Abre el código de Gemini
```
C:\Users\Lenovo\Downloads\finantel version 2.1 funcional\CODIGO-GEMINI-VOZ-A-TEXTO.ts
```

### Paso 2: Copia TODO el código
- Presiona `Ctrl + A` (seleccionar todo)
- Presiona `Ctrl + C` (copiar)

### Paso 3: Ve a Supabase Dashboard
Abre en tu navegador:
```
https://supabase.com/dashboard/project/yzakmqxbzwzbsdsadzej/functions
```

### Paso 4: Edita la función voice-to-transaction

**Si ya existe:**
1. Click en `voice-to-transaction`
2. Selecciona TODO el código del editor
3. Bórralo (Delete)
4. Pega el nuevo código (`Ctrl + V`)
5. Click en **"Deploy"** (botón azul arriba)

**Si NO existe:**
1. Click en **"Create a new function"**
2. Nombre: `voice-to-transaction`
3. Pega el código (`Ctrl + V`)
4. Click en **"Deploy"**

### Paso 5: Espera el deployment
- Espera 30-60 segundos
- Deberías ver: ✅ "Successfully deployed"

---

## 🔐 PARTE 4: CONFIGURAR SECRETOS EN SUPABASE

Ve a la pestaña **"Secrets"** o **"Environment Variables"** en el Dashboard de Supabase.

### Secret 1: GEMINI_API_KEY (NUEVO) ⭐
```
Name: GEMINI_API_KEY
Value: [Tu API Key de Gemini - empieza con AIzaSy...]
```
**Click "Save"**

### Secret 2: SUPABASE_URL
```
Name: SUPABASE_URL
Value: https://yzakmqxbzwzbsdsadzej.supabase.co
```
**Click "Save"**

### Secret 3: SUPABASE_SERVICE_ROLE_KEY
```
Name: SUPABASE_SERVICE_ROLE_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl6YWttcXhiend6YnNkc2FkemVqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzkxMTMxNiwiZXhwIjoyMDc5NDg3MzE2fQ.2dxcZOhCgjewwQAC9GSfggjC9rGN1gaMhd8j9ZaY1tw
```
**Click "Save"**

### ⚠️ IMPORTANTE: Elimina OPENAI_API_KEY
Ya no la necesitas. Si existe, puedes eliminarla:
1. Busca `OPENAI_API_KEY` en la lista de secretos
2. Click en "Delete" o el ícono de basura
3. Confirma la eliminación

---

## 🧪 PARTE 5: PROBAR LA FUNCIONALIDAD

### Test 1: Verifica el deployment
1. Ve a: https://supabase.com/dashboard/project/yzakmqxbzwzbsdsadzej/functions
2. Busca: `voice-to-transaction`
3. Verifica que diga:
   ```
   ✅ Active
   Last deployed: hace pocos segundos
   ```

### Test 2: Prueba en tu aplicación

#### Paso 1: Reinicia el servidor de desarrollo
Si tu app está corriendo, deténla y reinicia:

**En la terminal:**
```bash
# Detén el servidor (Ctrl + C)
# Reinicia
cd "C:\Users\Lenovo\Downloads\finantel version 2.1 funcional"
npm run dev
```

#### Paso 2: Abre la aplicación
```
http://localhost:3001/dashboard/transactions
```

#### Paso 3: Recarga la página
Presiona `Ctrl + Shift + R` (hard refresh)

#### Paso 4: Prueba el micrófono
1. Click en el botón del micrófono 🎤
2. Permite permisos del navegador
3. Di claramente: **"Gasté mil pesos en Jumbo"**
4. Click nuevamente para detener
5. Deberías ver: ✅ **"Gasto agregado: $1,000"**

### Test 3: Verifica en la base de datos
1. Ve a: https://supabase.com/dashboard/project/yzakmqxbzwzbsdsadzej/editor
2. Abre la tabla `transactions`
3. Ordena por `created_at` descendente
4. La última fila debería tener:
   ```json
   {
     "amount": 1000,
     "description": "jumbo",
     "metadata": {
       "created_via": "voice",
       "transcript": "Gasté mil pesos en Jumbo",
       "transcription_service": "gemini"
     }
   }
   ```

### Test 4: Revisa los logs
Si algo falla:
1. Ve a: Edge Functions → voice-to-transaction → **Logs**
2. Haz una nueva prueba del micrófono
3. Busca en los logs:
   ```
   ✅ Audio recibido. Tamaño: xxxxx bytes
   ✅ Audio convertido a base64
   🎤 Enviando audio a Gemini...
   ✅ Transcripción: [tu texto]
   ✅ Transacción creada: [id]
   ```

---

## 📊 PARTE 6: ACTUALIZAR VARIABLES EN VERCEL (Producción)

Si vas a desplegar en Vercel, actualiza las variables:

### Paso 1: Ve a Vercel Dashboard
```
https://vercel.com/dashboard
```

### Paso 2: Selecciona tu proyecto
Click en el proyecto de Finantel

### Paso 3: Ve a Settings → Environment Variables

### Paso 4: Agrega VITE_GEMINI_API_KEY
```
Name: VITE_GEMINI_API_KEY
Value: [Tu API Key de Gemini]
Environment: Production, Preview, Development
```
**Click "Save"**

### Paso 5: (Opcional) Elimina VITE_OPENAI_API_KEY
Ya no la necesitas:
1. Busca `VITE_OPENAI_API_KEY`
2. Click en los 3 puntos → "Delete"
3. Confirma

### Paso 6: Redeploy
1. Ve a la pestaña "Deployments"
2. Click en los 3 puntos del último deployment
3. Click en "Redeploy"
4. Espera que termine

---

## ✅ CHECKLIST COMPLETO

### Configuración Local
- [ ] API Key de Gemini obtenida
- [ ] `.env` actualizado con `VITE_GEMINI_API_KEY`
- [ ] Línea de OpenAI comentada o eliminada
- [ ] Archivo guardado

### Supabase Edge Function
- [ ] Código `CODIGO-GEMINI-VOZ-A-TEXTO.ts` copiado
- [ ] Función `voice-to-transaction` actualizada en Dashboard
- [ ] Click en "Deploy" y esperado 30 segundos
- [ ] Estado: "Active" con timestamp reciente

### Secretos en Supabase
- [ ] `GEMINI_API_KEY` agregada
- [ ] `SUPABASE_URL` configurada
- [ ] `SUPABASE_SERVICE_ROLE_KEY` configurada
- [ ] `OPENAI_API_KEY` eliminada (opcional)

### Pruebas
- [ ] Servidor de desarrollo reiniciado
- [ ] Aplicación recargada (Ctrl + Shift + R)
- [ ] Micrófono probado con éxito
- [ ] Transacción visible en base de datos
- [ ] Logs revisados sin errores

### Producción (Vercel)
- [ ] `VITE_GEMINI_API_KEY` agregada en Vercel
- [ ] `VITE_OPENAI_API_KEY` eliminada (opcional)
- [ ] Proyecto redeployado
- [ ] Prueba en producción exitosa

---

## 🎯 COMANDOS DE VOZ QUE FUNCIONAN

Prueba con estos ejemplos:

| Comando | Resultado Esperado |
|---------|-------------------|
| "Gasté 50 mil en Jumbo" | $50,000 - Jumbo - Alimentación |
| "Pagué 30k en Uber" | $30,000 - Uber - Transporte |
| "Compré mil pesos en farmacia" | $1,000 - farmacia - Salud |
| "Gasté 15 mil en Starbucks" | $15,000 - Starbucks - Restaurantes |
| "Pagué dos mil en Metro" | $2,000 - Metro - Transporte |

---

## 🐛 SOLUCIÓN DE PROBLEMAS

### Error: "Falta GEMINI_API_KEY en secretos"
**Solución:**
1. Ve a Supabase Dashboard → Functions → voice-to-transaction → Secrets
2. Verifica que `GEMINI_API_KEY` esté configurada
3. Si no está, agrégala y guarda

### Error: "Error al transcribir con Gemini"
**Posibles causas:**
1. **API Key inválida**: Verifica que sea correcta
2. **Cuota excedida**: Revisa tu cuota en Google AI Studio
3. **Formato de audio no soportado**: Verifica que sea audio/webm

**Solución:**
1. Revisa los logs de la función en Supabase
2. Copia el error completo de Gemini
3. Verifica tu cuenta en https://makersuite.google.com/

### El micrófono no graba
**Solución:**
1. Verifica permisos del navegador
2. Usa HTTPS (o localhost)
3. Prueba con otro navegador

### No detecta el monto
**Solución:**
Di el comando en este formato:
```
"Gasté [monto] en [lugar]"
```
Ejemplos:
- ✅ "Gasté 50 mil en Jumbo"
- ✅ "Pagué 30k en Uber"
- ❌ "Compré cosas en el super" (sin monto)

---

## 📞 SOPORTE

Si después de seguir todos los pasos sigue sin funcionar:

1. **Revisa los logs** en Supabase Dashboard
2. **Copia el error completo** de la consola del navegador (F12)
3. **Verifica tu API Key** de Gemini en Google AI Studio
4. **Confirma los 3 secretos** en Supabase

---

## 🎉 RESULTADO FINAL

```
Usuario: 🎤 "Gasté mil pesos en Jumbo"
        ↓
Frontend: Envía FormData con audio.webm
        ↓
Edge Function: Recibe audio
        ↓
Gemini API: Transcribe "Gasté mil pesos en Jumbo" ✅
        ↓
Parser NLP: Detecta monto=1000, merchant="jumbo"
        ↓
Clasificador: category="Alimentación"
        ↓
DB: Inserta transacción
        ↓
UI: Toast "✅ Gasto agregado: $1,000"
```

---

**¡Todo listo para usar Gemini!** 🚀

**Tiempo estimado total: 10 minutos**
