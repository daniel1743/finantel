-- =====================================================
-- MIGRACIÓN: Corregir Cálculo de Revenue
-- =====================================================
-- CORRECCIÓN: Revenue debe contar solo pagos REALES procesados
-- NO transacciones manuales de usuarios
-- =====================================================

-- Actualizar función get_admin_metrics_overview para usar billing_payments
DROP FUNCTION IF EXISTS public.get_admin_metrics_overview(TEXT);
CREATE OR REPLACE FUNCTION public.get_admin_metrics_overview(
  p_period TEXT DEFAULT '7d'
)
RETURNS JSONB AS $$
DECLARE
  v_start_date TIMESTAMPTZ;
  v_prev_start_date TIMESTAMPTZ;
  v_result JSONB;
BEGIN
  -- Calcular fechas según período
  CASE p_period
    WHEN '1d' THEN
      v_start_date := NOW() - INTERVAL '1 day';
      v_prev_start_date := NOW() - INTERVAL '2 days';
    WHEN '7d' THEN
      v_start_date := NOW() - INTERVAL '7 days';
      v_prev_start_date := NOW() - INTERVAL '14 days';
    WHEN '30d' THEN
      v_start_date := NOW() - INTERVAL '30 days';
      v_prev_start_date := NOW() - INTERVAL '60 days';
    ELSE
      v_start_date := NOW() - INTERVAL '7 days';
      v_prev_start_date := NOW() - INTERVAL '14 days';
  END CASE;

  SELECT jsonb_build_object(
    'activeUsers', (
      SELECT COUNT(DISTINCT user_id)
      FROM public.user_sessions
      WHERE started_at >= v_start_date
        AND is_active = true
    ),
    'newSignups', (
      SELECT COUNT(*)
      FROM auth.users
      WHERE created_at >= v_start_date
    ),
    'newSignupsPrev', (
      SELECT COUNT(*)
      FROM auth.users
      WHERE created_at >= v_prev_start_date
        AND created_at < v_start_date
    ),
    'retention', (
      SELECT COALESCE(
        ROUND(
          (COUNT(DISTINCT CASE WHEN week2.user_id IS NOT NULL THEN week1.user_id END)::DECIMAL /
           NULLIF(COUNT(DISTINCT week1.user_id), 0)) * 100,
          2
        ),
        0
      )
      FROM (
        SELECT DISTINCT user_id
        FROM public.user_sessions
        WHERE started_at >= v_start_date - INTERVAL '7 days'
          AND started_at < v_start_date
      ) week1
      LEFT JOIN (
        SELECT DISTINCT user_id
        FROM public.user_sessions
        WHERE started_at >= v_start_date
      ) week2 ON week1.user_id = week2.user_id
    ),
    'revenue', (
      -- CORREGIDO: Revenue solo cuenta pagos REALES procesados (Mercado Pago, etc.)
      -- NO transacciones manuales de usuarios (salarios, ingresos personales, etc.)
      SELECT COALESCE(SUM(amount), 0)
      FROM public.billing_payments
      WHERE status = 'approved'
        AND paid_at >= v_start_date
        AND paid_at IS NOT NULL
    ),
    'revenuePrev', (
      -- Revenue del período anterior (solo pagos aprobados)
      SELECT COALESCE(SUM(amount), 0)
      FROM public.billing_payments
      WHERE status = 'approved'
        AND paid_at >= v_prev_start_date
        AND paid_at < v_start_date
        AND paid_at IS NOT NULL
    ),
    'conversionRate', (
      -- CORREGIDO: Tasa de conversión basada en pagos REALES, no transacciones manuales
      SELECT COALESCE(
        ROUND(
          (COUNT(DISTINCT CASE WHEN has_payment.user_id IS NOT NULL THEN signups.user_id END)::DECIMAL /
           NULLIF(COUNT(DISTINCT signups.user_id), 0)) * 100,
          2
        ),
        0
      )
      FROM (
        SELECT id as user_id
        FROM auth.users
        WHERE created_at >= v_start_date
      ) signups
      LEFT JOIN (
        SELECT DISTINCT user_id
        FROM public.billing_payments
        WHERE status = 'approved'
          AND paid_at >= v_start_date
          AND paid_at IS NOT NULL
      ) has_payment ON signups.user_id = has_payment.user_id
    ),
    'churnRate', (
      SELECT COALESCE(
        ROUND(
          (COUNT(DISTINCT churned.user_id)::DECIMAL /
           NULLIF(COUNT(DISTINCT all_users.user_id), 0)) * 100,
          2
        ),
        0
      )
      FROM (
        SELECT id as user_id
        FROM auth.users
        WHERE created_at < v_start_date
      ) all_users
      LEFT JOIN (
        SELECT DISTINCT user_id
        FROM public.user_sessions
        WHERE started_at < v_start_date - INTERVAL '30 days'
          AND NOT EXISTS (
            SELECT 1
            FROM public.user_sessions s2
            WHERE s2.user_id = user_sessions.user_id
              AND s2.started_at >= v_start_date - INTERVAL '30 days'
          )
      ) churned ON all_users.user_id = churned.user_id
    )
  ) INTO v_result;

  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Actualizar función get_conversion_funnel para usar billing_payments
DROP FUNCTION IF EXISTS public.get_conversion_funnel(TIMESTAMPTZ, TIMESTAMPTZ);
CREATE OR REPLACE FUNCTION public.get_conversion_funnel(
  p_start_date TIMESTAMPTZ DEFAULT NOW() - INTERVAL '30 days',
  p_end_date TIMESTAMPTZ DEFAULT NOW()
)
RETURNS JSONB AS $$
DECLARE
  v_result JSONB;
  v_landing_visits INTEGER;
  v_signup_clicks INTEGER;
  v_email_verified INTEGER;
  v_first_budget INTEGER;
  v_first_payment INTEGER;
  v_second_payment INTEGER;
BEGIN
  -- Landing visits
  SELECT COUNT(DISTINCT session_id)
  INTO v_landing_visits
  FROM public.landing_analytics
  WHERE created_at >= p_start_date
    AND created_at <= p_end_date;

  -- Sign-up clicks (usuarios que se registraron)
  SELECT COUNT(*)
  INTO v_signup_clicks
  FROM auth.users
  WHERE created_at >= p_start_date
    AND created_at <= p_end_date;

  -- Email verified (usuarios con email verificado)
  SELECT COUNT(*)
  INTO v_email_verified
  FROM auth.users
  WHERE created_at >= p_start_date
    AND created_at <= p_end_date
    AND email_confirmed_at IS NOT NULL;

  -- First budget created
  SELECT COUNT(DISTINCT user_id)
  INTO v_first_budget
  FROM public.budgets
  WHERE created_at >= p_start_date
    AND created_at <= p_end_date;

  -- CORREGIDO: First payment (pago real procesado, NO transacción manual)
  SELECT COUNT(DISTINCT user_id)
  INTO v_first_payment
  FROM public.billing_payments
  WHERE status = 'approved'
    AND paid_at >= p_start_date
    AND paid_at <= p_end_date
    AND paid_at IS NOT NULL;

  -- CORREGIDO: Second payment (usuarios con al menos 2 pagos reales procesados)
  SELECT COUNT(DISTINCT user_id)
  INTO v_second_payment
  FROM (
    SELECT user_id
    FROM public.billing_payments
    WHERE status = 'approved'
      AND paid_at >= p_start_date
      AND paid_at <= p_end_date
      AND paid_at IS NOT NULL
    GROUP BY user_id
    HAVING COUNT(*) >= 2
  ) users_with_multiple_payments;

  SELECT jsonb_build_object(
    'steps', jsonb_build_array(
      jsonb_build_object(
        'step', 1,
        'name', 'Landing Page Visit',
        'count', v_landing_visits,
        'conversionRate', 100.0
      ),
      jsonb_build_object(
        'step', 2,
        'name', 'Sign-up Click',
        'count', v_signup_clicks,
        'conversionRate', CASE WHEN v_landing_visits > 0 THEN ROUND((v_signup_clicks::DECIMAL / v_landing_visits) * 100, 2) ELSE 0 END
      ),
      jsonb_build_object(
        'step', 3,
        'name', 'Email Verification',
        'count', v_email_verified,
        'conversionRate', CASE WHEN v_signup_clicks > 0 THEN ROUND((v_email_verified::DECIMAL / v_signup_clicks) * 100, 2) ELSE 0 END
      ),
      jsonb_build_object(
        'step', 4,
        'name', 'First Budget Created',
        'count', v_first_budget,
        'conversionRate', CASE WHEN v_email_verified > 0 THEN ROUND((v_first_budget::DECIMAL / v_email_verified) * 100, 2) ELSE 0 END
      ),
      jsonb_build_object(
        'step', 5,
        'name', 'First Payment',
        'count', v_first_payment,
        'conversionRate', CASE WHEN v_first_budget > 0 THEN ROUND((v_first_payment::DECIMAL / v_first_budget) * 100, 2) ELSE 0 END
      ),
      jsonb_build_object(
        'step', 6,
        'name', 'Second Payment',
        'count', v_second_payment,
        'conversionRate', CASE WHEN v_first_payment > 0 THEN ROUND((v_second_payment::DECIMAL / v_first_payment) * 100, 2) ELSE 0 END
      )
    )
  ) INTO v_result;

  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

