-- ============================================================================
-- 🤖 ACTIVAR CRON JOBS - VERSIÓN CORREGIDA CON TUS NOMBRES DE FUNCIONES
-- ============================================================================
-- Este script usa los nombres EXACTOS de tus Edge Functions desplegadas
-- ============================================================================

-- Eliminar cron jobs existentes (limpiar)
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
-- CRON JOBS CON LOS NOMBRES CORRECTOS DE TUS FUNCIONES
-- ============================================================================

-- Bot 1: Suscripciones (cada 10 minutos)
SELECT cron.schedule(
  'bot-detect-subscriptions',
  '*/10 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://yzakmqxbzwzbsdsadzej.supabase.co/functions/v1/bot-detect-suscripciones',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl6YWttcXhiend6YnNkc2FkemVqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzkxMTMxNiwiZXhwIjoyMDc5NDg3MzE2fQ.2dxcZOhCgjewwQAC9GSfggjC9rGN1gaMhd8j9ZaY1tw"}'::jsonb,
    body := '{}'::jsonb
  ) as request_id;
  $$
);

-- Bot 2: Duplicados (cada 15 minutos)
SELECT cron.schedule(
  'bot-detect-duplicates',
  '*/15 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://yzakmqxbzwzbsdsadzej.supabase.co/functions/v1/bot-detect-duplicados',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl6YWttcXhiend6YnNkc2FkemVqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzkxMTMxNiwiZXhwIjoyMDc5NDg3MzE2fQ.2dxcZOhCgjewwQAC9GSfggjC9rGN1gaMhd8j9ZaY1tw"}'::jsonb,
    body := '{}'::jsonb
  ) as request_id;
  $$
);

-- Bot 3: Delivery (cada 30 minutos)
SELECT cron.schedule(
  'bot-detect-delivery',
  '*/30 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://yzakmqxbzwzbsdsadzej.supabase.co/functions/v1/bot-detect-entrega',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl6YWttcXhiend6YnNkc2FkemVqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzkxMTMxNiwiZXhwIjoyMDc5NDg3MzE2fQ.2dxcZOhCgjewwQAC9GSfggjC9rGN1gaMhd8j9ZaY1tw"}'::jsonb,
    body := '{}'::jsonb
  ) as request_id;
  $$
);

-- Bot 4: Microspend (cada 30 minutos)
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

-- Bot 5: Nightspend (cada 1 hora)
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

-- Bot 6: Fixed Charges (cada 2 horas)
SELECT cron.schedule(
  'bot-detect-fixed-charges',
  '0 */2 * * *',
  $$
  SELECT net.http_post(
    url := 'https://yzakmqxbzwzbsdsadzej.supabase.co/functions/v1/bot-detect-cargos-fijos',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl6YWttcXhiend6YnNkc2FkemVqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzkxMTMxNiwiZXhwIjoyMDc5NDg3MzE2fQ.2dxcZOhCgjewwQAC9GSfggjC9rGN1gaMhd8j9ZaY1tw"}'::jsonb,
    body := '{}'::jsonb
  ) as request_id;
  $$
);

-- Bot 7: Unusual Activity (cada 4 horas)
SELECT cron.schedule(
  'bot-detect-unusual-activity',
  '0 */4 * * *',
  $$
  SELECT net.http_post(
    url := 'https://yzakmqxbzwzbsdsadzej.supabase.co/functions/v1/bot-detectar-actividad-inusual',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl6YWttcXhiend6YnNkc2FkemVqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzkxMTMxNiwiZXhwIjoyMDc5NDg3MzE2fQ.2dxcZOhCgjewwQAC9GSfggjC9rGN1gaMhd8j9ZaY1tw"}'::jsonb,
    body := '{}'::jsonb
  ) as request_id;
  $$
);

-- AI Investigator (cada 5 minutos)
SELECT cron.schedule(
  'ai-investigator',
  '*/5 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://yzakmqxbzwzbsdsadzej.supabase.co/functions/v1/investigador-de-ai',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl6YWttcXhiend6YnNkc2FkemVqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzkxMTMxNiwiZXhwIjoyMDc5NDg3MzE2fQ.2dxcZOhCgjewwQAC9GSfggjC9rGN1gaMhd8j9ZaY1tw"}'::jsonb,
    body := '{}'::jsonb
  ) as request_id;
  $$
);

-- Cleanup cache (diariamente a las 3 AM)
SELECT cron.schedule(
  'cleanup-expired-cache',
  '0 3 * * *',
  $$SELECT cleanup_expired_cache();$$
);

-- ============================================================================
-- VERIFICAR QUE SE CREARON
-- ============================================================================

SELECT
  jobid,
  CASE
    WHEN command LIKE '%bot-detect-suscripciones%' THEN 'bot-detect-subscriptions ✅'
    WHEN command LIKE '%bot-detect-duplicados%' THEN 'bot-detect-duplicates ✅'
    WHEN command LIKE '%bot-detect-entrega%' THEN 'bot-detect-delivery ✅'
    WHEN command LIKE '%bot-detect-microspend%' THEN 'bot-detect-microspend ✅'
    WHEN command LIKE '%bot-detect-nightspend%' THEN 'bot-detect-nightspend ✅'
    WHEN command LIKE '%bot-detect-cargos-fijos%' THEN 'bot-detect-fixed-charges ✅'
    WHEN command LIKE '%bot-detectar-actividad-inusual%' THEN 'bot-detect-unusual-activity ✅'
    WHEN command LIKE '%investigador-de-ai%' THEN 'ai-investigator ✅'
    WHEN command LIKE '%cleanup%' THEN 'cleanup-expired-cache ✅'
    ELSE 'Otro'
  END as job_name,
  schedule,
  active
FROM cron.job
ORDER BY jobid;

-- ============================================================================
-- ✅ LISTO - Los cron jobs ahora apuntan a tus funciones con los nombres correctos
-- ============================================================================
