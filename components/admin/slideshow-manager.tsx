"use client";

import { useState } from "react";
import { Icon } from "./icon";
import styles from "./admin.module.css";

async function readError(response: Response): Promise<string> {
  const body = await response.json().catch(() => null) as { detail?: string; title?: string } | null;
  return body?.detail ?? body?.title ?? "Dejanja ni bilo mogoče dokončati.";
}

export function SlideshowManager({ eventId, active, photoCount }: { eventId: string; active: boolean; photoCount: number }) {
  const [url, setUrl] = useState<string | null>(null);
  const [isActive, setIsActive] = useState(active);
  const [pending, setPending] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function rotate() {
    setPending(true);
    setError(null);
    const response = await fetch(`/api/v1/admin/events/${encodeURIComponent(eventId)}/slideshow`, { method: "POST" });
    if (!response.ok) {
      setError(await readError(response));
      setPending(false);
      return;
    }
    const body = await response.json() as { slideshow: { url: string } };
    setUrl(body.slideshow.url);
    setIsActive(true);
    setPending(false);
  }

  async function copyLink() {
    if (!url) return;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  return (
    <section className={styles.slideshowPanel} aria-labelledby="slideshow-title">
      <span className={styles.slideshowIcon}><Icon name="sparkles" size={22} /></span>
      <div className={styles.slideshowCopy}>
        <div><p>LIVE PROJEKCIJA</p><h2 id="slideshow-title">Slideshow za platno</h2></div>
        <p>{photoCount ? `${photoCount} fotografij je trenutno odobrenih za projekcijo.` : "Odobrene fotografije se bodo pojavile samodejno."}</p>
        {isActive && !url ? <small>Projekcija je aktivna. Zaradi varnosti obstoječega skrivnega URL-ja ni mogoče ponovno prikazati; ustvari novega.</small> : null}
        {url ? <label><span>Nova projekcijska povezava</span><input value={url} readOnly /></label> : null}
        {error ? <p className={styles.slideshowError} role="alert">{error}</p> : null}
      </div>
      <div className={styles.slideshowActions}>
        {url ? <><a className={styles.primaryAction} href={url} target="_blank" rel="noreferrer">Odpri projekcijo</a><button type="button" className={styles.secondaryAction} onClick={() => void copyLink()}>{copied ? "Kopirano" : "Kopiraj povezavo"}</button></> : null}
        <button type="button" className={url ? styles.tertiaryAction : styles.primaryAction} onClick={() => void rotate()} disabled={pending}>
          {pending ? "Ustvarjam …" : isActive ? "Ustvari novo povezavo" : "Ustvari projekcijo"}
        </button>
      </div>
    </section>
  );
}

export function SlideshowMediaToggle({ eventId, mediaId, initialState }: { eventId: string; mediaId: string; initialState: "approved" | "hidden" }) {
  const [state, setState] = useState(initialState);
  const [pending, setPending] = useState(false);

  async function toggle() {
    const nextState = state === "approved" ? "hidden" : "approved";
    setPending(true);
    const response = await fetch(`/api/v1/admin/events/${encodeURIComponent(eventId)}/slideshow/media/${encodeURIComponent(mediaId)}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ state: nextState }),
    });
    if (response.ok) setState(nextState);
    setPending(false);
  }

  return (
    <button
      type="button"
      className={`${styles.slideshowToggle} ${state === "approved" ? styles.slideshowApproved : ""}`}
      onClick={() => void toggle()}
      disabled={pending}
      aria-pressed={state === "approved"}
      aria-label={state === "approved" ? "Skrij fotografijo s projekcije" : "Odobri fotografijo za projekcijo"}
    >
      <Icon name={state === "approved" ? "check" : "sparkles"} size={14} />
      {pending ? "Shranjujem …" : state === "approved" ? "Na projekciji" : "Dodaj na projekcijo"}
    </button>
  );
}
