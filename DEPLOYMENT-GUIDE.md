# 🚀 Guía de Deployment en Vercel + SEO

## ✅ Archivos SEO Creados

- ✅ `/public/robots.txt` - Configuración para crawlers
- ✅ `/public/sitemap.xml` - Mapa del sitio para Google
- ✅ `/index.html` - Meta tags completos (SEO + Open Graph + Twitter)
- ✅ `/vercel.json` - Configuración optimizada para Vercel
- ✅ `/src/components/SEO.jsx` - Componente SEO reutilizable
- ⚠️ `/public/og-image.png` - **PENDIENTE: Crear imagen 1200x630**
- ⚠️ `/public/finantel-logo.png` - **PENDIENTE: Crear logo 512x512**

---

## 📋 Checklist Pre-Deployment

### 1. Crear Imágenes (IMPORTANTE)

**Imagen Open Graph** (`og-image.png`):
- Tamaño: 1200 x 630 px
- Formato: PNG
- Usar: https://www.canva.com o https://www.opengraph.xyz/
- Colocar en: `/public/og-image.png`

**Logo Finantel** (`finantel-logo.png`):
- Tamaño: 512 x 512 px
- Formato: PNG con fondo transparente
- Colocar en: `/public/finantel-logo.png`

Lee `/public/CREAR-IMAGEN-OG.md` para instrucciones detalladas.

### 2. Actualizar URLs en Archivos

Si tu dominio NO es `finantel.vercel.app`, actualiza en:

**`index.html`** (líneas 23, 26, 38, 43):
```html
<!-- Cambiar todas las instancias de: -->
https://finantel.vercel.app/
<!-- Por tu dominio: -->
https://tu-dominio.com/
```

**`public/sitemap.xml`** (todas las URLs):
```xml
<loc>https://tu-dominio.com/</loc>
```

**`public/robots.txt`** (línea del sitemap):
```
Sitemap: https://tu-dominio.com/sitemap.xml
```

**`src/components/SEO.jsx`** (línea 23):
```javascript
const siteUrl = 'https://tu-dominio.com';
```

### 3. Configurar Variables de Entorno

Asegúrate de tener configuradas en Vercel:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

---

## 🚀 Pasos para Desplegar en Vercel

### Opción 1: Deploy desde CLI (Recomendado)

```bash
# 1. Instalar Vercel CLI (si no lo tienes)
npm i -g vercel

# 2. Login en Vercel
vercel login

# 3. Deploy (primera vez)
vercel

# 4. Deploy a producción
vercel --prod
```

### Opción 2: Deploy desde GitHub

1. **Conectar con GitHub**:
   - Ve a https://vercel.com
   - Click en "Add New Project"
   - Importa tu repositorio de GitHub
   - Vercel detectará automáticamente Vite

2. **Configurar Variables de Entorno**:
   - En Vercel Dashboard → Settings → Environment Variables
   - Agrega:
     - `VITE_SUPABASE_URL`
     - `VITE_SUPABASE_ANON_KEY`

3. **Deploy**:
   - Click en "Deploy"
   - Vercel automáticamente:
     - Ejecutará `npm run build`
     - Desplegará desde `/dist`

---

## 🔍 Configurar Google Search Console

### 1. Verificar Propiedad

1. Ve a: https://search.google.com/search-console
2. Click en "Agregar propiedad"
3. Elige "Prefijo de URL"
4. Ingresa: `https://finantel.vercel.app/`
5. Verifica con método HTML tag (ya está en `index.html`)

### 2. Enviar Sitemap

1. En Search Console, ve a "Sitemaps"
2. Ingresa: `https://finantel.vercel.app/sitemap.xml`
3. Click en "Enviar"

### 3. Solicitar Indexación

1. Ve a "Inspección de URL"
2. Ingresa tu URL
3. Click en "Solicitar indexación"

---

## 🧪 Verificar SEO (Post-Deployment)

### 1. Verificar Meta Tags

**Facebook Debugger**:
- https://developers.facebook.com/tools/debug/
- Ingresa tu URL
- Verifica imagen OG, título, descripción

**Twitter Card Validator**:
- https://cards-dev.twitter.com/validator
- Ingresa tu URL
- Verifica preview

**LinkedIn Post Inspector**:
- https://www.linkedin.com/post-inspector/
- Verifica preview de LinkedIn

### 2. Verificar Robots.txt y Sitemap

```
https://finantel.vercel.app/robots.txt
https://finantel.vercel.app/sitemap.xml
```

### 3. Test SEO General

- **PageSpeed Insights**: https://pagespeed.web.dev/
- **Lighthouse**: Chrome DevTools → Lighthouse
- **SEO Checker**: https://www.seobility.net/en/seocheck/

---

## 📊 Métricas Esperadas (Google Lighthouse)

Después del deployment, deberías ver:

- **Performance**: 90+ (verde)
- **Accessibility**: 90+ (verde)
- **Best Practices**: 90+ (verde)
- **SEO**: 100 (verde)

---

## 🎯 Usar Componente SEO en Páginas

Importa el componente SEO en cada página:

```jsx
import SEO from '@/components/SEO';

function PricingPage() {
  return (
    <>
      <SEO
        title="Precios - Finantel"
        description="Elige el plan perfecto para tus necesidades"
        url="/pricing"
      />
      {/* Resto del componente */}
    </>
  );
}
```

**Páginas sugeridas para agregar SEO**:
- ✅ Home (`/`)
- ✅ Pricing (`/pricing`)
- ✅ Login (`/login`)
- ✅ Register (`/register`)
- ✅ Dashboard (`/dashboard`)

---

## 🔧 Comandos Útiles

```bash
# Build local
npm run build

# Preview del build
npm run preview

# Deploy a Vercel (producción)
vercel --prod

# Ver logs de deployment
vercel logs

# Ver información del proyecto
vercel ls
```

---

## 📝 Actualizar Sitemap (Cuando Agregues Páginas)

Edita `/public/sitemap.xml` y agrega:

```xml
<url>
  <loc>https://finantel.vercel.app/nueva-pagina</loc>
  <lastmod>2025-01-23</lastmod>
  <changefreq>weekly</changefreq>
  <priority>0.8</priority>
</url>
```

---

## ⚡ Performance Tips

1. **Lazy Loading**: Usa `React.lazy()` para rutas
2. **Imágenes**: Optimiza todas las imágenes (WebP, compresión)
3. **Code Splitting**: Vite lo hace automáticamente
4. **CDN**: Vercel lo proporciona automáticamente

---

## 🆘 Troubleshooting

### "og:image no se muestra"
- Verifica que `/public/og-image.png` exista
- Debe ser 1200x630 px
- Limpia caché de Facebook Debugger

### "Sitemap no se encuentra"
- Verifica que esté en `/public/sitemap.xml`
- Debe ser accesible en `/sitemap.xml`
- Revisa `vercel.json` headers

### "Robots.txt bloqueando Google"
- Verifica que `Allow: /` esté presente
- `Disallow: /dashboard/` solo bloquea esa sección

---

## ✅ Checklist Final

Antes de considerar el deployment completo:

- [ ] Imágenes creadas (`og-image.png`, `finantel-logo.png`)
- [ ] URLs actualizadas (si usas dominio custom)
- [ ] Variables de entorno configuradas en Vercel
- [ ] Build exitoso (`npm run build`)
- [ ] Deploy a producción (`vercel --prod`)
- [ ] Sitemap enviado a Google Search Console
- [ ] Meta tags verificados (Facebook/Twitter Debugger)
- [ ] Lighthouse score > 90 en todas las métricas
- [ ] Robots.txt accesible
- [ ] Sitemap.xml accesible
- [ ] Componente SEO agregado a páginas principales

---

## 📞 Soporte

Si necesitas ayuda:
- Vercel Docs: https://vercel.com/docs
- Google Search Console Help: https://support.google.com/webmasters
- Open Graph Protocol: https://ogp.me/

---

**¡Tu aplicación está lista para el mundo! 🌍🚀**
