-- =====================================================
-- MIGRACIÓN 056 - NOTIFICACIONES POR CORREO PARA TICKETS
-- =====================================================
-- Crea un trigger que envía notificaciones por correo
-- cuando se crea un nuevo ticket de soporte
-- =====================================================

-- =====================================================
-- PASO 1: FUNCIÓN PARA LLAMAR AL EDGE FUNCTION
-- =====================================================
CREATE OR REPLACE FUNCTION notify_support_ticket_created()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_email TEXT;
  v_user_name TEXT;
  v_payload JSONB;
  v_response TEXT;
BEGIN
  -- Obtener email y nombre del usuario
  SELECT 
    email,
    COALESCE(raw_user_meta_data->>'full_name', split_part(email, '@', 1))
  INTO v_user_email, v_user_name
  FROM auth.users
  WHERE id = NEW.user_id;

  -- Si no se encuentra el email, usar un valor por defecto
  IF v_user_email IS NULL THEN
    v_user_email := 'usuario@finantel.app';
    v_user_name := 'Usuario';
  END IF;

  -- Construir payload para el Edge Function
  v_payload := jsonb_build_object(
    'ticket_id', NEW.id::TEXT,
    'user_id', NEW.user_id::TEXT,
    'user_email', v_user_email,
    'user_name', v_user_name,
    'subject', NEW.subject,
    'category', NEW.category,
    'priority', NEW.priority,
    'message', NEW.message,
    'created_at', NEW.created_at::TEXT
  );

  -- Llamar al Edge Function usando http extension
  -- Nota: Esto requiere que la extensión http esté habilitada
  BEGIN
    SELECT content INTO v_response
    FROM http((
      'POST',
      current_setting('app.settings.supabase_url', true) || '/functions/v1/notify-support-ticket',
      ARRAY[
        http_header('Content-Type', 'application/json'),
        http_header('Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)),
        http_header('apikey', current_setting('app.settings.service_role_key', true))
      ],
      'application/json',
      v_payload::TEXT
    )::http_request);

    -- Log de éxito (opcional)
    RAISE NOTICE 'Notification sent for ticket %', NEW.id;
  EXCEPTION
    WHEN OTHERS THEN
      -- Si falla, solo loguear el error pero no fallar el INSERT
      RAISE WARNING 'Could not send notification for ticket %: %', NEW.id, SQLERRM;
  END;

  RETURN NEW;
END;
$$;

-- =====================================================
-- PASO 2: CREAR TRIGGER
-- =====================================================
DROP TRIGGER IF EXISTS trg_notify_support_ticket_created ON public.support_tickets;
CREATE TRIGGER trg_notify_support_ticket_created
  AFTER INSERT ON public.support_tickets
  FOR EACH ROW
  EXECUTE FUNCTION notify_support_ticket_created();

-- =====================================================
-- PASO 3: CONFIGURACIÓN ALTERNATIVA (usando pg_net)
-- =====================================================
-- Si http extension no está disponible, usar pg_net
-- Descomentar si prefieres usar pg_net en lugar de http

/*
CREATE OR REPLACE FUNCTION notify_support_ticket_created_pgnet()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_email TEXT;
  v_user_name TEXT;
  v_payload JSONB;
  v_job_id BIGINT;
BEGIN
  -- Obtener email y nombre del usuario
  SELECT 
    email,
    COALESCE(raw_user_meta_data->>'full_name', split_part(email, '@', 1))
  INTO v_user_email, v_user_name
  FROM auth.users
  WHERE id = NEW.user_id;

  IF v_user_email IS NULL THEN
    v_user_email := 'usuario@finantel.app';
    v_user_name := 'Usuario';
  END IF;

  v_payload := jsonb_build_object(
    'ticket_id', NEW.id::TEXT,
    'user_id', NEW.user_id::TEXT,
    'user_email', v_user_email,
    'user_name', v_user_name,
    'subject', NEW.subject,
    'category', NEW.category,
    'priority', NEW.priority,
    'message', NEW.message,
    'created_at', NEW.created_at::TEXT
  );

  -- Usar pg_net para hacer la llamada HTTP
  SELECT net.http_post(
    url := current_setting('app.settings.supabase_url', true) || '/functions/v1/notify-support-ticket',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true),
      'apikey', current_setting('app.settings.service_role_key', true)
    ),
    body := v_payload::TEXT
  ) INTO v_job_id;

  RETURN NEW;
END;
$$;
*/

-- =====================================================
-- VERIFICACIÓN
-- =====================================================
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ SISTEMA DE NOTIFICACIONES CREADO';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Trigger creado: trg_notify_support_ticket_created';
  RAISE NOTICE '';
  RAISE NOTICE '⚠️ IMPORTANTE: Configurar variables de entorno:';
  RAISE NOTICE '  1. ADMIN_EMAIL o SUPPORT_EMAIL: Correo del administrador';
  RAISE NOTICE '  2. RESEND_API_KEY (opcional): Para usar Resend como servicio de correo';
  RAISE NOTICE '  3. RESEND_FROM_EMAIL (opcional): Email remitente para Resend';
  RAISE NOTICE '';
  RAISE NOTICE 'En Supabase Dashboard:';
  RAISE NOTICE '  Settings > Edge Functions > Secrets';
  RAISE NOTICE '  Agregar: ADMIN_EMAIL, RESEND_API_KEY, RESEND_FROM_EMAIL';
  RAISE NOTICE '========================================';
END $$;

