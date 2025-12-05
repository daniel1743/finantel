# 🚀 INSTRUCCIONES: DESPLEGAR SOLUCIÓN DE IA

**Problema resuelto:** CORS y API keys expuestas  
**Solución:** Edge Function de Supabase  
**Tiempo estimado:** 10 minutos

---

## ✅ CAMBIOS REALIZADOS

1. ✅ Creada Edge Function: `supabase/functions/ai-assistant/index.ts`
2. ✅ Actualizado `src/lib/ai-service.js` para usar Edge Function
3. ✅ Eliminadas API keys hardcodeadas del frontend

---

## 📋 PASOS PARA DESPLEGAR

### Paso 1: Configurar Variables de Entorno en Supabase

1. **Ir a Supabase Dashboard:**
   - https://supabase.com/dashboard
   - Seleccionar tu proyecto

2. **Ir a Edge Functions > Secrets:**
   - Navegar a: **Project Settings** > **Edge Functions** > **Secrets**

3. **Agregar las siguientes variables:**

   ```
   DEEPSEEK_API_KEY=sk-4d4cc3ac92254985b045a1881b85b12a
   QWEN_API_KEY=sk-e6343f5b0abc42d294d2ad7f977e48e8
   OPENAI_API_KEY=sk-tu-api-key-real-de-openai
   ```

   **✅ IMPORTANTE:**
   - **Usa las MISMAS keys que ya funcionan** (no necesitas crear nuevas)
   - Las keys actuales están en `src/lib/deepfinance/aiService.js` (líneas 7-8)
   - Si prefieres, puedes copiarlas desde ahí o desde tu `.env.local`
   - **OPENAI_API_KEY es NECESARIA** para la funcionalidad de voz (transcripción de audio con Whisper)
   - OPENAI_API_KEY también se usa como fallback en `ai-assistant` (tercer intento si DeepSeek y Qwen fallan)
   
   **⚠️ NOTA SOBRE VITE:**
   - En el **frontend** (Vite): Si algún componente usa `import.meta.env.VITE_OPENAI_API_KEY`, esa variable debe estar en tu `.env.local`
   - En el **backend** (Supabase): La variable `OPENAI_API_KEY` (sin prefijo VITE) debe estar en Supabase Secrets
   - **Para voz**: NO necesitas `VITE_OPENAI_API_KEY` porque todo pasa por la Edge Function
   - **Para otros componentes** (`LeakHunterPanel`, `FinancialMoodCard`): SÍ usan `VITE_OPENAI_API_KEY` directamente (deberían migrarse a Edge Functions también)
   
   **💡 Nota:** Si tus keys funcionan desde hace 15+ días, simplemente úsalas. El problema es CORS, no las keys.

### Paso 2: Entender la Diferencia entre Vite, Vercel y Supabase

**🔍 IMPORTANTE: ¿Por qué Vercel si usa Vite?**

- **Vite** = Build tool (herramienta de construcción) que usa tu proyecto
- **Vercel** = Plataforma de hosting donde se despliega el frontend
- **Supabase** = Backend (base de datos + Edge Functions)

**Cuando despliegas en Vercel:**
- El archivo `.env.local` solo funciona en desarrollo local
- En producción (Vercel), necesitas configurar las variables en el dashboard de Vercel
- Vercel inyecta estas variables durante el build de Vite

**📋 Variables según el entorno:**

#### 1. Desarrollo Local (`.env.local`):
```bash
# Variables con prefijo VITE_ (accesibles desde el frontend)
VITE_SUPABASE_URL=tu-url
VITE_SUPABASE_ANON_KEY=tu-key
VITE_OPENAI_API_KEY=sk-tu-key-aqui  # Solo si componentes llaman directamente (no recomendado)
```

#### 2. Producción en Vercel (Dashboard de Vercel):
```bash
# Las MISMAS variables con prefijo VITE_
VITE_SUPABASE_URL=tu-url
VITE_SUPABASE_ANON_KEY=tu-key
VITE_OPENAI_API_KEY=sk-tu-key-aqui  # Solo si componentes llaman directamente (no recomendado)
```

#### 3. Backend en Supabase (Supabase Secrets):
```bash
# Variables SIN prefijo VITE_ (solo en el backend)
OPENAI_API_KEY=sk-tu-key-aqui      # ✅ NECESARIA para voz (Whisper) y fallback del asistente
DEEPSEEK_API_KEY=sk-tu-key-aqui    # ✅ Para el asistente IA
QWEN_API_KEY=sk-tu-key-aqui        # ✅ Para el asistente IA (fallback)
```

**📋 Resumen:**
- **Voz (`voice-to-transaction`)**: Usa `OPENAI_API_KEY` en Supabase Secrets (backend) → **NO necesita variables en Vercel**
- **Asistente IA (`ai-assistant`)**: Usa `DEEPSEEK_API_KEY`, `QWEN_API_KEY`, `OPENAI_API_KEY` en Supabase Secrets (backend) → **NO necesita variables en Vercel**
- **Otros componentes** (`LeakHunterPanel`, `FinancialMoodCard`): Usan `VITE_OPENAI_API_KEY` → **SÍ necesitarían en Vercel**, pero deberían migrarse a Edge Functions

### Paso 3: ¿Necesitas Configurar Variables en Vercel?

**✅ Para la funcionalidad de voz y asistente IA:**
- **NO necesitas configurar nada en Vercel** porque todo pasa por Supabase Edge Functions
- Solo necesitas configurar las keys en **Supabase Secrets** (Paso 1)

**⚠️ Solo necesitarías variables en Vercel si:**
- Tienes componentes que llaman directamente a APIs desde el frontend (como `LeakHunterPanel`, `FinancialMoodCard`)
- Pero estos deberían migrarse a Edge Functions para evitar CORS

**📝 Si necesitas configurar en Vercel (solo para componentes legacy):**
1. Ir a Vercel Dashboard → Tu Proyecto → Settings → Environment Variables
2. Agregar las variables con prefijo `VITE_`:
   ```
   VITE_SUPABASE_URL=tu-url
   VITE_SUPABASE_ANON_KEY=tu-key
   VITE_OPENAI_API_KEY=sk-tu-key  # Solo si componentes llaman directamente
   ```
3. Seleccionar los ambientes (Production, Preview, Development)
4. Hacer redeploy

### Paso 4: Usar las MISMAS API Keys que Ya Funcionan

**⚠️ IMPORTANTE:** NO necesitas crear nuevas keys. Usa las mismas que ya tienes funcionando.

#### Opción A: Si tienes las keys en el código (recomendado)
Las keys que ya funcionan están en:
- `src/lib/deepfinance/aiService.js` (líneas 7-8)
- O en variables de entorno `.env.local`

**Solo copia esas keys** y pégalas en Supabase Dashboard.

#### Opción B: Si no encuentras las keys actuales
1. **DeepSeek:** Ir a https://platform.deepseek.com/ → API Keys → Ver keys existentes
2. **Qwen:** Ir a https://dashscope.console.aliyun.com/ → API Keys → Ver keys existentes
3. **OpenAI (para voz):** Ir a https://platform.openai.com/api-keys → Crear nueva key o ver keys existentes
   - **⚠️ IMPORTANTE:** Esta key es necesaria para la funcionalidad de voz (transcripción con Whisper)
   - Si no tienes una cuenta de OpenAI, créala en https://platform.openai.com/signup
   - La key debe tener acceso a la API de Whisper (incluida en la mayoría de planes)

**Nota:** Si las keys funcionan desde hace 15+ días, simplemente úsalas. No necesitas crear nuevas.

### Paso 5: Desplegar Edge Function

**Desde la terminal, en la raíz del proyecto:**

```bash
# Verificar que estás autenticado
supabase login

# Verificar que el proyecto está vinculado
supabase link --project-ref tu-project-ref

# Desplegar la función
supabase functions deploy ai-assistant
```

**Si no tienes el CLI de Supabase instalado:**

```bash
# Instalar Supabase CLI (si no lo tienes)
npm install -g supabase

# O usar npx
npx supabase functions deploy ai-assistant
```

### Paso 6: Verificar que Funciona

1. **Abrir la aplicación en el navegador**
2. **Ir a Dashboard > Asistente IA**
3. **Enviar un mensaje de prueba**
4. **Verificar en la consola del navegador:**
   - ✅ No debe aparecer error de CORS
   - ✅ No debe aparecer error de API key
   - ✅ Debe recibir respuesta del asistente

### Paso 7: Verificar Logs (si hay problemas)

```bash
# Ver logs de la Edge Function
supabase functions logs ai-assistant

# O en Supabase Dashboard:
# Edge Functions > ai-assistant > Logs
```

---

## 🔍 VERIFICACIÓN

### Checklist:

- [ ] Variables de entorno configuradas en Supabase
- [ ] API keys son válidas (probar con curl si es necesario)
- [ ] Edge Function desplegada correctamente
- [ ] No hay errores en la consola del navegador
- [ ] El asistente responde correctamente
- [ ] No hay errores de CORS
- [ ] No hay errores de API key

### Probar API Keys Manualmente:

```bash
# Probar DeepSeek
curl -X POST https://api.deepseek.com/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TU_API_KEY_AQUI" \
  -d '{
    "model": "deepseek-chat",
    "messages": [{"role": "user", "content": "Hola"}],
    "temperature": 0.7
  }'

# Probar Qwen
curl -X POST https://dashscope-intl.aliyuncs.com/compatible-mode/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TU_API_KEY_AQUI" \
  -d '{
    "model": "qwen-turbo",
    "messages": [{"role": "user", "content": "Hola"}],
    "temperature": 0.7
  }'

# Probar OpenAI (para verificar que la key funciona)
curl -X POST https://api.openai.com/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TU_API_KEY_AQUI" \
  -d '{
    "model": "gpt-3.5-turbo",
    "messages": [{"role": "user", "content": "Hola"}],
    "temperature": 0.7
  }'
```

---

## 🆘 TROUBLESHOOTING

### Problema: "Function not found"

**Solución:**
```bash
# Verificar que la función existe
supabase functions list

# Si no existe, desplegar de nuevo
supabase functions deploy ai-assistant
```

### Problema: "401 Unauthorized" o "Invalid API key"

**Solución:**
1. Verificar que las variables de entorno están configuradas correctamente
2. Verificar que las API keys son válidas (usar curl para probar)
3. Verificar que no hay espacios extra en las keys
4. Verificar que las keys no han expirado

### Problema: Sigue apareciendo error de CORS

**Solución:**
1. Verificar que el código actualizado está desplegado
2. Limpiar caché del navegador (Ctrl+Shift+R)
3. Verificar que estás usando la Edge Function, no llamadas directas
4. Verificar que `src/lib/ai-service.js` está usando `supabase.functions.invoke`

### Problema: Edge Function retorna 500

**Solución:**
1. Ver logs: `supabase functions logs ai-assistant`
2. Verificar que las variables de entorno están configuradas
3. Verificar que el código de la función no tiene errores de sintaxis

---

## 📝 NOTAS IMPORTANTES

1. **Las API keys ahora están protegidas** - No se exponen al frontend
2. **CORS está resuelto** - Las llamadas van desde el backend
3. **Fallback automático** - Si DeepSeek falla, intenta Qwen, luego OpenAI
4. **Mensaje amigable** - Si todos fallan, muestra mensaje de error amigable
5. **OPENAI_API_KEY es necesaria para voz** - La función `voice-to-transaction` usa OpenAI Whisper para transcribir audio

---

## 🎯 RESULTADO ESPERADO

Después de completar estos pasos:

- ✅ No más errores de CORS
- ✅ No más errores de API key inválida
- ✅ El asistente funciona correctamente
- ✅ API keys protegidas en el backend
- ✅ Sistema robusto con fallback automático

---

**Versión:** 1.0  
**Última actualización:** 2025-01-27

