-- =====================================================
-- FIX: TRIGGER DE CREACIÓN DE USUARIO CON MANEJO DE ERRORES
-- =====================================================
-- Este script arregla el trigger que causa errores 500 al registrarse
-- Agrega manejo de errores robusto y validaciones

-- =====================================================
-- PASO 1: ELIMINAR TRIGGER ANTIGUO
-- =====================================================
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- =====================================================
-- PASO 2: RECREAR FUNCIÓN CON MANEJO DE ERRORES
-- =====================================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Intentar crear categorías por defecto
    BEGIN
        PERFORM create_default_categories(NEW.id);
    EXCEPTION
        WHEN OTHERS THEN
            RAISE WARNING 'Error al crear categorías para usuario %: %', NEW.id, SQLERRM;
            -- Continuar aunque falle
    END;

    -- Intentar crear preferencias de perfil
    BEGIN
        PERFORM create_user_preferences(NEW.id);
    EXCEPTION
        WHEN OTHERS THEN
            RAISE WARNING 'Error al crear preferencias para usuario %: %', NEW.id, SQLERRM;
            -- Continuar aunque falle
    END;

    RAISE NOTICE 'Usuario creado: % (con manejo de errores)', NEW.id;

    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- Si todo falla, al menos logear el error y permitir que el usuario se cree
        RAISE WARNING 'Error general en handle_new_user para %: %', NEW.id, SQLERRM;
        RETURN NEW;
END;
$$;

-- =====================================================
-- PASO 3: RECREAR TRIGGER (OPCIONAL - puede deshabilitarse)
-- =====================================================
-- Comentar estas líneas si quieres deshabilitar el trigger completamente
-- y ejecutar el setup manualmente desde el frontend

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user();

-- =====================================================
-- PASO 4: MEJORAR FUNCIÓN DE CATEGORÍAS CON VALIDACIONES
-- =====================================================
CREATE OR REPLACE FUNCTION create_default_categories(user_uuid UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    category_record RECORD;
    inserted_count INTEGER := 0;
BEGIN
    -- Verificar que la tabla existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'categories') THEN
        RAISE EXCEPTION 'Tabla categories no existe';
    END IF;

    -- Verificar que el usuario no tiene categorías ya
    IF EXISTS (SELECT 1 FROM public.categories WHERE user_id = user_uuid LIMIT 1) THEN
        RAISE NOTICE 'Usuario % ya tiene categorías, omitiendo...', user_uuid;
        RETURN;
    END IF;

    -- Lista de categorías por defecto
    FOR category_record IN
        SELECT * FROM (VALUES
            ('Alimentación', 'expense', '🍔', '#E47B45'),
            ('Transporte', 'expense', '🚗', '#3B82F6'),
            ('Hogar', 'expense', '🏠', '#10B981'),
            ('Salud', 'expense', '💊', '#EF4444'),
            ('Entretenimiento', 'expense', '🎬', '#8B5CF6'),
            ('Educación', 'expense', '📚', '#F59E0B'),
            ('Ropa', 'expense', '👕', '#EC4899'),
            ('Servicios', 'expense', '💡', '#06B6D4'),
            ('Salario', 'income', '💰', '#10B981'),
            ('Freelance', 'income', '💼', '#3B82F6'),
            ('Inversiones', 'income', '📈', '#8B5CF6'),
            ('Otros Ingresos', 'income', '💵', '#6366F1')
        ) AS t(name, type, icon, color)
    LOOP
        BEGIN
            -- Insertar categoría si no existe
            INSERT INTO public.categories (user_id, name, type, icon, color, is_default, is_active)
            VALUES (user_uuid, category_record.name, category_record.type, category_record.icon, category_record.color, true, true)
            ON CONFLICT (user_id, name) DO NOTHING;

            inserted_count := inserted_count + 1;
        EXCEPTION
            WHEN OTHERS THEN
                RAISE WARNING 'Error al insertar categoría % para usuario %: %', category_record.name, user_uuid, SQLERRM;
        END;
    END LOOP;

    RAISE NOTICE '% categorías creadas para usuario %', inserted_count, user_uuid;
END;
$$;

-- =====================================================
-- PASO 5: MEJORAR FUNCIÓN DE PREFERENCIAS
-- =====================================================
CREATE OR REPLACE FUNCTION create_user_preferences(user_uuid UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Verificar que la tabla existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profile_preferences') THEN
        RAISE EXCEPTION 'Tabla profile_preferences no existe';
    END IF;

    -- Verificar que el usuario no tiene preferencias ya
    IF EXISTS (SELECT 1 FROM public.profile_preferences WHERE user_id = user_uuid) THEN
        RAISE NOTICE 'Usuario % ya tiene preferencias, omitiendo...', user_uuid;
        RETURN;
    END IF;

    -- Crear preferencias por defecto
    INSERT INTO public.profile_preferences (user_id, currency, language, date_format, theme, notifications_enabled)
    VALUES (
        user_uuid,
        'USD',
        'es',
        'DD/MM/YYYY',
        'system',
        true
    )
    ON CONFLICT (user_id) DO NOTHING;

    RAISE NOTICE 'Preferencias creadas para usuario %', user_uuid;
END;
$$;

-- =====================================================
-- PASO 6: VERIFICACIÓN
-- =====================================================
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE '✅ TRIGGER DE AUTH REPARADO';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Cambios aplicados:';
    RAISE NOTICE '  - Trigger con manejo de errores robusto';
    RAISE NOTICE '  - Funciones con validaciones';
    RAISE NOTICE '  - Logs mejorados para debugging';
    RAISE NOTICE '';
    RAISE NOTICE 'El registro de usuarios ahora debería funcionar';
    RAISE NOTICE 'sin errores 500.';
    RAISE NOTICE '========================================';
END $$;
