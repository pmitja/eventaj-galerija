import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Alert({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex items-start gap-2.5 rounded-xl border border-[#fecdd3] bg-[#fff1f2] px-3.5 py-3 text-[14px]/[1.5] text-[#9f1239]",
        className,
      )}
      {...props}
    />
  );
}

export function Separator({ className, ...props }: HTMLAttributes<HTMLHRElement>) {
  return <hr className={cn("m-0 h-px border-0 bg-[#f0e3e8]", className)} {...props} />;
}
