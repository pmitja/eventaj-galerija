"use client";

import { useState } from "react";
import { Icon } from "./icon";
import styles from "./admin.module.css";

export function SlideshowManager({ url, photoCount }: { url: string; photoCount: number }) {
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      setError(null);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setError("Povezave ni bilo mogoče kopirati. Označi jo v polju in jo kopiraj ročno.");
    }
  }

  return (
    <section className={styles.slideshowPanel} aria-labelledby="slideshow-title">
      <span className={styles.slideshowIcon}><Icon name="sparkles" size={22} /></span>
      <div className={styles.slideshowCopy}>
        <div><p>LIVE PROJEKCIJA</p><h2 id="slideshow-title">Slideshow za platno</h2></div>
        <p>{photoCount ? `${photoCount} fotografij je trenutno odobrenih za projekcijo.` : "Odobrene fotografije se bodo pojavile samodejno."}</p>
        <small>Ta projekcijska povezava je stalna in ostane enaka ob vsakem obisku dashboarda.</small>
        <label><span>Projekcijska povezava</span><input value={url} readOnly /></label>
        {error ? <p className={styles.slideshowError} role="alert">{error}</p> : null}
      </div>
      <div className={styles.slideshowActions}>
        <a className={styles.primaryAction} href={url} target="_blank" rel="noreferrer">Odpri projekcijo</a>
        <button type="button" className={styles.secondaryAction} onClick={() => void copyLink()}>{copied ? "Kopirano" : "Kopiraj povezavo"}</button>
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
