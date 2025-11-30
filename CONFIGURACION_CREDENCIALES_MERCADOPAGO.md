# 🔐 Configuración de Credenciales de Mercado Pago

## 📋 Credenciales Disponibles

Las siguientes credenciales deben configurarse en las variables de entorno de Supabase Edge Functions:

### Credenciales de Mercado Pago

- **Public Key**: `APP_USR-9f4a5b4d-2e2f-453e-9c14-b7555cc6bd86`
- **Access Token**: `APP_USR-4284404497852619-112419-2600495523792527fd9d6990befd3683-659472935`
- **Client ID**: `4284404497852619`
- **Client Secret**: `QS1Hr5DhalynTgTsGaWyrjbCDKQsTJqB`

---

## ⚙️ Configuración en Supabase

### 1. Acceder a Edge Functions Settings

1. Ve a tu proyecto en [Supabase Dashboard](https://app.supabase.com)
2. Navega a **Settings** → **Edge Functions**
3. Haz clic en **Secrets** o **Environment Variables**

### 2. Agregar Variables de Entorno

Agrega las siguientes variables de entorno para las Edge Functions:

#### Variables Requeridas

```bash
# Access Token de Mercado Pago (PRODUCCIÓN)
MERCADOPAGO_ACCESS_TOKEN=APP_USR-4284404497852619-112419-2600495523792527fd9d6990befd3683-659472935

# Access Token de Mercado Pago (TEST - Opcional)
MERCADOPAGO_ACCESS_TOKEN_TEST=TU_ACCESS_TOKEN_TEST_AQUI

# Client Secret (para validación de webhooks - Opcional pero recomendado)
MERCADOPAGO_CLIENT_SECRET=QS1Hr5DhalynTgTsGaWyrjbCDKQsTJqB

# Secret para validación de firma de webhooks (Opcional)
MERCADOPAGO_WEBHOOK_SECRET=tu_secret_para_webhooks

# URL del Frontend (para redirects después del pago)
FRONTEND_URL=https://finantel.app
```

#### Nota Importante

Las Edge Functions usarán **primero** `MERCADOPAGO_ACCESS_TOKEN` y si no está disponible, intentarán con `MERCADOPAGO_ACCESS_TOKEN_TEST`. 

**Para producción, asegúrate de configurar `MERCADOPAGO_ACCESS_TOKEN` con el token de producción.**

---

## 🎯 Dónde se Usan las Credenciales

### Edge Functions que Usan las Credenciales

#### 1. `mercadopago-webhook`
- **Usa**: `MERCADOPAGO_ACCESS_TOKEN` o `MERCADOPAGO_ACCESS_TOKEN_TEST`
- **Propósito**: Obtener información detallada de pagos cuando se recibe una notificación
- **Línea de código**: `supabase/functions/mercadopago-webhook/index.ts:71-72`

```typescript
const accessToken = Deno.env.get('MERCADOPAGO_ACCESS_TOKEN') || 
                   Deno.env.get('MERCADOPAGO_ACCESS_TOKEN_TEST');
```

#### 2. `create-checkout-session`
- **Usa**: `MERCADOPAGO_ACCESS_TOKEN` o `MERCADOPAGO_ACCESS_TOKEN_TEST`
- **Propósito**: Crear preferencias de pago y sesiones de checkout
- **Línea de código**: `supabase/functions/create-checkout-session/index.ts:166-167`

```typescript
const accessToken = Deno.env.get('MERCADOPAGO_ACCESS_TOKEN') || 
                   Deno.env.get('MERCADOPAGO_ACCESS_TOKEN_TEST');
```

### Credenciales NO Usadas en Código (Por Ahora)

Las siguientes credenciales no se usan actualmente en el código pero pueden ser útiles para futuras funcionalidades:

- **Public Key**: `APP_USR-9f4a5b4d-2e2f-453e-9c14-b7555cc6bd86`
  - Se podría usar en el frontend para procesamiento de tarjetas directamente
  - No requiere protección en variables de entorno (es pública)

- **Client ID**: `4284404497852619`
  - Útil para OAuth o integraciones más avanzadas

- **Client Secret**: `QS1Hr5DhalynTgTsGaWyrjbCDKQsTJqB`
  - Ya está incluido en las variables de entorno para validación de webhooks

---

## 🔒 Seguridad

### ⚠️ Importante

1. **NUNCA** commits las credenciales al repositorio
2. **Siempre** usa variables de entorno en Supabase
3. Las credenciales están protegidas y solo accesibles desde Edge Functions
4. El Access Token tiene permisos para crear pagos y consultar información

### Variables Sensibles

Las siguientes variables **NUNCA** deben estar en el código fuente:
- ✅ `MERCADOPAGO_ACCESS_TOKEN`
- ✅ `MERCADOPAGO_ACCESS_TOKEN_TEST`
- ✅ `MERCADOPAGO_CLIENT_SECRET`
- ✅ `MERCADOPAGO_WEBHOOK_SECRET`

### Variables Públicas (Opcional en Frontend)

Estas pueden estar en el código frontend si es necesario:
- ⚠️ `MERCADOPAGO_PUBLIC_KEY` (solo si se necesita procesamiento de tarjetas en frontend)

---

## ✅ Verificación de Configuración

### 1. Verificar que las Variables Estén Configuradas

En Supabase Dashboard:
1. Ve a **Settings** → **Edge Functions**
2. Revisa la sección de **Secrets** o **Environment Variables**
3. Verifica que `MERCADOPAGO_ACCESS_TOKEN` esté configurada

### 2. Probar la Edge Function

Puedes probar que las credenciales funcionen haciendo una petición de prueba:

```bash
curl -X POST https://TU_PROYECTO.supabase.co/functions/v1/create-checkout-session \
  -H "Authorization: Bearer TU_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"planId": "basico"}'
```

Si funciona correctamente, deberías recibir una URL de checkout.

### 3. Verificar Logs

Si hay errores, revisa los logs de la Edge Function en Supabase Dashboard:
- **Edge Functions** → Selecciona la función → **Logs**

Busca errores como:
- `Mercado Pago access token not configured`
- `Payment provider not configured`

---

## 🚀 Pasos de Configuración Rápida

### Paso 1: Configurar en Supabase

```bash
# En Supabase Dashboard → Settings → Edge Functions → Secrets
MERCADOPAGO_ACCESS_TOKEN=APP_USR-4284404497852619-112419-2600495523792527fd9d6990befd3683-659472935
MERCADOPAGO_CLIENT_SECRET=QS1Hr5DhalynTgTsGaWyrjbCDKQsTJqB
FRONTEND_URL=https://finantel.app
```

### Paso 2: Verificar que la Edge Function Use las Variables

Las Edge Functions ya están configuradas para usar estas variables. No necesitas modificar código.

### Paso 3: Configurar Webhook en Mercado Pago

1. Ve a tu panel de Mercado Pago
2. Configura el webhook URL:
   ```
   https://TU_PROYECTO.supabase.co/functions/v1/mercadopago-webhook
   ```
3. Selecciona los eventos:
   - `payment`
   - `subscription`

### Paso 4: Probar

1. Crea una sesión de checkout desde el frontend
2. Completa un pago de prueba
3. Verifica que el webhook se reciba correctamente
4. Revisa las notificaciones en `/dashboard/admin/system-notifications`

---

## 📝 Notas Adicionales

### Modo Test vs Producción

- **Test**: Usa `MERCADOPAGO_ACCESS_TOKEN_TEST` para pagos de prueba
- **Producción**: Usa `MERCADOPAGO_ACCESS_TOKEN` para pagos reales

El código automáticamente usará el token de producción si está disponible, o el de test como fallback.

### Renovación de Tokens

Si necesitas renovar el Access Token:
1. Obtén un nuevo token desde el panel de Mercado Pago
2. Actualiza la variable `MERCADOPAGO_ACCESS_TOKEN` en Supabase
3. No necesitas reiniciar las Edge Functions (se actualizan automáticamente)

---

## 🔗 Enlaces Útiles

- [Documentación de Mercado Pago](https://www.mercadopago.cl/developers/es/docs)
- [API de Pagos de Mercado Pago](https://www.mercadopago.cl/developers/es/reference/payments/_payments_id/get)
- [API de Checkout de Mercado Pago](https://www.mercadopago.cl/developers/es/reference/preferences/_checkout_preferences/post)

---

## ✅ Checklist de Configuración

- [ ] Access Token configurado en Supabase Edge Functions
- [ ] Client Secret configurado (opcional pero recomendado)
- [ ] FRONTEND_URL configurado
- [ ] Webhook URL configurado en Mercado Pago
- [ ] Eventos de webhook seleccionados (payment, subscription)
- [ ] Prueba de checkout realizada
- [ ] Webhook recibido correctamente
- [ ] Notificaciones apareciendo en el panel admin

---

*Última actualización: Diciembre 2024*

