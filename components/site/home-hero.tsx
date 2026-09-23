"use client";

import Link from "next/link";
import { useEffect, useState, useSyncExternalStore } from "react";
import { DisplayText } from "./primitives";
import { DEMO_PHOTO, PLACEMENT_PHOTO } from "./demo-photos";
import { PhoneFrame, PhoneGalleryScreen } from "./phone-gallery";

type TileKind = "img" | "video" | "wish" | "voice" | "place";
/** Grid areas: desktop 6×4 around the phone, mobile 4×3 (null = hidden on phones). */
const TILES: { kind: TileKind; n?: number; desktop: string; mobile: string | null; side: -1 | 1 }[] = [
  { kind: "img", n: 1, desktop: "1/1/3/2", mobile: "1/1/2/2", side: -1 },
  { kind: "img", n: 2, desktop: "1/2/2/3", mobile: null, side: -1 },
  { kind: "wish", desktop: "2/2/3/3", mobile: "2/1/3/2", side: -1 },
  { kind: "img", n: 3, desktop: "3/1/4/2", mobile: "3/1/4/2", side: -1 },
  { kind: "video", n: 4, desktop: "3/2/5/3", mobile: null, side: -1 },
  { kind: "img", n: 6, desktop: "4/1/5/2", mobile: null, side: -1 },
  { kind: "img", n: 5, desktop: "1/5/2/6", mobile: "1/4/2/5", side: 1 },
  { kind: "img", n: 7, desktop: "1/6/3/7", mobile: null, side: 1 },
  { kind: "voice", desktop: "2/5/3/6", mobile: "2/4/3/5", side: 1 },
  { kind: "img", n: 8, desktop: "3/5/5/6", mobile: "3/4/4/5", side: 1 },
  { kind: "img", n: 9, desktop: "3/6/4/7", mobile: null, side: 1 },
  { kind: "place", desktop: "4/6/5/7", mobile: null, side: 1 },
];

/** Deterministic pseudo-random in [0, 1) so server and client agree. */
const rnd = (i: number, k: number) => { const x = Math.sin(i * 12.9898 + k * 78.233) * 43758.5453; return x - Math.floor(x); };
const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";
const prefersReducedMotion = () => window.matchMedia(REDUCED_MOTION).matches;
const subscribeReducedMotion = (onChange: () => void) => {
  const query = window.matchMedia(REDUCED_MOTION);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
};
const BARS = Array.from({ length: 14 }, (_, i) => ({ h: `${30 + Math.round(rnd(i, 7) * 70)}%`, d: `${(-rnd(i, 8) * 1.2).toFixed(2)}s` }));

export type HomeHeroCopy = {
  badge: string;
  badgeText: string;
  title: string;
  text: string;
  cta: string;
  tryGuest: string;
  trust: readonly string[];
  wish: string;
  wishBy: string;
  voice: string;
  voiceBy: string;
  eventMeta: string;
  eventName: string;
  favourites: string;
  moments: string;
  toasts: readonly string[];
  alts: readonly string[];
};

export function HomeHero({ copy, orderHref }: { copy: HomeHeroCopy; orderHref: string }) {
  const [scroll, setScroll] = useState(0);
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const [toast, setToast] = useState(0);
  const reduced = useSyncExternalStore(subscribeReducedMotion, prefersReducedMotion, () => false);

  useEffect(() => {
    let frame: number | undefined;
    const onScroll = () => {
      if (frame !== undefined) return;
      frame = requestAnimationFrame(() => { frame = undefined; setScroll(window.scrollY); });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    const timer = window.setInterval(() => setToast((value) => value + 1), 3200);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.clearInterval(timer);
      if (frame !== undefined) cancelAnimationFrame(frame);
    };
  }, []);

  // Tiles start scattered and settle into the grid as the page scrolls.
  const progress = reduced ? 1 : Math.min(1, scroll / 460);
  const inv = 1 - progress;
  const ease = inv * inv * (3 - 2 * inv);
  const alt = (n?: number) => (n ? copy.alts[Math.min(n, copy.alts.length) - 1] ?? "" : "");

  return (
    <section aria-label="Introduction" className="relative overflow-hidden px-[clamp(16px,4vw,48px)] pt-[clamp(48px,7vw,96px)] pb-[clamp(40px,5vw,64px)]">
      <div className="mx-auto flex max-w-[980px] flex-col items-center gap-6 text-center">
        <div className="flex max-w-full animate-gm-up items-center gap-2.5 rounded-full border border-gm-line bg-gm-paper py-[7px] pr-3.5 pl-2 text-left text-[14px] font-medium text-gm-muted">
          <span className="flex-none rounded-full bg-gm-blush px-[9px] py-[3px] text-[12px] font-semibold whitespace-nowrap text-gm-accent-dark">{copy.badge}</span>
          {copy.badgeText}
        </div>
        <h1 className="animate-[gmUp_.8s_.08s_cubic-bezier(.2,.7,.2,1)_both] font-serif text-[clamp(39.4px,6.1vw,88.6px)] leading-[1.08] font-normal tracking-[-0.02em] text-balance">
          <DisplayText value={copy.title} emClassName="text-gm-accent" />
        </h1>
        <p className="max-w-[600px] animate-[gmUp_.8s_.16s_cubic-bezier(.2,.7,.2,1)_both] text-[clamp(17px,1.5vw,20px)] leading-[1.55] text-pretty text-gm-muted">{copy.text}</p>
        <div className="mt-1 flex animate-[gmUp_.8s_.24s_cubic-bezier(.2,.7,.2,1)_both] flex-wrap justify-center gap-3">
          <Link
            href={orderHref}
            data-sticky-cta-trigger="create-event"
            className="flex items-center gap-3.5 rounded-full bg-gm-accent px-7 py-[18px] text-[17px] font-semibold whitespace-nowrap text-white! shadow-[0_10px_24px_rgba(168,69,58,.28)] transition-[background,transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:bg-gm-accent-dark hover:shadow-[0_14px_30px_rgba(168,69,58,.34)] active:translate-y-0 max-[420px]:px-5 max-[420px]:text-[16px] max-[420px]:whitespace-normal"
          >
            {copy.cta} <span aria-hidden="true">→</span>
          </Link>
          <a
            href="#demo"
            className="flex items-center gap-2.5 rounded-full border border-gm-line-strong bg-gm-paper px-[26px] py-[18px] text-[17px] font-semibold whitespace-nowrap transition-[border-color,transform] duration-200 hover:-translate-y-0.5 hover:border-gm-ink hover:text-gm-ink!"
          >
            {copy.tryGuest}
          </a>
        </div>
        <ul className="m-0 flex animate-[gmUp_.8s_.32s_cubic-bezier(.2,.7,.2,1)_both] list-none flex-wrap justify-center gap-x-[22px] gap-y-2 p-0 text-[14px] text-gm-muted">
          {copy.trust.map((item) => (
            <li key={item} className="flex items-center gap-[7px]"><span className="font-bold text-gm-accent">✓</span>{item}</li>
          ))}
        </ul>
      </div>

      <div
        onMouseMove={(event) => {
          if (reduced) return;
          const rect = event.currentTarget.getBoundingClientRect();
          setMouse({ x: ((event.clientX - rect.left) / rect.width - 0.5) * 2, y: ((event.clientY - rect.top) / rect.height - 0.5) * 2 });
        }}
        onMouseLeave={() => setMouse({ x: 0, y: 0 })}
        className="mx-auto mt-[clamp(40px,5vw,72px)] grid h-[440px] max-w-[1320px] animate-[gmIn_1s_.2s_both] grid-cols-[repeat(4,minmax(0,1fr))] grid-rows-[repeat(3,minmax(0,1fr))] gap-[clamp(8px,1vw,14px)] min-[720px]:h-[clamp(520px,50vw,680px)] min-[720px]:grid-cols-[repeat(6,minmax(0,1fr))] min-[720px]:grid-rows-[repeat(4,minmax(0,1fr))]"
      >
        {TILES.map((tile, i) => {
          const depth = 0.5 + rnd(i, 2);
          const tx = tile.side * (40 + 70 * rnd(i, 1)) * ease + mouse.x * 14 * depth;
          const ty = (rnd(i, 4) - 0.5) * 110 * ease + mouse.y * 10 * depth;
          const rot = (rnd(i, 5) - 0.5) * 12 * ease;
          const scale = 1 - 0.06 * ease;
          return (
            <div
              key={i}
              style={{
                "--area-d": tile.desktop,
                "--area-m": tile.mobile ?? "auto",
                transform: `translate3d(${tx.toFixed(1)}px,${ty.toFixed(1)}px,0) rotate(${rot.toFixed(2)}deg) scale(${scale.toFixed(3)})`,
                opacity: (0.55 + 0.45 * progress).toFixed(2),
              } as React.CSSProperties}
              className={`group relative overflow-hidden rounded-[clamp(10px,1.2vw,18px)] bg-gm-sand shadow-[0_10px_30px_rgba(40,30,20,.10)] transition-[transform,opacity] duration-500 ease-gm [grid-area:var(--area-m)] min-[720px]:block min-[720px]:[grid-area:var(--area-d)] ${tile.mobile ? "" : "max-[719px]:hidden"}`}
            >
              {tile.kind === "img" || tile.kind === "video" || tile.kind === "place" ? (
                <img
                  src={tile.kind === "place" ? PLACEMENT_PHOTO("projection") : DEMO_PHOTO(tile.n ?? 1)}
                  alt={alt(tile.n)}
                  className="absolute inset-0 size-full object-cover transition-transform duration-[800ms] ease-gm group-hover:scale-[1.07]"
                />
              ) : null}
              {tile.kind === "video" ? (
                <span className="absolute bottom-2.5 left-2.5 rounded-full bg-[rgba(20,15,10,.62)] px-2.5 py-[5px] text-[12px] font-semibold text-white backdrop-blur-[6px]">▶ 0:42</span>
              ) : null}
              {tile.kind === "wish" ? (
                <div className="absolute inset-0 flex flex-col justify-between rounded-[inherit] border border-gm-line bg-gm-paper p-[clamp(10px,1.4vw,20px)] text-left">
                  <span className="font-serif text-[clamp(12.3px,1.3vw,19.7px)] leading-[1.15] text-pretty">{copy.wish}</span>
                  <span className="text-[12px] font-semibold text-gm-muted">{copy.wishBy}</span>
                </div>
              ) : null}
              {tile.kind === "voice" ? (
                <div className="absolute inset-0 flex flex-col justify-between bg-gm-accent p-[clamp(10px,1.4vw,20px)] text-left text-white">
                  <span className="text-[12px] font-semibold tracking-[.08em] uppercase">{copy.voice}</span>
                  <span aria-hidden="true" className="flex h-[34%] items-center gap-[3px]">
                    {BARS.map((bar, index) => (
                      <span key={index} style={{ height: bar.h, animationDelay: bar.d }} className="flex-1 animate-[gmWave_1.2s_ease-in-out_infinite] rounded-[2px] bg-white" />
                    ))}
                  </span>
                  <span className="text-[13px] font-semibold">{copy.voiceBy}</span>
                </div>
              ) : null}
            </div>
          );
        })}
        <div
          style={{ transform: `translate3d(${(-mouse.x * 6).toFixed(1)}px,${(ease * 36 - mouse.y * 5).toFixed(1)}px,0) scale(${(0.95 + 0.05 * progress).toFixed(3)})` }}
          className="z-[2] flex min-h-0 min-w-0 items-center justify-center transition-transform duration-500 ease-gm [grid-area:1/2/4/4] min-[720px]:[grid-area:1/3/5/5]"
        >
          <PhoneFrame className="h-full">
            <PhoneGalleryScreen meta={copy.eventMeta} name={copy.eventName} favourites={copy.favourites} moments={copy.moments} coverAlt={copy.alts[0] ?? ""} />
            <div className="absolute inset-x-[6%] bottom-[5%] flex justify-center">
              <span key={toast} className="flex animate-[gmToast_3.2s_ease_both] items-center gap-1.5 rounded-full bg-gm-ink px-[clamp(9px,.9vw,13px)] py-[clamp(6px,.6vw,9px)] text-[clamp(9px,.8vw,12px)] font-medium whitespace-nowrap text-white shadow-[0_8px_18px_rgba(0,0,0,.2)]">
                <span className="size-1.5 rounded-full bg-[#e0897d]" />
                {copy.toasts[toast % copy.toasts.length]}
              </span>
            </div>
          </PhoneFrame>
        </div>
      </div>
    </section>
  );
}
