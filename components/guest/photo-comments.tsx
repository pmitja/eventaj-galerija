"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import type { StoredGuestIdentity } from "@/lib/validation/guest-identity";
import styles from "./photo-comments.module.css";
import { useLocale } from "@/components/i18n/locale-provider";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { pluralCount } from "@/lib/i18n/plural";
import { intlLocale, type Locale } from "@/lib/i18n/locale";

export type MediaComment = {
  id: string;
  guestId: string;
  displayName: string;
  body: string;
  createdAt: string;
};

async function responseMessage(response: Response, fallback: string, locale: Locale = "sl"): Promise<string> {
  const body = await response.json().catch(() => null) as { title?: string; detail?: string } | null;
  return locale === "en" ? fallback : body?.detail ?? body?.title ?? fallback;
}

function commentTime(value: string, locale: Locale): string {
  return new Intl.DateTimeFormat(intlLocale(locale), { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

export function PhotoComments({
  eventSlug,
  publicMediaId,
  guestIdentity,
  onClose,
  demoComments,
  closing = false,
}: {
  eventSlug: string;
  publicMediaId: string | null;
  guestIdentity?: StoredGuestIdentity;
  onClose: () => void;
  demoComments?: readonly MediaComment[];
  /** True while the panel plays its leave animation. */
  closing?: boolean;
}) {
  const locale = useLocale();
  const t = getDictionary(locale).guest.comments;
  const [comments, setComments] = useState<MediaComment[]>(demoComments ? [...demoComments] : []);
  const [loading, setLoading] = useState(Boolean(publicMediaId) && !demoComments);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [body, setBody] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const load = useCallback(async (signal?: AbortSignal) => {
    if (!publicMediaId || demoComments) return;
    try {
      const response = await fetch(
        `/api/v1/events/${encodeURIComponent(eventSlug)}/media/${encodeURIComponent(publicMediaId)}/comments`,
        { cache: "no-store", signal },
      );
      if (!response.ok) throw new Error(await responseMessage(response, t.loadError, locale));
      const payload = await response.json() as { comments: MediaComment[] };
      setComments(payload.comments);
    } catch (reason) {
      if (reason instanceof DOMException && reason.name === "AbortError") return;
      setError(reason instanceof Error ? reason.message : t.loadError);
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, [demoComments, eventSlug, locale, publicMediaId, t]);

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
    if (!publicMediaId || !guestIdentity || demoComments || !nextBody || saving) return;
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
      if (!response.ok) throw new Error(await responseMessage(response, t.postError, locale));
      const payload = await response.json() as { comment: MediaComment };
      setComments((current) => [...current, payload.comment]);
      setBody("");
      inputRef.current?.focus();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : t.postError);
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className={`${styles.panel} ${closing ? styles.closing : ""}`} aria-label={t.panelLabel}>
      <div className={styles.handle} aria-hidden="true" />
      <header>
        <div>
          <h2>{t.title}</h2>
          <span>{pluralCount(locale, comments.length, t.commentCount)}</span>
        </div>
        <button type="button" onClick={onClose} aria-label={t.close}>×</button>
      </header>

      <div className={styles.list} aria-live="polite">
        {!publicMediaId ? (
          <div className={styles.empty}><strong>{t.previewTitle}</strong><p>{t.previewText}</p></div>
        ) : loading ? (
          <div className={styles.loading} aria-label={t.loading}><span /><span /><span /></div>
        ) : error && comments.length === 0 ? (
          <div className={styles.empty} role="alert"><strong>{t.loadFailed}</strong><p>{error}</p><button type="button" onClick={retry}>{t.tryAgain}</button></div>
        ) : comments.length === 0 ? (
          <div className={styles.empty}><strong>{t.emptyTitle}</strong><p>{t.emptyText}</p></div>
        ) : (
          <ol>
            {comments.map((comment) => (
              <li key={comment.id}>
                <span className={styles.avatar} aria-hidden="true">{comment.displayName.slice(0, 1).toLocaleUpperCase(intlLocale(locale))}</span>
                <div><p><strong>{comment.displayName}</strong><time dateTime={comment.createdAt}>{commentTime(comment.createdAt, locale)}</time></p><span>{comment.body}</span></div>
              </li>
            ))}
          </ol>
        )}
      </div>

      {demoComments ? (
        <p className={styles.demoNotice}>{t.demoNotice}</p>
      ) : publicMediaId && guestIdentity ? (
        <form onSubmit={submit}>
          <label htmlFor="photo-comment">{t.addLabel}</label>
          <div>
            <textarea
              ref={inputRef}
              id="photo-comment"
              value={body}
              onChange={(event) => { setBody(event.target.value); setError(null); }}
              placeholder={guestIdentity.displayName ? t.placeholderNamed.replace("{name}", guestIdentity.displayName) : t.placeholderAnonymous}
              maxLength={500}
              rows={1}
              disabled={saving}
            />
            <button type="submit" disabled={!body.trim() || saving} aria-label={t.submit}>
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
