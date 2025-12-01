# 🔧 Solución: Error "column account_paused does not exist"

## ❌ Error Encontrado

```
Failed to load resource: 400
column profile_preferences.account_paused does not exist
```

## ✅ Solución

Necesitas ejecutar la migración SQL que agrega las columnas faltantes a la tabla `profile_preferences`.

### Paso 1: Aplicar Migración SQL

1. **Abre Supabase Dashboard**
   - Ve a: https://app.supabase.com
   - Selecciona tu proyecto

2. **Abre SQL Editor**
   - En el menú lateral, haz clic en **"SQL Editor"**
   - Haz clic en **"New query"**

3. **Copia y Ejecuta la Migración**
   - Abre el archivo: `supabase/migrations/046_add_account_management_columns.sql`
   - Copia **TODO** el contenido
   - Pégalo en el SQL Editor
   - Haz clic en **"Run"** o presiona `Ctrl+Enter`

### Paso 2: Verificar que Funcionó

Ejecuta esta query para verificar:

```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'profile_preferences'
AND column_name IN ('account_paused', 'account_paused_at', 'account_pause_reason', 'account_deleted', 'account_deleted_at');
```

Deberías ver las 5 columnas listadas.

---

## 🔄 Actualización de Nombre y Avatar

### Problema
Los cambios en el nombre y foto de perfil no se reflejaban en el perfil principal.

### Solución Implementada

1. **Agregada función `refreshUser()`** en `SupabaseAuthContext`
   - Permite recargar los datos del usuario sin recargar toda la página

2. **Estados locales en Profile.jsx**
   - `userName` y `userEmail` se actualizan automáticamente cuando cambia el usuario
   - Se escuchan cambios en `user_metadata`

3. **Actualización automática**
   - Cuando se cierra `EditProfileModal`, se recarga el usuario
   - El nombre y avatar se actualizan inmediatamente

---

## 📋 Checklist

- [ ] Ejecutar migración SQL `046_add_account_management_columns.sql`
- [ ] Verificar que las columnas se crearon correctamente
- [ ] Probar cambiar el nombre en el perfil
- [ ] Verificar que el nombre se actualiza en el header
- [ ] Probar cambiar la foto de perfil
- [ ] Verificar que la foto se actualiza en el perfil

---

## 🧪 Probar

1. **Cambiar Nombre:**
   - Ve a Perfil → Editar Perfil
   - Cambia el nombre
   - Guarda
   - Verifica que el nombre se actualiza en:
     - El header (arriba)
     - La tarjeta de perfil principal
     - La sección "Información Personal"

2. **Cambiar Avatar:**
   - Ve a Perfil → Editar Perfil
   - Selecciona un avatar premium o sube una foto
   - Guarda
   - Verifica que el avatar se actualiza en:
     - La tarjeta de perfil principal
     - El header (si está configurado)

---

## ⚠️ Si el Error Persiste

1. **Verifica que ejecutaste la migración:**
   ```sql
   SELECT * FROM information_schema.columns 
   WHERE table_name = 'profile_preferences' 
   AND column_name = 'account_paused';
   ```

2. **Si la columna no existe:**
   - Ejecuta nuevamente la migración
   - Verifica que no haya errores en la consola de Supabase

3. **Si el nombre/avatar no se actualiza:**
   - Abre la consola del navegador (F12)
   - Verifica que no haya errores
   - Intenta recargar la página manualmente

---

**Archivo de migración:** `supabase/migrations/046_add_account_management_columns.sql`

