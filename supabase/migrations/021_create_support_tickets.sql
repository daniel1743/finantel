-- =====================================================
-- MIGRACIÓN 021 - SOPORTE: TABLA DE TICKETS + RLS
-- =====================================================
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'support_tickets'
    ) THEN
        CREATE TABLE public.support_tickets (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            user_id UUID NOT NULL,
            subject TEXT NOT NULL,
            category TEXT NOT NULL DEFAULT 'general' CHECK (category IN ('general','facturacion','dato','bug','sugerencia')),
            priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('baja','normal','alta','critica')),
            message TEXT NOT NULL,
            status TEXT NOT NULL DEFAULT 'abierto' CHECK (status IN ('abierto','en_progreso','resuelto','archivado')),
            ai_context JSONB DEFAULT '{}'::jsonb,
            sla_hours INTEGER DEFAULT 24 CHECK (sla_hours > 0),
            last_response_at TIMESTAMPTZ,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
        );
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_support_tickets_user ON public.support_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON public.support_tickets(status);

CREATE OR REPLACE FUNCTION public.update_support_tickets_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_support_tickets_updated_at ON public.support_tickets;
CREATE TRIGGER trg_support_tickets_updated_at
    BEFORE UPDATE ON public.support_tickets
    FOR EACH ROW
    EXECUTE FUNCTION public.update_support_tickets_updated_at();

ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "support_tickets_select" ON public.support_tickets;
CREATE POLICY "support_tickets_select"
    ON public.support_tickets
    FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "support_tickets_insert" ON public.support_tickets;
CREATE POLICY "support_tickets_insert"
    ON public.support_tickets
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "support_tickets_update" ON public.support_tickets;
CREATE POLICY "support_tickets_update"
    ON public.support_tickets
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Notificar a PostgREST para refrescar el esquema
DO $$
BEGIN
    PERFORM pg_notify('pgrst', 'reload schema');
EXCEPTION
    WHEN OTHERS THEN
        -- Ignorar si no está configurado
        NULL;
END $$;

