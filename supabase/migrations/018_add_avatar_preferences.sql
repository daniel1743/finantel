-- =====================================================
-- AGREGAR COLUMNAS DE AVATAR A PROFILE_PREFERENCES
-- =====================================================
-- Este script agrega columnas para personalizar el avatar
-- en el plan gratuito (estilo de letra y color)
-- =====================================================

-- Agregar columnas de avatar si no existen
DO $$ 
BEGIN
    -- Avatar font style (para plan gratis)
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'profile_preferences' 
        AND column_name = 'avatar_font_style'
    ) THEN
        ALTER TABLE public.profile_preferences 
        ADD COLUMN avatar_font_style TEXT DEFAULT 'bold' 
        CHECK (avatar_font_style IN ('bold', 'semibold', 'medium', 'regular', 'light'));
        
        RAISE NOTICE 'Columna avatar_font_style agregada';
    END IF;

    -- Avatar color (para plan gratis)
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'profile_preferences' 
        AND column_name = 'avatar_color'
    ) THEN
        ALTER TABLE public.profile_preferences 
        ADD COLUMN avatar_color TEXT DEFAULT '#1C8FA0';
        
        RAISE NOTICE 'Columna avatar_color agregada';
    END IF;
END $$;

-- =====================================================
-- CREAR BUCKET DE STORAGE PARA AVATARES (si no existe)
-- =====================================================
-- Nota: Esto debe ejecutarse manualmente en Supabase Dashboard
-- Storage > Create Bucket > nombre: 'avatars' > público: true

-- =====================================================
-- ✅ SCRIPT COMPLETADO
-- =====================================================

