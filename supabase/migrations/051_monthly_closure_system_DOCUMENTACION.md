# 📅 Sistema de Cierre Mensual Automático - Documentación

## 📋 Resumen

Este sistema implementa un cierre mensual automático que:
- ✅ Cierra automáticamente cada mes y archiva todos los datos
- ✅ Notifica 2 días antes del cierre
- ✅ Permite cierre manual anticipado
- ✅ Controla límites de historial y descargas por plan
- ✅ Proporciona acceso a la IA para análisis de datos históricos

## 🗂️ Estructura de Tablas

### 1. `monthly_summaries`
Almacena los resúmenes mensuales archivados de cada usuario.

**Columnas principales:**
- `month_year`: Mes y año del resumen (ej: 2025-01-01)
- `total_income`, `total_expenses`, `total_savings`: Totales financieros
- `category_breakdown`: Desglose por categorías (JSONB)
- `budget_summary`: Resumen de presupuestos (JSONB)
- `full_data`: Datos completos del mes para IA (JSONB)
- `closed_by`: 'system' o 'manual'

### 2. `monthly_downloads`
Registra todas las descargas de resúmenes mensuales.

**Columnas principales:**
- `monthly_summary_id`: Referencia al resumen descargado
- `format`: Formato de descarga (json, csv, pdf, excel)
- `download_date`: Fecha y hora de la descarga

### 3. `monthly_closure_notifications`
Notificaciones enviadas a los usuarios sobre el cierre mensual.

**Columnas principales:**
- `target_month`: Mes que se va a cerrar
- `notification_type`: 'reminder', 'closure', 'manual_request'
- `is_read`: Si el usuario leyó la notificación

## 📊 Límites por Plan

| Plan | Historial | Descargas/Mes |
|------|-----------|---------------|
| **free** | 2 meses | 2 |
| **personal/familiar** | 5 meses | 8 |
| **family/enterprise** | 12 meses | 24 |

## 🔧 Funciones Principales

### 1. `close_month_automatically(p_user_id, p_target_month)`
Cierra un mes para un usuario específico.

**Parámetros:**
- `p_user_id`: UUID del usuario
- `p_target_month`: Fecha del mes a cerrar (NULL = mes anterior)

**Retorna:** UUID del resumen creado

**Ejemplo:**
```sql
SELECT close_month_automatically('user-uuid-here', '2025-01-01');
```

### 2. `notify_monthly_closure()`
Envía notificaciones 2 días antes del cierre.

**Retorna:** Número de notificaciones enviadas

**Ejecución:** Automática diariamente a las 9:00 AM

### 3. `close_month_for_all_users()`
Cierra el mes para todos los usuarios que tengan transacciones.

**Ejecución:** Automática el último día de cada mes a las 23:59

### 4. `get_historical_data_for_ai(p_user_id, p_analysis_type)`
Obtiene datos históricos para análisis de IA respetando límites del plan.

**Parámetros:**
- `p_user_id`: UUID del usuario
- `p_analysis_type`: Tipo de análisis ('general', 'trends', 'predictions', etc.)

**Retorna:** JSONB con todos los datos históricos disponibles

**Ejemplo:**
```sql
SELECT get_historical_data_for_ai('user-uuid-here', 'trends');
```

### 5. `download_monthly_summary(p_user_id, p_monthly_summary_id, p_format, ...)`
Registra y retorna un resumen mensual para descarga.

**Parámetros:**
- `p_user_id`: UUID del usuario
- `p_monthly_summary_id`: UUID del resumen
- `p_format`: Formato ('json', 'csv', 'pdf', 'excel')

**Retorna:** JSONB con los datos del resumen y información de descarga

**Verifica automáticamente:** Límites de descargas del plan

### 6. `get_plan_limits(p_user_id)`
Obtiene los límites del plan del usuario.

**Retorna:** Tabla con `plan_name`, `months_history`, `downloads_per_month`

### 7. `can_download_monthly_summary(p_user_id, p_monthly_summary_id)`
Verifica si el usuario puede descargar un resumen.

**Retorna:** JSONB con información sobre si puede descargar y límites

### 8. `cleanup_old_monthly_summaries(p_user_id)`
Elimina resúmenes antiguos según límites del plan.

**Ejecución:** Automática al cerrar un mes

## 🚀 Edge Function: `monthly-closure`

Endpoint para el frontend que permite:

### Acciones disponibles:

1. **`close_month_manually`**: Cerrar mes manualmente
```typescript
const response = await supabase.functions.invoke('monthly-closure', {
  body: {
    action: 'close_month_manually',
    target_month: '2025-01-01' // opcional
  }
})
```

2. **`download_summary`**: Descargar resumen mensual
```typescript
const response = await supabase.functions.invoke('monthly-closure', {
  body: {
    action: 'download_summary',
    monthly_summary_id: 'uuid-here',
    format: 'json' // 'json', 'csv', 'pdf', 'excel'
  }
})
```

3. **`get_notifications`**: Obtener notificaciones
```typescript
const response = await supabase.functions.invoke('monthly-closure', {
  body: {
    action: 'get_notifications',
    unread_only: true // opcional
  }
})
```

4. **`get_historical_data`**: Obtener datos para IA
```typescript
const response = await supabase.functions.invoke('monthly-closure', {
  body: {
    action: 'get_historical_data',
    analysis_type: 'trends' // opcional
  }
})
```

5. **`get_summaries`**: Obtener todos los resúmenes
```typescript
const response = await supabase.functions.invoke('monthly-closure', {
  body: {
    action: 'get_summaries',
    limit: 12,
    offset: 0
  }
})
```

6. **`get_download_stats`**: Estadísticas de descargas
```typescript
const response = await supabase.functions.invoke('monthly-closure', {
  body: {
    action: 'get_download_stats'
  }
})
```

## ⏰ Cron Jobs Configurados

### 1. Notificación de Cierre (Diario 9:00 AM)
```sql
'0 9 * * *' -- Ejecuta notify_monthly_closure()
```

### 2. Cierre Automático (Diario 23:59)
```sql
'59 23 * * *' -- Ejecuta check_and_close_month()
```

El cierre solo se ejecuta el último día del mes.

## 🔐 Seguridad (RLS)

Todas las tablas tienen RLS habilitado:
- Los usuarios solo pueden ver/modificar sus propios datos
- Las funciones usan `SECURITY DEFINER` para operaciones del sistema

## 📝 Flujo de Trabajo

### Cierre Automático:
1. **2 días antes del cierre**: Se envía notificación a todos los usuarios
2. **Último día del mes 23:59**: Se cierra automáticamente el mes anterior
3. **Al cerrar**: Se archivan todos los datos, se calculan estadísticas, se limpian datos antiguos

### Cierre Manual:
1. Usuario recibe notificación 2 días antes
2. Usuario puede cerrar manualmente desde la app
3. Se ejecuta `close_month_automatically()` con `closed_by = 'manual'`

### Descarga:
1. Usuario solicita descarga de un resumen
2. Sistema verifica límites del plan
3. Si puede descargar, se registra y se retornan los datos
4. Si no puede, se retorna error con información del límite

## 🤖 Acceso para IA

La IA puede acceder a los datos históricos usando:
```sql
SELECT get_historical_data_for_ai('user-id', 'analysis_type');
```

Esta función:
- Respeta límites del plan del usuario
- Retorna datos completos en formato JSONB
- Incluye todos los resúmenes disponibles según el plan

## 📦 Datos Almacenados en `full_data`

El campo `full_data` contiene:
- Todas las transacciones del mes
- Todas las categorías activas
- Todos los presupuestos activos
- Todas las metas activas
- Formato JSONB para fácil procesamiento

## 🧹 Limpieza Automática

Al cerrar un mes, automáticamente:
- Se eliminan resúmenes más antiguos que el límite del plan
- Se mantienen solo los meses permitidos según el plan

## 📊 Ejemplos de Uso

### Desde el Frontend (React):

```typescript
// Cerrar mes manualmente
const closeMonth = async () => {
  const { data, error } = await supabase.functions.invoke('monthly-closure', {
    body: { action: 'close_month_manually' }
  })
  
  if (data.success) {
    console.log('Mes cerrado:', data.summary_id)
  }
}

// Obtener resúmenes
const getSummaries = async () => {
  const { data, error } = await supabase.functions.invoke('monthly-closure', {
    body: { action: 'get_summaries', limit: 12 }
  })
  
  return data.summaries
}

// Descargar resumen
const downloadSummary = async (summaryId: string) => {
  const { data, error } = await supabase.functions.invoke('monthly-closure', {
    body: {
      action: 'download_summary',
      monthly_summary_id: summaryId,
      format: 'json'
    }
  })
  
  if (data.success) {
    // Procesar datos
    const summary = data.summary
    console.log('Resumen:', summary)
  } else {
    console.error('No se puede descargar:', data.reason)
  }
}
```

### Desde la IA:

```sql
-- Obtener datos históricos para análisis
SELECT get_historical_data_for_ai('user-id', 'trends');

-- La IA puede analizar:
-- - Tendencias de gastos
-- - Patrones de ingresos
-- - Eficiencia de presupuestos
-- - Progreso de metas
-- - Redundancias y duplicados
```

## ✅ Checklist de Implementación

- [x] Tablas creadas
- [x] Funciones implementadas
- [x] RLS configurado
- [x] Cron jobs configurados
- [x] Edge function creada
- [ ] Frontend UI para cierre manual
- [ ] Frontend UI para descargas
- [ ] Frontend UI para notificaciones
- [ ] Integración con IA para análisis

## 🐛 Troubleshooting

### El cierre no se ejecuta automáticamente
- Verificar que pg_cron esté habilitado
- Verificar que el cron job esté programado: `SELECT * FROM cron.job;`
- Revisar logs de PostgreSQL

### Los límites no se respetan
- Verificar que el usuario tenga una suscripción activa en `billing_subscriptions`
- Verificar que la función `get_plan_limits()` retorne valores correctos

### La IA no puede acceder a los datos
- Verificar que la función use `SECURITY DEFINER`
- Verificar permisos del usuario que ejecuta la función

