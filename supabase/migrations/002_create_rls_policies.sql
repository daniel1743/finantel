-- =====================================================
-- FASE 1: POLÍTICAS RLS (ROW LEVEL SECURITY)
-- =====================================================
-- Este script crea las políticas de seguridad para las nuevas tablas
-- CRÍTICO: Sin estas políticas, los usuarios podrían ver/modificar datos de otros
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
-- 1. FAMILY_GROUPS - Políticas RLS
-- =====================================================

-- Los usuarios pueden ver grupos donde son miembros
DROP POLICY IF EXISTS "Users can view groups they belong to" ON public.family_groups;
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

-- Los usuarios pueden crear grupos
CREATE POLICY "Users can create family groups"
    ON public.family_groups
    FOR INSERT
    WITH CHECK (auth.uid() = created_by);

-- Los usuarios pueden actualizar grupos donde son admin
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

-- Solo el creador puede eliminar grupos
CREATE POLICY "Only creator can delete groups"
    ON public.family_groups
    FOR DELETE
    USING (auth.uid() = created_by);

-- =====================================================
-- 2. FAMILY_GROUP_MEMBERS - Políticas RLS
-- =====================================================

-- Los usuarios pueden ver miembros de grupos donde pertenecen
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

-- Los admins pueden agregar miembros
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

-- Los admins pueden actualizar miembros (cambiar rol, etc.)
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

-- Los admins pueden remover miembros (o el usuario puede salirse)
CREATE POLICY "Admins can remove members or user can leave"
    ON public.family_group_members
    FOR DELETE
    USING (
        -- El usuario puede eliminarse a sí mismo
        user_id = auth.uid()
        OR
        -- O un admin puede eliminar a otros
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

-- Los usuarios pueden ver gastos de grupos donde son miembros
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

-- Los usuarios pueden crear gastos en grupos donde son miembros
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

-- Solo quien pagó o un admin puede actualizar
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

-- Solo quien pagó o un admin puede eliminar
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

-- Los usuarios pueden ver splits de gastos de sus grupos
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

-- Solo quien pagó o un admin puede crear splits
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

-- Los usuarios pueden actualizar sus propios splits (marcar como pagado)
-- O quien pagó/admin puede actualizar cualquier split
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

-- Solo quien pagó o un admin puede eliminar splits
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

-- Los usuarios solo pueden ver sus propias preferencias
CREATE POLICY "Users can view own preferences"
    ON public.profile_preferences
    FOR SELECT
    USING (auth.uid() = user_id);

-- Los usuarios pueden crear sus propias preferencias
CREATE POLICY "Users can create own preferences"
    ON public.profile_preferences
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Los usuarios solo pueden actualizar sus propias preferencias
CREATE POLICY "Users can update own preferences"
    ON public.profile_preferences
    FOR UPDATE
    USING (auth.uid() = user_id);

-- Los usuarios pueden eliminar sus propias preferencias
CREATE POLICY "Users can delete own preferences"
    ON public.profile_preferences
    FOR DELETE
    USING (auth.uid() = user_id);

-- =====================================================
-- 6. ALERTS - Políticas RLS
-- =====================================================

-- Los usuarios solo pueden ver sus propias alertas
CREATE POLICY "Users can view own alerts"
    ON public.alerts
    FOR SELECT
    USING (auth.uid() = user_id);

-- Solo el sistema puede crear alertas (usando service_role)
-- Para usuarios normales, no permitir INSERT directo
-- (Las alertas se crearán mediante funciones o triggers)
CREATE POLICY "Only system can create alerts"
    ON public.alerts
    FOR INSERT
    WITH CHECK (false); -- Bloquear INSERT directo desde cliente

-- Los usuarios pueden actualizar sus propias alertas (marcar como leída, etc.)
CREATE POLICY "Users can update own alerts"
    ON public.alerts
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Los usuarios pueden eliminar sus propias alertas
CREATE POLICY "Users can delete own alerts"
    ON public.alerts
    FOR DELETE
    USING (auth.uid() = user_id);

-- =====================================================
-- NOTA IMPORTANTE SOBRE ALERTS
-- =====================================================
-- Las alertas se crearán mediante:
-- 1. Funciones de base de datos (triggers)
-- 2. Edge Functions de Supabase
-- 3. O usando service_role key (solo en backend seguro)
-- 
-- Para permitir que el frontend cree alertas (no recomendado para producción),
-- puedes cambiar la política de INSERT a:
-- 
-- CREATE POLICY "Users can create own alerts"
--     ON public.alerts
--     FOR INSERT
--     WITH CHECK (auth.uid() = user_id);
-- 
-- =====================================================

