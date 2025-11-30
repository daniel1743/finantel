# 🔧 Solución: Error "relation already exists"

## ❌ Error

```
ERROR: 42P07: relation "idx_future_scenarios_user_horizon" already exists
```

## 🔍 Causa

El índice `idx_future_scenarios_user_horizon` ya fue creado por la migración **044**. Si intentas ejecutar la migración 044 de nuevo, PostgreSQL intentará crear el índice otra vez y fallará.

## ✅ Solución

### Opción 1: Ejecutar SOLO la función (Recomendado)

Usa el archivo **`045_fix_future_self_logic_SOLO_FUNCION.sql`** que solo actualiza la función sin crear índices:

1. Ve a **Supabase Dashboard** → **SQL Editor**
2. Abre el archivo: `supabase/migrations/045_fix_future_self_logic_SOLO_FUNCION.sql`
3. Copia TODO el contenido
4. Pégalo en SQL Editor
5. Ejecuta el script

Este archivo **solo actualiza la función** `calculate_scenario_projection` sin tocar índices ni tablas.

---

### Opción 2: Ignorar el error y continuar

Si estás ejecutando la migración 044 completa y solo falla en los índices:

1. **Ejecuta la migración 044** hasta que falle en el índice
2. **Ignora el error** del índice (ya existe, no es problema)
3. **Continúa ejecutando** el resto de la migración manualmente, o
4. **Ejecuta solo la parte de la función** desde `045_fix_future_self_logic_SOLO_FUNCION.sql`

---

### Opción 3: Eliminar índices antes (No recomendado)

Si realmente necesitas recrear los índices:

```sql
-- ⚠️ SOLO si realmente necesitas recrear los índices
DROP INDEX IF EXISTS idx_future_scenarios_user_horizon;
DROP INDEX IF EXISTS idx_future_scenarios_user_type;
DROP INDEX IF EXISTS idx_future_scenarios_calculated;
DROP INDEX IF EXISTS idx_simulation_history_user;
```

Luego ejecuta la migración 044 completa.

**⚠️ ADVERTENCIA**: No es necesario eliminar los índices. Solo actualiza la función.

---

## 🎯 Recomendación Final

**Usa la Opción 1**: Ejecuta `045_fix_future_self_logic_SOLO_FUNCION.sql`

Esta es la forma más segura y solo actualiza lo necesario (la función con la lógica corregida) sin tocar índices ni tablas que ya existen.

---

## ✅ Verificación

Después de ejecutar la función:

1. Ve al **Simulador de Futuro** en tu aplicación
2. Haz clic en **"Recalcular"**
3. Verifica que:
   - ✅ Escenario Mejorado sea **mejor** que Tendencia Actual
   - ✅ Escenario Desafiante sea **peor** que Tendencia Actual

Si los números son coherentes, el fix se aplicó correctamente. 🎉

