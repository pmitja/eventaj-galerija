"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { Locale } from "@/lib/i18n/locale";
import { orderPath } from "@/lib/i18n/routes";
import { getSiteCopy } from "@/lib/i18n/site";
import { cn } from "@/lib/utils";

/** Scroll depth after which the phone-only order bar slides in. */
export const STICKY_BAR_THRESHOLD = 700;

export function StickyOrderBar({ locale }: { locale: Locale }) {
  const t = getSiteCopy(locale).sticky;
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let frame: number | undefined;
    const update = () => {
      frame = undefined;
      setVisible(window.scrollY > STICKY_BAR_THRESHOLD);
    };
    const onScroll = () => { if (frame === undefined) frame = requestAnimationFrame(update); };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame !== undefined) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div
      aria-hidden={!visible}
      className={cn(
        "fixed inset-x-3 bottom-3 z-[60] flex items-center gap-3 rounded-full bg-gm-ink py-2.5 pr-2.5 pl-[18px] text-gm-bg shadow-[0_14px_30px_rgba(0,0,0,.25)] transition-transform duration-[350ms] ease-gm min-[720px]:hidden",
        visible ? "translate-y-0" : "translate-y-[140%]",
      )}
    >
      <span className="flex-1 text-[14px] leading-[1.25]">
        <strong className="block font-semibold">{t.price}</strong>
        <span className="text-[#bdb5aa]">{t.note}</span>
      </span>
      <Link
        href={orderPath(locale)}
        tabIndex={visible ? undefined : -1}
        className="rounded-full bg-gm-accent px-5 py-3.5 text-[15px] font-semibold text-white! hover:text-white!"
      >
        {t.cta}
      </Link>
    </div>
  );
}
