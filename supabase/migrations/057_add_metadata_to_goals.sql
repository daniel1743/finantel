-- Agregar columna metadata a la tabla goals para guardar color e icono
-- Primero verificar si la tabla existe, si no, crearla con metadata incluida

DO $$
BEGIN
    -- Verificar si la tabla existe
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'goals') THEN
        -- Si la tabla existe, agregar la columna metadata si no existe
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'goals' 
            AND column_name = 'metadata'
        ) THEN
            ALTER TABLE public.goals 
            ADD COLUMN metadata JSONB DEFAULT '{}'::jsonb;
            
            COMMENT ON COLUMN public.goals.metadata IS 'Almacena datos adicionales como color e icon_name de la meta';
        END IF;
    ELSE
        -- Si la tabla no existe, crearla con metadata incluida
        -- Crear sin foreign key primero (más seguro)
        CREATE TABLE public.goals (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            user_id UUID NOT NULL,
            category_id UUID,
            name TEXT NOT NULL CHECK (char_length(name) >= 1 AND char_length(name) <= 100),
            description TEXT,
            target_amount DECIMAL(12, 2) NOT NULL CHECK (target_amount > 0),
            current_amount DECIMAL(12, 2) DEFAULT 0.00 CHECK (current_amount >= 0),
            currency TEXT DEFAULT 'USD',
            deadline DATE,
            priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
            status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled', 'paused')),
            is_recurring BOOLEAN DEFAULT false,
            recurring_frequency TEXT CHECK (recurring_frequency IN ('monthly', 'quarterly', 'yearly')),
            metadata JSONB DEFAULT '{}'::jsonb,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW(),
            completed_at TIMESTAMPTZ,
            CHECK (current_amount <= target_amount)
        );
        
        -- Intentar agregar foreign key a categories si existe (opcional)
        BEGIN
            IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'categories') THEN
                ALTER TABLE public.goals 
                ADD CONSTRAINT goals_category_id_fkey 
                FOREIGN KEY (category_id) REFERENCES public.categories(id) ON DELETE SET NULL;
            END IF;
        EXCEPTION
            WHEN OTHERS THEN
                -- Si falla, simplemente continuar sin la foreign key
                NULL;
        END;
        
        COMMENT ON COLUMN public.goals.metadata IS 'Almacena datos adicionales como color e icon_name de la meta';
    END IF;
END $$;

