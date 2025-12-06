/**
 * =====================================================
 * COMPONENTE BASE DE ICONO
 * =====================================================
 * Componente centralizado para renderizar iconos con estilo consistente.
 *
 * USO:
 *   <Icon component={LucideIcon} size="md" color="primary" />
 *   <Icon component={MuiIcon} size="lg" color="active" responsive />
 *
 * PROPS:
 *   - component: Componente de icono (Lucide React o MUI)
 *   - size: 'xs' | 'sm' | 'md' | 'lg' | 'xl' (default: 'md')
 *   - color: 'default' | 'primary' | 'active' | 'muted' | 'white' | 'dark' | 'success' | 'warning' | 'error'
 *   - responsive: boolean - Si true, usa tamaños responsive que se ajustan en móviles
 *   - className: Clases adicionales
 *   - ...props: Props adicionales para el componente de icono
 * =====================================================
 */

import React from 'react';
import { iconSizeClasses, iconSizeClassesResponsive, iconColors, defaultIconConfig } from '@/lib/iconTokens';
import { cn } from '@/lib/utils';

const Icon = ({
  component: Component,
  size = defaultIconConfig.size,
  color = defaultIconConfig.color,
  responsive = false,
  className = '',
  ...props
}) => {
  if (!Component) {
    console.warn('[Icon] No se proporcionó un componente de icono');
    return null;
  }

  // Determinar si es un icono de Lucide React o MUI
  // Lucide icons son funciones que retornan SVG, MUI icons son componentes React
  const isLucideIcon = !Component.displayName ||
                       Component.displayName.includes('Lucide') ||
                       (typeof Component === 'function' && !Component.muiName);

  // Clases de tamaño - usar responsive si está habilitado
  const sizeClasses = responsive ? iconSizeClassesResponsive : iconSizeClasses;
  const sizeClass = sizeClasses[size] || sizeClasses[defaultIconConfig.size];

  // Clases de color
  const colorClass = iconColors[color] || iconColors[defaultIconConfig.color];

  // Clases combinadas
  const combinedClassName = cn(
    sizeClass,
    colorClass,
    'transition-colors duration-200', // Transición suave
    className
  );

  // Props para Lucide React (stroke-width, etc.)
  // NO pasar 'size' a Lucide icons ya que usamos clases CSS
  const { size: _, ...restProps } = props;
  const lucideProps = isLucideIcon ? {
    strokeWidth: 1.5,
    ...restProps,
  } : props;

  // Para MUI icons, usar fontSize en lugar de className para tamaño
  // MUI icons tienen displayName que incluye 'Material' o son componentes de @mui/icons-material
  if (!isLucideIcon || Component.muiName || Component.displayName?.includes('Material')) {
    const muiSizeMap = {
      xs: 'small',
      sm: 'small',
      md: 'medium',
      lg: 'large',
      xl: 'large',
    };
    
    return (
      <Component
        fontSize={muiSizeMap[size] || 'medium'}
        className={cn(colorClass, className)}
        {...props}
      />
    );
  }

  // Renderizar icono Lucide React
  return (
    <Component
      className={combinedClassName}
      {...lucideProps}
    />
  );
};

export default Icon;

