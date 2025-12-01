# 📱 ICONOS Y LOGOS - FINANTEL

## 📦 ARCHIVOS NECESARIOS

Para que la aplicación PWA funcione correctamente, necesitas los siguientes archivos en esta carpeta (`/public/`):

### ✅ **PRIORITARIOS (Mínimo necesario)**

1. **`favicon.ico`** - Icono principal del navegador
   - Tamaños: 16x16, 32x32, 48x48
   - Formato: .ico (puede contener múltiples tamaños)

2. **`icon-192x192.png`** - Icono PWA Android pequeño
   - Tamaño: 192x192px
   - Formato: PNG con transparencia
   - Padding: 10-20% del tamaño total

3. **`icon-512x512.png`** - Icono PWA Android grande
   - Tamaño: 512x512px
   - Formato: PNG con transparencia
   - Padding: 10-20% del tamaño total

4. **`apple-touch-icon.png`** - Icono iOS
   - Tamaño: 180x180px
   - Formato: PNG (puede tener fondo)
   - Sin transparencia (iOS agrega esquinas redondeadas automáticamente)

### 🎨 **LOGOS (Opcional pero recomendado)**

5. **`finantel-logo-white-bg.png`** - Logo con fondo blanco
   - Para usar en fondos oscuros
   - Tamaño recomendado: 512x512px o mayor
   
6. **`finantel-logo-black-bg.png`** - Logo con fondo negro
   - Para usar en fondos claros
   - Tamaño recomendado: 512x512px o mayor

7. **`finantel-logo-transparent.png`** - Logo sin fondo
   - Para uso general
   - Tamaño recomendado: 512x512px o mayor

### 📱 **ICONOS PWA ADICIONALES (Opcional, mejoran la experiencia)**

8. `icon-72x72.png` - 72x72px
9. `icon-96x96.png` - 96x96px
10. `icon-128x128.png` - 128x128px
11. `icon-144x144.png` - 144x144px
12. `icon-152x152.png` - 152x152px
13. `icon-384x384.png` - 384x384px

### 🍎 **APPLE TOUCH ICONS ADICIONALES (Opcional)**

14. `apple-touch-icon-57x57.png` - 57x57px
15. `apple-touch-icon-60x60.png` - 60x60px
16. `apple-touch-icon-72x72.png` - 72x72px
17. `apple-touch-icon-76x76.png` - 76x76px
18. `apple-touch-icon-114x114.png` - 114x114px
19. `apple-touch-icon-120x120.png` - 120x120px
20. `apple-touch-icon-144x144.png` - 144x144px
21. `apple-touch-icon-152x152.png` - 152x152px
22. `apple-touch-icon-180x180.png` - 180x180px

## 🎨 ESPECIFICACIONES DE DISEÑO

### Colores de marca:
- **Primario**: `#1C8FA0` (Teal)
- **Fondo claro**: `#ffffff`
- **Fondo oscuro**: `#000000` o `#1a1a1a`

### Recomendaciones:
- Los iconos deben tener padding del 10-20% para evitar recortes en diferentes dispositivos
- Mantener el logo/icono centrado en el espacio disponible
- Usar fondos sólidos para Apple Touch Icons
- Mantener proporción 1:1 (cuadrados perfectos)

## ✅ CHECKLIST

Una vez que tengas los archivos:

- [ ] Coloca `favicon.ico` en `/public/`
- [ ] Coloca `icon-192x192.png` en `/public/`
- [ ] Coloca `icon-512x512.png` en `/public/`
- [ ] Coloca `apple-touch-icon.png` en `/public/`
- [ ] (Opcional) Coloca logos con fondo blanco/negro
- [ ] (Opcional) Coloca iconos PWA adicionales
- [ ] (Opcional) Coloca Apple Touch Icons adicionales

## 🔍 VERIFICACIÓN

Después de agregar los archivos, verifica:

1. Abre la app en el navegador y revisa la pestaña (favicon)
2. Instala como PWA y verifica que el icono se vea correctamente
3. En iOS, añade a pantalla de inicio y verifica el icono
4. Revisa la consola del navegador por errores 404 de iconos faltantes

## 📝 NOTAS

- Los archivos actuales (`finantel-icon.svg` y `finantel-logo.png`) se mantienen para compatibilidad
- Si no creas todos los iconos opcionales, la app funcionará con los prioritarios
- El sistema usará los iconos disponibles y hará fallback a los existentes si faltan algunos

