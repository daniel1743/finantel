-- =====================================================
-- MIGRACIÓN 025 - SISTEMA DE ADMINISTRACIÓN DE SOPORTE
-- =====================================================

-- =====================================================
-- PASO 1: AGREGAR CAMPO is_staff A profile_preferences
-- =====================================================
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'profile_preferences'
        AND column_name = 'is_staff'
    ) THEN
        ALTER TABLE public.profile_preferences
        ADD COLUMN is_staff BOOLEAN DEFAULT false;
        
        RAISE NOTICE '✅ Campo is_staff agregado a profile_preferences';
    ELSE
        RAISE NOTICE '⚠️ Campo is_staff ya existe en profile_preferences';
    END IF;
END $$;

-- Índice para búsqueda rápida de staff
CREATE INDEX IF NOT EXISTS idx_profile_preferences_staff 
ON public.profile_preferences(user_id) 
WHERE is_staff = true;

-- =====================================================
-- PASO 2: AGREGAR CAMPO assigned_to A support_tickets
-- =====================================================
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'support_tickets'
        AND column_name = 'assigned_to'
    ) THEN
        ALTER TABLE public.support_tickets
        ADD COLUMN assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL;
        
        RAISE NOTICE '✅ Campo assigned_to agregado a support_tickets';
    ELSE
        RAISE NOTICE '⚠️ Campo assigned_to ya existe en support_tickets';
    END IF;
END $$;

-- Índice para búsqueda de tickets asignados
CREATE INDEX IF NOT EXISTS idx_support_tickets_assigned 
ON public.support_tickets(assigned_to) 
WHERE assigned_to IS NOT NULL;

-- =====================================================
-- PASO 3: FUNCIÓN PARA VERIFICAR SI UN USUARIO ES STAFF
-- =====================================================
CREATE OR REPLACE FUNCTION is_staff_user(p_user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
    v_is_staff BOOLEAN;
BEGIN
    SELECT COALESCE(is_staff, false) INTO v_is_staff
    FROM public.profile_preferences
    WHERE user_id = p_user_id;
    
    RETURN COALESCE(v_is_staff, false);
END;
$$;

-- =====================================================
-- PASO 4: ACTUALIZAR RLS POLICIES PARA STAFF
-- =====================================================

-- Policy para que staff pueda ver TODOS los tickets
DROP POLICY IF EXISTS "staff_can_view_all_tickets" ON public.support_tickets;
CREATE POLICY "staff_can_view_all_tickets"
    ON public.support_tickets
    FOR SELECT
    USING (
        auth.uid() = user_id  -- Usuario ve sus propios tickets
        OR is_staff_user()    -- O es staff y ve todos
    );

-- Policy para que staff pueda actualizar cualquier ticket
DROP POLICY IF EXISTS "staff_can_update_all_tickets" ON public.support_tickets;
CREATE POLICY "staff_can_update_all_tickets"
    ON public.support_tickets
    FOR UPDATE
    USING (
        auth.uid() = user_id  -- Usuario actualiza sus propios tickets
        OR is_staff_user()    -- O es staff y actualiza cualquier ticket
    )
    WITH CHECK (
        auth.uid() = user_id  -- Usuario solo puede actualizar sus propios tickets
        OR is_staff_user()    -- O es staff y puede actualizar cualquier ticket
    );

-- Policy para que staff pueda ver TODAS las respuestas
DROP POLICY IF EXISTS "staff_can_view_all_responses" ON public.support_ticket_responses;
CREATE POLICY "staff_can_view_all_responses"
    ON public.support_ticket_responses
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.support_tickets
            WHERE id = support_ticket_responses.ticket_id
            AND user_id = auth.uid()
        )  -- Usuario ve respuestas de sus tickets
        OR is_staff_user()  -- O es staff y ve todas las respuestas
    );

-- Policy para que staff pueda agregar respuestas a cualquier ticket
DROP POLICY IF EXISTS "staff_can_add_responses" ON public.support_ticket_responses;
CREATE POLICY "staff_can_add_responses"
    ON public.support_ticket_responses
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.support_tickets
            WHERE id = support_ticket_responses.ticket_id
            AND user_id = auth.uid()
        )  -- Usuario puede agregar respuestas a sus tickets
        OR is_staff_user()  -- O es staff y puede agregar respuestas a cualquier ticket
    );

-- =====================================================
-- PASO 5: ACTUALIZAR FUNCIÓN add_ticket_response PARA VALIDAR STAFF
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
  current_user_id UUID;
BEGIN
  -- Obtener el usuario actual
  current_user_id := auth.uid();
  
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Debes estar autenticado para responder';
  END IF;

  -- Verificar que el ticket existe y obtener el user_id
  SELECT user_id INTO ticket_user_id
  FROM public.support_tickets
  WHERE id = p_ticket_id;

  IF ticket_user_id IS NULL THEN
    RAISE EXCEPTION 'Ticket no encontrado';
  END IF;

  -- Si se intenta responder como staff, validar que el usuario es staff
  IF p_is_staff THEN
    IF NOT is_staff_user(current_user_id) THEN
      RAISE EXCEPTION 'No tienes permisos para responder como staff';
    END IF;
    
    -- Si es staff pero no se proporcionó nombre, usar email del usuario
    IF p_staff_name IS NULL OR p_staff_name = '' THEN
      SELECT email INTO p_staff_name
      FROM auth.users
      WHERE id = current_user_id;
    END IF;
  ELSE
    -- Si no es staff, verificar que el usuario actual es el dueño del ticket
    IF current_user_id != ticket_user_id THEN
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
    current_user_id,
    p_message,
    p_is_staff,
    CASE WHEN p_is_staff THEN p_staff_name ELSE NULL END,
    p_attachments
  )
  RETURNING id INTO response_id;

  -- Actualizar timestamp del ticket y last_response_at
  UPDATE public.support_tickets
  SET 
    updated_at = now(),
    last_response_at = now()
  WHERE id = p_ticket_id;

  RETURN response_id;
END;
$$;

-- =====================================================
-- PASO 6: FUNCIÓN PARA ASIGNAR TICKET A STAFF
-- =====================================================
CREATE OR REPLACE FUNCTION assign_ticket_to_staff(
  p_ticket_id UUID,
  p_staff_user_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  ticket_exists BOOLEAN;
  staff_is_valid BOOLEAN;
BEGIN
  -- Verificar que el usuario actual es staff
  IF NOT is_staff_user() THEN
    RAISE EXCEPTION 'Solo el staff puede asignar tickets';
  END IF;

  -- Verificar que el ticket existe
  SELECT EXISTS(SELECT 1 FROM public.support_tickets WHERE id = p_ticket_id)
  INTO ticket_exists;
  
  IF NOT ticket_exists THEN
    RAISE EXCEPTION 'Ticket no encontrado';
  END IF;

  -- Verificar que el usuario asignado es staff
  SELECT is_staff_user(p_staff_user_id) INTO staff_is_valid;
  
  IF NOT staff_is_valid THEN
    RAISE EXCEPTION 'El usuario asignado debe ser staff';
  END IF;

  -- Asignar el ticket
  UPDATE public.support_tickets
  SET 
    assigned_to = p_staff_user_id,
    status = CASE WHEN status = 'abierto' THEN 'en_progreso' ELSE status END,
    updated_at = now()
  WHERE id = p_ticket_id;

  -- Crear notificación para el staff asignado
  PERFORM create_support_notification(
    p_staff_user_id,
    p_ticket_id,
    'ticket_updated',
    'Ticket asignado',
    'Se te ha asignado un nuevo ticket de soporte.',
    jsonb_build_object('ticket_id', p_ticket_id, 'assigned', true)
  );

  RETURN true;
END;
$$;

-- =====================================================
-- PASO 7: FUNCIÓN PARA OBTENER ESTADÍSTICAS DE TICKETS
-- =====================================================
CREATE OR REPLACE FUNCTION get_ticket_stats()
RETURNS TABLE (
  total_tickets BIGINT,
  open_tickets BIGINT,
  in_progress_tickets BIGINT,
  resolved_tickets BIGINT,
  critical_tickets BIGINT,
  avg_response_time_hours NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Solo staff puede ver estadísticas globales
  IF NOT is_staff_user() THEN
    RAISE EXCEPTION 'Solo el staff puede ver estadísticas globales';
  END IF;

  RETURN QUERY
  SELECT
    COUNT(*)::BIGINT as total_tickets,
    COUNT(*) FILTER (WHERE status = 'abierto')::BIGINT as open_tickets,
    COUNT(*) FILTER (WHERE status = 'en_progreso')::BIGINT as in_progress_tickets,
    COUNT(*) FILTER (WHERE status = 'resuelto')::BIGINT as resolved_tickets,
    COUNT(*) FILTER (WHERE priority = 'critica')::BIGINT as critical_tickets,
    COALESCE(
      AVG(
        EXTRACT(EPOCH FROM (last_response_at - created_at)) / 3600
      ) FILTER (WHERE last_response_at IS NOT NULL),
      0
    )::NUMERIC as avg_response_time_hours
  FROM public.support_tickets;
END;
$$;

-- =====================================================
-- PASO 8: PERMISOS
-- =====================================================
GRANT EXECUTE ON FUNCTION is_staff_user(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION assign_ticket_to_staff(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_ticket_stats() TO authenticated;

-- =====================================================
-- VERIFICACIÓN
-- =====================================================
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ SISTEMA DE ADMINISTRACIÓN CREADO';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Campos agregados:';
  RAISE NOTICE '  - profile_preferences.is_staff';
  RAISE NOTICE '  - support_tickets.assigned_to';
  RAISE NOTICE '';
  RAISE NOTICE 'Funciones creadas:';
  RAISE NOTICE '  - is_staff_user()';
  RAISE NOTICE '  - assign_ticket_to_staff()';
  RAISE NOTICE '  - get_ticket_stats()';
  RAISE NOTICE '';
  RAISE NOTICE 'RLS Policies actualizadas:';
  RAISE NOTICE '  - staff_can_view_all_tickets';
  RAISE NOTICE '  - staff_can_update_all_tickets';
  RAISE NOTICE '  - staff_can_view_all_responses';
  RAISE NOTICE '  - staff_can_add_responses';
  RAISE NOTICE '';
  RAISE NOTICE '⚠️ IMPORTANTE: Marca usuarios como staff:';
  RAISE NOTICE '  UPDATE profile_preferences SET is_staff = true WHERE user_id = ''UUID_DEL_USUARIO'';';
  RAISE NOTICE '========================================';
END $$;


