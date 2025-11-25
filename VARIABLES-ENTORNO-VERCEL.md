# Variables de Entorno para Vercel - Finantel

Copia y pega estas variables en Vercel Dashboard → Settings → Environment Variables

## 🔑 Variables Requeridas

### Supabase Configuration
```
VITE_SUPABASE_URL=https://yzakmqxbzwzbsdsadzej.supabase.co
```

```
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl6YWttcXhiend6YnNkc2FkemVqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM5MTEzMTYsImV4cCI6MjA3OTQ4NzMxNn0.b_Y7BDr56MeaE_3x4rIYwWn_GG7RM_SOvB-7y5Gvjx4
```

```
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl6YWttcXhiend6YnNkc2FkemVqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzkxMTMxNiwiZXhwIjoyMDc5NDg3MzE2fQ.2dxcZOhCgjewwQAC9GSfggjC9rGN1gaMhd8j9ZaY1tw
```

```
SUPABASE_PUBLISHABLE_KEY=sb_publishable_3GV_PdDrkXcxRjv8jzuuOQ_DZWozBFY
```

```
SUPABASE_SECRET_KEY=sb_secret_R8QENCvKF5luUX-5Ja1UXQ_ib8uCdmx
```

### AI Services
```
VITE_DEEPSEEK_API_KEY=sk-4d4cc3ac92254985b045a1881b85b12a
```

```
VITE_QWEN_API_KEY=sk-e6343f5b0abc42d294d2ad7f977e48a8
```

```
VITE_OPENAI_API_KEY=sk-proj-LmZeVPyQcS0VmYhraWU1aVLsZ9AKWWjV7gD_aB-1hQ
```

### Mercado Pago
```
VITE_MERCADO_PAGO_PUBLIC_KEY=APP_USR-9f4a5b4d-2e2f-453e-9c14-b7555cc6bd86
```

```
VITE_MERCADO_PAGO_ACCESS_TOKEN=APP_USR-4284404497852619-112419-2600495523792527fd9d6990befd3683-659472935
```

```
VITE_MERCADO_PAGO_CLIENT_ID=4284404497852619
```

```
VITE_MERCADO_PAGO_CLIENT_SECRET=QS1Hr5DhaIynTgTsGaWyrjbCDKQsTJqB
```

---

## 📝 Instrucciones de Configuración en Vercel

1. Ve a tu proyecto en Vercel: https://vercel.com/dashboard
2. Click en **Settings** → **Environment Variables**
3. Para cada variable:
   - Pega el **nombre** de la variable (ej: `VITE_SUPABASE_URL`)
   - Pega el **valor** correspondiente
   - Selecciona **Production**, **Preview** y **Development**
   - Click en **Add**

4. Después de agregar todas las variables, haz un **Redeploy** del proyecto

---

## ⚠️ IMPORTANTE: Variables en Supabase Edge Functions

Además de Vercel, debes configurar estas variables en Supabase para la función `voice-to-transaction`:

1. Ve a: https://supabase.com/dashboard/project/yzakmqxbzwzbsdsadzej/functions
2. Click en **Edge Functions** → **Secrets**
3. Agrega estas variables:

| Variable | Valor |
|----------|-------|
| `OPENAI_API_KEY` | `sk-proj-LmZeVPyQcS0VmYhraWU1aVLsZ9AKWWjV7gD_aB-1hQ` |
| `SUPABASE_URL` | `https://yzakmqxbzwzbsdsadzej.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl6YWttcXhiend6YnNkc2FkemVqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzkxMTMxNiwiZXhwIjoyMDc5NDg3MzE2fQ.2dxcZOhCgjewwQAC9GSfggjC9rGN1gaMhd8j9ZaY1tw` |

---

## ✅ Verificación

Después de configurar las variables:

1. Redeploy en Vercel
2. Abre la consola del navegador (F12)
3. Verifica que no haya errores de variables faltantes
4. Prueba el login y las funcionalidades básicas
