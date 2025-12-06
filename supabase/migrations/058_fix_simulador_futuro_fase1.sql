-- ============================================================================
-- MIGRACIÓN 058: CORRECCIONES CRÍTICAS FASE 1 - SIMULADOR DE FUTURO
-- ============================================================================
-- Fecha: 2025-01-27
-- Descripción: Corrige 7 problemas críticos en el cálculo de proyecciones
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
  
  -- Variables para correcciones
  monthly_savings NUMERIC(12, 2);
  debt_payment NUMERIC(12, 2);
  deficit_accumulated NUMERIC(12, 2);
  target_patrimonio NUMERIC(12, 2);
  savings_needed NUMERIC(12, 2);
  estimated_debt_payment NUMERIC(12, 2);
  diferencia_necesaria NUMERIC(12, 2);
  mejora_mensual NUMERIC(12, 2);
  mejora_total NUMERIC(12, 2);
  pago_deuda_maximo NUMERIC(12, 2);
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
      -- Sigue igual
      projected_income := monthly_income;
      projected_expenses := monthly_expenses;
      projected_savings := current_flow * p_horizon_months;
      projected_debt := current_debt; -- Asume que no aumenta
      
      RAISE NOTICE '[SIMULADOR-FIX] [1.1] Current Trend - Flujo: %, Ahorros: %, Deuda: %', 
        current_flow, projected_savings, projected_debt;

    WHEN 'improved' THEN
      -- ========================================================================
      -- CORRECCIÓN 1.2: Separar reducción de gastos de ahorro extra
      -- ========================================================================
      improved_expenses := monthly_expenses * 0.85; -- Reduce 15%
      extra_savings := monthly_income * 0.05; -- Ahorro disciplinado del 5%
      improved_income := monthly_income;
      
      -- CORRECCIÓN: Flujo mejorado sin sumar extra_savings (se suma después)
      improved_flow := improved_income - improved_expenses;
      
      -- CORRECCIÓN: Ahorros proyectados = flujo mejorado + ahorro extra (ambos multiplicados por horizonte)
      projected_savings := (improved_flow * p_horizon_months) + (extra_savings * p_horizon_months);
      
      projected_income := improved_income;
      projected_expenses := improved_expenses;
      
      RAISE NOTICE '[SIMULADOR-FIX] [1.2] Improved Flow - Flujo: %, Gastos: %, Ingresos: %, Extra: %, Ahorros totales: %', 
        improved_flow, improved_expenses, improved_income, extra_savings, projected_savings;
      
      -- ========================================================================
      -- CORRECCIÓN 1.7: Cálculo de deuda mejorado (usar ahorro mensual)
      -- IMPORTANTE: Calcular deuda ANTES de calcular patrimonio para garantía
      -- ========================================================================
      -- CORRECCIÓN: Calcular deuda usando ahorro mensual, no total
      IF projected_savings > 0 THEN
        monthly_savings := projected_savings / p_horizon_months;
        -- Usar 20% del ahorro mensual para pagar deuda, multiplicado por meses
        debt_payment := (monthly_savings * 0.2) * p_horizon_months;
        -- Limitar el pago de deuda al monto disponible
        debt_payment := LEAST(debt_payment, current_debt);
        projected_debt := GREATEST(0, current_debt - debt_payment);
      ELSE
        projected_debt := current_debt;
      END IF;
      
      RAISE NOTICE '[SIMULADOR-FIX] [1.7] Improved Deuda - Ahorro mensual: %, Pago deuda: %, Deuda final: %', 
        monthly_savings, debt_payment, projected_debt;
      
      -- Calcular patrimonio actual para comparar (con deuda actual)
      actual_patrimonio := current_savings + (current_flow * p_horizon_months) - current_debt;
      
      -- Calcular patrimonio mejorado (con deuda proyectada actualizada)
      improved_patrimonio := current_savings + projected_savings - projected_debt;
      
      -- ========================================================================
      -- CORRECCIÓN 1.5: Garantía de escenarios mejorada
      -- IMPORTANTE: Asegurar que improved SIEMPRE sea mejor que actual
      -- ========================================================================
      -- GARANTÍA: Si por alguna razón el mejorado queda igual o peor, ajustar automáticamente
      -- IMPORTANTE: Asegurar que improved SIEMPRE sea mejor que actual
      -- CORRECCIÓN CRÍTICA: Funciona correctamente con patrimonios negativos y horizontes largos
      IF improved_patrimonio <= actual_patrimonio THEN
        RAISE NOTICE '[SIMULADOR-FIX] [1.5] ⚠️ Garantía activada - Mejorado (%) <= Actual (%), Horizonte: % meses', 
          improved_patrimonio, actual_patrimonio, p_horizon_months;
        
        -- Calcular patrimonio objetivo (mejor que actual)
        -- Para patrimonios negativos: mejor = menos negativo (más cerca de cero)
        -- Para patrimonios positivos: mejor = más positivo
        IF actual_patrimonio < 0 THEN
          -- Para patrimonio negativo: mejor = menos negativo
          -- Ejemplo: -100 -> -85 (15% mejor = 15% menos negativo)
          -- Con horizontes largos, necesitamos una mejora más significativa
          target_patrimonio := actual_patrimonio + ABS(actual_patrimonio * 0.20); -- 20% mejor (aumentado de 15%)
        ELSE
          -- Si el actual es positivo o cero, el mejorado debe ser al menos 10% mejor
          target_patrimonio := actual_patrimonio + ABS(actual_patrimonio * 0.1);
          -- Si actual es 0, asegurar mínimo de mejora
          IF actual_patrimonio = 0 THEN
            target_patrimonio := 10000; -- Mínimo de mejora si actual es 0
          END IF;
        END IF;
        
        -- CORRECCIÓN: Calcular directamente projected_savings necesario para patrimonio objetivo
        -- Fórmula: target_patrimonio = current_savings + projected_savings - projected_debt
        -- Necesitamos estimar projected_debt primero, pero depende de projected_savings
        -- Solución: usar una aproximación más directa basada en la diferencia necesaria
        
        -- Paso 1: Calcular diferencia necesaria entre actual y objetivo
        diferencia_necesaria := target_patrimonio - actual_patrimonio;
        
        -- Paso 2: Distribuir la mejora a lo largo del horizonte
        -- La mejora debe venir de mejores ahorros mensuales
        mejora_mensual := diferencia_necesaria / p_horizon_months;
        
        -- Paso 3: Calcular ahorros mejorados necesarios
        -- actual_patrimonio = current_savings + (current_flow * horizon) - current_debt
        -- target_patrimonio = current_savings + (improved_flow * horizon) - projected_debt
        -- diferencia = (improved_flow - current_flow) * horizon - (projected_debt - current_debt)
        
        -- Aproximación: asumir que la mejora viene principalmente de mejores ahorros
        -- Si hay deuda, parte de la mejora puede venir de pagar deuda
        IF current_debt > 0 AND diferencia_necesaria > 0 THEN
          -- Si hay deuda y mejora positiva, podemos pagar parte de la deuda
          -- Calcular cuánto podemos pagar de deuda con la mejora
          mejora_total := diferencia_necesaria;
          -- Máximo 30% de la mejora puede usarse para pagar deuda
          pago_deuda_maximo := LEAST(mejora_total * 0.3, current_debt);
          projected_debt := GREATEST(0, current_debt - pago_deuda_maximo);
          
          -- El resto de la mejora viene de mejores ahorros
          projected_savings := (current_flow * p_horizon_months) + (mejora_total - pago_deuda_maximo);
        ELSE
          -- Si no hay deuda o la mejora es negativa, toda la mejora viene de ahorros
          projected_debt := current_debt;
          projected_savings := (current_flow * p_horizon_months) + diferencia_necesaria;
        END IF;
        
        -- Paso 4: Recalcular patrimonio con valores ajustados
        improved_patrimonio := current_savings + projected_savings - projected_debt;
        
        -- Paso 5: Si aún no es mejor, forzar mejora adicional
        IF improved_patrimonio <= actual_patrimonio THEN
          RAISE NOTICE '[SIMULADOR-FIX] [1.5] ⚠️ Segunda iteración necesaria - Mejorado: %, Actual: %', 
            improved_patrimonio, actual_patrimonio;
          
          -- Aumentar patrimonio objetivo adicional
          IF actual_patrimonio < 0 THEN
            target_patrimonio := actual_patrimonio + ABS(actual_patrimonio * 0.30); -- 30% mejor
          ELSE
            target_patrimonio := actual_patrimonio + ABS(actual_patrimonio * 0.2); -- 20% mejor
            IF actual_patrimonio = 0 THEN
              target_patrimonio := 15000; -- Más mejora si actual es 0
            END IF;
          END IF;
          
          -- Recalcular con nuevo objetivo
          diferencia_necesaria := target_patrimonio - actual_patrimonio;
          mejora_mensual := diferencia_necesaria / p_horizon_months;
          
          IF current_debt > 0 AND diferencia_necesaria > 0 THEN
            mejora_total := diferencia_necesaria;
            pago_deuda_maximo := LEAST(mejora_total * 0.3, current_debt);
            projected_debt := GREATEST(0, current_debt - pago_deuda_maximo);
            projected_savings := (current_flow * p_horizon_months) + (mejora_total - pago_deuda_maximo);
          ELSE
            projected_debt := current_debt;
            projected_savings := (current_flow * p_horizon_months) + diferencia_necesaria;
          END IF;
          
          improved_patrimonio := current_savings + projected_savings - projected_debt;
        END IF;
      END IF;
      
      RAISE NOTICE '[SIMULADOR-FIX] [1.5] Garantía Improved - Actual: %, Mejorado: %, Diferencia: %, Ahorros: %, Deuda: %', 
        actual_patrimonio, improved_patrimonio, improved_patrimonio - actual_patrimonio, projected_savings, projected_debt;

    WHEN 'worst_case' THEN
      -- ESCENARIO DESAFIANTE: Siempre debe ser peor que el actual
      -- Gastos suben: +10%
      -- Ingresos bajan: -5%
      worst_case_expenses := monthly_expenses * 1.10;
      worst_case_income := monthly_income * 0.95;
      worst_case_flow := worst_case_income - worst_case_expenses;
      
      projected_income := worst_case_income;
      projected_expenses := worst_case_expenses;
      
      -- ========================================================================
      -- CORRECCIÓN 1.13: Cálculo de ahorros worst case mejorado
      -- ========================================================================
      -- CORRECCIÓN: Calcular déficit acumulado basado en flujo mensual
      -- Si hay déficit mensual, se acumula. Si hay superávit, se reduce el déficit.
      IF worst_case_flow < 0 THEN
        deficit_accumulated := ABS(worst_case_flow * p_horizon_months);
        projected_savings := (worst_case_flow * p_horizon_months) - deficit_accumulated;
      ELSE
        -- Si hay superávit, no hay déficit adicional
        projected_savings := worst_case_flow * p_horizon_months;
      END IF;
      
      RAISE NOTICE '[SIMULADOR-FIX] [1.13] Worst Case - Flujo: %, Déficit acumulado: %, Ahorros: %', 
        worst_case_flow, deficit_accumulated, projected_savings;
      
      -- Calcular patrimonio actual para comparar
      actual_patrimonio := current_savings + (current_flow * p_horizon_months) - current_debt;
      
      -- Calcular patrimonio desafiante (temporal, antes de ajustar deuda)
      worst_case_patrimonio := current_savings + projected_savings - current_debt;
      
      -- ========================================================================
      -- CORRECCIÓN 1.5: Garantía de escenarios worst case
      -- ========================================================================
      -- GARANTÍA: Si por alguna razón el desafiante queda mejor, ajustar automáticamente
      IF worst_case_patrimonio >= actual_patrimonio THEN
        -- Si ambos son negativos, el worst case debe ser más negativo
        IF actual_patrimonio < 0 THEN
          worst_case_patrimonio := actual_patrimonio - ABS(actual_patrimonio * 0.15); -- 15% peor
        ELSE
          -- Si el actual es positivo, el worst case debe ser al menos 10% peor
          worst_case_patrimonio := actual_patrimonio - ABS(actual_patrimonio * 0.1);
        END IF;
        -- Recalcular projected_savings para que coincida
        projected_savings := worst_case_patrimonio - current_savings + current_debt;
      END IF;
      
      RAISE NOTICE '[SIMULADOR-FIX] [1.5] Garantía Worst Case - Actual: %, Worst: %, Diferencia: %', 
        actual_patrimonio, worst_case_patrimonio, worst_case_patrimonio - actual_patrimonio;
      
      -- ========================================================================
      -- CORRECCIÓN 1.4: Cálculo de deuda worst case mejorado
      -- ========================================================================
      -- CORRECCIÓN: Calcular deuda basada en déficit mensual acumulado
      IF worst_case_flow < 0 THEN
        -- Si hay déficit mensual, la deuda aumenta con el déficit acumulado
        projected_debt := current_debt + ABS(worst_case_flow * p_horizon_months);
      ELSE
        -- Si hay superávit, la deuda no aumenta (pero tampoco se paga automáticamente)
        projected_debt := current_debt;
      END IF;
      
      RAISE NOTICE '[SIMULADOR-FIX] [1.4] Worst Case Deuda - Flujo: %, Déficit acumulado: %, Deuda: %', 
        worst_case_flow, ABS(worst_case_flow * p_horizon_months), projected_debt;

    ELSE
      -- Default: current_trend
      projected_income := monthly_income;
      projected_expenses := monthly_expenses;
      projected_savings := current_flow * p_horizon_months;
      projected_debt := current_debt;
  END CASE;

  -- ========================================================================
  -- CORRECCIÓN 1.3: Validación de ingresos cero mejorada
  -- ========================================================================
  -- CORRECCIÓN: Usar valores proporcionales al horizonte temporal
  IF monthly_income = 0 THEN
    IF p_scenario_type = 'improved' THEN
      actual_patrimonio := current_savings + (current_flow * p_horizon_months) - current_debt;
      -- CORRECCIÓN: Ajuste proporcional al horizonte (ej: 20000 por mes = 20000 * horizon_months / 12)
      improved_patrimonio := actual_patrimonio + (20000 * p_horizon_months / 12);
      projected_savings := improved_patrimonio - current_savings + current_debt;
      
      RAISE NOTICE '[SIMULADOR-FIX] [1.3] Ingresos cero Improved - Horizonte: % meses, Ajuste: %, Patrimonio: %', 
        p_horizon_months, improved_patrimonio - actual_patrimonio, improved_patrimonio;
        
    ELSIF p_scenario_type = 'worst_case' THEN
      actual_patrimonio := current_savings + (current_flow * p_horizon_months) - current_debt;
      -- CORRECCIÓN: Ajuste proporcional al horizonte (ej: 30000 por mes = 30000 * horizon_months / 12)
      worst_case_patrimonio := actual_patrimonio - (30000 * p_horizon_months / 12);
      projected_savings := worst_case_patrimonio - current_savings + current_debt;
      
      RAISE NOTICE '[SIMULADOR-FIX] [1.3] Ingresos cero Worst Case - Horizonte: % meses, Ajuste: %, Patrimonio: %', 
        p_horizon_months, actual_patrimonio - worst_case_patrimonio, worst_case_patrimonio;
    END IF;
  END IF;

  -- ========================================================================
  -- CORRECCIÓN 1.1: Calcular patrimonio neto DESPUÉS de calcular projected_debt
  -- ========================================================================
  -- CORRECCIÓN: Asegurar que projected_debt está actualizado antes de calcular patrimonio neto
  projected_net_worth := current_savings + projected_savings - projected_debt;
  
  RAISE NOTICE '[SIMULADOR-FIX] [1.1] Patrimonio neto calculado: % (ahorros: %, deuda: %, ahorros actuales: %)', 
    projected_net_worth, projected_savings, projected_debt, current_savings;

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
'Calcula proyecciones financieras según tipo de escenario. 
CORRECCIONES FASE 1:
- 1.1: Patrimonio neto calculado después de actualizar deuda
- 1.2: Flujo mejorado sin doble contabilización de extra_savings
- 1.3: Validación de ingresos cero con valores proporcionales
- 1.4: Deuda worst case basada en déficit mensual acumulado
- 1.5: Garantía de escenarios mejorada (maneja patrimonio negativo)
- 1.7: Deuda improved usando ahorro mensual, no total
- 1.13: Ahorros worst case calculados correctamente';

