-- ============================================================================
-- MIGRACIÓN 050: WEBHOOKS EXTERNOS + NOTIFICACIONES ADMINISTRATIVAS
-- ============================================================================
-- Sistema universal para recibir webhooks y notificaciones administrativas
-- Creado para integrar Mercado Pago y futuras integraciones (SII, bancos, etc.)
-- ============================================================================

-- ============================================================================
-- 1. TABLA: external_webhooks
-- ============================================================================
-- Tabla universal para almacenar todos los webhooks externos recibidos
-- Escalable para Mercado Pago, Stripe, bancos, SII, SMS, Email, etc.
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.external_webhooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source TEXT NOT NULL,              -- 'mercadopago', 'stripe', 'clp-bank', 'sii', 'system'
  event_type TEXT NOT NULL,          -- 'payment.created', 'payment.updated', 'subscription_authorized', etc
  payload JSONB NOT NULL,            -- guardar TODO sin modificar (el JSON completo)
  status TEXT DEFAULT 'received' CHECK (status IN ('received', 'processed', 'error')),     -- estado del procesamiento
  error_message TEXT,                -- mensaje de error si falló el procesamiento
  ip_address TEXT,                   -- IP desde donde se recibió el webhook
  signature TEXT,                    -- firma del webhook para validación
  created_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ           -- cuando se procesó exitosamente
);

-- Índices para búsqueda rápida
CREATE INDEX IF NOT EXISTS idx_external_webhooks_source ON public.external_webhooks(source);
CREATE INDEX IF NOT EXISTS idx_external_webhooks_event_type ON public.external_webhooks(event_type);
CREATE INDEX IF NOT EXISTS idx_external_webhooks_status ON public.external_webhooks(status);
CREATE INDEX IF NOT EXISTS idx_external_webhooks_created_at ON public.external_webhooks(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_external_webhooks_source_event ON public.external_webhooks(source, event_type);

-- ============================================================================
-- 2. TABLA: admin_notifications
-- ============================================================================
-- Notificaciones administrativas para el panel de admin
-- Diferente de system_notifications (que es para errores técnicos)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.admin_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL,                -- 'payment_success', 'payment_error', 'subscription', 
                                     -- 'webhook_error', 'system_alert', 'ticket_created', etc.
  source TEXT,                       -- 'mercadopago', 'finantel', 'system'
  metadata JSONB DEFAULT '{}'::jsonb, -- datos adicionales del evento
  created_at TIMESTAMPTZ DEFAULT NOW(),
  is_read BOOLEAN DEFAULT false
);

-- Índices para búsqueda rápida
CREATE INDEX IF NOT EXISTS idx_admin_notifications_type ON public.admin_notifications(type);
CREATE INDEX IF NOT EXISTS idx_admin_notifications_source ON public.admin_notifications(source);
CREATE INDEX IF NOT EXISTS idx_admin_notifications_is_read ON public.admin_notifications(is_read) WHERE is_read = false;
CREATE INDEX IF NOT EXISTS idx_admin_notifications_created_at ON public.admin_notifications(created_at DESC);

-- ============================================================================
-- 3. FUNCIÓN is_staff_user() - SI NO EXISTE YA
-- ============================================================================
-- Esta función debería existir de la migración 025, pero la creamos aquí
-- por si acaso para que esta migración sea autocontenida
-- ============================================================================

CREATE OR REPLACE FUNCTION is_staff_user(p_user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
    v_is_staff BOOLEAN;
BEGIN
    -- Verificar si el usuario es staff en profile_preferences
    SELECT COALESCE(is_staff, false) INTO v_is_staff
    FROM public.profile_preferences
    WHERE user_id = p_user_id;
    
    RETURN COALESCE(v_is_staff, false);
END;
$$;

-- ============================================================================
-- 4. ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- RLS para external_webhooks: SOLO ADMINS pueden ver
ALTER TABLE public.external_webhooks ENABLE ROW LEVEL SECURITY;

-- Service role puede insertar/actualizar (desde edge functions)
DROP POLICY IF EXISTS "Service role can manage webhooks" ON public.external_webhooks;
CREATE POLICY "Service role can manage webhooks"
    ON public.external_webhooks
    FOR ALL
    USING (auth.jwt() ->> 'role' = 'service_role')
    WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

-- Solo admins pueden ver webhooks
DROP POLICY IF EXISTS "Only admins can view webhooks" ON public.external_webhooks;
CREATE POLICY "Only admins can view webhooks"
    ON public.external_webhooks
    FOR SELECT
    USING (is_staff_user(auth.uid()));

-- RLS para admin_notifications: SOLO ADMINS pueden ver
ALTER TABLE public.admin_notifications ENABLE ROW LEVEL SECURITY;

-- Service role puede insertar/actualizar (desde edge functions)
DROP POLICY IF EXISTS "Service role can manage admin notifications" ON public.admin_notifications;
CREATE POLICY "Service role can manage admin notifications"
    ON public.admin_notifications
    FOR ALL
    USING (auth.jwt() ->> 'role' = 'service_role')
    WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

-- Solo admins pueden ver y marcar como leídas
DROP POLICY IF EXISTS "Only admins can view admin notifications" ON public.admin_notifications;
CREATE POLICY "Only admins can view admin notifications"
    ON public.admin_notifications
    FOR SELECT
    USING (is_staff_user(auth.uid()));

-- Admins pueden actualizar (marcar como leídas)
DROP POLICY IF EXISTS "Only admins can update admin notifications" ON public.admin_notifications;
CREATE POLICY "Only admins can update admin notifications"
    ON public.admin_notifications
    FOR UPDATE
    USING (is_staff_user(auth.uid()))
    WITH CHECK (is_staff_user(auth.uid()));

-- ============================================================================
-- 5. TRIGGER: Notificar cuando se crea un ticket
-- ============================================================================
-- Cuando un usuario crea un ticket, se genera automáticamente una notificación
-- administrativa para que el staff se entere
-- ============================================================================

CREATE OR REPLACE FUNCTION notify_admin_on_ticket_created()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_email TEXT;
  v_user_name TEXT;
BEGIN
  -- Obtener información del usuario que creó el ticket
  SELECT 
    raw_user_meta_data->>'email',
    COALESCE(raw_user_meta_data->>'name', raw_user_meta_data->>'email', 'Usuario')
  INTO v_user_email, v_user_name
  FROM auth.users
  WHERE id = NEW.user_id;

  -- Crear notificación administrativa
  INSERT INTO public.admin_notifications (
    title,
    message,
    type,
    source,
    metadata
  ) VALUES (
    'Nuevo ticket de soporte',
    'El usuario ' || COALESCE(v_user_name, 'desconocido') || ' (' || COALESCE(v_user_email, 'sin email') || ') ha creado un ticket: ' || NEW.subject,
    'ticket_created',
    'finantel',
    jsonb_build_object(
      'ticket_id', NEW.id,
      'user_id', NEW.user_id,
      'user_email', v_user_email,
      'user_name', v_user_name,
      'ticket_subject', NEW.subject,
      'ticket_category', NEW.category,
      'ticket_priority', NEW.priority
    )
  );

  RETURN NEW;
END;
$$;

-- Crear trigger si no existe
DROP TRIGGER IF EXISTS trigger_notify_admin_on_ticket_created ON public.support_tickets;
CREATE TRIGGER trigger_notify_admin_on_ticket_created
    AFTER INSERT ON public.support_tickets
    FOR EACH ROW
    EXECUTE FUNCTION notify_admin_on_ticket_created();

-- ============================================================================
-- 6. FUNCIONES AUXILIARES
-- ============================================================================

-- Función para marcar notificación como leída
CREATE OR REPLACE FUNCTION mark_admin_notification_read(p_notification_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE public.admin_notifications
    SET is_read = true
    WHERE id = p_notification_id
    AND is_staff_user(auth.uid()); -- Solo admins pueden marcar como leídas

    RETURN FOUND;
END;
$$;

-- Función para obtener estadísticas de notificaciones administrativas
CREATE OR REPLACE FUNCTION get_admin_notification_stats()
RETURNS TABLE (
    total_count BIGINT,
    unread_count BIGINT,
    error_count BIGINT,
    warning_count BIGINT,
    info_count BIGINT,
    usage_count BIGINT,
    critical_count BIGINT,
    payment_success_count BIGINT,
    payment_error_count BIGINT,
    ticket_created_count BIGINT,
    webhook_error_count BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT
        COUNT(*)::BIGINT as total_count,
        COUNT(*) FILTER (WHERE is_read = false)::BIGINT as unread_count,
        COUNT(*) FILTER (WHERE type IN ('payment_error', 'webhook_error', 'system_alert'))::BIGINT as error_count,
        COUNT(*) FILTER (WHERE type = 'system_alert')::BIGINT as warning_count,
        COUNT(*) FILTER (WHERE type = 'ticket_created')::BIGINT as info_count,
        COUNT(*) FILTER (WHERE type = 'subscription')::BIGINT as usage_count,
        COUNT(*) FILTER (WHERE type = 'payment_error' OR type = 'webhook_error')::BIGINT as critical_count,
        COUNT(*) FILTER (WHERE type = 'payment_success')::BIGINT as payment_success_count,
        COUNT(*) FILTER (WHERE type = 'payment_error')::BIGINT as payment_error_count,
        COUNT(*) FILTER (WHERE type = 'ticket_created')::BIGINT as ticket_created_count,
        COUNT(*) FILTER (WHERE type = 'webhook_error')::BIGINT as webhook_error_count
    FROM public.admin_notifications;
END;
$$;

-- ============================================================================
-- COMENTARIOS
-- ============================================================================

COMMENT ON TABLE public.external_webhooks IS 'Sistema universal para recibir y almacenar webhooks externos. Escalable para Mercado Pago, Stripe, bancos, SII, etc.';
COMMENT ON TABLE public.admin_notifications IS 'Notificaciones administrativas para el panel de admin. Diferente de system_notifications (errores técnicos).';
COMMENT ON COLUMN public.external_webhooks.source IS 'Fuente del webhook: mercadopago, stripe, clp-bank, sii, system, etc.';
COMMENT ON COLUMN public.external_webhooks.payload IS 'Payload completo del webhook sin modificar (JSONB)';
COMMENT ON COLUMN public.admin_notifications.type IS 'Tipo de notificación: payment_success, payment_error, subscription, webhook_error, system_alert, ticket_created, etc.';

-- ============================================================================
-- FIN DE MIGRACIÓN
-- ============================================================================
