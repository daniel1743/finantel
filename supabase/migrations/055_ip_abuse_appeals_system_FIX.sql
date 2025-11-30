-- ============================================================================
-- FIX: Corregir orden de parámetros en create_ip_risk_appeal
-- ============================================================================
-- Este script corrige el error: "los parámetros de entrada después de uno 
-- con un valor predeterminado también deben tener valores predeterminados"
-- ============================================================================

-- Corregir función create_ip_risk_appeal
-- El parámetro p_appeal_reason debe ir ANTES de los parámetros con DEFAULT
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

