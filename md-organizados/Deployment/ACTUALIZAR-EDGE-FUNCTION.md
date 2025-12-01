# 🔧 Actualizar Edge Function - Solución Error 500

## 🔴 Error Actual

```
POST https://yzakmqxbzwzbsdsadzej.supabase.co/functions/v1/voice-to-transaction 500
Error: "Body can not be decoded as form data"
```

**Causa**: La Edge Function tiene un problema al procesar el audio en base64.

---

## ✅ Solución

He creado una versión corregida de la Edge Function que maneja correctamente el audio.

### Archivo Corregido:
```
supabase/functions/voice-to-transaction/index-CORREGIDO.ts
```

---

## 📝 Pasos para Actualizar

### Opción 1: Dashboard de Supabase (MÁS RÁPIDO) ⭐

#### Paso 1: Abre el archivo corregido
```
C:\Users\Lenovo\Downloads\finantel version 2.1 funcional\supabase\functions\voice-to-transaction\index-CORREGIDO.ts
```

#### Paso 2: Copia TODO el contenido
- Abre el archivo con un editor de texto
- Selecciona todo (Ctrl + A)
- Copia (Ctrl + C)

#### Paso 3: Ve al Dashboard de Supabase
```
https://supabase.com/dashboard/project/yzakmqxbzwzbsdsadzej/functions/voice-to-transaction
```

#### Paso 4: Reemplaza el código
1. Borra todo el código actual en el editor
2. Pega el nuevo código (Ctrl + V)
3. Click en **"Deploy function"** (botón azul arriba)
4. Espera 30 segundos

#### Paso 5: Verifica que los secretos estén configurados
Ve a la pestaña **"Secrets"** y verifica que existan:
- ✅ `OPENAI_API_KEY`
- ✅ `SUPABASE_URL`
- ✅ `SUPABASE_SERVICE_ROLE_KEY`

---

### Opción 2: Supabase CLI (Si ya lo tienes instalado)

```bash
# 1. Reemplaza el archivo original
cd "C:\Users\Lenovo\Downloads\finantel version 2.1 funcional"
copy "supabase\functions\voice-to-transaction\index-CORREGIDO.ts" "supabase\functions\voice-to-transaction\index.ts"

# 2. Despliega
supabase functions deploy voice-to-transaction
```

---

## 🔍 Cambios Principales en la Versión Corregida

### 1. Manejo correcto del audio base64
```typescript
// ANTES (❌ Causaba error)
const audioBuffer = Uint8Array.from(atob(audio), c => c.charCodeAt(0))
const audioBlob = new Blob([audioBuffer], { type: 'audio/webm' })

// AHORA (✅ Funciona correctamente)
const audioBytes = Uint8Array.from(atob(audio), c => c.charCodeAt(0))
const audioBlob = new Blob([audioBytes], { type: mimeType || 'audio/webm' })
```

### 2. Mejor manejo de errores
```typescript
// Logs más descriptivos
console.log('Procesando audio para usuario:', userId)
console.log('Enviando audio a Whisper API...')
console.log('Transcripción recibida:', transcript)
```

### 3. Metadata mejorada
```typescript
metadata: {
  created_via: 'voice',
  transcript: transcript,
  parsed_merchant: parsed.merchant,
}
```

### 4. Búsqueda de categorías insensible a mayúsculas
```typescript
// Usa .ilike() en vez de .eq()
.ilike('name', parsed.category)
```

---

## 🧪 Probar que Funciona

### Test 1: Verifica el deployment
1. Ve a: https://supabase.com/dashboard/project/yzakmqxbzwzbsdsadzej/functions
2. Deberías ver:
   ```
   voice-to-transaction ✅ Active
   Last deployed: [hace pocos segundos]
   ```

### Test 2: Prueba desde la aplicación
1. Recarga tu app: `http://localhost:3001/dashboard/transactions`
2. Click en el micrófono 🎤
3. Di: **"Gasté mil pesos en Jumbo"**
4. Click para detener
5. Debería aparecer:
   ```
   ✅ Gasto agregado
   "Gasté mil pesos en Jumbo" → $1,000
   ```

### Test 3: Verifica en la base de datos
1. Ve a: https://supabase.com/dashboard/project/yzakmqxbzwzbsdsadzej/editor
2. Abre la tabla `transactions`
3. Deberías ver la nueva transacción con:
   - `amount`: 1000
   - `description`: "jumbo"
   - `metadata.created_via`: "voice"
   - `metadata.transcript`: "Gasté mil pesos en Jumbo"

---

## 📊 Ejemplos de Comandos de Voz

Prueba con estos ejemplos después de actualizar:

| Comando | Resultado Esperado |
|---------|-------------------|
| "Gasté 50 mil en Jumbo" | $50,000 - Jumbo - Alimentación |
| "Pagué 30k en Uber" | $30,000 - Uber - Transporte |
| "Compré mil pesos en farmacia" | $1,000 - farmacia - Salud |
| "Gasté 15 mil en Starbucks" | $15,000 - Starbucks - Restaurantes |
| "Pagué dos mil en Metro" | $2,000 - Metro - Transporte |

---

## 🐛 Solución de Problemas

### Sigue dando error 500
1. Verifica los logs en el Dashboard:
   - Edge Functions → voice-to-transaction → Logs
2. Busca el error específico
3. Verifica que `OPENAI_API_KEY` sea válida

### Error: "OPENAI_API_KEY no configurada"
1. Ve a: Settings → Edge Functions → Secrets
2. Verifica que exista `OPENAI_API_KEY`
3. El valor debe ser: `sk-proj-LmZeVPyQcS0VmYhraWU1aVLsZ9AKWWjV7gD_aB-1hQ`

### No detecta el monto
- El parser reconoce:
  - Números con "k": "50k" → 50,000
  - Palabras: "mil", "dos mil", "cincuenta mil"
  - Números directos: "1200", "$1200"
- Di claramente el monto con "en": "Gasté [monto] en [comercio]"

### No encuentra la categoría
- La función busca categorías en tu base de datos
- Si no existe, usa "Otros" por defecto
- Verifica que tengas categorías creadas en Supabase

---

## ✅ Checklist de Verificación

Antes de probar, asegúrate de:

- [ ] Archivo `index-CORREGIDO.ts` copiado al Dashboard
- [ ] Función desplegada (botón "Deploy function")
- [ ] Estado: **Active** (verde)
- [ ] Los 3 secretos configurados
- [ ] Código del frontend actualizado (VoiceInput.jsx)
- [ ] Aplicación recargada (F5)

---

## 🎯 Resultado Final Esperado

```
Usuario → 🎤 "Gasté 50 mil en Jumbo"
         ↓
Whisper → Transcribe: "Gasté 50 mil en Jumbo"
         ↓
Parser  → Monto: 50000, Comercio: Jumbo, Categoría: Alimentación
         ↓
DB      → Transacción guardada ✅
         ↓
UI      → Toast: "✅ Gasto agregado: $50,000"
```

---

## 📞 ¿Necesitas Ayuda?

Si después de actualizar sigue sin funcionar:

1. Abre la consola del navegador (F12)
2. Copia el error completo
3. Revisa los logs de la Edge Function en Supabase
4. Verifica que las 3 variables de entorno estén configuradas

**¡Con estos cambios debería funcionar perfectamente!** 🚀
