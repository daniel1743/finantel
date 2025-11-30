-- ============================================================================
-- FIX: Error de tabla subscription_packages que no existe
-- ============================================================================
-- Este script corrige el error donde se intenta actualizar una tabla
-- que no existe. La tabla correcta es billing_subscriptions.
-- ============================================================================
-- Si hay algún trigger o función que intente usar subscription_packages,
-- este script lo corrige o lo elimina.
-- ============================================================================

-- Verificar si existe algún trigger que use subscription_packages
DO $$
BEGIN
    -- Eliminar triggers que puedan referenciar subscription_packages
    DROP TRIGGER IF EXISTS trigger_update_subscription_packages_updated_at ON public.subscription_packages;
    DROP TRIGGER IF EXISTS update_subscription_packages_updated_at ON public.subscription_packages;
    
    -- Eliminar funciones que puedan referenciar subscription_packages
    DROP FUNCTION IF EXISTS update_subscription_packages_updated_at() CASCADE;
    
    RAISE NOTICE 'Triggers y funciones relacionados con subscription_packages eliminados (si existían)';
EXCEPTION
    WHEN undefined_table THEN
        RAISE NOTICE 'La tabla subscription_packages no existe (esto es correcto)';
    WHEN OTHERS THEN
        RAISE NOTICE 'Error al limpiar: %', SQLERRM;
END $$;

-- Verificar si hay alguna política RLS que intente usar subscription_packages
DO $$
BEGIN
    DROP POLICY IF EXISTS "Users can view own subscription_packages" ON public.subscription_packages;
    DROP POLICY IF EXISTS "Users can update own subscription_packages" ON public.subscription_packages;
    DROP POLICY IF EXISTS "Users can insert own subscription_packages" ON public.subscription_packages;
    DROP POLICY IF EXISTS "Service role can update subscription_packages" ON public.subscription_packages;
    
    RAISE NOTICE 'Políticas RLS relacionadas con subscription_packages eliminadas (si existían)';
EXCEPTION
    WHEN undefined_table THEN
        RAISE NOTICE 'La tabla subscription_packages no existe (esto es correcto)';
    WHEN OTHERS THEN
        RAISE NOTICE 'Error al limpiar políticas: %', SQLERRM;
END $$;

-- ============================================================================
-- NOTA IMPORTANTE
-- ============================================================================
-- Si el error persiste, puede ser que haya algún código (Edge Function, 
-- trigger, o función SQL) que esté intentando actualizar subscription_packages.
-- 
-- La tabla correcta es: billing_subscriptions
-- 
-- Si necesitas crear una tabla subscription_packages, usa este script:
-- ============================================================================

-- OPCIONAL: Crear tabla subscription_packages si realmente la necesitas
-- (Pero probablemente NO la necesitas, ya que billing_subscriptions hace lo mismo)
/*
CREATE TABLE IF NOT EXISTS public.subscription_packages (
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
    
    UNIQUE(user_id)
);

CREATE INDEX IF NOT EXISTS idx_subscription_packages_user_id ON public.subscription_packages(user_id);
CREATE INDEX IF NOT EXISTS idx_subscription_packages_status ON public.subscription_packages(status);
CREATE INDEX IF NOT EXISTS idx_subscription_packages_plan ON public.subscription_packages(plan);
*/

-- ============================================================================
-- FIN DEL SCRIPT
-- ============================================================================

