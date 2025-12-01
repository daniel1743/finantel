# 🎭 FINANCIAL MOOD ENGINE - Documentación Completa

## 📋 ÍNDICE
1. [Introducción](#introducción)
2. [Arquitectura](#arquitectura)
3. [Base de Datos](#base-de-datos)
4. [Edge Function](#edge-function)
5. [Frontend](#frontend)
6. [Prompts de IA](#prompts-de-ia)
7. [Deployment](#deployment)
8. [Testing](#testing)
9. [Mejoras Futuras](#mejoras-futuras)

---

## 1. INTRODUCCIÓN

### ¿Qué es el Financial Mood Engine?

El **Financial Mood Engine** es un sistema inteligente que detecta el **"estado emocional financiero"** del usuario analizando sus patrones de gasto y generando insights + alertas personalizadas.

### Objetivos:
- ✅ Detectar automáticamente el "mood" financiero del usuario
- ✅ Generar explicaciones en lenguaje humano con IA
- ✅ Alertar sobre comportamientos riesgosos
- ✅ Motivar buenos hábitos financieros
- ✅ Trackear tendencias a lo largo del tiempo

### Estados posibles:
1. **Modo Ahorro** 💰 - Score 85-100: Excelente salud financiera
2. **Disciplinado** 🎯 - Score 80-84: Siguiendo presupuestos
3. **Estable** ✅ - Score 65-79: Comportamiento saludable
4. **Calmado** 😌 - Score 50-64: Gastos bajo control
5. **Impulsivo** 🛍️ - Score 35-49: Muchos gastos no planificados
6. **Estresado** 😰 - Score 35-49: Superando presupuestos
7. **Descontrolado** 🚨 - Score 20-34: Múltiples señales de alarma
8. **Recuperación** 🌱 - Score <20: Mejorando después de período difícil

---

## 2. ARQUITECTURA

### Stack Tecnológico:
- **Backend**: Supabase (PostgreSQL)
- **Compute**: Edge Functions (Deno/TypeScript)
- **Frontend**: React + Framer Motion
- **IA**: OpenAI GPT-4o-mini
- **Scheduling**: Supabase Cron (para ejecución periódica)

### Flujo de Datos:

```
┌─────────────────┐
│  Transacciones  │
│   (4-8 semanas) │
└────────┬────────┘
         │
         v
┌─────────────────┐
│  Edge Function  │
│ calculate-mood  │
└────────┬────────┘
         │
         ├─> Analizar patrones
         ├─> Aplicar reglas
         ├─> Calcular score
         ├─> Generar alertas
         │
         v
┌─────────────────┐
│  mood_snapshot  │
│   (Base Datos)  │
└────────┬────────┘
         │
         v
┌─────────────────┐
│  React UI       │
│  + OpenAI GPT   │
│  (Explicación)  │
└─────────────────┘
         │
         v
┌─────────────────┐
│    Usuario      │
│  ve su "mood"   │
└─────────────────┘
```

---

## 3. BASE DE DATOS

### Tablas Principales:

#### 3.1 `financial_mood_snapshots`
Almacena snapshots diarios del mood financiero.

```sql
CREATE TABLE financial_mood_snapshots (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,

  -- Estado emocional
  mood_label TEXT NOT NULL, -- 'calmado', 'estable', 'disciplinado', etc.
  score NUMERIC(5,2) NOT NULL, -- 0-100

  -- Razones y métricas
  reasons JSONB NOT NULL, -- Factores que contribuyen
  metrics JSONB NOT NULL, -- Métricas calculadas

  -- Tendencia y alertas
  trend TEXT, -- 'improving', 'stable', 'declining'
  alerts JSONB DEFAULT '[]',

  -- Período de análisis
  analysis_period_start DATE NOT NULL,
  analysis_period_end DATE NOT NULL,

  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, date)
);
```

**Ejemplo de registro:**
```json
{
  "id": "...",
  "user_id": "...",
  "date": "2025-01-15",
  "mood_label": "disciplinado",
  "score": 82.5,
  "reasons": [
    {
      "factor": "budget_compliance",
      "impact": 15,
      "description": "Cumpliendo 95% de presupuestos"
    },
    {
      "factor": "impulse_spending",
      "impact": -10,
      "description": "22% de gastos impulsivos"
    }
  ],
  "metrics": {
    "total_transactions": 45,
    "impulse_percentage": 22.0,
    "budget_compliance": 95.0,
    "saving_rate": 18.5
  },
  "trend": "improving",
  "alerts": []
}
```

---

#### 3.2 `financial_mood_rules`
Reglas configurables para calcular el mood.

```sql
CREATE TABLE financial_mood_rules (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,

  -- Condición evaluable
  condition_json JSONB NOT NULL,

  -- Peso de la regla
  weight NUMERIC(3,2) DEFAULT 1.0,

  -- Categoría
  category TEXT, -- 'spending_pattern', 'budget_compliance', etc.

  is_active BOOLEAN DEFAULT TRUE,

  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Ejemplo de regla:**
```json
{
  "name": "impulse_spending_high",
  "condition_json": {
    "metric": "impulse_percentage",
    "operator": "greater_than",
    "threshold": 35,
    "impact": -20,
    "mood_factors": ["impulsivo", "estresado"],
    "message": "Gastos impulsivos muy altos (>{threshold}%)"
  },
  "weight": 1.5,
  "category": "spending_pattern"
}
```

---

#### 3.3 `financial_mood_trends`
Agregados semanales/mensuales para ver tendencias a largo plazo.

```sql
CREATE TABLE financial_mood_trends (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  period_type TEXT NOT NULL, -- 'weekly', 'monthly', 'quarterly'
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,

  -- Estadísticas del período
  avg_score NUMERIC(5,2),
  dominant_mood TEXT,
  total_snapshots INTEGER,
  days_stable INTEGER,
  days_stressed INTEGER,

  -- Cambio respecto período anterior
  score_change NUMERIC(5,2),

  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

### Reglas por Defecto:

El sistema viene con 8 reglas pre-configuradas:

1. **impulse_spending_high** (-20): Penaliza >35% gastos impulsivos
2. **budget_compliance_good** (+15): Bonifica >80% cumplimiento presupuestos
3. **saving_rate_good** (+10): Bonifica >15% tasa de ahorro
4. **week_volatility_high** (-15): Penaliza >30% variación semanal
5. **late_night_spending** (-10): Penaliza >5 transacciones nocturnas
6. **category_balance_healthy** (+5): Bonifica balance entre categorías
7. **weekend_spending_excessive** (-12): Penaliza >60% gasto en fin de semana
8. **frugal_streak** (+8): Bonifica 3+ días sin gastos discrecionales

---

## 4. EDGE FUNCTION

### Ubicación:
`supabase/functions/calculate-financial-mood/index.ts`

### Endpoint:
```
POST https://[PROJECT].supabase.co/functions/v1/calculate-financial-mood
```

### Request:
```json
{
  "user_id": "uuid-del-usuario",
  "force_recalculate": false // opcional
}
```

### Response:
```json
{
  "success": true,
  "mood": {
    "label": "disciplinado",
    "score": 82.5,
    "trend": "improving",
    "reasons": [
      {
        "factor": "budget_compliance",
        "impact": 15,
        "description": "Cumpliendo 95% de presupuestos"
      }
    ],
    "alerts": [],
    "metrics": {
      "total_transactions": 45,
      "impulse_percentage": 22.0,
      "budget_compliance": 95.0,
      "saving_rate": 18.5
    },
    "period": {
      "start": "2024-12-18",
      "end": "2025-01-15"
    }
  },
  "snapshot": { /* registro completo */ }
}
```

### Lógica Principal:

1. **Obtener transacciones** (últimas 4-8 semanas)
2. **Calcular métricas**:
   - `impulse_percentage`: % gastos discrecionales
   - `budget_compliance`: % presupuestos cumplidos
   - `saving_rate`: % ahorro sobre ingresos
   - `week_over_week_change`: Variación semanal
   - `late_night_transactions`: Compras 11pm-4am
   - `weekend_spending_ratio`: % gasto en fin de semana
   - `frugal_days_streak`: Días sin gastos innecesarios
3. **Aplicar reglas** y calcular score
4. **Determinar mood label** según score y métricas
5. **Generar alertas** si es necesario
6. **Guardar snapshot** en base de datos
7. **Retornar resultado**

### Métricas Calculadas:

```typescript
interface MoodMetrics {
  total_transactions: number;
  impulse_percentage: number;        // % gastos discrecionales
  budget_compliance: number;         // % presupuestos cumplidos
  week_over_week_change: number;     // Variación $ semana a semana
  avg_transaction_value: number;     // Promedio de gasto por transacción
  late_night_transactions: number;   // Compras 11pm-4am
  weekend_spending_ratio: number;    // % gasto en fin de semana
  saving_rate: number;               // % ahorro sobre ingresos
  week_over_week_volatility: number; // Variación absoluta
  max_category_percentage: number;   // % de categoría dominante
  frugal_days_streak: number;        // Días consecutivos sin gastos innecesarios
}
```

### Cálculo de Score:

```typescript
let baseScore = 70; // Score base neutral

// Aplicar cada regla activa
for (const rule of rules) {
  const metricValue = metrics[rule.metric];
  const conditionMet = evaluateCondition(metricValue, rule.condition);

  if (conditionMet) {
    const impact = rule.impact * rule.weight;
    baseScore += impact;
  }
}

// Clamp entre 0-100
const finalScore = Math.max(0, Math.min(100, baseScore));
```

---

## 5. FRONTEND

### Componente Principal:
`src/components/FinancialMoodCard.jsx`

### Features:
- ✅ Muestra mood actual con emoji y color
- ✅ Barra de progreso animada (score 0-100)
- ✅ Explicación generada por IA con OpenAI
- ✅ Top 3 razones del mood con impacto
- ✅ Alertas activas (si las hay)
- ✅ Indicador de tendencia (mejorando/empeorando)
- ✅ Botón para recalcular mood
- ✅ Estados de carga y error

### Uso en tu app:

```jsx
import FinancialMoodCard from '@/components/FinancialMoodCard';

function Dashboard() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <FinancialMoodCard />
      {/* Otros widgets */}
    </div>
  );
}
```

### Configuración de Colores por Mood:

```javascript
const MOOD_CONFIG = {
  modo_ahorro: {
    emoji: '💰',
    color: '#10B981', // verde
    label: 'Modo Ahorro',
  },
  disciplinado: {
    emoji: '🎯',
    color: '#3B82F6', // azul
    label: 'Disciplinado',
  },
  // ... otros moods
};
```

### Flujo del Componente:

```
1. Montar → loadMood()
2. Consultar DB → ¿Existe snapshot reciente?
   ├─ SÍ → Mostrar mood + generar explicación IA
   └─ NO → Calcular nuevo mood (Edge Function)
3. Mostrar resultado con animaciones
4. Usuario puede "Recalcular" manualmente
```

---

## 6. PROMPTS DE IA

### System Message Base:

```
Eres un asesor financiero personal amigable y empático.

Tu trabajo es explicar el "estado emocional financiero" del usuario de forma clara y cercana.

REGLAS:
1. Usa un tono amigable y motivador
2. Explica en 2-3 frases cortas
3. Enfócate en el "por qué" y el "qué hacer"
4. Usa lenguaje simple
5. Sé empático con situaciones difíciles
6. Celebra los logros
```

### Template de Prompt:

```javascript
const prompt = `
El usuario tiene:
- Estado: "${mood_label}"
- Score: ${score}/100
- Tendencia: ${trend}

Factores principales:
${reasons.map(r => `- ${r.description} (${r.impact > 0 ? '+' : ''}${r.impact})`).join('\n')}

Métricas:
- Gastos impulsivos: ${metrics.impulse_percentage}%
- Presupuestos cumplidos: ${metrics.budget_compliance}%
- Ahorro: ${metrics.saving_rate}%

Explica en 2-3 frases:
1. Por qué tiene este estado
2. Qué puede hacer AHORA para mejorar
`;
```

### Ejemplo de Respuesta IA:

**Input:**
- Score: 45
- Mood: impulsivo
- Impulse: 47%
- Late night: 8 transacciones

**Output:**
> "Casi la mitad de tus gastos son compras no planificadas, especialmente los fines de semana y de noche. Esto está afectando tu presupuesto. Prueba esto: antes de comprar algo, espera 24 horas. Muchas veces el impulso pasa y ahorras."

Ver archivo completo: `PROMPTS-FINANCIAL-MOOD-AI.md`

---

## 7. DEPLOYMENT

### 7.1 Migración de Base de Datos

```bash
cd "C:\Users\Lenovo\Downloads\finantel version 2.1 funcional"

# Aplicar migración
supabase db push
```

O manualmente en Supabase Dashboard:
1. SQL Editor → New Query
2. Pegar contenido de `supabase/migrations/040_financial_mood_engine.sql`
3. Run

### 7.2 Deploy Edge Function

```bash
# Deploy función
supabase functions deploy calculate-financial-mood

# Configurar secrets (si es necesario)
supabase secrets set OPENAI_API_KEY=sk-xxx...
```

### 7.3 Configurar Cron Job (Opcional)

Para calcular mood automáticamente cada día:

```sql
-- Crear extensión pg_cron si no existe
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Programar cálculo diario a las 2am
SELECT cron.schedule(
  'calculate-daily-moods',
  '0 2 * * *', -- Cron expression (2am diario)
  $$
  SELECT net.http_post(
    url := 'https://[PROJECT].supabase.co/functions/v1/calculate-financial-mood',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer [SERVICE_KEY]"}'::jsonb,
    body := '{"mode": "batch"}'::jsonb
  );
  $$
);
```

### 7.4 Frontend

El componente React ya está listo, solo agregarlo a tu dashboard:

```jsx
// src/pages/dashboard/DashboardHome.jsx
import FinancialMoodCard from '@/components/FinancialMoodCard';

export default function DashboardHome() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Mood Card en lugar destacado */}
      <div className="lg:col-span-2">
        <FinancialMoodCard />
      </div>

      {/* Otros widgets */}
      <StatsCard />
      <RecentTransactions />
    </div>
  );
}
```

---

## 8. TESTING

### 8.1 Test Manual - Edge Function

```bash
# Test desde CLI
supabase functions invoke calculate-financial-mood \
  --body '{"user_id":"REPLACE_WITH_REAL_UUID"}'
```

O desde Postman/Insomnia:
```
POST https://[PROJECT].supabase.co/functions/v1/calculate-financial-mood
Headers:
  Authorization: Bearer [ANON_KEY]
Body:
{
  "user_id": "uuid-del-usuario"
}
```

### 8.2 Test Cases

#### Caso 1: Usuario nuevo (sin datos)
- **Input**: 0-2 transacciones
- **Expected**: Error "Not enough data"

#### Caso 2: Usuario disciplinado
- **Setup**:
  - 30 transacciones en 4 semanas
  - 90% cumplimiento presupuestos
  - 20% tasa de ahorro
  - Solo 15% gastos impulsivos
- **Expected**:
  - Score: 85-95
  - Mood: "modo_ahorro" o "disciplinado"
  - Trend: "stable" o "improving"

#### Caso 3: Usuario impulsivo
- **Setup**:
  - 40 transacciones en 4 semanas
  - 50% gastos discrecionales
  - 10 transacciones nocturnas
  - 70% gasto en fin de semana
- **Expected**:
  - Score: 35-50
  - Mood: "impulsivo"
  - Alertas: "impulse_spike", "emotional_spending"

#### Caso 4: Usuario estresado
- **Setup**:
  - Múltiples presupuestos excedidos
  - Aumento 50% gasto semana a semana
  - Tasa ahorro negativa (-5%)
- **Expected**:
  - Score: 30-45
  - Mood: "estresado" o "descontrolado"
  - Alertas: "budget_exceeded", "spending_spike", "negative_savings"

### 8.3 Test de Reglas

Verificar que cada regla se aplica correctamente:

```sql
-- Ver reglas activas
SELECT * FROM financial_mood_rules WHERE is_active = TRUE;

-- Simular aplicación de regla
-- (hacer transacciones de prueba y verificar impacto en score)
```

---

## 9. MEJORAS FUTURAS

### 9.1 Features Adicionales

1. **Comparación Social (Anónima)**
   - Comparar mood con promedio de usuarios similares
   - "Tu score está 15% arriba del promedio de tu ciudad"

2. **Predicción de Mood Futuro**
   - Usar ML para predecir mood en 2-4 semanas
   - "Si sigues así, tu score subirá a 75 en 2 semanas"

3. **Challenges Personalizados**
   - "Challenge: 7 días sin gastos innecesarios"
   - Gamificación con badges y streaks

4. **Alertas Proactivas**
   - Enviar notificación push si mood empeora drásticamente
   - "Tu mood bajó 20 puntos esta semana, ¿todo bien?"

5. **Coach Financiero IA**
   - Chat conversacional con GPT-4
   - "¿Por qué mi mood bajó?" → Explicación personalizada

6. **Mood Calendar**
   - Vista de calendario mostrando mood de cada día
   - Identificar patrones (ej: "siempre gasto más los viernes")

### 9.2 Optimizaciones

1. **Cache de Cálculos**
   - No recalcular si no hay nuevas transacciones
   - Cache por 24h

2. **Batch Processing**
   - Calcular mood para todos los usuarios en paralelo
   - Optimizar queries con índices

3. **A/B Testing de Reglas**
   - Probar diferentes pesos de reglas
   - Ver qué configuración predice mejor el éxito financiero

4. **Machine Learning**
   - Entrenar modelo para detectar patrones únicos
   - Personalizar reglas por usuario

---

## 10. PREGUNTAS FRECUENTES

### ¿Con qué frecuencia se actualiza el mood?
Por defecto, se calcula 1 vez al día. Puedes configurar un cron job o dejar que el usuario lo recalcule manualmente.

### ¿Qué pasa si no hay suficientes datos?
Se requieren mínimo 3 transacciones en las últimas 4 semanas. Si no hay suficientes, se muestra un mensaje pidiendo más datos.

### ¿Se puede personalizar las reglas?
Sí, las reglas están en la tabla `financial_mood_rules` y son totalmente configurables. Puedes:
- Cambiar thresholds
- Ajustar pesos
- Activar/desactivar reglas
- Crear nuevas reglas

### ¿Cómo se calcula el score?
Base score = 70 (neutral)
+ Se aplican reglas activas (cada una suma o resta puntos)
+ Se multiplica por el peso de la regla
+ Se clampea entre 0-100

### ¿La IA cuesta dinero?
Sí, usa OpenAI GPT-4o-mini. Costo aproximado:
- ~$0.001 USD por explicación
- Con 1000 usuarios activos = ~$1 USD/día
- Puedes usar explicaciones pre-generadas para ahorrar

### ¿Se pueden exportar los datos de mood?
Sí, los snapshots están en la tabla `financial_mood_snapshots`. Puedes:
- Exportar como CSV
- Graficar tendencias
- Analizar con herramientas de BI

---

## 11. SOPORTE Y CONTACTO

### Logs de Edge Function:
```bash
supabase functions logs calculate-financial-mood --tail
```

### Ver mood de un usuario específico:
```sql
SELECT * FROM financial_mood_snapshots
WHERE user_id = 'uuid-del-usuario'
ORDER BY date DESC
LIMIT 10;
```

### Ver estadísticas globales:
```sql
SELECT
  mood_label,
  COUNT(*) as count,
  AVG(score) as avg_score
FROM financial_mood_snapshots
WHERE date >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY mood_label
ORDER BY count DESC;
```

---

## 📚 ARCHIVOS CREADOS

1. ✅ `supabase/migrations/040_financial_mood_engine.sql` - Schema completo
2. ✅ `supabase/functions/calculate-financial-mood/index.ts` - Edge Function
3. ✅ `src/components/FinancialMoodCard.jsx` - Componente React
4. ✅ `PROMPTS-FINANCIAL-MOOD-AI.md` - Prompts para IA
5. ✅ `FINANCIAL-MOOD-ENGINE-DOCS.md` - Esta documentación

---

## 🎉 ¡LISTO PARA USAR!

El Financial Mood Engine está completamente implementado y listo para deployment.

**Próximos pasos:**
1. Aplicar migración SQL
2. Desplegar Edge Function
3. Agregar componente a tu dashboard
4. Configurar API key de OpenAI
5. Probar con usuarios reales

¿Preguntas? Revisa esta documentación o los comentarios en el código.

---

**Versión:** 1.0
**Última actualización:** 2025-01-15
**Autor:** Claude Code + FINANTEL Team
