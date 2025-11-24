-- =====================================================
-- MIGRACIÓN: CREAR TABLA billing_subscriptions
-- =====================================================
-- Esta tabla almacena las suscripciones de los usuarios
-- para controlar el acceso a funcionalidades premium
-- =====================================================
-- IDEMPOTENTE: Se puede ejecutar múltiples veces sin errores
-- =====================================================

-- Crear tabla billing_subscriptions
CREATE TABLE IF NOT EXISTS public.billing_subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    plan TEXT NOT NULL CHECK (plan IN ('free', 'personal', 'familiar', 'family', 'Familiar', 'enterprise')),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired', 'pending')),
    provider TEXT DEFAULT 'mercadopago' CHECK (provider IN ('mercadopago', 'stripe', 'manual')),
    provider_subscription_id TEXT,
    current_period_start TIMESTAMPTZ DEFAULT NOW(),
    current_period_end TIMESTAMPTZ,
    cancel_at_period_end BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Un usuario solo puede tener una suscripción activa
    UNIQUE(user_id)
);

-- Crear índices
CREATE INDEX IF NOT EXISTS idx_billing_subscriptions_user_id ON public.billing_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_billing_subscriptions_status ON public.billing_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_billing_subscriptions_plan ON public.billing_subscriptions(plan);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_billing_subscriptions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para updated_at
DROP TRIGGER IF EXISTS trigger_update_billing_subscriptions_updated_at ON public.billing_subscriptions;
CREATE TRIGGER trigger_update_billing_subscriptions_updated_at
    BEFORE UPDATE ON public.billing_subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION update_billing_subscriptions_updated_at();

-- =====================================================
-- POLÍTICAS RLS (Row Level Security)
-- =====================================================

-- Habilitar RLS
ALTER TABLE public.billing_subscriptions ENABLE ROW LEVEL SECURITY;

-- Política: Los usuarios solo pueden ver su propia suscripción
DROP POLICY IF EXISTS "Users can view own subscription" ON public.billing_subscriptions;
CREATE POLICY "Users can view own subscription"
    ON public.billing_subscriptions
    FOR SELECT
    USING (auth.uid() = user_id);

-- Política: Los usuarios pueden insertar su propia suscripción
DROP POLICY IF EXISTS "Users can insert own subscription" ON public.billing_subscriptions;
CREATE POLICY "Users can insert own subscription"
    ON public.billing_subscriptions
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Política: Los usuarios pueden actualizar su propia suscripción
DROP POLICY IF EXISTS "Users can update own subscription" ON public.billing_subscriptions;
CREATE POLICY "Users can update own subscription"
    ON public.billing_subscriptions
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Forzar refresh del schema cache para PostgREST
DO $$
BEGIN
    PERFORM pg_notify('pgrst', 'reload schema');
    RAISE NOTICE 'Notificación enviada para refrescar schema cache';
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'No se pudo enviar notificación (esto es normal si PostgREST no está configurado para escuchar)';
END $$;

