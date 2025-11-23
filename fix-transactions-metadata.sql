-- =====================================================
-- SCRIPT PARA AGREGAR COLUMNA 'metadata' A TRANSACTIONS
-- =====================================================
-- Ejecuta este script en Supabase SQL Editor
-- =====================================================

-- 1. Agregar columna 'metadata' tipo JSONB si no existe
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'transactions'
        AND column_name = 'metadata'
    ) THEN
        ALTER TABLE public.transactions
        ADD COLUMN metadata JSONB DEFAULT '{}'::jsonb;

        RAISE NOTICE '✅ Columna "metadata" agregada correctamente';
    ELSE
        RAISE NOTICE 'ℹ️ La columna "metadata" ya existe';
    END IF;
END $$;

-- 2. Crear índice para búsquedas rápidas en metadata (opcional pero recomendado)
CREATE INDEX IF NOT EXISTS idx_transactions_metadata
ON public.transactions USING GIN (metadata);

-- 3. Verificar la estructura
SELECT
    column_name,
    data_type,
    column_default,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'transactions'
AND column_name IN ('metadata', 'category_id', 'type', 'notes')
ORDER BY ordinal_position;

-- 4. Refrescar el schema cache
NOTIFY pgrst, 'reload schema';

-- =====================================================
-- ✅ SCRIPT COMPLETADO
-- =====================================================
-- La columna metadata guardará datos como:
-- {
--   "necessity_level": "muy-necesario"
-- }
-- =====================================================
