# 🔒 Seguridad del Sistema de Notificaciones - PRIVACIDAD PRIMERO

## ⚠️ CRÍTICO: Solo Administradores Pueden Ver Notificaciones del Sistema

Este documento explica las medidas de seguridad implementadas para proteger la privacidad de los usuarios en el sistema de notificaciones administrativas.

---

## 🎯 PROBLEMA IDENTIFICADO

El sistema de notificaciones muestra información sensible:
- Errores de usuarios específicos
- Comportamiento de usuarios
- Uso de APIs
- Datos técnicos del sistema
- Información que podría identificar a usuarios

**Si cualquier usuario pudiera ver esto, violaría nuestro compromiso de PRIVACIDAD PRIMERO.**

---

## ✅ SOLUCIÓN IMPLEMENTADA

### 1. **Row Level Security (RLS) en Base de Datos**

**Archivo:** `supabase/migrations/046_system_notifications.sql`

```sql
-- ⚠️ CRÍTICO: Solo admins (is_staff = true) pueden ver notificaciones del sistema
CREATE POLICY "Only admins can view notifications"
    ON public.system_notifications
    FOR SELECT
    USING (
        -- Verificar que el usuario es staff usando la función existente
        is_staff_user(auth.uid())
    );
```

**¿Qué hace?**
- PostgreSQL verifica automáticamente si el usuario tiene `is_staff = true`
- Si no es admin, la base de datos NO devuelve ninguna fila
- Esto funciona incluso si alguien intenta acceder directamente a la API

### 2. **Verificación en Frontend (React)**

**Archivo:** `src/pages/dashboard/SystemNotifications.jsx`

```javascript
// Verificar si el usuario es admin
const checkAdminStatus = async () => {
  const { data } = await supabase
    .from('profile_preferences')
    .select('is_staff')
    .eq('user_id', user.id)
    .maybeSingle();

  setIsAdmin(data?.is_staff || false);
};

// Si NO es admin, mostrar pantalla de acceso denegado
if (!isAdmin) {
  return (
    <div>
      <h1>Acceso Denegado</h1>
      <p>Solo el administrador puede ver esta información</p>
      <p>🔒 Privacidad Primero</p>
    </div>
  );
}
```

**¿Qué hace?**
- Antes de cargar notificaciones, verifica si el usuario es admin
- Si no es admin, muestra pantalla de "Acceso Denegado"
- No se cargan notificaciones ni se suscribe a cambios en tiempo real

### 3. **Protección en Edge Functions**

**Archivo:** `supabase/functions/_shared/logger.ts`

```typescript
// Crear cliente Supabase con service_role para bypass RLS
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);
```

**¿Qué hace?**
- Las Edge Functions usan `service_role` para CREAR notificaciones
- Solo las Edge Functions pueden insertar notificaciones
- Los usuarios normales NO pueden crear notificaciones falsas

---

## 🛡️ CAPAS DE SEGURIDAD

| Capa | Protección | ¿Qué pasa si falla? |
|------|-----------|---------------------|
| **1. Frontend (React)** | Verifica `is_staff` antes de renderizar | Si alguien modifica el código en el navegador → Capa 2 lo bloquea |
| **2. Base de Datos (RLS)** | PostgreSQL verifica `is_staff` en cada query | Si alguien llama directamente a la API → No obtiene datos |
| **3. Edge Functions** | Solo `service_role` puede insertar | Si alguien intenta crear notificaciones → Falla |

**RESULTADO:** Incluso si un atacante:
- Modifica el código JavaScript en su navegador
- Llama directamente a la API de Supabase
- Intenta hacer queries SQL directos

**NO podrá ver ni crear notificaciones del sistema.**

---

## 🔑 CÓMO MARCAR UN USUARIO COMO ADMIN

### Opción 1: SQL (Recomendado)

```sql
-- Si conoces el email
UPDATE profile_preferences
SET is_staff = true
WHERE user_id = (
  SELECT id FROM auth.users WHERE email = 'admin@finantel.com'
);
```

### Opción 2: Crear usuario nuevo como admin

```sql
-- 1. Crear usuario en Supabase Auth UI
-- 2. Marcarlo como admin
INSERT INTO profile_preferences (user_id, is_staff)
SELECT id, true
FROM auth.users
WHERE email = 'admin@finantel.com'
ON CONFLICT (user_id)
DO UPDATE SET is_staff = true;
```

---

## 🧪 CÓMO PROBAR LA SEGURIDAD

### Test 1: Usuario normal NO debe ver notificaciones

1. Inicia sesión con un usuario normal (sin `is_staff = true`)
2. Ve a `/dashboard/admin/system-notifications`
3. **DEBE mostrar:** Pantalla de "Acceso Denegado"
4. **NO debe mostrar:** Ninguna notificación

### Test 2: Admin SÍ debe ver notificaciones

1. Marca un usuario como admin:
   ```sql
   UPDATE profile_preferences SET is_staff = true WHERE user_id = '...';
   ```
2. Inicia sesión con ese usuario
3. Ve a `/dashboard/admin/system-notifications`
4. **DEBE mostrar:** Todas las notificaciones del sistema

### Test 3: API directa NO debe funcionar para usuarios normales

1. Abre DevTools (F12)
2. Console:
   ```javascript
   const { data, error } = await supabase
     .from('system_notifications')
     .select('*');
   console.log(data, error);
   ```
3. **Usuario normal:** `data = []` (vacío)
4. **Admin:** `data = [...]` (con notificaciones)

---

## 📊 INFORMACIÓN QUE SE PROTEGE

### Datos Sensibles en Notificaciones:

- ❌ **User IDs** de usuarios que generan errores
- ❌ **Emails** de usuarios en logs
- ❌ **Comportamiento** de usuarios específicos
- ❌ **Uso de funciones** por usuario
- ❌ **Errores** con información de contexto
- ❌ **Payloads** con datos técnicos

**TODOS estos datos están ahora protegidos con triple capa de seguridad.**

---

## ⚡ PERFORMANCE

Las políticas RLS **NO afectan el performance**:
- PostgreSQL evalúa `is_staff_user(auth.uid())` en milisegundos
- Hay índices optimizados en `profile_preferences`
- La función es STABLE (se cachea durante la transacción)

---

## 🚨 IMPORTANTE: MANTENER LA SEGURIDAD

### ❌ NUNCA HAGAS ESTO:

```javascript
// ❌ MAL - Deshabilitar verificación de admin
if (true) {  // hardcodeado a true
  // cargar notificaciones
}
```

```sql
-- ❌ MAL - Policy que permite a todos
CREATE POLICY "bad_policy" ON system_notifications
FOR SELECT USING (true);  -- NUNCA HAGAS ESTO
```

### ✅ SIEMPRE HACE ESTO:

```javascript
// ✅ BIEN - Verificar is_staff
if (isAdmin && user.is_staff) {
  // cargar notificaciones
}
```

```sql
-- ✅ BIEN - Policy que verifica is_staff
CREATE POLICY "good_policy" ON system_notifications
FOR SELECT USING (is_staff_user(auth.uid()));
```

---

## 📝 CHECKLIST DE SEGURIDAD

Antes de desplegar a producción:

- [x] RLS habilitado en `system_notifications`
- [x] Policy usa `is_staff_user(auth.uid())`
- [x] Frontend verifica `isAdmin` antes de renderizar
- [x] Edge Functions usan `service_role` para insertar
- [x] Usuario admin marcado con `is_staff = true`
- [ ] Probado con usuario normal (debe ver "Acceso Denegado")
- [ ] Probado con usuario admin (debe ver notificaciones)
- [ ] Verificado que API directa no funciona para usuarios normales

---

## 🎯 COMPROMISO DE PRIVACIDAD

> **"La privacidad es lo principal"** - Finantel

Este sistema cumple con ese compromiso al:

✅ Proteger datos sensibles de usuarios
✅ Restringir acceso solo a personal autorizado
✅ Implementar múltiples capas de seguridad
✅ No exponer información identificable
✅ Seguir mejores prácticas de seguridad

---

## 📚 REFERENCIAS

- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL Security Best Practices](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- Migración 025: `025_admin_support_system.sql` (función `is_staff_user`)
- Migración 046: `046_system_notifications.sql` (RLS policies)

---

**Última actualización:** 2025
**Versión:** 1.0.0 - SEGURA
**Estado:** ✅ Protegido con triple capa de seguridad
