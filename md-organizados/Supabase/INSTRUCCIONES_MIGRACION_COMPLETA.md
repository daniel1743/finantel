# 🚀 Instrucciones de Migración Completa - Finantel v2.1

## 📋 Resumen

Este documento explica cómo ejecutar la migración completa que incluye:

- ✅ **11 tablas** con todas las relaciones correctas
- ✅ **44 políticas RLS** que garantizan que cada usuario solo vea lo suyo
- ✅ **Sistema de auditoría** completo con triggers automáticos
- ✅ **40+ índices** optimizados para performance
- ✅ **Relaciones correctas** entre todas las tablas

---

## 🎯 Relaciones Implementadas

### 1. Transacciones → Categorías
```
transactions.category_id → categories.id
```
- Cada transacción puede tener una categoría asignada
- Si se elimina la categoría, la transacción mantiene `category_id = NULL`

### 2. Transacciones → Presupuestos
```
transactions.budget_id → budgets.id
```
- Cada transacción puede asociarse a un presupuesto
- Si se elimina el presupuesto, la transacción mantiene `budget_id = NULL`

### 3. Presupuestos → Categorías
```
budgets.category_id → categories.id
```
- Cada presupuesto está vinculado a una categoría específica
- Si se elimina la categoría, el presupuesto también se elimina (`ON DELETE CASCADE`)

### 4. Gastos Compartidos → Grupos Familiares
```
shared_expenses.family_group_id → family_groups.id
```
- Cada gasto compartido pertenece a un grupo familiar
- Si se elimina el grupo, todos sus gastos se eliminan (`ON DELETE CASCADE`)

### 5. Gastos Compartidos → Categorías
```
shared_expenses.category_id → categories.id
```
- Los gastos compartidos pueden categorizarse
- Si se elimina la categoría, el gasto mantiene `category_id = NULL`

---

## 🔐 Políticas RLS Implementadas

### Principio Base
**TODAS las operaciones requieren `auth.uid()` - Ningún dato se puede leer o escribir sin autenticación**

### Por Tabla

#### 1. Categories, Budgets, Transactions, Goals
```sql
-- Solo el dueño puede ver y modificar
SELECT: WHERE user_id = auth.uid()
INSERT: WHERE user_id = auth.uid()
UPDATE: WHERE user_id = auth.uid()
DELETE: WHERE user_id = auth.uid()
```

#### 2. Family Groups
```sql
SELECT: Ver grupos donde eres miembro
INSERT: Crear grupos (auth.uid() = created_by)
UPDATE: Solo admins del grupo
DELETE: Solo el creador del grupo
```

#### 3. Shared Expenses
```sql
SELECT: Ver gastos de grupos donde eres miembro
INSERT: Crear gastos si eres miembro del grupo
UPDATE: Quien pagó o admin del grupo
DELETE: Quien pagó o admin del grupo
```

#### 4. Profile Preferences & Alerts
```sql
-- Completamente privado
SELECT/INSERT/UPDATE/DELETE: WHERE user_id = auth.uid()
```

#### 5. Audit Logs
```sql
SELECT: Solo tus propios logs (WHERE user_id = auth.uid())
INSERT/UPDATE/DELETE: BLOQUEADO desde cliente (solo triggers)
```

---

## 📝 Sistema de Auditoría

### ¿Qué se Registra?

Todas las operaciones (INSERT, UPDATE, DELETE) en:
- ✅ Categories
- ✅ Budgets
- ✅ Transactions
- ✅ Goals
- ✅ Shared Expenses

### Información Capturada

```json
{
  "user_id": "uuid-del-usuario",
  "table_name": "transactions",
  "operation": "UPDATE",
  "record_id": "uuid-del-registro",
  "old_data": { ... },
  "new_data": { ... },
  "changed_fields": ["amount", "description"],
  "created_at": "2025-11-21T..."
}
```

### Consultar Auditoría

```sql
-- Ver tus últimos cambios
SELECT * FROM audit_logs
WHERE user_id = auth.uid()
ORDER BY created_at DESC
LIMIT 50;

-- Ver cambios en una tabla específica
SELECT * FROM audit_logs
WHERE user_id = auth.uid()
AND table_name = 'transactions'
ORDER BY created_at DESC;

-- Ver cambios en un registro específico
SELECT * FROM audit_logs
WHERE record_id = 'uuid-del-registro'
ORDER BY created_at DESC;
```

---

## 🚀 Pasos de Instalación

### PASO 1: Abrir Supabase Dashboard

1. Ve a https://app.supabase.com
2. Selecciona tu proyecto
3. Click en **SQL Editor** en el menú izquierdo

### PASO 2: Ejecutar la Migración

1. Abre el archivo: `supabase/migrations/008_schema_completo_con_relaciones_rls_y_auditoria.sql`
2. Copia **TODO** el contenido (Ctrl+A, Ctrl+C)
3. Pega en el SQL Editor (Ctrl+V)
4. Click en **RUN** o presiona Ctrl+Enter

### PASO 3: Verificar la Instalación

Al final de la ejecución deberías ver:

```
========================================
✅ VERIFICACIÓN DE MIGRACIÓN
========================================
Tablas creadas: 11
Tablas con RLS: 11
Políticas RLS: 44
Índices: 40+
Triggers: 10+
========================================
✅ Migración completada exitosamente
```

---

## ✅ Verificación Manual (Opcional)

### Verificar Tablas Creadas

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN (
    'categories', 'budgets', 'transactions', 'goals',
    'family_groups', 'family_group_members',
    'shared_expenses', 'shared_expense_splits',
    'profile_preferences', 'alerts', 'audit_logs'
)
ORDER BY table_name;
```

Deberías ver **11 tablas**.

### Verificar RLS Habilitado

```sql
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
```

Todas las tablas deben tener `rowsecurity = true`.

### Verificar Políticas RLS

```sql
SELECT schemaname, tablename, policyname, cmd
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, cmd;
```

Deberías ver al menos **44 políticas** (4 por cada tabla: SELECT, INSERT, UPDATE, DELETE).

### Verificar Índices

```sql
SELECT indexname, tablename
FROM pg_indexes
WHERE schemaname = 'public'
AND indexname LIKE 'idx_%'
ORDER BY tablename, indexname;
```

Deberías ver **40+ índices**.

### Verificar Triggers

```sql
SELECT tgname, tgrelid::regclass, tgtype
FROM pg_trigger
WHERE tgname NOT LIKE 'pg_%'
ORDER BY tgrelid::regclass, tgname;
```

Deberías ver triggers de:
- `update_*_updated_at` (7 triggers)
- `audit_*` (5 triggers)
- `auto_add_admin` (1 trigger)

---

## 🧪 Pruebas Básicas

### 1. Crear una Categoría

```sql
INSERT INTO categories (user_id, name, type, icon, color)
VALUES (auth.uid(), 'Alimentación', 'expense', '🍕', '#FF5733')
RETURNING *;
```

### 2. Crear un Presupuesto

```sql
INSERT INTO budgets (user_id, category_id, name, amount, period)
VALUES (
    auth.uid(),
    'uuid-categoria-creada',
    'Presupuesto de Comida',
    500.00,
    'monthly'
)
RETURNING *;
```

### 3. Crear una Transacción

```sql
INSERT INTO transactions (
    user_id, category_id, budget_id,
    type, amount, description, date
)
VALUES (
    auth.uid(),
    'uuid-categoria-creada',
    'uuid-presupuesto-creado',
    'expense',
    45.50,
    'Almuerzo en restaurante',
    CURRENT_DATE
)
RETURNING *;
```

### 4. Verificar Relaciones

```sql
-- Ver transacción con su categoría y presupuesto
SELECT
    t.id,
    t.description,
    t.amount,
    c.name as category_name,
    b.name as budget_name
FROM transactions t
LEFT JOIN categories c ON c.id = t.category_id
LEFT JOIN budgets b ON b.id = t.budget_id
WHERE t.user_id = auth.uid()
LIMIT 10;
```

### 5. Verificar Auditoría

```sql
-- Ver logs de las operaciones que acabas de hacer
SELECT
    table_name,
    operation,
    new_data->>'description' as description,
    created_at
FROM audit_logs
WHERE user_id = auth.uid()
ORDER BY created_at DESC
LIMIT 10;
```

### 6. Crear un Grupo Familiar

```sql
INSERT INTO family_groups (name, created_by)
VALUES ('Mi Familia', auth.uid())
RETURNING *;
```

### 7. Verificar Auto-Admin

```sql
-- Deberías aparecer automáticamente como admin
SELECT * FROM family_group_members
WHERE user_id = auth.uid();
```

---

## 🔍 Validación de Seguridad RLS

### Test 1: Intentar ver datos de otro usuario (debe fallar)

```sql
-- Esto NO debe devolver ningún resultado
SELECT * FROM categories WHERE user_id != auth.uid();
```

**Resultado esperado:** 0 filas (aunque existan categorías de otros usuarios, RLS las bloquea)

### Test 2: Intentar crear sin autenticación (debe fallar)

```sql
-- Esto debe fallar con error de política RLS
INSERT INTO categories (user_id, name, type)
VALUES ('00000000-0000-0000-0000-000000000000', 'Test', 'expense');
```

**Resultado esperado:** Error de política RLS

### Test 3: Solo ver tus datos

```sql
-- Esto debe devolver solo TUS categorías
SELECT * FROM categories;
```

**Resultado esperado:** Solo tus propias categorías (RLS filtra automáticamente)

---

## 🐛 Troubleshooting

### Error: "relation already exists"

**Causa:** Ya ejecutaste el script antes.

**Solución:** El script ya incluye `DROP TABLE IF EXISTS` al inicio. Si falla, ejecuta manualmente:

```sql
DROP TABLE IF EXISTS public.audit_logs CASCADE;
DROP TABLE IF EXISTS public.alerts CASCADE;
DROP TABLE IF EXISTS public.profile_preferences CASCADE;
DROP TABLE IF EXISTS public.shared_expense_splits CASCADE;
DROP TABLE IF EXISTS public.shared_expenses CASCADE;
DROP TABLE IF EXISTS public.family_group_members CASCADE;
DROP TABLE IF EXISTS public.family_groups CASCADE;
DROP TABLE IF EXISTS public.goals CASCADE;
DROP TABLE IF EXISTS public.transactions CASCADE;
DROP TABLE IF EXISTS public.budgets CASCADE;
DROP TABLE IF EXISTS public.categories CASCADE;
```

Luego vuelve a ejecutar la migración completa.

### Error: "policy already exists"

**Causa:** Políticas de migraciones anteriores.

**Solución:**

```sql
-- Eliminar todas las políticas de las tablas
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT schemaname, tablename, policyname
        FROM pg_policies
        WHERE schemaname = 'public'
    ) LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) ||
                ' ON ' || quote_ident(r.schemaname) || '.' || quote_ident(r.tablename);
    END LOOP;
END $$;
```

Luego vuelve a ejecutar la migración completa.

### Error: "permission denied"

**Causa:** No tienes permisos o estás usando la API en lugar del SQL Editor.

**Solución:** Asegúrate de estar en **SQL Editor** del Dashboard de Supabase, no en la API.

### Los triggers de auditoría no funcionan

**Verificar:**

```sql
SELECT tgname, tgrelid::regclass
FROM pg_trigger
WHERE tgname LIKE 'audit_%';
```

Si no aparecen, vuelve a ejecutar solo la sección de triggers de la migración.

---

## 📊 Diagrama de Relaciones

```
┌─────────────┐
│   USERS     │ (auth.users - Supabase Auth)
└──────┬──────┘
       │
       ├──────────────────────────────────────────────┐
       │                                              │
       ▼                                              ▼
┌─────────────┐                              ┌──────────────┐
│ CATEGORIES  │◄──────────────┐              │ FAMILY_GROUPS│
└──────┬──────┘               │              └──────┬───────┘
       │                      │                     │
       │ FK                   │                     │
       ▼                      │                     ▼
┌─────────────┐               │              ┌─────────────────┐
│   BUDGETS   │               │ FK           │ FAMILY_GROUP_   │
└──────┬──────┘               │              │    MEMBERS      │
       │                      │              └─────────────────┘
       │ FK                   │                     │
       ▼                      │                     │
┌──────────────┐              │                     ▼
│ TRANSACTIONS │──────────────┘              ┌──────────────┐
└──────────────┘                             │    SHARED_   │
       │                                     │   EXPENSES   │
       │                                     └──────┬───────┘
       ▼                                            │
┌──────────────┐                                   ▼
│    GOALS     │                             ┌──────────────┐
└──────────────┘                             │  SHARED_     │
                                             │  EXPENSE_    │
┌──────────────┐                             │  SPLITS      │
│   PROFILE_   │                             └──────────────┘
│ PREFERENCES  │
└──────────────┘

┌──────────────┐
│   ALERTS     │
└──────────────┘

┌──────────────┐
│  AUDIT_LOGS  │ (registra cambios en todas las tablas)
└──────────────┘
```

---

## 📚 Próximos Pasos

Una vez que la migración esté completa:

1. ✅ **Crear categorías por defecto** cuando un usuario se registre
2. ✅ **Configurar realtime subscriptions** en el frontend
3. ✅ **Implementar hooks React** para cada tabla
4. ✅ **Crear componentes UI** para las nuevas funcionalidades
5. ✅ **Configurar alertas automáticas** basadas en presupuestos

---

## 💡 Beneficios de Esta Migración

### Seguridad
- ✅ RLS en todas las tablas
- ✅ Ningún usuario puede ver datos de otros
- ✅ Auditoría completa de cambios

### Relaciones
- ✅ Integridad referencial garantizada
- ✅ Cascadas configuradas correctamente
- ✅ Relaciones flexibles (SET NULL donde corresponde)

### Performance
- ✅ Índices en todas las columnas frecuentemente consultadas
- ✅ Índices compuestos para queries complejas
- ✅ Triggers optimizados

### Mantenibilidad
- ✅ Código limpio y documentado
- ✅ Nombres consistentes
- ✅ Estructura clara y escalable

---

## 📞 Soporte

Si tienes problemas durante la instalación:

1. Verifica que estés usando **SQL Editor** en Supabase Dashboard
2. Revisa los mensajes de error específicos
3. Ejecuta las consultas de verificación de este documento
4. Consulta la sección de Troubleshooting

---

## ✅ Checklist de Verificación

Marca cada item después de verificarlo:

- [ ] Script ejecutado sin errores
- [ ] 11 tablas creadas
- [ ] 11 tablas con RLS habilitado
- [ ] 44+ políticas RLS creadas
- [ ] 40+ índices creados
- [ ] 10+ triggers creados
- [ ] Prueba de crear categoría exitosa
- [ ] Prueba de crear transacción exitosa
- [ ] Prueba de RLS (no ver datos de otros) exitosa
- [ ] Auditoría registrando cambios correctamente
- [ ] Grupo familiar auto-agregar admin funciona

---

**Versión:** 2.1
**Fecha:** 2025-11-21
**Archivo:** `008_schema_completo_con_relaciones_rls_y_auditoria.sql`
