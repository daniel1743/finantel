# 🔧 SOLUCIÓN: ERRORES DE SERVICIO DE IA

**Problema:** Errores de CORS y API keys en el servicio de IA del asistente  
**Fecha:** 2025-01-27  
**Archivos afectados:** `src/lib/ai-service.js`, `src/pages/dashboard/AIAssistant.jsx`

---

## 🚨 ERRORES IDENTIFICADOS

### Error 1: CORS Policy - DeepSeek API
```
Access to fetch at 'https://api.deepseek.com/chat/completions' from origin 'http://localhost:3000' 
has been blocked by CORS policy: Response to preflight request doesn't pass access control check: 
No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

**Causa:** 
- Las APIs de DeepSeek **NO permiten** peticiones directas desde el navegador (frontend)
- El navegador bloquea la petición por políticas de seguridad CORS
- Las API keys están expuestas en el frontend (riesgo de seguridad)

### Error 2: API Key Inválida - Qwen
```
Failed to load resource: the server responded with a status of 401 ()
{"error":{"message":"Incorrect API key provided.","type":"invalid_request_error"}}
```

**Causa:**
- La API key de Qwen está incorrecta o ha expirado
- La key hardcodeada en el código puede no ser válida

---

## ✅ SOLUCIONES

### SOLUCIÓN 1: Mover Llamadas a Supabase Edge Function (RECOMENDADO)

**Por qué:** 
- ✅ Evita problemas de CORS
- ✅ Protege las API keys (no se exponen al frontend)
- ✅ Centraliza la lógica de IA
- ✅ Permite rate limiting y caching

#### Paso 1.1: Crear Edge Function

**Archivo:** `supabase/functions/ai-assistant/index.ts` (nuevo)

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();

    // Obtener API keys desde variables de entorno de Supabase
    const DEEPSEEK_API_KEY = Deno.env.get('DEEPSEEK_API_KEY');
    const QWEN_API_KEY = Deno.env.get('QWEN_API_KEY');
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');

    // Sistema prompt (mismo que en ai-service.js)
    const SYSTEM_PROMPT = `IDENTIDAD DEL ASISTENTE

Eres "Coach Financiero", el asistente principal de Finantel.

Tu personalidad es humana, cálida, cercana y empática. Hablas como un coach-amigo con experiencia real, nunca como un robot ni como un ejecutivo bancario.

[... resto del prompt ...]`;

    const formattedMessages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...messages
    ];

    // Intentar DeepSeek primero
    if (DEEPSEEK_API_KEY) {
      try {
        const response = await fetch('https://api.deepseek.com/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
          },
          body: JSON.stringify({
            model: 'deepseek-chat',
            messages: formattedMessages,
            temperature: 0.85,
            stream: false
          })
        });

        if (response.ok) {
          const data = await response.json();
          return new Response(
            JSON.stringify({ 
              content: data.choices[0].message.content,
              model: 'deepseek-chat'
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      } catch (error) {
        console.warn('DeepSeek failed, trying fallback:', error);
      }
    }

    // Intentar Qwen como fallback
    if (QWEN_API_KEY) {
      try {
        const response = await fetch('https://dashscope-intl.aliyuncs.com/compatible-mode/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${QWEN_API_KEY}`
          },
          body: JSON.stringify({
            model: 'qwen-turbo',
            messages: formattedMessages,
            temperature: 0.85
          })
        });

        if (response.ok) {
          const data = await response.json();
          return new Response(
            JSON.stringify({ 
              content: data.choices[0].message.content,
              model: 'qwen-turbo'
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      } catch (error) {
        console.warn('Qwen failed, trying OpenAI:', error);
      }
    }

    // Intentar OpenAI como último recurso
    if (OPENAI_API_KEY) {
      try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${OPENAI_API_KEY}`
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: formattedMessages,
            temperature: 0.85
          })
        });

        if (response.ok) {
          const data = await response.json();
          return new Response(
            JSON.stringify({ 
              content: data.choices[0].message.content,
              model: 'gpt-4o-mini'
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      } catch (error) {
        console.error('All AI services failed:', error);
      }
    }

    // Fallback: mensaje de error amigable
    return new Response(
      JSON.stringify({ 
        content: "Lo siento, estoy teniendo dificultades para conectar con mis servidores de análisis en este momento. Por favor, intenta de nuevo en unos segundos.",
        model: 'fallback'
      }),
      { 
        status: 503,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in AI assistant function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
```

#### Paso 1.2: Configurar Variables de Entorno en Supabase

```bash
# En Supabase Dashboard > Project Settings > Edge Functions > Secrets

# Agregar las siguientes variables:
DEEPSEEK_API_KEY=sk-tu-api-key-real-de-deepseek
QWEN_API_KEY=sk-tu-api-key-real-de-qwen
OPENAI_API_KEY=sk-tu-api-key-real-de-openai (opcional)
```

**Cómo obtener las API keys:**

1. **DeepSeek:**
   - Ir a https://platform.deepseek.com/
   - Crear cuenta o iniciar sesión
   - Ir a API Keys
   - Crear nueva key

2. **Qwen (DashScope):**
   - Ir a https://dashscope.console.aliyun.com/
   - Crear cuenta o iniciar sesión
   - Ir a API Keys
   - Crear nueva key

3. **OpenAI (opcional):**
   - Ir a https://platform.openai.com/api-keys
   - Crear nueva key

#### Paso 1.3: Desplegar Edge Function

```bash
# Desde la raíz del proyecto
supabase functions deploy ai-assistant
```

#### Paso 1.4: Actualizar Frontend para Usar Edge Function

**Archivo:** `src/lib/ai-service.js`

**Reemplazar completamente:**

```javascript
import { supabase } from '@/lib/customSupabaseClient';

const SYSTEM_PROMPT = `IDENTIDAD DEL ASISTENTE

Eres "Coach Financiero", el asistente principal de Finantel.

[... resto del prompt sin cambios ...]`;

export const sendMessageToAI = async (messages) => {
  try {
    // Llamar a la Edge Function de Supabase
    const { data, error } = await supabase.functions.invoke('ai-assistant', {
      body: { messages }
    });

    if (error) {
      console.error('AI Service Error:', error);
      return "Lo siento, estoy teniendo dificultades para conectar con mis servidores de análisis en este momento. Por favor, intenta de nuevo en unos segundos.";
    }

    return data.content || "Lo siento, no pude generar una respuesta. Por favor, intenta de nuevo.";

  } catch (error) {
    console.error('AI Service Error:', error);
    return "Lo siento, estoy teniendo dificultades para conectar con mis servidores de análisis en este momento. Por favor, intenta de nuevo en unos segundos.";
  }
};
```

**✅ Ventajas de esta solución:**
- ✅ No más errores de CORS
- ✅ API keys protegidas
- ✅ Centralizado y fácil de mantener
- ✅ Permite agregar caching y rate limiting

---

### SOLUCIÓN 2: Usar Proxy Local (SOLO PARA DESARROLLO)

**⚠️ ADVERTENCIA:** Esta solución es solo para desarrollo local. NO usar en producción.

#### Crear Proxy con Vite

**Archivo:** `vite.config.js`

```javascript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      '/api/ai': {
        target: 'https://api.deepseek.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/ai/, '/chat/completions'),
        configure: (proxy, _options) => {
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            // Agregar API key desde variable de entorno
            const apiKey = process.env.VITE_DEEPSEEK_API_KEY;
            if (apiKey) {
              proxyReq.setHeader('Authorization', `Bearer ${apiKey}`);
            }
          });
        },
      },
    },
  },
});
```

**Actualizar `ai-service.js`:**

```javascript
// Usar el proxy en lugar de la URL directa
const response = await fetch('/api/ai', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    model: 'deepseek-chat',
    messages: formattedMessages,
    temperature: 0.85,
    stream: false
  })
});
```

**❌ Desventajas:**
- Solo funciona en desarrollo
- API keys aún expuestas en el código
- No es una solución profesional

---

### SOLUCIÓN 3: Verificar y Actualizar API Keys

Si decides mantener las llamadas directas (NO recomendado), al menos verifica las keys:

#### Paso 3.1: Verificar API Keys Actuales

**Archivo:** `src/lib/ai-service.js` (líneas 2-3)

```javascript
// ❌ ACTUAL (keys hardcodeadas - NO SEGURO)
const DEEPSEEK_API_KEY = import.meta.env.VITE_DEEPSEEK_API_KEY || 'sk-4d4cc3ac92254985b045a1881b85b12a';
const QWEN_API_KEY = import.meta.env.VITE_QWEN_API_KEY || 'sk-e6343f5b0abc42d294d2ad7f977e48a8';
```

#### Paso 3.2: Crear Archivo .env.local

**Archivo:** `.env.local` (en la raíz del proyecto)

```bash
VITE_DEEPSEEK_API_KEY=sk-tu-api-key-real-de-deepseek
VITE_QWEN_API_KEY=sk-tu-api-key-real-de-qwen
```

**⚠️ IMPORTANTE:**
- Agregar `.env.local` a `.gitignore`
- NO hacer commit de las API keys
- Usar keys reales y válidas

#### Paso 3.3: Probar las Keys

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
```

---

## 🎯 RECOMENDACIÓN FINAL

**Usar SOLUCIÓN 1 (Supabase Edge Function)** porque:

1. ✅ Resuelve el problema de CORS completamente
2. ✅ Protege las API keys (no se exponen al frontend)
3. ✅ Es la solución profesional y segura
4. ✅ Permite agregar features como caching, rate limiting, logging
5. ✅ Centraliza la lógica de IA

---

## 📋 CHECKLIST DE IMPLEMENTACIÓN

### Si eliges Solución 1 (Edge Function):

- [ ] Crear archivo `supabase/functions/ai-assistant/index.ts`
- [ ] Configurar variables de entorno en Supabase Dashboard
- [ ] Desplegar Edge Function: `supabase functions deploy ai-assistant`
- [ ] Actualizar `src/lib/ai-service.js` para usar Edge Function
- [ ] Probar que funciona en desarrollo
- [ ] Probar que funciona en producción
- [ ] Remover API keys hardcodeadas del código

### Si eliges Solución 2 (Proxy - solo desarrollo):

- [ ] Actualizar `vite.config.js` con proxy
- [ ] Actualizar `src/lib/ai-service.js` para usar proxy
- [ ] Configurar `.env.local` con API keys
- [ ] Agregar `.env.local` a `.gitignore`
- [ ] Probar que funciona

### Si eliges Solución 3 (Solo verificar keys):

- [ ] Obtener API keys válidas
- [ ] Crear `.env.local` con las keys
- [ ] Probar que las keys funcionan con curl
- [ ] Actualizar código para usar variables de entorno
- [ ] ⚠️ Recordar que esto NO resuelve CORS

---

## 🆘 TROUBLESHOOTING

### Problema: Edge Function no se despliega

**Solución:**
```bash
# Verificar que estás autenticado
supabase login

# Verificar que el proyecto está vinculado
supabase link --project-ref tu-project-ref

# Desplegar con logs
supabase functions deploy ai-assistant --debug
```

### Problema: Edge Function retorna 401

**Solución:**
- Verificar que las variables de entorno están configuradas en Supabase
- Verificar que las API keys son válidas
- Revisar logs de la Edge Function en Supabase Dashboard

### Problema: Sigue apareciendo error de CORS

**Solución:**
- Verificar que estás usando la Edge Function, no llamadas directas
- Limpiar caché del navegador
- Verificar que el código actualizado se está usando

---

## 📚 RECURSOS ADICIONALES

- [Supabase Edge Functions Docs](https://supabase.com/docs/guides/functions)
- [DeepSeek API Docs](https://platform.deepseek.com/api-docs/)
- [Qwen (DashScope) API Docs](https://help.aliyun.com/zh/model-studio/)
- [CORS Explained](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)

---

**Versión:** 1.0  
**Última actualización:** 2025-01-27

