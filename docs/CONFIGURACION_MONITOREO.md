# ⚙️ CONFIGURACIÓN DE MONITOREO Y ERROR TRACKING

## 📦 INSTALACIÓN DE DEPENDENCIAS

### Frontend

```bash
npm install @sentry/react mixpanel-browser
```

### Edge Functions

Sentry para Deno se carga dinámicamente desde CDN (no requiere instalación).

---

## 🔐 VARIABLES DE ENTORNO

### Frontend (.env)

```env
# Sentry
VITE_SENTRY_DSN=https://tu-dsn@sentry.io/proyecto-id
VITE_APP_VERSION=2.1

# Analytics
VITE_MIXPANEL_TOKEN=tu-mixpanel-token
VITE_GA4_MEASUREMENT_ID=G-XXXXXXXXXX

# App
VITE_SUPABASE_URL=tu-supabase-url
VITE_SUPABASE_ANON_KEY=tu-anon-key
```

### Supabase (Edge Functions)

En Supabase Dashboard → Project Settings → Edge Functions → Secrets:

```
SENTRY_DSN=https://tu-dsn@sentry.io/proyecto-id
ENVIRONMENT=production
```

---

## 🚀 PASOS DE CONFIGURACIÓN

### 1. Configurar Sentry

1. **Crear cuenta en Sentry:**
   - Ir a https://sentry.io
   - Crear proyecto "React" para frontend
   - Crear proyecto "Deno" para Edge Functions
   - Copiar DSN de cada proyecto

2. **Configurar en Frontend:**
   - Agregar `VITE_SENTRY_DSN` a `.env`
   - Verificar que `src/main.jsx` inicializa Sentry

3. **Configurar en Edge Functions:**
   - Agregar `SENTRY_DSN` en Supabase Secrets
   - Verificar que Edge Functions importan `sentry.ts`

### 2. Configurar Mixpanel

1. **Crear cuenta en Mixpanel:**
   - Ir a https://mixpanel.com
   - Crear proyecto
   - Copiar token

2. **Configurar:**
   - Agregar `VITE_MIXPANEL_TOKEN` a `.env`

### 3. Configurar Google Analytics 4

1. **Crear cuenta en GA4:**
   - Ir a https://analytics.google.com
   - Crear propiedad
   - Obtener Measurement ID (G-XXXXXXXXXX)

2. **Configurar:**
   - Agregar `VITE_GA4_MEASUREMENT_ID` a `.env`

### 4. Configurar Uptime Monitoring

#### Opción A: UptimeRobot (Gratis)

1. **Crear cuenta:** https://uptimerobot.com
2. **Agregar monitores:**
   - Frontend: `https://tu-dominio.com`
   - Health: `https://tu-proyecto.supabase.co/functions/v1/health`
3. **Configurar alertas:** Email, SMS, Slack

#### Opción B: BetterStack (Recomendado)

1. **Crear cuenta:** https://betterstack.com
2. **Agregar monitores:**
   - Frontend: `https://tu-dominio.com`
   - Health: `https://tu-proyecto.supabase.co/functions/v1/health`
3. **Configurar alertas:** Email, SMS, PagerDuty, Slack

---

## ✅ VERIFICACIÓN

### 1. Verificar Sentry

```javascript
// En consola del navegador
throw new Error('Test Sentry');
// Deberías ver el error en Sentry Dashboard
```

### 2. Verificar Analytics

1. Abrir DevTools → Network
2. Realizar acción (crear transacción)
3. Buscar requests a:
   - `mixpanel.com`
   - `google-analytics.com`

### 3. Verificar Health Check

```bash
curl https://tu-proyecto.supabase.co/functions/v1/health
# Debería retornar: {"status":"healthy",...}
```

---

## 🎯 LISTO PARA PRODUCCIÓN

Con esta configuración, tienes:

✅ Error tracking completo
✅ Analytics avanzado
✅ Monitoreo de uptime
✅ Alertas automáticas

**Todo configurado y funcionando.**

