# 🚀 GUÍA DE IMPLEMENTACIÓN COMPLETA - FASE 1 BACKEND

## 📋 Resumen Ejecutivo

Esta guía te llevará paso a paso para implementar las 4 tablas críticas del backend de Finatel v2.1 con **funcionalidades avanzadas**.

### ✅ Lo que vas a implementar:

**Tablas Core (6 tablas):**
1. `family_groups` - Grupos familiares
2. `family_group_members` - Miembros de grupos
3. `shared_expenses` - Gastos compartidos
4. `shared_expense_splits` - División de gastos
5. `profile_preferences` - Preferencias de usuario
6. `alerts` - Alertas inteligentes

**Funcionalidades Avanzadas:**
- 🤖 Alertas automáticas de presupuesto (80% y 100%)
- 🔔 Detección de gastos inusuales
- 🎯 Alertas de progreso de metas (25%, 50%, 75%, 100%)
- 📊 Funciones de agregación para dashboards
- 🔐 RLS completo con 20+ políticas de seguridad
- ⚡ Índices optimizados para performance

---

## 🎯 PASO 1: Preparación

### Opción A: Instalación desde Cero
Si tu base de datos está vacía, usa:
```
000_migracion_completa_unificada.sql
```

### Opción B: Ya tienes las tablas básicas
Si ya ejecutaste las migraciones 001-003, solo ejecuta:
```
004_mejoras_criticas.sql
```

---

## 📦 PASO 2: Ejecutar Migraciones

### Método 1: Desde Supabase Dashboard (Recomendado)

1. **Ve a tu proyecto en Supabase**
   - https://app.supabase.com

2. **Navega a SQL Editor**
   - Menú lateral → SQL Editor

3. **Ejecuta en orden:**

   **Si instalas desde cero:**
   ```sql
   -- 1. Ejecutar primero
   -- Copiar y pegar: 000_migracion_completa_unificada.sql
   -- Esto crea tablas + RLS + triggers básicos

   -- 2. Ejecutar después
   -- Copiar y pegar: 004_mejoras_criticas.sql
   -- Esto agrega alertas automáticas + funciones avanzadas

   -- 3. Ejecutar para verificar
   -- Copiar y pegar: 003_verify_migration.sql
   ```

   **Si ya tienes las tablas:**
   ```sql
   -- Solo ejecutar: 004_mejoras_criticas.sql
   -- Luego verificar con: 003_verify_migration.sql
   ```

4. **Verificar resultados**
   - Deberías ver mensajes como:
     ```
     ✅ Todas las tablas existen correctamente
     ✅ RLS está habilitado en todas las tablas
     ✅ Se encontraron 20+ políticas RLS
     ✅ Los índices críticos existen
     ✅ Los triggers de updated_at están configurados
     ```

### Método 2: Usando Supabase CLI

```bash
# 1. Instalar CLI
npm install -g supabase

# 2. Login
supabase login

# 3. Vincular proyecto
supabase link --project-ref TU_PROJECT_REF

# 4. Push migraciones
supabase db push
```

---

## 🔐 PASO 3: Configurar Edge Function (Opcional)

Si quieres crear alertas desde el frontend, despliega la Edge Function:

```bash
# 1. Ir al directorio del proyecto
cd "C:\Users\Lenovo\Downloads\finantel version 2.1 funcional"

# 2. Desplegar función
supabase functions deploy generate-alert

# 3. Verificar
supabase functions list
```

**Usar desde el frontend:**
```typescript
const { data, error } = await supabase.functions.invoke('generate-alert', {
  body: {
    type: 'info',
    title: 'Nueva alerta',
    message: 'Este es un mensaje de prueba',
    priority: 5
  }
})
```

---

## 🧪 PASO 4: Verificar Instalación

### Verificación Manual en SQL Editor:

```sql
-- 1. Verificar tablas creadas
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN (
    'family_groups', 'family_group_members',
    'shared_expenses', 'shared_expense_splits',
    'profile_preferences', 'alerts'
);
-- Debe retornar 6 filas

-- 2. Verificar RLS habilitado
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN (
    'family_groups', 'family_group_members',
    'shared_expenses', 'shared_expense_splits',
    'profile_preferences', 'alerts'
);
-- Todas deben tener rowsecurity = true

-- 3. Contar políticas RLS
SELECT COUNT(*) as total_policies
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN (
    'family_groups', 'family_group_members',
    'shared_expenses', 'shared_expense_splits',
    'profile_preferences', 'alerts'
);
-- Debe retornar >= 20

-- 4. Verificar funciones creadas
SELECT routine_name
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name IN (
    'create_alert',
    'cleanup_expired_alerts',
    'get_expenses_by_category',
    'get_shared_expense_balances',
    'check_budget_threshold',
    'check_unusual_expense',
    'check_goal_progress'
);
-- Debe retornar 7 funciones

-- 5. Verificar triggers
SELECT trigger_name, event_object_table
FROM information_schema.triggers
WHERE trigger_schema = 'public'
AND event_object_table IN (
    'family_groups', 'shared_expenses',
    'profile_preferences', 'transactions', 'goals'
);
-- Debe mostrar varios triggers
```

---

## 📊 PASO 5: Probar Funcionalidades

### A. Crear un Grupo Familiar

```sql
-- Esto automáticamente te agrega como admin
INSERT INTO public.family_groups (name, created_by)
VALUES ('Mi Familia', auth.uid());

-- Verificar que fuiste agregado como admin
SELECT * FROM public.family_group_members
WHERE user_id = auth.uid();
```

### B. Probar Alerta Automática de Presupuesto

```sql
-- 1. Crear un presupuesto (asume que ya existe la tabla budgets)
INSERT INTO public.budgets (user_id, category_id, name, amount, period_start, period_end)
VALUES (
    auth.uid(),
    'CATEGORY_UUID_AQUI',
    'Presupuesto de Comida',
    1000.00,
    '2025-01-01',
    '2025-01-31'
);

-- 2. Crear transacciones que superen el 80%
INSERT INTO public.transactions (user_id, category_id, type, amount, date)
VALUES (
    auth.uid(),
    'CATEGORY_UUID_AQUI',
    'expense',
    850.00,
    CURRENT_DATE
);

-- 3. Ver alertas generadas automáticamente
SELECT * FROM public.alerts
WHERE user_id = auth.uid()
ORDER BY created_at DESC;
-- Deberías ver una alerta de "Presupuesto casi agotado"
```

### C. Probar Funciones de Dashboard

```sql
-- Ver gastos por categoría (últimos 30 días)
SELECT * FROM get_expenses_by_category(auth.uid(), 30);

-- Ver balance de gastos compartidos
SELECT * FROM get_shared_expense_balances(auth.uid());
```

---

## 🎨 PASO 6: Conectar con Frontend

### A. Crear Hooks de React

Crea el archivo `src/hooks/useFamilyGroups.js`:

```javascript
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export function useFamilyGroups() {
  const [groups, setGroups] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchGroups()
  }, [])

  async function fetchGroups() {
    try {
      const { data, error } = await supabase
        .from('family_groups')
        .select(`
          *,
          family_group_members(*)
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      if (error) throw error
      setGroups(data)
    } catch (error) {
      console.error('Error fetching groups:', error)
    } finally {
      setLoading(false)
    }
  }

  async function createGroup(name) {
    const { data: { user } } = await supabase.auth.getUser()

    const { data, error } = await supabase
      .from('family_groups')
      .insert({ name, created_by: user.id })
      .select()
      .single()

    if (!error) {
      await fetchGroups()
    }
    return { data, error }
  }

  return { groups, loading, createGroup, refetch: fetchGroups }
}
```

### B. Crear Hook para Alertas

Crea el archivo `src/hooks/useAlerts.js`:

```javascript
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export function useAlerts() {
  const [alerts, setAlerts] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAlerts()

    // Suscribirse a nuevas alertas
    const subscription = supabase
      .channel('alerts')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'alerts'
        },
        (payload) => {
          setAlerts(prev => [payload.new, ...prev])
          setUnreadCount(prev => prev + 1)
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  async function fetchAlerts() {
    try {
      const { data, error } = await supabase
        .from('alerts')
        .select('*')
        .eq('is_dismissed', false)
        .order('priority', { ascending: true })
        .order('created_at', { ascending: false })

      if (error) throw error

      setAlerts(data)
      setUnreadCount(data.filter(a => !a.is_read).length)
    } catch (error) {
      console.error('Error fetching alerts:', error)
    } finally {
      setLoading(false)
    }
  }

  async function markAsRead(alertId) {
    const { error } = await supabase
      .from('alerts')
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq('id', alertId)

    if (!error) {
      await fetchAlerts()
    }
  }

  async function dismissAlert(alertId) {
    const { error } = await supabase
      .from('alerts')
      .update({ is_dismissed: true, dismissed_at: new Date().toISOString() })
      .eq('id', alertId)

    if (!error) {
      await fetchAlerts()
    }
  }

  return {
    alerts,
    unreadCount,
    loading,
    markAsRead,
    dismissAlert,
    refetch: fetchAlerts
  }
}
```

### C. Componente de Alertas

```jsx
import { useAlerts } from '../hooks/useAlerts'

export function AlertsPanel() {
  const { alerts, unreadCount, markAsRead, dismissAlert } = useAlerts()

  const getAlertIcon = (type) => {
    const icons = {
      critical: '🚨',
      warning: '⚠️',
      info: '💡',
      opportunity: '🎯',
      trend: '📈'
    }
    return icons[type] || '📢'
  }

  return (
    <div className="alerts-panel">
      <h3>Alertas {unreadCount > 0 && `(${unreadCount})`}</h3>

      {alerts.map(alert => (
        <div
          key={alert.id}
          className={`alert alert-${alert.type} ${!alert.is_read ? 'unread' : ''}`}
        >
          <div className="alert-header">
            <span className="alert-icon">{getAlertIcon(alert.type)}</span>
            <h4>{alert.title}</h4>
          </div>

          <p>{alert.message}</p>

          {alert.recommendation && (
            <div className="alert-recommendation">
              <strong>Recomendación:</strong> {alert.recommendation}
            </div>
          )}

          <div className="alert-actions">
            {!alert.is_read && (
              <button onClick={() => markAsRead(alert.id)}>
                Marcar como leída
              </button>
            )}
            <button onClick={() => dismissAlert(alert.id)}>
              Descartar
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
```

---

## 🔧 PASO 7: Mantenimiento

### Limpiar Alertas Expiradas (Ejecutar periódicamente)

Crea un cron job o ejecuta manualmente:

```sql
-- Limpiar alertas expiradas
SELECT cleanup_expired_alerts();
-- Retorna el número de alertas marcadas como dismissed
```

Puedes automatizar esto con una Edge Function programada (Supabase Cron):

```typescript
// supabase/functions/cleanup-alerts/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )

  const { data, error } = await supabase.rpc('cleanup_expired_alerts')

  return new Response(
    JSON.stringify({
      success: !error,
      alerts_dismissed: data
    }),
    { headers: { 'Content-Type': 'application/json' } }
  )
})
```

Luego configura en Supabase Dashboard:
```
Settings → Edge Functions → Cron Jobs
Agregar: 0 2 * * * (ejecutar diariamente a las 2 AM)
```

---

## 📈 Métricas de Éxito

Después de implementar, deberías poder:

- ✅ Crear grupos familiares
- ✅ Agregar miembros a grupos
- ✅ Crear gastos compartidos con splits
- ✅ Recibir alertas automáticas de presupuesto
- ✅ Ver alertas de gastos inusuales
- ✅ Recibir notificaciones de progreso de metas
- ✅ Consultar dashboards con datos agregados
- ✅ Solo ver datos propios (RLS funcionando)

---

## 🐛 Troubleshooting

### Error: "policy already exists"
**Solución:** Las migraciones usan `DROP POLICY IF EXISTS` antes de crear. Si aún fallas, elimina manualmente las políticas viejas.

### Error: "relation does not exist"
**Solución:** Asegúrate de ejecutar primero `000_migracion_completa_unificada.sql` o `001_create_missing_tables.sql`.

### Error: "function does not exist"
**Solución:** Ejecuta `004_mejoras_criticas.sql` para crear las funciones.

### Las alertas automáticas no se generan
**Solución:** Verifica que:
1. Los triggers estén creados: `SELECT * FROM pg_trigger WHERE tgname LIKE '%check%';`
2. Las tablas `budgets`, `goals`, `transactions` existen
3. Tienes datos en esas tablas que cumplan las condiciones

### RLS bloquea mis queries
**Solución:**
- Verifica que estés autenticado: `SELECT auth.uid();` debe retornar tu UUID
- Verifica las políticas: `SELECT * FROM pg_policies WHERE tablename = 'NOMBRE_TABLA';`

---

## 📞 Soporte

Si tienes problemas:
1. Revisa los logs en Supabase Dashboard → Logs
2. Verifica la consola del navegador para errores de cliente
3. Ejecuta el script de verificación `003_verify_migration.sql`

---

## ✅ Checklist Final

- [ ] Migraciones ejecutadas sin errores
- [ ] Script de verificación pasó todas las pruebas
- [ ] RLS habilitado en todas las tablas
- [ ] 20+ políticas RLS creadas
- [ ] Triggers funcionando
- [ ] Funciones creadas correctamente
- [ ] Edge Function desplegada (opcional)
- [ ] Hooks de React creados
- [ ] Componentes de UI conectados
- [ ] Alertas automáticas funcionando
- [ ] Dashboard con datos agregados

---

**🎉 ¡Felicitaciones! Has completado la Fase 1 del Backend de Finatel v2.1**

**Tiempo estimado:** 1.5 días
**Siguiente fase:** Conectar todas las funcionalidades con el frontend
