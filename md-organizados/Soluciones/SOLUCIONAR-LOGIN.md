# 🔐 SOLUCIÓN: No puedo iniciar sesión

## ❌ EL ERROR

```
Invalid login credentials
```

**Causas posibles:**
1. Usuario no existe en la base de datos
2. Contraseña incorrecta
3. Confirmación de email requerida pero no completada
4. Configuración de autenticación en Supabase

---

## ✅ SOLUCIÓN RÁPIDA

### Opción 1: Crear un usuario de prueba (RECOMENDADO)

#### Paso 1: Ve a Supabase Dashboard

```
https://supabase.com/dashboard/project/yzakmqxbzwzbsdsadzej/auth/users
```

#### Paso 2: Crear usuario manualmente

1. Click en **"Add user"** o **"Create new user"**

2. Selecciona **"Create a new user"**

3. Completa los datos:
   ```
   Email: test@finantel.com
   Password: Test123456
   ```

4. **IMPORTANTE**: Marca la casilla:
   - ✅ **"Auto confirm user"** (Confirmar usuario automáticamente)

5. Click en **"Create user"**

#### Paso 3: Prueba el login

1. Ve a tu app: `http://localhost:3001/auth`
2. Intenta iniciar sesión con:
   ```
   Email: test@finantel.com
   Password: Test123456
   ```
3. Debería funcionar ✅

---

### Opción 2: Deshabilitar confirmación de email

Si quieres que los usuarios puedan registrarse sin confirmar email:

#### Paso 1: Ve a configuración de Auth

```
https://supabase.com/dashboard/project/yzakmqxbzwzbsdsadzej/auth/providers
```

#### Paso 2: Deshabilitar confirmación

1. Busca la sección **"Email"**
2. Click en el ícono de configuración (⚙️) o **"Settings"**
3. Busca la opción:
   - **"Enable email confirmations"**
   - **Desactívala** (toggle OFF)
4. Guarda los cambios

#### Paso 3: Registra un nuevo usuario

1. Ve a tu app: `http://localhost:3001/auth`
2. Click en **"Regístrate gratis"**
3. Completa el formulario:
   ```
   Nombre: Tu Nombre
   Email: tucorreo@ejemplo.com
   Password: TuPassword123
   Confirmar Password: TuPassword123
   ```
4. Click en **"Crear Cuenta"**
5. Ahora deberías poder iniciar sesión directamente

---

### Opción 3: Resetear password del usuario existente

Si ya tienes un usuario pero olvidaste la contraseña:

#### Paso 1: Ve a la lista de usuarios

```
https://supabase.com/dashboard/project/yzakmqxbzwzbsdsadzej/auth/users
```

#### Paso 2: Encuentra tu usuario

Busca tu email en la lista

#### Paso 3: Cambiar password

1. Click en el usuario
2. Click en **"Reset password"** o los 3 puntos (⋮) → **"Send password reset"**
3. O puedes cambiar la contraseña directamente:
   - Click en el usuario
   - Busca el campo **"Password"**
   - Ingresa una nueva: `NuevaPassword123`
   - Guarda

#### Paso 4: Prueba con la nueva password

---

## 🔍 VERIFICAR ESTADO DEL USUARIO

### Paso 1: Ve a Auth → Users

```
https://supabase.com/dashboard/project/yzakmqxbzwzbsdsadzej/auth/users
```

### Paso 2: Revisa el estado de tu usuario

Busca estos campos:

| Campo | Estado Correcto |
|-------|-----------------|
| **Email** | Tu email |
| **Confirmed** | ✅ Confirmed (verde) |
| **Last Sign In** | Fecha reciente o vacío |

### Paso 3: Si aparece "Unconfirmed" ⚠️

Significa que el usuario no ha confirmado su email. Opciones:

**A. Confirmar manualmente:**
1. Click en el usuario
2. Click en **"Confirm user"** o el botón de verificación
3. Confirma la acción

**B. Enviar email de confirmación:**
1. Click en el usuario
2. Click en **"Send confirmation email"**
3. Revisa tu correo y confirma

---

## 🐛 OTROS PROBLEMAS COMUNES

### Error: "Email not confirmed"

**Solución:**
1. Ve a Auth → Policies (RLS)
2. Desactiva temporalmente RLS en la tabla users
3. O confirma el usuario manualmente (ver arriba)

### Error: "User already registered"

**Solución:**
Ese usuario ya existe. Usa el método de resetear password (Opción 3 arriba)

### Error: "Invalid email or password"

**Solución:**
1. Verifica que estés escribiendo bien el email
2. Verifica que la contraseña tenga al menos 6 caracteres
3. Prueba crear un usuario nuevo de prueba

---

## 📋 CHECKLIST DE VERIFICACIÓN

- [ ] Usuario existe en Supabase Auth → Users
- [ ] Usuario tiene estado "Confirmed" (verde)
- [ ] Password tiene al menos 6 caracteres
- [ ] Email está escrito correctamente (sin espacios)
- [ ] Confirmación de email deshabilitada O usuario confirmado
- [ ] RLS (Row Level Security) configurado correctamente

---

## 🎯 SOLUCIÓN MÁS RÁPIDA (1 MINUTO)

**Si solo quieres probar la app rápidamente:**

1. Ve a: https://supabase.com/dashboard/project/yzakmqxbzwzbsdsadzej/auth/users
2. Click en **"Add user"**
3. Crea usuario:
   ```
   Email: admin@finantel.com
   Password: Admin123456
   ✅ Auto confirm user
   ```
4. Ve a tu app y login con esas credenciales

**¡Listo en 1 minuto!** ✅

---

## 📞 SI NADA FUNCIONA

Revisa estos puntos:

1. **Logs de Supabase:**
   - Ve a Dashboard → Logs → Auth Logs
   - Busca tu email
   - Revisa el error específico

2. **Variables de entorno:**
   - Verifica que `VITE_SUPABASE_URL` esté correcta
   - Verifica que `VITE_SUPABASE_ANON_KEY` esté correcta
   - Reinicia el servidor después de cambios en `.env`

3. **Consola del navegador:**
   - Abre DevTools (F12)
   - Ve a Console
   - Busca el error completo
   - Copia y pega para más ayuda

---

**¡Esto debería resolver el problema de login!** 🚀
