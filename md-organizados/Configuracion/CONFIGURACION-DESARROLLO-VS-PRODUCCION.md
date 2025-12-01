# 🔧 Configuración: Desarrollo vs Producción

## 🛠️ DESARROLLO (Configuración Actual)

### 1. Deshabilitar confirmación de email
- [ ] **Supabase Dashboard** → Authentication → Providers → Email
- [ ] Desactivar "Confirm email"
- [ ] Guardar cambios

### 2. Confirmar usuarios existentes (SQL)
```sql
-- Ejecutar en SQL Editor de Supabase
UPDATE auth.users
SET email_confirmed_at = now()
WHERE email_confirmed_at IS NULL;
```

### 3. Variables de entorno locales (ya configurado ✅)
```env
VITE_SUPABASE_URL=https://yzakmqxbzwzbsdsadzej.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_DEEPSEEK_API_KEY=sk-4d4cc3ac92254985b045a1881b85b12a
VITE_QWEN_API_KEY=sk-e6343f5b0abc42d294d2ad7f977e48a8
```

### 4. Resultado esperado en desarrollo:
✅ Usuarios se registran sin verificar email
✅ Login funciona inmediatamente
✅ No se envían emails (no es necesario)
✅ Desarrollo rápido sin fricciones

---

## 🚀 PRODUCCIÓN (Cuando despliegues)

### 1. Configurar proveedor de email

#### Opción A: Resend (Recomendado - 100 emails/día gratis)
```bash
1. Crear cuenta: https://resend.com/signup
2. Obtener API Key: Dashboard → API Keys
3. En Supabase:
   - Authentication → Email Templates → Custom SMTP
   - Host: smtp.resend.com
   - Port: 587
   - Username: resend
   - Password: [TU_API_KEY]
4. Verificar dominio (opcional pero recomendado)
```

#### Opción B: SendGrid (100 emails/día gratis)
```bash
1. Crear cuenta: https://sendgrid.com/
2. Verificar email sender
3. Obtener API Key
4. En Supabase:
   - Authentication → Email Templates → Custom SMTP
   - Host: smtp.sendgrid.net
   - Port: 587
   - Username: apikey
   - Password: [TU_API_KEY]
```

### 2. Habilitar confirmación de email
- [ ] **Supabase Dashboard** → Authentication → Providers → Email
- [ ] ✅ Activar "Confirm email"
- [ ] Guardar cambios

### 3. Personalizar emails (Opcional)
```
Authentication → Email Templates

Personaliza:
- Confirm signup (Verificación de email)
- Reset password (Recuperación de contraseña)
- Magic Link (Login sin contraseña)
- Change Email Address
```

### 4. Variables de entorno en Vercel
```bash
# En Vercel Dashboard → Settings → Environment Variables

VITE_SUPABASE_URL=https://yzakmqxbzwzbsdsadzej.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_DEEPSEEK_API_KEY=sk-4d4cc3ac92254985b045a1881b85b12a
VITE_QWEN_API_KEY=sk-e6343f5b0abc42d294d2ad7f977e48a8
```

### 5. Resultado esperado en producción:
✅ Usuarios reciben email de verificación
✅ Emails llegan correctamente (no spam)
✅ Recuperación de contraseña funciona
✅ Sistema profesional y seguro

---

## 📋 Checklist de migración a producción

### Antes de desplegar:
- [ ] Proveedor de email configurado (Resend/SendGrid)
- [ ] Emails de prueba enviados exitosamente
- [ ] Confirmación de email activada
- [ ] Templates de email personalizados
- [ ] Variables de entorno en Vercel configuradas
- [ ] Dominio verificado (si usas dominio custom)

### Después de desplegar:
- [ ] Crear cuenta de prueba en producción
- [ ] Verificar que email de confirmación llega
- [ ] Probar recuperación de contraseña
- [ ] Verificar que login funciona correctamente
- [ ] Monitorear logs de Supabase por errores

---

## 🔄 Migración de usuarios de desarrollo a producción

Si tienes usuarios de desarrollo que quieres migrar:

```sql
-- Ver usuarios sin confirmar
SELECT email, created_at, email_confirmed_at
FROM auth.users
WHERE email_confirmed_at IS NULL
ORDER BY created_at DESC;

-- Opción 1: Confirmarlos manualmente
UPDATE auth.users
SET email_confirmed_at = now()
WHERE email IN ('usuario1@ejemplo.com', 'usuario2@ejemplo.com');

-- Opción 2: Eliminarlos y que se registren de nuevo
DELETE FROM auth.users
WHERE email IN ('test@test.com', 'demo@demo.com');
```

---

## ⚠️ IMPORTANTE - Seguridad

### En DESARROLLO:
- ✅ OK tener confirmación deshabilitada
- ✅ OK usar emails de prueba
- ✅ OK no enviar emails reales

### En PRODUCCIÓN:
- ❌ NUNCA deshabilitar confirmación de email
- ❌ NUNCA usar el SMTP por defecto de Supabase
- ❌ NUNCA ignorar emails que van a spam

---

## 📞 Soporte y troubleshooting

### Si los emails no llegan en producción:
1. Verifica que la API Key es correcta
2. Revisa logs de Supabase (Database → Logs)
3. Verifica que no llegaron a spam
4. Confirma que el rate limit no fue alcanzado
5. Prueba enviar desde el dashboard de tu proveedor

### Si hay problemas con el login:
1. Verifica variables de entorno en Vercel
2. Revisa logs del navegador (F12 → Console)
3. Ejecuta el script de confirmar usuarios
4. Verifica RLS policies en Supabase

---

## 🎯 Recursos útiles

- [Documentación de Resend](https://resend.com/docs)
- [Supabase Email Templates](https://supabase.com/docs/guides/auth/auth-email-templates)
- [Supabase Custom SMTP](https://supabase.com/docs/guides/auth/auth-smtp)
- [Variables de entorno en Vercel](https://vercel.com/docs/environment-variables)

---

**Última actualización:** 2025-01-24
**Estado actual:** Configuración de desarrollo ✅
**Próximo paso:** Configurar emails para producción
