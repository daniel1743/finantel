-- =====================================================
-- SCRIPT DE VERIFICACIÓN DE MIGRACIONES
-- =====================================================
-- Ejecuta este script después de aplicar las migraciones
-- para verificar que todo se creó correctamente
-- =====================================================

-- 1. Verificar que las tablas existen
DO $$
DECLARE
    missing_tables TEXT[];
    table_name TEXT;
BEGIN
    missing_tables := ARRAY[]::TEXT[];
    
    FOR table_name IN 
        SELECT unnest(ARRAY[
            'family_groups',
            'family_group_members',
            'shared_expenses',
            'shared_expense_splits',
            'profile_preferences',
            'alerts'
        ])
    LOOP
        IF NOT EXISTS (
            SELECT 1 
            FROM information_schema.tables t
            WHERE t.table_schema = 'public' 
            AND t.table_name = table_name
        ) THEN
            missing_tables := array_append(missing_tables, table_name);
        END IF;
    END LOOP;
    
    IF array_length(missing_tables, 1) > 0 THEN
        RAISE EXCEPTION '❌ Faltan las siguientes tablas: %', array_to_string(missing_tables, ', ');
    ELSE
        RAISE NOTICE '✅ Todas las tablas existen correctamente';
    END IF;
END $$;

-- 2. Verificar que RLS está habilitado
DO $$
DECLARE
    tables_without_rls TEXT[];
    rec RECORD;
BEGIN
    tables_without_rls := ARRAY[]::TEXT[];
    
    FOR rec IN 
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename IN (
            'family_groups',
            'family_group_members',
            'shared_expenses',
            'shared_expense_splits',
            'profile_preferences',
            'alerts'
        )
    LOOP
        IF NOT EXISTS (
            SELECT 1 
            FROM pg_tables t
            JOIN pg_class c ON c.relname = t.tablename
            WHERE t.tablename = rec.tablename
            AND c.relrowsecurity = true
        ) THEN
            tables_without_rls := array_append(tables_without_rls, rec.tablename);
        END IF;
    END LOOP;
    
    IF array_length(tables_without_rls, 1) > 0 THEN
        RAISE WARNING '⚠️ Las siguientes tablas NO tienen RLS habilitado: %', array_to_string(tables_without_rls, ', ');
    ELSE
        RAISE NOTICE '✅ RLS está habilitado en todas las tablas';
    END IF;
END $$;

-- 3. Verificar que existen políticas RLS
DO $$
DECLARE
    expected_policies INTEGER := 20; -- Número aproximado de políticas esperadas
    actual_policies INTEGER;
BEGIN
    SELECT COUNT(*) INTO actual_policies
    FROM pg_policies
    WHERE schemaname = 'public'
    AND tablename IN (
        'family_groups',
        'family_group_members',
        'shared_expenses',
        'shared_expense_splits',
        'profile_preferences',
        'alerts'
    );
    
    IF actual_policies < expected_policies THEN
        RAISE WARNING '⚠️ Se encontraron % políticas, se esperaban al menos %', actual_policies, expected_policies;
    ELSE
        RAISE NOTICE '✅ Se encontraron % políticas RLS', actual_policies;
    END IF;
END $$;

-- 4. Verificar índices
DO $$
DECLARE
    missing_indexes TEXT[];
    idx_name TEXT;
BEGIN
    missing_indexes := ARRAY[]::TEXT[];
    
    -- Verificar algunos índices críticos
    FOR idx_name IN 
        SELECT unnest(ARRAY[
            'idx_family_groups_created_by',
            'idx_family_group_members_group',
            'idx_shared_expenses_group',
            'idx_shared_expense_splits_expense',
            'idx_profile_preferences_user',
            'idx_alerts_user'
        ])
    LOOP
        IF NOT EXISTS (
            SELECT 1 
            FROM pg_indexes 
            WHERE schemaname = 'public' 
            AND indexname = idx_name
        ) THEN
            missing_indexes := array_append(missing_indexes, idx_name);
        END IF;
    END LOOP;
    
    IF array_length(missing_indexes, 1) > 0 THEN
        RAISE WARNING '⚠️ Faltan los siguientes índices: %', array_to_string(missing_indexes, ', ');
    ELSE
        RAISE NOTICE '✅ Los índices críticos existen';
    END IF;
END $$;

-- 5. Verificar triggers
DO $$
DECLARE
    trigger_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO trigger_count
    FROM pg_trigger t
    JOIN pg_class c ON c.oid = t.tgrelid
    WHERE c.relname IN (
        'family_groups',
        'shared_expenses',
        'profile_preferences'
    )
    AND t.tgname LIKE '%updated_at%';
    
    IF trigger_count < 3 THEN
        RAISE WARNING '⚠️ Se encontraron % triggers de updated_at, se esperaban 3', trigger_count;
    ELSE
        RAISE NOTICE '✅ Los triggers de updated_at están configurados';
    END IF;
END $$;

-- 6. Verificar constraints y foreign keys
DO $$
DECLARE
    fk_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO fk_count
    FROM information_schema.table_constraints tc
    JOIN information_schema.constraint_column_usage ccu 
        ON tc.constraint_name = ccu.constraint_name
    WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_schema = 'public'
    AND tc.table_name IN (
        'family_groups',
        'family_group_members',
        'shared_expenses',
        'shared_expense_splits',
        'profile_preferences',
        'alerts'
    );
    
    IF fk_count < 10 THEN
        RAISE WARNING '⚠️ Se encontraron % foreign keys, se esperaban al menos 10', fk_count;
    ELSE
        RAISE NOTICE '✅ Se encontraron % foreign keys configuradas', fk_count;
    END IF;
END $$;

-- 7. Resumen final
SELECT 
    '✅ VERIFICACIÓN COMPLETA' as status,
    (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('family_groups', 'family_group_members', 'shared_expenses', 'shared_expense_splits', 'profile_preferences', 'alerts')) as tablas_creadas,
    (SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public' AND tablename IN ('family_groups', 'family_group_members', 'shared_expenses', 'shared_expense_splits', 'profile_preferences', 'alerts')) as politicas_rls,
    (SELECT COUNT(*) FROM pg_indexes WHERE schemaname = 'public' AND indexname LIKE 'idx_%' AND tablename IN ('family_groups', 'family_group_members', 'shared_expenses', 'shared_expense_splits', 'profile_preferences', 'alerts')) as indices_creados;

