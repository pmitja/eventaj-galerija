"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { DEMO_PHOTO } from "./demo-photos";
import { DisplayText } from "./primitives";

/** Full-bleed photo close with a gentle scroll parallax on the background. */
export function FinalCta({ heading, text, cta, note, href }: { heading: string; text: string; cta: string; note: string; href: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [shift, setShift] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let frame: number | undefined;
    const update = () => {
      frame = undefined;
      const rect = ref.current?.getBoundingClientRect();
      if (!rect) return;
      const offset = window.innerHeight / 2 - (rect.top + rect.height / 2);
      setShift(Math.max(-40, Math.min(40, offset * 0.06)));
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
    <section aria-label={cta} className="bg-gm-paper px-[clamp(12px,2vw,24px)] pb-[clamp(12px,2vw,24px)]">
      <div ref={ref} className="relative mx-auto flex min-h-[clamp(460px,52vw,620px)] max-w-[1400px] items-center justify-center overflow-hidden rounded-[32px] px-5 py-16 text-center">
        <img
          src={DEMO_PHOTO(5)}
          alt=""
          loading="lazy"
          style={{ transform: `scale(1.12) translateY(${shift.toFixed(1)}px)` }}
          className="absolute inset-0 size-full object-cover transition-transform duration-200 ease-linear"
        />
        <span className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(20,15,10,.5),rgba(20,15,10,.78))]" />
        <div data-reveal className="relative flex max-w-[760px] flex-col items-center gap-[22px] text-white">
          <h2 className="font-serif text-[clamp(34.4px,4.9vw,72.2px)] leading-[1.08] font-normal tracking-[-0.02em] text-balance">
            <DisplayText value={heading} />
          </h2>
          <p className="text-[18px] text-[#efe9e2]">{text}</p>
          <Link href={href} className="flex items-center gap-3.5 rounded-full bg-white px-8 py-5 text-[17px] font-semibold text-gm-ink! transition-[transform,background] duration-200 hover:-translate-y-0.5 hover:bg-gm-bg hover:text-gm-ink! max-[420px]:px-6">
            {cta} <span aria-hidden="true">→</span>
          </Link>
          <span className="text-[13px] text-gm-line-strong">{note}</span>
        </div>
      </div>
    </section>
  );
}
