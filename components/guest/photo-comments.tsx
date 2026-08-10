"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import type { StoredGuestIdentity } from "@/lib/validation/guest-identity";
import { cn } from "@/lib/utils";
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

const panelClass =
  "absolute inset-x-0 bottom-0 z-5 flex min-h-0 w-full max-h-[min(62dvh,620px)] flex-col rounded-t-3xl bg-[#fffafc] text-[#2c1821] shadow-[0_-18px_55px_rgba(14,7,10,.32)] animate-[dialog-sheet-in_.26s_cubic-bezier(.22,1,.36,1)_both] md:static md:max-h-none md:rounded-none md:shadow-none md:animate-[dialog-panel-in_.26s_cubic-bezier(.22,1,.36,1)_both] motion-reduce:animate-none";
const closingClass =
  "animate-[dialog-sheet-out_.2s_cubic-bezier(.4,0,1,1)_both] md:animate-[dialog-panel-out_.2s_cubic-bezier(.4,0,1,1)_both] motion-reduce:animate-none";
const emptyClass = "flex min-h-[210px] flex-col items-center justify-center px-4 py-7 text-center";
const emptyTitleClass = "text-[15px]";
const emptyTextClass = "mt-1.5 mb-0 max-w-[260px] text-[13px]/[1.45] text-[#806b74]";
const focusRing = "focus-visible:outline-3 focus-visible:outline-offset-[3px] focus-visible:outline-brand";
const shimmerBar =
  "h-[52px] animate-shimmer rounded-xl bg-[linear-gradient(90deg,#f3e8ed,#fff,#f3e8ed)] bg-[length:200%_100%] motion-reduce:animate-none";

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
    <section className={cn(panelClass, closing && closingClass)} aria-label={t.panelLabel}>
      <div className="mx-auto mt-[9px] mb-[-5px] block h-1 w-[42px] flex-none rounded-[99px] bg-[#d9c5ce] md:hidden" aria-hidden="true" />
      <header className="flex min-h-[62px] items-center justify-between gap-4 border-b border-[#eadde3] px-[18px] pt-2.5 pb-3.5 md:min-h-[72px] md:py-3.5">
        <div className="flex items-baseline gap-2">
          <h2 className="m-0 text-[18px] tracking-[-.02em]">{t.title}</h2>
          <span className="text-[11px] text-[#806b74]">{pluralCount(locale, comments.length, t.commentCount)}</span>
        </div>
        <button className={cn("size-11 cursor-pointer rounded-full border-0 bg-[#f4e8ed] text-[26px]/none text-[#6f1239]", focusRing)} type="button" onClick={onClose} aria-label={t.close}>×</button>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-[18px] pt-1.5 pb-[18px]" aria-live="polite">
        {!publicMediaId ? (
          <div className={emptyClass}><strong className={emptyTitleClass}>{t.previewTitle}</strong><p className={emptyTextClass}>{t.previewText}</p></div>
        ) : loading ? (
          <div className="grid min-h-[210px] content-center gap-3" aria-label={t.loading}><span className={shimmerBar} /><span className={shimmerBar} /><span className={shimmerBar} /></div>
        ) : error && comments.length === 0 ? (
          <div className={emptyClass} role="alert"><strong className={emptyTitleClass}>{t.loadFailed}</strong><p className={emptyTextClass}>{error}</p><button className={cn("mt-[15px] min-h-11 cursor-pointer rounded-full border border-[#dfcbd4] bg-white px-4 font-[750] text-[#831843]", focusRing)} type="button" onClick={retry}>{t.tryAgain}</button></div>
        ) : comments.length === 0 ? (
          <div className={emptyClass}><strong className={emptyTitleClass}>{t.emptyTitle}</strong><p className={emptyTextClass}>{t.emptyText}</p></div>
        ) : (
          <ol className="m-0 grid list-none gap-[18px] py-3">
            {comments.map((comment) => (
              <li className="grid grid-cols-[38px_minmax(0,1fr)] gap-2.5" key={comment.id}>
                <span className="grid size-[38px] place-items-center rounded-full bg-[#f8d9e6] text-[13px] font-[850] text-[#8b1747]" aria-hidden="true">{comment.displayName.slice(0, 1).toLocaleUpperCase(intlLocale(locale))}</span>
                <div className="min-w-0"><p className="mt-px mb-1 flex items-baseline gap-[7px]"><strong className="overflow-hidden text-[13px] text-ellipsis whitespace-nowrap">{comment.displayName}</strong><time className="flex-none text-[9px] text-[#927d85]" dateTime={comment.createdAt}>{commentTime(comment.createdAt, locale)}</time></p><span className="block text-[14px]/[1.45] whitespace-pre-wrap text-[#513842] [overflow-wrap:anywhere]">{comment.body}</span></div>
              </li>
            ))}
          </ol>
        )}
      </div>

      {demoComments ? (
        <p className="m-0 border-t border-[#eadde3] bg-white px-[18px] pt-[15px] pb-[max(15px,env(safe-area-inset-bottom))] text-center text-[11px] font-bold text-[#806b74]">{t.demoNotice}</p>
      ) : publicMediaId && guestIdentity ? (
        <form className="relative border-t border-[#eadde3] bg-white px-3.5 pt-3 pb-[max(14px,env(safe-area-inset-bottom))]" onSubmit={submit}>
          <label className="sr-only" htmlFor="photo-comment">{t.addLabel}</label>
          <div className="grid grid-cols-[minmax(0,1fr)_46px] items-end gap-2">
            <textarea
              className="max-h-28 min-h-[46px] w-full resize-y rounded-[18px] border border-[#decbd3] bg-[#fffafd] px-3.5 py-3 text-[16px]/[1.35] text-[#2c1821] [font-family:inherit] focus-visible:border-brand focus-visible:outline-3 focus-visible:outline-brand/16"
              ref={inputRef}
              id="photo-comment"
              value={body}
              onChange={(event) => { setBody(event.target.value); setError(null); }}
              placeholder={guestIdentity.displayName ? t.placeholderNamed.replace("{name}", guestIdentity.displayName) : t.placeholderAnonymous}
              maxLength={500}
              rows={1}
              disabled={saving}
            />
            <button className={cn("grid size-[46px] cursor-pointer place-items-center rounded-full border-0 bg-brand text-white disabled:cursor-not-allowed disabled:opacity-45", focusRing)} type="submit" disabled={!body.trim() || saving} aria-label={t.submit}>
              {saving ? <span className="size-[18px] animate-spin rounded-full border-2 border-white/45 border-t-white motion-reduce:animate-none" /> : <svg className="w-[21px] fill-none stroke-current [stroke-linecap:round] [stroke-linejoin:round] [stroke-width:1.8]" viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12 14-7-4.5 14-3-5.5L5 12Z" /><path d="m11.5 13.5 3-3" /></svg>}
            </button>
          </div>
          <span className="mt-1 mr-[54px] block text-right text-[9px] text-[#927d85]">{body.length}/500</span>
          {error && comments.length > 0 ? <p className="mt-1.5 mr-[54px] ml-1 text-[11px]/[1.35] text-[#a41445]" role="alert">{error}</p> : null}
        </form>
      ) : null}
    </section>
  );
}
