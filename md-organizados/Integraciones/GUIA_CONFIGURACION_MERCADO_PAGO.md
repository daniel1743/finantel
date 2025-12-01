# 🚀 Guía de Configuración e Implementación - Mercado Pago

Esta guía te llevará paso a paso para configurar e implementar la integración completa de Mercado Pago en Finantel.

---

## 📋 ÍNDICE

1. [Variables de Entorno](#variables-de-entorno)
2. [Configuración en Mercado Pago](#configuración-en-mercado-pago)
3. [Aplicar Migraciones de Base de Datos](#aplicar-migraciones-de-base-de-datos)
4. [Desplegar Edge Functions](#desplegar-edge-functions)
5. [Testing en Modo Test](#testing-en-modo-test)
6. [Pasar a Producción](#pasar-a-producción)

---

## 🔐 VARIABLES DE ENTORNO

### En Supabase Dashboard

1. Ve a tu proyecto en [Supabase Dashboard](https://app.supabase.com)
2. Navega a **Settings** > **Edge Functions** > **Secrets**
3. Agrega las siguientes variables:

```
MERCADOPAGO_ACCESS_TOKEN=TEST-xxxxx-xxxxx-xxxxx
MERCADOPAGO_ACCESS_TOKEN_TEST=TEST-xxxxx-xxxxx-xxxxx
MERCADOPAGO_WEBHOOK_SECRET=tu_webhook_secret_aqui
FRONTEND_URL=https://tu-dominio.com
```

**Nota:** 
- `MERCADOPAGO_ACCESS_TOKEN_TEST` es para desarrollo/testing
- `MERCADOPAGO_ACCESS_TOKEN` es para producción
- `FRONTEND_URL` debe ser la URL de tu frontend (ej: `https://finantel.app`)

### En Frontend (.env)

Crea o actualiza tu archivo `.env`:

```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key
VITE_MERCADOPAGO_PUBLIC_KEY=APP_USR-xxxxx  # Opcional, si usas SDK de frontend
```

---

## 🏦 CONFIGURACIÓN EN MERCADO PAGO

### 1. Crear Cuenta de Desarrollador

1. Ve a [Mercado Pago Developers](https://www.mercadopago.com/developers)
2. Inicia sesión o crea una cuenta
3. Crea una nueva aplicación

### 2. Obtener Credenciales

En el panel de tu aplicación, encontrarás:

- **Access Token (Test)**: Para desarrollo
- **Access Token (Producción)**: Para producción
- **Public Key**: Opcional, para SDK de frontend

### 3. Configurar Webhooks

1. En el panel de Mercado Pago, ve a **Webhooks**
2. Agrega la siguiente URL:

```
https://[tu-proyecto].supabase.co/functions/v1/mercadopago-webhook
```

3. Selecciona los eventos a recibir:
   - `payment.created`
   - `payment.approved`
   - `payment.rejected`
   - `payment.refunded`
   - `subscription.created`
   - `subscription.updated`
   - `subscription.cancelled`

4. Guarda el **Webhook Secret** (lo necesitarás para la variable de entorno)

### 4. Configurar URLs de Retorno

En la creación de preferencias (ya está configurado en el código), pero verifica que:

- **Success URL**: `https://tu-dominio.com/dashboard/billing?status=success`
- **Failure URL**: `https://tu-dominio.com/dashboard/billing?status=failure`
- **Pending URL**: `https://tu-dominio.com/dashboard/billing?status=pending`

---

## 🗄️ APLICAR MIGRACIONES DE BASE DE DATOS

### Opción 1: Desde Supabase Dashboard

1. Ve a **SQL Editor** en tu proyecto
2. Copia el contenido de `supabase/migrations/045_mercado_pago_integration.sql`
3. Ejecuta el script completo

### Opción 2: Desde CLI

```bash
# Asegúrate de estar enlazado a tu proyecto
supabase link --project-ref tu-project-ref

# Aplicar la migración
supabase db push
```

### Verificar que las tablas se crearon

Ejecuta esta query en SQL Editor:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('billing_plans', 'billing_payments', 'billing_subscriptions');
```

Deberías ver las 3 tablas listadas.

---

## 🚀 DESPLEGAR EDGE FUNCTIONS

### Opción 1: Desde CLI (Recomendado)

```bash
# Desplegar todas las funciones
supabase functions deploy create-checkout-session
supabase functions deploy mercadopago-webhook
supabase functions deploy cancel-subscription
```

### Opción 2: Desde Supabase Dashboard

1. Ve a **Edge Functions** en tu proyecto
2. Crea una nueva función
3. Copia el código de cada función desde:
   - `supabase/functions/create-checkout-session/index.ts`
   - `supabase/functions/mercadopago-webhook/index.ts`
   - `supabase/functions/cancel-subscription/index.ts`

### Verificar que las funciones están desplegadas

```bash
supabase functions list
```

Deberías ver las 3 funciones listadas.

---

## 🧪 TESTING EN MODO TEST

### 1. Configurar Credenciales de Test

Asegúrate de tener configurado `MERCADOPAGO_ACCESS_TOKEN_TEST` en Supabase.

### 2. Tarjetas de Prueba de Mercado Pago

Mercado Pago proporciona tarjetas de prueba:

**Tarjeta Aprobada:**
- Número: `5031 7557 3453 0604`
- CVV: `123`
- Fecha: Cualquier fecha futura
- Nombre: Cualquier nombre

**Tarjeta Rechazada:**
- Número: `5031 4332 1540 6351`
- CVV: `123`
- Fecha: Cualquier fecha futura

**Tarjeta Pendiente:**
- Número: `5031 7557 3453 0604`
- CVV: `123`
- Fecha: Cualquier fecha futura

### 3. Proceso de Testing

#### Paso 1: Crear Usuario de Prueba

1. Regístrate en tu aplicación
2. Inicia sesión

#### Paso 2: Probar Checkout

1. Ve a `/dashboard/billing`
2. Haz clic en "Mejorar a Starter" (o cualquier plan)
3. Deberías ser redirigido a Mercado Pago
4. Usa una tarjeta de prueba
5. Completa el pago

#### Paso 3: Verificar en Base de Datos

Ejecuta estas queries para verificar:

```sql
-- Ver pagos creados
SELECT * FROM billing_payments 
WHERE user_id = 'tu-user-id' 
ORDER BY created_at DESC;

-- Ver suscripción actualizada
SELECT * FROM billing_subscriptions 
WHERE user_id = 'tu-user-id';
```

#### Paso 4: Probar Webhook

1. En Mercado Pago, ve a **Webhooks** > **Eventos**
2. Deberías ver eventos recibidos
3. Verifica que los pagos se actualicen en `billing_payments`

#### Paso 5: Probar Cancelación

1. En `/dashboard/billing`, haz clic en "Cancelar Suscripción"
2. Confirma la cancelación
3. Verifica que `billing_subscriptions.status` cambie a `cancelled`

### 4. Verificar Logs

```bash
# Ver logs de Edge Functions
supabase functions logs create-checkout-session
supabase functions logs mercadopago-webhook
supabase functions logs cancel-subscription
```

---

## 🎯 PASAR A PRODUCCIÓN

### 1. Cambiar a Credenciales de Producción

1. Obtén tu **Access Token de Producción** de Mercado Pago
2. Actualiza `MERCADOPAGO_ACCESS_TOKEN` en Supabase (sin el `_TEST`)
3. Actualiza `FRONTEND_URL` con tu dominio de producción

### 2. Configurar Webhook de Producción

1. En Mercado Pago, configura el webhook con la URL de producción
2. Actualiza `MERCADOPAGO_WEBHOOK_SECRET` si es necesario

### 3. Verificar Variables de Entorno

Asegúrate de que todas las variables estén configuradas:

```bash
# En Supabase Dashboard > Edge Functions > Secrets
MERCADOPAGO_ACCESS_TOKEN=APP_USR-xxxxx  # Producción
MERCADOPAGO_WEBHOOK_SECRET=tu_secret_produccion
FRONTEND_URL=https://tu-dominio-produccion.com
```

### 4. Probar con Pago Real Pequeño

1. Realiza un pago real pequeño (ej: $1)
2. Verifica que se procese correctamente
3. Verifica que el webhook funcione
4. Verifica que la suscripción se active

---

## 🔍 TROUBLESHOOTING

### Error: "Mercado Pago access token not configured"

**Solución:** Verifica que `MERCADOPAGO_ACCESS_TOKEN` o `MERCADOPAGO_ACCESS_TOKEN_TEST` estén configurados en Supabase.

### Error: "Payment not found in Mercado Pago"

**Solución:** 
- Verifica que el `payment_id` sea correcto
- Asegúrate de estar usando el mismo Access Token que creó el pago

### Webhook no se recibe

**Solución:**
1. Verifica que la URL del webhook sea correcta
2. Verifica que el webhook esté activo en Mercado Pago
3. Revisa los logs de la Edge Function

### Pago aprobado pero suscripción no se actualiza

**Solución:**
1. Verifica que el webhook se haya recibido
2. Revisa los logs de `mercadopago-webhook`
3. Verifica que el `external_reference` tenga el formato correcto: `user_{user_id}_plan_{plan_slug}_{timestamp}`

### Error de CORS

**Solución:**
- Las Edge Functions ya tienen headers CORS configurados
- Si persiste, verifica que estés llamando desde el dominio correcto

---

## 📊 MONITOREO

### Ver Pagos en Tiempo Real

```sql
-- Pagos recientes
SELECT 
    bp.id,
    u.email,
    bp.amount,
    bp.currency,
    bp.status,
    bp.created_at
FROM billing_payments bp
JOIN auth.users u ON u.id = bp.user_id
ORDER BY bp.created_at DESC
LIMIT 20;
```

### Ver Suscripciones Activas

```sql
SELECT 
    bs.id,
    u.email,
    bs.plan,
    bs.status,
    bs.current_period_end,
    bs.next_payment_date
FROM billing_subscriptions bs
JOIN auth.users u ON u.id = bs.user_id
WHERE bs.status = 'active'
ORDER BY bs.created_at DESC;
```

---

## ✅ CHECKLIST FINAL

Antes de pasar a producción, verifica:

- [ ] Variables de entorno configuradas en Supabase
- [ ] Migraciones de base de datos aplicadas
- [ ] Edge Functions desplegadas
- [ ] Webhook configurado en Mercado Pago
- [ ] URLs de retorno configuradas
- [ ] Testing completo con tarjetas de prueba
- [ ] Logs verificados sin errores
- [ ] Frontend actualizado y funcionando
- [ ] Credenciales de producción configuradas

---

## 📚 RECURSOS ADICIONALES

- [Documentación de Mercado Pago](https://www.mercadopago.com/developers)
- [API de Preferencias](https://www.mercadopago.com/developers/es/reference/preferences/_checkout_preferences/post)
- [API de Webhooks](https://www.mercadopago.com/developers/es/docs/your-integrations/notifications/webhooks)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)

---

**Última actualización:** Enero 2025

