-- =====================================================
-- FASE 1: MEJORAS CRÍTICAS Y OPTIMIZACIONES
-- =====================================================
-- Este script añade mejoras críticas al esquema base:
-- 1. Funciones helper para creación de alertas
-- 2. Triggers automáticos para alertas inteligentes
-- 3. Validaciones mejoradas
-- 4. Índices adicionales para performance
-- 5. Funciones de agregación para dashboards
-- =====================================================

-- =====================================================
-- 1. FUNCIÓN PARA CREAR ALERTAS (Service Role)
-- =====================================================
-- Esta función permite crear alertas desde backend/edge functions
CREATE OR REPLACE FUNCTION create_alert(
    p_user_id UUID,
    p_type TEXT,
    p_title TEXT,
    p_message TEXT,
    p_recommendation TEXT DEFAULT NULL,
    p_category_id UUID DEFAULT NULL,
    p_budget_id UUID DEFAULT NULL,
    p_goal_id UUID DEFAULT NULL,
    p_transaction_id UUID DEFAULT NULL,
    p_priority INTEGER DEFAULT 5,
    p_metadata JSONB DEFAULT '{}'::jsonb,
    p_expires_at TIMESTAMPTZ DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER -- Se ejecuta con permisos del owner (bypassing RLS)
AS $$
DECLARE
    v_alert_id UUID;
BEGIN
    -- Validar tipo
    IF p_type NOT IN ('critical', 'warning', 'info', 'opportunity', 'trend') THEN
        RAISE EXCEPTION 'Tipo de alerta inválido: %', p_type;
    END IF;

    -- Validar prioridad
    IF p_priority < 1 OR p_priority > 10 THEN
        RAISE EXCEPTION 'Prioridad debe estar entre 1 y 10';
    END IF;

    -- Crear la alerta
    INSERT INTO public.alerts (
        user_id,
        type,
        title,
        message,
        recommendation,
        category_id,
        budget_id,
        goal_id,
        transaction_id,
        priority,
        metadata,
        expires_at
    ) VALUES (
        p_user_id,
        p_type,
        p_title,
        p_message,
        p_recommendation,
        p_category_id,
        p_budget_id,
        p_goal_id,
        p_transaction_id,
        p_priority,
        p_metadata,
        p_expires_at
    )
    RETURNING id INTO v_alert_id;

    RETURN v_alert_id;
END;
$$;

COMMENT ON FUNCTION create_alert IS 'Crea alertas inteligentes para el usuario. Solo accesible desde backend/edge functions con service_role.';

-- =====================================================
-- 2. TRIGGER: ALERTA CUANDO PRESUPUESTO SUPERA 80%
-- =====================================================
CREATE OR REPLACE FUNCTION check_budget_threshold()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_budget RECORD;
    v_spent DECIMAL(12, 2);
    v_percentage DECIMAL(5, 2);
BEGIN
    -- Si la transacción está siendo eliminada, no hacer nada
    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    END IF;

    -- Obtener información del presupuesto relacionado (si existe)
    IF NEW.category_id IS NOT NULL THEN
        -- Buscar presupuesto activo para esta categoría
        SELECT * INTO v_budget
        FROM public.budgets
        WHERE category_id = NEW.category_id
        AND user_id = NEW.user_id
        AND is_active = true
        AND NEW.date BETWEEN period_start AND period_end
        LIMIT 1;

        IF FOUND THEN
            -- Calcular gasto total en el período
            SELECT COALESCE(SUM(amount), 0) INTO v_spent
            FROM public.transactions
            WHERE user_id = NEW.user_id
            AND category_id = NEW.category_id
            AND type = 'expense'
            AND date BETWEEN v_budget.period_start AND v_budget.period_end;

            -- Calcular porcentaje
            v_percentage := (v_spent / v_budget.amount) * 100;

            -- Crear alerta si supera 80%
            IF v_percentage >= 80 AND v_percentage < 100 THEN
                PERFORM create_alert(
                    NEW.user_id,
                    'warning',
                    '⚠️ Presupuesto casi agotado',
                    format('Has gastado %s%% de tu presupuesto "%s"', ROUND(v_percentage, 0), v_budget.name),
                    'Considera reducir gastos en esta categoría para no exceder tu presupuesto.',
                    NEW.category_id,
                    v_budget.id,
                    NULL,
                    NEW.id,
                    3,
                    jsonb_build_object(
                        'spent', v_spent,
                        'budget', v_budget.amount,
                        'percentage', v_percentage
                    ),
                    v_budget.period_end
                );
            ELSIF v_percentage >= 100 THEN
                PERFORM create_alert(
                    NEW.user_id,
                    'critical',
                    '🚨 Presupuesto excedido',
                    format('Has excedido tu presupuesto "%s" por %s', v_budget.name,
                           (v_spent - v_budget.amount)::TEXT || ' ' || NEW.currency),
                    'Revisa tus gastos y ajusta tu presupuesto o reduce gastos futuros.',
                    NEW.category_id,
                    v_budget.id,
                    NULL,
                    NEW.id,
                    1,
                    jsonb_build_object(
                        'spent', v_spent,
                        'budget', v_budget.amount,
                        'percentage', v_percentage,
                        'overspent', v_spent - v_budget.amount
                    ),
                    v_budget.period_end
                );
            END IF;
        END IF;
    END IF;

    RETURN NEW;
END;
$$;

-- Trigger para transacciones
DROP TRIGGER IF EXISTS trigger_check_budget_threshold ON public.transactions;
CREATE TRIGGER trigger_check_budget_threshold
    AFTER INSERT OR UPDATE ON public.transactions
    FOR EACH ROW
    WHEN (NEW.type = 'expense')
    EXECUTE FUNCTION check_budget_threshold();

-- =====================================================
-- 3. TRIGGER: ALERTA DE GASTO INUSUAL
-- =====================================================
CREATE OR REPLACE FUNCTION check_unusual_expense()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_avg_expense DECIMAL(12, 2);
    v_std_dev DECIMAL(12, 2);
BEGIN
    -- Solo para gastos
    IF NEW.type != 'expense' THEN
        RETURN NEW;
    END IF;

    -- Calcular promedio y desviación estándar de gastos en la misma categoría
    SELECT
        AVG(amount),
        STDDEV(amount)
    INTO v_avg_expense, v_std_dev
    FROM public.transactions
    WHERE user_id = NEW.user_id
    AND category_id = NEW.category_id
    AND type = 'expense'
    AND date >= CURRENT_DATE - INTERVAL '90 days'
    AND id != NEW.id; -- Excluir la transacción actual

    -- Si el gasto es 2x desviaciones estándar mayor que el promedio
    IF v_avg_expense IS NOT NULL AND v_std_dev IS NOT NULL
       AND NEW.amount > (v_avg_expense + (2 * v_std_dev)) THEN
        PERFORM create_alert(
            NEW.user_id,
            'info',
            '💡 Gasto inusual detectado',
            format('Tu gasto de %s es significativamente mayor al promedio de %s en esta categoría',
                   NEW.amount::TEXT || ' ' || NEW.currency,
                   ROUND(v_avg_expense, 2)::TEXT || ' ' || NEW.currency),
            'Verifica que este gasto sea correcto y considera si afectará tu presupuesto.',
            NEW.category_id,
            NULL,
            NULL,
            NEW.id,
            5,
            jsonb_build_object(
                'amount', NEW.amount,
                'average', v_avg_expense,
                'std_dev', v_std_dev
            ),
            CURRENT_DATE + INTERVAL '7 days'
        );
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_check_unusual_expense ON public.transactions;
CREATE TRIGGER trigger_check_unusual_expense
    AFTER INSERT ON public.transactions
    FOR EACH ROW
    EXECUTE FUNCTION check_unusual_expense();

-- =====================================================
-- 4. TRIGGER: ALERTA DE PROGRESO DE META
-- =====================================================
CREATE OR REPLACE FUNCTION check_goal_progress()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_goal RECORD;
    v_progress DECIMAL(5, 2);
BEGIN
    -- Obtener información de la meta relacionada (si existe)
    SELECT * INTO v_goal
    FROM public.goals
    WHERE id = NEW.goal_id
    AND user_id = NEW.user_id;

    IF FOUND AND v_goal.status = 'active' THEN
        -- Calcular progreso
        v_progress := (NEW.current_amount / v_goal.target_amount) * 100;

        -- Alertas en hitos: 25%, 50%, 75%, 100%
        IF v_progress >= 25 AND v_progress < 50
           AND (OLD.current_amount IS NULL OR (OLD.current_amount / v_goal.target_amount * 100) < 25) THEN
            PERFORM create_alert(
                NEW.user_id,
                'opportunity',
                '🎯 ¡25% completado!',
                format('Has alcanzado el 25%% de tu meta "%s". ¡Sigue así!', v_goal.name),
                format('Te quedan %s para completar tu meta.',
                       (v_goal.target_amount - NEW.current_amount)::TEXT || ' ' || v_goal.currency),
                NULL,
                NULL,
                v_goal.id,
                NULL,
                6,
                jsonb_build_object('milestone', 25, 'progress', v_progress),
                v_goal.deadline
            );
        ELSIF v_progress >= 50 AND v_progress < 75
              AND (OLD.current_amount IS NULL OR (OLD.current_amount / v_goal.target_amount * 100) < 50) THEN
            PERFORM create_alert(
                NEW.user_id,
                'opportunity',
                '🎯 ¡Mitad del camino!',
                format('Has alcanzado el 50%% de tu meta "%s". ¡Vas muy bien!', v_goal.name),
                format('Te quedan %s para completar tu meta.',
                       (v_goal.target_amount - NEW.current_amount)::TEXT || ' ' || v_goal.currency),
                NULL,
                NULL,
                v_goal.id,
                NULL,
                6,
                jsonb_build_object('milestone', 50, 'progress', v_progress),
                v_goal.deadline
            );
        ELSIF v_progress >= 75 AND v_progress < 100
              AND (OLD.current_amount IS NULL OR (OLD.current_amount / v_goal.target_amount * 100) < 75) THEN
            PERFORM create_alert(
                NEW.user_id,
                'opportunity',
                '🎯 ¡Casi lo logras!',
                format('Has alcanzado el 75%% de tu meta "%s". ¡Un último esfuerzo!', v_goal.name),
                format('Solo te quedan %s para completar tu meta.',
                       (v_goal.target_amount - NEW.current_amount)::TEXT || ' ' || v_goal.currency),
                NULL,
                NULL,
                v_goal.id,
                NULL,
                4,
                jsonb_build_object('milestone', 75, 'progress', v_progress),
                v_goal.deadline
            );
        ELSIF v_progress >= 100
              AND (OLD.current_amount IS NULL OR (OLD.current_amount / v_goal.target_amount * 100) < 100) THEN
            PERFORM create_alert(
                NEW.user_id,
                'opportunity',
                '🎉 ¡Meta alcanzada!',
                format('¡Felicitaciones! Has completado tu meta "%s"', v_goal.name),
                'Considera crear una nueva meta o aumentar el objetivo de esta.',
                NULL,
                NULL,
                v_goal.id,
                NULL,
                2,
                jsonb_build_object('milestone', 100, 'progress', v_progress),
                NULL -- No expira
            );
        END IF;
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_check_goal_progress ON public.goals;
CREATE TRIGGER trigger_check_goal_progress
    AFTER INSERT OR UPDATE OF current_amount ON public.goals
    FOR EACH ROW
    EXECUTE FUNCTION check_goal_progress();

-- =====================================================
-- 5. FUNCIÓN: LIMPIAR ALERTAS EXPIRADAS
-- =====================================================
CREATE OR REPLACE FUNCTION cleanup_expired_alerts()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_deleted INTEGER;
BEGIN
    -- Marcar como dismissed las alertas expiradas que no han sido leídas
    UPDATE public.alerts
    SET is_dismissed = true,
        dismissed_at = NOW()
    WHERE expires_at < NOW()
    AND is_dismissed = false;

    GET DIAGNOSTICS v_deleted = ROW_COUNT;

    RETURN v_deleted;
END;
$$;

COMMENT ON FUNCTION cleanup_expired_alerts IS 'Marca como dismissed las alertas que han expirado. Retorna el número de alertas actualizadas.';

-- =====================================================
-- 6. FUNCIONES DE AGREGACIÓN PARA DASHBOARDS
-- =====================================================

-- Resumen de gastos por categoría (último mes)
CREATE OR REPLACE FUNCTION get_expenses_by_category(p_user_id UUID, p_days INTEGER DEFAULT 30)
RETURNS TABLE (
    category_id UUID,
    category_name TEXT,
    total_amount DECIMAL(12, 2),
    transaction_count INTEGER,
    avg_amount DECIMAL(12, 2)
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT
        t.category_id,
        COALESCE(c.name, 'Sin categoría') as category_name,
        SUM(t.amount)::DECIMAL(12, 2) as total_amount,
        COUNT(t.id)::INTEGER as transaction_count,
        AVG(t.amount)::DECIMAL(12, 2) as avg_amount
    FROM public.transactions t
    LEFT JOIN public.categories c ON c.id = t.category_id
    WHERE t.user_id = p_user_id
    AND t.type = 'expense'
    AND t.date >= CURRENT_DATE - (p_days || ' days')::INTERVAL
    GROUP BY t.category_id, c.name
    ORDER BY total_amount DESC;
END;
$$;

-- Balance de gastos compartidos (quién debe a quién)
CREATE OR REPLACE FUNCTION get_shared_expense_balances(p_user_id UUID)
RETURNS TABLE (
    other_user_id UUID,
    balance DECIMAL(12, 2),
    balance_type TEXT -- 'owes_me' o 'i_owe'
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    WITH my_payments AS (
        -- Gastos que yo pagué
        SELECT
            ses.user_id as other_user_id,
            SUM(ses.amount) as owed_to_me
        FROM public.shared_expenses se
        JOIN public.shared_expense_splits ses ON ses.shared_expense_id = se.id
        WHERE se.paid_by_user_id = p_user_id
        AND ses.user_id != p_user_id
        AND ses.is_settled = false
        AND se.status = 'pending'
        GROUP BY ses.user_id
    ),
    others_payments AS (
        -- Gastos que otros pagaron y yo debo
        SELECT
            se.paid_by_user_id as other_user_id,
            SUM(ses.amount) as i_owe
        FROM public.shared_expenses se
        JOIN public.shared_expense_splits ses ON ses.shared_expense_id = se.id
        WHERE ses.user_id = p_user_id
        AND se.paid_by_user_id != p_user_id
        AND ses.is_settled = false
        AND se.status = 'pending'
        GROUP BY se.paid_by_user_id
    )
    SELECT
        COALESCE(mp.other_user_id, op.other_user_id) as other_user_id,
        CASE
            WHEN COALESCE(mp.owed_to_me, 0) > COALESCE(op.i_owe, 0)
            THEN (COALESCE(mp.owed_to_me, 0) - COALESCE(op.i_owe, 0))::DECIMAL(12, 2)
            ELSE (COALESCE(op.i_owe, 0) - COALESCE(mp.owed_to_me, 0))::DECIMAL(12, 2)
        END as balance,
        CASE
            WHEN COALESCE(mp.owed_to_me, 0) > COALESCE(op.i_owe, 0)
            THEN 'owes_me'::TEXT
            ELSE 'i_owe'::TEXT
        END as balance_type
    FROM my_payments mp
    FULL OUTER JOIN others_payments op ON mp.other_user_id = op.other_user_id
    WHERE COALESCE(mp.owed_to_me, 0) != COALESCE(op.i_owe, 0);
END;
$$;

-- =====================================================
-- 7. ÍNDICES ADICIONALES PARA PERFORMANCE
-- =====================================================

-- Índice compuesto para consultas de transacciones por fecha y categoría
CREATE INDEX IF NOT EXISTS idx_transactions_user_date_category
ON public.transactions(user_id, date DESC, category_id)
WHERE type = 'expense';

-- Índice para alertas no leídas
CREATE INDEX IF NOT EXISTS idx_alerts_user_unread
ON public.alerts(user_id, created_at DESC)
WHERE is_read = false AND is_dismissed = false;

-- Índice para gastos compartidos pendientes
CREATE INDEX IF NOT EXISTS idx_shared_expense_splits_user_pending
ON public.shared_expense_splits(user_id)
WHERE is_settled = false;

-- Índice para presupuestos activos por período
CREATE INDEX IF NOT EXISTS idx_budgets_user_active_period
ON public.budgets(user_id, period_start, period_end)
WHERE is_active = true;

-- =====================================================
-- 8. VALIDACIÓN MEJORADA PARA SPLITS
-- =====================================================
-- Reemplazar la función existente con una versión mejorada
DROP FUNCTION IF EXISTS validate_expense_splits();
CREATE OR REPLACE FUNCTION validate_expense_splits()
RETURNS TRIGGER AS $$
DECLARE
    total_splits DECIMAL(12, 2);
    expense_amount DECIMAL(12, 2);
    split_count INTEGER;
BEGIN
    -- Obtener el monto total del gasto
    SELECT amount INTO expense_amount
    FROM public.shared_expenses
    WHERE id = NEW.shared_expense_id;

    IF expense_amount IS NULL THEN
        RAISE EXCEPTION 'El gasto compartido no existe';
    END IF;

    -- Calcular la suma de todos los splits
    SELECT
        COALESCE(SUM(amount), 0),
        COUNT(*)
    INTO total_splits, split_count
    FROM public.shared_expense_splits
    WHERE shared_expense_id = NEW.shared_expense_id;

    -- Validar que la suma no exceda el monto (con tolerancia de 0.01 para redondeo)
    IF total_splits > expense_amount + 0.01 THEN
        RAISE EXCEPTION 'La suma de las divisiones (%) excede el monto del gasto (%)',
                       total_splits, expense_amount;
    END IF;

    -- Si es el último split esperado, validar que sume exactamente
    -- (Esto asume que se conoce de antemano cuántos splits habrá)
    -- Por ahora solo advertimos si está muy lejos
    IF ABS(total_splits - expense_amount) > 0.05 AND split_count > 1 THEN
        RAISE WARNING 'La suma de las divisiones (%) difiere del monto del gasto (%) por más de 0.05',
                     total_splits, expense_amount;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 9. FUNCIÓN PARA AUTO-CREAR MEMBER AL CREAR GRUPO
-- =====================================================
CREATE OR REPLACE FUNCTION auto_add_creator_as_admin()
RETURNS TRIGGER AS $$
BEGIN
    -- Agregar al creador como admin del grupo
    INSERT INTO public.family_group_members (
        family_group_id,
        user_id,
        role,
        is_active
    ) VALUES (
        NEW.id,
        NEW.created_by,
        'admin',
        true
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_auto_add_creator_as_admin ON public.family_groups;
CREATE TRIGGER trigger_auto_add_creator_as_admin
    AFTER INSERT ON public.family_groups
    FOR EACH ROW
    EXECUTE FUNCTION auto_add_creator_as_admin();

-- =====================================================
-- 10. FUNCIÓN PARA AUTO-CREAR PREFERENCIAS
-- =====================================================
CREATE OR REPLACE FUNCTION auto_create_user_preferences()
RETURNS TRIGGER AS $$
BEGIN
    -- Crear preferencias por defecto para el usuario
    INSERT INTO public.profile_preferences (
        user_id,
        currency,
        language,
        date_format,
        number_format
    ) VALUES (
        NEW.id,
        'USD',
        'es',
        'DD/MM/YYYY',
        '1.234,56'
    )
    ON CONFLICT (user_id) DO NOTHING; -- Si ya existe, no hacer nada

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Este trigger requiere acceso a auth.users que solo se puede hacer con service_role
-- Lo comentamos aquí pero se puede activar desde el dashboard de Supabase
-- CREATE TRIGGER trigger_auto_create_user_preferences
--     AFTER INSERT ON auth.users
--     FOR EACH ROW
--     EXECUTE FUNCTION auto_create_user_preferences();

COMMENT ON FUNCTION auto_create_user_preferences IS 'Crea preferencias por defecto cuando se registra un nuevo usuario. Debe ser activado manualmente en auth.users desde Supabase Dashboard.';

-- =====================================================
-- RESUMEN DE MEJORAS
-- =====================================================
-- ✅ Función para crear alertas desde backend
-- ✅ Triggers automáticos para alertas inteligentes:
--    - Presupuesto superando 80%
--    - Presupuesto excedido
--    - Gasto inusual detectado
--    - Progreso de metas (25%, 50%, 75%, 100%)
-- ✅ Función para limpiar alertas expiradas
-- ✅ Funciones de agregación para dashboards
-- ✅ Índices adicionales para mejor performance
-- ✅ Validación mejorada de splits
-- ✅ Auto-agregar creador como admin en grupos
-- ✅ Auto-crear preferencias de usuario
-- =====================================================
