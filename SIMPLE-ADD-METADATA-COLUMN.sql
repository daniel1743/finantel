-- =====================================================
-- SCRIPT SIMPLE: Solo agregar columna 'metadata'
-- =====================================================

-- Agregar columna metadata
ALTER TABLE public.transactions
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- Crear índice
DROP INDEX IF EXISTS idx_transactions_metadata;
CREATE INDEX idx_transactions_metadata
ON public.transactions USING GIN (metadata);

-- Verificar
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'transactions'
AND column_name = 'metadata';
