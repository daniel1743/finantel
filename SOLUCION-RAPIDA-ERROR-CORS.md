# ⚡ Solución Rápida - Error CORS Voice Input

## 🔴 El Error que Estás Viendo

```
Access to fetch at 'https://yzakmqxbzwzbsdsadzej.supabase.co/functions/v1/voice-to-transaction'
has been blocked by CORS policy
```

---

## 💡 ¿Qué Significa?

La Edge Function `voice-to-transaction` **NO ESTÁ DESPLEGADA** en Supabase.
Solo existe en tu código local, pero Supabase no la conoce todavía.

---

## ✅ Solución en 5 Pasos (5 minutos)

### Paso 1: Ve a Supabase Dashboard
```
https://supabase.com/dashboard/project/yzakmqxbzwzbsdsadzej/functions
```

### Paso 2: Click en "Create a new function"
- Nombre: `voice-to-transaction`
- Click en "Create function"

### Paso 3: Copia el código
Abre este archivo en tu computadora:
```
C:\Users\Lenovo\Downloads\finantel version 2.1 funcional\supabase\functions\voice-to-transaction\index.ts
```

Selecciona TODO (Ctrl + A) y copia (Ctrl + C)

### Paso 4: Pega en Supabase
1. Pega el código en el editor de Supabase
2. Click en **"Deploy function"** (botón azul arriba a la derecha)
3. Espera 30 segundos

### Paso 5: Configura las Variables Secretas
1. En el mismo Dashboard, ve a: **"Secrets"** (pestaña lateral)
2. Click en **"Add secret"**
3. Agrega estas 3 variables:

#### Variable 1:
- **Name**: `OPENAI_API_KEY`
- **Value**: `sk-proj-LmZeVPyQcS0VmYhraWU1aVLsZ9AKWWjV7gD_aB-1hQ`

#### Variable 2:
- **Name**: `SUPABASE_URL`
- **Value**: `https://yzakmqxbzwzbsdsadzej.supabase.co`

#### Variable 3:
- **Name**: `SUPABASE_SERVICE_ROLE_KEY`
- **Value**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl6YWttcXhiend6YnNkc2FkemVqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzkxMTMxNiwiZXhwIjoyMDc5NDg3MzE2fQ.2dxcZOhCgjewwQAC9GSfggjC9rGN1gaMhd8j9ZaY1tw`

4. Click en **"Save"** para cada una

---

## 🧪 Verificar que Funciona

### Test Rápido:
1. Vuelve a tu aplicación: `http://localhost:3001/dashboard/transactions`
2. **Recarga la página** (F5 o Ctrl + R)
3. Click en el micrófono 🎤
4. Di: "Gasté mil pesos en Jumbo"
5. Detén la grabación

### ✅ Resultado Esperado:
- Toast verde: "✅ Gasto agregado"
- La transacción aparece en la lista
- NO más error de CORS

### ❌ Si Sigue el Error:
- Espera 1-2 minutos (la función puede tardar en activarse)
- Haz un **hard refresh**: Ctrl + Shift + R
- Verifica que las 3 variables secretas estén guardadas

---

## 🎯 Resumen Visual

```
Tu Código Local (✅ Ya existe)
         ↓
    [FALTA ESTE PASO]
         ↓
Supabase Cloud (❌ NO existe todavía)
         ↓
   Desplegar función
         ↓
   Configurar secretos
         ↓
    ✅ FUNCIONA
```

---

## 📸 Captura de Pantalla de Referencia

Cuando esté desplegada, deberías ver en el Dashboard:

```
Edge Functions
├── 📁 voice-to-transaction  ✅ Active
│   └── Status: Deployed
│   └── Last deployed: [fecha]
│
└── Secrets (3)
    ├── OPENAI_API_KEY: ••••••••
    ├── SUPABASE_URL: https://yzak...
    └── SUPABASE_SERVICE_ROLE_KEY: ••••••••
```

---

## ⏱️ Tiempo Estimado
- Copiar código: 1 minuto
- Desplegar: 30 segundos
- Configurar secretos: 2 minutos
- Probar: 1 minuto

**Total: ~5 minutos** ⚡

---

¿Necesitas ayuda con algún paso? Avísame y te guío! 🚀
