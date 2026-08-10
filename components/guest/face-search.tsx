"use client";

import { useEffect, useId, useRef, useState } from "react";
import { FACE_SEARCH_MAX_FILE_BYTES } from "@/lib/domain/face-search";
import type { StoredFaceSearchResult } from "@/lib/validation/face-search";
import type { StoredGuestIdentity } from "@/lib/validation/guest-identity";
import { useDialogTransition } from "@/lib/client/use-dialog-transition";
import { cn } from "@/lib/utils";
import { useLocale } from "@/components/i18n/locale-provider";
import { intlLocale, type Locale } from "@/lib/i18n/locale";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { pluralCount } from "@/lib/i18n/plural";

type Phase = "idle" | "ready" | "uploading" | "searching" | "completed" | "error";

const strokeIcon = "w-[21px] fill-none stroke-current [stroke-width:1.7]";
const focusRing = "focus-visible:outline-3 focus-visible:outline-offset-[3px] focus-visible:outline-[#f2a8c3]";
const spinnerClass =
  "size-[17px] flex-none animate-spin rounded-full border-2 border-current border-r-transparent motion-reduce:[animation-duration:1.4s]";
const filterButtonClass =
  "inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-full border border-[#ddcfd4] bg-white px-[15px] text-[13px] font-extrabold text-[#4b343e] [font-family:inherit] transition-[border-color,background,color] duration-[180ms] hover:border-[#bd7592] hover:bg-[#fff7fa] motion-reduce:transition-none";
const filterButtonActiveClass =
  "border-[#8d1747] bg-[#8d1747] text-white hover:border-[#6f1239] hover:bg-[#6f1239]";
const dialogClass =
  "relative max-h-[calc(100dvh-24px)] w-[min(100%,620px)] overflow-y-auto rounded-t-3xl bg-[linear-gradient(145deg,#fff_0%,#fff7fa_100%)] px-5 pt-[18px] pb-[max(24px,env(safe-area-inset-bottom))] text-[#3f1728] shadow-[0_-18px_54px_rgba(39,14,24,.2)] animate-[dialog-sheet-in_.28s_cubic-bezier(.22,1,.36,1)_both] sm:rounded-3xl sm:px-7 sm:pt-[26px] sm:pb-7 sm:animate-[dialog-pop-in_.28s_cubic-bezier(.22,1,.36,1)_both] motion-reduce:animate-none";
const noticeClass =
  "mt-3.5 flex items-center justify-between gap-3 rounded-[13px] px-[13px] py-3 text-[12px]/[1.45] font-bold";
const savedActionClass =
  "min-h-11 flex-1 cursor-pointer border-0 bg-transparent px-2.5 text-[12px] font-[850] text-[#8d1747] [font-family:inherit] min-[421px]:flex-none";
const noticeActionClass =
  "min-h-11 flex-none cursor-pointer border-0 bg-transparent font-[850] text-inherit underline underline-offset-[3px] [font-family:inherit]";

function FaceScanIcon() {
  return <svg className={strokeIcon} viewBox="0 0 24 24" aria-hidden="true"><path d="M8 3H5a2 2 0 0 0-2 2v3M16 3h3a2 2 0 0 1 2 2v3M8 21H5a2 2 0 0 1-2-2v-3M16 21h3a2 2 0 0 0 2-2v-3" /><circle cx="12" cy="10" r="3" /><path d="M7.5 18c.8-2.3 2.3-3.5 4.5-3.5s3.7 1.2 4.5 3.5" /></svg>;
}

function CloseIcon() {
  return <svg className={strokeIcon} viewBox="0 0 24 24" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" /></svg>;
}

function messageForError(code: string | null | undefined, locale: Locale) {
  const t = getDictionary(locale).guest.faceSearch;
  if (code === "InvalidParameterException" || code === "INVALIDPARAMETEREXCEPTION") return t.noClearFace;
  if (code === "FACE_INDEX_INCOMPLETE") return t.indexIncomplete;
  if (code === "SESSION_EXPIRED") return t.sessionExpired;
  return t.genericError;
}

export function FaceSearch({
  eventSlug,
  guestIdentity,
  policyVersion,
  result,
  matchCount,
  active,
  onActivate,
  onMatches,
  onForget,
}: {
  eventSlug: string;
  guestIdentity: StoredGuestIdentity;
  policyVersion: string;
  result: StoredFaceSearchResult | null;
  matchCount: number;
  active: boolean;
  onActivate: () => void;
  onMatches: (mediaIds: string[]) => void;
  onForget: () => void;
}) {
  const locale = useLocale();
  const t = getDictionary(locale).guest.faceSearch;
  const inputId = useId();
  const [open, setOpen] = useState(false);
  const { mounted: dialogMounted, closing: dialogClosing } = useDialogTransition(open);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [consent, setConsent] = useState(false);
  const [phase, setPhase] = useState<Phase>("idle");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const busy = phase === "uploading" || phase === "searching";

  useEffect(() => () => { if (previewUrl) URL.revokeObjectURL(previewUrl); }, [previewUrl]);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.setTimeout(() => closeRef.current?.focus(), 0);
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        window.setTimeout(() => triggerRef.current?.focus(), 0);
        return;
      }
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

  function closeDialog() {
    setOpen(false);
    window.setTimeout(() => triggerRef.current?.focus(), 0);
  }

  function openSearch() {
    if (!busy) setFeedback(null);
    setOpen(true);
  }

  function chooseFile(next: File | null) {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setFile(null);
    setFeedback(null);
    if (!next) {
      setPhase("idle");
      return;
    }
    if (!["image/jpeg", "image/png"].includes(next.type) || next.size > FACE_SEARCH_MAX_FILE_BYTES) {
      setPhase("error");
      setFeedback(t.fileRules);
      return;
    }
    setPreviewUrl(URL.createObjectURL(next));
    setFile(next);
    setPhase("ready");
  }

  async function withdraw(token: string | null) {
    if (!token) return;
    await fetch(`/api/v1/face-search-sessions/${encodeURIComponent(token)}`, { method: "DELETE" }).catch(() => undefined);
  }

  async function forget() {
    await withdraw(sessionToken);
    setSessionToken(null);
    setConsent(false);
    chooseFile(null);
    onForget();
  }

  async function poll(token: string) {
    const deadline = Date.now() + 15 * 60 * 1000;
    while (Date.now() < deadline) {
      const response = await fetch(`/api/v1/face-search-sessions/${encodeURIComponent(token)}`, { cache: "no-store" });
      const body = await response.json().catch(() => null) as {
        status?: string;
        errorCode?: string | null;
        media?: Array<{ publicId: string }>;
        title?: string;
      } | null;
      if (!response.ok) throw new Error(body?.title ?? "STATUS_FAILED");
      if (body?.status === "completed") {
        const mediaIds = [...new Set((body.media ?? []).map((item) => item.publicId))];
        setPhase("completed");
        if (!mediaIds.length) {
          setFeedback(t.noMatches);
          return;
        }
        onMatches(mediaIds);
        setConsent(false);
        chooseFile(null);
        closeDialog();
        return;
      }
      if (["failed", "expired", "withdrawn"].includes(body?.status ?? "")) throw new Error(body?.errorCode ?? "SEARCH_FAILED");
      await new Promise((resolve) => window.setTimeout(resolve, 2000));
    }
    throw new Error("SESSION_EXPIRED");
  }

  async function reSearch() {
    if (busy) return;
    setPhase("searching");
    setFeedback(null);
    try {
      const response = await fetch(`/api/v1/events/${encodeURIComponent(eventSlug)}/face-search-sessions/re-search`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ guestId: guestIdentity.guestId, policyVersion }),
      });
      const body = await response.json().catch(() => null) as { token?: string; code?: string; title?: string } | null;
      if (response.status === 409 && body?.code === "FACE_PROBE_MISSING") {
        setPhase("idle");
        openSearch();
        return;
      }
      if (!response.ok || !body?.token) throw new Error(body?.title ?? "RE_SEARCH_FAILED");
      setSessionToken(body.token);
      await poll(body.token);
    } catch (error) {
      setPhase("error");
      setFeedback(messageForError(error instanceof Error ? error.message : null, locale));
      setOpen(true);
    }
  }

  async function search() {
    if (!file || !consent || busy) return;
    setPhase("uploading");
    setFeedback(t.uploadingSelfie);
    try {
      const createResponse = await fetch(`/api/v1/events/${encodeURIComponent(eventSlug)}/face-search-sessions`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          guestId: guestIdentity.guestId,
          filename: file.name || "selfie.jpg",
          mime: file.type,
          sizeBytes: file.size,
          consent: true,
          policyVersion,
        }),
      });
      const created = await createResponse.json().catch(() => null) as { token?: string; uploadUrl?: string; title?: string } | null;
      if (!createResponse.ok || !created?.token || !created.uploadUrl) throw new Error(created?.title ?? "CREATE_FAILED");
      setSessionToken(created.token);
      const uploadResponse = await fetch(created.uploadUrl, { method: "PUT", headers: { "content-type": file.type }, body: file });
      if (!uploadResponse.ok) throw new Error("UPLOAD_FAILED");
      const completeResponse = await fetch(`/api/v1/face-search-sessions/${encodeURIComponent(created.token)}/complete`, { method: "POST" });
      if (!completeResponse.ok) {
        const body = await completeResponse.json().catch(() => null) as { title?: string } | null;
        throw new Error(body?.title ?? "COMPLETE_FAILED");
      }
      setPhase("searching");
      setFeedback(t.checkingPhotos);
      await poll(created.token);
    } catch (error) {
      setPhase("error");
      setFeedback(messageForError(error instanceof Error ? error.message : null, locale));
      setOpen(true);
    }
  }

  const savedAt = result ? new Intl.DateTimeFormat(intlLocale(locale), { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }).format(new Date(result.createdAt)) : null;

  return (
    <>
      <button
        ref={triggerRef}
        className={cn(filterButtonClass, active && filterButtonActiveClass, focusRing)}
        type="button"
        onClick={() => result ? onActivate() : openSearch()}
        aria-pressed={result ? active : undefined}
        aria-busy={busy}
      >
        {busy ? <span className={spinnerClass} aria-hidden="true" /> : <FaceScanIcon />}
        {busy ? t.searching : result ? `${t.myPhotos} · ${matchCount}` : t.findMe}
      </button>

      {active && result ? (
        <div className="flex basis-full flex-col items-start justify-between gap-3.5 rounded-[14px] border border-[#efd3df] bg-[#fff7fa] px-3.5 py-3 text-[#4b2636] min-[421px]:flex-row min-[421px]:items-center" role="status">
          <span className="flex min-w-0 flex-col gap-0.5"><strong className="text-[13px]">{pluralCount(locale, matchCount, t.foundCount)}</strong><small className="text-[11px]/[1.4] text-[#7d6670]">{t.storedOnDevice} · {savedAt}</small></span>
          <span className="flex w-full flex-none gap-1 min-[421px]:w-auto">
            <button className={cn(savedActionClass, focusRing)} type="button" onClick={() => void reSearch()} disabled={busy}>{t.refresh}</button>
            <button className={cn(savedActionClass, focusRing)} type="button" onClick={() => void forget()} disabled={busy}>{t.forget}</button>
          </span>
        </div>
      ) : null}

      {dialogMounted ? (
        <div className={cn("fixed inset-0 z-40 flex items-end justify-center bg-[rgba(31,16,22,.52)] pt-6 backdrop-blur-[5px] animate-[dialog-backdrop-in_.2s_ease_both] sm:items-center sm:p-6 motion-reduce:animate-none", dialogClosing && "pointer-events-none animate-[dialog-backdrop-out_.2s_ease_both]")} onMouseDown={(event) => { if (event.target === event.currentTarget) closeDialog(); }}>
          <div ref={dialogRef} className={cn(dialogClass, dialogClosing && "animate-[dialog-sheet-out_.2s_cubic-bezier(.4,0,1,1)_both] sm:animate-[dialog-pop-out_.2s_cubic-bezier(.4,0,1,1)_both]")} role="dialog" aria-modal="true" aria-labelledby="face-search-title" aria-describedby="face-search-description">
            <div className="mx-auto mt-[-3px] mb-[13px] h-1 w-10 rounded-full bg-[#d8c7ce] sm:hidden" aria-hidden="true" />
            <button ref={closeRef} className={cn("absolute top-[13px] right-3.5 grid size-11 cursor-pointer place-items-center rounded-full border-0 bg-transparent text-[#5f4651] hover:bg-[#f5e9ee]", focusRing)} type="button" onClick={closeDialog} aria-label={t.close}><CloseIcon /></button>
            <div className="flex items-center gap-3 pr-12">
              <span className="grid size-[46px] flex-none place-items-center rounded-[14px] bg-brand-soft text-[#9f1d52]"><FaceScanIcon /></span>
              <div><p className="m-0 mb-[3px] text-[10px] font-[850] tracking-[.12em] text-[#9f1d52] uppercase">{t.eyebrow}</p><h2 className="m-0 text-[clamp(21px,5vw,27px)]/[1.08] tracking-[-.035em]" id="face-search-title">{t.title}</h2></div>
            </div>
            <p id="face-search-description" className="my-[15px] mb-5 max-w-[540px] text-[14px]/[1.55] text-[#70505e]">{t.description}</p>

            <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
              <input
                className="peer absolute h-px w-px overflow-hidden whitespace-nowrap [clip:rect(0_0_0_0)]"
                id={inputId}
                type="file"
                accept="image/jpeg,image/png"
                capture="user"
                onChange={(event) => chooseFile(event.target.files?.[0] ?? null)}
                disabled={busy}
              />
              <label className="flex min-h-16 cursor-pointer items-center gap-3 rounded-[15px] border border-dashed border-[#d9a9bd] bg-white px-3 py-2 text-[#7e2048] transition-[border-color,background] duration-[180ms] hover:border-[#9f1d52] hover:bg-[#fffafd] peer-focus-visible:outline-3 peer-focus-visible:outline-offset-[3px] peer-focus-visible:outline-[#f2a8c3] motion-reduce:transition-none" htmlFor={inputId}>
                {previewUrl ? <span className="size-12 flex-none rounded-xl bg-cover bg-center" style={{ backgroundImage: `url(${previewUrl})` }} aria-hidden="true" /> : <FaceScanIcon />}
                <span className="flex flex-col text-[14px] font-extrabold">{file ? t.changeSelfie : t.chooseSelfie}<small className="mt-[3px] text-[11px] font-semibold text-[#806473]">JPEG or PNG · {t.upTo} 5 MB</small></span>
              </label>
              <label className="flex min-h-[58px] cursor-pointer items-start gap-[11px] rounded-[14px] bg-[#f9eff4] px-3 py-[11px] has-[input:focus-visible]:outline-3 has-[input:focus-visible]:outline-offset-[3px] has-[input:focus-visible]:outline-[#f2a8c3] sm:col-span-full">
                <input className="mt-px size-5 flex-none accent-[#9f1d52]" type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} disabled={busy} />
                <span className="flex flex-col"><strong className="text-[12px]/[1.4]">{t.consentLabel}</strong><small className="mt-[3px] text-[10px]/[1.45] text-[#725464]">{t.consentNote}</small></span>
              </label>
              <button className={cn("inline-flex min-h-[52px] cursor-pointer items-center justify-center gap-[9px] rounded-[14px] border-0 bg-[#8d1747] text-[14px] font-[850] text-white shadow-[0_10px_24px_rgba(141,23,71,.18)] [font-family:inherit] transition-[background,opacity] duration-[180ms] enabled:hover:bg-[#6f1239] disabled:cursor-not-allowed disabled:opacity-50 sm:col-span-full motion-reduce:transition-none", focusRing)} type="button" onClick={() => void search()} disabled={!file || !consent || busy} aria-busy={busy}>
                <FaceScanIcon /> {phase === "uploading" ? t.uploading : phase === "searching" ? t.searchingPhotos : t.findMyPhotos}
              </button>
            </div>
            {feedback ? <div className={cn(noticeClass, phase === "error" ? "bg-[#fff0f3] text-[#8a2045]" : "bg-[#edf8f1] text-[#255a3c]")} role={phase === "error" ? "alert" : "status"} aria-live="polite">
              <span className="flex items-center gap-2">{busy ? <span className={spinnerClass} aria-hidden="true" /> : null}{feedback}</span>
              {(phase === "completed" || phase === "error") && !busy ? <button className={cn(noticeActionClass, focusRing)} type="button" onClick={() => { setFeedback(null); setPhase(file ? "ready" : "idle"); }}>{t.tryAgain}</button> : null}
            </div> : null}
          </div>
        </div>
      ) : null}
    </>
  );
}
