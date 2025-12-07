-- =====================================================
-- MIGRACIÓN: Corregir errores en funciones de Admin Analytics
-- =====================================================
-- Errores corregidos:
-- 1. Funciones agregadas anidadas en get_impressions_stats y get_landing_analytics
-- 2. Conflicto de sobrecarga en get_tool_usage_stats
-- 3. Error de audit_logs con trigger log_audit (column table_name does not exist)
-- 4. Verificar que todas las funciones existan correctamente
-- =====================================================

-- =====================================================
-- 1. CORREGIR get_impressions_stats
-- =====================================================
-- Error: "aggregate function calls cannot be nested"
-- Solución: Usar subconsulta para separar las agregaciones

DROP FUNCTION IF EXISTS public.get_impressions_stats(TIMESTAMPTZ, TIMESTAMPTZ);
CREATE OR REPLACE FUNCTION public.get_impressions_stats(
  p_start_date TIMESTAMPTZ DEFAULT NOW() - INTERVAL '30 days',
  p_end_date TIMESTAMPTZ DEFAULT NOW()
)
RETURNS JSONB AS $$
DECLARE
  v_result JSONB;
  v_breakdown JSONB;
BEGIN
  -- Calcular breakdown por separado para evitar funciones agregadas anidadas
  SELECT COALESCE(jsonb_object_agg(source_detail, count), '{}'::jsonb)
  INTO v_breakdown
  FROM (
    SELECT 
      COALESCE(source_detail, 'unknown') as source_detail,
      COUNT(*) as count
    FROM public.impressions
    WHERE created_at >= p_start_date
      AND created_at <= p_end_date
    GROUP BY source_detail
  ) breakdown_stats;

  -- Construir el resultado con el breakdown pre-calculado
  SELECT jsonb_build_object(
    'searchEngines', (
      SELECT COUNT(*)
      FROM public.impressions
      WHERE source = 'search_engine'
        AND created_at >= p_start_date
        AND created_at <= p_end_date
    ),
    'browsers', (
      SELECT COUNT(*)
      FROM public.impressions
      WHERE source = 'browser'
        AND created_at >= p_start_date
        AND created_at <= p_end_date
    ),
    'total', (
      SELECT COUNT(*)
      FROM public.impressions
      WHERE created_at >= p_start_date
        AND created_at <= p_end_date
    ),
    'breakdown', COALESCE(v_breakdown, '{}'::jsonb)
  ) INTO v_result;

  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 2. CORREGIR get_landing_analytics
-- =====================================================
-- Error: "aggregate function calls cannot be nested"
-- Solución: Usar subconsulta para separar las agregaciones

DROP FUNCTION IF EXISTS public.get_landing_analytics(TIMESTAMPTZ, TIMESTAMPTZ);
CREATE OR REPLACE FUNCTION public.get_landing_analytics(
  p_start_date TIMESTAMPTZ DEFAULT NOW() - INTERVAL '30 days',
  p_end_date TIMESTAMPTZ DEFAULT NOW()
)
RETURNS JSONB AS $$
DECLARE
  v_result JSONB;
  v_sections JSONB;
  v_total_views INTEGER;
BEGIN
  -- Calcular total de vistas primero
  SELECT COUNT(*) INTO v_total_views
  FROM public.landing_analytics
  WHERE created_at >= p_start_date
    AND created_at <= p_end_date;

  -- Calcular sections por separado para evitar funciones agregadas anidadas
  SELECT COALESCE(jsonb_object_agg(
    section_viewed,
    jsonb_build_object(
      'views', views,
      'percentage', CASE 
        WHEN v_total_views > 0 THEN ROUND((views::DECIMAL / v_total_views) * 100, 2)
        ELSE 0
      END,
      'avgTime', avg_time
    )
  ), '{}'::jsonb)
  INTO v_sections
  FROM (
    SELECT 
      section_viewed,
      COUNT(*) as views,
      COALESCE(ROUND(AVG(time_spent)::numeric, 2), 0) as avg_time
    FROM public.landing_analytics
    WHERE created_at >= p_start_date
      AND created_at <= p_end_date
    GROUP BY section_viewed
  ) section_stats;

  -- Construir el resultado con sections pre-calculadas
  SELECT jsonb_build_object(
    'totalVisitors', (
      SELECT COUNT(DISTINCT session_id)
      FROM public.landing_analytics
      WHERE created_at >= p_start_date
        AND created_at <= p_end_date
    ),
    'totalViews', v_total_views,
    'avgTimeOnPage', (
      SELECT COALESCE(ROUND(AVG(time_spent)::numeric, 2), 0)
      FROM public.landing_analytics
      WHERE created_at >= p_start_date
        AND created_at <= p_end_date
        AND time_spent IS NOT NULL
    ),
    'bounceRate', (
      SELECT COALESCE(
        ROUND(
          (COUNT(DISTINCT CASE WHEN section_count = 1 THEN session_id END)::DECIMAL /
           NULLIF(COUNT(DISTINCT session_id), 0)) * 100,
          2
        ),
        0
      )
      FROM (
        SELECT session_id, COUNT(*) as section_count
        FROM public.landing_analytics
        WHERE created_at >= p_start_date
          AND created_at <= p_end_date
        GROUP BY session_id
      ) sessions
    ),
    'sections', COALESCE(v_sections, '{}'::jsonb),
    'conversions', (
      SELECT COUNT(DISTINCT session_id)
      FROM public.landing_analytics
      WHERE created_at >= p_start_date
        AND created_at <= p_end_date
        AND converted = true
    )
  ) INTO v_result;

  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 3. CORREGIR get_tool_usage_stats (eliminar sobrecarga)
-- =====================================================
-- Error: "Could not choose the best candidate function"
-- Solución: Eliminar la función sin parámetros y dejar solo la versión con parámetros opcionales

DROP FUNCTION IF EXISTS public.get_tool_usage_stats();
DROP FUNCTION IF EXISTS public.get_tool_usage_stats(TIMESTAMPTZ, TIMESTAMPTZ);
CREATE OR REPLACE FUNCTION public.get_tool_usage_stats(
  p_start_date TIMESTAMPTZ DEFAULT NULL,
  p_end_date TIMESTAMPTZ DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  v_result JSONB;
  v_query TEXT;
BEGIN
  -- Construir query dinámico basado en parámetros
  IF p_start_date IS NULL AND p_end_date IS NULL THEN
    -- Sin filtros de fecha (comportamiento original)
    SELECT jsonb_agg(
      jsonb_build_object(
        'toolName', tool_name,
        'totalUsers', COUNT(DISTINCT user_id),
        'totalUsage', SUM(usage_count),
        'avgUsagePerUser', ROUND(AVG(usage_count)::numeric, 2),
        'lastUsed', MAX(last_used_at)
      )
      ORDER BY COUNT(DISTINCT user_id) DESC
    )
    INTO v_result
    FROM public.tool_usage
    GROUP BY tool_name;
  ELSE
    -- Con filtros de fecha
    SELECT jsonb_agg(
      jsonb_build_object(
        'toolName', tool_name,
        'totalUsers', COUNT(DISTINCT user_id),
        'totalUsage', SUM(usage_count),
        'avgUsagePerUser', ROUND(AVG(usage_count)::numeric, 2),
        'lastUsed', MAX(last_used_at)
      )
      ORDER BY COUNT(DISTINCT user_id) DESC
    )
    INTO v_result
    FROM public.tool_usage
    WHERE (p_start_date IS NULL OR last_used_at >= p_start_date)
      AND (p_end_date IS NULL OR last_used_at <= p_end_date)
    GROUP BY tool_name;
  END IF;

  RETURN COALESCE(v_result, '[]'::jsonb);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 4. CORREGIR trigger log_audit para compatibilidad con nueva estructura de audit_logs
-- =====================================================
-- Error: "column table_name of relation audit_logs does not exist"
-- Solución: Eliminar triggers antiguos que usan la estructura antigua de audit_logs

-- Verificar estructura de audit_logs y eliminar triggers incompatibles
DO $$
BEGIN
  -- Si la tabla audit_logs tiene la estructura nueva (con event_type), eliminar triggers antiguos
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'audit_logs' 
      AND column_name = 'event_type'
  ) THEN
    -- Estructura nueva: eliminar triggers antiguos que intentan usar table_name
    RAISE NOTICE 'Tabla audit_logs tiene estructura nueva (con event_type). Eliminando triggers antiguos.';
    
    -- Eliminar triggers antiguos que usan table_name
    DROP TRIGGER IF EXISTS audit_categories ON public.categories;
    DROP TRIGGER IF EXISTS audit_budgets ON public.budgets;
    DROP TRIGGER IF EXISTS audit_transactions ON public.transactions;
    DROP TRIGGER IF EXISTS audit_goals ON public.goals;
    DROP TRIGGER IF EXISTS audit_shared_expenses ON public.shared_expenses;
    
    -- Eliminar función log_audit antigua si existe
    DROP FUNCTION IF EXISTS public.log_audit() CASCADE;
  ELSIF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'audit_logs' 
      AND column_name = 'table_name'
  ) THEN
    -- Si no tiene ninguna de las estructuras, también eliminar triggers por seguridad
    RAISE NOTICE 'Tabla audit_logs no tiene estructura conocida. Eliminando triggers antiguos por seguridad.';
    
    DROP TRIGGER IF EXISTS audit_categories ON public.categories;
    DROP TRIGGER IF EXISTS audit_budgets ON public.budgets;
    DROP TRIGGER IF EXISTS audit_transactions ON public.transactions;
    DROP TRIGGER IF EXISTS audit_goals ON public.goals;
    DROP TRIGGER IF EXISTS audit_shared_expenses ON public.shared_expenses;
    DROP FUNCTION IF EXISTS public.log_audit() CASCADE;
  ELSE
    RAISE NOTICE 'Tabla audit_logs tiene estructura antigua (con table_name). Triggers antiguos pueden funcionar.';
  END IF;
END $$;

-- =====================================================
-- 5. VERIFICAR/CREAR get_engagement_metrics_detailed
-- =====================================================
-- Asegurar que la función exista correctamente

DROP FUNCTION IF EXISTS public.get_engagement_metrics_detailed(TEXT);
CREATE OR REPLACE FUNCTION public.get_engagement_metrics_detailed(
  p_period TEXT DEFAULT '7d'
)
RETURNS JSONB AS $$
DECLARE
  v_start_date TIMESTAMPTZ;
  v_result JSONB;
BEGIN
  -- Calcular fecha según período
  CASE p_period
    WHEN '1d' THEN v_start_date := NOW() - INTERVAL '1 day';
    WHEN '7d' THEN v_start_date := NOW() - INTERVAL '7 days';
    WHEN '30d' THEN v_start_date := NOW() - INTERVAL '30 days';
    ELSE v_start_date := NOW() - INTERVAL '7 days';
  END CASE;

  SELECT jsonb_build_object(
    'anonymousVisitors', (
      SELECT COUNT(DISTINCT session_id)
      FROM public.landing_analytics
      WHERE created_at >= v_start_date
        AND user_id IS NULL
    ),
    'peakHour', (
      SELECT TO_CHAR(hour_visit, 'HH24:00')
      FROM (
        SELECT DATE_TRUNC('hour', created_at) as hour_visit, COUNT(*) as visit_count
        FROM public.landing_analytics
        WHERE created_at >= v_start_date
        GROUP BY DATE_TRUNC('hour', created_at)
        ORDER BY visit_count DESC
        LIMIT 1
      ) peak
    ),
    'aiInteractions', (
      SELECT COUNT(*)
      FROM public.user_events
      WHERE event_type = 'ai_message'
        AND created_at >= v_start_date
    ),
    'aiSatisfied', (
      SELECT COUNT(*)
      FROM public.user_events
      WHERE event_type = 'ai_feedback'
        AND event_data->>'satisfaction' = 'positive'
        AND created_at >= v_start_date
    ),
    'aiDissatisfied', (
      SELECT COUNT(*)
      FROM public.user_events
      WHERE event_type = 'ai_feedback'
        AND event_data->>'satisfaction' = 'negative'
        AND created_at >= v_start_date
    ),
    'aiSatisfaction', (
      SELECT COALESCE(
        ROUND(
          (COUNT(CASE WHEN event_data->>'satisfaction' = 'positive' THEN 1 END)::DECIMAL /
           NULLIF(COUNT(*), 0)) * 100,
          2
        ),
        0
      )
      FROM public.user_events
      WHERE event_type = 'ai_feedback'
        AND created_at >= v_start_date
    ),
    'aiDissatisfaction', (
      SELECT COALESCE(
        ROUND(
          (COUNT(CASE WHEN event_data->>'satisfaction' = 'negative' THEN 1 END)::DECIMAL /
           NULLIF(COUNT(*), 0)) * 100,
          2
        ),
        0
      )
      FROM public.user_events
      WHERE event_type = 'ai_feedback'
        AND created_at >= v_start_date
    ),
    'abandonments', (
      SELECT COUNT(DISTINCT session_id)
      FROM public.user_sessions
      WHERE started_at >= v_start_date
        AND duration < 30
        AND is_active = false
    ),
    'ticketsCreated', (
      SELECT COUNT(*)
      FROM public.support_tickets
      WHERE created_at >= v_start_date
    ),
    'feedbackSent', (
      SELECT COUNT(*)
      FROM public.user_events
      WHERE event_type = 'feedback'
        AND created_at >= v_start_date
    )
  ) INTO v_result;

  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- VERIFICACIÓN FINAL
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ MIGRACIÓN COMPLETADA';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Funciones corregidas:';
  RAISE NOTICE '  - get_impressions_stats';
  RAISE NOTICE '  - get_landing_analytics';
  RAISE NOTICE '  - get_tool_usage_stats';
  RAISE NOTICE '  - get_engagement_metrics_detailed';
  RAISE NOTICE '  - Triggers de auditoría verificados';
  RAISE NOTICE '========================================';
END $$;

