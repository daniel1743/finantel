-- =====================================================
-- MIGRACIÓN: Agregar campo restored_from_previous_cycle
-- =====================================================
-- Este script agrega el campo necesario para rastrear
-- transacciones restauradas del ciclo anterior
-- =====================================================

-- Agregar columna restored_from_previous_cycle a transactions
ALTER TABLE public.transactions 
ADD COLUMN IF NOT EXISTS restored_from_previous_cycle BOOLEAN DEFAULT false;

-- Agregar índice para optimizar búsquedas de transacciones restauradas
CREATE INDEX IF NOT EXISTS idx_transactions_restored 
ON public.transactions(user_id, restored_from_previous_cycle) 
WHERE restored_from_previous_cycle = true;

-- Comentario en la columna
COMMENT ON COLUMN public.transactions.restored_from_previous_cycle IS 
'Indica si esta transacción fue restaurada del ciclo anterior (últimos 7 días del mes anterior)';

