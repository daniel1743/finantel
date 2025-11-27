-- =====================================================
-- FASE 4: SISTEMA ANTI-BRUTEFORCE Y BLOQUEO AUTOMÁTICO
-- =====================================================
-- Sistema que detecta y bloquea intentos de fuerza bruta
-- con bloqueo automático y alertas de seguridad
-- =====================================================

-- =====================================================
-- 1. TABLA DE INTENTOS FALLIDOS
-- =====================================================

CREATE TABLE IF NOT EXISTS public.security_failed_attempts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  ip_address INET NOT NULL,
  attempt_type TEXT NOT NULL CHECK (attempt_type IN ('login', 'password_reset', 'api_call', 'edge_function')),
  endpoint TEXT,
  user_agent TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Índices para búsquedas rápidas
  CONSTRAINT idx_security_failed_attempts_user_ip UNIQUE (user_id, ip_address, attempt_type, created_at)
);

-- Índices para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_security_failed_attempts_user_id 
ON public.security_failed_attempts(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_security_failed_attempts_ip 
ON public.security_failed_attempts(ip_address, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_security_failed_attempts_type 
ON public.security_failed_attempts(attempt_type, created_at DESC);

-- RLS: Solo service_role puede insertar/leer
ALTER TABLE public.security_failed_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "security_failed_attempts_service_role_only"
ON public.security_failed_attempts
FOR ALL
USING (false) -- Nadie puede leer desde el cliente
WITH CHECK (false); -- Nadie puede insertar desde el cliente

-- =====================================================
-- 2. TABLA DE IPs BLOQUEADAS
-- =====================================================

CREATE TABLE IF NOT EXISTS public.security_blocked_ips (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ip_address INET NOT NULL UNIQUE,
  reason TEXT NOT NULL,
  blocked_until TIMESTAMPTZ NOT NULL,
  attempts_count INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_security_blocked_ips_ip 
ON public.security_blocked_ips(ip_address);

CREATE INDEX IF NOT EXISTS idx_security_blocked_ips_until 
ON public.security_blocked_ips(blocked_until);

-- RLS: Solo service_role
ALTER TABLE public.security_blocked_ips ENABLE ROW LEVEL SECURITY;

CREATE POLICY "security_blocked_ips_service_role_only"
ON public.security_blocked_ips
FOR ALL
USING (false)
WITH CHECK (false);

-- =====================================================
-- 3. TABLA DE ALERTAS DE SEGURIDAD
-- =====================================================

CREATE TABLE IF NOT EXISTS public.security_alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  alert_type TEXT NOT NULL CHECK (alert_type IN (
    'bruteforce_detected',
    'suspicious_activity',
    'unusual_location',
    'multiple_failed_logins',
    'account_compromise_suspected'
  )),
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  message TEXT NOT NULL,
  ip_address INET,
  metadata JSONB DEFAULT '{}'::jsonb,
  is_resolved BOOLEAN DEFAULT FALSE,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_security_alerts_user_id 
ON public.security_alerts(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_security_alerts_type 
ON public.security_alerts(alert_type, severity, is_resolved);

-- RLS: Usuarios solo ven sus propias alertas
ALTER TABLE public.security_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "security_alerts_select_own"
ON public.security_alerts
FOR SELECT
USING (
  auth.uid() = user_id
  AND public.is_valid_session()
);

-- =====================================================
-- 4. FUNCIÓN: REGISTRAR INTENTO FALLIDO
-- =====================================================

CREATE OR REPLACE FUNCTION public.register_failed_attempt(
  p_user_id UUID,
  p_ip_address INET,
  p_attempt_type TEXT,
  p_endpoint TEXT DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_attempt_id UUID;
  v_recent_attempts INTEGER;
  v_block_until TIMESTAMPTZ;
BEGIN
  -- Insertar intento fallido
  INSERT INTO public.security_failed_attempts (
    user_id,
    ip_address,
    attempt_type,
    endpoint,
    user_agent,
    metadata
  ) VALUES (
    p_user_id,
    p_ip_address,
    p_attempt_type,
    p_endpoint,
    p_user_agent,
    p_metadata
  )
  RETURNING id INTO v_attempt_id;
  
  -- Contar intentos recientes (últimos 15 minutos)
  SELECT COUNT(*)
  INTO v_recent_attempts
  FROM public.security_failed_attempts
  WHERE (
    (p_user_id IS NOT NULL AND user_id = p_user_id)
    OR ip_address = p_ip_address
  )
  AND attempt_type = p_attempt_type
  AND created_at > NOW() - INTERVAL '15 minutes';
  
  -- Si hay más de 5 intentos, bloquear IP
  IF v_recent_attempts >= 5 THEN
    v_block_until := NOW() + INTERVAL '1 hour';
    
    -- Insertar o actualizar bloqueo de IP
    INSERT INTO public.security_blocked_ips (
      ip_address,
      reason,
      blocked_until,
      attempts_count
    ) VALUES (
      p_ip_address,
      'Multiple failed attempts: ' || v_recent_attempts || ' attempts in 15 minutes',
      v_block_until,
      v_recent_attempts
    )
    ON CONFLICT (ip_address) 
    DO UPDATE SET
      blocked_until = GREATEST(security_blocked_ips.blocked_until, v_block_until),
      attempts_count = v_recent_attempts,
      updated_at = NOW();
    
    -- Crear alerta de seguridad
    IF p_user_id IS NOT NULL THEN
      INSERT INTO public.security_alerts (
        user_id,
        alert_type,
        severity,
        message,
        ip_address
      ) VALUES (
        p_user_id,
        'bruteforce_detected',
        'high',
        'Multiple failed ' || p_attempt_type || ' attempts detected. IP blocked for 1 hour.',
        p_ip_address
      );
    END IF;
  END IF;
  
  -- Si hay más de 10 intentos, bloqueo más largo
  IF v_recent_attempts >= 10 THEN
    v_block_until := NOW() + INTERVAL '24 hours';
    
    UPDATE public.security_blocked_ips
    SET blocked_until = v_block_until,
        attempts_count = v_recent_attempts,
        updated_at = NOW()
    WHERE ip_address = p_ip_address;
    
    -- Alerta crítica
    IF p_user_id IS NOT NULL THEN
      INSERT INTO public.security_alerts (
        user_id,
        alert_type,
        severity,
        message,
        ip_address
      ) VALUES (
        p_user_id,
        'bruteforce_detected',
        'critical',
        'Critical: ' || v_recent_attempts || ' failed attempts. IP blocked for 24 hours.',
        p_ip_address
      );
    END IF;
  END IF;
  
  RETURN v_attempt_id;
END;
$$;

-- =====================================================
-- 5. FUNCIÓN: VERIFICAR SI IP ESTÁ BLOQUEADA
-- =====================================================

CREATE OR REPLACE FUNCTION public.is_ip_blocked(p_ip_address INET)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
  v_blocked_until TIMESTAMPTZ;
BEGIN
  SELECT blocked_until
  INTO v_blocked_until
  FROM public.security_blocked_ips
  WHERE ip_address = p_ip_address
  AND blocked_until > NOW();
  
  RETURN v_blocked_until IS NOT NULL;
END;
$$;

-- =====================================================
-- 6. FUNCIÓN: LIMPIAR INTENTOS ANTIGUOS
-- =====================================================

CREATE OR REPLACE FUNCTION public.cleanup_old_failed_attempts()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_deleted_count INTEGER;
BEGIN
  -- Eliminar intentos de más de 7 días
  DELETE FROM public.security_failed_attempts
  WHERE created_at < NOW() - INTERVAL '7 days';
  
  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
  
  -- Eliminar IPs bloqueadas que ya expiraron
  DELETE FROM public.security_blocked_ips
  WHERE blocked_until < NOW();
  
  RETURN v_deleted_count;
END;
$$;

-- =====================================================
-- 7. FUNCIÓN: OBTENER INTENTOS RECIENTES
-- =====================================================

CREATE OR REPLACE FUNCTION public.get_recent_failed_attempts(
  p_user_id UUID DEFAULT NULL,
  p_ip_address INET DEFAULT NULL,
  p_minutes INTEGER DEFAULT 15
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
  v_count INTEGER;
BEGIN
  SELECT COUNT(*)
  INTO v_count
  FROM public.security_failed_attempts
  WHERE (
    (p_user_id IS NOT NULL AND user_id = p_user_id)
    OR (p_ip_address IS NOT NULL AND ip_address = p_ip_address)
  )
  AND created_at > NOW() - (p_minutes || ' minutes')::INTERVAL;
  
  RETURN COALESCE(v_count, 0);
END;
$$;

-- =====================================================
-- 8. TRIGGER: ACTUALIZAR updated_at
-- =====================================================

CREATE OR REPLACE FUNCTION public.update_security_blocked_ips_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_update_security_blocked_ips_updated_at
BEFORE UPDATE ON public.security_blocked_ips
FOR EACH ROW
EXECUTE FUNCTION public.update_security_blocked_ips_updated_at();

-- =====================================================
-- 9. COMENTARIOS DE SEGURIDAD
-- =====================================================

COMMENT ON TABLE public.security_failed_attempts IS 
'Seguridad: Registra todos los intentos fallidos para detección de bruteforce';

COMMENT ON TABLE public.security_blocked_ips IS 
'Seguridad: IPs bloqueadas automáticamente por intentos de bruteforce';

COMMENT ON TABLE public.security_alerts IS 
'Seguridad: Alertas de seguridad generadas automáticamente';

COMMENT ON FUNCTION public.register_failed_attempt IS 
'Seguridad: Registra intento fallido y bloquea IP si excede límites';

COMMENT ON FUNCTION public.is_ip_blocked IS 
'Seguridad: Verifica si una IP está bloqueada';

-- =====================================================
-- FIN DE FASE 4: SISTEMA ANTI-BRUTEFORCE
-- =====================================================

