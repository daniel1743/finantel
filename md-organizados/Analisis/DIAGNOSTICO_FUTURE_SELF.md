# 🔍 Diagnóstico: Future Self Simulator

## 📋 Paso 1: Verificar en Supabase Dashboard

### Opción A: Verificar desde el Dashboard de Supabase

1. **Ir a tu proyecto de Supabase:**
   - Ve a https://supabase.com/dashboard
   - Selecciona tu proyecto: `yzakmqxbzwzbsdsadzej`

2. **Verificar Edge Functions:**
   - En el menú lateral, busca **"Edge Functions"**
   - Busca la función `future-self-simulator`
   - Verifica si está:
     - ✅ **Desplegada** (aparece en la lista)
     - ❌ **No desplegada** (no aparece)

3. **Verificar Logs:**
   - Si la función existe, haz clic en ella
   - Ve a la pestaña **"Logs"**
   - Revisa los errores recientes

### Opción B: Verificar desde la Terminal

```bash
# 1. Verificar si tienes Supabase CLI instalado
supabase --version

# 2. Si no está instalado, instálalo
npm install -g supabase

# 3. Login en Supabase
supabase login

# 4. Vincular tu proyecto
supabase link --project-ref yzakmqxbzwzbsdsadzej

# 5. Listar funciones desplegadas
supabase functions list
```

---

## 🛠️ Paso 2: Soluciones según el diagnóstico

### ❌ Si la función NO existe en Supabase:

**Solución: Desplegar la función**

```bash
# 1. Ir al directorio del proyecto
cd "C:\Users\Lenovo\Downloads\finantel version 2.1 funcional"

# 2. Desplegar la función
supabase functions deploy future-self-simulator

# 3. Verificar que se desplegó
supabase functions list
```

### ⚠️ Si la función existe pero devuelve 503:

**Posibles causas:**

1. **Error en el código de la función**
   - Revisa los logs en Supabase Dashboard
   - Verifica que la función tenga acceso a las tablas necesarias

2. **Falta de permisos RLS**
   - La función necesita acceso a las tablas
   - Verifica las políticas RLS en Supabase

3. **Variables de entorno faltantes**
   - La función puede necesitar variables de entorno
   - Verifica en Supabase Dashboard → Edge Functions → Settings

4. **Timeout o límites de recursos**
   - La función puede estar tardando demasiado
   - Verifica los límites de tiempo de ejecución

### ✅ Si la función existe y funciona:

**Solución: Verificar CORS**

1. **Revisar configuración CORS en la función:**
   - Abre `supabase/functions/future-self-simulator/index.ts`
   - Verifica que tenga headers CORS correctos

2. **Verificar en Supabase Dashboard:**
   - Edge Functions → Settings
   - Verifica que `localhost:3000` esté en los orígenes permitidos

---

## 🔧 Paso 3: Verificar el código de la función

La función debería estar en:
```
supabase/functions/future-self-simulator/index.ts
```

**Verifica que:**
- ✅ Tiene headers CORS configurados
- ✅ Maneja errores correctamente
- ✅ Tiene acceso a las tablas necesarias
- ✅ Retorna respuestas en formato correcto

---

## 📝 Paso 4: Verificar tablas necesarias

La función `future-self-simulator` probablemente necesita acceso a:
- `transactions`
- `categories`
- `goals`
- `future_self_scenarios` (si existe)

**Verificar en Supabase Dashboard:**
1. Ve a **Table Editor**
2. Verifica que estas tablas existan
3. Verifica que tengan datos (o al menos estructura)

---

## 🚀 Recomendación

**Empieza por el Paso 1 (Verificar en Supabase Dashboard):**

1. Ve a https://supabase.com/dashboard
2. Selecciona tu proyecto
3. Ve a **Edge Functions**
4. Busca `future-self-simulator`

**Según lo que encuentres:**
- **No existe** → Despliega la función (Paso 2, Opción A)
- **Existe pero da error** → Revisa logs y corrige (Paso 2, Opción B)
- **Existe y funciona** → Verifica CORS (Paso 3)

---

## 📞 Si necesitas ayuda adicional

Comparte:
1. ¿La función aparece en Supabase Dashboard?
2. ¿Qué errores ves en los logs?
3. ¿Cuándo fue la última vez que funcionó?

