-- ============================================================================
-- RECREAR TODOS LOS CRON JOBS CON LOS NOMBRES CORRECTOS
-- ============================================================================
-- Ejecuta TODO este archivo de una vez en el SQL Editor
-- ============================================================================

-- 1. Bot Subscriptions
SELECT cron.unschedule('bot-detect-subscriptions');
SELECT cron.schedule(
  'bot-detect-subscriptions',
  '*/10 * * * *',
  $$SELECT net.http_post(
    url := 'https://yzakmqxbzwzbsdsadzej.supabase.co/functions/v1/bot-detect-suscripciones',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl6YWttcXhiend6YnNkc2FkemVqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzkxMTMxNiwiZXhwIjoyMDc5NDg3MzE2fQ.2dxcZOhCgjewwQAC9GSfggjC9rGN1gaMhd8j9ZaY1tw"}'::jsonb,
    body := '{}'::jsonb
  ) as request_id;$$
);

-- 2. Bot Duplicates
SELECT cron.unschedule('bot-detect-duplicates');
SELECT cron.schedule(
  'bot-detect-duplicates',
  '*/15 * * * *',
  $$SELECT net.http_post(
    url := 'https://yzakmqxbzwzbsdsadzej.supabase.co/functions/v1/bot-detect-duplicados',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl6YWttcXhiend6YnNkc2FkemVqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzkxMTMxNiwiZXhwIjoyMDc5NDg3MzE2fQ.2dxcZOhCgjewwQAC9GSfggjC9rGN1gaMhd8j9ZaY1tw"}'::jsonb,
    body := '{}'::jsonb
  ) as request_id;$$
);

-- 3. Bot Delivery
SELECT cron.unschedule('bot-detect-delivery');
SELECT cron.schedule(
  'bot-detect-delivery',
  '*/30 * * * *',
  $$SELECT net.http_post(
    url := 'https://yzakmqxbzwzbsdsadzej.supabase.co/functions/v1/bot-detect-entrega',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl6YWttcXhiend6YnNkc2FkemVqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzkxMTMxNiwiZXhwIjoyMDc5NDg3MzE2fQ.2dxcZOhCgjewwQAC9GSfggjC9rGN1gaMhd8j9ZaY1tw"}'::jsonb,
    body := '{}'::jsonb
  ) as request_id;$$
);

-- 4. Bot Microspend
SELECT cron.unschedule('bot-detect-microspend');
SELECT cron.schedule(
  'bot-detect-microspend',
  '*/30 * * * *',
  $$SELECT net.http_post(
    url := 'https://yzakmqxbzwzbsdsadzej.supabase.co/functions/v1/bot-detect-microspend',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl6YWttcXhiend6YnNkc2FkemVqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzkxMTMxNiwiZXhwIjoyMDc5NDg3MzE2fQ.2dxcZOhCgjewwQAC9GSfggjC9rGN1gaMhd8j9ZaY1tw"}'::jsonb,
    body := '{}'::jsonb
  ) as request_id;$$
);

-- 5. Bot Nightspend
SELECT cron.unschedule('bot-detect-nightspend');
SELECT cron.schedule(
  'bot-detect-nightspend',
  '0 * * * *',
  $$SELECT net.http_post(
    url := 'https://yzakmqxbzwzbsdsadzej.supabase.co/functions/v1/bot-detect-nightspend',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl6YWttcXhiend6YnNkc2FkemVqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzkxMTMxNiwiZXhwIjoyMDc5NDg3MzE2fQ.2dxcZOhCgjewwQAC9GSfggjC9rGN1gaMhd8j9ZaY1tw"}'::jsonb,
    body := '{}'::jsonb
  ) as request_id;$$
);

-- 6. Bot Fixed Charges
SELECT cron.unschedule('bot-detect-fixed-charges');
SELECT cron.schedule(
  'bot-detect-fixed-charges',
  '0 */2 * * *',
  $$SELECT net.http_post(
    url := 'https://yzakmqxbzwzbsdsadzej.supabase.co/functions/v1/bot-detect-cargos-fijos',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl6YWttcXhiend6YnNkc2FkemVqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzkxMTMxNiwiZXhwIjoyMDc5NDg3MzE2fQ.2dxcZOhCgjewwQAC9GSfggjC9rGN1gaMhd8j9ZaY1tw"}'::jsonb,
    body := '{}'::jsonb
  ) as request_id;$$
);

-- 7. Bot Unusual Activity
SELECT cron.unschedule('bot-detect-unusual-activity');
SELECT cron.schedule(
  'bot-detect-unusual-activity',
  '0 */4 * * *',
  $$SELECT net.http_post(
    url := 'https://yzakmqxbzwzbsdsadzej.supabase.co/functions/v1/bot-detectar-actividad-inusual',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl6YWttcXhiend6YnNkc2FkemVqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzkxMTMxNiwiZXhwIjoyMDc5NDg3MzE2fQ.2dxcZOhCgjewwQAC9GSfggjC9rGN1gaMhd8j9ZaY1tw"}'::jsonb,
    body := '{}'::jsonb
  ) as request_id;$$
);

-- 8. AI Investigator
SELECT cron.unschedule('ai-investigator');
SELECT cron.schedule(
  'ai-investigator',
  '*/5 * * * *',
  $$SELECT net.http_post(
    url := 'https://yzakmqxbzwzbsdsadzej.supabase.co/functions/v1/investigador-de-ai',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl6YWttcXhiend6YnNkc2FkemVqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzkxMTMxNiwiZXhwIjoyMDc5NDg3MzE2fQ.2dxcZOhCgjewwQAC9GSfggjC9rGN1gaMhd8j9ZaY1tw"}'::jsonb,
    body := '{}'::jsonb
  ) as request_id;$$
);

-- 9. Cleanup Cache (este no cambió)
SELECT cron.unschedule('cleanup-expired-cache');
SELECT cron.schedule(
  'cleanup-expired-cache',
  '0 3 * * *',
  $$SELECT cleanup_expired_cache();$$
);

-- ============================================================================
-- VERIFICAR QUE SE CREARON CORRECTAMENTE
-- ============================================================================

SELECT
  jobid,
  CASE
    WHEN command LIKE '%bot-detect-suscripciones%' THEN '✅ bot-detect-subscriptions'
    WHEN command LIKE '%bot-detect-duplicados%' THEN '✅ bot-detect-duplicates'
    WHEN command LIKE '%bot-detect-entrega%' THEN '✅ bot-detect-delivery'
    WHEN command LIKE '%bot-detect-microspend%' THEN '✅ bot-detect-microspend'
    WHEN command LIKE '%bot-detect-nightspend%' THEN '✅ bot-detect-nightspend'
    WHEN command LIKE '%bot-detect-cargos-fijos%' THEN '✅ bot-detect-fixed-charges'
    WHEN command LIKE '%bot-detectar-actividad-inusual%' THEN '✅ bot-detect-unusual-activity'
    WHEN command LIKE '%investigador-de-ai%' THEN '✅ ai-investigator'
    WHEN command LIKE '%cleanup%' THEN '✅ cleanup-expired-cache'
    ELSE '❓ Otro'
  END as job_name,
  schedule,
  active
FROM cron.job
ORDER BY jobid;

-- ============================================================================
-- ✅ COMPLETADO
-- ============================================================================
-- Los 9 cron jobs ahora apuntan a tus Edge Functions con los nombres correctos
-- ============================================================================
