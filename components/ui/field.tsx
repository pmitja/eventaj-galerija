import type { HTMLAttributes, LabelHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Field({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("grid content-start gap-[7px]", className)} {...props} />;
}

export function FieldLabel({ className, ...props }: LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className={cn("text-[14px]/[1.35] font-[750] text-plum-strong", className)} {...props} />;
}

export function FieldDescription({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("m-0 text-[12.5px]/[1.45] text-plum-muted", className)} {...props} />;
}

export function FieldError({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("m-0 text-[12.5px]/[1.4] font-[650] text-[#a10f35]", className)} {...props} />;
}

export function RequiredMark() {
  return (
    <span className="text-brand-hover" aria-hidden="true">
      {" *"}
    </span>
  );
}
