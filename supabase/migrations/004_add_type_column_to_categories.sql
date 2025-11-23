-- =====================================================
-- CREAR TABLA CATEGORIES O AGREGAR COLUMNA 'type'
-- =====================================================
-- Este script:
-- 1. Crea la tabla categories si no existe
-- 2. O agrega la columna 'type' si la tabla ya existe
-- =====================================================

-- Habilitar extensión UUID si no existe
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Verificar si la tabla existe y crearla si no existe
DO $$ 
BEGIN
    -- Verificar si la tabla categories existe
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'categories'
    ) THEN
        -- Crear la tabla categories completa
        CREATE TABLE public.categories (
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
        
        RAISE NOTICE '✅ Tabla "categories" creada exitosamente';
    ELSE
        RAISE NOTICE 'ℹ️ La tabla "categories" ya existe';
    END IF;
END $$;

-- Verificar y agregar columna 'type' si no existe
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
        -- Agregar la columna 'type'
        ALTER TABLE public.categories 
        ADD COLUMN type TEXT NOT NULL DEFAULT 'expense' 
        CHECK (type IN ('income', 'expense', 'savings'));
        
        RAISE NOTICE '✅ Columna "type" agregada a la tabla categories';
    ELSE
        RAISE NOTICE 'ℹ️ La columna "type" ya existe en la tabla categories';
    END IF;
END $$;

-- Verificar y agregar columna 'icon' si no existe (por si acaso)
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
        
        RAISE NOTICE '✅ Columna "icon" agregada a la tabla categories';
    END IF;
END $$;

-- Verificar y agregar columna 'color' si no existe (por si acaso)
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
        
        RAISE NOTICE '✅ Columna "color" agregada a la tabla categories';
    END IF;
END $$;

-- Verificar estructura final
DO $$
DECLARE
    column_list TEXT;
BEGIN
    SELECT string_agg(column_name, ', ' ORDER BY ordinal_position)
    INTO column_list
    FROM information_schema.columns
    WHERE table_schema = 'public' 
    AND table_name = 'categories';
    
    RAISE NOTICE '📋 Columnas actuales en categories: %', column_list;
END $$;

