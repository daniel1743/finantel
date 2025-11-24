-- =====================================================
-- 🚀 SOLUCIÓN COMPLETA - COPIAR Y EJECUTAR TODO
-- =====================================================
-- Ejecuta este script completo en Supabase SQL Editor
-- =====================================================

-- PASO 1: Agregar columna 'type' a categories
ALTER TABLE public.categories
ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'expense' NOT NULL;

-- PASO 2: Agregar constraint para type
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'categories_type_check'
    ) THEN
        ALTER TABLE public.categories
        ADD CONSTRAINT categories_type_check
        CHECK (type IN ('income', 'expense', 'savings'));
    END IF;
END $$;

-- PASO 3: Actualizar registros existentes
UPDATE public.categories
SET type = 'expense'
WHERE type IS NULL OR type = '';

-- PASO 4: Agregar columna 'metadata' a transactions
ALTER TABLE public.transactions
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- PASO 5: Crear índice para metadata
CREATE INDEX IF NOT EXISTS idx_transactions_metadata
ON public.transactions USING GIN (metadata);

-- PASO 6: Refrescar schema cache
NOTIFY pgrst, 'reload schema';

-- =====================================================
-- ✅ VERIFICACIÓN - Resultado esperado
-- =====================================================

SELECT
    'CATEGORIES - Debe tener columna type' as verificacion,
    column_name,
    data_type,
    column_default
FROM information_schema.columns
WHERE table_name = 'categories'
AND column_name = 'type';

SELECT
    'TRANSACTIONS - Debe tener columna metadata' as verificacion,
    column_name,
    data_type,
    column_default
FROM information_schema.columns
WHERE table_name = 'transactions'
AND column_name = 'metadata';

-- =====================================================
-- ✅ SCRIPT COMPLETADO
-- =====================================================
-- Si ves resultados en las consultas de verificación,
-- las columnas se agregaron correctamente.
--
-- Ahora ve a Settings → API → Reload Schema
-- Y refresca el navegador con Ctrl+Shift+R
-- =====================================================
