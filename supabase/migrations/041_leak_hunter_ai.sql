-- ============================================================================
-- LEAK HUNTER AI - SCHEMA
-- ============================================================================
-- Detecta gastos "fuga" o invisibles que se repiten y el usuario no nota
-- (suscripciones duplicadas, delivery excesivo, microcompras, etc)
-- ============================================================================

-- 1. Tabla principal de insights de fugas
-- ============================================================================
CREATE TABLE IF NOT EXISTS leak_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Tipo de fuga detectada
  type TEXT NOT NULL CHECK (type IN (
    'suscripcion_oculta',       -- Suscripciones que el usuario olvidó
    'suscripcion_duplicada',    -- Múltiples servicios similares (Spotify + Apple Music)
    'delivery_excesivo',        -- Delivery muy frecuente
    'compras_nocturnas',        -- Compras impulsivas de noche
    'microcompras_acumuladas',  -- Muchas compras pequeñas que suman
    'servicio_no_usado',        -- Servicio que no se usa hace meses
    'cargo_recurrente_sospechoso', -- Cargos mensuales no reconocidos
    'subscripcion_premium_innecesaria' -- Premium que puede ser Free
  )),

  -- Descripción generada por IA
  description TEXT NOT NULL,

  -- Fuga estimada mensual
  monthly_estimated_leak NUMERIC(10,2) NOT NULL DEFAULT 0,

  -- Última vez que se detectó
  last_detected_at TIMESTAMPTZ DEFAULT NOW(),

  -- Estado de la fuga
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'resolved', 'ignored')),

  -- Fecha de resolución
  resolved_at TIMESTAMPTZ,

  -- Detalles adicionales (JSONB)
  details JSONB NOT NULL DEFAULT '{}'::jsonb,
  -- Ejemplo para suscripción:
  -- {
  --   "service_name": "Netflix",
  --   "amount": 15990,
  --   "frequency": "monthly",
  --   "last_charges": [
  --     {"date": "2025-01-15", "amount": 15990},
  --     {"date": "2024-12-15", "amount": 15990}
  --   ],
  --   "pattern_detected": "Mismo monto el día 15 de cada mes",
  --   "transactions_ids": ["uuid1", "uuid2"]
  -- }

  -- Acciones sugeridas (array)
  suggested_actions JSONB DEFAULT '[]'::jsonb,
  -- Ejemplo:
  -- [
  --   {"action": "cancel", "description": "Cancelar suscripción no usada", "estimated_saving": 15990},
  --   {"action": "downgrade", "description": "Cambiar a plan básico", "estimated_saving": 8000}
  -- ]

  -- Severidad de la fuga
  severity TEXT DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),

  -- Confianza de la detección (0-100)
  confidence_score NUMERIC(5,2) DEFAULT 85.0,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para búsquedas rápidas
CREATE INDEX idx_leak_insights_user_status ON leak_insights(user_id, status);
CREATE INDEX idx_leak_insights_type ON leak_insights(type);
CREATE INDEX idx_leak_insights_severity ON leak_insights(severity);
CREATE INDEX idx_leak_insights_last_detected ON leak_insights(last_detected_at DESC);

-- Índice único usando expresión JSONB (para evitar duplicados por servicio)
CREATE UNIQUE INDEX idx_leak_insights_unique_service
  ON leak_insights(user_id, type, (details->>'service_name'))
  WHERE details->>'service_name' IS NOT NULL;

-- ============================================================================
-- 2. Tabla de patrones de suscripciones conocidas
-- ============================================================================
CREATE TABLE IF NOT EXISTS subscription_patterns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_name TEXT NOT NULL UNIQUE,

  -- Categoría del servicio
  category TEXT NOT NULL CHECK (category IN (
    'streaming',        -- Netflix, Spotify, etc.
    'cloud_storage',    -- Dropbox, Google Drive, iCloud
    'productivity',     -- Notion, Evernote, Office 365
    'fitness',          -- Gym, apps de ejercicio
    'gaming',           -- PlayStation Plus, Xbox Game Pass
    'delivery',         -- Uber Eats Plus, PedidosYa Premium
    'transport',        -- Uber Pass, Cabify Plus
    'news',             -- NYTimes, WSJ
    'education',        -- Coursera, Udemy
    'utilities',        -- VPN, antivirus
    'other'
  )),

  -- Aliases conocidos (cómo aparece en el banco)
  aliases TEXT[] DEFAULT '{}',
  -- Ejemplo: ["NETFLIX.COM", "Netflix Inc", "NETFLIX*", "NF*"]

  -- Rangos de precio típicos
  typical_amount_min NUMERIC(10,2),
  typical_amount_max NUMERIC(10,2),

  -- Frecuencia típica
  typical_frequency TEXT DEFAULT 'monthly',

  -- Si es común tenerlo duplicado con otros
  common_duplicates TEXT[] DEFAULT '{}',
  -- Ejemplo para Spotify: ["Apple Music", "YouTube Music", "Deezer"]

  -- Si tiene versión gratuita
  has_free_tier BOOLEAN DEFAULT FALSE,

  -- Metadata adicional
  metadata JSONB DEFAULT '{}'::jsonb,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 3. Insertar patrones conocidos de suscripciones
-- ============================================================================

-- Streaming de Video
INSERT INTO subscription_patterns (service_name, category, aliases, typical_amount_min, typical_amount_max, common_duplicates, has_free_tier)
VALUES
  ('Netflix', 'streaming', ARRAY['NETFLIX.COM', 'Netflix Inc', 'NETFLIX*', 'NF*'], 5000, 20000, ARRAY['Disney+', 'HBO Max', 'Amazon Prime Video'], false),
  ('Disney+', 'streaming', ARRAY['DISNEY+', 'DISNEYPLUS', 'Disney Plus'], 4000, 10000, ARRAY['Netflix', 'HBO Max'], false),
  ('HBO Max', 'streaming', ARRAY['HBO MAX', 'HBOMAX', 'HBO*'], 5000, 12000, ARRAY['Netflix', 'Disney+'], false),
  ('Amazon Prime Video', 'streaming', ARRAY['AMAZON PRIME', 'PRIME VIDEO', 'AMZ*PRIME'], 3000, 8000, ARRAY['Netflix'], false),
  ('YouTube Premium', 'streaming', ARRAY['YOUTUBE PREMIUM', 'YT PREMIUM', 'GOOGLE*YOUTUBE'], 5000, 15000, ARRAY['Spotify', 'Apple Music'], false)
ON CONFLICT (service_name) DO NOTHING;

-- Streaming de Música
INSERT INTO subscription_patterns (service_name, category, aliases, typical_amount_min, typical_amount_max, common_duplicates, has_free_tier)
VALUES
  ('Spotify', 'streaming', ARRAY['SPOTIFY', 'SPOTIFY*', 'SPT*'], 4000, 12000, ARRAY['Apple Music', 'YouTube Music', 'Deezer'], true),
  ('Apple Music', 'streaming', ARRAY['APPLE MUSIC', 'APPLE.COM/BILL', 'ITUNES*MUSIC'], 4000, 12000, ARRAY['Spotify', 'YouTube Music'], false),
  ('YouTube Music', 'streaming', ARRAY['YOUTUBE MUSIC', 'YT MUSIC', 'GOOGLE*YTMUSIC'], 4000, 10000, ARRAY['Spotify', 'Apple Music'], true),
  ('Deezer', 'streaming', ARRAY['DEEZER', 'DEEZER*'], 3000, 10000, ARRAY['Spotify', 'Apple Music'], true)
ON CONFLICT (service_name) DO NOTHING;

-- Cloud Storage
INSERT INTO subscription_patterns (service_name, category, aliases, typical_amount_min, typical_amount_max, common_duplicates, has_free_tier)
VALUES
  ('iCloud', 'cloud_storage', ARRAY['ICLOUD', 'APPLE.COM/BILL', 'ICLOUD STORAGE'], 1000, 10000, ARRAY['Google Drive', 'Dropbox'], true),
  ('Google Drive', 'cloud_storage', ARRAY['GOOGLE DRIVE', 'GOOGLE ONE', 'GOOGLE*STORAGE'], 2000, 15000, ARRAY['iCloud', 'Dropbox'], true),
  ('Dropbox', 'cloud_storage', ARRAY['DROPBOX', 'DROPBOX*'], 5000, 20000, ARRAY['Google Drive', 'iCloud'], true)
ON CONFLICT (service_name) DO NOTHING;

-- Productividad
INSERT INTO subscription_patterns (service_name, category, aliases, typical_amount_min, typical_amount_max, common_duplicates, has_free_tier)
VALUES
  ('Notion', 'productivity', ARRAY['NOTION', 'NOTION*'], 4000, 10000, ARRAY['Evernote', 'OneNote'], true),
  ('Evernote', 'productivity', ARRAY['EVERNOTE', 'EVERNOTE*'], 3000, 12000, ARRAY['Notion', 'OneNote'], true),
  ('Microsoft 365', 'productivity', ARRAY['MICROSOFT 365', 'OFFICE 365', 'MSFT*365'], 5000, 20000, ARRAY['Google Workspace'], false)
ON CONFLICT (service_name) DO NOTHING;

-- Delivery
INSERT INTO subscription_patterns (service_name, category, aliases, typical_amount_min, typical_amount_max, common_duplicates, has_free_tier)
VALUES
  ('Uber Eats Pass', 'delivery', ARRAY['UBER EATS PASS', 'UBEREATS*PASS'], 3000, 8000, ARRAY['PedidosYa Plus'], false),
  ('PedidosYa Plus', 'delivery', ARRAY['PEDIDOSYA PLUS', 'PEDIDOSYA*'], 3000, 8000, ARRAY['Uber Eats Pass'], false)
ON CONFLICT (service_name) DO NOTHING;

-- Fitness
INSERT INTO subscription_patterns (service_name, category, aliases, typical_amount_min, typical_amount_max, common_duplicates, has_free_tier)
VALUES
  ('Gimnasio', 'fitness', ARRAY['GYM', 'GIMNASIO', 'FITNESS*'], 15000, 50000, ARRAY[]::TEXT[], false)
ON CONFLICT (service_name) DO NOTHING;

-- ============================================================================
-- 4. Tabla de configuración de detección
-- ============================================================================
CREATE TABLE IF NOT EXISTS leak_detection_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Umbrales configurables
  delivery_threshold_per_month INTEGER DEFAULT 12, -- Más de 12 deliveries/mes = excesivo
  night_purchases_threshold INTEGER DEFAULT 8,     -- Más de 8 compras nocturnas/mes = patrón
  microcompra_threshold NUMERIC(10,2) DEFAULT 5000, -- Compras menores a este monto
  microcompra_count_threshold INTEGER DEFAULT 20,   -- Más de 20 microcompras/mes

  -- Configuración de notificaciones
  notify_on_detection BOOLEAN DEFAULT TRUE,
  notification_severity_min TEXT DEFAULT 'medium',

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 5. Función auxiliar: Detectar suscripciones duplicadas
-- ============================================================================
CREATE OR REPLACE FUNCTION detect_duplicate_subscriptions(p_user_id UUID)
RETURNS TABLE(
  service1 TEXT,
  service2 TEXT,
  category TEXT,
  monthly_cost NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  WITH user_subscriptions AS (
    SELECT DISTINCT
      sp.service_name,
      sp.category,
      sp.common_duplicates,
      AVG(t.amount) as avg_amount
    FROM transactions t
    JOIN subscription_patterns sp ON (
      t.description ILIKE ANY(sp.aliases)
    )
    WHERE t.user_id = p_user_id
      AND t.type = 'expense'
      AND t.date >= CURRENT_DATE - INTERVAL '3 months'
    GROUP BY sp.service_name, sp.category, sp.common_duplicates
  )
  SELECT
    us1.service_name as service1,
    us2.service_name as service2,
    us1.category,
    (us1.avg_amount + us2.avg_amount) as monthly_cost
  FROM user_subscriptions us1
  JOIN user_subscriptions us2 ON (
    us1.service_name < us2.service_name
    AND us1.category = us2.category
    AND us2.service_name = ANY(us1.common_duplicates)
  );
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 6. Row Level Security (RLS)
-- ============================================================================
ALTER TABLE leak_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE leak_detection_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_patterns ENABLE ROW LEVEL SECURITY;

-- Users can only see their own leak insights
CREATE POLICY "Users can view own leak insights"
  ON leak_insights
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own leak insights"
  ON leak_insights
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can view their config
CREATE POLICY "Users can view own config"
  ON leak_detection_config
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own config"
  ON leak_detection_config
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Everyone can read subscription patterns
CREATE POLICY "Anyone can view subscription patterns"
  ON subscription_patterns
  FOR SELECT
  TO authenticated
  USING (TRUE);

-- ============================================================================
-- 7. Trigger para actualizar updated_at
-- ============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_leak_insights_updated_at
  BEFORE UPDATE ON leak_insights
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_leak_config_updated_at
  BEFORE UPDATE ON leak_detection_config
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 8. Comentarios
-- ============================================================================
COMMENT ON TABLE leak_insights IS
  'Insights de gastos "fuga" detectados automáticamente';

COMMENT ON TABLE subscription_patterns IS
  'Patrones de suscripciones conocidas para detección automática';

COMMENT ON TABLE leak_detection_config IS
  'Configuración personalizada de umbrales de detección por usuario';

COMMENT ON COLUMN leak_insights.type IS
  'Tipo de fuga: suscripcion_oculta, delivery_excesivo, compras_nocturnas, etc.';

COMMENT ON COLUMN leak_insights.monthly_estimated_leak IS
  'Estimación del gasto mensual que se está "fugando"';

COMMENT ON COLUMN leak_insights.confidence_score IS
  'Confianza de la detección (0-100), basado en patrones encontrados';
