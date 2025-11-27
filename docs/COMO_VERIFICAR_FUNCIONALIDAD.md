# ✅ CÓMO VERIFICAR QUE BUDGETS Y IA ESTÁN FUNCIONANDO

## 🎯 VERIFICACIÓN RÁPIDA

### 1. ✅ VERIFICAR BUDGETS (PRESUPUESTOS)

#### Paso 1: Ir a la página de Presupuestos
1. Navega a `/dashboard/budgets` en tu aplicación
2. Deberías ver una lista de presupuestos (o un mensaje si no hay ninguno)

#### Paso 2: Crear un Presupuesto de Prueba
1. Haz clic en el botón "Nuevo Presupuesto" o "+"
2. Completa el formulario:
   - **Nombre**: "Prueba Presupuesto"
   - **Categoría**: Selecciona una categoría existente
   - **Monto**: $1000
   - **Período**: Mensual
3. Haz clic en "Guardar"

**✅ Si funciona correctamente:**
- El presupuesto aparece en la lista
- Puedes ver el porcentaje utilizado (0% si no hay gastos)
- El gráfico circular se muestra

**❌ Si NO funciona:**
- Error al guardar
- El presupuesto no aparece
- Error en consola del navegador

#### Paso 3: Verificar que los Budgets "Trabajan"
1. Ve a **Transacciones** (`/dashboard/transactions`)
2. Crea una transacción de **gasto** en la misma categoría del presupuesto
3. Vuelve a **Presupuestos** (`/dashboard/budgets`)

**✅ Si funciona correctamente:**
- El porcentaje utilizado aumenta
- El color cambia según el porcentaje:
  - Verde: < 70%
  - Amarillo: 70-90%
  - Naranja: 90-100%
  - Rojo: > 100%
- El monto gastado se actualiza

**❌ Si NO funciona:**
- El porcentaje no cambia
- El monto gastado sigue en $0
- No hay actualización automática

---

### 2. ✅ VERIFICAR IA EN REPORTES/ASISTENTE

#### Paso 1: Ir al Asistente IA
1. Navega a `/dashboard/ai-assistant` o `/dashboard/ai-assistant?topic=finance`
2. Deberías ver el chat del asistente

**✅ Si funciona correctamente:**
- Aparece el mensaje inicial: "Hola [tu nombre], qué gusto verte por aquí..."
- El input de mensaje está disponible
- No hay errores en consola

**❌ Si NO funciona:**
- Error al cargar
- Mensaje de error visible
- El input no funciona

#### Paso 2: Hacer una Pregunta de Prueba
1. Escribe en el chat: "¿Cuánto gasté este mes?"
2. Presiona Enter o haz clic en enviar

**✅ Si funciona correctamente:**
- El mensaje aparece en el chat
- Aparece un indicador de "escribiendo..."
- La IA responde con datos reales de tus transacciones
- La respuesta es en español, cálida y empática
- **NO inventa datos** - solo usa datos reales

**❌ Si NO funciona:**
- Error al enviar
- No hay respuesta
- La IA inventa datos que no existen
- Error en consola del navegador

#### Paso 3: Verificar que la IA Usa Datos Reales
1. Crea algunas transacciones de prueba:
   - Gasto de $50 en "Comida"
   - Gasto de $30 en "Transporte"
   - Ingreso de $1000
2. Ve al Asistente IA
3. Pregunta: "¿Cuánto gasté en comida este mes?"

**✅ Si funciona correctamente:**
- La IA responde con el monto exacto: "$50"
- Menciona la categoría correcta
- No inventa números

**❌ Si NO funciona:**
- La IA inventa números
- Dice "aproximadamente" sin datos reales
- No menciona tus transacciones reales

---

## 🔍 VERIFICACIÓN TÉCNICA (CONSOLA DEL NAVEGADOR)

### Abrir Consola del Navegador
- **Chrome/Edge**: `F12` o `Ctrl+Shift+I` (Windows) / `Cmd+Option+I` (Mac)
- **Firefox**: `F12` o `Ctrl+Shift+K`
- Pestaña: **Console**

### Verificar Budgets

#### 1. Verificar que se cargan los budgets
```javascript
// En la consola, ejecuta:
// Deberías ver logs de carga de datos
```

**Busca en la consola:**
- ✅ `"Loading budgets..."` o similar
- ✅ No hay errores rojos relacionados con `budgets`
- ✅ No hay errores de `useFinance`

#### 2. Verificar creación de budget
1. Crea un presupuesto
2. En la consola deberías ver:
   - ✅ `"Éxito"` o `"Budget created"`
   - ❌ NO deberías ver errores de `insert` o `RLS`

#### 3. Verificar cálculo de gastos
1. Crea una transacción en la categoría del presupuesto
2. En la consola deberías ver:
   - ✅ Actualización de datos
   - ✅ Cálculo de porcentaje

### Verificar IA

#### 1. Verificar que se carga el servicio de IA
**Busca en la consola:**
- ✅ No hay errores de `ai-service.js`
- ✅ No hay errores de `DEEPSEEK_API_KEY` o `QWEN_API_KEY`
- ✅ No hay errores de `sendMessageToAI`

#### 2. Verificar que se envían datos reales
1. Abre la pestaña **Network** en la consola
2. Envía un mensaje al asistente
3. Busca la petición a la API de IA

**Deberías ver:**
- ✅ Request con `messages` que incluyen contexto financiero
- ✅ Contexto con transacciones reales
- ✅ No hay errores 401/403/500

#### 3. Verificar respuesta de la IA
**En la consola deberías ver:**
- ✅ Respuesta exitosa de la API
- ✅ Mensaje procesado correctamente
- ❌ NO deberías ver errores de parsing o timeout

---

## 🐛 PROBLEMAS COMUNES Y SOLUCIONES

### ❌ Budgets no se crean

**Síntomas:**
- Error al guardar presupuesto
- Mensaje "Error al crear presupuesto"

**Soluciones:**
1. Verificar que tienes categorías creadas
2. Verificar políticas RLS en Supabase
3. Verificar que estás autenticado
4. Revisar consola para error específico

### ❌ Budgets no calculan gastos

**Síntomas:**
- Porcentaje siempre en 0%
- Monto gastado siempre en $0

**Soluciones:**
1. Verificar que las transacciones tienen `category_id` correcto
2. Verificar que las transacciones están en el período del presupuesto
3. Verificar que las transacciones son de tipo `expense`
4. Revisar la lógica de cálculo en `Budgets.jsx`

### ❌ IA no responde

**Síntomas:**
- El mensaje se envía pero no hay respuesta
- Indicador de "escribiendo..." infinito

**Soluciones:**
1. Verificar API keys en `.env`:
   - `VITE_DEEPSEEK_API_KEY`
   - `VITE_QWEN_API_KEY`
2. Verificar conexión a internet
3. Revisar consola para errores de API
4. Verificar que las API keys son válidas

### ❌ IA inventa datos

**Síntomas:**
- La IA menciona montos que no existen
- Dice "aproximadamente" sin datos reales

**Soluciones:**
1. Verificar que `useFinance` está cargando transacciones
2. Verificar que el contexto se envía correctamente
3. Revisar `AIAssistant.jsx` línea 161-220 (construcción de contexto)
4. Verificar que hay transacciones reales en la base de datos

---

## ✅ CHECKLIST DE VERIFICACIÓN

### Budgets
- [ ] Puedo ver la página de presupuestos
- [ ] Puedo crear un presupuesto nuevo
- [ ] El presupuesto aparece en la lista
- [ ] Puedo editar un presupuesto
- [ ] Puedo eliminar un presupuesto
- [ ] El porcentaje se calcula correctamente
- [ ] El color cambia según el porcentaje
- [ ] Los gastos se actualizan cuando creo transacciones
- [ ] No hay errores en consola

### IA/Asistente
- [ ] Puedo ver el chat del asistente
- [ ] El mensaje inicial aparece
- [ ] Puedo escribir y enviar mensajes
- [ ] La IA responde a mis preguntas
- [ ] Las respuestas son en español
- [ ] Las respuestas son cálidas y empáticas
- [ ] La IA usa datos reales de mis transacciones
- [ ] La IA NO inventa datos
- [ ] No hay errores en consola
- [ ] No hay errores de API

---

## 🎯 PRUEBA RÁPIDA (2 MINUTOS)

1. **Crear Budget de Prueba** (30 seg)
   - Ve a `/dashboard/budgets`
   - Crea presupuesto: "Prueba" - $1000 - Categoría "Comida"

2. **Crear Transacción** (30 seg)
   - Ve a `/dashboard/transactions`
   - Crea gasto: $200 - Categoría "Comida"

3. **Verificar Budget** (30 seg)
   - Vuelve a `/dashboard/budgets`
   - Deberías ver 20% utilizado

4. **Probar IA** (30 seg)
   - Ve a `/dashboard/ai-assistant`
   - Pregunta: "¿Cuánto gasté en comida?"
   - Debería responder: "$200" (o el monto real)

**✅ Si todo funciona:** ¡Todo está bien configurado!
**❌ Si algo falla:** Revisa la sección de "Problemas Comunes" arriba

---

## 📞 SI NECESITAS AYUDA

Si después de seguir esta guía algo no funciona:

1. **Revisa la consola del navegador** para errores específicos
2. **Revisa los logs de Supabase** en el dashboard
3. **Verifica las variables de entorno** en `.env`
4. **Contacta al equipo de desarrollo** con:
   - Screenshot del error
   - Mensaje de error de la consola
   - Pasos para reproducir el problema

---

**✅ Con esta guía puedes verificar rápidamente que todo funciona correctamente**

