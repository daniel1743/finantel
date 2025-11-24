-- =====================================================
-- DESHABILITAR CONFIRMACIÓN DE EMAIL EN SUPABASE
-- =====================================================
-- Este script permite que los usuarios se registren sin necesidad
-- de confirmar su email (útil para desarrollo y testing)

-- =====================================================
-- OPCIÓN 1: Confirmar usuarios existentes automáticamente
-- =====================================================
-- Ejecuta esto para confirmar todos los usuarios no confirmados
-- NOTA: confirmed_at es columna generada, solo actualizamos email_confirmed_at

UPDATE auth.users
SET email_confirmed_at = now()
WHERE email_confirmed_at IS NULL;

-- =====================================================
-- OPCIÓN 2: Confirmar un usuario específico por email
-- =====================================================
-- Reemplaza 'tu-email@ejemplo.com' con tu email

-- UPDATE auth.users
-- SET email_confirmed_at = now()
-- WHERE email = 'tu-email@ejemplo.com';

-- =====================================================
-- VERIFICAR USUARIOS CONFIRMADOS
-- =====================================================
SELECT
  id,
  email,
  email_confirmed_at,
  confirmed_at,
  created_at,
  CASE
    WHEN email_confirmed_at IS NOT NULL THEN '✅ Confirmado'
    ELSE '❌ No confirmado'
  END as estado
FROM auth.users
ORDER BY created_at DESC
LIMIT 10;

-- =====================================================
-- RESULTADO ESPERADO
-- =====================================================
-- Después de ejecutar este script:
-- 1. Todos los usuarios existentes podrán hacer login
-- 2. Nuevos usuarios también podrán hacer login inmediatamente
--    (si se deshabilitó "Confirm email" en el Dashboard)
