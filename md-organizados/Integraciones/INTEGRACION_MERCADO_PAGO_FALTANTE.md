# 📋 Documento: Integración de Mercado Pago - Lo que Falta

**Fecha de Revisión:** Enero 2025  
**Estado Actual:** ⚠️ Implementación Mock/Simulada  
**Prioridad:** 🔴 ALTA - Requerido para producción

---

## 📊 Resumen Ejecutivo

La integración de Mercado Pago está **parcialmente implementada** a nivel de UI y base de datos, pero **NO tiene funcionalidad real**. Actualmente solo existe código mock que simula el proceso de pago.

### Estado Actual:
- ✅ UI implementada (botones, página de billing)
- ✅ Tabla de base de datos creada (`billing_subscriptions`)
- ✅ Hook `useBilling` con estructura básica
- ❌ **NO hay integración real con API de Mercado Pago**
- ❌ **NO hay Edge Functions para procesar pagos**
- ❌ **NO hay webhooks para recibir notificaciones**
- ❌ **NO hay manejo de historial de pagos real**

---

## 🔴 1. BACKEND - Edge Functions de Supabase

### 1.1 Función: `create-checkout-session`
**Ubicación:** `supabase/functions/create-checkout-session/index.ts`  
**Estado:** ❌ NO EXISTE

**Funcionalidad Requerida:**
- Crear preferencia de pago en Mercado Pago
- Generar URL de checkout
- Guardar sesión en base de datos
- Retornar URL al frontend

**Código Base Necesario:**
```typescript
// Estructura básica requerida
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  // 1. Autenticar usuario
  // 2. Validar plan seleccionado
  // 3. Crear preferencia en Mercado Pago
  // 4. Guardar sesión en DB
  // 5. Retornar init_point URL
})
```

**Dependencias Necesarias:**
- SDK de Mercado Pago para Deno
- Variables de entorno: `MERCADOPAGO_ACCESS_TOKEN`

---

### 1.2 Función: `mercadopago-webhook`
**Ubicación:** `supabase/functions/mercadopago-webhook/index.ts`  
**Estado:** ❌ NO EXISTE

**Funcionalidad Requerida:**
- Recibir notificaciones de Mercado Pago (IPN)
- Validar firma de notificación
- Procesar diferentes tipos de eventos:
  - `payment.created` - Pago creado
  - `payment.approved` - Pago aprobado
  - `payment.rejected` - Pago rechazado
  - `payment.refunded` - Pago reembolsado
  - `subscription.created` - Suscripción creada
  - `subscription.updated` - Suscripción actualizada
- Actualizar estado de suscripción en base de datos
- Enviar notificaciones al usuario

**Eventos Críticos a Manejar:**
```typescript
// Tipos de eventos de Mercado Pago
type MercadoPagoEvent = 
  | 'payment.created'
  | 'payment.approved'
  | 'payment.rejected'
  | 'payment.refunded'
  | 'subscription.created'
  | 'subscription.updated'
  | 'subscription.cancelled'
```

**Seguridad:**
- Validar X-Signature header
- Verificar que la notificación viene de Mercado Pago
- Idempotencia (evitar procesar el mismo evento dos veces)

---

### 1.3 Función: `cancel-subscription`
**Ubicación:** `supabase/functions/cancel-subscription/index.ts`  
**Estado:** ❌ NO EXISTE

**Funcionalidad Requerida:**
- Cancelar suscripción en Mercado Pago
- Actualizar estado en base de datos
- Configurar cancelación al final del período actual
- Notificar al usuario

---

## 🔴 2. CONFIGURACIÓN Y VARIABLES DE ENTORNO

### 2.1 Variables de Entorno Requeridas

**En Supabase Dashboard (Settings > Edge Functions > Secrets):**
```
MERCADOPAGO_ACCESS_TOKEN=APP_USR-xxxxx  # Token de producción
MERCADOPAGO_ACCESS_TOKEN_TEST=TEST-xxxxx  # Token de test
MERCADOPAGO_WEBHOOK_SECRET=xxxxx         # Secret para validar webhooks
MERCADOPAGO_PUBLIC_KEY=APP_USR-xxxxx     # Public key (opcional, para frontend)
```

**En Frontend (.env):**
```
VITE_MERCADOPAGO_PUBLIC_KEY=APP_USR-xxxxx  # Para SDK de frontend (opcional)
```

### 2.2 Configuración en Mercado Pago

**Requisitos:**
1. ✅ Crear cuenta de desarrollador en Mercado Pago
2. ✅ Obtener Access Token (producción y test)
3. ❌ Configurar Webhook URL en panel de Mercado Pago
4. ❌ Configurar URLs de retorno (success, failure, pending)
5. ❌ Configurar notificaciones IPN

**URLs a Configurar:**
- Webhook: `https://[tu-proyecto].supabase.co/functions/v1/mercadopago-webhook`
- Success: `https://[tu-dominio]/dashboard/billing?status=success`
- Failure: `https://[tu-dominio]/dashboard/billing?status=failure`
- Pending: `https://[tu-dominio]/dashboard/billing?status=pending`

---

## 🔴 3. BASE DE DATOS - Tablas y Funciones

### 3.1 Tabla: `billing_payments`
**Estado:** ❌ NO EXISTE

**Estructura Requerida:**
```sql
CREATE TABLE public.billing_payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    subscription_id UUID REFERENCES billing_subscriptions(id),
    mercado_pago_payment_id TEXT UNIQUE,  -- ID del pago en Mercado Pago
    mercado_pago_preference_id TEXT,       -- ID de la preferencia
    amount DECIMAL(12, 2) NOT NULL,
    currency TEXT DEFAULT 'CLP',
    status TEXT NOT NULL CHECK (status IN ('pending', 'approved', 'rejected', 'refunded', 'cancelled')),
    payment_method TEXT,
    payment_type TEXT,
    installments INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    paid_at TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX idx_billing_payments_user_id ON billing_payments(user_id);
CREATE INDEX idx_billing_payments_mp_id ON billing_payments(mercado_pago_payment_id);
CREATE INDEX idx_billing_payments_status ON billing_payments(status);
```

### 3.2 Tabla: `billing_subscriptions` - Mejoras Necesarias
**Estado:** ✅ EXISTE pero necesita campos adicionales

**Campos Faltantes:**
```sql
ALTER TABLE billing_subscriptions ADD COLUMN IF NOT EXISTS 
    mercado_pago_subscription_id TEXT UNIQUE,
    mercado_pago_preapproval_id TEXT,
    next_payment_date TIMESTAMPTZ,
    last_payment_id UUID REFERENCES billing_payments(id),
    trial_end TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}'::jsonb;
```

### 3.3 Funciones de Base de Datos

**Función: `get_user_subscription_status(user_id UUID)`**
```sql
-- Retornar estado completo de suscripción con información de pagos
```

**Función: `create_payment_record(...)`**
```sql
-- Crear registro de pago automáticamente desde webhook
```

---

## 🔴 4. FRONTEND - Actualizaciones Necesarias

### 4.1 Hook `useBilling.js` - Actualización
**Archivo:** `src/hooks/useBilling.js`  
**Línea 49-62:** Función `createCheckoutSession` es MOCK

**Cambios Requeridos:**
```javascript
const createCheckoutSession = async (planId, provider = 'mercadopago') => {
  // ❌ ACTUAL (MOCK):
  // return new Promise((resolve) => {
  //   setTimeout(() => {
  //     resolve({ url: 'https://mercadopago.com/checkout-mock' });
  //   }, 1500);
  // });

  // ✅ NUEVO (REAL):
  const { data, error } = await supabase.functions.invoke('create-checkout-session', {
    body: { planId, provider }
  });
  
  if (error) throw error;
  return data;
};
```

### 4.2 Página `Billing.jsx` - Mejoras
**Archivo:** `src/pages/dashboard/Billing.jsx`

**Faltante:**
- ❌ Manejo de estados de pago (pending, approved, rejected)
- ❌ Redirección después de pago exitoso
- ❌ Mostrar historial real de pagos desde base de datos
- ❌ Manejo de errores de pago
- ❌ Loading states durante proceso de pago

### 4.3 Componente de Confirmación de Pago
**Estado:** ❌ NO EXISTE

**Nuevo Componente Requerido:**
- `src/components/PaymentConfirmation.jsx`
- Manejar redirección desde Mercado Pago
- Mostrar estado del pago
- Actualizar UI según resultado

---

## 🔴 5. SDK Y DEPENDENCIAS

### 5.1 SDK de Mercado Pago
**Estado:** ❌ NO INSTALADO

**Instalación Requerida:**
```bash
# Para Edge Functions (Deno)
# Usar import desde CDN o npm:esm.sh

# Para Frontend (opcional, si se usa SDK de frontend)
npm install mercadopago
```

**Uso en Edge Functions:**
```typescript
// En Deno, usar fetch directo a API de Mercado Pago
// O usar SDK compatible con Deno
import { MercadoPago } from 'https://esm.sh/mercadopago@2.0.0'
```

### 5.2 Dependencias Adicionales
- ❌ Librería para validar firmas de webhook
- ❌ Utilidades para manejo de fechas de suscripción
- ❌ Logger para debugging de pagos

---

## 🔴 6. SEGURIDAD Y VALIDACIONES

### 6.1 Validación de Webhooks
**Estado:** ❌ NO IMPLEMENTADO

**Requisitos:**
- Validar header `X-Signature` de Mercado Pago
- Verificar que la petición viene de IPs de Mercado Pago
- Implementar idempotencia (evitar procesar eventos duplicados)

### 6.2 Validación de Pagos
**Estado:** ❌ NO IMPLEMENTADO

**Requisitos:**
- Verificar monto del pago
- Validar que el pago corresponde a la suscripción correcta
- Verificar estado del pago antes de activar suscripción

### 6.3 Row Level Security (RLS)
**Estado:** ⚠️ PARCIAL

**Faltante:**
- Políticas RLS para tabla `billing_payments`
- Políticas para que usuarios solo vean sus propios pagos
- Políticas para que solo el sistema pueda crear/actualizar pagos desde webhooks

---

## 🔴 7. TESTING Y DESARROLLO

### 7.1 Credenciales de Test
**Estado:** ❌ NO CONFIGURADO

**Requisitos:**
- Configurar tokens de test de Mercado Pago
- Crear usuarios de test
- Configurar webhooks de test
- Documentar proceso de testing

### 7.2 Casos de Prueba
**Estado:** ❌ NO EXISTEN

**Casos Críticos a Probar:**
1. ✅ Pago exitoso
2. ✅ Pago rechazado
3. ✅ Pago pendiente
4. ✅ Reembolso
5. ✅ Cancelación de suscripción
6. ✅ Renovación automática
7. ✅ Webhook duplicado (idempotencia)
8. ✅ Webhook malicioso (seguridad)

---

## 🔴 8. DOCUMENTACIÓN Y CONFIGURACIÓN

### 8.1 Documentación de API
**Estado:** ❌ NO EXISTE

**Requisitos:**
- Documentar endpoints de Edge Functions
- Documentar estructura de requests/responses
- Documentar códigos de error
- Documentar flujo completo de pago

### 8.2 Guía de Configuración
**Estado:** ❌ NO EXISTE

**Requisitos:**
- Guía paso a paso para configurar Mercado Pago
- Cómo obtener credenciales
- Cómo configurar webhooks
- Cómo probar en modo test

---

## 🔴 9. MONITOREO Y LOGGING

### 9.1 Logging de Pagos
**Estado:** ❌ NO IMPLEMENTADO

**Requisitos:**
- Log de todos los eventos de pago
- Log de webhooks recibidos
- Log de errores en procesamiento
- Alerta de pagos fallidos

### 9.2 Métricas
**Estado:** ❌ NO IMPLEMENTADO

**Requisitos:**
- Tasa de éxito de pagos
- Tiempo promedio de procesamiento
- Errores más comunes
- Dashboard de pagos (opcional)

---

## 🔴 10. PLANES Y PRECIOS

### 10.1 Configuración de Planes
**Estado:** ⚠️ PARCIAL (solo en UI)

**Faltante:**
- ❌ Definir precios reales en base de datos
- ❌ Configurar planes en Mercado Pago
- ❌ Mapeo entre planes de app y planes de Mercado Pago
- ❌ Manejo de diferentes monedas (CLP, USD, etc.)

**Estructura Requerida:**
```sql
CREATE TABLE public.billing_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    price_monthly DECIMAL(12, 2) NOT NULL,
    price_yearly DECIMAL(12, 2),
    currency TEXT DEFAULT 'CLP',
    mercado_pago_plan_id TEXT,
    features JSONB DEFAULT '[]'::jsonb,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 📋 CHECKLIST DE IMPLEMENTACIÓN

### Fase 1: Configuración Inicial
- [ ] Crear cuenta de desarrollador en Mercado Pago
- [ ] Obtener Access Tokens (test y producción)
- [ ] Configurar variables de entorno en Supabase
- [ ] Instalar/configurar SDK de Mercado Pago

### Fase 2: Backend - Edge Functions
- [ ] Crear función `create-checkout-session`
- [ ] Crear función `mercadopago-webhook`
- [ ] Crear función `cancel-subscription`
- [ ] Implementar validación de webhooks
- [ ] Implementar idempotencia

### Fase 3: Base de Datos
- [ ] Crear tabla `billing_payments`
- [ ] Agregar campos faltantes a `billing_subscriptions`
- [ ] Crear funciones de base de datos
- [ ] Configurar RLS policies

### Fase 4: Frontend
- [ ] Actualizar `useBilling.js` para usar Edge Functions reales
- [ ] Mejorar página `Billing.jsx`
- [ ] Crear componente de confirmación de pago
- [ ] Manejar estados de pago

### Fase 5: Testing
- [ ] Configurar ambiente de test
- [ ] Probar flujo completo de pago
- [ ] Probar webhooks
- [ ] Probar casos de error

### Fase 6: Producción
- [ ] Configurar credenciales de producción
- [ ] Configurar webhooks de producción
- [ ] Monitoreo y alertas
- [ ] Documentación final

---

## 🚨 PRIORIDADES CRÍTICAS

### 🔴 ALTA PRIORIDAD (Bloqueante para producción)
1. Edge Function `create-checkout-session`
2. Edge Function `mercadopago-webhook`
3. Tabla `billing_payments`
4. Actualizar `useBilling.js` para usar funciones reales
5. Configuración de variables de entorno

### 🟡 MEDIA PRIORIDAD (Importante pero no bloqueante)
1. Función `cancel-subscription`
2. Componente de confirmación de pago
3. Mejoras en UI de billing
4. Logging y monitoreo

### 🟢 BAJA PRIORIDAD (Mejoras futuras)
1. Dashboard de métricas
2. Sistema de notificaciones avanzado
3. Soporte para múltiples monedas
4. Planes personalizados

---

## 📚 RECURSOS Y REFERENCIAS

### Documentación Oficial
- [Mercado Pago Developers](https://www.mercadopago.com/developers)
- [API de Preferencias](https://www.mercadopago.com/developers/es/reference/preferences/_checkout_preferences/post)
- [API de Webhooks](https://www.mercadopago.com/developers/es/docs/your-integrations/notifications/webhooks)
- [API de Suscripciones](https://www.mercadopago.com/developers/es/reference/subscriptions/_preapproval/post)

### SDKs Disponibles
- [Mercado Pago SDK Node.js](https://github.com/mercadopago/sdk-nodejs)
- [Mercado Pago SDK JavaScript](https://github.com/mercadopago/sdk-javascript)

### Ejemplos de Implementación
- [Checkout Pro](https://www.mercadopago.com/developers/es/docs/checkout-pro/integration-test)
- [Suscripciones Recurrentes](https://www.mercadopago.com/developers/es/docs/subscriptions/overview)

---

## 📝 NOTAS ADICIONALES

### Consideraciones de Seguridad
- ⚠️ **NUNCA** exponer Access Tokens en el frontend
- ⚠️ **SIEMPRE** validar webhooks antes de procesarlos
- ⚠️ **SIEMPRE** usar HTTPS para webhooks
- ⚠️ Implementar rate limiting en webhooks

### Consideraciones de UX
- Mostrar estados claros de pago (pending, approved, rejected)
- Proporcionar feedback inmediato al usuario
- Manejar errores de forma amigable
- Permitir reintentar pagos fallidos

### Consideraciones de Negocio
- Definir política de reembolsos
- Definir política de cancelaciones
- Considerar períodos de gracia
- Considerar trials gratuitos

---

**Última Actualización:** Enero 2025  
**Próxima Revisión:** Después de implementación de Fase 1

