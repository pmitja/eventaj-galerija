"use client";

import Link from "next/link";
import { useState } from "react";
import { AI_BEST_PHOTOS_PRICE_CENTS, EVENT_PRICE_CENTS, VIDEO_UNLIMITED_PRICE_CENTS, checkoutTotalCents, formatPrice } from "@/lib/domain/billing";
import { localePathPrefix, type Locale } from "@/lib/i18n/locale";
import { privacyPath, termsPath } from "@/lib/i18n/routes";
import { fill, getSiteCopy } from "@/lib/i18n/site";
import { minimalCheckoutSchema } from "@/lib/validation/checkout";
import { cn } from "@/lib/utils";

type AddOn = "ai" | "video";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function OrderForm({ locale, videoAddOnAvailable, cancelled }: { locale: Locale; videoAddOnAvailable: boolean; cancelled: boolean }) {
  const site = getSiteCopy(locale);
  const t = site.order;
  const [email, setEmail] = useState("");
  const [touched, setTouched] = useState(false);
  const [agree, setAgree] = useState(false);
  const [tried, setTried] = useState(false);
  const [paying, setPaying] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [addOns, setAddOns] = useState<Record<AddOn, boolean>>({ ai: false, video: false });

  const emailOk = EMAIL_PATTERN.test(email.trim());
  const emailBad = (touched || tried) && !emailOk;
  const canPay = emailOk && agree && !paying;
  const totalCents = checkoutTotalCents(addOns.ai, false, addOns.video);
  const total = formatPrice(totalCents, locale);
  const available: AddOn[] = videoAddOnAvailable ? ["ai", "video"] : ["ai"];
  const addOnPrice = (key: AddOn) => formatPrice(key === "ai" ? AI_BEST_PHOTOS_PRICE_CENTS : VIDEO_UNLIMITED_PRICE_CENTS, locale);

  async function pay() {
    if (!canPay) {
      setTried(true);
      setTouched(true);
      return;
    }
    const parsed = minimalCheckoutSchema.safeParse({
      ownerEmail: email.trim(),
      termsAccepted: agree,
      aiBestPhotos: addOns.ai,
      videoUnlimited: addOns.video,
    });
    if (!parsed.success) { setTried(true); return; }
    setPaying(true);
    setServerError(null);
    try {
      const response = await fetch(`${localePathPrefix(locale)}/api/v1/checkout`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      const body = await response.json().catch(() => null) as { checkout?: { url: string }; detail?: string; title?: string } | null;
      if (!response.ok || !body?.checkout?.url) throw new Error(body?.detail ?? body?.title ?? t.unavailable);
      window.location.assign(body.checkout.url);
    } catch (error) {
      setServerError(error instanceof Error ? error.message : t.unavailable);
      setPaying(false);
    }
  }

  const note = serverError ?? (tried && !canPay && !paying ? (!emailOk ? t.needEmail : t.needTerms) : null);

  return (
    <div className="flex flex-col gap-[22px] rounded-[26px] border border-gm-line bg-gm-paper p-[clamp(20px,3vw,32px)] shadow-[0_30px_60px_rgba(40,30,20,.08)]">
      {cancelled ? (
        <div role="status" className="rounded-2xl border border-gm-blush bg-gm-blush-soft px-4 py-3 text-[15px] leading-[1.5] text-gm-body">{t.cancelled}</div>
      ) : null}
      <label className="flex flex-col gap-2">
        <span className="text-[15px] font-semibold">{t.emailLabel}</span>
        <input
          type="email"
          name="email"
          autoComplete="email"
          inputMode="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          onBlur={() => setTouched(true)}
          onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); void pay(); } }}
          placeholder="you@example.com"
          aria-invalid={emailBad}
          aria-describedby="order-email-hint"
          className={cn(
            "w-full rounded-[14px] border-[1.5px] bg-white px-[18px] py-[17px] font-gm text-[17px] font-medium text-gm-ink outline-none transition-[border-color,box-shadow] duration-200 focus:border-gm-accent! focus:shadow-[0_0_0_4px_#f0d9d3]",
            emailBad ? "border-[#c2352a]" : emailOk ? "border-[#2f6b4f]" : "border-gm-line-strong",
          )}
        />
        <span id="order-email-hint" className={cn("text-[14px]", emailBad ? "text-[#b02a1f]" : "text-gm-muted")}>
          {emailBad ? t.emailInvalid : t.emailHint}
        </span>
      </label>

      <div className="flex flex-col gap-2.5">
        <div className="text-[13px] font-semibold tracking-[.12em] text-gm-muted uppercase">{t.addOns}</div>
        {available.map((key) => {
          const on = addOns[key];
          const [title, sub] = site.pricing.addOns[key];
          return (
            <button
              key={key}
              type="button"
              role="switch"
              aria-checked={on}
              onClick={() => setAddOns((current) => ({ ...current, [key]: !current[key] }))}
              className={cn(
                "flex w-full cursor-pointer items-center gap-4 rounded-2xl border px-4 py-[15px] text-left transition-[background,border-color] duration-[250ms]",
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
              <span className="text-[16px] font-semibold whitespace-nowrap">+{addOnPrice(key)}</span>
            </button>
          );
        })}
      </div>

      <div className="flex flex-col gap-2.5 border-t border-gm-sand pt-[18px] text-[16px]">
        <div className="flex justify-between gap-3"><span>{t.gallery}</span><span className="tabular-nums">{formatPrice(EVENT_PRICE_CENTS, locale)}</span></div>
        {available.filter((key) => addOns[key]).map((key) => (
          <div key={key} className="flex animate-[gmUp_.3s_both] justify-between gap-3 text-gm-muted">
            <span>{site.pricing.addOns[key][0]}</span><span>{addOnPrice(key)}</span>
          </div>
        ))}
        <div className="flex items-baseline justify-between gap-3 border-0 border-t border-dashed border-gm-line-strong pt-2.5">
          <span className="font-semibold">{t.total} <span className="text-[14px] font-normal text-gm-muted">{t.totalNote}</span></span>
          <span className="font-serif text-[34px] leading-none tabular-nums">{total}</span>
        </div>
      </div>

      <div className="flex items-start gap-3 text-[15px] leading-[1.5] text-gm-body">
        <button
          type="button"
          role="checkbox"
          aria-checked={agree}
          aria-labelledby="order-terms-label"
          onClick={() => setAgree((value) => !value)}
          className={cn(
            "mt-px grid size-[22px] flex-none cursor-pointer place-items-center rounded-[7px] border-[1.5px] p-0 text-[13px] font-bold text-white! transition-[background,border-color] duration-200",
            agree ? "border-gm-accent bg-gm-accent" : cn("bg-white", tried ? "border-[#c2352a]" : "border-[#bdb5aa]"),
          )}
        >
          {agree ? "✓" : ""}
        </button>
        <span id="order-terms-label" onClick={(event) => { if (!(event.target as HTMLElement).closest("a")) setAgree((value) => !value); }} className="cursor-pointer">
          {t.acceptLead}{" "}
          <Link href={termsPath(locale)} target="_blank" className="text-gm-accent! underline! underline-offset-[3px]">{t.terms}</Link>{" "}
          {t.and}{" "}
          <Link href={privacyPath(locale)} target="_blank" className="text-gm-accent! underline! underline-offset-[3px]">{t.privacy}</Link>.
        </span>
      </div>

      <button
        type="button"
        onClick={() => void pay()}
        aria-disabled={!canPay}
        className={cn(
          "flex w-full items-center justify-between gap-4 rounded-full border-0 px-[26px] py-5 text-[17px] font-semibold text-white! transition-[background,box-shadow,transform] duration-[250ms] active:scale-[.99]",
          paying ? "cursor-progress bg-gm-accent-dark" : canPay ? "cursor-pointer bg-gm-accent shadow-[0_10px_24px_rgba(168,69,58,.28)]" : "cursor-not-allowed bg-[#c9a39c]",
        )}
      >
        <span className="text-left">{paying ? t.paying : fill(t.pay, { total })}</span>
        <span aria-hidden="true" className={cn(paying && "animate-spin")}>{paying ? "◌" : "→"}</span>
      </button>
      {note ? <div role="alert" className="-mt-2 animate-[gmUp_.3s_both] text-center text-[14px] text-gm-accent-dark">{note}</div> : null}
      <div className="-mt-1.5 flex flex-wrap justify-center gap-x-[18px] gap-y-1.5 text-[13px] text-gm-muted">
        {t.notes.map((line) => <span key={line}>{line}</span>)}
      </div>
    </div>
  );
}
