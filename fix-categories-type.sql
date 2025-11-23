-- =====================================================
-- SCRIPT PARA AGREGAR COLUMNA 'type' A CATEGORIES
-- =====================================================
-- Ejecuta este script en Supabase SQL Editor
-- =====================================================

-- 1. Agregar columna 'type' si no existe
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'categories'
        AND column_name = 'type'
    ) THEN
        ALTER TABLE public.categories
        ADD COLUMN type TEXT DEFAULT 'expense' NOT NULL;

        RAISE NOTICE '✅ Columna "type" agregada correctamente';
    ELSE
        RAISE NOTICE 'ℹ️ La columna "type" ya existe';
    END IF;
END $$;

-- 2. Agregar constraint CHECK para validar valores
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.table_constraints
        WHERE table_schema = 'public'
        AND table_name = 'categories'
        AND constraint_name = 'categories_type_check'
    ) THEN
        ALTER TABLE public.categories
        ADD CONSTRAINT categories_type_check
        CHECK (type IN ('income', 'expense', 'savings'));

        RAISE NOTICE '✅ Constraint CHECK agregado';
    ELSE
        RAISE NOTICE 'ℹ️ El constraint CHECK ya existe';
    END IF;
END $$;

-- 3. Actualizar categorías existentes (si las hay)
UPDATE public.categories
SET type = 'expense'
WHERE type IS NULL;

-- 4. Verificar la estructura final
SELECT
    column_name,
    data_type,
    column_default,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'categories'
ORDER BY ordinal_position;

-- 5. Refrescar el schema cache
NOTIFY pgrst, 'reload schema';

-- =====================================================
-- ✅ SCRIPT COMPLETADO
-- =====================================================
-- Después de ejecutar:
-- 1. Espera 30-60 segundos
-- 2. Ve a Settings → API → Click "Reload Schema"
-- 3. Recarga tu aplicación (F5)
-- =====================================================
