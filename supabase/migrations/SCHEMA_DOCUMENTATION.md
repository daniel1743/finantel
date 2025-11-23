# 📚 Documentación de Esquema de Base de Datos

## Estructura Completa de Tablas

### 🔗 Relaciones entre Tablas

```
auth.users
    ├── family_groups (created_by)
    ├── family_group_members (user_id)
    ├── shared_expenses (paid_by_user_id)
    ├── shared_expense_splits (user_id)
    ├── profile_preferences (user_id)
    └── alerts (user_id)

family_groups
    ├── family_group_members (family_group_id)
    └── shared_expenses (family_group_id)

shared_expenses
    ├── shared_expense_splits (shared_expense_id)
    └── categories (category_id) [opcional]

alerts
    ├── categories (category_id) [opcional]
    ├── budgets (budget_id) [opcional]
    ├── goals (goal_id) [opcional]
    └── transactions (transaction_id) [opcional]
```

---

## 📋 Tabla: `family_groups`

**Propósito:** Grupos familiares donde los usuarios comparten gastos.

### Columnas

| Columna | Tipo | Descripción |
|---------|------|-------------|
| `id` | UUID | Primary key, generado automáticamente |
| `name` | TEXT | Nombre del grupo (1-100 caracteres) |
| `created_by` | UUID | ID del usuario que creó el grupo (FK → auth.users) |
| `created_at` | TIMESTAMPTZ | Fecha de creación |
| `updated_at` | TIMESTAMPTZ | Última actualización (auto) |
| `is_active` | BOOLEAN | Si el grupo está activo (default: true) |
| `settings` | JSONB | Configuraciones del grupo (moneda, etc.) |

### Índices
- `idx_family_groups_created_by` - Búsqueda por creador
- `idx_family_groups_active` - Filtrado de grupos activos

### Políticas RLS
- ✅ SELECT: Usuarios ven grupos donde son miembros
- ✅ INSERT: Usuarios pueden crear grupos
- ✅ UPDATE: Solo admins pueden actualizar
- ✅ DELETE: Solo el creador puede eliminar

---

## 👥 Tabla: `family_group_members`

**Propósito:** Relación muchos-a-muchos entre usuarios y grupos familiares.

### Columnas

| Columna | Tipo | Descripción |
|---------|------|-------------|
| `id` | UUID | Primary key |
| `family_group_id` | UUID | ID del grupo (FK → family_groups) |
| `user_id` | UUID | ID del usuario (FK → auth.users) |
| `role` | TEXT | Rol: `admin` o `member` (default: `member`) |
| `joined_at` | TIMESTAMPTZ | Fecha de unión al grupo |
| `is_active` | BOOLEAN | Si el miembro está activo |

### Constraints
- `UNIQUE(family_group_id, user_id)` - Un usuario solo puede estar una vez en un grupo

### Índices
- `idx_family_group_members_group` - Búsqueda por grupo
- `idx_family_group_members_user` - Búsqueda por usuario
- `idx_family_group_members_active` - Filtrado de miembros activos

### Políticas RLS
- ✅ SELECT: Usuarios ven miembros de sus grupos
- ✅ INSERT: Solo admins pueden agregar miembros
- ✅ UPDATE: Solo admins pueden actualizar
- ✅ DELETE: Usuario puede salirse o admin puede remover

---

## 💰 Tabla: `shared_expenses`

**Propósito:** Gastos compartidos entre miembros de un grupo.

### Columnas

| Columna | Tipo | Descripción |
|---------|------|-------------|
| `id` | UUID | Primary key |
| `family_group_id` | UUID | ID del grupo (FK → family_groups) |
| `paid_by_user_id` | UUID | Usuario que pagó (FK → auth.users) |
| `title` | TEXT | Título del gasto (1-200 caracteres) |
| `description` | TEXT | Descripción opcional |
| `amount` | DECIMAL(12,2) | Monto del gasto (debe ser > 0) |
| `currency` | TEXT | Moneda (default: 'USD') |
| `expense_date` | DATE | Fecha del gasto (default: hoy) |
| `category_id` | UUID | Categoría opcional (FK → categories) |
| `status` | TEXT | Estado: `pending`, `settled`, `cancelled` |
| `created_at` | TIMESTAMPTZ | Fecha de creación |
| `updated_at` | TIMESTAMPTZ | Última actualización (auto) |
| `metadata` | JSONB | Datos adicionales (imagen, recibo, etc.) |

### Índices
- `idx_shared_expenses_group` - Búsqueda por grupo
- `idx_shared_expenses_paid_by` - Búsqueda por quien pagó
- `idx_shared_expenses_status` - Filtrado por estado
- `idx_shared_expenses_date` - Ordenamiento por fecha

### Políticas RLS
- ✅ SELECT: Usuarios ven gastos de sus grupos
- ✅ INSERT: Usuarios pueden crear gastos en sus grupos
- ✅ UPDATE: Quien pagó o admin puede actualizar
- ✅ DELETE: Quien pagó o admin puede eliminar

---

## 🧩 Tabla: `shared_expense_splits`

**Propósito:** División de gastos compartidos entre usuarios.

### Columnas

| Columna | Tipo | Descripción |
|---------|------|-------------|
| `id` | UUID | Primary key |
| `shared_expense_id` | UUID | ID del gasto (FK → shared_expenses) |
| `user_id` | UUID | Usuario que debe pagar (FK → auth.users) |
| `amount` | DECIMAL(12,2) | Monto que debe pagar (>= 0) |
| `percentage` | DECIMAL(5,2) | Porcentaje del total (0-100) |
| `is_settled` | BOOLEAN | Si ya pagó (default: false) |
| `settled_at` | TIMESTAMPTZ | Fecha de pago |
| `notes` | TEXT | Notas opcionales |

### Constraints
- `UNIQUE(shared_expense_id, user_id)` - Un usuario solo una división por gasto
- **Trigger de validación:** La suma de todos los splits debe igualar el amount del gasto

### Índices
- `idx_shared_expense_splits_expense` - Búsqueda por gasto
- `idx_shared_expense_splits_user` - Búsqueda por usuario
- `idx_shared_expense_splits_settled` - Filtrado de pagados

### Políticas RLS
- ✅ SELECT: Usuarios ven splits de gastos de sus grupos
- ✅ INSERT: Quien pagó o admin puede crear splits
- ✅ UPDATE: Usuario puede marcar su split como pagado, o quien pagó/admin puede actualizar
- ✅ DELETE: Quien pagó o admin puede eliminar

---

## ⚙️ Tabla: `profile_preferences`

**Propósito:** Preferencias de usuario (moneda, idioma, notificaciones).

### Columnas

| Columna | Tipo | Descripción |
|---------|------|-------------|
| `id` | UUID | Primary key |
| `user_id` | UUID | ID del usuario (FK → auth.users, UNIQUE) |
| `currency` | TEXT | Moneda: USD, EUR, GBP, MXN, ARS, CLP, COP, PEN |
| `language` | TEXT | Idioma: es, en, pt |
| `date_format` | TEXT | Formato de fecha: DD/MM/YYYY, MM/DD/YYYY, YYYY-MM-DD |
| `number_format` | TEXT | Formato numérico: 1.234,56 o 1,234.56 |
| `email_notifications` | BOOLEAN | Notificaciones por email |
| `push_notifications` | BOOLEAN | Notificaciones push |
| `budget_alerts` | BOOLEAN | Alertas de presupuesto |
| `goal_reminders` | BOOLEAN | Recordatorios de metas |
| `weekly_summary` | BOOLEAN | Resumen semanal |
| `monthly_report` | BOOLEAN | Reporte mensual |
| `default_view` | TEXT | Vista por defecto: overview, transactions, budgets, goals |
| `show_charts` | BOOLEAN | Mostrar gráficos |
| `compact_mode` | BOOLEAN | Modo compacto |
| `share_analytics` | BOOLEAN | Compartir analytics |
| `created_at` | TIMESTAMPTZ | Fecha de creación |
| `updated_at` | TIMESTAMPTZ | Última actualización (auto) |

### Constraints
- `UNIQUE(user_id)` - Un usuario solo tiene una entrada de preferencias

### Índices
- `idx_profile_preferences_user` - Búsqueda por usuario

### Políticas RLS
- ✅ SELECT: Usuario solo ve sus preferencias
- ✅ INSERT: Usuario puede crear sus preferencias
- ✅ UPDATE: Usuario solo puede actualizar sus preferencias
- ✅ DELETE: Usuario puede eliminar sus preferencias

---

## 🚨 Tabla: `alerts`

**Propósito:** Alertas inteligentes generadas automáticamente.

### Columnas

| Columna | Tipo | Descripción |
|---------|------|-------------|
| `id` | UUID | Primary key |
| `user_id` | UUID | ID del usuario (FK → auth.users) |
| `type` | TEXT | Tipo: `critical`, `warning`, `info`, `opportunity`, `trend` |
| `title` | TEXT | Título (1-200 caracteres) |
| `message` | TEXT | Mensaje (1-1000 caracteres) |
| `recommendation` | TEXT | Recomendación opcional |
| `category_id` | UUID | Categoría relacionada (FK → categories, opcional) |
| `budget_id` | UUID | Presupuesto relacionado (FK → budgets, opcional) |
| `goal_id` | UUID | Meta relacionada (FK → goals, opcional) |
| `transaction_id` | UUID | Transacción relacionada (FK → transactions, opcional) |
| `priority` | INTEGER | Prioridad 1-10 (1 = más alta, 10 = más baja) |
| `is_read` | BOOLEAN | Si fue leída (default: false) |
| `is_dismissed` | BOOLEAN | Si fue descartada (default: false) |
| `action_taken` | BOOLEAN | Si se tomó acción (default: false) |
| `metadata` | JSONB | Datos adicionales (valores, comparaciones) |
| `expires_at` | TIMESTAMPTZ | Fecha de expiración (opcional) |
| `created_at` | TIMESTAMPTZ | Fecha de creación |
| `read_at` | TIMESTAMPTZ | Fecha de lectura |
| `dismissed_at` | TIMESTAMPTZ | Fecha de descarte |

### Índices
- `idx_alerts_user` - Búsqueda por usuario
- `idx_alerts_type` - Filtrado por tipo
- `idx_alerts_read` - Filtrado de no leídas
- `idx_alerts_dismissed` - Filtrado de no descartadas
- `idx_alerts_priority` - Ordenamiento por prioridad
- `idx_alerts_created` - Ordenamiento por fecha (DESC)
- `idx_alerts_expires` - Filtrado de expiradas

### Políticas RLS
- ✅ SELECT: Usuario solo ve sus alertas
- ❌ INSERT: **BLOQUEADO** desde cliente (usar Edge Functions/Triggers)
- ✅ UPDATE: Usuario puede actualizar sus alertas
- ✅ DELETE: Usuario puede eliminar sus alertas

---

## 🔄 Triggers y Funciones

### `update_updated_at_column()`
Actualiza automáticamente el campo `updated_at` cuando se modifica un registro.

**Aplicado a:**
- `family_groups`
- `shared_expenses`
- `profile_preferences`

### `validate_expense_splits()`
Valida que la suma de todos los `shared_expense_splits` coincida con el `amount` del `shared_expense`.

**Trigger:** `validate_expense_splits_trigger` en `shared_expense_splits`

---

## 📊 Ejemplos de Uso

### Crear un grupo familiar
```sql
INSERT INTO family_groups (name, created_by)
VALUES ('Familia García', auth.uid())
RETURNING id;
```

### Agregar un miembro al grupo
```sql
INSERT INTO family_group_members (family_group_id, user_id, role)
VALUES ('grupo-uuid', 'usuario-uuid', 'member');
```

### Crear un gasto compartido
```sql
INSERT INTO shared_expenses (family_group_id, paid_by_user_id, title, amount)
VALUES ('grupo-uuid', auth.uid(), 'Cena familiar', 150.00)
RETURNING id;
```

### Dividir el gasto
```sql
-- Usuario 1 paga 50%
INSERT INTO shared_expense_splits (shared_expense_id, user_id, amount, percentage)
VALUES ('gasto-uuid', 'usuario1-uuid', 75.00, 50.00);

-- Usuario 2 paga 50%
INSERT INTO shared_expense_splits (shared_expense_id, user_id, amount, percentage)
VALUES ('gasto-uuid', 'usuario2-uuid', 75.00, 50.00);
```

### Crear preferencias de usuario
```sql
INSERT INTO profile_preferences (user_id, currency, language, email_notifications)
VALUES (auth.uid(), 'USD', 'es', true)
ON CONFLICT (user_id) 
DO UPDATE SET 
    currency = EXCLUDED.currency,
    language = EXCLUDED.language,
    updated_at = NOW();
```

---

## 🔐 Seguridad

Todas las tablas tienen **Row Level Security (RLS)** habilitado. Las políticas garantizan que:

1. Los usuarios solo acceden a sus propios datos
2. Los miembros de grupos solo ven datos de sus grupos
3. Los admins tienen permisos adicionales en sus grupos
4. Las alertas no se pueden crear directamente desde el cliente

**⚠️ IMPORTANTE:** Nunca deshabilites RLS en producción sin políticas alternativas de seguridad.



