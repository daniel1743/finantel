-- =====================================================
-- SOLUCIÓN: AGREGAR COLUMNAS FALTANTES A TRANSACTIONS
-- =====================================================
-- Este script:
-- 1. Agrega la columna 'notes' si no existe
-- 2. Verifica/Corrige la columna 'metadata' (JSONB)
-- 3. Fuerza el refresh del schema cache
-- =====================================================
-- IDEMPOTENTE: Se puede ejecutar múltiples veces sin errores
-- =====================================================

-- =====================================================
-- PASO 1: VERIFICAR Y AGREGAR COLUMNA 'notes'
-- =====================================================
DO $$ 
BEGIN
    -- Verificar si la columna 'notes' existe
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'transactions' 
        AND column_name = 'notes'
    ) THEN
        -- Agregar la columna 'notes'
        ALTER TABLE public.transactions 
        ADD COLUMN notes TEXT;
        
        RAISE NOTICE 'Columna "notes" agregada a la tabla transactions';
    ELSE
        RAISE NOTICE 'La columna "notes" ya existe en la tabla transactions';
    END IF;
END $$;

-- =====================================================
-- PASO 2: VERIFICAR Y CORREGIR COLUMNA 'metadata'
-- =====================================================
DO $$ 
BEGIN
    -- Verificar si la columna 'metadata' existe
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'transactions' 
        AND column_name = 'metadata'
    ) THEN
        -- Agregar la columna 'metadata' como JSONB
        ALTER TABLE public.transactions 
        ADD COLUMN metadata JSONB DEFAULT '{}'::jsonb;
        
        -- Actualizar registros existentes que tengan NULL
        UPDATE public.transactions 
        SET metadata = '{}'::jsonb 
        WHERE metadata IS NULL;
        
        RAISE NOTICE 'Columna "metadata" agregada a la tabla transactions';
    ELSE
        -- Verificar si el default es correcto
        IF EXISTS (
            SELECT 1 
            FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'transactions' 
            AND column_name = 'metadata'
            AND (column_default IS NULL OR column_default = 'NULL')
        ) THEN
            -- Establecer default correcto
            ALTER TABLE public.transactions 
            ALTER COLUMN metadata SET DEFAULT '{}'::jsonb;
            
            -- Actualizar registros existentes
            UPDATE public.transactions 
            SET metadata = '{}'::jsonb 
            WHERE metadata IS NULL;
            
            RAISE NOTICE 'Default de columna "metadata" corregido';
        ELSE
            RAISE NOTICE 'La columna "metadata" ya existe con configuración correcta';
        END IF;
    END IF;
END $$;

-- =====================================================
-- PASO 3: FORZAR REFRESH DEL SCHEMA CACHE
-- =====================================================
-- Hacer una consulta simple para "tocar" la tabla
SELECT COUNT(*) FROM public.transactions;

-- Intentar notificar cambios (si está disponible)
DO $$ 
BEGIN
    -- Intentar usar pg_notify para notificar cambios
    PERFORM pg_notify('pgrst', 'reload schema');
    RAISE NOTICE 'Notificación enviada para refrescar schema cache';
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'No se pudo enviar notificación (esto es normal)';
END $$;

-- =====================================================
-- PASO 4: VERIFICACIÓN FINAL COMPLETA
-- =====================================================
DO $$
DECLARE
    has_notes BOOLEAN;
    has_metadata BOOLEAN;
    notes_type TEXT;
    metadata_type TEXT;
    metadata_default TEXT;
    column_list TEXT;
BEGIN
    -- Verificar columna 'notes'
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'transactions' 
        AND column_name = 'notes'
    ) INTO has_notes;
    
    -- Verificar columna 'metadata'
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'transactions' 
        AND column_name = 'metadata'
    ) INTO has_metadata;
    
    -- Obtener tipos y defaults
    IF has_notes THEN
        SELECT data_type INTO notes_type
        FROM information_schema.columns
        WHERE table_schema = 'public' 
        AND table_name = 'transactions' 
        AND column_name = 'notes';
    END IF;
    
    IF has_metadata THEN
        SELECT data_type, column_default
        INTO metadata_type, metadata_default
        FROM information_schema.columns
        WHERE table_schema = 'public' 
        AND table_name = 'transactions' 
        AND column_name = 'metadata';
    END IF;
    
    -- Obtener lista completa de columnas
    SELECT string_agg(column_name, ', ' ORDER BY ordinal_position)
    INTO column_list
    FROM information_schema.columns
    WHERE table_schema = 'public' 
    AND table_name = 'transactions';
    
    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'VERIFICACION FINAL - TRANSACTIONS';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Columna "notes":';
    RAISE NOTICE '  - Existe: %', CASE WHEN has_notes THEN 'SI' ELSE 'NO' END;
    IF has_notes THEN
        RAISE NOTICE '  - Tipo: %', notes_type;
    END IF;
    RAISE NOTICE '';
    RAISE NOTICE 'Columna "metadata":';
    RAISE NOTICE '  - Existe: %', CASE WHEN has_metadata THEN 'SI' ELSE 'NO' END;
    IF has_metadata THEN
        RAISE NOTICE '  - Tipo: %', metadata_type;
        RAISE NOTICE '  - Default: %', COALESCE(metadata_default, 'NULL');
    END IF;
    RAISE NOTICE '';
    RAISE NOTICE 'Todas las columnas de transactions:';
    RAISE NOTICE '%', column_list;
    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'IMPORTANTE - REFRESCAR CACHE:';
    RAISE NOTICE '========================================';
    RAISE NOTICE '   1. Espera 30-60 segundos';
    RAISE NOTICE '   2. Ve a Supabase Dashboard -> Settings -> API';
    RAISE NOTICE '   3. Haz clic en "Reload Schema" o "Refresh Schema Cache"';
    RAISE NOTICE '   4. Recarga la pagina de la aplicacion (F5)';
    RAISE NOTICE '========================================';
END $$;

-- =====================================================
-- ✅ SCRIPT COMPLETADO
-- =====================================================

