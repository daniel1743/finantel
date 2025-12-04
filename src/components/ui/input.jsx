/**
 * =====================================================
 * COMPONENTE BASE DE INPUT
 * =====================================================
 * Componente centralizado para inputs que usa el sistema global de controles.
 * 
 * USO:
 *   <Input type="email" placeholder="Correo" />
 *   <Input type="password" size="sm" />
 *   <Input type="text" size="lg" icon={Mail} />
 * 
 * PROPS:
 *   - type: Tipo de input (text, email, password, etc.)
 *   - size: 'sm' | 'default' | 'lg' (default: 'default')
 *   - icon: Componente de icono (opcional, se posiciona a la izquierda)
 *   - iconRight: Componente de icono a la derecha (opcional)
 *   - className: Clases adicionales
 *   - ...props: Props adicionales del input nativo
 * =====================================================
 */

import React from 'react';
import { cn } from '@/lib/utils';
import Icon from '@/components/ui/Icon';

const inputSizeClasses = {
  sm: 'input-sm',
  default: '',
  lg: 'input-lg',
};

const Input = React.forwardRef(({ 
  type = 'text',
  size = 'default',
  icon,
  iconRight,
  className,
  ...props 
}, ref) => {
  const sizeClass = inputSizeClasses[size] || '';
  const hasLeftIcon = !!icon;
  const hasRightIcon = !!iconRight;

  // Calcular padding izquierdo según tamaño
  const leftPadding = hasLeftIcon 
    ? size === 'sm' ? 'pl-9' : size === 'lg' ? 'pl-12' : 'pl-10'
    : '';
  
  // Calcular padding derecho según tamaño
  const rightPadding = hasRightIcon
    ? size === 'sm' ? 'pr-9' : size === 'lg' ? 'pr-12' : 'pr-10'
    : '';

  return (
    <div className="relative w-full">
      {hasLeftIcon && (
        <div className={cn(
          "absolute top-1/2 -translate-y-1/2 z-10 pointer-events-none",
          size === 'sm' ? 'left-2.5' : size === 'lg' ? 'left-4' : 'left-3'
        )}>
          <Icon component={icon} size="xs" color="muted" />
        </div>
      )}
      
      <input
        type={type}
        ref={ref}
        className={cn(
          sizeClass,
          leftPadding,
          rightPadding,
          className
        )}
        {...props}
      />
      
      {hasRightIcon && (
        <div className={cn(
          "absolute top-1/2 -translate-y-1/2 z-10",
          size === 'sm' ? 'right-2.5' : size === 'lg' ? 'right-4' : 'right-3'
        )}>
          {typeof iconRight === 'function' ? (
            <Icon component={iconRight} size="xs" color="muted" />
          ) : (
            iconRight
          )}
        </div>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export { Input };

