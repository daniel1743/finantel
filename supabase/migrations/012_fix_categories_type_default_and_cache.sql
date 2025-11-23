-- =====================================================
-- SOLUCIÓN DEFINITIVA: FIX COLUMNA 'type' Y REFRESH CACHE
-- =====================================================
-- Este script:
-- 1. Corrige el default de la columna 'type' (de NULL a 'expense')
-- 2. Agrega el constraint CHECK si falta
-- 3. Fuerza el refresh del schema cache de PostgREST
-- =====================================================

-- =====================================================
-- PASO 1: CORREGIR DEFAULT DE COLUMNA 'type'
-- =====================================================
DO $$ 
BEGIN
    -- Verificar si la columna type tiene default NULL
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'categories' 
        AND column_name = 'type'
        AND (column_default IS NULL OR column_default = 'NULL')
    ) THEN
        -- Cambiar el default a 'expense'
        ALTER TABLE public.categories 
        ALTER COLUMN type SET DEFAULT 'expense';
        
        -- Actualizar registros existentes que tengan NULL
        UPDATE public.categories 
        SET type = 'expense' 
        WHERE type IS NULL;
        
        -- Hacer la columna NOT NULL si no lo es
        ALTER TABLE public.categories 
        ALTER COLUMN type SET NOT NULL;
        
        RAISE NOTICE '✅ Default de columna "type" corregido a ''expense''';
    ELSE
        RAISE NOTICE 'ℹ️ La columna "type" ya tiene un default correcto';
    END IF;
END $$;

-- =====================================================
-- PASO 2: AGREGAR CONSTRAINT CHECK SI FALTA
-- =====================================================
DO $$ 
BEGIN
    -- Verificar si el constraint existe
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE table_schema = 'public' 
        AND table_name = 'categories' 
        AND constraint_name = 'categories_type_check'
    ) THEN
        -- Agregar el constraint CHECK
        ALTER TABLE public.categories
        ADD CONSTRAINT categories_type_check 
        CHECK (type IN ('income', 'expense', 'savings'));
        
        RAISE NOTICE '✅ Constraint CHECK agregado a columna "type"';
    ELSE
        RAISE NOTICE 'ℹ️ El constraint CHECK ya existe';
    END IF;
END $$;

-- =====================================================
-- PASO 3: VERIFICAR Y CORREGIR OTRAS COLUMNAS
-- =====================================================

-- Corregir default de 'icon' si es NULL o vacío
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'categories' 
        AND column_name = 'icon'
        AND (column_default IS NULL OR column_default = '''''::text')
    ) THEN
        ALTER TABLE public.categories 
        ALTER COLUMN icon SET DEFAULT '💰';
        
        UPDATE public.categories 
        SET icon = '💰' 
        WHERE icon IS NULL OR icon = '';
        
        RAISE NOTICE '✅ Default de columna "icon" corregido';
    END IF;
END $$;

-- =====================================================
-- PASO 4: FORZAR REFRESH DEL SCHEMA CACHE
-- =====================================================
-- PostgREST cachea el schema. Para forzar un refresh:
-- 1. Hacer una consulta que toque la tabla
-- 2. Usar NOTIFY (si está disponible)
-- 3. Esperar unos segundos

-- Hacer una consulta simple para "tocar" la tabla
SELECT COUNT(*) FROM public.categories;

-- Intentar notificar cambios (si la extensión está disponible)
DO $$ 
BEGIN
    -- Intentar usar pg_notify para notificar cambios
    -- Esto puede ayudar a refrescar el cache en algunos casos
    PERFORM pg_notify('pgrst', 'reload schema');
    RAISE NOTICE '✅ Notificación enviada para refrescar schema cache';
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'ℹ️ No se pudo enviar notificación (esto es normal)';
END $$;

-- =====================================================
-- PASO 5: VERIFICACIÓN FINAL
-- =====================================================
DO $$
DECLARE
    type_default TEXT;
    type_nullable TEXT;
    has_check BOOLEAN;
BEGIN
    -- Verificar default de type
    SELECT column_default, is_nullable
    INTO type_default, type_nullable
    FROM information_schema.columns
    WHERE table_schema = 'public' 
    AND table_name = 'categories' 
    AND column_name = 'type';
    
    -- Verificar constraint
    SELECT EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE table_schema = 'public' 
        AND table_name = 'categories' 
        AND constraint_name = 'categories_type_check'
    ) INTO has_check;
    
    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE '📋 VERIFICACIÓN FINAL';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Columna "type":';
    RAISE NOTICE '  - Default: %', COALESCE(type_default, 'NULL');
    RAISE NOTICE '  - Nullable: %', type_nullable;
    RAISE NOTICE '  - Constraint CHECK: %', CASE WHEN has_check THEN '✅ EXISTE' ELSE '❌ FALTA' END;
    RAISE NOTICE '';
    RAISE NOTICE '⚠️ IMPORTANTE:';
    RAISE NOTICE '   1. Espera 30-60 segundos';
    RAISE NOTICE '   2. Recarga la página de la aplicación (F5)';
    RAISE NOTICE '   3. Si aún falla, ve a Supabase Dashboard →';
    RAISE NOTICE '      Settings → API → y haz clic en "Reload Schema"';
    RAISE NOTICE '========================================';
END $$;

-- =====================================================
-- ✅ SCRIPT COMPLETADO
-- =====================================================

