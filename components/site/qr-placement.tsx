"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { DisplayText } from "./primitives";

export type PlacementItem = { image: string; title: string; description: string; alt: string };

export function QrPlacementSection({ eyebrow, heading, label, items }: { eyebrow: string; heading: string; label: string; items: readonly PlacementItem[] }) {
  const [active, setActive] = useState(0);
  return (
    <section id="placement" className="scroll-mt-20 border-y border-gm-sand bg-gm-paper px-[clamp(16px,4vw,48px)] py-[clamp(72px,9vw,128px)]">
      <div data-reveal className="mx-auto grid max-w-[1320px] grid-cols-[repeat(auto-fit,minmax(min(100%,380px),1fr))] items-center gap-[clamp(32px,5vw,80px)]">
        <div className="flex min-w-0 flex-col gap-7">
          <div>
            <div className="text-[12px] font-semibold tracking-[.16em] whitespace-nowrap text-gm-accent uppercase">{eyebrow}</div>
            <h2 className="mt-3.5! font-serif text-[clamp(31.2px,3.9vw,52.5px)] leading-[1.08] font-normal tracking-[-0.02em] text-balance">
              <DisplayText value={heading} />
            </h2>
          </div>
          <div role="tablist" aria-label={label} className="flex flex-col border-t border-gm-line">
            {items.map((item, index) => {
              const on = index === active;
              return (
                <button
                  key={item.title}
                  type="button"
                  role="tab"
                  aria-selected={on}
                  onClick={() => setActive(index)}
                  onMouseEnter={() => setActive(index)}
                  className="grid cursor-pointer grid-cols-[32px_1fr_auto] items-baseline gap-x-3 gap-y-1 border-0 border-b border-solid border-gm-line bg-transparent px-1 py-[18px] text-left"
                >
                  <span className={cn("text-[13px] font-semibold tabular-nums", on ? "text-gm-accent" : "text-gm-faint")}>0{index + 1}</span>
                  <span className={cn("text-[clamp(19px,1.7vw,23px)] font-semibold transition-colors duration-[250ms]", on ? "text-gm-ink" : "text-gm-muted")}>{item.title}</span>
                  <span aria-hidden="true" className={cn("text-gm-accent transition-[opacity,transform] duration-[250ms]", on ? "translate-x-0 opacity-100" : "-translate-x-1.5 opacity-0")}>→</span>
                  <span className={cn("col-[2/4] text-[15px] leading-[1.5] text-pretty text-gm-muted", !on && "hidden")}>{item.description}</span>
                </button>
              );
            })}
          </div>
        </div>
        <div className="relative aspect-[4/5] max-h-[680px] w-full overflow-hidden rounded-[28px] bg-gm-sand shadow-[0_30px_60px_rgba(40,30,20,.14)]">
          {items.map((item, index) => (
            <img
              key={item.image}
              src={item.image}
              alt={index === active ? item.alt : ""}
              aria-hidden={index === active ? undefined : true}
              loading="lazy"
              className={cn(
                "absolute inset-0 size-full object-cover transition-[opacity,transform] duration-[700ms,1200ms] ease-gm",
                index === active ? "scale-100 opacity-100" : "scale-[1.06] opacity-0",
              )}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
