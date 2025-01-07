import { cn } from '@/lib/utils';
import { cva, VariantProps } from 'class-variance-authority';
import React from 'react';

const textVariants = cva('', {
  variants: {
    variant: {
      h1: 'scroll-m-20 text-5xl font-pextrabold tracking-wider lg:text-7xl',
      h2: 'scroll-m-20 text-4xl font-psemibold tracking-wider lg:text-6xl first:mt-0',
      h3: 'scroll-m-20 text-3xl font-pregular tracking-wider',
      h4: 'scroll-m-20 text-2xl font-pregular tracking-wider',
      h5: 'scroll-m-20 text-xl font-pregular tracking-wider',
      title:
        'scroll-m-20  font-pbold tracking-widest text-3xl sm:text-5xl lg:text-6xl',
      p: 'leading-7',
      blockquote: 'mt-6 border-l-2 pl-6 italic',
      inlineCode:
        'relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-psemibold',
      lead: 'text-xl text-muted-foreground',
      large: 'text-lg font-psemibold',
      mid: 'text-base font-psemibold',
      small: 'text-sm font-pmedium leading-none',
      muted: 'text-sm text-muted-foreground',
      link: 'text-primary underline-offset-4 hover:underline cursor-pointer',
      'link-muted':
        'text-muted-foreground underline-offset-4 hover:underline cursor-pointer',
      'link-subtle':
        'text-foreground hover:text-primary transition-colors duration-200 cursor-pointer',
      'link-nav':
        'text-foreground hover:text-primary transition-colors duration-200 font-psemibold cursor-pointer',
      'link-button':
        'inline-flex items-center justify-center rounded-md text-sm font-pmedium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background hover:bg-accent hover:text-accent-foreground h-10 py-2 px-4 cursor-pointer',
    },
  },
  defaultVariants: {
    variant: 'mid',
  },
});

export interface TextProps
  extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof textVariants> {
  as?: React.ElementType;
}

const Text = React.forwardRef<HTMLElement, TextProps>(
  ({ className, variant = 'p', as: Component = 'p', ...props }, ref) => {
    return (
      <Component
        className={cn(textVariants({ variant, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);

Text.displayName = 'Text';

export default Text;

// export { textVariants };
