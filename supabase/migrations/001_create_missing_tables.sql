-- =====================================================
-- FASE 1: CREAR TABLAS FALTANTES PARA FINATEL
-- =====================================================
-- Este script crea las 4 tablas críticas que faltan:
-- 1. family_groups
-- 2. shared_expenses  
-- 3. profile_preferences
-- 4. alerts
-- =====================================================

-- Habilitar extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. FAMILY_GROUPS
-- =====================================================
-- Tabla para grupos familiares donde los usuarios pueden compartir gastos
CREATE TABLE IF NOT EXISTS public.family_groups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    created_by UUID NOT NULL, -- Referencia a auth.users, se valida con RLS
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true,
    settings JSONB DEFAULT '{}'::jsonb, -- Configuraciones del grupo (moneda, etc.)
    
    CONSTRAINT family_groups_name_check CHECK (char_length(name) >= 1 AND char_length(name) <= 100)
);

-- Tabla de relación: miembros de grupos familiares
CREATE TABLE IF NOT EXISTS public.family_group_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    family_group_id UUID NOT NULL REFERENCES public.family_groups(id) ON DELETE CASCADE,
    user_id UUID NOT NULL, -- Referencia a auth.users, se valida con RLS
    role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member')),
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true,
    
    -- Un usuario solo puede estar una vez en un grupo
    UNIQUE(family_group_id, user_id)
);

-- Índices para family_groups
CREATE INDEX IF NOT EXISTS idx_family_groups_created_by ON public.family_groups(created_by);
CREATE INDEX IF NOT EXISTS idx_family_groups_active ON public.family_groups(is_active);
CREATE INDEX IF NOT EXISTS idx_family_group_members_group ON public.family_group_members(family_group_id);
CREATE INDEX IF NOT EXISTS idx_family_group_members_user ON public.family_group_members(user_id);
CREATE INDEX IF NOT EXISTS idx_family_group_members_active ON public.family_group_members(is_active);

-- =====================================================
-- 2. SHARED_EXPENSES
-- =====================================================
-- Tabla para gastos compartidos entre miembros de un grupo
CREATE TABLE IF NOT EXISTS public.shared_expenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    family_group_id UUID NOT NULL REFERENCES public.family_groups(id) ON DELETE CASCADE,
    paid_by_user_id UUID NOT NULL, -- Referencia a auth.users, se valida con RLS
    title TEXT NOT NULL,
    description TEXT,
    amount DECIMAL(12, 2) NOT NULL CHECK (amount > 0),
    currency TEXT DEFAULT 'USD',
    expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'settled', 'cancelled')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'::jsonb, -- Datos adicionales (imagen, recibo, etc.)
    
    CONSTRAINT shared_expenses_title_check CHECK (char_length(title) >= 1 AND char_length(title) <= 200)
);

-- Tabla de división de gastos: quién debe pagar qué parte
CREATE TABLE IF NOT EXISTS public.shared_expense_splits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    shared_expense_id UUID NOT NULL REFERENCES public.shared_expenses(id) ON DELETE CASCADE,
    user_id UUID NOT NULL, -- Referencia a auth.users, se valida con RLS
    amount DECIMAL(12, 2) NOT NULL CHECK (amount >= 0),
    percentage DECIMAL(5, 2) CHECK (percentage >= 0 AND percentage <= 100), -- Porcentaje del total
    is_settled BOOLEAN DEFAULT false,
    settled_at TIMESTAMPTZ,
    notes TEXT,
    
    -- Un usuario solo puede tener una división por gasto
    UNIQUE(shared_expense_id, user_id)
);

-- Índices para shared_expenses
CREATE INDEX IF NOT EXISTS idx_shared_expenses_group ON public.shared_expenses(family_group_id);
CREATE INDEX IF NOT EXISTS idx_shared_expenses_paid_by ON public.shared_expenses(paid_by_user_id);
CREATE INDEX IF NOT EXISTS idx_shared_expenses_status ON public.shared_expenses(status);
CREATE INDEX IF NOT EXISTS idx_shared_expenses_date ON public.shared_expenses(expense_date);
CREATE INDEX IF NOT EXISTS idx_shared_expense_splits_expense ON public.shared_expense_splits(shared_expense_id);
CREATE INDEX IF NOT EXISTS idx_shared_expense_splits_user ON public.shared_expense_splits(user_id);
CREATE INDEX IF NOT EXISTS idx_shared_expense_splits_settled ON public.shared_expense_splits(is_settled);

-- =====================================================
-- 3. PROFILE_PREFERENCES
-- =====================================================
-- Tabla para preferencias de usuario (moneda, idioma, notificaciones, etc.)
CREATE TABLE IF NOT EXISTS public.profile_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE, -- Referencia a auth.users, se valida con RLS
    
    -- Preferencias de visualización
    currency TEXT DEFAULT 'USD' CHECK (currency IN ('USD', 'EUR', 'GBP', 'MXN', 'ARS', 'CLP', 'COP', 'PEN')),
    language TEXT DEFAULT 'es' CHECK (language IN ('es', 'en', 'pt')),
    date_format TEXT DEFAULT 'DD/MM/YYYY' CHECK (date_format IN ('DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD')),
    number_format TEXT DEFAULT '1.234,56' CHECK (number_format IN ('1.234,56', '1,234.56')),
    
    -- Preferencias de notificaciones
    email_notifications BOOLEAN DEFAULT true,
    push_notifications BOOLEAN DEFAULT true,
    budget_alerts BOOLEAN DEFAULT true,
    goal_reminders BOOLEAN DEFAULT true,
    weekly_summary BOOLEAN DEFAULT true,
    monthly_report BOOLEAN DEFAULT true,
    
    -- Preferencias de dashboard
    default_view TEXT DEFAULT 'overview' CHECK (default_view IN ('overview', 'transactions', 'budgets', 'goals')),
    show_charts BOOLEAN DEFAULT true,
    compact_mode BOOLEAN DEFAULT false,
    
    -- Preferencias de privacidad
    share_analytics BOOLEAN DEFAULT false,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índice para profile_preferences
CREATE INDEX IF NOT EXISTS idx_profile_preferences_user ON public.profile_preferences(user_id);

-- =====================================================
-- 4. ALERTS
-- =====================================================
-- Tabla para alertas inteligentes generadas automáticamente
CREATE TABLE IF NOT EXISTS public.alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL, -- Referencia a auth.users, se valida con RLS
    
    -- Información de la alerta
    type TEXT NOT NULL CHECK (type IN ('critical', 'warning', 'info', 'opportunity', 'trend')),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    recommendation TEXT,
    
    -- Contexto de la alerta
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    budget_id UUID REFERENCES public.budgets(id) ON DELETE SET NULL,
    goal_id UUID REFERENCES public.goals(id) ON DELETE SET NULL,
    transaction_id UUID REFERENCES public.transactions(id) ON DELETE SET NULL,
    
    -- Estado y prioridad
    priority INTEGER DEFAULT 5 CHECK (priority >= 1 AND priority <= 10), -- 1 = más alta, 10 = más baja
    is_read BOOLEAN DEFAULT false,
    is_dismissed BOOLEAN DEFAULT false,
    action_taken BOOLEAN DEFAULT false,
    
    -- Metadata
    metadata JSONB DEFAULT '{}'::jsonb, -- Datos adicionales (valores, comparaciones, etc.)
    expires_at TIMESTAMPTZ, -- Algunas alertas expiran
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    read_at TIMESTAMPTZ,
    dismissed_at TIMESTAMPTZ,
    
    CONSTRAINT alerts_title_check CHECK (char_length(title) >= 1 AND char_length(title) <= 200),
    CONSTRAINT alerts_message_check CHECK (char_length(message) >= 1 AND char_length(message) <= 1000)
);

-- Índices para alerts
CREATE INDEX IF NOT EXISTS idx_alerts_user ON public.alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_alerts_type ON public.alerts(type);
CREATE INDEX IF NOT EXISTS idx_alerts_read ON public.alerts(is_read);
CREATE INDEX IF NOT EXISTS idx_alerts_dismissed ON public.alerts(is_dismissed);
CREATE INDEX IF NOT EXISTS idx_alerts_priority ON public.alerts(priority);
CREATE INDEX IF NOT EXISTS idx_alerts_created ON public.alerts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_alerts_expires ON public.alerts(expires_at) WHERE expires_at IS NOT NULL;

-- =====================================================
-- FUNCIONES Y TRIGGERS
-- =====================================================

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at
CREATE TRIGGER update_family_groups_updated_at
    BEFORE UPDATE ON public.family_groups
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_shared_expenses_updated_at
    BEFORE UPDATE ON public.shared_expenses
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profile_preferences_updated_at
    BEFORE UPDATE ON public.profile_preferences
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Función para validar que la suma de splits = amount del gasto
CREATE OR REPLACE FUNCTION validate_expense_splits()
RETURNS TRIGGER AS $$
DECLARE
    total_splits DECIMAL(12, 2);
    expense_amount DECIMAL(12, 2);
BEGIN
    -- Obtener el monto total del gasto
    SELECT amount INTO expense_amount
    FROM public.shared_expenses
    WHERE id = NEW.shared_expense_id;
    
    -- Calcular la suma de todos los splits
    SELECT COALESCE(SUM(amount), 0) INTO total_splits
    FROM public.shared_expense_splits
    WHERE shared_expense_id = NEW.shared_expense_id;
    
    -- Validar que la suma no exceda el monto (con tolerancia de 0.01 para redondeo)
    IF ABS(total_splits - expense_amount) > 0.01 THEN
        RAISE EXCEPTION 'La suma de las divisiones (%.2f) no coincide con el monto del gasto (%.2f)', total_splits, expense_amount;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para validar splits (después de INSERT o UPDATE)
CREATE TRIGGER validate_expense_splits_trigger
    AFTER INSERT OR UPDATE ON public.shared_expense_splits
    FOR EACH ROW
    EXECUTE FUNCTION validate_expense_splits();

-- =====================================================
-- COMENTARIOS EN TABLAS
-- =====================================================

COMMENT ON TABLE public.family_groups IS 'Grupos familiares donde los usuarios comparten gastos';
COMMENT ON TABLE public.family_group_members IS 'Relación muchos-a-muchos entre usuarios y grupos familiares';
COMMENT ON TABLE public.shared_expenses IS 'Gastos compartidos entre miembros de un grupo familiar';
COMMENT ON TABLE public.shared_expense_splits IS 'División de gastos compartidos entre usuarios';
COMMENT ON TABLE public.profile_preferences IS 'Preferencias de usuario (moneda, idioma, notificaciones, etc.)';
COMMENT ON TABLE public.alerts IS 'Alertas inteligentes generadas automáticamente para el usuario';

