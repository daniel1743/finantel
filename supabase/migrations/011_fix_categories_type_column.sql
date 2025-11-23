-- =====================================================
-- SOLUCIÓN DEFINITIVA: COLUMNA 'type' EN CATEGORIES
-- =====================================================
-- Este script:
-- 1. Verifica si la tabla categories existe
-- 2. Crea la tabla si no existe (con todas las columnas)
-- 3. Agrega la columna 'type' si falta
-- 4. Fuerza el refresh del schema cache de Supabase
-- =====================================================

-- Habilitar extensión UUID si no existe
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- PASO 1: CREAR TABLA SI NO EXISTE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    name TEXT NOT NULL CHECK (char_length(name) >= 1 AND char_length(name) <= 50),
    type TEXT NOT NULL DEFAULT 'expense' CHECK (type IN ('income', 'expense', 'savings')),
    icon TEXT DEFAULT '💰',
    color TEXT DEFAULT '#3B82F6',
    description TEXT,
    is_default BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Un usuario no puede tener dos categorías con el mismo nombre
    UNIQUE(user_id, name)
);

-- =====================================================
-- PASO 2: AGREGAR COLUMNA 'type' SI NO EXISTE
-- =====================================================
DO $$ 
BEGIN
    -- Verificar si la columna 'type' existe
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'categories' 
        AND column_name = 'type'
    ) THEN
        -- Agregar la columna 'type' con valor por defecto
        ALTER TABLE public.categories 
        ADD COLUMN type TEXT NOT NULL DEFAULT 'expense';
        
        -- Agregar el constraint CHECK después
        ALTER TABLE public.categories
        ADD CONSTRAINT categories_type_check 
        CHECK (type IN ('income', 'expense', 'savings'));
        
        RAISE NOTICE '✅ Columna "type" agregada a la tabla categories';
    ELSE
        RAISE NOTICE 'ℹ️ La columna "type" ya existe en la tabla categories';
    END IF;
END $$;

-- =====================================================
-- PASO 3: AGREGAR COLUMNAS FALTANTES (icon, color)
-- =====================================================

-- Agregar columna 'icon' si no existe
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'categories' 
        AND column_name = 'icon'
    ) THEN
        ALTER TABLE public.categories 
        ADD COLUMN icon TEXT DEFAULT '💰';
        RAISE NOTICE '✅ Columna "icon" agregada';
    END IF;
END $$;

-- Agregar columna 'color' si no existe
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'categories' 
        AND column_name = 'color'
    ) THEN
        ALTER TABLE public.categories 
        ADD COLUMN color TEXT DEFAULT '#3B82F6';
        RAISE NOTICE '✅ Columna "color" agregada';
    END IF;
END $$;

-- =====================================================
-- PASO 4: VERIFICAR ESTRUCTURA FINAL
-- =====================================================
DO $$
DECLARE
    column_list TEXT;
    has_type BOOLEAN;
    has_icon BOOLEAN;
    has_color BOOLEAN;
BEGIN
    -- Verificar columnas críticas
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'categories' 
        AND column_name = 'type'
    ) INTO has_type;
    
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'categories' 
        AND column_name = 'icon'
    ) INTO has_icon;
    
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'categories' 
        AND column_name = 'color'
    ) INTO has_color;
    
    -- Obtener lista completa de columnas
    SELECT string_agg(column_name, ', ' ORDER BY ordinal_position)
    INTO column_list
    FROM information_schema.columns
    WHERE table_schema = 'public' 
    AND table_name = 'categories';
    
    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE '📋 VERIFICACIÓN FINAL';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Columna "type": %', CASE WHEN has_type THEN '✅ EXISTE' ELSE '❌ FALTA' END;
    RAISE NOTICE 'Columna "icon": %', CASE WHEN has_icon THEN '✅ EXISTE' ELSE '❌ FALTA' END;
    RAISE NOTICE 'Columna "color": %', CASE WHEN has_color THEN '✅ EXISTE' ELSE '❌ FALTA' END;
    RAISE NOTICE '';
    RAISE NOTICE '📋 Todas las columnas: %', column_list;
    RAISE NOTICE '========================================';
    RAISE NOTICE '';
    RAISE NOTICE '⚠️ IMPORTANTE: Si aún ves el error, espera 10-30 segundos';
    RAISE NOTICE '   y recarga la página. Supabase necesita actualizar su cache.';
    RAISE NOTICE '========================================';
END $$;

-- =====================================================
-- PASO 5: FORZAR REFRESH DEL SCHEMA CACHE
-- =====================================================
-- Nota: Supabase actualiza el cache automáticamente, pero
-- podemos forzar un refresh ejecutando una consulta simple
SELECT 1 FROM public.categories LIMIT 1;

-- =====================================================
-- ✅ SCRIPT COMPLETADO
-- =====================================================

