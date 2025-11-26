# 🔮 FUTURE SELF SIMULATOR - Documentación Completa

## 📋 RESUMEN

El **Future Self Simulator** es un módulo que proyecta cómo estará la vida financiera del usuario en diferentes horizontes temporales (3, 6, 12, 24 meses) basándose en su comportamiento actual y diferentes escenarios.

---

## 🎯 FUNCIONALIDADES

### 1. **Cálculo de Escenarios**
- **Current Trend**: Proyección si continúa con sus hábitos actuales
- **Improved**: Proyección si mejora sus hábitos (reduce gastos no esenciales 30%)
- **Worst Case**: Proyección en escenario desafiante (ingresos -15%, gastos +10%)

### 2. **Horizontes Temporales**
- 3 meses
- 6 meses
- 12 meses
- 24 meses

### 3. **Resúmenes Generados por IA**
- Textos motivacionales personalizados
- Acciones sugeridas concretas
- Tono empático y alentador

---

## 📁 ARCHIVOS CREADOS

### Backend

1. **`supabase/migrations/044_future_self_simulator.sql`**
   - Tabla `future_self_scenarios`
   - Tabla `future_self_simulation_history`
   - Funciones SQL auxiliares
   - RLS policies

2. **`supabase/functions/future-self-simulator/index.ts`**
   - Edge Function principal
   - Lógica de cálculo de proyecciones
   - Integración con IA (DeepSeek, Qwen, OpenAI)
   - Sistema de cache

### Frontend

3. **`src/hooks/useFutureSelf.js`**
   - Hook React para consumir la Edge Function
   - Manejo de estado y cache
   - Función de refresh

4. **`src/pages/dashboard/FutureSelf.jsx`**
   - Componente principal de la vista
   - Selector de horizonte temporal
   - Cards de escenarios
   - Visualización de métricas

### Documentación

5. **`PROMPTS-FUTURE-SELF-AI.md`**
   - Ejemplos de prompts para IA
   - Configuración por modelo
   - Guías de tono y estilo

---

## 🚀 INSTALACIÓN Y CONFIGURACIÓN

### Paso 1: Aplicar Migración SQL

```bash
# Desde Supabase Dashboard
# SQL Editor → Pegar contenido de 044_future_self_simulator.sql → Ejecutar

# O desde CLI
supabase db push
```

### Paso 2: Desplegar Edge Function

```bash
supabase functions deploy future-self-simulator
```

### Paso 3: Configurar API Keys (Opcional)

Si quieres usar IA para generar resúmenes:

```
Supabase Dashboard → Settings → Edge Functions → Secrets

Agregar:
- DEEPSEEK_API_KEY=sk-xxxxx
- QWEN_API_KEY=sk-xxxxx (opcional)
- OPENAI_API_KEY=sk-xxxxx (opcional)
```

**Nota:** Si no configuras API keys, usará resúmenes por defecto (sin IA).

### Paso 4: Verificar Ruta

La ruta ya está agregada en `App.jsx`:
- `/dashboard/future-self`

Y el enlace en `Sidebar.jsx`:
- "Simulador de Futuro" en la sección "Inteligencia"

---

## 📊 ESTRUCTURA DE DATOS

### Tabla: `future_self_scenarios`

```sql
{
  id: UUID,
  user_id: UUID,
  horizon_months: 3 | 6 | 12 | 24,
  scenario_type: 'current_trend' | 'improved' | 'worst_case',
  projected_savings: NUMERIC,
  projected_debt: NUMERIC,
  projected_income: NUMERIC,
  projected_expenses: NUMERIC,
  projected_net_worth: NUMERIC,
  summary_text: TEXT,  // Generado por IA
  suggested_actions: JSONB,  // Acciones sugeridas
  input_metrics: JSONB,  // Métricas de entrada
  ai_model_used: TEXT,
  calculated_at: TIMESTAMPTZ
}
```

---

## 🔄 FLUJO DE FUNCIONAMIENTO

```
1. Usuario abre /dashboard/future-self
   ↓
2. Hook useFutureSelf se ejecuta
   ↓
3. Intenta cargar escenarios desde cache (BD)
   ↓
4. Si no hay cache, llama a Edge Function
   ↓
5. Edge Function:
   a. Calcula métricas actuales del usuario
   b. Calcula 3 proyecciones (current, improved, worst)
   c. Genera resúmenes con IA (o por defecto)
   d. Guarda en BD
   ↓
6. Frontend muestra los escenarios en cards
```

---

## 🎨 INTERFAZ DE USUARIO

### Componentes Visuales

1. **Selector de Horizonte**
   - Botones: 3, 6, 12, 24 meses
   - Cambia dinámicamente los escenarios

2. **Métricas Actuales**
   - Ingresos mensuales
   - Gastos mensuales
   - Ahorros actuales
   - Tasa de ahorro

3. **Cards de Escenarios**
   - 3 cards (una por escenario)
   - Color diferenciado por tipo
   - Patrimonio neto proyectado
   - Resumen generado por IA
   - Acciones sugeridas

---

## 🧮 LÓGICA DE CÁLCULO

### Escenario: Current Trend

```
projected_income = current_monthly_income × horizon_months
projected_expenses = current_monthly_expenses × horizon_months
projected_savings = (income - expenses) × horizon_months
projected_net_worth = current_savings + projected_savings - current_debt
```

### Escenario: Improved

```
projected_income = current_monthly_income × horizon_months
projected_expenses = (current_monthly_expenses - non_essential × 0.3) × horizon_months
projected_savings = (income - expenses) × horizon_months
projected_debt = current_debt - (projected_savings × 0.2)  // Usa 20% para pagar deuda
projected_net_worth = current_savings + projected_savings - projected_debt
```

### Escenario: Worst Case

```
projected_income = (current_monthly_income × 0.85) × horizon_months
projected_expenses = (current_monthly_expenses × 1.10) × horizon_months
projected_savings = (income - expenses) × horizon_months
projected_debt = current_debt + ABS(MIN(0, projected_savings))  // Si hay déficit, aumenta deuda
projected_net_worth = current_savings + projected_savings - projected_debt
```

---

## 🤖 INTEGRACIÓN CON IA

### Modelos Soportados (con fallback)

1. **DeepSeek R1** (Primary)
   - Más barato (~$0.0001 por llamada)
   - Buen razonamiento

2. **Qwen 2.5** (Fallback)
   - Alternativa económica
   - Buena calidad

3. **OpenAI GPT-4o Mini** (Last Resort)
   - Más caro (~$0.001)
   - Alta calidad

### Prompt Template

Ver `PROMPTS-FUTURE-SELF-AI.md` para ejemplos completos.

---

## 📈 MÉTRICAS Y ANÁLISIS

### Datos que se Analizan

- Promedio de ingresos (últimos 6 meses)
- Promedio de gastos (últimos 6 meses)
- Tasa de ahorro actual
- Gastos no esenciales
- Deuda actual (si existe)
- Ahorros acumulados

### Proyecciones Generadas

- Ahorros proyectados
- Deuda proyectada
- Patrimonio neto proyectado
- Ingresos proyectados
- Gastos proyectados

---

## 🔒 SEGURIDAD

### Row Level Security (RLS)

- Usuarios solo pueden ver sus propios escenarios
- Usuarios solo pueden insertar/actualizar sus propios escenarios
- Service role puede acceder a todo (para Edge Functions)

### Validaciones

- `horizon_months` solo acepta: 3, 6, 12, 24
- `scenario_type` solo acepta: current_trend, improved, worst_case
- Un usuario solo puede tener un escenario por tipo y horizonte (UNIQUE constraint)

---

## 🧪 TESTING

### Probar Manualmente

```bash
# 1. Invocar Edge Function
supabase functions invoke future-self-simulator \
  --body '{"user_id": "uuid-del-usuario", "horizon_months": 12}'

# 2. Ver logs
supabase functions logs future-self-simulator

# 3. Verificar en BD
SELECT * FROM future_self_scenarios WHERE user_id = 'uuid';
```

### Casos de Prueba

1. **Usuario sin transacciones**
   - Debe mostrar mensaje: "No hay datos suficientes"

2. **Usuario con 3+ meses de datos**
   - Debe calcular los 3 escenarios correctamente

3. **Cambio de horizonte**
   - Debe recalcular o cargar desde cache

4. **Refresh manual**
   - Debe forzar recálculo y actualizar

---

## 🐛 SOLUCIÓN DE PROBLEMAS

### Error: "No hay datos suficientes"

**Causa:** Usuario tiene menos de 3 meses de transacciones

**Solución:** El usuario necesita más transacciones históricas

### Error: "Error al calcular escenarios"

**Causa:** Error en Edge Function o falta de datos

**Solución:**
1. Verificar logs: `supabase functions logs future-self-simulator`
2. Verificar que existan transacciones del usuario
3. Verificar que la migración SQL se aplicó correctamente

### Los escenarios no se actualizan

**Causa:** Cache en BD

**Solución:** Usar botón "Recalcular" que fuerza `force_recalculate: true`

### Resúmenes no se generan con IA

**Causa:** API keys no configuradas o todos los modelos fallaron

**Solución:**
1. Verificar API keys en Supabase Dashboard
2. Verificar logs para ver qué modelo falló
3. El sistema usará resúmenes por defecto si IA falla

---

## 📚 PRÓXIMAS MEJORAS

### Funcionalidades Futuras

1. **Comparación con Realidad**
   - Cuando el usuario alcanza el horizonte, comparar proyección vs realidad
   - Guardar en `future_self_simulation_history`

2. **Escenarios Personalizados**
   - Permitir al usuario crear escenarios custom
   - Ej: "Si aumento ingresos 20%"

3. **Visualizaciones Avanzadas**
   - Gráficos de línea mostrando evolución
   - Comparación lado a lado de escenarios

4. **Metas Integradas**
   - Considerar metas activas del usuario
   - Mostrar si alcanzará sus metas en cada escenario

5. **Notificaciones Proactivas**
   - Alertar cuando el usuario se desvía del escenario "improved"
   - Recordatorios para mantener buenos hábitos

---

## 📞 SOPORTE

Si encuentras problemas:

1. Revisa los logs de la Edge Function
2. Verifica que la migración SQL se aplicó
3. Verifica que las API keys están configuradas (si usas IA)
4. Revisa la consola del navegador para errores del frontend

---

**Versión:** 1.0  
**Fecha:** 2025-01-15  
**Autor:** FINANTEL Team

