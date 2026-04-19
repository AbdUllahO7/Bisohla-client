import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { motion, HTMLMotionProps } from 'framer-motion';

import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground shadow ',
        destructive:
          'bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90',
        outline:
          'border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground',
        secondary:
          'bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-9 px-4 py-2',
        sm: 'h-8 rounded-md px-3 text-xs',
        lg: 'h-10 rounded-md px-8',
        icon: 'h-9 w-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

// Define motion props to include in ButtonProps
type MotionProps = {
  whileHover?: HTMLMotionProps<'button'>['whileHover'];
  whileTap?: HTMLMotionProps<'button'>['whileTap'];
  initial?: HTMLMotionProps<'button'>['initial'];
  animate?: HTMLMotionProps<'button'>['animate'];
  exit?: HTMLMotionProps<'button'>['exit'];
  transition?: HTMLMotionProps<'button'>['transition'];
  variants?: HTMLMotionProps<'button'>['variants'];
};

export interface ButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, keyof MotionProps>,
    VariantProps<typeof buttonVariants>,
    MotionProps {
  asChild?: boolean;
}

const MotionButton = motion('button');
const MotionSlot = motion(Slot);

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, whileHover, whileTap, ...props }, ref) => {
    
    // Use pre-created motion components to maintain stable references across renders
    const MotionComp = (asChild ? MotionSlot : MotionButton) as any;

    // Default micro-interactions for primary/secondary buttons
    const defaultWhileHover = (variant === 'default' || variant === 'secondary' || !variant) ? { scale: 1.02 } : undefined;
    const defaultWhileTap = (variant === 'default' || variant === 'secondary' || !variant) ? { scale: 0.98 } : undefined;

    return (
      <MotionComp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        whileHover={whileHover || defaultWhileHover}
        whileTap={whileTap || defaultWhileTap}
        {...props}
      />
    );
  },
);
Button.displayName = 'Button';

export { Button, buttonVariants };
