-- =====================================================
-- SOLUCIÓN FORZADA: AGREGAR COLUMNA 'type' A CATEGORIES
-- =====================================================
-- Este script FORZA la creación de la columna 'type'
-- incluso si ya existe, para asegurar que esté correcta
-- =====================================================

-- Habilitar extensión UUID si no existe
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- PASO 1: ELIMINAR CONSTRAINT SI EXISTE
-- =====================================================
DO $$ 
BEGIN
    -- Eliminar constraint si existe
    IF EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE table_schema = 'public' 
        AND table_name = 'categories' 
        AND constraint_name = 'categories_type_check'
    ) THEN
        ALTER TABLE public.categories DROP CONSTRAINT categories_type_check;
        RAISE NOTICE '✅ Constraint eliminado';
    END IF;
END $$;

-- =====================================================
-- PASO 2: ELIMINAR COLUMNA SI EXISTE Y RECREARLA
-- =====================================================
DO $$ 
BEGIN
    -- Si la columna existe, eliminarla
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'categories' 
        AND column_name = 'type'
    ) THEN
        ALTER TABLE public.categories DROP COLUMN type;
        RAISE NOTICE '✅ Columna "type" eliminada para recrearla';
    END IF;
END $$;

-- =====================================================
-- PASO 3: CREAR COLUMNA 'type' NUEVA
-- =====================================================
ALTER TABLE public.categories 
ADD COLUMN type TEXT NOT NULL DEFAULT 'expense';

-- =====================================================
-- PASO 4: AGREGAR CONSTRAINT CHECK
-- =====================================================
ALTER TABLE public.categories
ADD CONSTRAINT categories_type_check 
CHECK (type IN ('income', 'expense', 'savings'));

-- =====================================================
-- PASO 5: ACTUALIZAR REGISTROS EXISTENTES
-- =====================================================
-- Si hay categorías existentes sin type, asignarles 'expense' por defecto
UPDATE public.categories 
SET type = 'expense' 
WHERE type IS NULL OR type = '';

-- =====================================================
-- PASO 6: VERIFICACIÓN FINAL
-- =====================================================
DO $$
DECLARE
    has_type BOOLEAN;
    type_default TEXT;
    type_nullable TEXT;
BEGIN
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'categories' 
        AND column_name = 'type'
    ) INTO has_type;
    
    SELECT column_default, is_nullable
    INTO type_default, type_nullable
    FROM information_schema.columns
    WHERE table_schema = 'public' 
    AND table_name = 'categories' 
    AND column_name = 'type';
    
    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE '📋 VERIFICACIÓN FINAL';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Columna "type" existe: %', CASE WHEN has_type THEN '✅ SÍ' ELSE '❌ NO' END;
    RAISE NOTICE 'Default: %', COALESCE(type_default, 'NULL');
    RAISE NOTICE 'Nullable: %', type_nullable;
    RAISE NOTICE '';
    RAISE NOTICE '⚠️ IMPORTANTE:';
    RAISE NOTICE '   1. Espera 30-60 segundos';
    RAISE NOTICE '   2. Ve a Supabase Dashboard → Settings → API';
    RAISE NOTICE '   3. Haz clic en "Reload Schema" o "Refresh Schema Cache"';
    RAISE NOTICE '   4. Recarga la página de la aplicación';
    RAISE NOTICE '========================================';
END $$;

