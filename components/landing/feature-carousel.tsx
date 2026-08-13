"use client";

import Image from "next/image";
import { useCallback, useRef, useState } from "react";
import type { KeyboardEvent, UIEvent } from "react";
import type { Locale } from "@/lib/i18n/locale";

type Feature = {
  icon: string;
  title: string;
  mobileTitle?: string;
  description: string;
  mobile: string;
};

const controls: Record<Locale, { previous: string; next: string; item: string }> = {
  sl: { previous: "Prejšnja funkcija", next: "Naslednja funkcija", item: "Funkcija" },
  en: { previous: "Previous feature", next: "Next feature", item: "Feature" },
  de: { previous: "Vorherige Funktion", next: "Nächste Funktion", item: "Funktion" },
  nl: { previous: "Vorige functie", next: "Volgende functie", item: "Functie" },
  es: { previous: "Función anterior", next: "Función siguiente", item: "Función" },
  it: { previous: "Funzione precedente", next: "Funzione successiva", item: "Funzione" },
  fr: { previous: "Fonction précédente", next: "Fonction suivante", item: "Fonction" },
};

export function FeatureCarousel({ features, locale, label }: { features: readonly Feature[]; locale: Locale; label: string }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const copy = controls[locale];

  const goTo = useCallback((index: number) => {
    const nextIndex = Math.max(0, Math.min(features.length - 1, index));
    const track = trackRef.current;
    const card = track?.children.item(nextIndex) as HTMLElement | null;
    if (!track || !card) return;

    const firstCard = track.firstElementChild as HTMLElement | null;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    track.scrollTo({ left: card.offsetLeft - (firstCard?.offsetLeft ?? 0), behavior: reducedMotion ? "auto" : "smooth" });
    setActiveIndex(nextIndex);
  }, [features.length]);

  function syncActiveCard(event: UIEvent<HTMLDivElement>) {
    const track = event.currentTarget;
    const cards = Array.from(track.children) as HTMLElement[];
    const firstOffset = cards[0]?.offsetLeft ?? 0;
    const nearest = cards.reduce((best, card, index) => {
      const distance = Math.abs(card.offsetLeft - firstOffset - track.scrollLeft);
      return distance < best.distance ? { index, distance } : best;
    }, { index: 0, distance: Number.POSITIVE_INFINITY });
    setActiveIndex(nearest.index);
  }

  function handleKeys(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    goTo(activeIndex + (event.key === "ArrowRight" ? 1 : -1));
  }

  return (
    <div className="feature-carousel" role="region" aria-label={label}>
      <div className="feature-grid" ref={trackRef} tabIndex={0} onScroll={syncActiveCard} onKeyDown={handleKeys}>
        {features.map((feature, index) => (
          <article className="feature-card" key={feature.title} role="group" aria-label={`${copy.item} ${index + 1} / ${features.length}`}>
            <span className="feature-glyph" aria-hidden="true">
              <Image src={feature.icon} alt="" width={22} height={22} />
            </span>
            <h3 className={feature.mobileTitle ? "desktop-only" : ""}>{feature.title}</h3>
            {feature.mobileTitle ? <h3 className="mobile-only">{feature.mobileTitle}</h3> : null}
            <p className="desktop-only">{feature.description}</p>
            <p className="mobile-only">{feature.mobile}</p>
          </article>
        ))}
      </div>
      <div className="feature-carousel-controls mobile-only">
        <button type="button" onClick={() => goTo(activeIndex - 1)} disabled={activeIndex === 0} aria-label={copy.previous}>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m15 18-6-6 6-6" /></svg>
        </button>
        <div className="feature-carousel-dots" aria-hidden="true">
          {features.map((feature, index) => <i className={index === activeIndex ? "is-active" : ""} key={feature.title} />)}
        </div>
        <span className="sr-only" aria-live="polite">{activeIndex + 1} / {features.length}</span>
        <button type="button" onClick={() => goTo(activeIndex + 1)} disabled={activeIndex === features.length - 1} aria-label={copy.next}>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 18 6-6-6-6" /></svg>
        </button>
      </div>
    </div>
  );
}
