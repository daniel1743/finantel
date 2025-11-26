@echo off
echo ========================================
echo DESPLEGANDO EDGE FUNCTIONS - SISTEMA HIBRIDO
echo ========================================
echo.

cd /d "%~dp0"

echo [1/8] Desplegando bot-detect-subscriptions...
call supabase functions deploy bot-detect-subscriptions --no-verify-jwt
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Fallo al desplegar bot-detect-subscriptions
    pause
    exit /b 1
)

echo [2/8] Desplegando bot-detect-duplicates...
call supabase functions deploy bot-detect-duplicates --no-verify-jwt
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Fallo al desplegar bot-detect-duplicates
    pause
    exit /b 1
)

echo [3/8] Desplegando bot-detect-delivery...
call supabase functions deploy bot-detect-delivery --no-verify-jwt
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Fallo al desplegar bot-detect-delivery
    pause
    exit /b 1
)

echo [4/8] Desplegando bot-detect-microspend...
call supabase functions deploy bot-detect-microspend --no-verify-jwt
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Fallo al desplegar bot-detect-microspend
    pause
    exit /b 1
)

echo [5/8] Desplegando bot-detect-nightspend...
call supabase functions deploy bot-detect-nightspend --no-verify-jwt
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Fallo al desplegar bot-detect-nightspend
    pause
    exit /b 1
)

echo [6/8] Desplegando bot-detect-fixed-charges...
call supabase functions deploy bot-detect-fixed-charges --no-verify-jwt
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Fallo al desplegar bot-detect-fixed-charges
    pause
    exit /b 1
)

echo [7/8] Desplegando bot-detect-unusual-activity...
call supabase functions deploy bot-detect-unusual-activity --no-verify-jwt
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Fallo al desplegar bot-detect-unusual-activity
    pause
    exit /b 1
)

echo [8/8] Desplegando ai-investigator...
call supabase functions deploy ai-investigator --no-verify-jwt
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Fallo al desplegar ai-investigator
    pause
    exit /b 1
)

echo.
echo ========================================
echo DESPLIEGUE COMPLETADO EXITOSAMENTE
echo ========================================
echo.
echo Todas las 8 Edge Functions han sido desplegadas.
echo.
echo Siguiente paso: Configurar las API Keys en Supabase Dashboard
echo URL: https://supabase.com/dashboard/project/yzakmqxbzwzbsdsadzej/settings/vault/secrets
echo.
pause
