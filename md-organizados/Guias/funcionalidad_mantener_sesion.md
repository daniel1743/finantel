# ✅ Funcionalidad "Mantener Sesión Iniciada" - Finantel

## 📋 Resumen

La funcionalidad de "Mantener sesión iniciada" permite al usuario elegir si su sesión debe:
- **✅ Persistir indefinidamente** (localStorage) - hasta que cierre sesión manualmente
- **❌ Expirar al cerrar pestaña/navegador** (sessionStorage) - más seguro en computadoras compartidas

## 🔧 Cómo Funciona (Técnicamente)

### 1. **Checkbox en Pantalla de Login** (`src/pages/Auth.jsx`)
- Estado `rememberMe` se inicializa desde `localStorage.getItem('finantel_remember_me')`
- Por defecto es `true` (checkbox marcado)
- Cuando cambia, se guarda inmediatamente en localStorage

### 2. **Storage Adapter Dinámico** (`src/lib/customSupabaseClient.js`)
- Lee la preferencia `finantel_remember_me` de localStorage
- Si `rememberMe = true`: Guarda tokens en **localStorage** (persistente)
- Si `rememberMe = false`: Guarda tokens en **sessionStorage** (temporal)

### 3. **Funciones de Autenticación** (`src/contexts/SupabaseAuthContext.jsx`)

#### `signIn(email, password, rememberMe)`
1. Guarda preferencia en localStorage
2. Limpia el storage OPUESTO (previene conflictos)
3. Inicia sesión con Supabase
4. El storage adapter guarda tokens en el storage correcto

#### `signInWithGoogle(rememberMe)`
- Misma lógica que `signIn`
- Compatible con OAuth de Google

#### `signOut()`
- Cierra sesión en Supabase
- Limpia tokens de AMBOS storages (localStorage y sessionStorage)
- Asegura limpieza completa

## 🧪 Cómo Probar

### Escenario 1: Sesión Persistente (rememberMe = true)

1. **Ir a** `/auth`
2. **Verificar** que checkbox "Mantener sesión iniciada" está ✅ marcado
3. **Iniciar sesión** con email/contraseña o Google
4. **Abrir DevTools** (F12) → Pestaña "Application" → Storage
5. **Verificar** en **localStorage**:
   - Debe existir clave `sb-[proyecto]-auth-token`
   - Debe existir `finantel_remember_me = "true"`
6. **Cerrar pestaña/navegador completamente**
7. **Abrir navegador de nuevo** y ir a `/dashboard`
8. **✅ RESULTADO ESPERADO**: Sesión sigue activa, no pide login

### Escenario 2: Sesión Temporal (rememberMe = false)

1. **Ir a** `/auth`
2. **Desmarcar** checkbox "Mantener sesión iniciada" ❌
3. **Iniciar sesión** con email/contraseña o Google
4. **Abrir DevTools** (F12) → Pestaña "Application" → Storage
5. **Verificar** en **sessionStorage**:
   - Debe existir clave `sb-[proyecto]-auth-token`
6. **Verificar** en **localStorage**:
   - `finantel_remember_me = "false"`
   - NO debe haber claves `sb-*` (deben estar en sessionStorage)
7. **Cerrar pestaña/navegador completamente**
8. **Abrir navegador de nuevo** y ir a `/dashboard`
9. **✅ RESULTADO ESPERADO**: Redirige a `/auth` (sesión expiró)

### Escenario 3: Cerrar Sesión Manual

1. **Iniciar sesión** (con cualquier configuración de rememberMe)
2. **Hacer clic en "Cerrar Sesión"** en el dashboard
3. **Abrir DevTools** (F12) → Consola
4. **Verificar mensaje**: `"✅ [Auth] Sesión cerrada y tokens limpiados..."`
5. **Verificar** en **localStorage** y **sessionStorage**:
   - NO deben existir claves `sb-*` en ningún storage
6. **Intentar acceder a** `/dashboard`
7. **✅ RESULTADO ESPERADO**: Redirige a `/auth`

## 📝 Mensajes de Consola (Debugging)

Cuando funciona correctamente, debes ver en la consola:

### Al Iniciar Sesión (rememberMe = true):
```
🧹 [Auth] sessionStorage limpiado (sesión persistente)
🔐 [Auth] Iniciando sesión - Mantener sesión: ✅ SÍ (se guarda en localStorage hasta que cierres sesión)
✅ [Auth] Sesión iniciada exitosamente - Guardada en: localStorage (persistente)
```

### Al Iniciar Sesión (rememberMe = false):
```
🧹 [Auth] localStorage limpiado (sesión NO persistente)
🔐 [Auth] Iniciando sesión - Mantener sesión: ❌ NO (se borra al cerrar pestaña/navegador)
✅ [Auth] Sesión iniciada exitosamente - Guardada en: sessionStorage (temporal)
```

### Al Cerrar Sesión:
```
✅ [Auth] Sesión cerrada y tokens limpiados de localStorage y sessionStorage
```

## 🐛 Solución de Problemas

### Problema: La sesión NO persiste aunque esté marcado el checkbox

**Solución**:
1. Abrir DevTools → Application → Storage
2. Borrar manualmente TODO localStorage y sessionStorage
3. Recargar página
4. Volver a iniciar sesión con checkbox marcado
5. Verificar en localStorage que existe `sb-[proyecto]-auth-token`

### Problema: La sesión persiste aunque NO esté marcado el checkbox

**Solución**:
1. Cerrar sesión manualmente (botón "Cerrar Sesión")
2. Verificar en consola que se limpiaron ambos storages
3. Volver a iniciar sesión SIN marcar el checkbox
4. Verificar en sessionStorage que existe `sb-[proyecto]-auth-token`
5. Verificar en localStorage que NO existen claves `sb-*`

### Problema: Error "Multiple GoTrueClient instances detected"

**Causa**: El cliente de Supabase se está creando múltiples veces

**Solución**: Ya implementado en `customSupabaseClient.js` con patrón Singleton (líneas 64-103)

## 🎯 Beneficios de Esta Implementación

1. **✅ Seguridad**: En computadoras compartidas, desmarcando el checkbox la sesión expira al cerrar
2. **✅ Comodidad**: En dispositivos personales, la sesión persiste indefinidamente
3. **✅ Control**: El usuario decide explícitamente su preferencia
4. **✅ Sin Conflictos**: El sistema limpia el storage opuesto para prevenir bugs
5. **✅ Robusto**: Funciona con email/contraseña Y con Google OAuth

## 📦 Archivos Modificados

1. **src/pages/Auth.jsx** (líneas 40-43, 214-229)
   - Checkbox con estado persistente
   - Pasa `rememberMe` a funciones de login

2. **src/contexts/SupabaseAuthContext.jsx** (líneas 250-329, 331-390, 392-397)
   - `signIn()`: Limpia storage opuesto, guarda preferencia
   - `signInWithGoogle()`: Misma lógica
   - `signOut()`: Limpia AMBOS storages

3. **src/lib/customSupabaseClient.js** (líneas 16-62, 76)
   - Storage adapter dinámico
   - Lee preferencia y decide dónde guardar/leer

## ✅ Estado: COMPLETADO Y FUNCIONAL

La funcionalidad está 100% implementada y lista para usar. Sigue los pasos de prueba arriba para verificar que funciona correctamente en tu entorno.
