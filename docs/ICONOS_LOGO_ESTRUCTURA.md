# 🎨 ESTRUCTURA DE ICONOS Y LOGOS - FINANTEL

## 📁 ARCHIVOS NECESARIOS EN `/public/`

### 1. **Favicon (.ico)**
- `favicon.ico` - Icono principal del navegador (16x16, 32x32, 48x48)
- Debe tener fondo transparente o sólido

### 2. **Logos con Fondo**
- `finantel-logo-white-bg.png` - Logo con fondo blanco
- `finantel-logo-black-bg.png` - Logo con fondo negro
- `finantel-logo-transparent.png` - Logo sin fondo (PNG transparente)

### 3. **Iconos PWA (Progressive Web App)**
- `icon-72x72.png` - 72x72px
- `icon-96x96.png` - 96x96px
- `icon-128x128.png` - 128x128px
- `icon-144x144.png` - 144x144px
- `icon-152x152.png` - 152x152px (iOS)
- `icon-192x192.png` - 192x192px (Android)
- `icon-384x384.png` - 384x384px
- `icon-512x512.png` - 512x512px (Android)

### 4. **Apple Touch Icons**
- `apple-touch-icon.png` - 180x180px (iOS)
- `apple-touch-icon-57x57.png` - 57x57px
- `apple-touch-icon-60x60.png` - 60x60px
- `apple-touch-icon-72x72.png` - 72x72px
- `apple-touch-icon-76x76.png` - 76x76px
- `apple-touch-icon-114x114.png` - 114x114px
- `apple-touch-icon-120x120.png` - 120x120px
- `apple-touch-icon-144x144.png` - 144x144px
- `apple-touch-icon-152x152.png` - 152x152px
- `apple-touch-icon-180x180.png` - 180x180px

### 5. **Iconos SVG (Opcional pero recomendado)**
- `finantel-icon.svg` - Icono SVG (ya existe)
- `finantel-logo.svg` - Logo SVG

## 🔧 CONFIGURACIÓN ACTUAL

### Archivos existentes:
- ✅ `finantel-icon.svg` - Icono SVG
- ✅ `finantel-logo.png` - Logo PNG (actualmente usado como icono PWA)

### Archivos que necesitas crear/reemplazar:
1. `favicon.ico` - **PRIORITARIO**
2. `finantel-logo-white-bg.png` - Logo con fondo blanco
3. `finantel-logo-black-bg.png` - Logo con fondo negro
4. Iconos PWA (192x192 y 512x512 mínimo)
5. Apple touch icons (180x180 mínimo)

## 📝 NOTAS IMPORTANTES

- **Formato .ico**: Puede contener múltiples tamaños (16x16, 32x32, 48x48) en un solo archivo
- **Fondos**: Los logos con fondo blanco/negro deben tener bordes redondeados si el icono es cuadrado
- **PWA**: Los iconos deben tener padding del 10-20% para evitar recortes
- **Apple**: Requiere fondos sólidos o con esquinas redondeadas predefinidas

## 🎨 COLORES DE BRAND

- **Color principal**: `#1C8FA0` (Teal)
- **Fondo claro**: `#ffffff`
- **Fondo oscuro**: `#000000` o `#1a1a1a`

## 📋 CHECKLIST PARA COMPLETAR

- [ ] Crear `favicon.ico` con múltiples tamaños
- [ ] Crear `finantel-logo-white-bg.png`
- [ ] Crear `finantel-logo-black-bg.png`
- [ ] Crear iconos PWA (192x192 y 512x512 mínimo)
- [ ] Crear apple-touch-icon.png (180x180)
- [ ] Actualizar `index.html` con todas las referencias
- [ ] Actualizar `manifest.json` con iconos PWA
- [ ] Probar en diferentes navegadores y dispositivos

