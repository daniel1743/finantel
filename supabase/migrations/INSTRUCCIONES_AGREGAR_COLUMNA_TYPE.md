# ⚠️ SOLUCIÓN: Error "Could not find the 'type' column" o "la relación categories no existe"

## Problema

Al intentar crear una categoría, aparece uno de estos errores:
```
Could not find the 'type' column of 'categories' in the schema cache
```
o
```
la relación "public.categories" no existe
```

Esto significa que:
- La tabla `categories` no existe en tu base de datos, O
- La tabla existe pero no tiene la columna `type`

## Solución Rápida

### Paso 1: Ejecutar el Script SQL

1. Ve a tu proyecto en [Supabase Dashboard](https://app.supabase.com)
2. Navega a **SQL Editor**
3. Abre el archivo `004_add_type_column_to_categories.sql`
4. Copia y pega todo el contenido
5. Haz clic en **Run** o presiona `Ctrl+Enter`
6. Verifica que aparezca el mensaje: `✅ Columna "type" agregada a la tabla categories`

### Paso 2: Verificar

Ejecuta esta consulta para verificar que la columna existe:

```sql
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'categories'
ORDER BY ordinal_position;
```

Deberías ver la columna `type` con tipo `TEXT` y default `'expense'`.

## ¿Qué hace el script?

El script `004_add_type_column_to_categories.sql`:

1. ✅ **Crea la tabla `categories` completa** si no existe (con todas las columnas necesarias)
2. ✅ Si la tabla ya existe, verifica si la columna `type` existe
3. ✅ Si no existe, la agrega con:
   - Tipo: `TEXT`
   - Default: `'expense'`
   - Constraint: Solo acepta `'income'`, `'expense'`, o `'savings'`
4. ✅ También verifica y agrega `icon` y `color` si no existen
5. ✅ Muestra un resumen de todas las columnas al final

**Estructura completa de la tabla creada:**
- `id` (UUID, primary key)
- `user_id` (UUID, NOT NULL)
- `name` (TEXT, NOT NULL, único por usuario)
- `type` (TEXT, NOT NULL, 'income'|'expense'|'savings')
- `icon` (TEXT, default '💰')
- `color` (TEXT, default '#3B82F6')
- `description` (TEXT, opcional)
- `is_default` (BOOLEAN, default false)
- `is_active` (BOOLEAN, default true)
- `created_at` (TIMESTAMPTZ)
- `updated_at` (TIMESTAMPTZ)

## Después de ejecutar

Una vez ejecutado el script, podrás:
- ✅ Crear categorías desde el modal
- ✅ Seleccionar tipo (Gasto/Ingreso)
- ✅ Guardar color e icono
- ✅ Ver las categorías en la lista

## ⚠️ Importante: Políticas RLS

**Nota:** Este script solo crea la tabla. Si necesitas que los usuarios solo vean sus propias categorías, deberás ejecutar también los scripts de RLS (Row Level Security):

1. Ejecuta `002_create_rls_policies_FIXED.sql` para agregar las políticas de seguridad
2. O ejecuta `008_schema_completo_con_relaciones_rls_y_auditoria.sql` para tener todo el sistema completo

Sin RLS, cualquier usuario autenticado podrá ver todas las categorías (aunque no podrá modificarlas sin el `user_id` correcto).

## Nota

Si ya tienes categorías existentes sin la columna `type`, el script las actualizará automáticamente con el valor por defecto `'expense'`. Si necesitas cambiar el tipo de alguna categoría existente, puedes hacerlo manualmente:

```sql
UPDATE categories 
SET type = 'income' 
WHERE name = 'Nombre de tu categoría';
```

