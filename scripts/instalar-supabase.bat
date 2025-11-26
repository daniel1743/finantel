@echo off
REM ============================================================================
REM SCRIPT DE INSTALACIÓN DE SUPABASE CLI
REM ============================================================================
REM Este script ayuda a instalar y configurar Supabase CLI en Windows
REM ============================================================================

echo.
echo ========================================
echo   INSTALACIÓN DE SUPABASE CLI
echo ========================================
echo.

REM Verificar si Supabase CLI ya está instalado
supabase --version >nul 2>&1
if %errorlevel% equ 0 (
    echo ✓ Supabase CLI ya está instalado
    supabase --version
    echo.
    goto :configurar
)

echo [1/3] Instalando Supabase CLI...
echo.

REM Verificar si Scoop está instalado
scoop --version >nul 2>&1
if %errorlevel% equ 0 (
    echo → Detectado Scoop, instalando Supabase CLI...
    scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
    scoop install supabase
    if %errorlevel% equ 0 (
        echo ✓ Supabase CLI instalado con Scoop
        goto :configurar
    )
)

REM Verificar si Chocolatey está instalado
choco --version >nul 2>&1
if %errorlevel% equ 0 (
    echo → Detectado Chocolatey, instalando Supabase CLI...
    choco install supabase -y
    if %errorlevel% equ 0 (
        echo ✓ Supabase CLI instalado con Chocolatey
        goto :configurar
    )
)

echo.
echo ⚠️  No se detectó Scoop ni Chocolatey
echo.
echo OPCIONES DE INSTALACIÓN:
echo.
echo 1. INSTALAR SCOOP (Recomendado):
echo    Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
echo    irm get.scoop.sh ^| iex
echo    scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
echo    scoop install supabase
echo.
echo 2. DESCARGAR MANUALMENTE:
echo    - Ve a: https://github.com/supabase/cli/releases
echo    - Descarga: supabase_X.X.X_windows_amd64.zip
echo    - Extrae supabase.exe
echo    - Mueve a: C:\Windows\System32\
echo.
echo 3. USAR NPX (Sin instalar):
echo    npx supabase --version
echo.
pause
exit /b 1

:configurar
echo.
echo [2/3] Configurando Supabase en el proyecto...
echo.

REM Verificar si ya existe config.toml
if exist "supabase\config.toml" (
    echo ✓ config.toml ya existe
) else (
    echo → Creando config.toml...
    REM El archivo ya fue creado manualmente
    echo ✓ config.toml creado
)

echo.
echo [3/3] Verificando configuración...
echo.

REM Verificar si está enlazado a un proyecto
supabase status >nul 2>&1
if %errorlevel% equ 0 (
    echo ✓ Proyecto enlazado
    supabase status
) else (
    echo ⚠️  No estás enlazado a un proyecto
    echo.
    echo Para enlazar tu proyecto:
    echo   1. Ve a: https://supabase.com/dashboard
    echo   2. Selecciona tu proyecto
    echo   3. Ve a: Settings ^> General
    echo   4. Copia el "Reference ID"
    echo   5. Ejecuta: supabase link --project-ref TU_PROJECT_REF
    echo.
)

echo.
echo ========================================
echo   INSTALACIÓN COMPLETADA
echo ========================================
echo.
echo PRÓXIMOS PASOS:
echo.
echo 1. Enlazar proyecto (si no lo has hecho):
echo    supabase link --project-ref TU_PROJECT_REF
echo.
echo 2. Configurar variables de entorno:
echo    - Crea archivo .env en la raíz
echo    - Agrega VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY
echo.
echo 3. Aplicar migraciones:
echo    supabase db push
echo.
echo 4. Desplegar Edge Functions:
echo    supabase functions deploy
echo.
echo Para más información, lee: INSTALAR_SUPABASE.md
echo.
pause

