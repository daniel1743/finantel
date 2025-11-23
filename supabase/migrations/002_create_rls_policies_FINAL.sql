-- =====================================================
-- FASE 1: POLÍTICAS RLS (ROW LEVEL SECURITY) - VERSIÓN FINAL
-- =====================================================
-- Este script crea las políticas de seguridad para las nuevas tablas
-- CRÍTICO: Ejecutar DESPUÉS de 001_create_missing_tables.sql o 000_migracion_completa_unificada.sql
-- Este script es IDEMPOTENTE: se puede ejecutar múltiples veces sin errores
-- =====================================================

-- Habilitar RLS en todas las tablas (solo si existen)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'family_groups') THEN
        ALTER TABLE public.family_groups ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'family_group_members') THEN
        ALTER TABLE public.family_group_members ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'shared_expenses') THEN
        ALTER TABLE public.shared_expenses ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'shared_expense_splits') THEN
        ALTER TABLE public.shared_expense_splits ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'profile_preferences') THEN
        ALTER TABLE public.profile_preferences ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'alerts') THEN
        ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- =====================================================
-- FUNCIÓN AUXILIAR: Eliminar política si existe
-- =====================================================
CREATE OR REPLACE FUNCTION drop_policy_if_exists(
    policy_name TEXT,
    table_name TEXT
) RETURNS void AS $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = table_name
        AND policyname = policy_name
    ) THEN
        EXECUTE format('DROP POLICY %I ON public.%I', policy_name, table_name);
    END IF;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 1. FAMILY_GROUPS - Políticas RLS
-- =====================================================

SELECT drop_policy_if_exists('Users can view groups they belong to', 'family_groups');
CREATE POLICY "Users can view groups they belong to"
    ON public.family_groups
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.family_group_members
            WHERE family_group_members.family_group_id = family_groups.id
            AND family_group_members.user_id = auth.uid()
            AND family_group_members.is_active = true
        )
    );

SELECT drop_policy_if_exists('Users can create family groups', 'family_groups');
CREATE POLICY "Users can create family groups"
    ON public.family_groups
    FOR INSERT
    WITH CHECK (auth.uid() = created_by);

SELECT drop_policy_if_exists('Admins can update their groups', 'family_groups');
CREATE POLICY "Admins can update their groups"
    ON public.family_groups
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.family_group_members
            WHERE family_group_members.family_group_id = family_groups.id
            AND family_group_members.user_id = auth.uid()
            AND family_group_members.role = 'admin'
            AND family_group_members.is_active = true
        )
    );

SELECT drop_policy_if_exists('Only creator can delete groups', 'family_groups');
CREATE POLICY "Only creator can delete groups"
    ON public.family_groups
    FOR DELETE
    USING (auth.uid() = created_by);

-- =====================================================
-- 2. FAMILY_GROUP_MEMBERS - Políticas RLS
-- =====================================================

SELECT drop_policy_if_exists('Users can view members of their groups', 'family_group_members');
CREATE POLICY "Users can view members of their groups"
    ON public.family_group_members
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.family_group_members fgm
            WHERE fgm.family_group_id = family_group_members.family_group_id
            AND fgm.user_id = auth.uid()
            AND fgm.is_active = true
        )
    );

SELECT drop_policy_if_exists('Admins can add members', 'family_group_members');
CREATE POLICY "Admins can add members"
    ON public.family_group_members
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.family_group_members
            WHERE family_group_id = family_group_members.family_group_id
            AND user_id = auth.uid()
            AND role = 'admin'
            AND is_active = true
        )
    );

SELECT drop_policy_if_exists('Admins can update members', 'family_group_members');
CREATE POLICY "Admins can update members"
    ON public.family_group_members
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.family_group_members
            WHERE family_group_id = family_group_members.family_group_id
            AND user_id = auth.uid()
            AND role = 'admin'
            AND is_active = true
        )
    );

SELECT drop_policy_if_exists('Admins can remove members or user can leave', 'family_group_members');
CREATE POLICY "Admins can remove members or user can leave"
    ON public.family_group_members
    FOR DELETE
    USING (
        user_id = auth.uid()
        OR
        EXISTS (
            SELECT 1 FROM public.family_group_members fgm
            WHERE fgm.family_group_id = family_group_members.family_group_id
            AND fgm.user_id = auth.uid()
            AND fgm.role = 'admin'
            AND fgm.is_active = true
        )
    );

-- =====================================================
-- 3. SHARED_EXPENSES - Políticas RLS
-- =====================================================

SELECT drop_policy_if_exists('Users can view expenses of their groups', 'shared_expenses');
CREATE POLICY "Users can view expenses of their groups"
    ON public.shared_expenses
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.family_group_members
            WHERE family_group_members.family_group_id = shared_expenses.family_group_id
            AND family_group_members.user_id = auth.uid()
            AND family_group_members.is_active = true
        )
    );

SELECT drop_policy_if_exists('Users can create expenses in their groups', 'shared_expenses');
CREATE POLICY "Users can create expenses in their groups"
    ON public.shared_expenses
    FOR INSERT
    WITH CHECK (
        auth.uid() = paid_by_user_id
        AND EXISTS (
            SELECT 1 FROM public.family_group_members
            WHERE family_group_members.family_group_id = shared_expenses.family_group_id
            AND family_group_members.user_id = auth.uid()
            AND family_group_members.is_active = true
        )
    );

SELECT drop_policy_if_exists('Payer or admin can update expenses', 'shared_expenses');
CREATE POLICY "Payer or admin can update expenses"
    ON public.shared_expenses
    FOR UPDATE
    USING (
        paid_by_user_id = auth.uid()
        OR
        EXISTS (
            SELECT 1 FROM public.family_group_members
            WHERE family_group_members.family_group_id = shared_expenses.family_group_id
            AND family_group_members.user_id = auth.uid()
            AND family_group_members.role = 'admin'
            AND family_group_members.is_active = true
        )
    );

SELECT drop_policy_if_exists('Payer or admin can delete expenses', 'shared_expenses');
CREATE POLICY "Payer or admin can delete expenses"
    ON public.shared_expenses
    FOR DELETE
    USING (
        paid_by_user_id = auth.uid()
        OR
        EXISTS (
            SELECT 1 FROM public.family_group_members
            WHERE family_group_members.family_group_id = shared_expenses.family_group_id
            AND family_group_members.user_id = auth.uid()
            AND family_group_members.role = 'admin'
            AND family_group_members.is_active = true
        )
    );

-- =====================================================
-- 4. SHARED_EXPENSE_SPLITS - Políticas RLS
-- =====================================================

SELECT drop_policy_if_exists('Users can view splits of their group expenses', 'shared_expense_splits');
CREATE POLICY "Users can view splits of their group expenses"
    ON public.shared_expense_splits
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.shared_expenses se
            JOIN public.family_group_members fgm ON fgm.family_group_id = se.family_group_id
            WHERE se.id = shared_expense_splits.shared_expense_id
            AND fgm.user_id = auth.uid()
            AND fgm.is_active = true
        )
    );

SELECT drop_policy_if_exists('Payer or admin can create splits', 'shared_expense_splits');
CREATE POLICY "Payer or admin can create splits"
    ON public.shared_expense_splits
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.shared_expenses se
            WHERE se.id = shared_expense_splits.shared_expense_id
            AND (
                se.paid_by_user_id = auth.uid()
                OR
                EXISTS (
                    SELECT 1 FROM public.family_group_members fgm
                    WHERE fgm.family_group_id = se.family_group_id
                    AND fgm.user_id = auth.uid()
                    AND fgm.role = 'admin'
                    AND fgm.is_active = true
                )
            )
        )
    );

SELECT drop_policy_if_exists('Users can update splits', 'shared_expense_splits');
CREATE POLICY "Users can update splits"
    ON public.shared_expense_splits
    FOR UPDATE
    USING (
        user_id = auth.uid()
        OR
        EXISTS (
            SELECT 1 FROM public.shared_expenses se
            WHERE se.id = shared_expense_splits.shared_expense_id
            AND (
                se.paid_by_user_id = auth.uid()
                OR
                EXISTS (
                    SELECT 1 FROM public.family_group_members fgm
                    WHERE fgm.family_group_id = se.family_group_id
                    AND fgm.user_id = auth.uid()
                    AND fgm.role = 'admin'
                    AND fgm.is_active = true
                )
            )
        )
    );

SELECT drop_policy_if_exists('Payer or admin can delete splits', 'shared_expense_splits');
CREATE POLICY "Payer or admin can delete splits"
    ON public.shared_expense_splits
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.shared_expenses se
            WHERE se.id = shared_expense_splits.shared_expense_id
            AND (
                se.paid_by_user_id = auth.uid()
                OR
                EXISTS (
                    SELECT 1 FROM public.family_group_members fgm
                    WHERE fgm.family_group_id = se.family_group_id
                    AND fgm.user_id = auth.uid()
                    AND fgm.role = 'admin'
                    AND fgm.is_active = true
                )
            )
        )
    );

-- =====================================================
-- 5. PROFILE_PREFERENCES - Políticas RLS
-- =====================================================

SELECT drop_policy_if_exists('Users can view own preferences', 'profile_preferences');
CREATE POLICY "Users can view own preferences"
    ON public.profile_preferences
    FOR SELECT
    USING (auth.uid() = user_id);

SELECT drop_policy_if_exists('Users can create own preferences', 'profile_preferences');
CREATE POLICY "Users can create own preferences"
    ON public.profile_preferences
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

SELECT drop_policy_if_exists('Users can update own preferences', 'profile_preferences');
CREATE POLICY "Users can update own preferences"
    ON public.profile_preferences
    FOR UPDATE
    USING (auth.uid() = user_id);

SELECT drop_policy_if_exists('Users can delete own preferences', 'profile_preferences');
CREATE POLICY "Users can delete own preferences"
    ON public.profile_preferences
    FOR DELETE
    USING (auth.uid() = user_id);

-- =====================================================
-- 6. ALERTS - Políticas RLS
-- =====================================================

SELECT drop_policy_if_exists('Users can view own alerts', 'alerts');
CREATE POLICY "Users can view own alerts"
    ON public.alerts
    FOR SELECT
    USING (auth.uid() = user_id);

SELECT drop_policy_if_exists('Only system can create alerts', 'alerts');
CREATE POLICY "Only system can create alerts"
    ON public.alerts
    FOR INSERT
    WITH CHECK (false); -- Bloquear INSERT directo desde cliente

SELECT drop_policy_if_exists('Users can update own alerts', 'alerts');
CREATE POLICY "Users can update own alerts"
    ON public.alerts
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

SELECT drop_policy_if_exists('Users can delete own alerts', 'alerts');
CREATE POLICY "Users can delete own alerts"
    ON public.alerts
    FOR DELETE
    USING (auth.uid() = user_id);

-- =====================================================
-- LIMPIAR FUNCIÓN AUXILIAR (opcional)
-- =====================================================
DROP FUNCTION IF EXISTS drop_policy_if_exists(TEXT, TEXT);

-- =====================================================
-- ✅ POLÍTICAS RLS CREADAS EXITOSAMENTE
-- =====================================================

