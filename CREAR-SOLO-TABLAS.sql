-- ============================================================================
-- CREAR SOLO LAS 4 TABLAS DEL SISTEMA HÍBRIDO
-- ============================================================================
-- Script simplificado que solo crea las tablas
-- ============================================================================

-- Tabla 1: bot_alerts
CREATE TABLE IF NOT EXISTS bot_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  bot_name TEXT NOT NULL,
  anomaly_type TEXT NOT NULL,
  severity TEXT NOT NULL,
  confidence_score NUMERIC(5,2) DEFAULT 70.0,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT DEFAULT 'pending',
  leak_insight_id UUID,
  ai_analysis JSONB DEFAULT NULL,
  detected_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla 2: ai_model_cache
CREATE TABLE IF NOT EXISTS ai_model_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prompt_hash TEXT NOT NULL UNIQUE,
  model_name TEXT NOT NULL,
  analysis_type TEXT NOT NULL,
  response_text TEXT NOT NULL,
  response_metadata JSONB DEFAULT '{}'::jsonb,
  hit_count INTEGER DEFAULT 0,
  last_hit_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla 3: api_cache
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

-- Tabla 4: bot_statistics
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

-- Verificar que se crearon
SELECT
  table_name,
  'Creada ✅' as estado
FROM information_schema.tables
WHERE table_name IN ('bot_alerts', 'ai_model_cache', 'api_cache', 'bot_statistics')
  AND table_schema = 'public'
ORDER BY table_name;
