-- ============================================================================
-- 🤖 ACTIVAR CRON JOBS DEL SISTEMA HÍBRIDO - FINANTEL v2.1
-- ============================================================================
-- ⚠️  IMPORTANTE: Solo ejecuta este script DESPUÉS de haber desplegado
--     las Edge Functions (7 bots + AI investigator)
--
-- INSTRUCCIONES:
-- 1. Primero despliega las Edge Functions
-- 2. Luego abre https://supabase.com/dashboard/project/yzakmqxbzwzbsdsadzej/sql/new
-- 3. Copia y pega TODO este archivo
-- 4. Haz clic en "RUN" o presiona Ctrl+Enter
-- ============================================================================

-- Eliminar cron jobs existentes si ya existen (evita duplicados)
SELECT cron.unschedule(jobname) FROM cron.job WHERE jobname IN (
  'bot-detect-subscriptions',
  'bot-detect-duplicates',
  'bot-detect-delivery',
  'bot-detect-microspend',
  'bot-detect-nightspend',
  'bot-detect-fixed-charges',
  'bot-detect-unusual-activity',
  'ai-investigator',
  'cleanup-expired-cache'
);

-- ============================================================================
-- CRON JOBS PARA BOTS VIGILANTES
-- ============================================================================

-- Bot 1: Detectar Suscripciones (cada 10 minutos)
SELECT cron.schedule(
  'bot-detect-subscriptions',
  '*/10 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://yzakmqxbzwzbsdsadzej.supabase.co/functions/v1/bot-detect-subscriptions',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl6YWttcXhiend6YnNkc2FkemVqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzkxMTMxNiwiZXhwIjoyMDc5NDg3MzE2fQ.2dxcZOhCgjewwQAC9GSfggjC9rGN1gaMhd8j9ZaY1tw"}'::jsonb,
    body := '{}'::jsonb
  ) as request_id;
  $$
);

-- Bot 2: Detectar Duplicados (cada 15 minutos)
SELECT cron.schedule(
  'bot-detect-duplicates',
  '*/15 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://yzakmqxbzwzbsdsadzej.supabase.co/functions/v1/bot-detect-duplicates',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl6YWttcXhiend6YnNkc2FkemVqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzkxMTMxNiwiZXhwIjoyMDc5NDg3MzE2fQ.2dxcZOhCgjewwQAC9GSfggjC9rGN1gaMhd8j9ZaY1tw"}'::jsonb,
    body := '{}'::jsonb
  ) as request_id;
  $$
);

-- Bot 3: Detectar Delivery Excesivo (cada 30 minutos)
SELECT cron.schedule(
  'bot-detect-delivery',
  '*/30 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://yzakmqxbzwzbsdsadzej.supabase.co/functions/v1/bot-detect-delivery',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl6YWttcXhiend6YnNkc2FkemVqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzkxMTMxNiwiZXhwIjoyMDc5NDg3MzE2fQ.2dxcZOhCgjewwQAC9GSfggjC9rGN1gaMhd8j9ZaY1tw"}'::jsonb,
    body := '{}'::jsonb
  ) as request_id;
  $$
);

-- Bot 4: Detectar Microcompras (cada 30 minutos)
SELECT cron.schedule(
  'bot-detect-microspend',
  '*/30 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://yzakmqxbzwzbsdsadzej.supabase.co/functions/v1/bot-detect-microspend',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl6YWttcXhiend6YnNkc2FkemVqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzkxMTMxNiwiZXhwIjoyMDc5NDg3MzE2fQ.2dxcZOhCgjewwQAC9GSfggjC9rGN1gaMhd8j9ZaY1tw"}'::jsonb,
    body := '{}'::jsonb
  ) as request_id;
  $$
);

-- Bot 5: Detectar Compras Nocturnas (cada 1 hora)
SELECT cron.schedule(
  'bot-detect-nightspend',
  '0 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://yzakmqxbzwzbsdsadzej.supabase.co/functions/v1/bot-detect-nightspend',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl6YWttcXhiend6YnNkc2FkemVqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzkxMTMxNiwiZXhwIjoyMDc5NDg3MzE2fQ.2dxcZOhCgjewwQAC9GSfggjC9rGN1gaMhd8j9ZaY1tw"}'::jsonb,
    body := '{}'::jsonb
  ) as request_id;
  $$
);

-- Bot 6: Detectar Cargos Fijos Sospechosos (cada 2 horas)
SELECT cron.schedule(
  'bot-detect-fixed-charges',
  '0 */2 * * *',
  $$
  SELECT net.http_post(
    url := 'https://yzakmqxbzwzbsdsadzej.supabase.co/functions/v1/bot-detect-fixed-charges',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl6YWttcXhiend6YnNkc2FkemVqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzkxMTMxNiwiZXhwIjoyMDc5NDg3MzE2fQ.2dxcZOhCgjewwQAC9GSfggjC9rGN1gaMhd8j9ZaY1tw"}'::jsonb,
    body := '{}'::jsonb
  ) as request_id;
  $$
);

-- Bot 7: Detectar Actividad Inusual (cada 4 horas)
SELECT cron.schedule(
  'bot-detect-unusual-activity',
  '0 */4 * * *',
  $$
  SELECT net.http_post(
    url := 'https://yzakmqxbzwzbsdsadzej.supabase.co/functions/v1/bot-detect-unusual-activity',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl6YWttcXhiend6YnNkc2FkemVqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzkxMTMxNiwiZXhwIjoyMDc5NDg3MzE2fQ.2dxcZOhCgjewwQAC9GSfggjC9rGN1gaMhd8j9ZaY1tw"}'::jsonb,
    body := '{}'::jsonb
  ) as request_id;
  $$
);

-- ============================================================================
-- CRON JOB PARA AI INVESTIGATOR
-- ============================================================================

-- AI Investigator: Analizar alertas cada 5 minutos
SELECT cron.schedule(
  'ai-investigator',
  '*/5 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://yzakmqxbzwzbsdsadzej.supabase.co/functions/v1/ai-investigator',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl6YWttcXhiend6YnNkc2FkemVqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzkxMTMxNiwiZXhwIjoyMDc5NDg3MzE2fQ.2dxcZOhCgjewwQAC9GSfggjC9rGN1gaMhd8j9ZaY1tw"}'::jsonb,
    body := '{}'::jsonb
  ) as request_id;
  $$
);

-- ============================================================================
-- CRON JOB PARA LIMPIEZA DE CACHE
-- ============================================================================

-- Limpiar cache expirado (diariamente a las 3 AM)
SELECT cron.schedule(
  'cleanup-expired-cache',
  '0 3 * * *',
  $$SELECT cleanup_expired_cache();$$
);

-- ============================================================================
-- VERIFICAR QUE LOS CRON JOBS FUERON CREADOS
-- ============================================================================

SELECT * FROM cron.job WHERE jobname IN (
  'bot-detect-subscriptions',
  'bot-detect-duplicates',
  'bot-detect-delivery',
  'bot-detect-microspend',
  'bot-detect-nightspend',
  'bot-detect-fixed-charges',
  'bot-detect-unusual-activity',
  'ai-investigator',
  'cleanup-expired-cache'
)
ORDER BY jobid;

-- ============================================================================
-- ✅ CRON JOBS ACTIVADOS
-- ============================================================================
--
-- ✅ 7 Bots vigilantes configurados
-- ✅ AI Investigator configurado
-- ✅ Limpieza automática de cache configurada
--
-- 📊 FRECUENCIAS:
-- • bot-detect-subscriptions: cada 10 minutos
-- • bot-detect-duplicates: cada 15 minutos
-- • bot-detect-delivery: cada 30 minutos
-- • bot-detect-microspend: cada 30 minutos
-- • bot-detect-nightspend: cada 1 hora
-- • bot-detect-fixed-charges: cada 2 horas
-- • bot-detect-unusual-activity: cada 4 horas
-- • ai-investigator: cada 5 minutos
-- • cleanup-expired-cache: diario a las 3 AM
--
-- 🛠️  COMANDOS ÚTILES:
-- • Ver estado: SELECT * FROM get_active_cron_jobs();
-- • Ver historial: SELECT * FROM get_cron_job_history(50);
-- • Ver estadísticas: SELECT * FROM get_cron_job_stats();
-- • Pausar bot: SELECT pause_cron_job('bot-detect-subscriptions');
-- • Reactivar bot: SELECT resume_cron_job('bot-detect-subscriptions');
--
-- ============================================================================
