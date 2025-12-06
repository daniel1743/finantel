-- =====================================================
-- MIGRACIÓN: Tablas de Analytics para Panel de Admin
-- =====================================================
-- Crea tablas para tracking de eventos, page views, uso de herramientas e impresiones
-- =====================================================

-- Tabla de eventos de usuario
CREATE TABLE IF NOT EXISTS public.analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL, -- 'page_view', 'tool_used', 'landing_section_view', 'login', 'signup', etc.
  event_name TEXT NOT NULL, -- Nombre específico del evento
  page_path TEXT,
  section_name TEXT, -- Sección del landing (hero, features, pricing, etc.)
  tool_name TEXT, -- Nombre de la herramienta usada
  metadata JSONB DEFAULT '{}'::jsonb, -- Datos adicionales
  user_agent TEXT,
  ip_address TEXT,
  referrer TEXT,
  session_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de page views (vistas de página)
CREATE TABLE IF NOT EXISTS public.analytics_page_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  page_path TEXT NOT NULL,
  page_title TEXT,
  referrer TEXT,
  user_agent TEXT,
  ip_address TEXT,
  session_id TEXT,
  time_on_page INTEGER, -- Tiempo en segundos
  scroll_depth INTEGER, -- Porcentaje de scroll (0-100)
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de uso de herramientas
CREATE TABLE IF NOT EXISTS public.analytics_tool_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tool_name TEXT NOT NULL, -- 'transactions', 'goals', 'categories', 'ai-assistant', 'predictions', etc.
  action_type TEXT NOT NULL, -- 'view', 'create', 'update', 'delete', 'export', etc.
  metadata JSONB DEFAULT '{}'::jsonb,
  session_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de impresiones (SEO)
CREATE TABLE IF NOT EXISTS public.analytics_impressions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_path TEXT NOT NULL,
  page_title TEXT,
  referrer TEXT,
  user_agent TEXT,
  ip_address TEXT,
  search_engine TEXT, -- 'google', 'bing', 'direct', etc.
  search_query TEXT,
  is_bot BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de sesiones de usuario
CREATE TABLE IF NOT EXISTS public.analytics_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id TEXT UNIQUE NOT NULL,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  duration_seconds INTEGER,
  page_count INTEGER DEFAULT 0,
  is_authenticated BOOLEAN DEFAULT false,
  user_agent TEXT,
  ip_address TEXT,
  referrer TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_analytics_events_user_id ON public.analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_event_type ON public.analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON public.analytics_events(created_at);
CREATE INDEX IF NOT EXISTS idx_analytics_events_session_id ON public.analytics_events(session_id);

CREATE INDEX IF NOT EXISTS idx_analytics_page_views_user_id ON public.analytics_page_views(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_page_views_page_path ON public.analytics_page_views(page_path);
CREATE INDEX IF NOT EXISTS idx_analytics_page_views_created_at ON public.analytics_page_views(created_at);

CREATE INDEX IF NOT EXISTS idx_analytics_tool_usage_user_id ON public.analytics_tool_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_tool_usage_tool_name ON public.analytics_tool_usage(tool_name);
CREATE INDEX IF NOT EXISTS idx_analytics_tool_usage_created_at ON public.analytics_tool_usage(created_at);

CREATE INDEX IF NOT EXISTS idx_analytics_impressions_page_path ON public.analytics_impressions(page_path);
CREATE INDEX IF NOT EXISTS idx_analytics_impressions_created_at ON public.analytics_impressions(created_at);
CREATE INDEX IF NOT EXISTS idx_analytics_impressions_search_engine ON public.analytics_impressions(search_engine);

CREATE INDEX IF NOT EXISTS idx_analytics_sessions_user_id ON public.analytics_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_sessions_session_id ON public.analytics_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_analytics_sessions_started_at ON public.analytics_sessions(started_at);

-- Habilitar RLS
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_page_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_tool_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_impressions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_sessions ENABLE ROW LEVEL SECURITY;

-- Políticas RLS: Solo admins pueden leer, todos pueden insertar sus propios eventos
-- Eventos: Usuarios pueden insertar, solo admins pueden leer
CREATE POLICY "Users can insert their own events" ON public.analytics_events
  FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Only admins can view events" ON public.analytics_events
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profile_preferences
      WHERE user_id = auth.uid() AND is_staff = true
    )
  );

-- Page Views: Usuarios pueden insertar, solo admins pueden leer
CREATE POLICY "Users can insert their own page views" ON public.analytics_page_views
  FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Only admins can view page views" ON public.analytics_page_views
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profile_preferences
      WHERE user_id = auth.uid() AND is_staff = true
    )
  );

-- Tool Usage: Usuarios pueden insertar sus propios usos, solo admins pueden leer todos
CREATE POLICY "Users can insert their own tool usage" ON public.analytics_tool_usage
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own tool usage" ON public.analytics_tool_usage
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Only admins can view all tool usage" ON public.analytics_tool_usage
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profile_preferences
      WHERE user_id = auth.uid() AND is_staff = true
    )
  );

-- Impressions: Cualquiera puede insertar (incluyendo bots), solo admins pueden leer
CREATE POLICY "Anyone can insert impressions" ON public.analytics_impressions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Only admins can view impressions" ON public.analytics_impressions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profile_preferences
      WHERE user_id = auth.uid() AND is_staff = true
    )
  );

-- Sessions: Usuarios pueden insertar/actualizar sus propias sesiones, solo admins pueden leer todas
CREATE POLICY "Users can insert their own sessions" ON public.analytics_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can update their own sessions" ON public.analytics_sessions
  FOR UPDATE USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Only admins can view all sessions" ON public.analytics_sessions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profile_preferences
      WHERE user_id = auth.uid() AND is_staff = true
    )
  );

-- Funciones para estadísticas (solo para admins)
CREATE OR REPLACE FUNCTION public.get_analytics_dashboard_stats(
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
  -- Verificar que el usuario es admin
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
    'total_impressions', (
      SELECT COUNT(*)
      FROM public.analytics_impressions
      WHERE created_at BETWEEN start_date AND end_date AND is_bot = false
    ),
    'total_page_views', (
      SELECT COUNT(*)
      FROM public.analytics_page_views
      WHERE created_at BETWEEN start_date AND end_date
    )
  ) INTO result;

  RETURN result;
END;
$$;

-- Función para obtener uso de herramientas
CREATE OR REPLACE FUNCTION public.get_tool_usage_stats(
  start_date TIMESTAMPTZ DEFAULT NOW() - INTERVAL '30 days',
  end_date TIMESTAMPTZ DEFAULT NOW()
)
RETURNS TABLE (
  tool_name TEXT,
  usage_count BIGINT,
  unique_users BIGINT,
  last_used TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Verificar que el usuario es admin
  IF NOT EXISTS (
    SELECT 1 FROM public.profile_preferences
    WHERE user_id = auth.uid() AND is_staff = true
  ) THEN
    RAISE EXCEPTION 'Access denied. Admin only.';
  END IF;

  RETURN QUERY
  SELECT
    tu.tool_name,
    COUNT(*)::BIGINT as usage_count,
    COUNT(DISTINCT tu.user_id)::BIGINT as unique_users,
    MAX(tu.created_at) as last_used
  FROM public.analytics_tool_usage tu
  WHERE tu.created_at BETWEEN start_date AND end_date
  GROUP BY tu.tool_name
  ORDER BY usage_count DESC;
END;
$$;

-- Función para obtener estadísticas del landing page
CREATE OR REPLACE FUNCTION public.get_landing_stats(
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
  -- Verificar que el usuario es admin
  IF NOT EXISTS (
    SELECT 1 FROM public.profile_preferences
    WHERE user_id = auth.uid() AND is_staff = true
  ) THEN
    RAISE EXCEPTION 'Access denied. Admin only.';
  END IF;

  SELECT json_build_object(
    'sections', (
      SELECT json_agg(
        json_build_object(
          'section', section_name,
          'views', view_count,
          'unique_visitors', unique_visitors
        )
      )
      FROM (
        SELECT
          section_name,
          COUNT(*) as view_count,
          COUNT(DISTINCT session_id) as unique_visitors
        FROM public.analytics_events
        WHERE event_type = 'landing_section_view'
          AND created_at BETWEEN start_date AND end_date
          AND section_name IS NOT NULL
        GROUP BY section_name
        ORDER BY view_count DESC
      ) s
    ),
    'average_scroll_depth', (
      SELECT AVG(scroll_depth)
      FROM public.analytics_page_views
      WHERE page_path = '/' AND created_at BETWEEN start_date AND end_date
    ),
    'average_time_on_page', (
      SELECT AVG(time_on_page)
      FROM public.analytics_page_views
      WHERE page_path = '/' AND created_at BETWEEN start_date AND end_date
    )
  ) INTO result;

  RETURN result;
END;
$$;

