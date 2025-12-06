-- =====================================================
-- TABLA PARA CONVERSACIONES DE IA
-- =====================================================
-- Almacena las conversaciones del asistente de IA
-- con renombrado automático después de 3 interacciones
-- =====================================================

CREATE TABLE IF NOT EXISTS public.ai_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'Nueva conversación',
  preview TEXT,
  messages JSONB NOT NULL DEFAULT '[]'::jsonb,
  user_interaction_count INTEGER DEFAULT 0,
  is_renamed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para rendimiento
CREATE INDEX IF NOT EXISTS idx_ai_conversations_user ON public.ai_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_updated ON public.ai_conversations(user_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_renamed ON public.ai_conversations(user_id, is_renamed);

-- RLS Policies
ALTER TABLE public.ai_conversations ENABLE ROW LEVEL SECURITY;

-- Policy: Usuarios solo ven sus propias conversaciones
CREATE POLICY "Users can view own conversations"
  ON public.ai_conversations
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Usuarios solo pueden crear conversaciones para sí mismos
CREATE POLICY "Users can insert own conversations"
  ON public.ai_conversations
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Usuarios solo pueden actualizar sus propias conversaciones
CREATE POLICY "Users can update own conversations"
  ON public.ai_conversations
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Policy: Usuarios solo pueden eliminar sus propias conversaciones
CREATE POLICY "Users can delete own conversations"
  ON public.ai_conversations
  FOR DELETE
  USING (auth.uid() = user_id);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_ai_conversations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para updated_at
CREATE TRIGGER update_ai_conversations_updated_at
  BEFORE UPDATE ON public.ai_conversations
  FOR EACH ROW
  EXECUTE FUNCTION update_ai_conversations_updated_at();

