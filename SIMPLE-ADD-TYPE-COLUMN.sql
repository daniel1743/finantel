-- =====================================================
-- SCRIPT SIMPLE: Solo agregar columna 'type'
-- =====================================================

-- Agregar columna type
ALTER TABLE public.categories
ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'expense' NOT NULL;

-- Agregar constraint
ALTER TABLE public.categories
DROP CONSTRAINT IF EXISTS categories_type_check;

ALTER TABLE public.categories
ADD CONSTRAINT categories_type_check
CHECK (type IN ('income', 'expense', 'savings'));

-- Actualizar registros existentes
UPDATE public.categories
SET type = 'expense'
WHERE type IS NULL OR type = '';

-- Verificar
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'categories'
AND column_name = 'type';
