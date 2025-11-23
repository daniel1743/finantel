# ⚡ QUICK START - 5 Minutos

Implementa las 4 tablas críticas + alertas automáticas en 5 minutos.

## 🚀 Instalación Rápida

### Paso 1: Abrir Supabase Dashboard
1. Ve a https://app.supabase.com
2. Selecciona tu proyecto
3. Ve a **SQL Editor**

### Paso 2: Ejecutar Migraciones

**Si tu base de datos está VACÍA:**
```sql
-- 1. Copiar y pegar TODO el contenido de:
-- 000_migracion_completa_unificada.sql
-- Clic en "Run"

-- 2. Copiar y pegar TODO el contenido de:
-- 004_mejoras_criticas.sql
-- Clic en "Run"
```

**Si YA tienes las tablas básicas:**
```sql
-- Solo copiar y pegar:
-- 004_mejoras_criticas.sql
-- Clic en "Run"
```

### Paso 3: Verificar
```sql
-- Copiar y pegar:
-- 003_verify_migration.sql
-- Clic en "Run"
```

**Resultado esperado:**
```
✅ Todas las tablas existen correctamente
✅ RLS está habilitado en todas las tablas
✅ Se encontraron 20+ políticas RLS
✅ Los índices críticos existen
✅ Los triggers de updated_at están configurados
```

## ✅ ¡Listo!

Ahora tienes:
- ✅ 6 tablas creadas
- ✅ 20+ políticas RLS
- ✅ 6 triggers automáticos
- ✅ 7 funciones helper
- ✅ 18 índices optimizados

## 🧪 Prueba Rápida

```sql
-- 1. Crear un grupo familiar
INSERT INTO public.family_groups (name, created_by)
VALUES ('Mi Familia', auth.uid());

-- 2. Ver que fuiste agregado como admin automáticamente
SELECT * FROM public.family_group_members
WHERE user_id = auth.uid();

-- 3. Crear preferencias de usuario
INSERT INTO public.profile_preferences (user_id)
VALUES (auth.uid());

-- 4. Ver todas las alertas
SELECT * FROM public.alerts
WHERE user_id = auth.uid();
```

## 📚 Siguiente Paso

Lee la [Guía de Implementación Completa](./GUIA_IMPLEMENTACION_FASE1.md) para:
- Conectar con frontend
- Usar Edge Functions
- Implementar hooks de React
- Ver ejemplos de uso

## ❓ Problemas?

- **Error: "policy already exists"** → Ejecuta `DROP POLICY IF EXISTS` manualmente
- **Error: "relation does not exist"** → Ejecuta primero `000_migracion_completa_unificada.sql`
- **Error: "function does not exist"** → Ejecuta `004_mejoras_criticas.sql`

## 📁 Archivos Importantes

```
000_migracion_completa_unificada.sql  → Tablas + RLS + Triggers básicos
004_mejoras_criticas.sql              → Alertas automáticas + Funciones
003_verify_migration.sql              → Script de verificación
GUIA_IMPLEMENTACION_FASE1.md          → Guía completa paso a paso
MEJORAS_APLICADAS.md                  → Resumen de mejoras
```

---

**Tiempo:** 5 minutos
**Dificultad:** Fácil
**Requisitos:** Proyecto de Supabase activo
