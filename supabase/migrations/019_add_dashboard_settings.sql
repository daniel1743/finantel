-- =====================================================
-- MIGRACIÓN: AGREGAR DASHBOARD_SETTINGS A PROFILE_PREFERENCES
-- =====================================================
-- Este script agrega la columna dashboard_settings (JSONB) a la tabla
-- profile_preferences para almacenar las preferencias de personalización
-- del dashboard del usuario.
-- =====================================================
-- IDEMPOTENTE: Se puede ejecutar múltiples veces sin errores
-- =====================================================

-- =====================================================
-- PASO 1: AGREGAR COLUMNA dashboard_settings
-- =====================================================
DO $$ 
BEGIN
    -- Verificar si la columna dashboard_settings existe
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'profile_preferences' 
        AND column_name = 'dashboard_settings'
    ) THEN
        -- Agregar la columna dashboard_settings como JSONB
        ALTER TABLE public.profile_preferences 
        ADD COLUMN dashboard_settings JSONB DEFAULT '{}'::jsonb;
        
        RAISE NOTICE 'Columna "dashboard_settings" agregada a la tabla profile_preferences';
    ELSE
        RAISE NOTICE 'La columna "dashboard_settings" ya existe en la tabla profile_preferences';
    END IF;
END $$;

-- =====================================================
-- PASO 2: ACTUALIZAR REGISTROS EXISTENTES
-- =====================================================
-- Establecer valores por defecto para usuarios existentes
UPDATE public.profile_preferences 
SET dashboard_settings = jsonb_build_object(
    'visibleCards', jsonb_build_object(
        'balance', true,
        'expenses', true,
        'savings', true,
        'income', false,
        'goals', false,
        'budgets', false
    ),
    'timePeriod', 'month',
    'cardOrder', jsonb_build_array('balance', 'expenses', 'savings', 'income', 'goals', 'budgets')
)
WHERE dashboard_settings IS NULL OR dashboard_settings = '{}'::jsonb;

-- =====================================================
-- PASO 3: VERIFICACIÓN FINAL
-- =====================================================
DO $$
DECLARE
    has_column BOOLEAN;
    column_type TEXT;
    default_value TEXT;
BEGIN
    -- Verificar columna dashboard_settings
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'profile_preferences' 
        AND column_name = 'dashboard_settings'
    ) INTO has_column;
    
    IF has_column THEN
        SELECT data_type, column_default
        INTO column_type, default_value
        FROM information_schema.columns
        WHERE table_schema = 'public' 
        AND table_name = 'profile_preferences' 
        AND column_name = 'dashboard_settings';
        
        RAISE NOTICE '';
        RAISE NOTICE '========================================';
        RAISE NOTICE 'VERIFICACIÓN - DASHBOARD_SETTINGS';
        RAISE NOTICE '========================================';
        RAISE NOTICE 'Columna "dashboard_settings":';
        RAISE NOTICE '  - Existe: SÍ';
        RAISE NOTICE '  - Tipo: %', column_type;
        RAISE NOTICE '  - Default: %', COALESCE(default_value, 'NULL');
        RAISE NOTICE '';
        RAISE NOTICE '========================================';
        RAISE NOTICE 'La columna está lista para usar';
        RAISE NOTICE '========================================';
    ELSE
        RAISE NOTICE 'ERROR: La columna dashboard_settings no existe';
    END IF;
END $$;

-- =====================================================
-- SCRIPT COMPLETADO
-- =====================================================

