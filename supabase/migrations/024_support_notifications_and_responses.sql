-- =====================================================
-- SISTEMA DE NOTIFICACIONES Y RESPUESTAS PARA TICKETS
-- =====================================================

-- =====================================================
-- PASO 1: TABLA DE RESPUESTAS/CONVERSACIONES
-- =====================================================
CREATE TABLE IF NOT EXISTS public.support_ticket_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES public.support_tickets(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  is_staff_response BOOLEAN DEFAULT false,
  staff_name TEXT,
  attachments JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Índices para rendimiento
CREATE INDEX IF NOT EXISTS idx_ticket_responses_ticket ON public.support_ticket_responses(ticket_id);
CREATE INDEX IF NOT EXISTS idx_ticket_responses_user ON public.support_ticket_responses(user_id);
CREATE INDEX IF NOT EXISTS idx_ticket_responses_created ON public.support_ticket_responses(created_at DESC);

-- =====================================================
-- PASO 2: TABLA DE NOTIFICACIONES
-- =====================================================
CREATE TABLE IF NOT EXISTS public.support_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  ticket_id UUID REFERENCES public.support_tickets(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('ticket_created', 'ticket_updated', 'response_received', 'status_changed')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.support_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.support_notifications(user_id, read);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON public.support_notifications(created_at DESC);

-- =====================================================
-- PASO 3: FUNCIÓN PARA CREAR NOTIFICACIÓN
-- =====================================================
CREATE OR REPLACE FUNCTION create_support_notification(
  p_user_id UUID,
  p_ticket_id UUID,
  p_type TEXT,
  p_title TEXT,
  p_message TEXT,
  p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  notification_id UUID;
BEGIN
  INSERT INTO public.support_notifications (
    user_id,
    ticket_id,
    type,
    title,
    message,
    metadata
  )
  VALUES (
    p_user_id,
    p_ticket_id,
    p_type,
    p_title,
    p_message,
    p_metadata
  )
  RETURNING id INTO notification_id;

  RETURN notification_id;
END;
$$;

-- =====================================================
-- PASO 4: TRIGGER CUANDO SE CREA UN TICKET
-- =====================================================
CREATE OR REPLACE FUNCTION notify_ticket_created()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  PERFORM create_support_notification(
    NEW.user_id,
    NEW.id,
    'ticket_created',
    'Ticket creado exitosamente',
    'Tu ticket #' || SUBSTRING(NEW.id::TEXT, 1, 8) || ' ha sido creado. Nuestro equipo lo revisará pronto.',
    jsonb_build_object(
      'ticket_id', NEW.id,
      'subject', NEW.subject,
      'category', NEW.category,
      'priority', NEW.priority
    )
  );

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_ticket_created ON public.support_tickets;
CREATE TRIGGER on_ticket_created
  AFTER INSERT ON public.support_tickets
  FOR EACH ROW
  EXECUTE FUNCTION notify_ticket_created();

-- =====================================================
-- PASO 5: TRIGGER CUANDO SE ACTUALIZA EL ESTADO
-- =====================================================
CREATE OR REPLACE FUNCTION notify_ticket_status_changed()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  status_label TEXT;
BEGIN
  -- Solo notificar si el estado cambió
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    -- Traducir estado a texto amigable
    status_label := CASE NEW.status
      WHEN 'abierto' THEN 'abierto'
      WHEN 'en_progreso' THEN 'en progreso'
      WHEN 'resuelto' THEN 'resuelto'
      WHEN 'archivado' THEN 'archivado'
      ELSE NEW.status
    END;

    PERFORM create_support_notification(
      NEW.user_id,
      NEW.id,
      'status_changed',
      'Estado de ticket actualizado',
      'Tu ticket #' || SUBSTRING(NEW.id::TEXT, 1, 8) || ' cambió a "' || status_label || '".',
      jsonb_build_object(
        'ticket_id', NEW.id,
        'old_status', OLD.status,
        'new_status', NEW.status,
        'subject', NEW.subject
      )
    );
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_ticket_status_changed ON public.support_tickets;
CREATE TRIGGER on_ticket_status_changed
  AFTER UPDATE ON public.support_tickets
  FOR EACH ROW
  EXECUTE FUNCTION notify_ticket_status_changed();

-- =====================================================
-- PASO 6: TRIGGER CUANDO SE AGREGA UNA RESPUESTA
-- =====================================================
CREATE OR REPLACE FUNCTION notify_ticket_response()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  ticket_user_id UUID;
  ticket_subject TEXT;
BEGIN
  -- Obtener info del ticket
  SELECT user_id, subject INTO ticket_user_id, ticket_subject
  FROM public.support_tickets
  WHERE id = NEW.ticket_id;

  -- Si es respuesta del staff, notificar al usuario
  IF NEW.is_staff_response THEN
    PERFORM create_support_notification(
      ticket_user_id,
      NEW.ticket_id,
      'response_received',
      'Nueva respuesta de soporte',
      COALESCE(NEW.staff_name, 'El equipo') || ' ha respondido a tu ticket.',
      jsonb_build_object(
        'ticket_id', NEW.ticket_id,
        'response_id', NEW.id,
        'subject', ticket_subject,
        'staff_name', NEW.staff_name
      )
    );

    -- Actualizar estado del ticket a "en_progreso"
    UPDATE public.support_tickets
    SET
      status = 'en_progreso',
      updated_at = now()
    WHERE id = NEW.ticket_id AND status = 'abierto';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_ticket_response ON public.support_ticket_responses;
CREATE TRIGGER on_ticket_response
  AFTER INSERT ON public.support_ticket_responses
  FOR EACH ROW
  EXECUTE FUNCTION notify_ticket_response();

-- =====================================================
-- PASO 7: FUNCIÓN PARA AGREGAR RESPUESTA AL TICKET
-- =====================================================
CREATE OR REPLACE FUNCTION add_ticket_response(
  p_ticket_id UUID,
  p_message TEXT,
  p_is_staff BOOLEAN DEFAULT false,
  p_staff_name TEXT DEFAULT NULL,
  p_attachments JSONB DEFAULT '[]'::jsonb
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  response_id UUID;
  ticket_user_id UUID;
BEGIN
  -- Verificar que el ticket existe y obtener el user_id
  SELECT user_id INTO ticket_user_id
  FROM public.support_tickets
  WHERE id = p_ticket_id;

  IF ticket_user_id IS NULL THEN
    RAISE EXCEPTION 'Ticket no encontrado';
  END IF;

  -- Si no es staff, verificar que el usuario actual es el dueño del ticket
  IF NOT p_is_staff THEN
    IF auth.uid() != ticket_user_id THEN
      RAISE EXCEPTION 'No tienes permiso para responder a este ticket';
    END IF;
  END IF;

  -- Insertar respuesta
  INSERT INTO public.support_ticket_responses (
    ticket_id,
    user_id,
    message,
    is_staff_response,
    staff_name,
    attachments
  )
  VALUES (
    p_ticket_id,
    COALESCE(auth.uid(), ticket_user_id),
    p_message,
    p_is_staff,
    p_staff_name,
    p_attachments
  )
  RETURNING id INTO response_id;

  -- Actualizar timestamp del ticket
  UPDATE public.support_tickets
  SET updated_at = now()
  WHERE id = p_ticket_id;

  RETURN response_id;
END;
$$;

-- =====================================================
-- PASO 8: FUNCIÓN PARA MARCAR NOTIFICACIONES COMO LEÍDAS
-- =====================================================
CREATE OR REPLACE FUNCTION mark_notifications_read(notification_ids UUID[])
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  updated_count INTEGER;
BEGIN
  UPDATE public.support_notifications
  SET read = true
  WHERE id = ANY(notification_ids)
    AND user_id = auth.uid();

  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RETURN updated_count;
END;
$$;

-- =====================================================
-- PASO 9: RLS POLICIES
-- =====================================================

-- Support Ticket Responses
ALTER TABLE public.support_ticket_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view responses to their tickets"
ON public.support_ticket_responses
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.support_tickets
    WHERE id = support_ticket_responses.ticket_id
    AND user_id = auth.uid()
  )
);

CREATE POLICY "Users can add responses to their tickets"
ON public.support_ticket_responses
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.support_tickets
    WHERE id = support_ticket_responses.ticket_id
    AND user_id = auth.uid()
  )
  AND user_id = auth.uid()
);

-- Support Notifications
ALTER TABLE public.support_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their notifications"
ON public.support_notifications
FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Users can update their notifications"
ON public.support_notifications
FOR UPDATE
USING (user_id = auth.uid());

-- =====================================================
-- PASO 10: PERMISOS
-- =====================================================
GRANT EXECUTE ON FUNCTION create_support_notification(UUID, UUID, TEXT, TEXT, TEXT, JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION add_ticket_response(UUID, TEXT, BOOLEAN, TEXT, JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION mark_notifications_read(UUID[]) TO authenticated;

-- =====================================================
-- VERIFICACIÓN
-- =====================================================
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ SISTEMA DE NOTIFICACIONES CREADO';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Tablas creadas:';
  RAISE NOTICE '  - support_ticket_responses';
  RAISE NOTICE '  - support_notifications';
  RAISE NOTICE '';
  RAISE NOTICE 'Triggers creados:';
  RAISE NOTICE '  - on_ticket_created';
  RAISE NOTICE '  - on_ticket_status_changed';
  RAISE NOTICE '  - on_ticket_response';
  RAISE NOTICE '';
  RAISE NOTICE 'Funciones disponibles:';
  RAISE NOTICE '  - add_ticket_response()';
  RAISE NOTICE '  - mark_notifications_read()';
  RAISE NOTICE '========================================';
END $$;
