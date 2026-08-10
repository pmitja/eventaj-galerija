"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { storedGuestIdentitySchema, type StoredGuestIdentity } from "@/lib/validation/guest-identity";
import { useDialogTransition } from "@/lib/client/use-dialog-transition";
import { cn } from "@/lib/utils";
import { useLocale } from "@/components/i18n/locale-provider";
import { getDictionary } from "@/lib/i18n/dictionaries";
import type { Locale } from "@/lib/i18n/locale";

const focusRing = "focus-visible:outline-3 focus-visible:outline-offset-[3px] focus-visible:outline-brand";
const backdropClass =
  "fixed inset-0 z-40 grid items-end bg-[rgba(31,7,18,.58)] p-4 backdrop-blur-lg animate-[dialog-backdrop-in_.2s_ease_both] sm:items-center motion-reduce:animate-none";
const dialogClass =
  "mx-auto max-h-[calc(100dvh-32px)] w-[min(100%,520px)] overflow-y-auto rounded-[28px] border border-white/70 bg-white px-6 pt-3 pb-6 text-plum shadow-[0_24px_80px_rgba(63,13,37,.3)] animate-[dialog-sheet-in_.28s_cubic-bezier(.22,1,.36,1)_both] sm:px-8 sm:pt-[18px] sm:pb-[30px] sm:animate-[dialog-pop-in_.28s_cubic-bezier(.22,1,.36,1)_both] motion-reduce:animate-none";
const roundedAction = "min-h-[52px] w-full cursor-pointer rounded-full font-extrabold [font-family:inherit] disabled:cursor-not-allowed disabled:opacity-55";

type IdentityResponse = {
  guest: Omit<StoredGuestIdentity, "version">;
};

function storageKey(eventSlug: string) {
  return `eventaj:guest:v1:${eventSlug}`;
}

function createGuestId() {
  return `guest_${crypto.randomUUID().replaceAll("-", "")}`;
}

async function persistIdentity(
  eventSlug: string,
  identity: StoredGuestIdentity,
  locale: Locale = "sl",
): Promise<{ identity: StoredGuestIdentity } | { error: Error; suggestions: string[] }> {
  const response = await fetch(`/api/v1/events/${encodeURIComponent(eventSlug)}/guest-identity`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(identity),
  });
  const body = await response.json().catch(() => null) as (IdentityResponse & {
    title?: string;
    suggestions?: string[];
  }) | null;
  if (!response.ok) {
    const error = new Error(locale === "en" ? "Your identity cannot be saved right now." : body?.title ?? "Identitete trenutno ni mogoče shraniti.");
    return { error, suggestions: body?.suggestions ?? [] };
  }
  return { identity: { version: 1, ...body!.guest } satisfies StoredGuestIdentity };
}

export function GuestIdentityGate({
  eventSlug,
  onIdentity,
}: {
  eventSlug: string;
  onIdentity: (identity: StoredGuestIdentity) => void;
}) {
  const locale = useLocale();
  const t = getDictionary(locale).guest.identity;
  const [identity, setIdentity] = useState<StoredGuestIdentity | null>(null);
  const [open, setOpen] = useState(false);
  const { mounted: dialogMounted, closing: dialogClosing } = useDialogTransition(open);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [showOnLiveScreen, setShowOnLiveScreen] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const guestIdRef = useRef<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let active = true;
    const restore = async () => {
      let stored: StoredGuestIdentity | null = null;
      try {
        const raw = localStorage.getItem(storageKey(eventSlug));
        const parsed = storedGuestIdentitySchema.safeParse(raw ? JSON.parse(raw) : null);
        stored = parsed.success ? parsed.data : null;
      } catch {
        stored = null;
      }
      if (!stored) {
        if (active) { setLoading(false); setOpen(true); }
        return;
      }
      guestIdRef.current = stored.guestId;
      const result = await persistIdentity(eventSlug, stored, locale);
      if (!active) return;
      if ("identity" in result) {
        setIdentity(result.identity);
        onIdentity(result.identity);
        setLoading(false);
        return;
      }
      setDisplayName(stored.displayName ?? "");
      setShowOnLiveScreen(stored.showOnLiveScreen);
      setError(result.error.message);
      setSuggestions(result.suggestions);
      setLoading(false);
      setOpen(true);
    };
    void restore();
    return () => { active = false; };
  }, [eventSlug, locale, onIdentity]);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.setTimeout(() => inputRef.current?.focus(), 0);
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Tab") return;
      const focusable = dialogRef.current?.querySelectorAll<HTMLElement>(
        "button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex='-1'])",
      );
      if (!focusable?.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  async function save(nextDisplayName: string | null) {
    const candidate: StoredGuestIdentity = {
      version: 1,
      guestId: guestIdRef.current ?? createGuestId(),
      displayName: nextDisplayName,
      showOnLiveScreen: nextDisplayName === null ? false : showOnLiveScreen,
    };
    guestIdRef.current = candidate.guestId;
    setSaving(true);
    setError(null);
    setSuggestions([]);
    const result = await persistIdentity(eventSlug, candidate, locale);
    if ("error" in result) {
      setError(result.error.message);
      setSuggestions(result.suggestions);
      setSaving(false);
      return;
    }
    try {
      localStorage.setItem(storageKey(eventSlug), JSON.stringify(result.identity));
    } catch {
      setError(t.storageError);
      setSaving(false);
      return;
    }
    setIdentity(result.identity);
    onIdentity(result.identity);
    setDisplayName(result.identity.displayName ?? "");
    setShowOnLiveScreen(result.identity.showOnLiveScreen);
    setSaving(false);
    setOpen(false);
  }

  function startEditing() {
    setDisplayName(identity?.displayName ?? "");
    setShowOnLiveScreen(identity?.showOnLiveScreen ?? true);
    setError(null);
    setSuggestions([]);
    setOpen(true);
  }

  return (
    <>
      {!loading && identity ? (
        <button className={cn("flex min-h-11 cursor-pointer items-center gap-[9px] rounded-full border border-[rgba(131,24,67,.12)] bg-white/80 py-[5px] pr-2.5 pl-[5px] text-left text-plum [font-family:inherit] backdrop-blur-md", focusRing)} type="button" onClick={startEditing}>
          <span className="grid size-[34px] place-items-center overflow-hidden rounded-full bg-brand-soft" aria-hidden="true"><Image className="size-9 object-contain" src="/icons/engagement/guest.png" alt="" width={34} height={34} unoptimized /></span>
          <span className="flex flex-col text-[12px]/[1.15] font-extrabold">{identity.displayName ?? t.guest}<small className="text-[9px] font-[650] text-[#7a4059]">{t.changeDisplay}</small></span>
        </button>
      ) : null}
      {dialogMounted ? (
        <div className={cn(backdropClass, dialogClosing && "pointer-events-none animate-[dialog-backdrop-out_.2s_ease_both]")}>
          <div ref={dialogRef} className={cn(dialogClass, dialogClosing && "animate-[dialog-sheet-out_.2s_cubic-bezier(.4,0,1,1)_both] sm:animate-[dialog-pop-out_.2s_cubic-bezier(.4,0,1,1)_both]")} role="dialog" aria-modal="true" aria-labelledby="guest-identity-title" aria-describedby="guest-identity-description">
            <div className="mx-auto mb-3.5 h-1 w-[42px] rounded-[9px] bg-[#e7cfda] sm:hidden" aria-hidden="true" />
            <span className="mb-[18px] grid size-[62px] place-items-center rounded-[18px] bg-brand-soft" aria-hidden="true"><Image className="size-[62px] object-contain drop-shadow-[0_8px_12px_rgba(131,24,67,.12)]" src="/icons/engagement/guest.png" alt="" width={62} height={62} priority unoptimized /></span>
            <p className="m-0 mb-2 text-[11px] font-[850] tracking-[.12em] text-[#9d174d] uppercase">{t.eyebrow}</p>
            <h2 className="m-0 text-[clamp(28px,7vw,38px)]/[1.06] tracking-[-.045em]" id="guest-identity-title">{t.title}</h2>
            <p className="mt-3 mb-6 text-[15px]/[1.55] text-[#6f4055]" id="guest-identity-description">{t.description}</p>
            <form onSubmit={(event) => { event.preventDefault(); if (displayName.trim()) void save(displayName.trim()); }}>
              <label className="mb-[7px] block text-[13px] font-extrabold" htmlFor="guest-display-name">{t.nameLabel}</label>
              <input
                className="min-h-[54px] w-full rounded-[13px] border border-[#d9bdca] bg-[#fffafd] px-[15px] text-[16px] text-plum [font-family:inherit] focus-visible:border-brand focus-visible:outline-3 focus-visible:outline-brand/16"
                ref={inputRef}
                id="guest-display-name"
                value={displayName}
                onChange={(event) => { setDisplayName(event.target.value); setError(null); setSuggestions([]); }}
                maxLength={40}
                autoComplete="nickname"
                placeholder={t.namePlaceholder}
                aria-invalid={Boolean(error)}
                aria-describedby={error ? "guest-identity-error" : undefined}
              />
              {error ? <p id="guest-identity-error" className="mt-2 mb-0 text-[13px] font-bold text-[#a41445]" role="alert">{error}</p> : null}
              {suggestions.length ? (
                <div className="mt-3" aria-label={t.suggestionsLabel}>
                  <span className="text-[12px] text-[#6f4055]">{t.suggestionsHint}</span>
                  <div className="mt-2 flex flex-wrap gap-[7px]">{suggestions.map((suggestion) => (
                    <button className={cn("min-h-[38px] cursor-pointer rounded-full border border-[#e6c8d5] bg-[#fff5f9] px-3 text-[13px] font-[750] text-[#831843] [font-family:inherit]", focusRing)} key={suggestion} type="button" onClick={() => { setDisplayName(suggestion); setError(null); setSuggestions([]); inputRef.current?.focus(); }}>{suggestion}</button>
                  ))}</div>
                </div>
              ) : null}
              <label className="my-[18px] flex min-h-[54px] cursor-pointer items-center gap-3">
                <input className="size-5 accent-brand" type="checkbox" checked={showOnLiveScreen} onChange={(event) => setShowOnLiveScreen(event.target.checked)} />
                <span className="flex flex-col"><strong className="text-[13px]">{t.showOnScreen}</strong><small className="mt-0.5 text-[11px] text-[#7a4059]">{t.showOnScreenNote}</small></span>
              </label>
              <button className={cn(roundedAction, "border-0 bg-brand text-white shadow-[0_10px_24px_rgba(219,39,119,.2)]", focusRing)} type="submit" disabled={!displayName.trim() || saving}>
                {saving ? t.saving : t.continue}
              </button>
              <button className={cn(roundedAction, "mt-2 inline-flex items-center justify-center gap-[7px] border-0 bg-transparent text-[#831843]", focusRing)} type="button" disabled={saving} onClick={() => void save(null)}>
                <Image className="size-6 object-contain" src="/icons/engagement/anonymous-guest.png" alt="" width={24} height={24} aria-hidden="true" unoptimized />
                {t.continueAnonymous}
              </button>
            </form>
            <small className="mt-3.5 block text-center text-[10px]/[1.5] text-[#856174]">{t.privacy}</small>
          </div>
        </div>
      ) : null}
    </>
  );
}
