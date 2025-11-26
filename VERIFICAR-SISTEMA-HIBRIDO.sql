-- ============================================================================
-- 🔍 VERIFICACIÓN COMPLETA DEL SISTEMA HÍBRIDO
-- ============================================================================
-- Ejecuta estas queries una por una para verificar que todo funciona
-- ============================================================================

-- ============================================================================
-- PASO 1: Verificar que las tablas existen
-- ============================================================================

SELECT
  'bot_alerts' as tabla,
  COUNT(*) as total_registros
FROM bot_alerts

UNION ALL

SELECT
  'ai_model_cache' as tabla,
  COUNT(*) as total_registros
FROM ai_model_cache

UNION ALL

SELECT
  'api_cache' as tabla,
  COUNT(*) as total_registros
FROM api_cache

UNION ALL

SELECT
  'bot_statistics' as tabla,
  COUNT(*) as total_registros
FROM bot_statistics;

-- ✅ ESPERADO: 4 filas (una por cada tabla)
-- Si aparece error "table does not exist", ejecuta EJECUTAR-ESTE-SQL-EN-SUPABASE.sql primero

-- ============================================================================
-- PASO 2: Verificar que los índices fueron creados
-- ============================================================================

SELECT
  tablename,
  indexname
FROM pg_indexes
WHERE tablename IN ('bot_alerts', 'ai_model_cache', 'api_cache', 'bot_statistics')
ORDER BY tablename, indexname;

-- ✅ ESPERADO: Ver múltiples índices para cada tabla

-- ============================================================================
-- PASO 3: Verificar que las funciones auxiliares existen
-- ============================================================================

SELECT
  proname as nombre_funcion,
  prokind as tipo
FROM pg_proc
WHERE proname IN (
  'get_ai_cache',
  'set_ai_cache',
  'cleanup_expired_cache',
  'get_cache_statistics',
  'get_active_cron_jobs',
  'get_cron_job_history',
  'get_cron_job_stats',
  'pause_cron_job',
  'resume_cron_job'
)
ORDER BY proname;

-- ✅ ESPERADO: 9 funciones

-- ============================================================================
-- PASO 4: Verificar que pg_cron está habilitado
-- ============================================================================

SELECT * FROM pg_extension WHERE extname = 'pg_cron';

-- ✅ ESPERADO: 1 fila mostrando pg_cron habilitado
-- Si está vacío, ejecuta: CREATE EXTENSION IF NOT EXISTS pg_cron;

-- ============================================================================
-- PASO 5: Verificar que los cron jobs están activos
-- ============================================================================

SELECT
  jobid,
  schedule,
  CASE
    WHEN command LIKE '%bot-detect-subscriptions%' THEN 'bot-detect-subscriptions'
    WHEN command LIKE '%bot-detect-duplicates%' THEN 'bot-detect-duplicates'
    WHEN command LIKE '%bot-detect-delivery%' THEN 'bot-detect-delivery'
    WHEN command LIKE '%bot-detect-microspend%' THEN 'bot-detect-microspend'
    WHEN command LIKE '%bot-detect-nightspend%' THEN 'bot-detect-nightspend'
    WHEN command LIKE '%bot-detect-fixed-charges%' THEN 'bot-detect-fixed-charges'
    WHEN command LIKE '%bot-detect-unusual-activity%' THEN 'bot-detect-unusual-activity'
    WHEN command LIKE '%ai-investigator%' THEN 'ai-investigator'
    WHEN command LIKE '%cleanup-expired-cache%' THEN 'cleanup-expired-cache'
    ELSE 'otro'
  END as job_name,
  active,
  database,
  username
FROM cron.job
ORDER BY jobid;

-- ✅ ESPERADO: 9 cron jobs activos (active = true)
-- Si está vacío, ejecuta ACTIVAR-CRON-JOBS.sql

-- ============================================================================
-- PASO 6: Ver estadísticas de los cron jobs
-- ============================================================================

SELECT * FROM get_cron_job_stats();

-- ✅ ESPERADO: Ver estadísticas de ejecuciones (puede estar vacío si son nuevos)

-- ============================================================================
-- PASO 7: Ver últimas ejecuciones de los cron jobs
-- ============================================================================

SELECT
  jobid,
  status,
  return_message,
  start_time,
  end_time,
  EXTRACT(EPOCH FROM (end_time - start_time)) * 1000 as duration_ms
FROM cron.job_run_details
ORDER BY start_time DESC
LIMIT 20;

-- ✅ ESPERADO: Ver ejecuciones recientes (puede estar vacío si son nuevos)

-- ============================================================================
-- PASO 8: Verificar que Row Level Security está habilitado
-- ============================================================================

SELECT
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE tablename IN ('bot_alerts', 'ai_model_cache', 'api_cache', 'bot_statistics')
ORDER BY tablename;

-- ✅ ESPERADO: rls_enabled = true para todas las tablas

-- ============================================================================
-- PASO 9: Ver políticas de RLS
-- ============================================================================

SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE tablename IN ('bot_alerts', 'ai_model_cache', 'api_cache', 'bot_statistics')
ORDER BY tablename, policyname;

-- ✅ ESPERADO: Ver políticas de seguridad para cada tabla

-- ============================================================================
-- PASO 10: Verificar configuración de cache
-- ============================================================================

SELECT * FROM get_cache_statistics();

-- ✅ ESPERADO: Estadísticas de cache (probablemente vacío al inicio)

-- ============================================================================
-- PASO 11: PRUEBA REAL - Crear una alerta de prueba
-- ============================================================================

-- ⚠️ IMPORTANTE: Cambia 'TU_USER_ID_AQUI' por tu user ID real
-- Para obtenerlo, ejecuta: SELECT auth.uid();

INSERT INTO bot_alerts (
  user_id,
  bot_name,
  anomaly_type,
  severity,
  confidence_score,
  payload,
  status
) VALUES (
  auth.uid(), -- Tu user ID actual
  'bot-detect-subscriptions',
  'suscripcion_oculta',
  'high',
  85.0,
  jsonb_build_object(
    'description', 'NETFLIX mensual detectado',
    'amount', 15990,
    'frequency', 'monthly',
    'transaction_ids', ARRAY[]::text[],
    'occurrences', 3
  ),
  'pending'
)
RETURNING *;

-- ✅ ESPERADO: Ver la alerta creada con status = 'pending'

-- ============================================================================
-- PASO 12: Verificar que la alerta de prueba fue creada
-- ============================================================================

SELECT
  id,
  bot_name,
  anomaly_type,
  severity,
  confidence_score,
  status,
  detected_at,
  payload
FROM bot_alerts
WHERE user_id = auth.uid()
ORDER BY detected_at DESC
LIMIT 5;

-- ✅ ESPERADO: Ver tu alerta de prueba

-- ============================================================================
-- PASO 13: Esperar 5 minutos y verificar que AI Investigator la procesó
-- ============================================================================

-- Ejecuta esto DESPUÉS de 5 minutos (el AI investigator corre cada 5 min)

SELECT
  id,
  bot_name,
  anomaly_type,
  status,
  ai_analysis,
  processed_at
FROM bot_alerts
WHERE user_id = auth.uid()
  AND status IN ('confirmed', 'false_alarm', 'processing')
ORDER BY detected_at DESC
LIMIT 5;

-- ✅ ESPERADO: Ver status cambiado a 'confirmed' o 'false_alarm'
-- ✅ ESPERADO: ai_analysis con el análisis de la IA

-- ============================================================================
-- PASO 14: Ver si se creó un leak_insight
-- ============================================================================

SELECT
  id,
  type,
  status,
  monthly_estimated_leak,
  severity,
  confidence,
  description,
  suggested_actions,
  created_at
FROM leak_insights
WHERE user_id = auth.uid()
ORDER BY created_at DESC
LIMIT 5;

-- ✅ ESPERADO: Ver el leak_insight creado por el AI investigator

-- ============================================================================
-- PASO 15: Verificar que las API Keys están configuradas
-- ============================================================================

-- ⚠️ Esto solo funciona si tienes permisos para ver secrets
-- Si no funciona, verifica manualmente en:
-- https://supabase.com/dashboard/project/yzakmqxbzwzbsdsadzej/settings/vault/secrets

-- Esta query NO mostrará los valores (por seguridad), solo si existen
SELECT
  'DEEPSEEK_API_KEY' as secret_name,
  CASE
    WHEN current_setting('app.settings.deepseek_api_key', true) IS NOT NULL
    THEN 'Configurado ✅'
    ELSE 'NO configurado ❌'
  END as status
UNION ALL
SELECT
  'QWEN_API_KEY',
  CASE
    WHEN current_setting('app.settings.qwen_api_key', true) IS NOT NULL
    THEN 'Configurado ✅'
    ELSE 'NO configurado ❌'
  END
UNION ALL
SELECT
  'OPENAI_API_KEY',
  CASE
    WHEN current_setting('app.settings.openai_api_key', true) IS NOT NULL
    THEN 'Configurado ✅'
    ELSE 'NO configurado ❌'
  END;

-- ============================================================================
-- 📊 RESUMEN FINAL
-- ============================================================================

SELECT
  '✅ SISTEMA HÍBRIDO OPERATIVO' as estado,
  (SELECT COUNT(*) FROM bot_alerts) as total_alertas,
  (SELECT COUNT(*) FROM bot_alerts WHERE status = 'pending') as alertas_pendientes,
  (SELECT COUNT(*) FROM bot_alerts WHERE status = 'confirmed') as alertas_confirmadas,
  (SELECT COUNT(*) FROM leak_insights) as fugas_detectadas,
  (SELECT COUNT(*) FROM ai_model_cache) as respuestas_cacheadas,
  (SELECT COUNT(*) FROM cron.job WHERE active = true) as cron_jobs_activos;

-- ============================================================================
-- FIN DE LA VERIFICACIÓN
-- ============================================================================
