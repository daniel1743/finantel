-- =====================================================
-- SCRIPT PARA MARCAR USUARIOS COMO STAFF
-- =====================================================
-- 
-- INSTRUCCIONES:
-- 1. Reemplaza 'TU_EMAIL_AQUI@ejemplo.com' con tu email real
-- 2. Ejecuta este script en Supabase SQL Editor
-- 3. O usa la consulta directa más abajo
-- =====================================================

-- =====================================================
-- ⚠️ IMPORTANTE: ANTES DE EJECUTAR, VERIFICA TU EMAIL
-- =====================================================
-- Ejecuta esto primero para ver todos los usuarios:
/*
SELECT id, email, created_at FROM auth.users ORDER BY created_at DESC;
*/
-- =====================================================

-- OPCIÓN 1: Marcar por EMAIL (más fácil)
-- ⚠️ REEMPLAZA 'TU_EMAIL_AQUI@ejemplo.com' con tu EMAIL REAL
-- (el email que usas para iniciar sesión en Finantel)
DO $$
DECLARE
    v_user_id UUID;
    v_user_email TEXT := 'TU_EMAIL_AQUI@ejemplo.com'; -- ⚠️ CAMBIA ESTO POR TU EMAIL REAL
BEGIN
    -- Buscar el usuario por email
    SELECT id INTO v_user_id
    FROM auth.users
    WHERE email = v_user_email;

    IF v_user_id IS NULL THEN
        RAISE EXCEPTION '❌ Usuario no encontrado. Verifica que el email sea correcto: %. Ejecuta primero: SELECT id, email FROM auth.users;', v_user_email;
    END IF;

    -- Crear o actualizar profile_preferences
    INSERT INTO public.profile_preferences (user_id, is_staff)
    VALUES (v_user_id, true)
    ON CONFLICT (user_id) 
    DO UPDATE SET is_staff = true;

    RAISE NOTICE '✅ Usuario % marcado como staff exitosamente', v_user_email;
    RAISE NOTICE 'UUID del usuario: %', v_user_id;
END $$;

-- =====================================================
-- OPCIÓN 2: Marcar por UUID directamente
-- =====================================================
-- Si ya conoces el UUID de tu usuario, usa esto:
/*
UPDATE public.profile_preferences 
SET is_staff = true 
WHERE user_id = 'TU_UUID_AQUI'; -- ⚠️ CAMBIA ESTO

-- Si no existe el registro, créalo:
INSERT INTO public.profile_preferences (user_id, is_staff)
VALUES ('TU_UUID_AQUI', true) -- ⚠️ CAMBIA ESTO
ON CONFLICT (user_id) 
DO UPDATE SET is_staff = true;
*/

-- =====================================================
-- OPCIÓN 3: Ver todos los usuarios y sus emails
-- =====================================================
-- Ejecuta esto primero para encontrar tu email y UUID:
/*
SELECT 
    id as user_id,
    email,
    created_at,
    (SELECT is_staff FROM public.profile_preferences WHERE user_id = auth.users.id) as is_staff
FROM auth.users
ORDER BY created_at DESC;
*/

-- =====================================================
-- OPCIÓN 4: Verificar si ya eres staff
-- =====================================================
-- Ejecuta esto para verificar tu estado:
/*
SELECT 
    u.email,
    u.id as user_id,
    COALESCE(pp.is_staff, false) as is_staff
FROM auth.users u
LEFT JOIN public.profile_preferences pp ON pp.user_id = u.id
WHERE u.email = 'TU_EMAIL_AQUI@ejemplo.com'; -- ⚠️ CAMBIA ESTO
*/

-- =====================================================
-- OPCIÓN 5: Marcar múltiples usuarios como staff
-- =====================================================
-- Si necesitas marcar varios usuarios a la vez:
/*
UPDATE public.profile_preferences 
SET is_staff = true 
WHERE user_id IN (
    SELECT id FROM auth.users 
    WHERE email IN (
        'usuario1@ejemplo.com',
        'usuario2@ejemplo.com',
        'usuario3@ejemplo.com'
    )
);
*/

