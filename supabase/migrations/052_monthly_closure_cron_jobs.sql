-- ============================================================================
-- CRON JOBS PARA SISTEMA DE CIERRE MENSUAL
-- ============================================================================
-- Configuración de tareas automáticas para:
-- 1. Notificar 2 días antes del cierre (ejecutar diariamente)
-- 2. Cerrar mes automáticamente (ejecutar el último día del mes)
-- ============================================================================

-- Habilitar extensión pg_cron si no está habilitada
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- ============================================================================
-- 1. CRON JOB: Notificar cierre mensual (2 días antes)
-- ============================================================================
-- Ejecutar diariamente a las 9:00 AM para verificar si hay que notificar
SELECT cron.schedule(
    'notify-monthly-closure',
    '0 9 * * *',  -- Todos los días a las 9:00 AM
    $$
    SELECT notify_monthly_closure();
    $$
);

-- ============================================================================
-- 2. CRON JOB: Cerrar mes automáticamente
-- ============================================================================
-- Ejecutar el último día de cada mes a las 23:59
-- Nota: pg_cron no soporta directamente "último día del mes"
-- Usaremos una función wrapper que verifica si es el último día
CREATE OR REPLACE FUNCTION check_and_close_month()
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
    v_today DATE;
    v_tomorrow DATE;
    v_is_last_day BOOLEAN;
BEGIN
    v_today := CURRENT_DATE;
    v_tomorrow := v_today + INTERVAL '1 day';
    
    -- Verificar si mañana es el primer día del mes (entonces hoy es el último)
    v_is_last_day := EXTRACT(DAY FROM v_tomorrow) = 1;
    
    IF v_is_last_day THEN
        -- Cerrar mes para todos los usuarios
        PERFORM close_month_for_all_users();
        
        RAISE NOTICE 'Mes cerrado automáticamente para todos los usuarios';
    END IF;
END;
$$;

-- Programar ejecución diaria a las 23:59
SELECT cron.schedule(
    'close-month-automatically',
    '59 23 * * *',  -- Todos los días a las 23:59
    $$
    SELECT check_and_close_month();
    $$
);

-- ============================================================================
-- 3. COMENTARIOS
-- ============================================================================

COMMENT ON FUNCTION check_and_close_month IS 'Verifica si es el último día del mes y cierra automáticamente si es necesario.';

