-- ============================================================================
-- CRON JOBS PARA SISTEMA DE DETECCIÓN DE ABUSO POR IP
-- ============================================================================
-- Tareas automáticas para mantener estadísticas actualizadas
-- ============================================================================

-- Habilitar extensión pg_cron si no está habilitada
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- ============================================================================
-- 1. CRON JOB: Actualizar estadísticas de IP (cada hora)
-- ============================================================================
SELECT cron.schedule(
    'update-ip-risk-stats',
    '0 * * * *',  -- Cada hora
    $$
    SELECT update_ip_risk_stats();
    $$
);

-- ============================================================================
-- 2. CRON JOB: Limpiar eventos antiguos (diariamente a las 2 AM)
-- ============================================================================
-- Mantener solo eventos de los últimos 90 días
CREATE OR REPLACE FUNCTION cleanup_old_ip_risk_events()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_deleted_count INTEGER;
BEGIN
    DELETE FROM public.ip_risk_events
    WHERE created_at < NOW() - INTERVAL '90 days';
    
    GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
    
    RETURN v_deleted_count;
END;
$$;

SELECT cron.schedule(
    'cleanup-old-ip-risk-events',
    '0 2 * * *',  -- Diariamente a las 2 AM
    $$
    SELECT cleanup_old_ip_risk_events();
    $$
);

-- ============================================================================
-- 3. COMENTARIOS
-- ============================================================================

COMMENT ON FUNCTION update_ip_risk_stats IS 'Actualiza estadísticas agregadas de IPs. Ejecutar periódicamente.';
COMMENT ON FUNCTION cleanup_old_ip_risk_events IS 'Elimina eventos de riesgo antiguos (más de 90 días).';

