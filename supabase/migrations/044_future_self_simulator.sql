-- ============================================================================
-- FUTURE SELF SIMULATOR - SCHEMA
-- ============================================================================
-- Simula cómo estará la vida financiera del usuario en diferentes horizontes
-- temporales (3, 6, 12, 24 meses) según su comportamiento actual
-- ============================================================================

-- ============================================================================
-- 1. Tabla de Escenarios Futuros
-- ============================================================================
CREATE TABLE IF NOT EXISTS future_self_scenarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Horizonte temporal (meses en el futuro)
  horizon_months INTEGER NOT NULL CHECK (horizon_months IN (3, 6, 12, 24)),

  -- Tipo de escenario
  scenario_type TEXT NOT NULL CHECK (scenario_type IN (
    'current_trend',  -- Sigue igual que ahora
    'improved',       -- Mejora hábitos (reduce gastos no esenciales)
    'worst_case'      -- Empeora (ingresos bajan, gastos aumentan)
  )),

  -- Proyecciones financieras
  projected_savings NUMERIC(12, 2) DEFAULT 0,
  projected_debt NUMERIC(12, 2) DEFAULT 0,
  projected_income NUMERIC(12, 2) DEFAULT 0,
  projected_expenses NUMERIC(12, 2) DEFAULT 0,
  projected_net_worth NUMERIC(12, 2) DEFAULT 0,

  -- Resumen generado por IA (texto motivacional)
  summary_text TEXT NOT NULL,
  -- Ejemplo: "Si continúas así, en 12 meses podrías tener $X. Si ajustas estos 2 hábitos, podrías llegar a $Y"

  -- Métricas de entrada (para referencia)
  input_metrics JSONB DEFAULT '{}'::jsonb,
  -- Ejemplo:
  -- {
  --   "current_monthly_income": 1500000,
  --   "current_monthly_expenses": 1200000,
  --   "current_savings": 500000,
  --   "current_debt": 0,
  --   "avg_savings_rate": 20.0,
  --   "non_essential_expenses": 300000
  -- }

  -- Acciones sugeridas (generadas por IA)
  suggested_actions JSONB DEFAULT '[]'::jsonb,
  -- Ejemplo:
  -- [
  --   {"action": "reduce_delivery", "impact": 50000, "description": "Reducir delivery a 8 veces/mes"},
  --   {"action": "cancel_subscription", "impact": 15000, "description": "Cancelar suscripción no usada"}
  -- ]

  -- Modelo de IA usado
  ai_model_used TEXT,
  -- Ejemplo: "deepseek-r1", "gpt-4o-mini"

  -- Timestamp de cálculo
  calculated_at TIMESTAMPTZ DEFAULT NOW(),

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Un usuario solo puede tener un escenario por tipo y horizonte
  UNIQUE(user_id, horizon_months, scenario_type)
);

-- Índices para búsquedas rápidas
CREATE INDEX idx_future_scenarios_user_horizon 
  ON future_self_scenarios(user_id, horizon_months DESC);

CREATE INDEX idx_future_scenarios_user_type 
  ON future_self_scenarios(user_id, scenario_type);

CREATE INDEX idx_future_scenarios_calculated 
  ON future_self_scenarios(calculated_at DESC);

-- ============================================================================
-- 2. Tabla de Historial de Simulaciones (para tracking)
-- ============================================================================
CREATE TABLE IF NOT EXISTS future_self_simulation_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Referencia al escenario calculado
  scenario_id UUID REFERENCES future_self_scenarios(id) ON DELETE CASCADE,
  
  -- Horizonte y tipo
  horizon_months INTEGER NOT NULL,
  scenario_type TEXT NOT NULL,
  
  -- Proyecciones al momento de la simulación
  projected_savings NUMERIC(12, 2),
  projected_net_worth NUMERIC(12, 2),
  
  -- Realidad actual (para comparar después)
  actual_savings NUMERIC(12, 2),
  actual_net_worth NUMERIC(12, 2),
  
  -- Diferencia (para medir precisión del modelo)
  savings_difference NUMERIC(12, 2),
  net_worth_difference NUMERIC(12, 2),
  
  -- Si el usuario alcanzó el horizonte
  reached_horizon BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_simulation_history_user 
  ON future_self_simulation_history(user_id, created_at DESC);

-- ============================================================================
-- 3. Función auxiliar: Calcular métricas actuales del usuario
-- ============================================================================
CREATE OR REPLACE FUNCTION calculate_user_financial_metrics(
  p_user_id UUID,
  p_months_back INTEGER DEFAULT 6
)
RETURNS JSONB AS $$
DECLARE
  result JSONB;
  total_income NUMERIC(12, 2) := 0;
  total_expenses NUMERIC(12, 2) := 0;
  total_savings NUMERIC(12, 2) := 0;
  avg_monthly_income NUMERIC(12, 2) := 0;
  avg_monthly_expenses NUMERIC(12, 2) := 0;
  avg_savings_rate NUMERIC(5, 2) := 0;
  non_essential_expenses NUMERIC(12, 2) := 0;
  current_debt NUMERIC(12, 2) := 0;
  current_savings NUMERIC(12, 2) := 0;
  period_start DATE;
  period_end DATE;
BEGIN
  -- Calcular período
  period_end := CURRENT_DATE;
  period_start := period_end - (p_months_back || ' months')::INTERVAL;

  -- Calcular ingresos totales del período
  SELECT COALESCE(SUM(amount), 0) INTO total_income
  FROM transactions
  WHERE user_id = p_user_id
    AND type = 'income'
    AND date >= period_start
    AND date <= period_end;

  -- Calcular gastos totales del período
  SELECT COALESCE(SUM(amount), 0) INTO total_expenses
  FROM transactions
  WHERE user_id = p_user_id
    AND type = 'expense'
    AND date >= period_start
    AND date <= period_end;

  -- Calcular ahorros (ingresos - gastos)
  total_savings := total_income - total_expenses;

  -- Promedios mensuales
  avg_monthly_income := total_income / GREATEST(p_months_back, 1);
  avg_monthly_expenses := total_expenses / GREATEST(p_months_back, 1);

  -- Tasa de ahorro
  IF avg_monthly_income > 0 THEN
    avg_savings_rate := ((avg_monthly_income - avg_monthly_expenses) / avg_monthly_income) * 100;
  END IF;

  -- Gastos no esenciales (categorías de ocio, entretenimiento, etc.)
  SELECT COALESCE(SUM(t.amount), 0) INTO non_essential_expenses
  FROM transactions t
  LEFT JOIN categories c ON c.id = t.category_id
  WHERE t.user_id = p_user_id
    AND t.type = 'expense'
    AND t.date >= period_start
    AND t.date <= period_end
    AND (
      LOWER(COALESCE(c.name, '')) LIKE '%ocio%'
      OR LOWER(COALESCE(c.name, '')) LIKE '%entretenimiento%'
      OR LOWER(COALESCE(c.name, '')) LIKE '%delivery%'
      OR LOWER(COALESCE(c.name, '')) LIKE '%restaurante%'
      OR t.metadata->>'necessity_level' IN ('poco-necesario', 'nada-necesario', 'innecesario', 'impulso')
    );

  -- Deuda actual (si existe tabla de deudas)
  -- Por ahora, asumimos 0 si no hay tabla de deudas
  current_debt := 0;

  -- Ahorros actuales (último saldo conocido o estimado)
  -- Por ahora, calculamos como acumulado de ahorros del período
  current_savings := GREATEST(0, total_savings);

  -- Construir resultado
  result := jsonb_build_object(
    'current_monthly_income', avg_monthly_income,
    'current_monthly_expenses', avg_monthly_expenses,
    'current_savings', current_savings,
    'current_debt', current_debt,
    'avg_savings_rate', avg_savings_rate,
    'non_essential_expenses', non_essential_expenses,
    'total_income_period', total_income,
    'total_expenses_period', total_expenses,
    'period_months', p_months_back,
    'period_start', period_start,
    'period_end', period_end
  );

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 4. Función auxiliar: Calcular proyección de escenario
-- ============================================================================
CREATE OR REPLACE FUNCTION calculate_scenario_projection(
  p_metrics JSONB,
  p_horizon_months INTEGER,
  p_scenario_type TEXT
)
RETURNS JSONB AS $$
DECLARE
  result JSONB;
  monthly_income NUMERIC(12, 2);
  monthly_expenses NUMERIC(12, 2);
  current_savings NUMERIC(12, 2);
  current_debt NUMERIC(12, 2);
  non_essential NUMERIC(12, 2);
  savings_rate NUMERIC(5, 2);
  
  -- Proyecciones
  projected_income NUMERIC(12, 2);
  projected_expenses NUMERIC(12, 2);
  projected_savings NUMERIC(12, 2);
  projected_debt NUMERIC(12, 2);
  projected_net_worth NUMERIC(12, 2);
BEGIN
  -- Extraer métricas
  monthly_income := COALESCE((p_metrics->>'current_monthly_income')::NUMERIC, 0);
  monthly_expenses := COALESCE((p_metrics->>'current_monthly_expenses')::NUMERIC, 0);
  current_savings := COALESCE((p_metrics->>'current_savings')::NUMERIC, 0);
  current_debt := COALESCE((p_metrics->>'current_debt')::NUMERIC, 0);
  non_essential := COALESCE((p_metrics->>'non_essential_expenses')::NUMERIC, 0);
  savings_rate := COALESCE((p_metrics->>'avg_savings_rate')::NUMERIC, 0);

  -- Calcular según tipo de escenario
  CASE p_scenario_type
    WHEN 'current_trend' THEN
      -- Sigue igual
      projected_income := monthly_income;
      projected_expenses := monthly_expenses;
      projected_savings := (monthly_income - monthly_expenses) * p_horizon_months;
      projected_debt := current_debt; -- Asume que no aumenta

    WHEN 'improved' THEN
      -- Reduce gastos no esenciales en 30%
      projected_income := monthly_income;
      projected_expenses := monthly_expenses - (non_essential * 0.3);
      projected_savings := (projected_income - projected_expenses) * p_horizon_months;
      projected_debt := GREATEST(0, current_debt - (projected_savings * 0.2)); -- Usa 20% de ahorros para pagar deuda

    WHEN 'worst_case' THEN
      -- Ingresos bajan 15%, gastos aumentan 10%
      projected_income := monthly_income * 0.85;
      projected_expenses := monthly_expenses * 1.10;
      projected_savings := (projected_income - projected_expenses) * p_horizon_months;
      projected_debt := current_debt + ABS(LEAST(0, projected_savings)); -- Si hay déficit, aumenta deuda

    ELSE
      -- Default: current_trend
      projected_income := monthly_income;
      projected_expenses := monthly_expenses;
      projected_savings := (monthly_income - monthly_expenses) * p_horizon_months;
      projected_debt := current_debt;
  END CASE;

  -- Calcular patrimonio neto proyectado
  projected_net_worth := current_savings + projected_savings - projected_debt;

  -- Construir resultado
  result := jsonb_build_object(
    'projected_income', projected_income * p_horizon_months,
    'projected_expenses', projected_expenses * p_horizon_months,
    'projected_savings', projected_savings,
    'projected_debt', projected_debt,
    'projected_net_worth', projected_net_worth,
    'monthly_income', projected_income,
    'monthly_expenses', projected_expenses
  );

  RETURN result;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ============================================================================
-- 5. Row Level Security (RLS)
-- ============================================================================
ALTER TABLE future_self_scenarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE future_self_simulation_history ENABLE ROW LEVEL SECURITY;

-- Políticas para future_self_scenarios
CREATE POLICY "Users can view own scenarios"
  ON future_self_scenarios
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own scenarios"
  ON future_self_scenarios
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own scenarios"
  ON future_self_scenarios
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Políticas para future_self_simulation_history
CREATE POLICY "Users can view own simulation history"
  ON future_self_simulation_history
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own simulation history"
  ON future_self_simulation_history
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- 6. Triggers
-- ============================================================================
CREATE OR REPLACE FUNCTION update_future_scenarios_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_future_scenarios_updated_at
  BEFORE UPDATE ON future_self_scenarios
  FOR EACH ROW
  EXECUTE FUNCTION update_future_scenarios_updated_at();

-- ============================================================================
-- 7. Comentarios
-- ============================================================================
COMMENT ON TABLE future_self_scenarios IS
  'Escenarios financieros futuros calculados para el usuario';

COMMENT ON TABLE future_self_simulation_history IS
  'Historial de simulaciones para tracking y mejora del modelo';

COMMENT ON COLUMN future_self_scenarios.horizon_months IS
  'Horizonte temporal en meses: 3, 6, 12, o 24';

COMMENT ON COLUMN future_self_scenarios.scenario_type IS
  'Tipo de escenario: current_trend, improved, worst_case';

COMMENT ON COLUMN future_self_scenarios.summary_text IS
  'Resumen generado por IA en lenguaje motivacional';

COMMENT ON FUNCTION calculate_user_financial_metrics IS
  'Calcula métricas financieras actuales del usuario basado en transacciones';

COMMENT ON FUNCTION calculate_scenario_projection IS
  'Calcula proyecciones financieras según tipo de escenario';

-- ============================================================================
-- FIN DE MIGRACIÓN 044
-- ============================================================================

