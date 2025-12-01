# 💰 EJEMPLO DE USO: Currency Formatter

## 📝 Resumen

El formateador de moneda asegura que los valores se muestren correctamente según el país del usuario:

- **Chile (CLP)**: `$30.000` (punto como separador de miles, sin decimales)
- **USA (USD)**: `$30,000.00` (coma como separador de miles, con decimales)
- **Colombia (COP)**: `$30.000` (punto como separador de miles, sin decimales)

---

## 🔧 Cómo usar en componentes React

### 1. Importar la utilidad

```javascript
import { formatCurrency, formatTransactionAmount } from '@/utils/currencyFormatter';
import { useUserCurrency } from '@/hooks/useUserCurrency';
```

### 2. Obtener moneda del usuario

```javascript
function MiComponente() {
  const { currency } = useUserCurrency(); // Obtiene 'CLP', 'USD', etc.

  const amount = 30000;

  return (
    <div>
      <p>Monto: {formatCurrency(amount, currency)}</p>
      {/* Chile: $30.000 */}
      {/* USA: $30,000.00 */}
    </div>
  );
}
```

### 3. Mostrar transacciones con signo +/-

```javascript
function TransactionList({ transactions }) {
  const { currency } = useUserCurrency();

  return (
    <div>
      {transactions.map(tx => (
        <div key={tx.id}>
          <span>{tx.description}</span>
          <span className={tx.type === 'income' ? 'text-green-600' : 'text-red-600'}>
            {formatTransactionAmount(tx.amount, tx.type, currency)}
          </span>
          {/* Gasto: -$30.000 */}
          {/* Ingreso: +$30.000 */}
        </div>
      ))}
    </div>
  );
}
```

---

## 📊 Ejemplos de Formatos por País

### Chile (CLP)
```javascript
formatCurrency(30000, 'CLP')        // → "$30.000"
formatCurrency(1500, 'CLP')         // → "$1.500"
formatCurrency(999, 'CLP')          // → "$999"

formatTransactionAmount(30000, 'expense', 'CLP') // → "-$30.000"
formatTransactionAmount(30000, 'income', 'CLP')  // → "+$30.000"
```

### USA (USD)
```javascript
formatCurrency(30000, 'USD')        // → "$30,000.00"
formatCurrency(1500.50, 'USD')      // → "$1,500.50"
formatCurrency(999, 'USD')          // → "$999.00"

formatTransactionAmount(30000, 'expense', 'USD') // → "-$30,000.00"
formatTransactionAmount(30000, 'income', 'USD')  // → "+$30,000.00"
```

### Colombia (COP)
```javascript
formatCurrency(30000, 'COP')        // → "$30.000"
formatCurrency(1500, 'COP')         // → "$1.500"
formatCurrency(999, 'COP')          // → "$999"
```

### México (MXN)
```javascript
formatCurrency(30000, 'MXN')        // → "$30,000.00"
formatCurrency(1500.50, 'MXN')      // → "$1,500.50"
```

### Europa (EUR)
```javascript
formatCurrency(30000, 'EUR')        // → "30.000,00 €"
formatCurrency(1500.50, 'EUR')      // → "1.500,50 €"
```

---

## 🎨 Formato Compacto (para gráficos)

```javascript
import { formatCompactCurrency } from '@/utils/currencyFormatter';

formatCompactCurrency(1500, 'CLP')      // → "$1.5k"
formatCompactCurrency(45000, 'CLP')     // → "$45k"
formatCompactCurrency(1200000, 'CLP')   // → "$1.2M"
```

---

## 🔄 Reemplazar código antiguo

### ❌ ANTES (formato incorrecto)
```javascript
// En DashboardHome.jsx, Analysis.jsx, etc.
const formatted = amount.toLocaleString('es-ES', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
});
// Problema: USA 'es-ES' (España) para todos los usuarios
// Resultado: $30.000,00 (incorrecto para Chile/USA)
```

### ✅ DESPUÉS (formato correcto)
```javascript
import { formatCurrency } from '@/utils/currencyFormatter';
import { useUserCurrency } from '@/hooks/useUserCurrency';

function MyComponent() {
  const { currency } = useUserCurrency();

  const formatted = formatCurrency(amount, currency);
  // Chile: $30.000
  // USA: $30,000.00
  // Correcto según el país del usuario
}
```

---

## 📁 Archivos que necesitan actualización

Estos archivos usan `.toLocaleString('es-ES')` y deben actualizarse:

1. ✅ `src/pages/dashboard/DashboardHome.jsx` (líneas 201, 1131, 1145, 1163, 1447)
2. ✅ `src/pages/dashboard/Analysis.jsx` (líneas 109, 457, 491)
3. ✅ `src/pages/dashboard/Budgets.jsx` (líneas 100, 101)
4. ✅ `src/components/VoiceInput.jsx` (línea 115)
5. ✅ `src/utils/exportUtils.js` (líneas 47-49)

---

## 🎯 Ejemplo completo: Actualizar DashboardHome.jsx

### ANTES
```javascript
// Línea 1131
value={`$${realData.totalIncome.toLocaleString('es-ES', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
})}`}
```

### DESPUÉS
```javascript
import { formatCurrency } from '@/utils/currencyFormatter';
import { useUserCurrency } from '@/hooks/useUserCurrency';

function DashboardHome() {
  const { currency } = useUserCurrency();

  // ...

  // Línea 1131
  value={formatCurrency(realData.totalIncome, currency)}

  // Línea 1447 (transacciones)
  amount: formatTransactionAmount(parseFloat(tx.amount || 0), tx.type, currency)
}
```

---

## 🚀 Próximos pasos

1. ✅ Crear `src/utils/currencyFormatter.js` (YA CREADO)
2. ⏳ Actualizar componentes que usan `.toLocaleString('es-ES')`
3. ⏳ Desplegar Edge Function actualizada
4. ⏳ Probar con diferentes monedas (CLP, USD, COP)

---

## 🎤 Ejemplo: Flujo completo de voz

```
Usuario (Chile) dice: "Compré harina por 23 mil pesos"

1. Whisper transcribe: "compré harina por 23 mil pesos"
2. Parser extrae: amount = 23000
3. ChatGPT categoriza:
   {
     type: "expense",
     description: "Harina",
     category: "Alimentación",
     necessity: "essential"
   }
4. Se guarda en DB:
   {
     amount: 23000,
     currency: "CLP",
     type: "expense",
     description: "Harina",
     category: "Alimentación",
     necessity_level: "essential"
   }
5. Se muestra en UI:
   Harina
   Categoría: Alimentación
   Necesidad: Muy necesario
   Valor: -$23.000 ← FORMATO CORRECTO CHILENO
```

---

## ✅ Ventajas del nuevo sistema

1. **Respeta el precio del usuario**: NO valida ni modifica montos
2. **Formato correcto por país**: Chile usa punto, USA usa coma
3. **Multimoneda**: Soporta 30+ monedas
4. **Diferencia ingreso/gasto**: Detecta automáticamente
5. **Categorización inteligente**: ChatGPT identifica categoría
6. **Centralizado**: Una función para formatear todo

---

## 💡 Tips

- Siempre usa `formatCurrency()` o `formatTransactionAmount()`
- NUNCA uses `.toLocaleString('es-ES')` directamente
- El hook `useUserCurrency()` obtiene automáticamente la moneda del perfil
- El Edge Function respeta el monto del usuario (sin validación)
