-- ============================================================================
-- RECREAR CRON JOBS USANDO LA EXTENSIÓN HTTP
-- ============================================================================
-- Usa http_post en lugar de net.http_post
-- ============================================================================

-- 1. Bot Subscriptions
SELECT cron.unschedule('bot-detect-subscriptions');
SELECT cron.schedule(
  'bot-detect-subscriptions',
  '*/10 * * * *',
  $$
  SELECT http_post(
    'https://yzakmqxbzwzbsdsadzej.supabase.co/functions/v1/bot-detect-suscripciones',
    '{}',
    'application/json',
    ARRAY[
      http_header('Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl6YWttcXhiend6YnNkc2FkemVqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzkxMTMxNiwiZXhwIjoyMDc5NDg3MzE2fQ.2dxcZOhCgjewwQAC9GSfggjC9rGN1gaMhd8j9ZaY1tw')
    ]
  );
  $$
);

-- 2. Bot Duplicates
SELECT cron.unschedule('bot-detect-duplicates');
SELECT cron.schedule(
  'bot-detect-duplicates',
  '*/15 * * * *',
  $$
  SELECT http_post(
    'https://yzakmqxbzwzbsdsadzej.supabase.co/functions/v1/bot-detect-duplicados',
    '{}',
    'application/json',
    ARRAY[
      http_header('Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl6YWttcXhiend6YnNkc2FkemVqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzkxMTMxNiwiZXhwIjoyMDc5NDg3MzE2fQ.2dxcZOhCgjewwQAC9GSfggjC9rGN1gaMhd8j9ZaY1tw')
    ]
  );
  $$
);

-- 3. Bot Delivery
SELECT cron.unschedule('bot-detect-delivery');
SELECT cron.schedule(
  'bot-detect-delivery',
  '*/30 * * * *',
  $$
  SELECT http_post(
    'https://yzakmqxbzwzbsdsadzej.supabase.co/functions/v1/bot-detect-entrega',
    '{}',
    'application/json',
    ARRAY[
      http_header('Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl6YWttcXhiend6YnNkc2FkemVqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzkxMTMxNiwiZXhwIjoyMDc5NDg3MzE2fQ.2dxcZOhCgjewwQAC9GSfggjC9rGN1gaMhd8j9ZaY1tw')
    ]
  );
  $$
);

-- 4. Bot Microspend
SELECT cron.unschedule('bot-detect-microspend');
SELECT cron.schedule(
  'bot-detect-microspend',
  '*/30 * * * *',
  $$
  SELECT http_post(
    'https://yzakmqxbzwzbsdsadzej.supabase.co/functions/v1/bot-detect-microspend',
    '{}',
    'application/json',
    ARRAY[
      http_header('Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl6YWttcXhiend6YnNkc2FkemVqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzkxMTMxNiwiZXhwIjoyMDc5NDg3MzE2fQ.2dxcZOhCgjewwQAC9GSfggjC9rGN1gaMhd8j9ZaY1tw')
    ]
  );
  $$
);

-- 5. Bot Nightspend
SELECT cron.unschedule('bot-detect-nightspend');
SELECT cron.schedule(
  'bot-detect-nightspend',
  '0 * * * *',
  $$
  SELECT http_post(
    'https://yzakmqxbzwzbsdsadzej.supabase.co/functions/v1/bot-detect-nightspend',
    '{}',
    'application/json',
    ARRAY[
      http_header('Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl6YWttcXhiend6YnNkc2FkemVqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzkxMTMxNiwiZXhwIjoyMDc5NDg3MzE2fQ.2dxcZOhCgjewwQAC9GSfggjC9rGN1gaMhd8j9ZaY1tw')
    ]
  );
  $$
);

-- 6. Bot Fixed Charges
SELECT cron.unschedule('bot-detect-fixed-charges');
SELECT cron.schedule(
  'bot-detect-fixed-charges',
  '0 */2 * * *',
  $$
  SELECT http_post(
    'https://yzakmqxbzwzbsdsadzej.supabase.co/functions/v1/bot-detect-cargos-fijos',
    '{}',
    'application/json',
    ARRAY[
      http_header('Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl6YWttcXhiend6YnNkc2FkemVqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzkxMTMxNiwiZXhwIjoyMDc5NDg3MzE2fQ.2dxcZOhCgjewwQAC9GSfggjC9rGN1gaMhd8j9ZaY1tw')
    ]
  );
  $$
);

-- 7. Bot Unusual Activity
SELECT cron.unschedule('bot-detect-unusual-activity');
SELECT cron.schedule(
  'bot-detect-unusual-activity',
  '0 */4 * * *',
  $$
  SELECT http_post(
    'https://yzakmqxbzwzbsdsadzej.supabase.co/functions/v1/bot-detectar-actividad-inusual',
    '{}',
    'application/json',
    ARRAY[
      http_header('Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl6YWttcXhiend6YnNkc2FkemVqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzkxMTMxNiwiZXhwIjoyMDc5NDg3MzE2fQ.2dxcZOhCgjewwQAC9GSfggjC9rGN1gaMhd8j9ZaY1tw')
    ]
  );
  $$
);

-- 8. AI Investigator
SELECT cron.unschedule('ai-investigator');
SELECT cron.schedule(
  'ai-investigator',
  '*/5 * * * *',
  $$
  SELECT http_post(
    'https://yzakmqxbzwzbsdsadzej.supabase.co/functions/v1/investigador-de-ai',
    '{}',
    'application/json',
    ARRAY[
      http_header('Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl6YWttcXhiend6YnNkc2FkemVqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzkxMTMxNiwiZXhwIjoyMDc5NDg3MzE2fQ.2dxcZOhCgjewwQAC9GSfggjC9rGN1gaMhd8j9ZaY1tw')
    ]
  );
  $$
);

-- 9. Cleanup Cache
SELECT cron.unschedule('cleanup-expired-cache');
SELECT cron.schedule(
  'cleanup-expired-cache',
  '0 3 * * *',
  $$SELECT cleanup_expired_cache();$$
);

-- ============================================================================
-- VERIFICAR
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
-- ✅ COMPLETADO - Usando extensión HTTP
-- ============================================================================
