# ✅ CHECKLIST: REPARACIONES SIMULADOR DE FUTURO

**Fecha de Creación:** 2025-01-27  
**Estado General:** 🔴 15 Críticas | 🟡 8 Importantes | 🟢 3 Menores  
**Progreso:** 7/26 tareas completadas (Fase 1: 7/7 ✅)

---

## 📋 INSTRUCCIONES DE USO

1. **Al comenzar una tarea:** Marca como `[EN PROGRESO]`
2. **Al completar:** Cambia a `[✅ COMPLETADO]` y agrega fecha
3. **Console.log obligatorio:** Cada corrección debe tener un `console.log` para verificar funcionamiento
4. **Formato del log:** `console.log('[SIMULADOR-FIX] [Tarea #X] Mensaje descriptivo:', datos)`

---

## 🔴 FASE 1: CORRECCIONES CRÍTICAS (Prioridad Alta)

### Tarea 1.1: Corregir Cálculo de Patrimonio Neto
- **Estado:** [✅ COMPLETADO] - 2025-01-27
- **Archivo:** `supabase/migrations/058_fix_simulador_futuro_fase1.sql`
- **Problema:** Patrimonio neto se calcula antes de actualizar `projected_debt` en escenario improved
- **Solución:** Reordenar cálculo para que `projected_debt` se calcule antes de `projected_net_worth`
- **Console.log requerido:**
  ```sql
  RAISE NOTICE '[SIMULADOR-FIX] [1.1] Patrimonio neto calculado: % (deuda: %, ahorros: %)', 
    projected_net_worth, projected_debt, projected_savings;
  ```
- **Verificación:** 
  - [x] Verificar que `projected_net_worth = current_savings + projected_savings - projected_debt`
  - [x] Probar con diferentes valores de deuda
  - [x] Verificar en logs que el cálculo es correcto
- **Notas:** Patrimonio neto ahora se calcula DESPUÉS de actualizar `projected_debt` en todos los escenarios

---

### Tarea 1.2: Corregir Cálculo de Flujo Mejorado
- **Estado:** [✅ COMPLETADO] - 2025-01-27
- **Archivo:** `supabase/migrations/058_fix_simulador_futuro_fase1.sql`
- **Problema:** `extra_savings` se suma al flujo causando doble contabilización
- **Solución:** Separar reducción de gastos de ahorro extra, calcular `projected_savings` correctamente
- **Console.log requerido:**
  ```sql
  RAISE NOTICE '[SIMULADOR-FIX] [1.2] Flujo mejorado: % (gastos: %, ingresos: %, extra: %)', 
    improved_flow, improved_expenses, improved_income, extra_savings;
  ```
- **Verificación:**
  - [x] Verificar que `improved_flow = improved_income - improved_expenses`
  - [x] Verificar que `projected_savings = (improved_flow * horizon_months) + (extra_savings * horizon_months)`
  - [x] Comparar valores antes/después en logs
- **Notas:** `extra_savings` ahora se suma después del cálculo del flujo, evitando doble contabilización

---

### Tarea 1.3: Corregir Validación de Ingresos Cero
- **Estado:** [✅ COMPLETADO] - 2025-01-27
- **Archivo:** `supabase/migrations/058_fix_simulador_futuro_fase1.sql`
- **Problema:** Valores hardcodeados (20000, 30000) sin considerar horizonte temporal
- **Solución:** Usar valores proporcionales al horizonte y validar `current_savings`
- **Console.log requerido:**
  ```sql
  RAISE NOTICE '[SIMULADOR-FIX] [1.3] Ingresos cero - Horizonte: % meses, Ajuste: %', 
    p_horizon_months, improved_patrimonio - actual_patrimonio;
  ```
- **Verificación:**
  - [x] Probar con horizonte 3, 6, 12, 24 meses
  - [x] Verificar que el ajuste es proporcional
  - [x] Validar que `current_savings` es suficiente
- **Notas:** Valores ahora son proporcionales: `20000 * horizon_months / 12` para improved, `30000 * horizon_months / 12` para worst_case

---

### Tarea 1.4: Corregir Cálculo de Deuda Proyectada (Worst Case)
- **Estado:** [✅ COMPLETADO] - 2025-01-27
- **Archivo:** `supabase/migrations/058_fix_simulador_futuro_fase1.sql`
- **Problema:** Fórmula `ABS(LEAST(0, projected_savings))` no captura déficit mensual acumulado
- **Solución:** Calcular deuda basada en déficit mensual acumulado
- **Console.log requerido:**
  ```sql
  RAISE NOTICE '[SIMULADOR-FIX] [1.4] Worst case - Flujo: %, Déficit acumulado: %, Deuda: %', 
    worst_case_flow, ABS(worst_case_flow * p_horizon_months), projected_debt;
  ```
- **Verificación:**
  - [x] Verificar que si `worst_case_flow < 0`, la deuda aumenta
  - [x] Verificar que la deuda es proporcional al déficit
  - [x] Probar con diferentes valores de flujo negativo
- **Notas:** Deuda ahora se calcula como `current_debt + ABS(worst_case_flow * horizon_months)` cuando hay déficit

---

### Tarea 1.5: Corregir Garantía de Escenarios
- **Estado:** [✅ COMPLETADO] - 2025-01-27
- **Archivo:** `supabase/migrations/058_fix_simulador_futuro_fase1.sql`
- **Problema:** Si `actual_patrimonio` es negativo, el mejorado puede seguir siendo negativo
- **Solución:** Asegurar que improved siempre sea mejor en términos absolutos
- **Console.log requerido:**
  ```sql
  RAISE NOTICE '[SIMULADOR-FIX] [1.5] Garantía - Actual: %, Mejorado: %, Diferencia: %', 
    actual_patrimonio, improved_patrimonio, improved_patrimonio - actual_patrimonio;
  ```
- **Verificación:**
  - [x] Verificar que `improved_patrimonio > actual_patrimonio` siempre
  - [x] Probar con patrimonio negativo
  - [x] Verificar que la diferencia es al menos 10% (o 15% si es negativo)
- **Notas:** Maneja correctamente patrimonio negativo: si actual es negativo, improved es 15% menos negativo

---

### Tarea 1.6: Agregar Validaciones en Frontend
- **Estado:** [✅ COMPLETADO] - 2025-01-27
- **Archivo:** `src/pages/dashboard/FutureSelf.jsx`
- **Problema:** No valida si `projected_net_worth` es `null`, `undefined`, o `NaN`
- **Solución:** Agregar validaciones antes de renderizar
- **Console.log requerido:**
  ```javascript
  console.log('[SIMULADOR-FIX] [1.6] Validando escenario:', {
    scenario_type: scenario.scenario_type,
    projected_net_worth: scenario.projected_net_worth,
    isValid: !isNaN(scenario.projected_net_worth) && scenario.projected_net_worth !== null
  });
  ```
- **Verificación:**
  - [x] Probar con valores `null`, `undefined`, `NaN`
  - [x] Verificar que se muestran fallbacks correctos
  - [x] Verificar en consola que las validaciones funcionan
- **Notas:** Agregadas validaciones para `projected_net_worth`, `projected_savings`, y `projected_debt` con fallback a 0

---

### Tarea 1.7: Corregir Cálculo de Deuda Proyectada (Improved)
- **Estado:** [✅ COMPLETADO] - 2025-01-27
- **Archivo:** `supabase/migrations/058_fix_simulador_futuro_fase1.sql`
- **Problema:** Usa `projected_savings * 0.2` (total) en lugar de ahorro mensual
- **Solución:** Usar ahorro mensual y limitar pago de deuda al monto disponible
- **Console.log requerido:**
  ```sql
  RAISE NOTICE '[SIMULADOR-FIX] [1.7] Improved deuda - Ahorro mensual: %, Pago deuda: %, Deuda final: %', 
    monthly_savings, debt_payment, projected_debt;
  ```
- **Verificación:**
  - [x] Verificar que usa ahorro mensual, no total
  - [x] Verificar que `projected_debt <= current_debt`
  - [x] Verificar que no paga más deuda de la que tiene
- **Notas:** Ahora calcula `monthly_savings = projected_savings / horizon_months`, luego `debt_payment = (monthly_savings * 0.2) * horizon_months`, limitado a `current_debt`

---

## 🟡 FASE 2: CORRECCIONES IMPORTANTES (Prioridad Media)

### Tarea 2.1: Unificar Formato de Moneda
- **Estado:** ⬜ PENDIENTE
- **Archivo:** `supabase/functions/future-self-simulator/index.ts`
- **Problema:** `formatCurrency` solo maneja CLP hardcodeado
- **Solución:** Pasar `currency` como parámetro y usar función unificada
- **Console.log requerido:**
  ```typescript
  console.log('[SIMULADOR-FIX] [2.1] Formateando moneda:', { amount, currency, formatted: formatCurrency(amount, currency) });
  ```
- **Verificación:**
  - [ ] Probar con CLP, USD, EUR
  - [ ] Verificar formato correcto en frontend
  - [ ] Verificar consistencia entre Edge Function y frontend

---

### Tarea 2.2: Agregar Validación de Datos Mínimos
- **Estado:** ⬜ PENDIENTE
- **Archivo:** `supabase/functions/future-self-simulator/index.ts`
- **Problema:** No valida si hay al menos 3 meses de transacciones
- **Solución:** Validar antes de calcular y retornar error claro
- **Console.log requerido:**
  ```typescript
  console.log('[SIMULADOR-FIX] [2.2] Validando datos mínimos:', { 
    monthsBack, 
    hasEnoughData: monthsBack >= 3,
    metrics 
  });
  ```
- **Verificación:**
  - [ ] Probar con menos de 3 meses de datos
  - [ ] Verificar que retorna error claro
  - [ ] Verificar que no calcula con datos insuficientes

---

### Tarea 2.3: Mejorar Manejo de Cache
- **Estado:** ⬜ PENDIENTE
- **Archivo:** `src/hooks/useFutureSelf.js`
- **Problema:** Cache no se invalida automáticamente después de X tiempo
- **Solución:** Agregar timestamp de expiración (24 horas)
- **Console.log requerido:**
  ```javascript
  console.log('[SIMULADOR-FIX] [2.3] Validando cache:', {
    hasCache: !!data,
    calculatedAt: data?.calculated_at,
    isExpired: isCacheExpired(data?.calculated_at),
    willUseCache: !isExpired
  });
  ```
- **Verificación:**
  - [ ] Verificar que cache expira después de 24 horas
  - [ ] Verificar que se recalcula automáticamente
  - [ ] Verificar en consola el estado del cache

---

### Tarea 2.4: Agregar Validación de Horizonte
- **Estado:** [✅ COMPLETADO] - 2025-01-27
- **Archivo:** `src/pages/dashboard/FutureSelf.jsx`
- **Problema:** No valida que `horizonMonths` esté en lista permitida
- **Solución:** Validar y resetear a valor válido si es inválido
- **Console.log requerido:**
  ```javascript
  console.log('[SIMULADOR-FIX] [2.4] Validando horizonte:', {
    horizonMonths,
    isValid: [3, 6, 12, 24].includes(horizonMonths),
    willReset: !isValid
  });
  ```
- **Verificación:**
  - [x] Probar con valores inválidos (1, 2, 5, 13, 25)
  - [x] Verificar que se resetea a 12
  - [x] Verificar en consola la validación
- **Notas:** Validación agregada con `useEffect` para evitar loops infinitos, resetea automáticamente a 12 si es inválido

---

### Tarea 2.5: Mejorar Logging
- **Estado:** ⬜ PENDIENTE
- **Archivo:** Múltiples (Edge Function y Frontend)
- **Problema:** Logs básicos, no hay logs de errores detallados
- **Solución:** Agregar logs detallados en puntos clave
- **Console.log requerido:**
  ```typescript
  // Edge Function
  console.log('[SIMULADOR-FIX] [2.5] Calculando escenario:', {
    scenarioType,
    horizonMonths,
    metrics,
    timestamp: new Date().toISOString()
  });
  
  // Frontend
  console.log('[SIMULADOR-FIX] [2.5] Error en cálculo:', {
    error: err.message,
    stack: err.stack,
    scenarioType,
    horizonMonths
  });
  ```
- **Verificación:**
  - [ ] Verificar logs en Edge Function
  - [ ] Verificar logs en frontend
  - [ ] Verificar que errores se loguean correctamente

---

### Tarea 2.6: Corregir Cálculo de Monthly Income/Expenses
- **Estado:** ⬜ PENDIENTE
- **Archivo:** `supabase/functions/future-self-simulator/index.ts`
- **Problema:** División puede ser incorrecta si `horizon_months` cambia
- **Solución:** Asegurar que `projected_income` y `projected_expenses` son totales antes de dividir
- **Console.log requerido:**
  ```typescript
  console.log('[SIMULADOR-FIX] [2.6] Calculando valores mensuales:', {
    projected_income_total: existing.projected_income,
    horizon_months,
    monthly_income: existing.projected_income / horizon_months,
    projected_expenses_total: existing.projected_expenses,
    monthly_expenses: existing.projected_expenses / horizon_months
  });
  ```
- **Verificación:**
  - [ ] Verificar que los valores mensuales son correctos
  - [ ] Probar con diferentes horizontes
  - [ ] Verificar en logs que la división es correcta

---

### Tarea 2.7: Corregir Filtrado de Recomendaciones Genéricas
- **Estado:** ⬜ PENDIENTE
- **Archivo:** `supabase/functions/future-self-simulator/index.ts`
- **Problema:** Lógica confusa puede eliminar recomendaciones válidas
- **Solución:** Simplificar y corregir la lógica de filtrado
- **Console.log requerido:**
  ```typescript
  console.log('[SIMULADOR-FIX] [2.7] Filtrando recomendaciones:', {
    total: personalizedRecommendations.length,
    filtered: finalActions.length,
    removed: personalizedRecommendations.length - finalActions.length,
    removedItems: personalizedRecommendations.filter(a => !finalActions.includes(a))
  });
  ```
- **Verificación:**
  - [ ] Verificar que no se eliminan recomendaciones válidas
  - [ ] Verificar que se eliminan recomendaciones genéricas
  - [ ] Verificar en logs qué se filtra y por qué

---

### Tarea 2.8: Agregar Validación de Recomendaciones Personalizadas
- **Estado:** ⬜ PENDIENTE
- **Archivo:** `supabase/functions/future-self-simulator/index.ts`
- **Problema:** No valida si datos de `insights` son válidos
- **Solución:** Validar antes de generar recomendaciones
- **Console.log requerido:**
  ```typescript
  console.log('[SIMULADOR-FIX] [2.8] Validando insights:', {
    hasInsights: !!insights,
    hasSavingOpportunities: !!(insights?.saving_opportunities?.length),
    hasTopCategories: !!(insights?.top_categories?.length),
    isValid: validateInsights(insights)
  });
  ```
- **Verificación:**
  - [ ] Probar con `insights` null/undefined
  - [ ] Probar con datos inválidos (NaN, null)
  - [ ] Verificar que no genera recomendaciones inválidas

---

## 🟢 FASE 3: MEJORAS UX (Prioridad Baja)

### Tarea 3.1: Agregar Feedback de Progreso
- **Estado:** ⬜ PENDIENTE
- **Archivo:** `src/pages/dashboard/FutureSelf.jsx`
- **Problema:** Solo muestra spinner genérico
- **Solución:** Mostrar qué escenario se está calculando
- **Console.log requerido:**
  ```javascript
  console.log('[SIMULADOR-FIX] [3.1] Mostrando progreso:', {
    currentScenario: scenarioType,
    totalScenarios: 3,
    progress: (currentIndex / 3) * 100
  });
  ```
- **Verificación:**
  - [ ] Verificar que se muestra progreso
  - [ ] Verificar que indica qué escenario se calcula
  - [ ] Verificar en consola el progreso

---

### Tarea 3.2: Mejorar Mensajes de Error
- **Estado:** ⬜ PENDIENTE
- **Archivo:** `src/pages/dashboard/FutureSelf.jsx`
- **Problema:** Mensajes de error genéricos
- **Solución:** Mensajes específicos y accionables
- **Console.log requerido:**
  ```javascript
  console.log('[SIMULADOR-FIX] [3.2] Mostrando error:', {
    errorType: getErrorType(error),
    message: getErrorMessage(error),
    suggestion: getErrorSuggestion(error)
  });
  ```
- **Verificación:**
  - [ ] Probar diferentes tipos de error
  - [ ] Verificar que mensajes son claros
  - [ ] Verificar que incluyen sugerencias

---

### Tarea 3.3: Agregar Animaciones
- **Estado:** ⬜ PENDIENTE
- **Archivo:** `src/pages/dashboard/FutureSelf.jsx`
- **Problema:** No hay feedback visual al cambiar horizonte
- **Solución:** Agregar animaciones y transiciones
- **Console.log requerido:**
  ```javascript
  console.log('[SIMULADOR-FIX] [3.3] Cambiando horizonte:', {
    oldHorizon: prevHorizon,
    newHorizon: horizonMonths,
    willAnimate: true
  });
  ```
- **Verificación:**
  - [ ] Verificar animaciones al cambiar horizonte
  - [ ] Verificar transiciones suaves
  - [ ] Verificar en consola el cambio

---

## 📊 ESTADÍSTICAS DE PROGRESO

- **Total de Tareas:** 26
- **Completadas:** 8 (Fase 1: 7/7 ✅, Fase 2: 1/8)
- **En Progreso:** 0
- **Pendientes:** 18
- **Progreso:** 30.8%

---

## 🔍 CÓMO VERIFICAR LOS LOGS

### En Desarrollo (Frontend)
1. Abrir DevTools (F12)
2. Ir a la pestaña "Console"
3. Filtrar por `[SIMULADOR-FIX]`
4. Verificar que aparecen los logs esperados

### En Edge Function (Backend)
1. Ir a Supabase Dashboard
2. Edge Functions > future-self-simulator
3. Ver logs en tiempo real
4. Buscar `[SIMULADOR-FIX]`

### En SQL (Base de Datos)
1. Ir a Supabase Dashboard
2. SQL Editor
3. Ejecutar función y ver `RAISE NOTICE` en logs
4. Buscar `[SIMULADOR-FIX]`

---

## 📝 NOTAS

- Cada tarea debe tener su console.log antes de marcarse como completada
- Si una tarea requiere múltiples archivos, actualizar todos los logs
- Si una corrección afecta múltiples escenarios, verificar todos
- Siempre probar con datos reales después de cada corrección

---

**Última Actualización:** 2025-01-27  
**Próxima Revisión:** Después de completar Fase 1

