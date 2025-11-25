# 📋 INSTRUCCIONES - PANEL DE ADMINISTRACIÓN DE SOPORTE

## ✅ IMPLEMENTACIÓN COMPLETADA

Se ha implementado un sistema completo de administración de tickets de soporte que permite al staff ver, responder y gestionar todos los tickets de los usuarios.

---

## 🚀 PASOS PARA ACTIVAR EL SISTEMA

### 1️⃣ **Ejecutar la Migración SQL**

Ejecuta la migración en Supabase:

```sql
-- Archivo: supabase/migrations/025_admin_support_system.sql
```

Esta migración:
- ✅ Agrega campo `is_staff` a `profile_preferences`
- ✅ Agrega campo `assigned_to` a `support_tickets`
- ✅ Crea función `is_staff_user()` para verificar permisos
- ✅ Crea función `assign_ticket_to_staff()` para asignar tickets
- ✅ Crea función `get_ticket_stats()` para estadísticas
- ✅ Actualiza RLS policies para permitir acceso de staff
- ✅ Actualiza función `add_ticket_response()` con validación de staff

---

### 2️⃣ **Marcar Usuarios como Staff**

Para que un usuario pueda acceder al panel de administración, debes marcarlo como staff:

```sql
-- Reemplaza 'UUID_DEL_USUARIO' con el UUID real del usuario
UPDATE profile_preferences 
SET is_staff = true 
WHERE user_id = 'UUID_DEL_USUARIO';
```

**O si el usuario no tiene registro en profile_preferences:**

```sql
INSERT INTO profile_preferences (user_id, is_staff)
VALUES ('UUID_DEL_USUARIO', true)
ON CONFLICT (user_id) 
DO UPDATE SET is_staff = true;
```

**Para encontrar el UUID de un usuario:**

```sql
-- Buscar por email
SELECT id, email 
FROM auth.users 
WHERE email = 'usuario@ejemplo.com';

-- O listar todos los usuarios
SELECT id, email, created_at 
FROM auth.users 
ORDER BY created_at DESC;
```

---

## 🎯 CÓMO USAR EL PANEL DE ADMINISTRACIÓN

### **Acceso al Panel**

1. El usuario debe estar marcado como `is_staff = true` en `profile_preferences`
2. Navegar a: `/dashboard/admin/support`
3. Si el usuario no es staff, verá un mensaje de "Acceso Restringido"

---

### **Funcionalidades del Panel**

#### 📊 **Estadísticas**
- Total de tickets
- Tickets abiertos
- Tickets en progreso
- Tickets resueltos
- Tickets críticos
- Tiempo promedio de respuesta

#### 🔍 **Filtros y Búsqueda**
- **Estado:** Abierto, En Progreso, Resuelto, Archivado
- **Prioridad:** Baja, Normal, Alta, Crítica
- **Categoría:** General, Facturación, Datos, Bug, Sugerencia
- **Búsqueda:** Por asunto o mensaje

#### 📝 **Acciones Disponibles**

1. **Ver Detalles:**
   - Clic en "Ver Detalles" → Navega a `/dashboard/support/:ticketId`
   - El staff puede ver cualquier ticket, no solo los suyos

2. **Responder Rápidamente:**
   - Clic en el botón de enviar (icono de papel)
   - Se abre un modal para respuesta rápida
   - El staff puede incluir su nombre
   - La respuesta se marca automáticamente como `is_staff_response = true`

3. **Cambiar Estado:**
   - Dropdown en cada ticket para cambiar estado
   - Opciones: Abierto, En Progreso, Resuelto, Archivado

4. **Asignar Tickets:**
   - Función disponible en el código (puede agregarse UI)
   - Usa la función `assign_ticket_to_staff()`

---

## 🔐 SEGURIDAD Y PERMISOS

### **RLS Policies Actualizadas**

1. **`staff_can_view_all_tickets`:**
   - Staff puede ver TODOS los tickets
   - Usuarios normales solo ven sus propios tickets

2. **`staff_can_update_all_tickets`:**
   - Staff puede actualizar cualquier ticket
   - Usuarios normales solo pueden actualizar sus propios tickets

3. **`staff_can_view_all_responses`:**
   - Staff puede ver todas las respuestas
   - Usuarios normales solo ven respuestas de sus tickets

4. **`staff_can_add_responses`:**
   - Staff puede agregar respuestas a cualquier ticket
   - Usuarios normales solo pueden agregar respuestas a sus tickets

### **Validación en Funciones SQL**

- `add_ticket_response()` valida que solo staff pueda responder como staff
- `assign_ticket_to_staff()` valida que solo staff pueda asignar tickets
- `get_ticket_stats()` valida que solo staff pueda ver estadísticas globales

---

## 📁 ARCHIVOS CREADOS/MODIFICADOS

### **Nuevos Archivos:**

1. **`supabase/migrations/025_admin_support_system.sql`**
   - Migración completa del sistema de administración

2. **`src/hooks/useStaffTickets.js`**
   - Hook para gestionar tickets desde el lado del staff
   - Funciones: `fetchAllTickets`, `respondAsStaff`, `updateTicketStatus`, `assignTicket`, `getStaffList`

3. **`src/pages/dashboard/AdminSupport.jsx`**
   - Panel de administración completo
   - Lista de tickets, filtros, estadísticas, respuesta rápida

### **Archivos Modificados:**

1. **`src/App.jsx`**
   - Agregada ruta `/dashboard/admin/support`

2. **`src/pages/dashboard/SupportTicketDetail.jsx`**
   - Actualizado para que staff pueda ver cualquier ticket
   - Agregada funcionalidad para responder como staff
   - Campo opcional para nombre del staff

---

## 🧪 PRUEBAS RECOMENDADAS

### **1. Verificar Acceso de Staff**

```sql
-- Verificar que el usuario es staff
SELECT user_id, is_staff 
FROM profile_preferences 
WHERE user_id = 'UUID_DEL_USUARIO';
```

### **2. Crear un Ticket de Prueba**

1. Inicia sesión como usuario normal
2. Ve a `/dashboard/support`
3. Crea un ticket de prueba
4. Verifica que aparece en el panel de admin

### **3. Responder como Staff**

1. Inicia sesión como staff
2. Ve a `/dashboard/admin/support`
3. Busca el ticket de prueba
4. Haz clic en "Ver Detalles" o en el botón de enviar
5. Responde como staff
6. Verifica que la respuesta aparece con el nombre del staff

### **4. Verificar Notificaciones**

1. Cuando el staff responde, el usuario debe recibir una notificación
2. Verifica en la tabla `support_notifications`
3. El ticket debe cambiar a "en_progreso" automáticamente

---

## 🐛 SOLUCIÓN DE PROBLEMAS

### **Problema: "Acceso Restringido" aunque el usuario es staff**

**Solución:**
```sql
-- Verificar que is_staff está en true
SELECT * FROM profile_preferences WHERE user_id = 'UUID_DEL_USUARIO';

-- Si no existe el registro, crearlo
INSERT INTO profile_preferences (user_id, is_staff)
VALUES ('UUID_DEL_USUARIO', true);
```

### **Problema: No se ven todos los tickets en el panel**

**Solución:**
- Verificar que las RLS policies están activas
- Verificar que la función `is_staff_user()` retorna `true`
- Revisar la consola del navegador para errores

### **Problema: No se puede responder como staff**

**Solución:**
- Verificar que `is_staff = true` en `profile_preferences`
- Verificar que la función `add_ticket_response()` está actualizada
- Revisar los logs de Supabase para errores SQL

---

## 📝 NOTAS IMPORTANTES

1. **Solo usuarios con `is_staff = true` pueden acceder al panel**
2. **Las respuestas del staff se marcan automáticamente con `is_staff_response = true`**
3. **Cuando el staff responde, el ticket cambia automáticamente a "en_progreso"**
4. **Las notificaciones se crean automáticamente cuando el staff responde**
5. **El sistema de asignación está implementado pero la UI puede mejorarse**

---

## 🎯 PRÓXIMAS MEJORAS SUGERIDAS

1. **UI de Asignación:**
   - Dropdown para seleccionar staff al asignar
   - Vista de "Mis tickets asignados"

2. **Notificaciones en Tiempo Real:**
   - Integrar con Supabase Realtime
   - Badge de notificaciones no leídas

3. **Métricas Avanzadas:**
   - Gráficos de tickets por día/semana
   - Tiempo promedio de resolución
   - Satisfacción del usuario

4. **Plantillas de Respuesta:**
   - Respuestas predefinidas para casos comunes
   - Atajos de teclado

---

**Última actualización:** 2025-01-27
**Estado:** ✅ Completado y funcional


