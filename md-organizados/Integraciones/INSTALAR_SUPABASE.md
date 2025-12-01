# 🚀 GUÍA DE INSTALACIÓN DE SUPABASE CLI

## 📋 PASO 1: Instalar Supabase CLI

Supabase CLI **NO** se instala con `npm install -g`. Debes usar uno de estos métodos:

### Opción A: Scoop (Recomendado para Windows)

```powershell
# 1. Instalar Scoop (si no lo tienes)
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
irm get.scoop.sh | iex

# 2. Instalar Supabase CLI
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

### Opción B: Descargar Binario (Más Simple)

1. Ve a: https://github.com/supabase/cli/releases
2. Descarga: `supabase_X.X.X_windows_amd64.zip`
3. Extrae el archivo `supabase.exe`
4. Mueve `supabase.exe` a una carpeta en tu PATH (ej: `C:\Windows\System32\`)

### Opción C: Chocolatey

```powershell
choco install supabase
```

### Opción D: Usar npx (Sin instalar)

Puedes usar Supabase sin instalarlo globalmente:

```bash
npx supabase --version
```

---

## 📋 PASO 2: Verificar Instalación

```bash
supabase --version
```

Deberías ver algo como: `supabase X.X.X`

---

## 📋 PASO 3: Inicializar Supabase en el Proyecto

Ya tienes la carpeta `supabase/` con migrations y functions, pero necesitas el archivo `config.toml`.

### Opción A: Si ya tienes un proyecto en Supabase Cloud

```bash
# 1. Iniciar sesión
supabase login

# 2. Enlazar tu proyecto
supabase link --project-ref TU_PROJECT_REF
```

**Obtener PROJECT_REF:**
- Ve a: https://supabase.com/dashboard
- Selecciona tu proyecto
- Ve a: Settings → General
- Copia el "Reference ID"

### Opción B: Si quieres crear un proyecto nuevo

```bash
# 1. Iniciar sesión
supabase login

# 2. Crear nuevo proyecto
supabase projects create nombre-del-proyecto --org-id TU_ORG_ID

# 3. Enlazar proyecto
supabase link --project-ref PROJECT_REF
```

### Opción C: Usar Supabase Local (Desarrollo)

```bash
# Inicializar proyecto local
supabase init

# Iniciar servicios locales
supabase start
```

---

## 📋 PASO 4: Configurar Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto:

```env
# Supabase
VITE_SUPABASE_URL=https://TU_PROJECT_REF.supabase.co
VITE_SUPABASE_ANON_KEY=tu_anon_key_aqui

# Para Edge Functions (opcional)
SUPABASE_URL=https://TU_PROJECT_REF.supabase.co
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key_aqui
OPENAI_API_KEY=sk-xxxxx
```

**Obtener las keys:**
1. Ve a: https://supabase.com/dashboard/project/TU_PROJECT_REF
2. Ve a: Settings → API
3. Copia:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon public** → `VITE_SUPABASE_ANON_KEY`
   - **service_role** → `SUPABASE_SERVICE_ROLE_KEY` (solo para Edge Functions)

---

## 📋 PASO 5: Aplicar Migraciones

```bash
# Aplicar todas las migraciones
supabase db push

# O aplicar una migración específica
supabase migration up
```

---

## 📋 PASO 6: Desplegar Edge Functions

```bash
# Desplegar todas las funciones
supabase functions deploy

# O desplegar una función específica
supabase functions deploy bot-detect-subscriptions
```

---

## ✅ VERIFICAR QUE TODO FUNCIONA

```bash
# Ver estado del proyecto
supabase status

# Ver logs de funciones
supabase functions logs bot-detect-subscriptions

# Probar una función
supabase functions invoke bot-detect-subscriptions
```

---

## 🆘 SOLUCIÓN DE PROBLEMAS

### Error: "command not found: supabase"

**Solución:** Instala Supabase CLI usando uno de los métodos del Paso 1.

### Error: "No estás enlazado a un proyecto"

**Solución:**
```bash
supabase link --project-ref TU_PROJECT_REF
```

### Error: "Variables de entorno no configuradas"

**Solución:** Crea el archivo `.env` con las variables del Paso 4.

---

## 📚 COMANDOS ÚTILES

```bash
# Ver ayuda
supabase --help

# Ver estado
supabase status

# Ver logs
supabase functions logs NOMBRE_FUNCION

# Invocar función
supabase functions invoke NOMBRE_FUNCION

# Aplicar migraciones
supabase db push

# Crear nueva migración
supabase migration new nombre_migracion

# Ver diferencias entre local y remoto
supabase db diff
```

---

## 🎯 PRÓXIMOS PASOS

1. ✅ Instalar Supabase CLI
2. ✅ Inicializar proyecto
3. ✅ Configurar variables de entorno
4. ✅ Aplicar migraciones
5. ✅ Desplegar Edge Functions

---

**¿Necesitas ayuda?** Revisa la documentación oficial: https://supabase.com/docs/guides/cli

