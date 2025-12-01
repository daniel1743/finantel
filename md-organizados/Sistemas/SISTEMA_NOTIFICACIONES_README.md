# 🔔 Sistema de Notificaciones Inteligentes para Finantel

Sistema completo de monitoreo, logging y notificaciones administrativas.

**Versión:** 1.0.0
**Estado:** ✅ Listo para usar

---

## 🎯 ¿QUÉ ES ESTO?

Un sistema **simple, eficiente y escalable** que te permite:

✅ Ver todos los **errores** de tu app en tiempo real
✅ Recibir **alertas** cuando algo va mal
✅ Hacer **tracking de uso** (qué funciones usan más tus usuarios)
✅ Monitorear **comportamiento de APIs**
✅ Todo en **lenguaje humano**, sin tecnicismos raros
✅ **Anti-spam automático** (no te satura con 1000 notificaciones del mismo error)

---

## 📦 ¿QUÉ INCLUYE?

### 1. **Base de Datos** (PostgreSQL/Supabase)
- Tabla `system_notifications` - Guarda todas las notificaciones
- Tabla `system_metrics` - Métricas agregadas (opcional)
- Funciones SQL para consultas rápidas
- Row Level Security (RLS) configurado

### 2. **Backend** (Edge Functions)
- Logger global: `logEvent()`
- Funciones precreadas:
  - `logError()` - Para errores
  - `logCriticalError()` - Para errores críticos
  - `logWarning()` - Para advertencias
  - `logInfo()` - Para información
  - `logUsage()` - Para tracking de uso
- Anti-spam automático (no duplicados en 5 minutos)
- Humanizador de notificaciones

### 3. **Frontend** (React)
- Página completa: `/dashboard/system-notifications`
- Estadísticas en tiempo real
- Filtros por tipo y severidad
- Notificaciones en tiempo real (Realtime de Supabase)
- Marcar como leída
- Diseño profesional y responsive

---

## 🚀 INSTALACIÓN (5 MINUTOS)

### Paso 1: Aplicar Migración SQL

En Supabase Dashboard > SQL Editor:

```sql
-- Copia y ejecuta el archivo:
supabase/migrations/046_system_notifications.sql
```

### Paso 2: Ya está! 🎉

No necesitas instalar nada más. El sistema está listo para usar.

---

## 💡 CÓMO USAR

### Opción A: Desde Edge Functions

```typescript
import { logError, logInfo, logUsage } from '../_shared/logger.ts';

// Ejemplo 1: Registrar un error
try {
  // tu código
} catch (error) {
  await logError(
    'Error al procesar pago',
    'La API de Mercado Pago devolvió un error 500',
    '/mercadopago-webhook',
    error
  );
}

// Ejemplo 2: Registrar uso
await logUsage(
  'Usuario accedió al dashboard',
  'Usuario visitó la página de transacciones',
  '/dashboard/transactions',
  userId
);

// Ejemplo 3: Registrar info
await logInfo(
  'Nueva transacción creada',
  `Usuario creó una transacción de $${amount}`,
  '/voice-to-transaction',
  { userId, amount }
);
```

### Opción B: Ver las Notificaciones

Ve a:
```
http://localhost:3000/dashboard/system-notifications
```

O agrega al menú de navegación:

```jsx
<NavLink to="/dashboard/system-notifications">
  <Bell className="w-5 h-5" />
  Notificaciones del Sistema
</NavLink>
```

---

## 📊 TIPOS DE EVENTOS

| Tipo | Cuándo usar | Color | Ejemplo |
|------|-------------|-------|---------|
| **error** | Algo falló | 🔴 Rojo | Error al insertar en DB |
| **warning** | Algo raro pero no crítico | 🟡 Amarillo | Uso alto de memoria |
| **info** | Evento importante | 🔵 Azul | Usuario registrado |
| **usage** | Tracking de uso | 🟢 Verde | Función llamada |

## 🎚️ NIVELES DE SEVERIDAD

| Severidad | Descripción | Ejemplo |
|-----------|-------------|---------|
| **low** | No urgente | Usuario abrió dashboard |
| **medium** | Revisar pronto | API lenta |
| **high** | Revisar hoy | Error al guardar datos |
| **critical** | ⚠️ URGENTE | Base de datos caída |

---

## 🛡️ ANTI-SPAM AUTOMÁTICO

El sistema es **inteligente**:

❌ **SIN anti-spam:**
```
[ERROR] Fallo en API - 12:00:01
[ERROR] Fallo en API - 12:00:02
[ERROR] Fallo en API - 12:00:03
[ERROR] Fallo en API - 12:00:04
... (1000 veces más)
```

✅ **CON anti-spam:**
```
[10x] Fallo en API - 12:00:01
```

Si el **mismo error** ocurre en menos de **5 minutos**, solo se incrementa un contador.

---

## 📈 ESTADÍSTICAS EN TIEMPO REAL

La página de notificaciones muestra:

- 📊 **Total** de notificaciones
- 📬 **No leídas**
- ❌ **Errores**
- ⚠️ **Advertencias**
- ℹ️ **Info**
- 📊 **Uso**
- 🚨 **Críticos**

---

## 🎨 EJEMPLO VISUAL

Así se ve una notificación:

```
┌─────────────────────────────────────────────────────┐
│ 🚨 [10x] [CRÍTICO] Error en transcripción de voz   │
│                                                     │
│ La función voice-to-transaction devolvió un        │
│ error 500                                          │
│                                                     │
│ Ocurrió en: /voice-to-transaction                  │
│ Hora: 22:41                                        │
│                                                     │
│ 📝 Ver detalles técnicos ▼                         │
│   {                                                │
│     "error_code": 500,                            │
│     "details": "Internal server error"            │
│   }                                                │
│                                                     │
│ [✓ Marcar como leída]                             │
└─────────────────────────────────────────────────────┘
```

---

## 🔧 CONFIGURACIÓN AVANZADA

### Limpiar notificaciones antiguas

Ejecuta cada semana o mes:

```sql
SELECT cleanup_old_notifications(30);
-- Limpia notificaciones leídas de más de 30 días
```

### Ver estadísticas

```sql
SELECT * FROM get_notification_stats();
```

### Cambiar ventana de anti-spam

Por defecto: **5 minutos**

Para cambiar, edita en `supabase/functions/_shared/logger.ts`:

```typescript
fiveMinutesAgo.setMinutes(fiveMinutesAgo.getMinutes() - 10); // Ahora son 10 minutos
```

---

## 📁 ESTRUCTURA DE ARCHIVOS

```
finantel/
├── supabase/
│   ├── migrations/
│   │   └── 046_system_notifications.sql    ← Base de datos
│   └── functions/
│       └── _shared/
│           └── logger.ts                    ← Helper backend
│
├── src/
│   └── pages/
│       └── dashboard/
│           └── SystemNotifications.jsx      ← Página admin
│
└── docs/
    ├── SISTEMA_NOTIFICACIONES_README.md     ← Este archivo
    └── INTEGRACION_LOGGER_SISTEMA.md        ← Guía de integración
```

---

## 🎯 PRÓXIMOS PASOS

### Fase 1: Básico (HECHO ✅)
- [x] Sistema de notificaciones
- [x] Anti-spam
- [x] Filtros
- [x] UI completa

### Fase 2: Mejorar (Opcional)
- [ ] Integrar en todas las Edge Functions
- [ ] Agregar notificaciones push (email/Slack)
- [ ] Dashboard de métricas
- [ ] Alertas automáticas

### Fase 3: Pro (Futuro)
- [ ] IA que resuma errores
- [ ] Alertas inteligentes (detectar patrones)
- [ ] Integración con Sentry/Datadog
- [ ] Análisis predictivo

---

## 🆘 TROUBLESHOOTING

### No veo notificaciones

1. ¿Aplicaste la migración SQL?
   ```sql
   SELECT * FROM system_notifications;
   ```

2. ¿Las Edge Functions tienen el import correcto?
   ```typescript
   import { logError } from '../_shared/logger.ts';
   ```

3. ¿El archivo logger.ts existe?
   ```
   supabase/functions/_shared/logger.ts
   ```

### Error "table does not exist"

Ejecuta la migración:
```sql
-- En Supabase Dashboard > SQL Editor
-- Copia y ejecuta: supabase/migrations/046_system_notifications.sql
```

### No se actualiza en tiempo real

Verifica que Realtime esté habilitado en Supabase:
1. Ve a Database > Publications
2. Verifica que `system_notifications` esté en la lista

---

## 🤝 CONTRIBUIR

Para mejorar este sistema:

1. Lee `docs/INTEGRACION_LOGGER_SISTEMA.md`
2. Modifica tus Edge Functions
3. Prueba que funcione
4. ¡Listo!

---

## 📝 NOTAS IMPORTANTES

⚠️ **Seguridad:**
- Las notificaciones usan RLS (Row Level Security)
- Solo usuarios autenticados pueden ver notificaciones
- Solo service_role puede crear notificaciones

⚠️ **Performance:**
- El anti-spam evita miles de inserts innecesarios
- Los índices optimizan las consultas
- La limpieza automática previene crecimiento infinito

⚠️ **Escalabilidad:**
- El sistema soporta millones de notificaciones
- Las consultas son rápidas gracias a índices
- Fácil de extender con nuevas funciones

---

## 🎉 RESULTADO FINAL

Con este sistema obtienes:

✅ **Visibilidad total** de lo que pasa en tu app
✅ **Detección temprana** de problemas
✅ **Tracking de uso** para decisiones basadas en datos
✅ **Sistema profesional** sin complejidad
✅ **Escalable** para cuando tu app crezca

---

**Creado:** 2025
**Autor:** Sistema de Notificaciones Finantel
**Licencia:** Uso interno Finantel

---

¿Preguntas? Lee la guía de integración:
👉 `docs/INTEGRACION_LOGGER_SISTEMA.md`
