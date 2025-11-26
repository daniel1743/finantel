-- ============================================================================
-- HYBRID SYSTEM TABLES - BOT VIGILANTES + AI INVESTIGATOR
-- ============================================================================
-- Sistema híbrido donde:
-- BOT = Guardián (reglas simples, rápido, sin IA)
-- IA = Detective (analiza, clasifica, explica)
-- ============================================================================

-- ============================================================================
-- 1. Tabla de Alertas de Bots
-- ============================================================================
CREATE TABLE IF NOT EXISTS bot_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Información del bot
  bot_name TEXT NOT NULL CHECK (bot_name IN (
    'bot-detect-subscriptions',
    'bot-detect-duplicates',
    'bot-detect-delivery',
    'bot-detect-microspend',
    'bot-detect-nightspend',
    'bot-detect-fixed-charges',
    'bot-detect-unusual-activity'
  )),

  -- Tipo de anomalía detectada
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

  -- Severidad preliminar (calculada por el bot)
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),

  -- Confianza inicial (antes de la IA)
  confidence_score NUMERIC(5,2) DEFAULT 70.0 CHECK (confidence_score >= 0 AND confidence_score <= 100),

  -- Payload con datos de la anomalía
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  -- Ejemplo:
  -- {
  --   "description": "Patrón mensual detectado: NETFLIX",
  --   "amount": 15990,
  --   "frequency": "monthly",
  --   "transaction_ids": ["uuid1", "uuid2"],
  --   "pattern_details": {...}
  -- }

  -- Estado de procesamiento
  status TEXT DEFAULT 'pending' CHECK (status IN (
    'pending',      -- Esperando análisis de IA
    'processing',   -- IA analizando
    'confirmed',    -- IA confirmó que es una fuga real
    'false_alarm',  -- IA determinó que no es fuga
    'error'         -- Error en procesamiento
  )),

  -- Referencia al leak_insight creado (si se confirmó)
  leak_insight_id UUID REFERENCES leak_insights(id) ON DELETE SET NULL,

  -- Análisis de la IA (se llena después)
  ai_analysis JSONB DEFAULT NULL,
  -- {
  --   "model_used": "deepseek-reasoner",
  --   "confirmed": true,
  --   "reasoning": "...",
  --   "adjusted_severity": "high",
  --   "adjusted_confidence": 95
  -- }

  -- Timestamps
  detected_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para bot_alerts
CREATE INDEX idx_bot_alerts_user_status ON bot_alerts(user_id, status);
CREATE INDEX idx_bot_alerts_bot_name ON bot_alerts(bot_name);
CREATE INDEX idx_bot_alerts_anomaly_type ON bot_alerts(anomaly_type);
CREATE INDEX idx_bot_alerts_detected_at ON bot_alerts(detected_at DESC);
CREATE INDEX idx_bot_alerts_pending ON bot_alerts(status) WHERE status = 'pending';

-- ============================================================================
-- 2. Tabla de Cache de Modelos de IA
-- ============================================================================
CREATE TABLE IF NOT EXISTS ai_model_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Hash SHA256 del prompt completo
  prompt_hash TEXT NOT NULL UNIQUE,

  -- Modelo que generó la respuesta
  model_name TEXT NOT NULL CHECK (model_name IN (
    'deepseek-reasoner',
    'deepseek-chat',
    'qwen-plus',
    'qwen-turbo',
    'gpt-4o-mini'
  )),

  -- Tipo de análisis
  analysis_type TEXT NOT NULL CHECK (analysis_type IN (
    'leak_investigation',
    'mood_explanation',
    'anomaly_classification',
    'insight_generation'
  )),

  -- Respuesta cacheada
  response_text TEXT NOT NULL,

  -- Metadata de la respuesta
  response_metadata JSONB DEFAULT '{}'::jsonb,
  -- {
  --   "tokens_used": 150,
  --   "model_version": "...",
  --   "cost_usd": 0.00015
  -- }

  -- Estadísticas de uso
  hit_count INTEGER DEFAULT 0,
  last_hit_at TIMESTAMPTZ,

  -- TTL (Time To Live)
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para ai_model_cache
CREATE INDEX idx_ai_model_cache_prompt_hash ON ai_model_cache(prompt_hash);
CREATE INDEX idx_ai_model_cache_expires_at ON ai_model_cache(expires_at);
CREATE INDEX idx_ai_model_cache_analysis_type ON ai_model_cache(analysis_type);

-- Índice compuesto para búsqueda de cache
CREATE INDEX idx_ai_model_cache_active
  ON ai_model_cache(prompt_hash, expires_at);

-- ============================================================================
-- 3. Tabla de Cache de API Genérico
-- ============================================================================
CREATE TABLE IF NOT EXISTS api_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Clave única de la llamada (ej: "user_123_transactions_last_30d")
  cache_key TEXT NOT NULL UNIQUE,

  -- Tipo de dato cacheado
  data_type TEXT NOT NULL,

  -- Datos cacheados (JSONB)
  cached_data JSONB NOT NULL,

  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,

  -- TTL
  expires_at TIMESTAMPTZ NOT NULL,

  -- Estadísticas
  hit_count INTEGER DEFAULT 0,
  last_hit_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para api_cache
CREATE INDEX idx_api_cache_key ON api_cache(cache_key);
CREATE INDEX idx_api_cache_expires_at ON api_cache(expires_at);
CREATE INDEX idx_api_cache_data_type ON api_cache(data_type);

-- Índice para búsqueda de cache activo
-- NOTA: No podemos usar WHERE expires_at > NOW() porque NOW() no es inmutable
-- El índice se crea sin condición, y la consulta filtrará por expires_at > NOW() en tiempo de ejecución
CREATE INDEX idx_api_cache_active
  ON api_cache(cache_key, expires_at);

-- ============================================================================
-- 4. Tabla de Estadísticas de Bots (Monitoreo)
-- ============================================================================
CREATE TABLE IF NOT EXISTS bot_statistics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bot_name TEXT NOT NULL,

  -- Timestamp del batch procesado
  batch_timestamp TIMESTAMPTZ NOT NULL,

  -- Métricas de ejecución
  users_processed INTEGER DEFAULT 0,
  alerts_generated INTEGER DEFAULT 0,
  execution_time_ms INTEGER DEFAULT 0,

  -- Errores
  errors_count INTEGER DEFAULT 0,
  error_details JSONB DEFAULT '[]'::jsonb,

  -- Detalles adicionales
  metadata JSONB DEFAULT '{}'::jsonb,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para bot_statistics
CREATE INDEX idx_bot_statistics_bot_name ON bot_statistics(bot_name);
CREATE INDEX idx_bot_statistics_timestamp ON bot_statistics(batch_timestamp DESC);

-- ============================================================================
-- 5. Funciones Auxiliares
-- ============================================================================

-- Función para obtener cache de IA (con actualización de hit_count)
CREATE OR REPLACE FUNCTION get_ai_cache(p_prompt_hash TEXT)
RETURNS TABLE (
  response_text TEXT,
  model_name TEXT,
  response_metadata JSONB
) AS $$
BEGIN
  -- Buscar en cache activo
  RETURN QUERY
  SELECT
    ac.response_text,
    ac.model_name,
    ac.response_metadata
  FROM ai_model_cache ac
  WHERE ac.prompt_hash = p_prompt_hash
    AND ac.expires_at > NOW();

  -- Actualizar hit_count si se encontró
  IF FOUND THEN
    UPDATE ai_model_cache
    SET
      hit_count = hit_count + 1,
      last_hit_at = NOW()
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
    prompt_hash,
    model_name,
    analysis_type,
    response_text,
    response_metadata,
    expires_at
  ) VALUES (
    p_prompt_hash,
    p_model_name,
    p_analysis_type,
    p_response_text,
    p_response_metadata,
    NOW() + (p_ttl_days || ' days')::INTERVAL
  )
  ON CONFLICT (prompt_hash)
  DO UPDATE SET
    response_text = EXCLUDED.response_text,
    response_metadata = EXCLUDED.response_metadata,
    expires_at = EXCLUDED.expires_at,
    hit_count = 0,
    last_hit_at = NULL
  RETURNING id INTO v_cache_id;

  RETURN v_cache_id;
END;
$$ LANGUAGE plpgsql;

-- Función para limpiar cache expirado (ejecutar periódicamente)
CREATE OR REPLACE FUNCTION cleanup_expired_cache()
RETURNS TABLE (
  ai_cache_deleted INTEGER,
  api_cache_deleted INTEGER
) AS $$
DECLARE
  v_ai_deleted INTEGER;
  v_api_deleted INTEGER;
BEGIN
  -- Limpiar ai_model_cache
  DELETE FROM ai_model_cache
  WHERE expires_at < NOW();
  GET DIAGNOSTICS v_ai_deleted = ROW_COUNT;

  -- Limpiar api_cache
  DELETE FROM api_cache
  WHERE expires_at < NOW();
  GET DIAGNOSTICS v_api_deleted = ROW_COUNT;

  RETURN QUERY SELECT v_ai_deleted, v_api_deleted;
END;
$$ LANGUAGE plpgsql;

-- Función para obtener estadísticas de cache
CREATE OR REPLACE FUNCTION get_cache_statistics()
RETURNS TABLE (
  cache_type TEXT,
  total_entries INTEGER,
  active_entries INTEGER,
  expired_entries INTEGER,
  total_hits INTEGER,
  avg_hit_count NUMERIC,
  cache_size_mb NUMERIC
) AS $$
BEGIN
  RETURN QUERY

  -- Estadísticas de ai_model_cache
  SELECT
    'ai_model_cache'::TEXT,
    COUNT(*)::INTEGER,
    COUNT(*) FILTER (WHERE expires_at > NOW())::INTEGER,
    COUNT(*) FILTER (WHERE expires_at <= NOW())::INTEGER,
    SUM(hit_count)::INTEGER,
    AVG(hit_count)::NUMERIC,
    (pg_total_relation_size('ai_model_cache') / 1024.0 / 1024.0)::NUMERIC
  FROM ai_model_cache

  UNION ALL

  -- Estadísticas de api_cache
  SELECT
    'api_cache'::TEXT,
    COUNT(*)::INTEGER,
    COUNT(*) FILTER (WHERE expires_at > NOW())::INTEGER,
    COUNT(*) FILTER (WHERE expires_at <= NOW())::INTEGER,
    SUM(hit_count)::INTEGER,
    AVG(hit_count)::NUMERIC,
    (pg_total_relation_size('api_cache') / 1024.0 / 1024.0)::NUMERIC
  FROM api_cache;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 6. Row Level Security (RLS)
-- ============================================================================

ALTER TABLE bot_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_model_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE bot_statistics ENABLE ROW LEVEL SECURITY;

-- Políticas para bot_alerts
CREATE POLICY "Users can view own bot alerts"
  ON bot_alerts
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own bot alerts"
  ON bot_alerts
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Políticas para ai_model_cache (solo lectura para usuarios autenticados)
CREATE POLICY "Authenticated users can view cache"
  ON ai_model_cache
  FOR SELECT
  TO authenticated
  USING (TRUE);

-- Políticas para api_cache (solo lectura para usuarios autenticados)
CREATE POLICY "Authenticated users can view api cache"
  ON api_cache
  FOR SELECT
  TO authenticated
  USING (TRUE);

-- Políticas para bot_statistics (solo lectura para usuarios autenticados)
CREATE POLICY "Authenticated users can view bot stats"
  ON bot_statistics
  FOR SELECT
  TO authenticated
  USING (TRUE);

-- ============================================================================
-- 7. Triggers
-- ============================================================================

-- Trigger para actualizar updated_at en bot_alerts
CREATE TRIGGER update_bot_alerts_updated_at
  BEFORE UPDATE ON bot_alerts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger para actualizar updated_at en api_cache
CREATE TRIGGER update_api_cache_updated_at
  BEFORE UPDATE ON api_cache
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 8. Comentarios
-- ============================================================================

COMMENT ON TABLE bot_alerts IS
  'Alertas generadas por bots vigilantes antes del análisis de IA';

COMMENT ON TABLE ai_model_cache IS
  'Cache de respuestas de modelos de IA para reducir costos';

COMMENT ON TABLE api_cache IS
  'Cache genérico para llamadas a APIs externas';

COMMENT ON TABLE bot_statistics IS
  'Estadísticas de ejecución de bots para monitoreo';

COMMENT ON COLUMN bot_alerts.bot_name IS
  'Nombre del bot que detectó la anomalía';

COMMENT ON COLUMN bot_alerts.payload IS
  'Datos de la anomalía detectada por el bot';

COMMENT ON COLUMN bot_alerts.ai_analysis IS
  'Análisis de la IA después de investigar la alerta';

COMMENT ON COLUMN ai_model_cache.prompt_hash IS
  'SHA256 del prompt completo para deduplicación';

COMMENT ON COLUMN ai_model_cache.hit_count IS
  'Número de veces que se reutilizó esta respuesta del cache';

-- ============================================================================
-- 9. Índices adicionales para optimización
-- ============================================================================

-- Índice compuesto para búsquedas frecuentes de alertas pendientes por usuario
CREATE INDEX idx_bot_alerts_user_pending
  ON bot_alerts(user_id, detected_at DESC)
  WHERE status = 'pending';

-- Índice para búsquedas de alertas confirmadas
CREATE INDEX idx_bot_alerts_confirmed
  ON bot_alerts(user_id, anomaly_type)
  WHERE status = 'confirmed';

-- Índice parcial para cache con alto hit_count (hot cache)
-- NOTA: No podemos usar WHERE expires_at > NOW() porque NOW() no es inmutable
-- El índice se crea solo con la condición estática hit_count > 5
CREATE INDEX idx_ai_model_cache_hot
  ON ai_model_cache(analysis_type, hit_count DESC)
  WHERE hit_count > 5;

-- ============================================================================
-- 10. Configuración inicial
-- ============================================================================

-- Crear job para limpieza automática de cache (ejecutar diariamente)
-- Nota: Requiere pg_cron extension
-- SELECT cron.schedule(
--   'cleanup-expired-cache',
--   '0 3 * * *',  -- Todos los días a las 3 AM
--   $$SELECT cleanup_expired_cache();$$
-- );

-- ============================================================================
-- FIN DE MIGRACIÓN 042
-- ============================================================================
