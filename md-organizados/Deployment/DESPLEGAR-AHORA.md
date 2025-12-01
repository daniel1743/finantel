# 🚀 DESPLEGAR FUNCIÓN ACTUALIZADA - AHORA

## ✅ BUENAS NOTICIAS:

1. ✅ Tu código frontend YA está correcto (envía FormData)
2. ✅ Tu código local de la Edge Function YA está correcto (acepta FormData)
3. ❌ **PROBLEMA**: El código NO está desplegado en Supabase Cloud

---

## 🎯 SOLUCIÓN: Desplegar la Función

### Opción 1: Dashboard de Supabase (5 minutos) ⭐

#### Paso 1: Abre el archivo local
```
C:\Users\Lenovo\Downloads\finantel version 2.1 funcional\supabase\functions\voice-to-transaction\index.ts
```

#### Paso 2: Copia TODO el contenido
- Abre el archivo con Notepad o VS Code
- Selecciona todo: `Ctrl + A`
- Copia: `Ctrl + C`

#### Paso 3: Ve al Dashboard
```
https://supabase.com/dashboard/project/yzakmqxbzwzbsdsadzej/functions
```

#### Paso 4: Edita la función
1. Busca `voice-to-transaction` en la lista
2. Click en ella
3. Borra todo el código del editor
4. Pega el código nuevo: `Ctrl + V`

#### Paso 5: Despliega
1. Click en el botón **"Deploy"** (azul, arriba a la derecha)
2. Espera 30-60 segundos
3. Deberías ver: ✅ "Successfully deployed"

#### Paso 6: Verifica secretos
Ve a la pestaña **"Secrets"** y confirma que existan:

- `OPENAI_API_KEY`: `sk-proj-LmZeVPyQcS0VmYhraWU1aVLsZ9AKWWjV7gD_aB-1hQ`
- `SUPABASE_URL`: `https://yzakmqxbzwzbsdsadzej.supabase.co`
- `SUPABASE_SERVICE_ROLE_KEY`: (la clave larga que ya configuraste)

Si no existen, agrégalas.

---

### Opción 2: Supabase CLI (Si tienes npm)

```bash
# 1. Instalar Supabase CLI (si no lo tienes)
npm install -g supabase

# 2. Login
cd "C:\Users\Lenovo\Downloads\finantel version 2.1 funcional"
supabase login

# 3. Link al proyecto
supabase link --project-ref yzakmqxbzwzbsdsadzej

# 4. Desplegar la función
supabase functions deploy voice-to-transaction

# 5. Configurar secretos (si no están)
supabase secrets set OPENAI_API_KEY=sk-proj-LmZeVPyQcS0VmYhraWU1aVLsZ9AKWWjV7gD_aB-1hQ
```

---

## 🧪 DESPUÉS DE DESPLEGAR: Probar

### Test 1: Verifica en el Dashboard
1. Ve a: https://supabase.com/dashboard/project/yzakmqxbzwzbsdsadzej/functions
2. Busca: `voice-to-transaction`
3. Deberías ver:
   ```
   ✅ Active
   Last deployed: hace pocos segundos
   ```

### Test 2: Prueba en tu app
1. Recarga tu app: `http://localhost:3001/dashboard/transactions`
2. Haz `Ctrl + Shift + R` (hard refresh)
3. Click en el micrófono 🎤
4. Permite permisos
5. Di claramente: **"Gasté mil pesos en Jumbo"**
6. Click para detener
7. Deberías ver: ✅ **"Gasto agregado: $1,000"**

### Test 3: Revisa los logs
Si sigue fallando:
1. Ve a: Edge Functions → voice-to-transaction → **Logs**
2. Haz una nueva prueba del micrófono
3. Busca el error en los logs
4. Copia el error exacto

---

## 🔍 DIFERENCIA CLAVE DEL CÓDIGO

### ❌ Código VIEJO (que causa el error):
```typescript
const { audio, userId } = await req.json()  // Solo acepta JSON
```

### ✅ Código NUEVO (que funciona):
```typescript
const contentType = req.headers.get('content-type') || ''

if (contentType.includes('multipart/form-data')) {
  const formData = await req.formData()  // ✅ Acepta FormData
  // ...
} else {
  const body = await req.json()  // También acepta JSON
  // ...
}
```

El código nuevo **acepta AMBOS formatos**: FormData Y JSON.

---

## ✅ Checklist antes de probar:

- [ ] Código copiado del archivo `index.ts` local
- [ ] Pegado en el editor de Supabase Dashboard
- [ ] Click en "Deploy" y esperado 30 segundos
- [ ] Verificado que dice "Active" con timestamp reciente
- [ ] Los 3 secretos configurados
- [ ] App recargada con Ctrl + Shift + R
- [ ] Micrófono probado

---

## 🎯 Resultado Esperado

Después de desplegar:

```
Usuario: 🎤 "Gasté mil pesos en Jumbo"
        ↓
Frontend: Envía FormData con audioBlob
        ↓
Edge Function: Recibe FormData ✅
        ↓
Whisper API: Transcribe el audio ✅
        ↓
Parser: Detecta monto y comercio ✅
        ↓
DB: Guarda transacción ✅
        ↓
UI: ✅ "Gasto agregado: $1,000"
```

---

## 🆘 Si SIGUE fallando después de desplegar

1. Abre la consola del navegador (F12)
2. Copia el error COMPLETO
3. Ve a Supabase Dashboard → Logs
4. Copia los logs de la función
5. Avísame con ambos errores

---

**¡El código está listo, solo falta desplegarlo!** 🚀

**Tiempo estimado: 5 minutos** ⏱️
