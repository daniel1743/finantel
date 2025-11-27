-- =====================================================
-- MIGRACIÓN: INTEGRACIÓN MERCADO PAGO
-- =====================================================
-- Esta migración crea las tablas y políticas necesarias
-- para la integración completa con Mercado Pago
-- =====================================================

-- =====================================================
-- 1. CREAR TABLA billing_plans
-- =====================================================

CREATE TABLE IF NOT EXISTS public.billing_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    price_monthly DECIMAL(12, 2) NOT NULL,
    price_yearly DECIMAL(12, 2),
    currency TEXT DEFAULT 'CLP',
    mercado_pago_plan_id TEXT,
    features JSONB DEFAULT '[]'::jsonb,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para billing_plans
CREATE INDEX IF NOT EXISTS idx_billing_plans_slug ON public.billing_plans(slug);
CREATE INDEX IF NOT EXISTS idx_billing_plans_active ON public.billing_plans(is_active) WHERE is_active = true;

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_billing_plans_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_billing_plans_updated_at ON public.billing_plans;
CREATE TRIGGER trigger_update_billing_plans_updated_at
    BEFORE UPDATE ON public.billing_plans
    FOR EACH ROW
    EXECUTE FUNCTION update_billing_plans_updated_at();

-- Insertar planes de ejemplo
INSERT INTO public.billing_plans (name, slug, price_monthly, price_yearly, currency, features, is_active) VALUES
('Free', 'free', 0.00, 0.00, 'CLP', '["5 Categorías", "50 transacciones/mes", "Dashboard Básico", "Exportar a CSV", "1 Dispositivo"]'::jsonb, true),
('Starter', 'starter', 5000.00, 51000.00, 'CLP', '["Categorías Ilimitadas", "Transacciones Ilimitadas", "Alertas Inteligentes", "Exportar PDF", "3 Dispositivos"]'::jsonb, true),
('Pro', 'pro', 12000.00, 122400.00, 'CLP', '["Todo en Starter", "IA Predictiva", "Sincronización multi-dispositivo", "Soporte prioritario", "5 Dispositivos"]'::jsonb, true),
('Premium', 'premium', 25000.00, 255000.00, 'CLP', '["Todo en Pro", "5 Miembros de Familia", "Gastos Compartidos", "Dashboard Familiar", "7 Dispositivos", "Roles y Permisos"]'::jsonb, true)
ON CONFLICT (slug) DO NOTHING;

-- =====================================================
-- 2. CREAR TABLA billing_payments
-- =====================================================

CREATE TABLE IF NOT EXISTS public.billing_payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    subscription_id UUID REFERENCES public.billing_subscriptions(id) ON DELETE SET NULL,
    mercado_pago_payment_id TEXT UNIQUE,
    mercado_pago_preference_id TEXT,
    amount DECIMAL(12, 2) NOT NULL,
    currency TEXT DEFAULT 'CLP',
    status TEXT NOT NULL CHECK (status IN ('pending', 'approved', 'rejected', 'refunded', 'cancelled')),
    payment_method TEXT,
    payment_type TEXT,
    installments INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    paid_at TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Índices para billing_payments
CREATE INDEX IF NOT EXISTS idx_billing_payments_user_id ON public.billing_payments(user_id);
CREATE INDEX IF NOT EXISTS idx_billing_payments_subscription_id ON public.billing_payments(subscription_id);
CREATE INDEX IF NOT EXISTS idx_billing_payments_mp_id ON public.billing_payments(mercado_pago_payment_id);
CREATE INDEX IF NOT EXISTS idx_billing_payments_status ON public.billing_payments(status);
CREATE INDEX IF NOT EXISTS idx_billing_payments_created_at ON public.billing_payments(created_at DESC);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_billing_payments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_billing_payments_updated_at ON public.billing_payments;
CREATE TRIGGER trigger_update_billing_payments_updated_at
    BEFORE UPDATE ON public.billing_payments
    FOR EACH ROW
    EXECUTE FUNCTION update_billing_payments_updated_at();

-- =====================================================
-- 3. ALTER TABLE billing_subscriptions
-- =====================================================

ALTER TABLE public.billing_subscriptions 
ADD COLUMN IF NOT EXISTS mercado_pago_subscription_id TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS mercado_pago_preapproval_id TEXT,
ADD COLUMN IF NOT EXISTS next_payment_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS last_payment_id UUID REFERENCES public.billing_payments(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS trial_end TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- Índice para mercado_pago_subscription_id
CREATE INDEX IF NOT EXISTS idx_billing_subscriptions_mp_sub_id ON public.billing_subscriptions(mercado_pago_subscription_id);

-- =====================================================
-- 4. ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Habilitar RLS en billing_plans
ALTER TABLE public.billing_plans ENABLE ROW LEVEL SECURITY;

-- Política: Todos pueden ver planes activos
DROP POLICY IF EXISTS "Anyone can view active plans" ON public.billing_plans;
CREATE POLICY "Anyone can view active plans"
    ON public.billing_plans
    FOR SELECT
    USING (is_active = true);

-- Habilitar RLS en billing_payments
ALTER TABLE public.billing_payments ENABLE ROW LEVEL SECURITY;

-- Política: Usuarios solo ven sus propios pagos
DROP POLICY IF EXISTS "Users can view own payments" ON public.billing_payments;
CREATE POLICY "Users can view own payments"
    ON public.billing_payments
    FOR SELECT
    USING (auth.uid() = user_id);

-- Política: Solo service_role puede insertar/actualizar (para webhooks)
DROP POLICY IF EXISTS "Service role can manage payments" ON public.billing_payments;
CREATE POLICY "Service role can manage payments"
    ON public.billing_payments
    FOR ALL
    USING (auth.jwt() ->> 'role' = 'service_role')
    WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

-- Política: Usuarios pueden insertar sus propios pagos (para crear intents)
DROP POLICY IF EXISTS "Users can insert own payments" ON public.billing_payments;
CREATE POLICY "Users can insert own payments"
    ON public.billing_payments
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Actualizar políticas de billing_subscriptions (si no existen)
DO $$
BEGIN
    -- Verificar si RLS está habilitado
    IF NOT EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename = 'billing_subscriptions'
    ) THEN
        RETURN;
    END IF;

    -- Habilitar RLS si no está habilitado
    ALTER TABLE public.billing_subscriptions ENABLE ROW LEVEL SECURITY;

    -- Política: Usuarios solo ven sus propias suscripciones
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'billing_subscriptions'
        AND policyname = 'Users can view own subscription'
    ) THEN
        CREATE POLICY "Users can view own subscription"
            ON public.billing_subscriptions
            FOR SELECT
            USING (auth.uid() = user_id);
    END IF;

    -- Política: Service role puede actualizar (para webhooks)
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'billing_subscriptions'
        AND policyname = 'Service role can update subscriptions'
    ) THEN
        CREATE POLICY "Service role can update subscriptions"
            ON public.billing_subscriptions
            FOR UPDATE
            USING (auth.jwt() ->> 'role' = 'service_role')
            WITH CHECK (auth.jwt() ->> 'role' = 'service_role');
    END IF;

    -- Política: Usuarios pueden insertar sus propias suscripciones
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'billing_subscriptions'
        AND policyname = 'Users can insert own subscription'
    ) THEN
        CREATE POLICY "Users can insert own subscription"
            ON public.billing_subscriptions
            FOR INSERT
            WITH CHECK (auth.uid() = user_id);
    END IF;
END $$;

-- =====================================================
-- 5. FUNCIONES AUXILIARES
-- =====================================================

-- Función para obtener el estado de suscripción del usuario
CREATE OR REPLACE FUNCTION get_user_subscription_status(p_user_id UUID)
RETURNS TABLE (
    subscription_id UUID,
    plan TEXT,
    status TEXT,
    current_period_start TIMESTAMPTZ,
    current_period_end TIMESTAMPTZ,
    next_payment_date TIMESTAMPTZ,
    last_payment_id UUID,
    last_payment_status TEXT,
    last_payment_amount DECIMAL(12, 2)
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        bs.id,
        bs.plan,
        bs.status,
        bs.current_period_start,
        bs.current_period_end,
        bs.next_payment_date,
        bs.last_payment_id,
        bp.status as last_payment_status,
        bp.amount as last_payment_amount
    FROM public.billing_subscriptions bs
    LEFT JOIN public.billing_payments bp ON bp.id = bs.last_payment_id
    WHERE bs.user_id = p_user_id
    ORDER BY bs.created_at DESC
    LIMIT 1;
END;
$$;

-- Función para obtener historial de pagos del usuario
CREATE OR REPLACE FUNCTION get_user_payment_history(p_user_id UUID, p_limit INTEGER DEFAULT 10)
RETURNS TABLE (
    id UUID,
    amount DECIMAL(12, 2),
    currency TEXT,
    status TEXT,
    payment_method TEXT,
    created_at TIMESTAMPTZ,
    paid_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        bp.id,
        bp.amount,
        bp.currency,
        bp.status,
        bp.payment_method,
        bp.created_at,
        bp.paid_at
    FROM public.billing_payments bp
    WHERE bp.user_id = p_user_id
    ORDER BY bp.created_at DESC
    LIMIT p_limit;
END;
$$;

-- =====================================================
-- 6. COMENTARIOS Y DOCUMENTACIÓN
-- =====================================================

COMMENT ON TABLE public.billing_plans IS 'Planes de suscripción disponibles en la plataforma';
COMMENT ON TABLE public.billing_payments IS 'Registro de todos los pagos realizados por los usuarios';
COMMENT ON COLUMN public.billing_payments.mercado_pago_payment_id IS 'ID único del pago en Mercado Pago';
COMMENT ON COLUMN public.billing_subscriptions.mercado_pago_subscription_id IS 'ID de la suscripción en Mercado Pago';
COMMENT ON COLUMN public.billing_subscriptions.next_payment_date IS 'Fecha del próximo cobro automático';

-- =====================================================
-- FIN DE LA MIGRACIÓN
-- =====================================================

