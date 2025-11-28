-- =====================================================
-- MIGRACIÓN: DeepFinance Engine - Base (Fase 1)
-- =====================================================
-- Tablas para el sistema de análisis financiero profundo
-- =====================================================

-- 1. TABLA: deepfinance_analyses
-- Almacena los análisis realizados por el motor
CREATE TABLE IF NOT EXISTS public.deepfinance_analyses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    analysis_date TIMESTAMPTZ DEFAULT NOW(),
    
    -- Puntaje global (0-100)
    score DECIMAL(5, 2) CHECK (score >= 0 AND score <= 100),
    
    -- Metadatos del análisis
    total_transactions INTEGER DEFAULT 0,
    period_start DATE,
    period_end DATE,
    period_days INTEGER,
    
    -- Resumen ejecutivo
    summary JSONB DEFAULT '{}'::jsonb,
    
    -- Análisis detallados
    patterns JSONB DEFAULT '[]'::jsonb,
    leakages JSONB DEFAULT '[]'::jsonb,
    recommendations JSONB DEFAULT '[]'::jsonb,
    savings_potential JSONB DEFAULT '{}'::jsonb,
    
    -- Datos financieros del período
    total_income DECIMAL(12, 2) DEFAULT 0,
    total_expenses DECIMAL(12, 2) DEFAULT 0,
    net_savings DECIMAL(12, 2) DEFAULT 0,
    savings_rate DECIMAL(5, 2) DEFAULT 0,
    
    -- Análisis por categoría
    category_breakdown JSONB DEFAULT '{}'::jsonb,
    
    -- Análisis emocional
    emotional_analysis JSONB DEFAULT '{}'::jsonb,
    
    -- Análisis de riesgo
    risk_level TEXT CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
    risk_factors JSONB DEFAULT '[]'::jsonb,
    
    -- Metadatos adicionales
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. TABLA: deepfinance_credits
-- Maneja créditos y límites de uso
CREATE TABLE IF NOT EXISTS public.deepfinance_credits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Créditos disponibles
    credits_remaining INTEGER DEFAULT 0 CHECK (credits_remaining >= 0),
    
    -- Límites temporales
    last_analysis_date DATE,
    analyses_this_week INTEGER DEFAULT 0,
    analyses_this_month INTEGER DEFAULT 0,
    
    -- Uso gratuito
    free_analyses_used INTEGER DEFAULT 0,
    free_analyses_limit INTEGER DEFAULT 4, -- 4 análisis gratis al mes
    
    -- Metadatos
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(user_id)
);

-- 3. TABLA: deepfinance_credit_purchases
-- Historial de compras de créditos
CREATE TABLE IF NOT EXISTS public.deepfinance_credit_purchases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Detalles de la compra
    credits_purchased INTEGER NOT NULL CHECK (credits_purchased > 0),
    amount_paid DECIMAL(10, 2) NOT NULL CHECK (amount_paid > 0),
    currency TEXT DEFAULT 'USD',
    
    -- Referencia al pago
    payment_id UUID REFERENCES public.billing_payments(id),
    
    -- Estado
    status TEXT DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
    
    -- Metadatos
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- ÍNDICES PARA PERFORMANCE
-- =====================================================

-- Índices para deepfinance_analyses
CREATE INDEX IF NOT EXISTS idx_deepfinance_analyses_user_id 
    ON public.deepfinance_analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_deepfinance_analyses_date 
    ON public.deepfinance_analyses(analysis_date DESC);
CREATE INDEX IF NOT EXISTS idx_deepfinance_analyses_user_date 
    ON public.deepfinance_analyses(user_id, analysis_date DESC);

-- Índices para deepfinance_credits
CREATE INDEX IF NOT EXISTS idx_deepfinance_credits_user_id 
    ON public.deepfinance_credits(user_id);

-- Índices para deepfinance_credit_purchases
CREATE INDEX IF NOT EXISTS idx_deepfinance_credit_purchases_user_id 
    ON public.deepfinance_credit_purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_deepfinance_credit_purchases_payment_id 
    ON public.deepfinance_credit_purchases(payment_id);

-- =====================================================
-- TRIGGERS PARA updated_at
-- =====================================================

-- Trigger para deepfinance_analyses
CREATE OR REPLACE FUNCTION update_deepfinance_analyses_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_deepfinance_analyses_updated_at 
    ON public.deepfinance_analyses;
CREATE TRIGGER trigger_update_deepfinance_analyses_updated_at
    BEFORE UPDATE ON public.deepfinance_analyses
    FOR EACH ROW
    EXECUTE FUNCTION update_deepfinance_analyses_updated_at();

-- Trigger para deepfinance_credits
CREATE OR REPLACE FUNCTION update_deepfinance_credits_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_deepfinance_credits_updated_at 
    ON public.deepfinance_credits;
CREATE TRIGGER trigger_update_deepfinance_credits_updated_at
    BEFORE UPDATE ON public.deepfinance_credits
    FOR EACH ROW
    EXECUTE FUNCTION update_deepfinance_credits_updated_at();

-- =====================================================
-- FUNCIONES AUXILIARES
-- =====================================================

-- Función para inicializar créditos de un usuario
CREATE OR REPLACE FUNCTION initialize_deepfinance_credits(p_user_id UUID)
RETURNS VOID AS $$
BEGIN
    INSERT INTO public.deepfinance_credits (user_id, credits_remaining, free_analyses_limit)
    VALUES (p_user_id, 0, 4)
    ON CONFLICT (user_id) DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para verificar si puede hacer análisis
CREATE OR REPLACE FUNCTION can_run_analysis(p_user_id UUID)
RETURNS TABLE(
    can_analyze BOOLEAN,
    reason TEXT,
    credits_remaining INTEGER,
    weekly_limit_reached BOOLEAN,
    monthly_limit_reached BOOLEAN
) AS $$
DECLARE
    v_credits RECORD;
    v_week_start DATE;
    v_month_start DATE;
    v_analyses_this_week INTEGER;
    v_analyses_this_month INTEGER;
BEGIN
    -- Obtener créditos del usuario
    SELECT * INTO v_credits
    FROM public.deepfinance_credits
    WHERE user_id = p_user_id;
    
    -- Si no existe, inicializar
    IF v_credits IS NULL THEN
        PERFORM initialize_deepfinance_credits(p_user_id);
        SELECT * INTO v_credits
        FROM public.deepfinance_credits
        WHERE user_id = p_user_id;
    END IF;
    
    -- Calcular límites semanales y mensuales
    v_week_start := CURRENT_DATE - (EXTRACT(DOW FROM CURRENT_DATE)::INTEGER);
    v_month_start := DATE_TRUNC('month', CURRENT_DATE)::DATE;
    
    -- Contar análisis de esta semana
    SELECT COUNT(*) INTO v_analyses_this_week
    FROM public.deepfinance_analyses
    WHERE user_id = p_user_id
    AND analysis_date >= v_week_start;
    
    -- Contar análisis de este mes
    SELECT COUNT(*) INTO v_analyses_this_month
    FROM public.deepfinance_analyses
    WHERE user_id = p_user_id
    AND analysis_date >= v_month_start;
    
    -- Verificar límites
    IF v_analyses_this_week >= 1 AND v_credits.free_analyses_used >= v_credits.free_analyses_limit THEN
        RETURN QUERY SELECT 
            FALSE,
            'Límite semanal alcanzado. Usa créditos premium o espera hasta la próxima semana.'::TEXT,
            v_credits.credits_remaining,
            TRUE,
            FALSE;
        RETURN;
    END IF;
    
    IF v_credits.free_analyses_used >= v_credits.free_analyses_limit AND v_credits.credits_remaining = 0 THEN
        RETURN QUERY SELECT 
            FALSE,
            'Límite mensual de análisis gratuitos alcanzado. Compra créditos para continuar.'::TEXT,
            v_credits.credits_remaining,
            FALSE,
            TRUE;
        RETURN;
    END IF;
    
    -- Puede analizar
    RETURN QUERY SELECT 
        TRUE,
        'OK'::TEXT,
        v_credits.credits_remaining,
        FALSE,
        FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- RLS POLICIES
-- =====================================================

-- Habilitar RLS
ALTER TABLE public.deepfinance_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deepfinance_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deepfinance_credit_purchases ENABLE ROW LEVEL SECURITY;

-- Políticas para deepfinance_analyses
DROP POLICY IF EXISTS "Users can view own analyses" ON public.deepfinance_analyses;
CREATE POLICY "Users can view own analyses" ON public.deepfinance_analyses
    FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own analyses" ON public.deepfinance_analyses;
CREATE POLICY "Users can insert own analyses" ON public.deepfinance_analyses
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own analyses" ON public.deepfinance_analyses;
CREATE POLICY "Users can update own analyses" ON public.deepfinance_analyses
    FOR UPDATE
    USING (auth.uid() = user_id);

-- Políticas para deepfinance_credits
DROP POLICY IF EXISTS "Users can view own credits" ON public.deepfinance_credits;
CREATE POLICY "Users can view own credits" ON public.deepfinance_credits
    FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own credits" ON public.deepfinance_credits;
CREATE POLICY "Users can update own credits" ON public.deepfinance_credits
    FOR UPDATE
    USING (auth.uid() = user_id);

-- Políticas para deepfinance_credit_purchases
DROP POLICY IF EXISTS "Users can view own purchases" ON public.deepfinance_credit_purchases;
CREATE POLICY "Users can view own purchases" ON public.deepfinance_credit_purchases
    FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own purchases" ON public.deepfinance_credit_purchases;
CREATE POLICY "Users can insert own purchases" ON public.deepfinance_credit_purchases
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- COMENTARIOS
-- =====================================================

COMMENT ON TABLE public.deepfinance_analyses IS 'Almacena análisis completos del DeepFinance Engine';
COMMENT ON TABLE public.deepfinance_credits IS 'Maneja créditos y límites de uso del DeepFinance Engine';
COMMENT ON TABLE public.deepfinance_credit_purchases IS 'Historial de compras de créditos para DeepFinance';

