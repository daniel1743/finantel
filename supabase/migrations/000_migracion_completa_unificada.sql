-- =====================================================
-- MIGRACIÓN COMPLETA UNIFICADA - FINATEL v2.1
-- =====================================================
-- Este script contiene TODAS las migraciones en un solo archivo
-- para facilitar la instalación desde cero.
--
-- IMPORTANTE: Solo usar si estás instalando desde cero.
-- Si ya ejecutaste las migraciones 001-003, usa solo la 004.
-- =====================================================

-- Habilitar extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- PARTE 1: CREAR TABLAS FALTANTES
-- =====================================================

-- 1. FAMILY_GROUPS
CREATE TABLE IF NOT EXISTS public.family_groups (
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
CREATE TABLE IF NOT EXISTS public.family_group_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    family_group_id UUID NOT NULL REFERENCES public.family_groups(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member')),
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true,

    UNIQUE(family_group_id, user_id)
);

-- 3. SHARED_EXPENSES
CREATE TABLE IF NOT EXISTS public.shared_expenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    family_group_id UUID NOT NULL REFERENCES public.family_groups(id) ON DELETE CASCADE,
    paid_by_user_id UUID NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    amount DECIMAL(12, 2) NOT NULL CHECK (amount > 0),
    currency TEXT DEFAULT 'USD',
    expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
    category_id UUID, -- FK se agregará después si categories existe
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'settled', 'cancelled')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'::jsonb,

    CONSTRAINT shared_expenses_title_check CHECK (char_length(title) >= 1 AND char_length(title) <= 200)
);

-- 4. SHARED_EXPENSE_SPLITS
CREATE TABLE IF NOT EXISTS public.shared_expense_splits (
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
CREATE TABLE IF NOT EXISTS public.profile_preferences (
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
CREATE TABLE IF NOT EXISTS public.alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,

    type TEXT NOT NULL CHECK (type IN ('critical', 'warning', 'info', 'opportunity', 'trend')),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    recommendation TEXT,

    -- FKs se agregarán después si las tablas existen
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
-- PARTE 2: CREAR ÍNDICES
-- =====================================================

-- family_groups
CREATE INDEX IF NOT EXISTS idx_family_groups_created_by ON public.family_groups(created_by);
CREATE INDEX IF NOT EXISTS idx_family_groups_active ON public.family_groups(is_active);

-- family_group_members
CREATE INDEX IF NOT EXISTS idx_family_group_members_group ON public.family_group_members(family_group_id);
CREATE INDEX IF NOT EXISTS idx_family_group_members_user ON public.family_group_members(user_id);
CREATE INDEX IF NOT EXISTS idx_family_group_members_active ON public.family_group_members(is_active);

-- shared_expenses
CREATE INDEX IF NOT EXISTS idx_shared_expenses_group ON public.shared_expenses(family_group_id);
CREATE INDEX IF NOT EXISTS idx_shared_expenses_paid_by ON public.shared_expenses(paid_by_user_id);
CREATE INDEX IF NOT EXISTS idx_shared_expenses_status ON public.shared_expenses(status);
CREATE INDEX IF NOT EXISTS idx_shared_expenses_date ON public.shared_expenses(expense_date);

-- shared_expense_splits
CREATE INDEX IF NOT EXISTS idx_shared_expense_splits_expense ON public.shared_expense_splits(shared_expense_id);
CREATE INDEX IF NOT EXISTS idx_shared_expense_splits_user ON public.shared_expense_splits(user_id);
CREATE INDEX IF NOT EXISTS idx_shared_expense_splits_settled ON public.shared_expense_splits(is_settled);
CREATE INDEX IF NOT EXISTS idx_shared_expense_splits_user_pending ON public.shared_expense_splits(user_id) WHERE is_settled = false;

-- profile_preferences
CREATE INDEX IF NOT EXISTS idx_profile_preferences_user ON public.profile_preferences(user_id);

-- alerts
CREATE INDEX IF NOT EXISTS idx_alerts_user ON public.alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_alerts_type ON public.alerts(type);
CREATE INDEX IF NOT EXISTS idx_alerts_read ON public.alerts(is_read);
CREATE INDEX IF NOT EXISTS idx_alerts_dismissed ON public.alerts(is_dismissed);
CREATE INDEX IF NOT EXISTS idx_alerts_priority ON public.alerts(priority);
CREATE INDEX IF NOT EXISTS idx_alerts_created ON public.alerts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_alerts_expires ON public.alerts(expires_at) WHERE expires_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_alerts_user_unread ON public.alerts(user_id, created_at DESC) WHERE is_read = false AND is_dismissed = false;

-- Índices adicionales para performance (solo si las tablas existen)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'transactions') THEN
        CREATE INDEX IF NOT EXISTS idx_transactions_user_date_category ON public.transactions(user_id, date DESC, category_id) WHERE type = 'expense';
        RAISE NOTICE '✅ Índice agregado: idx_transactions_user_date_category';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'budgets') THEN
        CREATE INDEX IF NOT EXISTS idx_budgets_user_active_period ON public.budgets(user_id, period_start, period_end) WHERE is_active = true;
        RAISE NOTICE '✅ Índice agregado: idx_budgets_user_active_period';
    END IF;
END $$;

-- =====================================================
-- PARTE 3: TRIGGERS Y FUNCIONES BÁSICAS
-- =====================================================

-- Función para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at
DROP TRIGGER IF EXISTS update_family_groups_updated_at ON public.family_groups;
CREATE TRIGGER update_family_groups_updated_at
    BEFORE UPDATE ON public.family_groups
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_shared_expenses_updated_at ON public.shared_expenses;
CREATE TRIGGER update_shared_expenses_updated_at
    BEFORE UPDATE ON public.shared_expenses
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_profile_preferences_updated_at ON public.profile_preferences;
CREATE TRIGGER update_profile_preferences_updated_at
    BEFORE UPDATE ON public.profile_preferences
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Función para validar splits mejorada
CREATE OR REPLACE FUNCTION validate_expense_splits()
RETURNS TRIGGER AS $$
DECLARE
    total_splits DECIMAL(12, 2);
    expense_amount DECIMAL(12, 2);
    split_count INTEGER;
BEGIN
    SELECT amount INTO expense_amount
    FROM public.shared_expenses
    WHERE id = NEW.shared_expense_id;

    IF expense_amount IS NULL THEN
        RAISE EXCEPTION 'El gasto compartido no existe';
    END IF;

    SELECT COALESCE(SUM(amount), 0), COUNT(*)
    INTO total_splits, split_count
    FROM public.shared_expense_splits
    WHERE shared_expense_id = NEW.shared_expense_id;

    IF total_splits > expense_amount + 0.01 THEN
        RAISE EXCEPTION 'La suma de las divisiones (%) excede el monto del gasto (%)',
                       total_splits, expense_amount;
    END IF;

    IF ABS(total_splits - expense_amount) > 0.05 AND split_count > 1 THEN
        RAISE WARNING 'La suma de las divisiones (%) difiere del monto del gasto (%) por más de 0.05',
                     total_splits, expense_amount;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS validate_expense_splits_trigger ON public.shared_expense_splits;
CREATE TRIGGER validate_expense_splits_trigger
    AFTER INSERT OR UPDATE ON public.shared_expense_splits
    FOR EACH ROW
    EXECUTE FUNCTION validate_expense_splits();

-- Auto-agregar creador como admin
CREATE OR REPLACE FUNCTION auto_add_creator_as_admin()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.family_group_members (
        family_group_id, user_id, role, is_active
    ) VALUES (NEW.id, NEW.created_by, 'admin', true);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_auto_add_creator_as_admin ON public.family_groups;
CREATE TRIGGER trigger_auto_add_creator_as_admin
    AFTER INSERT ON public.family_groups
    FOR EACH ROW
    EXECUTE FUNCTION auto_add_creator_as_admin();

-- =====================================================
-- PARTE 4: HABILITAR RLS
-- =====================================================

ALTER TABLE public.family_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.family_group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shared_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shared_expense_splits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- PARTE 5: POLÍTICAS RLS - FAMILY_GROUPS
-- =====================================================

DROP POLICY IF EXISTS "Users can view groups they belong to" ON public.family_groups;
CREATE POLICY "Users can view groups they belong to"
    ON public.family_groups FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.family_group_members
        WHERE family_group_members.family_group_id = family_groups.id
        AND family_group_members.user_id = auth.uid()
        AND family_group_members.is_active = true
    ));

DROP POLICY IF EXISTS "Users can create family groups" ON public.family_groups;
CREATE POLICY "Users can create family groups"
    ON public.family_groups FOR INSERT
    WITH CHECK (auth.uid() = created_by);

DROP POLICY IF EXISTS "Admins can update their groups" ON public.family_groups;
CREATE POLICY "Admins can update their groups"
    ON public.family_groups FOR UPDATE
    USING (EXISTS (
        SELECT 1 FROM public.family_group_members
        WHERE family_group_members.family_group_id = family_groups.id
        AND family_group_members.user_id = auth.uid()
        AND family_group_members.role = 'admin'
        AND family_group_members.is_active = true
    ));

DROP POLICY IF EXISTS "Only creator can delete groups" ON public.family_groups;
CREATE POLICY "Only creator can delete groups"
    ON public.family_groups FOR DELETE
    USING (auth.uid() = created_by);

-- =====================================================
-- PARTE 6: POLÍTICAS RLS - FAMILY_GROUP_MEMBERS
-- =====================================================

DROP POLICY IF EXISTS "Users can view members of their groups" ON public.family_group_members;
CREATE POLICY "Users can view members of their groups"
    ON public.family_group_members FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.family_group_members fgm
        WHERE fgm.family_group_id = family_group_members.family_group_id
        AND fgm.user_id = auth.uid()
        AND fgm.is_active = true
    ));

DROP POLICY IF EXISTS "Admins can add members" ON public.family_group_members;
CREATE POLICY "Admins can add members"
    ON public.family_group_members FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM public.family_group_members
        WHERE family_group_id = family_group_members.family_group_id
        AND user_id = auth.uid()
        AND role = 'admin'
        AND is_active = true
    ));

DROP POLICY IF EXISTS "Admins can update members" ON public.family_group_members;
CREATE POLICY "Admins can update members"
    ON public.family_group_members FOR UPDATE
    USING (EXISTS (
        SELECT 1 FROM public.family_group_members
        WHERE family_group_id = family_group_members.family_group_id
        AND user_id = auth.uid()
        AND role = 'admin'
        AND is_active = true
    ));

DROP POLICY IF EXISTS "Admins can remove members or user can leave" ON public.family_group_members;
CREATE POLICY "Admins can remove members or user can leave"
    ON public.family_group_members FOR DELETE
    USING (
        user_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM public.family_group_members fgm
            WHERE fgm.family_group_id = family_group_members.family_group_id
            AND fgm.user_id = auth.uid()
            AND fgm.role = 'admin'
            AND fgm.is_active = true
        )
    );

-- =====================================================
-- PARTE 7: POLÍTICAS RLS - SHARED_EXPENSES
-- =====================================================

DROP POLICY IF EXISTS "Users can view expenses of their groups" ON public.shared_expenses;
CREATE POLICY "Users can view expenses of their groups"
    ON public.shared_expenses FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.family_group_members
        WHERE family_group_members.family_group_id = shared_expenses.family_group_id
        AND family_group_members.user_id = auth.uid()
        AND family_group_members.is_active = true
    ));

DROP POLICY IF EXISTS "Users can create expenses in their groups" ON public.shared_expenses;
CREATE POLICY "Users can create expenses in their groups"
    ON public.shared_expenses FOR INSERT
    WITH CHECK (
        auth.uid() = paid_by_user_id
        AND EXISTS (
            SELECT 1 FROM public.family_group_members
            WHERE family_group_members.family_group_id = shared_expenses.family_group_id
            AND family_group_members.user_id = auth.uid()
            AND family_group_members.is_active = true
        )
    );

DROP POLICY IF EXISTS "Payer or admin can update expenses" ON public.shared_expenses;
CREATE POLICY "Payer or admin can update expenses"
    ON public.shared_expenses FOR UPDATE
    USING (
        paid_by_user_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM public.family_group_members
            WHERE family_group_members.family_group_id = shared_expenses.family_group_id
            AND family_group_members.user_id = auth.uid()
            AND family_group_members.role = 'admin'
            AND family_group_members.is_active = true
        )
    );

DROP POLICY IF EXISTS "Payer or admin can delete expenses" ON public.shared_expenses;
CREATE POLICY "Payer or admin can delete expenses"
    ON public.shared_expenses FOR DELETE
    USING (
        paid_by_user_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM public.family_group_members
            WHERE family_group_members.family_group_id = shared_expenses.family_group_id
            AND family_group_members.user_id = auth.uid()
            AND family_group_members.role = 'admin'
            AND family_group_members.is_active = true
        )
    );

-- =====================================================
-- PARTE 8: POLÍTICAS RLS - SHARED_EXPENSE_SPLITS
-- =====================================================

DROP POLICY IF EXISTS "Users can view splits of their group expenses" ON public.shared_expense_splits;
CREATE POLICY "Users can view splits of their group expenses"
    ON public.shared_expense_splits FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.shared_expenses se
        JOIN public.family_group_members fgm ON fgm.family_group_id = se.family_group_id
        WHERE se.id = shared_expense_splits.shared_expense_id
        AND fgm.user_id = auth.uid()
        AND fgm.is_active = true
    ));

DROP POLICY IF EXISTS "Payer or admin can create splits" ON public.shared_expense_splits;
CREATE POLICY "Payer or admin can create splits"
    ON public.shared_expense_splits FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM public.shared_expenses se
        WHERE se.id = shared_expense_splits.shared_expense_id
        AND (
            se.paid_by_user_id = auth.uid()
            OR EXISTS (
                SELECT 1 FROM public.family_group_members fgm
                WHERE fgm.family_group_id = se.family_group_id
                AND fgm.user_id = auth.uid()
                AND fgm.role = 'admin'
                AND fgm.is_active = true
            )
        )
    ));

DROP POLICY IF EXISTS "Users can update splits" ON public.shared_expense_splits;
CREATE POLICY "Users can update splits"
    ON public.shared_expense_splits FOR UPDATE
    USING (
        user_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM public.shared_expenses se
            WHERE se.id = shared_expense_splits.shared_expense_id
            AND (
                se.paid_by_user_id = auth.uid()
                OR EXISTS (
                    SELECT 1 FROM public.family_group_members fgm
                    WHERE fgm.family_group_id = se.family_group_id
                    AND fgm.user_id = auth.uid()
                    AND fgm.role = 'admin'
                    AND fgm.is_active = true
                )
            )
        )
    );

DROP POLICY IF EXISTS "Payer or admin can delete splits" ON public.shared_expense_splits;
CREATE POLICY "Payer or admin can delete splits"
    ON public.shared_expense_splits FOR DELETE
    USING (EXISTS (
        SELECT 1 FROM public.shared_expenses se
        WHERE se.id = shared_expense_splits.shared_expense_id
        AND (
            se.paid_by_user_id = auth.uid()
            OR EXISTS (
                SELECT 1 FROM public.family_group_members fgm
                WHERE fgm.family_group_id = se.family_group_id
                AND fgm.user_id = auth.uid()
                AND fgm.role = 'admin'
                AND fgm.is_active = true
            )
        )
    ));

-- =====================================================
-- PARTE 9: POLÍTICAS RLS - PROFILE_PREFERENCES
-- =====================================================

DROP POLICY IF EXISTS "Users can view own preferences" ON public.profile_preferences;
CREATE POLICY "Users can view own preferences"
    ON public.profile_preferences FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create own preferences" ON public.profile_preferences;
CREATE POLICY "Users can create own preferences"
    ON public.profile_preferences FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own preferences" ON public.profile_preferences;
CREATE POLICY "Users can update own preferences"
    ON public.profile_preferences FOR UPDATE
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own preferences" ON public.profile_preferences;
CREATE POLICY "Users can delete own preferences"
    ON public.profile_preferences FOR DELETE
    USING (auth.uid() = user_id);

-- =====================================================
-- PARTE 10: POLÍTICAS RLS - ALERTS
-- =====================================================

DROP POLICY IF EXISTS "Users can view own alerts" ON public.alerts;
CREATE POLICY "Users can view own alerts"
    ON public.alerts FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Only system can create alerts" ON public.alerts;
CREATE POLICY "Only system can create alerts"
    ON public.alerts FOR INSERT
    WITH CHECK (false);

DROP POLICY IF EXISTS "Users can update own alerts" ON public.alerts;
CREATE POLICY "Users can update own alerts"
    ON public.alerts FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own alerts" ON public.alerts;
CREATE POLICY "Users can delete own alerts"
    ON public.alerts FOR DELETE
    USING (auth.uid() = user_id);

-- =====================================================
-- PARTE 11: COMENTARIOS
-- =====================================================

COMMENT ON TABLE public.family_groups IS 'Grupos familiares donde los usuarios comparten gastos';
COMMENT ON TABLE public.family_group_members IS 'Relación muchos-a-muchos entre usuarios y grupos familiares';
COMMENT ON TABLE public.shared_expenses IS 'Gastos compartidos entre miembros de un grupo familiar';
COMMENT ON TABLE public.shared_expense_splits IS 'División de gastos compartidos entre usuarios';
COMMENT ON TABLE public.profile_preferences IS 'Preferencias de usuario (moneda, idioma, notificaciones, etc.)';
COMMENT ON TABLE public.alerts IS 'Alertas inteligentes generadas automáticamente para el usuario';

-- =====================================================
-- PARTE 12: AGREGAR FOREIGN KEYS SI LAS TABLAS BASE EXISTEN
-- =====================================================

-- Agregar FK de shared_expenses a categories si existe
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'categories') THEN
        IF EXISTS (
            SELECT 1 FROM information_schema.table_constraints 
            WHERE constraint_schema = 'public' 
            AND table_name = 'shared_expenses' 
            AND constraint_name = 'shared_expenses_category_id_fkey'
        ) THEN
            ALTER TABLE public.shared_expenses DROP CONSTRAINT shared_expenses_category_id_fkey;
        END IF;
        
        ALTER TABLE public.shared_expenses 
        ADD CONSTRAINT shared_expenses_category_id_fkey 
        FOREIGN KEY (category_id) REFERENCES public.categories(id) ON DELETE SET NULL;
        
        RAISE NOTICE '✅ FK agregada: shared_expenses.category_id -> categories.id';
    ELSE
        RAISE NOTICE '⚠️ Tabla categories no existe. FK de category_id no se agregó.';
    END IF;
END $$;

-- Agregar FKs de alerts a las tablas base si existen
DO $$ 
BEGIN
    -- FK a categories
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'categories') THEN
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.table_constraints 
            WHERE constraint_schema = 'public' 
            AND table_name = 'alerts' 
            AND constraint_name = 'alerts_category_id_fkey'
        ) THEN
            ALTER TABLE public.alerts 
            ADD CONSTRAINT alerts_category_id_fkey 
            FOREIGN KEY (category_id) REFERENCES public.categories(id) ON DELETE SET NULL;
            RAISE NOTICE '✅ FK agregada: alerts.category_id -> categories.id';
        END IF;
    END IF;
    
    -- FK a budgets
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'budgets') THEN
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.table_constraints 
            WHERE constraint_schema = 'public' 
            AND table_name = 'alerts' 
            AND constraint_name = 'alerts_budget_id_fkey'
        ) THEN
            ALTER TABLE public.alerts 
            ADD CONSTRAINT alerts_budget_id_fkey 
            FOREIGN KEY (budget_id) REFERENCES public.budgets(id) ON DELETE SET NULL;
            RAISE NOTICE '✅ FK agregada: alerts.budget_id -> budgets.id';
        END IF;
    END IF;
    
    -- FK a goals
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'goals') THEN
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.table_constraints 
            WHERE constraint_schema = 'public' 
            AND table_name = 'alerts' 
            AND constraint_name = 'alerts_goal_id_fkey'
        ) THEN
            ALTER TABLE public.alerts 
            ADD CONSTRAINT alerts_goal_id_fkey 
            FOREIGN KEY (goal_id) REFERENCES public.goals(id) ON DELETE SET NULL;
            RAISE NOTICE '✅ FK agregada: alerts.goal_id -> goals.id';
        END IF;
    END IF;
    
    -- FK a transactions
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'transactions') THEN
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.table_constraints 
            WHERE constraint_schema = 'public' 
            AND table_name = 'alerts' 
            AND constraint_name = 'alerts_transaction_id_fkey'
        ) THEN
            ALTER TABLE public.alerts 
            ADD CONSTRAINT alerts_transaction_id_fkey 
            FOREIGN KEY (transaction_id) REFERENCES public.transactions(id) ON DELETE SET NULL;
            RAISE NOTICE '✅ FK agregada: alerts.transaction_id -> transactions.id';
        END IF;
    END IF;
END $$;

-- =====================================================
-- ✅ MIGRACIÓN COMPLETA UNIFICADA FINALIZADA
-- =====================================================
-- Ahora ejecuta la migración 004 para agregar las funciones avanzadas
-- =====================================================
