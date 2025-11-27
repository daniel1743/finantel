# 📊 GUÍA COMPLETA: MONITOREO Y ERROR TRACKING

## 🎯 RESUMEN

Esta guía explica cómo está implementado el sistema completo de monitoreo y error tracking en Finantel, incluyendo Sentry, Analytics, y monitoreo de uptime.

---

## 🔧 1. SENTRY - ERROR TRACKING

### Frontend (React)

**Archivo:** `src/lib/sentry.js`

**Características:**
- ✅ Captura automática de errores
- ✅ Session Replay (10% de sesiones, 100% con errores)
- ✅ Performance Monitoring (10% de transacciones)
- ✅ Filtrado de errores no críticos
- ✅ Contexto de usuario automático

**Configuración:**

1. **Instalar dependencias:**
```bash
npm install @sentry/react
```

2. **Variables de entorno (.env):**
```env
VITE_SENTRY_DSN=https://tu-dsn@sentry.io/proyecto-id
VITE_APP_VERSION=2.1
```

3. **Inicialización:**
Sentry se inicializa automáticamente en `src/main.jsx` antes de renderizar la app.

**Uso en código:**
```javascript
import { captureError, captureMessage, setUserContext } from '@/lib/sentry';

// Capturar error manualmente
try {
  // código que puede fallar
} catch (error) {
  captureError(error, { context: 'additional info' });
}

// Capturar mensaje
captureMessage('Algo importante pasó', 'info', { data: 'value' });

// Establecer usuario (automático en AuthContext)
setUserContext(user);
```

### Edge Functions (Deno)

**Archivo:** `supabase/functions/_shared/sentry.ts`

**Características:**
- ✅ Captura de errores en Edge Functions
- ✅ Performance monitoring
- ✅ Contexto de usuario
- ✅ Breadcrumbs

**Configuración:**

1. **Variables de entorno en Supabase:**
```
SENTRY_DSN=https://tu-dsn@sentry.io/proyecto-id
ENVIRONMENT=production
```

2. **Uso en Edge Functions:**
```typescript
import { initSentryEdge, captureError, monitorPerformance } from '../_shared/sentry.ts';

// Inicializar al inicio
initSentryEdge();

// Monitorear performance
const result = await monitorPerformance('operation_name', async () => {
  // código
}, { context: 'data' });

// Capturar error
try {
  // código
} catch (error) {
  captureError(error, { context: 'info' });
}
```

---

## 📈 2. ANALYTICS - MIXPANEL Y GOOGLE ANALYTICS 4

### Configuración

**Archivo:** `src/lib/analytics.js`

**Características:**
- ✅ Mixpanel integrado
- ✅ Google Analytics 4 integrado
- ✅ Eventos predefinidos para Finantel
- ✅ Tracking de conversiones
- ✅ Performance tracking

**Variables de entorno (.env):**
```env
VITE_MIXPANEL_TOKEN=tu-mixpanel-token
VITE_GA4_MEASUREMENT_ID=G-XXXXXXXXXX
VITE_APP_VERSION=2.1
```

### Uso

```javascript
import { 
  trackEvent, 
  trackPageView, 
  trackConversion,
  identifyUser,
  AnalyticsEvents 
} from '@/lib/analytics';

// Track evento
trackEvent(AnalyticsEvents.TRANSACTION_CREATED, {
  amount: 100,
  category: 'food',
});

// Track página
trackPageView('Dashboard', { section: 'home' });

// Track conversión
trackConversion('subscription', 9990, 'CLP', {
  plan: 'pro',
});

// Identificar usuario (automático en AuthContext)
identifyUser(userId, {
  email: 'user@example.com',
  name: 'Usuario',
});
```

### Eventos Predefinidos

```javascript
AnalyticsEvents.USER_SIGNED_UP
AnalyticsEvents.USER_LOGGED_IN
AnalyticsEvents.TRANSACTION_CREATED
AnalyticsEvents.BUDGET_EXCEEDED
AnalyticsEvents.AI_MESSAGE_SENT
AnalyticsEvents.SUBSCRIPTION_STARTED
AnalyticsEvents.PAYMENT_COMPLETED
// ... y más
```

---

## 🔔 3. ALERTAS PARA ERRORES CRÍTICOS

### Configuración en Sentry

1. **Ir a Sentry Dashboard**
2. **Settings → Alerts**
3. **Crear nueva alerta:**

**Configuración recomendada:**
- **Trigger:** Cuando un evento cumple condiciones
- **Condiciones:**
  - Issue level = fatal
  - Tags contains `critical:true`
  - Environment = production
- **Acciones:**
  - Enviar email
  - Enviar Slack/Teams
  - Crear incidente

### Código para Errores Críticos

```javascript
import { captureCriticalError } from '@/lib/sentry';

try {
  // operación crítica
} catch (error) {
  captureCriticalError(error, {
    operation: 'payment_processing',
    userId: user.id,
    planId: plan.id,
  });
  // Esto disparará alertas en Sentry
}
```

---

## 📊 4. MONITOREO DE UPTIME

### Opción 1: UptimeRobot (Gratis)

**Configuración:**

1. **Crear cuenta en:** https://uptimerobot.com
2. **Agregar monitor:**
   - **Tipo:** HTTP(s)
   - **URL:** https://tu-dominio.com
   - **Intervalo:** 5 minutos
   - **Alertas:** Email, SMS, Slack

3. **Endpoints a monitorear:**
   - Frontend: `https://finantel.app`
   - API Health: `https://tu-proyecto.supabase.co/rest/v1/`
   - Edge Functions: `https://tu-proyecto.supabase.co/functions/v1/`

### Opción 2: BetterStack (Recomendado)

**Configuración:**

1. **Crear cuenta en:** https://betterstack.com
2. **Agregar monitor:**
   - **URL:** https://tu-dominio.com
   - **Intervalo:** 1 minuto
   - **Regiones:** Múltiples
   - **Alertas:** Email, SMS, PagerDuty, Slack

3. **Configurar Heartbeat:**
   - Endpoint: `/api/health`
   - Timeout: 10 segundos
   - Retry: 3 intentos

### Health Check Endpoint

Crear Edge Function para health check:

**Archivo:** `supabase/functions/health/index.ts`

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

serve(async (req) => {
  try {
    // Verificar conexión a Supabase
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const { error } = await supabase.from('categories').select('id').limit(1);

    return new Response(
      JSON.stringify({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        database: error ? 'unhealthy' : 'healthy',
      }),
      {
        status: error ? 503 : 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString(),
      }),
      {
        status: 503,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
});
```

---

## 🚨 5. ALERTAS AUTOMÁTICAS

### Sentry Alerts

**Configurar en Sentry Dashboard:**

1. **Alerta de Errores Críticos:**
   - Trigger: Issue level = fatal
   - Tags: `critical:true`
   - Acción: Email + Slack

2. **Alerta de Tasa de Error:**
   - Trigger: Error rate > 5% en 5 minutos
   - Acción: Email

3. **Alerta de Performance:**
   - Trigger: P95 latency > 2 segundos
   - Acción: Email

### Supabase Alerts

**Configurar en Supabase Dashboard:**

1. **Database Alerts:**
   - CPU > 80%
   - Memory > 80%
   - Connections > 80%

2. **Edge Functions Alerts:**
   - Error rate > 1%
   - Latency > 1 segundo

---

## 📋 CHECKLIST DE IMPLEMENTACIÓN

### Frontend
- [ ] Instalar `@sentry/react`
- [ ] Configurar `VITE_SENTRY_DSN` en `.env`
- [ ] Verificar que `src/main.jsx` inicializa Sentry
- [ ] Verificar que `ErrorBoundary` usa Sentry
- [ ] Verificar que `AuthContext` actualiza contexto de usuario

### Analytics
- [ ] Crear cuenta en Mixpanel
- [ ] Obtener `VITE_MIXPANEL_TOKEN`
- [ ] Crear cuenta en Google Analytics
- [ ] Obtener `VITE_GA4_MEASUREMENT_ID`
- [ ] Configurar variables de entorno
- [ ] Verificar que eventos se trackean

### Edge Functions
- [ ] Configurar `SENTRY_DSN` en Supabase
- [ ] Verificar que Edge Functions usan Sentry
- [ ] Probar captura de errores

### Uptime Monitoring
- [ ] Crear cuenta en UptimeRobot o BetterStack
- [ ] Configurar monitores para:
  - [ ] Frontend
  - [ ] API Health
  - [ ] Edge Functions
- [ ] Configurar alertas (email, Slack)

### Alertas
- [ ] Configurar alertas en Sentry
- [ ] Configurar alertas en Supabase
- [ ] Probar que las alertas funcionan

---

## 🔍 VERIFICACIÓN

### Verificar Sentry

1. **Generar error de prueba:**
```javascript
// En consola del navegador
throw new Error('Test error from Sentry');
```

2. **Verificar en Sentry Dashboard:**
- Deberías ver el error en Issues
- Deberías ver Session Replay si está habilitado

### Verificar Analytics

1. **Abrir DevTools → Network**
2. **Realizar acción (ej: crear transacción)**
3. **Buscar requests a:**
   - `mixpanel.com` (Mixpanel)
   - `google-analytics.com` (GA4)

### Verificar Uptime

1. **Ir a dashboard de UptimeRobot/BetterStack**
2. **Verificar que todos los monitores están "Up"**
3. **Probar alerta manualmente**

---

## 📊 DASHBOARDS RECOMENDADOS

### Sentry Dashboard
- **Issues:** Errores por frecuencia
- **Performance:** Latencia de transacciones
- **Releases:** Errores por versión
- **Users:** Errores por usuario

### Mixpanel Dashboard
- **Funnels:** Conversión de signup → pago
- **Retention:** Retención de usuarios
- **Cohorts:** Análisis por cohorte
- **Flows:** Flujos de usuario

### GA4 Dashboard
- **Engagement:** Tiempo en sitio, páginas vistas
- **Conversions:** Eventos de conversión
- **Audience:** Segmentación de usuarios
- **Acquisition:** Fuentes de tráfico

---

## 🎯 MÉTRICAS CLAVE A MONITOREAR

### Errores
- Tasa de error (< 0.1%)
- Errores críticos (0)
- Tiempo de resolución (< 1 hora)

### Performance
- Tiempo de carga inicial (< 1 segundo)
- Latencia P95 (< 200ms)
- Tiempo de respuesta API (< 200ms)

### Uptime
- Disponibilidad (> 99.9%)
- Tiempo de respuesta (< 2 segundos)
- Tasa de éxito (> 99%)

### Analytics
- Usuarios activos diarios
- Tasa de conversión (signup → pago)
- Retención (D1, D7, D30)
- Eventos críticos (transacciones, pagos)

---

## ✅ CONCLUSIÓN

Con esta implementación, Finantel tiene:

✅ **Error tracking completo** (Sentry)
✅ **Analytics avanzado** (Mixpanel + GA4)
✅ **Monitoreo de uptime** (UptimeRobot/BetterStack)
✅ **Alertas automáticas** (Sentry + Supabase)
✅ **Performance monitoring** (Sentry)

**Todo listo para producción con monitoreo completo.**

---

**Última actualización:** Enero 2025

