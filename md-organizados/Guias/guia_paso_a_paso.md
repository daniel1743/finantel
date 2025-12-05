# 📝 GUÍA PASO A PASO: ACOMODAR Y COMPROBAR MEJORAS UX/UI

**Objetivo:** Instrucciones detalladas para implementar mejoras de consistencia UX/UI  
**Tiempo estimado:** 6 semanas (siguiendo el orden)  
**Nivel:** Paso a paso con ejemplos de código

---

## 📋 ÍNDICE

1. [Preparación del Entorno](#preparación-del-entorno)
2. [Fase 1: Design Tokens y Sistema Base](#fase-1-design-tokens-y-sistema-base)
3. [Fase 2: Componentes Base Mejorados](#fase-2-componentes-base-mejorados)
4. [Fase 3: Migración Landing Page](#fase-3-migración-landing-page)
5. [Fase 4: Migración Dashboard](#fase-4-migración-dashboard)
6. [Fase 5: Testing y Verificación](#fase-5-testing-y-verificación)
7. [Checklist Final](#checklist-final)

---

## 🛠️ PREPARACIÓN DEL ENTORNO

### Paso 1.1: Crear Estructura de Archivos

```bash
# Crear directorio para design tokens
mkdir -p src/theme

# Crear archivo de design tokens
touch src/theme/designTokens.js

# Crear componentes UI mejorados
touch src/components/ui/Card.tsx
touch src/components/ui/Button.tsx
```

### Paso 1.2: Backup del Código Actual

```bash
# Crear branch para mejoras
git checkout -b feature/ux-ui-consistency

# Commit inicial
git add .
git commit -m "chore: backup antes de mejoras UX/UI"
```

---

## 🎨 FASE 1: DESIGN TOKENS Y SISTEMA BASE

### Paso 1.1: Crear Design Tokens Centralizados

**Archivo:** `src/theme/designTokens.js`

```javascript
/**
 * DESIGN TOKENS - Sistema Centralizado
 * Todos los valores visuales deben venir de aquí
 */

export const designTokens = {
  colors: {
    primary: {
      50: '#E6F3F6',
      100: '#CCE7ED',
      200: '#99CFDB',
      300: '#66B7C9',
      400: '#339FB7',
      500: '#1C8FA0',  // Color principal
      600: '#167a8a',  // Hover principal
      700: '#0D3A47',
      800: '#092D37',
      900: '#052027',
    },
    secondary: {
      50: '#FDF4F0',
      100: '#FBE9E1',
      200: '#F7D3C3',
      300: '#F3BDA5',
      400: '#EFA787',
      500: '#E47B45',  // Color secundario
      600: '#D66B35',
      700: '#B85A2D',
      800: '#9A4925',
      900: '#7C381D',
    },
    neutral: {
      50: '#FAFAFA',
      100: '#F5F7F9',
      200: '#E5E7EB',
      300: '#D1D5DB',
      400: '#9CA3AF',
      500: '#6E6E73',
      600: '#4B5563',
      700: '#374151',
      800: '#1F2937',
      900: '#1a1a1a',  // Texto principal
    },
    success: {
      500: '#10B981',
      600: '#059669',
    },
    warning: {
      500: '#F59E0B',
      600: '#D97706',
    },
    error: {
      500: '#EF4444',
      600: '#DC2626',
    },
  },
  borderRadius: {
    none: '0',
    sm: '8px',
    base: '10px',      // Botones, inputs
    md: '12px',
    lg: '16px',       // Tarjetas estándar
    xl: '24px',       // Tarjetas grandes, modales
    '2xl': '32px',    // Tarjetas extra grandes
    full: '9999px',   // Botones CTA, badges
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    '2xl': '48px',
    '3xl': '64px',
  },
  typography: {
    fontFamily: {
      sans: ['Inter', 'sans-serif'],
      display: ['Inter Tight', 'sans-serif'],
    },
    fontSize: {
      xs: ['12px', { lineHeight: '1.5' }],
      sm: ['14px', { lineHeight: '1.5' }],
      base: ['16px', { lineHeight: '1.5' }],
      lg: ['18px', { lineHeight: '1.4' }],
      xl: ['20px', { lineHeight: '1.4' }],
      '2xl': ['24px', { lineHeight: '1.3' }],
      '3xl': ['30px', { lineHeight: '1.2' }],
      '4xl': ['36px', { lineHeight: '1.1' }],
      '5xl': ['48px', { lineHeight: '1.1' }],
      '6xl': ['60px', { lineHeight: '1' }],
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
  },
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    primary: '0 10px 30px -10px rgba(28, 143, 160, 0.2)',
    'primary-lg': '0 20px 40px -12px rgba(28, 143, 160, 0.3)',
  },
  zIndex: {
    base: 0,
    dropdown: 1000,
    sticky: 1020,
    fixed: 1030,
    modalBackdrop: 1040,
    modal: 1050,
    popover: 1060,
    tooltip: 1070,
  },
};

export default designTokens;
```

### Paso 1.2: Actualizar Tailwind Config

**Archivo:** `tailwind.config.js`

```javascript
const designTokens = require('./src/theme/designTokens.js').default;

module.exports = {
  // ... configuración existente
  theme: {
    extend: {
      colors: {
        primary: designTokens.colors.primary,
        secondary: designTokens.colors.secondary,
        neutral: designTokens.colors.neutral,
        success: designTokens.colors.success,
        warning: designTokens.colors.warning,
        error: designTokens.colors.error,
      },
      borderRadius: {
        'card-sm': designTokens.borderRadius.md,
        'card': designTokens.borderRadius.lg,
        'card-lg': designTokens.borderRadius.xl,
        'button': designTokens.borderRadius.base,
        'input': designTokens.borderRadius.base,
        'modal': designTokens.borderRadius.xl,
      },
      spacing: designTokens.spacing,
      fontFamily: designTokens.typography.fontFamily,
      fontSize: designTokens.typography.fontSize,
      fontWeight: designTokens.typography.fontWeight,
      boxShadow: designTokens.shadows,
      zIndex: designTokens.zIndex,
    },
  },
};
```

### Paso 1.3: Actualizar Variables CSS

**Archivo:** `src/index.css`

Agregar al final del archivo (después de las variables existentes):

```css
/* =====================================================
   DESIGN TOKENS 2025 - Variables CSS Actualizadas
   ===================================================== */

:root {
  /* Colores Primary */
  --primary-50: #E6F3F6;
  --primary-500: #1C8FA0;
  --primary-600: #167a8a;
  
  /* Colores Neutral */
  --neutral-100: #F5F7F9;
  --neutral-900: #1a1a1a;
  --neutral-500: #6E6E73;
  
  /* Border Radius */
  --radius-card-sm: 12px;
  --radius-card: 16px;
  --radius-card-lg: 24px;
  --radius-button: 10px;
  --radius-input: 10px;
  --radius-modal: 24px;
  
  /* Z-Index */
  --z-dropdown: 1000;
  --z-sticky: 1020;
  --z-fixed: 1030;
  --z-modal-backdrop: 1040;
  --z-modal: 1050;
  --z-popover: 1060;
  --z-tooltip: 1070;
}
```

**✅ Verificación Paso 1:**
```bash
# Verificar que no hay errores de sintaxis
npm run build

# Verificar que Tailwind compila correctamente
npx tailwindcss -i ./src/index.css -o ./test-output.css --watch
```

---

## 🧩 FASE 2: COMPONENTES BASE MEJORADOS

### Paso 2.1: Mejorar Componente Button

**Archivo:** `src/components/ui/button.jsx`

**Reemplazar completamente el contenido:**

```jsx
import { cn } from '@/lib/utils';
import { Slot } from '@radix-ui/react-slot';
import { cva } from 'class-variance-authority';
import React from 'react';

const buttonVariants = cva(
  'inline-flex items-center justify-center font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-primary-500 text-white hover:bg-primary-600 shadow-sm hover:shadow-md',
        secondary: 'bg-secondary-500 text-white hover:bg-secondary-600 shadow-sm hover:shadow-md',
        destructive: 'bg-error-500 text-white hover:bg-error-600 shadow-sm hover:shadow-md',
        outline: 'border-2 border-gray-200 dark:border-white/10 bg-transparent hover:bg-gray-50 dark:hover:bg-white/5 text-neutral-900 dark:text-white',
        ghost: 'bg-transparent hover:bg-gray-50 dark:hover:bg-white/5 text-neutral-900 dark:text-white',
        link: 'text-primary-500 underline-offset-4 hover:underline bg-transparent',
      },
      size: {
        sm: 'h-9 px-4 text-sm rounded-button',
        default: 'h-11 px-6 text-base rounded-button',
        lg: 'h-14 px-8 text-lg rounded-button',
        icon: 'h-11 w-11 rounded-button',
        'cta-full': 'h-12 px-8 text-base rounded-full font-semibold', // Para CTAs principales del landing
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

const Button = React.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'button';
  return (
    <Comp
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      {...props}
    />
  );
});
Button.displayName = 'Button';

export { Button, buttonVariants };
```

**✅ Verificación Paso 2.1:**
- [ ] El componente compila sin errores
- [ ] Todas las variantes funcionan
- [ ] Los colores usan design tokens (primary-500, no #1C8FA0)

### Paso 2.2: Crear Componente Card

**Archivo:** `src/components/ui/Card.tsx` (nuevo)

```tsx
import { cn } from '@/lib/utils';
import { cva } from 'class-variance-authority';
import React from 'react';

const cardVariants = cva(
  'bg-white dark:bg-[#1a1a1a] border border-gray-100 dark:border-white/5 transition-all',
  {
    variants: {
      size: {
        sm: 'p-4 rounded-card-sm',
        default: 'p-6 rounded-card',
        lg: 'p-8 rounded-card-lg',
      },
      shadow: {
        none: '',
        sm: 'shadow-sm',
        default: 'shadow-md',
        lg: 'shadow-lg',
        xl: 'shadow-xl',
      },
      hover: {
        none: '',
        lift: 'hover:-translate-y-1 hover:shadow-lg cursor-pointer',
        scale: 'hover:scale-[1.02] cursor-pointer',
      },
    },
    defaultVariants: {
      size: 'default',
      shadow: 'default',
      hover: 'none',
    },
  }
);

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'default' | 'lg';
  shadow?: 'none' | 'sm' | 'default' | 'lg' | 'xl';
  hover?: 'none' | 'lift' | 'scale';
  children: React.ReactNode;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, size, shadow, hover, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(cardVariants({ size, shadow, hover }), className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

export default Card;
```

**✅ Verificación Paso 2.2:**
- [ ] El componente se importa correctamente
- [ ] Todas las variantes funcionan
- [ ] Se ve bien en light y dark mode

### Paso 2.3: Mejorar Componente Input

**Archivo:** `src/components/ui/input.jsx`

**Buscar y reemplazar las clases hardcodeadas:**

```jsx
// ❌ ANTES (si existe)
className="w-full h-11 px-4 rounded-xl bg-gray-50..."

// ✅ DESPUÉS
className="w-full h-11 px-4 rounded-input bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
```

**✅ Verificación Paso 2.3:**
- [ ] Inputs usan `rounded-input` (design token)
- [ ] Focus states son visibles
- [ ] Funciona en dark mode

---

## 🏠 FASE 3: MIGRACIÓN LANDING PAGE

### Paso 3.1: Migrar Header

**Archivo:** `src/components/Header.jsx`

**Cambios a realizar:**

1. **Línea 97-109: Botones Desktop**
```jsx
// ❌ ANTES
<Button
  variant="ghost"
  onClick={() => navigate('/auth')}
  className="text-[#6E6E73] hover:text-[#1C8FA0] hover:bg-transparent font-medium py-2.5 px-5"
>
  Iniciar Sesión
</Button>
<Button
  onClick={() => navigate('/auth')}
  className="bg-[#1C8FA0] hover:bg-[#167a8a] text-white rounded-full px-6 py-2.5 font-medium shadow-lg shadow-[#1C8FA0]/20 transition-all hover:shadow-[#1C8FA0]/30 hover:-translate-y-0.5"
>
  Comenzar Gratis
</Button>

// ✅ DESPUÉS
<Button
  variant="ghost"
  onClick={() => navigate('/auth')}
  className="text-neutral-500 hover:text-primary-500"
>
  Iniciar Sesión
</Button>
<Button
  variant="default"
  size="cta-full"
  onClick={() => navigate('/auth')}
  className="shadow-primary hover:-translate-y-0.5"
>
  Comenzar Gratis
</Button>
```

2. **Línea 70: Z-index del Header**
```jsx
// ❌ ANTES
className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out"

// ✅ DESPUÉS
className="fixed top-0 left-0 right-0 z-[var(--z-fixed)] transition-all duration-300 ease-in-out"
```

3. **Línea 138: Z-index del Overlay Mobile**
```jsx
// ❌ ANTES
className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden"

// ✅ DESPUÉS
className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[var(--z-modal-backdrop)] md:hidden"
```

4. **Línea 147: Z-index del Panel Mobile**
```jsx
// ❌ ANTES
className="fixed top-0 right-0 bottom-0 w-full max-w-sm bg-white z-50 shadow-2xl md:hidden overflow-y-auto"

// ✅ DESPUÉS
className="fixed top-0 right-0 bottom-0 w-full max-w-sm bg-white z-[var(--z-modal)] shadow-2xl md:hidden overflow-y-auto"
```

**✅ Verificación Paso 3.1:**
- [ ] Botones usan componente Button estándar
- [ ] Colores usan design tokens
- [ ] Z-index usa variables CSS
- [ ] Funciona en mobile y desktop
- [ ] Dark mode funciona

### Paso 3.2: Migrar Hero

**Archivo:** `src/components/Hero.jsx`

**Cambios a realizar:**

1. **Línea 102: Botón CTA**
```jsx
// ❌ ANTES
<Button
  onClick={handleCTAClick}
  className="bg-[#1C8FA0] hover:bg-[#167a8a] text-white text-base px-8 py-3.5 h-auto rounded-full shadow-xl shadow-[#1C8FA0]/20 transition-all hover:shadow-[#1C8FA0]/30 hover:-translate-y-1 font-medium"
>
  Comenzar Gratis
  <Icon component={ArrowRight} size="md" color="default" className="ml-2" />
</Button>

// ✅ DESPUÉS
<Button
  variant="default"
  size="cta-full"
  onClick={handleCTAClick}
  className="shadow-primary-lg hover:-translate-y-1"
>
  Comenzar Gratis
  <Icon component={ArrowRight} size="md" color="default" className="ml-2" />
</Button>
```

2. **Línea 123: Border Radius del Mockup**
```jsx
// ❌ ANTES
className="bg-white/90 dark:bg-[#1a1a1a]/90 backdrop-blur-xl rounded-[32px] p-6 lg:p-8..."

// ✅ DESPUÉS
className="bg-white/90 dark:bg-[#1a1a1a]/90 backdrop-blur-xl rounded-card-lg p-6 lg:p-8..."
```

3. **Línea 80: Tamaño de Título**
```jsx
// ❌ ANTES
className="text-5xl sm:text-6xl lg:text-[72px] font-bold..."

// ✅ DESPUÉS (usar sistema de tipografía)
className="text-4xl sm:text-5xl lg:text-6xl font-bold..."
```

**✅ Verificación Paso 3.2:**
- [ ] Botón usa componente estándar
- [ ] Border radius usa design token
- [ ] Título usa sistema de tipografía
- [ ] No hay desbordamientos en mobile

### Paso 3.3: Migrar Benefits

**Archivo:** `src/components/Benefits.jsx`

**Cambios a realizar:**

1. **Línea 67: Usar componente Card**
```jsx
// ❌ ANTES
<motion.div
  className="p-8 rounded-[24px] bg-white dark:bg-[#1a1a1a] border border-gray-100 dark:border-white/10 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
>

// ✅ DESPUÉS
import Card from '@/components/ui/Card';

<Card
  size="lg"
  shadow="default"
  hover="lift"
  className="..."
>
```

2. **Línea 69: Iconos - Usar sistema estándar**
```jsx
// ❌ ANTES
<div className="w-14 h-14 rounded-2xl bg-[#1C8FA0]/10 dark:bg-[#1C8FA0]/20 flex items-center justify-center mb-6">
  <Icon className="w-7 h-7 text-[#1C8FA0]" />
</div>

// ✅ DESPUÉS
<div className="w-12 h-12 rounded-card-sm bg-primary-500/10 dark:bg-primary-500/20 flex items-center justify-center mb-6">
  <Icon className="w-6 h-6 text-primary-500" />
</div>
```

**✅ Verificación Paso 3.3:**
- [ ] Usa componente Card
- [ ] Iconos siguen sistema estándar
- [ ] Colores usan design tokens

### Paso 3.4: Migrar Pricing

**Archivo:** `src/components/Pricing.jsx`

**Cambios a realizar:**

1. **Línea 89: Tarjeta Starter - Usar Card**
```jsx
// ❌ ANTES
<motion.div
  className="bg-white p-8 rounded-[32px] border-2 border-gray-100 shadow-sm hover:border-[#1C8FA0]/30 hover:shadow-[0_20px_40px_-12px_rgba(28,143,160,0.15)] transition-all duration-300 cursor-pointer group relative overflow-hidden"
>

// ✅ DESPUÉS
import Card from '@/components/ui/Card';

<Card
  size="lg"
  shadow="sm"
  hover="lift"
  className="border-2 border-gray-100 hover:border-primary-500/30 hover:shadow-primary-lg"
>
```

2. **Línea 105: Botón Starter**
```jsx
// ❌ ANTES
<Button
  variant="outline"
  className="w-full rounded-full py-3.5 border-2 border-gray-200 hover:border-[#1C8FA0] hover:bg-[#1C8FA0] hover:text-white text-[#1a1a1a] transition-all duration-300 group-hover:shadow-lg group-hover:shadow-[#1C8FA0]/20 font-medium"
>

// ✅ DESPUÉS
<Button
  variant="outline"
  size="cta-full"
  className="w-full border-2 hover:border-primary-500 hover:bg-primary-500 hover:text-white"
>
```

3. **Línea 130: Tarjeta Pro - Border Radius**
```jsx
// ❌ ANTES
className="bg-[#1a1a1a] p-10 rounded-[32px] shadow-[0_20px_40px_-12px_rgba(0,0,0,0.3)] relative transform scale-105 z-10 border-2 border-transparent hover:border-[#1C8FA0] hover:shadow-[0_30px_60px_-12px_rgba(28,143,160,0.4)] transition-all duration-300 cursor-pointer group overflow-hidden"

// ✅ DESPUÉS
className="bg-neutral-900 p-10 rounded-card-lg shadow-2xl relative transform scale-105 z-10 border-2 border-transparent hover:border-primary-500 hover:shadow-primary-lg transition-all duration-300 cursor-pointer group overflow-hidden"
```

4. **Línea 153: Botón Pro**
```jsx
// ❌ ANTES
<Button
  className="w-full bg-[#1C8FA0] hover:bg-[#167a8a] text-white rounded-full py-3.5 shadow-lg shadow-[#1C8FA0]/25 group-hover:shadow-[#1C8FA0]/40 group-hover:shadow-2xl transition-all duration-300 relative overflow-hidden font-medium"
>

// ✅ DESPUÉS
<Button
  variant="default"
  size="cta-full"
  className="w-full shadow-primary-lg group-hover:shadow-2xl"
>
```

**✅ Verificación Paso 3.4:**
- [ ] Todas las tarjetas usan componente Card
- [ ] Todos los botones usan componente Button estándar
- [ ] Colores usan design tokens
- [ ] Grid responsive funciona (agregar breakpoint md si es necesario)

### Paso 3.5: Migrar FAQ

**Archivo:** `src/components/FAQ.jsx`

**Cambios a realizar:**

1. **Línea 93: Border Radius del Acordeón**
```jsx
// ❌ ANTES
className="bg-white dark:bg-[#1a1a1a] border border-gray-100 dark:border-white/10 rounded-2xl overflow-hidden hover:border-[#1C8FA0]/30 transition-colors"

// ✅ DESPUÉS
className="bg-white dark:bg-[#1a1a1a] border border-gray-100 dark:border-white/10 rounded-card overflow-hidden hover:border-primary-500/30 transition-colors"
```

2. **Línea 74: Icono - Usar sistema estándar**
```jsx
// ❌ ANTES
<div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#1C8FA0]/10 mb-6">
  <Icon component={HelpCircle} size="xl" color="primary" />
</div>

// ✅ DESPUÉS
<div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary-500/10 mb-6">
  <Icon component={HelpCircle} size="lg" color="primary" />
</div>
```

**✅ Verificación Paso 3.5:**
- [ ] Border radius usa design token
- [ ] Iconos siguen sistema estándar

### Paso 3.6: Migrar Footer

**Archivo:** `src/components/Footer.jsx`

**Cambios a realizar:**

1. **Línea 147: Input de Newsletter**
```jsx
// ❌ ANTES
<input
  type="email"
  className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-[#0f0f11] border-none focus:ring-2 focus:ring-[#1C8FA0]/20 text-sm outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
/>

// ✅ DESPUÉS
import { Input } from '@/components/ui/input';

<Input
  type="email"
  placeholder="tu@email.com"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  required
  disabled={loading || subscribed}
/>
```

2. **Línea 152: Botón de Suscripción**
```jsx
// ❌ ANTES
<Button
  type="submit"
  className="w-full bg-[#1a1a1a] dark:bg-white hover:bg-black dark:hover:bg-gray-100 text-white dark:text-[#1a1a1a] rounded-xl py-3"
>

// ✅ DESPUÉS
<Button
  type="submit"
  variant="default"
  className="w-full bg-neutral-900 dark:bg-white hover:bg-black dark:hover:bg-gray-100 text-white dark:text-neutral-900"
>
```

**✅ Verificación Paso 3.6:**
- [ ] Input usa componente estándar
- [ ] Botón usa componente estándar
- [ ] Colores usan design tokens

---

## 🏢 FASE 4: MIGRACIÓN DASHBOARD

### Paso 4.1: Migrar DashboardHome

**Archivo:** `src/pages/dashboard/DashboardHome.jsx`

**Cambios a realizar:**

1. **Línea 60: KPICard - Usar Card**
```jsx
// ❌ ANTES
<motion.div 
  className={`bg-white dark:bg-[#1a1a1a] rounded-[22px] p-6 border border-gray-100 dark:border-white/5 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_40px_-12px_rgba(0,0,0,0.1)] hover:-translate-y-1 transition-all duration-300 cursor-pointer group relative overflow-hidden`}
>

// ✅ DESPUÉS
import Card from '@/components/ui/Card';

<Card
  size="default"
  shadow="sm"
  hover="lift"
  className="relative overflow-hidden"
>
```

2. **Línea 1224: Botones de Filtro**
```jsx
// ❌ ANTES
<button
  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
    selectedPeriod === period.toLowerCase()
      ? 'bg-[#1a1a1a] dark:bg-white text-white dark:text-black shadow-md'
      : 'bg-white dark:bg-[#1a1a1a] text-[#6E6E73] dark:text-gray-400 border border-gray-200 dark:border-white/10 hover:border-gray-300'
  }`}
>

// ✅ DESPUÉS
<Button
  variant={selectedPeriod === period.toLowerCase() ? 'default' : 'outline'}
  size="sm"
  onClick={() => setSelectedPeriod(period.toLowerCase())}
>
  {period}
</Button>
```

3. **Línea 1379: Gráficos - Border Radius**
```jsx
// ❌ ANTES
className="bg-white dark:bg-[#1a1a1a] rounded-[26px] p-6 border border-gray-100 dark:border-white/5 shadow-[0_20px_40px_-12px_rgba(0,0,0,0.08)]"

// ✅ DESPUÉS
className="bg-white dark:bg-[#1a1a1a] rounded-card-lg p-6 border border-gray-100 dark:border-white/5 shadow-lg"
```

4. **Línea 1578-1612: Balance Total - Prevenir Desbordamiento**
```jsx
// Agregar contenedor con overflow hidden
<div className="w-full overflow-hidden">
  <div 
    className="relative overflow-hidden"
    style={{
      minHeight: 'clamp(3rem, 10vw, 3.5rem)',
      lineHeight: '1.3',
      width: '100%',
    }}
  >
    {/* ... código existente ... */}
  </div>
</div>
```

**✅ Verificación Paso 4.1:**
- [ ] KPICards usan componente Card
- [ ] Botones de filtro usan componente Button
- [ ] Border radius usa design tokens
- [ ] No hay desbordamientos en mobile

### Paso 4.2: Migrar Transactions

**Archivo:** `src/pages/dashboard/Transactions.jsx`

**Cambios a realizar:**

1. **Línea 532: Modal - Border Radius y Z-index**
```jsx
// ❌ ANTES
className="relative bg-white dark:bg-[#1a1a1a] rounded-[26px] w-full max-w-md shadow-2xl border border-gray-100 dark:border-white/10 z-10 flex flex-col max-h-[calc(100vh-48px)]"

// ✅ DESPUÉS
className="relative bg-white dark:bg-[#1a1a1a] rounded-modal w-full max-w-md shadow-2xl border border-gray-100 dark:border-white/10 z-[var(--z-modal)] flex flex-col max-h-[calc(100vh-48px)]"
```

2. **Línea 584-606: Botones de Tipo**
```jsx
// ❌ ANTES
<button
  className={cn(
    "flex-1 rounded-xl font-medium text-sm transition-all min-h-[44px] sm:min-h-[48px]",
    formData.type === 'expense'
      ? "bg-[#E47B45] text-white shadow-lg shadow-[#E47B45]/20"
      : "bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-[#6E6E73] dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/10",
  )}
>

// ✅ DESPUÉS
<Button
  variant={formData.type === 'expense' ? 'secondary' : 'outline'}
  size="default"
  type="button"
  onClick={() => setFormData({ ...formData, type: 'expense' })}
  className="flex-1"
>
  Gasto
</Button>
```

3. **Línea 955: Tabla - Border Radius y Min Height**
```jsx
// ❌ ANTES
className="bg-white rounded-[20px] border border-gray-100 shadow-[0_20px_40px_-12px_rgba(0,0,0,0.08)] overflow-hidden flex-1 flex flex-col min-h-[700px]"

// ✅ DESPUÉS
className="bg-white rounded-card border border-gray-100 shadow-lg overflow-hidden flex-1 flex flex-col min-h-[400px] sm:min-h-[500px] lg:min-h-[700px]"
```

**✅ Verificación Paso 4.2:**
- [ ] Modal usa design tokens
- [ ] Botones usan componente Button
- [ ] Tabla tiene min-height responsive
- [ ] No hay desbordamientos

---

## ✅ FASE 5: TESTING Y VERIFICACIÓN

### Paso 5.1: Testing Visual

**Checklist de Verificación Visual:**

1. **Landing Page:**
   - [ ] Header: Botones consistentes, z-index correcto
   - [ ] Hero: CTA funciona, no hay desbordamientos
   - [ ] Benefits: Tarjetas consistentes, iconos alineados
   - [ ] Pricing: 3 planes con estilos consistentes
   - [ ] FAQ: Acordeón funciona, border radius consistente
   - [ ] Footer: Input y botón consistentes

2. **Dashboard:**
   - [ ] DashboardHome: KPICards consistentes, gráficos alineados
   - [ ] Transactions: Tabla responsive, modal funciona
   - [ ] Otras páginas: Estilos consistentes

### Paso 5.2: Testing Responsive

**Breakpoints a verificar:**
- [ ] Mobile: 320px, 375px, 414px
- [ ] Tablet: 768px, 1024px
- [ ] Desktop: 1280px, 1920px

**Verificaciones:**
- [ ] No hay desbordamientos horizontales
- [ ] Texto es legible en todos los tamaños
- [ ] Botones tienen área táctil adecuada (mínimo 44x44px)
- [ ] Grids se adaptan correctamente

### Paso 5.3: Testing Dark Mode

**Verificaciones:**
- [ ] Todos los componentes se ven bien en dark mode
- [ ] Contraste de texto es adecuado (WCAG AA)
- [ ] Bordes y sombras son visibles
- [ ] Colores de acento funcionan

### Paso 5.4: Testing de Accesibilidad

**Verificaciones:**
- [ ] Focus states son visibles en todos los elementos interactivos
- [ ] Contraste de colores cumple WCAG AA
- [ ] Áreas táctiles son de al menos 44x44px
- [ ] Navegación por teclado funciona

### Paso 5.5: Testing de Interacciones

**Verificaciones:**
- [ ] Hover states funcionan consistentemente
- [ ] Transiciones son suaves (200-300ms)
- [ ] Loading states son claros
- [ ] Errores se muestran correctamente

---

## 📋 CHECKLIST FINAL

### Antes de Hacer Commit:

- [ ] Todos los componentes usan design tokens
- [ ] No hay colores hardcodeados (#1C8FA0, etc.)
- [ ] Border radius usa design tokens (rounded-card, rounded-button, etc.)
- [ ] Botones usan componente Button estándar
- [ ] Tarjetas usan componente Card cuando es apropiado
- [ ] Inputs usan componente Input estándar
- [ ] Z-index usa variables CSS
- [ ] No hay desbordamientos en mobile
- [ ] No hay solapamientos de z-index
- [ ] Dark mode funciona correctamente
- [ ] Responsive funciona en todos los breakpoints
- [ ] Accesibilidad básica funciona (focus, contraste)

### Comandos de Verificación:

```bash
# Verificar que compila
npm run build

# Verificar linting
npm run lint

# Verificar tipos (si usas TypeScript)
npm run type-check

# Testing visual manual
npm run dev
# Abrir en navegador y verificar cada página
```

### Commit Final:

```bash
git add .
git commit -m "feat: estandarizar UX/UI con design tokens y componentes unificados

- Implementar sistema de design tokens centralizado
- Crear componentes Button, Card unificados
- Migrar Landing Page a usar design tokens
- Migrar Dashboard a usar design tokens
- Corregir desbordamientos y solapamientos
- Mejorar accesibilidad y responsive design
- Unificar border radius, colores, espaciado
- Documentar sistema de diseño"
```

---

## 🎯 RESULTADO ESPERADO

Al completar esta guía, deberías tener:

1. ✅ Sistema de design tokens completo y centralizado
2. ✅ Componentes base unificados (Button, Card, Input)
3. ✅ Landing Page completamente migrada
4. ✅ Dashboard completamente migrado
5. ✅ Cero colores hardcodeados
6. ✅ Border radius unificado (máximo 4 valores)
7. ✅ Z-index usando variables CSS
8. ✅ Cero desbordamientos en mobile
9. ✅ Cero solapamientos
10. ✅ Accesibilidad mejorada
11. ✅ Dark mode funcionando perfectamente
12. ✅ Responsive funcionando en todos los breakpoints

---

## 📚 RECURSOS ADICIONALES

### Archivos de Referencia:
- `REPORTE_ANALISIS_UX_UI_COMPLETO.md` - Análisis detallado
- `GUIA_COMO_PROCEDER_MEJORAS.md` - Estrategia general
- `src/theme/designTokens.js` - Design tokens
- `tailwind.config.js` - Configuración de Tailwind

### Herramientas Útiles:
- Chrome DevTools - Inspeccionar y probar responsive
- Lighthouse - Auditar accesibilidad
- BrowserStack - Testing en dispositivos reales (opcional)

---

**Versión:** 1.0  
**Última actualización:** 2025-01-27  
**Tiempo estimado total:** 6 semanas (siguiendo el orden)

---

## 🆘 TROUBLESHOOTING

### Problema: Tailwind no reconoce las clases personalizadas

**Solución:**
```bash
# Limpiar caché de Tailwind
rm -rf .next node_modules/.cache

# Reconstruir
npm run build
```

### Problema: Colores no se aplican correctamente

**Solución:**
1. Verificar que `tailwind.config.js` tiene los colores extendidos
2. Verificar que el archivo se guardó correctamente
3. Reiniciar el servidor de desarrollo

### Problema: Componentes no se importan

**Solución:**
1. Verificar que los archivos existen en la ruta correcta
2. Verificar que las extensiones son correctas (.jsx vs .tsx)
3. Verificar imports en el archivo

---

**¡Éxito con la implementación!** 🚀

