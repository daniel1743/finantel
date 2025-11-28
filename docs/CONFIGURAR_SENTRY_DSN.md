# 🔥 CONFIGURACIÓN SENTRY - DSN REAL

## ✅ PASO 1: Crear archivo `.env.local`

Crea un archivo `.env.local` en la raíz del proyecto con:

```env
VITE_SENTRY_DSN=https://2204157311b1e5a0337f5821643ee8b5@o4510439862173696.ingest.us.sentry.io/4510439893630976
VITE_APP_VERSION=2.1
```

**IMPORTANTE:** Este archivo NO se sube a Git (ya está en `.gitignore`).

---

## ✅ PASO 2: Verificar que Sentry se inicializa

El archivo `src/main.jsx` ya importa Sentry al inicio:

```javascript
import "@/lib/sentry";
```

Esto asegura que Sentry se inicialice ANTES de renderizar la app.

---

## ✅ PASO 3: Probar que funciona

### Método 1: Desde la consola del navegador

Abre F12 → Console y pega:

```javascript
throw new Error("🔥 Test Sentry desde consola");
```

Si el error aparece en tu dashboard de Sentry, ¡está funcionando!

### Método 2: Desde el código

En cualquier componente:

```javascript
import { captureError } from "@/lib/sentry";

try {
  throw new Error("🔥 Test Sentry desde el código");
} catch (e) {
  captureError(e);
}
```

---

## ✅ PASO 4: Usar Sentry en tus componentes

### Capturar errores:

```javascript
import { captureError } from "@/lib/sentry";

try {
  // código que puede fallar
} catch (error) {
  captureError(error, { section: "transacciones" });
}
```

### Capturar mensajes importantes:

```javascript
import { captureMessage } from "@/lib/sentry";

captureMessage("Usuario entró al dashboard", {
  route: "/dashboard",
});
```

### Performance tracking (clicks importantes):

```javascript
import { Sentry } from "@/lib/sentry";

Sentry.startSpan(
  { op: "ui.click", name: "Crear transacción" },
  (span) => {
    span.setAttribute("tipo", "gasto");
    crearTransaccion();
  }
);
```

### Performance tracking (llamadas API):

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

## 🎯 ¿QUÉ HACE ESTO POR FINANTEL?

✔️ Detecta errores front → te llega correo  
✔️ Detecta errores Edge Functions → te llega correo  
✔️ Detecta errores silenciosos que tú ni ves  
✔️ Detecta lentitud en componentes  
✔️ Detecta rutas que dan error  
✔️ Registra clicks, eventos, interacciones  
✔️ Graba sesión del usuario cuando ocurre un error  
✔️ Te dice si tu app está lenta, trabada, pesada  
✔️ Te dice qué componente se rompió  
✔️ Te muestra el **stacktrace real**  
✔️ Te permite ver en qué navegador / dispositivo falló  
✔️ Te da historiales de errores por usuario  

**→ Seguridad, performance y monitoreo a nivel empresa seria.**

---

**Última actualización:** Enero 2025

