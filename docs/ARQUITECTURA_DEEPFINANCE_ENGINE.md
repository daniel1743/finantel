# 🔮 ARQUITECTURA: Finantel DeepFinance™ Engine

## 📋 ÍNDICE

1. [Estructura Base Recomendada](#estructura-base)
2. [Conexión con Datos Existentes](#conexión-datos)
3. [Fórmulas y Cálculos](#fórmulas)
4. [Asegurar Exactitud Sin Inventar Datos](#exactitud)
5. [Presentación en UI](#presentación-ui)
6. [Funciones a Implementar Primero](#funciones-prioridad)
7. [Arquitectura General](#arquitectura-general)
8. [Flujo Completo de Ejecución](#flujo-ejecución)

---

## 🏗️ ESTRUCTURA BASE RECOMENDADA {#estructura-base}

### Estructura de Directorios

```
src/
├── lib/
│   ├── deepfinance/
│   │   ├── engine.js              # Motor principal
│   │   ├── analyzers/
│   │   │   ├── transactionAnalyzer.js    # Análisis por transacción
│   │   │   ├── patternAnalyzer.js         # Detección de patrones
│   │   │   ├── riskAnalyzer.js            # Análisis de riesgo
│   │   │   ├── emotionalAnalyzer.js       # Gastos emocionales
│   │   │   └── leakageAnalyzer.js         # Detección de fugas
│   │   ├── calculators/
│   │   │   ├── savingsCalculator.js       # Cálculo de ahorro potencial
│   │   │   ├── scoreCalculator.js          # Puntaje financiero (0-100)
│   │   │   └── projectionCalculator.js    # Proyecciones futuras
│   │   ├── classifiers/
│   │   │   ├── necessityClassifier.js     # Necesario vs innecesario
│   │   │   ├── impulseClassifier.js        # Impulsivo vs planificado
│   │   │   └── emotionalClassifier.js      # Emocional vs estructural
│   │   ├── dataCollector.js                # Recolector de datos
│   │   ├── aiService.js                    # Integración con IA
│   │   └── reportGenerator.js              # Generador de PDF
│   └── ...
├── hooks/
│   ├── useDeepFinance.js          # Hook principal
│   └── useDeepFinanceCredits.js   # Hook para créditos
├── pages/
│   └── dashboard/
│       └── DeepFinance.jsx        # Página principal del módulo
└── components/
    └── deepfinance/
        ├── AnalysisCard.jsx
        ├── ScoreDisplay.jsx
        ├── PatternCard.jsx
        ├── LeakageCard.jsx
        ├── SavingsProjection.jsx
        └── ReportModal.jsx
```

### Tablas de Base de Datos

```sql
-- Tabla para almacenar análisis realizados
CREATE TABLE public.deepfinance_analyses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    analysis_date TIMESTAMPTZ DEFAULT NOW(),
    score DECIMAL(5, 2) CHECK (score >= 0 AND score <= 100),
    total_transactions INTEGER,
    period_start DATE,
    period_end DATE,
    summary JSONB DEFAULT '{}'::jsonb,
    patterns JSONB DEFAULT '[]'::jsonb,
    leakages JSONB DEFAULT '[]'::jsonb,
    recommendations JSONB DEFAULT '[]'::jsonb,
    savings_potential JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla para créditos y límites
CREATE TABLE public.deepfinance_credits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    credits_remaining INTEGER DEFAULT 0 CHECK (credits_remaining >= 0),
    last_analysis_date DATE,
    analyses_this_week INTEGER DEFAULT 0,
    analyses_this_month INTEGER DEFAULT 0,
    free_analyses_used INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Tabla para historial de compras de créditos
CREATE TABLE public.deepfinance_credit_purchases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    credits_purchased INTEGER NOT NULL,
    amount_paid DECIMAL(10, 2) NOT NULL,
    currency TEXT DEFAULT 'USD',
    payment_id UUID REFERENCES billing_payments(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 🔗 CONEXIÓN CON DATOS EXISTENTES {#conexión-datos}

### 1. Conexión con Transacciones

```javascript
// src/lib/deepfinance/dataCollector.js

import { supabase } from '@/lib/customSupabaseClient';

export class DataCollector {
  constructor(userId) {
    this.userId = userId;
  }

  async collectTransactions(period = '90days') {
    const { data, error } = await supabase
      .from('transactions')
      .select(`
        *,
        categories(name, icon, color, type),
        budgets(name, amount, period)
      `)
      .eq('user_id', this.userId)
      .order('date', { ascending: false });

    if (error) throw error;
    return this.filterByPeriod(data || [], period);
  }

  async collectBudgets() {
    const { data } = await supabase
      .from('budgets')
      .select('*')
      .eq('user_id', this.userId)
      .eq('is_active', true);
    return data || [];
  }

  async collectGoals() {
    const { data } = await supabase
      .from('goals')
      .select('*')
      .eq('user_id', this.userId)
      .eq('status', 'active');
    return data || [];
  }

  async collectMoodData() {
    // Integración con Financial Mood Engine
    // Si existe tabla de mood, obtenerla
    // Si no, calcular desde transacciones
    return this.calculateMoodFromTransactions();
  }
}
```

### 2. Conexión con Mood Engine

```javascript
// src/lib/deepfinance/analyzers/emotionalAnalyzer.js

export class EmotionalAnalyzer {
  constructor(transactions, moodData) {
    this.transactions = transactions;
    this.moodData = moodData; // Del Financial Mood Engine
  }

  analyzeEmotionalSpending() {
    // Usar datos del Mood Engine si están disponibles
    // Si no, inferir desde patrones de transacciones
    
    const emotionalIndicators = {
      // Transacciones en horarios nocturnos (22:00-02:00)
      lateNight: this.detectLateNightSpending(),
      // Transacciones en fines de semana
      weekend: this.detectWeekendSpending(),
      // Transacciones sin categoría o "otros"
      uncategorized: this.detectUncategorizedSpending(),
      // Transacciones repetitivas en corto tiempo
      repetitive: this.detectRepetitiveSpending(),
      // Transacciones que exceden presupuesto
      budgetExceeded: this.detectBudgetExceeded()
    };

    return this.calculateEmotionalScore(emotionalIndicators);
  }
}
```

### 3. Conexión con Presupuestos

```javascript
// src/lib/deepfinance/analyzers/patternAnalyzer.js

export class PatternAnalyzer {
  analyzeBudgetCompliance(transactions, budgets) {
    const compliance = {};
    
    budgets.forEach(budget => {
      const categoryTransactions = transactions.filter(
        tx => tx.category_id === budget.category_id
      );
      
      const spent = categoryTransactions.reduce(
        (sum, tx) => sum + parseFloat(tx.amount || 0), 0
      );
      
      const percentage = (spent / parseFloat(budget.amount)) * 100;
      
      compliance[budget.id] = {
        budget_id: budget.id,
        category_id: budget.category_id,
        budget_amount: parseFloat(budget.amount),
        spent,
        percentage,
        status: percentage > 100 ? 'exceeded' : 
                percentage > 80 ? 'warning' : 'ok'
      };
    });
    
    return compliance;
  }
}
```

---

## 📊 FÓRMULAS Y CÁLCULOS {#fórmulas}

### 1. Puntaje Financiero Global (0-100)

```javascript
// src/lib/deepfinance/calculators/scoreCalculator.js

export class ScoreCalculator {
  calculateGlobalScore(analysis) {
    const weights = {
      budgetCompliance: 0.25,    // 25%
      savingsRate: 0.20,         // 20%
      spendingDiscipline: 0.15,   // 15%
      riskLevel: 0.15,           // 15%
      patternHealth: 0.10,        // 10%
      goalProgress: 0.10,         // 10%
      emotionalControl: 0.05      // 5%
    };

    const scores = {
      budgetCompliance: this.calculateBudgetScore(analysis.budgets),
      savingsRate: this.calculateSavingsScore(analysis.income, analysis.expenses),
      spendingDiscipline: this.calculateDisciplineScore(analysis.patterns),
      riskLevel: this.calculateRiskScore(analysis.risk),
      patternHealth: this.calculatePatternScore(analysis.patterns),
      goalProgress: this.calculateGoalScore(analysis.goals),
      emotionalControl: this.calculateEmotionalScore(analysis.emotional)
    };

    // Calcular promedio ponderado
    let totalScore = 0;
    Object.keys(weights).forEach(key => {
      totalScore += scores[key] * weights[key];
    });

    return Math.round(totalScore);
  }

  calculateBudgetScore(budgets) {
    if (!budgets || budgets.length === 0) return 50; // Neutral si no hay presupuestos
    
    const complianceRates = budgets.map(b => {
      if (b.percentage > 100) return 0;
      if (b.percentage > 80) return 50;
      return 100;
    });
    
    return complianceRates.reduce((a, b) => a + b, 0) / complianceRates.length;
  }

  calculateSavingsScore(income, expenses) {
    if (!income || income === 0) return 0;
    const savingsRate = ((income - expenses) / income) * 100;
    
    if (savingsRate >= 20) return 100;
    if (savingsRate >= 10) return 75;
    if (savingsRate >= 5) return 50;
    if (savingsRate >= 0) return 25;
    return 0; // Negativo
  }
}
```

### 2. Detección de Fugas Financieras

```javascript
// src/lib/deepfinance/analyzers/leakageAnalyzer.js

export class LeakageAnalyzer {
  detectLeakages(transactions) {
    const leakages = [];

    // 1. Suscripciones invisibles (gastos recurrentes pequeños)
    const subscriptions = this.detectSubscriptions(transactions);
    leakages.push(...subscriptions);

    // 2. Gastos pequeños repetitivos que suman mucho
    const microExpenses = this.detectMicroExpenses(transactions);
    leakages.push(...microExpenses);

    // 3. Categorías sin presupuesto que crecen
    const unbudgetedGrowth = this.detectUnbudgetedGrowth(transactions);
    leakages.push(...unbudgetedGrowth);

    // 4. Gastos duplicados o errores
    const duplicates = this.detectDuplicates(transactions);
    leakages.push(...duplicates);

    return leakages;
  }

  detectSubscriptions(transactions) {
    // Agrupar por descripción similar y monto similar
    const groups = {};
    
    transactions.forEach(tx => {
      const key = `${tx.description?.toLowerCase()}_${Math.round(tx.amount)}`;
      if (!groups[key]) groups[key] = [];
      groups[key].push(tx);
    });

    // Encontrar grupos con frecuencia mensual
    const subscriptions = [];
    Object.entries(groups).forEach(([key, txs]) => {
      if (txs.length >= 2) {
        const dates = txs.map(t => new Date(t.date)).sort();
        const avgInterval = this.calculateAverageInterval(dates);
        
        if (avgInterval >= 25 && avgInterval <= 35) { // ~30 días
          subscriptions.push({
            type: 'subscription',
            description: txs[0].description,
            amount: txs[0].amount,
            frequency: 'monthly',
            total_annual: parseFloat(txs[0].amount) * 12,
            occurrences: txs.length
          });
        }
      }
    });

    return subscriptions;
  }

  detectMicroExpenses(transactions) {
    // Gastos menores a $10 que se repiten frecuentemente
    const micro = transactions.filter(tx => 
      tx.type === 'expense' && 
      parseFloat(tx.amount) < 10 && 
      parseFloat(tx.amount) > 0
    );

    if (micro.length < 10) return [];

    const total = micro.reduce((sum, tx) => sum + parseFloat(tx.amount), 0);
    const monthly = total / (this.getPeriodMonths(transactions) || 1);

    if (monthly > 50) { // Más de $50/mes en micro gastos
      return [{
        type: 'micro_expenses',
        description: 'Gastos pequeños repetitivos',
        monthly_impact: monthly,
        annual_impact: monthly * 12,
        count: micro.length
      }];
    }

    return [];
  }
}
```

### 3. Ahorro Potencial

```javascript
// src/lib/deepfinance/calculators/savingsCalculator.js

export class SavingsCalculator {
  calculatePotentialSavings(analysis) {
    const scenarios = {
      '30days': this.calculate30Days(analysis),
      '90days': this.calculate90Days(analysis),
      '180days': this.calculate180Days(analysis),
      'eliminate_leakages': this.calculateLeakageElimination(analysis),
      'reduce_emotional': this.calculateEmotionalReduction(analysis),
      'optimize_categories': this.calculateCategoryOptimization(analysis)
    };

    return scenarios;
  }

  calculate30Days(analysis) {
    const monthlyLeakages = analysis.leakages.reduce(
      (sum, l) => sum + (l.monthly_impact || 0), 0
    );
    const monthlyEmotional = analysis.emotional?.monthly_impact || 0;
    
    return {
      potential: monthlyLeakages + monthlyEmotional,
      breakdown: {
        leakages: monthlyLeakages,
        emotional: monthlyEmotional
      }
    };
  }

  calculateLeakageElimination(analysis) {
    const annualLeakages = analysis.leakages.reduce(
      (sum, l) => sum + (l.annual_impact || l.monthly_impact * 12 || 0), 0
    );
    
    return {
      potential: annualLeakages,
      description: 'Eliminando todas las fugas detectadas'
    };
  }
}
```

---

## ✅ ASEGURAR EXACTITUD SIN INVENTAR DATOS {#exactitud}

### Reglas Críticas

```javascript
// src/lib/deepfinance/engine.js

export class DeepFinanceEngine {
  constructor(userId) {
    this.userId = userId;
    this.dataCollector = new DataCollector(userId);
    this.rawData = null;
  }

  async analyze() {
    // 1. RECOLECTAR DATOS REALES
    this.rawData = await this.collectAllData();
    
    // 2. VALIDAR QUE HAY DATOS SUFICIENTES
    if (!this.hasMinimumData()) {
      throw new Error('INSUFFICIENT_DATA: Se requieren al menos 10 transacciones');
    }

    // 3. ANÁLISIS SOLO CON DATOS REALES
    const analysis = {
      // NUNCA inventar números
      totalTransactions: this.rawData.transactions.length, // ✅ Real
      totalIncome: this.calculateRealIncome(), // ✅ Solo suma real
      totalExpenses: this.calculateRealExpenses(), // ✅ Solo suma real
      
      // Patrones detectados SOLO si hay evidencia
      patterns: this.detectRealPatterns(), // ✅ Basado en datos
      
      // Fugas SOLO si se detectan
      leakages: this.detectRealLeakages(), // ✅ Basado en datos
      
      // Si no hay datos, retornar null o array vacío
      emotional: this.rawData.transactions.length > 0 
        ? this.analyzeEmotional() 
        : null // ✅ No inventar
    };

    // 4. VALIDAR RESULTADOS
    this.validateAnalysis(analysis);

    return analysis;
  }

  validateAnalysis(analysis) {
    // Asegurar que todos los números suman correctamente
    const calculatedTotal = analysis.totalIncome - analysis.totalExpenses;
    
    // Verificar que no hay números negativos donde no debería
    if (analysis.totalIncome < 0 || analysis.totalExpenses < 0) {
      throw new Error('INVALID_DATA: Totales negativos detectados');
    }

    // Verificar que los porcentajes suman 100% (si aplica)
    if (analysis.categoryDistribution) {
      const totalPercent = analysis.categoryDistribution.reduce(
        (sum, cat) => sum + cat.percent, 0
      );
      if (Math.abs(totalPercent - 100) > 1) {
        console.warn('Category percentages do not sum to 100%');
      }
    }
  }

  // NUNCA usar aproximaciones o inventar
  calculateRealIncome() {
    return this.rawData.transactions
      .filter(tx => tx.type === 'income')
      .reduce((sum, tx) => sum + parseFloat(tx.amount || 0), 0);
  }
}
```

### Integración con IA (Sin Alucinar)

```javascript
// src/lib/deepfinance/aiService.js

export class DeepFinanceAIService {
  async generateInsights(analysis) {
    // Construir contexto SOLO con datos reales
    const context = {
      // Datos numéricos reales
      totalIncome: analysis.totalIncome,
      totalExpenses: analysis.totalExpenses,
      savings: analysis.totalIncome - analysis.totalExpenses,
      
      // Patrones detectados (solo los que existen)
      patterns: analysis.patterns || [],
      
      // Fugas detectadas (solo las que existen)
      leakages: analysis.leakages || [],
      
      // Categorías con montos reales
      topCategories: analysis.categoryDistribution?.slice(0, 5) || []
    };

    // Prompt que PROHÍBE inventar
    const prompt = `
Eres un asesor financiero profesional. Analiza estos datos REALES del usuario:

INGRESOS TOTALES: $${context.totalIncome.toFixed(2)}
GASTOS TOTALES: $${context.totalExpenses.toFixed(2)}
AHORRO: $${context.savings.toFixed(2)}

PATRONES DETECTADOS:
${context.patterns.map(p => `- ${p.description}: ${p.impact}`).join('\n') || 'Ninguno detectado'}

FUGAS DETECTADAS:
${context.leakages.map(l => `- ${l.description}: $${l.monthly_impact}/mes`).join('\n') || 'Ninguna detectada'}

REGLAS CRÍTICAS:
1. SOLO usa los números proporcionados arriba
2. NUNCA inventes montos, categorías o transacciones
3. Si no hay datos en una categoría, di "No hay datos suficientes"
4. Basa tus recomendaciones SOLO en los datos reales proporcionados

Genera un análisis profesional y recomendaciones accionables.
`;

    return await this.callAI(prompt, context);
  }
}
```

---

## 🎨 PRESENTACIÓN EN UI {#presentación-ui}

### Estructura de la Página

```jsx
// src/pages/dashboard/DeepFinance.jsx

const DeepFinance = () => {
  return (
    <div className="space-y-8">
      {/* Header Premium */}
      <DeepFinanceHeader />
      
      {/* Score Card (Destacado) */}
      <ScoreDisplay score={analysis.score} />
      
      {/* Grid de Análisis */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Análisis por Transacción */}
        <TransactionAnalysisCard />
        
        {/* Patrones Globales */}
        <PatternAnalysisCard />
        
        {/* Fugas Financieras */}
        <LeakageCard />
        
        {/* Gastos Emocionales */}
        <EmotionalSpendingCard />
      </div>
      
      {/* Proyecciones de Ahorro */}
      <SavingsProjectionCard />
      
      {/* Recomendaciones */}
      <RecommendationsCard />
      
      {/* Botón Generar PDF */}
      <GenerateReportButton />
    </div>
  );
};
```

### Componentes Visuales

1. **ScoreDisplay**: Circular progress con puntaje 0-100
2. **PatternCard**: Gráficos de líneas para patrones temporales
3. **LeakageCard**: Lista de fugas con impacto mensual/anual
4. **SavingsProjectionCard**: Gráficos de barras para escenarios
5. **RecommendationsCard**: Lista de recomendaciones accionables

---

## 🎯 FUNCIONES A IMPLEMENTAR PRIMERO {#funciones-prioridad}

### Fase 1: Base (Semana 1) ✅ COMPLETADA
1. ✅ `DataCollector` - Recolectar datos
2. ✅ `ScoreCalculator` - Calcular puntaje básico
3. ✅ `TransactionAnalyzer` - Análisis básico por transacción
4. ✅ Tabla `deepfinance_analyses` en Supabase
5. ✅ Hook `useDeepFinance` básico
6. ✅ Hook `useDeepFinanceCredits` para créditos
7. ✅ Integración con IA (DeepSeek/Qwen)

### Fase 1.2: PatternAnalyzer ✅ COMPLETADA
8. ✅ `PatternAnalyzer` - Detectar patrones completos
   - ✅ Análisis temporal (día, hora, mes, fin de semana)
   - ✅ Análisis por categoría (dominante, crecientes)
   - ✅ Análisis de comportamiento (repetitivos, irregulares, consistencia)
   - ✅ Tendencias generales
   - ✅ Cumplimiento de presupuestos
   - ✅ Integración con engine

### Fase 2: Análisis Avanzado (Semana 2) 🔄 EN PROGRESO
9. ⏳ `LeakageAnalyzer` - Detectar fugas
10. ⏳ `EmotionalAnalyzer` - Análisis emocional avanzado
11. ⏳ `RiskAnalyzer` - Análisis de riesgo avanzado
12. ⏳ UI básica con cards

### Fase 3: Avanzado (Semana 3)
13. ⏳ `SavingsCalculator` - Proyecciones
14. ⏳ Generador de PDF
15. ⏳ Reportes premium

### Fase 4: Monetización (Semana 4)
16. ✅ Sistema de créditos (tabla creada)
17. ✅ Límites semanales/mensuales (implementado)
18. ⏳ Integración con Mercado Pago (checkout de créditos)
19. ⏳ UI de compra de créditos

---

## 🏛️ ARQUITECTURA GENERAL {#arquitectura-general}

```
┌─────────────────────────────────────────────────┐
│           DEEPFINANCE ENGINE                     │
├─────────────────────────────────────────────────┤
│                                                 │
│  ┌──────────────┐      ┌──────────────┐       │
│  │ DataCollector│──────▶│   Engine    │       │
│  └──────────────┘      └──────┬───────┘       │
│                                │                │
│         ┌──────────────────────┼──────────────┐│
│         │                      │              ││
│    ┌────▼────┐          ┌─────▼─────┐        ││
│    │Analyzers│          │Calculators│        ││
│    │         │          │           │        ││
│    │ - Trans │          │ - Score   │        ││
│    │ - Pattern│         │ - Savings │        ││
│    │ - Risk  │          │ - Project │       ││
│    │ - Emot  │          └───────────┘        ││
│    │ - Leak  │                               ││
│    └────┬────┘                               ││
│         │                                     ││
│    ┌────▼────┐                               ││
│    │Classifiers│                              ││
│    │ - Necessity│                            ││
│    │ - Impulse │                             ││
│    │ - Emotional│                           ││
│    └──────────┘                              ││
│                                               ││
│  ┌────────────────────────────────────────┐ │
│  │         AI Service                      │ │
│  │  (Con datos reales, sin alucinar)       │ │
│  └────────────────────────────────────────┘ │
│                                               │
│  ┌────────────────────────────────────────┐ │
│  │      Report Generator (PDF)            │ │
│  └────────────────────────────────────────┘ │
└─────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────┐
│           SUPABASE DATABASE                  │
│  - deepfinance_analyses                     │
│  - deepfinance_credits                      │
│  - deepfinance_credit_purchases             │
└─────────────────────────────────────────────┘
```

---

## 🔄 FLUJO COMPLETO DE EJECUCIÓN {#flujo-ejecución}

### Flujo de Usuario

```
1. Usuario hace clic en "Análisis Premium"
   │
   ▼
2. Verificar créditos disponibles
   │
   ├─ Sin créditos → Mostrar modal de compra
   │
   └─ Con créditos → Continuar
      │
      ▼
3. Verificar límite semanal/mensual
   │
   ├─ Límite alcanzado → Mostrar mensaje
   │
   └─ Disponible → Continuar
      │
      ▼
4. Mostrar loading state
   │
   ▼
5. Recolectar datos (transacciones, presupuestos, metas)
   │
   ▼
6. Validar datos mínimos (≥10 transacciones)
   │
   ├─ Insuficientes → Mostrar error
   │
   └─ Suficientes → Continuar
      │
      ▼
7. Ejecutar análisis:
   │
   ├─ Análisis por transacción
   ├─ Detección de patrones
   ├─ Detección de fugas
   ├─ Análisis emocional
   ├─ Cálculo de riesgo
   └─ Cálculo de puntaje
      │
      ▼
8. Generar proyecciones (30/90/180 días)
   │
      ▼
9. Enviar a IA para insights (con datos reales)
   │
      ▼
10. Guardar análisis en BD
    │
    ▼
11. Descontar crédito
    │
    ▼
12. Mostrar resultados en UI
    │
    ▼
13. Opción de generar PDF
```

### Flujo Técnico Detallado

```javascript
// Pseudocódigo del flujo completo

async function executeDeepFinanceAnalysis(userId) {
  try {
    // 1. Verificar créditos
    const credits = await checkCredits(userId);
    if (credits.remaining === 0) {
      throw new Error('NO_CREDITS');
    }

    // 2. Verificar límites
    const limits = await checkLimits(userId);
    if (limits.weekly >= 1) {
      throw new Error('WEEKLY_LIMIT_REACHED');
    }

    // 3. Inicializar motor
    const engine = new DeepFinanceEngine(userId);
    
    // 4. Recolectar datos
    const rawData = await engine.collectAllData();
    
    // 5. Validar datos
    if (rawData.transactions.length < 10) {
      throw new Error('INSUFFICIENT_DATA');
    }

    // 6. Ejecutar análisis
    const analysis = await engine.analyze();
    
    // 7. Generar proyecciones
    const projections = await engine.calculateProjections(analysis);
    
    // 8. Generar insights con IA
    const insights = await engine.generateAIInsights(analysis);
    
    // 9. Guardar en BD
    const savedAnalysis = await saveAnalysis(userId, {
      ...analysis,
      projections,
      insights
    });
    
    // 10. Descontar crédito
    await deductCredit(userId);
    
    // 11. Actualizar límites
    await updateLimits(userId);
    
    return savedAnalysis;
    
  } catch (error) {
    // Manejo de errores con Sentry
    captureError(error, { userId, section: 'deepfinance' });
    throw error;
  }
}
```

---

## 📝 NOTAS FINALES

### Validaciones Críticas
- ✅ NUNCA inventar datos
- ✅ Validar que hay datos suficientes antes de analizar
- ✅ Todos los cálculos deben ser verificables
- ✅ Los porcentajes deben sumar 100% (con tolerancia)
- ✅ Los totales deben coincidir con sumas individuales

### Optimizaciones
- Cachear análisis recientes (no recalcular si es < 24h)
- Límites de transacciones para análisis (últimas 500)
- Procesamiento en background para análisis pesados
- Paginación en UI para grandes volúmenes de datos

### Seguridad
- RLS en todas las tablas nuevas
- Validación de créditos en backend
- Rate limiting en análisis
- Logs de todas las operaciones

---

## 📊 ESTADO ACTUAL DE IMPLEMENTACIÓN

### ✅ COMPLETADO

**Fase 1: Base**
- ✅ `DataCollector` - Recolector de datos completo
- ✅ `ScoreCalculator` - Calculador de puntaje 0-100
- ✅ `TransactionAnalyzer` - Análisis por transacción
- ✅ `DeepFinanceEngine` - Motor principal
- ✅ Tablas SQL (`deepfinance_analyses`, `deepfinance_credits`, `deepfinance_credit_purchases`)
- ✅ Hooks React (`useDeepFinance`, `useDeepFinanceCredits`)
- ✅ Integración con IA (DeepSeek/Qwen)
- ✅ `AIService` - Servicio de IA completo

**Fase 1.2: PatternAnalyzer**
- ✅ `PatternAnalyzer` - Analizador completo de patrones
  - ✅ Patrones temporales (día, hora, mes, fin de semana)
  - ✅ Patrones por categoría (dominante, crecientes)
  - ✅ Patrones de comportamiento (repetitivos, irregulares, consistencia)
  - ✅ Tendencias generales
  - ✅ Cumplimiento de presupuestos
- ✅ Integración completa con `DeepFinanceEngine`

### 🔄 EN PROGRESO

**Fase 2: Análisis Avanzado**
- ⏳ `LeakageAnalyzer` - Detección de fugas financieras
- ⏳ `EmotionalAnalyzer` - Análisis emocional avanzado
- ⏳ `RiskAnalyzer` - Análisis de riesgo avanzado

### ⏳ PENDIENTE

**Fase 3: Avanzado**
- ⏳ `SavingsCalculator` - Proyecciones de ahorro
- ⏳ Generador de PDF premium
- ⏳ Reportes estructurados

**Fase 4: Monetización**
- ✅ Sistema de créditos (backend)
- ✅ Límites semanales/mensuales (backend)
- ⏳ Checkout de créditos con Mercado Pago
- ⏳ UI de compra de créditos

---

**Siguiente paso**: Implementar Fase 1.3 (LeakageAnalyzer + EmotionalAnalyzer avanzado).

