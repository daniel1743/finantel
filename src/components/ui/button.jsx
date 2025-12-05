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
