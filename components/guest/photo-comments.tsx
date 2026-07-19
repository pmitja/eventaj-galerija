"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import type { StoredGuestIdentity } from "@/lib/validation/guest-identity";
import styles from "./photo-comments.module.css";

type MediaComment = {
  id: string;
  guestId: string;
  displayName: string;
  body: string;
  createdAt: string;
};

async function responseMessage(response: Response, fallback: string): Promise<string> {
  const body = await response.json().catch(() => null) as { title?: string; detail?: string } | null;
  return body?.detail ?? body?.title ?? fallback;
}

function commentTime(value: string): string {
  return new Intl.DateTimeFormat("sl-SI", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

export function PhotoComments({
  eventSlug,
  publicMediaId,
  guestIdentity,
  onClose,
}: {
  eventSlug: string;
  publicMediaId: string | null;
  guestIdentity: StoredGuestIdentity;
  onClose: () => void;
}) {
  const [comments, setComments] = useState<MediaComment[]>([]);
  const [loading, setLoading] = useState(Boolean(publicMediaId));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [body, setBody] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const load = useCallback(async (signal?: AbortSignal) => {
    if (!publicMediaId) return;
    try {
      const response = await fetch(
        `/api/v1/events/${encodeURIComponent(eventSlug)}/media/${encodeURIComponent(publicMediaId)}/comments`,
        { cache: "no-store", signal },
      );
      if (!response.ok) throw new Error(await responseMessage(response, "Komentarjev ni bilo mogoče naložiti."));
      const payload = await response.json() as { comments: MediaComment[] };
      setComments(payload.comments);
    } catch (reason) {
      if (reason instanceof DOMException && reason.name === "AbortError") return;
      setError(reason instanceof Error ? reason.message : "Komentarjev ni bilo mogoče naložiti.");
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, [eventSlug, publicMediaId]);

  useEffect(() => {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => void load(controller.signal), 0);
    return () => {
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [load]);

  function retry() {
    setLoading(true);
    setError(null);
    void load();
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextBody = body.trim();
    if (!publicMediaId || !nextBody || saving) return;
    setSaving(true);
    setError(null);
    try {
      const response = await fetch(
        `/api/v1/events/${encodeURIComponent(eventSlug)}/media/${encodeURIComponent(publicMediaId)}/comments`,
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ guestId: guestIdentity.guestId, body: nextBody }),
        },
      );
      if (!response.ok) throw new Error(await responseMessage(response, "Komentarja ni bilo mogoče objaviti."));
      const payload = await response.json() as { comment: MediaComment };
      setComments((current) => [...current, payload.comment]);
      setBody("");
      inputRef.current?.focus();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Komentarja ni bilo mogoče objaviti.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className={styles.panel} aria-label="Komentarji fotografije">
      <div className={styles.handle} aria-hidden="true" />
      <header>
        <div>
          <h2>Komentarji</h2>
          <span>{comments.length} {comments.length === 1 ? "komentar" : "komentarjev"}</span>
        </div>
        <button type="button" onClick={onClose} aria-label="Zapri komentarje">×</button>
      </header>

      <div className={styles.list} aria-live="polite">
        {!publicMediaId ? (
          <div className={styles.empty}><strong>Predogledna fotografija</strong><p>Komentarji so na voljo pri objavljenih fotografijah dogodka.</p></div>
        ) : loading ? (
          <div className={styles.loading} aria-label="Nalagam komentarje"><span /><span /><span /></div>
        ) : error && comments.length === 0 ? (
          <div className={styles.empty} role="alert"><strong>Nalaganje ni uspelo</strong><p>{error}</p><button type="button" onClick={retry}>Poskusi znova</button></div>
        ) : comments.length === 0 ? (
          <div className={styles.empty}><strong>Še ni komentarjev</strong><p>Bodi prvi in dodaj nekaj lepega.</p></div>
        ) : (
          <ol>
            {comments.map((comment) => (
              <li key={comment.id}>
                <span className={styles.avatar} aria-hidden="true">{comment.displayName.slice(0, 1).toLocaleUpperCase("sl-SI")}</span>
                <div><p><strong>{comment.displayName}</strong><time dateTime={comment.createdAt}>{commentTime(comment.createdAt)}</time></p><span>{comment.body}</span></div>
              </li>
            ))}
          </ol>
        )}
      </div>

      {publicMediaId ? (
        <form onSubmit={submit}>
          <label htmlFor="photo-comment">Dodaj komentar</label>
          <div>
            <textarea
              ref={inputRef}
              id="photo-comment"
              value={body}
              onChange={(event) => { setBody(event.target.value); setError(null); }}
              placeholder={guestIdentity.displayName ? `Komentiraj kot ${guestIdentity.displayName} …` : "Dodaj komentar kot gost …"}
              maxLength={500}
              rows={1}
              disabled={saving}
            />
            <button type="submit" disabled={!body.trim() || saving} aria-label="Objavi komentar">
              {saving ? <span className={styles.spinner} /> : <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12 14-7-4.5 14-3-5.5L5 12Z" /><path d="m11.5 13.5 3-3" /></svg>}
            </button>
          </div>
          <span>{body.length}/500</span>
          {error && comments.length > 0 ? <p className={styles.formError} role="alert">{error}</p> : null}
        </form>
      ) : null}
    </section>
  );
}
