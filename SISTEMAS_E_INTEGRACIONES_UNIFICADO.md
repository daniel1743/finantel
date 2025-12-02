# 📚 DOCUMENTACIÓN UNIFICADA: SISTEMAS E INTEGRACIONES - FINANTEL

**Versión:** 1.0  
**Fecha:** Diciembre 2024  
**Estado:** Documentación Completa

---

## 📋 ÍNDICE

1. [SISTEMAS](#sistemas)
   - Sistema Híbrido (Bots + IA)
   - Sistema de Notificaciones
   - Sistema de Tickets de Soporte
   - Sistema de Demo Gratuita
   - Arquitectura del Sistema Híbrido

2. [INTEGRACIONES](#integraciones)
   - Integración IA DeepFinance
   - Integración Logger/Sistema de Notificaciones
   - Integración Mercado Pago
   - Integración Google OAuth
   - Implementación Webhooks y Notificaciones

---

# 🏗️ SISTEMAS

## 1. SISTEMA HÍBRIDO - FINANTEL

### 🎯 Concepto Central

**BOT = Guardián** (no piensa, solo vigila)  
**IA = Detective** (analiza, interpreta, clasifica)

El sistema híbrido combina la velocidad y eficiencia de bots basados en reglas con la inteligencia y precisión de modelos de IA avanzados, logrando:

- ✅ **99.94% de reducción de costos** (vs usar solo IA)
- ✅ **Detección 24/7** sin intervención humana
- ✅ **Precisión alta** (IA confirma, no hay falsos positivos excesivos)
- ✅ **Escalabilidad** (procesa miles de usuarios sin colapsar)

### 📊 Arquitectura Completa

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

### 🤖 7 BOTS VIGILANTES

#### 1. bot-detect-subscriptions
- **Función:** Detecta suscripciones recurrentes olvidadas
- **Frecuencia:** Cada 10 minutos
- **Lógica:** Agrupa transacciones por descripción + monto similar, detecta intervalos ~30 días (23-37 días con tolerancia), requiere mínimo 3 ocurrencias
- **Confianza:** 70-100% según regularidad

#### 2. bot-detect-duplicates
- **Función:** Detecta servicios duplicados en la misma categoría
- **Frecuencia:** Cada 15 minutos
- **Lógica:** Compara contra tabla `subscription_patterns`, detecta si usuario tiene Spotify + Apple Music activos, calcula ahorro potencial

#### 3. bot-detect-delivery
- **Función:** Detecta delivery excesivo
- **Frecuencia:** Cada 30 minutos
- **Lógica:** Cuenta pedidos de delivery (Uber Eats, Rappi, etc.), alerta si >12 pedidos/mes, calcula ahorro reduciendo a 10/mes

#### 4. bot-detect-microspend
- **Función:** Detecta microcompras que acumulan mucho
- **Frecuencia:** Cada 30 minutos
- **Lógica:** Cuenta compras <$5.000, alerta si >20 microcompras/mes Y total >$30.000, calcula ahorro eliminando 30%

#### 5. bot-detect-nightspend
- **Función:** Detecta compras nocturnas impulsivas
- **Frecuencia:** Cada 1 hora
- **Lógica:** Filtra transacciones 22:00-04:00, alerta si >8 compras nocturnas/mes Y total >$25.000, identifica horas pico

#### 6. bot-detect-fixed-charges
- **Función:** Detecta cargos fijos NO reconocidos (potencialmente fraudulentos)
- **Frecuencia:** Cada 2 horas
- **Lógica:** Detecta cargos recurrentes de monto exacto, excluye suscripciones conocidas, alta confianza si monto varía <1%

#### 7. bot-detect-unusual-activity
- **Función:** Detecta gastos atípicos mediante análisis estadístico
- **Frecuencia:** Cada 4 horas
- **Lógica:** Compara últimos 30 días vs 30 días anteriores, detecta outliers (>2.5 desviaciones estándar), identifica spikes en categorías específicas

### 🧠 AI INVESTIGATOR

**Función:** Analiza alertas de bots y confirma si son fugas reales  
**Frecuencia:** Cada 5 minutos  
**Modelo:** DeepSeek R1 → Qwen 2.5 → OpenAI GPT-4o mini (fallback)

#### Flujo de Análisis:

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
6. **Si confirmado:** Crea registro en `leak_insights`, marca alerta como `confirmed`
7. **Si falsa alarma:** Marca alerta como `false_alarm`, no crea leak insight

### 💾 TABLAS PRINCIPALES

#### `bot_alerts`
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

#### `ai_model_cache`
Cache de respuestas de IA para reducir costos.

**Campos clave:**
- `prompt_hash` → SHA256 del prompt (único)
- `model_name` → Modelo que generó la respuesta
- `analysis_type` → Tipo de análisis
- `response_text` → Respuesta cacheada
- `hit_count` → Número de veces reutilizada
- `expires_at` → TTL (default: 7 días)

#### `api_cache`
Cache genérico para llamadas a APIs externas.

#### `bot_statistics`
Estadísticas de ejecución de bots para monitoreo.

**Campos clave:**
- `bot_name` → Nombre del bot
- `batch_timestamp` → Timestamp del batch procesado
- `users_processed` → Usuarios procesados
- `alerts_generated` → Alertas generadas
- `execution_time_ms` → Tiempo de ejecución
- `errors_count` → Número de errores

### ⚙️ CRON JOBS CONFIGURADOS

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

### 💰 OPTIMIZACIÓN DE COSTOS

#### Sin Sistema Híbrido (solo IA):
```
10.000.000 usuarios activos
× 1 análisis/día
× $0.001 USD/análisis (GPT-4o mini)
= $10.000 USD/día
= $300.000 USD/mes
```

#### Con Sistema Híbrido:
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

### 🚀 DESPLIEGUE RÁPIDO

#### Opción 1: Script Automático (Windows)
```bash
cd "C:\Users\Lenovo\Downloads\finantel version 2.1 funcional"
deploy-hybrid-system.bat
```

#### Opción 2: Manual

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

---

## 2. SISTEMA DE NOTIFICACIONES INTELIGENTES

### 🎯 ¿QUÉ ES ESTO?

Un sistema **simple, eficiente y escalable** que te permite:

✅ Ver todos los **errores** de tu app en tiempo real  
✅ Recibir **alertas** cuando algo va mal  
✅ Hacer **tracking de uso** (qué funciones usan más tus usuarios)  
✅ Monitorear **comportamiento de APIs**  
✅ Todo en **lenguaje humano**, sin tecnicismos raros  
✅ **Anti-spam automático** (no te satura con 1000 notificaciones del mismo error)

### 📦 ¿QUÉ INCLUYE?

#### 1. Base de Datos (PostgreSQL/Supabase)
- Tabla `system_notifications` - Guarda todas las notificaciones
- Tabla `system_metrics` - Métricas agregadas (opcional)
- Funciones SQL para consultas rápidas
- Row Level Security (RLS) configurado

#### 2. Backend (Edge Functions)
- Logger global: `logEvent()`
- Funciones precreadas:
  - `logError()` - Para errores
  - `logCriticalError()` - Para errores críticos
  - `logWarning()` - Para advertencias
  - `logInfo()` - Para información
  - `logUsage()` - Para tracking de uso
- Anti-spam automático (no duplicados en 5 minutos)
- Humanizador de notificaciones

#### 3. Frontend (React)
- Página completa: `/dashboard/system-notifications`
- Estadísticas en tiempo real
- Filtros por tipo y severidad
- Notificaciones en tiempo real (Realtime de Supabase)
- Marcar como leída
- Diseño profesional y responsive

### 🚀 INSTALACIÓN (5 MINUTOS)

#### Paso 1: Aplicar Migración SQL

En Supabase Dashboard > SQL Editor:

```sql
-- Copia y ejecuta el archivo:
supabase/migrations/046_system_notifications.sql
```

#### Paso 2: Ya está! 🎉

No necesitas instalar nada más. El sistema está listo para usar.

### 💡 CÓMO USAR

#### Opción A: Desde Edge Functions

```typescript
import { logError, logInfo, logUsage } from '../_shared/logger.ts';

// Ejemplo 1: Registrar un error
try {
  // tu código
} catch (error) {
  await logError(
    'Error al procesar pago',
    'La API de Mercado Pago devolvió un error 500',
    '/mercadopago-webhook',
    error
  );
}

// Ejemplo 2: Registrar uso
await logUsage(
  'Usuario accedió al dashboard',
  'Usuario visitó la página de transacciones',
  '/dashboard/transactions',
  userId
);

// Ejemplo 3: Registrar info
await logInfo(
  'Nueva transacción creada',
  `Usuario creó una transacción de $${amount}`,
  '/voice-to-transaction',
  { userId, amount }
);
```

#### Opción B: Ver las Notificaciones

Ve a:
```
http://localhost:3000/dashboard/system-notifications
```

### 📊 TIPOS DE EVENTOS

| Tipo | Cuándo usar | Color | Ejemplo |
|------|-------------|-------|---------|
| **error** | Algo falló | 🔴 Rojo | Error al insertar en DB |
| **warning** | Algo raro pero no crítico | 🟡 Amarillo | Uso alto de memoria |
| **info** | Evento importante | 🔵 Azul | Usuario registrado |
| **usage** | Tracking de uso | 🟢 Verde | Función llamada |

### 🎚️ NIVELES DE SEVERIDAD

| Severidad | Descripción | Ejemplo |
|-----------|-------------|---------|
| **low** | No urgente | Usuario abrió dashboard |
| **medium** | Revisar pronto | API lenta |
| **high** | Revisar hoy | Error al guardar datos |
| **critical** | ⚠️ URGENTE | Base de datos caída |

### 🛡️ ANTI-SPAM AUTOMÁTICO

El sistema es **inteligente**:

❌ **SIN anti-spam:**
```
[ERROR] Fallo en API - 12:00:01
[ERROR] Fallo en API - 12:00:02
[ERROR] Fallo en API - 12:00:03
[ERROR] Fallo en API - 12:00:04
... (1000 veces más)
```

✅ **CON anti-spam:**
```
[10x] Fallo en API - 12:00:01
```

Si el **mismo error** ocurre en menos de **5 minutos**, solo se incrementa un contador.

---

## 3. SISTEMA DE TICKETS DE SOPORTE

### 📋 RESUMEN EJECUTIVO

El sistema de tickets permite a los usuarios crear solicitudes de soporte y recibir respuestas del equipo. Actualmente está **parcialmente funcional** desde el lado del usuario, pero **falta el panel de administración** para que el staff responda.

### 🔄 FLUJO ACTUAL (LADO USUARIO)

#### 1️⃣ Creación del Ticket

**Ubicación:** `/dashboard/support`

**Proceso:**
1. Usuario llena formulario:
   - **Asunto** (obligatorio)
   - **Categoría** (general, facturación, datos, bug, sugerencia)
   - **Prioridad** (baja, normal, alta, crítica)
   - **Mensaje** (obligatorio)

2. Al enviar:
   ```javascript
   createTicket({
     subject: form.subject,
     category: form.category,
     priority: form.priority,
     message: form.message,
     ai_context: { source: 'support_center' }
   })
   ```

3. Se guarda en Supabase:
   - Tabla: `support_tickets`
   - Campos: `user_id`, `subject`, `category`, `priority`, `message`, `status` (default: 'abierto')
   - Se crea automáticamente una notificación (`ticket_created`)

#### 2️⃣ Visualización del Usuario

**Ubicación:** `/dashboard/support`

**Lo que ve el usuario:**
- **Estadísticas:**
  - Tickets totales
  - En seguimiento (abiertos)
  - Última respuesta
  - SLA promedio

- **Historial de tickets:**
  - Lista de todos sus tickets
  - Estado (abierto, en_progreso, resuelto, archivado)
  - Prioridad
  - Fecha de creación
  - Última actualización

- **Acciones disponibles:**
  - Ver detalles del ticket (clic en el ticket)
  - Crear nuevo ticket

#### 3️⃣ Detalle del Ticket

**Ubicación:** `/dashboard/support/:ticketId`

**Lo que ve el usuario:**
- Información del ticket:
  - Asunto
  - Estado y prioridad
  - Mensaje inicial
  - Categoría

- **Conversación:**
  - Mensaje inicial del usuario
  - Respuestas del staff (si existen)
  - Respuestas del usuario

- **Acciones:**
  - Agregar nueva respuesta (solo si el ticket no está resuelto/archivado)
  - Ver historial completo

### 🗄️ ALMACENAMIENTO EN BASE DE DATOS

#### Tabla: `support_tickets`

```sql
- id (UUID)
- user_id (UUID) → auth.users
- subject (TEXT)
- category (TEXT) → 'general', 'facturacion', 'dato', 'bug', 'sugerencia'
- priority (TEXT) → 'baja', 'normal', 'alta', 'critica'
- message (TEXT)
- status (TEXT) → 'abierto', 'en_progreso', 'resuelto', 'archivado'
- ai_context (JSONB)
- sla_hours (INTEGER) → default: 24
- last_response_at (TIMESTAMPTZ)
- created_at (TIMESTAMPTZ)
- updated_at (TIMESTAMPTZ)
```

**RLS Policies:**
- ✅ Usuarios solo ven sus propios tickets
- ✅ Usuarios solo pueden crear tickets para sí mismos
- ✅ Usuarios solo pueden actualizar sus propios tickets

#### Tabla: `support_ticket_responses`

```sql
- id (UUID)
- ticket_id (UUID) → support_tickets
- user_id (UUID) → auth.users
- message (TEXT)
- is_staff_response (BOOLEAN) → default: false
- staff_name (TEXT) → nombre del staff que responde
- attachments (JSONB) → default: []
- created_at (TIMESTAMPTZ)
- updated_at (TIMESTAMPTZ)
```

#### Tabla: `support_notifications`

```sql
- id (UUID)
- user_id (UUID) → auth.users
- ticket_id (UUID) → support_tickets (opcional)
- type (TEXT) → 'ticket_created', 'ticket_updated', 'response_received', 'status_changed'
- title (TEXT)
- message (TEXT)
- read (BOOLEAN) → default: false
- metadata (JSONB)
- created_at (TIMESTAMPTZ)
```

**Triggers automáticos:**
1. `on_ticket_created` → Crea notificación cuando se crea un ticket
2. `on_ticket_status_changed` → Crea notificación cuando cambia el estado
3. `on_ticket_response` → Crea notificación cuando el staff responde

### ❌ LO QUE FALTA (LADO STAFF/ADMIN)

#### 🔴 1. Panel de Administración

**Problema:** No existe una interfaz para que el staff vea y gestione tickets.

**Lo que se necesita:**
- Ruta: `/dashboard/admin/support` (o similar)
- Vista de todos los tickets (no solo los del usuario)
- Filtros:
  - Por estado (abierto, en_progreso, resuelto, archivado)
  - Por prioridad (baja, normal, alta, crítica)
  - Por categoría
  - Por fecha
- Búsqueda por asunto o ID
- Ordenamiento (más recientes, más antiguos, por prioridad)

**Acciones necesarias:**
- Ver detalles del ticket
- Responder al ticket (marcando `is_staff_response = true`)
- Cambiar estado del ticket
- Asignar ticket a un miembro del staff (`assigned_to` existe en el schema pero no se usa)
- Cambiar prioridad

#### 🔴 2. Sistema de Respuestas del Staff

**Problema:** El staff no puede responder desde la aplicación.

**Lo que existe:**
- Función SQL: `add_ticket_response()` que acepta `p_is_staff = true`
- Campo `staff_name` en `support_ticket_responses`

**Lo que falta:**
- UI para que el staff responda
- Identificación del staff (¿cómo sabemos quién es staff?)
- Validación de permisos (¿quién puede responder como staff?)

**Solución propuesta:**
1. Crear tabla `staff_users` o agregar campo `is_staff` a `profile_preferences`
2. Crear RLS policy que permita a staff ver todos los tickets
3. Crear componente `StaffTicketResponse` en el panel de admin

---

## 4. SISTEMA DE DEMO GRATUITA

### 📋 Descripción

Sistema completo que permite a los usuarios probar Finantel durante **1 hora sin necesidad de registrarse**. Después del tiempo límite, se muestra un modal de conversión invitando al usuario a crear una cuenta.

### ✅ Componentes Implementados

#### 1. **DemoModeContext** (`src/contexts/DemoModeContext.jsx`)
- Contexto global para manejar el estado del modo demo
- Gestiona:
  - `isDemoMode`: Indica si el usuario está en modo demo
  - `demoStartTime`: Timestamp de inicio
  - `timeRemaining`: Tiempo restante en milisegundos
  - `showConversionModal`: Controla visibilidad del modal

**Funciones:**
- `startDemoMode()`: Inicia el contador de 1 hora
- `exitDemoMode()`: Limpia el estado y localStorage
- `getFormattedTimeRemaining()`: Retorna tiempo en formato "MM:SS"

#### 2. **DemoModeBanner** (`src/components/DemoModeBanner.jsx`)
- Banner fijo en la parte superior durante el modo demo
- Muestra:
  - Indicador de "Modo Demo Activo"
  - Contador regresivo en tiempo real
  - Botón CTA "Crear Cuenta Gratis"
- Responsive (diseño diferente en mobile)

#### 3. **DemoConversionModal** (`src/components/modals/DemoConversionModal.jsx`)
- Modal que aparece cuando se acaba el tiempo (1 hora)
- Contenido:
  - Mensaje profesional de agradecimiento
  - Lista de beneficios de crear cuenta
  - CTA principal: "Crear Cuenta Gratuita"
  - CTA secundario: "Volver al inicio"
- Animaciones suaves con Framer Motion
- No se puede cerrar con ESC (solo con botones)

#### 4. **Hero Component Actualizado** (`src/components/Hero.jsx`)
- Botón cambiado de "Ingresar a Probar" → **"Probar Demo Gratuita"**
- Al hacer clic:
  - Inicia `startDemoMode()`
  - Redirige al dashboard
  - Muestra toast de confirmación

#### 5. **ProtectedRoute Modificado** (`src/components/ProtectedRoute.jsx`)
- Permite acceso al dashboard si:
  - ✅ Usuario autenticado **O**
  - ✅ Modo demo activo
- Bloquea acceso solo si no hay usuario Y no hay demo activo

### 🔄 Flujo de Usuario

#### Escenario 1: Usuario nuevo prueba demo

```
1. Usuario en landing page
   ↓
2. Click en "Probar Demo Gratuita"
   ↓
3. startDemoMode() se ejecuta
   - Guarda timestamp en localStorage
   - Activa isDemoMode = true
   ↓
4. Redirige a /dashboard
   ↓
5. Banner aparece en la parte superior
   - Muestra tiempo restante
   ↓
6. Usuario explora dashboard durante ~60 minutos
   ↓
7. Timer llega a 0:00
   ↓
8. Modal de conversión aparece
   - "¡Nos alegra que hayas probado Finantel!"
   ↓
9. Usuario tiene 2 opciones:
   a) "Crear Cuenta Gratuita" → /auth?mode=signup
   b) "Volver al inicio" → /
```

#### Escenario 2: Usuario cierra y regresa

```
1. Usuario estaba en demo (cerró browser)
   ↓
2. Regresa al sitio
   ↓
3. DemoModeContext lee localStorage
   ↓
4. Calcula tiempo transcurrido
   ↓
5. Si < 60 minutos:
   - Reactiva modo demo
   - Muestra tiempo restante actualizado
   ↓
6. Si > 60 minutos:
   - Muestra modal de conversión inmediatamente
```

#### Escenario 3: Usuario se registra durante la demo

```
1. Usuario en modo demo
   ↓
2. Click en "Crear Cuenta Gratis" (banner)
   ↓
3. Se registra exitosamente
   ↓
4. exitDemoMode() se ejecuta automáticamente
   - Limpia localStorage
   - isDemoMode = false
   ↓
5. Banner desaparece
   - Usuario ahora tiene cuenta real
```

### 💾 localStorage

El sistema usa localStorage para persistir el estado:

```javascript
// Claves usadas
localStorage.setItem('demo_mode', 'true');
localStorage.setItem('demo_start_time', timestamp);

// Se limpian al:
- Registrarse
- Completar 1 hora
- Cerrar modal (volver al inicio)
```

### ⚙️ Configuración

#### Duración del demo
Cambiar en `DemoModeContext.jsx`:
```javascript
const DEMO_DURATION = 60 * 60 * 1000; // 1 hora (en ms)

// Ejemplos:
// 5 minutos: 5 * 60 * 1000
// 30 minutos: 30 * 60 * 1000
// 2 horas: 2 * 60 * 60 * 1000
```

---

# 🔌 INTEGRACIONES

## 1. INTEGRACIÓN IA: DeepFinance Engine con DeepSeek/Qwen

### ✅ IMPLEMENTADO

La integración con IA está **COMPLETA** y funcional en la Fase 1.

### 🔗 CÓMO FUNCIONA

#### Flujo de Integración

```
1. Motor recolecta datos REALES
   │
   ▼
2. Motor hace análisis matemático
   │
   ▼
3. Motor genera recomendaciones básicas
   │
   ▼
4. AIService construye contexto con datos REALES
   │
   ▼
5. AIService llama a DeepSeek API
   │
   ├─ ✅ Éxito → Genera insights profesionales
   │
   └─ ❌ Falla → Intenta con Qwen
       │
       ├─ ✅ Éxito → Genera insights profesionales
       │
       └─ ❌ Falla → Usa fallback básico
```

### 📋 ARCHIVO IMPLEMENTADO

#### `src/lib/deepfinance/aiService.js`

**Funciones principales:**

1. **`generateAIInsights(analysis, rawData)`**
   - Función principal que genera insights
   - Recibe análisis completo y datos originales
   - Retorna insights estructurados

2. **`callAI(prompt)`**
   - Intenta DeepSeek primero
   - Si falla, intenta Qwen
   - Retorna respuesta de texto

3. **`buildAnalysisContext(analysis, rawData)`**
   - Construye contexto JSON con datos REALES
   - Incluye: puntaje, patrones, riesgo, categorías, etc.
   - NUNCA inventa datos

4. **`buildAnalysisPrompt(context, analysis)`**
   - Construye prompt especializado
   - Incluye reglas críticas de ética
   - PROHÍBE inventar datos explícitamente

5. **`parseAIResponse(aiResponse, analysis)`**
   - Parsea respuesta de la IA
   - Extrae JSON estructurado
   - Maneja errores gracefully

### 🎯 PROMPT ESPECIALIZADO

El prompt del DeepFinance Engine es diferente al del Coach Financiero:

#### Diferencias Clave:

1. **Tono más profesional:**
   - Asesor financiero ejecutivo (vs. coach-amigo)
   - Análisis objetivo y preciso
   - Lenguaje financiero profesional

2. **Enfoque en análisis:**
   - Diagnóstico por área
   - Identificación de riesgos
   - Recomendaciones accionables
   - Plan de acción estructurado

3. **Formato estructurado:**
   - Respuesta en JSON
   - Campos específicos: summary, diagnosis, recommendations, actionPlan
   - Más formal y organizado

4. **Mismas reglas éticas:**
   - PROHÍBE inventar datos
   - SOLO usa datos reales proporcionados
   - Honestidad cuando no hay datos

### 📊 ESTRUCTURA DE RESPUESTA DE IA

La IA genera un JSON estructurado:

```json
{
  "summary": "Resumen ejecutivo de 2-3 oraciones",
  "diagnosis": {
    "strengths": ["Fortaleza 1", "Fortaleza 2"],
    "weaknesses": ["Debilidad 1", "Debilidad 2"],
    "byComponent": {
      "budgetCompliance": "Análisis detallado...",
      "savingsRate": "Análisis detallado...",
      "spendingDiscipline": "Análisis detallado...",
      "riskLevel": "Análisis detallado...",
      "patternHealth": "Análisis detallado...",
      "goalProgress": "Análisis detallado...",
      "emotionalControl": "Análisis detallado..."
    }
  },
  "patterns": "Análisis de patrones detectados",
  "risks": ["Riesgo 1", "Riesgo 2"],
  "recommendations": [
    {
      "title": "Título",
      "description": "Descripción detallada",
      "impact": "alto|medio|bajo",
      "priority": 1-5
    }
  ],
  "actionPlan": {
    "7days": ["Acción 1", "Acción 2"],
    "30days": ["Acción 1", "Acción 2"],
    "90days": ["Acción 1", "Acción 2"]
  }
}
```

### 🔒 SEGURIDAD Y ÉTICA

#### Reglas Implementadas en el Prompt:

1. **PROHIBIDO ABSOLUTO:**
   - Inventar datos financieros
   - Usar aproximaciones con números no verificables
   - Asumir información no proporcionada

2. **SOLO DATOS REALES:**
   - Todos los números vienen de los datos
   - Si no hay datos, decir "No hay datos suficientes"
   - Ser honesto cuando falte información

3. **Validación Post-IA:**
   - El motor valida que los insights son razonables
   - Si la IA falla, usa fallback básico
   - Nunca se muestra información inventada al usuario

### ⚙️ CONFIGURACIÓN

#### Variables de Entorno Requeridas:

```env
VITE_DEEPSEEK_API_KEY=sk-...
VITE_QWEN_API_KEY=sk-...  # Opcional, solo como fallback
```

#### Modelos Usados:

- **DeepSeek:** `deepseek-chat`
- **Qwen:** `qwen-turbo`
- **Temperature:** `0.7` (más conservador para análisis financiero)

---

## 2. INTEGRACIÓN LOGGER/SISTEMA DE NOTIFICACIONES

### 📊 Guía de Integración

Esta guía muestra cómo integrar el sistema de notificaciones en tus Edge Functions existentes.

### 📦 PASO 1: Importar el Logger

En cualquier Edge Function, importa las funciones del logger:

```typescript
import { logError, logWarning, logInfo, logUsage, logCriticalError } from '../_shared/logger.ts';
```

### ✅ PASO 2: Ejemplos de Uso

#### A) Registrar Errores

```typescript
// En un bloque catch
catch (error) {
  await logError(
    'Error al crear transacción por voz',
    `La función devolvió un error: ${error.message}`,
    '/voice-to-transaction',
    error
  );

  return new Response(
    JSON.stringify({ error: error.message }),
    { status: 500, headers: corsHeaders }
  );
}
```

#### B) Registrar Errores Críticos

```typescript
// Para errores que requieren atención inmediata
if (!userId) {
  await logCriticalError(
    'Usuario no autenticado intentó acceder',
    'Se detectó un intento de acceso sin autenticación',
    '/voice-to-transaction',
    { headers: req.headers }
  );

  return new Response(
    JSON.stringify({ error: 'Unauthorized' }),
    { status: 401, headers: corsHeaders }
  );
}
```

#### C) Registrar Advertencias

```typescript
// Cuando algo no está bien pero no es crítico
if (transcriptLength > 500) {
  await logWarning(
    'Transcripción muy larga detectada',
    `La transcripción tiene ${transcriptLength} caracteres. Podría afectar el rendimiento.`,
    '/voice-to-transaction',
    { transcriptLength, userId }
  );
}
```

#### D) Registrar Información

```typescript
// Para eventos importantes pero normales
await logInfo(
  'Nueva transacción creada exitosamente',
  `Usuario ${userId} creó una transacción de ${amount} ${currency}`,
  '/voice-to-transaction',
  { userId, amount, currency }
);
```

#### E) Registrar Uso

```typescript
// Para tracking de uso de funciones
await logUsage(
  'Función de voz utilizada',
  'Usuario utilizó la función de transacción por voz',
  '/voice-to-transaction',
  userId
);
```

### 📝 MEJORES PRÁCTICAS

#### ¿Cuándo usar cada tipo?

| Tipo | Cuándo usar | Ejemplo |
|------|-------------|---------|
| `logCriticalError` | Errores que requieren atención INMEDIATA | Fallo de autenticación, DB caída, API externa sin respuesta |
| `logError` | Errores que afectan funcionalidad | Fallo al insertar en DB, error de validación |
| `logWarning` | Cosas que no están bien pero no rompen nada | Uso alto de recursos, datos malformados |
| `logInfo` | Eventos importantes pero normales | Usuario creado, pago exitoso, configuración actualizada |
| `logUsage` | Tracking de uso de funciones | Función llamada, endpoint accedido |

---

## 3. INTEGRACIÓN MERCADO PAGO

### 📋 Resumen Ejecutivo

La integración de Mercado Pago está **parcialmente implementada** a nivel de UI y base de datos, pero **NO tiene funcionalidad real**. Actualmente solo existe código mock que simula el proceso de pago.

### Estado Actual:
- ✅ UI implementada (botones, página de billing)
- ✅ Tabla de base de datos creada (`billing_subscriptions`)
- ✅ Hook `useBilling` con estructura básica
- ❌ **NO hay integración real con API de Mercado Pago**
- ❌ **NO hay Edge Functions para procesar pagos**
- ❌ **NO hay webhooks para recibir notificaciones**
- ❌ **NO hay manejo de historial de pagos real**

### 🔴 1. BACKEND - Edge Functions de Supabase

#### 1.1 Función: `create-checkout-session`
**Ubicación:** `supabase/functions/create-checkout-session/index.ts`  
**Estado:** ❌ NO EXISTE

**Funcionalidad Requerida:**
- Crear preferencia de pago en Mercado Pago
- Generar URL de checkout
- Guardar sesión en base de datos
- Retornar URL al frontend

#### 1.2 Función: `mercadopago-webhook`
**Ubicación:** `supabase/functions/mercadopago-webhook/index.ts`  
**Estado:** ❌ NO EXISTE

**Funcionalidad Requerida:**
- Recibir notificaciones de Mercado Pago (IPN)
- Validar firma de notificación
- Procesar diferentes tipos de eventos:
  - `payment.created` - Pago creado
  - `payment.approved` - Pago aprobado
  - `payment.rejected` - Pago rechazado
  - `payment.refunded` - Pago reembolsado
  - `subscription.created` - Suscripción creada
  - `subscription.updated` - Suscripción actualizada
- Actualizar estado de suscripción en base de datos
- Enviar notificaciones al usuario

#### 1.3 Función: `cancel-subscription`
**Ubicación:** `supabase/functions/cancel-subscription/index.ts`  
**Estado:** ❌ NO EXISTE

**Funcionalidad Requerida:**
- Cancelar suscripción en Mercado Pago
- Actualizar estado en base de datos
- Configurar cancelación al final del período actual
- Notificar al usuario

### 🔴 2. CONFIGURACIÓN Y VARIABLES DE ENTORNO

#### 2.1 Variables de Entorno Requeridas

**En Supabase Dashboard (Settings > Edge Functions > Secrets):**
```
MERCADOPAGO_ACCESS_TOKEN=APP_USR-xxxxx  # Token de producción
MERCADOPAGO_ACCESS_TOKEN_TEST=TEST-xxxxx  # Token de test
MERCADOPAGO_WEBHOOK_SECRET=xxxxx         # Secret para validar webhooks
MERCADOPAGO_PUBLIC_KEY=APP_USR-xxxxx     # Public key (opcional, para frontend)
```

**En Frontend (.env):**
```
VITE_MERCADOPAGO_PUBLIC_KEY=APP_USR-xxxxx  # Para SDK de frontend (opcional)
```

#### 2.2 Configuración en Mercado Pago

**Requisitos:**
1. ✅ Crear cuenta de desarrollador en Mercado Pago
2. ✅ Obtener Access Token (producción y test)
3. ❌ Configurar Webhook URL en panel de Mercado Pago
4. ❌ Configurar URLs de retorno (success, failure, pending)
5. ❌ Configurar notificaciones IPN

**URLs a Configurar:**
- Webhook: `https://[tu-proyecto].supabase.co/functions/v1/mercadopago-webhook`
- Success: `https://[tu-dominio]/dashboard/billing?status=success`
- Failure: `https://[tu-dominio]/dashboard/billing?status=failure`
- Pending: `https://[tu-dominio]/dashboard/billing?status=pending`

### 🔴 3. BASE DE DATOS - Tablas y Funciones

#### 3.1 Tabla: `billing_payments`
**Estado:** ❌ NO EXISTE

**Estructura Requerida:**
```sql
CREATE TABLE public.billing_payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    subscription_id UUID REFERENCES billing_subscriptions(id),
    mercado_pago_payment_id TEXT UNIQUE,  -- ID del pago en Mercado Pago
    mercado_pago_preference_id TEXT,       -- ID de la preferencia
    amount DECIMAL(12, 2) NOT NULL,
    currency TEXT DEFAULT 'CLP',
    status TEXT NOT NULL CHECK (status IN ('pending', 'approved', 'rejected', 'refunded', 'cancelled')),
    payment_method TEXT,
    payment_type TEXT,
    installments INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    paid_at TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}'::jsonb
);
```

#### 3.2 Tabla: `billing_subscriptions` - Mejoras Necesarias
**Estado:** ✅ EXISTE pero necesita campos adicionales

**Campos Faltantes:**
```sql
ALTER TABLE billing_subscriptions ADD COLUMN IF NOT EXISTS 
    mercado_pago_subscription_id TEXT UNIQUE,
    mercado_pago_preapproval_id TEXT,
    next_payment_date TIMESTAMPTZ,
    last_payment_id UUID REFERENCES billing_payments(id),
    trial_end TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}'::jsonb;
```

### 📋 CHECKLIST DE IMPLEMENTACIÓN

#### Fase 1: Configuración Inicial
- [ ] Crear cuenta de desarrollador en Mercado Pago
- [ ] Obtener Access Tokens (test y producción)
- [ ] Configurar variables de entorno en Supabase
- [ ] Instalar/configurar SDK de Mercado Pago

#### Fase 2: Backend - Edge Functions
- [ ] Crear función `create-checkout-session`
- [ ] Crear función `mercadopago-webhook`
- [ ] Crear función `cancel-subscription`
- [ ] Implementar validación de webhooks
- [ ] Implementar idempotencia

#### Fase 3: Base de Datos
- [ ] Crear tabla `billing_payments`
- [ ] Agregar campos faltantes a `billing_subscriptions`
- [ ] Crear funciones de base de datos
- [ ] Configurar RLS policies

#### Fase 4: Frontend
- [ ] Actualizar `useBilling.js` para usar Edge Functions reales
- [ ] Mejorar página `Billing.jsx`
- [ ] Crear componente de confirmación de pago
- [ ] Manejar estados de pago

#### Fase 5: Testing
- [ ] Configurar ambiente de test
- [ ] Probar flujo completo de pago
- [ ] Probar webhooks
- [ ] Probar casos de error

#### Fase 6: Producción
- [ ] Configurar credenciales de producción
- [ ] Configurar webhooks de producción
- [ ] Monitoreo y alertas
- [ ] Documentación final

---

## 4. INTEGRACIÓN GOOGLE OAUTH

### Error: redirect_uri_mismatch

Este error ocurre cuando la URL de redirección configurada en el código no coincide con las URLs autorizadas en Google Cloud Console.

### Pasos para solucionar:

#### 1. Configurar en Google Cloud Console

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Selecciona tu proyecto
3. Ve a **APIs & Services** → **Credentials**
4. Encuentra tu **OAuth 2.0 Client ID** (o créalo si no existe)
5. Haz clic en el cliente OAuth para editarlo
6. En **Authorized redirect URIs**, agrega las siguientes URLs:

   **Para desarrollo (localhost):**
   ```
   http://localhost:3000/auth/callback
   http://localhost:5173/auth/callback
   http://127.0.0.1:3000/auth/callback
   http://127.0.0.1:5173/auth/callback
   ```

   **Para producción:**
   ```
   https://tu-dominio.com/auth/callback
   https://www.tu-dominio.com/auth/callback
   ```

   **IMPORTANTE:** También necesitas agregar la URL de Supabase:
   ```
   https://[TU-PROJECT-ID].supabase.co/auth/v1/callback
   ```

#### 2. Configurar en Supabase Dashboard

1. Ve a tu [Supabase Dashboard](https://app.supabase.com/)
2. Selecciona tu proyecto
3. Ve a **Authentication** → **URL Configuration**
4. En **Redirect URLs**, agrega:

   **Para desarrollo:**
   ```
   http://localhost:3000/auth/callback
   http://localhost:5173/auth/callback
   ```

   **Para producción:**
   ```
   https://tu-dominio.com/auth/callback
   ```

5. Guarda los cambios

#### 3. Verificar la configuración de Google Provider en Supabase

1. En Supabase Dashboard, ve a **Authentication** → **Providers**
2. Haz clic en **Google**
3. Asegúrate de que esté **habilitado**
4. Verifica que el **Client ID** y **Client Secret** sean correctos
5. Estos deben ser los mismos que configuraste en Google Cloud Console

### ⚠️ IMPORTANTE: URL de Supabase es la crítica

**El problema:** Google recibe el `redirect_uri` de Supabase, NO la URL de tu aplicación directamente.

En la petición a Google, verás:
- `redirect_uri=https://yzakmqxbzwzbsdsadzej.supabase.co/auth/v1/callback` ← **Esta es la que Google valida**
- `redirect_to=http://localhost:3000/auth/callback` ← Esta es solo un parámetro que Supabase usa después

**Por lo tanto, DEBES tener en Google Cloud Console:**
1. ✅ `https://yzakmqxbzwzbsdsadzej.supabase.co/auth/v1/callback` (CRÍTICO - esta es la que Google valida)
2. ✅ `http://localhost:3000/auth/callback` (opcional, pero recomendado)

---

## 5. IMPLEMENTACIÓN WEBHOOKS Y NOTIFICACIONES

### 🎯 Resumen

Se ha completado exitosamente la integración del sistema de webhooks de Mercado Pago y notificaciones administrativas en Finantel. Todo está listo para recibir, procesar y visualizar notificaciones de pagos, errores y eventos del sistema.

### 📦 ¿Qué se ha implementado?

#### 🗄️ 1. Base de Datos

##### Tabla `external_webhooks`
- ✅ Tabla universal para recibir webhooks externos
- ✅ Campos: `source`, `event_type`, `payload`, `status`, `error_message`, `ip_address`, `signature`
- ✅ Índices optimizados para búsqueda rápida
- ✅ RLS configurado (solo admins pueden ver)

##### Tabla `admin_notifications`
- ✅ Notificaciones administrativas para el panel de admin
- ✅ Campos: `title`, `message`, `type`, `source`, `metadata`, `is_read`
- ✅ Índices optimizados
- ✅ RLS configurado (solo admins pueden ver y marcar como leídas)

#### ⚙️ 2. Edge Function

##### `mercadopago-webhook`
- ✅ Recibe webhooks de Mercado Pago
- ✅ Guarda webhooks en `external_webhooks`
- ✅ Procesa eventos de pagos (created, updated, failed)
- ✅ Crea notificaciones administrativas según el tipo de evento
- ✅ Validación de firma (preparado)
- ✅ Manejo de errores robusto
- ✅ Actualiza pagos y suscripciones en la base de datos

#### 🖥️ 3. Frontend

##### Página: Webhook Inbox (`/dashboard/admin/webhooks`)
- ✅ Lista todos los webhooks recibidos
- ✅ Filtros por fuente, estado, fecha
- ✅ Vista detallada de cada webhook con JSON completo
- ✅ Estadísticas de webhooks
- ✅ Actualización en tiempo real (Realtime)
- ✅ Acceso restringido a administradores

##### Página: Notificaciones del Sistema (`/dashboard/admin/system-notifications`)
- ✅ Lista todas las notificaciones administrativas
- ✅ Filtros por tipo, fuente, estado de lectura
- ✅ Estadísticas completas (total, no leídas, errores, etc.)
- ✅ Marcar como leída / Marcar todas como leídas
- ✅ Vista detallada con metadata JSON
- ✅ Actualización en tiempo real (Realtime)
- ✅ Acceso restringido a administradores

### 🚀 Cómo Usar

#### 1. Aplicar la Migración SQL

Ejecuta la migración en Supabase SQL Editor:

```sql
-- Ejecutar: supabase/migrations/050_webhooks_and_admin_notifications.sql
```

#### 2. Desplegar la Edge Function

Si aún no está desplegada:

```bash
cd supabase/functions
supabase functions deploy mercadopago-webhook
```

#### 3. Configurar Variables de Entorno

En Supabase Dashboard → Settings → Edge Functions → Secrets:

```
# Access Token de Mercado Pago (PRODUCCIÓN)
MERCADOPAGO_ACCESS_TOKEN=APP_USR-4284404497852619-112419-2600495523792527fd9d6990befd3683-659472935

# Access Token de Test (Opcional)
MERCADOPAGO_ACCESS_TOKEN_TEST=tu_token_test_aqui

# Client Secret (Opcional pero recomendado)
MERCADOPAGO_CLIENT_SECRET=QS1Hr5DhalynTgTsGaWyrjbCDKQsTJqB

# Webhook Secret (Opcional)
MERCADOPAGO_WEBHOOK_SECRET=tu_secret_aqui

# URL del Frontend
FRONTEND_URL=https://finantel.app
```

#### 4. Configurar Webhook en Mercado Pago

En el panel de Mercado Pago, configura el webhook URL:

```
https://TU_PROYECTO.supabase.co/functions/v1/mercadopago-webhook
```

Eventos a suscribir:
- `payment`
- `subscription`

#### 5. Acceder al Panel Admin

Como administrador:
1. Ve a `/dashboard/admin/webhooks` para ver todos los webhooks
2. Ve a `/dashboard/admin/system-notifications` para ver notificaciones

### 📊 Tipos de Notificaciones

#### Mercado Pago

##### Pago Exitoso
- **Tipo**: `payment_success`
- **Fuente**: `mercadopago`
- **Mensaje**: "Pago de $X recibido del usuario Y"

##### Pago Fallido
- **Tipo**: `payment_error`
- **Fuente**: `mercadopago`
- **Mensaje**: "Error en pago de usuario Y. Estado: rejected"

##### Suscripción
- **Tipo**: `subscription`
- **Fuente**: `mercadopago`
- **Mensaje**: "Evento de suscripción recibido: X"

##### Error de Webhook
- **Tipo**: `webhook_error`
- **Fuente**: `mercadopago`
- **Mensaje**: "Error al procesar webhook: X"

#### Sistema

##### Ticket Creado
- **Tipo**: `ticket_created`
- **Fuente**: `finantel`
- **Mensaje**: "El usuario X ha creado un ticket: Y"

##### Alerta del Sistema
- **Tipo**: `system_alert`
- **Fuente**: `system`
- **Mensaje**: Variable según el evento

### 🔒 Seguridad

#### Row Level Security (RLS)

- ✅ Solo usuarios con `is_staff = true` en `profile_preferences` pueden ver webhooks
- ✅ Solo usuarios con `is_staff = true` pueden ver notificaciones admin
- ✅ Service role puede insertar/actualizar desde Edge Functions
- ✅ Funciones SQL protegidas con `SECURITY DEFINER`

#### Verificación de Admin

El sistema verifica si un usuario es admin consultando:

```sql
SELECT is_staff FROM profile_preferences WHERE user_id = auth.uid()
```

Para hacer a un usuario admin:

```sql
UPDATE profile_preferences 
SET is_staff = true 
WHERE user_id = 'uuid-del-usuario';
```

### 🔄 Flujo Completo

#### Cuando Mercado Pago envía un webhook:

1. **Edge Function recibe el webhook**
   - Valida la firma (si está configurada)
   - Extrae IP y headers

2. **Guarda en `external_webhooks`**
   - Estado: `received`
   - Payload completo en JSONB

3. **Procesa el evento**
   - Si es `payment`, obtiene detalles del pago
   - Actualiza o crea registro en `billing_payments`
   - Actualiza suscripción si corresponde

4. **Crea notificación en `admin_notifications`**
   - Tipo según el evento
   - Metadata con detalles del pago

5. **Actualiza webhook**
   - Estado: `processed` o `error`
   - `processed_at`: timestamp

6. **Frontend recibe actualización en tiempo real**
   - Notificación aparece automáticamente
   - Webhook aparece en la lista

---

## 📚 RECURSOS Y REFERENCIAS

### Documentación Oficial
- [Mercado Pago Developers](https://www.mercadopago.com/developers)
- [API de Preferencias](https://www.mercadopago.com/developers/es/reference/preferences/_checkout_preferences/post)
- [API de Webhooks](https://www.mercadopago.com/developers/es/docs/your-integrations/notifications/webhooks)
- [API de Suscripciones](https://www.mercadopago.com/developers/es/reference/subscriptions/_preapproval/post)

### SDKs Disponibles
- [Mercado Pago SDK Node.js](https://github.com/mercadopago/sdk-nodejs)
- [Mercado Pago SDK JavaScript](https://github.com/mercadopago/sdk-javascript)

---

## 🎉 CONCLUSIÓN

Este documento unifica toda la información sobre sistemas e integraciones de Finantel, proporcionando una visión completa de:

- ✅ **Sistemas implementados** (Híbrido, Notificaciones, Tickets, Demo)
- ✅ **Integraciones completas** (IA DeepFinance, Logger, Webhooks)
- ✅ **Integraciones pendientes** (Mercado Pago completo, Google OAuth)
- ✅ **Arquitectura y flujos** detallados
- ✅ **Guías de implementación** paso a paso
- ✅ **Configuraciones y variables de entorno**
- ✅ **Checklists de implementación**

**Última actualización:** Diciembre 2024  
**Versión del documento:** 1.0

