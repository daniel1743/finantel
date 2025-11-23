-- =====================================================
-- SISTEMA DE POBLADO AUTOMÁTICO DE DATOS PARA NUEVOS USUARIOS
-- =====================================================
-- Este script:
-- 1. Crea categorías por defecto cuando se registra un usuario
-- 2. Crea preferencias de perfil automáticamente
-- 3. Genera transacciones de ejemplo basadas en datos del onboarding
-- 4. Se ejecuta automáticamente cuando se crea un nuevo usuario
-- =====================================================

-- =====================================================
-- PASO 1: FUNCIÓN PARA CREAR CATEGORÍAS POR DEFECTO
-- =====================================================
CREATE OR REPLACE FUNCTION create_default_categories(user_uuid UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    category_record RECORD;
BEGIN
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
        -- Insertar categoría si no existe
        INSERT INTO public.categories (user_id, name, type, icon, color, is_default, is_active)
        VALUES (user_uuid, category_record.name, category_record.type, category_record.icon, category_record.color, true, true)
        ON CONFLICT (user_id, name) DO NOTHING;
    END LOOP;
    
    RAISE NOTICE 'Categorías por defecto creadas para usuario %', user_uuid;
END;
$$;

-- =====================================================
-- PASO 2: FUNCIÓN PARA CREAR PREFERENCIAS DE PERFIL
-- =====================================================
CREATE OR REPLACE FUNCTION create_user_preferences(user_uuid UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Crear preferencias por defecto si no existen
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
    
    RAISE NOTICE 'Preferencias de perfil creadas para usuario %', user_uuid;
END;
$$;

-- =====================================================
-- PASO 3: FUNCIÓN PARA GENERAR TRANSACCIONES DE EJEMPLO
-- =====================================================
CREATE OR REPLACE FUNCTION generate_sample_transactions(
    user_uuid UUID,
    monthly_income DECIMAL DEFAULT 3000.00,
    savings_goal DECIMAL DEFAULT 500.00
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    category_id_var UUID;
    transaction_date DATE;
    i INTEGER;
    expense_categories UUID[];
    income_categories UUID[];
    total_expenses DECIMAL := 0;
    expense_amount DECIMAL;
    income_amount DECIMAL;
BEGIN
    -- Obtener IDs de categorías de gastos
    SELECT ARRAY_AGG(id) INTO expense_categories
    FROM public.categories
    WHERE user_id = user_uuid AND type = 'expense' AND is_active = true
    LIMIT 8;
    
    -- Obtener IDs de categorías de ingresos
    SELECT ARRAY_AGG(id) INTO income_categories
    FROM public.categories
    WHERE user_id = user_uuid AND type = 'income' AND is_active = true
    LIMIT 2;
    
    -- Si no hay categorías, salir
    IF expense_categories IS NULL OR array_length(expense_categories, 1) = 0 THEN
        RAISE NOTICE 'No hay categorías de gastos. Creando categorías primero...';
        PERFORM create_default_categories(user_uuid);
        
        -- Reintentar obtener categorías
        SELECT ARRAY_AGG(id) INTO expense_categories
        FROM public.categories
        WHERE user_id = user_uuid AND type = 'expense' AND is_active = true
        LIMIT 8;
        
        SELECT ARRAY_AGG(id) INTO income_categories
        FROM public.categories
        WHERE user_id = user_uuid AND type = 'income' AND is_active = true
        LIMIT 2;
    END IF;
    
    -- Calcular gastos totales (70% del ingreso mensual)
    total_expenses := monthly_income * 0.70;
    
    -- Generar transacciones de los últimos 30 días
    FOR i IN 1..30 LOOP
        transaction_date := CURRENT_DATE - (i - 1);
        
        -- Generar 1-3 transacciones por día (aleatorio)
        FOR j IN 1..(1 + floor(random() * 2)::INTEGER) LOOP
            -- Seleccionar categoría aleatoria de gastos
            category_id_var := expense_categories[1 + floor(random() * array_length(expense_categories, 1))::INTEGER];
            
            -- Generar monto aleatorio (entre $10 y $200)
            expense_amount := 10 + (random() * 190);
            
            -- Insertar transacción de gasto
            INSERT INTO public.transactions (
                user_id,
                category_id,
                type,
                amount,
                description,
                date,
                metadata
            )
            VALUES (
                user_uuid,
                category_id_var,
                'expense',
                expense_amount,
                'Transacción de ejemplo - ' || to_char(transaction_date, 'DD/MM/YYYY'),
                transaction_date,
                jsonb_build_object(
                    'necessity_level', 
                    CASE 
                        WHEN random() < 0.3 THEN 'essential'
                        WHEN random() < 0.6 THEN 'important'
                        ELSE 'optional'
                    END,
                    'is_sample', true
                )
            );
        END LOOP;
        
        -- Cada 5 días, agregar un ingreso
        IF i % 5 = 0 AND income_categories IS NOT NULL AND array_length(income_categories, 1) > 0 THEN
            category_id_var := income_categories[1 + floor(random() * array_length(income_categories, 1))::INTEGER];
            income_amount := monthly_income / 6; -- Dividir ingreso mensual en ~6 pagos
            
            INSERT INTO public.transactions (
                user_id,
                category_id,
                type,
                amount,
                description,
                date,
                metadata
            )
            VALUES (
                user_uuid,
                category_id_var,
                'income',
                income_amount,
                'Ingreso de ejemplo - ' || to_char(transaction_date, 'DD/MM/YYYY'),
                transaction_date,
                jsonb_build_object('is_sample', true)
            );
        END IF;
    END LOOP;
    
    RAISE NOTICE 'Transacciones de ejemplo generadas para usuario %', user_uuid;
END;
$$;

-- =====================================================
-- PASO 4: FUNCIÓN PRINCIPAL QUE SE EJECUTA AL CREAR USUARIO
-- =====================================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Crear categorías por defecto
    PERFORM create_default_categories(NEW.id);
    
    -- Crear preferencias de perfil
    PERFORM create_user_preferences(NEW.id);
    
    RAISE NOTICE 'Datos iniciales creados para nuevo usuario: %', NEW.id;
    
    RETURN NEW;
END;
$$;

-- =====================================================
-- PASO 5: CREAR TRIGGER QUE SE EJECUTA AL CREAR USUARIO
-- =====================================================
-- Nota: Este trigger se ejecuta cuando se crea un usuario en auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user();

-- =====================================================
-- PASO 6: FUNCIÓN PARA EJECUTAR MANUALMENTE (desde onboarding)
-- =====================================================
-- Esta función puede ser llamada desde el frontend después del onboarding
CREATE OR REPLACE FUNCTION complete_user_onboarding(
    user_uuid UUID,
    monthly_income DECIMAL DEFAULT NULL,
    savings_goal DECIMAL DEFAULT NULL,
    generate_samples BOOLEAN DEFAULT true
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result JSONB;
BEGIN
    -- Asegurar que las categorías y preferencias existen
    PERFORM create_default_categories(user_uuid);
    PERFORM create_user_preferences(user_uuid);
    
    -- Si se proporcionan datos y se solicita generar muestras
    IF generate_samples AND monthly_income IS NOT NULL THEN
        PERFORM generate_sample_transactions(
            user_uuid,
            monthly_income,
            COALESCE(savings_goal, monthly_income * 0.20)
        );
    END IF;
    
    -- Retornar resultado
    result := jsonb_build_object(
        'success', true,
        'message', 'Onboarding completado exitosamente',
        'user_id', user_uuid
    );
    
    RETURN result;
END;
$$;

-- =====================================================
-- PASO 7: PERMISOS Y SEGURIDAD
-- =====================================================
-- Las funciones son SECURITY DEFINER, así que pueden ejecutarse
-- con los permisos del propietario de la función

-- Otorgar permisos de ejecución a usuarios autenticados
GRANT EXECUTE ON FUNCTION create_default_categories(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION create_user_preferences(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION generate_sample_transactions(UUID, DECIMAL, DECIMAL) TO authenticated;
GRANT EXECUTE ON FUNCTION complete_user_onboarding(UUID, DECIMAL, DECIMAL, BOOLEAN) TO authenticated;

-- =====================================================
-- VERIFICACIÓN
-- =====================================================
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'SISTEMA DE POBLADO AUTOMATICO CREADO';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Funciones creadas:';
    RAISE NOTICE '  - create_default_categories()';
    RAISE NOTICE '  - create_user_preferences()';
    RAISE NOTICE '  - generate_sample_transactions()';
    RAISE NOTICE '  - handle_new_user() [trigger function]';
    RAISE NOTICE '  - complete_user_onboarding()';
    RAISE NOTICE '';
    RAISE NOTICE 'Trigger creado:';
    RAISE NOTICE '  - on_auth_user_created (en auth.users)';
    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Los nuevos usuarios recibiran automaticamente:';
    RAISE NOTICE '  - 12 categorias por defecto';
    RAISE NOTICE '  - Preferencias de perfil';
    RAISE NOTICE '  - Transacciones de ejemplo (si se llama complete_user_onboarding)';
    RAISE NOTICE '========================================';
END $$;

-- =====================================================
-- ✅ SCRIPT COMPLETADO
-- =====================================================

