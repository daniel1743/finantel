-- =====================================================
-- FIX: Foreign Key en support_tickets
-- =====================================================
-- Error: Could not find a relationship between 'support_tickets' and 'user_id'
-- Solución: Agregar foreign key explícita a auth.users
-- =====================================================

-- 1. Verificar que la tabla existe
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'support_tickets') THEN
        RAISE EXCEPTION 'La tabla support_tickets no existe';
    END IF;
END $$;

-- 2. Eliminar constraint vieja si existe (puede tener nombre diferente)
ALTER TABLE public.support_tickets
DROP CONSTRAINT IF EXISTS support_tickets_user_id_fkey;

ALTER TABLE public.support_tickets
DROP CONSTRAINT IF EXISTS fk_support_tickets_user;

-- 3. Agregar foreign key correcta a auth.users
ALTER TABLE public.support_tickets
ADD CONSTRAINT support_tickets_user_id_fkey
FOREIGN KEY (user_id)
REFERENCES auth.users(id)
ON DELETE CASCADE;

-- 4. Crear índice para mejorar performance
CREATE INDEX IF NOT EXISTS idx_support_tickets_user_id
ON public.support_tickets(user_id);

-- 5. Verificación
DO $$
DECLARE
    fk_exists BOOLEAN;
BEGIN
    SELECT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'support_tickets_user_id_fkey'
    ) INTO fk_exists;

    IF fk_exists THEN
        RAISE NOTICE '✅ Foreign key creada correctamente';
    ELSE
        RAISE EXCEPTION '❌ No se pudo crear el foreign key';
    END IF;
END $$;

-- =====================================================
-- COMENTARIOS
-- =====================================================
COMMENT ON CONSTRAINT support_tickets_user_id_fkey ON public.support_tickets IS
'Foreign key a auth.users para relacionar tickets con usuarios';
