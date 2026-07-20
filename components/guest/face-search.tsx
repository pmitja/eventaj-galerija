"use client";

import { useEffect, useId, useRef, useState } from "react";
import { FACE_SEARCH_MAX_FILE_BYTES } from "@/lib/domain/face-search";
import type { StoredFaceSearchResult } from "@/lib/validation/face-search";
import type { StoredGuestIdentity } from "@/lib/validation/guest-identity";
import styles from "./face-search.module.css";

type Phase = "idle" | "ready" | "uploading" | "searching" | "completed" | "error";

function FaceScanIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 3H5a2 2 0 0 0-2 2v3M16 3h3a2 2 0 0 1 2 2v3M8 21H5a2 2 0 0 1-2-2v-3M16 21h3a2 2 0 0 0 2-2v-3" /><circle cx="12" cy="10" r="3" /><path d="M7.5 18c.8-2.3 2.3-3.5 4.5-3.5s3.7 1.2 4.5 3.5" /></svg>;
}

function CloseIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" /></svg>;
}

function messageForError(code?: string | null) {
  if (code === "InvalidParameterException" || code === "INVALIDPARAMETEREXCEPTION") return "Na selfiju nismo našli dovolj jasnega obraza. Poskusi z obrazom naravnost proti kameri.";
  if (code === "FACE_INDEX_INCOMPLETE") return "Nekaterih fotografij še ni bilo mogoče pregledati. Poskusi znova čez nekaj minut.";
  if (code === "SESSION_EXPIRED") return "Iskanje je poteklo. Izberi nov selfie in poskusi znova.";
  return "Iskanja trenutno ni bilo mogoče dokončati. Selfie smo izbrisali; lahko poskusiš znova.";
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
  const inputId = useId();
  const [open, setOpen] = useState(false);
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
      setFeedback("Izberi JPEG ali PNG fotografijo, veliko največ 5 MB.");
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
          setFeedback("Ujemanj nismo našli. Poskusi z bolj jasnim selfijem.");
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

  async function search() {
    if (!file || !consent || busy) return;
    setPhase("uploading");
    setFeedback("Selfie varno nalagamo …");
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
      setFeedback("Pregledujemo fotografije dogodka. Panel lahko zapreš in medtem nadaljuješ z ogledom galerije.");
      await poll(created.token);
    } catch (error) {
      setPhase("error");
      setFeedback(messageForError(error instanceof Error ? error.message : null));
      setOpen(true);
    }
  }

  const savedAt = result ? new Intl.DateTimeFormat("sl-SI", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }).format(new Date(result.createdAt)) : null;

  return (
    <>
      <button
        ref={triggerRef}
        className={`${styles.filterButton} ${active ? styles.filterButtonActive : ""}`}
        type="button"
        onClick={() => result ? onActivate() : openSearch()}
        aria-pressed={result ? active : undefined}
        aria-busy={busy}
      >
        {busy ? <span className={styles.spinner} aria-hidden="true" /> : <FaceScanIcon />}
        {busy ? "Iščem …" : result ? `Moje fotografije · ${matchCount}` : "Poišči me"}
      </button>

      {active && result ? (
        <div className={styles.savedResult} role="status">
          <span><strong>{matchCount} {matchCount === 1 ? "najdena fotografija" : "najdenih fotografij"}</strong><small>Shranjeno samo na tej napravi · {savedAt}</small></span>
          <span className={styles.savedActions}>
            <button type="button" onClick={openSearch}>Osveži</button>
            <button type="button" onClick={() => void forget()}>Pozabi</button>
          </span>
        </div>
      ) : null}

      {open ? (
        <div className={styles.backdrop} onMouseDown={(event) => { if (event.target === event.currentTarget) closeDialog(); }}>
          <div ref={dialogRef} className={styles.dialog} role="dialog" aria-modal="true" aria-labelledby="face-search-title" aria-describedby="face-search-description">
            <div className={styles.handle} aria-hidden="true" />
            <button ref={closeRef} className={styles.closeButton} type="button" onClick={closeDialog} aria-label="Zapri iskanje po obrazu"><CloseIcon /></button>
            <div className={styles.heading}>
              <span className={styles.icon}><FaceScanIcon /></span>
              <div><p>AI iskanje</p><h2 id="face-search-title">Poišči me na fotografijah</h2></div>
            </div>
            <p id="face-search-description" className={styles.description}>Dodaj jasen selfie. Primerjamo ga samo s fotografijami tega dogodka in ga nato trajno izbrišemo.</p>

            <div className={styles.controls}>
              <input
                className={styles.fileInput}
                id={inputId}
                type="file"
                accept="image/jpeg,image/png"
                capture="user"
                onChange={(event) => chooseFile(event.target.files?.[0] ?? null)}
                disabled={busy}
              />
              <label className={styles.selfieButton} htmlFor={inputId}>
                {previewUrl ? <span className={styles.preview} style={{ backgroundImage: `url(${previewUrl})` }} aria-hidden="true" /> : <FaceScanIcon />}
                <span>{file ? "Zamenjaj selfie" : "Posnemi ali izberi selfie"}<small>JPEG ali PNG · največ 5 MB</small></span>
              </label>
              <label className={styles.consent}>
                <input type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} disabled={busy} />
                <span><strong>Soglašam z enkratnim biometričnim iskanjem</strong><small>Selfie se izbriše po iskanju ali najpozneje v 15 minutah. Lokalno shranimo le ID-je zadetkov; kadarkoli jih lahko pozabiš.</small></span>
              </label>
              <button className={styles.searchButton} type="button" onClick={() => void search()} disabled={!file || !consent || busy} aria-busy={busy}>
                <FaceScanIcon /> {phase === "uploading" ? "Nalaganje …" : phase === "searching" ? "Iščem tvoje fotografije …" : "Poišči moje fotografije"}
              </button>
            </div>
            {feedback ? <div className={phase === "error" ? styles.error : styles.feedback} role={phase === "error" ? "alert" : "status"} aria-live="polite">
              <span>{busy ? <span className={styles.spinner} aria-hidden="true" /> : null}{feedback}</span>
              {(phase === "completed" || phase === "error") && !busy ? <button type="button" onClick={() => { setFeedback(null); setPhase(file ? "ready" : "idle"); }}>Poskusi znova</button> : null}
            </div> : null}
          </div>
        </div>
      ) : null}
    </>
  );
}
