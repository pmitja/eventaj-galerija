"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

/** Section index that highlights the section currently under the sticky header. */
export function LegalToc({ label, items }: { label: string; items: { id: string; label: string }[] }) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    let frame: number | undefined;
    const update = () => {
      frame = undefined;
      let current = 0;
      items.forEach((item, index) => {
        const element = document.getElementById(item.id);
        if (element && element.getBoundingClientRect().top < 160) current = index;
      });
      setActive(current);
    };
    const onScroll = () => { if (frame === undefined) frame = requestAnimationFrame(update); };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame !== undefined) cancelAnimationFrame(frame);
    };
  }, [items]);

  return (
    <nav aria-label={label} className="flex flex-col border-l border-gm-line">
      {items.map((item, index) => (
        <a
          key={item.id}
          href={`#${item.id}`}
          aria-current={index === active ? "location" : undefined}
          className={cn(
            "-ml-px border-l-2 py-[9px] pl-4 text-[15px] transition-colors duration-200 hover:text-gm-ink!",
            index === active ? "border-gm-accent font-semibold text-gm-ink!" : "border-transparent text-gm-muted!",
          )}
        >
          {item.label}
        </a>
      ))}
    </nav>
  );
}
