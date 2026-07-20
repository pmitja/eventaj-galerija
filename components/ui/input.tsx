import * as React from "react";
import { cn } from "@/lib/utils";
import styles from "./ui.module.css";

export const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(function Input({ className, ...props }, ref) {
  return <input ref={ref} className={cn(styles.input, className)} {...props} />;
});
