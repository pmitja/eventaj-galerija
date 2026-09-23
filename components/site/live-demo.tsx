"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { DEMO_PHOTO } from "./demo-photos";
import { FakeQr } from "./fake-qr";

type Item = { kind: "img" | "video" | "voice"; src?: string; text?: string };
type Slide = { kind: "shot" | "img" | "wish"; src?: string; text?: string; name?: string };

export type LiveDemoCopy = {
  eyebrow: string;
  heading: string;
  text: string;
  idle: string;
  uploadingPhoto: string;
  photoAdded: string;
  uploadingVideo: string;
  videoAdded: string;
  sendingWish: string;
  wishAdded: string;
  recording: string;
  voiceAdded: string;
  voiceShort: string;
  live: string;
  justAdded: string;
  scan: string;
  slideAlt: string;
  note: string;
  openDemo: string;
  wishes: readonly (readonly [string, string])[];
  phone: { kicker: string; title: string; text: string; choose: string; chooseNote: string; takePhoto: string; addVideo: string; voice: string; shared: string };
  eventMeta: string;
  eventName: string;
  favourites: string;
  moments: string;
};

const PHOTO_POOL = [1, 5, 2, 7, 3, 8];
const COMMENTS = [2, 1, 1, 0, 1, 0, 0, 2];

const optionButton =
  "flex min-h-[46px] cursor-pointer items-center justify-center gap-2 rounded-xl border border-[#ecdfe4] bg-white px-2.5 py-[13px] text-[14px] font-semibold text-[#2b1a1f]! transition-[border-color,background,transform] duration-150 hover:border-[#e7a7c0] hover:bg-[#fffafc] active:scale-[.98] disabled:cursor-wait";

/**
 * A simulated guest upload: buttons add demo content to the phone gallery and
 * push photos and wishes onto the live slideshow. Nothing leaves the browser.
 */
export function LiveDemo({ copy, demoHref, liveshowShot }: { copy: LiveDemoCopy; demoHref: string; liveshowShot: string }) {
  const [items, setItems] = useState<Item[]>(() => [5, 2, 3, 4, 6, 7, 8, 9].map((n) => ({ kind: "img", src: DEMO_PHOTO(n) })));
  const [slides, setSlides] = useState<Slide[]>(() => [{ kind: "shot", src: liveshowShot }, ...[1, 5, 2].map((n) => ({ kind: "img" as const, src: DEMO_PHOTO(n) }))]);
  const [slide, setSlide] = useState(0);
  const [slideNew, setSlideNew] = useState(false);
  const [busy, setBusy] = useState<"upload" | "rec" | null>(null);
  const [status, setStatus] = useState(copy.idle);
  const [fresh, setFresh] = useState(false);
  const counters = useRef({ photo: 0, lastAdd: 0 });
  const slideCount = useRef(4);
  const timeouts = useRef<number[]>([]);

  const later = (fn: () => void, ms: number) => { timeouts.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => {
    const pending = timeouts.current;
    const timer = window.setInterval(() => {
      if (Date.now() - counters.current.lastAdd < 4500) return;
      setSlideNew(false);
      setSlide((value) => value + 1);
    }, 4200);
    return () => { window.clearInterval(timer); pending.forEach(window.clearTimeout); };
  }, []);

  function add(item: Item | null, doneStatus: string, toSlide?: Slide) {
    if (item) setItems((current) => [item, ...current].slice(0, 12));
    setBusy(null);
    setStatus(doneStatus);
    setFresh(Boolean(item));
    if (toSlide) {
      setSlides((current) => [...current, toSlide]);
      setSlide(slideCount.current++);
      setSlideNew(true);
      counters.current.lastAdd = Date.now();
    }
    later(() => setFresh(false), 2000);
  }

  const addPhoto = () => {
    if (busy) return;
    const n = PHOTO_POOL[counters.current.photo++ % PHOTO_POOL.length];
    setBusy("upload");
    setStatus(copy.uploadingPhoto);
    later(() => add({ kind: "img", src: DEMO_PHOTO(n) }, copy.photoAdded, { kind: "img", src: DEMO_PHOTO(n) }), 1150);
  };
  const addVideo = () => {
    if (busy) return;
    setBusy("upload");
    setStatus(copy.uploadingVideo);
    later(() => add({ kind: "video", src: DEMO_PHOTO(4) }, copy.videoAdded), 1300);
  };
  const addVoice = () => {
    if (busy) return;
    setBusy("rec");
    setStatus(copy.recording.replace("{time}", "0:01"));
    [2, 3, 4].forEach((second, index) => later(() => setStatus(copy.recording.replace("{time}", `0:0${second}`)), 600 * (index + 1)));
    later(() => add({ kind: "voice", text: "0:04" }, copy.voiceAdded), 2300);
  };

  const activeSlide = slide % slides.length;
  const tiles = items.slice(0, 8);
  const moments = copy.moments.replace("{count}", String(items.length + 1));

  return (
    <section id="demo" className="scroll-mt-20 px-[clamp(16px,4vw,48px)] py-[clamp(72px,9vw,128px)]">
      <div className="mx-auto max-w-[1320px]">
        <div data-reveal className="mx-auto mb-[clamp(40px,5vw,64px)] max-w-[720px] text-center">
          <div className="text-[12px] font-semibold tracking-[.16em] whitespace-nowrap text-gm-accent uppercase">{copy.eyebrow}</div>
          <h2 className="mt-3.5! font-serif text-[clamp(31.2px,3.9vw,52.5px)] leading-[1.08] font-normal tracking-[-0.02em] text-balance">{copy.heading}</h2>
          <p className="mx-auto! mt-4! max-w-[560px] text-[18px] leading-[1.55] text-pretty text-gm-muted">{copy.text}</p>
        </div>

        <div data-reveal className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,320px),1fr))] items-center gap-[clamp(28px,4vw,56px)]">
          <div className="flex min-w-0 justify-center">
            <div className="w-[min(360px,100%)] rounded-[48px] bg-gm-ink p-2.5 shadow-[0_30px_60px_rgba(40,30,20,.24)]">
              <div className="relative h-[min(720px,150vw)] overflow-hidden rounded-[39px] bg-[#fdf5f8] font-[system-ui,-apple-system,'Segoe_UI',sans-serif] text-[#2b1a1f]">
                <div className="h-full overflow-y-auto [scrollbar-width:none]">
                  <div className="relative h-[210px]">
                    <img src={DEMO_PHOTO(3)} alt="" className="absolute inset-0 size-full object-cover" />
                    <span className="absolute inset-0 bg-[linear-gradient(180deg,rgba(30,15,20,.25),rgba(30,15,20,.62))]" />
                    <span className="absolute inset-x-0 top-[78px] text-center text-white">
                      <span className="block text-[10px] font-semibold tracking-[.14em]">{copy.eventMeta}</span>
                      <span className="block font-[Georgia,'Times_New_Roman',serif] text-[34px] leading-[1.2]">{copy.eventName}</span>
                    </span>
                  </div>
                  <div className="relative mx-3 -mt-[34px] flex flex-col gap-2 rounded-[18px] bg-white px-3.5 pt-5 pb-3.5 text-center shadow-[0_12px_28px_rgba(60,20,40,.08)]">
                    <span className="text-[10px] font-bold tracking-[.12em] text-[#a3134f]">{copy.phone.kicker}</span>
                    <span className="text-[18px] leading-[1.2] font-bold">{copy.phone.title}</span>
                    <span className="text-[12.5px] text-[#6b5a5f]">{copy.phone.text}</span>
                    <button
                      type="button"
                      onClick={addPhoto}
                      disabled={Boolean(busy)}
                      className="mt-1.5 flex cursor-pointer flex-col items-center gap-1.5 rounded-[14px] border-[1.5px] border-dashed border-[#e7a7c0] bg-[#fdf1f6] px-2.5 py-4 text-[#2b1a1f]! transition-[background,transform] duration-150 hover:bg-[#fbe6ef] active:scale-[.98] disabled:cursor-wait"
                    >
                      <span aria-hidden="true" className="grid size-[38px] place-items-center rounded-[11px] bg-[#a3134f] text-[17px] text-white">▣</span>
                      <span className="text-[14.5px] font-bold">{copy.phone.choose}</span>
                      <span className="text-[11.5px] text-[#6b5a5f]">{copy.phone.chooseNote}</span>
                    </button>
                    <button type="button" onClick={addPhoto} disabled={Boolean(busy)} className={optionButton}><span aria-hidden="true">◎</span>{copy.phone.takePhoto}</button>
                    <button type="button" onClick={addVideo} disabled={Boolean(busy)} className={optionButton}><span aria-hidden="true" className="text-[11px]">▶</span>{copy.phone.addVideo}</button>
                    <button type="button" onClick={addVoice} disabled={Boolean(busy)} className={optionButton}><span aria-hidden="true" className="text-[11px]">●</span>{copy.phone.voice}</button>
                    <div aria-live="polite" className="relative flex min-h-[34px] items-center justify-center gap-2 overflow-hidden rounded-[10px] bg-[#fbf3f6] px-2.5 text-[12px] font-semibold text-[#6b3a4c]">
                      {busy === "upload" ? <span key={status} className="absolute inset-0 origin-left animate-[gmBar_1.1s_cubic-bezier(.4,0,.2,1)_both] bg-[#f6d6e3]" /> : null}
                      {busy === "rec" ? <span className="relative size-2 animate-[gmPulse_.9s_infinite] rounded-full bg-[#c2185b]" /> : null}
                      <span className="relative">{status}</span>
                    </div>
                  </div>
                  <div className="px-3 pt-[22px] pb-5">
                    <div className="mb-0.5 text-[10px] font-bold tracking-[.12em] text-[#a3134f]">{copy.phone.shared}</div>
                    <div className="mb-3 flex items-baseline justify-between">
                      <span className="font-[Georgia,'Times_New_Roman',serif] text-[24px]">{copy.favourites}</span>
                      <span className="text-[12px] text-[#6b5a5f] tabular-nums">{moments}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-1.5">
                      {tiles.map((item, index) => (
                        <div key={`${items.length}-${index}`} className="relative aspect-[4/5] overflow-hidden rounded-md bg-[#efe4e8]">
                          {item.src && item.kind !== "voice" ? <img src={item.src} alt="" loading="lazy" className="absolute inset-0 size-full object-cover" /> : null}
                          {item.kind === "video" ? <span className="absolute top-2 left-2 rounded-full bg-[rgba(40,25,30,.6)] px-2 py-[3px] text-[10px] font-semibold text-white">▶ 0:18</span> : null}
                          {item.kind === "voice" ? (
                            <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 bg-[#a3134f] text-[12px] font-semibold text-white">
                              <span className="text-[20px]">●</span>{copy.voiceShort} · {item.text}
                            </div>
                          ) : null}
                          <span aria-hidden="true" className="absolute top-2 right-2 grid size-[30px] place-items-center rounded-full bg-[rgba(60,45,40,.5)] text-[14px] text-white">♡</span>
                          <span aria-hidden="true" className="absolute right-2 bottom-2 rounded-full bg-[rgba(60,45,40,.6)] px-[9px] py-1 text-[11px] font-bold text-white">◌ {COMMENTS[index]}</span>
                          {fresh && index === 0 ? <div className="pointer-events-none absolute inset-0 animate-[gmRing_1.6s_.4s_ease-out_both] rounded-md shadow-[inset_0_0_0_3px_#a3134f]" /> : null}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex min-w-0 flex-col gap-4">
            <div className="rounded-[22px] bg-gm-ink p-3 shadow-[0_30px_60px_rgba(40,30,20,.22)]">
              <div className="relative aspect-video overflow-hidden rounded-xl bg-[#0f0d0b]">
                {slides.map((item, index) => {
                  const on = index === activeSlide;
                  return (
                    <div key={index} className={cn("absolute inset-0 transition-opacity duration-[900ms] ease-in-out", on ? "opacity-100" : "opacity-0")}>
                      {item.kind === "img" ? (
                        <>
                          <img src={item.src} alt="" className={cn("absolute inset-0 size-full object-cover transition-transform duration-[6s] ease-linear", on ? "scale-110" : "scale-100")} />
                          <span className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0)_55%,rgba(0,0,0,.55))]" />
                        </>
                      ) : null}
                      {item.kind === "shot" ? <img src={item.src} alt={copy.slideAlt} className="absolute inset-0 size-full object-cover" /> : null}
                      {item.kind === "wish" ? (
                        <div className="absolute inset-0 grid place-items-center bg-[#2a2521] p-[8%] text-center text-gm-bg">
                          <div>
                            <div className="font-serif text-[clamp(18px,2.5vw,36.1px)] leading-[1.1] text-balance">“{item.text}”</div>
                            <div className="mt-3.5 text-[14px] text-[#e0b3aa]">{item.name}</div>
                          </div>
                        </div>
                      ) : null}
                    </div>
                  );
                })}
                <div className="absolute top-3.5 left-4 flex items-center gap-2 rounded-full bg-black/45 px-3 py-1.5 text-[12px] font-semibold tracking-[.08em] text-white uppercase backdrop-blur-[6px]">
                  <span className="size-[7px] animate-[gmPulse_1.4s_infinite] rounded-full bg-[#e0584a]" />{copy.live}
                </div>
                {slideNew ? (
                  <div className="absolute top-3.5 right-4 animate-[gmPop_.45s_cubic-bezier(.2,.7,.2,1)_both] rounded-full bg-gm-accent px-3 py-1.5 text-[12px] font-semibold text-white">{copy.justAdded}</div>
                ) : null}
                <div className="absolute right-3.5 bottom-3.5 flex items-center gap-2.5 rounded-[10px] bg-white p-2 shadow-[0_8px_20px_rgba(0,0,0,.25)]">
                  <FakeQr className="size-[46px]" />
                  <span className="hidden max-w-[5.5em] pr-1 text-[12px] leading-[1.25] font-semibold text-gm-ink min-[1180px]:block">{copy.scan}</span>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2.5">
              <p className="max-w-[420px] text-[15px] text-pretty text-gm-muted">{copy.note}</p>
              <a href={demoHref} className="flex items-center gap-2 rounded-full border border-gm-ink px-[18px] py-3 text-[15px] font-semibold transition-colors duration-200 hover:bg-gm-ink hover:text-gm-bg!">{copy.openDemo}</a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
