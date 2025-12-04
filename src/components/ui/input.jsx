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
 *   - style: Estilos en linea adicionales
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
  style,
  ...props
}, ref) => {
  const sizeClass = inputSizeClasses[size] || '';
  const hasLeftIcon = !!icon;
  const hasRightIcon = !!iconRight;

  // Padding calculado con tokens para evitar solapamiento de iconos y texto
  // Aumentado el espaciado entre icono y texto para mejor legibilidad
  const paddingWithIcon = {
    paddingLeft: hasLeftIcon
      ? `calc(var(--control-padding-x) + var(--icon-size-md) + 20px)`
      : undefined,
    paddingRight: hasRightIcon
      ? `calc(var(--control-padding-x) + var(--icon-size-md) + 20px)`
      : undefined,
  };

  return (
    <div className="relative w-full">
      {hasLeftIcon && (
        <div
          className={cn(
            'absolute top-1/2 -translate-y-1/2 z-10 pointer-events-none',
            size === 'sm' ? 'left-3' : size === 'lg' ? 'left-4' : 'left-4'
          )}
        >
          <Icon component={icon} size="xs" color="muted" />
        </div>
      )}

      <input
        type={type}
        ref={ref}
        className={cn(
          sizeClass,
          className
        )}
        style={{ ...paddingWithIcon, ...style }}
        {...props}
      />

      {hasRightIcon && (
        <div
          className={cn(
            'absolute top-1/2 -translate-y-1/2 z-10',
            size === 'sm' ? 'right-2.5' : size === 'lg' ? 'right-4' : 'right-3'
          )}
        >
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
