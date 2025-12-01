# 📊 Guía de Integración - Sistema de Logging

Esta guía muestra cómo integrar el sistema de notificaciones en tus Edge Functions existentes.

---

## 📦 PASO 1: Importar el Logger

En cualquier Edge Function, importa las funciones del logger:

```typescript
import { logError, logWarning, logInfo, logUsage, logCriticalError } from '../_shared/logger.ts';
```

---

## ✅ PASO 2: Ejemplos de Uso

### A) Registrar Errores

```typescript
// En un bloque catch
catch (error) {
  await logError(
    'Error al crear transacción por voz',
    `La función devolvió un error: ${error.message}`,
    '/voice-to-transaction',
    error
  );

  return new Response(
    JSON.stringify({ error: error.message }),
    { status: 500, headers: corsHeaders }
  );
}
```

### B) Registrar Errores Críticos

```typescript
// Para errores que requieren atención inmediata
if (!userId) {
  await logCriticalError(
    'Usuario no autenticado intentó acceder',
    'Se detectó un intento de acceso sin autenticación',
    '/voice-to-transaction',
    { headers: req.headers }
  );

  return new Response(
    JSON.stringify({ error: 'Unauthorized' }),
    { status: 401, headers: corsHeaders }
  );
}
```

### C) Registrar Advertencias

```typescript
// Cuando algo no está bien pero no es crítico
if (transcriptLength > 500) {
  await logWarning(
    'Transcripción muy larga detectada',
    `La transcripción tiene ${transcriptLength} caracteres. Podría afectar el rendimiento.`,
    '/voice-to-transaction',
    { transcriptLength, userId }
  );
}
```

### D) Registrar Información

```typescript
// Para eventos importantes pero normales
await logInfo(
  'Nueva transacción creada exitosamente',
  `Usuario ${userId} creó una transacción de ${amount} ${currency}`,
  '/voice-to-transaction',
  { userId, amount, currency }
);
```

### E) Registrar Uso

```typescript
// Para tracking de uso de funciones
await logUsage(
  'Función de voz utilizada',
  'Usuario utilizó la función de transacción por voz',
  '/voice-to-transaction',
  userId
);
```

---

## 🔥 EJEMPLO COMPLETO: Modificar voice-to-transaction

Aquí te muestro cómo integrar el logger en la función `voice-to-transaction`:

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { logError, logWarning, logInfo, logUsage, logCriticalError } from '../_shared/logger.ts';

serve(async (req) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // 1. Autenticar usuario
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      // ⚠️ LOG: Error crítico - falta autenticación
      await logCriticalError(
        'Acceso no autorizado a voice-to-transaction',
        'Se intentó acceder sin header de autorización',
        '/voice-to-transaction'
      );

      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();

    if (userError || !user) {
      // ⚠️ LOG: Error - token inválido
      await logError(
        'Token de autenticación inválido',
        'El token proporcionado no es válido o expiró',
        '/voice-to-transaction',
        userError
      );

      return new Response(
        JSON.stringify({ error: 'Invalid user token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 📊 LOG: Uso - función utilizada
    await logUsage(
      'Transacción por voz iniciada',
      'Usuario inició proceso de transacción por voz',
      '/voice-to-transaction',
      user.id
    );

    // 2. Procesar audio
    const formData = await req.formData();
    const audioFile = formData.get('audio');

    if (!audioFile) {
      // ⚠️ LOG: Advertencia - archivo de audio faltante
      await logWarning(
        'Audio faltante en request',
        'Se recibió un request sin archivo de audio',
        '/voice-to-transaction',
        { userId: user.id }
      );

      return new Response(
        JSON.stringify({ error: 'No audio file provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 3. Transcribir con OpenAI Whisper
    const whisperResponse = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
      },
      body: formData,
    });

    if (!whisperResponse.ok) {
      const errorText = await whisperResponse.text();

      // ❌ LOG: Error - API de Whisper falló
      await logError(
        'Error en API de OpenAI Whisper',
        `La API devolvió status ${whisperResponse.status}`,
        '/voice-to-transaction',
        { status: whisperResponse.status, error: errorText }
      );

      return new Response(
        JSON.stringify({ error: 'Failed to transcribe audio' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { text: transcript } = await whisperResponse.json();

    // Verificar longitud del transcript
    if (transcript.length > 500) {
      // ⚠️ LOG: Advertencia - transcript muy largo
      await logWarning(
        'Transcripción muy larga',
        `La transcripción tiene ${transcript.length} caracteres`,
        '/voice-to-transaction',
        { transcriptLength: transcript.length, userId: user.id }
      );
    }

    // 4. Parsear transacción
    const parsedData = parseTransaction(transcript, userCurrency);

    // 5. Crear transacción en DB
    const { data: newTransaction, error: insertError } = await supabase
      .from('transactions')
      .insert({
        user_id: user.id,
        description: parsedData.description,
        amount: parsedData.amount,
        category: parsedData.category,
        type: 'expense',
      })
      .select()
      .single();

    if (insertError) {
      // ❌ LOG: Error - fallo al insertar en DB
      await logError(
        'Error al crear transacción en base de datos',
        `No se pudo insertar la transacción: ${insertError.message}`,
        '/voice-to-transaction',
        { error: insertError, userId: user.id, parsedData }
      );

      throw insertError;
    }

    // ✅ LOG: Info - transacción creada exitosamente
    await logInfo(
      'Transacción por voz creada exitosamente',
      `Usuario ${user.email} creó una transacción de ${parsedData.amount} ${userCurrency}`,
      '/voice-to-transaction',
      {
        userId: user.id,
        transactionId: newTransaction.id,
        amount: parsedData.amount,
        category: parsedData.category,
      }
    );

    // 6. Retornar respuesta exitosa
    return new Response(
      JSON.stringify({
        success: true,
        transcript,
        transaction: newTransaction,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    // ❌ LOG: Error general no manejado
    await logCriticalError(
      'Error no manejado en voice-to-transaction',
      `Excepción capturada: ${error.message}`,
      '/voice-to-transaction',
      error
    );

    console.error('Error in voice-to-transaction:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
```

---

## 📝 MEJORES PRÁCTICAS

### 1. ¿Cuándo usar cada tipo?

| Tipo | Cuándo usar | Ejemplo |
|------|-------------|---------|
| `logCriticalError` | Errores que requieren atención INMEDIATA | Fallo de autenticación, DB caída, API externa sin respuesta |
| `logError` | Errores que afectan funcionalidad | Fallo al insertar en DB, error de validación |
| `logWarning` | Cosas que no están bien pero no rompen nada | Uso alto de recursos, datos malformados |
| `logInfo` | Eventos importantes pero normales | Usuario creado, pago exitoso, configuración actualizada |
| `logUsage` | Tracking de uso de funciones | Función llamada, endpoint accedido |

### 2. ¿Qué información incluir?

**✅ BUENO:**
```typescript
await logError(
  'Error al procesar pago',
  `El pago de ${amount} ${currency} falló por timeout`,
  '/mercadopago-webhook',
  { paymentId, userId, amount, error }
);
```

**❌ MALO:**
```typescript
await logError(
  'Error',
  'Algo salió mal',
  '/function',
  {}
);
```

### 3. Anti-Spam está activado

El sistema **automáticamente** evita duplicados en 5 minutos.

Si ocurre el mismo error 10 veces seguidas, solo verás:
```
[10x] Error al procesar pago
```

---

## 🚀 FUNCIONES A MODIFICAR

Te recomiendo agregar logging a estas funciones en este orden:

### Prioridad ALTA (críticas):
1. ✅ `voice-to-transaction` (ejemplo arriba)
2. ⬜ `mercadopago-webhook`
3. ⬜ `create-checkout-session`
4. ⬜ `cancel-subscription`

### Prioridad MEDIA:
5. ⬜ `ai-planner`
6. ⬜ `leak-hunter`
7. ⬜ `calculate-financial-mood`

### Prioridad BAJA:
8. ⬜ `bot-detect-*` (todas las funciones bot-detect)
9. ⬜ `ai-investigator`
10. ⬜ `future-self-simulator`

---

## 📊 MONITOREO EN EL FRONTEND

Para ver las notificaciones, ve a:

```
/dashboard/system-notifications
```

O agrégalo a tu menú de navegación:

```jsx
import { Bell } from 'lucide-react';

<NavLink to="/dashboard/system-notifications">
  <Bell className="w-5 h-5" />
  Notificaciones del Sistema
</NavLink>
```

---

## ⚙️ CONFIGURACIÓN ADICIONAL

### Limpiar notificaciones antiguas

Ejecuta periódicamente (puedes crear un cron job):

```sql
SELECT cleanup_old_notifications(30); -- Limpia notificaciones de más de 30 días
```

### Ver estadísticas

```sql
SELECT * FROM get_notification_stats();
```

---

## 🎯 RESULTADO FINAL

Con este sistema obtendrás:

✅ Visibilidad completa de errores en tiempo real
✅ Tracking de uso de funciones
✅ Anti-spam automático
✅ Notificaciones humanizadas
✅ Filtros por tipo y severidad
✅ Sistema escalable y profesional

---

**Creado:** 2025
**Versión:** 1.0.0
