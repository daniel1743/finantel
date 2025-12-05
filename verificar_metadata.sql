-- Ejecuta este SQL para verificar si la columna metadata existe
SELECT column_name, data_type, column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'goals' 
AND column_name = 'metadata';

-- Si no aparece ningún resultado, ejecuta esto:
-- ALTER TABLE public.goals ADD COLUMN metadata JSONB DEFAULT '{}'::jsonb;

