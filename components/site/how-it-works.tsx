"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { DEMO_PHOTO } from "./demo-photos";
import { DisplayText } from "./primitives";

export type HowItWorksCopy = {
  eyebrow: string;
  heading: string;
  label: string;
  items: readonly (readonly [string, string])[];
  galleryAlt: string;
  emailAlt: string;
  liveAlt: string;
  phone: { kicker: string; title: string; text: string; choose: string; chooseNote: string; takePhoto: string; addVideo: string; voice: string; footer: string };
  eventMeta: string;
  eventName: string;
};

const STEP_MS = 6000;
const TICK_MS = 60;

/** Static guest upload card, as the guest sees it after scanning the QR code. */
function UploadPhone({ copy }: { copy: HowItWorksCopy }) {
  const p = copy.phone;
  return (
    <div className="w-[min(270px,72vw)] animate-[gmUp_.55s_cubic-bezier(.2,.7,.2,1)_both] rounded-[42px] bg-gm-ink p-[9px] shadow-[0_24px_50px_rgba(40,30,20,.22)]">
      <div className="relative aspect-[9/19] overflow-hidden rounded-[34px] bg-[#fdf5f8] font-[system-ui,-apple-system,sans-serif] text-[#2b1a1f]">
        <div className="relative h-[27%]">
          <img src={DEMO_PHOTO(3)} alt="" className="absolute inset-0 size-full object-cover" />
          <span className="absolute inset-0 bg-[linear-gradient(180deg,rgba(30,15,20,.25),rgba(30,15,20,.6))]" />
          <span className="absolute inset-x-0 top-[34%] text-center text-white">
            <span className="block text-[8px] font-semibold tracking-[.14em]">{copy.eventMeta}</span>
            <span className="block font-[Georgia,serif] text-[26px] leading-[1.2]">{copy.eventName}</span>
          </span>
        </div>
        <div className="relative mx-[4%] -mt-[7%] flex flex-col gap-[7px] rounded-[14px] bg-white px-3 pt-4 pb-3 text-center shadow-[0_10px_24px_rgba(60,20,40,.08)]">
          <span className="text-[8px] font-bold tracking-[.12em] text-[#a3134f]">{p.kicker}</span>
          <span className="text-[14px] leading-[1.2] font-bold">{p.title}</span>
          <span className="text-[9.5px] text-[#6b5a5f]">{p.text}</span>
          <span className="mt-1 flex flex-col items-center gap-[5px] rounded-[10px] border-[1.5px] border-dashed border-[#e7a7c0] bg-[#fdf1f6] px-2 py-3">
            <span className="grid size-7 place-items-center rounded-lg bg-[#a3134f] text-[13px] text-white">▣</span>
            <span className="text-[11px] font-bold">{p.choose}</span>
            <span className="text-[8.5px] text-[#6b5a5f]">{p.chooseNote}</span>
          </span>
          <span className="rounded-[9px] border border-[#ecdfe4] p-[9px] text-[10.5px] font-semibold">◎ {p.takePhoto}</span>
          <span className="rounded-[9px] border border-[#ecdfe4] p-[9px] text-[10.5px] font-semibold">▶ {p.addVideo}</span>
          <span className="rounded-[9px] border border-[#ecdfe4] p-[9px] text-[10.5px] font-semibold">● {p.voice}</span>
        </div>
        <div className="absolute inset-x-0 bottom-[5%] text-center text-[9px] text-[#6b5a5f]">{p.footer}</div>
      </div>
    </div>
  );
}

export function HowItWorks({ copy, screenshots }: {
  copy: HowItWorksCopy;
  screenshots: { gallery: string; email: string; live: string };
}) {
  const count = copy.items.length;
  const [{ step, progress }, setState] = useState({ step: 0, progress: 0 });
  const setStep = (index: number) => setState({ step: index, progress: 0 });
  const paused = useRef(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => {
      if (paused.current) return;
      setState((current) => {
        const next = current.progress + TICK_MS / STEP_MS;
        return next >= 1 ? { step: (current.step + 1) % count, progress: 0 } : { step: current.step, progress: next };
      });
    }, TICK_MS);
    return () => window.clearInterval(timer);
  }, [count]);

  return (
    <section id="how-it-works" className="scroll-mt-20 border-y border-gm-sand bg-gm-paper px-[clamp(16px,4vw,48px)] py-[clamp(72px,9vw,128px)]">
      <div className="mx-auto max-w-[1320px]">
        <div data-reveal className="mx-auto mb-[clamp(40px,5vw,64px)] max-w-[720px] text-center">
          <div className="text-[12px] font-semibold tracking-[.16em] whitespace-nowrap text-gm-accent uppercase">{copy.eyebrow}</div>
          <h2 className="mt-3.5! font-serif text-[clamp(31.2px,3.9vw,52.5px)] leading-[1.08] font-normal tracking-[-0.02em] text-balance">
            <DisplayText value={copy.heading} />
          </h2>
        </div>
        <div data-reveal className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,380px),1fr))] items-center gap-[clamp(24px,4vw,64px)]">
          <div
            role="tablist"
            aria-label={copy.label}
            className="flex min-w-0 flex-col gap-2"
            onMouseEnter={() => { paused.current = true; }}
            onMouseLeave={() => { paused.current = false; }}
          >
            {copy.items.map(([title, body], index) => {
              const on = index === step;
              return (
                <button
                  key={title}
                  type="button"
                  role="tab"
                  id={`how-step-${index}`}
                  aria-selected={on}
                  aria-controls="how-step-panel"
                  onClick={() => setStep(index)}
                  className={cn(
                    "relative grid cursor-pointer grid-cols-[auto_1fr] gap-x-[18px] gap-y-1.5 overflow-hidden rounded-[20px] border p-[clamp(20px,2.2vw,28px)] text-left transition-[background,border-color,box-shadow] duration-[400ms]",
                    on ? "border-gm-line bg-white shadow-[0_16px_36px_rgba(40,30,20,.08)]" : "border-transparent bg-transparent",
                  )}
                >
                  <span className={cn("row-span-2 grid size-10 place-items-center rounded-full text-[15px] font-bold transition-colors duration-[400ms]", on ? "bg-gm-accent text-white" : "bg-gm-sand text-gm-muted")}>{index + 1}</span>
                  <span className="self-center text-[clamp(19px,1.6vw,22px)] font-semibold tracking-[-0.01em]">{title}</span>
                  <span className={cn("text-[16px] leading-[1.55] text-pretty text-gm-muted", !on && "max-[719px]:hidden")}>{body}</span>
                  <span aria-hidden="true" style={{ transform: `scaleX(${on ? progress.toFixed(3) : 0})` }} className="absolute inset-x-0 bottom-0 h-[3px] origin-left bg-gm-accent" />
                </button>
              );
            })}
          </div>

          <div
            id="how-step-panel"
            role="tabpanel"
            aria-labelledby={`how-step-${step}`}
            aria-live="polite"
            className="relative grid min-h-[clamp(400px,46vw,560px)] min-w-0 place-items-center overflow-hidden rounded-[28px] bg-gm-sand-soft px-5 py-9"
          >
            {step === 0 ? (
              <img key="gallery" src={screenshots.gallery} alt={copy.galleryAlt} className="block h-auto w-[min(640px,100%)] animate-[gmUp_.55s_cubic-bezier(.2,.7,.2,1)_both] drop-shadow-[0_24px_40px_rgba(40,30,20,.18)]" />
            ) : null}
            {step === 1 ? (
              <div key="email" className="aspect-[640/1020] w-[min(330px,100%)] animate-[gmUp_.55s_cubic-bezier(.2,.7,.2,1)_both] overflow-hidden rounded-[18px] bg-[#fdf6f9] shadow-[0_24px_50px_rgba(40,30,20,.16)]">
                <img src={screenshots.email} alt={copy.emailAlt} className="block h-full w-[103.9%] max-w-none object-cover object-[left_top]" />
              </div>
            ) : null}
            {step === 2 ? <UploadPhone key="phone" copy={copy} /> : null}
            {step === 3 ? (
              <div key="live" className="w-[min(620px,100%)] animate-[gmUp_.55s_cubic-bezier(.2,.7,.2,1)_both] rounded-[18px] bg-gm-ink p-2.5 shadow-[0_24px_50px_rgba(40,30,20,.2)]">
                <img src={screenshots.live} alt={copy.liveAlt} className="block aspect-video w-full rounded-[10px] object-cover" />
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
