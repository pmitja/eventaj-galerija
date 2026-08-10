"use client";

import * as React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export const Checkbox = React.forwardRef<
  React.ComponentRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(function Checkbox({ className, ...props }, ref) {
  return (
    <CheckboxPrimitive.Root
      ref={ref}
      className={cn(
        "inline-flex size-[22px] flex-none cursor-pointer items-center justify-center rounded-md border border-[#bfa7b2] bg-white text-white transition-[background-color,border-color,box-shadow] duration-[160ms] ease-[ease] hover:border-brand focus-visible:shadow-[0_0_0_3px_rgba(219,39,119,.2)] focus-visible:outline-0 data-[state=checked]:border-brand data-[state=checked]:bg-brand motion-reduce:transition-none",
        className,
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator>
        <Check className="size-[15px]" strokeWidth={3} />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
});
