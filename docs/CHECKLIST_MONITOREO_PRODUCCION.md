# ✅ CHECKLIST: MONITOREO Y ERROR TRACKING PARA PRODUCCIÓN

## 📋 PRE-DEPLOY

### Sentry
- [ ] Crear cuenta en Sentry.io
- [ ] Crear proyecto "React" para frontend
- [ ] Crear proyecto "Deno" para Edge Functions
- [ ] Obtener DSNs de ambos proyectos
- [ ] Configurar `VITE_SENTRY_DSN` en Vercel
- [ ] Configurar `SENTRY_DSN` en Supabase Secrets
- [ ] Configurar alertas en Sentry:
  - [ ] Errores críticos (fatal)
  - [ ] Tasa de error > 5%
  - [ ] Performance (P95 > 2s)
- [ ] Probar captura de errores

### Analytics
- [ ] Crear cuenta en Mixpanel
- [ ] Obtener Mixpanel Token
- [ ] Configurar `VITE_MIXPANEL_TOKEN` en Vercel
- [ ] Crear cuenta en Google Analytics 4
- [ ] Obtener Measurement ID (G-XXXXXXXXXX)
- [ ] Configurar `VITE_GA4_MEASUREMENT_ID` en Vercel
- [ ] Probar tracking de eventos

### Health Check
- [ ] Desplegar Edge Function `health`
- [ ] Probar endpoint: `https://tu-proyecto.supabase.co/functions/v1/health`
- [ ] Verificar que retorna `{"status":"healthy"}`

### Uptime Monitoring
- [ ] Crear cuenta en UptimeRobot o BetterStack
- [ ] Agregar monitor para Frontend
- [ ] Agregar monitor para Health endpoint
- [ ] Configurar alertas (Email, Slack)
- [ ] Probar que las alertas funcionan

---

## 🔍 POST-DEPLOY

### Verificación
- [ ] Generar error de prueba en frontend
- [ ] Verificar que aparece en Sentry Dashboard
- [ ] Realizar acción (crear transacción)
- [ ] Verificar que se trackea en Mixpanel
- [ ] Verificar que se trackea en GA4
- [ ] Verificar que Health endpoint responde
- [ ] Verificar que monitores de uptime están "Up"

### Dashboards
- [ ] Configurar dashboard en Sentry
- [ ] Configurar dashboard en Mixpanel
- [ ] Configurar dashboard en GA4
- [ ] Configurar dashboard en UptimeRobot/BetterStack

---

## 📊 MÉTRICAS A MONITOREAR

### Errores
- [ ] Tasa de error < 0.1%
- [ ] Errores críticos = 0
- [ ] Tiempo de resolución < 1 hora

### Performance
- [ ] Tiempo de carga < 1 segundo
- [ ] Latencia P95 < 200ms
- [ ] Tiempo de respuesta API < 200ms

### Uptime
- [ ] Disponibilidad > 99.9%
- [ ] Tiempo de respuesta < 2 segundos
- [ ] Tasa de éxito > 99%

### Analytics
- [ ] Usuarios activos diarios
- [ ] Tasa de conversión (signup → pago)
- [ ] Retención (D1, D7, D30)
- [ ] Eventos críticos trackeados

---

## ✅ LISTO PARA PRODUCCIÓN

Con todos los checkboxes marcados, el sistema de monitoreo está completo y listo para producción.

---

**Última actualización:** Enero 2025

