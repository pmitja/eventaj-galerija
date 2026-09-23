"use client";

import Link from "next/link";
import { useState } from "react";
import { DEMO_PHOTO } from "./demo-photos";
import { FakeQr } from "./fake-qr";
import { DisplayText } from "./primitives";

export type EventHeroProps = {
  breadcrumb: { home: string; homeHref: string; current: string };
  eyebrow: string;
  title: string;
  description: string;
  primaryCta: string;
  secondaryCta: string;
  orderHref: string;
  stats: readonly (readonly [string, string])[];
  image: string;
  imageAlt: string;
  qrCard: string;
  qrCardName: string;
  qrLabel: string;
  toastPhotos: string;
  toastVoice: string;
};

export function EventHero(props: EventHeroProps) {
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const move = (factorX: number, factorY: number) => `translate3d(${(mouse.x * factorX).toFixed(1)}px,${(mouse.y * factorY).toFixed(1)}px,0)`;
  return (
    <section aria-label={props.eyebrow} className="relative overflow-hidden px-[clamp(16px,4vw,48px)] pt-[clamp(28px,4vw,48px)] pb-[clamp(56px,7vw,96px)]">
      <div className="mx-auto grid max-w-[1320px] grid-cols-[repeat(auto-fit,minmax(min(100%,460px),1fr))] items-center gap-[clamp(40px,6vw,96px)]">
        <div className="flex min-w-0 flex-col gap-[26px]">
          <nav aria-label="Breadcrumb" className="flex animate-[gmUp_.6s_both] flex-wrap gap-2 text-[14px] text-gm-muted">
            <Link href={props.breadcrumb.homeHref} className="text-gm-muted! hover:text-gm-accent!">{props.breadcrumb.home}</Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page" className="font-medium text-gm-ink">{props.breadcrumb.current}</span>
          </nav>
          <div className="animate-[gmUp_.7s_.05s_cubic-bezier(.2,.7,.2,1)_both] text-[12px] font-semibold tracking-[.16em] text-gm-accent uppercase">{props.eyebrow}</div>
          <h1 className="animate-[gmUp_.8s_.1s_cubic-bezier(.2,.7,.2,1)_both] font-serif text-[clamp(41px,5.4vw,82px)] leading-[1.08] font-normal tracking-[-0.02em] text-balance">
            <DisplayText value={props.title} emClassName="text-gm-accent" />
          </h1>
          <p className="max-w-[540px] animate-[gmUp_.8s_.18s_cubic-bezier(.2,.7,.2,1)_both] text-[clamp(17px,1.4vw,20px)] leading-[1.55] text-pretty text-gm-muted">{props.description}</p>
          <div className="flex animate-[gmUp_.8s_.26s_cubic-bezier(.2,.7,.2,1)_both] flex-wrap gap-3">
            <Link
              href={props.orderHref}
              data-sticky-cta-trigger="create-event"
              className="flex items-center gap-3.5 rounded-full bg-gm-accent px-7 py-[18px] text-[17px] font-semibold text-white! shadow-[0_10px_24px_rgba(168,69,58,.28)] transition-[background,transform] duration-200 hover:-translate-y-0.5 hover:bg-gm-accent-dark hover:text-white! min-[480px]:whitespace-nowrap"
            >
              {props.primaryCta} <span aria-hidden="true">→</span>
            </Link>
            <a href="#demo" className="flex items-center rounded-full border border-gm-line-strong bg-gm-paper px-[26px] py-[18px] text-[17px] font-semibold transition-[border-color,transform] duration-200 hover:-translate-y-0.5 hover:border-gm-ink hover:text-gm-ink! min-[480px]:whitespace-nowrap">
              {props.secondaryCta}
            </a>
          </div>
          <ul className="m-0 mt-1.5 grid animate-[gmUp_.8s_.34s_cubic-bezier(.2,.7,.2,1)_both] list-none grid-cols-3 gap-4 border-t border-gm-line px-0 pt-5 pb-0">
            {props.stats.map(([value, label]) => (
              <li key={label} className="flex flex-col gap-0.5">
                <span className="font-serif text-[clamp(21px,2vw,26.2px)] leading-[1.08]">{value}</span>
                <span className="text-[13px] text-gm-muted">{label}</span>
              </li>
            ))}
          </ul>
        </div>

        <div
          onMouseMove={(event) => {
            if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
            const rect = event.currentTarget.getBoundingClientRect();
            setMouse({ x: ((event.clientX - rect.left) / rect.width - 0.5) * 2, y: ((event.clientY - rect.top) / rect.height - 0.5) * 2 });
          }}
          onMouseLeave={() => setMouse({ x: 0, y: 0 })}
          className="relative h-[clamp(520px,52vw,700px)] min-w-0 animate-[gmIn_1s_.15s_both]"
        >
          <div style={{ transform: move(8, 6) }} className="absolute inset-x-[8%] top-0 bottom-[6%] overflow-hidden rounded-[999px_999px_28px_28px] shadow-[0_30px_70px_rgba(40,30,20,.2)] transition-transform duration-[600ms] ease-gm">
            <img src={props.image} alt={props.imageAlt} className="absolute -inset-[4%] size-[108%] max-w-none object-cover" />
          </div>
          <div style={{ transform: move(-16, -12) }} className="absolute bottom-0 left-0 w-[min(210px,42%)] transition-transform duration-[600ms] ease-gm">
            <div className="flex -rotate-4 flex-col items-center gap-2.5 rounded-2xl bg-gm-paper px-4 pt-[18px] pb-3.5 shadow-[0_24px_50px_rgba(40,30,20,.2)]">
              <span className="text-center font-serif text-[17.2px] leading-[1.05]"><DisplayText value={props.qrCard} emClassName="block" /></span>
              <FakeQr className="aspect-square w-[62%]" label={props.qrLabel} />
              <span className="text-center text-[11px] tracking-[.08em] text-gm-muted uppercase">{props.qrCardName}</span>
            </div>
          </div>
          <div style={{ transform: move(-22, -16) }} className="absolute top-[16%] right-0 flex flex-col items-end gap-2.5 transition-transform duration-[600ms] ease-gm">
            <span className="flex animate-[gmFloat_5s_ease-in-out_infinite] items-center gap-2.5 rounded-full bg-gm-paper py-2 pr-3.5 pl-2 text-[14px] font-semibold shadow-[0_14px_30px_rgba(40,30,20,.16)]">
              <img src={DEMO_PHOTO(2)} alt="" className="size-[34px] rounded-full object-cover" />{props.toastPhotos}
            </span>
            <span className="flex animate-[gmFloat_5s_1.2s_ease-in-out_infinite] items-center gap-2.5 rounded-full bg-gm-accent px-4 py-2.5 text-[14px] font-semibold text-white shadow-[0_14px_30px_rgba(168,69,58,.3)]">
              <span aria-hidden="true">●</span>{props.toastVoice}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
