-- SQL SIMPLE para ejecutar directamente en Supabase SQL Editor
-- Agregar columna metadata a goals si no existe

-- Opción 1: Si la tabla goals existe, agregar metadata
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'goals' 
        AND column_name = 'metadata'
    ) THEN
        RAISE NOTICE 'La columna metadata ya existe en goals';
    ELSE
        ALTER TABLE public.goals 
        ADD COLUMN metadata JSONB DEFAULT '{}'::jsonb;
        RAISE NOTICE 'Columna metadata agregada exitosamente';
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error: %', SQLERRM;
END $$;

