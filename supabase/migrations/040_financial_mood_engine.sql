-- ============================================================================
-- FINANCIAL MOOD ENGINE - SCHEMA
-- ============================================================================
-- Detecta el "estado emocional financiero" del usuario a partir de patrones
-- de gasto y genera insights + alertas
-- ============================================================================

-- 1. Tabla de snapshots de mood financiero
-- ============================================================================
CREATE TABLE IF NOT EXISTS financial_mood_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,

  -- Estado emocional financiero
  mood_label TEXT NOT NULL CHECK (mood_label IN (
    'calmado',          -- Gastos controlados, bajo estrés
    'estable',          -- Comportamiento normal
    'disciplinado',     -- Ahorrando activamente
    'modo_ahorro',      -- Super disciplinado
    'impulsivo',        -- Muchos gastos no planificados
    'estresado',        -- Superando presupuestos
    'descontrolado',    -- Múltiples señales de alarma
    'recuperacion'      -- Mejorando después de período difícil
  )),

  -- Score numérico 0-100 (100 = excelente salud financiera)
  score NUMERIC(5,2) NOT NULL CHECK (score >= 0 AND score <= 100),

  -- Razones que contribuyen al mood
  reasons JSONB NOT NULL DEFAULT '[]'::jsonb,
  -- Ejemplo:
  -- [
  --   {"factor": "impulse_spending", "impact": -15, "description": "40% más gastos impulsivos que promedio"},
  --   {"factor": "budget_adherence", "impact": +10, "description": "Cumpliendo 90% de presupuestos"},
  --   {"factor": "saving_rate", "impact": +5, "description": "Ahorrando 15% de ingresos"}
  -- ]

  -- Métricas adicionales
  metrics JSONB NOT NULL DEFAULT '{}'::jsonb,
  -- Ejemplo:
  -- {
  --   "total_transactions": 45,
  --   "impulse_percentage": 32.5,
  --   "budget_compliance": 85.0,
  --   "week_over_week_change": -12.3,
  --   "avg_transaction_value": 25000,
  --   "late_night_transactions": 8,
  --   "weekend_spending_ratio": 0.45
  -- }

  -- Tendencia (comparado con período anterior)
  trend TEXT CHECK (trend IN ('improving', 'stable', 'declining', 'unknown')),

  -- Período de análisis
  analysis_period_start DATE NOT NULL,
  analysis_period_end DATE NOT NULL,

  -- Alertas generadas
  alerts JSONB DEFAULT '[]'::jsonb,
  -- Ejemplo:
  -- [
  --   {"type": "budget_exceeded", "severity": "high", "message": "Has superado el presupuesto de Entretenimiento en 45%"},
  --   {"type": "impulse_spike", "severity": "medium", "message": "Gastos impulsivos aumentaron 60% esta semana"}
  -- ]

  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Índices
  UNIQUE(user_id, date)
);

-- Índices para búsquedas rápidas
CREATE INDEX idx_mood_snapshots_user_date ON financial_mood_snapshots(user_id, date DESC);
CREATE INDEX idx_mood_snapshots_mood ON financial_mood_snapshots(mood_label);
CREATE INDEX idx_mood_snapshots_score ON financial_mood_snapshots(score);

-- ============================================================================
-- 2. Tabla de reglas configurables para calcular mood
-- ============================================================================
CREATE TABLE IF NOT EXISTS financial_mood_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,

  -- Condición en formato JSON (evaluable)
  condition_json JSONB NOT NULL,
  -- Ejemplo:
  -- {
  --   "metric": "impulse_percentage",
  --   "operator": "greater_than",
  --   "threshold": 40,
  --   "impact": -20,
  --   "message": "Gastos impulsivos muy altos"
  -- }

  -- Peso de la regla en el score final
  weight NUMERIC(3,2) DEFAULT 1.0 CHECK (weight >= 0 AND weight <= 2),

  -- Categoría de la regla
  category TEXT CHECK (category IN (
    'spending_pattern',
    'budget_compliance',
    'saving_behavior',
    'transaction_timing',
    'category_balance'
  )),

  -- Si está activa
  is_active BOOLEAN DEFAULT TRUE,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índice
CREATE INDEX idx_mood_rules_active ON financial_mood_rules(is_active);

-- ============================================================================
-- 3. Tabla de histórico de tendencias (agregado semanal/mensual)
-- ============================================================================
CREATE TABLE IF NOT EXISTS financial_mood_trends (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  period_type TEXT NOT NULL CHECK (period_type IN ('weekly', 'monthly', 'quarterly')),
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,

  -- Promedios del período
  avg_score NUMERIC(5,2),
  dominant_mood TEXT,

  -- Estadísticas
  total_snapshots INTEGER DEFAULT 0,
  days_stable INTEGER DEFAULT 0,
  days_stressed INTEGER DEFAULT 0,
  days_disciplined INTEGER DEFAULT 0,

  -- Cambio respecto período anterior
  score_change NUMERIC(5,2),

  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, period_type, period_start)
);

CREATE INDEX idx_mood_trends_user_period ON financial_mood_trends(user_id, period_type, period_start DESC);

-- ============================================================================
-- 4. Insertar reglas por defecto
-- ============================================================================

-- Regla 1: Gastos impulsivos altos
INSERT INTO financial_mood_rules (name, description, condition_json, weight, category)
VALUES (
  'impulse_spending_high',
  'Penaliza cuando los gastos impulsivos superan el 35% del total',
  '{
    "metric": "impulse_percentage",
    "operator": "greater_than",
    "threshold": 35,
    "impact": -20,
    "mood_factors": ["impulsivo", "estresado"],
    "message": "Gastos impulsivos muy altos (>{threshold}%)"
  }'::jsonb,
  1.5,
  'spending_pattern'
) ON CONFLICT (name) DO NOTHING;

-- Regla 2: Cumplimiento de presupuestos
INSERT INTO financial_mood_rules (name, description, condition_json, weight, category)
VALUES (
  'budget_compliance_good',
  'Bonifica cuando se cumplen más del 80% de los presupuestos',
  '{
    "metric": "budget_compliance",
    "operator": "greater_than",
    "threshold": 80,
    "impact": 15,
    "mood_factors": ["disciplinado", "estable"],
    "message": "Excelente cumplimiento de presupuestos ({value}%)"
  }'::jsonb,
  1.2,
  'budget_compliance'
) ON CONFLICT (name) DO NOTHING;

-- Regla 3: Tasa de ahorro
INSERT INTO financial_mood_rules (name, description, condition_json, weight, category)
VALUES (
  'saving_rate_good',
  'Bonifica cuando se ahorra más del 15% de los ingresos',
  '{
    "metric": "saving_rate",
    "operator": "greater_than",
    "threshold": 15,
    "impact": 10,
    "mood_factors": ["disciplinado", "modo_ahorro"],
    "message": "Ahorrando {value}% de tus ingresos"
  }'::jsonb,
  1.0,
  'saving_behavior'
) ON CONFLICT (name) DO NOTHING;

-- Regla 4: Variación semana a semana muy alta
INSERT INTO financial_mood_rules (name, description, condition_json, weight, category)
VALUES (
  'week_volatility_high',
  'Penaliza variaciones superiores al 30% semana a semana',
  '{
    "metric": "week_over_week_volatility",
    "operator": "greater_than",
    "threshold": 30,
    "impact": -15,
    "mood_factors": ["impulsivo", "estresado"],
    "message": "Gastos muy variables semana a semana ({value}%)"
  }'::jsonb,
  1.0,
  'spending_pattern'
) ON CONFLICT (name) DO NOTHING;

-- Regla 5: Transacciones nocturnas (compras impulsivas)
INSERT INTO financial_mood_rules (name, description, condition_json, weight, category)
VALUES (
  'late_night_spending',
  'Penaliza muchas transacciones entre 11pm - 4am',
  '{
    "metric": "late_night_transaction_count",
    "operator": "greater_than",
    "threshold": 5,
    "impact": -10,
    "mood_factors": ["impulsivo"],
    "message": "{value} transacciones nocturnas (posible gasto emocional)"
  }'::jsonb,
  0.8,
  'transaction_timing'
) ON CONFLICT (name) DO NOTHING;

-- Regla 6: Balance de categorías saludable
INSERT INTO financial_mood_rules (name, description, condition_json, weight, category)
VALUES (
  'category_balance_healthy',
  'Bonifica cuando no hay una categoría que domine >50% del gasto',
  '{
    "metric": "max_category_percentage",
    "operator": "less_than",
    "threshold": 50,
    "impact": 5,
    "mood_factors": ["estable"],
    "message": "Balance saludable entre categorías"
  }'::jsonb,
  0.7,
  'category_balance'
) ON CONFLICT (name) DO NOTHING;

-- Regla 7: Gasto en fin de semana excesivo
INSERT INTO financial_mood_rules (name, description, condition_json, weight, category)
VALUES (
  'weekend_spending_excessive',
  'Penaliza cuando >60% del gasto es en fin de semana',
  '{
    "metric": "weekend_spending_ratio",
    "operator": "greater_than",
    "threshold": 0.6,
    "impact": -12,
    "mood_factors": ["impulsivo"],
    "message": "{value}% del gasto en fin de semana"
  }'::jsonb,
  0.9,
  'spending_pattern'
) ON CONFLICT (name) DO NOTHING;

-- Regla 8: Racha de días sin gastos innecesarios
INSERT INTO financial_mood_rules (name, description, condition_json, weight, category)
VALUES (
  'frugal_streak',
  'Bonifica rachas de 3+ días sin gastos discrecionales',
  '{
    "metric": "frugal_days_streak",
    "operator": "greater_than",
    "threshold": 3,
    "impact": 8,
    "mood_factors": ["disciplinado", "modo_ahorro"],
    "message": "{value} días consecutivos sin gastos innecesarios"
  }'::jsonb,
  1.0,
  'saving_behavior'
) ON CONFLICT (name) DO NOTHING;

-- ============================================================================
-- 5. Función auxiliar: Calcular mood label desde score
-- ============================================================================
CREATE OR REPLACE FUNCTION calculate_mood_label(
  score NUMERIC,
  metrics JSONB
) RETURNS TEXT AS $$
DECLARE
  impulse_pct NUMERIC;
  budget_comp NUMERIC;
  saving_rate NUMERIC;
BEGIN
  -- Extraer métricas clave
  impulse_pct := COALESCE((metrics->>'impulse_percentage')::NUMERIC, 0);
  budget_comp := COALESCE((metrics->>'budget_compliance')::NUMERIC, 100);
  saving_rate := COALESCE((metrics->>'saving_rate')::NUMERIC, 0);

  -- Lógica de clasificación
  IF score >= 85 AND saving_rate > 20 THEN
    RETURN 'modo_ahorro';
  ELSIF score >= 80 AND budget_comp > 90 THEN
    RETURN 'disciplinado';
  ELSIF score >= 65 THEN
    RETURN 'estable';
  ELSIF score >= 50 THEN
    RETURN 'calmado';
  ELSIF score >= 35 AND impulse_pct > 40 THEN
    RETURN 'impulsivo';
  ELSIF score >= 35 THEN
    RETURN 'estresado';
  ELSIF score >= 20 THEN
    RETURN 'descontrolado';
  ELSE
    -- Score muy bajo, pero si está mejorando...
    RETURN 'recuperacion';
  END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ============================================================================
-- 6. Row Level Security (RLS)
-- ============================================================================
ALTER TABLE financial_mood_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_mood_trends ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_mood_rules ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own mood snapshots
CREATE POLICY "Users can view own mood snapshots"
  ON financial_mood_snapshots
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view own mood trends"
  ON financial_mood_trends
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Everyone can read rules (pero solo admins pueden modificar)
CREATE POLICY "Anyone can view mood rules"
  ON financial_mood_rules
  FOR SELECT
  TO authenticated
  USING (TRUE);

-- ============================================================================
-- 7. Comentarios
-- ============================================================================
COMMENT ON TABLE financial_mood_snapshots IS
  'Snapshots diarios del estado emocional financiero del usuario';

COMMENT ON TABLE financial_mood_rules IS
  'Reglas configurables para calcular el mood financiero';

COMMENT ON TABLE financial_mood_trends IS
  'Tendencias agregadas semanales/mensuales del mood financiero';

COMMENT ON COLUMN financial_mood_snapshots.mood_label IS
  'Etiqueta del estado: calmado, estable, disciplinado, modo_ahorro, impulsivo, estresado, descontrolado, recuperacion';

COMMENT ON COLUMN financial_mood_snapshots.score IS
  'Score 0-100 donde 100 = excelente salud financiera';

COMMENT ON COLUMN financial_mood_snapshots.reasons IS
  'Array de factores que contribuyen al mood con su impacto';

COMMENT ON COLUMN financial_mood_snapshots.metrics IS
  'Métricas calculadas: impulse_percentage, budget_compliance, etc.';
