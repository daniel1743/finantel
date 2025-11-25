-- =====================================================
-- SCRIPT SIMPLE PARA MARCAR USUARIO COMO STAFF
-- =====================================================
-- 
-- PASO 1: Primero ejecuta esto para ver todos los usuarios
-- =====================================================

-- Ver todos los usuarios con sus emails
SELECT 
    id as user_id,
    email,
    created_at,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM public.profile_preferences 
            WHERE user_id = auth.users.id AND is_staff = true
        ) THEN '✅ Ya es staff'
        ELSE '❌ No es staff'
    END as estado_staff
FROM auth.users
ORDER BY created_at DESC;

-- =====================================================
-- PASO 2: Copia tu UUID de arriba y ejecuta esto
-- =====================================================
-- Reemplaza 'PEGA_TU_UUID_AQUI' con el UUID que copiaste

UPDATE public.profile_preferences 
SET is_staff = true 
WHERE user_id = 'PEGA_TU_UUID_AQUI';

-- Si no existe el registro, créalo:
INSERT INTO public.profile_preferences (user_id, is_staff)
SELECT 'PEGA_TU_UUID_AQUI', true
WHERE NOT EXISTS (
    SELECT 1 FROM public.profile_preferences 
    WHERE user_id = 'PEGA_TU_UUID_AQUI'
);

-- =====================================================
-- OPCIÓN ALTERNATIVA: Por email (más fácil)
-- =====================================================
-- Reemplaza 'TU_EMAIL_REAL@ejemplo.com' con tu email REAL
-- (el que usas para iniciar sesión en Finantel)

DO $$
DECLARE
    v_user_id UUID;
    v_user_email TEXT := 'TU_EMAIL_REAL@ejemplo.com'; -- ⚠️ CAMBIA ESTO POR TU EMAIL REAL
BEGIN
    -- Buscar el usuario por email
    SELECT id INTO v_user_id
    FROM auth.users
    WHERE email = v_user_email;

    IF v_user_id IS NULL THEN
        RAISE EXCEPTION '❌ Usuario no encontrado. Verifica que el email sea correcto: %', v_user_email;
    END IF;

    -- Crear o actualizar profile_preferences
    INSERT INTO public.profile_preferences (user_id, is_staff)
    VALUES (v_user_id, true)
    ON CONFLICT (user_id) 
    DO UPDATE SET is_staff = true;

    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE '✅ USUARIO MARCADO COMO STAFF';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Email: %', v_user_email;
    RAISE NOTICE 'UUID: %', v_user_id;
    RAISE NOTICE '';
    RAISE NOTICE '📝 PRÓXIMOS PASOS:';
    RAISE NOTICE '1. Cierra sesión en Finantel';
    RAISE NOTICE '2. Vuelve a iniciar sesión';
    RAISE NOTICE '3. Navega a /dashboard/admin/support';
    RAISE NOTICE '========================================';
END $$;

-- =====================================================
-- VERIFICACIÓN: Ejecuta esto para confirmar
-- =====================================================
-- Reemplaza 'TU_EMAIL_REAL@ejemplo.com' con tu email

SELECT 
    u.email,
    u.id as user_id,
    COALESCE(pp.is_staff, false) as is_staff,
    CASE 
        WHEN COALESCE(pp.is_staff, false) = true THEN '✅ Eres staff - Puedes acceder al panel'
        ELSE '❌ No eres staff - Ejecuta el script de arriba'
    END as estado
FROM auth.users u
LEFT JOIN public.profile_preferences pp ON pp.user_id = u.id
WHERE u.email = 'TU_EMAIL_REAL@ejemplo.com'; -- ⚠️ CAMBIA ESTO


