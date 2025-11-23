-- =====================================================
-- SCRIPT DE VERIFICACIÓN - Estructura Existente
-- =====================================================
-- Ejecuta este script PRIMERO para ver qué tablas ya existen
-- =====================================================

-- 1. Ver todas las tablas públicas
SELECT
    '📋 TABLAS EXISTENTES' as info,
    table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- 2. Ver columnas de cada tabla (si existen)
DO $$
DECLARE
    tbl TEXT;
    rec RECORD; -- Declarar la variable rec como RECORD
BEGIN
    FOR tbl IN
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_type = 'BASE TABLE'
        AND table_name IN ('transactions', 'categories', 'budgets', 'goals',
                          'family_groups', 'shared_expenses', 'profile_preferences', 'alerts')
    LOOP
        RAISE NOTICE '';
        RAISE NOTICE '📊 Tabla: %', tbl;
        RAISE NOTICE '─────────────────────────────────────';

        FOR rec IN
            SELECT column_name, data_type, is_nullable
            FROM information_schema.columns
            WHERE table_schema = 'public'
            AND table_name = tbl
            ORDER BY ordinal_position
        LOOP
            RAISE NOTICE '  • % (%)', rec.column_name, rec.data_type;
        END LOOP;
    END LOOP;
END $$;

-- 3. Ver Foreign Keys existentes
SELECT
    '🔗 FOREIGN KEYS EXISTENTES' as info,
    tc.table_name as tabla_origen,
    kcu.column_name as columna_origen,
    ccu.table_name as tabla_referenciada,
    ccu.column_name as columna_referenciada
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
AND tc.table_schema = 'public'
ORDER BY tc.table_name;

-- 4. Ver políticas RLS existentes
SELECT
    '🔐 POLÍTICAS RLS EXISTENTES' as info,
    schemaname,
    tablename,
    policyname,
    cmd as comando
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- 5. Ver si RLS está habilitado
SELECT
    '✅ TABLAS CON RLS HABILITADO' as info,
    tablename,
    rowsecurity as rls_habilitado
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- 6. Contar datos en cada tabla
DO $$
DECLARE
    tbl TEXT;
    cnt INTEGER;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '📊 CONTEO DE REGISTROS';
    RAISE NOTICE '─────────────────────────────────────';

    FOR tbl IN
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_type = 'BASE TABLE'
        ORDER BY table_name
    LOOP
        EXECUTE format('SELECT COUNT(*) FROM public.%I', tbl) INTO cnt;
        RAISE NOTICE '  • %: % registros', tbl, cnt;
    END LOOP;
END $$;

-- =====================================================
-- RESUMEN FINAL
-- =====================================================

SELECT
    'RESUMEN GENERAL' as tipo,
    (SELECT COUNT(*) FROM information_schema.tables
     WHERE table_schema = 'public' AND table_type = 'BASE TABLE') as total_tablas,
    (SELECT COUNT(*) FROM information_schema.table_constraints
     WHERE constraint_type = 'FOREIGN KEY' AND table_schema = 'public') as total_foreign_keys,
    (SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public') as total_politicas_rls,
    (SELECT COUNT(*) FROM pg_tables
     WHERE schemaname = 'public' AND rowsecurity = true) as tablas_con_rls;
