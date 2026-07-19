"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { storedGuestIdentitySchema, type StoredGuestIdentity } from "@/lib/validation/guest-identity";
import styles from "./guest-identity-gate.module.css";

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
    const error = new Error(body?.title ?? "Identitete trenutno ni mogoče shraniti.");
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
  const [identity, setIdentity] = useState<StoredGuestIdentity | null>(null);
  const [open, setOpen] = useState(false);
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
      const result = await persistIdentity(eventSlug, stored);
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
  }, [eventSlug, onIdentity]);

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
    const result = await persistIdentity(eventSlug, candidate);
    if ("error" in result) {
      setError(result.error.message);
      setSuggestions(result.suggestions);
      setSaving(false);
      return;
    }
    try {
      localStorage.setItem(storageKey(eventSlug), JSON.stringify(result.identity));
    } catch {
      setError("Brskalnik ne dovoli lokalnega shranjevanja. Omogoči ga in poskusi znova.");
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
        <button className={styles.identityButton} type="button" onClick={startEditing}>
          <span aria-hidden="true"><Image src="/icons/engagement/guest.png" alt="" width={34} height={34} unoptimized /></span>
          <span>{identity.displayName ?? "Gost"}<small>Spremeni prikaz</small></span>
        </button>
      ) : null}
      {open ? (
        <div className={styles.backdrop}>
          <div ref={dialogRef} className={styles.dialog} role="dialog" aria-modal="true" aria-labelledby="guest-identity-title" aria-describedby="guest-identity-description">
            <div className={styles.handle} aria-hidden="true" />
            <span className={styles.mark} aria-hidden="true"><Image src="/icons/engagement/guest.png" alt="" width={62} height={62} priority unoptimized /></span>
            <p className={styles.eyebrow}>Brez registracije</p>
            <h2 id="guest-identity-title">Kako naj te prikažemo?</h2>
            <p id="guest-identity-description">Ime ali vzdevek se uporablja samo pri tem dogodku. Ne potrebujemo e-pošte, telefona ali gesla.</p>
            <form onSubmit={(event) => { event.preventDefault(); if (displayName.trim()) void save(displayName.trim()); }}>
              <label htmlFor="guest-display-name">Ime ali vzdevek</label>
              <input
                ref={inputRef}
                id="guest-display-name"
                value={displayName}
                onChange={(event) => { setDisplayName(event.target.value); setError(null); setSuggestions([]); }}
                maxLength={40}
                autoComplete="nickname"
                placeholder="npr. Barbara"
                aria-invalid={Boolean(error)}
                aria-describedby={error ? "guest-identity-error" : undefined}
              />
              {error ? <p id="guest-identity-error" className={styles.error} role="alert">{error}</p> : null}
              {suggestions.length ? (
                <div className={styles.suggestions} aria-label="Predlogi prikaznega imena">
                  <span>Izberi ali vpiši svoje:</span>
                  <div>{suggestions.map((suggestion) => (
                    <button key={suggestion} type="button" onClick={() => { setDisplayName(suggestion); setError(null); setSuggestions([]); inputRef.current?.focus(); }}>{suggestion}</button>
                  ))}</div>
                </div>
              ) : null}
              <label className={styles.liveChoice}>
                <input type="checkbox" checked={showOnLiveScreen} onChange={(event) => setShowOnLiveScreen(event.target.checked)} />
                <span><strong>Prikaži moje ime na live zaslonu</strong><small>Ob dosežkih in na lestvici dogodka.</small></span>
              </label>
              <button className={styles.continueButton} type="submit" disabled={!displayName.trim() || saving}>
                {saving ? "Shranjujem …" : "Nadaljuj"}
              </button>
              <button className={styles.anonymousButton} type="button" disabled={saving} onClick={() => void save(null)}>
                <Image src="/icons/engagement/anonymous-guest.png" alt="" width={24} height={24} aria-hidden="true" unoptimized />
                Nadaljuj kot gost (anonimno)
              </button>
            </form>
            <small className={styles.privacy}>To ni uporabniški račun. Identiteta ostane shranjena le v tem brskalniku za ta dogodek.</small>
          </div>
        </div>
      ) : null}
    </>
  );
}
