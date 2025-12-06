# 🔴 ANÁLISIS CRÍTICO: IA Inventando Datos Financieros

## 📋 Problema Reportado

La IA está **inventando respuestas** sobre gastos que no existen:
1. Dijo que no había gastos cuando sí los había
2. Mencionó gastos en "transporte" que no existen
3. Está dando respuestas genéricas en lugar de basarse en datos reales

**Esto es una VIOLACIÓN ÉTICA GRAVE** - La IA NO debe inventar datos financieros.

---

## 🔍 Análisis del Problema

### Problema Raíz Identificado

**La IA NO está recibiendo los datos de transacciones del usuario.**

#### Flujo Actual (INCORRECTO):

```
AIAssistant.jsx (línea 151)
  ↓ Obtiene transacciones: const { transactions } = useFinance(user?.id)
  ↓ PERO NO las pasa a la IA
  ↓
sendMessageToAI(contextMessages) (línea 242)
  ↓ Solo envía mensajes, SIN transacciones
  ↓
Edge Function ai-assistant/index.ts
  ↓ Recibe solo mensajes
  ↓ NO consulta Supabase para obtener transacciones
  ↓
IA responde SIN DATOS REALES
  ↓ INVENTA respuestas
```

#### Archivos Afectados:

1. **`src/pages/dashboard/AIAssistant.jsx` (línea 242)**
   - Obtiene `transactions` pero NO los pasa a `sendMessageToAI`
   - Solo envía `contextMessages` sin datos

2. **`src/lib/ai-service.js` (línea 24)**
   - Solo envía `{ messages }` a la Edge Function
   - No incluye transacciones ni userId

3. **`supabase/functions/ai-assistant/index.ts`**
   - Solo recibe `messages` del body
   - NO consulta Supabase para obtener transacciones del usuario
   - NO tiene acceso a datos reales

---

## ✅ Solución Propuesta

### Plan de Acción en 3 Fases

#### **FASE 1: Pasar Datos Reales a la IA (CRÍTICO)**

**1.1 Modificar `ai-service.js` para aceptar transacciones:**
```javascript
export const sendMessageToAI = async (messages, userId = null, transactions = null) => {
  const { data, error } = await supabase.functions.invoke('ai-assistant', {
    body: { 
      messages,
      userId,  // Para consultar transacciones en la Edge Function
      transactions  // Datos reales del usuario
    }
  });
  // ...
}
```

**1.2 Modificar `AIAssistant.jsx` para pasar transacciones:**
```javascript
const aiResponseText = await sendMessageToAI(
  contextMessages,
  user?.id,
  transactions  // ✅ Pasar transacciones reales
);
```

**1.3 Modificar Edge Function para recibir y usar transacciones:**
```typescript
const { messages, userId, transactions } = await req.json();

// Si no vienen transacciones, consultarlas desde Supabase
let userTransactions = transactions;
if (!userTransactions && userId) {
  const { data, error } = await supabase
    .from('transactions')
    .select('*, categories(name, icon, color)')
    .eq('user_id', userId)
    .order('date', { ascending: false })
    .limit(100);
  
  userTransactions = data || [];
}
```

#### **FASE 2: Reforzar System Prompt (CRÍTICO)**

**2.1 Agregar reglas más estrictas:**
```typescript
const SYSTEM_PROMPT = `
REGLA ABSOLUTA - VIOLACIÓN ÉTICA GRAVE:

🚫 PROHIBIDO INVENTAR DATOS:
- NUNCA menciones categorías de gastos que no estén en la lista de transacciones proporcionada
- NUNCA inventes montos, fechas o descripciones
- NUNCA asumas gastos que no estén explícitamente en los datos
- NUNCA uses palabras como "aproximadamente" o "alrededor de" con datos que no existan

✅ SI NO HAY DATOS:
- Di claramente: "No veo transacciones registradas en [período]"
- NO inventes categorías como "transporte" si no hay gastos en transporte
- NO asumas patrones que no estén en los datos

✅ VERIFICACIÓN OBLIGATORIA:
Antes de mencionar CUALQUIER gasto o categoría:
1. Verifica que exista en la lista de transacciones proporcionada
2. Si no existe, NO lo menciones
3. Si la lista está vacía, di que no hay datos

FORMATO DE DATOS QUE RECIBIRÁS:
{
  "transactions": [
    {
      "id": "...",
      "amount": 1500,
      "description": "Tomate",
      "date": "2025-12-06",
      "type": "expense",
      "categories": { "name": "Alimentación", "color": "#FF5733" }
    }
  ]
}

SOLO usa estos datos. NUNCA inventes.
`;
```

**2.2 Incluir transacciones en el contexto del mensaje:**
```typescript
const contextWithData = [
  { role: 'system', content: SYSTEM_PROMPT },
  {
    role: 'system',
    content: `DATOS REALES DEL USUARIO (SOLO USA ESTOS DATOS):
    
Transacciones recientes (${userTransactions.length} registros):
${JSON.stringify(userTransactions.slice(0, 20), null, 2)}

IMPORTANTE: Solo menciona gastos que estén en esta lista. Si no hay datos, di que no hay datos.`
  },
  ...messages
];
```

#### **FASE 3: Validación Post-Respuesta (IMPORTANTE)**

**3.1 Validar respuesta antes de enviarla:**
```typescript
// Después de obtener respuesta de IA
const aiResponse = data.choices[0].message.content;

// Validar que no mencione categorías que no existen
const mentionedCategories = extractCategoriesFromResponse(aiResponse);
const realCategories = userTransactions.map(t => t.categories?.name).filter(Boolean);

const invalidCategories = mentionedCategories.filter(cat => 
  !realCategories.includes(cat)
);

if (invalidCategories.length > 0) {
  console.error('⚠️ IA mencionó categorías que no existen:', invalidCategories);
  // Regenerar respuesta con advertencia
  return generateSafeResponse(userTransactions);
}
```

---

## 📝 Archivos a Modificar

### 1. `src/lib/ai-service.js`
- Agregar parámetros `userId` y `transactions`
- Pasar estos datos a la Edge Function

### 2. `src/pages/dashboard/AIAssistant.jsx`
- Modificar `handleSend` para pasar `user?.id` y `transactions`
- Asegurar que `transactions` esté disponible

### 3. `supabase/functions/ai-assistant/index.ts`
- Recibir `userId` y `transactions` del body
- Consultar transacciones desde Supabase si no vienen
- Incluir transacciones en el contexto del system prompt
- Reforzar reglas de no inventar datos
- Agregar validación post-respuesta

---

## 🎯 Prioridad

**CRÍTICO - Debe implementarse INMEDIATAMENTE**

La IA está dando información financiera incorrecta, lo cual puede:
- Confundir al usuario
- Generar desconfianza
- Causar decisiones financieras incorrectas
- Violar principios éticos de transparencia

---

## ✅ Checklist de Implementación

- [ ] Modificar `ai-service.js` para pasar transacciones
- [ ] Modificar `AIAssistant.jsx` para enviar transacciones
- [ ] Modificar Edge Function para recibir transacciones
- [ ] Consultar transacciones desde Supabase si no vienen
- [ ] Reforzar system prompt con reglas estrictas
- [ ] Incluir transacciones en contexto del mensaje
- [ ] Agregar validación post-respuesta
- [ ] Probar con datos reales
- [ ] Verificar que NO inventa categorías
- [ ] Verificar que dice "no hay datos" cuando no hay datos

---

**Fecha de Análisis:** 6 de Diciembre 2025
**Severidad:** 🔴 CRÍTICA
**Estado:** Pendiente de implementación

