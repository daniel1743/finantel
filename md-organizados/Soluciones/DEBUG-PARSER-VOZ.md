# 🐛 DEBUG: Parser de Voz

## ❌ PROBLEMA REPORTADO

**Input del usuario:** "arepa y empanada"
**Output guardado:** -$28.00
**Output esperado:** $28,000 CLP

---

## 🔍 ANÁLISIS DEL PROBLEMA

### Problema 1: Monto negativo (-28 en lugar de 28,000)
- El monto se guardó como **negativo** (-28)
- Debería ser **positivo**
- Parece que el parser detectó "28" pero no "mil"

### Problema 2: Falta el multiplicador "mil"
- Si el usuario dijo "28 mil", debería ser 28,000
- Si el usuario solo dijo "28", es correcto que sea 28
- **PERO**: ¿Por qué es negativo?

### Problema 3: Falta la moneda (CLP)
- Se guardó como "$28.00" (formato USD con decimales)
- Debería ser "$28.000" o "$28,000" (CLP sin decimales)
- La Edge Function no está usando la moneda del usuario

---

## 🧪 TESTS NECESARIOS

### Test 1: ¿Qué dijo realmente el usuario?
Necesitamos ver los **logs de Supabase** para ver la transcripción exacta.

**Ir a:**
```
https://supabase.com/dashboard/project/yzakmqxbzwzbsdsadzej/functions/voice-to-transaction/logs
```

**Buscar:**
```
✅ Transcripción: [lo que OpenAI escuchó]
🔍 Parseando: [el texto que se parseó]
✅ Monto detectado: [el monto que detectó]
```

### Test 2: ¿Está desplegada la Edge Function nueva?
La función con soporte de moneda debe estar activa.

**Verificar:**
1. Ve a Functions en Supabase
2. Click en `voice-to-transaction`
3. Verifica que el código tenga `userCurrency`
4. Verifica que diga "VERSIÓN COMPLETA CON MONEDA Y NECESIDAD"

---

## 🔧 POSIBLES CAUSAS

### Causa 1: Edge Function vieja
Si la función **NO** tiene el código actualizado (`CODIGO-VOICE-COMPLETO-CON-MONEDA.ts`):
- No lee la moneda del usuario
- Puede tener bugs en el parser

**Solución:** Redeploy de la Edge Function

### Causa 2: Usuario no dijo el monto correctamente
Si el usuario dijo solo "arepa y empanada 28":
- El parser detecta "28" (correcto)
- NO detecta "mil" porque no se dijo
- Pero... ¿por qué negativo?

**Pregunta al usuario:** ¿Qué dijiste exactamente?

### Causa 3: Bug en el parser de montos
El parser puede tener un bug que:
- Detecta números sin "mil"
- Los convierte a negativos por error
- No maneja bien casos edge

---

## 🚀 SOLUCIONES INMEDIATAS

### Solución 1: Verificar logs (HACER AHORA)

1. Abre la consola de Supabase:
   ```
   https://supabase.com/dashboard/project/yzakmqxbzwzbsdsadzej/functions/voice-to-transaction/logs
   ```

2. Busca el intento más reciente (con "arepa y empanada")

3. Copia y pega aquí los logs completos

### Solución 2: Verificar configuración de moneda

1. Ve a tu perfil: `http://localhost:3001/dashboard/profile`
2. Verifica que la moneda sea **CLP** (Peso Chileno)
3. Si no está configurada, configúrala

### Solución 3: Redeploy de Edge Function

Si la función no está actualizada:

1. Abre: `CODIGO-VOICE-COMPLETO-CON-MONEDA.ts`
2. Copia TODO el código
3. Ve a Supabase Functions
4. Pega y Deploy

---

## 📊 COMPARACIÓN DE PARSERS

### Parser VIEJO (si no actualizaste):
```javascript
// Puede tener este bug:
const directMatch = lowerText.match(/\\$?\\s*(\\d+)/);
amount = parseFloat(moneyMatch[1]); // ← Puede ser negativo si hay "-"
```

### Parser NUEVO (actualizado):
```javascript
// Debería tener:
const milMatch = lowerText.match(/(\\d+)\\s*mil/);
if (milMatch) {
  amount = parseInt(milMatch[1]) * 1000; // ← Siempre positivo
}
```

---

## 🎯 PRÓXIMOS PASOS

1. **Usuario:** Dime exactamente qué dijiste
2. **Desarrollador:** Revisa los logs de Supabase
3. **Desarrollador:** Verifica que la Edge Function esté actualizada
4. **Usuario:** Configura tu moneda en el perfil si no está

---

## 🔴 RESPUESTA RÁPIDA

**¿Dijiste "28 mil pesos" o solo "28 pesos"?**

- Si dijiste **"28 mil"** → Bug en el parser (no detectó "mil")
- Si dijiste **"28"** → Está correcto, pero ¿por qué negativo?

**¿Tienes CLP configurado en tu perfil?**

- Si **NO** → Configúralo ahora
- Si **SÍ** → La Edge Function no se actualizó

---

**ACCIÓN INMEDIATA:** Ver logs de Supabase y compartir aquí.
