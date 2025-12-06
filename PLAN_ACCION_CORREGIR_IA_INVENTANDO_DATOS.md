# ✅ PLAN DE ACCIÓN: Corregir IA Inventando Datos Financieros

## 🎯 Objetivo

**Eliminar completamente la capacidad de la IA para inventar datos financieros.** La IA debe SIEMPRE basarse en datos reales del usuario o decir claramente que no hay datos.

---

## ✅ Cambios Implementados

### 1. **Frontend: Pasar Datos Reales a la IA**

#### ✅ `src/lib/ai-service.js`
- **Modificado:** Función `sendMessageToAI` ahora acepta `userId` y `transactions`
- **Cambio:** Pasa estos datos a la Edge Function
- **Estado:** ✅ COMPLETADO

#### ✅ `src/pages/dashboard/AIAssistant.jsx`
- **Modificado:** `handleSend` ahora pasa `user?.id` y `transactions` a `sendMessageToAI`
- **Cambio:** La IA ahora recibe datos reales del usuario
- **Estado:** ✅ COMPLETADO

### 2. **Edge Function: Recibir y Usar Datos Reales**

#### ✅ `supabase/functions/ai-assistant/index.ts`
- **Modificado:** Recibe `userId` y `transactions` del body
- **Agregado:** Consulta transacciones desde Supabase si no vienen
- **Agregado:** Incluye transacciones en el contexto del system prompt
- **Reforzado:** System prompt con reglas más estrictas sobre no inventar
- **Estado:** ✅ COMPLETADO

---

## 📋 Checklist de Verificación

### Fase 1: Verificar Implementación
- [x] `ai-service.js` acepta y pasa `userId` y `transactions`
- [x] `AIAssistant.jsx` pasa `user?.id` y `transactions`
- [x] Edge Function recibe `userId` y `transactions`
- [x] Edge Function consulta Supabase si no hay transacciones
- [x] System prompt reforzado con reglas estrictas
- [x] Transacciones incluidas en contexto del mensaje

### Fase 2: Pruebas
- [ ] Probar con usuario que tiene transacciones
- [ ] Verificar que la IA menciona SOLO categorías que existen
- [ ] Probar con usuario SIN transacciones
- [ ] Verificar que la IA dice "no hay datos" en lugar de inventar
- [ ] Probar mencionando categorías que no existen
- [ ] Verificar que la IA NO menciona categorías inventadas

### Fase 3: Validación Post-Respuesta (Futuro)
- [ ] Implementar validación que detecte categorías inventadas
- [ ] Regenerar respuesta si se detectan datos inventados
- [ ] Logging de intentos de inventar datos

---

## 🚀 Próximos Pasos

### 1. Desplegar Edge Function
```bash
# Desde la raíz del proyecto
supabase functions deploy ai-assistant
```

### 2. Verificar Variables de Entorno en Supabase
Asegurar que la Edge Function tenga acceso a:
- `SUPABASE_URL` o `VITE_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `DEEPSEEK_API_KEY` (o `QWEN_API_KEY` o `OPENAI_API_KEY`)

### 3. Probar en Desarrollo
1. Abrir la aplicación en desarrollo
2. Ir a "Coach Financiero" (AI Assistant)
3. Preguntar: "¿En qué he gastado este mes?"
4. Verificar que:
   - Si hay transacciones: Menciona SOLO categorías que existen
   - Si NO hay transacciones: Dice claramente "no hay datos"

### 4. Monitorear Logs
Revisar logs de la Edge Function para verificar:
- Que se están recibiendo `userId` y `transactions`
- Que se están consultando transacciones desde Supabase si es necesario
- Que no hay errores en la consulta

---

## 🔍 Cómo Verificar que Funciona

### Test 1: Usuario con Transacciones
**Escenario:** Usuario tiene gastos en "Alimentación" pero NO en "Transporte"

**Pregunta:** "¿En qué he gastado este mes?"

**Respuesta Esperada:**
- ✅ Menciona "Alimentación" (existe)
- ❌ NO menciona "Transporte" (no existe)
- ✅ Si no hay datos en una categoría, NO la menciona

### Test 2: Usuario SIN Transacciones
**Escenario:** Usuario no tiene transacciones registradas

**Pregunta:** "¿En qué he gastado este mes?"

**Respuesta Esperada:**
- ✅ Dice claramente: "No veo transacciones registradas este mes"
- ❌ NO inventa categorías como "comida" o "transporte"
- ❌ NO menciona montos aproximados

### Test 3: Verificación de Datos Reales
**Escenario:** Usuario tiene exactamente 1 transacción: "Tomate" en "Alimentación" por $1,500

**Pregunta:** "¿En qué he gastado?"

**Respuesta Esperada:**
- ✅ Menciona "Alimentación" (existe)
- ✅ Menciona "Tomate" o similar (existe)
- ✅ Menciona $1,500 o similar (existe)
- ❌ NO menciona otras categorías
- ❌ NO menciona otros montos

---

## 📝 Notas Técnicas

### Variables de Entorno Requeridas

**En Supabase Dashboard → Edge Functions → Secrets:**
```
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key
DEEPSEEK_API_KEY=tu_deepseek_key (o QWEN_API_KEY o OPENAI_API_KEY)
```

### Estructura de Datos Esperada

**Transacciones que se pasan a la IA:**
```json
[
  {
    "id": "uuid",
    "amount": 1500,
    "description": "Tomate",
    "date": "2025-12-06",
    "type": "expense",
    "categories": {
      "name": "Alimentación",
      "color": "#FF5733"
    }
  }
]
```

---

## ⚠️ Advertencias

1. **NO modificar el system prompt para hacerlo más permisivo** - Las reglas estrictas son intencionales
2. **NO remover la validación de datos** - Es crítica para prevenir inventar datos
3. **SIEMPRE verificar que las transacciones se están pasando correctamente** - Revisar logs

---

## 🐛 Troubleshooting

### Problema: La IA sigue inventando datos
**Solución:**
1. Verificar que `transactions` se está pasando desde `AIAssistant.jsx`
2. Verificar logs de la Edge Function para ver si recibe transacciones
3. Verificar que el system prompt incluye las transacciones en el contexto

### Problema: La IA dice "no hay datos" cuando sí hay
**Solución:**
1. Verificar que `useFinance` está retornando transacciones
2. Verificar que `transactions` no está vacío en `AIAssistant.jsx`
3. Revisar logs de la Edge Function para ver qué datos recibe

### Problema: Error al consultar Supabase desde Edge Function
**Solución:**
1. Verificar que `SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY` están configurados
2. Verificar que la Edge Function tiene permisos para consultar la tabla `transactions`
3. Revisar logs de la Edge Function para ver el error específico

---

**Fecha de Implementación:** 6 de Diciembre 2025
**Estado:** ✅ Implementación Completa - Pendiente de Pruebas

