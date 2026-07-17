"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { nextSlideshowIndex, SLIDESHOW_FRAME_INTERVAL_MS } from "@/lib/domain/slideshow";
import { subscribeToSlideshowUpdates } from "@/lib/client/slideshow-updates";
import styles from "./slideshow-display.module.css";

type Slide = { publicId: string; filename: string; imageUrl: string };

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

  const refresh = useCallback(async () => {
    try {
      const response = await fetch(`/api/v1/display/${encodeURIComponent(token)}/media`, { cache: "no-store" });
      if (!response.ok) throw new Error(response.status === 404 ? "Povezava do projekcije ni več veljavna." : "Projekcije ni bilo mogoče osvežiti.");
      const body = await response.json() as { event: { name: string }; media: Slide[] };
      setEventName(body.event.name);
      setSlides(body.media);
      setCurrentIndex((current) => body.media.length ? Math.min(current, body.media.length - 1) : 0);
      setError(null);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Projekcije ni bilo mogoče osvežiti.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => subscribeToSlideshowUpdates(refresh), [refresh]);

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
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight") setCurrentIndex((current) => nextSlideshowIndex(current, slides.length));
      if (event.key === "ArrowLeft") setCurrentIndex((current) => nextSlideshowIndex(current, slides.length, -1));
      if (event.key === " ") { event.preventDefault(); setPaused((current) => !current); }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [slides.length]);

  const currentSlide = slides[currentIndex];
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
        <div><span className={styles.liveDot} /> V živo</div>
      </header>

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
