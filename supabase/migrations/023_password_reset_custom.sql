-- =====================================================
-- SISTEMA DE RECUPERACIÓN DE CONTRASEÑA CUSTOM
-- =====================================================
-- Para cuando no tienes email provider configurado
-- Genera tokens de recuperación manualmente

-- =====================================================
-- TABLA PARA TOKENS DE RECUPERACIÓN
-- =====================================================
CREATE TABLE IF NOT EXISTS public.password_reset_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '1 hour'),
  used BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Index para búsqueda rápida
CREATE INDEX IF NOT EXISTS idx_reset_tokens_token ON public.password_reset_tokens(token);
CREATE INDEX IF NOT EXISTS idx_reset_tokens_user ON public.password_reset_tokens(user_id);

-- =====================================================
-- FUNCIÓN: Generar token de recuperación
-- =====================================================
CREATE OR REPLACE FUNCTION generate_password_reset_token(user_email TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_uuid UUID;
  reset_token TEXT;
  result JSONB;
BEGIN
  -- Buscar usuario por email
  SELECT id INTO user_uuid
  FROM auth.users
  WHERE email = user_email;

  IF user_uuid IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Email no encontrado'
    );
  END IF;

  -- Generar token único (6 dígitos)
  reset_token := LPAD(floor(random() * 999999)::TEXT, 6, '0');

  -- Guardar token
  INSERT INTO public.password_reset_tokens (user_id, token, expires_at)
  VALUES (user_uuid, reset_token, now() + interval '1 hour');

  -- En producción, aquí enviarías el email con el token
  -- Por ahora, lo retornamos en la respuesta (SOLO PARA DESARROLLO)
  result := jsonb_build_object(
    'success', true,
    'token', reset_token,
    'expires_in', '1 hour',
    'message', 'Token generado. En producción se enviará por email.'
  );

  RETURN result;
END;
$$;

-- =====================================================
-- FUNCIÓN: Resetear contraseña con token
-- =====================================================
CREATE OR REPLACE FUNCTION reset_password_with_token(
  reset_token TEXT,
  new_password TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_uuid UUID;
  token_valid BOOLEAN;
BEGIN
  -- Verificar que el token existe y es válido
  SELECT user_id, (expires_at > now() AND NOT used)
  INTO user_uuid, token_valid
  FROM public.password_reset_tokens
  WHERE token = reset_token;

  IF user_uuid IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Token inválido'
    );
  END IF;

  IF NOT token_valid THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Token expirado o ya usado'
    );
  END IF;

  -- Actualizar contraseña
  UPDATE auth.users
  SET
    encrypted_password = crypt(new_password, gen_salt('bf')),
    updated_at = now()
  WHERE id = user_uuid;

  -- Marcar token como usado
  UPDATE public.password_reset_tokens
  SET used = true
  WHERE token = reset_token;

  RETURN jsonb_build_object(
    'success', true,
    'message', 'Contraseña actualizada exitosamente'
  );
END;
$$;

-- =====================================================
-- RLS POLICIES
-- =====================================================
ALTER TABLE public.password_reset_tokens ENABLE ROW LEVEL SECURITY;

-- Solo los usuarios pueden ver sus propios tokens (para debugging)
CREATE POLICY "Users can view own reset tokens"
ON public.password_reset_tokens
FOR SELECT
USING (auth.uid() = user_id);

-- =====================================================
-- PERMISOS
-- =====================================================
GRANT EXECUTE ON FUNCTION generate_password_reset_token(TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION reset_password_with_token(TEXT, TEXT) TO anon, authenticated;

-- =====================================================
-- LIMPIEZA AUTOMÁTICA DE TOKENS EXPIRADOS
-- =====================================================
CREATE OR REPLACE FUNCTION cleanup_expired_tokens()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  DELETE FROM public.password_reset_tokens
  WHERE expires_at < now() - interval '24 hours';
END;
$$;

-- =====================================================
-- EJEMPLO DE USO
-- =====================================================
-- 1. Generar token para un usuario:
--    SELECT generate_password_reset_token('usuario@ejemplo.com');
--
-- 2. Usuario usa el token para resetear:
--    SELECT reset_password_with_token('123456', 'nuevaPassword123');
--
-- 3. Limpiar tokens viejos manualmente:
--    SELECT cleanup_expired_tokens();

-- =====================================================
-- VERIFICACIÓN
-- =====================================================
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ SISTEMA DE RECUPERACIÓN CUSTOM CREADO';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Funciones disponibles:';
  RAISE NOTICE '  - generate_password_reset_token(email)';
  RAISE NOTICE '  - reset_password_with_token(token, password)';
  RAISE NOTICE '';
  RAISE NOTICE 'IMPORTANTE:';
  RAISE NOTICE '  - Tokens expiran en 1 hora';
  RAISE NOTICE '  - Solo pueden usarse una vez';
  RAISE NOTICE '  - En producción, envía el token por email';
  RAISE NOTICE '========================================';
END $$;
