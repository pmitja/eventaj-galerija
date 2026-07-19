"use client";

import { useEffect, useRef, useState } from "react";
import type { StoredGuestIdentity } from "@/lib/validation/guest-identity";
import styles from "./face-search.module.css";

export type FaceSearchPhoto = {
  key: string;
  publicId: string;
  src: string;
  alt: string;
  commentCount: number;
  similarity: number;
};

type Phase = "idle" | "ready" | "uploading" | "searching" | "completed" | "error";

function FaceScanIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 3H5a2 2 0 0 0-2 2v3M16 3h3a2 2 0 0 1 2 2v3M8 21H5a2 2 0 0 1-2-2v-3M16 21h3a2 2 0 0 0 2-2v-3" /><circle cx="12" cy="10" r="3" /><path d="M7.5 18c.8-2.3 2.3-3.5 4.5-3.5s3.7 1.2 4.5 3.5" /></svg>;
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
  onMatches,
}: {
  eventSlug: string;
  guestIdentity: StoredGuestIdentity;
  policyVersion: string;
  onMatches: (photos: FaceSearchPhoto[] | null) => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [consent, setConsent] = useState(false);
  const [phase, setPhase] = useState<Phase>("idle");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [matchCount, setMatchCount] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => () => { if (previewUrl) URL.revokeObjectURL(previewUrl); }, [previewUrl]);

  function chooseFile(next: File | null) {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(next ? URL.createObjectURL(next) : null);
    setFile(next);
    setPhase(next ? "ready" : "idle");
    setFeedback(null);
  }

  async function withdraw(token: string | null) {
    if (!token) return;
    await fetch(`/api/v1/face-search-sessions/${encodeURIComponent(token)}`, { method: "DELETE" }).catch(() => undefined);
  }

  async function reset() {
    await withdraw(sessionToken);
    setSessionToken(null);
    chooseFile(null);
    setConsent(false);
    setMatchCount(0);
    onMatches(null);
  }

  async function poll(token: string) {
    const deadline = Date.now() + 15 * 60 * 1000;
    while (Date.now() < deadline) {
      const response = await fetch(`/api/v1/face-search-sessions/${encodeURIComponent(token)}`, { cache: "no-store" });
      const body = await response.json().catch(() => null) as {
        status?: string;
        errorCode?: string | null;
        media?: Array<{ publicId: string; imageUrl: string; filename: string; commentCount: number; similarity: number }>;
        title?: string;
      } | null;
      if (!response.ok) throw new Error(body?.title ?? "STATUS_FAILED");
      if (body?.status === "completed") {
        const photos = (body.media ?? []).map((item) => ({
          key: item.publicId,
          publicId: item.publicId,
          src: item.imageUrl,
          alt: item.filename,
          commentCount: item.commentCount,
          similarity: item.similarity,
        }));
        setMatchCount(photos.length);
        setPhase("completed");
        setFeedback(photos.length ? `Našli smo ${photos.length} ${photos.length === 1 ? "fotografijo" : "fotografij"} s tabo.` : "Ujemanj nismo našli. Poskusi z bolj jasnim selfijem.");
        onMatches(photos);
        return;
      }
      if (["failed", "expired", "withdrawn"].includes(body?.status ?? "")) {
        throw new Error(body?.errorCode ?? "SEARCH_FAILED");
      }
      await new Promise((resolve) => window.setTimeout(resolve, 2000));
    }
    throw new Error("SESSION_EXPIRED");
  }

  async function search() {
    if (!file || !consent || phase === "uploading" || phase === "searching") return;
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
      const uploadResponse = await fetch(created.uploadUrl, {
        method: "PUT",
        headers: { "content-type": file.type },
        body: file,
      });
      if (!uploadResponse.ok) throw new Error("UPLOAD_FAILED");
      const completeResponse = await fetch(`/api/v1/face-search-sessions/${encodeURIComponent(created.token)}/complete`, { method: "POST" });
      if (!completeResponse.ok) {
        const body = await completeResponse.json().catch(() => null) as { title?: string } | null;
        throw new Error(body?.title ?? "COMPLETE_FAILED");
      }
      setPhase("searching");
      setFeedback("Pregledujemo fotografije dogodka. To lahko traja nekaj trenutkov …");
      await poll(created.token);
    } catch (error) {
      const code = error instanceof Error ? error.message : null;
      setPhase("error");
      setFeedback(messageForError(code));
    }
  }

  return (
    <section className={styles.card} aria-labelledby="face-search-title">
      <div className={styles.heading}>
        <span className={styles.icon}><FaceScanIcon /></span>
        <div><p>AI Face Collection</p><h2 id="face-search-title">Poišči vse fotografije sebe</h2></div>
      </div>
      <p className={styles.description}>Dodaj jasen selfie. AI ga primerja samo s fotografijami tega dogodka, nato selfie trajno izbrišemo.</p>

      <div className={styles.controls}>
        <input
          ref={inputRef}
          className={styles.fileInput}
          id="face-selfie"
          type="file"
          accept="image/jpeg,image/png"
          capture="user"
          onChange={(event) => chooseFile(event.target.files?.[0] ?? null)}
          disabled={phase === "uploading" || phase === "searching"}
        />
        <label className={styles.selfieButton} htmlFor="face-selfie">
          {previewUrl ? <span className={styles.preview} style={{ backgroundImage: `url(${previewUrl})` }} aria-hidden="true" /> : <FaceScanIcon />}
          <span>{file ? "Zamenjaj selfie" : "Posnemi ali izberi selfie"}<small>JPEG ali PNG · največ 5 MB</small></span>
        </label>
        <label className={styles.consent}>
          <input type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} disabled={phase === "uploading" || phase === "searching"} />
          <span><strong>Soglašam z enkratnim biometričnim iskanjem</strong><small>Selfie se izbriše po iskanju ali najpozneje v 15 minutah. Rezultati niso dokaz identitete.</small></span>
        </label>
        <button className={styles.searchButton} type="button" onClick={() => void search()} disabled={!file || !consent || phase === "uploading" || phase === "searching"} aria-busy={phase === "uploading" || phase === "searching"}>
          <FaceScanIcon /> {phase === "uploading" ? "Nalaganje …" : phase === "searching" ? "Iščem tvoje fotografije …" : "Poišči moje fotografije"}
        </button>
      </div>
      {feedback ? <div className={phase === "error" ? styles.error : styles.feedback} role={phase === "error" ? "alert" : "status"} aria-live="polite">
        <span>{phase === "searching" || phase === "uploading" ? <span className={styles.spinner} aria-hidden="true" /> : null}{feedback}</span>
        {phase === "completed" || phase === "error" ? <button type="button" onClick={() => void reset()}>{matchCount ? "Prikaži vse fotografije" : "Poskusi znova"}</button> : null}
      </div> : null}
    </section>
  );
}
