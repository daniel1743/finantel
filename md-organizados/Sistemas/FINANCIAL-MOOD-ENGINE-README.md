# 🎭 Financial Mood Engine - IMPLEMENTADO ✅

## 🎯 ¿Qué es?

El **Financial Mood Engine** detecta automáticamente el **"estado emocional financiero"** del usuario analizando sus patrones de gasto en las últimas 4-8 semanas.

---

## 🚀 QUICK START

### 1. Aplicar migración SQL
```bash
cd "C:\Users\Lenovo\Downloads\finantel version 2.1 funcional"
supabase db push
```

O ejecutar manualmente: `supabase/migrations/040_financial_mood_engine.sql`

### 2. Desplegar Edge Function
```bash
supabase functions deploy calculate-financial-mood
```

### 3. Agregar componente a tu Dashboard
```jsx
import FinancialMoodCard from '@/components/FinancialMoodCard';

function DashboardHome() {
  return (
    <div className="grid gap-6">
      <FinancialMoodCard />
    </div>
  );
}
```

### 4. Configurar OpenAI (opcional, para explicaciones IA)
```bash
# En .env
VITE_OPENAI_API_KEY=sk-xxx...
```

---

## 📊 8 ESTADOS POSIBLES

| Emoji | Estado | Score | Descripción |
|-------|--------|-------|-------------|
| 💰 | **Modo Ahorro** | 85-100 | Excelente salud financiera |
| 🎯 | **Disciplinado** | 80-84 | Siguiendo presupuestos |
| ✅ | **Estable** | 65-79 | Comportamiento saludable |
| 😌 | **Calmado** | 50-64 | Gastos bajo control |
| 🛍️ | **Impulsivo** | 35-49 | Muchos gastos no planificados |
| 😰 | **Estresado** | 35-49 | Superando presupuestos |
| 🚨 | **Descontrolado** | 20-34 | Múltiples señales de alarma |
| 🌱 | **Recuperación** | <20 | Mejorando después de crisis |

---

## 🔍 MÉTRICAS ANALIZADAS

El sistema analiza 11 métricas clave:

1. **Gastos impulsivos** → % gastos discrecionales
2. **Cumplimiento presupuestos** → % presupuestos respetados
3. **Tasa de ahorro** → % ahorro sobre ingresos
4. **Variación semanal** → Cambio $ semana a semana
5. **Transacciones nocturnas** → Compras 11pm-4am (gasto emocional)
6. **Gasto fin de semana** → % gasto sábado/domingo
7. **Volatilidad** → Consistencia de gastos
8. **Balance categorías** → ¿Una categoría domina?
9. **Racha disciplinada** → Días sin gastos innecesarios
10. **Promedio transacción** → Valor medio de gastos
11. **Total transacciones** → Actividad financiera

---

## ⚙️ CÓMO FUNCIONA

### Flujo:
```
Transacciones (4 semanas)
    ↓
Calcular métricas
    ↓
Aplicar 8 reglas configurables
    ↓
Score 0-100 + Mood Label
    ↓
Generar alertas
    ↓
IA explica en lenguaje humano
    ↓
Usuario ve su "mood"
```

### Ejemplo Real:

**Usuario con:**
- 45 transacciones
- 47% gastos impulsivos
- 85% cumplimiento presupuestos
- 8 transacciones nocturnas
- Ahorro: 12%

**Resultado:**
- Score: **52**
- Mood: **Impulsivo** 🛍️
- Explicación IA: _"Casi la mitad de tus gastos son compras no planificadas, especialmente de noche. Esto está afectando tu presupuesto. Prueba esperar 24h antes de comprar algo no esencial."_
- Alertas: `impulse_spike`, `emotional_spending`

---

## 📁 ARCHIVOS CREADOS

### Backend:
- ✅ `supabase/migrations/040_financial_mood_engine.sql` → Schema (3 tablas + 8 reglas)
- ✅ `supabase/functions/calculate-financial-mood/index.ts` → Edge Function

### Frontend:
- ✅ `src/components/FinancialMoodCard.jsx` → Componente React

### Documentación:
- ✅ `FINANCIAL-MOOD-ENGINE-DOCS.md` → Documentación completa (11 secciones)
- ✅ `PROMPTS-FINANCIAL-MOOD-AI.md` → Prompts para IA (8 casos + ejemplos)
- ✅ `FINANCIAL-MOOD-ENGINE-README.md` → Este archivo (resumen ejecutivo)

---

## 🎨 COMPONENTE UI

### Features:
- ✅ Emoji y color según mood
- ✅ Barra de progreso animada (score 0-100)
- ✅ Explicación generada por IA (OpenAI GPT-4o-mini)
- ✅ Top 3 razones del mood con impacto numérico
- ✅ Alertas activas (si las hay)
- ✅ Indicador de tendencia (mejorando/empeorando/estable)
- ✅ Botón "Recalcular" para forzar actualización
- ✅ Estados de carga y error
- ✅ Responsive design

### Preview:
```
┌────────────────────────────────────────┐
│  🛍️ Impulsivo          [Recalcular ↻] │
│  Estado financiero actual               │
│                                         │
│  Salud Financiera           52/100     │
│  ████████████░░░░░░░░░░░░               │
│                                         │
│  ✨ Explicación IA:                    │
│  "Casi la mitad de tus gastos son      │
│   compras no planificadas..."          │
│                                         │
│  PRINCIPALES FACTORES                   │
│  • -20  Gastos impulsivos muy altos    │
│  • -10  8 transacciones nocturnas      │
│  • +10  Cumpliendo 85% presupuestos    │
│                                         │
│  ⚠️ ALERTAS                             │
│  • Gastos impulsivos aumentaron 60%    │
│  • Detectadas 8 compras nocturnas      │
│                                         │
│  Tendencia: Empeorando                 │
└────────────────────────────────────────┘
```

---

## 🗄️ TABLAS CREADAS

### 1. `financial_mood_snapshots`
Snapshots diarios del mood del usuario.

**Campos clave:**
- `mood_label` → Estado emocional
- `score` → 0-100
- `reasons` → JSONB con factores
- `metrics` → JSONB con métricas calculadas
- `trend` → improving/declining/stable
- `alerts` → JSONB con alertas

### 2. `financial_mood_rules`
Reglas configurables para calcular mood.

**Reglas por defecto:**
1. Gastos impulsivos altos (-20 puntos)
2. Cumplimiento presupuestos (+15 puntos)
3. Tasa de ahorro buena (+10 puntos)
4. Volatilidad semanal alta (-15 puntos)
5. Transacciones nocturnas (-10 puntos)
6. Balance categorías (+5 puntos)
7. Gasto fin de semana excesivo (-12 puntos)
8. Racha disciplinada (+8 puntos)

### 3. `financial_mood_trends`
Agregados semanales/mensuales para tendencias.

---

## 🤖 IA EXPLICACIONES

El componente usa **OpenAI GPT-4o-mini** para generar explicaciones en lenguaje humano.

### Ejemplo de Prompt:
```
Eres un asesor financiero amigable.

El usuario tiene:
- Estado: "impulsivo"
- Score: 52/100
- Tendencia: empeorando

Factores:
- Gastos impulsivos muy altos (-20)
- 8 transacciones nocturnas (-10)
- Cumpliendo 85% presupuestos (+10)

Métricas:
- Gastos impulsivos: 47%
- Presupuestos cumplidos: 85%
- Ahorro: 12%

Explica en 2-3 frases qué significa y qué puede hacer.
```

### Respuesta IA:
> "Casi la mitad de tus gastos son compras no planificadas, especialmente de noche. Esto está afectando tu presupuesto. Prueba esperar 24 horas antes de comprar algo no esencial. Muchas veces el impulso pasa."

**Costo:** ~$0.001 USD por explicación

---

## 📡 API - Edge Function

### Endpoint:
```
POST https://[PROJECT].supabase.co/functions/v1/calculate-financial-mood
```

### Request:
```json
{
  "user_id": "uuid-del-usuario"
}
```

### Response:
```json
{
  "success": true,
  "mood": {
    "label": "impulsivo",
    "score": 52,
    "trend": "declining",
    "reasons": [
      {
        "factor": "impulse_percentage",
        "impact": -20,
        "description": "Gastos impulsivos muy altos (47%)"
      }
    ],
    "alerts": [
      {
        "type": "impulse_spike",
        "severity": "high",
        "message": "Gastos impulsivos aumentaron 60% esta semana"
      }
    ],
    "metrics": {
      "total_transactions": 45,
      "impulse_percentage": 47.0,
      "budget_compliance": 85.0,
      "saving_rate": 12.0
    }
  }
}
```

---

## 🔄 CRON JOB (Opcional)

Para calcular mood automáticamente cada día a las 2am:

```sql
SELECT cron.schedule(
  'calculate-daily-moods',
  '0 2 * * *',
  $$
  SELECT net.http_post(
    url := 'https://[PROJECT].supabase.co/functions/v1/calculate-financial-mood',
    body := '{"mode": "batch"}'::jsonb
  );
  $$
);
```

---

## 🧪 TESTING

### Test Manual:
```bash
supabase functions invoke calculate-financial-mood \
  --body '{"user_id":"REPLACE_WITH_REAL_UUID"}'
```

### Test Cases:

1. **Usuario nuevo** → Error "Not enough data"
2. **Usuario disciplinado** → Score 85-95, mood "disciplinado"
3. **Usuario impulsivo** → Score 35-50, mood "impulsivo", alertas
4. **Usuario estresado** → Score 30-45, mood "estresado", múltiples alertas

---

## 💰 COSTOS

### OpenAI (opcional):
- GPT-4o-mini: ~$0.001 USD por explicación
- 1000 usuarios activos = ~$1 USD/día
- Puedes desactivar IA y usar descripciones estáticas

### Supabase:
- Gratis hasta 500k lecturas/mes
- Edge Function: Gratis hasta 500k invocaciones

---

## 🔧 PERSONALIZACIÓN

### Cambiar umbral de una regla:
```sql
UPDATE financial_mood_rules
SET condition_json = jsonb_set(
  condition_json,
  '{threshold}',
  '40'
)
WHERE name = 'impulse_spending_high';
```

### Desactivar una regla:
```sql
UPDATE financial_mood_rules
SET is_active = FALSE
WHERE name = 'late_night_spending';
```

### Crear nueva regla:
```sql
INSERT INTO financial_mood_rules (name, description, condition_json, weight, category)
VALUES (
  'mi_regla_custom',
  'Descripción de mi regla',
  '{
    "metric": "saving_rate",
    "operator": "greater_than",
    "threshold": 25,
    "impact": 20,
    "message": "¡Excelente! Ahorrando más del 25%"
  }'::jsonb,
  1.5,
  'saving_behavior'
);
```

---

## 📊 ESTADÍSTICAS GLOBALES

Ver distribución de moods en tu app:

```sql
SELECT
  mood_label,
  COUNT(*) as usuarios,
  ROUND(AVG(score), 1) as score_promedio
FROM financial_mood_snapshots
WHERE date >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY mood_label
ORDER BY usuarios DESC;
```

Ver tendencias de un usuario:

```sql
SELECT
  date,
  mood_label,
  score,
  trend
FROM financial_mood_snapshots
WHERE user_id = 'uuid-del-usuario'
ORDER BY date DESC
LIMIT 30;
```

---

## 🎯 MEJORAS FUTURAS

1. **Comparación Social** → "Tu score está 15% arriba del promedio"
2. **Predicción ML** → "Si sigues así, subirás a 75 en 2 semanas"
3. **Challenges** → "7 días sin gastos innecesarios"
4. **Alertas Proactivas** → Push notification si mood cae drásticamente
5. **Coach IA** → Chat conversacional con GPT-4
6. **Mood Calendar** → Vista calendario con mood de cada día

---

## 📚 DOCUMENTACIÓN COMPLETA

Ver `FINANCIAL-MOOD-ENGINE-DOCS.md` para:
- Arquitectura detallada
- Explicación de cada métrica
- Casos de uso avanzados
- Troubleshooting
- FAQ

Ver `PROMPTS-FINANCIAL-MOOD-AI.md` para:
- Prompts por tipo de mood
- Ejemplos de respuestas IA
- Casos especiales (primera vez, mejora drástica, etc.)

---

## ✅ CHECKLIST DE IMPLEMENTACIÓN

- [ ] Aplicar migración SQL
- [ ] Desplegar Edge Function
- [ ] Agregar componente a dashboard
- [ ] Configurar OpenAI API key (opcional)
- [ ] Probar con usuario real
- [ ] Configurar cron job (opcional)
- [ ] Verificar que reglas funcionan
- [ ] Personalizar colores/textos según tu marca
- [ ] Añadir analytics (opcional)

---

## 🎉 ¡LISTO!

El **Financial Mood Engine** está completamente implementado y documentado.

### Próximos pasos:
1. Deploy (migración + edge function)
2. Agregar a dashboard
3. Probar con usuarios reales
4. Iterar según feedback

**¿Preguntas?** Revisa la documentación completa o los comentarios en el código.

---

**Versión:** 1.0
**Stack:** Supabase + Edge Functions + React + OpenAI
**Autor:** Claude Code + FINANTEL Team
**Fecha:** 2025-01-15
