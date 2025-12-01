# 🔄 Función de Restauración del Ciclo Anterior - Finantel v2.1

## 📋 Resumen

Se ha implementado una funcionalidad completa que permite restaurar transacciones del ciclo anterior (últimos 7 días del mes anterior) cuando el sistema hace reset mensual automático.

## ✅ Componentes Implementados

### 1. **Migración SQL** (`supabase/migrations/009_add_restore_previous_cycle_field.sql`)
- Agrega el campo `restored_from_previous_cycle` a la tabla `transactions`
- Crea índice optimizado para búsquedas de transacciones restauradas
- Campo tipo BOOLEAN con valor por defecto `false`

### 2. **Edge Function** (`supabase/functions/restore-previous-cycle/index.ts`)
- **Acción `check_restorable_data`**: Verifica si hay transacciones restaurables
- **Acción `restore_previous_cycle`**: Restaura las transacciones del ciclo anterior
- Detecta automáticamente los últimos 7 días del mes anterior
- Previene duplicados verificando si ya se restauró antes
- Guarda la fecha original en `metadata.original_date`

### 3. **Modal de Restauración** (`src/components/modals/RestoreDataModal.jsx`)
- Modal responsive con diseño consistente
- Verifica automáticamente si hay datos restaurables al abrirse
- Muestra diferentes estados:
  - ✅ Datos restaurables disponibles
  - ✅ Ya se restauró anteriormente
  - ✅ No hay datos restaurables
- Integrado con el sistema de notificaciones (toast)

### 4. **Botón en Perfil** (`src/pages/dashboard/Profile.jsx`)
- Botón "Restaurar Datos" en la sección "Gestión de Cuenta"
- Ubicado antes de "Pausar Cuenta" y "Eliminar Cuenta"
- Diseño consistente con el resto de la interfaz

## 🚀 Instrucciones de Implementación

### Paso 1: Ejecutar Migración SQL

```sql
-- Ejecutar en Supabase SQL Editor
-- Archivo: supabase/migrations/009_add_restore_previous_cycle_field.sql
```

O ejecutar manualmente:

```sql
ALTER TABLE public.transactions 
ADD COLUMN IF NOT EXISTS restored_from_previous_cycle BOOLEAN DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_transactions_restored 
ON public.transactions(user_id, restored_from_previous_cycle) 
WHERE restored_from_previous_cycle = true;
```

### Paso 2: Desplegar Edge Function

```bash
# Desde la raíz del proyecto
supabase functions deploy restore-previous-cycle
```

O manualmente:
1. Ir a Supabase Dashboard → Edge Functions
2. Crear nueva función: `restore-previous-cycle`
3. Copiar el contenido de `supabase/functions/restore-previous-cycle/index.ts`

### Paso 3: Verificar Frontend

Los archivos ya están creados:
- ✅ `src/components/modals/RestoreDataModal.jsx`
- ✅ `src/pages/dashboard/Profile.jsx` (actualizado)

No se requieren cambios adicionales.

## 📖 Cómo Funciona

### Lógica de Detección

1. **Rango de fechas**: Últimos 7 días del mes anterior
   - Si estamos en enero 2024, busca transacciones del 24-31 de diciembre 2023
   - Si estamos en marzo 2024, busca transacciones del 22-29 de febrero 2024

2. **Criterios de restauración**:
   - Transacciones con `date` en el rango calculado
   - `restored_from_previous_cycle = false` (no restauradas antes)
   - Pertenecen al usuario autenticado

3. **Prevención de duplicados**:
   - Verifica si ya hay transacciones restauradas en el mes actual
   - Si ya se restauró, muestra mensaje informativo
   - No permite restaurar dos veces el mismo ciclo

### Proceso de Restauración

1. Usuario hace clic en "Restaurar Datos"
2. Modal verifica si hay datos restaurables
3. Si hay datos, muestra:
   - Cantidad de transacciones
   - Mensaje explicativo
   - Botones: [Restaurar] [Cancelar]
4. Al confirmar:
   - Crea nuevas transacciones con fecha actual
   - Marca `restored_from_previous_cycle = true`
   - Guarda fecha original en `metadata.original_date`
   - Guarda ID original en `metadata.restored_from_id`
5. Actualiza el dashboard automáticamente

## 🎨 UI/UX

### Estados del Modal

1. **Verificando...** (loading)
   - Spinner mientras verifica datos
   - Texto: "Verificando datos..."

2. **Datos Restaurables Disponibles**
   - Fondo azul con ícono de información
   - Muestra cantidad de transacciones
   - Botones: [Cancelar] [Restaurar datos]

3. **Ya Restaurado**
   - Fondo verde con ícono de check
   - Mensaje: "Datos ya restaurados"
   - Botón: [Entendido]

4. **Sin Datos Restaurables**
   - Fondo gris con ícono de información
   - Mensaje explicativo
   - Botón: [Cerrar]

## 🔒 Seguridad

- ✅ Autenticación requerida (verifica `auth.uid()`)
- ✅ RLS aplicado (cada usuario solo ve sus datos)
- ✅ Validación de duplicados
- ✅ Prevención de restauraciones múltiples

## 📊 Campos en Base de Datos

### Tabla `transactions`

```sql
restored_from_previous_cycle BOOLEAN DEFAULT false
```

### Metadata (JSONB)

```json
{
  "original_date": "2024-01-30",
  "restored_at": "2024-02-01T10:30:00Z",
  "restored_from_id": "uuid-de-transaccion-original"
}
```

## 🧪 Testing

### Casos de Prueba

1. **Usuario sin datos restaurables**
   - Debe mostrar: "No hay datos restaurables"

2. **Usuario con datos restaurables**
   - Debe mostrar cantidad y opción de restaurar

3. **Usuario que ya restauró**
   - Debe mostrar: "Datos ya restaurados"

4. **Restauración exitosa**
   - Debe crear transacciones con fecha actual
   - Debe marcar como restauradas
   - Debe actualizar dashboard

5. **Intento de restaurar dos veces**
   - Debe prevenir duplicados
   - Debe mostrar mensaje apropiado

## 📝 Notas Técnicas

- Las transacciones restauradas tienen la **fecha actual** para aparecer en el dashboard
- La **fecha original** se guarda en `metadata.original_date`
- El **ID original** se guarda en `metadata.restored_from_id`
- Las transacciones originales **NO se modifican**, solo se crean copias

## 🔄 Flujo Completo

```
Usuario → Perfil → Gestión de Cuenta → Restaurar Datos
  ↓
Modal se abre → Verifica datos restaurables
  ↓
Si hay datos → Muestra opción de restaurar
  ↓
Usuario confirma → Edge Function restaura
  ↓
Transacciones creadas → Dashboard actualizado
```

## ✅ Checklist de Verificación

- [ ] Migración SQL ejecutada
- [ ] Edge Function desplegada
- [ ] Campo `restored_from_previous_cycle` existe en `transactions`
- [ ] Índice `idx_transactions_restored` creado
- [ ] Modal funciona correctamente
- [ ] Botón visible en Perfil → Gestión de Cuenta
- [ ] Restauración funciona sin duplicados
- [ ] Dashboard se actualiza después de restaurar

## 🐛 Troubleshooting

### El botón no aparece
- Verificar que la migración SQL se ejecutó
- Verificar que el usuario tiene transacciones en el rango

### Error al restaurar
- Verificar logs de Edge Function en Supabase Dashboard
- Verificar que el usuario está autenticado
- Verificar permisos RLS

### Duplicados
- Verificar que `restored_from_previous_cycle` se está marcando correctamente
- Verificar que la lógica de prevención funciona

## 📞 Soporte

Si encuentras problemas:
1. Revisar logs de Edge Function
2. Verificar migración SQL
3. Verificar autenticación del usuario
4. Revisar políticas RLS

---

**Implementado por**: Sistema de Restauración de Ciclo Anterior  
**Fecha**: 2024  
**Versión**: 1.0.0

