# ⚡ INICIO RÁPIDO - SUPABASE CLI

## 🚀 Instalación Rápida (3 pasos)

### 1️⃣ Instalar Supabase CLI

**Opción más fácil (Scoop):**
```powershell
# Abre PowerShell como Administrador
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
irm get.scoop.sh | iex
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

**O ejecuta el script automático:**
```bash
scripts\instalar-supabase.bat
```

### 2️⃣ Enlazar tu Proyecto

```bash
# 1. Iniciar sesión
supabase login

# 2. Enlazar proyecto (reemplaza TU_PROJECT_REF)
supabase link --project-ref TU_PROJECT_REF
```

**¿Dónde obtener PROJECT_REF?**
- Ve a: https://supabase.com/dashboard
- Selecciona tu proyecto
- Settings → General → "Reference ID"

### 3️⃣ Configurar Variables de Entorno

Crea archivo `.env` en la raíz:

```env
VITE_SUPABASE_URL=https://TU_PROJECT_REF.supabase.co
VITE_SUPABASE_ANON_KEY=tu_anon_key_aqui
```

**¿Dónde obtener las keys?**
- Dashboard → Settings → API
- Copia "Project URL" y "anon public"

---

## ✅ Verificar Instalación

```bash
# Ver versión
supabase --version

# Ver estado
supabase status

# O usar npm scripts
npm run supabase:status
```

---

## 📦 Comandos NPM Disponibles

Ahora puedes usar estos comandos desde `package.json`:

```bash
# Inicializar Supabase
npm run supabase:init

# Ver estado
npm run supabase:status

# Enlazar proyecto
npm run supabase:link

# Aplicar migraciones
npm run supabase:db:push

# Desplegar funciones
npm run supabase:functions:deploy

# Crear nueva migración
npm run supabase:migration:new nombre_migracion
```

---

## 🎯 Próximos Pasos

1. ✅ Instalar Supabase CLI
2. ✅ Enlazar proyecto
3. ✅ Configurar `.env`
4. ✅ Aplicar migraciones: `npm run supabase:db:push`
5. ✅ Desplegar funciones: `npm run supabase:functions:deploy`

---

## 📚 Documentación Completa

Lee `INSTALAR_SUPABASE.md` para más detalles.

