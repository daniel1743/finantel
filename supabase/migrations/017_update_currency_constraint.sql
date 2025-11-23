-- =====================================================
-- ACTUALIZAR CONSTRAINT DE MONEDA PARA INCLUIR MÁS PAÍSES
-- =====================================================
-- Este script actualiza el CHECK constraint de currency
-- para incluir todas las monedas de América Latina, Asia, África y Europa
-- =====================================================

-- Eliminar el constraint antiguo
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE table_schema = 'public' 
        AND table_name = 'profile_preferences' 
        AND constraint_name = 'profile_preferences_currency_check'
    ) THEN
        ALTER TABLE public.profile_preferences 
        DROP CONSTRAINT profile_preferences_currency_check;
        RAISE NOTICE 'Constraint antiguo eliminado';
    END IF;
END $$;

-- Agregar nuevo constraint con todas las monedas
DO $$ 
BEGIN
    ALTER TABLE public.profile_preferences
    ADD CONSTRAINT profile_preferences_currency_check 
    CHECK (currency IN (
        -- América del Norte
        'USD', 'CAD', 'MXN',
        -- América Latina
        'ARS', 'BRL', 'CLP', 'COP', 'PEN', 'UYU', 'VES', 'GTQ', 'CRC', 'PAB', 'DOP',
        -- Europa
        'EUR', 'GBP', 'CHF', 'RUB', 'PLN', 'SEK', 'NOK', 'DKK',
        -- Asia
        'JPY', 'CNY', 'INR', 'KRW', 'SGD', 'HKD', 'THB', 'IDR', 'MYR', 'PHP',
        -- África
        'ZAR', 'EGP', 'NGN', 'KES', 'MAD'
    ));
    
    RAISE NOTICE 'Nuevo constraint de moneda creado con todas las monedas';
END $$;

-- =====================================================
-- ✅ SCRIPT COMPLETADO
-- =====================================================

