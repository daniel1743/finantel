-- ============================================================================
-- SISTEMA DE DETECCIÓN DE ABUSO POR IP
-- ============================================================================
-- Sistema inteligente que detecta abuso sin bloquear IPs directamente
-- Usa sistema de "riesgo por IP" y device fingerprinting
-- ============================================================================

-- ============================================================================
-- 1. TABLA: IP_RISK_EVENTS - Eventos de riesgo por IP
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.ip_risk_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ip_address INET NOT NULL,
    device_fingerprint TEXT NOT NULL,
    user_id UUID, -- NULL si es solo verificación antes de registro
    email TEXT,
    risk_level TEXT NOT NULL CHECK (risk_level IN ('normal', 'low', 'medium', 'high', 'very_high', 'blocked')),
    risk_score INTEGER DEFAULT 0 CHECK (risk_score >= 0 AND risk_score <= 100),
    reason TEXT,
    action_taken TEXT CHECK (action_taken IN ('allowed', 'verification_required', 'blocked', 'flagged')),
    is_blocked BOOLEAN DEFAULT false,
    requires_verification BOOLEAN DEFAULT false,
    metadata JSONB DEFAULT '{}'::jsonb, -- Datos adicionales (userAgent, etc.)
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Índice compuesto para búsquedas rápidas
    CONSTRAINT ip_risk_events_fingerprint_check CHECK (char_length(device_fingerprint) >= 10)
);

-- Índices para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_ip_risk_events_ip_address ON public.ip_risk_events(ip_address);
CREATE INDEX IF NOT EXISTS idx_ip_risk_events_device_fingerprint ON public.ip_risk_events(device_fingerprint);
CREATE INDEX IF NOT EXISTS idx_ip_risk_events_user_id ON public.ip_risk_events(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_ip_risk_events_created_at ON public.ip_risk_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ip_risk_events_risk_level ON public.ip_risk_events(risk_level);
CREATE INDEX IF NOT EXISTS idx_ip_risk_events_ip_created ON public.ip_risk_events(ip_address, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ip_risk_events_fingerprint_created ON public.ip_risk_events(device_fingerprint, created_at DESC);

-- ============================================================================
-- 2. TABLA: IP_RISK_STATS - Estadísticas agregadas por IP
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.ip_risk_stats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ip_address INET NOT NULL UNIQUE,
    total_registrations_24h INTEGER DEFAULT 0,
    total_registrations_7d INTEGER DEFAULT 0,
    total_registrations_30d INTEGER DEFAULT 0,
    unique_fingerprints_24h INTEGER DEFAULT 0,
    unique_fingerprints_7d INTEGER DEFAULT 0,
    blocked_count INTEGER DEFAULT 0,
    last_risk_level TEXT DEFAULT 'normal',
    last_risk_score INTEGER DEFAULT 0,
    last_updated TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_ip_risk_stats_ip_address ON public.ip_risk_stats(ip_address);
CREATE INDEX IF NOT EXISTS idx_ip_risk_stats_last_risk_level ON public.ip_risk_stats(last_risk_level);
CREATE INDEX IF NOT EXISTS idx_ip_risk_stats_registrations_24h ON public.ip_risk_stats(total_registrations_24h DESC);

-- ============================================================================
-- 3. TABLA: DEVICE_FINGERPRINTS - Registro de fingerprints únicos
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.device_fingerprints (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    fingerprint_hash TEXT NOT NULL UNIQUE, -- Hash del fingerprint completo
    fingerprint_data JSONB NOT NULL, -- Datos completos del fingerprint
    first_seen TIMESTAMPTZ DEFAULT NOW(),
    last_seen TIMESTAMPTZ DEFAULT NOW(),
    account_count INTEGER DEFAULT 0, -- Número de cuentas creadas con este fingerprint
    is_blocked BOOLEAN DEFAULT false,
    blocked_reason TEXT,
    blocked_at TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_device_fingerprints_hash ON public.device_fingerprints(fingerprint_hash);
CREATE INDEX IF NOT EXISTS idx_device_fingerprints_blocked ON public.device_fingerprints(is_blocked) WHERE is_blocked = true;
CREATE INDEX IF NOT EXISTS idx_device_fingerprints_account_count ON public.device_fingerprints(account_count DESC);

-- ============================================================================
-- 4. TABLA: ADMIN_ALERTS - Alertas para panel admin
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.admin_alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    alert_type TEXT NOT NULL CHECK (alert_type IN ('ip_risk', 'fingerprint_abuse', 'suspicious_activity')),
    severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    ip_address INET,
    device_fingerprint TEXT,
    user_id UUID,
    message TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    is_resolved BOOLEAN DEFAULT false,
    resolved_at TIMESTAMPTZ,
    resolved_by UUID,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_admin_alerts_type ON public.admin_alerts(alert_type);
CREATE INDEX IF NOT EXISTS idx_admin_alerts_severity ON public.admin_alerts(severity);
CREATE INDEX IF NOT EXISTS idx_admin_alerts_resolved ON public.admin_alerts(is_resolved) WHERE is_resolved = false;
CREATE INDEX IF NOT EXISTS idx_admin_alerts_created_at ON public.admin_alerts(created_at DESC);

-- ============================================================================
-- 5. FUNCIÓN: Detectar correos desechables
-- ============================================================================
CREATE OR REPLACE FUNCTION is_disposable_email(p_email TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
    -- Lista de dominios desechables comunes
    RETURN p_email ~* '@(10minutemail|tempmail|guerrillamail|mailinator|throwaway|trashmail|mohmal|yopmail|getnada|maildrop|temp-mail|mintemail|sharklasers|getairmail|meltmail|melt\.li|emailondeck|fakeinbox|mvrht|dispostable|mailcatch|tempail|mytrashmail|throwawayemail|tempr\.email|tempinbox|mintemail|emailias|spamgourmet|spamhole|spamex|spamfree24|spamobox|spamtraps|spamday|spamevader|spamgourmet|spamherelot|spamhereplease|spamhole|spamify|spaminator|spamkill|spaml|spaml\.com|spamoff|spamspot|spamthisplease|speed\.1s\.fr|supergreatmail|supermailer|superrito|superstachel|suremail|tagyourself|talkinator|teewars|teleosaurs|teleosaurs|tempalias|tempe-mail|tempemail|tempinbox|tempinbox\.co\.uk|tempinbox\.com|tempmail|tempmail2|tempmailer|tempomail|temporarily\.de|temporaryemail|temporaryemailaddress|temporaryinbox|thanksnospam|thankyou2010|thisisnotmyrealemail|throwawayemailaddress|tilien|tmailinator|toiea|tradermail|trash-amil|trash-mail|trash\.me|trash2009|trashemail|trashmail|trashmailer|trashymail|trialmail|trillianpro|turual|twinmail|tyldd|uggsrock|umail\.net|upliftnow|uplipht|uroid|us\.af|venompen|veryrealemail|viditag|viewcastmedia|viewcastmedia|viewcastmedia|webemail\.me|webm4il|wh4f|whyspam\.me|willselfdestruct|winemaven|wronghead|wuzup|wuzupmail|xbaby|xemaps|xents|xmaily|xoxy|yapped|yeah\.net|yep\.it|yogamaven|yopmail|yopmail\.net|youmailr|ypmail\.by|zippymail|zoemail|zomg\.info)\.';
END;
$$;

-- ============================================================================
-- 6. FUNCIÓN: Calcular hash del fingerprint
-- ============================================================================
CREATE OR REPLACE FUNCTION hash_fingerprint(p_fingerprint_data JSONB)
RETURNS TEXT
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
    v_hash TEXT;
    v_combined TEXT;
BEGIN
    -- Combinar campos clave del fingerprint
    v_combined := COALESCE(p_fingerprint_data->>'browser', '') ||
                  COALESCE(p_fingerprint_data->>'userAgent', '') ||
                  COALESCE(p_fingerprint_data->>'resolution', '') ||
                  COALESCE(p_fingerprint_data->>'timezone', '') ||
                  COALESCE(p_fingerprint_data->>'platform', '') ||
                  COALESCE(p_fingerprint_data->>'language', '') ||
                  COALESCE(p_fingerprint_data->>'webgl', '');
    
    -- Calcular hash SHA256
    v_hash := encode(digest(v_combined, 'sha256'), 'hex');
    
    RETURN v_hash;
END;
$$;

-- ============================================================================
-- 7. FUNCIÓN PRINCIPAL: Verificar riesgo de IP y fingerprint
-- ============================================================================
CREATE OR REPLACE FUNCTION check_ip_risk(
    p_ip_address INET,
    p_device_fingerprint JSONB,
    p_email TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_fingerprint_hash TEXT;
    v_registrations_24h INTEGER;
    v_registrations_7d INTEGER;
    v_unique_fingerprints_24h INTEGER;
    v_fingerprint_accounts INTEGER;
    v_risk_level TEXT := 'normal';
    v_risk_score INTEGER := 0;
    v_reason TEXT := '';
    v_allowed BOOLEAN := true;
    v_action_taken TEXT := 'allowed';
    v_requires_verification BOOLEAN := false;
    v_is_disposable_email BOOLEAN := false;
    v_result JSONB;
    v_fingerprint_exists BOOLEAN;
    v_event_id UUID;
BEGIN
    -- Calcular hash del fingerprint
    v_fingerprint_hash := hash_fingerprint(p_device_fingerprint);
    
    -- Verificar si es correo desechable
    IF p_email IS NOT NULL THEN
        v_is_disposable_email := is_disposable_email(p_email);
    END IF;
    
    -- Contar registros de esta IP en las últimas 24 horas
    SELECT COUNT(*)
    INTO v_registrations_24h
    FROM public.ip_risk_events
    WHERE ip_address = p_ip_address
      AND created_at >= NOW() - INTERVAL '24 hours';
    
    -- Contar registros de esta IP en los últimos 7 días
    SELECT COUNT(*)
    INTO v_registrations_7d
    FROM public.ip_risk_events
    WHERE ip_address = p_ip_address
      AND created_at >= NOW() - INTERVAL '7 days';
    
    -- Contar fingerprints únicos de esta IP en 24h
    SELECT COUNT(DISTINCT device_fingerprint)
    INTO v_unique_fingerprints_24h
    FROM public.ip_risk_events
    WHERE ip_address = p_ip_address
      AND created_at >= NOW() - INTERVAL '24 hours';
    
    -- Verificar si este fingerprint ya tiene cuentas
    SELECT account_count, is_blocked
    INTO v_fingerprint_accounts, v_fingerprint_exists
    FROM public.device_fingerprints
    WHERE fingerprint_hash = v_fingerprint_hash;
    
    IF NOT FOUND THEN
        v_fingerprint_accounts := 0;
        v_fingerprint_exists := false;
    END IF;
    
    -- ========================================================================
    -- LÓGICA DE DETECCIÓN DE RIESGO
    -- ========================================================================
    
    -- REGLA 1: Si mismo fingerprint crea >1 cuenta → BLOQUEO
    IF v_fingerprint_accounts > 0 THEN
        v_allowed := false;
        v_risk_level := 'blocked';
        v_risk_score := 100;
        v_reason := format('Dispositivo ya utilizado para crear %s cuenta(s)', v_fingerprint_accounts);
        v_action_taken := 'blocked';
        
        -- Actualizar fingerprint como bloqueado
        UPDATE public.device_fingerprints
        SET is_blocked = true,
            blocked_reason = v_reason,
            blocked_at = NOW()
        WHERE fingerprint_hash = v_fingerprint_hash;
        
    -- REGLA 2: Si misma IP + mismo fingerprint + correo desechable → BLOQUEO
    ELSIF v_is_disposable_email AND v_registrations_24h > 0 THEN
        v_allowed := false;
        v_risk_level := 'blocked';
        v_risk_score := 100;
        v_reason := 'Correo desechable detectado con IP y dispositivo ya utilizados';
        v_action_taken := 'blocked';
        
    -- REGLA 3: 50+ cuentas por IP en 24h → BLOQUEO
    ELSIF v_registrations_24h >= 50 THEN
        v_allowed := false;
        v_risk_level := 'very_high';
        v_risk_score := 95;
        v_reason := format('IP ha creado %s cuentas en 24 horas', v_registrations_24h);
        v_action_taken := 'blocked';
        
    -- REGLA 4: 16-50 cuentas por IP en 24h → RIESGO ALTO
    ELSIF v_registrations_24h >= 16 THEN
        v_risk_level := 'high';
        v_risk_score := 75;
        v_reason := format('IP ha creado %s cuentas en 24 horas', v_registrations_24h);
        v_action_taken := 'verification_required';
        v_requires_verification := true;
        
    -- REGLA 5: 7-15 cuentas por IP en 24h → RIESGO MEDIO
    ELSIF v_registrations_24h >= 7 THEN
        v_risk_level := 'medium';
        v_risk_score := 50;
        v_reason := format('IP ha creado %s cuentas en 24 horas', v_registrations_24h);
        v_action_taken := 'verification_required';
        v_requires_verification := true;
        
        -- Emitir alerta al panel admin
        INSERT INTO public.admin_alerts (
            alert_type,
            severity,
            ip_address,
            device_fingerprint,
            message,
            metadata
        )
        VALUES (
            'ip_risk',
            'medium',
            p_ip_address,
            v_fingerprint_hash,
            format('IP %s ha creado %s cuentas en 24 horas', p_ip_address, v_registrations_24h),
            jsonb_build_object(
                'registrations_24h', v_registrations_24h,
                'registrations_7d', v_registrations_7d,
                'unique_fingerprints_24h', v_unique_fingerprints_24h
            )
        );
        
    -- REGLA 6: 4-6 cuentas por IP en 24h → RIESGO BAJO
    ELSIF v_registrations_24h >= 4 THEN
        v_risk_level := 'low';
        v_risk_score := 25;
        v_reason := format('IP ha creado %s cuentas en 24 horas', v_registrations_24h);
        v_action_taken := 'flagged';
        
    -- REGLA 7: 1-3 cuentas → NORMAL
    ELSE
        v_risk_level := 'normal';
        v_risk_score := 0;
        v_reason := 'Actividad normal';
        v_action_taken := 'allowed';
    END IF;
    
    -- Penalización adicional por correo desechable
    IF v_is_disposable_email AND v_allowed THEN
        v_risk_score := v_risk_score + 20;
        IF v_risk_score > 50 THEN
            v_risk_level := 'medium';
            v_requires_verification := true;
            v_action_taken := 'verification_required';
        END IF;
        v_reason := v_reason || ' | Correo desechable detectado';
    END IF;
    
    -- Registrar el evento
    INSERT INTO public.ip_risk_events (
        ip_address,
        device_fingerprint,
        email,
        risk_level,
        risk_score,
        reason,
        action_taken,
        is_blocked,
        requires_verification,
        metadata
    )
    VALUES (
        p_ip_address,
        v_fingerprint_hash,
        p_email,
        v_risk_level,
        v_risk_score,
        v_reason,
        v_action_taken,
        NOT v_allowed,
        v_requires_verification,
        p_device_fingerprint
    )
    RETURNING id INTO v_event_id;
    
    -- Actualizar o crear estadísticas de IP
    INSERT INTO public.ip_risk_stats (
        ip_address,
        total_registrations_24h,
        total_registrations_7d,
        unique_fingerprints_24h,
        last_risk_level,
        last_risk_score
    )
    VALUES (
        p_ip_address,
        v_registrations_24h + 1,
        v_registrations_7d + 1,
        v_unique_fingerprints_24h,
        v_risk_level,
        v_risk_score
    )
    ON CONFLICT (ip_address) DO UPDATE SET
        total_registrations_24h = EXCLUDED.total_registrations_24h,
        total_registrations_7d = EXCLUDED.total_registrations_7d,
        unique_fingerprints_24h = EXCLUDED.unique_fingerprints_24h,
        last_risk_level = EXCLUDED.last_risk_level,
        last_risk_score = EXCLUDED.last_risk_score,
        last_updated = NOW();
    
    -- Actualizar o crear registro de fingerprint
    INSERT INTO public.device_fingerprints (
        fingerprint_hash,
        fingerprint_data,
        account_count
    )
    VALUES (
        v_fingerprint_hash,
        p_device_fingerprint,
        1
    )
    ON CONFLICT (fingerprint_hash) DO UPDATE SET
        last_seen = NOW(),
        account_count = device_fingerprints.account_count + 1,
        fingerprint_data = EXCLUDED.fingerprint_data;
    
    -- Construir respuesta
    v_result := jsonb_build_object(
        'allowed', v_allowed,
        'risk_level', v_risk_level,
        'risk_score', v_risk_score,
        'reason', v_reason,
        'action_taken', v_action_taken,
        'requires_verification', v_requires_verification,
        'is_blocked', NOT v_allowed,
        'event_id', v_event_id,
        'stats', jsonb_build_object(
            'registrations_24h', v_registrations_24h + 1,
            'registrations_7d', v_registrations_7d + 1,
            'unique_fingerprints_24h', v_unique_fingerprints_24h,
            'fingerprint_accounts', v_fingerprint_accounts
        )
    );
    
    RETURN v_result;
END;
$$;

-- ============================================================================
-- 8. FUNCIÓN: Actualizar estadísticas de IP (ejecutar periódicamente)
-- ============================================================================
CREATE OR REPLACE FUNCTION update_ip_risk_stats()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_updated_count INTEGER := 0;
    v_ip_record RECORD;
BEGIN
    -- Actualizar estadísticas para todas las IPs
    FOR v_ip_record IN
        SELECT DISTINCT ip_address
        FROM public.ip_risk_events
        WHERE created_at >= NOW() - INTERVAL '30 days'
    LOOP
        UPDATE public.ip_risk_stats
        SET
            total_registrations_24h = (
                SELECT COUNT(*)
                FROM public.ip_risk_events
                WHERE ip_address = v_ip_record.ip_address
                  AND created_at >= NOW() - INTERVAL '24 hours'
            ),
            total_registrations_7d = (
                SELECT COUNT(*)
                FROM public.ip_risk_events
                WHERE ip_address = v_ip_record.ip_address
                  AND created_at >= NOW() - INTERVAL '7 days'
            ),
            total_registrations_30d = (
                SELECT COUNT(*)
                FROM public.ip_risk_events
                WHERE ip_address = v_ip_record.ip_address
                  AND created_at >= NOW() - INTERVAL '30 days'
            ),
            unique_fingerprints_24h = (
                SELECT COUNT(DISTINCT device_fingerprint)
                FROM public.ip_risk_events
                WHERE ip_address = v_ip_record.ip_address
                  AND created_at >= NOW() - INTERVAL '24 hours'
            ),
            unique_fingerprints_7d = (
                SELECT COUNT(DISTINCT device_fingerprint)
                FROM public.ip_risk_events
                WHERE ip_address = v_ip_record.ip_address
                  AND created_at >= NOW() - INTERVAL '7 days'
            ),
            last_updated = NOW()
        WHERE ip_address = v_ip_record.ip_address;
        
        v_updated_count := v_updated_count + 1;
    END LOOP;
    
    RETURN v_updated_count;
END;
$$;

-- ============================================================================
-- 9. FUNCIÓN: Obtener estadísticas de IP para admin
-- ============================================================================
CREATE OR REPLACE FUNCTION get_ip_risk_stats(p_ip_address INET DEFAULT NULL)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_result JSONB;
BEGIN
    IF p_ip_address IS NULL THEN
        -- Retornar estadísticas generales
        SELECT jsonb_build_object(
            'total_ips_tracked', COUNT(DISTINCT ip_address),
            'high_risk_ips_24h', COUNT(DISTINCT ip_address) FILTER (WHERE total_registrations_24h >= 7),
            'blocked_ips', COUNT(DISTINCT ip_address) FILTER (WHERE total_registrations_24h >= 50),
            'total_events_24h', COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '24 hours')
        )
        INTO v_result
        FROM public.ip_risk_stats;
    ELSE
        -- Retornar estadísticas de IP específica
        SELECT jsonb_build_object(
            'ip_address', ip_address,
            'total_registrations_24h', total_registrations_24h,
            'total_registrations_7d', total_registrations_7d,
            'total_registrations_30d', total_registrations_30d,
            'unique_fingerprints_24h', unique_fingerprints_24h,
            'unique_fingerprints_7d', unique_fingerprints_7d,
            'last_risk_level', last_risk_level,
            'last_risk_score', last_risk_score,
            'last_updated', last_updated
        )
        INTO v_result
        FROM public.ip_risk_stats
        WHERE ip_address = p_ip_address;
        
        IF v_result IS NULL THEN
            v_result := jsonb_build_object('error', 'IP no encontrada');
        END IF;
    END IF;
    
    RETURN v_result;
END;
$$;

-- ============================================================================
-- 10. POLÍTICAS RLS
-- ============================================================================

-- Habilitar RLS en todas las tablas
ALTER TABLE public.ip_risk_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ip_risk_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.device_fingerprints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_alerts ENABLE ROW LEVEL SECURITY;

-- Políticas para ip_risk_events (solo lectura para usuarios, admin puede ver todo)
DROP POLICY IF EXISTS "Users can view own risk events" ON public.ip_risk_events;
CREATE POLICY "Users can view own risk events"
    ON public.ip_risk_events
    FOR SELECT
    USING (auth.uid() = user_id OR auth.uid() IN (
        SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin'
    ));

-- Políticas para ip_risk_stats (solo admin)
DROP POLICY IF EXISTS "Admins can view IP stats" ON public.ip_risk_stats;
CREATE POLICY "Admins can view IP stats"
    ON public.ip_risk_stats
    FOR SELECT
    USING (auth.uid() IN (
        SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin'
    ));

-- Políticas para device_fingerprints (solo admin)
DROP POLICY IF EXISTS "Admins can view fingerprints" ON public.device_fingerprints;
CREATE POLICY "Admins can view fingerprints"
    ON public.device_fingerprints
    FOR SELECT
    USING (auth.uid() IN (
        SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin'
    ));

-- Políticas para admin_alerts (solo admin)
DROP POLICY IF EXISTS "Admins can view alerts" ON public.admin_alerts;
CREATE POLICY "Admins can view alerts"
    ON public.admin_alerts
    FOR SELECT
    USING (auth.uid() IN (
        SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin'
    ));

DROP POLICY IF EXISTS "Admins can update alerts" ON public.admin_alerts;
CREATE POLICY "Admins can update alerts"
    ON public.admin_alerts
    FOR UPDATE
    USING (auth.uid() IN (
        SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin'
    ));

-- ============================================================================
-- 11. COMENTARIOS Y DOCUMENTACIÓN
-- ============================================================================

COMMENT ON TABLE public.ip_risk_events IS 'Eventos de riesgo por IP y dispositivo. Registra cada intento de registro.';
COMMENT ON TABLE public.ip_risk_stats IS 'Estadísticas agregadas por IP para análisis rápido.';
COMMENT ON TABLE public.device_fingerprints IS 'Fingerprints únicos de dispositivos para detectar reutilización.';
COMMENT ON TABLE public.admin_alerts IS 'Alertas para el panel de administración sobre actividad sospechosa.';

COMMENT ON FUNCTION check_ip_risk IS 'Función principal que verifica el riesgo de una IP y fingerprint. Retorna JSON con decisión.';
COMMENT ON FUNCTION is_disposable_email IS 'Verifica si un correo es de un dominio desechable.';
COMMENT ON FUNCTION hash_fingerprint IS 'Calcula hash SHA256 del fingerprint del dispositivo.';

