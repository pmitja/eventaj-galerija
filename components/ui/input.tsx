import * as React from "react";
import { cn } from "@/lib/utils";

const inputClass =
  "min-h-[50px] w-full rounded-xl border border-field-line bg-white px-[13px] py-[11px] text-[16px]/[1.4] text-plum [font-family:inherit] transition-[border-color,box-shadow] duration-[160ms] ease-[ease] placeholder:text-[#a78b98] hover:border-field-line-hover focus-visible:border-brand focus-visible:shadow-[0_0_0_3px_rgba(219,39,119,.16)] focus-visible:outline-0 aria-[invalid=true]:border-accent-hover aria-[invalid=true]:focus-visible:shadow-[0_0_0_3px_rgba(190,18,60,.13)] motion-reduce:transition-none";

export const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(function Input(
  { className, ...props },
  ref,
) {
  return <input ref={ref} className={cn(inputClass, className)} {...props} />;
});
