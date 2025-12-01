# 🔍 Debug: Problemas de Actualización de Perfil

## ❌ Problemas Identificados

1. **Error 400: `account_paused` no existe**
   - Solución: Ejecutar migración `046_add_account_management_columns.sql`

2. **Nombre y avatar no se actualizan después de editar**
   - Problema: El contexto no se actualiza inmediatamente después de `updateUser()`
   - Solución implementada: Mejoras en el flujo de actualización

## ✅ Soluciones Implementadas

### 1. Mejora en `SupabaseAuthContext.jsx`

**Función `refreshUser()` mejorada:**
- Ahora refresca la sesión completa, no solo el usuario
- Usa `refreshSession()` para obtener datos actualizados
- Maneja errores correctamente

**Manejo de eventos `USER_UPDATED`:**
- El `onAuthStateChange` ahora maneja explícitamente el evento `USER_UPDATED`
- Se dispara cuando se actualiza el usuario con `updateUser()`

### 2. Mejora en `EditProfileModal.jsx`

**Después de actualizar:**
- Espera 500ms para que Supabase procese la actualización
- Fuerza `refreshSession()` para obtener datos actualizados
- Llama a `onUpdate()` después de un delay para asegurar que el contexto se actualice

### 3. Mejora en `Profile.jsx`

**Estados locales reactivos:**
- `userName` y `userEmail` se actualizan automáticamente cuando cambia `user`
- `useEffect` escucha cambios en `user_metadata`
- Se actualiza inmediatamente cuando el contexto cambia

---

## 🧪 Cómo Probar

### Test 1: Cambiar Nombre

1. Ve a `/dashboard/profile`
2. Haz clic en "Editar" en "Nombre Completo"
3. Cambia el nombre a "Test Usuario"
4. Guarda
5. **Verifica que se actualiza en:**
   - ✅ Tarjeta de perfil principal (arriba)
   - ✅ Sección "Información Personal"
   - ✅ Header (arriba a la izquierda)

### Test 2: Cambiar Avatar

1. Ve a `/dashboard/profile`
2. Haz clic en el ícono de avatar (arriba a la derecha del avatar)
3. Selecciona un avatar premium
4. **Verifica que se actualiza:**
   - ✅ Avatar en la tarjeta de perfil
   - ✅ Avatar en el header (si está configurado)

### Test 3: Subir Foto

1. Ve a `/dashboard/profile`
2. Haz clic en el ícono de configuración del avatar
3. Sube una foto
4. **Verifica que se actualiza:**
   - ✅ Foto en la tarjeta de perfil
   - ✅ Foto en el header

---

## 🔧 Si Aún No Funciona

### Paso 1: Verificar Migración SQL

```sql
-- Ejecutar en Supabase SQL Editor
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'profile_preferences' 
AND column_name = 'account_paused';
```

Si no existe, ejecuta: `supabase/migrations/046_add_account_management_columns.sql`

### Paso 2: Verificar Consola del Navegador

Abre la consola (F12) y busca:
- ✅ Errores de red (404, 400)
- ✅ Errores de JavaScript
- ✅ Logs de "Auth state changed"

### Paso 3: Verificar que `refreshUser` se Llama

Agrega un `console.log` temporal en `Profile.jsx`:

```javascript
onUpdate={async () => {
  console.log('onUpdate llamado');
  if (refreshUser) {
    console.log('Llamando refreshUser...');
    await refreshUser();
    console.log('refreshUser completado');
  }
  // ...
}}
```

### Paso 4: Verificar Eventos de Auth

En `SupabaseAuthContext.jsx`, verifica que se loguee:
```
Auth state changed: USER_UPDATED
```

Si no aparece, el problema está en cómo Supabase maneja el evento.

---

## 🐛 Debug Adicional

### Verificar Estado del Usuario

Agrega esto temporalmente en `Profile.jsx`:

```javascript
useEffect(() => {
  console.log('Usuario actualizado:', {
    id: user?.id,
    name: user?.user_metadata?.full_name,
    avatar: user?.user_metadata?.avatar_url,
    email: user?.email
  });
}, [user]);
```

### Forzar Actualización Manual

Si nada funciona, puedes agregar un botón temporal para forzar refresh:

```javascript
<button onClick={async () => {
  await refreshUser();
  setTimeout(() => window.location.reload(), 500);
}}>
  Forzar Actualización
</button>
```

---

## 📝 Checklist de Verificación

- [ ] Migración SQL ejecutada
- [ ] No hay errores en consola del navegador
- [ ] `refreshUser` está disponible en el contexto
- [ ] `onAuthStateChange` maneja `USER_UPDATED`
- [ ] `EditProfileModal` llama a `refreshSession()` después de actualizar
- [ ] `Profile.jsx` tiene `useEffect` que escucha cambios en `user_metadata`
- [ ] Los estados locales (`userName`, `avatarUrl`) se actualizan

---

## 🔄 Flujo Esperado

1. Usuario edita nombre/avatar en `EditProfileModal`
2. Se llama a `supabase.auth.updateUser()`
3. Supabase dispara evento `USER_UPDATED`
4. `onAuthStateChange` captura el evento
5. `handleSession()` actualiza el estado del contexto
6. `Profile.jsx` detecta cambio en `user`
7. `useEffect` actualiza `userName` y `avatarUrl`
8. Componente se re-renderiza con datos actualizados

---

**Si después de todo esto no funciona, el problema puede estar en:**
- Configuración de Supabase
- Permisos de RLS
- Cache del navegador (intenta Ctrl+Shift+R para hard refresh)

