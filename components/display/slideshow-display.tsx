"use client";

import Image from "next/image";
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
import styles from "./slideshow-display.module.css";

type Slide = { publicId: string; filename: string; imageUrl: string };

const engagementIconPaths = {
  camera: "/icons/engagement/camera.png",
  milestone: "/icons/engagement/milestone.png",
  "first-place": "/icons/engagement/first-place.png",
  "global-milestone": "/icons/engagement/global-milestone.png",
  community: "/icons/engagement/community.png",
  "on-fire": "/icons/engagement/on-fire.png",
  leaderboard: "/icons/engagement/leaderboard.png",
} as const;

function OverlayIcon({ name }: { name: keyof typeof engagementIconPaths }) {
  return <Image src={engagementIconPaths[name]} alt="" width={64} height={64} aria-hidden="true" />;
}

function ControlIcon({ name }: { name: "previous" | "next" | "pause" | "play" | "fullscreen" }) {
  const paths = {
    previous: <><path d="m15 18-6-6 6-6" /></>,
    next: <><path d="m9 18 6-6-6-6" /></>,
    pause: <><path d="M9 6v12M15 6v12" /></>,
    play: <path d="m9 6 9 6-9 6V6Z" />,
    fullscreen: <><path d="M8 3H3v5M16 3h5v5M8 21H3v-5M16 21h5v-5" /></>,
  } as const;
  return <svg viewBox="0 0 24 24" aria-hidden="true">{paths[name]}</svg>;
}

export function SlideshowDisplay({ token, initialEventName }: { token: string; initialEventName: string }) {
  const [eventName, setEventName] = useState(initialEventName);
  const [slides, setSlides] = useState<Slide[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [overlayQueue, setOverlayQueue] = useState<LiveOverlay[]>([]);
  const [floatingComments, setFloatingComments] = useState<LiveMediaComment[]>([]);
  const seenEventIdsRef = useRef(new Set<string>());
  const seenCommentIdsRef = useRef(new Set<string>());
  const commentTimeoutsRef = useRef(new Map<string, number>());
  const lastLeaderboardAtRef = useRef(0);

  const refresh = useCallback(async () => {
    try {
      const response = await fetch(`/api/v1/display/${encodeURIComponent(token)}/media`, { cache: "no-store" });
      if (!response.ok) throw new Error(response.status === 404 ? "Povezava do projekcije ni več veljavna." : "Projekcije ni bilo mogoče osvežiti.");
      const body = await response.json() as {
        event: { name: string };
        media: Slide[];
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
      const eventOverlays = overlaysForNewEvents(newEvents);
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
      setError(reason instanceof Error ? reason.message : "Projekcije ni bilo mogoče osvežiti.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => subscribeToSlideshowUpdates(refresh), [refresh]);

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
    <main className={styles.display} aria-live="polite">
      {currentSlide ? (
        <div className={styles.frame} key={currentSlide.publicId}>
          <Image src={currentSlide.imageUrl} alt={currentSlide.filename} fill priority unoptimized sizes="100vw" />
        </div>
      ) : (
        <section className={styles.emptyState}>
          <span className={styles.brand}>eventaj<i>.</i></span>
          <p>{loading ? "Pripravljamo projekcijo …" : error ? "Povezava ni na voljo" : "V živo"}</p>
          <h1>{eventName}</h1>
          <small>{error ?? "Fotografije se bodo prikazale samodejno, ko bodo dodane."}</small>
          {error ? <button type="button" onClick={() => void refresh()}>Poskusi znova</button> : <span className={styles.pulse} aria-hidden="true" />}
        </section>
      )}

      <header className={styles.topBar}>
        <span className={styles.brand}>eventaj<i>.</i></span>
        <div><Image className={styles.liveIndicator} src="/icons/engagement/live-indicator.png" alt="" width={24} height={24} aria-hidden="true" /> V živo</div>
      </header>

      {currentOverlay?.kind === "leaderboard" ? (
        <section
          className={`${styles.liveOverlay} ${styles.leaderboardOverlay}`}
          style={{ "--overlay-duration": `${currentOverlay.durationMs}ms` } as CSSProperties}
          aria-label="Lestvica fotografov"
        >
          <div className={styles.overlayLabel}><OverlayIcon name="leaderboard" /> V živo</div>
          <h2>Top fotografi</h2>
          <ol>
            {currentOverlay.leaderboard.slice(0, 3).map((entry, index) => (
              <li key={entry.guestId}>
                <span>{index + 1}</span><strong>{entry.displayName}</strong><b>{entry.count} <small>fotografij</small></b>
              </li>
            ))}
          </ol>
        </section>
      ) : currentOverlay ? (
        <aside
          className={`${styles.liveOverlay} ${styles.toastOverlay} ${styles[currentOverlay.kind]}`}
          style={{ "--overlay-duration": `${currentOverlay.durationMs}ms` } as CSSProperties}
          role="status"
        >
          <span className={styles.overlayIcon}><OverlayIcon name={currentOverlay.icon} /></span>
          <span>
            <strong>{currentOverlay.title}</strong>
            <small>{currentOverlay.detail}</small>
            {currentOverlay.kind === "upload" ? (
              <span className={styles.aiAccepted}><Image src="/icons/engagement/ai-accepted.png" alt="" width={18} height={18} aria-hidden="true" /> AI izbrano</span>
            ) : null}
          </span>
        </aside>
      ) : null}

      <section className={styles.commentStream} aria-label="Komentarji v živo" aria-live="polite">
        {[...floatingComments].reverse().map((comment) => (
          <article
            className={styles.commentBubble}
            key={comment.id}
            style={{ "--comment-duration": `${LIVE_COMMENT_DURATION_MS}ms` } as CSSProperties}
          >
            <strong>{comment.displayName}</strong>
            <p>{comment.body}</p>
          </article>
        ))}
      </section>

      {currentSlide ? (
        <footer className={styles.controls}>
          <div><strong>{eventName}</strong><span>{currentIndex + 1} / {slides.length}</span></div>
          <nav aria-label="Upravljanje projekcije">
            <button type="button" onClick={() => move(-1)} aria-label="Prejšnja fotografija"><ControlIcon name="previous" /></button>
            <button type="button" onClick={() => setPaused((current) => !current)} aria-label={paused ? "Nadaljuj samodejno predvajanje" : "Začasno ustavi predvajanje"}><ControlIcon name={paused ? "play" : "pause"} /></button>
            <button type="button" onClick={() => move(1)} aria-label="Naslednja fotografija"><ControlIcon name="next" /></button>
            <button type="button" onClick={enterFullscreen} aria-label="Celozaslonski način"><ControlIcon name="fullscreen" /></button>
          </nav>
        </footer>
      ) : null}
    </main>
  );
}
