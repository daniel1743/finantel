# 🚀 Guía Completa de Implementación - IA Planificadora Proactiva

## 📋 Tabla de Contenidos

1. [Resumen del Sistema](#resumen-del-sistema)
2. [Estructura de Archivos](#estructura-de-archivos)
3. [Instalación y Configuración](#instalación-y-configuración)
4. [Base de Datos](#base-de-datos)
5. [Edge Function](#edge-function)
6. [Frontend](#frontend)
7. [Flujo de Funcionamiento](#flujo-de-funcionamiento)
8. [Testing](#testing)
9. [Troubleshooting](#troubleshooting)

---

## 🎯 Resumen del Sistema

El **Sistema de IA Planificadora Proactiva** es un módulo completo que:

- ✅ **Detecta eventos próximos** (Navidad, Año Nuevo, Fiestas Patrias, etc.)
- ✅ **Analiza el historial de gastos** del usuario (últimos 3 meses)
- ✅ **Genera planes de ahorro** personalizados con sugerencias concretas
- ✅ **Hace seguimiento semanal** del progreso
- ✅ **Recalcula planes** si hay desviaciones mayores al 20%
- ✅ **Envía notificaciones proactivas** al usuario

---

## 📁 Estructura de Archivos

```
finantel/
├── supabase/
│   ├── migrations/
│   │   └── 030_ai_planner_system.sql          # Migración SQL completa
│   └── functions/
│       └── ai-planner/
│           └── index.ts                        # Edge Function principal
├── src/
│   ├── hooks/
│   │   └── useAIPlanner.js                     # Hook React para consumir la API
│   └── pages/
│       └── dashboard/
│           └── AIPlanner.jsx                   # Componente principal de UI
└── docs/
    └── IA_PLANIFICADORA_IMPLEMENTACION.md      # Esta documentación
```

---

## ⚙️ Instalación y Configuración

### Paso 1: Ejecutar la Migración SQL

1. Accede a tu proyecto en Supabase Dashboard
2. Ve a **SQL Editor**
3. Copia y pega el contenido de `supabase/migrations/030_ai_planner_system.sql`
4. Ejecuta la migración

**Verificación:**
```sql
-- Verificar que las tablas se crearon correctamente
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('seasonal_events', 'ai_plans', 'ai_suggestions', 'ai_notifications');
```

### Paso 2: Desplegar la Edge Function

1. Instala Supabase CLI si no lo tienes:
```bash
npm install -g supabase
```

2. Inicia sesión en Supabase:
```bash
supabase login
```

3. Enlaza tu proyecto:
```bash
supabase link --project-ref tu-project-ref
```

4. Despliega la función:
```bash
supabase functions deploy ai-planner
```

**Verificación:**
- Ve a **Edge Functions** en el Dashboard de Supabase
- Deberías ver `ai-planner` en la lista

### Paso 3: Configurar Variables de Entorno

Asegúrate de que tu `.env` tenga:
```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key
```

---

## 🗄️ Base de Datos

### Tablas Creadas

#### 1. `seasonal_events`
Eventos estacionales pre-cargados:
- Navidad (25-12)
- Año Nuevo (01-01)
- Fiestas Patrias (18-09)
- Halloween (31-10)
- Día del Niño (primer domingo de agosto)
- Black Friday (último viernes de noviembre)
- Cyberday (15-05)
- Vacaciones de Invierno (15-07)

#### 2. `ai_plans`
Planes de ahorro generados por la IA:
- Un plan por usuario por evento
- Estado: `active`, `completed`, `cancelled`, `paused`
- Meta de ahorro y progreso actual

#### 3. `ai_suggestions`
Sugerencias específicas dentro de un plan:
- Tipos: `pause_service`, `reduction`, `cut_expense`, `optimize`, `custom`
- Estado: `accepted`, `rejected`, `null` (pendiente)

#### 4. `ai_notifications`
Notificaciones proactivas:
- Tipos: `reminder`, `warning`, `plan_offer`, `plan_update`, `plan_completed`, `plan_deviation`

### Funciones SQL Creadas

1. **`detect_upcoming_events(user_id, days_ahead)`**
   - Detecta eventos próximos sin plan activo

2. **`analyze_recurring_expenses(user_id, months_back)`**
   - Analiza gastos recurrentes, impulsivos y oportunidades

3. **`calculate_estimated_savings(analysis)`**
   - Calcula ahorro total estimado

4. **`evaluate_plan_progress(plan_id)`**
   - Evalúa progreso semanal y detecta desviaciones

---

## 🔧 Edge Function

### Endpoints Disponibles

La Edge Function `ai-planner` acepta las siguientes acciones:

#### 1. `detect_events`
Detecta eventos próximos para el usuario.

**Request:**
```json
{
  "action": "detect_events",
  "days_ahead": 30
}
```

**Response:**
```json
{
  "success": true,
  "events": [
    {
      "event_id": "uuid",
      "event_name": "Navidad",
      "event_date": "2024-12-25",
      "days_until": 45,
      "has_active_plan": false
    }
  ],
  "count": 1
}
```

#### 2. `analyze_expenses`
Analiza el historial de gastos del usuario.

**Request:**
```json
{
  "action": "analyze_expenses",
  "months_back": 3
}
```

**Response:**
```json
{
  "success": true,
  "analysis": {
    "recurring_services": [...],
    "impulsive_expenses": [...],
    "unnecessary_purchases": [...],
    "saving_opportunities": [...],
    "analysis_date": "2024-11-10",
    "months_analyzed": 3
  }
}
```

#### 3. `create_plan`
Crea un nuevo plan de ahorro para un evento.

**Request:**
```json
{
  "action": "create_plan",
  "event_id": "uuid",
  "auto_create": false
}
```

**Response:**
```json
{
  "success": true,
  "plan": { ... },
  "suggestions": [ ... ]
}
```

#### 4. `track_plan`
Hace seguimiento de un plan activo.

**Request:**
```json
{
  "action": "track_plan",
  "plan_id": "uuid"
}
```

**Response:**
```json
{
  "success": true,
  "evaluation": {
    "weeks_passed": 2,
    "expected_savings": 50000,
    "actual_savings": 45000,
    "deviation_percentage": -10,
    "needs_recalculation": false,
    "is_on_track": true
  },
  "plan": { ... }
}
```

#### 5. `recalculate_plan`
Recalcula un plan si hay desviaciones.

**Request:**
```json
{
  "action": "recalculate_plan",
  "plan_id": "uuid"
}
```

#### 6. `get_user_plans`
Obtiene todos los planes del usuario.

**Request:**
```json
{
  "action": "get_user_plans"
}
```

---

## 🖥️ Frontend

### Hook: `useAIPlanner`

Hook React que encapsula toda la lógica de comunicación con la Edge Function.

**Uso:**
```javascript
import { useAIPlanner } from '@/hooks/useAIPlanner';

const MyComponent = () => {
  const {
    loading,
    plans,
    upcomingEvents,
    analysis,
    createPlan,
    trackPlan,
    recalculatePlan,
    updateSuggestion,
  } = useAIPlanner();

  // Usar las funciones...
};
```

### Componente: `AIPlanner`

Componente principal que muestra:
- Eventos próximos sin plan
- Planes activos con progreso
- Sugerencias de ahorro
- Evaluación del progreso

**Ruta:** `/dashboard/ai-planner`

---

## 🔄 Flujo de Funcionamiento

### 1. Detección de Eventos

```
Usuario abre /dashboard/ai-planner
    ↓
useAIPlanner detecta eventos (30 días adelante)
    ↓
Muestra eventos sin plan activo
    ↓
Usuario hace clic en "Crear plan de ahorro"
```

### 2. Creación de Plan

```
Usuario selecciona evento
    ↓
Edge Function analiza gastos (últimos 3 meses)
    ↓
Genera propuesta con:
  - Meta de ahorro
  - Sugerencias concretas
  - Plan semanal
    ↓
Usuario acepta → Plan creado
    ↓
Notificación enviada
```

### 3. Seguimiento Semanal

```
Cada semana (o manualmente):
    ↓
Edge Function evalúa progreso
    ↓
Compara ahorro esperado vs. real
    ↓
Si desviación > 20%:
  - Crea notificación de advertencia
  - Sugiere recalcular
    ↓
Si está en buen camino:
  - Crea notificación positiva
```

### 4. Recalculación

```
Usuario hace clic en "Recalcular plan"
    ↓
Edge Function re-analiza gastos
    ↓
Genera nuevas sugerencias
    ↓
Actualiza meta si es necesario
    ↓
Crea notificación de actualización
```

---

## 🧪 Testing

### Test Manual

1. **Crear un plan:**
   - Ve a `/dashboard/ai-planner`
   - Selecciona un evento próximo
   - Haz clic en "Crear plan de ahorro"
   - Verifica que el plan aparece en "Tus planes activos"

2. **Aceptar sugerencias:**
   - En un plan activo, acepta una sugerencia
   - Verifica que cambia a "Aceptada"

3. **Seguimiento:**
   - Haz clic en "Actualizar seguimiento"
   - Verifica que muestra evaluación

4. **Recalcular:**
   - Si hay desviación, haz clic en "Recalcular plan"
   - Verifica que se generan nuevas sugerencias

### Test SQL Directo

```sql
-- Verificar eventos pre-cargados
SELECT * FROM seasonal_events WHERE country = 'CL';

-- Verificar planes de un usuario
SELECT * FROM ai_plans WHERE user_id = 'tu-user-id';

-- Verificar sugerencias
SELECT * FROM ai_suggestions WHERE plan_id = 'plan-id';

-- Verificar notificaciones
SELECT * FROM ai_notifications WHERE user_id = 'tu-user-id' ORDER BY created_at DESC;
```

---

## 🔍 Troubleshooting

### Error: "Could not find a relationship"

**Problema:** La consulta intenta hacer join con `auth.users` pero no hay foreign key.

**Solución:** Ya está corregido en la migración. Si persiste, ejecuta:
```sql
ALTER TABLE public.support_tickets
ADD CONSTRAINT support_tickets_user_id_fkey
FOREIGN KEY (user_id)
REFERENCES auth.users(id)
ON DELETE CASCADE;
```

### Error: "Edge Function not found"

**Problema:** La función no está desplegada.

**Solución:**
```bash
supabase functions deploy ai-planner
```

### Error: "No authorization header"

**Problema:** El usuario no está autenticado.

**Solución:** Verifica que el usuario haya iniciado sesión y que el token esté presente.

### Los eventos no aparecen

**Problema:** Los eventos no están pre-cargados o están en el pasado.

**Solución:** Ejecuta manualmente la parte de pre-carga de eventos en la migración SQL.

### El análisis de gastos está vacío

**Problema:** El usuario no tiene transacciones suficientes.

**Solución:** Es normal. El sistema necesita al menos 2-3 meses de datos para generar análisis útiles.

---

## 📝 Notas Adicionales

### Programar Ejecución Automática (CRON)

Para que el sistema funcione automáticamente, configura un CRON job que ejecute la Edge Function diariamente:

1. Ve a **Database** → **Cron Jobs** en Supabase
2. Crea un nuevo job:
   - **Schedule:** `0 9 * * *` (9 AM todos los días)
   - **SQL:**
   ```sql
   SELECT net.http_post(
     url := 'https://tu-proyecto.supabase.co/functions/v1/ai-planner',
     headers := '{"Authorization": "Bearer ' || current_setting('app.settings.service_role_key') || '", "Content-Type": "application/json"}'::jsonb,
     body := '{"action": "detect_events", "days_ahead": 30}'::jsonb
   );
   ```

### Personalización de Eventos

Para agregar nuevos eventos, inserta en `seasonal_events`:
```sql
INSERT INTO seasonal_events (name, date, country, optional_description, is_recurring)
VALUES ('Tu Evento', '2024-12-31', 'CL', 'Descripción', true);
```

### Ajustar Umbrales de Desviación

En `evaluate_plan_progress`, el umbral está en 20%. Para cambiarlo, modifica:
```sql
'needs_recalculation', ABS(deviation_percentage) > 20
```

---

## ✅ Checklist de Implementación

- [ ] Migración SQL ejecutada
- [ ] Edge Function desplegada
- [ ] Variables de entorno configuradas
- [ ] Ruta agregada en `App.jsx`
- [ ] Enlace agregado en `Sidebar.jsx`
- [ ] Hook `useAIPlanner` importado correctamente
- [ ] Componente `AIPlanner` renderiza correctamente
- [ ] Eventos pre-cargados visibles
- [ ] Creación de plan funciona
- [ ] Seguimiento funciona
- [ ] Notificaciones se crean correctamente

---

## 🎉 ¡Listo!

El sistema de IA Planificadora Proactiva está completamente implementado y listo para usar. Si tienes preguntas o encuentras problemas, revisa la sección de Troubleshooting o consulta los logs de la Edge Function en Supabase Dashboard.

