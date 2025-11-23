-- =====================================================
-- SCRIPT DE VERIFICACIÓN COMPLETA
-- =====================================================
-- Ejecuta este script después de la migración para
-- verificar que todo está configurado correctamente
-- =====================================================

-- =====================================================
-- 1. VERIFICAR TABLAS CREADAS
-- =====================================================

SELECT
    '📊 TABLAS' as seccion,
    table_name as nombre,
    (SELECT COUNT(*)
     FROM information_schema.columns
     WHERE table_schema = 'public'
     AND table_name = t.table_name) as columnas
FROM information_schema.tables t
WHERE table_schema = 'public'
AND table_name IN (
    'categories', 'budgets', 'transactions', 'goals',
    'family_groups', 'family_group_members',
    'shared_expenses', 'shared_expense_splits',
    'profile_preferences', 'alerts', 'audit_logs'
)
ORDER BY table_name;

-- =====================================================
-- 2. VERIFICAR ROW LEVEL SECURITY (RLS)
-- =====================================================

SELECT
    '🔐 RLS' as seccion,
    tablename as tabla,
    CASE
        WHEN rowsecurity THEN '✅ Habilitado'
        ELSE '❌ DESHABILITADO'
    END as estado
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN (
    'categories', 'budgets', 'transactions', 'goals',
    'family_groups', 'family_group_members',
    'shared_expenses', 'shared_expense_splits',
    'profile_preferences', 'alerts', 'audit_logs'
)
ORDER BY tablename;

-- =====================================================
-- 3. VERIFICAR POLÍTICAS RLS
-- =====================================================

SELECT
    '🛡️ POLÍTICAS RLS' as seccion,
    tablename as tabla,
    cmd as operacion,
    policyname as politica
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename,
    CASE cmd
        WHEN 'SELECT' THEN 1
        WHEN 'INSERT' THEN 2
        WHEN 'UPDATE' THEN 3
        WHEN 'DELETE' THEN 4
    END;

-- Resumen de políticas por tabla
SELECT
    '📈 RESUMEN POLÍTICAS' as seccion,
    tablename as tabla,
    COUNT(*) as total_politicas,
    COUNT(*) FILTER (WHERE cmd = 'SELECT') as select_policies,
    COUNT(*) FILTER (WHERE cmd = 'INSERT') as insert_policies,
    COUNT(*) FILTER (WHERE cmd = 'UPDATE') as update_policies,
    COUNT(*) FILTER (WHERE cmd = 'DELETE') as delete_policies
FROM pg_policies
WHERE schemaname = 'public'
GROUP BY tablename
ORDER BY tablename;

-- =====================================================
-- 4. VERIFICAR ÍNDICES
-- =====================================================

SELECT
    '⚡ ÍNDICES' as seccion,
    tablename as tabla,
    indexname as indice,
    indexdef as definicion
FROM pg_indexes
WHERE schemaname = 'public'
AND indexname LIKE 'idx_%'
ORDER BY tablename, indexname;

-- Resumen de índices por tabla
SELECT
    '📊 RESUMEN ÍNDICES' as seccion,
    tablename as tabla,
    COUNT(*) as total_indices
FROM pg_indexes
WHERE schemaname = 'public'
AND indexname LIKE 'idx_%'
GROUP BY tablename
ORDER BY total_indices DESC, tablename;

-- =====================================================
-- 5. VERIFICAR FOREIGN KEYS (RELACIONES)
-- =====================================================

SELECT
    '🔗 RELACIONES (FOREIGN KEYS)' as seccion,
    tc.table_name as tabla_origen,
    kcu.column_name as columna,
    ccu.table_name as tabla_destino,
    ccu.column_name as columna_destino,
    rc.delete_rule as on_delete,
    rc.update_rule as on_update
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
JOIN information_schema.referential_constraints rc
    ON rc.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
AND tc.table_schema = 'public'
ORDER BY tc.table_name, kcu.column_name;

-- =====================================================
-- 6. VERIFICAR TRIGGERS
-- =====================================================

SELECT
    '⚙️ TRIGGERS' as seccion,
    tgrelid::regclass as tabla,
    tgname as trigger_nombre,
    CASE
        WHEN tgtype & 2 = 2 THEN 'BEFORE'
        WHEN tgtype & 64 = 64 THEN 'INSTEAD OF'
        ELSE 'AFTER'
    END as timing,
    CASE
        WHEN tgtype & 4 = 4 THEN 'INSERT'
        WHEN tgtype & 8 = 8 THEN 'DELETE'
        WHEN tgtype & 16 = 16 THEN 'UPDATE'
        ELSE 'OTHER'
    END as evento,
    pg_get_functiondef(tgfoid) as funcion
FROM pg_trigger
WHERE tgname NOT LIKE 'pg_%'
AND tgname NOT LIKE 'RI_ConstraintTrigger%'
ORDER BY tgrelid::regclass, tgname;

-- Resumen de triggers
SELECT
    '📊 RESUMEN TRIGGERS' as seccion,
    tgrelid::regclass as tabla,
    COUNT(*) as total_triggers
FROM pg_trigger
WHERE tgname NOT LIKE 'pg_%'
AND tgname NOT LIKE 'RI_ConstraintTrigger%'
GROUP BY tgrelid::regclass
ORDER BY total_triggers DESC;

-- =====================================================
-- 7. VERIFICAR FUNCIONES CREADAS
-- =====================================================

SELECT
    '🔧 FUNCIONES' as seccion,
    proname as nombre_funcion,
    pg_get_function_identity_arguments(oid) as argumentos,
    prosrc as codigo
FROM pg_proc
WHERE pronamespace = 'public'::regnamespace
AND proname IN (
    'update_updated_at_column',
    'add_creator_to_group',
    'log_audit'
)
ORDER BY proname;

-- =====================================================
-- 8. VERIFICAR CONSTRAINTS (VALIDACIONES)
-- =====================================================

SELECT
    '✅ CONSTRAINTS' as seccion,
    tc.table_name as tabla,
    tc.constraint_name as constraint,
    tc.constraint_type as tipo,
    CASE
        WHEN tc.constraint_type = 'CHECK' THEN pg_get_constraintdef(pgc.oid)
        WHEN tc.constraint_type = 'UNIQUE' THEN
            (SELECT string_agg(column_name, ', ')
             FROM information_schema.key_column_usage kcu
             WHERE kcu.constraint_name = tc.constraint_name)
        ELSE ''
    END as definicion
FROM information_schema.table_constraints tc
LEFT JOIN pg_constraint pgc ON pgc.conname = tc.constraint_name
WHERE tc.table_schema = 'public'
AND tc.table_name IN (
    'categories', 'budgets', 'transactions', 'goals',
    'family_groups', 'family_group_members',
    'shared_expenses', 'shared_expense_splits',
    'profile_preferences', 'alerts', 'audit_logs'
)
ORDER BY tc.table_name, tc.constraint_type, tc.constraint_name;

-- =====================================================
-- 9. VERIFICAR COLUMNAS CLAVE
-- =====================================================

-- Verificar que todas las tablas tienen user_id o equivalente
SELECT
    '👤 COLUMNAS USER_ID' as seccion,
    table_name as tabla,
    column_name as columna,
    data_type as tipo,
    CASE
        WHEN is_nullable = 'NO' THEN '✅ NOT NULL'
        ELSE '⚠️ NULLABLE'
    END as nullable
FROM information_schema.columns
WHERE table_schema = 'public'
AND (
    column_name = 'user_id' OR
    column_name = 'created_by' OR
    column_name = 'paid_by_user_id'
)
ORDER BY table_name, column_name;

-- Verificar columnas de timestamp
SELECT
    '🕐 COLUMNAS TIMESTAMP' as seccion,
    table_name as tabla,
    column_name as columna,
    column_default as valor_default
FROM information_schema.columns
WHERE table_schema = 'public'
AND column_name IN ('created_at', 'updated_at')
ORDER BY table_name, column_name;

-- =====================================================
-- 10. RESUMEN GENERAL
-- =====================================================

DO $$
DECLARE
    v_tables INTEGER;
    v_tables_with_rls INTEGER;
    v_policies INTEGER;
    v_indexes INTEGER;
    v_triggers INTEGER;
    v_functions INTEGER;
    v_foreign_keys INTEGER;
BEGIN
    -- Contar tablas
    SELECT COUNT(*) INTO v_tables
    FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name IN (
        'categories', 'budgets', 'transactions', 'goals',
        'family_groups', 'family_group_members',
        'shared_expenses', 'shared_expense_splits',
        'profile_preferences', 'alerts', 'audit_logs'
    );

    -- Contar tablas con RLS
    SELECT COUNT(*) INTO v_tables_with_rls
    FROM pg_tables
    WHERE schemaname = 'public'
    AND rowsecurity = true;

    -- Contar políticas
    SELECT COUNT(*) INTO v_policies
    FROM pg_policies
    WHERE schemaname = 'public';

    -- Contar índices
    SELECT COUNT(*) INTO v_indexes
    FROM pg_indexes
    WHERE schemaname = 'public'
    AND indexname LIKE 'idx_%';

    -- Contar triggers
    SELECT COUNT(*) INTO v_triggers
    FROM pg_trigger
    WHERE tgname NOT LIKE 'pg_%'
    AND tgname NOT LIKE 'RI_ConstraintTrigger%';

    -- Contar funciones
    SELECT COUNT(*) INTO v_functions
    FROM pg_proc
    WHERE pronamespace = 'public'::regnamespace
    AND proname IN (
        'update_updated_at_column',
        'add_creator_to_group',
        'log_audit'
    );

    -- Contar foreign keys
    SELECT COUNT(*) INTO v_foreign_keys
    FROM information_schema.table_constraints
    WHERE constraint_type = 'FOREIGN KEY'
    AND table_schema = 'public';

    -- Mostrar resumen
    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE '📊 RESUMEN DE VERIFICACIÓN COMPLETA';
    RAISE NOTICE '========================================';
    RAISE NOTICE '';
    RAISE NOTICE '✅ Tablas creadas: % / 11', v_tables;
    RAISE NOTICE '✅ Tablas con RLS: % / 11', v_tables_with_rls;
    RAISE NOTICE '✅ Políticas RLS: % / 44+', v_policies;
    RAISE NOTICE '✅ Índices: % / 40+', v_indexes;
    RAISE NOTICE '✅ Triggers: % / 10+', v_triggers;
    RAISE NOTICE '✅ Funciones: % / 3', v_functions;
    RAISE NOTICE '✅ Foreign Keys: %', v_foreign_keys;
    RAISE NOTICE '';

    -- Validaciones
    IF v_tables <> 11 THEN
        RAISE WARNING '⚠️ Faltan tablas: se esperaban 11, se encontraron %', v_tables;
    END IF;

    IF v_tables_with_rls <> 11 THEN
        RAISE WARNING '⚠️ No todas las tablas tienen RLS habilitado';
    END IF;

    IF v_policies < 44 THEN
        RAISE WARNING '⚠️ Faltan políticas RLS: se esperaban al menos 44, se encontraron %', v_policies;
    END IF;

    IF v_functions <> 3 THEN
        RAISE WARNING '⚠️ Faltan funciones: se esperaban 3, se encontraron %', v_functions;
    END IF;

    -- Resultado final
    IF v_tables = 11 AND v_tables_with_rls = 11 AND v_policies >= 44 AND v_functions = 3 THEN
        RAISE NOTICE '🎉 ¡MIGRACIÓN COMPLETADA EXITOSAMENTE!';
        RAISE NOTICE '';
        RAISE NOTICE 'Todas las verificaciones pasaron correctamente.';
        RAISE NOTICE 'Tu base de datos está lista para usar.';
    ELSE
        RAISE WARNING '⚠️ Algunas verificaciones fallaron. Revisa los mensajes anteriores.';
    END IF;

    RAISE NOTICE '';
    RAISE NOTICE '========================================';
END $$;

-- =====================================================
-- 11. VERIFICAR RELACIONES ESPECÍFICAS
-- =====================================================

SELECT '🔗 VALIDACIÓN DE RELACIONES REQUERIDAS' as seccion;

-- 1. transactions → categories
SELECT
    CASE
        WHEN EXISTS (
            SELECT 1 FROM information_schema.table_constraints tc
            JOIN information_schema.key_column_usage kcu
                ON tc.constraint_name = kcu.constraint_name
            JOIN information_schema.constraint_column_usage ccu
                ON ccu.constraint_name = tc.constraint_name
            WHERE tc.constraint_type = 'FOREIGN KEY'
            AND tc.table_name = 'transactions'
            AND kcu.column_name = 'category_id'
            AND ccu.table_name = 'categories'
        ) THEN '✅ transactions → categories'
        ELSE '❌ FALTA: transactions → categories'
    END as relacion_1;

-- 2. transactions → budgets
SELECT
    CASE
        WHEN EXISTS (
            SELECT 1 FROM information_schema.table_constraints tc
            JOIN information_schema.key_column_usage kcu
                ON tc.constraint_name = kcu.constraint_name
            JOIN information_schema.constraint_column_usage ccu
                ON ccu.constraint_name = tc.constraint_name
            WHERE tc.constraint_type = 'FOREIGN KEY'
            AND tc.table_name = 'transactions'
            AND kcu.column_name = 'budget_id'
            AND ccu.table_name = 'budgets'
        ) THEN '✅ transactions → budgets'
        ELSE '❌ FALTA: transactions → budgets'
    END as relacion_2;

-- 3. budgets → categories
SELECT
    CASE
        WHEN EXISTS (
            SELECT 1 FROM information_schema.table_constraints tc
            JOIN information_schema.key_column_usage kcu
                ON tc.constraint_name = kcu.constraint_name
            JOIN information_schema.constraint_column_usage ccu
                ON ccu.constraint_name = tc.constraint_name
            WHERE tc.constraint_type = 'FOREIGN KEY'
            AND tc.table_name = 'budgets'
            AND kcu.column_name = 'category_id'
            AND ccu.table_name = 'categories'
        ) THEN '✅ budgets → categories'
        ELSE '❌ FALTA: budgets → categories'
    END as relacion_3;

-- 4. shared_expenses → family_groups
SELECT
    CASE
        WHEN EXISTS (
            SELECT 1 FROM information_schema.table_constraints tc
            JOIN information_schema.key_column_usage kcu
                ON tc.constraint_name = kcu.constraint_name
            JOIN information_schema.constraint_column_usage ccu
                ON ccu.constraint_name = tc.constraint_name
            WHERE tc.constraint_type = 'FOREIGN KEY'
            AND tc.table_name = 'shared_expenses'
            AND kcu.column_name = 'family_group_id'
            AND ccu.table_name = 'family_groups'
        ) THEN '✅ shared_expenses → family_groups'
        ELSE '❌ FALTA: shared_expenses → family_groups'
    END as relacion_4;

-- 5. shared_expenses → categories
SELECT
    CASE
        WHEN EXISTS (
            SELECT 1 FROM information_schema.table_constraints tc
            JOIN information_schema.key_column_usage kcu
                ON tc.constraint_name = kcu.constraint_name
            JOIN information_schema.constraint_column_usage ccu
                ON ccu.constraint_name = tc.constraint_name
            WHERE tc.constraint_type = 'FOREIGN KEY'
            AND tc.table_name = 'shared_expenses'
            AND kcu.column_name = 'category_id'
            AND ccu.table_name = 'categories'
        ) THEN '✅ shared_expenses → categories'
        ELSE '❌ FALTA: shared_expenses → categories'
    END as relacion_5;

-- =====================================================
-- FIN DE VERIFICACIÓN
-- =====================================================

SELECT '🎉 VERIFICACIÓN COMPLETADA' as resultado;
SELECT 'Revisa los resultados anteriores para confirmar que todo está correcto' as mensaje;
