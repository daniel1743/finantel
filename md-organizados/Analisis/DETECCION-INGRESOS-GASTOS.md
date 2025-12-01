# 💰 Detección Automática: INGRESOS vs GASTOS

## 🎯 PROBLEMA SOLUCIONADO

**Antes:** Todo se guardaba como gasto (expense), incluso cuando decías "Cobré $50,000"

**Ahora:** El parser detecta automáticamente si es un ingreso o un gasto según las palabras clave

---

## 🔍 CÓMO FUNCIONA

El parser revisa el comando de voz y busca palabras clave específicas:

### ✅ INGRESOS (income) - Se muestra como +$X,XXX

Si dices alguna de estas palabras:
- **cobré**, cobro
- **recibí**, recebi
- **me pagaron**, me dieron
- **ingreso**, ganancia
- **sueldo**, salario
- **pago recibido**
- **transferencia recibida**, depósito
- **entrada**, gané
- **me transfirieron**
- **honorarios**, comisión, propina
- **reembolso**, devolución
- **venta**

**Resultado:** `type: 'income'` → Se muestra como ingreso (+$X,XXX) en verde

---

### ❌ GASTOS (expense) - Se muestra como -$X,XXX

Si dices alguna de estas palabras:
- **gasté**, gasto
- **pagué**, pago
- **compré**
- **di** (di dinero)
- **salida**, egresos
- **deduje**, transferí, envié
- **perdí**, multa, cargo
- **cuenta**

**Resultado:** `type: 'expense'` → Se muestra como gasto (-$X,XXX) en rojo

---

### ⚠️ POR DEFECTO

Si NO dices ninguna palabra clave:
- **Por defecto = GASTO** (expense)

**Ejemplo**: "Comida $50,000" → Se asume que es un gasto

---

## 🧪 EJEMPLOS DE USO

| Comando de Voz | Tipo Detectado | Monto Mostrado | Color |
|----------------|----------------|----------------|-------|
| "Cobré $50,000 de mi trabajo" | income | +$50,000 | 🟢 Verde |
| "Recibí $28,000 de propina" | income | +$28,000 | 🟢 Verde |
| "Me pagaron $120,000 del sueldo" | income | +$120,000 | 🟢 Verde |
| "Sueldo $800,000" | income | +$800,000 | 🟢 Verde |
| "Gasté $15,000 en comida" | expense | -$15,000 | 🔴 Rojo |
| "Pagué $50,000 de taxi" | expense | -$50,000 | 🔴 Rojo |
| "Compré café $5,000" | expense | -$5,000 | 🔴 Rojo |
| "Jumbo $120,000" | expense (por defecto) | -$120,000 | 🔴 Rojo |

---

## 🎤 FRASES COMPLETAS

### INGRESOS ✅

```
"Hola, cobré $50,000 pesos de mi trabajo"
→ Tipo: income
→ Monto: +$50,000
→ Descripción: "De mi trabajo"
→ Categoría: Otros (si no especificas)
```

```
"Recibí $28,000 de propina en el restaurant"
→ Tipo: income
→ Monto: +$28,000
→ Descripción: "De propina en el restaurant"
→ Categoría: Otros
```

```
"Sueldo $800,000 de enero"
→ Tipo: income
→ Monto: +$800,000
→ Descripción: "De enero"
→ Categoría: Otros
```

```
"Me pagaron $120,000 de honorarios"
→ Tipo: income
→ Monto: +$120,000
→ Descripción: "De honorarios"
→ Categoría: Otros
```

### GASTOS ❌

```
"Gasté $28,000 en una arepa y una empanada"
→ Tipo: expense
→ Monto: -$28,000
→ Descripción: "Una arepa y una empanada"
→ Categoría: Alimentación
```

```
"Pagué $50,000 de taxi"
→ Tipo: expense
→ Monto: -$50,000
→ Descripción: "De taxi"
→ Categoría: Transporte
```

```
"Compré comida en Jumbo $120,000"
→ Tipo: expense
→ Monto: -$120,000
→ Descripción: "Comida en Jumbo"
→ Categoría: Alimentación
```

---

## 🔧 LOGS DE DEPURACIÓN

Cuando uses el micrófono, en los logs de Supabase verás:

### Ejemplo 1: Ingreso detectado
```
✅ Transcripción: Cobré $50,000 de mi trabajo
🔍 Parseando: Cobré $50,000 de mi trabajo
✅ Tipo detectado: INGRESO (keyword: cobré)
✅ Monto detectado (formato monetario $X,XXX): 50000 CLP
✅ Descripción detectada: De mi trabajo
🧠 Datos parseados: {"amount":50000,"description":"De mi trabajo","type":"income"}
```

### Ejemplo 2: Gasto detectado
```
✅ Transcripción: Gasté $28,000 en comida
🔍 Parseando: Gasté $28,000 en comida
✅ Tipo detectado: GASTO (keyword: gasté)
✅ Monto detectado (formato monetario $X,XXX): 28000 CLP
✅ Descripción detectada: En comida
✅ Categoría: Alimentación, Necesidad: essential (keyword: comida)
🧠 Datos parseados: {"amount":28000,"description":"En comida","category":"Alimentación","type":"expense"}
```

### Ejemplo 3: Sin palabra clave (por defecto = gasto)
```
✅ Transcripción: Jumbo $120,000
🔍 Parseando: Jumbo $120,000
⚠️ Tipo no especificado → Por defecto: GASTO
✅ Monto detectado (formato monetario $X,XXX): 120000 CLP
✅ Descripción detectada: Jumbo
✅ Categoría: Alimentación, Necesidad: essential (keyword: jumbo)
🧠 Datos parseados: {"amount":120000,"description":"Jumbo","category":"Alimentación","type":"expense"}
```

---

## 🎯 PRIORIDAD DE DETECCIÓN

El parser revisa en este orden:

1. **INGRESOS primero** - Si encuentra una palabra de ingreso, marca como income
2. **GASTOS después** - Si no es ingreso, busca palabras de gasto
3. **Por defecto** - Si no encuentra nada, asume que es gasto

**¿Por qué ingresos primero?**
- Es más específico decir "cobré" que "gasté"
- Evita confusiones con frases como "me dieron un descuento y gasté..."

---

## ⚠️ CASOS ESPECIALES

### Caso 1: Frase ambigua
```
"Me dieron $20,000 y gasté $15,000"
```
**Resultado:** INGRESO (porque "me dieron" se detecta primero)

**Solución:** Di dos comandos separados:
1. "Recibí $20,000"
2. "Gasté $15,000"

---

### Caso 2: Reembolso
```
"Reembolso de $50,000 por el seguro"
```
**Resultado:** INGRESO ✅
**Razón:** "Reembolso" está en la lista de palabras clave de ingreso

---

### Caso 3: Transferencia
```
"Transferí $100,000 a mi mamá"
```
**Resultado:** GASTO ✅
**Razón:** "Transferí" (transferencia enviada) está en la lista de gastos

VS.

```
"Transferencia recibida de $100,000"
```
**Resultado:** INGRESO ✅
**Razón:** "Transferencia recibida" está en la lista de ingresos

---

## 🚀 PRÓXIMOS PASOS

1. **Desplegar el código actualizado** (ver `INSTRUCCIONES-DEPLOY-PARSER-CORREGIDO.md`)
2. **Probar con comandos de ingreso**:
   - "Cobré $50,000"
   - "Recibí sueldo $800,000"
   - "Me pagaron $120,000"
3. **Verificar en el dashboard**:
   - Ingresos deben aparecer en verde con signo +
   - Gastos deben aparecer en rojo con signo -

---

## 📝 PERSONALIZACIÓN

¿Necesitas agregar más palabras clave?

### Para INGRESOS:
Agrega en la línea 44-50 de `CODIGO-VOICE-FINAL-CORREGIDO.ts`:
```typescript
const incomeKeywords = [
  'cobré', 'recibí', 'sueldo', // ... existentes
  'tu-palabra-aqui', // ← Agrega aquí
];
```

### Para GASTOS:
Agrega en la línea 53-57 de `CODIGO-VOICE-FINAL-CORREGIDO.ts`:
```typescript
const expenseKeywords = [
  'gasté', 'pagué', 'compré', // ... existentes
  'tu-palabra-aqui', // ← Agrega aquí
];
```

**Compárteme tus palabras personalizadas y las agrego antes de desplegar.**

---

## ✅ CHECKLIST

- [ ] Código actualizado con detección de ingresos/gastos
- [ ] Desplegado en Supabase Edge Functions
- [ ] Probado comando de ingreso: "Cobré $50,000"
- [ ] Probado comando de gasto: "Gasté $28,000"
- [ ] Verificado que ingresos aparecen en verde (+)
- [ ] Verificado que gastos aparecen en rojo (-)
- [ ] Revisado logs para confirmar tipo detectado

---

**¡Ahora tu app reconoce automáticamente ingresos y gastos! 🎉**
