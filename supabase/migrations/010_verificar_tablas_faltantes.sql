-- =====================================================
-- VERIFICAR TABLAS FALTANTES
-- =====================================================
-- Este script verifica qué tablas existen y cuáles faltan
-- =====================================================

DO $$
DECLARE
    expected_tables TEXT[] := ARRAY[
        'categories',
        'budgets',
        'transactions',
        'goals',
        'family_groups',
        'family_group_members',
        'shared_expenses',
        'shared_expense_splits',
        'profile_preferences',
        'alerts',
        'audit_logs'
    ];
    existing_tables TEXT[];
    missing_tables TEXT[];
    table_name_var TEXT;
BEGIN
    -- Obtener tablas existentes
    SELECT array_agg(table_name ORDER BY table_name)
    INTO existing_tables
    FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name = ANY(expected_tables);
    
    -- Si no hay tablas existentes, inicializar array vacío
    IF existing_tables IS NULL THEN
        existing_tables := ARRAY[]::TEXT[];
    END IF;
    
    -- Encontrar tablas faltantes
    missing_tables := ARRAY[]::TEXT[];
    FOREACH table_name_var IN ARRAY expected_tables
    LOOP
        IF NOT (table_name_var = ANY(existing_tables)) THEN
            missing_tables := array_append(missing_tables, table_name_var);
        END IF;
    END LOOP;
    
    -- Mostrar resultados
    RAISE NOTICE '========================================';
    RAISE NOTICE '📊 VERIFICACIÓN DE TABLAS';
    RAISE NOTICE '========================================';
    RAISE NOTICE '';
    RAISE NOTICE '✅ Tablas existentes (%):', array_length(existing_tables, 1);
    IF array_length(existing_tables, 1) > 0 THEN
        FOREACH table_name_var IN ARRAY existing_tables
        LOOP
            RAISE NOTICE '   ✓ %', table_name_var;
        END LOOP;
    ELSE
        RAISE NOTICE '   (ninguna)';
    END IF;
    
    RAISE NOTICE '';
    RAISE NOTICE '❌ Tablas faltantes (%):', array_length(missing_tables, 1);
    IF array_length(missing_tables, 1) > 0 THEN
        FOREACH table_name_var IN ARRAY missing_tables
        LOOP
            RAISE NOTICE '   ✗ %', table_name_var;
        END LOOP;
    ELSE
        RAISE NOTICE '   (ninguna - todas las tablas existen)';
    END IF;
    
    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    
    -- Mostrar todas las tablas en public schema (por si hay alguna adicional)
    RAISE NOTICE '📋 Todas las tablas en schema public:';
    FOR table_name_var IN
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = 'public'
        ORDER BY table_name
    LOOP
        IF table_name_var = ANY(expected_tables) THEN
            RAISE NOTICE '   ✓ % (esperada)', table_name_var;
        ELSE
            RAISE NOTICE '   ⚠ % (NO esperada - tabla adicional?)', table_name_var;
        END IF;
    END LOOP;
    
    RAISE NOTICE '========================================';
END $$;

