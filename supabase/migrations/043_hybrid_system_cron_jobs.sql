-- ============================================================================
-- HYBRID SYSTEM - CRON JOBS CONFIGURATION
-- ============================================================================
-- Configuración de tareas periódicas para el sistema híbrido
-- Bots vigilantes + AI Investigator
-- ============================================================================

-- Habilitar extensión pg_cron si no está habilitada
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- ============================================================================
-- 1. CRON JOBS PARA BOTS VIGILANTES
-- ============================================================================

-- Bot 1: Detectar Suscripciones (cada 10 minutos)
SELECT cron.schedule(
  'bot-detect-subscriptions',
  '*/10 * * * *',  -- Cada 10 minutos
  $$
  SELECT
    net.http_post(
      url := current_setting('app.settings.supabase_url', true) || '/functions/v1/bot-detect-subscriptions',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)
      ),
      body := '{}'::jsonb
    ) as request_id;
  $$
);

COMMENT ON EXTENSION pg_cron IS 'Programador de tareas cron para PostgreSQL';

-- Bot 2: Detectar Duplicados (cada 15 minutos)
SELECT cron.schedule(
  'bot-detect-duplicates',
  '*/15 * * * *',  -- Cada 15 minutos
  $$
  SELECT
    net.http_post(
      url := current_setting('app.settings.supabase_url', true) || '/functions/v1/bot-detect-duplicates',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)
      ),
      body := '{}'::jsonb
    ) as request_id;
  $$
);

-- Bot 3: Detectar Delivery Excesivo (cada 30 minutos)
SELECT cron.schedule(
  'bot-detect-delivery',
  '*/30 * * * *',  -- Cada 30 minutos
  $$
  SELECT
    net.http_post(
      url := current_setting('app.settings.supabase_url', true) || '/functions/v1/bot-detect-delivery',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)
      ),
      body := '{}'::jsonb
    ) as request_id;
  $$
);

-- Bot 4: Detectar Microcompras (cada 30 minutos)
SELECT cron.schedule(
  'bot-detect-microspend',
  '*/30 * * * *',  -- Cada 30 minutos
  $$
  SELECT
    net.http_post(
      url := current_setting('app.settings.supabase_url', true) || '/functions/v1/bot-detect-microspend',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)
      ),
      body := '{}'::jsonb
    ) as request_id;
  $$
);

-- Bot 5: Detectar Compras Nocturnas (cada 1 hora)
SELECT cron.schedule(
  'bot-detect-nightspend',
  '0 * * * *',  -- Cada hora en punto
  $$
  SELECT
    net.http_post(
      url := current_setting('app.settings.supabase_url', true) || '/functions/v1/bot-detect-nightspend',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)
      ),
      body := '{}'::jsonb
    ) as request_id;
  $$
);

-- Bot 6: Detectar Cargos Fijos Sospechosos (cada 2 horas)
SELECT cron.schedule(
  'bot-detect-fixed-charges',
  '0 */2 * * *',  -- Cada 2 horas
  $$
  SELECT
    net.http_post(
      url := current_setting('app.settings.supabase_url', true) || '/functions/v1/bot-detect-fixed-charges',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)
      ),
      body := '{}'::jsonb
    ) as request_id;
  $$
);

-- Bot 7: Detectar Actividad Inusual (cada 4 horas)
SELECT cron.schedule(
  'bot-detect-unusual-activity',
  '0 */4 * * *',  -- Cada 4 horas
  $$
  SELECT
    net.http_post(
      url := current_setting('app.settings.supabase_url', true) || '/functions/v1/bot-detect-unusual-activity',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)
      ),
      body := '{}'::jsonb
    ) as request_id;
  $$
);

-- ============================================================================
-- 2. CRON JOB PARA AI INVESTIGATOR
-- ============================================================================

-- AI Investigator: Analizar alertas cada 5 minutos
SELECT cron.schedule(
  'ai-investigator',
  '*/5 * * * *',  -- Cada 5 minutos
  $$
  SELECT
    net.http_post(
      url := current_setting('app.settings.supabase_url', true) || '/functions/v1/ai-investigator',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)
      ),
      body := '{}'::jsonb
    ) as request_id;
  $$
);

-- ============================================================================
-- 3. CRON JOB PARA LIMPIEZA DE CACHE
-- ============================================================================

-- Limpiar cache expirado (diariamente a las 3 AM)
SELECT cron.schedule(
  'cleanup-expired-cache',
  '0 3 * * *',  -- Todos los días a las 3 AM
  $$SELECT cleanup_expired_cache();$$
);

-- ============================================================================
-- 4. FUNCIONES AUXILIARES PARA GESTIÓN DE CRON JOBS
-- ============================================================================

-- Ver todos los cron jobs activos
CREATE OR REPLACE FUNCTION get_active_cron_jobs()
RETURNS TABLE (
  jobid bigint,
  schedule text,
  command text,
  nodename text,
  nodeport integer,
  database text,
  username text,
  active boolean
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    cron.jobid,
    cron.schedule,
    cron.command,
    cron.nodename,
    cron.nodeport,
    cron.database,
    cron.username,
    cron.active
  FROM cron.job cron
  ORDER BY cron.jobid;
END;
$$ LANGUAGE plpgsql;

-- Ver historial de ejecuciones recientes
CREATE OR REPLACE FUNCTION get_cron_job_history(p_limit INTEGER DEFAULT 100)
RETURNS TABLE (
  jobid bigint,
  runid bigint,
  job_pid integer,
  database text,
  username text,
  command text,
  status text,
  return_message text,
  start_time timestamptz,
  end_time timestamptz
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    h.jobid,
    h.runid,
    h.job_pid,
    h.database,
    h.username,
    h.command,
    h.status,
    h.return_message,
    h.start_time,
    h.end_time
  FROM cron.job_run_details h
  ORDER BY h.start_time DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- Ver estadísticas de cron jobs
CREATE OR REPLACE FUNCTION get_cron_job_stats()
RETURNS TABLE (
  job_name text,
  total_runs bigint,
  successful_runs bigint,
  failed_runs bigint,
  success_rate numeric,
  avg_duration_ms numeric,
  last_run timestamptz,
  last_status text
) AS $$
BEGIN
  RETURN QUERY
  WITH job_stats AS (
    SELECT
      j.command,
      COUNT(*) as total,
      COUNT(*) FILTER (WHERE h.status = 'succeeded') as succeeded,
      COUNT(*) FILTER (WHERE h.status = 'failed') as failed,
      AVG(EXTRACT(EPOCH FROM (h.end_time - h.start_time)) * 1000) as avg_ms,
      MAX(h.start_time) as last_run,
      (SELECT h2.status FROM cron.job_run_details h2 WHERE h2.jobid = j.jobid ORDER BY h2.start_time DESC LIMIT 1) as last_status
    FROM cron.job j
    LEFT JOIN cron.job_run_details h ON j.jobid = h.jobid
    GROUP BY j.jobid, j.command
  )
  SELECT
    -- Extraer nombre del job del command
    CASE
      WHEN js.command LIKE '%bot-detect-subscriptions%' THEN 'bot-detect-subscriptions'
      WHEN js.command LIKE '%bot-detect-duplicates%' THEN 'bot-detect-duplicates'
      WHEN js.command LIKE '%bot-detect-delivery%' THEN 'bot-detect-delivery'
      WHEN js.command LIKE '%bot-detect-microspend%' THEN 'bot-detect-microspend'
      WHEN js.command LIKE '%bot-detect-nightspend%' THEN 'bot-detect-nightspend'
      WHEN js.command LIKE '%bot-detect-fixed-charges%' THEN 'bot-detect-fixed-charges'
      WHEN js.command LIKE '%bot-detect-unusual-activity%' THEN 'bot-detect-unusual-activity'
      WHEN js.command LIKE '%ai-investigator%' THEN 'ai-investigator'
      WHEN js.command LIKE '%cleanup-expired-cache%' THEN 'cleanup-expired-cache'
      ELSE 'unknown'
    END::text,
    js.total,
    js.succeeded,
    js.failed,
    CASE WHEN js.total > 0 THEN (js.succeeded::numeric / js.total * 100) ELSE 0 END,
    js.avg_ms,
    js.last_run,
    js.last_status::text
  FROM job_stats js
  ORDER BY js.last_run DESC NULLS LAST;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 5. FUNCIÓN PARA PAUSAR/REACTIVAR CRON JOBS
-- ============================================================================

-- Pausar un cron job específico
CREATE OR REPLACE FUNCTION pause_cron_job(p_job_name TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  v_jobid BIGINT;
BEGIN
  -- Buscar el job por nombre en el comando
  SELECT jobid INTO v_jobid
  FROM cron.job
  WHERE command LIKE '%' || p_job_name || '%'
  LIMIT 1;

  IF v_jobid IS NULL THEN
    RAISE NOTICE 'Job % no encontrado', p_job_name;
    RETURN FALSE;
  END IF;

  -- Pausar el job
  UPDATE cron.job
  SET active = FALSE
  WHERE jobid = v_jobid;

  RAISE NOTICE 'Job % pausado exitosamente', p_job_name;
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Reactivar un cron job específico
CREATE OR REPLACE FUNCTION resume_cron_job(p_job_name TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  v_jobid BIGINT;
BEGIN
  -- Buscar el job por nombre en el comando
  SELECT jobid INTO v_jobid
  FROM cron.job
  WHERE command LIKE '%' || p_job_name || '%'
  LIMIT 1;

  IF v_jobid IS NULL THEN
    RAISE NOTICE 'Job % no encontrado', p_job_name;
    RETURN FALSE;
  END IF;

  -- Reactivar el job
  UPDATE cron.job
  SET active = TRUE
  WHERE jobid = v_jobid;

  RAISE NOTICE 'Job % reactivado exitosamente', p_job_name;
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 6. COMENTARIOS
-- ============================================================================

COMMENT ON FUNCTION get_active_cron_jobs() IS
  'Lista todos los cron jobs activos del sistema';

COMMENT ON FUNCTION get_cron_job_history(INTEGER) IS
  'Muestra el historial de ejecuciones de cron jobs';

COMMENT ON FUNCTION get_cron_job_stats() IS
  'Calcula estadísticas de éxito/fallo y duración de cada cron job';

COMMENT ON FUNCTION pause_cron_job(TEXT) IS
  'Pausa temporalmente un cron job específico';

COMMENT ON FUNCTION resume_cron_job(TEXT) IS
  'Reactiva un cron job previamente pausado';

-- ============================================================================
-- 7. QUERIES ÚTILES PARA MONITOREO
-- ============================================================================

-- Ver estadísticas actuales
-- SELECT * FROM get_cron_job_stats();

-- Ver últimas 50 ejecuciones
-- SELECT * FROM get_cron_job_history(50);

-- Ver solo jobs activos
-- SELECT * FROM get_active_cron_jobs() WHERE active = true;

-- Pausar bot específico
-- SELECT pause_cron_job('bot-detect-subscriptions');

-- Reactivar bot específico
-- SELECT resume_cron_job('bot-detect-subscriptions');

-- ============================================================================
-- FIN DE MIGRACIÓN 043
-- ============================================================================
