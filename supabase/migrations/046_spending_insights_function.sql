-- ============================================================================
-- MIGRACIÓN 046: FUNCIÓN PARA OBTENER INSIGHTS DE GASTOS REALES
-- ============================================================================
-- Esta función analiza las transacciones reales del usuario y genera
-- insights personalizados para el Simulador de Futuro
-- ============================================================================

CREATE OR REPLACE FUNCTION get_spending_insights(
  p_user_id UUID,
  p_months_back INTEGER DEFAULT 3
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_start_date DATE;
  v_result JSONB;
  v_top_categories JSONB;
  v_impulsive_expenses JSONB;
  v_recurring_services JSONB;
  v_saving_opportunities JSONB;
  v_category_totals JSONB;
BEGIN
  -- Calcular fecha de inicio
  v_start_date := CURRENT_DATE - (p_months_back || ' months')::INTERVAL;

  -- 1. TOP CATEGORÍAS DE GASTO (últimos N meses)
  SELECT jsonb_agg(
    jsonb_build_object(
      'category', category_name,
      'total', total_amount,
      'count', transaction_count,
      'monthly_average', monthly_avg,
      'percentage_of_expenses', percentage
    ) ORDER BY total_amount DESC
  )
  INTO v_top_categories
  FROM (
    SELECT 
      COALESCE(c.name, 'Sin categoría') as category_name,
      SUM(ABS(t.amount)) as total_amount,
      COUNT(*) as transaction_count,
      ROUND(SUM(ABS(t.amount)) / NULLIF(p_months_back, 0), 2) as monthly_avg,
      ROUND(
        (SUM(ABS(t.amount)) * 100.0 / NULLIF(
          (SELECT SUM(ABS(amount)) FROM transactions 
           WHERE user_id = p_user_id 
           AND type = 'expense' 
           AND date >= v_start_date), 0
        )), 2
      ) as percentage
    FROM transactions t
    LEFT JOIN categories c ON t.category_id = c.id
    WHERE t.user_id = p_user_id
      AND t.type = 'expense'
      AND t.date >= v_start_date
      AND ABS(t.amount) > 0
    GROUP BY c.name
    HAVING SUM(ABS(t.amount)) > 0
    ORDER BY total_amount DESC
    LIMIT 10
  ) category_stats;

  -- 2. GASTOS IMPULSIVOS (transacciones fuera de horario normal o montos inusuales)
  SELECT jsonb_agg(
    jsonb_build_object(
      'date', t.date,
      'amount', ABS(t.amount),
      'description', t.description,
      'category', COALESCE(c.name, 'Sin categoría'),
      'is_impulsive', true
    ) ORDER BY t.date DESC
  )
  INTO v_impulsive_expenses
  FROM transactions t
  LEFT JOIN categories c ON t.category_id = c.id
  WHERE t.user_id = p_user_id
    AND t.type = 'expense'
    AND t.date >= v_start_date
    AND ABS(t.amount) > (
      SELECT AVG(ABS(amount)) * 2 
      FROM transactions 
      WHERE user_id = p_user_id 
      AND type = 'expense' 
      AND category_id = t.category_id
      AND date >= v_start_date
    )
  ORDER BY t.date DESC
  LIMIT 10;

  -- 3. SERVICIOS RECURRENTES (transacciones con mismo monto y descripción similar)
  SELECT jsonb_agg(
    jsonb_build_object(
      'description', description_pattern,
      'amount', recurring_amount,
      'frequency', frequency_count,
      'category', category_name,
      'last_date', last_occurrence
    ) ORDER BY frequency_count DESC
  )
  INTO v_recurring_services
  FROM (
    SELECT 
      CASE 
        WHEN LOWER(t.description) LIKE '%netflix%' THEN 'Netflix'
        WHEN LOWER(t.description) LIKE '%spotify%' THEN 'Spotify'
        WHEN LOWER(t.description) LIKE '%amazon%' THEN 'Amazon'
        WHEN LOWER(t.description) LIKE '%google%' THEN 'Google'
        WHEN LOWER(t.description) LIKE '%microsoft%' THEN 'Microsoft'
        ELSE LEFT(t.description, 30)
      END as description_pattern,
      ABS(t.amount) as recurring_amount,
      COUNT(*) as frequency_count,
      COALESCE(c.name, 'Suscripciones') as category_name,
      MAX(t.date) as last_occurrence
    FROM transactions t
    LEFT JOIN categories c ON t.category_id = c.id
    WHERE t.user_id = p_user_id
      AND t.type = 'expense'
      AND t.date >= v_start_date
      AND ABS(t.amount) > 0
    GROUP BY description_pattern, ABS(t.amount), c.name
    HAVING COUNT(*) >= 2
    ORDER BY frequency_count DESC
    LIMIT 10
  ) recurring;

  -- 4. OPORTUNIDADES DE AHORRO (categorías con alto gasto que pueden reducirse)
  SELECT jsonb_agg(
    jsonb_build_object(
      'category', category_name,
      'current_monthly', current_monthly,
      'recommended_reduction', recommended_reduction,
      'estimated_saving', estimated_saving,
      'impact_level', impact_level
    ) ORDER BY estimated_saving DESC
  )
  INTO v_saving_opportunities
  FROM (
    SELECT 
      COALESCE(c.name, 'Sin categoría') as category_name,
      ROUND(SUM(ABS(t.amount)) / NULLIF(p_months_back, 0), 2) as current_monthly,
      CASE 
        WHEN SUM(ABS(t.amount)) / NULLIF(p_months_back, 0) > 50000 THEN 0.20
        WHEN SUM(ABS(t.amount)) / NULLIF(p_months_back, 0) > 20000 THEN 0.15
        ELSE 0.10
      END as recommended_reduction,
      ROUND(
        (SUM(ABS(t.amount)) / NULLIF(p_months_back, 0)) * 
        CASE 
          WHEN SUM(ABS(t.amount)) / NULLIF(p_months_back, 0) > 50000 THEN 0.20
          WHEN SUM(ABS(t.amount)) / NULLIF(p_months_back, 0) > 20000 THEN 0.15
          ELSE 0.10
        END, 2
      ) as estimated_saving,
      CASE 
        WHEN SUM(ABS(t.amount)) / NULLIF(p_months_back, 0) > 50000 THEN 'alto'
        WHEN SUM(ABS(t.amount)) / NULLIF(p_months_back, 0) > 20000 THEN 'medio'
        ELSE 'bajo'
      END as impact_level
    FROM transactions t
    LEFT JOIN categories c ON t.category_id = c.id
    WHERE t.user_id = p_user_id
      AND t.type = 'expense'
      AND t.date >= v_start_date
      AND ABS(t.amount) > 0
      AND COALESCE(c.name, 'Sin categoría') != 'Sin categoría'
    GROUP BY c.name
    HAVING SUM(ABS(t.amount)) / NULLIF(p_months_back, 0) > 10000
    ORDER BY estimated_saving DESC
    LIMIT 5
  ) opportunities;

  -- Construir resultado final
  v_result := jsonb_build_object(
    'top_categories', COALESCE(v_top_categories, '[]'::jsonb),
    'impulsive_expenses', COALESCE(v_impulsive_expenses, '[]'::jsonb),
    'recurring_services', COALESCE(v_recurring_services, '[]'::jsonb),
    'saving_opportunities', COALESCE(v_saving_opportunities, '[]'::jsonb),
    'analysis_period_months', p_months_back,
    'start_date', v_start_date
  );

  RETURN v_result;
END;
$$;

-- Comentario de la función
COMMENT ON FUNCTION get_spending_insights IS 'Analiza las transacciones reales del usuario y genera insights personalizados para el Simulador de Futuro. Retorna top categorías, gastos impulsivos, servicios recurrentes y oportunidades de ahorro basadas en datos reales.';

