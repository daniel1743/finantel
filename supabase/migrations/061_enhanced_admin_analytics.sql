-- =====================================================
-- MIGRACIÓN: Funciones Avanzadas para Admin Dashboard
-- =====================================================
-- Agrega funciones para:
-- - Funnel de conversión
-- - Health Score
-- - Comparación temporal
-- - Segmentación de usuarios
-- - Métricas financieras globales
-- - Comportamiento y tendencias
-- - Sistema de notificaciones globales
-- =====================================================

-- =====================================================
-- 1. TABLA: NOTIFICACIONES GLOBALES
-- =====================================================
CREATE TABLE IF NOT EXISTS public.global_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('info', 'warning', 'success', 'error')),
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  target_audience TEXT DEFAULT 'all' CHECK (target_audience IN ('all', 'registered', 'active', 'premium')),
  is_active BOOLEAN DEFAULT true,
  expires_at TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_global_notifications_active ON public.global_notifications(is_active, expires_at);
CREATE INDEX IF NOT EXISTS idx_global_notifications_created_at ON public.global_notifications(created_at DESC);

-- RLS para notificaciones globales
ALTER TABLE public.global_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage global notifications"
  ON public.global_notifications
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profile_preferences
      WHERE user_id = auth.uid() AND is_staff = true
    )
  );

CREATE POLICY "Users can view active notifications"
  ON public.global_notifications
  FOR SELECT
  USING (
    is_active = true
    AND (expires_at IS NULL OR expires_at > NOW())
  );

-- =====================================================
-- 2. FUNCIÓN: FUNNEL DE CONVERSIÓN
-- =====================================================
CREATE OR REPLACE FUNCTION public.get_conversion_funnel(
  start_date TIMESTAMPTZ DEFAULT NOW() - INTERVAL '30 days',
  end_date TIMESTAMPTZ DEFAULT NOW()
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSON;
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.profile_preferences
    WHERE user_id = auth.uid() AND is_staff = true
  ) THEN
    RAISE EXCEPTION 'Access denied. Admin only.';
  END IF;

  SELECT json_build_object(
    'landing_visitors', (
      SELECT COUNT(DISTINCT session_id)
      FROM public.analytics_page_views
      WHERE page_path = '/' AND created_at BETWEEN start_date AND end_date
    ),
    'registered_users', (
      SELECT COUNT(DISTINCT user_id)
      FROM public.analytics_events
      WHERE event_type = 'signup' AND created_at BETWEEN start_date AND end_date
    ),
    'logged_in_users', (
      SELECT COUNT(DISTINCT user_id)
      FROM public.analytics_events
      WHERE event_type = 'login' AND created_at BETWEEN start_date AND end_date
    ),
    'active_users', (
      SELECT COUNT(DISTINCT user_id)
      FROM public.analytics_tool_usage
      WHERE created_at BETWEEN start_date AND end_date
    ),
    'power_users', (
      SELECT COUNT(DISTINCT user_id)
      FROM public.analytics_tool_usage
      WHERE created_at BETWEEN start_date AND end_date
      GROUP BY user_id
      HAVING COUNT(*) >= 10
    )
  ) INTO result;

  RETURN result;
END;
$$;

-- =====================================================
-- 3. FUNCIÓN: HEALTH SCORE
-- =====================================================
CREATE OR REPLACE FUNCTION public.get_platform_health_score(
  start_date TIMESTAMPTZ DEFAULT NOW() - INTERVAL '7 days',
  end_date TIMESTAMPTZ DEFAULT NOW()
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSON;
  error_rate DECIMAL;
  avg_response_time DECIMAL;
  user_growth DECIMAL;
  retention_rate DECIMAL;
  health_score INTEGER;
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.profile_preferences
    WHERE user_id = auth.uid() AND is_staff = true
  ) THEN
    RAISE EXCEPTION 'Access denied. Admin only.';
  END IF;

  -- Tasa de errores (0-100, menor es mejor)
  SELECT COALESCE(
    (SELECT COUNT(*)::DECIMAL FROM public.analytics_events
     WHERE event_type = 'error' AND created_at BETWEEN start_date AND end_date) /
    NULLIF((SELECT COUNT(*) FROM public.analytics_events
            WHERE created_at BETWEEN start_date AND end_date), 0) * 100,
    0
  ) INTO error_rate;

  -- Tasa de retención (0-100, mayor es mejor)
  SELECT COALESCE(
    (SELECT COUNT(DISTINCT user_id)::DECIMAL
     FROM public.analytics_tool_usage
     WHERE created_at BETWEEN start_date AND end_date
       AND user_id IN (
         SELECT DISTINCT user_id
         FROM public.analytics_tool_usage
         WHERE created_at BETWEEN start_date - INTERVAL '30 days' AND start_date
       )) /
    NULLIF((SELECT COUNT(DISTINCT user_id)
             FROM public.analytics_tool_usage
             WHERE created_at BETWEEN start_date - INTERVAL '30 days' AND start_date), 0) * 100,
    0
  ) INTO retention_rate;

  -- Crecimiento de usuarios (porcentaje, puede ser negativo)
  WITH current_period AS (
    SELECT COUNT(DISTINCT user_id) as count
    FROM public.analytics_events
    WHERE event_type = 'signup' AND created_at BETWEEN start_date AND end_date
  ),
  previous_period AS (
    SELECT COUNT(DISTINCT user_id) as count
    FROM public.analytics_events
    WHERE event_type = 'signup'
      AND created_at BETWEEN start_date - (end_date - start_date) AND start_date
  )
  SELECT COALESCE(
    ((SELECT count FROM current_period) - (SELECT count FROM previous_period))::DECIMAL /
    NULLIF((SELECT count FROM previous_period), 0) * 100,
    0
  ) INTO user_growth;

  -- Calcular Health Score (0-100)
  health_score := GREATEST(0, LEAST(100,
    100 - (error_rate * 0.3) + (retention_rate * 0.4) + (GREATEST(0, user_growth) * 0.3)
  ))::INTEGER;

  SELECT json_build_object(
    'health_score', health_score,
    'error_rate', ROUND(error_rate, 2),
    'retention_rate', ROUND(retention_rate, 2),
    'user_growth', ROUND(user_growth, 2),
    'status', CASE
      WHEN health_score >= 80 THEN 'excellent'
      WHEN health_score >= 60 THEN 'good'
      WHEN health_score >= 40 THEN 'warning'
      ELSE 'critical'
    END
  ) INTO result;

  RETURN result;
END;
$$;

-- =====================================================
-- 4. FUNCIÓN: COMPARACIÓN TEMPORAL
-- =====================================================
CREATE OR REPLACE FUNCTION public.get_temporal_comparison(
  current_start TIMESTAMPTZ,
  current_end TIMESTAMPTZ
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSON;
  period_duration INTERVAL;
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.profile_preferences
    WHERE user_id = auth.uid() AND is_staff = true
  ) THEN
    RAISE EXCEPTION 'Access denied. Admin only.';
  END IF;

  period_duration := current_end - current_start;
  
  SELECT json_build_object(
    'current', (
      SELECT json_build_object(
        'landing_visitors', COUNT(DISTINCT session_id),
        'registered_users', (
          SELECT COUNT(DISTINCT user_id)
          FROM public.analytics_events
          WHERE event_type = 'signup' AND created_at BETWEEN current_start AND current_end
        ),
        'active_users', (
          SELECT COUNT(DISTINCT user_id)
          FROM public.analytics_tool_usage
          WHERE created_at BETWEEN current_start AND current_end
        ),
        'total_transactions', (
          SELECT COUNT(*)
          FROM public.transactions
          WHERE created_at BETWEEN current_start AND current_end
        ),
        'total_revenue', (
          SELECT COALESCE(SUM(amount), 0)
          FROM public.transactions
          WHERE type = 'income' AND created_at BETWEEN current_start AND current_end
        )
      )
      FROM public.analytics_page_views
      WHERE page_path = '/' AND created_at BETWEEN current_start AND current_end
    ),
    'previous', (
      SELECT json_build_object(
        'landing_visitors', COUNT(DISTINCT session_id),
        'registered_users', (
          SELECT COUNT(DISTINCT user_id)
          FROM public.analytics_events
          WHERE event_type = 'signup'
            AND created_at BETWEEN current_start - period_duration AND current_start
        ),
        'active_users', (
          SELECT COUNT(DISTINCT user_id)
          FROM public.analytics_tool_usage
          WHERE created_at BETWEEN current_start - period_duration AND current_start
        ),
        'total_transactions', (
          SELECT COUNT(*)
          FROM public.transactions
          WHERE created_at BETWEEN current_start - period_duration AND current_start
        ),
        'total_revenue', (
          SELECT COALESCE(SUM(amount), 0)
          FROM public.transactions
          WHERE type = 'income'
            AND created_at BETWEEN current_start - period_duration AND current_start
        )
      )
      FROM public.analytics_page_views
      WHERE page_path = '/' AND created_at BETWEEN current_start - period_duration AND current_start
    )
  ) INTO result;

  RETURN result;
END;
$$;

-- =====================================================
-- 5. FUNCIÓN: SEGMENTACIÓN DE USUARIOS
-- =====================================================
CREATE OR REPLACE FUNCTION public.get_user_segmentation(
  start_date TIMESTAMPTZ DEFAULT NOW() - INTERVAL '30 days',
  end_date TIMESTAMPTZ DEFAULT NOW()
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSON;
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.profile_preferences
    WHERE user_id = auth.uid() AND is_staff = true
  ) THEN
    RAISE EXCEPTION 'Access denied. Admin only.';
  END IF;

  SELECT json_build_object(
    'power_users', (
      SELECT COUNT(DISTINCT user_id)
      FROM public.analytics_tool_usage
      WHERE created_at BETWEEN start_date AND end_date
      GROUP BY user_id
      HAVING COUNT(*) >= 20
    ),
    'active_users', (
      SELECT COUNT(DISTINCT user_id)
      FROM public.analytics_tool_usage
      WHERE created_at BETWEEN start_date AND end_date
      GROUP BY user_id
      HAVING COUNT(*) BETWEEN 5 AND 19
    ),
    'casual_users', (
      SELECT COUNT(DISTINCT user_id)
      FROM public.analytics_tool_usage
      WHERE created_at BETWEEN start_date AND end_date
      GROUP BY user_id
      HAVING COUNT(*) BETWEEN 1 AND 4
    ),
    'inactive_users', (
      SELECT COUNT(DISTINCT u.id)
      FROM auth.users u
      WHERE u.created_at < end_date
        AND u.id NOT IN (
          SELECT DISTINCT user_id
          FROM public.analytics_tool_usage
          WHERE created_at BETWEEN start_date AND end_date
        )
    ),
    'at_risk_users', (
      SELECT COUNT(DISTINCT user_id)
      FROM public.analytics_tool_usage
      WHERE created_at BETWEEN start_date - INTERVAL '60 days' AND start_date
        AND user_id NOT IN (
          SELECT DISTINCT user_id
          FROM public.analytics_tool_usage
          WHERE created_at BETWEEN start_date AND end_date
        )
    )
  ) INTO result;

  RETURN result;
END;
$$;

-- =====================================================
-- 6. FUNCIÓN: MÉTRICAS FINANCIERAS GLOBALES
-- =====================================================
CREATE OR REPLACE FUNCTION public.get_global_financial_metrics(
  start_date TIMESTAMPTZ DEFAULT NOW() - INTERVAL '30 days',
  end_date TIMESTAMPTZ DEFAULT NOW()
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSON;
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.profile_preferences
    WHERE user_id = auth.uid() AND is_staff = true
  ) THEN
    RAISE EXCEPTION 'Access denied. Admin only.';
  END IF;

  SELECT json_build_object(
    'total_income', (
      SELECT COALESCE(SUM(amount), 0)
      FROM public.transactions
      WHERE type = 'income' AND created_at BETWEEN start_date AND end_date
    ),
    'total_expenses', (
      SELECT COALESCE(SUM(amount), 0)
      FROM public.transactions
      WHERE type = 'expense' AND created_at BETWEEN start_date AND end_date
    ),
    'total_savings', (
      SELECT COALESCE(SUM(amount), 0)
      FROM public.transactions
      WHERE type = 'income' AND created_at BETWEEN start_date AND end_date
    ) - (
      SELECT COALESCE(SUM(amount), 0)
      FROM public.transactions
      WHERE type = 'expense' AND created_at BETWEEN start_date AND end_date
    ),
    'avg_income_per_user', (
      SELECT COALESCE(AVG(user_income), 0)
      FROM (
        SELECT user_id, SUM(amount) as user_income
        FROM public.transactions
        WHERE type = 'income' AND created_at BETWEEN start_date AND end_date
        GROUP BY user_id
      ) sub
    ),
    'avg_expense_per_user', (
      SELECT COALESCE(AVG(user_expense), 0)
      FROM (
        SELECT user_id, SUM(amount) as user_expense
        FROM public.transactions
        WHERE type = 'expense' AND created_at BETWEEN start_date AND end_date
        GROUP BY user_id
      ) sub
    ),
    'category_breakdown', (
      SELECT json_agg(
        json_build_object(
          'category_name', c.name,
          'total_amount', SUM(t.amount),
          'transaction_count', COUNT(*)
        )
      )
      FROM public.transactions t
      JOIN public.categories c ON t.category_id = c.id
      WHERE t.type = 'expense'
        AND t.created_at BETWEEN start_date AND end_date
      GROUP BY c.id, c.name
      ORDER BY SUM(t.amount) DESC
      LIMIT 10
    )
  ) INTO result;

  RETURN result;
END;
$$;

-- =====================================================
-- 7. FUNCIÓN: COMPORTAMIENTO Y TENDENCIAS
-- =====================================================
CREATE OR REPLACE FUNCTION public.get_behavior_trends(
  start_date TIMESTAMPTZ DEFAULT NOW() - INTERVAL '30 days',
  end_date TIMESTAMPTZ DEFAULT NOW()
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSON;
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.profile_preferences
    WHERE user_id = auth.uid() AND is_staff = true
  ) THEN
    RAISE EXCEPTION 'Access denied. Admin only.';
  END IF;

  SELECT json_build_object(
    'peak_hours', (
      SELECT json_agg(
        json_build_object(
          'hour', hour,
          'activity_count', activity_count
        )
        ORDER BY activity_count DESC
      )
      FROM (
        SELECT EXTRACT(HOUR FROM created_at)::INTEGER as hour, COUNT(*) as activity_count
        FROM public.analytics_tool_usage
        WHERE created_at BETWEEN start_date AND end_date
        GROUP BY EXTRACT(HOUR FROM created_at)
        ORDER BY activity_count DESC
        LIMIT 24
      ) h
    ),
    'device_breakdown', (
      SELECT json_build_object(
        'mobile', COUNT(*) FILTER (WHERE user_agent ILIKE '%mobile%' OR user_agent ILIKE '%android%' OR user_agent ILIKE '%iphone%'),
        'desktop', COUNT(*) FILTER (WHERE user_agent NOT ILIKE '%mobile%' AND user_agent NOT ILIKE '%android%' AND user_agent NOT ILIKE '%iphone%'),
        'tablet', COUNT(*) FILTER (WHERE user_agent ILIKE '%tablet%' OR user_agent ILIKE '%ipad%')
      )
      FROM public.analytics_sessions
      WHERE started_at BETWEEN start_date AND end_date
    ),
    'daily_activity', (
      SELECT json_agg(
        json_build_object(
          'date', date_trunc('day', created_at)::DATE,
          'activity_count', COUNT(*)
        )
        ORDER BY date_trunc('day', created_at)
      )
      FROM public.analytics_tool_usage
      WHERE created_at BETWEEN start_date AND end_date
      GROUP BY date_trunc('day', created_at)
    )
  ) INTO result;

  RETURN result;
END;
$$;

-- =====================================================
-- 8. FUNCIÓN: ALERTAS INTELIGENTES
-- =====================================================
CREATE OR REPLACE FUNCTION public.get_smart_alerts(
  start_date TIMESTAMPTZ DEFAULT NOW() - INTERVAL '7 days',
  end_date TIMESTAMPTZ DEFAULT NOW()
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSON;
  previous_start TIMESTAMPTZ;
  previous_end TIMESTAMPTZ;
  period_duration INTERVAL;
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.profile_preferences
    WHERE user_id = auth.uid() AND is_staff = true
  ) THEN
    RAISE EXCEPTION 'Access denied. Admin only.';
  END IF;

  period_duration := end_date - start_date;
  previous_start := start_date - period_duration;
  previous_end := start_date;

  SELECT json_build_object(
    'alerts', (
      SELECT json_agg(alert)
      FROM (
        -- Alerta: Baja de usuarios
        SELECT json_build_object(
          'type', 'warning',
          'title', 'Baja de usuarios esta semana',
          'message', 'Los usuarios activos han disminuido en un ' || 
            ROUND(((current_count - previous_count)::DECIMAL / NULLIF(previous_count, 0) * 100), 1) || '%',
          'severity', CASE
            WHEN ((current_count - previous_count)::DECIMAL / NULLIF(previous_count, 0) * 100) < -20 THEN 'high'
            WHEN ((current_count - previous_count)::DECIMAL / NULLIF(previous_count, 0) * 100) < -10 THEN 'medium'
            ELSE 'low'
          END
        ) as alert
        FROM (
          SELECT
            (SELECT COUNT(DISTINCT user_id) FROM public.analytics_tool_usage
             WHERE created_at BETWEEN start_date AND end_date) as current_count,
            (SELECT COUNT(DISTINCT user_id) FROM public.analytics_tool_usage
             WHERE created_at BETWEEN previous_start AND previous_end) as previous_count
        ) counts
        WHERE previous_count > 0
          AND ((current_count - previous_count)::DECIMAL / previous_count * 100) < -5
      ) alerts
    )
  ) INTO result;

  RETURN result;
END;
$$;

-- =====================================================
-- 9. FUNCIÓN: SUGERENCIAS DE IA
-- =====================================================
CREATE OR REPLACE FUNCTION public.get_ai_suggestions(
  start_date TIMESTAMPTZ DEFAULT NOW() - INTERVAL '30 days',
  end_date TIMESTAMPTZ DEFAULT NOW()
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSON;
  peak_hour INTEGER;
  avg_retention DECIMAL;
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.profile_preferences
    WHERE user_id = auth.uid() AND is_staff = true
  ) THEN
    RAISE EXCEPTION 'Access denied. Admin only.';
  END IF;

  -- Obtener hora pico
  SELECT EXTRACT(HOUR FROM created_at)::INTEGER INTO peak_hour
  FROM public.analytics_tool_usage
  WHERE created_at BETWEEN start_date AND end_date
  GROUP BY EXTRACT(HOUR FROM created_at)
  ORDER BY COUNT(*) DESC
  LIMIT 1;

  -- Calcular retención promedio
  SELECT COALESCE(
    (SELECT COUNT(DISTINCT user_id)::DECIMAL
     FROM public.analytics_tool_usage
     WHERE created_at BETWEEN start_date AND end_date
       AND user_id IN (
         SELECT DISTINCT user_id
         FROM public.analytics_tool_usage
         WHERE created_at BETWEEN start_date - INTERVAL '30 days' AND start_date
       )) /
    NULLIF((SELECT COUNT(DISTINCT user_id)
             FROM public.analytics_tool_usage
             WHERE created_at BETWEEN start_date - INTERVAL '30 days' AND start_date), 0) * 100,
    0
  ) INTO avg_retention;

  SELECT json_build_object(
    'suggestions', (
      SELECT json_agg(suggestion)
      FROM (
        SELECT json_build_object(
          'type', 'notification_timing',
          'title', 'Optimizar horario de notificaciones',
          'message', 'Los usuarios son más activos a las ' || peak_hour || ':00. Considera enviar notificaciones push a esta hora para maximizar el engagement.',
          'priority', 'medium'
        ) as suggestion
        WHERE peak_hour IS NOT NULL
        UNION ALL
        SELECT json_build_object(
          'type', 'retention',
          'title', 'Mejorar retención',
          'message', 'La retención actual es del ' || ROUND(avg_retention, 1) || '%. Considera implementar un programa de onboarding más robusto o campañas de re-engagement.',
          'priority', CASE
            WHEN avg_retention < 50 THEN 'high'
            WHEN avg_retention < 70 THEN 'medium'
            ELSE 'low'
          END
        ) as suggestion
        WHERE avg_retention < 80
      ) suggestions
    )
  ) INTO result;

  RETURN result;
END;
$$;

