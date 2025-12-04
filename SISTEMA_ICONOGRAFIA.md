# 🎨 SISTEMA DE ICONOGRAFÍA - FINANTEL

## 📋 Descripción

Sistema centralizado de iconografía basado en el estilo del sidebar. Todos los iconos de la aplicación deben usar este sistema para mantener consistencia visual y facilitar el mantenimiento.

## 🎯 Objetivo

- **Estilo único**: Todos los iconos comparten el mismo estilo visual (línea simple, grosor uniforme)
- **Tamaños consistentes**: Escala estándar de tamaños (xs, sm, md, lg, xl)
- **Mantenimiento centralizado**: Cambios de tamaño/estilo se hacen en un solo lugar
- **Coherencia visual**: Misma apariencia en todas las pantallas (header, sidebar, modales, tarjetas, etc.)

## 📦 Componentes

### 1. Tokens de Iconos (`src/lib/iconTokens.js`)

Define la escala de tamaños, colores y estilos:

```javascript
import { iconSizes, iconSizeClasses, iconColors } from '@/lib/iconTokens';

// Tamaños disponibles
iconSizes = {
  xs: '12px',   // Badges, elementos muy secundarios
  sm: '16px',   // Textos secundarios, labels
  md: '20px',   // Tamaño por defecto (referencia sidebar)
  lg: '24px',   // Iconos protagonistas
  xl: '32px',   // Iconos destacados o hero sections
}

// Colores disponibles
iconColors = {
  default, primary, active, muted, white, dark, success, warning, error
}
```

### 2. Componente Base (`src/components/ui/Icon.jsx`)

Componente centralizado para renderizar iconos:

```jsx
import Icon from '@/components/ui/Icon';
import { Bell, Menu } from 'lucide-react';

// Uso básico
<Icon component={Bell} size="md" color="primary" />

// Con clases adicionales
<Icon 
  component={Menu} 
  size="sm" 
  color="default" 
  className="hover:scale-110" 
/>
```

## 🔧 Uso

### Ejemplo 1: Icono simple

```jsx
import Icon from '@/components/ui/Icon';
import { Bell } from 'lucide-react';

<Icon component={Bell} size="md" color="primary" />
```

### Ejemplo 2: Icono en botón

```jsx
<button className="p-2 rounded-full hover:bg-gray-100">
  <Icon component={Menu} size="sm" color="default" />
</button>
```

### Ejemplo 3: Icono con variante de color

```jsx
// Icono activo
<Icon component={Dashboard} size="md" color="active" />

// Icono de éxito
<Icon component={CheckCircle} size="lg" color="success" />
```

### Ejemplo 4: Icono responsive (se ajusta automáticamente en móviles)

```jsx
// Icono que se reduce en pantallas pequeñas
<Icon component={Heart} size="xl" color="primary" responsive />

// En desktop: 32px, En mobile: 24px
```

## 📏 Escala de Tamaños

| Tamaño | Pixels | Uso Recomendado |
|--------|--------|-----------------|
| `xs`   | 12px   | Badges, elementos muy secundarios |
| `sm`   | 16px   | Textos secundarios, labels, botones pequeños |
| `md`   | 20px   | **Tamaño por defecto** (referencia sidebar) |
| `lg`   | 24px   | Iconos protagonistas, tarjetas principales |
| `xl`   | 32px   | Hero sections, iconos destacados |

## 🎨 Colores Disponibles

| Color     | Uso                           |
|-----------|-------------------------------|
| `default` | Color neutro por defecto      |
| `primary` | Color primario de la marca    |
| `active`  | Estado activo/seleccionado   |
| `muted`   | Elementos deshabilitados      |
| `white`   | Sobre fondos oscuros          |
| `dark`    | Sobre fondos claros           |
| `success` | Estados de éxito              |
| `warning` | Advertencias                  |
| `error`   | Errores                       |

## 🔄 Migración

### Antes (❌ No usar)

```jsx
<Bell className="w-5 h-5 text-[#1C8FA0]" />
<Menu className="w-4 h-4 text-gray-500" />
```

### Después (✅ Usar)

```jsx
<Icon component={Bell} size="md" color="primary" />
<Icon component={Menu} size="sm" color="muted" />
```

## 📝 Reglas de Uso

1. **Siempre usar el componente `Icon`** en lugar de renderizar iconos directamente
2. **Usar tamaños de la escala estándar** (xs, sm, md, lg, xl), no valores arbitrarios
3. **Usar colores del sistema** en lugar de colores hardcodeados
4. **Mantener consistencia**: El tamaño por defecto (`md` = 20px) coincide con el sidebar
5. **Responsive**: Agregar prop `responsive` para iconos que necesitan ajustarse automáticamente en móviles
6. **Ajustes globales**: Los tamaños de iconos se ajustan automáticamente en mobile con CSS global (no requiere cambios manuales)

## 🎯 Compatibilidad

El sistema soporta:
- **Lucide React**: Iconos outline con stroke-width uniforme
- **Material UI Icons**: Iconos Outlined de MUI (usados en sidebar)

## 📱 Sistema Responsive

### Ajustes Automáticos en Mobile

El sistema de iconografía incluye reglas CSS globales que ajustan automáticamente los tamaños en dispositivos móviles:

| Breakpoint | Ajustes |
|------------|---------|
| **Desktop (>768px)** | Tamaños completos (xs=12px, sm=16px, md=20px, lg=24px, xl=32px) |
| **Tablet (769px-1024px)** | xl=28px (reducción ligera) |
| **Mobile (≤768px)** | xl=24px, lg=20px (reducción moderada) |
| **Small Mobile (≤480px)** | xl=20px, lg=18px, md=16px (reducción agresiva) |

### Modo Responsive Manual

Si necesitas control explícito sobre el comportamiento responsive:

```jsx
// Icono que se adapta automáticamente
<Icon component={Star} size="xl" responsive />

// Sin responsive (mantiene tamaño fijo)
<Icon component={Star} size="xl" />
```

## 📚 Archivos Relacionados

- `src/lib/iconTokens.js` - Tokens y variables del sistema
- `src/components/ui/Icon.jsx` - Componente base de iconos
- `src/index.css` - Variables CSS para iconos + reglas responsive (líneas 377-498)
- `tools/migrate-icons.js` - Script de migración automática

## 🔍 Verificación

Para verificar que un componente usa el sistema correctamente:

1. Buscar usos directos de iconos: `className="w-.* h-.*"`
2. Reemplazar por `<Icon component={...} size="..." color="..." />`
3. Verificar que los tamaños usen la escala estándar

---

**Última actualización**: Diciembre 2025
**Versión**: 1.0

