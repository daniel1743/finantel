# 🚀 Desplegar Edge Function voice-to-transaction en Supabase

## ❌ Problema Actual

```
Error: Access to fetch at 'https://yzakmqxbzwzbsdsadzej.supabase.co/functions/v1/voice-to-transaction'
has been blocked by CORS policy
```

**Causa**: La Edge Function NO está desplegada en Supabase (solo existe localmente)

---

## ✅ Solución: 2 Métodos de Despliegue

### Método 1: Dashboard de Supabase (MÁS FÁCIL) ⭐

#### Paso 1: Accede a tu proyecto en Supabase
```
https://supabase.com/dashboard/project/yzakmqxbzwzbsdsadzej
```

#### Paso 2: Ve a Edge Functions
1. En el menú lateral, busca: **"Edge Functions"**
2. Click en **"Create a new function"**
3. Nombre de la función: `voice-to-transaction`

#### Paso 3: Copia el código
Abre el archivo local:
```
C:\Users\Lenovo\Downloads\finantel version 2.1 funcional\supabase\functions\voice-to-transaction\index.ts
```

Copia TODO el contenido del archivo (308 líneas)

#### Paso 4: Pega en el editor de Supabase
1. Pega el código completo en el editor
2. Click en **"Deploy function"**

#### Paso 5: Configura los secretos (IMPORTANTE)
1. Ve a: **Settings** → **Edge Functions** → **Secrets**
2. Agrega estas 3 variables:

| Nombre | Valor |
|--------|-------|
| `OPENAI_API_KEY` | `sk-proj-LmZeVPyQcS0VmYhraWU1aVLsZ9AKWWjV7gD_aB-1hQ` |
| `SUPABASE_URL` | `https://yzakmqxbzwzbsdsadzej.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl6YWttcXhiend6YnNkc2FkemVqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzkxMTMxNiwiZXhwIjoyMDc5NDg3MzE2fQ.2dxcZOhCgjewwQAC9GSfggjC9rGN1gaMhd8j9ZaY1tw` |

3. Click en **"Save"** para cada una

---

### Método 2: Supabase CLI (MÁS TÉCNICO)

#### Paso 1: Instalar Supabase CLI
```bash
# Windows (PowerShell como Administrador)
npm install -g supabase

# Verificar instalación
supabase --version
```

#### Paso 2: Login en Supabase
```bash
cd "C:\Users\Lenovo\Downloads\finantel version 2.1 funcional"
supabase login
```
Te pedirá un Access Token. Obtenlo en:
```
https://supabase.com/dashboard/account/tokens
```

#### Paso 3: Link al proyecto
```bash
supabase link --project-ref yzakmqxbzwzbsdsadzej
```

#### Paso 4: Configurar secretos
```bash
# OpenAI API Key
supabase secrets set OPENAI_API_KEY=sk-proj-LmZeVPyQcS0VmYhraWU1aVLsZ9AKWWjV7gD_aB-1hQ

# Supabase URL
supabase secrets set SUPABASE_URL=https://yzakmqxbzwzbsdsadzej.supabase.co

# Service Role Key
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl6YWttcXhiend6YnNkc2FkemVqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzkxMTMxNiwiZXhwIjoyMDc5NDg3MzE2fQ.2dxcZOhCgjewwQAC9GSfggjC9rGN1gaMhd8j9ZaY1tw
```

#### Paso 5: Desplegar la función
```bash
supabase functions deploy voice-to-transaction
```

---

## 🧪 Verificar que funciona

### Test 1: Verificar en el Dashboard
1. Ve a: https://supabase.com/dashboard/project/yzakmqxbzwzbsdsadzej/functions
2. Deberías ver: `voice-to-transaction` ✅ Deployed
3. Estado: **Active**

### Test 2: Probar con cURL
```bash
curl -i --location --request POST 'https://yzakmqxbzwzbsdsadzej.supabase.co/functions/v1/voice-to-transaction' \
  --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl6YWttcXhiend6YnNkc2FkemVqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM5MTEzMTYsImV4cCI6MjA3OTQ4NzMxNn0.b_Y7BDr56MeaE_3x4rIYwWn_GG7RM_SOvB-7y5Gvjx4' \
  --header 'Content-Type: application/json' \
  --data '{"test": true}'
```

Deberías recibir un error descriptivo (no CORS), como:
```json
{
  "success": false,
  "error": "Faltan parámetros: audio o userId"
}
```

Eso significa que la función está desplegada ✅

### Test 3: Probar desde la aplicación
1. Abre: `http://localhost:3001/dashboard/transactions`
2. Click en el micrófono 🎤
3. Permite permisos
4. Di: "Gasté mil pesos en Jumbo"
5. Click para detener
6. Debería procesarse sin error de CORS

---

## 🔧 Solución de Problemas

### Error: "Function not found"
- Verifica que el nombre sea exactamente: `voice-to-transaction`
- Revisa en el Dashboard que esté desplegada

### Error: "OPENAI_API_KEY no configurada"
- Ve a Settings → Edge Functions → Secrets
- Agrega `OPENAI_API_KEY` con tu clave de OpenAI

### Error: "Invalid login credentials"
- Verifica que las variables `SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY` estén configuradas
- Asegúrate de que la Service Role Key sea correcta

### Sigue habiendo error CORS
- Espera 1-2 minutos después del despliegue
- Haz un hard refresh (Ctrl + Shift + R) en el navegador
- Verifica los logs de la función en el Dashboard

---

## 📋 Checklist de Despliegue

- [ ] La función `voice-to-transaction` está visible en el Dashboard
- [ ] Estado de la función: **Active** (verde)
- [ ] Secreto `OPENAI_API_KEY` configurado
- [ ] Secreto `SUPABASE_URL` configurado
- [ ] Secreto `SUPABASE_SERVICE_ROLE_KEY` configurado
- [ ] Test con cURL exitoso (sin error CORS)
- [ ] Test desde la aplicación exitoso

---

## 🎯 Próximos Pasos

Una vez desplegada la función:

1. **Prueba básica**: Di "Gasté mil pesos en Jumbo"
2. **Verifica logs**: Dashboard → Edge Functions → voice-to-transaction → Logs
3. **Revisa transacciones**: Dashboard → Transactions (debería aparecer la nueva)

---

## 📞 Necesitas Ayuda?

Si después de seguir estos pasos sigue sin funcionar:

1. Revisa los logs de la función en el Dashboard
2. Copia el error exacto que aparece
3. Verifica que las 3 variables secretas estén configuradas correctamente

**La función YA está lista, solo falta desplegarla!** 🚀
