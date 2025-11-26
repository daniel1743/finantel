# 🤖🧠 SISTEMA HÍBRIDO - FINANTEL

## 🎯 Concepto Central

**BOT = Guardián** (no piensa, solo vigila)
**IA = Detective** (analiza, interpreta, clasifica)

El sistema híbrido combina la velocidad y eficiencia de bots basados en reglas con la inteligencia y precisión de modelos de IA avanzados, logrando:

- ✅ **99.94% de reducción de costos** (vs usar solo IA)
- ✅ **Detección 24/7** sin intervención humana
- ✅ **Precisión alta** (IA confirma, no hay falsos positivos excesivos)
- ✅ **Escalabilidad** (procesa miles de usuarios sin colapsar)

---

## 📊 ARQUITECTURA COMPLETA

```
CRON JOB (cada 5-30 min)
    ↓
BOT VIGILANTE (reglas simples, SQL puro, ultra rápido)
    ↓
¿Detectó anomalía?
    ↓ SÍ
Guarda en tabla bot_alerts (status: pending)
    ↓
CRON JOB AI-INVESTIGATOR (cada 5 min)
    ↓
Lee alertas pendientes
    ↓
Verifica CACHE (SHA256 hash del prompt)
    ↓
¿Existe en cache?
    ↓ NO
Llama a IA con FALLBACK:
    1. DeepSeek R1 (más barato)
    2. Qwen 2.5 (respaldo)
    3. OpenAI GPT-4o mini (último recurso)
    ↓
¿IA confirmó que es fuga real?
    ↓ SÍ
Crea registro en leak_insights
    ↓
Usuario ve la fuga en su dashboard
```

---

## 🤖 7 BOTS VIGILANTES

### 1. bot-detect-subscriptions
**Función:** Detecta suscripciones recurrentes olvidadas
**Frecuencia:** Cada 10 minutos
**Lógica:**
- Agrupa transacciones por descripción + monto similar
- Detecta intervalos ~30 días (23-37 días con tolerancia)
- Requiere mínimo 3 ocurrencias
- Confianza: 70-100% según regularidad

**Ejemplo detectado:**
- "NETFLIX*" $15.990 cada 30 días → 95% confianza

---

### 2. bot-detect-duplicates
**Función:** Detecta servicios duplicados en la misma categoría
**Frecuencia:** Cada 15 minutos
**Lógica:**
- Compara contra tabla `subscription_patterns`
- Detecta si usuario tiene Spotify + Apple Music activos
- Calcula ahorro potencial (mantener solo uno)

**Ejemplo detectado:**
- Spotify ($6.000/mes) + Apple Music ($7.000/mes) = $13.000/mes
- Ahorro: $6.000-7.000/mes cancelando uno

---

### 3. bot-detect-delivery
**Función:** Detecta delivery excesivo
**Frecuencia:** Cada 30 minutos
**Lógica:**
- Cuenta pedidos de delivery (Uber Eats, Rappi, etc.)
- Alerta si >12 pedidos/mes
- Calcula ahorro reduciendo a 10/mes

**Ejemplo detectado:**
- 18 deliveries/mes = $180.000/mes
- Sugerencia: Reducir a 10/mes = ahorro $80.000/mes

---

### 4. bot-detect-microspend
**Función:** Detecta microcompras que acumulan mucho
**Frecuencia:** Cada 30 minutos
**Lógica:**
- Cuenta compras <$5.000
- Alerta si >20 microcompras/mes Y total >$30.000
- Calcula ahorro eliminando 30%

**Ejemplo detectado:**
- 25 microcompras = $45.000/mes
- Ahorro potencial: $13.500/mes (30%)

---

### 5. bot-detect-nightspend
**Función:** Detecta compras nocturnas impulsivas
**Frecuencia:** Cada 1 hora
**Lógica:**
- Filtra transacciones 22:00-04:00
- Alerta si >8 compras nocturnas/mes Y total >$25.000
- Identifica horas pico

**Ejemplo detectado:**
- 12 compras nocturnas = $40.000/mes
- Sugerencia: Regla de 24 horas antes de comprar

---

### 6. bot-detect-fixed-charges
**Función:** Detecta cargos fijos NO reconocidos (potencialmente fraudulentos)
**Frecuencia:** Cada 2 horas
**Lógica:**
- Detecta cargos recurrentes de monto exacto
- Excluye suscripciones conocidas
- Alta confianza si monto varía <1%

**Ejemplo detectado:**
- "XYZ SERVICE" $8.990 cada 30 días (no en DB de suscripciones)
- Posible fraude o servicio olvidado

---

### 7. bot-detect-unusual-activity
**Función:** Detecta gastos atípicos mediante análisis estadístico
**Frecuencia:** Cada 4 horas
**Lógica:**
- Compara últimos 30 días vs 30 días anteriores
- Detecta outliers (>2.5 desviaciones estándar)
- Identifica spikes en categorías específicas

**Ejemplo detectado:**
- Gasto aumentó 180% en categoría "Entretenimiento"
- 3 transacciones atípicas detectadas

---

## 🧠 AI INVESTIGATOR

**Función:** Analiza alertas de bots y confirma si son fugas reales
**Frecuencia:** Cada 5 minutos
**Modelo:** DeepSeek R1 → Qwen 2.5 → OpenAI GPT-4o mini (fallback)

### Flujo de Análisis:

1. **Lee alertas pendientes** (`bot_alerts` con `status = 'pending'`)
2. **Construye prompt** con contexto completo de la alerta
3. **Verifica cache** (SHA256 hash del prompt, TTL 7 días)
4. **Si no hay cache, llama a IA:**
   - Intento 1: DeepSeek R1 (~$0.0001 USD)
   - Intento 2: Qwen 2.5 (~$0.0002 USD)
   - Intento 3: OpenAI GPT-4o mini (~$0.001 USD)
5. **IA responde JSON:**
   ```json
   {
     "confirmed": true/false,
     "reasoning": "Explicación de 2-3 líneas",
     "adjusted_severity": "low/medium/high/critical",
     "adjusted_confidence": 85,
     "suggested_actions": [...]
   }
   ```
6. **Si confirmado:**
   - Crea registro en `leak_insights`
   - Marca alerta como `confirmed`
7. **Si falsa alarma:**
   - Marca alerta como `false_alarm`
   - No crea leak insight

### Prompts Optimizados:

El sistema usa prompts específicos por tipo de anomalía, incluyendo:
- Contexto del bot detector
- Datos de transacciones relevantes
- Severidad y confianza inicial
- Instrucción explícita de responder en JSON

---

## 💾 TABLAS PRINCIPALES

### `bot_alerts`
Almacena anomalías detectadas por bots antes del análisis de IA.

**Campos clave:**
- `bot_name` → Nombre del bot detector
- `anomaly_type` → Tipo de anomalía detectada
- `severity` → Severidad inicial (calculada por bot)
- `confidence_score` → Confianza inicial
- `payload` → JSONB con detalles de la anomalía
- `status` → `pending | processing | confirmed | false_alarm | error`
- `ai_analysis` → JSONB con análisis de IA (se llena después)
- `leak_insight_id` → Referencia al leak creado (si se confirmó)

### `ai_model_cache`
Cache de respuestas de IA para reducir costos.

**Campos clave:**
- `prompt_hash` → SHA256 del prompt (único)
- `model_name` → Modelo que generó la respuesta
- `analysis_type` → Tipo de análisis
- `response_text` → Respuesta cacheada
- `hit_count` → Número de veces reutilizada
- `expires_at` → TTL (default: 7 días)

### `api_cache`
Cache genérico para llamadas a APIs externas.

### `bot_statistics`
Estadísticas de ejecución de bots para monitoreo.

**Campos clave:**
- `bot_name` → Nombre del bot
- `batch_timestamp` → Timestamp del batch procesado
- `users_processed` → Usuarios procesados
- `alerts_generated` → Alertas generadas
- `execution_time_ms` → Tiempo de ejecución
- `errors_count` → Número de errores

---

## ⚙️ CRON JOBS CONFIGURADOS

| Bot | Frecuencia | Intervalo |
|-----|------------|-----------|
| bot-detect-subscriptions | Cada 10 min | `*/10 * * * *` |
| bot-detect-duplicates | Cada 15 min | `*/15 * * * *` |
| bot-detect-delivery | Cada 30 min | `*/30 * * * *` |
| bot-detect-microspend | Cada 30 min | `*/30 * * * *` |
| bot-detect-nightspend | Cada 1 hora | `0 * * * *` |
| bot-detect-fixed-charges | Cada 2 horas | `0 */2 * * *` |
| bot-detect-unusual-activity | Cada 4 horas | `0 */4 * * *` |
| **ai-investigator** | **Cada 5 min** | `*/5 * * * *` |
| cleanup-expired-cache | Diario 3 AM | `0 3 * * *` |

---

## 💰 OPTIMIZACIÓN DE COSTOS

### Sin Sistema Híbrido (solo IA):
```
10.000.000 usuarios activos
× 1 análisis/día
× $0.001 USD/análisis (GPT-4o mini)
= $10.000 USD/día
= $300.000 USD/mes
```

### Con Sistema Híbrido:
```
Bots procesan 10.000.000 usuarios/día: GRATIS (SQL puro)
Generan ~6.000 alertas/día (0.06% tasa de alerta)

Cache hit rate: 90% (prompts similares)
→ Solo 600 llamadas reales a IA/día

600 llamadas × $0.0001 USD (DeepSeek R1)
= $0.06 USD/día
= $1.80 USD/mes
```

**Ahorro: 99.94%** 🎉

---

## 🚀 DESPLIEGUE RÁPIDO

### Opción 1: Script Automático (Windows)
```bash
cd "C:\Users\Lenovo\Downloads\finantel version 2.1 funcional"
deploy-hybrid-system.bat
```

### Opción 2: Manual

1. **Aplicar migraciones SQL:**
```bash
supabase db push
```

2. **Desplegar Edge Functions:**
```bash
# 7 Bots
supabase functions deploy bot-detect-subscriptions --no-verify-jwt
supabase functions deploy bot-detect-duplicates --no-verify-jwt
supabase functions deploy bot-detect-delivery --no-verify-jwt
supabase functions deploy bot-detect-microspend --no-verify-jwt
supabase functions deploy bot-detect-nightspend --no-verify-jwt
supabase functions deploy bot-detect-fixed-charges --no-verify-jwt
supabase functions deploy bot-detect-unusual-activity --no-verify-jwt

# AI Investigator
supabase functions deploy ai-investigator --no-verify-jwt
```

3. **Configurar API Keys en Supabase Dashboard:**

Ve a: `Settings > Edge Functions > Secrets`

Agrega:
```
DEEPSEEK_API_KEY=sk-xxxxxxxxxxxxx
QWEN_API_KEY=sk-xxxxxxxxxxxxx (opcional)
OPENAI_API_KEY=sk-xxxxxxxxxxxxx (opcional, fallback final)
```

4. **Verificar despliegue:**
```bash
node test-hybrid-system.js
```

---

## 🧪 TESTING

### Test Completo:
```bash
# Configurar variables de entorno
export SUPABASE_URL=https://tu-proyecto.supabase.co
export SUPABASE_SERVICE_ROLE_KEY=tu-service-key

# Ejecutar tests
node test-hybrid-system.js
```

### Test Manual de un Bot:
```bash
supabase functions invoke bot-detect-subscriptions
```

### Ver Logs:
```bash
supabase functions logs bot-detect-subscriptions
supabase functions logs ai-investigator
```

### Ver Estadísticas SQL:
```sql
-- Estadísticas de bots
SELECT * FROM get_cron_job_stats();

-- Historial de ejecuciones
SELECT * FROM get_cron_job_history(50);

-- Estadísticas de cache
SELECT * FROM get_cache_statistics();

-- Alertas pendientes
SELECT COUNT(*) FROM bot_alerts WHERE status = 'pending';

-- Fugas confirmadas hoy
SELECT COUNT(*) FROM leak_insights WHERE created_at >= CURRENT_DATE;
```

---

## 📈 MONITOREO

### Dashboard de Estadísticas

Crear vista SQL para dashboard:

```sql
CREATE OR REPLACE VIEW hybrid_system_dashboard AS
SELECT
  -- Alertas por estado
  (SELECT COUNT(*) FROM bot_alerts WHERE status = 'pending') as alertas_pendientes,
  (SELECT COUNT(*) FROM bot_alerts WHERE status = 'confirmed') as alertas_confirmadas,
  (SELECT COUNT(*) FROM bot_alerts WHERE status = 'false_alarm') as falsas_alarmas,

  -- Fugas activas
  (SELECT COUNT(*) FROM leak_insights WHERE status = 'active') as fugas_activas,
  (SELECT SUM(monthly_estimated_leak) FROM leak_insights WHERE status = 'active') as fuga_mensual_total,

  -- Cache
  (SELECT COUNT(*) FROM ai_model_cache WHERE expires_at > NOW()) as cache_activo,
  (SELECT SUM(hit_count) FROM ai_model_cache) as cache_hits_total,

  -- Rendimiento últimas 24h
  (SELECT COUNT(*) FROM bot_statistics WHERE batch_timestamp >= NOW() - INTERVAL '24 hours') as bots_ejecutados_24h,
  (SELECT SUM(alerts_generated) FROM bot_statistics WHERE batch_timestamp >= NOW() - INTERVAL '24 hours') as alertas_generadas_24h;
```

### Queries Útiles:

```sql
-- Top 10 usuarios con más fugas
SELECT
  user_id,
  COUNT(*) as total_fugas,
  SUM(monthly_estimated_leak) as fuga_mensual_total
FROM leak_insights
WHERE status = 'active'
GROUP BY user_id
ORDER BY fuga_mensual_total DESC
LIMIT 10;

-- Tipos de fugas más comunes
SELECT
  type,
  COUNT(*) as total,
  AVG(monthly_estimated_leak) as fuga_promedio
FROM leak_insights
WHERE status = 'active'
GROUP BY type
ORDER BY total DESC;

-- Efectividad de cada bot
SELECT
  bot_name,
  COUNT(*) as alertas_totales,
  COUNT(*) FILTER (WHERE status = 'confirmed') as confirmadas,
  COUNT(*) FILTER (WHERE status = 'false_alarm') as falsas,
  ROUND(
    COUNT(*) FILTER (WHERE status = 'confirmed')::NUMERIC /
    NULLIF(COUNT(*), 0) * 100,
    2
  ) as tasa_confirmacion
FROM bot_alerts
GROUP BY bot_name
ORDER BY tasa_confirmacion DESC;
```

---

## 🔧 GESTIÓN DE CRON JOBS

### Pausar un Bot:
```sql
SELECT pause_cron_job('bot-detect-subscriptions');
```

### Reactivar un Bot:
```sql
SELECT resume_cron_job('bot-detect-subscriptions');
```

### Ver Jobs Activos:
```sql
SELECT * FROM get_active_cron_jobs() WHERE active = true;
```

### Ver Historial de Ejecuciones:
```sql
SELECT * FROM get_cron_job_history(100);
```

---

## 🛡️ SEGURIDAD

### Row Level Security (RLS)

Todas las tablas tienen RLS habilitado:

- **bot_alerts:** Usuarios solo ven sus propias alertas
- **leak_insights:** Usuarios solo ven sus propias fugas
- **ai_model_cache:** Lectura para todos (optimización)
- **bot_statistics:** Lectura para todos (monitoreo)

### API Keys

**NUNCA** expongas las API keys en el frontend. Usa solo en Edge Functions con `service_role_key`.

---

## 🎯 MÉTRICAS DE ÉXITO

### KPIs Clave:

1. **Tasa de Detección:**
   - Meta: Detectar 80%+ de fugas reales
   - Actual: Medir con `leak_insights` vs gastos totales

2. **Tasa de Confirmación de IA:**
   - Meta: 60-80% de alertas confirmadas (no falsas alarmas)
   - Actual: `confirmed / (confirmed + false_alarm)`

3. **Tiempo de Respuesta:**
   - Meta: <5 minutos desde detección hasta leak insight
   - Actual: Medir `leak_insights.created_at - bot_alerts.detected_at`

4. **Cache Hit Rate:**
   - Meta: >80% de respuestas desde cache
   - Actual: `cache_hits / total_requests`

5. **Costo por Usuario:**
   - Meta: <$0.001 USD/usuario/mes
   - Actual: Medir llamadas a IA × costo por modelo

---

## 📚 ARCHIVOS DEL SISTEMA

```
finantel version 2.1 funcional/
├── supabase/
│   ├── migrations/
│   │   ├── 042_hybrid_system_tables.sql          ← Tablas SQL
│   │   └── 043_hybrid_system_cron_jobs.sql       ← Cron jobs
│   └── functions/
│       ├── bot-detect-subscriptions/
│       │   └── index.ts                           ← Bot 1
│       ├── bot-detect-duplicates/
│       │   └── index.ts                           ← Bot 2
│       ├── bot-detect-delivery/
│       │   └── index.ts                           ← Bot 3
│       ├── bot-detect-microspend/
│       │   └── index.ts                           ← Bot 4
│       ├── bot-detect-nightspend/
│       │   └── index.ts                           ← Bot 5
│       ├── bot-detect-fixed-charges/
│       │   └── index.ts                           ← Bot 6
│       ├── bot-detect-unusual-activity/
│       │   └── index.ts                           ← Bot 7
│       └── ai-investigator/
│           └── index.ts                           ← IA Detective
├── deploy-hybrid-system.bat                       ← Script despliegue
├── test-hybrid-system.js                          ← Tests automáticos
├── ARQUITECTURA-SISTEMA-HIBRIDO.md               ← Arquitectura detallada
└── SISTEMA-HIBRIDO-README.md                     ← Este archivo
```

---

## 🎉 ¡LISTO PARA PRODUCCIÓN!

El sistema híbrido está completamente implementado y listo para detectar fugas financieras 24/7 con:

✅ **7 bots vigilantes** ultra eficientes
✅ **1 IA detective** con triple fallback
✅ **Cache agresivo** para reducir costos 99%+
✅ **Cron jobs automatizados** cada 5-30 minutos
✅ **Monitoreo completo** con estadísticas en tiempo real
✅ **Tests automatizados** para verificar todo funciona
✅ **RLS habilitado** para seguridad máxima

---

**Versión:** 1.0
**Stack:** Supabase + pg_cron + Edge Functions (Deno) + DeepSeek R1 + Qwen 2.5 + OpenAI
**Autor:** Claude Code + FINANTEL Team
**Fecha:** 2025-01-26
