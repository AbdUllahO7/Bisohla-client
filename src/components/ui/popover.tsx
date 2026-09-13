"use client"

import * as React from "react"
import * as PopoverPrimitive from "@radix-ui/react-popover"

import { cn } from "@/lib/utils"

const Popover = PopoverPrimitive.Root

const PopoverTrigger = PopoverPrimitive.Trigger

const PopoverAnchor = PopoverPrimitive.Anchor

const PopoverContent = React.forwardRef<
  React.ElementRef<typeof PopoverPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>
>(({ className, align = "center", sideOffset = 4, onWheel, onTouchMove, ...props }, ref) => {
  const contentRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    const node = contentRef.current;
    if (!node) return;

    const stopScroll = (e: Event) => {
      e.stopPropagation();
    };

    node.addEventListener("wheel", stopScroll, { passive: true });
    node.addEventListener("touchmove", stopScroll, { passive: true });

    return () => {
      node.removeEventListener("wheel", stopScroll);
      node.removeEventListener("touchmove", stopScroll);
    };
  }, []);

  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        ref={(node) => {
          contentRef.current = node;
          if (typeof ref === "function") ref(node);
          else if (ref) (ref as any).current = node;
        }}
        align={align}
        sideOffset={sideOffset}
        onWheel={(e) => {
          e.stopPropagation();
          onWheel?.(e);
        }}
        onTouchMove={(e) => {
          e.stopPropagation();
          onTouchMove?.(e);
        }}
        className={cn(
          "z-[10000000] w-72 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none pointer-events-auto data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 overscroll-contain",
          className
        )}
        {...props}
      />
    </PopoverPrimitive.Portal>
  );
});
PopoverContent.displayName = PopoverPrimitive.Content.displayName

export { Popover, PopoverTrigger, PopoverContent, PopoverAnchor }
