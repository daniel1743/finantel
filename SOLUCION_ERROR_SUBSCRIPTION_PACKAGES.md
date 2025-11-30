# 🔧 Solución: Error "subscription_packages no existe"

## ❌ Error
```
ERROR: 42P01: la relación "public.subscription_packages" no existe
LÍNEA 9: ACTUALIZAR public.subscription_packages
```

## 🔍 Diagnóstico

El error indica que algún SQL está intentando hacer un `UPDATE` a la tabla `subscription_packages`, pero esa tabla **no existe** en tu base de datos.

**La tabla correcta es:** `billing_subscriptions`

## ✅ Soluciones

### Opción 1: Ejecutar script de limpieza (Recomendado)

Ejecuta este SQL en Supabase SQL Editor:

```sql
-- Limpiar cualquier referencia a subscription_packages
DO $$
BEGIN
    -- Eliminar triggers
    DROP TRIGGER IF EXISTS trigger_update_subscription_packages_updated_at ON public.subscription_packages;
    DROP TRIGGER IF EXISTS update_subscription_packages_updated_at ON public.subscription_packages;
    
    -- Eliminar funciones
    DROP FUNCTION IF EXISTS update_subscription_packages_updated_at() CASCADE;
    
    -- Eliminar políticas RLS
    DROP POLICY IF EXISTS "Users can view own subscription_packages" ON public.subscription_packages;
    DROP POLICY IF EXISTS "Users can update own subscription_packages" ON public.subscription_packages;
    DROP POLICY IF EXISTS "Users can insert own subscription_packages" ON public.subscription_packages;
    DROP POLICY IF EXISTS "Service role can update subscription_packages" ON public.subscription_packages;
    
    RAISE NOTICE 'Limpieza completada';
EXCEPTION
    WHEN undefined_table THEN
        RAISE NOTICE 'La tabla subscription_packages no existe (correcto)';
    WHEN OTHERS THEN
        RAISE NOTICE 'Error: %', SQLERRM;
END $$;
```

### Opción 2: Si realmente necesitas la tabla subscription_packages

Si por alguna razón necesitas crear esa tabla (aunque `billing_subscriptions` ya hace lo mismo), ejecuta:

```sql
-- Crear tabla subscription_packages (solo si realmente la necesitas)
CREATE TABLE IF NOT EXISTS public.subscription_packages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    plan TEXT NOT NULL CHECK (plan IN ('free', 'personal', 'familiar', 'family', 'Familiar', 'enterprise')),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired', 'pending')),
    provider TEXT DEFAULT 'mercadopago' CHECK (provider IN ('mercadopago', 'stripe', 'manual')),
    provider_subscription_id TEXT,
    current_period_start TIMESTAMPTZ DEFAULT NOW(),
    current_period_end TIMESTAMPTZ,
    cancel_at_period_end BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(user_id)
);

CREATE INDEX IF NOT EXISTS idx_subscription_packages_user_id ON public.subscription_packages(user_id);
CREATE INDEX IF NOT EXISTS idx_subscription_packages_status ON public.subscription_packages(status);
CREATE INDEX IF NOT EXISTS idx_subscription_packages_plan ON public.subscription_packages(plan);
```

### Opción 3: Buscar y corregir el SQL que causa el error

Si el error viene de un SQL que estás ejecutando manualmente, busca y reemplaza:

```sql
-- ❌ INCORRECTO:
UPDATE public.subscription_packages SET ...

-- ✅ CORRECTO:
UPDATE public.billing_subscriptions SET ...
```

## 📝 Nota Importante

**La tabla `billing_subscriptions` ya existe y es la que debes usar.** No necesitas crear `subscription_packages` a menos que tengas un motivo específico.

## 🔍 ¿Dónde está el error?

El error dice "LÍNEA 9", lo que sugiere que:
1. Estás ejecutando un SQL manualmente que tiene un UPDATE en la línea 9
2. Hay un trigger o función en la BD que intenta actualizar esa tabla
3. Hay un Edge Function o código que está ejecutando ese SQL

**Para encontrar el origen:**
1. Revisa los SQLs que has ejecutado recientemente
2. Revisa los triggers en Supabase Dashboard → Database → Triggers
3. Revisa las funciones en Supabase Dashboard → Database → Functions

## ✅ Verificación

Después de ejecutar la solución, verifica que no haya más errores:

```sql
-- Verificar que billing_subscriptions existe
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('billing_subscriptions', 'subscription_packages');
```

Deberías ver solo `billing_subscriptions`.

