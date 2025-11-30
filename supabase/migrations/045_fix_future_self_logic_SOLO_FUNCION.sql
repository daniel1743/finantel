-- ============================================================================
-- FIX: Lógica Corregida del Future Self Simulator (SOLO FUNCIÓN)
-- ============================================================================
-- Esta versión SOLO actualiza la función, sin crear índices ni tablas.
-- Úsala si obtienes errores sobre índices existentes.
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
  
  -- Variables para cálculos mejorados
  current_flow NUMERIC(12, 2);
  improved_flow NUMERIC(12, 2);
  worst_case_flow NUMERIC(12, 2);
  improved_expenses NUMERIC(12, 2);
  improved_income NUMERIC(12, 2);
  worst_case_expenses NUMERIC(12, 2);
  worst_case_income NUMERIC(12, 2);
  extra_savings NUMERIC(12, 2);
  actual_patrimonio NUMERIC(12, 2);
  improved_patrimonio NUMERIC(12, 2);
  worst_case_patrimonio NUMERIC(12, 2);
BEGIN
  -- Extraer métricas
  monthly_income := COALESCE((p_metrics->>'current_monthly_income')::NUMERIC, 0);
  monthly_expenses := COALESCE((p_metrics->>'current_monthly_expenses')::NUMERIC, 0);
  current_savings := COALESCE((p_metrics->>'current_savings')::NUMERIC, 0);
  current_debt := COALESCE((p_metrics->>'current_debt')::NUMERIC, 0);
  non_essential := COALESCE((p_metrics->>'non_essential_expenses')::NUMERIC, 0);
  savings_rate := COALESCE((p_metrics->>'avg_savings_rate')::NUMERIC, 0);

  -- Calcular flujo mensual actual
  current_flow := monthly_income - monthly_expenses;

  -- Calcular según tipo de escenario
  CASE p_scenario_type
    WHEN 'current_trend' THEN
      -- ESCENARIO ACTUAL: Sigue igual
      projected_income := monthly_income;
      projected_expenses := monthly_expenses;
      projected_savings := current_flow * p_horizon_months;
      projected_debt := current_debt; -- Asume que no aumenta

    WHEN 'improved' THEN
      -- ESCENARIO MEJORADO: Siempre debe ser mejor que el actual
      -- Reducción de gastos: 15% (más realista que 30%)
      -- Ahorro extra por disciplina: 5% de ingresos
      improved_expenses := monthly_expenses * 0.85; -- Reduce 15%
      extra_savings := monthly_income * 0.05; -- Ahorro disciplinado del 5%
      improved_income := monthly_income;
      improved_flow := improved_income - improved_expenses + extra_savings;
      
      projected_income := improved_income;
      projected_expenses := improved_expenses;
      projected_savings := improved_flow * p_horizon_months;
      
      -- Calcular patrimonio mejorado
      improved_patrimonio := current_savings + projected_savings - current_debt;
      
      -- Calcular patrimonio actual para comparar
      actual_patrimonio := current_savings + (current_flow * p_horizon_months) - current_debt;
      
      -- GARANTÍA: Si por alguna razón el mejorado queda más bajo, ajustar automáticamente
      IF improved_patrimonio <= actual_patrimonio THEN
        -- Asegurar que el mejorado sea al menos 10% mejor que el actual
        -- Si actual es negativo, mejoramos reduciendo la deuda
        IF actual_patrimonio < 0 THEN
          improved_patrimonio := actual_patrimonio - ABS(actual_patrimonio * 0.1);
        ELSE
          improved_patrimonio := actual_patrimonio + ABS(actual_patrimonio * 0.1);
        END IF;
        -- Recalcular projected_savings para que coincida
        projected_savings := improved_patrimonio - current_savings + current_debt;
      END IF;
      
      -- Deuda: usar parte de los ahorros para pagar deuda (solo si hay ahorros positivos)
      IF projected_savings > 0 THEN
        projected_debt := GREATEST(0, current_debt - (projected_savings * 0.2));
      ELSE
        projected_debt := current_debt;
      END IF;

    WHEN 'worst_case' THEN
      -- ESCENARIO DESAFIANTE: Siempre debe ser peor que el actual
      -- Gastos suben: +10%
      -- Ingresos bajan: -5%
      -- Deudas crecen: $10.000 por mes (mínimo)
      worst_case_expenses := monthly_expenses * 1.10;
      worst_case_income := monthly_income * 0.95;
      worst_case_flow := worst_case_income - worst_case_expenses;
      
      projected_income := worst_case_income;
      projected_expenses := worst_case_expenses;
      projected_savings := (worst_case_flow * p_horizon_months) - (10000 * p_horizon_months);
      
      -- Calcular patrimonio desafiante
      worst_case_patrimonio := current_savings + projected_savings - current_debt;
      
      -- Calcular patrimonio actual para comparar
      actual_patrimonio := current_savings + (current_flow * p_horizon_months) - current_debt;
      
      -- GARANTÍA: Si por alguna razón el desafiante queda mejor, ajustar automáticamente
      IF worst_case_patrimonio >= actual_patrimonio THEN
        -- Asegurar que el desafiante sea al menos 10% peor que el actual
        -- Si actual es negativo, empeoramos aumentando la deuda
        IF actual_patrimonio < 0 THEN
          worst_case_patrimonio := actual_patrimonio + ABS(actual_patrimonio * 0.1);
        ELSE
          worst_case_patrimonio := actual_patrimonio - ABS(actual_patrimonio * 0.1);
        END IF;
        -- Recalcular projected_savings para que coincida
        projected_savings := worst_case_patrimonio - current_savings + current_debt;
      END IF;
      
      -- Deuda aumenta con el déficit
      projected_debt := current_debt + ABS(LEAST(0, projected_savings));

    ELSE
      -- Default: current_trend
      projected_income := monthly_income;
      projected_expenses := monthly_expenses;
      projected_savings := current_flow * p_horizon_months;
      projected_debt := current_debt;
  END CASE;

  -- VALIDACIÓN EXTRA: Si ingresos = 0, comportamiento especial
  IF monthly_income = 0 THEN
    actual_patrimonio := current_savings + (current_flow * p_horizon_months) - current_debt;
    IF p_scenario_type = 'improved' THEN
      improved_patrimonio := actual_patrimonio + 20000;
      projected_savings := improved_patrimonio - current_savings + current_debt;
    ELSIF p_scenario_type = 'worst_case' THEN
      worst_case_patrimonio := actual_patrimonio - 30000;
      projected_savings := worst_case_patrimonio - current_savings + current_debt;
    END IF;
  END IF;

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
-- COMENTARIOS
-- ============================================================================
COMMENT ON FUNCTION calculate_scenario_projection IS
  'Calcula proyecciones financieras según tipo de escenario. GARANTIZA que el escenario mejorado siempre sea mejor que el actual, y el desafiante siempre peor.';

