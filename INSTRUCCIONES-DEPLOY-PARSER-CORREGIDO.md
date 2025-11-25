# 🚀 Instrucciones: Desplegar Parser Corregido v2

## ✅ BUGS SOLUCIONADOS

### Bug 1: Montos con formato monetario
**Problema:** "Hola, gasté $28,000 pesos en una arepa y una empanada" → Se guardó como $28.00 en lugar de $28,000

**Causa:** El parser estaba revisando el patrón de números pequeños (28) ANTES del patrón de formato monetario ($28,000)

**Solución:** Se reordenaron los patrones regex y se creó un Patrón 0 prioritario que detecta `$X,XXX` primero

### Bug 2: Ingresos vs Gastos
**Problema:** Todo se guardaba como gasto (expense), incluso cuando decías "Cobré $50,000"

**Causa:** El tipo de transacción estaba hardcodeado como `'expense'`

**Solución:** Se agregó detección automática con 17 palabras clave para ingresos y 13 para gastos

---

## 📋 PASOS PARA DESPLEGAR

### 1️⃣ Abrir el código corregido

1. Abre el archivo: `CODIGO-VOICE-FINAL-CORREGIDO.ts`
2. Presiona `Ctrl + A` para seleccionar TODO el código
3. Presiona `Ctrl + C` para copiarlo

---

### 2️⃣ Ir a Supabase Edge Functions

1. Abre tu navegador
2. Ve a: https://supabase.com/dashboard/project/yzakmqxbzwzbsdsadzej/functions
3. Click en la función **`voice-to-transaction`**
4. Click en el botón **"Edit"** o **"Editar"**

---

### 3️⃣ Reemplazar el código

1. En el editor de Supabase, presiona `Ctrl + A` para seleccionar todo
2. Presiona `Delete` para borrar el código antiguo
3. Presiona `Ctrl + V` para pegar el código nuevo
4. Verifica que en las primeras líneas diga:
   ```typescript
   // ✅ VERSIÓN FINAL CORREGIDA - BUG $28,000 SOLUCIONADO
   // Prioridad de patrones: formato monetario PRIMERO
   ```

---

### 4️⃣ Desplegar la función

1. Click en el botón **"Deploy"** o **"Desplegar"**
2. Espera a que aparezca el mensaje: ✅ **"Successfully deployed"**
3. **IMPORTANTE:** Espera 30-60 segundos antes de probar (el despliegue tarda)

---

### 5️⃣ Verificar que funciona

#### Opción A: Prueba desde tu app

**Test 1: Gasto con formato monetario**
1. Abre: `http://localhost:3001/dashboard`
2. Click en el botón del micrófono
3. Di exactamente: **"Hola, gasté $28,000 pesos en una arepa y una empanada"**
4. Verifica el resultado:
   - ✅ Tipo: GASTO (expense)
   - ✅ Monto: **-$28,000** (NO $28.00)
   - ✅ Descripción: "una arepa y una empanada"
   - ✅ Categoría: Alimentación
   - ✅ Moneda: CLP

**Test 2: Ingreso**
1. Click en el botón del micrófono
2. Di: **"Cobré $50,000 de mi trabajo"**
3. Verifica el resultado:
   - ✅ Tipo: INGRESO (income)
   - ✅ Monto: **+$50,000** (signo positivo, verde)
   - ✅ Descripción: "De mi trabajo"

#### Opción B: Revisar logs de Supabase

1. Ve a: https://supabase.com/dashboard/project/yzakmqxbzwzbsdsadzej/functions/voice-to-transaction/logs
2. Busca tu intento más reciente
3. Busca estas líneas:

   **Para el gasto:**
   ```
   ✅ Transcripción: Hola, gasté $28,000 pesos en una arepa y una empanada.
   ✅ Tipo detectado: GASTO (keyword: gasté)
   ✅ Monto detectado (formato monetario $X,XXX): 28000 CLP
   🧠 Datos parseados: {"amount":28000,"description":"una arepa y una empanada","type":"expense"}
   ```

   **Para el ingreso:**
   ```
   ✅ Transcripción: Cobré $50,000 de mi trabajo
   ✅ Tipo detectado: INGRESO (keyword: cobré)
   ✅ Monto detectado (formato monetario $X,XXX): 50000 CLP
   🧠 Datos parseados: {"amount":50000,"description":"De mi trabajo","type":"income"}
   ```

---

## 🔍 LO QUE SE ARREGLÓ

### Antes (Código viejo):
```typescript
// Pattern 1: Números pequeños
const smallMatch = lowerText.match(/\b(\d{1,3})\b/);
if (smallMatch) {
  amount = parseInt(smallMatch[1]); // Detectaba "28" ❌
}

// Pattern 2: Formato monetario (NUNCA llegaba aquí)
const moneyMatch = text.match(/\$\s*(\d{1,3}(?:[.,]\d{3})+)/i);
```

**Problema:** El patrón de números pequeños capturaba "28" del "$28,000" y se detenía.

### Después (Código nuevo):
```typescript
// Pattern 0: Formato monetario $X,XXX (PRIORIDAD MÁXIMA)
const moneyFormatMatch = text.match(/\$\s*(\d{1,3}(?:[.,]\d{3})+)/i);
if (moneyFormatMatch) {
  const cleanNumber = moneyFormatMatch[1].replace(/[.,]/g, '');
  amount = parseInt(cleanNumber); // "$28,000" → 28000 ✅
}

// Pattern 6: Números pequeños (ÚLTIMA PRIORIDAD)
if (!amount) {
  const smallMatch = lowerText.match(/\b(\d{1,3})\b/);
  // Solo llega aquí si no hubo "$X,XXX"
}
```

**Solución:** Ahora verifica formatos monetarios PRIMERO, antes de números simples.

---

## 🧪 CASOS DE PRUEBA

Después de desplegar, prueba estos comandos:

| Comando | Tipo | Monto | Categoría | Necesidad |
|---------|------|-------|-----------|-----------|
| **GASTOS** |
| "Gasté $28,000 en una arepa" | expense | -$28,000 | Alimentación | essential |
| "Pagué taxi 15 mil pesos" | expense | -$15,000 | Transporte | important |
| "Compré en Jumbo $120,000" | expense | -$120,000 | Alimentación | essential |
| "Café 5 mil" | expense | -$5,000 | Restaurantes | discretionary |
| **INGRESOS** |
| "Cobré $50,000 de mi trabajo" | income | +$50,000 | Otros | discretionary |
| "Recibí sueldo $800,000" | income | +$800,000 | Otros | discretionary |
| "Me pagaron $120,000 honorarios" | income | +$120,000 | Otros | discretionary |
| "Propina $15,000" | income | +$15,000 | Otros | discretionary |

### 🎯 CATEGORÍAS Y NECESIDAD AUTOMÁTICAS

El parser reconoce estas categorías automáticamente:

#### ESENCIALES (essential):
- **Alimentación**: jumbo, lider, supermercado, arepa, empanada, pan, comida, frutas, verduras
- **Salud**: farmacia, doctor, hospital, medicamento, dentista
- **Servicios**: luz, agua, gas, arriendo, alquiler

#### IMPORTANTES (important):
- **Transporte**: uber, taxi, metro, bus, bencina
- **Educación**: colegio, universidad, libros, curso
- **Servicios**: internet, celular, teléfono

#### DISCRECIONALES (discretionary):
- **Restaurantes**: mcdonalds, café, pizza, starbucks
- **Ropa**: zapatos, falabella, zara, nike
- **Entretenimiento**: cine, teatro, parque
- **Suscripciones**: netflix, spotify, amazon

### 🗣️ PALABRAS CLAVE PARA NECESIDAD

Puedes decir el nivel de necesidad explícitamente:
- **"necesario"**, **"esencial"**, **"urgente"** → essential
- **"importante"** → important
- **"opcional"**, **"lujo"** → discretionary

**Ejemplo**: "Farmacia 12 mil urgente" → Se marca como essential

---

## ❗ PROBLEMAS COMUNES

### Problema 1: Sigue detectando $28 en lugar de $28,000

**Causa:** La función antigua aún está en caché

**Solución:**
1. Ve a: https://supabase.com/dashboard/project/yzakmqxbzwzbsdsadzej/functions
2. Click en `voice-to-transaction`
3. Verifica la fecha del último deploy (debe ser hoy)
4. Si es antigua, vuelve a hacer deploy

---

### Problema 2: No aparece nada en los logs

**Causa:** Estás viendo logs antiguos

**Solución:**
1. En la página de logs, click en el botón **"Refresh"** o **"Actualizar"**
2. Filtra por **"Last 1 hour"** o **"Última hora"**
3. Haz una nueva grabación y espera 5 segundos
4. Actualiza los logs nuevamente

---

### Problema 3: Error 500 al grabar

**Causa:** Error en el código desplegado

**Solución:**
1. Verifica que copiaste TODO el código de `CODIGO-VOICE-FINAL-CORREGIDO.ts`
2. Verifica que no hay errores de sintaxis (líneas rojas en el editor)
3. Si hay errores, copia el código de nuevo y despliega

---

## ✅ CHECKLIST FINAL

- [ ] Código copiado de `CODIGO-VOICE-FINAL-CORREGIDO.ts`
- [ ] Código pegado en Supabase Edge Functions
- [ ] Desplegado con botón "Deploy"
- [ ] Esperado 30-60 segundos
- [ ] Probado comando: "Gasté $28,000 en comida"
- [ ] Verificado que monto es $28,000 (NO $28.00)
- [ ] Verificado logs muestran "formato monetario $X,XXX"

---

## 🎯 RESULTADO ESPERADO

**Input de voz:**
```
"Hola, gasté $28,000 pesos en una arepa y una empanada"
```

**Transcripción de Whisper:**
```
✅ Transcripción: Hola, gasté $28,000 pesos en una arepa y una empanada.
```

**Parser (nuevo):**
```
✅ Monto detectado (formato monetario $X,XXX): 28000 CLP
🔍 Parseando: hola gasté una arepa y una empanada
📝 Descripción limpia: una arepa y una empanada
🏷️ Categoría detectada: Alimentación (keywords: arepa, empanada)
```

**Transacción creada:**
```json
{
  "amount": 28000,
  "description": "una arepa y una empanada",
  "category": "Alimentación",
  "currency": "CLP",
  "type": "expense"
}
```

**Visualización en dashboard:**
```
🍔 Alimentación
una arepa y una empanada
-$28,000 CLP ✅
```

---

## 📞 SI NECESITAS AYUDA

Si después de seguir estos pasos el problema persiste:

1. Comparte los logs de Supabase (las líneas con ✅ y 🔍)
2. Comparte qué dijiste exactamente
3. Comparte qué monto se guardó

---

**¡Listo para desplegar! 🚀**
