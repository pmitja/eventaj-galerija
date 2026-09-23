"use client";

import Link from "next/link";
import { useState } from "react";
import { AI_BEST_PHOTOS_PRICE_CENTS, VIDEO_UNLIMITED_PRICE_CENTS, checkoutTotalCents, formatPrice } from "@/lib/domain/billing";
import type { Locale } from "@/lib/i18n/locale";
import type { SiteCopy } from "@/lib/i18n/site";
import { cn } from "@/lib/utils";
import { DisplayText } from "./primitives";

type AddOn = "ai" | "video";

/**
 * The price card plus the "after you pay" timeline. Add-on switches only
 * preview the total; the order page is where they are actually chosen.
 */
export function PricingSection({ locale, copy, heading, orderHref, headingLevel = "h2", id = "pricing" }: {
  locale: Locale;
  copy: SiteCopy["pricing"];
  heading: string;
  orderHref: string;
  headingLevel?: "h1" | "h2";
  id?: string;
}) {
  const [addOns, setAddOns] = useState<Record<AddOn, boolean>>({ ai: false, video: false });
  const total = formatPrice(checkoutTotalCents(addOns.ai, false, addOns.video), locale);
  const Heading = headingLevel;
  return (
    <section id={id} className={cn(
      "scroll-mt-20 px-[clamp(16px,4vw,48px)]",
      headingLevel === "h1" ? "pt-[clamp(48px,6vw,88px)] pb-[clamp(72px,9vw,120px)]" : "py-[clamp(72px,9vw,128px)]",
    )}>
      <div className="mx-auto max-w-[1180px]">
        <div data-reveal className="mx-auto mb-[clamp(40px,5vw,64px)] max-w-[720px] text-center">
          <div className="text-[12px] font-semibold tracking-[.16em] whitespace-nowrap text-gm-accent uppercase">{copy.eyebrow}</div>
          <Heading className={cn(
            "mt-3.5! font-serif leading-[1.08] font-normal tracking-[-0.02em] text-balance",
            headingLevel === "h1" ? "text-[clamp(39.4px,5.2vw,75.4px)]" : "text-[clamp(31.2px,3.9vw,52.5px)]",
          )}>
            <DisplayText value={heading} />
          </Heading>
          <p className="mx-auto! mt-4! text-[18px] leading-[1.55] text-gm-muted">{copy.text}</p>
        </div>

        <div data-reveal className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,420px),1fr))] items-stretch gap-5">
          <div className="flex flex-col gap-[26px] rounded-[28px] border border-gm-line bg-gm-paper p-[clamp(24px,3.4vw,44px)] shadow-[0_30px_60px_rgba(40,30,20,.08)]">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="text-[18px] font-semibold">{copy.packageTitle}</div>
                <div className="mt-0.5 text-[15px] text-gm-muted">{copy.packageNote}</div>
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="font-serif text-[clamp(45.9px,4.9vw,62.3px)] leading-[.9] tabular-nums">{total}</span>
                <span className="text-[15px] text-gm-muted">{copy.perEvent}</span>
              </div>
            </div>
            <ul className="m-0 grid list-none grid-cols-[repeat(auto-fit,minmax(210px,1fr))] gap-x-6 gap-y-3 border-t border-gm-sand px-0 pt-[22px] pb-0">
              {copy.included.map((item) => (
                <li key={item} className="flex gap-2.5 text-[15px] leading-[1.4]">
                  <span aria-hidden="true" className="mt-px grid size-5 flex-none place-items-center rounded-full bg-gm-blush text-[11px] font-bold text-gm-accent-dark">✓</span>
                  {item}
                </li>
              ))}
            </ul>
            <div className="flex flex-col gap-2.5">
              <div className="text-[13px] font-semibold tracking-[.12em] text-gm-muted uppercase">{copy.addOnsLabel}</div>
              {(["ai", "video"] as const).map((key) => {
                const on = addOns[key];
                const [title, sub] = copy.addOns[key];
                return (
                  <button
                    key={key}
                    type="button"
                    role="switch"
                    aria-checked={on}
                    onClick={() => setAddOns((current) => ({ ...current, [key]: !current[key] }))}
                    className={cn(
                      "flex w-full cursor-pointer items-center gap-4 rounded-2xl border px-[18px] py-4 text-left transition-[background,border-color] duration-[250ms]",
                      on ? "border-gm-accent bg-gm-blush-soft" : "border-gm-line bg-gm-bg",
                    )}
                  >
                    <span aria-hidden="true" className={cn("relative h-6 w-[42px] flex-none rounded-full transition-colors duration-[250ms]", on ? "bg-gm-accent" : "bg-[#cfc7bb]")}>
                      <span className={cn("absolute top-[3px] left-[3px] size-[18px] rounded-full bg-white shadow-[0_1px_3px_rgba(0,0,0,.2)] transition-transform duration-[250ms] ease-gm", on && "translate-x-[18px]")} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[16px] font-semibold">{title}</span>
                      <span className="text-[14px] text-gm-muted">{sub}</span>
                    </span>
                    <span className="text-[16px] font-semibold whitespace-nowrap">+{formatPrice(key === "ai" ? AI_BEST_PHOTOS_PRICE_CENTS : VIDEO_UNLIMITED_PRICE_CENTS, locale)}</span>
                  </button>
                );
              })}
            </div>
            <div className="mt-auto flex flex-col gap-3">
              <Link href={orderHref} className="flex items-center justify-between rounded-full bg-gm-accent px-[26px] py-5 text-[17px] font-semibold text-white! shadow-[0_10px_24px_rgba(168,69,58,.28)] transition-[background,transform] duration-200 hover:-translate-y-0.5 hover:bg-gm-accent-dark hover:text-white!">
                <span>{copy.cta.replace("{total}", total)}</span><span aria-hidden="true">→</span>
              </Link>
              <div className="text-center text-[13px] text-gm-muted">{copy.reassurance}</div>
            </div>
          </div>

          <div className="flex flex-col gap-7 rounded-[28px] bg-gm-ink p-[clamp(24px,3.4vw,44px)] text-gm-bg">
            <div>
              <div className="text-[12px] font-semibold tracking-[.16em] text-[#e0b3aa] uppercase">{copy.afterEyebrow}</div>
              <h3 className="mt-3! font-serif text-[clamp(24.6px,2.5vw,34.4px)] leading-[1.05] font-normal">{copy.afterHeading}</h3>
            </div>
            <ol className="relative m-0 flex list-none flex-col p-0">
              {copy.after.map(([title, text], index) => {
                const last = index === copy.after.length - 1;
                return (
                  <li key={title} className={cn("relative grid grid-cols-[40px_1fr] gap-4", !last && "pb-6")}>
                    <span className={cn(
                      "relative z-[1] grid size-10 place-items-center rounded-full font-semibold",
                      last ? "bg-gm-accent" : "border border-gm-muted bg-gm-ink",
                    )}>{index + 1}</span>
                    <span>
                      <strong className="block text-[17px] font-semibold">{title}</strong>
                      <span className="text-[15px] text-[#bdb5aa]">{text}</span>
                    </span>
                    {!last ? <span aria-hidden="true" className="absolute top-10 bottom-0 left-5 w-px bg-[#4a4540]" /> : null}
                  </li>
                );
              })}
            </ol>
            <div className="mt-auto flex items-start gap-3.5 rounded-[18px] bg-[#2a2521] p-5">
              <span aria-hidden="true" className="grid size-9 flex-none place-items-center rounded-full bg-[#3a332e] text-[15px]">🔒</span>
              <span className="text-[15px] leading-[1.5] text-[#e6e0d8]"><strong className="font-semibold text-white">{copy.privacyLead}</strong> {copy.privacyText}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
