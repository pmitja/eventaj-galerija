import * as React from "react";
import { cn } from "@/lib/utils";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "icon";
};

const base =
  "inline-flex min-h-12 cursor-pointer items-center justify-center gap-[9px] rounded-xl border-0 bg-brand px-[18px] text-[15px] font-[750] text-white [font-family:inherit] transition-[background-color,box-shadow,opacity] duration-[180ms] ease-[ease] enabled:hover:bg-brand-hover focus-visible:outline-3 focus-visible:outline-offset-[3px] focus-visible:outline-brand/25 disabled:cursor-wait disabled:opacity-[.62] motion-reduce:transition-none";

const variants = {
  default: "",
  outline:
    "border border-field-line bg-white text-plum shadow-[0_1px_2px_rgba(63,13,37,.04)] enabled:hover:border-field-line-hover enabled:hover:bg-[#fff9fb]",
  ghost: "bg-transparent text-[#6f3951] enabled:hover:bg-brand-tint",
} as const;

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant = "default", size = "default", ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      className={cn(base, variants[variant], size === "icon" && "min-h-11 w-11 px-0", className)}
      {...props}
    />
  );
});
