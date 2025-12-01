# 🔥 INSTRUCCIONES COMPLETAS - SENTRY CONFIGURADO

## ✅ CONFIGURACIÓN COMPLETA

Sentry está configurado y listo para usar. Solo necesitas agregar tu DSN.

---

## 📝 PASO 1: Crear archivo `.env.local`

Crea un archivo `.env.local` en la raíz del proyecto con:

```env
VITE_SENTRY_DSN=https://2204157311b1e5a0337f5821643ee8b5@o4510439862173696.ingest.us.sentry.io/4510439893630976
VITE_APP_VERSION=2.1
```

**IMPORTANTE:** Este archivo NO se sube a Git (ya está protegido en `.gitignore`).

---

## ✅ PASO 2: Verificar inicialización

Sentry se inicializa automáticamente en `src/main.jsx`:

```javascript
import "@/lib/sentry"; // Se ejecuta ANTES de renderizar la app
```

---

## 🧪 PASO 3: Probar que funciona

### Método 1: Desde la consola del navegador

Abre F12 → Console y pega:

```javascript
throw new Error("🔥 Test Sentry desde consola");
```

**Resultado esperado:** El error debe aparecer en tu dashboard de Sentry en menos de 10 segundos.

### Método 2: Desde el código

En cualquier componente:

```javascript
import { captureError } from "@/lib/sentry";

try {
  throw new Error("🔥 Test Sentry desde el código");
} catch (e) {
  captureError(e, { test: true });
}
```

---

## 💻 USO EN COMPONENTES

### Capturar errores:

```javascript
import { captureError } from "@/lib/sentry";

try {
  // código que puede fallar
  await crearTransaccion();
} catch (error) {
  captureError(error, { 
    section: "transacciones",
    action: "crear"
  });
}
```

### Capturar mensajes importantes:

```javascript
import { captureMessage } from "@/lib/sentry";

captureMessage("Usuario entró al dashboard", {
  route: "/dashboard",
  timestamp: new Date().toISOString()
});
```

### Performance tracking - Clicks importantes:

```javascript
import { Sentry } from "@/lib/sentry";

const handleCreateTransaction = () => {
  Sentry.startSpan(
    { op: "ui.click", name: "Crear transacción" },
    (span) => {
      span.setAttribute("tipo", "gasto");
      span.setAttribute("monto", amount);
      crearTransaccion();
    }
  );
};
```

### Performance tracking - Llamadas API:

```javascript
import { Sentry } from "@/lib/sentry";

async function fetchUserData(id) {
  return Sentry.startSpan(
    { op: "http", name: `GET /user/${id}` },
    async () => {
      const res = await fetch(`/api/user/${id}`);
      return res.json();
    }
  );
}
```

---

## 🎯 CARACTERÍSTICAS ACTIVAS

### ✅ Automático:
- **Console logging:** Todos los `console.error` y `console.warn` se envían a Sentry
- **Session Replay:** 10% de sesiones normales, 100% cuando hay errores
- **Performance tracking:** 100% de transacciones rastreadas
- **Error boundaries:** Errores de React capturados automáticamente

### ✅ Manual:
- `captureError(error, extra)` - Capturar errores con contexto
- `captureMessage(msg, extra)` - Capturar mensajes importantes
- `Sentry.startSpan()` - Monitorear performance de funciones/clicks

---

## 📊 QUÉ SE MONITOREA

✔️ **Errores frontend** → Email automático  
✔️ **Errores silenciosos** → Detectados automáticamente  
✔️ **Lentitud en componentes** → Performance tracking  
✔️ **Rutas que dan error** → Navegación rastreada  
✔️ **Clicks importantes** → Con `startSpan`  
✔️ **Llamadas API** → Con `startSpan`  
✔️ **Sesiones con errores** → Session Replay completo  
✔️ **Stacktraces reales** → Con contexto completo  
✔️ **Navegador/Dispositivo** → Información del usuario  
✔️ **Historial por usuario** → Errores agrupados  

---

## 🔥 EJEMPLOS DE USO REAL

### En Transactions.jsx:

```javascript
import { captureError, Sentry } from "@/lib/sentry";

const handleAddTransaction = async () => {
  try {
    await Sentry.startSpan(
      { op: "ui.click", name: "Agregar transacción" },
      async () => {
        await addTransaction(formData);
      }
    );
  } catch (error) {
    captureError(error, {
      section: "transacciones",
      action: "agregar",
      formData: formData
    });
  }
};
```

### En Billing.jsx:

```javascript
import { captureError, captureMessage } from "@/lib/sentry";

const handleUpgrade = async () => {
  try {
    captureMessage("Usuario inició proceso de upgrade", {
      plan: selectedPlan
    });
    
    await createCheckoutSession(planId);
  } catch (error) {
    captureError(error, {
      section: "billing",
      action: "upgrade",
      planId: planId
    });
  }
};
```

---

## ✅ LISTO PARA PRODUCCIÓN

Con esta configuración, Finantel tiene:

✅ **Error tracking completo**  
✅ **Performance monitoring**  
✅ **Session replay**  
✅ **Console logging automático**  
✅ **Contexto de usuario**  
✅ **Stacktraces completos**  

**Todo configurado y funcionando. Solo agrega el DSN en `.env.local` y listo.**

---

**Última actualización:** Enero 2025

