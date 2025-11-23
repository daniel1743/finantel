-- =====================================================
-- INSTALACIÓN LIMPIA SIN ERRORES - FINATEL v2.1
-- =====================================================
-- Este script instala DESDE CERO sin errores
-- Ejecuta este archivo SOLO si los anteriores dieron error
-- =====================================================

-- Habilitar extensiones
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- LIMPIAR TODO (SI EXISTE)
-- =====================================================

-- Desactivar RLS temporalmente para limpiar
ALTER TABLE IF EXISTS public.alerts DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.profile_preferences DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.shared_expense_splits DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.shared_expenses DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.family_group_members DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.family_groups DISABLE ROW LEVEL SECURITY;

-- Eliminar políticas existentes
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT schemaname, tablename, policyname
              FROM pg_policies
              WHERE schemaname = 'public'
              AND tablename IN ('family_groups', 'family_group_members', 'shared_expenses',
                               'shared_expense_splits', 'profile_preferences', 'alerts'))
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', r.policyname, r.schemaname, r.tablename);
    END LOOP;
END $$;

-- Eliminar triggers
DROP TRIGGER IF EXISTS validate_expense_splits_trigger ON public.shared_expense_splits;
DROP TRIGGER IF EXISTS trigger_auto_add_creator_as_admin ON public.family_groups;
DROP TRIGGER IF EXISTS update_family_groups_updated_at ON public.family_groups;
DROP TRIGGER IF EXISTS update_shared_expenses_updated_at ON public.shared_expenses;
DROP TRIGGER IF EXISTS update_profile_preferences_updated_at ON public.profile_preferences;
DROP TRIGGER IF EXISTS trigger_check_budget_threshold ON public.transactions;
DROP TRIGGER IF EXISTS trigger_check_unusual_expense ON public.transactions;
DROP TRIGGER IF EXISTS trigger_check_goal_progress ON public.goals;

-- Eliminar funciones
DROP FUNCTION IF EXISTS create_alert CASCADE;
DROP FUNCTION IF EXISTS cleanup_expired_alerts CASCADE;
DROP FUNCTION IF EXISTS get_expenses_by_category CASCADE;
DROP FUNCTION IF EXISTS get_shared_expense_balances CASCADE;
DROP FUNCTION IF EXISTS check_budget_threshold CASCADE;
DROP FUNCTION IF EXISTS check_unusual_expense CASCADE;
DROP FUNCTION IF EXISTS check_goal_progress CASCADE;
DROP FUNCTION IF EXISTS validate_expense_splits CASCADE;
DROP FUNCTION IF EXISTS auto_add_creator_as_admin CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column CASCADE;

-- Eliminar tablas (en orden correcto para evitar problemas de FK)
DROP TABLE IF EXISTS public.shared_expense_splits CASCADE;
DROP TABLE IF EXISTS public.shared_expenses CASCADE;
DROP TABLE IF EXISTS public.family_group_members CASCADE;
DROP TABLE IF EXISTS public.family_groups CASCADE;
DROP TABLE IF EXISTS public.profile_preferences CASCADE;
DROP TABLE IF EXISTS public.alerts CASCADE;

-- =====================================================
-- CREAR TABLAS DESDE CERO
-- =====================================================

-- 1. FAMILY_GROUPS
CREATE TABLE public.family_groups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    created_by UUID NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true,
    settings JSONB DEFAULT '{}'::jsonb,

    CONSTRAINT family_groups_name_check CHECK (char_length(name) >= 1 AND char_length(name) <= 100)
);

-- 2. FAMILY_GROUP_MEMBERS
CREATE TABLE public.family_group_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    family_group_id UUID NOT NULL REFERENCES public.family_groups(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member')),
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true,

    UNIQUE(family_group_id, user_id)
);

-- 3. SHARED_EXPENSES
CREATE TABLE public.shared_expenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    family_group_id UUID NOT NULL REFERENCES public.family_groups(id) ON DELETE CASCADE,
    paid_by_user_id UUID NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    amount DECIMAL(12, 2) NOT NULL CHECK (amount > 0),
    currency TEXT DEFAULT 'USD',
    expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
    category_id UUID,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'settled', 'cancelled')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'::jsonb,

    CONSTRAINT shared_expenses_title_check CHECK (char_length(title) >= 1 AND char_length(title) <= 200)
);

-- 4. SHARED_EXPENSE_SPLITS
CREATE TABLE public.shared_expense_splits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    shared_expense_id UUID NOT NULL REFERENCES public.shared_expenses(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    amount DECIMAL(12, 2) NOT NULL CHECK (amount >= 0),
    percentage DECIMAL(5, 2) CHECK (percentage >= 0 AND percentage <= 100),
    is_settled BOOLEAN DEFAULT false,
    settled_at TIMESTAMPTZ,
    notes TEXT,

    UNIQUE(shared_expense_id, user_id)
);

-- 5. PROFILE_PREFERENCES
CREATE TABLE public.profile_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE,

    currency TEXT DEFAULT 'USD' CHECK (currency IN ('USD', 'EUR', 'GBP', 'MXN', 'ARS', 'CLP', 'COP', 'PEN')),
    language TEXT DEFAULT 'es' CHECK (language IN ('es', 'en', 'pt')),
    date_format TEXT DEFAULT 'DD/MM/YYYY' CHECK (date_format IN ('DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD')),
    number_format TEXT DEFAULT '1.234,56' CHECK (number_format IN ('1.234,56', '1,234.56')),

    email_notifications BOOLEAN DEFAULT true,
    push_notifications BOOLEAN DEFAULT true,
    budget_alerts BOOLEAN DEFAULT true,
    goal_reminders BOOLEAN DEFAULT true,
    weekly_summary BOOLEAN DEFAULT true,
    monthly_report BOOLEAN DEFAULT true,

    default_view TEXT DEFAULT 'overview' CHECK (default_view IN ('overview', 'transactions', 'budgets', 'goals')),
    show_charts BOOLEAN DEFAULT true,
    compact_mode BOOLEAN DEFAULT false,

    share_analytics BOOLEAN DEFAULT false,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. ALERTS
CREATE TABLE public.alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,

    type TEXT NOT NULL CHECK (type IN ('critical', 'warning', 'info', 'opportunity', 'trend')),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    recommendation TEXT,

    category_id UUID,
    budget_id UUID,
    goal_id UUID,
    transaction_id UUID,

    priority INTEGER DEFAULT 5 CHECK (priority >= 1 AND priority <= 10),
    is_read BOOLEAN DEFAULT false,
    is_dismissed BOOLEAN DEFAULT false,
    action_taken BOOLEAN DEFAULT false,

    metadata JSONB DEFAULT '{}'::jsonb,
    expires_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    read_at TIMESTAMPTZ,
    dismissed_at TIMESTAMPTZ,

    CONSTRAINT alerts_title_check CHECK (char_length(title) >= 1 AND char_length(title) <= 200),
    CONSTRAINT alerts_message_check CHECK (char_length(message) >= 1 AND char_length(message) <= 1000)
);

-- =====================================================
-- CREAR ÍNDICES
-- =====================================================

CREATE INDEX idx_family_groups_created_by ON public.family_groups(created_by);
CREATE INDEX idx_family_groups_active ON public.family_groups(is_active);

CREATE INDEX idx_family_group_members_group ON public.family_group_members(family_group_id);
CREATE INDEX idx_family_group_members_user ON public.family_group_members(user_id);
CREATE INDEX idx_family_group_members_active ON public.family_group_members(is_active);

CREATE INDEX idx_shared_expenses_group ON public.shared_expenses(family_group_id);
CREATE INDEX idx_shared_expenses_paid_by ON public.shared_expenses(paid_by_user_id);
CREATE INDEX idx_shared_expenses_status ON public.shared_expenses(status);
CREATE INDEX idx_shared_expenses_date ON public.shared_expenses(expense_date);

CREATE INDEX idx_shared_expense_splits_expense ON public.shared_expense_splits(shared_expense_id);
CREATE INDEX idx_shared_expense_splits_user ON public.shared_expense_splits(user_id);
CREATE INDEX idx_shared_expense_splits_settled ON public.shared_expense_splits(is_settled);

CREATE INDEX idx_profile_preferences_user ON public.profile_preferences(user_id);

CREATE INDEX idx_alerts_user ON public.alerts(user_id);
CREATE INDEX idx_alerts_type ON public.alerts(type);
CREATE INDEX idx_alerts_read ON public.alerts(is_read);
CREATE INDEX idx_alerts_dismissed ON public.alerts(is_dismissed);
CREATE INDEX idx_alerts_priority ON public.alerts(priority);
CREATE INDEX idx_alerts_created ON public.alerts(created_at DESC);

-- =====================================================
-- HABILITAR RLS
-- =====================================================

ALTER TABLE public.family_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.family_group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shared_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shared_expense_splits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- CREAR POLÍTICAS RLS (Simplificadas)
-- =====================================================

-- FAMILY_GROUPS
CREATE POLICY "fg_select" ON public.family_groups FOR SELECT
USING (EXISTS (
    SELECT 1 FROM public.family_group_members
    WHERE family_group_members.family_group_id = family_groups.id
    AND family_group_members.user_id = auth.uid()
    AND family_group_members.is_active = true
));

CREATE POLICY "fg_insert" ON public.family_groups FOR INSERT
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "fg_update" ON public.family_groups FOR UPDATE
USING (EXISTS (
    SELECT 1 FROM public.family_group_members
    WHERE family_group_members.family_group_id = family_groups.id
    AND family_group_members.user_id = auth.uid()
    AND family_group_members.role = 'admin'
));

CREATE POLICY "fg_delete" ON public.family_groups FOR DELETE
USING (auth.uid() = created_by);

-- FAMILY_GROUP_MEMBERS
CREATE POLICY "fgm_select" ON public.family_group_members FOR SELECT
USING (EXISTS (
    SELECT 1 FROM public.family_group_members fgm
    WHERE fgm.family_group_id = family_group_members.family_group_id
    AND fgm.user_id = auth.uid()
));

CREATE POLICY "fgm_insert" ON public.family_group_members FOR INSERT
WITH CHECK (EXISTS (
    SELECT 1 FROM public.family_group_members
    WHERE family_group_id = family_group_members.family_group_id
    AND user_id = auth.uid()
    AND role = 'admin'
));

CREATE POLICY "fgm_update" ON public.family_group_members FOR UPDATE
USING (EXISTS (
    SELECT 1 FROM public.family_group_members
    WHERE family_group_id = family_group_members.family_group_id
    AND user_id = auth.uid()
    AND role = 'admin'
));

CREATE POLICY "fgm_delete" ON public.family_group_members FOR DELETE
USING (user_id = auth.uid() OR EXISTS (
    SELECT 1 FROM public.family_group_members fgm
    WHERE fgm.family_group_id = family_group_members.family_group_id
    AND fgm.user_id = auth.uid()
    AND fgm.role = 'admin'
));

-- SHARED_EXPENSES
CREATE POLICY "se_select" ON public.shared_expenses FOR SELECT
USING (EXISTS (
    SELECT 1 FROM public.family_group_members
    WHERE family_group_members.family_group_id = shared_expenses.family_group_id
    AND family_group_members.user_id = auth.uid()
));

CREATE POLICY "se_insert" ON public.shared_expenses FOR INSERT
WITH CHECK (auth.uid() = paid_by_user_id AND EXISTS (
    SELECT 1 FROM public.family_group_members
    WHERE family_group_members.family_group_id = shared_expenses.family_group_id
    AND family_group_members.user_id = auth.uid()
));

CREATE POLICY "se_update" ON public.shared_expenses FOR UPDATE
USING (paid_by_user_id = auth.uid() OR EXISTS (
    SELECT 1 FROM public.family_group_members
    WHERE family_group_members.family_group_id = shared_expenses.family_group_id
    AND family_group_members.user_id = auth.uid()
    AND family_group_members.role = 'admin'
));

CREATE POLICY "se_delete" ON public.shared_expenses FOR DELETE
USING (paid_by_user_id = auth.uid() OR EXISTS (
    SELECT 1 FROM public.family_group_members
    WHERE family_group_members.family_group_id = shared_expenses.family_group_id
    AND family_group_members.user_id = auth.uid()
    AND family_group_members.role = 'admin'
));

-- SHARED_EXPENSE_SPLITS
CREATE POLICY "ses_select" ON public.shared_expense_splits FOR SELECT
USING (EXISTS (
    SELECT 1 FROM public.shared_expenses se
    JOIN public.family_group_members fgm ON fgm.family_group_id = se.family_group_id
    WHERE se.id = shared_expense_splits.shared_expense_id
    AND fgm.user_id = auth.uid()
));

CREATE POLICY "ses_insert" ON public.shared_expense_splits FOR INSERT
WITH CHECK (EXISTS (
    SELECT 1 FROM public.shared_expenses se
    WHERE se.id = shared_expense_splits.shared_expense_id
    AND (se.paid_by_user_id = auth.uid() OR EXISTS (
        SELECT 1 FROM public.family_group_members fgm
        WHERE fgm.family_group_id = se.family_group_id
        AND fgm.user_id = auth.uid()
        AND fgm.role = 'admin'
    ))
));

CREATE POLICY "ses_update" ON public.shared_expense_splits FOR UPDATE
USING (user_id = auth.uid() OR EXISTS (
    SELECT 1 FROM public.shared_expenses se
    WHERE se.id = shared_expense_splits.shared_expense_id
    AND (se.paid_by_user_id = auth.uid() OR EXISTS (
        SELECT 1 FROM public.family_group_members fgm
        WHERE fgm.family_group_id = se.family_group_id
        AND fgm.user_id = auth.uid()
        AND fgm.role = 'admin'
    ))
));

CREATE POLICY "ses_delete" ON public.shared_expense_splits FOR DELETE
USING (EXISTS (
    SELECT 1 FROM public.shared_expenses se
    WHERE se.id = shared_expense_splits.shared_expense_id
    AND (se.paid_by_user_id = auth.uid() OR EXISTS (
        SELECT 1 FROM public.family_group_members fgm
        WHERE fgm.family_group_id = se.family_group_id
        AND fgm.user_id = auth.uid()
        AND fgm.role = 'admin'
    ))
));

-- PROFILE_PREFERENCES
CREATE POLICY "pp_select" ON public.profile_preferences FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "pp_insert" ON public.profile_preferences FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "pp_update" ON public.profile_preferences FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "pp_delete" ON public.profile_preferences FOR DELETE
USING (auth.uid() = user_id);

-- ALERTS
CREATE POLICY "alerts_select" ON public.alerts FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "alerts_update" ON public.alerts FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "alerts_delete" ON public.alerts FOR DELETE
USING (auth.uid() = user_id);

-- =====================================================
-- ✅ INSTALACIÓN LIMPIA COMPLETADA
-- =====================================================

-- Verificar tablas creadas
SELECT 'Tablas creadas:' as status, COUNT(*) as total
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('family_groups', 'family_group_members', 'shared_expenses',
                   'shared_expense_splits', 'profile_preferences', 'alerts');

-- Verificar RLS habilitado
SELECT 'RLS habilitado:' as status, COUNT(*) as total
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('family_groups', 'family_group_members', 'shared_expenses',
                  'shared_expense_splits', 'profile_preferences', 'alerts')
AND rowsecurity = true;

-- Verificar políticas creadas
SELECT 'Políticas creadas:' as status, COUNT(*) as total
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('family_groups', 'family_group_members', 'shared_expenses',
                  'shared_expense_splits', 'profile_preferences', 'alerts');
