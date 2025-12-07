-- =====================================================
-- MIGRACIÓN: Tablas para Analytics de Administración
-- =====================================================
-- Crea todas las tablas necesarias para el dashboard administrativo
-- =====================================================

-- Tabla: page_views (Vistas de páginas)
DROP TABLE IF EXISTS public.page_views CASCADE;
CREATE TABLE public.page_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  page_path TEXT NOT NULL,
  page_title TEXT,
  referrer TEXT,
  user_agent TEXT,
  ip_address INET,
  session_id TEXT,
  view_duration INTEGER, -- segundos
  scroll_depth INTEGER, -- porcentaje 0-100
  section_viewed TEXT, -- sección del landing más vista
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para page_views
CREATE INDEX IF NOT EXISTS idx_page_views_user_id ON public.page_views(user_id);
CREATE INDEX IF NOT EXISTS idx_page_views_page_path ON public.page_views(page_path);
CREATE INDEX IF NOT EXISTS idx_page_views_created_at ON public.page_views(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_page_views_session_id ON public.page_views(session_id);

-- Tabla: user_events (Eventos de usuario)
-- Eliminar tabla si existe para evitar conflictos
DROP TABLE IF EXISTS public.user_events CASCADE;

CREATE TABLE public.user_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL, -- 'page_view', 'click', 'tool_used', 'login', 'logout', 'signup', etc.
  event_name TEXT NOT NULL, -- nombre específico del evento
  event_data JSONB DEFAULT '{}'::jsonb, -- datos adicionales del evento
  page_path TEXT,
  session_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para user_events
CREATE INDEX IF NOT EXISTS idx_user_events_user_id ON public.user_events(user_id);
CREATE INDEX IF NOT EXISTS idx_user_events_event_type ON public.user_events(event_type);
CREATE INDEX IF NOT EXISTS idx_user_events_event_name ON public.user_events(event_name);
CREATE INDEX IF NOT EXISTS idx_user_events_created_at ON public.user_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_events_session_id ON public.user_events(session_id);

-- Tabla: tool_usage (Uso de herramientas)
DROP TABLE IF EXISTS public.tool_usage CASCADE;
CREATE TABLE public.tool_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  tool_name TEXT NOT NULL, -- 'dashboard', 'transactions', 'ai-assistant', 'goals', etc.
  usage_count INTEGER DEFAULT 1,
  last_used_at TIMESTAMPTZ DEFAULT NOW(),
  first_used_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb,
  UNIQUE(user_id, tool_name)
);

-- Índices para tool_usage
CREATE INDEX IF NOT EXISTS idx_tool_usage_user_id ON public.tool_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_tool_usage_tool_name ON public.tool_usage(tool_name);
CREATE INDEX IF NOT EXISTS idx_tool_usage_last_used_at ON public.tool_usage(last_used_at DESC);

-- Tabla: landing_analytics (Analytics específicos del landing)
DROP TABLE IF EXISTS public.landing_analytics CASCADE;
CREATE TABLE public.landing_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  section_viewed TEXT NOT NULL, -- 'hero', 'features', 'pricing', 'testimonials', 'footer'
  time_spent INTEGER, -- segundos en esta sección
  scroll_position INTEGER, -- porcentaje de scroll
  exit_point TEXT, -- última sección antes de salir
  converted BOOLEAN DEFAULT false, -- si se registró después de ver landing
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para landing_analytics
CREATE INDEX IF NOT EXISTS idx_landing_analytics_session_id ON public.landing_analytics(session_id);
CREATE INDEX IF NOT EXISTS idx_landing_analytics_user_id ON public.landing_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_landing_analytics_section_viewed ON public.landing_analytics(section_viewed);
CREATE INDEX IF NOT EXISTS idx_landing_analytics_created_at ON public.landing_analytics(created_at DESC);

-- Tabla: user_sessions (Sesiones de usuario)
DROP TABLE IF EXISTS public.user_sessions CASCADE;
CREATE TABLE public.user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL UNIQUE,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  duration INTEGER, -- segundos
  page_views_count INTEGER DEFAULT 0,
  device_type TEXT, -- 'desktop', 'mobile', 'tablet'
  browser TEXT,
  os TEXT,
  country TEXT,
  city TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para user_sessions
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON public.user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_session_id ON public.user_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_started_at ON public.user_sessions(started_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_sessions_is_active ON public.user_sessions(is_active);

-- Tabla: system_health (Salud del sistema)
DROP TABLE IF EXISTS public.system_health CASCADE;
CREATE TABLE public.system_health (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  check_type TEXT NOT NULL, -- 'api', 'database', 'storage', 'email', 'payments'
  status TEXT NOT NULL, -- 'healthy', 'degraded', 'down'
  latency_ms INTEGER,
  error_rate DECIMAL(5,2), -- porcentaje
  details JSONB DEFAULT '{}'::jsonb,
  checked_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para system_health
CREATE INDEX IF NOT EXISTS idx_system_health_check_type ON public.system_health(check_type);
CREATE INDEX IF NOT EXISTS idx_system_health_checked_at ON public.system_health(checked_at DESC);

-- Tabla: admin_alerts (Alertas del sistema)
DROP TABLE IF EXISTS public.admin_alerts CASCADE;
CREATE TABLE public.admin_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_type TEXT NOT NULL, -- 'system', 'revenue', 'user', 'feature'
  severity TEXT NOT NULL, -- 'critical', 'warning', 'info'
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  action_url TEXT, -- URL para resolver
  action_label TEXT, -- texto del botón de acción
  is_resolved BOOLEAN DEFAULT false,
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para admin_alerts
CREATE INDEX IF NOT EXISTS idx_admin_alerts_alert_type ON public.admin_alerts(alert_type);
CREATE INDEX IF NOT EXISTS idx_admin_alerts_severity ON public.admin_alerts(severity);
CREATE INDEX IF NOT EXISTS idx_admin_alerts_is_resolved ON public.admin_alerts(is_resolved);
CREATE INDEX IF NOT EXISTS idx_admin_alerts_created_at ON public.admin_alerts(created_at DESC);

-- Tabla: audit_logs (Logs de auditoría)
DROP TABLE IF EXISTS public.audit_logs CASCADE;
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL, -- 'login', 'logout', 'plan_change', 'transaction', 'admin_action', etc.
  action TEXT NOT NULL,
  resource_type TEXT, -- 'user', 'transaction', 'plan', etc.
  resource_id UUID,
  ip_address INET,
  user_agent TEXT,
  result TEXT, -- 'success', 'error', 'warning'
  error_message TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para audit_logs
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_event_type ON public.audit_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource_type ON public.audit_logs(resource_type);

-- Tabla: impressions (Impresiones en buscadores/navegadores)
DROP TABLE IF EXISTS public.impressions CASCADE;
CREATE TABLE public.impressions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source TEXT NOT NULL, -- 'search_engine', 'browser', 'direct', 'social', etc.
  source_detail TEXT, -- 'google', 'chrome', 'firefox', etc.
  page_path TEXT NOT NULL,
  referrer TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para impressions
CREATE INDEX IF NOT EXISTS idx_impressions_source ON public.impressions(source);
CREATE INDEX IF NOT EXISTS idx_impressions_created_at ON public.impressions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_impressions_page_path ON public.impressions(page_path);

-- Tabla: admin_config (Configuración rápida)
DROP TABLE IF EXISTS public.admin_config CASCADE;
CREATE TABLE public.admin_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  config_key TEXT NOT NULL UNIQUE,
  config_value JSONB NOT NULL,
  description TEXT,
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índice para admin_config
CREATE INDEX IF NOT EXISTS idx_admin_config_config_key ON public.admin_config(config_key);

-- Habilitar RLS en todas las tablas
ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tool_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.landing_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_health ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.impressions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_config ENABLE ROW LEVEL SECURITY;

-- Políticas RLS: Solo admins pueden ver todo, usuarios pueden insertar sus propios eventos
-- page_views
CREATE POLICY "Users can insert their own page views" ON public.page_views
  FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Admins can view all page views" ON public.page_views
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profile_preferences
      WHERE user_id = auth.uid() AND is_staff = true
    )
  );

-- user_events
CREATE POLICY "Users can insert their own events" ON public.user_events
  FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Admins can view all user events" ON public.user_events
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profile_preferences
      WHERE user_id = auth.uid() AND is_staff = true
    )
  );

-- tool_usage
CREATE POLICY "Users can view and update their own tool usage" ON public.tool_usage
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all tool usage" ON public.tool_usage
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profile_preferences
      WHERE user_id = auth.uid() AND is_staff = true
    )
  );

-- landing_analytics
CREATE POLICY "Anyone can insert landing analytics" ON public.landing_analytics
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view all landing analytics" ON public.landing_analytics
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profile_preferences
      WHERE user_id = auth.uid() AND is_staff = true
    )
  );

-- user_sessions
CREATE POLICY "Users can view and update their own sessions" ON public.user_sessions
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all sessions" ON public.user_sessions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profile_preferences
      WHERE user_id = auth.uid() AND is_staff = true
    )
  );

-- system_health
CREATE POLICY "Admins can view system health" ON public.system_health
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profile_preferences
      WHERE user_id = auth.uid() AND is_staff = true
    )
  );

-- admin_alerts
CREATE POLICY "Admins can view and manage alerts" ON public.admin_alerts
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profile_preferences
      WHERE user_id = auth.uid() AND is_staff = true
    )
  );

-- audit_logs
CREATE POLICY "Users can view their own audit logs" ON public.audit_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all audit logs" ON public.audit_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profile_preferences
      WHERE user_id = auth.uid() AND is_staff = true
    )
  );

-- impressions
CREATE POLICY "Anyone can insert impressions" ON public.impressions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view all impressions" ON public.impressions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profile_preferences
      WHERE user_id = auth.uid() AND is_staff = true
    )
  );

-- admin_config
CREATE POLICY "Admins can manage config" ON public.admin_config
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profile_preferences
      WHERE user_id = auth.uid() AND is_staff = true
    )
  );

-- Función: Actualizar tool_usage automáticamente
DROP FUNCTION IF EXISTS public.update_tool_usage();
CREATE OR REPLACE FUNCTION public.update_tool_usage()
RETURNS TRIGGER AS $$
BEGIN
  -- Verificar que el evento sea de tipo tool_used
  IF NEW.event_type = 'tool_used' THEN
    INSERT INTO public.tool_usage (user_id, tool_name, usage_count, last_used_at, first_used_at)
    VALUES (NEW.user_id, NEW.event_name, 1, NOW(), NOW())
    ON CONFLICT (user_id, tool_name)
    DO UPDATE SET
      usage_count = tool_usage.usage_count + 1,
      last_used_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: Actualizar tool_usage cuando se registra un evento de herramienta
DROP TRIGGER IF EXISTS trigger_update_tool_usage ON public.user_events;
CREATE TRIGGER trigger_update_tool_usage
  AFTER INSERT ON public.user_events
  FOR EACH ROW
  EXECUTE FUNCTION public.update_tool_usage();

-- Función: Calcular métricas de overview
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
      -- Revenue solo debe contar pagos REALES procesados (Mercado Pago, etc.)
      -- NO transacciones manuales de usuarios
      SELECT COALESCE(SUM(amount), 0)
      FROM public.billing_payments
      WHERE status = 'approved'
        AND paid_at >= v_start_date
        AND paid_at IS NOT NULL
    ),
    'revenuePrev', (
      -- Revenue del período anterior (pagos aprobados)
      SELECT COALESCE(SUM(amount), 0)
      FROM public.billing_payments
      WHERE status = 'approved'
        AND paid_at >= v_prev_start_date
        AND paid_at < v_start_date
        AND paid_at IS NOT NULL
    ),
    'conversionRate', (
      -- Tasa de conversión: usuarios que se registraron y realizaron un pago real
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

-- Función: Obtener uso de herramientas
-- Eliminar todas las versiones posibles de la función
DROP FUNCTION IF EXISTS public.get_tool_usage_stats();
DROP FUNCTION IF EXISTS public.get_tool_usage_stats(TIMESTAMPTZ, TIMESTAMPTZ);
CREATE OR REPLACE FUNCTION public.get_tool_usage_stats()
RETURNS JSONB AS $$
DECLARE
  v_result JSONB;
BEGIN
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

  RETURN COALESCE(v_result, '[]'::jsonb);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función: Obtener analytics del landing
DROP FUNCTION IF EXISTS public.get_landing_analytics(TIMESTAMPTZ, TIMESTAMPTZ);
CREATE OR REPLACE FUNCTION public.get_landing_analytics(
  p_start_date TIMESTAMPTZ DEFAULT NOW() - INTERVAL '30 days',
  p_end_date TIMESTAMPTZ DEFAULT NOW()
)
RETURNS JSONB AS $$
DECLARE
  v_result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'totalVisitors', (
      SELECT COUNT(DISTINCT session_id)
      FROM public.landing_analytics
      WHERE created_at >= p_start_date
        AND created_at <= p_end_date
    ),
    'totalViews', (
      SELECT COUNT(*)
      FROM public.landing_analytics
      WHERE created_at >= p_start_date
        AND created_at <= p_end_date
    ),
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
    'sections', (
      WITH section_stats AS (
        SELECT 
          section_viewed,
          COUNT(*) as views,
          COALESCE(ROUND(AVG(time_spent)::numeric, 2), 0) as avg_time
        FROM public.landing_analytics
        WHERE created_at >= p_start_date
          AND created_at <= p_end_date
        GROUP BY section_viewed
      ),
      total_views AS (
        SELECT COUNT(*) as total
        FROM public.landing_analytics
        WHERE created_at >= p_start_date
          AND created_at <= p_end_date
      )
      SELECT jsonb_object_agg(
        section_viewed,
        jsonb_build_object(
          'views', views,
          'percentage', ROUND((views::DECIMAL / NULLIF((SELECT total FROM total_views), 0)) * 100, 2),
          'avgTime', avg_time
        )
      )
      FROM section_stats
    ),
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

-- Función: Obtener funnel de conversión
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

  -- First payment (pago real procesado, NO transacción manual)
  SELECT COUNT(DISTINCT user_id)
  INTO v_first_payment
  FROM public.billing_payments
  WHERE status = 'approved'
    AND paid_at >= p_start_date
    AND paid_at <= p_end_date
    AND paid_at IS NOT NULL;

  -- Second payment (usuarios con al menos 2 pagos reales procesados)
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

-- Función: Obtener métricas de engagement
DROP FUNCTION IF EXISTS public.get_engagement_metrics(TEXT);
CREATE OR REPLACE FUNCTION public.get_engagement_metrics(
  p_period TEXT DEFAULT '7d'
)
RETURNS JSONB AS $$
DECLARE
  v_start_date TIMESTAMPTZ;
  v_result JSONB;
BEGIN
  CASE p_period
    WHEN '1d' THEN v_start_date := NOW() - INTERVAL '1 day';
    WHEN '7d' THEN v_start_date := NOW() - INTERVAL '7 days';
    WHEN '30d' THEN v_start_date := NOW() - INTERVAL '30 days';
    ELSE v_start_date := NOW() - INTERVAL '7 days';
  END CASE;

  SELECT jsonb_build_object(
    'avgSessionDuration', (
      SELECT COALESCE(ROUND(AVG(duration)::numeric / 60.0, 2), 0)
      FROM public.user_sessions
      WHERE started_at >= v_start_date
        AND duration IS NOT NULL
    ),
    'dailyActiveUsers', (
      SELECT COUNT(DISTINCT user_id)
      FROM public.user_sessions
      WHERE started_at >= NOW() - INTERVAL '1 day'
        AND is_active = true
    ),
    'weeklyActiveUsers', (
      SELECT COUNT(DISTINCT user_id)
      FROM public.user_sessions
      WHERE started_at >= NOW() - INTERVAL '7 days'
        AND is_active = true
    ),
    'monthlyActiveUsers', (
      SELECT COUNT(DISTINCT user_id)
      FROM public.user_sessions
      WHERE started_at >= NOW() - INTERVAL '30 days'
        AND is_active = true
    ),
    'quickExit', (
      SELECT COALESCE(
        ROUND(
          (COUNT(DISTINCT CASE WHEN duration < 30 THEN session_id END)::DECIMAL /
           NULLIF(COUNT(DISTINCT session_id), 0)) * 100,
          2
        ),
        0
      )
      FROM public.user_sessions
      WHERE started_at >= v_start_date
        AND duration IS NOT NULL
    ),
    'longSession', (
      SELECT COALESCE(
        ROUND(
          (COUNT(DISTINCT CASE WHEN duration > 1800 THEN session_id END)::DECIMAL /
           NULLIF(COUNT(DISTINCT session_id), 0)) * 100,
          2
        ),
        0
      )
      FROM public.user_sessions
      WHERE started_at >= v_start_date
        AND duration IS NOT NULL
    )
  ) INTO v_result;

  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función: Obtener impresiones
DROP FUNCTION IF EXISTS public.get_impressions_stats(TIMESTAMPTZ, TIMESTAMPTZ);
CREATE OR REPLACE FUNCTION public.get_impressions_stats(
  p_start_date TIMESTAMPTZ DEFAULT NOW() - INTERVAL '30 days',
  p_end_date TIMESTAMPTZ DEFAULT NOW()
)
RETURNS JSONB AS $$
DECLARE
  v_result JSONB;
BEGIN
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
    'breakdown', (
      WITH breakdown_stats AS (
        SELECT 
          COALESCE(source_detail, 'unknown') as source_detail,
          COUNT(*) as count
        FROM public.impressions
        WHERE created_at >= p_start_date
          AND created_at <= p_end_date
        GROUP BY source_detail
      )
      SELECT jsonb_object_agg(source_detail, count)
      FROM breakdown_stats
    )
  ) INTO v_result;

  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función: Obtener métricas detalladas de engagement
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

