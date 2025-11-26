@echo off
REM ============================================================================
REM SCRIPT DE DESPLIEGUE - SISTEMA HÍBRIDO FINANTEL
REM ============================================================================
REM Despliega todos los componentes del sistema híbrido:
REM - Migraciones SQL (tablas, cron jobs)
REM - 7 Bots vigilantes (Edge Functions)
REM - AI Investigator (Edge Function)
REM ============================================================================

echo.
echo ========================================
echo   FINANTEL - DESPLIEGUE SISTEMA HÍBRIDO
echo ========================================
echo.

REM Verificar que Supabase CLI esté instalado
supabase --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Supabase CLI no está instalado
    echo Instala Supabase CLI desde: https://supabase.com/docs/guides/cli
    pause
    exit /b 1
)

echo [1/3] Verificando conexión a Supabase...
echo.

REM Verificar que estamos enlazados a un proyecto
supabase status >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: No estás enlazado a un proyecto de Supabase
    echo Ejecuta: supabase link --project-ref TU_PROJECT_REF
    pause
    exit /b 1
)

echo ✓ Conexión verificada
echo.

REM ============================================================================
REM PASO 1: APLICAR MIGRACIONES SQL
REM ============================================================================

echo [2/3] Aplicando migraciones SQL...
echo.

echo → Aplicando 042_hybrid_system_tables.sql (tablas base)
supabase db push
if %errorlevel% neq 0 (
    echo ERROR: Falló la migración de tablas
    pause
    exit /b 1
)

echo ✓ Tablas creadas exitosamente
echo.

echo → Aplicando 043_hybrid_system_cron_jobs.sql (cron jobs)
REM Los cron jobs se aplican automáticamente con db push
echo ✓ Cron jobs configurados
echo.

REM ============================================================================
REM PASO 2: DESPLEGAR EDGE FUNCTIONS
REM ============================================================================

echo [3/3] Desplegando Edge Functions...
echo.

echo → Desplegando bot-detect-subscriptions...
supabase functions deploy bot-detect-subscriptions --no-verify-jwt
if %errorlevel% neq 0 (
    echo ERROR: Falló el despliegue de bot-detect-subscriptions
    pause
    exit /b 1
)
echo ✓ bot-detect-subscriptions desplegado

echo → Desplegando bot-detect-duplicates...
supabase functions deploy bot-detect-duplicates --no-verify-jwt
if %errorlevel% neq 0 (
    echo ERROR: Falló el despliegue de bot-detect-duplicates
    pause
    exit /b 1
)
echo ✓ bot-detect-duplicates desplegado

echo → Desplegando bot-detect-delivery...
supabase functions deploy bot-detect-delivery --no-verify-jwt
if %errorlevel% neq 0 (
    echo ERROR: Falló el despliegue de bot-detect-delivery
    pause
    exit /b 1
)
echo ✓ bot-detect-delivery desplegado

echo → Desplegando bot-detect-microspend...
supabase functions deploy bot-detect-microspend --no-verify-jwt
if %errorlevel% neq 0 (
    echo ERROR: Falló el despliegue de bot-detect-microspend
    pause
    exit /b 1
)
echo ✓ bot-detect-microspend desplegado

echo → Desplegando bot-detect-nightspend...
supabase functions deploy bot-detect-nightspend --no-verify-jwt
if %errorlevel% neq 0 (
    echo ERROR: Falló el despliegue de bot-detect-nightspend
    pause
    exit /b 1
)
echo ✓ bot-detect-nightspend desplegado

echo → Desplegando bot-detect-fixed-charges...
supabase functions deploy bot-detect-fixed-charges --no-verify-jwt
if %errorlevel% neq 0 (
    echo ERROR: Falló el despliegue de bot-detect-fixed-charges
    pause
    exit /b 1
)
echo ✓ bot-detect-fixed-charges desplegado

echo → Desplegando bot-detect-unusual-activity...
supabase functions deploy bot-detect-unusual-activity --no-verify-jwt
if %errorlevel% neq 0 (
    echo ERROR: Falló el despliegue de bot-detect-unusual-activity
    pause
    exit /b 1
)
echo ✓ bot-detect-unusual-activity desplegado

echo → Desplegando ai-investigator...
supabase functions deploy ai-investigator --no-verify-jwt
if %errorlevel% neq 0 (
    echo ERROR: Falló el despliegue de ai-investigator
    pause
    exit /b 1
)
echo ✓ ai-investigator desplegado

echo.
echo ========================================
echo   ✓ DESPLIEGUE COMPLETADO EXITOSAMENTE
echo ========================================
echo.

echo Componentes desplegados:
echo   • 7 Bots vigilantes
echo   • 1 AI Investigator
echo   • Tablas SQL (bot_alerts, ai_model_cache, etc.)
echo   • 9 Cron Jobs automáticos
echo.

echo IMPORTANTE: Configura las API keys en Supabase Dashboard:
echo   1. Ve a: Settings ^> Edge Functions ^> Secrets
echo   2. Agrega:
echo      - DEEPSEEK_API_KEY=sk-xxxxx
echo      - QWEN_API_KEY=sk-xxxxx (opcional)
echo      - OPENAI_API_KEY=sk-xxxxx (opcional, fallback)
echo.

echo Para verificar que todo funciona:
echo   supabase functions invoke bot-detect-subscriptions
echo   supabase functions invoke ai-investigator
echo.

echo Para ver logs en tiempo real:
echo   supabase functions logs bot-detect-subscriptions
echo.

pause
