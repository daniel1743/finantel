-- =====================================================
-- MIGRACIÓN: Agregar columnas para gestión de cuenta
-- =====================================================
-- Agrega columnas para pausar cuenta y eliminar cuenta
-- =====================================================

-- Agregar columnas a profile_preferences
ALTER TABLE public.profile_preferences 
ADD COLUMN IF NOT EXISTS account_paused BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS account_paused_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS account_pause_reason TEXT,
ADD COLUMN IF NOT EXISTS account_deleted BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS account_deleted_at TIMESTAMPTZ;

-- Crear índices para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_profile_preferences_account_paused 
ON public.profile_preferences(account_paused) 
WHERE account_paused = true;

CREATE INDEX IF NOT EXISTS idx_profile_preferences_account_deleted 
ON public.profile_preferences(account_deleted) 
WHERE account_deleted = true;

-- Comentarios para documentación
COMMENT ON COLUMN public.profile_preferences.account_paused IS 'Indica si la cuenta del usuario está pausada';
COMMENT ON COLUMN public.profile_preferences.account_paused_at IS 'Fecha y hora en que se pausó la cuenta';
COMMENT ON COLUMN public.profile_preferences.account_pause_reason IS 'Motivo por el cual se pausó la cuenta';
COMMENT ON COLUMN public.profile_preferences.account_deleted IS 'Indica si la cuenta del usuario ha sido eliminada';
COMMENT ON COLUMN public.profile_preferences.account_deleted_at IS 'Fecha y hora en que se eliminó la cuenta';

