-- =====================================================
-- MIGRACIÓN 030 - SISTEMA IA PLANIFICADORA PROACTIVA
-- =====================================================
-- Sistema completo de IA que anticipa eventos, analiza gastos
-- y genera planes de ahorro personalizados
-- =====================================================

-- =====================================================
-- PARTE 1: TABLA seasonal_events
-- =====================================================
CREATE TABLE IF NOT EXISTS public.seasonal_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL CHECK (char_length(name) >= 1 AND char_length(name) <= 100),
    date DATE NOT NULL,
    country TEXT NOT NULL DEFAULT 'CL' CHECK (char_length(country) = 2),
    optional_description TEXT,
    is_recurring BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Un evento no puede repetirse el mismo día en el mismo país
    UNIQUE(country, date, name)
);

-- Índices para seasonal_events
CREATE INDEX IF NOT EXISTS idx_seasonal_events_date ON public.seasonal_events(date);
CREATE INDEX IF NOT EXISTS idx_seasonal_events_country ON public.seasonal_events(country);
CREATE INDEX IF NOT EXISTS idx_seasonal_events_recurring ON public.seasonal_events(is_recurring) WHERE is_recurring = true;

-- =====================================================
-- PARTE 2: TABLA ai_plans
-- =====================================================
CREATE TABLE IF NOT EXISTS public.ai_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    event_id UUID REFERENCES public.seasonal_events(id) ON DELETE SET NULL,
    goal_amount DECIMAL(12, 2) NOT NULL CHECK (goal_amount > 0),
    saved_amount DECIMAL(12, 2) DEFAULT 0.00 CHECK (saved_amount >= 0),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled', 'paused')),
    start_date DATE NOT NULL DEFAULT CURRENT_DATE,
    target_date DATE NOT NULL,
    weekly_adjustment JSONB DEFAULT '[]'::jsonb,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Validación: target_date debe ser posterior a start_date
    CHECK (target_date > start_date),
    -- Validación: saved_amount no puede exceder goal_amount
    CHECK (saved_amount <= goal_amount)
);

-- Índices para ai_plans
CREATE INDEX IF NOT EXISTS idx_ai_plans_user ON public.ai_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_plans_event ON public.ai_plans(event_id);
CREATE INDEX IF NOT EXISTS idx_ai_plans_status ON public.ai_plans(status);
CREATE INDEX IF NOT EXISTS idx_ai_plans_user_status ON public.ai_plans(user_id, status);
CREATE INDEX IF NOT EXISTS idx_ai_plans_target_date ON public.ai_plans(target_date);

-- =====================================================
-- PARTE 3: TABLA ai_suggestions
-- =====================================================
CREATE TABLE IF NOT EXISTS public.ai_suggestions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    plan_id UUID NOT NULL REFERENCES public.ai_plans(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('pause_service', 'reduction', 'cut_expense', 'optimize', 'custom')),
    description TEXT NOT NULL CHECK (char_length(description) >= 1 AND char_length(description) <= 500),
    estimated_saving DECIMAL(12, 2) NOT NULL CHECK (estimated_saving >= 0),
    accepted BOOLEAN DEFAULT NULL,
    applied_at TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para ai_suggestions
CREATE INDEX IF NOT EXISTS idx_ai_suggestions_plan ON public.ai_suggestions(plan_id);
CREATE INDEX IF NOT EXISTS idx_ai_suggestions_type ON public.ai_suggestions(type);
CREATE INDEX IF NOT EXISTS idx_ai_suggestions_accepted ON public.ai_suggestions(accepted);

-- =====================================================
-- PARTE 4: TABLA ai_notifications
-- =====================================================
CREATE TABLE IF NOT EXISTS public.ai_notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    message TEXT NOT NULL CHECK (char_length(message) >= 1 AND char_length(message) <= 1000),
    type TEXT NOT NULL CHECK (type IN ('reminder', 'warning', 'plan_offer', 'plan_update', 'plan_completed', 'plan_deviation')),
    read BOOLEAN DEFAULT false,
    action_url TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    read_at TIMESTAMPTZ
);

-- Índices para ai_notifications
CREATE INDEX IF NOT EXISTS idx_ai_notifications_user ON public.ai_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_notifications_read ON public.ai_notifications(read);
CREATE INDEX IF NOT EXISTS idx_ai_notifications_type ON public.ai_notifications(type);
CREATE INDEX IF NOT EXISTS idx_ai_notifications_user_read ON public.ai_notifications(user_id, read);
CREATE INDEX IF NOT EXISTS idx_ai_notifications_created ON public.ai_notifications(created_at DESC);

-- =====================================================
-- PARTE 5: TRIGGERS PARA updated_at
-- =====================================================

-- Trigger para seasonal_events
CREATE OR REPLACE FUNCTION update_seasonal_events_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_seasonal_events_updated_at ON public.seasonal_events;
CREATE TRIGGER trg_seasonal_events_updated_at
    BEFORE UPDATE ON public.seasonal_events
    FOR EACH ROW
    EXECUTE FUNCTION update_seasonal_events_updated_at();

-- Trigger para ai_plans
CREATE OR REPLACE FUNCTION update_ai_plans_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_ai_plans_updated_at ON public.ai_plans;
CREATE TRIGGER trg_ai_plans_updated_at
    BEFORE UPDATE ON public.ai_plans
    FOR EACH ROW
    EXECUTE FUNCTION update_ai_plans_updated_at();

-- Trigger para ai_suggestions
CREATE OR REPLACE FUNCTION update_ai_suggestions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_ai_suggestions_updated_at ON public.ai_suggestions;
CREATE TRIGGER trg_ai_suggestions_updated_at
    BEFORE UPDATE ON public.ai_suggestions
    FOR EACH ROW
    EXECUTE FUNCTION update_ai_suggestions_updated_at();

-- =====================================================
-- PARTE 6: ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Habilitar RLS en todas las tablas
ALTER TABLE public.seasonal_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_notifications ENABLE ROW LEVEL SECURITY;

-- Políticas para seasonal_events (público, todos pueden leer)
DROP POLICY IF EXISTS "seasonal_events_select" ON public.seasonal_events;
CREATE POLICY "seasonal_events_select"
    ON public.seasonal_events
    FOR SELECT
    USING (true); -- Todos pueden ver eventos estacionales

-- Políticas para ai_plans (solo el dueño)
DROP POLICY IF EXISTS "ai_plans_select" ON public.ai_plans;
CREATE POLICY "ai_plans_select"
    ON public.ai_plans
    FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "ai_plans_insert" ON public.ai_plans;
CREATE POLICY "ai_plans_insert"
    ON public.ai_plans
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "ai_plans_update" ON public.ai_plans;
CREATE POLICY "ai_plans_update"
    ON public.ai_plans
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "ai_plans_delete" ON public.ai_plans;
CREATE POLICY "ai_plans_delete"
    ON public.ai_plans
    FOR DELETE
    USING (auth.uid() = user_id);

-- Políticas para ai_suggestions (solo el dueño del plan)
DROP POLICY IF EXISTS "ai_suggestions_select" ON public.ai_suggestions;
CREATE POLICY "ai_suggestions_select"
    ON public.ai_suggestions
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.ai_plans
            WHERE ai_plans.id = ai_suggestions.plan_id
            AND ai_plans.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "ai_suggestions_insert" ON public.ai_suggestions;
CREATE POLICY "ai_suggestions_insert"
    ON public.ai_suggestions
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.ai_plans
            WHERE ai_plans.id = ai_suggestions.plan_id
            AND ai_plans.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "ai_suggestions_update" ON public.ai_suggestions;
CREATE POLICY "ai_suggestions_update"
    ON public.ai_suggestions
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.ai_plans
            WHERE ai_plans.id = ai_suggestions.plan_id
            AND ai_plans.user_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.ai_plans
            WHERE ai_plans.id = ai_suggestions.plan_id
            AND ai_plans.user_id = auth.uid()
        )
    );

-- Políticas para ai_notifications (solo el dueño)
DROP POLICY IF EXISTS "ai_notifications_select" ON public.ai_notifications;
CREATE POLICY "ai_notifications_select"
    ON public.ai_notifications
    FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "ai_notifications_insert" ON public.ai_notifications;
CREATE POLICY "ai_notifications_insert"
    ON public.ai_notifications
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "ai_notifications_update" ON public.ai_notifications;
CREATE POLICY "ai_notifications_update"
    ON public.ai_notifications
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "ai_notifications_delete" ON public.ai_notifications;
CREATE POLICY "ai_notifications_delete"
    ON public.ai_notifications
    FOR DELETE
    USING (auth.uid() = user_id);

-- =====================================================
-- PARTE 7: PRE-CARGAR EVENTOS ESTACIONALES
-- =====================================================

-- Función para calcular el primer domingo de agosto (Día del Niño en Chile)
CREATE OR REPLACE FUNCTION get_first_sunday_august(p_year INTEGER)
RETURNS DATE AS $$
DECLARE
    first_august DATE;
    day_of_week INTEGER;
BEGIN
    first_august := DATE(p_year || '-08-01');
    day_of_week := EXTRACT(DOW FROM first_august);
    
    -- Si el 1 de agosto es domingo (0), retornar ese día
    -- Si no, calcular cuántos días faltan para el domingo
    IF day_of_week = 0 THEN
        RETURN first_august;
    ELSE
        RETURN first_august + (7 - day_of_week);
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Función para calcular el último viernes de noviembre (Black Friday)
CREATE OR REPLACE FUNCTION get_last_friday_november(p_year INTEGER)
RETURNS DATE AS $$
DECLARE
    last_november DATE;
    day_of_week INTEGER;
BEGIN
    last_november := DATE(p_year || '-11-30');
    day_of_week := EXTRACT(DOW FROM last_november);
    
    -- Si el 30 de noviembre es viernes (5), retornar ese día
    -- Si no, retroceder hasta el viernes
    IF day_of_week = 5 THEN
        RETURN last_november;
    ELSIF day_of_week > 5 THEN
        RETURN last_november - (day_of_week - 5);
    ELSE
        RETURN last_november - (day_of_week + 2);
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Insertar eventos estacionales (solo si no existen)
DO $$
DECLARE
    current_year INTEGER;
    dia_nino_date DATE;
    black_friday_date DATE;
BEGIN
    current_year := EXTRACT(YEAR FROM CURRENT_DATE);
    
    -- Calcular fechas dinámicas
    dia_nino_date := get_first_sunday_august(current_year);
    black_friday_date := get_last_friday_november(current_year);
    
    -- Navidad (25-12)
    INSERT INTO public.seasonal_events (name, date, country, optional_description, is_recurring)
    VALUES ('Navidad', DATE(current_year || '-12-25'), 'CL', 'Celebración navideña', true)
    ON CONFLICT (country, date, name) DO NOTHING;
    
    -- Año Nuevo (01-01)
    INSERT INTO public.seasonal_events (name, date, country, optional_description, is_recurring)
    VALUES ('Año Nuevo', DATE((current_year + 1) || '-01-01'), 'CL', 'Celebración de año nuevo', true)
    ON CONFLICT (country, date, name) DO NOTHING;
    
    -- Fiestas Patrias (18-09)
    INSERT INTO public.seasonal_events (name, date, country, optional_description, is_recurring)
    VALUES ('Fiestas Patrias', DATE(current_year || '-09-18'), 'CL', 'Día de la Independencia de Chile', true)
    ON CONFLICT (country, date, name) DO NOTHING;
    
    -- Halloween (31-10)
    INSERT INTO public.seasonal_events (name, date, country, optional_description, is_recurring)
    VALUES ('Halloween', DATE(current_year || '-10-31'), 'CL', 'Noche de Halloween', true)
    ON CONFLICT (country, date, name) DO NOTHING;
    
    -- Día del Niño (primer domingo de agosto)
    INSERT INTO public.seasonal_events (name, date, country, optional_description, is_recurring)
    VALUES ('Día del Niño', dia_nino_date, 'CL', 'Día del Niño en Chile', true)
    ON CONFLICT (country, date, name) DO NOTHING;
    
    -- Black Friday (último viernes de noviembre)
    INSERT INTO public.seasonal_events (name, date, country, optional_description, is_recurring)
    VALUES ('Black Friday', black_friday_date, 'CL', 'Black Friday - Ofertas', true)
    ON CONFLICT (country, date, name) DO NOTHING;
    
    -- Cyberday (Chile - típicamente en mayo, usar 15 de mayo como aproximación)
    INSERT INTO public.seasonal_events (name, date, country, optional_description, is_recurring)
    VALUES ('Cyberday', DATE(current_year || '-05-15'), 'CL', 'Cyberday Chile - Ofertas online', true)
    ON CONFLICT (country, date, name) DO NOTHING;
    
    -- Vacaciones de invierno (Chile - típicamente segunda quincena de julio)
    INSERT INTO public.seasonal_events (name, date, country, optional_description, is_recurring)
    VALUES ('Vacaciones de Invierno', DATE(current_year || '-07-15'), 'CL', 'Vacaciones escolares de invierno', true)
    ON CONFLICT (country, date, name) DO NOTHING;
END $$;

-- =====================================================
-- PARTE 8: FUNCIONES AUXILIARES PARA ANÁLISIS
-- =====================================================

-- Función: Detectar próximos eventos (dentro de X días)
CREATE OR REPLACE FUNCTION detect_upcoming_events(
    p_user_id UUID,
    p_days_ahead INTEGER DEFAULT 30
)
RETURNS TABLE (
    event_id UUID,
    event_name TEXT,
    event_date DATE,
    days_until INTEGER,
    has_active_plan BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        se.id,
        se.name,
        se.date,
        (se.date - CURRENT_DATE)::INTEGER as days_until,
        EXISTS (
            SELECT 1 FROM public.ai_plans ap
            WHERE ap.user_id = p_user_id
            AND ap.event_id = se.id
            AND ap.status = 'active'
        ) as has_active_plan
    FROM public.seasonal_events se
    WHERE se.country = 'CL'
    AND se.is_recurring = true
    AND se.date >= CURRENT_DATE
    AND se.date <= CURRENT_DATE + (p_days_ahead || ' days')::INTERVAL
    ORDER BY se.date ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función: Analizar gastos recurrentes del usuario
CREATE OR REPLACE FUNCTION analyze_recurring_expenses(
    p_user_id UUID,
    p_months_back INTEGER DEFAULT 3
)
RETURNS JSONB AS $$
DECLARE
    result JSONB;
    services JSONB;
    impulsive JSONB;
    unnecessary JSONB;
    opportunities JSONB;
BEGIN
    -- Servicios recurrentes (Netflix, Spotify, etc.)
    SELECT jsonb_agg(
        jsonb_build_object(
            'description', description,
            'amount', amount,
            'frequency', recurring_frequency,
            'total_months', COUNT(*),
            'avg_monthly', AVG(amount)
        )
    ) INTO services
    FROM public.transactions
    WHERE user_id = p_user_id
    AND type = 'expense'
    AND is_recurring = true
    AND date >= CURRENT_DATE - (p_months_back || ' months')::INTERVAL
    AND (
        LOWER(description) LIKE '%netflix%' OR
        LOWER(description) LIKE '%spotify%' OR
        LOWER(description) LIKE '%youtube%' OR
        LOWER(description) LIKE '%premium%' OR
        LOWER(description) LIKE '%subscription%' OR
        LOWER(description) LIKE '%suscripcion%'
    )
    GROUP BY description, amount, recurring_frequency
    HAVING COUNT(*) >= 2;

    -- Gastos impulsivos (Starbucks, snacks, delivery)
    SELECT jsonb_agg(
        jsonb_build_object(
            'description', description,
            'total_amount', SUM(amount),
            'count', COUNT(*),
            'avg_amount', AVG(amount),
            'last_date', MAX(date)
        )
    ) INTO impulsive
    FROM public.transactions
    WHERE user_id = p_user_id
    AND type = 'expense'
    AND date >= CURRENT_DATE - (p_months_back || ' months')::INTERVAL
    AND (
        LOWER(description) LIKE '%starbucks%' OR
        LOWER(description) LIKE '%café%' OR
        LOWER(description) LIKE '%coffee%' OR
        LOWER(description) LIKE '%snack%' OR
        LOWER(description) LIKE '%delivery%' OR
        LOWER(description) LIKE '%uber eats%' OR
        LOWER(description) LIKE '%rappi%' OR
        LOWER(description) LIKE '%gatorade%'
    )
    GROUP BY description
    HAVING COUNT(*) >= 5;

    -- Compras innecesarias (gastos grandes en categorías de ocio)
    SELECT jsonb_agg(
        jsonb_build_object(
            'description', t.description,
            'amount', t.amount,
            'date', t.date,
            'category', COALESCE(c.name, 'Sin categoría')
        )
    ) INTO unnecessary
    FROM public.transactions t
    LEFT JOIN public.categories c ON c.id = t.category_id
    WHERE t.user_id = p_user_id
    AND t.type = 'expense'
    AND t.amount > 50000 -- Gastos mayores a $50,000 CLP
    AND t.date >= CURRENT_DATE - (p_months_back || ' months')::INTERVAL
    AND (
        LOWER(COALESCE(c.name, '')) LIKE '%ocio%' OR
        LOWER(COALESCE(c.name, '')) LIKE '%entretenimiento%' OR
        LOWER(COALESCE(c.name, '')) LIKE '%lujo%'
    )
    ORDER BY t.amount DESC
    LIMIT 10;

    -- Oportunidades de ahorro
    SELECT jsonb_agg(
        jsonb_build_object(
            'type', 'service_pause',
            'description', description,
            'estimated_saving', AVG(amount) * 1,
            'reason', 'Servicio recurrente que puede pausarse temporalmente'
        )
    ) INTO opportunities
    FROM public.transactions
    WHERE user_id = p_user_id
    AND type = 'expense'
    AND is_recurring = true
    AND date >= CURRENT_DATE - (p_months_back || ' months')::INTERVAL
    GROUP BY description
    HAVING COUNT(*) >= 2;

    -- Construir resultado
    result := jsonb_build_object(
        'recurring_services', COALESCE(services, '[]'::jsonb),
        'impulsive_expenses', COALESCE(impulsive, '[]'::jsonb),
        'unnecessary_purchases', COALESCE(unnecessary, '[]'::jsonb),
        'saving_opportunities', COALESCE(opportunities, '[]'::jsonb),
        'analysis_date', CURRENT_DATE,
        'months_analyzed', p_months_back
    );

    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función: Calcular ahorro estimado total
CREATE OR REPLACE FUNCTION calculate_estimated_savings(
    p_analysis JSONB
)
RETURNS DECIMAL(12, 2) AS $$
DECLARE
    total DECIMAL(12, 2) := 0;
    opportunity JSONB;
BEGIN
    -- Sumar ahorros de oportunidades
    FOR opportunity IN SELECT * FROM jsonb_array_elements(p_analysis->'saving_opportunities')
    LOOP
        total := total + (opportunity->>'estimated_saving')::DECIMAL;
    END LOOP;

    -- Sumar ahorros de gastos impulsivos (asumiendo reducción del 50%)
    FOR opportunity IN SELECT * FROM jsonb_array_elements(p_analysis->'impulsive_expenses')
    LOOP
        total := total + ((opportunity->>'total_amount')::DECIMAL * 0.5);
    END LOOP;

    RETURN COALESCE(total, 0);
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- PARTE 9: FUNCIÓN PARA SEGUIMIENTO SEMANAL
-- =====================================================

-- Función: Evaluar progreso del plan
CREATE OR REPLACE FUNCTION evaluate_plan_progress(
    p_plan_id UUID
)
RETURNS JSONB AS $$
DECLARE
    plan_record RECORD;
    weeks_passed INTEGER;
    expected_savings DECIMAL(12, 2);
    actual_savings DECIMAL(12, 2);
    deviation_percentage DECIMAL(5, 2);
    result JSONB;
BEGIN
    -- Obtener información del plan
    SELECT * INTO plan_record
    FROM public.ai_plans
    WHERE id = p_plan_id;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('error', 'Plan no encontrado');
    END IF;

    -- Calcular semanas transcurridas
    weeks_passed := EXTRACT(WEEK FROM CURRENT_DATE) - EXTRACT(WEEK FROM plan_record.start_date);
    IF weeks_passed < 0 THEN
        weeks_passed := 0;
    END IF;

    -- Calcular ahorro esperado hasta ahora
    expected_savings := (plan_record.goal_amount / 
        GREATEST(1, EXTRACT(DAY FROM (plan_record.target_date - plan_record.start_date)) / 7.0)) 
        * weeks_passed;

    -- Ahorro actual
    actual_savings := plan_record.saved_amount;

    -- Calcular desviación
    IF expected_savings > 0 THEN
        deviation_percentage := ((actual_savings - expected_savings) / expected_savings) * 100;
    ELSE
        deviation_percentage := 0;
    END IF;

    -- Construir resultado
    result := jsonb_build_object(
        'plan_id', p_plan_id,
        'weeks_passed', weeks_passed,
        'expected_savings', expected_savings,
        'actual_savings', actual_savings,
        'deviation_percentage', deviation_percentage,
        'needs_recalculation', ABS(deviation_percentage) > 20,
        'is_on_track', ABS(deviation_percentage) <= 10,
        'evaluation_date', CURRENT_DATE
    );

    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- COMENTARIOS Y DOCUMENTACIÓN
-- =====================================================

COMMENT ON TABLE public.seasonal_events IS 'Eventos estacionales que la IA puede anticipar (Navidad, Año Nuevo, etc.)';
COMMENT ON TABLE public.ai_plans IS 'Planes de ahorro generados por la IA para eventos específicos';
COMMENT ON TABLE public.ai_suggestions IS 'Sugerencias específicas de ahorro dentro de un plan';
COMMENT ON TABLE public.ai_notifications IS 'Notificaciones proactivas de la IA para el usuario';

COMMENT ON FUNCTION detect_upcoming_events IS 'Detecta eventos próximos que el usuario aún no tiene plan activo';
COMMENT ON FUNCTION analyze_recurring_expenses IS 'Analiza el historial de gastos del usuario para identificar oportunidades de ahorro';
COMMENT ON FUNCTION calculate_estimated_savings IS 'Calcula el ahorro total estimado basado en el análisis';
COMMENT ON FUNCTION evaluate_plan_progress IS 'Evalúa el progreso semanal de un plan y detecta desviaciones';

-- =====================================================
-- MIGRACIÓN COMPLETADA
-- =====================================================

