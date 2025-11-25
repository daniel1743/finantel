-- =====================================================
-- AGREGAR CAMPO necessity_level A TRANSACTIONS
-- =====================================================
-- Este campo permite clasificar las transacciones por necesidad:
-- - essential: Necesidades básicas (comida, salud, transporte al trabajo)
-- - important: Importantes pero no urgentes (educación, ahorros)
-- - discretionary: Discrecionales/opcionales (entretenimiento, lujos)
-- =====================================================

-- 1. Agregar columna necessity_level
ALTER TABLE public.transactions
ADD COLUMN IF NOT EXISTS necessity_level TEXT
DEFAULT 'discretionary'
CHECK (necessity_level IN ('essential', 'important', 'discretionary'));

-- 2. Crear índice para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_transactions_necessity_level
ON public.transactions(necessity_level);

-- 3. Crear índice combinado para análisis
CREATE INDEX IF NOT EXISTS idx_transactions_user_necessity
ON public.transactions(user_id, necessity_level, date DESC);

-- 4. Agregar comentarios para documentación
COMMENT ON COLUMN public.transactions.necessity_level IS
'Nivel de necesidad: essential (necesario), important (importante), discretionary (discrecional)';

-- =====================================================
-- DATOS DE EJEMPLO / MIGRACIÓN DE DATOS EXISTENTES
-- =====================================================

-- Actualizar transacciones existentes según categoría
-- (opcional, puedes comentar esto si quieres mantener todo como 'discretionary')

UPDATE public.transactions t
SET necessity_level = 'essential'
FROM public.categories c
WHERE t.category_id = c.id
AND LOWER(c.name) IN ('alimentación', 'salud', 'vivienda', 'servicios básicos', 'transporte')
AND t.necessity_level = 'discretionary'; -- Solo actualizar las que no han sido configuradas

UPDATE public.transactions t
SET necessity_level = 'important'
FROM public.categories c
WHERE t.category_id = c.id
AND LOWER(c.name) IN ('educación', 'trabajo', 'ahorro', 'inversiones')
AND t.necessity_level = 'discretionary';

-- Las demás se quedan como 'discretionary'

-- =====================================================
-- VERIFICACIÓN
-- =====================================================

-- Contar transacciones por nivel de necesidad
-- SELECT necessity_level, COUNT(*)
-- FROM public.transactions
-- GROUP BY necessity_level;
