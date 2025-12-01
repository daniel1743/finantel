# 🔧 Configurar Variables de Entorno

## ⚠️ PROBLEMA ACTUAL
El error `Invalid login credentials` indica que las credenciales de Supabase no están configuradas o son incorrectas.

## ✅ SOLUCIÓN

### Paso 1: Crear archivo `.env`
Crea un archivo llamado `.env` en la raíz del proyecto (mismo nivel que `package.json`).

### Paso 2: Agregar credenciales
Abre tu proyecto en Supabase Dashboard (https://supabase.com/dashboard) y copia:

1. **Project URL**: Settings → API → Project URL
2. **Anon Key**: Settings → API → anon/public key

Luego, agrega estas líneas al archivo `.env`:

```env
VITE_SUPABASE_URL=https://tu-proyecto-actual.supabase.co
VITE_SUPABASE_ANON_KEY=tu_anon_key_actual_aqui
```

### Paso 3: Reiniciar el servidor
Después de crear el archivo `.env`:
1. Detén el servidor de desarrollo (Ctrl+C)
2. Inicia nuevamente: `npm run dev`

## 📝 Ejemplo de archivo `.env`

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://lhiqfsikextxysoedssz.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# AI Services (Opcional)
VITE_DEEPSEEK_API_KEY=sk-4d4cc3ac92254985b045a1881b85b12a
VITE_QWEN_API_KEY=sk-e6343f5b0abc42d294d2ad7f977e48a8
```

## ⚠️ IMPORTANTE
- **NO** subas el archivo `.env` a Git (ya está en `.gitignore`)
- **NO** compartas tus credenciales públicamente
- Usa credenciales diferentes para desarrollo y producción

## 🔍 Verificar credenciales
Si no estás seguro de cuál es tu proyecto actual de Supabase:
1. Ve a https://supabase.com/dashboard
2. Selecciona tu proyecto
3. Ve a Settings → API
4. Copia la URL y la anon key

