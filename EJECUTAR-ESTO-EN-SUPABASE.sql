-- =====================================================
-- 🚀 SCRIPT COMPLETO PARA NUEVA TRANSACCIÓN
-- =====================================================
-- Copia y pega TODO este código en Supabase SQL Editor
-- Luego presiona "Run" o "Ejecutar"
-- =====================================================

-- =====================================================
-- PASO 1: Agregar columna 'type' a categories
-- =====================================================
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

        RAISE NOTICE '✅ Columna type agregada a categories';
    ELSE
        RAISE NOTICE 'ℹ️ La columna type ya existe en categories';
    END IF;
END $$;

-- =====================================================
-- PASO 2: Agregar constraint CHECK a categories
-- =====================================================
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

        RAISE NOTICE '✅ Constraint CHECK agregado a categories';
    ELSE
        RAISE NOTICE 'ℹ️ El constraint CHECK ya existe';
    END IF;
END $$;

-- =====================================================
-- PASO 3: Actualizar categorías existentes
-- =====================================================
DO $$
BEGIN
    UPDATE public.categories
    SET type = 'expense'
    WHERE type IS NULL;

    RAISE NOTICE '✅ Categorías existentes actualizadas';
END $$;

-- =====================================================
-- PASO 4: Agregar columna 'metadata' a transactions
-- =====================================================
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

        RAISE NOTICE '✅ Columna metadata agregada a transactions';
    ELSE
        RAISE NOTICE 'ℹ️ La columna metadata ya existe en transactions';
    END IF;
END $$;

-- =====================================================
-- PASO 5: Crear índice para metadata (performance)
-- =====================================================
DO $$
BEGIN
    CREATE INDEX IF NOT EXISTS idx_transactions_metadata
    ON public.transactions USING GIN (metadata);

    RAISE NOTICE '✅ Índice creado para metadata';
END $$;

-- =====================================================
-- PASO 6: Verificar estructura de categories
-- =====================================================
SELECT
    'CATEGORIES' as tabla,
    column_name,
    data_type,
    column_default,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'categories'
ORDER BY ordinal_position;

-- =====================================================
-- PASO 7: Verificar estructura de transactions
-- =====================================================
SELECT
    'TRANSACTIONS' as tabla,
    column_name,
    data_type,
    column_default,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'transactions'
AND column_name IN ('metadata', 'category_id', 'type', 'notes', 'description', 'amount', 'date')
ORDER BY ordinal_position;

-- =====================================================
-- PASO 8: Refrescar schema cache
-- =====================================================
NOTIFY pgrst, 'reload schema';

-- =====================================================
-- ✅ ✅ ✅ SCRIPT COMPLETADO ✅ ✅ ✅
-- =====================================================
