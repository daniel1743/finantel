# 📚 Índice de Migraciones - Finantel v2.1

## 🎯 ¿Qué archivo debo usar?

### Para Instalar por Primera Vez

| Archivo | Cuándo usarlo | Tiempo |
|---------|---------------|--------|
| **INICIO_RAPIDO.md** | Si quieres instalar YA sin leer mucho | 5 min |
| **INSTRUCCIONES_MIGRACION_COMPLETA.md** | Si quieres entender todo antes de instalar | 15 min |

### Scripts SQL

| Archivo | Propósito | Cuándo ejecutar |
|---------|-----------|-----------------|
| **008_schema_completo_con_relaciones_rls_y_auditoria.sql** | Script principal - Crea toda la BD | PRIMERO (obligatorio) |
| **009_verificacion_completa.sql** | Verifica que todo está OK | DESPUÉS (recomendado) |

### Documentación

| Archivo | Qué contiene |
|---------|--------------|
| **RESUMEN_MIGRACION_COMPLETA.md** | Resumen ejecutivo de todo lo que se creó |
| **SCHEMA_DOCUMENTATION.md** | Documentación detallada de cada tabla (legacy) |

---

## 🚀 Flujo Recomendado

### Opción A: Rápido (5 minutos)

```
1. Lee: INICIO_RAPIDO.md
2. Ejecuta: 008_schema_completo_con_relaciones_rls_y_auditoria.sql
3. Ejecuta: 009_verificacion_completa.sql
4. ¡Listo! ✅
```

### Opción B: Completo (20 minutos)

```
1. Lee: RESUMEN_MIGRACION_COMPLETA.md (entender qué se creó)
2. Lee: INSTRUCCIONES_MIGRACION_COMPLETA.md (cómo instalarlo)
3. Ejecuta: 008_schema_completo_con_relaciones_rls_y_auditoria.sql
4. Ejecuta: 009_verificacion_completa.sql
5. Ejecuta pruebas del paso 🧪 en INSTRUCCIONES
6. ¡Listo! ✅
```

---

## 📊 ¿Qué se va a crear?

### Tablas (11 total)

1. **categories** - Categorías de ingresos/gastos
2. **budgets** - Presupuestos por categoría
3. **transactions** - Transacciones financieras
4. **goals** - Metas financieras
5. **family_groups** - Grupos familiares
6. **family_group_members** - Miembros de grupos
7. **shared_expenses** - Gastos compartidos
8. **shared_expense_splits** - División de gastos
9. **profile_preferences** - Preferencias de usuario
10. **alerts** - Alertas inteligentes
11. **audit_logs** - Registro de auditoría

### Relaciones Implementadas

✅ **transactions → categories**
✅ **transactions → budgets**
✅ **budgets → categories**
✅ **shared_expenses → family_groups**
✅ **shared_expenses → categories**

### Seguridad (RLS)

✅ **44 políticas RLS** que garantizan:
- Cada usuario solo ve lo suyo
- Nada se escribe sin auth.uid()
- Grupos familiares con permisos correctos

### Auditoría

✅ **Sistema automático** que registra:
- Todos los INSERT, UPDATE, DELETE
- Usuario, timestamp, datos anteriores/nuevos
- Campos que cambiaron

---

## 🗂️ Estructura de Archivos

```
supabase/migrations/
│
├── 📄 README_MIGRACIONES.md (este archivo)
│   └── Índice general - empieza aquí
│
├── ⚡ INICIO_RAPIDO.md
│   └── Instalación en 5 minutos
│
├── 📖 INSTRUCCIONES_MIGRACION_COMPLETA.md
│   └── Guía paso a paso detallada
│
├── 📊 RESUMEN_MIGRACION_COMPLETA.md
│   └── Resumen ejecutivo de todo
│
├── 🗄️ 008_schema_completo_con_relaciones_rls_y_auditoria.sql
│   └── Script principal (EJECUTAR PRIMERO)
│
├── ✅ 009_verificacion_completa.sql
│   └── Verificación post-migración
│
└── 📚 SCHEMA_DOCUMENTATION.md
    └── Documentación de tablas (legacy)
```

---

## ❓ Preguntas Frecuentes

### ¿Debo ejecutar todos los scripts .sql?

**NO.** Solo debes ejecutar:
1. `008_schema_completo_con_relaciones_rls_y_auditoria.sql` (obligatorio)
2. `009_verificacion_completa.sql` (recomendado para verificar)

Los demás archivos (000, 001, 002, etc.) son **legacy** de versiones anteriores.

### ¿Qué pasa con los scripts antiguos?

Los scripts 000-007 eran versiones anteriores con problemas. El script **008** es la versión final que:
- ✅ Corrige todos los problemas anteriores
- ✅ Incluye todas las mejoras
- ✅ Está probado y funciona

**Recomendación:** Ejecuta solo el 008, ignora los anteriores.

### ¿Puedo ejecutar el script 008 varias veces?

**SÍ.** El script incluye:
```sql
DROP TABLE IF EXISTS ... CASCADE
```
Entonces es seguro ejecutarlo múltiples veces. Eliminará y recreará todo.

### ¿Perderé datos si ejecuto el script 008?

**SÍ, si ya tienes datos.** El script hace `DROP TABLE`, así que:
- ✅ Primera instalación: Seguro
- ⚠️ Ya tienes datos: Haz backup primero

### ¿Cómo hago backup antes de ejecutar?

```sql
-- Exportar datos (si ya tienes)
COPY (SELECT * FROM categories) TO '/tmp/categories_backup.csv' CSV HEADER;
COPY (SELECT * FROM transactions) TO '/tmp/transactions_backup.csv' CSV HEADER;
-- etc...
```

O usa la función de Export de Supabase Dashboard.

### ¿El script 008 elimina usuarios (auth.users)?

**NO.** El script solo toca tablas del schema `public`. No toca:
- ❌ `auth.users` (usuarios de Supabase Auth)
- ❌ `storage` (archivos)
- ❌ Otras configuraciones

### ¿Funciona con Supabase local?

**SÍ.** Los scripts funcionan igual en:
- ✅ Supabase Cloud
- ✅ Supabase Local (Docker)
- ✅ PostgreSQL vanilla

### ¿Necesito configurar algo más después?

**NO.** El script crea todo lo necesario:
- ✅ Tablas
- ✅ Relaciones
- ✅ RLS y políticas
- ✅ Índices
- ✅ Triggers
- ✅ Funciones

Solo necesitas conectar tu frontend.

---

## 🐛 Problemas Comunes

### "relation already exists"

**Causa:** Ya ejecutaste el script antes.
**Fix:** Normal, el script ya hace DROP al inicio. Ignora o ejecuta DROP manual.

### "permission denied"

**Causa:** No tienes permisos o estás en API en lugar de SQL Editor.
**Fix:** Usa **SQL Editor** en Supabase Dashboard.

### "policy already exists"

**Causa:** Políticas de migraciones anteriores.
**Fix:** Ejecuta el DROP POLICY que viene en INSTRUCCIONES_MIGRACION_COMPLETA.md

### No veo el mensaje de éxito

**Causa:** Necesitas hacer scroll en los resultados.
**Fix:** Baja hasta el final en el panel de resultados.

### El script tarda mucho

**Causa:** Normal si tienes muchos datos.
**Fix:** En BD vacía tarda ~5-10 segundos. Con datos, puede tardar más.

---

## 📞 ¿Necesitas Ayuda?

1. ✅ Revisa primero: **INSTRUCCIONES_MIGRACION_COMPLETA.md** (sección Troubleshooting)
2. ✅ Ejecuta: **009_verificacion_completa.sql** para ver qué falta
3. ✅ Revisa los mensajes de error específicos

---

## ✅ Checklist Rápido

- [ ] Leí el archivo que necesito (INICIO_RAPIDO o INSTRUCCIONES)
- [ ] Abrí Supabase Dashboard → SQL Editor
- [ ] Ejecuté `008_schema_completo_con_relaciones_rls_y_auditoria.sql`
- [ ] Vi el mensaje "✅ Migración completada exitosamente"
- [ ] Ejecuté `009_verificacion_completa.sql`
- [ ] Vi "Tablas creadas: 11 / 11"
- [ ] Todo está funcionando correctamente

**¿Todo listo?** 🎉 Ahora puedes usar la base de datos!

---

## 🎯 Próximos Pasos

Una vez completada la instalación:

1. ✅ Conecta tu frontend con Supabase
2. ✅ Crea las categorías por defecto
3. ✅ Implementa hooks React para cada tabla
4. ✅ Diseña componentes UI
5. ✅ Configura realtime subscriptions
6. ✅ Implementa sistema de alertas

---

## 📚 Recursos Adicionales

- [Supabase Docs](https://supabase.com/docs)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)

---

**Versión:** 2.1
**Última actualización:** 2025-11-21
**Creado por:** Claude Code

---

## 🎁 Bonus: Comando Rápido

Si usas Supabase CLI local:

```bash
# Ejecutar migración
supabase db push

# Verificar
supabase db diff

# Reset completo (⚠️ borra todo)
supabase db reset
```

---

¡Éxito con tu proyecto! 🚀
