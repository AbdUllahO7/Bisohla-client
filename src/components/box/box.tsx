import { cn } from '@/lib/utils';
import { cva, VariantProps } from 'class-variance-authority';
import React from 'react';

const boxVariants = cva('', {
  variants: {
    variant: {
      row: 'flex flex-row items-center gap-[8px]',
      rowBetween: 'flex flex-row justify-between items-center',
      column: 'flex flex-col items-center gap-[8px]',
      columnBetween: 'flex flex-col justify-between items-center',
      center: 'flex justify-center items-center',
      container: `
                w-full mx-auto
                sm:max-w-[100%]
                md:max-w-[768px]
                lg:max-w-[1024px]
                xl:max-w-[1280px]
                2xl:max-w-[1536px]
            `,
    },
    fitContent: {
      true: 'w-fit',
      false: '',
    },
  },
  defaultVariants: {
    variant: 'row',
    fitContent: false,
  },
});

export interface BoxProps
  extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof boxVariants> {
  as?: React.ElementType;
}

const Box = React.forwardRef<HTMLElement, BoxProps>(
  (
    { className, variant, fitContent, as: Component = 'div', ...props },
    ref,
  ) => {
    return (
      <Component
        className={cn(boxVariants({ variant, fitContent, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Box.displayName = 'Box';

export default Box;
