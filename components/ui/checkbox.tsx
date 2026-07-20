"use client";

import * as React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import styles from "./ui.module.css";

export const Checkbox = React.forwardRef<React.ComponentRef<typeof CheckboxPrimitive.Root>, React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>>(function Checkbox({ className, ...props }, ref) {
  return <CheckboxPrimitive.Root ref={ref} className={cn(styles.checkbox, className)} {...props}>
    <CheckboxPrimitive.Indicator><Check className={styles.checkboxIndicator} strokeWidth={3} /></CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>;
});
