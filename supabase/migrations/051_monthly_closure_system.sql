-- ============================================================================
-- SISTEMA DE CIERRE MENSUAL AUTOMÁTICO
-- ============================================================================
-- Este sistema:
-- 1. Cierra automáticamente cada mes y archiva los datos
-- 2. Notifica 2 días antes del cierre
-- 3. Permite cierre manual anticipado
-- 4. Controla límites de historial y descargas por plan
-- 5. Proporciona acceso a la IA para análisis de datos históricos
-- ============================================================================

-- ============================================================================
-- 1. TABLA: MONTHLY_SUMMARIES - Resúmenes mensuales archivados
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.monthly_summaries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    month_year DATE NOT NULL, -- Primer día del mes (ej: 2025-01-01)
    
    -- Resumen financiero del mes
    total_income DECIMAL(12, 2) DEFAULT 0.00,
    total_expenses DECIMAL(12, 2) DEFAULT 0.00,
    total_savings DECIMAL(12, 2) DEFAULT 0.00,
    currency TEXT DEFAULT 'USD',
    
    -- Estadísticas de transacciones
    transaction_count INTEGER DEFAULT 0,
    income_count INTEGER DEFAULT 0,
    expense_count INTEGER DEFAULT 0,
    
    -- Resumen por categorías (JSONB para flexibilidad)
    category_breakdown JSONB DEFAULT '{}'::jsonb,
    
    -- Resumen por presupuestos
    budget_summary JSONB DEFAULT '{}'::jsonb,
    
    -- Metas alcanzadas
    goals_achieved INTEGER DEFAULT 0,
    goals_progress JSONB DEFAULT '[]'::jsonb,
    
    -- Datos completos del mes (para IA y análisis)
    full_data JSONB DEFAULT '{}'::jsonb, -- Todas las transacciones, categorías, etc.
    
    -- Metadatos
    closed_at TIMESTAMPTZ DEFAULT NOW(),
    closed_by TEXT DEFAULT 'system', -- 'system' o 'manual'
    is_final BOOLEAN DEFAULT true,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Un usuario solo puede tener un resumen por mes
    UNIQUE(user_id, month_year)
);

-- Índices para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_monthly_summaries_user_id ON public.monthly_summaries(user_id);
CREATE INDEX IF NOT EXISTS idx_monthly_summaries_month_year ON public.monthly_summaries(month_year);
CREATE INDEX IF NOT EXISTS idx_monthly_summaries_user_month ON public.monthly_summaries(user_id, month_year DESC);

-- ============================================================================
-- 2. TABLA: MONTHLY_DOWNLOADS - Control de descargas mensuales
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.monthly_downloads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    monthly_summary_id UUID NOT NULL REFERENCES public.monthly_summaries(id) ON DELETE CASCADE,
    download_date TIMESTAMPTZ DEFAULT NOW(),
    format TEXT DEFAULT 'json' CHECK (format IN ('json', 'csv', 'pdf', 'excel')),
    file_size_bytes INTEGER,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_monthly_downloads_user_id ON public.monthly_downloads(user_id);
CREATE INDEX IF NOT EXISTS idx_monthly_downloads_summary_id ON public.monthly_downloads(monthly_summary_id);
CREATE INDEX IF NOT EXISTS idx_monthly_downloads_date ON public.monthly_downloads(download_date);

-- ============================================================================
-- 3. TABLA: MONTHLY_CLOSURE_NOTIFICATIONS - Notificaciones de cierre
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.monthly_closure_notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    target_month DATE NOT NULL, -- Mes que se va a cerrar
    notification_sent_at TIMESTAMPTZ DEFAULT NOW(),
    notification_type TEXT DEFAULT 'reminder' CHECK (notification_type IN ('reminder', 'closure', 'manual_request')),
    is_read BOOLEAN DEFAULT false,
    user_action TEXT CHECK (user_action IN ('manual_close', 'dismiss', NULL)),
    action_taken_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_closure_notifications_user_id ON public.monthly_closure_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_closure_notifications_target_month ON public.monthly_closure_notifications(target_month);
CREATE INDEX IF NOT EXISTS idx_closure_notifications_unread ON public.monthly_closure_notifications(user_id, is_read) WHERE is_read = false;

-- ============================================================================
-- 4. FUNCIÓN: Obtener límites por plan
-- ============================================================================
CREATE OR REPLACE FUNCTION get_plan_limits(p_user_id UUID)
RETURNS TABLE (
    plan_name TEXT,
    months_history INTEGER,
    downloads_per_month INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_plan TEXT;
BEGIN
    -- Obtener el plan del usuario
    SELECT COALESCE(plan, 'free')
    INTO v_plan
    FROM public.billing_subscriptions
    WHERE user_id = p_user_id
      AND status = 'active'
    LIMIT 1;
    
    -- Si no tiene suscripción activa, usar plan free
    IF v_plan IS NULL THEN
        v_plan := 'free';
    END IF;
    
    -- Retornar límites según el plan
    RETURN QUERY
    SELECT
        v_plan::TEXT,
        CASE v_plan
            WHEN 'free' THEN 2
            WHEN 'personal' THEN 5
            WHEN 'Familiar' THEN 5
            WHEN 'familiar' THEN 5
            WHEN 'family' THEN 12
            WHEN 'enterprise' THEN 12
            ELSE 2
        END::INTEGER as months_history,
        CASE v_plan
            WHEN 'free' THEN 2
            WHEN 'personal' THEN 8
            WHEN 'Familiar' THEN 8
            WHEN 'familiar' THEN 8
            WHEN 'family' THEN 24
            WHEN 'enterprise' THEN 24
            ELSE 2
        END::INTEGER as downloads_per_month;
END;
$$;

-- ============================================================================
-- 5. FUNCIÓN: Verificar si puede descargar
-- ============================================================================
CREATE OR REPLACE FUNCTION can_download_monthly_summary(
    p_user_id UUID,
    p_monthly_summary_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_limits RECORD;
    v_current_month DATE;
    v_downloads_this_month INTEGER;
    v_result JSONB;
BEGIN
    -- Obtener límites del plan
    SELECT * INTO v_limits FROM get_plan_limits(p_user_id);
    
    -- Obtener el mes actual
    v_current_month := DATE_TRUNC('month', CURRENT_DATE)::DATE;
    
    -- Contar descargas del mes actual
    SELECT COUNT(*)
    INTO v_downloads_this_month
    FROM public.monthly_downloads
    WHERE user_id = p_user_id
      AND DATE_TRUNC('month', download_date)::DATE = v_current_month;
    
    -- Verificar si puede descargar
    IF v_downloads_this_month >= v_limits.downloads_per_month THEN
        v_result := jsonb_build_object(
            'can_download', false,
            'reason', 'Límite de descargas mensuales alcanzado',
            'current_downloads', v_downloads_this_month,
            'limit', v_limits.downloads_per_month,
            'plan', v_limits.plan_name
        );
    ELSE
        v_result := jsonb_build_object(
            'can_download', true,
            'remaining_downloads', v_limits.downloads_per_month - v_downloads_this_month,
            'current_downloads', v_downloads_this_month,
            'limit', v_limits.downloads_per_month,
            'plan', v_limits.plan_name
        );
    END IF;
    
    RETURN v_result;
END;
$$;

-- ============================================================================
-- 6. FUNCIÓN: Cerrar mes automáticamente
-- ============================================================================
CREATE OR REPLACE FUNCTION close_month_automatically(
    p_user_id UUID,
    p_target_month DATE DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_target_month DATE;
    v_summary_id UUID;
    v_total_income DECIMAL(12, 2) := 0;
    v_total_expenses DECIMAL(12, 2) := 0;
    v_transaction_count INTEGER := 0;
    v_income_count INTEGER := 0;
    v_expense_count INTEGER := 0;
    v_category_breakdown JSONB := '{}'::jsonb;
    v_budget_summary JSONB := '{}'::jsonb;
    v_goals_progress JSONB := '[]'::jsonb;
    v_full_data JSONB := '{}'::jsonb;
    v_currency TEXT := 'USD';
    v_transaction RECORD;
    v_category_data JSONB;
    v_budget_data JSONB;
BEGIN
    -- Si no se especifica mes, usar el mes anterior
    IF p_target_month IS NULL THEN
        v_target_month := DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')::DATE;
    ELSE
        v_target_month := DATE_TRUNC('month', p_target_month)::DATE;
    END IF;
    
    -- Verificar si ya existe un resumen para este mes
    SELECT id INTO v_summary_id
    FROM public.monthly_summaries
    WHERE user_id = p_user_id
      AND month_year = v_target_month;
    
    IF v_summary_id IS NOT NULL THEN
        RAISE NOTICE 'Ya existe un resumen para el mes %', v_target_month;
        RETURN v_summary_id;
    END IF;
    
    -- Obtener moneda del usuario
    SELECT COALESCE(currency, 'USD')
    INTO v_currency
    FROM public.profile_preferences
    WHERE user_id = p_user_id;
    
    -- Calcular totales de transacciones del mes
    SELECT 
        COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0),
        COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0),
        COUNT(*),
        COUNT(*) FILTER (WHERE type = 'income'),
        COUNT(*) FILTER (WHERE type = 'expense')
    INTO v_total_income, v_total_expenses, v_transaction_count, v_income_count, v_expense_count
    FROM public.transactions
    WHERE user_id = p_user_id
      AND DATE_TRUNC('month', date)::DATE = v_target_month;
    
    -- Calcular desglose por categorías
    SELECT jsonb_object_agg(
        COALESCE(c.name, 'Sin categoría'),
        jsonb_build_object(
            'total', SUM(t.amount),
            'count', COUNT(*),
            'type', t.type
        )
    )
    INTO v_category_breakdown
    FROM public.transactions t
    LEFT JOIN public.categories c ON t.category_id = c.id
    WHERE t.user_id = p_user_id
      AND DATE_TRUNC('month', t.date)::DATE = v_target_month
    GROUP BY COALESCE(c.name, 'Sin categoría'), t.type;
    
    -- Calcular resumen de presupuestos
    SELECT jsonb_object_agg(
        b.name,
        jsonb_build_object(
            'budgeted', b.amount,
            'spent', COALESCE(SUM(t.amount), 0),
            'percentage', ROUND((COALESCE(SUM(t.amount), 0) / b.amount * 100)::numeric, 2)
        )
    )
    INTO v_budget_summary
    FROM public.budgets b
    LEFT JOIN public.transactions t ON t.budget_id = b.id
        AND DATE_TRUNC('month', t.date)::DATE = v_target_month
    WHERE b.user_id = p_user_id
      AND b.is_active = true
    GROUP BY b.id, b.name, b.amount;
    
    -- Calcular progreso de metas
    SELECT jsonb_agg(
        jsonb_build_object(
            'goal_id', g.id,
            'goal_name', g.name,
            'target', g.target_amount,
            'current', g.current_amount,
            'percentage', ROUND((g.current_amount / g.target_amount * 100)::numeric, 2),
            'status', g.status
        )
    )
    INTO v_goals_progress
    FROM public.goals g
    WHERE g.user_id = p_user_id
      AND g.status = 'active';
    
    -- Obtener datos completos para IA (transacciones, categorías, presupuestos)
    SELECT jsonb_build_object(
        'transactions', (
            SELECT jsonb_agg(
                jsonb_build_object(
                    'id', t.id,
                    'type', t.type,
                    'amount', t.amount,
                    'description', t.description,
                    'date', t.date,
                    'category', c.name,
                    'payment_method', t.payment_method,
                    'tags', t.tags
                )
            )
            FROM public.transactions t
            LEFT JOIN public.categories c ON t.category_id = c.id
            WHERE t.user_id = p_user_id
              AND DATE_TRUNC('month', t.date)::DATE = v_target_month
        ),
        'categories', (
            SELECT jsonb_agg(
                jsonb_build_object(
                    'id', c.id,
                    'name', c.name,
                    'type', c.type,
                    'icon', c.icon,
                    'color', c.color
                )
            )
            FROM public.categories c
            WHERE c.user_id = p_user_id
              AND c.is_active = true
        ),
        'budgets', (
            SELECT jsonb_agg(
                jsonb_build_object(
                    'id', b.id,
                    'name', b.name,
                    'amount', b.amount,
                    'period', b.period
                )
            )
            FROM public.budgets b
            WHERE b.user_id = p_user_id
              AND b.is_active = true
        ),
        'goals', (
            SELECT jsonb_agg(
                jsonb_build_object(
                    'id', g.id,
                    'name', g.name,
                    'target', g.target_amount,
                    'current', g.current_amount,
                    'status', g.status
                )
            )
            FROM public.goals g
            WHERE g.user_id = p_user_id
              AND g.status = 'active'
        )
    )
    INTO v_full_data;
    
    -- Calcular ahorros (ya está calculado arriba como v_total_income - v_total_expenses)
    
    -- Crear el resumen mensual
    INSERT INTO public.monthly_summaries (
        user_id,
        month_year,
        total_income,
        total_expenses,
        total_savings,
        currency,
        transaction_count,
        income_count,
        expense_count,
        category_breakdown,
        budget_summary,
        goals_achieved,
        goals_progress,
        full_data,
        closed_at,
        closed_by,
        is_final
    )
    VALUES (
        p_user_id,
        v_target_month,
        v_total_income,
        v_total_expenses,
        v_total_income - v_total_expenses,
        v_currency,
        v_transaction_count,
        v_income_count,
        v_expense_count,
        COALESCE(v_category_breakdown, '{}'::jsonb),
        COALESCE(v_budget_summary, '{}'::jsonb),
        0, -- goals_achieved se calcula después
        COALESCE(v_goals_progress, '[]'::jsonb),
        COALESCE(v_full_data, '{}'::jsonb),
        NOW(),
        'system',
        true
    )
    RETURNING id INTO v_summary_id;
    
    -- Limpiar datos antiguos según límites del plan
    PERFORM cleanup_old_monthly_summaries(p_user_id);
    
    RETURN v_summary_id;
END;
$$;

-- ============================================================================
-- 7. FUNCIÓN: Limpiar resúmenes antiguos según límites del plan
-- ============================================================================
CREATE OR REPLACE FUNCTION cleanup_old_monthly_summaries(p_user_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_limits RECORD;
    v_cutoff_date DATE;
    v_deleted_count INTEGER;
BEGIN
    -- Obtener límites del plan
    SELECT * INTO v_limits FROM get_plan_limits(p_user_id);
    
    -- Calcular fecha de corte
    v_cutoff_date := DATE_TRUNC('month', CURRENT_DATE)::DATE - (v_limits.months_history || ' months')::INTERVAL;
    
    -- Eliminar resúmenes más antiguos que el límite
    DELETE FROM public.monthly_summaries
    WHERE user_id = p_user_id
      AND month_year < v_cutoff_date;
    
    GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
    
    RETURN v_deleted_count;
END;
$$;

-- ============================================================================
-- 8. FUNCIÓN: Notificar cierre mensual (2 días antes)
-- ============================================================================
CREATE OR REPLACE FUNCTION notify_monthly_closure()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_notified_count INTEGER := 0;
    v_user_record RECORD;
    v_target_month DATE;
    v_existing_notification UUID;
BEGIN
    -- Calcular el mes objetivo (próximo mes)
    v_target_month := DATE_TRUNC('month', CURRENT_DATE + INTERVAL '1 month')::DATE;
    
    -- Obtener todos los usuarios activos
    FOR v_user_record IN
        SELECT DISTINCT user_id
        FROM public.transactions
        WHERE DATE_TRUNC('month', date)::DATE >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '2 months')::DATE
    LOOP
        -- Verificar si ya se envió notificación
        SELECT id INTO v_existing_notification
        FROM public.monthly_closure_notifications
        WHERE user_id = v_user_record.user_id
          AND target_month = v_target_month
          AND notification_type = 'reminder';
        
        -- Si no existe, crear notificación
        IF v_existing_notification IS NULL THEN
            INSERT INTO public.monthly_closure_notifications (
                user_id,
                target_month,
                notification_type
            )
            VALUES (
                v_user_record.user_id,
                v_target_month,
                'reminder'
            );
            
            -- También crear una alerta visible en la app
            INSERT INTO public.alerts (
                user_id,
                type,
                title,
                message,
                recommendation,
                priority,
                expires_at
            )
            VALUES (
                v_user_record.user_id,
                'info',
                'Cierre Mensual Próximo',
                format('El mes se cerrará automáticamente en 2 días. Puedes cerrarlo manualmente ahora si lo deseas.'),
                'Puedes cerrar el mes manualmente desde la configuración para tener más control.',
                5,
                v_target_month + INTERVAL '1 day'
            );
            
            v_notified_count := v_notified_count + 1;
        END IF;
    END LOOP;
    
    RETURN v_notified_count;
END;
$$;

-- ============================================================================
-- 9. FUNCIÓN: Cerrar mes para todos los usuarios (ejecutar al final del mes)
-- ============================================================================
CREATE OR REPLACE FUNCTION close_month_for_all_users()
RETURNS TABLE (
    user_id UUID,
    summary_id UUID,
    month_year DATE,
    success BOOLEAN,
    error_message TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user_record RECORD;
    v_summary_id UUID;
    v_error_message TEXT;
BEGIN
    FOR v_user_record IN
        SELECT DISTINCT user_id
        FROM public.transactions
        WHERE DATE_TRUNC('month', date)::DATE = DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')::DATE
    LOOP
        BEGIN
            -- Cerrar mes para este usuario
            v_summary_id := close_month_automatically(v_user_record.user_id);
            
            -- Retornar éxito
            user_id := v_user_record.user_id;
            summary_id := v_summary_id;
            month_year := DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')::DATE;
            success := true;
            error_message := NULL;
            RETURN NEXT;
            
        EXCEPTION WHEN OTHERS THEN
            -- Retornar error
            user_id := v_user_record.user_id;
            summary_id := NULL;
            month_year := DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')::DATE;
            success := false;
            error_message := SQLERRM;
            RETURN NEXT;
        END;
    END LOOP;
    
    RETURN;
END;
$$;

-- ============================================================================
-- 10. FUNCIÓN: Obtener datos históricos para IA (con límites del plan)
-- ============================================================================
CREATE OR REPLACE FUNCTION get_historical_data_for_ai(
    p_user_id UUID,
    p_analysis_type TEXT DEFAULT 'general'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_limits RECORD;
    v_cutoff_date DATE;
    v_result JSONB;
BEGIN
    -- Obtener límites del plan
    SELECT * INTO v_limits FROM get_plan_limits(p_user_id);
    
    -- Calcular fecha de corte
    v_cutoff_date := DATE_TRUNC('month', CURRENT_DATE)::DATE - (v_limits.months_history || ' months')::INTERVAL;
    
    -- Construir respuesta según tipo de análisis
    SELECT jsonb_build_object(
        'user_id', p_user_id,
        'plan', v_limits.plan_name,
        'months_available', v_limits.months_history,
        'cutoff_date', v_cutoff_date,
        'monthly_summaries', (
            SELECT jsonb_agg(
                jsonb_build_object(
                    'month', month_year,
                    'income', total_income,
                    'expenses', total_expenses,
                    'savings', total_savings,
                    'transaction_count', transaction_count,
                    'category_breakdown', category_breakdown,
                    'budget_summary', budget_summary,
                    'goals_progress', goals_progress,
                    'full_data', full_data
                )
                ORDER BY month_year DESC
            )
            FROM public.monthly_summaries
            WHERE user_id = p_user_id
              AND month_year >= v_cutoff_date
        ),
        'analysis_type', p_analysis_type,
        'generated_at', NOW()
    )
    INTO v_result;
    
    RETURN v_result;
END;
$$;

-- ============================================================================
-- 11. FUNCIÓN: Registrar descarga de resumen mensual
-- ============================================================================
CREATE OR REPLACE FUNCTION download_monthly_summary(
    p_user_id UUID,
    p_monthly_summary_id UUID,
    p_format TEXT DEFAULT 'json',
    p_ip_address INET DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_can_download JSONB;
    v_summary RECORD;
    v_download_id UUID;
    v_result JSONB;
BEGIN
    -- Verificar si puede descargar
    v_can_download := can_download_monthly_summary(p_user_id, p_monthly_summary_id);
    
    IF (v_can_download->>'can_download')::boolean = false THEN
        RETURN v_can_download;
    END IF;
    
    -- Obtener el resumen
    SELECT * INTO v_summary
    FROM public.monthly_summaries
    WHERE id = p_monthly_summary_id
      AND user_id = p_user_id;
    
    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Resumen mensual no encontrado'
        );
    END IF;
    
    -- Registrar la descarga
    INSERT INTO public.monthly_downloads (
        user_id,
        monthly_summary_id,
        format,
        ip_address,
        user_agent
    )
    VALUES (
        p_user_id,
        p_monthly_summary_id,
        p_format,
        p_ip_address,
        p_user_agent
    )
    RETURNING id INTO v_download_id;
    
    -- Retornar datos del resumen según formato
    v_result := jsonb_build_object(
        'success', true,
        'download_id', v_download_id,
        'format', p_format,
        'summary', jsonb_build_object(
            'month', v_summary.month_year,
            'income', v_summary.total_income,
            'expenses', v_summary.total_expenses,
            'savings', v_summary.total_savings,
            'currency', v_summary.currency,
            'transaction_count', v_summary.transaction_count,
            'category_breakdown', v_summary.category_breakdown,
            'budget_summary', v_summary.budget_summary,
            'goals_progress', v_summary.goals_progress,
            'full_data', v_summary.full_data
        ),
        'download_info', v_can_download
    );
    
    RETURN v_result;
END;
$$;

-- ============================================================================
-- 12. POLÍTICAS RLS
-- ============================================================================

-- Habilitar RLS en todas las tablas
ALTER TABLE public.monthly_summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monthly_downloads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monthly_closure_notifications ENABLE ROW LEVEL SECURITY;

-- Políticas para monthly_summaries
DROP POLICY IF EXISTS "Users can view own monthly summaries" ON public.monthly_summaries;
CREATE POLICY "Users can view own monthly summaries"
    ON public.monthly_summaries
    FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own monthly summaries" ON public.monthly_summaries;
CREATE POLICY "Users can insert own monthly summaries"
    ON public.monthly_summaries
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Políticas para monthly_downloads
DROP POLICY IF EXISTS "Users can view own downloads" ON public.monthly_downloads;
CREATE POLICY "Users can view own downloads"
    ON public.monthly_downloads
    FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own downloads" ON public.monthly_downloads;
CREATE POLICY "Users can insert own downloads"
    ON public.monthly_downloads
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Políticas para monthly_closure_notifications
DROP POLICY IF EXISTS "Users can view own notifications" ON public.monthly_closure_notifications;
CREATE POLICY "Users can view own notifications"
    ON public.monthly_closure_notifications
    FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own notifications" ON public.monthly_closure_notifications;
CREATE POLICY "Users can update own notifications"
    ON public.monthly_closure_notifications
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- 13. TRIGGERS para updated_at
-- ============================================================================

CREATE OR REPLACE FUNCTION update_monthly_summaries_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_monthly_summaries_updated_at ON public.monthly_summaries;
CREATE TRIGGER trigger_update_monthly_summaries_updated_at
    BEFORE UPDATE ON public.monthly_summaries
    FOR EACH ROW
    EXECUTE FUNCTION update_monthly_summaries_updated_at();

-- ============================================================================
-- 14. COMENTARIOS Y DOCUMENTACIÓN
-- ============================================================================

COMMENT ON TABLE public.monthly_summaries IS 'Resúmenes mensuales archivados de los usuarios. Contiene datos completos para análisis de IA.';
COMMENT ON TABLE public.monthly_downloads IS 'Registro de descargas de resúmenes mensuales para control de límites por plan.';
COMMENT ON TABLE public.monthly_closure_notifications IS 'Notificaciones de cierre mensual enviadas a los usuarios.';

COMMENT ON FUNCTION close_month_automatically IS 'Cierra automáticamente un mes para un usuario, archivando todos los datos.';
COMMENT ON FUNCTION notify_monthly_closure IS 'Envía notificaciones 2 días antes del cierre mensual.';
COMMENT ON FUNCTION get_historical_data_for_ai IS 'Obtiene datos históricos para análisis de IA respetando límites del plan.';
COMMENT ON FUNCTION download_monthly_summary IS 'Registra y retorna un resumen mensual para descarga, verificando límites.';

