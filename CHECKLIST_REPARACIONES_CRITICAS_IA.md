# ✅ CHECKLIST: REPARACIONES CRÍTICAS DEL SISTEMA DE IA
## Opción 1: Correcciones Críticas (Prioridad ALTA)

**Fecha de Inicio:** 2025-01-27  
**Estado:** 🟡 En Progreso  
**Tiempo Estimado Total:** ~1 hora

---

## 📋 RESUMEN DE TAREAS

| # | Tarea | Estado | Verificado | Commit |
|---|-------|--------|------------|--------|
| 1 | Migrar DeepFinance Engine a Edge Function | ⏳ Pendiente | ❌ | - |
| 2 | Agregar validación de API keys | ⏳ Pendiente | ❌ | - |
| 3 | Agregar timeout en peticiones | ⏳ Pendiente | ❌ | - |

---

## 🔧 TAREA 1: MIGRAR DEEPFINANCE ENGINE A EDGE FUNCTION

### 📝 Descripción
Migrar las llamadas directas a APIs de DeepSeek/Qwen desde el frontend (`src/lib/deepfinance/aiService.js`) a una Edge Function de Supabase para resolver problemas de CORS y seguridad.

### 🎯 Objetivos
- ✅ Eliminar llamadas directas desde el frontend
- ✅ Proteger API keys en Supabase Secrets
- ✅ Resolver problemas de CORS
- ✅ Mantener funcionalidad existente

### 📦 Archivos a Crear/Modificar

#### 1.1 Crear Edge Function `deepfinance-ai`
- [ ] **Archivo:** `supabase/functions/deepfinance-ai/index.ts`
- [ ] **Acciones:**
  - [ ] Crear estructura básica de Edge Function
  - [ ] Implementar CORS headers
  - [ ] Obtener API keys desde `Deno.env`
  - [ ] Implementar llamada a DeepSeek API
  - [ ] Implementar fallback a Qwen API
  - [ ] Manejar errores apropiadamente
  - [ ] Retornar respuesta en formato JSON
- [ ] **Verificación:**
  - [ ] La función compila sin errores
  - [ ] CORS headers están correctos
  - [ ] Maneja errores de API keys faltantes
  - [ ] Fallback funciona correctamente
- [ ] **Commit:** `feat: crear Edge Function deepfinance-ai`

#### 1.2 Copiar System Prompt
- [ ] **Archivo:** `supabase/functions/deepfinance-ai/index.ts`
- [ ] **Acciones:**
  - [ ] Copiar `DEEPFINANCE_SYSTEM_PROMPT` desde `src/lib/deepfinance/aiService.js`
  - [ ] Asegurar que el prompt esté completo
- [ ] **Verificación:**
  - [ ] El prompt está completo y correcto
- [ ] **Commit:** (Incluido en 1.1)

#### 1.3 Actualizar `aiService.js` para usar Edge Function
- [ ] **Archivo:** `src/lib/deepfinance/aiService.js`
- [ ] **Acciones:**
  - [ ] Importar `supabase` client
  - [ ] Modificar función `callAI()` para usar `supabase.functions.invoke`
  - [ ] Remover llamadas directas a `fetch()`
  - [ ] Remover constantes `DEEPSEEK_API_KEY` y `QWEN_API_KEY`
  - [ ] Mantener estructura de respuesta compatible
  - [ ] Agregar manejo de errores mejorado
- [ ] **Verificación:**
  - [ ] No hay llamadas directas a APIs
  - [ ] No hay API keys en el código
  - [ ] La función `callAI()` funciona correctamente
  - [ ] Los errores se manejan apropiadamente
- [ ] **Commit:** `refactor: migrar DeepFinance a Edge Function`

#### 1.4 Configurar API Keys en Supabase Secrets
- [ ] **Acciones Manuales:**
  - [ ] Ir a Supabase Dashboard → Project Settings → Edge Functions → Secrets
  - [ ] Agregar `DEEPSEEK_API_KEY` (si no existe)
  - [ ] Agregar `QWEN_API_KEY` (si no existe)
  - [ ] Verificar que las keys son válidas
- [ ] **Verificación:**
  - [ ] Las keys están configuradas en Supabase
  - [ ] Las keys son válidas (probar con curl si es necesario)
- [ ] **Commit:** (No aplica - configuración manual)

#### 1.5 Desplegar Edge Function
- [ ] **Acciones:**
  - [ ] Verificar que estás autenticado: `supabase login`
  - [ ] Verificar proyecto vinculado: `supabase link --project-ref [tu-ref]`
  - [ ] Desplegar función: `supabase functions deploy deepfinance-ai`
  - [ ] Verificar logs: `supabase functions logs deepfinance-ai`
- [ ] **Verificación:**
  - [ ] La función se desplegó sin errores
  - [ ] Los logs muestran que la función está activa
- [ ] **Commit:** (No aplica - despliegue)

#### 1.6 Probar Funcionalidad Completa
- [ ] **Acciones:**
  - [ ] Abrir aplicación en navegador
  - [ ] Navegar a sección que usa DeepFinance Engine
  - [ ] Ejecutar análisis financiero
  - [ ] Verificar que funciona correctamente
  - [ ] Verificar consola del navegador (no debe haber errores de CORS)
  - [ ] Verificar que se reciben respuestas de IA
- [ ] **Verificación:**
  - [ ] ✅ Funcionalidad funciona correctamente
  - [ ] ✅ No hay errores de CORS en consola
  - [ ] ✅ No hay errores de API keys
  - [ ] ✅ Las respuestas de IA son correctas
- [ ] **Commit:** `test: verificar migración DeepFinance a Edge Function`

### 📊 Estado de Tarea 1
- **Progreso:** 0/6 pasos completados
- **Estado:** ⏳ Pendiente
- **Última Actualización:** -

---

## 🔧 TAREA 2: AGREGAR VALIDACIÓN DE API KEYS

### 📝 Descripción
Agregar validación temprana de API keys en las Edge Functions para detectar problemas de configuración antes de intentar llamar a los servicios.

### 🎯 Objetivos
- ✅ Detectar keys faltantes antes de intentar usarlas
- ✅ Mensajes de error claros y útiles
- ✅ Logs informativos para debugging
- ✅ Prevenir intentos innecesarios cuando no hay keys

### 📦 Archivos a Modificar

#### 2.1 Validar API Keys en `ai-assistant`
- [ ] **Archivo:** `supabase/functions/ai-assistant/index.ts`
- [ ] **Acciones:**
  - [ ] Agregar validación al inicio de la función
  - [ ] Verificar que al menos una key existe
  - [ ] Retornar error claro si ninguna key está configurada
  - [ ] Agregar logs informativos
- [ ] **Código a Agregar:**
  ```typescript
  // Validar que al menos una API key existe
  if (!DEEPSEEK_API_KEY && !QWEN_API_KEY && !OPENAI_API_KEY) {
    console.error('[CRITICAL] No API keys configured');
    return new Response(
      JSON.stringify({ 
        error: 'No AI services configured',
        content: "Lo siento, el servicio de IA no está configurado correctamente. " +
                  "Por favor, contacta al soporte."
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
  ```
- [ ] **Verificación:**
  - [ ] La validación funciona correctamente
  - [ ] El mensaje de error es claro
  - [ ] Los logs son informativos
- [ ] **Commit:** `feat: agregar validación de API keys en ai-assistant`

#### 2.2 Validar API Keys en `deepfinance-ai` (si se crea)
- [ ] **Archivo:** `supabase/functions/deepfinance-ai/index.ts`
- [ ] **Acciones:**
  - [ ] Agregar validación similar a `ai-assistant`
  - [ ] Verificar que al menos una key existe
  - [ ] Retornar error claro si ninguna key está configurada
- [ ] **Verificación:**
  - [ ] La validación funciona correctamente
  - [ ] El mensaje de error es claro
- [ ] **Commit:** `feat: agregar validación de API keys en deepfinance-ai`

#### 2.3 Validar API Keys en `voice-to-transaction`
- [ ] **Archivo:** `supabase/functions/voice-to-transaction/index.ts`
- [ ] **Acciones:**
  - [ ] Verificar que `OPENAI_API_KEY` existe
  - [ ] Retornar error claro si falta
  - [ ] Agregar logs informativos
- [ ] **Verificación:**
  - [ ] La validación funciona correctamente
  - [ ] El mensaje de error es claro
- [ ] **Commit:** `feat: agregar validación de API keys en voice-to-transaction`

#### 2.4 Probar Validación
- [ ] **Acciones:**
  - [ ] Temporalmente remover una API key de Supabase Secrets
  - [ ] Intentar usar el servicio
  - [ ] Verificar que se muestra mensaje de error claro
  - [ ] Restaurar la API key
  - [ ] Verificar que funciona correctamente
- [ ] **Verificación:**
  - [ ] ✅ La validación detecta keys faltantes
  - [ ] ✅ El mensaje de error es útil
  - [ ] ✅ El servicio funciona cuando las keys están presentes
- [ ] **Commit:** `test: verificar validación de API keys`

### 📊 Estado de Tarea 2
- **Progreso:** 0/4 pasos completados
- **Estado:** ⏳ Pendiente
- **Última Actualización:** -

---

## 🔧 TAREA 3: AGREGAR TIMEOUT EN PETICIONES

### 📝 Descripción
Agregar timeout de 30 segundos en las peticiones a Edge Functions para evitar que se queden colgadas indefinidamente.

### 🎯 Objetivos
- ✅ Prevenir peticiones que nunca responden
- ✅ Mensajes claros cuando hay timeout
- ✅ Mejor experiencia de usuario
- ✅ Liberar recursos del servidor

### 📦 Archivos a Modificar

#### 3.1 Agregar Timeout en `ai-service.js`
- [ ] **Archivo:** `src/lib/ai-service.js`
- [ ] **Acciones:**
  - [ ] Implementar `AbortController` con timeout de 30s
  - [ ] Pasar `signal` a `supabase.functions.invoke`
  - [ ] Manejar error de timeout específicamente
  - [ ] Mensaje claro al usuario cuando hay timeout
  - [ ] Limpiar timeout si la petición completa antes
- [ ] **Código a Agregar:**
  ```javascript
  export const sendMessageToAI = async (messages) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s
    
    try {
      const { data, error } = await supabase.functions.invoke('ai-assistant', {
        body: { messages },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (error) {
        if (error.name === 'AbortError') {
          return "La petición tardó demasiado. Por favor, intenta de nuevo.";
        }
        // ... resto del manejo de errores
      }
      
      return data?.content || "Lo siento, no pude generar una respuesta.";
      
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error.name === 'AbortError') {
        return "La petición tardó demasiado. Por favor, intenta de nuevo.";
      }
      
      return "Lo siento, estoy teniendo dificultades para conectar...";
    }
  };
  ```
- [ ] **Verificación:**
  - [ ] El timeout funciona correctamente
  - [ ] El mensaje de error es claro
  - [ ] El timeout se limpia si la petición completa antes
  - [ ] No hay memory leaks
- [ ] **Commit:** `feat: agregar timeout de 30s en ai-service`

#### 3.2 Agregar Timeout en `deepfinance/aiService.js`
- [ ] **Archivo:** `src/lib/deepfinance/aiService.js`
- [ ] **Acciones:**
  - [ ] Implementar timeout similar a `ai-service.js`
  - [ ] Aplicar a la llamada a Edge Function
  - [ ] Manejar errores de timeout
- [ ] **Verificación:**
  - [ ] El timeout funciona correctamente
  - [ ] El mensaje de error es claro
- [ ] **Commit:** `feat: agregar timeout en deepfinance aiService`

#### 3.3 Verificar Timeout en `useAIPlanner.js`
- [ ] **Archivo:** `src/hooks/useAIPlanner.js`
- [ ] **Acciones:**
  - [ ] Revisar si ya tiene timeout implementado
  - [ ] Si no, agregar timeout similar
  - [ ] Verificar que funciona correctamente
- [ ] **Verificación:**
  - [ ] El timeout está implementado (o no es necesario)
  - [ ] Funciona correctamente
- [ ] **Commit:** `feat: agregar timeout en useAIPlanner` (si aplica)

#### 3.4 Probar Timeout
- [ ] **Acciones:**
  - [ ] Simular timeout (reducir tiempo a 1s para prueba)
  - [ ] Verificar que se muestra mensaje de error
  - [ ] Restaurar timeout a 30s
  - [ ] Verificar que peticiones normales funcionan
- [ ] **Verificación:**
  - [ ] ✅ El timeout se activa correctamente
  - [ ] ✅ El mensaje de error es claro
  - [ ] ✅ Las peticiones normales no se ven afectadas
- [ ] **Commit:** `test: verificar timeout en peticiones de IA`

### 📊 Estado de Tarea 3
- **Progreso:** 0/4 pasos completados
- **Estado:** ⏳ Pendiente
- **Última Actualización:** -

---

## 📝 NOTAS DE IMPLEMENTACIÓN

### Orden Recomendado de Ejecución
1. **Primero:** Tarea 1 (Migrar DeepFinance) - Es la más crítica
2. **Segundo:** Tarea 2 (Validación de Keys) - Ayuda a detectar problemas
3. **Tercero:** Tarea 3 (Timeout) - Mejora la experiencia

### Verificación Final
Después de completar las 3 tareas, verificar:
- [ ] ✅ No hay errores de CORS en consola
- [ ] ✅ No hay API keys expuestas en el frontend
- [ ] ✅ Todas las funcionalidades de IA funcionan
- [ ] ✅ Los mensajes de error son claros y útiles
- [ ] ✅ Los timeouts funcionan correctamente
- [ ] ✅ Las validaciones detectan problemas de configuración

### Comandos Útiles

```bash
# Verificar autenticación
supabase login

# Verificar proyecto vinculado
supabase link --project-ref [tu-project-ref]

# Desplegar Edge Function
supabase functions deploy deepfinance-ai

# Ver logs de Edge Function
supabase functions logs deepfinance-ai

# Ver logs en tiempo real
supabase functions logs deepfinance-ai --follow
```

---

## 🎯 PROGRESO GENERAL

- **Tareas Completadas:** 0/3
- **Pasos Completados:** 0/14
- **Estado General:** ⏳ Pendiente de Inicio

---

## 📅 HISTORIAL DE CAMBIOS

| Fecha | Tarea | Acción | Commit | Verificado Por |
|-------|-------|--------|--------|----------------|
| - | - | - | - | - |

---

**Última Actualización:** 2025-01-27  
**Próximo Paso:** Iniciar Tarea 1 - Migrar DeepFinance Engine

