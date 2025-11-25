# 🔐 CÓMO ACCEDER AL PANEL DE ADMINISTRACIÓN

## 📍 Dónde está el panel

El panel de administración está disponible en:
- **URL directa:** `/dashboard/admin/support`
- **Menú lateral:** Aparece automáticamente en el sidebar si eres staff (sección "Administración")

---

## 🔑 No hay contraseña especial

**IMPORTANTE:** No hay una contraseña especial para acceder. El sistema verifica automáticamente si tu usuario tiene el permiso de staff en la base de datos.

---

## ✅ PASOS PARA ACTIVAR TU ACCESO

### **Paso 1: Ejecutar la migración principal**

Primero, ejecuta la migración que crea el sistema de administración:

```sql
-- Archivo: supabase/migrations/025_admin_support_system.sql
```

Ejecuta este archivo completo en el **Supabase SQL Editor**.

---

### **Paso 2: Encontrar tu UUID de usuario**

Necesitas saber tu UUID (identificador único) en Supabase. Ejecuta esto en el SQL Editor:

```sql
-- Ver todos los usuarios con sus emails
SELECT 
    id as user_id,
    email,
    created_at
FROM auth.users
ORDER BY created_at DESC;
```

Copia el `user_id` (UUID) que corresponde a tu email.

---

### **Paso 3: Marcar tu usuario como staff**

Ejecuta este script en el SQL Editor (reemplaza `TU_UUID_AQUI` con tu UUID):

```sql
-- Opción A: Si ya tienes registro en profile_preferences
UPDATE public.profile_preferences 
SET is_staff = true 
WHERE user_id = 'TU_UUID_AQUI';

-- Opción B: Si NO tienes registro (más seguro)
INSERT INTO public.profile_preferences (user_id, is_staff)
VALUES ('TU_UUID_AQUI', true)
ON CONFLICT (user_id) 
DO UPDATE SET is_staff = true;
```

**O usa el script automático por email:**

```sql
-- Reemplaza 'TU_EMAIL@ejemplo.com' con tu email real
DO $$
DECLARE
    v_user_id UUID;
    v_user_email TEXT := 'TU_EMAIL@ejemplo.com';
BEGIN
    SELECT id INTO v_user_id
    FROM auth.users
    WHERE email = v_user_email;

    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Usuario no encontrado con email: %', v_user_email;
    END IF;

    INSERT INTO public.profile_preferences (user_id, is_staff)
    VALUES (v_user_id, true)
    ON CONFLICT (user_id) 
    DO UPDATE SET is_staff = true;

    RAISE NOTICE '✅ Usuario marcado como staff exitosamente';
END $$;
```

---

### **Paso 4: Verificar que funcionó**

Ejecuta esto para confirmar:

```sql
SELECT 
    u.email,
    COALESCE(pp.is_staff, false) as is_staff
FROM auth.users u
LEFT JOIN public.profile_preferences pp ON pp.user_id = u.id
WHERE u.email = 'TU_EMAIL@ejemplo.com';
```

Deberías ver `is_staff = true`.

---

### **Paso 5: Acceder al panel**

1. **Cierra sesión y vuelve a iniciar sesión** (para refrescar los permisos)
2. Navega a: `/dashboard/admin/support`
3. O busca en el menú lateral la sección **"Administración"** → **"Panel de Soporte"**

---

## 🎯 MÉTODO RÁPIDO (Todo en uno)

Si prefieres hacerlo todo de una vez, usa este script completo:

```sql
-- =====================================================
-- SCRIPT COMPLETO - MARCAR USUARIO COMO STAFF
-- =====================================================
-- ⚠️ REEMPLAZA 'TU_EMAIL@ejemplo.com' CON TU EMAIL REAL

DO $$
DECLARE
    v_user_id UUID;
    v_user_email TEXT := 'TU_EMAIL@ejemplo.com'; -- ⚠️ CAMBIA ESTO
BEGIN
    -- Buscar usuario
    SELECT id INTO v_user_id
    FROM auth.users
    WHERE email = v_user_email;

    IF v_user_id IS NULL THEN
        RAISE EXCEPTION '❌ Usuario no encontrado. Verifica tu email.';
    END IF;

    -- Marcar como staff
    INSERT INTO public.profile_preferences (user_id, is_staff)
    VALUES (v_user_id, true)
    ON CONFLICT (user_id) 
    DO UPDATE SET is_staff = true;

    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE '✅ USUARIO MARCADO COMO STAFF';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Email: %', v_user_email;
    RAISE NOTICE 'UUID: %', v_user_id;
    RAISE NOTICE '';
    RAISE NOTICE '📝 PRÓXIMOS PASOS:';
    RAISE NOTICE '1. Cierra sesión y vuelve a iniciar sesión';
    RAISE NOTICE '2. Navega a /dashboard/admin/support';
    RAISE NOTICE '3. O busca "Panel de Soporte" en el menú lateral';
    RAISE NOTICE '========================================';
END $$;
```

---

## 🐛 SOLUCIÓN DE PROBLEMAS

### **Problema: "Acceso Restringido" después de marcar como staff**

**Solución:**
1. Cierra sesión completamente
2. Limpia la caché del navegador (Ctrl+Shift+Delete)
3. Vuelve a iniciar sesión
4. Espera unos segundos para que se carguen los permisos

### **Problema: No aparece el menú "Administración" en el sidebar**

**Solución:**
1. Verifica que `is_staff = true` en la base de datos
2. Refresca la página (F5)
3. Si sigue sin aparecer, verifica la consola del navegador para errores

### **Problema: No encuentro mi email en auth.users**

**Solución:**
- Verifica que estás usando el email correcto con el que te registraste
- Ejecuta `SELECT * FROM auth.users;` para ver todos los usuarios
- Si no aparece, puede que necesites crear el usuario primero

---

## 📝 VERIFICACIÓN RÁPIDA

Ejecuta esto para ver tu estado actual:

```sql
SELECT 
    u.email,
    u.id as user_id,
    COALESCE(pp.is_staff, false) as is_staff,
    CASE 
        WHEN pp.is_staff = true THEN '✅ Eres staff'
        ELSE '❌ No eres staff'
    END as estado
FROM auth.users u
LEFT JOIN public.profile_preferences pp ON pp.user_id = u.id
WHERE u.email = 'TU_EMAIL@ejemplo.com'; -- ⚠️ CAMBIA ESTO
```

---

## 🎯 RESUMEN

1. ✅ Ejecuta `025_admin_support_system.sql` (si no lo has hecho)
2. ✅ Ejecuta el script para marcar tu usuario como staff
3. ✅ Cierra sesión y vuelve a iniciar sesión
4. ✅ Navega a `/dashboard/admin/support`
5. ✅ ¡Listo! Ya puedes gestionar tickets

---

**¿Necesitas ayuda?** Revisa los logs de Supabase o la consola del navegador para ver errores específicos.


