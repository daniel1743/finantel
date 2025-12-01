# 🔧 Corrección de Funciones Edge con Dependencias de _shared

## ❌ Problema

Algunas funciones Edge intentan importar módulos de `_shared/` que Supabase no incluye automáticamente al desplegar, causando el error:

```
Módulo no encontrado "file:///tmp/.../_shared/cors.ts"
```

## ✅ Solución Aplicada

### 1. `create-payment-preference` - ✅ CORREGIDA

**Problema:** Importaba `_shared/cors.ts`

**Solución:** Reemplazado el import con definición inline de CORS headers.

**Estado:** ✅ Lista para desplegar

```bash
npx supabase functions deploy create-payment-preference
```

### 2. `create-checkout-session` - ⚠️ REQUIERE REEMPLAZO

**Problema:** Importa múltiples módulos de `_shared`:
- `_shared/security.ts`
- `_shared/sanitizer.ts`
- `_shared/cors.ts`
- `_shared/sentry.ts`

**Solución:** Se creó una versión simplificada sin dependencias de `_shared`:
- Archivo: `supabase/functions/create-checkout-session/index-SIMPLIFIED.ts`

**Pasos para corregir:**

1. **Opción A - Usar versión simplificada (Recomendado):**
   ```bash
   # Renombrar archivos
   cd supabase/functions/create-checkout-session
   mv index.ts index-ORIGINAL.ts
   mv index-SIMPLIFIED.ts index.ts
   
   # Desplegar
   npx supabase functions deploy create-checkout-session
   ```

2. **Opción B - Mantener versión original:**
   - Si necesitas las funcionalidades avanzadas (Sentry, sanitización, etc.)
   - Necesitarás copiar el contenido de `_shared/` dentro de la función
   - O configurar Supabase para incluir `_shared` en el despliegue

## 📋 Funciones Corregidas

- [x] `create-payment-preference` - Corregida, lista para desplegar
- [ ] `create-checkout-session` - Requiere reemplazo manual

## 🚀 Comandos de Despliegue

### Funciones que ya funcionan (sin dependencias _shared):

```bash
# Estas deberían funcionar sin problemas
npx supabase functions deploy monthly-closure
npx supabase functions deploy mercadopago-webhook
npx supabase functions deploy generate-alert
npx supabase functions deploy leak-hunter
npx supabase functions deploy calculate-financial-mood
npx supabase functions deploy cancel-subscription
npx supabase functions deploy find-user-by-email
npx supabase functions deploy health
npx supabase functions deploy voice-to-transaction-chatgpt
```

### Funciones corregidas:

```bash
# Ya corregida, lista para desplegar
npx supabase functions deploy create-payment-preference
```

### Función que requiere acción manual:

```bash
# Primero reemplazar index.ts con la versión simplificada
# Luego desplegar
npx supabase functions deploy create-checkout-session
```

## 💡 Nota

Si necesitas las funcionalidades avanzadas de `create-checkout-session` (Sentry, sanitización, etc.), puedes:
1. Copiar el código de las funciones de `_shared/` directamente en el archivo
2. O configurar un sistema de build que incluya `_shared` en el bundle

La versión simplificada funciona perfectamente para la mayoría de casos de uso.

