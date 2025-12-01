# 📧 Configuración de Notificaciones por Email

Este documento explica cómo configurar el sistema de notificaciones por email para recibir alertas cuando los usuarios envían mensajes a través del botón "Escribir al equipo".

## 🎯 ¿Qué hace este sistema?

Cuando un usuario hace clic en **"Escribir al equipo"** (desde la página de Transparencia o cualquier otra parte de la app):

1. Se crea un ticket en la base de datos (`support_tickets`)
2. Un trigger automático llama a la Edge Function `notify-support-ticket`
3. La Edge Function envía un email al administrador con los detalles del ticket
4. El ticket aparece en el panel de administrador (`/dashboard/admin/support`)

## ⚙️ Configuración en Supabase

### Paso 1: Configurar Variables de Entorno

Ve a tu **Supabase Dashboard**:
1. **Settings** → **Edge Functions** → **Secrets**
2. Agrega las siguientes variables:

#### Variables Requeridas:

```bash
ADMIN_EMAIL=tu-email@finantel.app
```

**O alternativamente:**
```bash
SUPPORT_EMAIL=tu-email@finantel.app
```

#### Variables Opcionales (para usar Resend):

Si quieres usar **Resend** como servicio de email (recomendado para producción):

```bash
RESEND_API_KEY=re_xxxxxxxxxxxxx
RESEND_FROM_EMAIL=Finantel <noreply@finantel.app>
```

> **Nota:** Si no configuras `RESEND_API_KEY`, el sistema intentará usar el servicio de email de Supabase (requiere configuración SMTP adicional).

### Paso 2: Verificar que el Trigger esté Activo

El trigger se crea automáticamente con la migración `056_support_ticket_email_notifications.sql`.

Para verificar que está activo:

```sql
-- Verificar que el trigger existe
SELECT 
  trigger_name, 
  event_manipulation, 
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE trigger_name = 'trg_notify_support_ticket_created';
```

### Paso 3: Probar el Sistema

1. Inicia sesión como usuario normal
2. Ve a `/legal/transparencia`
3. Haz clic en **"Escribir al equipo"**
4. Completa el formulario y envía el mensaje
5. Deberías recibir un email en `ADMIN_EMAIL` con los detalles del ticket

## 📋 Estructura del Email

El email incluye:
- **ID del Ticket** (para referencia)
- **Usuario** (nombre y email)
- **Asunto**
- **Categoría** (General, Facturación, Datos & Privacidad, etc.)
- **Prioridad** (Baja, Normal, Alta, Crítica)
- **Mensaje completo**
- **Link directo** al panel de administrador

## 🔧 Configuración de Resend (Recomendado)

### ¿Por qué Resend?

- ✅ Mayor tasa de entrega
- ✅ Mejor gestión de bounces
- ✅ Analytics de emails
- ✅ Fácil configuración

### Pasos para configurar Resend:

1. **Crear cuenta en Resend:**
   - Ve a [resend.com](https://resend.com)
   - Crea una cuenta gratuita
   - Verifica tu dominio (o usa el dominio de prueba)

2. **Obtener API Key:**
   - Dashboard → **API Keys** → **Create API Key**
   - Copia la clave (empieza con `re_`)

3. **Configurar en Supabase:**
   ```bash
   RESEND_API_KEY=re_tu_api_key_aqui
   RESEND_FROM_EMAIL=Finantel <noreply@finantel.app>
   ```

4. **Verificar dominio (opcional):**
   - Si usas tu propio dominio, agrégalo en Resend
   - Verifica los registros DNS
   - Esto mejora la tasa de entrega

## 🚨 Troubleshooting

### No recibo emails

1. **Verifica las variables de entorno:**
   ```bash
   # En Supabase Dashboard → Edge Functions → Secrets
   # Debe existir ADMIN_EMAIL o SUPPORT_EMAIL
   ```

2. **Revisa los logs de la Edge Function:**
   - Supabase Dashboard → **Edge Functions** → `notify-support-ticket` → **Logs**
   - Busca errores relacionados con email

3. **Verifica que el trigger esté activo:**
   ```sql
   SELECT * FROM information_schema.triggers 
   WHERE trigger_name = 'trg_notify_support_ticket_created';
   ```

4. **Si usas Resend, verifica la API Key:**
   - Dashboard de Resend → **API Keys** → Verifica que esté activa
   - Revisa los logs de Resend para ver si hay errores

### El email llega a spam

- Verifica tu dominio en Resend
- Agrega SPF, DKIM y DMARC records
- Usa un email profesional (no Gmail personal)

### El trigger no se ejecuta

1. Verifica que la migración `056_support_ticket_email_notifications.sql` se ejecutó correctamente
2. Revisa los logs de PostgreSQL:
   ```sql
   -- Ver logs recientes del trigger
   SELECT * FROM pg_stat_statements 
   WHERE query LIKE '%notify_support_ticket%';
   ```

## 📊 Panel de Administrador

Todos los tickets también aparecen en:
- **URL:** `/dashboard/admin/support`
- **Requisito:** Usuario debe tener rol de staff/admin

Desde ahí puedes:
- Ver todos los tickets
- Responder a usuarios
- Cambiar estado (Abierto, En Progreso, Resuelto, Archivado)
- Asignar tickets a miembros del equipo
- Filtrar por categoría, prioridad, estado

## 🔐 Seguridad

- ✅ Solo usuarios autenticados pueden crear tickets
- ✅ Los emails se envían solo al `ADMIN_EMAIL` configurado
- ✅ El trigger usa `SECURITY DEFINER` para acceso seguro
- ✅ La Edge Function valida autenticación antes de enviar

## 📝 Notas Adicionales

- El sistema funciona incluso si el email falla (el ticket se crea igual)
- Los errores de email se registran en los logs pero no bloquean la creación del ticket
- Puedes configurar múltiples emails separados por comas (requiere modificar la Edge Function)

---

**¿Necesitas ayuda?** Revisa los logs de Supabase o contacta al equipo de desarrollo.

