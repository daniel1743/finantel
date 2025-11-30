# 📋 Revisión de Edge Functions - Comparación Proyecto vs Supabase

## ✅ Funciones que YA están en Supabase

1. ✅ `bot-detect-duplicates` (bot-detect-duplicados)
2. ✅ `bot-detect-fixed-charges` (bot-detect-cargos-fijos)
3. ✅ `ai-investigator` (investigador de inteligencia artificial)
4. ✅ `ai-planner` (planificador de inteligencia artificial)
5. ✅ `bot-detect-delivery` (detección de bots de entrega)
6. ✅ `bot-detect-microspend` (detección de bots de microgasto)
7. ✅ `bot-detect-nightspend` (detección de bots de gasto nocturno)
8. ✅ `bot-detect-subscriptions` (suscripciones de detección de bots)
9. ✅ `bot-detect-unusual-activity` (bot-detectar-actividad-inusual)
10. ✅ `check-ip-risk` (comprobar-riesgo-ip)
11. ✅ `create-appeal` (crear atractivo/apelación)
12. ✅ `future-self-simulator` (simulador del yo futuro)
13. ✅ `voice-to-transaction` (voz a transacción)

## ❌ Funciones que FALTAN en Supabase

### 🔴 Críticas (Recomendado subir)

1. **`monthly-closure`** ⚠️ **IMPORTANTE**
   - Sistema de cierre mensual automático
   - Creada recientemente para el sistema de archivo mensual
   - **Acción:** Subir inmediatamente

2. **`mercadopago-webhook`** ⚠️ **IMPORTANTE**
   - Webhook para procesar pagos de MercadoPago
   - Necesaria para procesar suscripciones
   - **Acción:** Subir si usas MercadoPago

3. **`create-payment-preference`** ⚠️ **IMPORTANTE**
   - Crea preferencias de pago para MercadoPago
   - Necesaria para el flujo de suscripciones
   - **Acción:** Subir si usas MercadoPago

### 🟡 Importantes (Recomendado subir)

4. **`generate-alert`**
   - Genera alertas desde el frontend
   - Útil para notificaciones del sistema
   - **Acción:** Subir si usas sistema de alertas

5. **`leak-hunter`**
   - Detecta fugas de dinero
   - Parte del sistema de análisis financiero
   - **Acción:** Subir si usas análisis de fugas

6. **`calculate-financial-mood`**
   - Calcula el estado de ánimo financiero
   - Parte del sistema de análisis emocional
   - **Acción:** Subir si usas análisis emocional

### 🟢 Opcionales (Subir según necesidad)

7. **`cancel-subscription`**
   - Cancela suscripciones
   - **Acción:** Subir si necesitas cancelar suscripciones programáticamente

8. **`create-checkout-session`**
   - Crea sesiones de checkout
   - **Acción:** Subir si usas otro procesador de pagos además de MercadoPago

9. **`find-user-by-email`**
   - Busca usuarios por email
   - **Acción:** Subir si necesitas búsqueda de usuarios desde el frontend

10. **`health`**
    - Endpoint de salud/health check
    - **Acción:** Subir si necesitas monitoreo de salud de funciones

11. **`voice-to-transaction-chatgpt`**
    - Versión alternativa de voz a transacción con ChatGPT
    - **Acción:** Subir solo si usas esta versión específica

## 📝 Comandos para Subir Funciones Faltantes

```bash
# Funciones críticas
supabase functions deploy monthly-closure
supabase functions deploy mercadopago-webhook
supabase functions deploy create-payment-preference

# Funciones importantes
supabase functions deploy generate-alert
supabase functions deploy leak-hunter
supabase functions deploy calculate-financial-mood

# Funciones opcionales (según necesidad)
supabase functions deploy cancel-subscription
supabase functions deploy create-checkout-session
supabase functions deploy find-user-by-email
supabase functions deploy health
supabase functions deploy voice-to-transaction-chatgpt
```

## 🎯 Prioridad de Despliegue

### Prioridad ALTA (Subir ahora)
1. `monthly-closure` - Sistema de cierre mensual
2. `mercadopago-webhook` - Si usas MercadoPago
3. `create-payment-preference` - Si usas MercadoPago

### Prioridad MEDIA (Subir pronto)
4. `generate-alert` - Sistema de alertas
5. `leak-hunter` - Análisis de fugas
6. `calculate-financial-mood` - Análisis emocional

### Prioridad BAJA (Subir si se necesita)
7-11. Resto de funciones opcionales

## ✅ Checklist de Despliegue

- [ ] `monthly-closure` - Sistema de cierre mensual
- [ ] `mercadopago-webhook` - Webhook de pagos
- [ ] `create-payment-preference` - Preferencias de pago
- [ ] `generate-alert` - Generación de alertas
- [ ] `leak-hunter` - Detector de fugas
- [ ] `calculate-financial-mood` - Análisis emocional
- [ ] `cancel-subscription` - Cancelación de suscripciones
- [ ] `create-checkout-session` - Sesiones de checkout
- [ ] `find-user-by-email` - Búsqueda de usuarios
- [ ] `health` - Health check
- [ ] `voice-to-transaction-chatgpt` - Voz a transacción ChatGPT

## 📊 Resumen

- **Total funciones en proyecto:** 24
- **Funciones en Supabase:** 13
- **Funciones faltantes:** 11
- **Críticas faltantes:** 3
- **Importantes faltantes:** 3
- **Opcionales faltantes:** 5

