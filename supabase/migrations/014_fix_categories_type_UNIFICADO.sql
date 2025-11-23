-- =====================================================
-- SOLUCIÓN UNIFICADA: COLUMNA 'type' EN CATEGORIES
-- =====================================================
-- Este script unifica todas las correcciones de la columna 'type':
-- 1. Crea la tabla categories si no existe (con todas las columnas)
-- 2. Agrega/Corrige la columna 'type' con default correcto
-- 3. Agrega las columnas 'icon' y 'color' si faltan
-- 4. Configura constraints correctamente
-- 5. Intenta refrescar el schema cache
-- =====================================================
-- IDEMPOTENTE: Se puede ejecutar múltiples veces sin errores
-- =====================================================

-- Habilitar extensión UUID si no existe
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- PASO 1: CREAR TABLA CATEGORIES SI NO EXISTE
-- =====================================================
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
        
        RAISE NOTICE $$✅ Tabla "categories" creada exitosamente$$;
    ELSE
        RAISE NOTICE $$ℹ️ La tabla "categories" ya existe$$;
    END IF;
END $$;

-- =====================================================
-- PASO 2: CORREGIR COLUMNA 'type' (FORZADO)
-- =====================================================
DO $$ 
BEGIN
    -- Si la columna existe pero tiene problemas, eliminarla y recrearla
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'categories' 
        AND column_name = 'type'
    ) THEN
        -- Eliminar constraint si existe
        IF EXISTS (
            SELECT 1 
            FROM information_schema.table_constraints 
            WHERE table_schema = 'public' 
            AND table_name = 'categories' 
            AND constraint_name = 'categories_type_check'
        ) THEN
            ALTER TABLE public.categories DROP CONSTRAINT categories_type_check;
            RAISE NOTICE $$✅ Constraint eliminado para recrearlo$$;
        END IF;
        
        -- Eliminar la columna para recrearla correctamente
        ALTER TABLE public.categories DROP COLUMN type;
        RAISE NOTICE $$✅ Columna "type" eliminada para recrearla correctamente$$;
    END IF;
    
    -- Crear la columna 'type' con configuración correcta
    ALTER TABLE public.categories 
    ADD COLUMN type TEXT NOT NULL DEFAULT 'expense';
    
    -- Agregar constraint CHECK
    ALTER TABLE public.categories
    ADD CONSTRAINT categories_type_check 
    CHECK (type IN ('income', 'expense', 'savings'));
    
    -- Actualizar registros existentes (por si acaso)
    UPDATE public.categories 
    SET type = 'expense' 
    WHERE type IS NULL OR type = '';
    
    RAISE NOTICE $$✅ Columna "type" creada/corregida exitosamente$$;
END $$;

-- =====================================================
-- PASO 3: AGREGAR COLUMNA 'icon' SI NO EXISTE
-- =====================================================
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
        
        -- Actualizar registros existentes
        UPDATE public.categories 
        SET icon = '💰' 
        WHERE icon IS NULL OR icon = '';
        
        RAISE NOTICE $$✅ Columna "icon" agregada$$;
    ELSE
        -- Corregir default si es NULL o vacío
        IF EXISTS (
            SELECT 1 
            FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'categories' 
            AND column_name = 'icon'
            AND (column_default IS NULL OR column_default = '''''::text)
        ) THEN
            ALTER TABLE public.categories 
            ALTER COLUMN icon SET DEFAULT '💰';
            
            UPDATE public.categories 
            SET icon = '💰' 
            WHERE icon IS NULL OR icon = '';
            
            RAISE NOTICE $$✅ Default de columna "icon" corregido$$;
        END IF;
    END IF;
END $$;

-- =====================================================
-- PASO 4: AGREGAR COLUMNA 'color' SI NO EXISTE
-- =====================================================
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
        
        -- Actualizar registros existentes
        UPDATE public.categories 
        SET color = '#3B82F6' 
        WHERE color IS NULL OR color = '';
        
        RAISE NOTICE $$✅ Columna "color" agregada$$;
    ELSE
        -- Corregir default si es NULL o vacío
        IF EXISTS (
            SELECT 1 
            FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'categories' 
            AND column_name = 'color'
            AND (column_default IS NULL OR column_default = '''''::text)
        ) THEN
            ALTER TABLE public.categories 
            ALTER COLUMN color SET DEFAULT '#3B82F6';
            
            UPDATE public.categories 
            SET color = '#3B82F6' 
            WHERE color IS NULL OR color = '';
            
            RAISE NOTICE $$✅ Default de columna "color" corregido$$;
        END IF;
    END IF;
END $$;

-- =====================================================
-- PASO 5: FORZAR REFRESH DEL SCHEMA CACHE
-- =====================================================
-- Hacer una consulta simple para "tocar" la tabla
SELECT COUNT(*) FROM public.categories;

-- Intentar notificar cambios (si está disponible)
DO $$ 
BEGIN
    -- Intentar usar pg_notify para notificar cambios
    PERFORM pg_notify('pgrst', 'reload schema');
    RAISE NOTICE $$✅ Notificación enviada para refrescar schema cache$$;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE $$ℹ️ No se pudo enviar notificación (esto es normal)$$;
END $$;

-- =====================================================
-- PASO 6: VERIFICACIÓN FINAL COMPLETA
-- =====================================================
DO $$
DECLARE
    has_type BOOLEAN;
    has_icon BOOLEAN;
    has_color BOOLEAN;
    type_default TEXT;
    type_nullable TEXT;
    has_check BOOLEAN;
    column_list TEXT;
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
    
    -- Verificar default y nullable de type
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
    
    -- Obtener lista completa de columnas
    SELECT string_agg(column_name, ', ' ORDER BY ordinal_position)
    INTO column_list
    FROM information_schema.columns
    WHERE table_schema = 'public' 
    AND table_name = 'categories';
    
    RAISE NOTICE '';
    RAISE NOTICE $$========================================$$;
    RAISE NOTICE $$📋 VERIFICACIÓN FINAL COMPLETA$$;
    RAISE NOTICE $$========================================$$;
    RAISE NOTICE $$Columna "type":$$;
    RAISE NOTICE $$  - Existe: %$$, CASE WHEN has_type THEN $$✅ SÍ$$ ELSE $$❌ NO$$ END;
    RAISE NOTICE $$  - Default: %$$, COALESCE(type_default, 'NULL');
    RAISE NOTICE $$  - Nullable: %$$, type_nullable;
    RAISE NOTICE $$  - Constraint CHECK: %$$, CASE WHEN has_check THEN $$✅ EXISTE$$ ELSE $$❌ FALTA$$ END;
    RAISE NOTICE '';
    RAISE NOTICE $$Columna "icon": %$$, CASE WHEN has_icon THEN $$✅ EXISTE$$ ELSE $$❌ FALTA$$ END;
    RAISE NOTICE $$Columna "color": %$$, CASE WHEN has_color THEN $$✅ EXISTE$$ ELSE $$❌ FALTA$$ END;
    RAISE NOTICE '';
    RAISE NOTICE $$📋 Todas las columnas: %$$, column_list;
    RAISE NOTICE '';
    RAISE NOTICE $$========================================$$;
    RAISE NOTICE $$⚠️ IMPORTANTE - REFRESCAR CACHE:$$;
    RAISE NOTICE $$========================================$$;
    RAISE NOTICE $$   1. Espera 30-60 segundos$$;
    RAISE NOTICE $$   2. Ve a Supabase Dashboard → Settings → API$$;
    RAISE NOTICE $$   3. Haz clic en "Reload Schema" o "Refresh Schema Cache"$$;
    RAISE NOTICE $$   4. Recarga la página de la aplicación (F5)$$;
    RAISE NOTICE $$========================================$$;
END $$;

-- =====================================================
-- ✅ SCRIPT UNIFICADO COMPLETADO
-- =====================================================
-- Este script reemplaza a:
-- - 011_fix_categories_type_column.sql
-- - 012_fix_categories_type_default_and_cache.sql
-- - 013_fix_categories_type_FORZADO.sql
-- =====================================================

