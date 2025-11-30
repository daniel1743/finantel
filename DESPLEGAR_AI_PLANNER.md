# 🚀 Desplegar Edge Function: ai-planner

## ❌ Error Actual

```
Access to fetch at 'https://yzakmqxbzwzbsdsadzej.supabase.co/functions/v1/ai-planner' 
from origin 'http://localhost:3000' has been blocked by CORS policy: 
Response to preflight request doesn't pass access control check: 
It does not have HTTP ok status.

503 (Service Unavailable)
Error: Sin conexión
```

## 🔍 Causa

La Edge Function `ai-planner` **no está desplegada** en Supabase, por eso devuelve 503.

**IMPORTANTE:** Este es el mismo problema que con `future-self-simulator`. La función existe en el código pero no está desplegada en Supabase.

## ✅ Solución: Desplegar la Edge Function

### Paso 1: Ejecutar Migración SQL (OBLIGATORIO)

La función `ai-planner` **REQUIERE** estas tablas y funciones SQL primero:

- ✅ `seasonal_events` - Eventos estacionales (Navidad, Año Nuevo, etc.)
- ✅ `ai_plans` - Tabla de planes generados
- ✅ `ai_suggestions` - Sugerencias de la IA
- ✅ `detect_upcoming_events()` - Función SQL para detectar eventos

**Ejecuta la migración:**

1. Ve a **Supabase Dashboard** → **SQL Editor**
2. Abre el archivo: `supabase/migrations/030_ai_planner_system.sql`
3. **Copia TODO el contenido**
4. **Pégalo** en SQL Editor
5. **Ejecuta el script**

⚠️ **IMPORTANTE:** Si no ejecutas esta migración primero, la Edge Function fallará aunque esté desplegada.

---

### Paso 2: Desplegar la Edge Function

**Opción A: Desde Supabase Dashboard (Recomendado)**

1. Ve a **Supabase Dashboard** → Tu proyecto
2. Ve a **Edge Functions** (menú lateral)
3. Haz clic en **"New Function"** o busca `ai-planner`
4. Si ya existe, haz clic en ella para editarla
5. Abre el archivo: `supabase/functions/ai-planner/index.ts`
6. **Copia TODO el contenido** del archivo
7. **Pégalo** en el editor de Supabase
8. Haz clic en **"Deploy"** o **"Save"**

**Opción B: Desde Terminal (Si tienes Supabase CLI)**

```bash
# Asegúrate de estar en el directorio del proyecto
cd "C:\Users\Lenovo\Downloads\finantel version 2.1 funcional"

# Desplegar la función
npx supabase functions deploy ai-planner
```

---

### Paso 3: Verificar Despliegue

1. Ve a **Edge Functions** en Supabase Dashboard
2. Verifica que `ai-planner` aparezca en la lista
3. Verifica que el estado sea **"Active"** o **"Deployed"**
4. Prueba desde tu aplicación:
   - Ve a "Planificador IA Proactivo"
   - Haz clic en "Actualizar eventos"
   - Los errores 503 y CORS deberían desaparecer

---

## 🔧 Si Aún Hay Errores

### Error: "Function not found"
- Verifica que el nombre sea exactamente `ai-planner` (con guión)
- Verifica que esté desplegada en el proyecto correcto

### Error: "Missing dependencies"
- Verifica que las tablas SQL estén creadas (`ai_plans`, `seasonal_events`, etc.)
- Ejecuta la migración `030_ai_planner_system.sql` si existe

### Error: "CORS still blocking"
- La función ya tiene headers CORS correctos
- Si persiste, verifica que la función esté respondiendo correctamente
- Revisa los logs en Supabase Dashboard → Edge Functions → `ai-planner` → Logs

---

## 📋 Checklist

- [ ] Migración SQL `030_ai_planner_system.sql` ejecutada (si existe)
- [ ] Edge Function `ai-planner` desplegada
- [ ] Estado de la función: "Active" o "Deployed"
- [ ] Probar desde la aplicación: "Actualizar eventos" funciona
- [ ] No hay errores 503 en consola
- [ ] No hay errores CORS en consola

---

## 🎯 Resultado Esperado

Después del despliegue:

- ✅ La función responde con código 200
- ✅ No hay errores CORS
- ✅ No hay errores 503
- ✅ "Actualizar eventos" funciona correctamente
- ✅ Se pueden detectar eventos y crear planes

