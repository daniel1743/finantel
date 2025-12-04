import { cn } from '@/lib/utils';
import { Slot } from '@radix-ui/react-slot';
import { cva } from 'class-variance-authority';
import React from 'react';

const buttonVariants = cva(
	'inline-flex items-center justify-center font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
	{
		variants: {
			variant: {
				default: 'bg-[#1C8FA0] text-white hover:bg-[#167a8a] shadow-sm hover:shadow-md',
				destructive:
          'bg-destructive text-destructive-foreground hover:bg-destructive/90',
				outline:
          'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
				secondary:
          'bg-secondary text-secondary-foreground hover:bg-secondary/80',
				ghost: 'hover:bg-accent hover:text-accent-foreground',
				link: 'text-primary underline-offset-4 hover:underline',
			},
			size: {
				default: 'h-[var(--control-height-base)] px-[var(--control-padding-x)] rounded-[var(--control-radius)] text-[var(--control-font-size)]',
				sm: 'h-[var(--control-height-sm)] px-[var(--control-padding-x-sm)] rounded-[var(--control-radius-sm)] text-[var(--control-font-size-sm)]',
				lg: 'h-[var(--control-height-lg)] px-[var(--control-padding-x-lg)] rounded-[var(--control-radius-lg)] text-[var(--control-font-size-lg)]',
				icon: 'h-[var(--control-height-base)] w-[var(--control-height-base)] rounded-[var(--control-radius)]',
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