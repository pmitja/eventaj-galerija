"use client";

import { useId, useState } from "react";
import { cn } from "@/lib/utils";

export type FaqEntry = { q: string; a: string; label?: string };

/** One-open-at-a-time accordion; the first answer starts open. */
export function FaqAccordion({ items, className, separators = "all" }: {
  items: readonly FaqEntry[];
  className?: string;
  /** "all" draws a line under every row (home); "between" skips the last one (FAQ page card). */
  separators?: "all" | "between";
}) {
  const baseId = useId();
  const [open, setOpen] = useState(0);

  return (
    <div className={className}>
      {items.map((item, index) => {
        const on = index === open;
        const last = index === items.length - 1;
        return (
          <div key={item.q} className={cn("border-b", separators === "between" && last ? "border-transparent" : "border-gm-line")}>
            <button
              type="button"
              id={`${baseId}-q-${index}`}
              aria-expanded={on}
              aria-controls={`${baseId}-a-${index}`}
              onClick={() => setOpen(on ? -1 : index)}
              className="flex w-full cursor-pointer items-center justify-between gap-5 border-0 bg-transparent px-0.5 py-[22px] text-left text-[18px] font-semibold"
            >
              <span className="flex flex-col gap-1">
                {item.label ? <span className="text-[12px] font-semibold tracking-[.1em] text-gm-accent uppercase">{item.label}</span> : null}
                <span>{item.q}</span>
              </span>
              <span
                aria-hidden="true"
                className={cn(
                  "grid size-8 flex-none place-items-center rounded-full border text-[18px] font-normal transition-[transform,background,color,border-color] duration-300",
                  on ? "rotate-45 border-gm-ink bg-gm-ink text-white" : "border-gm-line-strong bg-transparent text-gm-ink",
                )}
              >
                +
              </span>
            </button>
            <div
              id={`${baseId}-a-${index}`}
              role="region"
              aria-labelledby={`${baseId}-q-${index}`}
              className={cn("grid transition-[grid-template-rows] duration-[350ms] ease-gm", on ? "grid-rows-[1fr]" : "grid-rows-[0fr]")}
            >
              <div className="overflow-hidden">
                <p className="pr-12 pb-[22px] pl-0.5 text-[16px] leading-[1.6] text-pretty text-gm-muted">{item.a}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
