-- =====================================================
-- SCRIPT DE VERIFICACIÓN - Ejecuta esto en Supabase
-- =====================================================
-- Este script solo VERIFICA, no modifica nada
-- =====================================================

-- 1. Verificar columnas de la tabla CATEGORIES
SELECT
    '📋 TABLA CATEGORIES' as info,
    column_name as columna,
    data_type as tipo,
    column_default as valor_default,
    is_nullable as permite_null
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'categories'
ORDER BY ordinal_position;

-- 2. Verificar columnas de la tabla TRANSACTIONS
SELECT
    '📋 TABLA TRANSACTIONS' as info,
    column_name as columna,
    data_type as tipo,
    column_default as valor_default,
    is_nullable as permite_null
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'transactions'
ORDER BY ordinal_position;

-- 3. Verificar constraints de CATEGORIES
SELECT
    '🔒 CONSTRAINTS DE CATEGORIES' as info,
    constraint_name as nombre_constraint,
    constraint_type as tipo
FROM information_schema.table_constraints
WHERE table_schema = 'public'
AND table_name = 'categories';

-- 4. Verificar índices de TRANSACTIONS
SELECT
    '📑 ÍNDICES DE TRANSACTIONS' as info,
    indexname as nombre_indice,
    indexdef as definicion
FROM pg_indexes
WHERE schemaname = 'public'
AND tablename = 'transactions';

-- =====================================================
-- RESULTADO ESPERADO:
-- =====================================================
-- En CATEGORIES debe aparecer la columna: type (tipo: text)
-- En TRANSACTIONS debe aparecer la columna: metadata (tipo: jsonb)
-- En CONSTRAINTS debe aparecer: categories_type_check
-- En ÍNDICES debe aparecer: idx_transactions_metadata
-- =====================================================
