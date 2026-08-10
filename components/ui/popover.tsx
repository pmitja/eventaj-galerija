"use client";

import * as React from "react";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import { cn } from "@/lib/utils";

export const Popover = PopoverPrimitive.Root;
export const PopoverTrigger = PopoverPrimitive.Trigger;

export const PopoverContent = React.forwardRef<
  React.ComponentRef<typeof PopoverPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>
>(function PopoverContent({ className, align = "start", sideOffset = 8, ...props }, ref) {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        ref={ref}
        align={align}
        sideOffset={sideOffset}
        className={cn(
          "z-30 w-auto max-w-[calc(100vw-24px)] animate-popover-in rounded-2xl border border-card-line bg-white p-2 shadow-[0_18px_50px_rgba(63,13,37,.18)] origin-(--radix-popover-content-transform-origin) sm:p-3 motion-reduce:animate-none",
          className,
        )}
        {...props}
      />
    </PopoverPrimitive.Portal>
  );
});
