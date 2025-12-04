# 🎛️ SISTEMA DE CONTROLES (INPUTS Y BOTONES) - FINANTEL

## 📋 Descripción

Sistema global centralizado para inputs y botones que garantiza consistencia visual en toda la aplicación. Todos los controles comparten la misma altura, padding, border-radius y tipografía.

## 🎯 Objetivo

- **Consistencia visual**: Todos los inputs y botones tienen exactamente la misma altura y padding
- **Mantenimiento centralizado**: Cambios de diseño se hacen desde un solo archivo
- **Accesibilidad**: Altura mínima de 44px para mejor accesibilidad táctil (WCAG)
- **Responsive**: Ajustes automáticos para mobile (48px en mobile, 16px font-size para evitar zoom en iOS)

## 📦 Componentes

### 1. Tokens CSS (`src/index.css`)

Variables CSS globales que definen el sistema:

```css
/* Alturas estándar */
--control-height-base: 44px;      /* Base (mínimo accesible) */
--control-height-sm: 36px;        /* Variante pequeña */
--control-height-lg: 52px;        /* Variante grande */

/* Padding horizontal */
--control-padding-x: 16px;        /* Base */
--control-padding-x-sm: 12px;     /* Pequeño */
--control-padding-x-lg: 20px;     /* Grande */

/* Border radius */
--control-radius: 10px;            /* Base */
--control-radius-sm: 8px;         /* Pequeño */
--control-radius-lg: 12px;        /* Grande */

/* Tipografía */
--control-font-size: 15px;        /* Base */
--control-font-size-sm: 14px;     /* Pequeño */
--control-font-size-lg: 16px;    /* Grande */
```

### 2. Componente Input (`src/components/ui/input.jsx`)

Componente base para todos los inputs:

```jsx
import { Input } from '@/components/ui/input';
import { Mail, Lock } from 'lucide-react';

// Uso básico
<Input type="email" placeholder="Correo" />

// Con icono izquierdo
<Input type="email" placeholder="Correo" icon={Mail} />

// Con icono derecho
<Input 
  type="password" 
  placeholder="Contraseña" 
  icon={Lock}
  iconRight={<EyeButton />}
/>

// Variantes de tamaño
<Input type="text" size="sm" />    // Pequeño
<Input type="text" size="default" /> // Base (default)
<Input type="text" size="lg" />    // Grande
```

### 3. Componente Button (`src/components/ui/button.jsx`)

Componente base actualizado para usar el sistema:

```jsx
import { Button } from '@/components/ui/button';

// Uso básico (usa altura base automáticamente)
<Button>Enviar</Button>

// Variantes de tamaño
<Button size="sm">Pequeño</Button>
<Button size="default">Base</Button>
<Button size="lg">Grande</Button>

// Variantes de estilo
<Button variant="default">Primario</Button>
<Button variant="outline">Secundario</Button>
<Button variant="ghost">Terciario</Button>
```

## 📏 Escala de Tamaños

| Tamaño   | Altura | Padding X | Font Size | Border Radius |
|----------|--------|-----------|-----------|---------------|
| `sm`     | 36px   | 12px      | 14px      | 8px           |
| `default`| 44px   | 16px      | 15px      | 10px          |
| `lg`     | 52px   | 20px      | 16px      | 12px          |

## 📱 Responsive

El sistema se ajusta automáticamente en mobile:

```css
@media (max-width: 640px) {
  --control-height-base: 48px;    /* Más grande para mejor accesibilidad táctil */
  --control-padding-x: 14px;
  --control-font-size: 16px;      /* Evita zoom automático en iOS */
}
```

## 🎨 Estilos Base Aplicados Automáticamente

Todos los inputs nativos (`input`, `textarea`, `select`) reciben automáticamente:

- ✅ Altura: `var(--control-height-base)`
- ✅ Padding: `0 var(--control-padding-x)`
- ✅ Border radius: `var(--control-radius)`
- ✅ Font size: `var(--control-font-size)`
- ✅ Transiciones suaves
- ✅ Estados hover y focus consistentes
- ✅ Soporte para dark mode

## 🔄 Migración

### Antes (❌ No usar)

```jsx
<input 
  className="w-full pl-10 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1C8FA0]/20 focus:border-[#1C8FA0] transition-all text-sm font-medium"
/>
```

### Después (✅ Usar)

```jsx
<Input 
  type="email" 
  placeholder="Correo" 
  icon={Mail}
/>
```

## 📝 Reglas de Uso

1. **Siempre usar el componente `Input`** en lugar de inputs nativos con clases hardcodeadas
2. **Usar el componente `Button`** que ya está actualizado con el sistema
3. **Usar tamaños de la escala estándar** (sm, default, lg), no valores arbitrarios
4. **Los inputs nativos también funcionan** gracias a los estilos globales en CSS
5. **Para excepciones**, crear variantes pero siempre basadas en la escala global

## 🎯 Estados y Comportamiento

### Estados de Input

- **Default**: Fondo gris claro, borde gris
- **Hover**: Borde primario, fondo blanco
- **Focus**: Borde primario, sombra sutil, fondo blanco
- **Disabled**: Opacidad reducida, cursor no permitido

### Estados de Button

- **Default**: Fondo primario, texto blanco, sombra sutil
- **Hover**: Fondo más oscuro, sombra más prominente
- **Focus**: Ring visible para accesibilidad
- **Disabled**: Opacidad reducida, cursor no permitido

## 🔍 Verificación

Para verificar que un componente usa el sistema correctamente:

1. Buscar inputs con clases hardcodeadas: `className=".*py-.*|.*h-.*|.*rounded-.*"`
2. Reemplazar por `<Input ... />` o verificar que use las variables CSS
3. Verificar que los botones usen el componente `Button` actualizado

## 📚 Archivos Relacionados

- `src/index.css` - Variables CSS y estilos base globales
- `src/components/ui/input.jsx` - Componente base de Input
- `src/components/ui/button.jsx` - Componente base de Button (actualizado)
- `src/lib/controlTokens.js` - Tokens JavaScript (referencia)

## ✅ Componentes Migrados

- ✅ `src/pages/Auth.jsx` - Todos los inputs del formulario de autenticación
- ✅ `src/components/ui/button.jsx` - Botones actualizados al sistema

## 🔄 Próximos Pasos

Para completar la migración, actualizar estos componentes:

1. Modales - Todos los inputs y botones en modales
2. Dashboard - Formularios de transacciones, presupuestos, etc.
3. Landing Page - Formularios de contacto, newsletter, etc.
4. Configuración - Perfil, preferencias, etc.

---

**Última actualización**: Diciembre 2025
**Versión**: 1.0

