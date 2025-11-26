-- ============================================================================
-- 🤖 ACTIVAR CRON JOBS DEL SISTEMA HÍBRIDO - FINANTEL v2.1 (VERSIÓN SEGURA)
-- ============================================================================
-- ⚠️  INSTRUCCIONES IMPORTANTES:
-- 1. ANTES de ejecutar, reemplaza:
--    - TU_PROJECT_REF con tu project ref de Supabase
--    - TU_SERVICE_ROLE_KEY con tu service role key
-- 2. Ve a Settings > API en Supabase Dashboard para obtener estos valores
-- 3. NO compartas este archivo después de llenar los valores
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
    url := 'https://TU_PROJECT_REF.supabase.co/functions/v1/bot-detect-subscriptions',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer TU_SERVICE_ROLE_KEY"}'::jsonb,
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
    url := 'https://TU_PROJECT_REF.supabase.co/functions/v1/bot-detect-duplicates',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer TU_SERVICE_ROLE_KEY"}'::jsonb,
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
    url := 'https://TU_PROJECT_REF.supabase.co/functions/v1/bot-detect-delivery',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer TU_SERVICE_ROLE_KEY"}'::jsonb,
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
    url := 'https://TU_PROJECT_REF.supabase.co/functions/v1/bot-detect-microspend',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer TU_SERVICE_ROLE_KEY"}'::jsonb,
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
    url := 'https://TU_PROJECT_REF.supabase.co/functions/v1/bot-detect-nightspend',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer TU_SERVICE_ROLE_KEY"}'::jsonb,
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
    url := 'https://TU_PROJECT_REF.supabase.co/functions/v1/bot-detect-fixed-charges',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer TU_SERVICE_ROLE_KEY"}'::jsonb,
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
    url := 'https://TU_PROJECT_REF.supabase.co/functions/v1/bot-detect-unusual-activity',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer TU_SERVICE_ROLE_KEY"}'::jsonb,
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
    url := 'https://TU_PROJECT_REF.supabase.co/functions/v1/ai-investigator',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer TU_SERVICE_ROLE_KEY"}'::jsonb,
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
