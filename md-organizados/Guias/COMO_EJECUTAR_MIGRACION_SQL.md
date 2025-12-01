# ✅ Cómo Ejecutar la Migración SQL Correctamente

## ⚠️ ERROR COMÚN

Si ves este error:
```
ERROR: 42601: error de sintaxis en o cerca de "React"
LÍNEA 1: import React, { useState } from 'react';
```

**Significa que estás ejecutando código JavaScript/React en lugar de SQL.**

---

## ✅ SOLUCIÓN: Pasos Correctos

### Opción 1: Desde Supabase Dashboard (Recomendado)

1. **Abre tu proyecto en Supabase Dashboard**
   - Ve a: https://app.supabase.com
   - Selecciona tu proyecto

2. **Abre el SQL Editor**
   - En el menú lateral, haz clic en **"SQL Editor"**
   - Haz clic en **"New query"**

3. **Copia SOLO el contenido SQL**
   - Abre el archivo: `supabase/migrations/045_mercado_pago_integration_CLEAN.sql`
   - **IMPORTANTE:** Copia TODO el contenido del archivo SQL
   - **NO copies** código de archivos `.jsx`, `.ts`, o `.js`

4. **Pega en el SQL Editor**
   - Pega el contenido SQL en el editor
   - Verifica que empiece con `--` (comentarios SQL) o `CREATE TABLE`
   - **NO debe empezar con** `import React` o `import { ... }`

5. **Ejecuta la consulta**
   - Haz clic en **"Run"** o presiona `Ctrl+Enter` (Windows) / `Cmd+Enter` (Mac)
   - Espera a que termine la ejecución

6. **Verifica que funcionó**
   - Deberías ver un mensaje de éxito
   - Si hay errores, revisa el mensaje específico

---

### Opción 2: Desde CLI de Supabase

```bash
# 1. Asegúrate de estar enlazado a tu proyecto
supabase link --project-ref tu-project-ref

# 2. Aplica la migración
supabase db push

# O ejecuta el archivo específico
psql -h tu-host -U postgres -d postgres -f supabase/migrations/045_mercado_pago_integration_CLEAN.sql
```

---

## 🔍 CÓMO VERIFICAR QUE ES SQL VÁLIDO

Antes de ejecutar, verifica que el contenido:

✅ **DEBE empezar con:**
```sql
-- =====================================================
-- MIGRACIÓN: INTEGRACIÓN MERCADO PAGO
-- =====================================================
```

O:
```sql
CREATE TABLE IF NOT EXISTS public.billing_plans (
```

❌ **NO debe empezar con:**
```javascript
import React, { useState } from 'react';
```

O:
```typescript
import { serve } from 'https://deno.land/...';
```

---

## 📁 ARCHIVOS CORRECTOS A USAR

### Para Base de Datos (SQL):
✅ `supabase/migrations/045_mercado_pago_integration_CLEAN.sql`
✅ `supabase/migrations/045_mercado_pago_integration.sql`

### Para Edge Functions (TypeScript):
✅ `supabase/functions/create-checkout-session/index.ts`
✅ `supabase/functions/mercadopago-webhook/index.ts`
✅ `supabase/functions/cancel-subscription/index.ts`

### Para Frontend (React):
✅ `src/hooks/useBilling.js`
✅ `src/pages/dashboard/Billing.jsx`

---

## 🧪 VERIFICAR QUE LA MIGRACIÓN FUNCIONÓ

Ejecuta esta query en SQL Editor para verificar:

```sql
-- Verificar que las tablas existen
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('billing_plans', 'billing_payments', 'billing_subscriptions');

-- Verificar que los planes se insertaron
SELECT * FROM billing_plans;

-- Verificar que las políticas RLS existen
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE tablename IN ('billing_plans', 'billing_payments', 'billing_subscriptions');
```

---

## ❌ ERRORES COMUNES Y SOLUCIONES

### Error: "relation already exists"
**Solución:** La tabla ya existe. Puedes:
- Eliminar la tabla primero: `DROP TABLE IF EXISTS public.billing_plans CASCADE;`
- O usar `CREATE TABLE IF NOT EXISTS` (ya está en el script)

### Error: "permission denied"
**Solución:** Asegúrate de estar usando el usuario correcto o service_role

### Error: "syntax error"
**Solución:** 
- Verifica que copiaste SOLO SQL
- No mezcles código de diferentes archivos
- Usa el archivo `_CLEAN.sql` que es más simple

---

## 📝 EJEMPLO DE CONTENIDO CORRECTO

El archivo SQL debe verse así:

```sql
-- Comentarios SQL
CREATE TABLE IF NOT EXISTS public.billing_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    ...
);

CREATE INDEX IF NOT EXISTS ...
```

**NO debe verse así:**

```javascript
import React from 'react';
export const Component = () => { ... }
```

---

## ✅ CHECKLIST ANTES DE EJECUTAR

- [ ] Estoy en Supabase Dashboard > SQL Editor
- [ ] Copié el contenido de `045_mercado_pago_integration_CLEAN.sql`
- [ ] El contenido empieza con `--` o `CREATE TABLE`
- [ ] NO hay código JavaScript/TypeScript/React
- [ ] El archivo tiene extensión `.sql`
- [ ] Estoy ejecutando en el proyecto correcto

---

Si sigues teniendo problemas, comparte:
1. Las primeras 5 líneas del contenido que estás ejecutando
2. El error completo que recibes
3. Desde dónde estás ejecutando (Dashboard o CLI)

