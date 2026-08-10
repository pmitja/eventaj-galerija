"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { nextSlideshowIndex, SLIDESHOW_FRAME_INTERVAL_MS } from "@/lib/domain/slideshow";
import { subscribeToSlideshowUpdates } from "@/lib/client/slideshow-updates";
import { overlaysForNewEvents, type LiveOverlay } from "@/lib/domain/live-engagement";
import {
  LIVE_COMMENT_DURATION_MS,
  MAX_VISIBLE_LIVE_COMMENTS,
  type LiveMediaComment,
} from "@/lib/domain/media-comments";
import type { EngagementSnapshot } from "@/lib/repositories/engagement";
import { cn } from "@/lib/utils";
import { useLocale } from "@/components/i18n/locale-provider";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { localizedMarketingPath } from "@/lib/i18n/routes";
import { brandWordParts, guestBrandMark } from "@/lib/seo";

export type SlideshowSlide = {
  publicId: string;
  filename: string;
  imageUrl: string;
  comments: LiveMediaComment[];
};

type SlideshowDisplayProps = {
  token?: string;
  initialEventName: string;
  initialSlides?: SlideshowSlide[];
  backHref?: string;
};

const engagementIconPaths = {
  camera: "/icons/engagement/camera.png",
  milestone: "/icons/engagement/milestone.png",
  "first-place": "/icons/engagement/first-place.png",
  "global-milestone": "/icons/engagement/global-milestone.png",
  community: "/icons/engagement/community.png",
  "on-fire": "/icons/engagement/on-fire.png",
  leaderboard: "/icons/engagement/leaderboard.png",
} as const;

function OverlayIcon({ name, className }: { name: keyof typeof engagementIconPaths; className?: string }) {
  return <Image className={className} src={engagementIconPaths[name]} alt="" width={64} height={64} aria-hidden="true" />;
}

function ControlIcon({ name }: { name: "previous" | "next" | "pause" | "play" | "fullscreen" }) {
  const paths = {
    previous: <><path d="m15 18-6-6 6-6" /></>,
    next: <><path d="m9 18 6-6-6-6" /></>,
    pause: <><path d="M9 6v12M15 6v12" /></>,
    play: <path d="m9 6 9 6-9 6V6Z" />,
    fullscreen: <><path d="M8 3H3v5M16 3h5v5M8 21H3v-5M16 21h5v-5" /></>,
  } as const;
  return <svg className="w-[22px] fill-none stroke-current [stroke-linecap:round] [stroke-linejoin:round] [stroke-width:1.8]" viewBox="0 0 24 24" aria-hidden="true">{paths[name]}</svg>;
}

const brandClass =
  "inline-flex items-center gap-[clamp(8px,.7vw,12px)] text-[clamp(19px,1.7vw,28px)] font-[850] not-italic tracking-[-.06em] text-white!";
const brandMarkClass = "block h-auto w-[clamp(28px,2.4vw,40px)] flex-none drop-shadow-[0_2px_6px_rgba(0,0,0,.4)]";
const liveOverlayClass =
  "absolute z-4 border border-white/17 bg-[linear-gradient(145deg,rgba(26,14,21,.82),rgba(12,8,11,.67))] shadow-[0_22px_64px_rgba(0,0,0,.32)] backdrop-blur-[22px] backdrop-saturate-[1.15] [--overlay-duration:5000ms] animate-[overlay-lifecycle_var(--overlay-duration)_ease_both] motion-reduce:animate-[overlay-fade_var(--overlay-duration)_ease_both]";
const overlayIconClass = "grid size-[54px] flex-none place-items-center rounded-2xl";
const overlayIconTint: Record<string, string> = {
  milestone: "bg-[rgba(234,179,8,.1)]",
  global: "bg-[rgba(101,183,255,.1)]",
};
const commentBubbleClass =
  "relative flex w-max max-w-full items-center gap-3 rounded-[20px_20px_6px_20px] border border-white/72 bg-white/93 py-[11px] pr-[17px] pl-[11px] text-[#32101e] shadow-[0_18px_48px_rgba(0,0,0,.28)] backdrop-blur-lg backdrop-saturate-[1.15] [--comment-duration:7000ms] animate-[comment-float_var(--comment-duration)_cubic-bezier(.22,.75,.25,1)_both] motion-reduce:animate-[comment-fade_var(--comment-duration)_cubic-bezier(.22,.75,.25,1)_both] after:absolute after:right-[-1px] after:bottom-[-8px] after:size-[14px] after:bg-white/93 after:[clip-path:polygon(0_0,100%_0,100%_100%)] after:content-['']";
const commentStreamClass =
  "pointer-events-none absolute bottom-[clamp(104px,11vh,150px)] z-5 flex max-h-[calc(100%-210px)] w-[min(390px,calc(100%-36px))] gap-3";
const commentThumbClass =
  "relative size-11 flex-none overflow-hidden rounded-xl bg-[rgba(50,16,30,.08)] shadow-[0_2px_8px_rgba(0,0,0,.18)]";
const commentAuthorClass =
  "block overflow-hidden text-[clamp(12px,1vw,14px)]/[1.3] font-extrabold text-ellipsis whitespace-nowrap text-[#b91c5c]";
const commentTextClass =
  "mt-[3px] mb-0 line-clamp-3 overflow-hidden text-[clamp(15px,1.35vw,19px)]/[1.35] font-[650] [overflow-wrap:anywhere]";
const roundButtonClass =
  "grid min-h-12 min-w-12 cursor-pointer place-items-center rounded-full border border-white/20 bg-[rgba(20,12,16,.58)] text-white backdrop-blur-md transition-[background,border-color] duration-[180ms] hover:border-white/45 hover:bg-[rgba(72,31,47,.78)] focus-visible:outline-3 focus-visible:outline-offset-[3px] focus-visible:outline-[#f6a9c4]";

export function SlideshowDisplay({
  token,
  initialEventName,
  initialSlides,
  backHref,
}: SlideshowDisplayProps) {
  const locale = useLocale();
  const t = getDictionary(locale).guest.live;
  const homeHref = localizedMarketingPath("/", locale);
  const brandMarkSrc = guestBrandMark(locale);
  const [brandLead, brandTail] = brandWordParts(locale);
  const demoMode = Boolean(initialSlides);
  const [eventName, setEventName] = useState(initialEventName);
  const [slides, setSlides] = useState<SlideshowSlide[]>(initialSlides ?? []);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [loading, setLoading] = useState(!initialSlides);
  const [error, setError] = useState<string | null>(null);
  const [overlayQueue, setOverlayQueue] = useState<LiveOverlay[]>([]);
  const [floatingComments, setFloatingComments] = useState<LiveMediaComment[]>([]);
  const seenEventIdsRef = useRef(new Set<string>());
  const seenCommentIdsRef = useRef(new Set<string>());
  const commentTimeoutsRef = useRef(new Map<string, number>());
  const lastLeaderboardAtRef = useRef(0);

  const refresh = useCallback(async () => {
    if (!token) return;
    try {
      const response = await fetch(`/api/v1/display/${encodeURIComponent(token)}/media`, { cache: "no-store" });
      if (!response.ok) throw new Error(response.status === 404 ? t.linkInvalid : t.refreshError);
      const body = await response.json() as {
        event: { name: string };
        media: SlideshowSlide[];
        engagement: EngagementSnapshot;
        comments: LiveMediaComment[];
      };
      setEventName(body.event.name);
      setSlides(body.media);
      const newEvents = body.engagement.events.filter((event) => {
        if (seenEventIdsRef.current.has(event.id)) return false;
        seenEventIdsRef.current.add(event.id);
        return true;
      });
      const eventOverlays = overlaysForNewEvents(newEvents, locale);
      const hadUpload = eventOverlays.some((overlay) => overlay.kind === "upload");
      const now = Date.now();
      const showPeriodicLeaderboard = lastLeaderboardAtRef.current > 0 && now - lastLeaderboardAtRef.current >= 2 * 60 * 1000;
      if (body.engagement.leaderboard.length && (hadUpload || showPeriodicLeaderboard)) {
        eventOverlays.push({
          id: `leaderboard:${now}`,
          kind: "leaderboard",
          leaderboard: body.engagement.leaderboard,
          durationMs: 8_000,
        });
        lastLeaderboardAtRef.current = now;
      } else if (lastLeaderboardAtRef.current === 0) {
        lastLeaderboardAtRef.current = now;
      }
      if (eventOverlays.length) {
        setOverlayQueue((current) => {
          const queued = new Set(current.map((overlay) => overlay.id));
          return [...current, ...eventOverlays.filter((overlay) => !queued.has(overlay.id))];
        });
      }
      const newComments = body.comments.filter((comment) => {
        if (seenCommentIdsRef.current.has(comment.id)) return false;
        seenCommentIdsRef.current.add(comment.id);
        return true;
      }).slice(-MAX_VISIBLE_LIVE_COMMENTS);
      if (newComments.length) {
        setFloatingComments((current) => [...current, ...newComments].slice(-MAX_VISIBLE_LIVE_COMMENTS));
        for (const comment of newComments) {
          const previousTimeout = commentTimeoutsRef.current.get(comment.id);
          if (previousTimeout) window.clearTimeout(previousTimeout);
          const timeout = window.setTimeout(() => {
            setFloatingComments((current) => current.filter((candidate) => candidate.id !== comment.id));
            commentTimeoutsRef.current.delete(comment.id);
          }, LIVE_COMMENT_DURATION_MS);
          commentTimeoutsRef.current.set(comment.id, timeout);
        }
      }
      setCurrentIndex((current) => body.media.length ? Math.min(current, body.media.length - 1) : 0);
      setError(null);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : t.refreshError);
    } finally {
      setLoading(false);
    }
  }, [locale, t, token]);

  useEffect(() => {
    if (demoMode) return;
    return subscribeToSlideshowUpdates(refresh);
  }, [demoMode, refresh]);

  useEffect(() => () => {
    for (const timeout of commentTimeoutsRef.current.values()) window.clearTimeout(timeout);
    commentTimeoutsRef.current.clear();
  }, []);

  useEffect(() => {
    if (paused || slides.length < 2) return;
    const interval = window.setInterval(() => {
      setCurrentIndex((current) => nextSlideshowIndex(current, slides.length));
    }, SLIDESHOW_FRAME_INTERVAL_MS);
    return () => window.clearInterval(interval);
  }, [paused, slides.length]);

  useEffect(() => {
    if (slides.length < 2) return;
    const next = slides[nextSlideshowIndex(currentIndex, slides.length)];
    const image = new window.Image();
    image.src = next.imageUrl;
  }, [currentIndex, slides]);

  useEffect(() => {
    const current = overlayQueue[0];
    if (!current) return;
    const timeout = window.setTimeout(() => setOverlayQueue((queue) => queue.slice(1)), current.durationMs);
    return () => window.clearTimeout(timeout);
  }, [overlayQueue]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight") setCurrentIndex((current) => nextSlideshowIndex(current, slides.length));
      if (event.key === "ArrowLeft") setCurrentIndex((current) => nextSlideshowIndex(current, slides.length, -1));
      if (event.key === " ") { event.preventDefault(); setPaused((current) => !current); }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [slides.length]);

  const currentSlide = slides[currentIndex];
  const currentOverlay = overlayQueue[0];
  const move = (direction: number) => setCurrentIndex((current) => nextSlideshowIndex(current, slides.length, direction));
  const enterFullscreen = () => void document.documentElement.requestFullscreen?.();

  return (
    <main className="group fixed inset-0 overflow-hidden bg-[#090609] font-sans text-white" aria-live="polite">
      {currentSlide ? (
        <div className="absolute inset-0 animate-reveal motion-reduce:animate-none after:pointer-events-none after:absolute after:inset-0 after:bg-[linear-gradient(180deg,rgba(9,6,9,.3),transparent_28%,transparent_65%,rgba(9,6,9,.72))] after:content-['']" key={currentSlide.publicId}>
          <Image className="bg-[#090609] object-contain" src={currentSlide.imageUrl} alt={currentSlide.filename} fill priority unoptimized sizes="100vw" />
        </div>
      ) : (
        <section className="flex min-h-full flex-col items-center justify-center bg-[radial-gradient(circle_at_50%_35%,#341421_0,#170c12_34%,#090609_68%)] p-8 text-center">
          <Link className={brandClass} href={homeHref} aria-label={t.backToSite}>{brandMarkSrc ? <img className={brandMarkClass} src={brandMarkSrc} alt="" width={34} height={34} /> : null}<span className="inline">{brandLead}<i className="not-italic text-[#ea4f87]">{brandTail}</i></span></Link>
          <p className="mt-[38px] mb-3 text-[11px] font-extrabold tracking-[.18em] text-[#f4a8c3] uppercase">{loading ? t.preparing : error ? t.linkUnavailable : t.live}</p>
          <h1 className="m-0 max-w-[900px] font-[Georgia,'Times_New_Roman',serif] text-[clamp(44px,7vw,108px)]/[.94] font-normal tracking-[-.055em] text-balance">{eventName}</h1>
          <small className="mt-[22px] max-w-[560px] text-[clamp(14px,1.3vw,19px)]/[1.5] text-white/67">{error ?? t.waitingHint}</small>
          {error ? <button className={cn(roundButtonClass, "mt-6 w-auto rounded-full px-[22px] font-[750] [font-family:inherit]")} type="button" onClick={() => void refresh()}>{t.tryAgain}</button> : <span className="mt-7 size-2.5 animate-live-pulse rounded-full bg-[#ef3c6f] motion-reduce:animate-none" aria-hidden="true" />}
        </section>
      )}

      <header className="absolute inset-x-0 top-0 z-2 flex items-center justify-between bg-[linear-gradient(180deg,rgba(9,6,9,.7),transparent)] p-[clamp(18px,2.6vw,38px)]">
        <Link className={brandClass} href={homeHref} aria-label={t.backToSite}>{brandMarkSrc ? <img className={brandMarkClass} src={brandMarkSrc} alt="" width={34} height={34} /> : null}<span className="inline">{brandLead}<i className="not-italic text-[#ea4f87]">{brandTail}</i></span></Link>
        <div className="flex items-center gap-2 min-[601px]:gap-3">
          {backHref ? <a className="inline-flex min-h-11 w-11 items-center justify-center overflow-hidden rounded-full border border-white/20 bg-[rgba(9,6,9,.36)] p-0 text-[0px] font-[750] backdrop-blur-md transition-[background,border-color] duration-200 text-white/86! before:text-[18px] before:content-['←'] hover:border-white/38 hover:bg-[rgba(9,6,9,.58)] hover:text-white! min-[601px]:w-auto min-[601px]:px-[15px] min-[601px]:text-[12px] min-[601px]:before:content-none" href={backHref}>{t.backToGallery}</a> : null}
          <span className="flex items-center gap-2 text-[10px] font-[750] tracking-[.08em] text-white/80 uppercase min-[601px]:text-[12px]"><Image className="size-[22px] object-contain drop-shadow-[0_0_8px_rgba(239,60,111,.45)]" src="/icons/engagement/live-indicator.png" alt="" width={24} height={24} aria-hidden="true" /> {demoMode ? t.liveDemo : t.live}</span>
        </div>
      </header>

      {currentOverlay?.kind === "leaderboard" ? (
        <section
          className={cn(liveOverlayClass, "top-1/2 left-1/2 w-[min(620px,calc(100%-36px))] -translate-x-1/2 -translate-y-1/2 rounded-3xl p-[clamp(22px,3vw,36px)]")}
          style={{ "--overlay-duration": `${currentOverlay.durationMs}ms` } as CSSProperties}
          aria-label={t.leaderboardLabel}
        >
          <div className="flex items-center gap-[7px] text-[10px] font-[850] tracking-[.14em] text-[#f8b5ce] uppercase"><OverlayIcon className="size-[25px] object-contain drop-shadow-[0_5px_7px_rgba(0,0,0,.24)]" name="leaderboard" /> {t.live}</div>
          <h2 className="mt-[9px] mb-[22px] font-[Georgia,'Times_New_Roman',serif] text-[clamp(30px,4vw,52px)] font-normal tracking-[-.04em] normal-case">{t.topPhotographers}</h2>
          <ol className="m-0 grid list-none gap-2 p-0">
            {currentOverlay.leaderboard.slice(0, 3).map((entry, index) => (
              <li className="grid min-h-[58px] grid-cols-[38px_minmax(0,1fr)_auto] items-center gap-3 rounded-[14px] bg-white/[.075] py-2 pr-3.5 pl-2.5" key={entry.guestId}>
                <span className={cn("grid size-[34px] place-items-center rounded-[10px] bg-white/9 text-[13px] font-[850] text-[#f7b2cb]", index === 0 && "bg-[rgba(234,179,8,.18)] text-[#f8d86a]")}>{index + 1}</span>
                <strong className="overflow-hidden text-[clamp(15px,1.5vw,20px)] text-ellipsis whitespace-nowrap">{entry.displayName}</strong>
                <b className="text-[clamp(16px,1.7vw,22px)] text-white tabular-nums">{entry.count} <small className="text-[10px] font-[650] text-white/55 uppercase">{t.photos}</small></b>
              </li>
            ))}
          </ol>
        </section>
      ) : currentOverlay ? (
        <aside
          className={cn(liveOverlayClass, "top-[clamp(76px,9vw,124px)] left-[clamp(18px,3vw,48px)] flex w-[min(520px,calc(100%-36px))] items-center gap-[15px] rounded-[18px] px-[18px] py-[15px]")}
          style={{ "--overlay-duration": `${currentOverlay.durationMs}ms` } as CSSProperties}
          role="status"
        >
          <span className={cn(overlayIconClass, overlayIconTint[currentOverlay.kind] ?? "bg-[rgba(239,60,111,.12)]")}><OverlayIcon className="size-[52px] object-contain drop-shadow-[0_7px_9px_rgba(0,0,0,.2)]" name={currentOverlay.icon} /></span>
          <span className="flex min-w-0 flex-col gap-[3px]">
            <strong className="overflow-hidden text-[clamp(15px,1.5vw,21px)]/[1.25] text-ellipsis whitespace-nowrap">{currentOverlay.title}</strong>
            <small className="text-[clamp(11px,1vw,14px)] text-white/67">{currentOverlay.detail}</small>
            {currentOverlay.kind === "upload" ? (
              <span className="mt-[3px] inline-flex w-max items-center gap-1 text-[9px] font-extrabold tracking-[.08em] text-[#f8b5ce] uppercase"><Image className="size-4 object-contain" src="/icons/engagement/ai-accepted.png" alt="" width={18} height={18} aria-hidden="true" /> {t.aiSelected}</span>
            ) : null}
          </span>
        </aside>
      ) : null}

      <section className={cn(commentStreamClass, "right-[clamp(18px,3vw,48px)] flex-col-reverse items-end")} aria-label={t.liveComments} aria-live="polite">
        {[...floatingComments].reverse().map((comment) => (
          <article
            className={commentBubbleClass}
            key={comment.id}
            style={{ "--comment-duration": `${LIVE_COMMENT_DURATION_MS}ms` } as CSSProperties}
          >
            <span className={commentThumbClass} aria-hidden="true">
              <Image
                src={`/api/v1/display/${encodeURIComponent(token ?? "")}/media/${comment.mediaPublicId}`}
                alt=""
                fill
                unoptimized
                sizes="44px"
                className="object-cover"
              />
            </span>
            <span className="min-w-0">
              <strong className={commentAuthorClass}>{comment.displayName}</strong>
              <p className={commentTextClass}>{comment.body}</p>
            </span>
          </article>
        ))}
      </section>

      {currentSlide?.comments.length ? (
        <section className={cn(commentStreamClass, "left-[clamp(18px,3vw,48px)] flex-col items-start overflow-hidden")} aria-label={t.currentPhotoComments}>
          {currentSlide.comments.map((comment) => (
            <article className={cn(commentBubbleClass, "rounded-[20px_20px_20px_6px] animate-slide-comment-in after:right-auto after:left-[-1px] after:[clip-path:polygon(0_0,100%_0,0_100%)] motion-reduce:animate-none")} key={`${currentSlide.publicId}:${comment.id}`}>
              <span className={commentThumbClass} aria-hidden="true">
                <Image className="object-cover" src={currentSlide.imageUrl} alt="" fill unoptimized sizes="44px" />
              </span>
              <span className="min-w-0">
                <strong className={commentAuthorClass}>{comment.displayName}</strong>
                <p className={commentTextClass}>{comment.body}</p>
              </span>
            </article>
          ))}
        </section>
      ) : null}

      {currentSlide ? (
        <footer className="absolute right-[clamp(18px,2.6vw,38px)] bottom-[clamp(18px,2.6vw,38px)] left-[clamp(18px,2.6vw,38px)] z-3 flex flex-col items-stretch justify-between gap-6 opacity-35 transition-opacity duration-200 focus-within:opacity-100 group-hover:opacity-100 min-[601px]:flex-row min-[601px]:items-end motion-reduce:transition-none">
          <div className="flex flex-col gap-[5px] [text-shadow:0_2px_12px_#000]">
            <strong className="font-[Georgia,'Times_New_Roman',serif] text-[23px] font-normal min-[601px]:text-[clamp(22px,2.5vw,40px)]">{eventName}</strong>
            <span className="text-[12px] text-white/72 tabular-nums">{currentIndex + 1} / {slides.length}</span>
          </div>
          <nav className="flex justify-end gap-2 min-[601px]:justify-start" aria-label={t.controls}>
            <button className={roundButtonClass} type="button" onClick={() => move(-1)} aria-label={t.previousPhoto}><ControlIcon name="previous" /></button>
            <button className={roundButtonClass} type="button" onClick={() => setPaused((current) => !current)} aria-label={paused ? t.resume : t.pause}><ControlIcon name={paused ? "play" : "pause"} /></button>
            <button className={roundButtonClass} type="button" onClick={() => move(1)} aria-label={t.nextPhoto}><ControlIcon name="next" /></button>
            <button className={roundButtonClass} type="button" onClick={enterFullscreen} aria-label={t.fullscreen}><ControlIcon name="fullscreen" /></button>
          </nav>
        </footer>
      ) : null}
    </main>
  );
}
