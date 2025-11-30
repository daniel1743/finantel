# ✅ Reemplazar create-checkout-session

## Estado: LISTA PARA REEMPLAZAR

La versión simplificada (`index-SIMPLIFIED.ts`) está **completamente corregida** y lista para usar. No tiene dependencias de `_shared` y mantiene toda la funcionalidad esencial.

## ✅ Verificaciones Realizadas

- ✅ No tiene imports de `_shared`
- ✅ Tiene CORS headers definidos inline
- ✅ Tiene autenticación completa
- ✅ Crea preferencias de MercadoPago
- ✅ Guarda en base de datos
- ✅ Manejo de errores completo
- ✅ Validaciones básicas incluidas

## 🔄 Pasos para Reemplazar

### Opción 1: Reemplazo Directo (Recomendado)

```bash
cd supabase/functions/create-checkout-session

# Hacer backup del original (por si acaso)
mv index.ts index-ORIGINAL-BACKUP.ts

# Usar la versión simplificada
mv index-SIMPLIFIED.ts index.ts

# Desplegar
npx supabase functions deploy create-checkout-session
```

### Opción 2: Desde PowerShell (Windows)

```powershell
cd "supabase\functions\create-checkout-session"

# Backup
Rename-Item index.ts index-ORIGINAL-BACKUP.ts

# Reemplazar
Rename-Item index-SIMPLIFIED.ts index.ts

# Desplegar
npx supabase functions deploy create-checkout-session
```

## 📋 Funcionalidades Incluidas

La versión simplificada incluye:

- ✅ Manejo de CORS
- ✅ Autenticación de usuario
- ✅ Validación de planId
- ✅ Obtención de plan desde BD
- ✅ Creación de preferencia en MercadoPago
- ✅ Guardado de intento de pago
- ✅ Manejo de errores
- ✅ Respuestas JSON apropiadas

## ⚠️ Funcionalidades NO Incluidas (de la versión original)

Estas funcionalidades avanzadas NO están en la versión simplificada:

- ❌ Sentry (monitoreo de errores)
- ❌ Sanitización avanzada
- ❌ Rate limiting
- ❌ Security middleware avanzado
- ❌ Performance monitoring

**Nota:** Para la mayoría de casos de uso, la versión simplificada es suficiente. Si necesitas estas funcionalidades avanzadas, puedes agregarlas después o mantener la versión original y configurar Supabase para incluir `_shared`.

## ✅ Confirmación

**La versión simplificada está lista para reemplazar sin correcciones adicionales.**

