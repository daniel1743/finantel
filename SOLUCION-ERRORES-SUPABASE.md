# 🔧 Solución a Errores 400/500 de Supabase

## 📊 Diagnóstico

Los errores que estás viendo son:

### Error 500 (Internal Server Error) - Al registrarse
```
POST https://yzakmqxbzwzbsdsadzej.supabase.co/auth/v1/signup 500
```
**Causa:** El trigger `on_auth_user_created` está fallando al crear las categorías/preferencias

### Error 400 (Bad Request) - Al hacer login
```
POST https://yzakmqxbzwzbsdsadzej.supabase.co/auth/v1/token?grant_type=password 400
```
**Causa:** Credenciales incorrectas (email/password no coinciden)

---

## ✅ Soluciones

### Solución 1: Ejecutar migración de fix (RECOMENDADO)

1. Ve a [Supabase Dashboard](https://supabase.com/dashboard) → Tu proyecto
2. Ve a **SQL Editor**
3. Abre el archivo `supabase/migrations/022_fix_auth_trigger.sql`
4. Copia todo el contenido y pégalo en el SQL Editor
5. Haz clic en **Run**

Esto reparará el trigger para que no cause errores 500.

---

### Solución 2: Deshabilitar el trigger temporalmente

Si quieres registrarte inmediatamente sin esperar, ejecuta esto en SQL Editor:

```sql
-- Deshabilitar trigger problemático
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
```

Luego podrás registrarte normalmente. Las categorías se crearán después desde el frontend.

---

### Solución 3: Configurar Email Provider

El error 500 también puede ser causado por email provider no configurado:

1. Ve a **Authentication → Providers**
2. Asegúrate que **Email** esté habilitado
3. **IMPORTANTE:** Desactiva "Confirm email" temporalmente:
   - Ve a **Authentication → Email Templates**
   - Deshabilita "Confirm email"

Esto permitirá registro sin confirmación de email.

---

### Solución 4: Crear usuario de prueba manualmente

Ejecuta esto en SQL Editor para crear un usuario de prueba:

```sql
-- Crear usuario de prueba
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  confirmation_token,
  recovery_token,
  email_change_token_new,
  email_change,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  created_at,
  updated_at,
  phone,
  phone_confirmed_at,
  phone_change,
  phone_change_token,
  confirmed_at,
  email_change_token_current,
  email_change_confirm_status,
  banned_until,
  reauthentication_token,
  reauthentication_sent_at
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'test@finantel.com',
  crypt('Test123456!', gen_salt('bf')),
  now(),
  '',
  '',
  '',
  '',
  '{"provider":"email","providers":["email"]}',
  '{}',
  false,
  now(),
  now(),
  NULL,
  NULL,
  '',
  '',
  now(),
  '',
  0,
  NULL,
  '',
  NULL
);
```

Luego puedes hacer login con:
- **Email:** `test@finantel.com`
- **Password:** `Test123456!`

---

## 🔍 Verificar que el problema se resolvió

Después de aplicar la solución, verifica:

### 1. Verificar que el trigger existe y está correcto
```sql
SELECT
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';
```

### 2. Verificar que las funciones existen
```sql
SELECT
    routine_name,
    routine_type
FROM information_schema.routines
WHERE routine_name IN (
    'handle_new_user',
    'create_default_categories',
    'create_user_preferences'
);
```

### 3. Verificar que las tablas necesarias existen
```sql
SELECT table_name
FROM information_schema.tables
WHERE table_name IN ('categories', 'profile_preferences', 'transactions');
```

---

## 🚀 Orden de ejecución recomendado

1. ✅ Ejecutar `022_fix_auth_trigger.sql` (arregla el trigger)
2. ✅ Configurar Email Provider (deshabilitar confirmación)
3. ✅ Intentar registrarse de nuevo
4. ✅ Si falla, crear usuario de prueba manualmente

---

## 💡 Prevención futura

Para evitar estos errores en el futuro:

1. **Siempre probar triggers en staging** antes de producción
2. **Agregar manejo de errores** en todas las funciones de base de datos
3. **Usar `SECURITY DEFINER` con cuidado** y validar permisos
4. **Loggear errores** para debugging (usa `RAISE WARNING`)

---

## 📞 Si nada funciona

Si después de todo esto sigues teniendo problemas:

1. Revisa los **Logs de Supabase**:
   - Dashboard → Logs → Database
   - Busca errores relacionados con `auth.users`

2. Verifica las **políticas RLS**:
   ```sql
   SELECT * FROM pg_policies WHERE tablename IN ('categories', 'profile_preferences');
   ```

3. Considera **recrear las tablas** si están corruptas:
   - ⚠️ CUIDADO: Esto borrará todos los datos
   - Ejecuta las migraciones en orden desde `000_migracion_completa_unificada.sql`

---

## ✅ Checklist de verificación

- [ ] Trigger `on_auth_user_created` reparado
- [ ] Email provider configurado
- [ ] Confirmación de email deshabilitada (temporal)
- [ ] Usuario de prueba creado
- [ ] Login funciona correctamente
- [ ] Categorías se crean automáticamente
- [ ] No hay errores 500 en consola
- [ ] No hay errores 400 (excepto con credenciales inválidas)

---

**Última actualización:** 2025-01-24
