# 🎯 Opción Alternativa: Desplegar desde Supabase Dashboard

Si no puedes instalar Supabase CLI, puedes desplegar la función manualmente desde el Dashboard de Supabase.

## 📋 Paso 1: Preparar el Código

El código de la función está en:
```
supabase/functions/future-self-simulator/index.ts
```

## 📋 Paso 2: Ir a Supabase Dashboard

1. Ve a https://supabase.com/dashboard
2. Selecciona tu proyecto: `yzakmqxbzwzbsdsadzej`
3. Ve a **Edge Functions** en el menú lateral

## 📋 Paso 3: Crear Nueva Función

1. Haz clic en **"Create a new function"** o **"New Function"**
2. Nombre: `future-self-simulator`
3. Selecciona **"Deploy from code"** o **"Create from scratch"**

## 📋 Paso 4: Copiar el Código

1. Abre el archivo `supabase/functions/future-self-simulator/index.ts`
2. Copia TODO el contenido
3. Pégalo en el editor de código de Supabase Dashboard

## 📋 Paso 5: Configurar Variables de Entorno (Opcional)

En la sección **Settings** o **Environment Variables**, agrega:

- `SUPABASE_URL` - Ya está configurado automáticamente
- `SUPABASE_SERVICE_ROLE_KEY` - Ya está configurado automáticamente
- `DEEPSEEK_API_KEY` - (Opcional) Para usar IA DeepSeek
- `OPENAI_API_KEY` - (Opcional) Para usar OpenAI
- `QWEN_API_KEY` - (Opcional) Para usar Qwen AI

## 📋 Paso 6: Desplegar

1. Haz clic en **"Deploy"** o **"Save"**
2. Espera a que termine el despliegue
3. Verifica que aparezca en la lista de funciones

## 📋 Paso 7: Verificar Migración SQL

**IMPORTANTE:** Antes de usar la función, asegúrate de ejecutar la migración SQL:

1. Ve a **SQL Editor** en Supabase Dashboard
2. Abre el archivo: `supabase/migrations/044_future_self_simulator.sql`
3. Copia TODO el contenido
4. Pégalo en el SQL Editor
5. Ejecuta el script

Esto creará:
- ✅ Tabla `future_self_scenarios`
- ✅ Tabla `future_self_simulation_history`
- ✅ Función SQL `calculate_user_financial_metrics`
- ✅ Función SQL `calculate_scenario_projection`
- ✅ Políticas RLS necesarias

## ✅ Verificar que Funciona

1. Ve a **Edge Functions** → `future-self-simulator`
2. Ve a la pestaña **Logs**
3. Intenta usar el Simulador de Futuro desde tu aplicación
4. Revisa los logs para ver si hay errores

## ❌ Si Hay Errores

### Error: "calculate_user_financial_metrics does not exist"
→ Ejecuta la migración SQL 044

### Error: "future_self_scenarios table does not exist"
→ Ejecuta la migración SQL 044

### Error: 503 Service Unavailable
→ Revisa los logs en Supabase Dashboard para ver el error específico

---

## 🎉 ¡Listo!

Una vez completado, la función debería estar disponible y funcionando.

