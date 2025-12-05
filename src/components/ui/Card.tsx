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
