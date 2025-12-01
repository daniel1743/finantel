# 🔧 Correcciones Aplicadas a los Scripts SQL

## Errores Corregidos

### ❌ Error 1: "column reference 'table_name' is ambiguous"
**Archivo:** `003_verify_migration.sql`  
**Línea:** 30  
**Solución:** Agregado alias `t` a la tabla en la consulta

```sql
-- ANTES (error)
WHERE table_schema = 'public' 
AND table_name = table_name

-- DESPUÉS (corregido)
FROM information_schema.tables t
WHERE t.table_schema = 'public' 
AND t.table_name = table_name
```

### ❌ Error 2: "relation 'public.family_group_members' does not exist"
**Archivo:** `002_create_rls_policies.sql`  
**Causa:** Script ejecutado antes de crear las tablas  
**Solución:** 
- Agregadas verificaciones IF EXISTS antes de habilitar RLS
- Creado archivo `002_create_rls_policies_FIXED.sql` con todas las correcciones

### ❌ Error 3: "column 'created_by' does not exist"
**Archivo:** `001_create_missing_tables.sql`  
**Causa:** Foreign keys a `auth.users` causan problemas en Supabase  
**Solución:** Removidas todas las foreign keys a `auth.users`, usando solo UUID. La validación se hace con RLS.

```sql
-- ANTES (error)
created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE

-- DESPUÉS (corregido)
created_by UUID NOT NULL, -- Referencia a auth.users, se valida con RLS
```

## 📋 Archivos Actualizados

1. ✅ `001_create_missing_tables.sql` - Removidas foreign keys a auth.users
2. ✅ `002_create_rls_policies.sql` - Agregadas verificaciones IF EXISTS
3. ✅ `002_create_rls_policies_FIXED.sql` - Versión completa con DROP POLICY IF EXISTS
4. ✅ `003_verify_migration.sql` - Corregido alias de tabla

## 🚀 Cómo Aplicar las Correcciones

### Opción A: Usar archivos corregidos (Recomendado)

1. Ejecuta `001_create_missing_tables.sql` (ya corregido)
2. Ejecuta `002_create_rls_policies_FIXED.sql` (versión completa)
3. Ejecuta `003_verify_migration.sql` (ya corregido)

### Opción B: Si ya ejecutaste los scripts originales

Si ya ejecutaste los scripts y hay errores:

1. **Para políticas duplicadas:**
   ```sql
   -- Eliminar todas las políticas existentes
   DROP POLICY IF EXISTS "nombre_politica" ON public.tabla;
   ```
   Luego ejecuta `002_create_rls_policies_FIXED.sql`

2. **Para tablas con foreign keys problemáticas:**
   ```sql
   -- Eliminar las tablas y recrearlas
   DROP TABLE IF EXISTS public.alerts CASCADE;
   DROP TABLE IF EXISTS public.profile_preferences CASCADE;
   DROP TABLE IF EXISTS public.shared_expense_splits CASCADE;
   DROP TABLE IF EXISTS public.shared_expenses CASCADE;
   DROP TABLE IF EXISTS public.family_group_members CASCADE;
   DROP TABLE IF EXISTS public.family_groups CASCADE;
   ```
   Luego ejecuta `001_create_missing_tables.sql` nuevamente

## ✅ Verificación

Después de aplicar las correcciones, ejecuta:

```sql
-- Verificar que las tablas existen sin foreign keys problemáticas
SELECT 
    table_name,
    column_name,
    data_type
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name IN ('family_groups', 'family_group_members', 'shared_expenses', 'shared_expense_splits', 'profile_preferences', 'alerts')
AND column_name LIKE '%user_id%' OR column_name = 'created_by'
ORDER BY table_name, column_name;
```

Todas las columnas de usuario deben ser `uuid` sin foreign key constraints.

## 📝 Notas Importantes

1. **Foreign Keys a auth.users:** Se removieron porque causan problemas en Supabase. La seguridad se garantiza con:
   - Políticas RLS que validan `auth.uid()`
   - Validación en la aplicación frontend
   - Triggers de base de datos (opcional)

2. **Orden de Ejecución:** CRÍTICO ejecutar en este orden:
   1. `001_create_missing_tables.sql`
   2. `002_create_rls_policies_FIXED.sql`
   3. `003_verify_migration.sql`

3. **Si hay errores:** Los scripts ahora tienen verificaciones IF EXISTS y DROP IF EXISTS para evitar errores de duplicación.



