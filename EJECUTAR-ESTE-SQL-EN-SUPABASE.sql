-- ============================================================================
-- 🚀 INSTALACIÓN COMPLETA DEL SISTEMA HÍBRIDO - FINANTEL v2.1
-- ============================================================================
-- INSTRUCCIONES:
-- 1. Abre https://supabase.com/dashboard/project/yzakmqxbzwzbsdsadzej/sql/new
-- 2. Copia y pega TODO este archivo
-- 3. Haz clic en "RUN" o presiona Ctrl+Enter
-- 4. Espera a que termine (puede tardar 1-2 minutos)
-- ============================================================================

BEGIN;

-- ============================================================================
-- PASO 1: CREAR TABLAS DEL SISTEMA HÍBRIDO
-- ============================================================================

-- 1.1 Tabla de Alertas de Bots
CREATE TABLE IF NOT EXISTS bot_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  bot_name TEXT NOT NULL CHECK (bot_name IN (
    'bot-detect-subscriptions',
    'bot-detect-duplicates',
    'bot-detect-delivery',
    'bot-detect-microspend',
    'bot-detect-nightspend',
    'bot-detect-fixed-charges',
    'bot-detect-unusual-activity'
  )),
  anomaly_type TEXT NOT NULL CHECK (anomaly_type IN (
    'suscripcion_oculta',
    'suscripcion_duplicada',
    'delivery_excesivo',
    'compras_nocturnas',
    'microcompras_acumuladas',
    'cargo_fijo_sospechoso',
    'actividad_inusual',
    'servicio_no_usado'
  )),
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  confidence_score NUMERIC(5,2) DEFAULT 70.0 CHECK (confidence_score >= 0 AND confidence_score <= 100),
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'confirmed', 'false_alarm', 'error')),
  leak_insight_id UUID REFERENCES leak_insights(id) ON DELETE SET NULL,
  ai_analysis JSONB DEFAULT NULL,
  detected_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1.2 Tabla de Cache de IA
CREATE TABLE IF NOT EXISTS ai_model_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prompt_hash TEXT NOT NULL UNIQUE,
  model_name TEXT NOT NULL CHECK (model_name IN (
    'deepseek-reasoner',
    'deepseek-chat',
    'qwen-plus',
    'qwen-turbo',
    'gpt-4o-mini'
  )),
  analysis_type TEXT NOT NULL CHECK (analysis_type IN (
    'leak_investigation',
    'mood_explanation',
    'anomaly_classification',
    'insight_generation'
  )),
  response_text TEXT NOT NULL,
  response_metadata JSONB DEFAULT '{}'::jsonb,
  hit_count INTEGER DEFAULT 0,
  last_hit_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1.3 Tabla de Cache de API
CREATE TABLE IF NOT EXISTS api_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cache_key TEXT NOT NULL UNIQUE,
  data_type TEXT NOT NULL,
  cached_data JSONB NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  expires_at TIMESTAMPTZ NOT NULL,
  hit_count INTEGER DEFAULT 0,
  last_hit_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1.4 Tabla de Estadísticas de Bots
CREATE TABLE IF NOT EXISTS bot_statistics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bot_name TEXT NOT NULL,
  batch_timestamp TIMESTAMPTZ NOT NULL,
  users_processed INTEGER DEFAULT 0,
  alerts_generated INTEGER DEFAULT 0,
  execution_time_ms INTEGER DEFAULT 0,
  errors_count INTEGER DEFAULT 0,
  error_details JSONB DEFAULT '[]'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- PASO 2: CREAR ÍNDICES OPTIMIZADOS
-- ============================================================================

-- Índices para bot_alerts
CREATE INDEX IF NOT EXISTS idx_bot_alerts_user_status ON bot_alerts(user_id, status);
CREATE INDEX IF NOT EXISTS idx_bot_alerts_bot_name ON bot_alerts(bot_name);
CREATE INDEX IF NOT EXISTS idx_bot_alerts_anomaly_type ON bot_alerts(anomaly_type);
CREATE INDEX IF NOT EXISTS idx_bot_alerts_detected_at ON bot_alerts(detected_at DESC);
CREATE INDEX IF NOT EXISTS idx_bot_alerts_pending ON bot_alerts(status) WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS idx_bot_alerts_user_pending ON bot_alerts(user_id, detected_at DESC) WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS idx_bot_alerts_confirmed ON bot_alerts(user_id, anomaly_type) WHERE status = 'confirmed';

-- Índices para ai_model_cache
CREATE INDEX IF NOT EXISTS idx_ai_model_cache_prompt_hash ON ai_model_cache(prompt_hash);
CREATE INDEX IF NOT EXISTS idx_ai_model_cache_expires_at ON ai_model_cache(expires_at);
CREATE INDEX IF NOT EXISTS idx_ai_model_cache_analysis_type ON ai_model_cache(analysis_type);
CREATE INDEX IF NOT EXISTS idx_ai_model_cache_active ON ai_model_cache(prompt_hash, expires_at);
CREATE INDEX IF NOT EXISTS idx_ai_model_cache_hot ON ai_model_cache(analysis_type, hit_count DESC) WHERE hit_count > 5;

-- Índices para api_cache
CREATE INDEX IF NOT EXISTS idx_api_cache_key ON api_cache(cache_key);
CREATE INDEX IF NOT EXISTS idx_api_cache_expires_at ON api_cache(expires_at);
CREATE INDEX IF NOT EXISTS idx_api_cache_data_type ON api_cache(data_type);
CREATE INDEX IF NOT EXISTS idx_api_cache_active ON api_cache(cache_key, expires_at);

-- Índices para bot_statistics
CREATE INDEX IF NOT EXISTS idx_bot_statistics_bot_name ON bot_statistics(bot_name);
CREATE INDEX IF NOT EXISTS idx_bot_statistics_timestamp ON bot_statistics(batch_timestamp DESC);

-- ============================================================================
-- PASO 3: CREAR FUNCIONES AUXILIARES
-- ============================================================================

-- Función para obtener cache de IA
CREATE OR REPLACE FUNCTION get_ai_cache(p_prompt_hash TEXT)
RETURNS TABLE (response_text TEXT, model_name TEXT, response_metadata JSONB) AS $$
BEGIN
  RETURN QUERY
  SELECT ac.response_text, ac.model_name, ac.response_metadata
  FROM ai_model_cache ac
  WHERE ac.prompt_hash = p_prompt_hash AND ac.expires_at > NOW();

  IF FOUND THEN
    UPDATE ai_model_cache
    SET hit_count = hit_count + 1, last_hit_at = NOW()
    WHERE prompt_hash = p_prompt_hash;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Función para guardar en cache de IA
CREATE OR REPLACE FUNCTION set_ai_cache(
  p_prompt_hash TEXT,
  p_model_name TEXT,
  p_analysis_type TEXT,
  p_response_text TEXT,
  p_response_metadata JSONB DEFAULT '{}'::jsonb,
  p_ttl_days INTEGER DEFAULT 7
)
RETURNS UUID AS $$
DECLARE
  v_cache_id UUID;
BEGIN
  INSERT INTO ai_model_cache (
    prompt_hash, model_name, analysis_type, response_text,
    response_metadata, expires_at
  ) VALUES (
    p_prompt_hash, p_model_name, p_analysis_type, p_response_text,
    p_response_metadata, NOW() + (p_ttl_days || ' days')::INTERVAL
  )
  ON CONFLICT (prompt_hash) DO UPDATE SET
    response_text = EXCLUDED.response_text,
    response_metadata = EXCLUDED.response_metadata,
    expires_at = EXCLUDED.expires_at,
    hit_count = 0, last_hit_at = NULL
  RETURNING id INTO v_cache_id;
  RETURN v_cache_id;
END;
$$ LANGUAGE plpgsql;

-- Función para limpiar cache expirado
CREATE OR REPLACE FUNCTION cleanup_expired_cache()
RETURNS TABLE (ai_cache_deleted INTEGER, api_cache_deleted INTEGER) AS $$
DECLARE
  v_ai_deleted INTEGER;
  v_api_deleted INTEGER;
BEGIN
  DELETE FROM ai_model_cache WHERE expires_at < NOW();
  GET DIAGNOSTICS v_ai_deleted = ROW_COUNT;

  DELETE FROM api_cache WHERE expires_at < NOW();
  GET DIAGNOSTICS v_api_deleted = ROW_COUNT;

  RETURN QUERY SELECT v_ai_deleted, v_api_deleted;
END;
$$ LANGUAGE plpgsql;

-- Función para obtener estadísticas de cache
CREATE OR REPLACE FUNCTION get_cache_statistics()
RETURNS TABLE (
  cache_type TEXT, total_entries INTEGER, active_entries INTEGER,
  expired_entries INTEGER, total_hits INTEGER, avg_hit_count NUMERIC,
  cache_size_mb NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 'ai_model_cache'::TEXT, COUNT(*)::INTEGER,
    COUNT(*) FILTER (WHERE expires_at > NOW())::INTEGER,
    COUNT(*) FILTER (WHERE expires_at <= NOW())::INTEGER,
    SUM(hit_count)::INTEGER, AVG(hit_count)::NUMERIC,
    (pg_total_relation_size('ai_model_cache') / 1024.0 / 1024.0)::NUMERIC
  FROM ai_model_cache
  UNION ALL
  SELECT 'api_cache'::TEXT, COUNT(*)::INTEGER,
    COUNT(*) FILTER (WHERE expires_at > NOW())::INTEGER,
    COUNT(*) FILTER (WHERE expires_at <= NOW())::INTEGER,
    SUM(hit_count)::INTEGER, AVG(hit_count)::NUMERIC,
    (pg_total_relation_size('api_cache') / 1024.0 / 1024.0)::NUMERIC
  FROM api_cache;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- PASO 4: CONFIGURAR ROW LEVEL SECURITY (RLS)
-- ============================================================================

ALTER TABLE bot_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_model_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE bot_statistics ENABLE ROW LEVEL SECURITY;

-- Políticas para bot_alerts
DROP POLICY IF EXISTS "Users can view own bot alerts" ON bot_alerts;
CREATE POLICY "Users can view own bot alerts"
  ON bot_alerts FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own bot alerts" ON bot_alerts;
CREATE POLICY "Users can update own bot alerts"
  ON bot_alerts FOR UPDATE
  USING (auth.uid() = user_id);

-- Políticas para cache (lectura pública para autenticados)
DROP POLICY IF EXISTS "Authenticated users can view cache" ON ai_model_cache;
CREATE POLICY "Authenticated users can view cache"
  ON ai_model_cache FOR SELECT TO authenticated USING (TRUE);

DROP POLICY IF EXISTS "Authenticated users can view api cache" ON api_cache;
CREATE POLICY "Authenticated users can view api cache"
  ON api_cache FOR SELECT TO authenticated USING (TRUE);

DROP POLICY IF EXISTS "Authenticated users can view bot stats" ON bot_statistics;
CREATE POLICY "Authenticated users can view bot stats"
  ON bot_statistics FOR SELECT TO authenticated USING (TRUE);

-- ============================================================================
-- PASO 5: CREAR TRIGGERS
-- ============================================================================

-- Trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_bot_alerts_updated_at ON bot_alerts;
CREATE TRIGGER update_bot_alerts_updated_at
  BEFORE UPDATE ON bot_alerts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_api_cache_updated_at ON api_cache;
CREATE TRIGGER update_api_cache_updated_at
  BEFORE UPDATE ON api_cache
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- PASO 6: HABILITAR EXTENSIONES NECESARIAS
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS http;

-- ============================================================================
-- PASO 7: CONFIGURAR SETTINGS DE SUPABASE (NECESARIO PARA CRON JOBS)
-- ============================================================================

-- Configurar URL de Supabase
DO $$
BEGIN
  PERFORM set_config('app.settings.supabase_url', 'https://yzakmqxbzwzbsdsadzej.supabase.co', false);
  PERFORM set_config('app.settings.service_role_key', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl6YWttcXhiend6YnNkc2FkemVqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzkxMTMxNiwiZXhwIjoyMDc5NDg3MzE2fQ.2dxcZOhCgjewwQAC9GSfggjC9rGN1gaMhd8j9ZaY1tw', false);
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Settings configurados en sesión. Para hacerlos permanentes, ejecuta manualmente ALTER DATABASE postgres SET...';
END;
$$;

-- Configuración permanente de settings (requiere permisos de superuser)
-- Descomenta estas líneas si tienes acceso de superuser:
-- ALTER DATABASE postgres SET app.settings.supabase_url = 'https://yzakmqxbzwzbsdsadzej.supabase.co';
-- ALTER DATABASE postgres SET app.settings.service_role_key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl6YWttcXhiend6YnNkc2FkemVqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzkxMTMxNiwiZXhwIjoyMDc5NDg3MzE2fQ.2dxcZOhCgjewwQAC9GSfggjC9rGN1gaMhd8j9ZaY1tw';

-- ============================================================================
-- PASO 8: FUNCIONES AUXILIARES PARA GESTIÓN DE CRON JOBS
-- ============================================================================

-- Ver cron jobs activos
CREATE OR REPLACE FUNCTION get_active_cron_jobs()
RETURNS TABLE (
  jobid bigint, schedule text, command text, nodename text,
  nodeport integer, database text, username text, active boolean
) AS $$
BEGIN
  RETURN QUERY
  SELECT cron.jobid, cron.schedule, cron.command, cron.nodename,
         cron.nodeport, cron.database, cron.username, cron.active
  FROM cron.job cron
  ORDER BY cron.jobid;
END;
$$ LANGUAGE plpgsql;

-- Ver historial de ejecuciones
CREATE OR REPLACE FUNCTION get_cron_job_history(p_limit INTEGER DEFAULT 100)
RETURNS TABLE (
  jobid bigint, runid bigint, job_pid integer, database text,
  username text, command text, status text, return_message text,
  start_time timestamptz, end_time timestamptz
) AS $$
BEGIN
  RETURN QUERY
  SELECT h.jobid, h.runid, h.job_pid, h.database, h.username,
         h.command, h.status, h.return_message, h.start_time, h.end_time
  FROM cron.job_run_details h
  ORDER BY h.start_time DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- Ver estadísticas de cron jobs
CREATE OR REPLACE FUNCTION get_cron_job_stats()
RETURNS TABLE (
  job_name text, total_runs bigint, successful_runs bigint,
  failed_runs bigint, success_rate numeric, avg_duration_ms numeric,
  last_run timestamptz, last_status text
) AS $$
BEGIN
  RETURN QUERY
  WITH job_stats AS (
    SELECT j.command, COUNT(*) as total,
      COUNT(*) FILTER (WHERE h.status = 'succeeded') as succeeded,
      COUNT(*) FILTER (WHERE h.status = 'failed') as failed,
      AVG(EXTRACT(EPOCH FROM (h.end_time - h.start_time)) * 1000) as avg_ms,
      MAX(h.start_time) as last_run,
      (SELECT h2.status FROM cron.job_run_details h2
       WHERE h2.jobid = j.jobid ORDER BY h2.start_time DESC LIMIT 1) as last_status
    FROM cron.job j
    LEFT JOIN cron.job_run_details h ON j.jobid = h.jobid
    GROUP BY j.jobid, j.command
  )
  SELECT
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
    js.total, js.succeeded, js.failed,
    CASE WHEN js.total > 0 THEN (js.succeeded::numeric / js.total * 100) ELSE 0 END,
    js.avg_ms, js.last_run, js.last_status::text
  FROM job_stats js
  ORDER BY js.last_run DESC NULLS LAST;
END;
$$ LANGUAGE plpgsql;

-- Pausar un cron job
CREATE OR REPLACE FUNCTION pause_cron_job(p_job_name TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  v_jobid BIGINT;
BEGIN
  SELECT jobid INTO v_jobid FROM cron.job
  WHERE command LIKE '%' || p_job_name || '%' LIMIT 1;

  IF v_jobid IS NULL THEN
    RAISE NOTICE 'Job % no encontrado', p_job_name;
    RETURN FALSE;
  END IF;

  UPDATE cron.job SET active = FALSE WHERE jobid = v_jobid;
  RAISE NOTICE 'Job % pausado exitosamente', p_job_name;
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Reactivar un cron job
CREATE OR REPLACE FUNCTION resume_cron_job(p_job_name TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  v_jobid BIGINT;
BEGIN
  SELECT jobid INTO v_jobid FROM cron.job
  WHERE command LIKE '%' || p_job_name || '%' LIMIT 1;

  IF v_jobid IS NULL THEN
    RAISE NOTICE 'Job % no encontrado', p_job_name;
    RETURN FALSE;
  END IF;

  UPDATE cron.job SET active = TRUE WHERE jobid = v_jobid;
  RAISE NOTICE 'Job % reactivado exitosamente', p_job_name;
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- PASO 9: COMENTARIOS
-- ============================================================================

COMMENT ON TABLE bot_alerts IS 'Alertas generadas por bots vigilantes antes del análisis de IA';
COMMENT ON TABLE ai_model_cache IS 'Cache de respuestas de modelos de IA para reducir costos';
COMMENT ON TABLE api_cache IS 'Cache genérico para llamadas a APIs externas';
COMMENT ON TABLE bot_statistics IS 'Estadísticas de ejecución de bots para monitoreo';

COMMIT;

-- ============================================================================
-- ✅ INSTALACIÓN COMPLETADA
-- ============================================================================
--
-- ✅ Tablas creadas: bot_alerts, ai_model_cache, api_cache, bot_statistics
-- ✅ Índices optimizados creados
-- ✅ Funciones auxiliares creadas
-- ✅ RLS configurado
-- ✅ Triggers creados
-- ✅ Extensiones habilitadas (pg_cron, http)
-- ✅ Funciones de gestión de cron jobs creadas
--
-- ⚠️  IMPORTANTE: Los CRON JOBS NO se crearon automáticamente
--     porque requieren que las Edge Functions estén desplegadas primero.
--
-- 📋 PRÓXIMOS PASOS:
-- 1. Desplegar las Edge Functions (7 bots + AI investigator)
-- 2. Ejecutar el script de cron jobs (próximo paso)
-- 3. Configurar las API keys en Supabase Dashboard
--
-- ============================================================================
