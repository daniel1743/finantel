# 🎫 SISTEMA DE TICKETS DE SOPORTE - LÓGICA ACTUAL

## 📋 RESUMEN EJECUTIVO

El sistema de tickets permite a los usuarios crear solicitudes de soporte y recibir respuestas del equipo. Actualmente está **parcialmente funcional** desde el lado del usuario, pero **falta el panel de administración** para que el staff responda.

---

## 🔄 FLUJO ACTUAL (LADO USUARIO)

### 1️⃣ **Creación del Ticket**

**Ubicación:** `/dashboard/support`

**Proceso:**
1. Usuario llena formulario:
   - **Asunto** (obligatorio)
   - **Categoría** (general, facturación, datos, bug, sugerencia)
   - **Prioridad** (baja, normal, alta, crítica)
   - **Mensaje** (obligatorio)

2. Al enviar:
   ```javascript
   createTicket({
     subject: form.subject,
     category: form.category,
     priority: form.priority,
     message: form.message,
     ai_context: { source: 'support_center' }
   })
   ```

3. Se guarda en Supabase:
   - Tabla: `support_tickets`
   - Campos: `user_id`, `subject`, `category`, `priority`, `message`, `status` (default: 'abierto')
   - Se crea automáticamente una notificación (`ticket_created`)

**Código:** `src/hooks/useSupportTickets.js` → `createTicket()`

---

### 2️⃣ **Visualización del Usuario**

**Ubicación:** `/dashboard/support`

**Lo que ve el usuario:**
- **Estadísticas:**
  - Tickets totales
  - En seguimiento (abiertos)
  - Última respuesta
  - SLA promedio

- **Historial de tickets:**
  - Lista de todos sus tickets
  - Estado (abierto, en_progreso, resuelto, archivado)
  - Prioridad
  - Fecha de creación
  - Última actualización

- **Acciones disponibles:**
  - Ver detalles del ticket (clic en el ticket)
  - Crear nuevo ticket

**Código:** `src/pages/dashboard/Support.jsx`

---

### 3️⃣ **Detalle del Ticket**

**Ubicación:** `/dashboard/support/:ticketId`

**Lo que ve el usuario:**
- Información del ticket:
  - Asunto
  - Estado y prioridad
  - Mensaje inicial
  - Categoría

- **Conversación:**
  - Mensaje inicial del usuario
  - Respuestas del staff (si existen)
  - Respuestas del usuario

- **Acciones:**
  - Agregar nueva respuesta (solo si el ticket no está resuelto/archivado)
  - Ver historial completo

**Código:** `src/pages/dashboard/SupportTicketDetail.jsx`

---

## 🗄️ ALMACENAMIENTO EN BASE DE DATOS

### Tabla: `support_tickets`

```sql
- id (UUID)
- user_id (UUID) → auth.users
- subject (TEXT)
- category (TEXT) → 'general', 'facturacion', 'dato', 'bug', 'sugerencia'
- priority (TEXT) → 'baja', 'normal', 'alta', 'critica'
- message (TEXT)
- status (TEXT) → 'abierto', 'en_progreso', 'resuelto', 'archivado'
- ai_context (JSONB)
- sla_hours (INTEGER) → default: 24
- last_response_at (TIMESTAMPTZ)
- created_at (TIMESTAMPTZ)
- updated_at (TIMESTAMPTZ)
```

**RLS Policies:**
- ✅ Usuarios solo ven sus propios tickets
- ✅ Usuarios solo pueden crear tickets para sí mismos
- ✅ Usuarios solo pueden actualizar sus propios tickets

**Migración:** `supabase/migrations/021_create_support_tickets.sql`

---

### Tabla: `support_ticket_responses`

```sql
- id (UUID)
- ticket_id (UUID) → support_tickets
- user_id (UUID) → auth.users
- message (TEXT)
- is_staff_response (BOOLEAN) → default: false
- staff_name (TEXT) → nombre del staff que responde
- attachments (JSONB) → default: []
- created_at (TIMESTAMPTZ)
- updated_at (TIMESTAMPTZ)
```

**RLS Policies:**
- ✅ Usuarios solo ven respuestas de sus tickets
- ✅ Usuarios solo pueden agregar respuestas a sus tickets (con `is_staff_response = false`)

**Migración:** `supabase/migrations/024_support_notifications_and_responses.sql`

---

### Tabla: `support_notifications`

```sql
- id (UUID)
- user_id (UUID) → auth.users
- ticket_id (UUID) → support_tickets (opcional)
- type (TEXT) → 'ticket_created', 'ticket_updated', 'response_received', 'status_changed'
- title (TEXT)
- message (TEXT)
- read (BOOLEAN) → default: false
- metadata (JSONB)
- created_at (TIMESTAMPTZ)
```

**Triggers automáticos:**
1. `on_ticket_created` → Crea notificación cuando se crea un ticket
2. `on_ticket_status_changed` → Crea notificación cuando cambia el estado
3. `on_ticket_response` → Crea notificación cuando el staff responde

**Migración:** `supabase/migrations/024_support_notifications_and_responses.sql`

---

## ❌ LO QUE FALTA (LADO STAFF/ADMIN)

### 🔴 **1. Panel de Administración**

**Problema:** No existe una interfaz para que el staff vea y gestione tickets.

**Lo que se necesita:**
- Ruta: `/dashboard/admin/support` (o similar)
- Vista de todos los tickets (no solo los del usuario)
- Filtros:
  - Por estado (abierto, en_progreso, resuelto, archivado)
  - Por prioridad (baja, normal, alta, crítica)
  - Por categoría
  - Por fecha
- Búsqueda por asunto o ID
- Ordenamiento (más recientes, más antiguos, por prioridad)

**Acciones necesarias:**
- Ver detalles del ticket
- Responder al ticket (marcando `is_staff_response = true`)
- Cambiar estado del ticket
- Asignar ticket a un miembro del staff (`assigned_to` existe en el schema pero no se usa)
- Cambiar prioridad

---

### 🔴 **2. Sistema de Respuestas del Staff**

**Problema:** El staff no puede responder desde la aplicación.

**Lo que existe:**
- Función SQL: `add_ticket_response()` que acepta `p_is_staff = true`
- Campo `staff_name` en `support_ticket_responses`

**Lo que falta:**
- UI para que el staff responda
- Identificación del staff (¿cómo sabemos quién es staff?)
- Validación de permisos (¿quién puede responder como staff?)

**Solución propuesta:**
1. Crear tabla `staff_users` o agregar campo `is_staff` a `profile_preferences`
2. Crear RLS policy que permita a staff ver todos los tickets
3. Crear componente `StaffTicketResponse` en el panel de admin

---

### 🔴 **3. Sistema de Asignación**

**Problema:** El campo `assigned_to` existe en el schema pero no se usa.

**Lo que se necesita:**
- UI para asignar tickets a miembros del staff
- Vista de "Mis tickets asignados" para cada staff
- Notificaciones cuando se asigna un ticket

---

### 🔴 **4. Notificaciones en Tiempo Real**

**Problema:** Las notificaciones se crean pero no se muestran en tiempo real.

**Lo que existe:**
- Tabla `support_notifications`
- Triggers que crean notificaciones automáticamente

**Lo que falta:**
- Integrar notificaciones en la UI de `/dashboard/notifications`
- Suscripción en tiempo real con Supabase Realtime
- Badge de notificaciones no leídas

---

## 📧 CONTACTO ALTERNATIVO

Actualmente, el sistema ofrece:

1. **Email:** `soporte@finantel.app`
   - Disponible para todos los usuarios
   - Tiempo de respuesta: 2 horas hábiles

2. **WhatsApp:** `+51 987 654 321`
   - Solo para usuarios con plan Familiar o Enterprise
   - Disponible de lunes a domingo

**Ubicación:** `src/pages/dashboard/Support.jsx` líneas 156-178

---

## 🔐 SEGURIDAD Y PERMISOS

### RLS Policies Actuales

**`support_tickets`:**
- ✅ `SELECT`: Solo el usuario ve sus propios tickets
- ✅ `INSERT`: Solo el usuario puede crear tickets para sí mismo
- ✅ `UPDATE`: Solo el usuario puede actualizar sus propios tickets
- ❌ **FALTA:** Policy para que staff vea todos los tickets

**`support_ticket_responses`:**
- ✅ `SELECT`: Usuarios ven respuestas de sus tickets
- ✅ `INSERT`: Usuarios pueden agregar respuestas a sus tickets
- ❌ **FALTA:** Policy para que staff responda a cualquier ticket

---

## 🎯 PRÓXIMOS PASOS RECOMENDADOS

### Prioridad Alta 🔴

1. **Crear panel de administración**
   - Ruta: `/dashboard/admin/support`
   - Lista de todos los tickets
   - Filtros y búsqueda

2. **Sistema de identificación de staff**
   - Tabla `staff_users` o campo `is_staff` en `profile_preferences`
   - RLS policies para staff

3. **UI para responder como staff**
   - Componente de respuesta en el panel de admin
   - Marcar `is_staff_response = true`
   - Incluir `staff_name`

### Prioridad Media 🟡

4. **Sistema de asignación**
   - UI para asignar tickets
   - Vista de "Mis tickets asignados"

5. **Notificaciones en tiempo real**
   - Integrar con Supabase Realtime
   - Mostrar en `/dashboard/notifications`

### Prioridad Baja 🟢

6. **Métricas y reportes**
   - Tiempo promedio de respuesta
   - Tickets por categoría
   - Satisfacción del usuario

---

## 📝 NOTAS TÉCNICAS

### Funciones SQL Disponibles

1. **`add_ticket_response()`**
   ```sql
   add_ticket_response(
     p_ticket_id UUID,
     p_message TEXT,
     p_is_staff BOOLEAN DEFAULT false,
     p_staff_name TEXT DEFAULT NULL,
     p_attachments JSONB DEFAULT '[]'::jsonb
   )
   ```
   - Retorna: UUID del response creado
   - Si `p_is_staff = true`, actualiza el ticket a "en_progreso" automáticamente

2. **`create_support_notification()`**
   ```sql
   create_support_notification(
     p_user_id UUID,
     p_ticket_id UUID,
     p_type TEXT,
     p_title TEXT,
     p_message TEXT,
     p_metadata JSONB DEFAULT '{}'::jsonb
   )
   ```
   - Retorna: UUID de la notificación creada

3. **`mark_notifications_read()`**
   ```sql
   mark_notifications_read(notification_ids UUID[])
   ```
   - Retorna: Número de notificaciones marcadas como leídas

---

## 🐛 PROBLEMAS CONOCIDOS

1. **No hay validación de staff**
   - Cualquiera podría llamar `add_ticket_response()` con `p_is_staff = true`
   - **Solución:** Agregar validación en la función SQL

2. **Notificaciones no se muestran**
   - Las notificaciones se crean pero no aparecen en `/dashboard/notifications`
   - **Solución:** Integrar con la UI de notificaciones

3. **No hay límite de tickets abiertos**
   - Un usuario podría crear infinitos tickets
   - **Solución:** Agregar validación o límite

---

## 📚 ARCHIVOS RELACIONADOS

- `src/pages/dashboard/Support.jsx` - Página principal de soporte
- `src/pages/dashboard/SupportTicketDetail.jsx` - Detalle del ticket
- `src/hooks/useSupportTickets.js` - Hook para gestionar tickets
- `supabase/migrations/021_create_support_tickets.sql` - Schema de tickets
- `supabase/migrations/024_support_notifications_and_responses.sql` - Schema de respuestas y notificaciones

---

**Última actualización:** 2025-01-27
**Estado:** ⚠️ Parcialmente funcional (falta panel de admin)


