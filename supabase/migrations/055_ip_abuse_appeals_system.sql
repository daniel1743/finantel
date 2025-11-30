-- ============================================================================
-- SISTEMA DE APELACIONES PARA BLOQUEOS DE IP/DISPOSITIVO
-- ============================================================================
-- Permite a usuarios solicitar revisión si creen que fueron bloqueados por error
-- ============================================================================

-- ============================================================================
-- 1. TABLA: IP_RISK_APPEALS - Solicitudes de apelación
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.ip_risk_appeals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID, -- NULL si es antes de registro
    email TEXT NOT NULL,
    ip_address INET NOT NULL,
    device_fingerprint TEXT,
    event_id UUID REFERENCES public.ip_risk_events(id) ON DELETE SET NULL,
    appeal_reason TEXT NOT NULL CHECK (char_length(appeal_reason) >= 10 AND char_length(appeal_reason) <= 2000),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'under_review', 'approved', 'rejected', 'dismissed')),
    admin_notes TEXT,
    reviewed_by UUID, -- Admin que revisó
    reviewed_at TIMESTAMPTZ,
    resolution TEXT, -- Respuesta al usuario
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_ip_risk_appeals_user_id ON public.ip_risk_appeals(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_ip_risk_appeals_email ON public.ip_risk_appeals(email);
CREATE INDEX IF NOT EXISTS idx_ip_risk_appeals_ip_address ON public.ip_risk_appeals(ip_address);
CREATE INDEX IF NOT EXISTS idx_ip_risk_appeals_status ON public.ip_risk_appeals(status);
CREATE INDEX IF NOT EXISTS idx_ip_risk_appeals_created_at ON public.ip_risk_appeals(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ip_risk_appeals_pending ON public.ip_risk_appeals(status) WHERE status = 'pending';

-- ============================================================================
-- 2. FUNCIÓN: Crear apelación
-- ============================================================================
CREATE OR REPLACE FUNCTION create_ip_risk_appeal(
    p_email TEXT,
    p_ip_address INET,
    p_appeal_reason TEXT,
    p_device_fingerprint TEXT DEFAULT NULL,
    p_event_id UUID DEFAULT NULL,
    p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_appeal_id UUID;
    v_user_id UUID;
BEGIN
    -- Validar email
    IF p_email IS NULL OR p_email = '' THEN
        RAISE EXCEPTION 'Email es requerido';
    END IF;

    -- Validar razón de apelación
    IF p_appeal_reason IS NULL OR char_length(p_appeal_reason) < 10 THEN
        RAISE EXCEPTION 'La razón de apelación debe tener al menos 10 caracteres';
    END IF;

    -- Intentar obtener user_id si existe usuario con ese email
    SELECT id INTO v_user_id
    FROM auth.users
    WHERE email = p_email
    LIMIT 1;

    -- Crear apelación
    INSERT INTO public.ip_risk_appeals (
        user_id,
        email,
        ip_address,
        device_fingerprint,
        event_id,
        appeal_reason,
        metadata
    )
    VALUES (
        v_user_id,
        p_email,
        p_ip_address,
        p_device_fingerprint,
        p_event_id,
        p_appeal_reason,
        p_metadata
    )
    RETURNING id INTO v_appeal_id;

    -- Crear alerta para admin
    INSERT INTO public.admin_alerts (
        alert_type,
        severity,
        ip_address,
        device_fingerprint,
        user_id,
        message,
        metadata
    )
    VALUES (
        'appeal_request',
        'medium',
        p_ip_address,
        p_device_fingerprint,
        v_user_id,
        format('Nueva apelación de %s: %s', p_email, LEFT(p_appeal_reason, 100)),
        jsonb_build_object(
            'appeal_id', v_appeal_id,
            'email', p_email,
            'appeal_reason', p_appeal_reason
        )
    );

    RETURN v_appeal_id;
END;
$$;

-- ============================================================================
-- 3. FUNCIÓN: Revisar apelación (admin)
-- ============================================================================
CREATE OR REPLACE FUNCTION review_ip_risk_appeal(
    p_appeal_id UUID,
    p_status TEXT,
    p_admin_notes TEXT DEFAULT NULL,
    p_resolution TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_appeal RECORD;
    v_admin_id UUID;
BEGIN
    -- Validar status
    IF p_status NOT IN ('under_review', 'approved', 'rejected', 'dismissed') THEN
        RAISE EXCEPTION 'Status inválido';
    END IF;

    -- Obtener apelación
    SELECT * INTO v_appeal
    FROM public.ip_risk_appeals
    WHERE id = p_appeal_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Apelación no encontrada';
    END IF;

    -- Obtener ID del admin (desde auth.uid() o metadata)
    v_admin_id := auth.uid();

    -- Actualizar apelación
    UPDATE public.ip_risk_appeals
    SET
        status = p_status,
        admin_notes = p_admin_notes,
        resolution = p_resolution,
        reviewed_by = v_admin_id,
        reviewed_at = NOW(),
        updated_at = NOW()
    WHERE id = p_appeal_id;

    -- Si se aprueba, desbloquear IP/fingerprint
    IF p_status = 'approved' THEN
        -- Desbloquear eventos relacionados
        UPDATE public.ip_risk_events
        SET is_blocked = false,
            action_taken = 'allowed',
            metadata = COALESCE(metadata, '{}'::jsonb) || jsonb_build_object(
                'unblocked_by_appeal', true,
                'appeal_id', p_appeal_id,
                'unblocked_at', NOW()
            )
        WHERE ip_address = v_appeal.ip_address
          AND (device_fingerprint = v_appeal.device_fingerprint OR v_appeal.device_fingerprint IS NULL)
          AND is_blocked = true;

        -- Desbloquear fingerprint si existe
        IF v_appeal.device_fingerprint IS NOT NULL THEN
            UPDATE public.device_fingerprints
            SET is_blocked = false,
                blocked_reason = NULL,
                blocked_at = NULL,
                metadata = COALESCE(metadata, '{}'::jsonb) || jsonb_build_object(
                    'unblocked_by_appeal', true,
                    'appeal_id', p_appeal_id,
                    'unblocked_at', NOW()
                )
            WHERE fingerprint_hash = v_appeal.device_fingerprint
              AND is_blocked = true;
        END IF;
    END IF;

    RETURN true;
END;
$$;

-- ============================================================================
-- 4. FUNCIÓN: Obtener apelaciones (admin)
-- ============================================================================
CREATE OR REPLACE FUNCTION get_ip_risk_appeals(
    p_status TEXT DEFAULT NULL,
    p_limit INTEGER DEFAULT 50,
    p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
    id UUID,
    user_id UUID,
    email TEXT,
    ip_address INET,
    device_fingerprint TEXT,
    appeal_reason TEXT,
    status TEXT,
    admin_notes TEXT,
    resolution TEXT,
    reviewed_by UUID,
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ,
    event_data JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT
        a.id,
        a.user_id,
        a.email,
        a.ip_address,
        a.device_fingerprint,
        a.appeal_reason,
        a.status,
        a.admin_notes,
        a.resolution,
        a.reviewed_by,
        a.reviewed_at,
        a.created_at,
        jsonb_build_object(
            'event_id', a.event_id,
            'event_risk_level', e.risk_level,
            'event_risk_score', e.risk_score,
            'event_reason', e.reason,
            'event_created_at', e.created_at
        ) as event_data
    FROM public.ip_risk_appeals a
    LEFT JOIN public.ip_risk_events e ON a.event_id = e.id
    WHERE (p_status IS NULL OR a.status = p_status)
    ORDER BY a.created_at DESC
    LIMIT p_limit
    OFFSET p_offset;
END;
$$;

-- ============================================================================
-- 5. FUNCIÓN: Obtener estadísticas de apelaciones
-- ============================================================================
CREATE OR REPLACE FUNCTION get_appeals_stats()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_result JSONB;
BEGIN
    SELECT jsonb_build_object(
        'total', COUNT(*),
        'pending', COUNT(*) FILTER (WHERE status = 'pending'),
        'under_review', COUNT(*) FILTER (WHERE status = 'under_review'),
        'approved', COUNT(*) FILTER (WHERE status = 'approved'),
        'rejected', COUNT(*) FILTER (WHERE status = 'rejected'),
        'dismissed', COUNT(*) FILTER (WHERE status = 'dismissed'),
        'approval_rate', CASE 
            WHEN COUNT(*) FILTER (WHERE status IN ('approved', 'rejected')) > 0 THEN
                ROUND((COUNT(*) FILTER (WHERE status = 'approved')::numeric / 
                       COUNT(*) FILTER (WHERE status IN ('approved', 'rejected'))::numeric * 100)::numeric, 2)
            ELSE 0
        END,
        'avg_response_time_hours', CASE
            WHEN COUNT(*) FILTER (WHERE reviewed_at IS NOT NULL) > 0 THEN
                ROUND(AVG(EXTRACT(EPOCH FROM (reviewed_at - created_at)) / 3600)::numeric, 2)
            ELSE NULL
        END
    )
    INTO v_result
    FROM public.ip_risk_appeals;

    RETURN v_result;
END;
$$;

-- ============================================================================
-- 6. TRIGGER: Actualizar updated_at automáticamente
-- ============================================================================
CREATE OR REPLACE FUNCTION update_ip_risk_appeals_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_ip_risk_appeals_updated_at ON public.ip_risk_appeals;
CREATE TRIGGER trigger_update_ip_risk_appeals_updated_at
    BEFORE UPDATE ON public.ip_risk_appeals
    FOR EACH ROW
    EXECUTE FUNCTION update_ip_risk_appeals_updated_at();

-- ============================================================================
-- 7. POLÍTICAS RLS
-- ============================================================================

ALTER TABLE public.ip_risk_appeals ENABLE ROW LEVEL SECURITY;

-- Usuarios pueden ver sus propias apelaciones
DROP POLICY IF EXISTS "Users can view own appeals" ON public.ip_risk_appeals;
CREATE POLICY "Users can view own appeals"
    ON public.ip_risk_appeals
    FOR SELECT
    USING (
        auth.uid() = user_id OR 
        email = (SELECT email FROM auth.users WHERE id = auth.uid())
    );

-- Cualquiera puede crear apelación (antes de registro)
DROP POLICY IF EXISTS "Anyone can create appeal" ON public.ip_risk_appeals;
CREATE POLICY "Anyone can create appeal"
    ON public.ip_risk_appeals
    FOR INSERT
    WITH CHECK (true);

-- Admins pueden ver todas las apelaciones
DROP POLICY IF EXISTS "Admins can view all appeals" ON public.ip_risk_appeals;
CREATE POLICY "Admins can view all appeals"
    ON public.ip_risk_appeals
    FOR SELECT
    USING (auth.uid() IN (
        SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin'
    ));

-- Admins pueden actualizar apelaciones
DROP POLICY IF EXISTS "Admins can update appeals" ON public.ip_risk_appeals;
CREATE POLICY "Admins can update appeals"
    ON public.ip_risk_appeals
    FOR UPDATE
    USING (auth.uid() IN (
        SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin'
    ));

-- ============================================================================
-- 8. COMENTARIOS
-- ============================================================================

COMMENT ON TABLE public.ip_risk_appeals IS 'Solicitudes de apelación de usuarios bloqueados por el sistema de detección de abuso';
COMMENT ON FUNCTION create_ip_risk_appeal IS 'Crea una nueva apelación de bloqueo';
COMMENT ON FUNCTION review_ip_risk_appeal IS 'Permite a un admin revisar y resolver una apelación';
COMMENT ON FUNCTION get_ip_risk_appeals IS 'Obtiene lista de apelaciones para el panel admin';
COMMENT ON FUNCTION get_appeals_stats IS 'Obtiene estadísticas de apelaciones';

