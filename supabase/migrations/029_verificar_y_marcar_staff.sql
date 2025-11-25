-- =====================================================
-- VERIFICAR Y MARCAR USUARIO COMO STAFF
-- Email: codigoscriminales@gmail.com
-- =====================================================

-- PASO 1: Verificar si el usuario existe
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
WHERE email = 'codigoscriminales@gmail.com';

-- =====================================================
-- PASO 2: Si el usuario EXISTE (aparece arriba), ejecuta esto:
-- =====================================================

DO $$
DECLARE
    v_user_id UUID;
    v_user_email TEXT := 'codigoscriminales@gmail.com';
    v_user_exists BOOLEAN;
BEGIN
    -- Verificar si el usuario existe
    SELECT EXISTS(SELECT 1 FROM auth.users WHERE email = v_user_email) INTO v_user_exists;
    
    IF NOT v_user_exists THEN
        RAISE NOTICE '';
        RAISE NOTICE '========================================';
        RAISE NOTICE '❌ USUARIO NO ENCONTRADO';
        RAISE NOTICE '========================================';
        RAISE NOTICE 'El usuario con email % no existe en auth.users', v_user_email;
        RAISE NOTICE '';
        RAISE NOTICE '📝 INSTRUCCIONES:';
        RAISE NOTICE '1. Ve a Finantel y REGÍSTRATE o INICIA SESIÓN con:';
        RAISE NOTICE '   Email: codigoscriminales@gmail.com';
        RAISE NOTICE '   Contraseña: Daniel22';
        RAISE NOTICE '';
        RAISE NOTICE '2. Una vez que hayas iniciado sesión, vuelve a ejecutar este script';
        RAISE NOTICE '========================================';
        RETURN;
    END IF;

    -- Obtener el UUID del usuario
    SELECT id INTO v_user_id
    FROM auth.users
    WHERE email = v_user_email;

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
    RAISE NOTICE '2. Vuelve a iniciar sesión con: codigoscriminales@gmail.com';
    RAISE NOTICE '3. Navega a /dashboard/admin/support';
    RAISE NOTICE '4. O busca "Panel de Soporte" en el menú lateral';
    RAISE NOTICE '========================================';
END $$;

-- =====================================================
-- PASO 3: Verificación final
-- =====================================================
SELECT 
    u.email,
    u.id as user_id,
    COALESCE(pp.is_staff, false) as is_staff,
    CASE 
        WHEN COALESCE(pp.is_staff, false) = true THEN '✅ Eres staff - Puedes acceder al panel'
        WHEN u.id IS NULL THEN '❌ Usuario no existe - Debes registrarte primero'
        ELSE '❌ No eres staff - Ejecuta el script de arriba'
    END as estado
FROM auth.users u
LEFT JOIN public.profile_preferences pp ON pp.user_id = u.id
WHERE u.email = 'codigoscriminales@gmail.com';

