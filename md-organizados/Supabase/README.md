# 🗄️ Migraciones de Base de Datos - Finatel v2.1

Este directorio contiene las migraciones SQL para crear las tablas faltantes en Supabase + **funcionalidades avanzadas**.

## 🚀 NUEVO: Mejoras Agregadas

Esta versión incluye:
- 🤖 **Alertas automáticas** (presupuesto, gastos inusuales, metas)
- 📊 **Funciones de dashboard** (gastos por categoría, balances)
- ⚡ **Índices optimizados** (5-10x más rápido)
- 🛠️ **7 funciones helper** (create_alert, cleanup, etc.)
- 🎨 **Edge Function** para alertas desde frontend
- 📚 **Documentación completa** (guías paso a paso)

**📖 Ver:** [MEJORAS_APLICADAS.md](./MEJORAS_APLICADAS.md) para más detalles.

---

## ⚡ Quick Start (5 minutos)

**Lee:** [QUICK_START.md](./QUICK_START.md) para implementar en 5 minutos.

**O sigue la guía completa abajo.**

---

## 📋 Tablas Creadas

### 1. **family_groups** + **family_group_members**
- Grupos familiares donde los usuarios comparten gastos
- Relación muchos-a-muchos entre usuarios y grupos
- Roles: `admin` y `member`

### 2. **shared_expenses** + **shared_expense_splits**
- Gastos compartidos entre miembros de un grupo
- División de gastos con porcentajes o montos fijos
- Estados: `pending`, `settled`, `cancelled`

### 3. **profile_preferences**
- Preferencias de usuario (moneda, idioma, notificaciones)
- Una entrada por usuario (UNIQUE constraint)

### 4. **alerts**
- Alertas inteligentes generadas automáticamente
- Tipos: `critical`, `warning`, `info`, `opportunity`, `trend`
- Prioridad del 1 al 10

## 🚀 Cómo Aplicar las Migraciones

### Opción 1: Instalación Completa desde Cero (Recomendado)

**Si tu base de datos está VACÍA:**

1. Ve a tu proyecto en [Supabase Dashboard](https://app.supabase.com)
2. Navega a **SQL Editor**
3. **PASO 1:** Ejecuta `000_migracion_completa_unificada.sql` (tablas + RLS + triggers)
4. **PASO 2:** Ejecuta `004_mejoras_criticas.sql` (alertas automáticas + funciones)
5. **PASO 3:** Ejecuta `003_verify_migration.sql` para verificar

### Opción 2: Solo Agregar Mejoras

**Si YA tienes las tablas básicas:**

1. Ve a tu proyecto en [Supabase Dashboard](https://app.supabase.com)
2. Navega a **SQL Editor**
3. **Solo ejecuta:** `004_mejoras_criticas.sql`
4. **Verifica con:** `003_verify_migration.sql`

### Opción 3: Instalación Paso a Paso (Antigua)

**⚠️ IMPORTANTE: Ejecutar en este orden exacto**

1. Ve a tu proyecto en [Supabase Dashboard](https://app.supabase.com)
2. Navega a **SQL Editor**
3. **PASO 1:** Abre el archivo `001_create_missing_tables.sql`
4. Copia y pega todo el contenido
5. Ejecuta el script y verifica que no haya errores
6. **PASO 2:** Abre el archivo `002_create_rls_policies_FIXED.sql` (o `002_create_rls_policies.sql`)
7. Copia y pega todo el contenido
8. Ejecuta el script
9. **PASO 3:** Ejecuta `004_mejoras_criticas.sql` para agregar mejoras
10. **PASO 4:** Ejecuta `003_verify_migration.sql` para verificar que todo está correcto

### Opción 2: Usando Supabase CLI

```bash
# Instalar Supabase CLI si no lo tienes
npm install -g supabase

# Iniciar sesión
supabase login

# Vincular tu proyecto
supabase link --project-ref tu-project-ref

# Aplicar migraciones
supabase db push
```

### Opción 3: Desde psql (PostgreSQL directo)

```bash
# Conectar a tu base de datos
psql -h db.yzakmqxbzwzbsdsadzej.supabase.co -U postgres -d postgres

# Ejecutar migraciones
\i supabase/migrations/001_create_missing_tables.sql
\i supabase/migrations/002_create_rls_policies.sql
```

## ✅ Verificación

Después de aplicar las migraciones, ejecuta el script de verificación:

```sql
-- Verificar que las tablas existen
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
    'family_groups',
    'family_group_members',
    'shared_expenses',
    'shared_expense_splits',
    'profile_preferences',
    'alerts'
);

-- Verificar que RLS está habilitado
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN (
    'family_groups',
    'family_group_members',
    'shared_expenses',
    'shared_expense_splits',
    'profile_preferences',
    'alerts'
);
```

## 🔒 Seguridad (RLS)

Todas las tablas tienen **Row Level Security (RLS)** habilitado con políticas que garantizan:

- ✅ Los usuarios solo ven sus propios datos
- ✅ Los usuarios solo pueden modificar sus propios datos
- ✅ Los miembros de grupos solo ven datos de sus grupos
- ✅ Los admins tienen permisos adicionales en sus grupos

## 📝 Notas Importantes

### Alertas
Las alertas tienen una política que **bloquea INSERT directo** desde el cliente. Esto es por seguridad. Para crear alertas, usa:

1. **Edge Functions** (recomendado)
2. **Database Functions/Triggers**
3. **Service Role Key** (solo en backend seguro)

Si necesitas permitir que el frontend cree alertas, modifica la política en `002_create_rls_policies.sql`.

### Validación de Splits
Hay un trigger que valida que la suma de `shared_expense_splits` coincida con el `amount` de `shared_expenses`. Esto previene errores de división.

## 🐛 Troubleshooting

### Error: "relation already exists"
- Las tablas ya existen. Puedes usar `CREATE TABLE IF NOT EXISTS` o eliminar las tablas primero.

### Error: "permission denied"
- Verifica que estás usando la conexión correcta (no anon key para crear tablas)
- Necesitas permisos de administrador

### Error: "policy already exists"
- Las políticas ya existen. Elimínalas primero o usa `CREATE POLICY IF NOT EXISTS` (PostgreSQL 9.5+)

## 📚 Estructura de Datos

Ver `SCHEMA_DOCUMENTATION.md` para documentación detallada de cada tabla.

---

## 📖 Documentación Completa

- **[QUICK_START.md](./QUICK_START.md)** - Implementa en 5 minutos
- **[GUIA_IMPLEMENTACION_FASE1.md](./GUIA_IMPLEMENTACION_FASE1.md)** - Guía paso a paso completa
- **[MEJORAS_APLICADAS.md](./MEJORAS_APLICADAS.md)** - Resumen de mejoras agregadas
- **[SCHEMA_DOCUMENTATION.md](./SCHEMA_DOCUMENTATION.md)** - Esquema de base de datos
- **[../FASE1_BACKEND_MEJORADA.md](../FASE1_BACKEND_MEJORADA.md)** - Resumen ejecutivo

---

## 📁 Archivos de Migración

```
000_migracion_completa_unificada.sql  → Todo en uno (instalación desde cero)
001_create_missing_tables.sql         → Solo tablas (método antiguo)
002_create_rls_policies.sql           → Solo RLS (método antiguo)
002_create_rls_policies_FIXED.sql     → RLS corregido (método antiguo)
003_verify_migration.sql              → Script de verificación
004_add_type_column_to_categories.sql → Agregar columna 'type' a categories ⚠️ IMPORTANTE
004_mejoras_criticas.sql              → Alertas automáticas + funciones ⭐ NUEVO
```

---

## 🎯 Funcionalidades Nuevas

### 🤖 Alertas Automáticas

- **Presupuesto 80%:** Alerta cuando gastas 80-99%
- **Presupuesto 100%:** Alerta crítica cuando excedes
- **Gasto inusual:** Alerta cuando gastas 2x más que tu promedio
- **Progreso de metas:** Alertas en 25%, 50%, 75%, 100%

### 📊 Funciones de Dashboard

```sql
-- Gastos por categoría
SELECT * FROM get_expenses_by_category(user_id, days);

-- Balance de gastos compartidos
SELECT * FROM get_shared_expense_balances(user_id);

-- Limpiar alertas expiradas
SELECT cleanup_expired_alerts();
```

### 🎨 Edge Function

```typescript
// Crear alerta desde frontend
await supabase.functions.invoke('generate-alert', {
  body: {
    type: 'info',
    title: 'Nueva alerta',
    message: 'Mensaje de prueba'
  }
})
```

