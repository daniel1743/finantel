# 🏗️ ARQUITECTURA SISTEMA HÍBRIDO - FINANTEL

## 🎯 PRINCIPIO FUNDAMENTAL

**BOT = GUARDIÁN** (no piensa, solo vigila)
**IA = DETECTIVE** (interpreta, clasifica, explica)

---

## 📐 ARQUITECTURA COMPLETA

```
┌─────────────────────────────────────────────────────────────────┐
│                         FINANTEL APP                            │
│                     (React Frontend)                            │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         │ User interactions
                         │
┌────────────────────────▼────────────────────────────────────────┐
│                      SUPABASE                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                  PostgreSQL DB                            │  │
│  │  • transactions                                          │  │
│  │  • leak_insights                                         │  │
│  │  • subscription_patterns                                 │  │
│  │  • bot_alerts (NEW)                                      │  │
│  │  • ai_model_cache (NEW)                                  │  │
│  │  • api_cache (NEW)                                       │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              EDGE FUNCTIONS (Deno)                        │  │
│  │                                                           │  │
│  │  🤖 BOTS VIGILANTES (Rule-Based, Ultra Fast)            │  │
│  │  ├─ bot-detect-subscriptions                            │  │
│  │  ├─ bot-detect-duplicates                               │  │
│  │  ├─ bot-detect-delivery                                 │  │
│  │  ├─ bot-detect-microspend                               │  │
│  │  ├─ bot-detect-nightspend                               │  │
│  │  ├─ bot-detect-fixed-charges                            │  │
│  │  └─ bot-detect-unusual-activity                         │  │
│  │                                                           │  │
│  │  🧠 IA INVESTIGADORA (Smart Analysis)                   │  │
│  │  └─ ai-investigator                                      │  │
│  │     ├─ DeepSeek R1 (primary)                            │  │
│  │     ├─ Qwen 2.5 (fallback)                              │  │
│  │     └─ OpenAI GPT-4o mini (last resort)                 │  │
│  │                                                           │  │
│  │  🔧 UTILITIES                                            │  │
│  │  ├─ cache-manager                                        │  │
│  │  └─ batch-processor                                      │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              CRON JOBS (Every 5-10 min)                   │  │
│  │                                                           │  │
│  │  ⏰ pg_cron Scheduler                                     │  │
│  │  ├─ */5  * * * * → bot-detect-subscriptions             │  │
│  │  ├─ */10 * * * * → bot-detect-duplicates                │  │
│  │  ├─ */5  * * * * → bot-detect-delivery                  │  │
│  │  ├─ */10 * * * * → bot-detect-microspend                │  │
│  │  ├─ */5  * * * * → bot-detect-nightspend                │  │
│  │  ├─ */10 * * * * → bot-detect-fixed-charges             │  │
│  │  └─ */15 * * * * → bot-detect-unusual-activity          │  │
│  └──────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────┘
                         │
                         │ API calls (fallback chain)
                         │
┌────────────────────────▼────────────────────────────────────────┐
│                    EXTERNAL AI APIS                             │
│                                                                  │
│  ┌─────────────┐   ┌─────────────┐   ┌─────────────┐          │
│  │ DeepSeek R1 │→ │  Qwen 2.5   │→ │  OpenAI     │          │
│  │  (Primary)  │   │  (Fallback) │   │ (Last Resort)│          │
│  │  ~$0.0001   │   │  ~$0.0002   │   │  ~$0.001    │          │
│  └─────────────┘   └─────────────┘   └─────────────┘          │
└──────────────────────────────────────────────────────────────────┘
```

---

## 🔄 FLUJO COMPLETO DEL SISTEMA

### 1️⃣ FASE DE VIGILANCIA (Bots)

```
CRON JOB (cada 5-10 min)
    ↓
BOT VIGILANTE se ejecuta
    ↓
Lee SOLO transacciones recientes (últimas 24-48h)
    ↓
Aplica REGLAS SIMPLES (no IA)
    ├─ ¿Monto repetido mensual? → suscripción
    ├─ ¿Horario 22:00-05:00? → compra nocturna
    ├─ ¿Delivery > 12/mes? → delivery excesivo
    └─ ...
    ↓
¿Anomalía detectada?
    ├─ NO → Termina (súper rápido)
    └─ SÍ → Emite ALERTA (JSON)
           ↓
           Guarda en tabla "bot_alerts"
           ↓
           Llama a ai-investigator
```

### 2️⃣ FASE DE INVESTIGACIÓN (IA)

```
ai-investigator recibe alerta
    ↓
Verifica si YA existe insight similar (evita duplicados)
    ├─ SÍ → Actualiza existing
    └─ NO → Continúa
        ↓
        Analiza contexto completo
        ├─ Transacciones relacionadas
        ├─ Patrones históricos
        └─ Metadata del usuario
        ↓
        Llama IA con FALLBACK:
        ┌──────────────────────┐
        │ 1. DeepSeek R1       │ ← Intenta primero
        │    ↓ (si falla)      │
        │ 2. Qwen 2.5          │ ← Segundo intento
        │    ↓ (si falla)      │
        │ 3. OpenAI GPT-4o mini│ ← Último recurso
        │    ↓ (si TODO falla) │
        │ 4. Status: pending   │ ← Revisión manual
        └──────────────────────┘
        ↓
        IA retorna:
        {
          "is_real_leak": true,
          "monthly_leak": 45000,
          "severity": "high",
          "description": "...",
          "suggested_actions": [...]
        }
        ↓
        Guarda en "leak_insights"
        ↓
        Cachea respuesta (evita llamar IA dos veces para lo mismo)
```

### 3️⃣ FASE DE PRESENTACIÓN (Frontend)

```
Usuario abre LeakHunterPanel
    ↓
Lee leak_insights con status = "active"
    ↓
Muestra fugas detectadas
    ↓
Usuario hace clic → "Marcar como resuelto"
    ↓
Actualiza status = "resolved"
```

---

## 📊 RESPONSABILIDADES POR MÓDULO

### 🤖 BOTS VIGILANTES

**Responsabilidad:** Detectar patrones rápidamente SIN pensar

**Características:**
- ✅ Ultra rápidos (procesamiento en lotes)
- ✅ Solo lee datos recientes (24-48h)
- ✅ Reglas simples (if/else, comparaciones)
- ✅ NO llama IA
- ✅ NO interpreta contexto
- ✅ Solo emite alertas con datos crudos

**Output:**
```json
{
  "alert_type": "delivery_excessive",
  "user_id": "uuid",
  "anomaly_score": 87,
  "summary": "18 deliveries este mes",
  "related_transactions": ["id1", "id2", ...],
  "details": {
    "count": 18,
    "total_amount": 180000,
    "avg_per_delivery": 10000
  },
  "detected_at": "2025-01-15T14:30:00Z"
}
```

**Lista de Bots:**
1. `bot-detect-subscriptions` → Suscripciones ocultas
2. `bot-detect-duplicates` → Servicios duplicados
3. `bot-detect-delivery` → Delivery excesivo
4. `bot-detect-microspend` → Microcompras acumuladas
5. `bot-detect-nightspend` → Compras nocturnas
6. `bot-detect-fixed-charges` → Cargos fijos repetidos
7. `bot-detect-unusual-activity` → Gastos inusuales vs promedio

---

### 🧠 IA INVESTIGADORA

**Responsabilidad:** Analizar, interpretar, clasificar

**Características:**
- ✅ Recibe alerta del bot
- ✅ Analiza contexto completo
- ✅ Determina si es fuga REAL
- ✅ Calcula impacto mensual/anual
- ✅ Genera descripción humana
- ✅ Sugiere acciones concretas
- ✅ Usa fallback automático

**Input:**
```json
{
  "alert": { /* alerta del bot */ },
  "user_context": {
    "total_income": 1500000,
    "avg_monthly_expense": 900000,
    "existing_leaks": 3
  }
}
```

**Output:**
```json
{
  "is_real_leak": true,
  "type": "delivery_excesivo",
  "monthly_estimated_leak": 80000,
  "severity": "high",
  "confidence": 92,
  "description": "Estás gastando aprox. $180.000/mes en delivery...",
  "suggested_actions": [
    {
      "action": "reduce",
      "description": "Reducir a 10/mes ahorraría $80.000",
      "estimated_saving": 80000
    }
  ],
  "ai_model_used": "deepseek-r1",
  "processing_time_ms": 850
}
```

---

### 💾 SISTEMA DE CACHE

**Objetivo:** Reducir costos de IA y acelerar respuestas

**Tablas:**

1. **api_cache** (cache genérico)
   ```sql
   CREATE TABLE api_cache (
     cache_key TEXT PRIMARY KEY,
     cache_value JSONB NOT NULL,
     expires_at TIMESTAMPTZ NOT NULL,
     created_at TIMESTAMPTZ DEFAULT NOW()
   );
   ```

2. **ai_model_cache** (cache específico de IA)
   ```sql
   CREATE TABLE ai_model_cache (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     prompt_hash TEXT UNIQUE NOT NULL, -- SHA256 del prompt
     model_name TEXT NOT NULL,
     response JSONB NOT NULL,
     tokens_used INTEGER,
     cost_usd NUMERIC(10,6),
     hit_count INTEGER DEFAULT 1,
     expires_at TIMESTAMPTZ NOT NULL,
     created_at TIMESTAMPTZ DEFAULT NOW()
   );
   ```

**Lógica:**
```typescript
async function callAIWithCache(prompt: string, model: string) {
  // 1. Generar hash del prompt
  const hash = await sha256(prompt);

  // 2. Buscar en cache
  const cached = await supabase
    .from('ai_model_cache')
    .select('*')
    .eq('prompt_hash', hash)
    .gt('expires_at', new Date().toISOString())
    .single();

  if (cached.data) {
    // 3. Cache HIT → incrementar contador
    await supabase
      .from('ai_model_cache')
      .update({ hit_count: cached.data.hit_count + 1 })
      .eq('id', cached.data.id);

    return cached.data.response;
  }

  // 4. Cache MISS → llamar IA
  const response = await callAI(prompt, model);

  // 5. Guardar en cache
  await supabase.from('ai_model_cache').insert({
    prompt_hash: hash,
    model_name: model,
    response,
    expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 días
  });

  return response;
}
```

---

### ⏰ CRON JOBS

**Configuración:**
```sql
-- Instalar pg_cron
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Bot 1: Suscripciones (cada 5 min)
SELECT cron.schedule(
  'bot-detect-subscriptions',
  '*/5 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://[PROJECT].supabase.co/functions/v1/bot-detect-subscriptions',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer [KEY]"}'::jsonb,
    body := '{}'::jsonb
  );
  $$
);

-- Bot 2: Duplicados (cada 10 min)
SELECT cron.schedule(
  'bot-detect-duplicates',
  '*/10 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://[PROJECT].supabase.co/functions/v1/bot-detect-duplicates',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer [KEY]"}'::jsonb
  );
  $$
);

-- Bot 3: Delivery (cada 5 min)
SELECT cron.schedule(
  'bot-detect-delivery',
  '*/5 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://[PROJECT].supabase.co/functions/v1/bot-detect-delivery',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer [KEY]"}'::jsonb
  );
  $$
);

-- Bot 4: Microcompras (cada 10 min)
SELECT cron.schedule(
  'bot-detect-microspend',
  '*/10 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://[PROJECT].supabase.co/functions/v1/bot-detect-microspend',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer [KEY]"}'::jsonb
  );
  $$
);

-- Bot 5: Compras nocturnas (cada 5 min)
SELECT cron.schedule(
  'bot-detect-nightspend',
  '*/5 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://[PROJECT].supabase.co/functions/v1/bot-detect-nightspend',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer [KEY]"}'::jsonb
  );
  $$
);

-- Bot 6: Cargos fijos (cada 10 min)
SELECT cron.schedule(
  'bot-detect-fixed-charges',
  '*/10 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://[PROJECT].supabase.co/functions/v1/bot-detect-fixed-charges',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer [KEY]"}'::jsonb
  );
  $$
);

-- Bot 7: Actividad inusual (cada 15 min)
SELECT cron.schedule(
  'bot-detect-unusual-activity',
  '*/15 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://[PROJECT].supabase.co/functions/v1/bot-detect-unusual-activity',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer [KEY]"}'::jsonb
  );
  $$
);
```

---

## ⚡ OPTIMIZACIONES

### 1. Batch Processing
```typescript
// Procesar usuarios en lotes de 100
const BATCH_SIZE = 100;

for (let offset = 0; offset < totalUsers; offset += BATCH_SIZE) {
  const users = await supabase
    .from('users')
    .select('id')
    .range(offset, offset + BATCH_SIZE - 1);

  await Promise.all(users.map(u => detectAnomalies(u.id)));
}
```

### 2. Evitar Duplicados
```typescript
// Antes de crear leak_insight, verificar si existe uno similar
const existing = await supabase
  .from('leak_insights')
  .select('id')
  .eq('user_id', userId)
  .eq('type', alertType)
  .eq('status', 'active')
  .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
  .single();

if (existing.data) {
  // Ya existe uno similar → actualizar en vez de crear
  await supabase
    .from('leak_insights')
    .update({ last_detected_at: new Date(), ...updates })
    .eq('id', existing.data.id);
} else {
  // No existe → crear nuevo
  await supabase.from('leak_insights').insert({...});
}
```

### 3. Índices Optimizados
```sql
-- Índices para bots (lecturas rápidas)
CREATE INDEX idx_transactions_recent
  ON transactions(user_id, created_at DESC)
  WHERE created_at >= NOW() - INTERVAL '48 hours';

CREATE INDEX idx_transactions_nocturnal
  ON transactions(user_id, created_at)
  WHERE EXTRACT(HOUR FROM created_at) >= 22 OR EXTRACT(HOUR FROM created_at) <= 5;

CREATE INDEX idx_leak_insights_active
  ON leak_insights(user_id, type, status)
  WHERE status = 'active';
```

---

## 💰 REDUCCIÓN DE COSTOS

### Estrategia de Costos:

1. **Bots = GRATIS** (solo SQL, sin IA)
2. **IA solo cuando es necesario** (bot detecta primero)
3. **Cache agresivo** (7 días de TTL)
4. **Fallback inteligente** (DeepSeek primero, más barato)
5. **Batch processing** (procesar muchos usuarios a la vez)

### Estimación de Costos:

**Escenario:** 10,000 usuarios activos

**Sin optimización:**
- 7 bots × 10,000 usuarios × 144 ejecuciones/día = 10.08M llamadas/día
- Si cada una usa IA: 10.08M × $0.001 = **$10,080 USD/día** ❌

**Con optimización:**
- 7 bots × 10,000 usuarios × 144 ejecuciones/día = 10.08M llamadas/día
- Solo 5% detectan anomalía: 504,000 anomalías/día
- Solo 30% son fugas reales (IA analiza): 151,200 llamadas IA/día
- Cache hit rate 60%: 60,480 llamadas IA reales
- DeepSeek ($0.0001): 60,480 × $0.0001 = **$6.05 USD/día** ✅

**Ahorro: 99.94%** 🎉

---

## 🔒 SEGURIDAD

### Row Level Security (RLS):
```sql
-- Solo el usuario puede ver sus propias alertas
CREATE POLICY "Users can view own bot alerts"
  ON bot_alerts
  FOR SELECT
  USING (auth.uid() = user_id);

-- Solo service role puede insertar alertas
CREATE POLICY "Service role can insert alerts"
  ON bot_alerts
  FOR INSERT
  WITH CHECK (auth.role() = 'service_role');
```

### Rate Limiting:
```typescript
// Límite de llamadas por usuario
const RATE_LIMIT = 100; // llamadas por hora

const callCount = await supabase
  .from('api_calls_log')
  .select('count')
  .eq('user_id', userId)
  .gte('created_at', new Date(Date.now() - 60 * 60 * 1000))
  .single();

if (callCount.data?.count >= RATE_LIMIT) {
  throw new Error('Rate limit exceeded');
}
```

---

## 📈 MÉTRICAS Y MONITOREO

### Métricas clave:
```sql
-- Dashboard de bots
SELECT
  alert_type,
  COUNT(*) as total_alerts,
  AVG(anomaly_score) as avg_score,
  COUNT(DISTINCT user_id) as affected_users
FROM bot_alerts
WHERE created_at >= NOW() - INTERVAL '24 hours'
GROUP BY alert_type
ORDER BY total_alerts DESC;

-- Efectividad de IA
SELECT
  ai_model_used,
  COUNT(*) as total_calls,
  AVG(confidence) as avg_confidence,
  SUM(CASE WHEN is_real_leak THEN 1 ELSE 0 END) * 100.0 / COUNT(*) as precision_rate
FROM leak_insights
WHERE created_at >= NOW() - INTERVAL '7 days'
GROUP BY ai_model_used;

-- Cache hit rate
SELECT
  model_name,
  COUNT(*) as total_requests,
  SUM(hit_count) as total_hits,
  SUM(hit_count) * 100.0 / COUNT(*) as hit_rate_percent
FROM ai_model_cache
WHERE created_at >= NOW() - INTERVAL '7 days'
GROUP BY model_name;
```

---

## 🎯 PRÓXIMOS PASOS

1. ✅ Crear tablas nuevas (bot_alerts, ai_model_cache, api_cache)
2. ✅ Implementar 7 bots vigilantes
3. ✅ Implementar ai-investigator con fallback
4. ✅ Configurar cron jobs
5. ✅ Implementar sistema de cache
6. ✅ Crear tests automatizados
7. ✅ Deploy y monitoreo

---

**Versión:** 1.0
**Autor:** Claude Code + FINANTEL Team
**Fecha:** 2025-01-15
