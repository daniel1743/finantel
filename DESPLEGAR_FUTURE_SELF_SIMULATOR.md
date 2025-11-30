# 🚀 Guía para Desplegar Future Self Simulator en Supabase

## 📋 Requisitos Previos

Antes de desplegar la Edge Function, asegúrate de tener:

1. ✅ **Supabase CLI instalado**
2. ✅ **Tabla `future_self_scenarios` creada** (migración 044)
3. ✅ **Funciones SQL creadas:**
   - `calculate_user_financial_metrics`
   - `calculate_scenario_projection`

---

## 🔍 Paso 1: Verificar Migración SQL

La Edge Function necesita estas tablas y funciones SQL. Ejecuta esta migración en Supabase:

**Archivo:** `supabase/migrations/044_future_self_simulator.sql`

### Opción A: Desde Supabase Dashboard

1. Ve a **Supabase Dashboard** → Tu proyecto
2. Ve a **SQL Editor**
3. Copia y pega el contenido de `044_future_self_simulator.sql`
4. Ejecuta el script

### Opción B: Desde Terminal

```bash
# 1. Ir al directorio del proyecto
cd "C:\Users\Lenovo\Downloads\finantel version 2.1 funcional"

# 2. Vincular proyecto (si no está vinculado)
supabase link --project-ref yzakmqxbzwzbsdsadzej

# 3. Aplicar migración
supabase db push
```

---

## 🛠️ Paso 2: Instalar Supabase CLI

**⚠️ IMPORTANTE:** Supabase CLI NO se instala con `npm install -g`. Usa uno de estos métodos:

### Opción A: Instalar con Scoop (Recomendado para Windows)

```powershell
# 1. Instalar Scoop (si no lo tienes)
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
Invoke-RestMethod -Uri https://get.scoop.sh | Invoke-Expression

# 2. Instalar Supabase CLI
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

### Opción B: Instalar con Chocolatey

```powershell
# Instalar con Chocolatey
choco install supabase
```

### Opción C: Descargar Binario Manualmente

1. Ve a: https://github.com/supabase/cli/releases
2. Descarga `supabase_windows_amd64.zip`
3. Extrae el archivo `supabase.exe`
4. Agrega la carpeta al PATH de Windows

### Opción D: Usar npx (Sin instalar)

```bash
# Usar npx para ejecutar comandos sin instalar
npx supabase --version
npx supabase login
npx supabase link --project-ref yzakmqxbzwzbsadzej
npx supabase functions deploy future-self-simulator
```

**Verificar instalación:**
```bash
supabase --version
```

---

## 🔐 Paso 3: Login en Supabase

```bash
# Login en Supabase
supabase login
```

Esto abrirá tu navegador para autenticarte.

---

## 🔗 Paso 4: Vincular Proyecto

```bash
# Vincular tu proyecto de Supabase
supabase link --project-ref yzakmqxbzwzbsdsadzej
```

**Nota:** Si ya está vinculado, puedes omitir este paso.

---

## 📦 Paso 5: Desplegar la Edge Function

```bash
# 1. Ir al directorio del proyecto
cd "C:\Users\Lenovo\Downloads\finantel version 2.1 funcional"

# 2. Desplegar la función
supabase functions deploy future-self-simulator
```

**Esto hará:**
- ✅ Subir el código de la función a Supabase
- ✅ Configurar las variables de entorno necesarias
- ✅ Hacer la función disponible en: `https://yzakmqxbzwzbsdsadzej.supabase.co/functions/v1/future-self-simulator`

---

## ✅ Paso 6: Verificar Despliegue

### Opción A: Desde Terminal

```bash
# Listar funciones desplegadas
supabase functions list
```

Deberías ver `future-self-simulator` en la lista.

### Opción B: Desde Supabase Dashboard

1. Ve a **Supabase Dashboard** → Tu proyecto
2. Ve a **Edge Functions** en el menú lateral
3. Busca `future-self-simulator`
4. Debería aparecer en la lista

---

## 🔧 Paso 7: Configurar Variables de Entorno (Opcional)

La función usa estas variables de entorno (opcionales para IA):

- `DEEPSEEK_API_KEY` - Para usar DeepSeek AI
- `QWEN_API_KEY` - Para usar Qwen AI
- `OPENAI_API_KEY` - Para usar OpenAI

**Si no las configuras**, la función funcionará pero usará resúmenes por defecto (sin IA).

### Configurar desde Supabase Dashboard:

1. Ve a **Edge Functions** → `future-self-simulator`
2. Ve a la pestaña **Settings**
3. Agrega las variables de entorno en **Secrets**

### Configurar desde Terminal:

```bash
# Configurar variable de entorno
supabase secrets set DEEPSEEK_API_KEY=tu_api_key_aqui
supabase secrets set OPENAI_API_KEY=tu_api_key_aqui
```

---

## 🧪 Paso 8: Probar la Función

### Desde el Frontend:

La función debería funcionar automáticamente cuando uses el Simulador de Futuro en la aplicación.

### Desde Terminal (Prueba Manual):

```bash
# Probar la función
curl -X POST \
  'https://yzakmqxbzwzbsdsadzej.supabase.co/functions/v1/future-self-simulator' \
  -H 'Authorization: Bearer TU_ANON_KEY' \
  -H 'Content-Type: application/json' \
  -d '{
    "user_id": "TU_USER_ID",
    "horizon_months": 12,
    "force_recalculate": false
  }'
```

---

## ❌ Solución de Problemas

### Error: "Function not found"

**Solución:** Verifica que la función esté desplegada:
```bash
supabase functions list
```

### Error: "calculate_user_financial_metrics does not exist"

**Solución:** Ejecuta la migración SQL:
```bash
# Aplicar migración
supabase db push
```

O ejecuta manualmente `044_future_self_simulator.sql` en Supabase Dashboard.

### Error: "future_self_scenarios table does not exist"

**Solución:** La tabla se crea con la migración 044. Ejecútala primero.

### Error: 503 Service Unavailable

**Posibles causas:**
1. La función no está desplegada → Despliega con `supabase functions deploy future-self-simulator`
2. Error en el código → Revisa los logs en Supabase Dashboard
3. Timeout → La función puede estar tardando demasiado

**Revisar logs:**
```bash
# Ver logs de la función
supabase functions logs future-self-simulator
```

O desde Supabase Dashboard → Edge Functions → `future-self-simulator` → Logs

---

## 📝 Resumen de Comandos

**Si instalaste Supabase CLI:**
```bash
# 1. Verificar CLI
supabase --version

# 2. Login
supabase login

# 3. Vincular proyecto
supabase link --project-ref yzakmqxbzwzbsdsadzej

# 4. Aplicar migración SQL (si no está aplicada)
supabase db push

# 5. Desplegar función
supabase functions deploy future-self-simulator

# 6. Verificar
supabase functions list

# 7. Ver logs (si hay problemas)
supabase functions logs future-self-simulator
```

**Si usas npx (sin instalar):**
```bash
# Reemplaza 'supabase' con 'npx supabase' en todos los comandos
npx supabase --version
npx supabase login
npx supabase link --project-ref yzakmqxbzwzbsdsadzej
npx supabase functions deploy future-self-simulator
npx supabase functions list
```

---

## ✅ Checklist Final

- [ ] Supabase CLI instalado
- [ ] Login en Supabase realizado
- [ ] Proyecto vinculado
- [ ] Migración 044 ejecutada (tablas y funciones SQL)
- [ ] Edge Function desplegada
- [ ] Función aparece en `supabase functions list`
- [ ] Función funciona desde el frontend

---

## 🎉 ¡Listo!

Una vez completados estos pasos, la función `future-self-simulator` debería estar disponible y funcionando. El error 503 debería desaparecer.

