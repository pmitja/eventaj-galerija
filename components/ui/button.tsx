import * as React from "react";
import { cn } from "@/lib/utils";
import styles from "./ui.module.css";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "icon";
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant = "default", size = "default", ...props },
  ref,
) {
  return <button ref={ref} className={cn(styles.button, variant === "outline" && styles.buttonOutline, variant === "ghost" && styles.buttonGhost, size === "icon" && styles.buttonIcon, className)} {...props} />;
});
