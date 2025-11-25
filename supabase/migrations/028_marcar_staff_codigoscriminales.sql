-- =====================================================
-- MARCAR USUARIO COMO STAFF
-- Email: codigoscriminales@gmail.com
-- =====================================================

DO $$
DECLARE
    v_user_id UUID;
    v_user_email TEXT := 'codigoscriminales@gmail.com';
BEGIN
    -- Buscar el usuario por email
    SELECT id INTO v_user_id
    FROM auth.users
    WHERE email = v_user_email;

    IF v_user_id IS NULL THEN
        RAISE EXCEPTION '❌ Usuario no encontrado con email: %. Verifica que el email sea correcto y que el usuario exista en auth.users', v_user_email;
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
    RAISE NOTICE '2. Vuelve a iniciar sesión con: codigoscriminales@gmail.com';
    RAISE NOTICE '3. Navega a /dashboard/admin/support';
    RAISE NOTICE '4. O busca "Panel de Soporte" en el menú lateral';
    RAISE NOTICE '========================================';
END $$;

-- =====================================================
-- VERIFICACIÓN: Ejecuta esto para confirmar
-- =====================================================
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
WHERE u.email = 'codigoscriminales@gmail.com';

