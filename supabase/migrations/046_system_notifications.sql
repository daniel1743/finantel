-- =====================================================
-- MIGRACIÓN: SISTEMA DE NOTIFICACIONES ADMINISTRATIVAS
-- =====================================================
-- Sistema simple, eficiente y escalable para monitoreo
-- Creado: 2025
-- =====================================================

-- 1. TABLA: system_notifications
-- Almacena todos los eventos del sistema (errores, warnings, info, usage)
CREATE TABLE IF NOT EXISTS public.system_notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type TEXT NOT NULL CHECK (type IN ('error', 'warning', 'info', 'usage')),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    origin TEXT NOT NULL, -- endpoint o módulo que generó la alerta
    payload JSONB DEFAULT '{}'::jsonb, -- el JSON original del evento
    severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    is_read BOOLEAN DEFAULT false, -- para marcar como leída
    count INTEGER DEFAULT 1 -- contador para eventos duplicados
);

-- Índices para optimización
CREATE INDEX IF NOT EXISTS idx_system_notifications_type ON public.system_notifications(type);
CREATE INDEX IF NOT EXISTS idx_system_notifications_severity ON public.system_notifications(severity);
CREATE INDEX IF NOT EXISTS idx_system_notifications_created_at ON public.system_notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_system_notifications_origin ON public.system_notifications(origin);
CREATE INDEX IF NOT EXISTS idx_system_notifications_is_read ON public.system_notifications(is_read) WHERE is_read = false;

-- Índice compuesto para búsqueda rápida de duplicados (sin predicado NOW())
-- El anti-spam funciona igual, pero sin índice parcial
CREATE INDEX IF NOT EXISTS idx_system_notifications_dedup
ON public.system_notifications(title, origin, created_at DESC);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_system_notifications_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_system_notifications_updated_at ON public.system_notifications;
CREATE TRIGGER trigger_update_system_notifications_updated_at
    BEFORE UPDATE ON public.system_notifications
    FOR EACH ROW
    EXECUTE FUNCTION update_system_notifications_updated_at();

-- 2. TABLA: system_metrics (opcional, para métricas agregadas)
CREATE TABLE IF NOT EXISTS public.system_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    metric_name TEXT NOT NULL,
    value NUMERIC NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para métricas
CREATE INDEX IF NOT EXISTS idx_system_metrics_name ON public.system_metrics(metric_name);
CREATE INDEX IF NOT EXISTS idx_system_metrics_created_at ON public.system_metrics(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_system_metrics_name_date ON public.system_metrics(metric_name, created_at DESC);

-- 3. ROW LEVEL SECURITY (RLS)
-- ⚠️ CRÍTICO: Solo admins (is_staff = true) pueden ver notificaciones del sistema
-- Estas notificaciones contienen datos sensibles del sistema y usuarios
-- PRIVACIDAD PRIMERO - Protegemos los datos de los usuarios
ALTER TABLE public.system_notifications ENABLE ROW LEVEL SECURITY;

-- Política: Solo service_role puede insertar (desde edge functions)
DROP POLICY IF EXISTS "Service role can manage notifications" ON public.system_notifications;
CREATE POLICY "Service role can manage notifications"
    ON public.system_notifications
    FOR ALL
    USING (auth.jwt() ->> 'role' = 'service_role')
    WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

-- Política: SOLO ADMINS (is_staff = true) pueden ver notificaciones
-- Esto protege la privacidad de los usuarios según nuestro compromiso
DROP POLICY IF EXISTS "Only admins can view notifications" ON public.system_notifications;
CREATE POLICY "Only admins can view notifications"
    ON public.system_notifications
    FOR SELECT
    USING (
        -- Verificar que el usuario es staff usando la función existente
        is_staff_user(auth.uid())
    );

-- RLS para métricas - SOLO ADMINS
ALTER TABLE public.system_metrics ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role can manage metrics" ON public.system_metrics;
CREATE POLICY "Service role can manage metrics"
    ON public.system_metrics
    FOR ALL
    USING (auth.jwt() ->> 'role' = 'service_role')
    WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

-- Política: SOLO ADMINS pueden ver métricas
DROP POLICY IF EXISTS "Only admins can view metrics" ON public.system_metrics;
CREATE POLICY "Only admins can view metrics"
    ON public.system_metrics
    FOR SELECT
    USING (
        is_staff_user(auth.uid())
    );

-- 4. FUNCIONES AUXILIARES

-- Función: Obtener notificaciones recientes
CREATE OR REPLACE FUNCTION get_recent_notifications(
    p_limit INTEGER DEFAULT 50,
    p_type TEXT DEFAULT NULL,
    p_severity TEXT DEFAULT NULL
)
RETURNS TABLE (
    id UUID,
    type TEXT,
    title TEXT,
    message TEXT,
    origin TEXT,
    payload JSONB,
    severity TEXT,
    created_at TIMESTAMPTZ,
    is_read BOOLEAN,
    count INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT
        sn.id,
        sn.type,
        sn.title,
        sn.message,
        sn.origin,
        sn.payload,
        sn.severity,
        sn.created_at,
        sn.is_read,
        sn.count
    FROM public.system_notifications sn
    WHERE
        (p_type IS NULL OR sn.type = p_type)
        AND (p_severity IS NULL OR sn.severity = p_severity)
    ORDER BY sn.created_at DESC
    LIMIT p_limit;
END;
$$;

-- Función: Marcar notificación como leída
CREATE OR REPLACE FUNCTION mark_notification_read(p_notification_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE public.system_notifications
    SET is_read = true
    WHERE id = p_notification_id;

    RETURN FOUND;
END;
$$;

-- Función: Obtener estadísticas de notificaciones
CREATE OR REPLACE FUNCTION get_notification_stats()
RETURNS TABLE (
    total_count BIGINT,
    unread_count BIGINT,
    error_count BIGINT,
    warning_count BIGINT,
    info_count BIGINT,
    usage_count BIGINT,
    critical_count BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT
        COUNT(*)::BIGINT as total_count,
        COUNT(*) FILTER (WHERE is_read = false)::BIGINT as unread_count,
        COUNT(*) FILTER (WHERE type = 'error')::BIGINT as error_count,
        COUNT(*) FILTER (WHERE type = 'warning')::BIGINT as warning_count,
        COUNT(*) FILTER (WHERE type = 'info')::BIGINT as info_count,
        COUNT(*) FILTER (WHERE type = 'usage')::BIGINT as usage_count,
        COUNT(*) FILTER (WHERE severity = 'critical')::BIGINT as critical_count
    FROM public.system_notifications;
END;
$$;

-- Función: Limpiar notificaciones antiguas (para mantenimiento)
CREATE OR REPLACE FUNCTION cleanup_old_notifications(p_days INTEGER DEFAULT 30)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM public.system_notifications
    WHERE created_at < NOW() - (p_days || ' days')::INTERVAL
    AND is_read = true
    AND severity IN ('low', 'medium');

    GET DIAGNOSTICS deleted_count = ROW_COUNT;

    RETURN deleted_count;
END;
$$;

-- 5. DATOS DE EJEMPLO (para testing)
-- Comentar en producción
/*
INSERT INTO public.system_notifications (type, title, message, origin, severity, payload) VALUES
('error', 'Error al crear transacción por voz', 'La función voice-to-transaction devolvió un error 500', '/voice-to-transaction', 'high', '{"error_code": 500, "details": "Internal server error"}'),
('warning', 'Uso alto de API', 'Se detectaron más de 1000 llamadas a la API en la última hora', '/api/usage', 'medium', '{"calls": 1234, "period": "1h"}'),
('info', 'Nuevo usuario registrado', 'Un nuevo usuario se registró en la plataforma', '/auth/signup', 'low', '{"user_id": "123", "email": "test@example.com"}'),
('usage', 'Función más usada', 'El usuario abrió el dashboard de transacciones', '/dashboard/transactions', 'low', '{"path": "/dashboard/transactions", "count": 45}'),
('error', 'Fallo en sincronización', 'Error al sincronizar datos con Supabase', '/sync', 'critical', '{"error": "Connection timeout", "retry_count": 3}');
*/

-- Comentarios finales
COMMENT ON TABLE public.system_notifications IS 'Sistema de notificaciones administrativas - Simple, eficiente y escalable';
COMMENT ON TABLE public.system_metrics IS 'Métricas agregadas del sistema (opcional)';
COMMENT ON COLUMN public.system_notifications.count IS 'Contador para eventos duplicados (anti-spam)';
COMMENT ON COLUMN public.system_notifications.is_read IS 'Indica si el admin ya leyó esta notificación';

