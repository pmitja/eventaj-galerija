import Link from "next/link";
import type { Locale } from "@/lib/i18n/locale";
import { marketingHomeHref, orderPath } from "@/lib/i18n/routes";
import { getSiteCopy } from "@/lib/i18n/site";
import { brandName, guestBrandMark } from "@/lib/seo";
import { DEMO_PHOTO, PLACEMENT_PHOTO } from "./demo-photos";
import { EventHero } from "./event-hero";
import { DisplayText, withAccent } from "./primitives";
import { brandFill, FaqBlock, FinalCtaBlock, HowItWorksBlock, LiveDemoBlock, PlacementBlock } from "./sections";
import { SitePage } from "./site-chrome";

export type EventLandingData = {
  breadcrumb: string;
  eyebrow: string;
  title: string;
  description: string;
  primaryCta: string;
  secondaryCta: string;
  heroImage: string;
  heroAlt: string;
  /** Photos for the scrolling strip under the hero. */
  strip: readonly string[];
  benefits: {
    eyebrow: string;
    heading: string;
    intro: string;
    items: readonly { title: string; description?: string; image: string }[];
  };
  offer: {
    eyebrow: string;
    heading: string;
    text: string;
    priceNote: string;
    items: readonly string[];
    cta: string;
  };
  clarity: { eyebrow: string; heading: string; text: string; items: readonly string[]; image: string };
  comparison?: {
    eyebrow: string;
    heading: string;
    text: string;
    task: string;
    product: string;
    alternative: string;
    rows: readonly (readonly [string, string, string])[];
    diy: { eyebrow: string; heading: string; text: string; when: string; whenText: string; paidWhen: string; paidWhenText: string; cta: string };
  };
  faq: { heading: string; items: readonly (readonly [string, string])[] };
  related?: { heading: string; action?: { label: string; href: string }; links: readonly { kicker: string; title: string; text?: string; href: string }[] };
  wedding: boolean;
};

const STRIP_WIDTHS = [220, 300, 220, 220, 300, 220, 220, 300];
const checkBadge = "mt-px grid size-5 flex-none place-items-center rounded-full bg-gm-blush text-[11px] font-bold text-gm-accent-dark";

function Heading2({ value }: { value: string }) {
  return (
    <h2 className="mt-3.5! font-serif text-[clamp(31.2px,3.9vw,52.5px)] leading-[1.08] font-normal tracking-[-0.02em] text-balance">
      <DisplayText value={withAccent(value)} />
    </h2>
  );
}

const eyebrowClass = "text-[12px] font-semibold tracking-[.16em] text-gm-accent uppercase";

export function EventLanding({ locale, data }: { locale: Locale; data: EventLandingData }) {
  const site = getSiteCopy(locale);
  const e = site.event;
  const order = orderPath(locale);
  const strip = [...data.strip, ...data.strip];

  return (
    <SitePage locale={locale}>
      <EventHero
        breadcrumb={{ home: brandName(locale), homeHref: marketingHomeHref(locale), current: data.breadcrumb }}
        eyebrow={data.eyebrow}
        title={withAccent(data.title)}
        description={data.description}
        primaryCta={data.primaryCta}
        secondaryCta={data.secondaryCta}
        orderHref={order}
        stats={[[e.fromPrice, e.fromPriceNote], [e.unlimited, e.guests], [e.days, e.daysNote]]}
        image={data.heroImage}
        imageAlt={data.heroAlt}
        qrCard={e.qrCard}
        qrCardName={e.qrCardName}
        qrLabel={e.qrLabel}
        toastPhotos={e.toastPhotos}
        toastVoice={e.toastVoice}
      />

      <section aria-label={e.stripText} className="overflow-hidden pb-[clamp(56px,7vw,96px)]">
        <div className="flex w-max animate-[gmMarq_70s_linear_infinite] gap-3.5 hover:[animation-play-state:paused]">
          {strip.map((src, index) => (
            <div key={index} style={{ width: STRIP_WIDTHS[index % STRIP_WIDTHS.length] }} className="group h-[280px] flex-none overflow-hidden rounded-[18px] bg-gm-sand" aria-hidden={index >= data.strip.length ? true : undefined}>
              <img src={src} alt="" loading="lazy" className="size-full object-cover transition-transform duration-[800ms] ease-gm group-hover:scale-[1.06]" />
            </div>
          ))}
        </div>
        <p className="mx-auto! mt-[22px]! px-4 text-center text-[15px] text-gm-muted">{e.stripText}</p>
      </section>

      <HowItWorksBlock locale={locale} steps={4} />

      <section className="px-[clamp(16px,4vw,48px)] py-[clamp(72px,9vw,128px)]">
        <div className="mx-auto max-w-[1320px]">
          <div data-reveal className="mb-[clamp(36px,4vw,56px)] flex flex-wrap items-end justify-between gap-x-16 gap-y-5">
            <div className="max-w-[720px]">
              <div className={eyebrowClass}>{data.benefits.eyebrow}</div>
              <Heading2 value={data.benefits.heading} />
            </div>
            <p className="max-w-[420px] text-[17px] leading-[1.55] text-pretty text-gm-muted">{data.benefits.intro}</p>
          </div>
          <div data-reveal className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,260px),1fr))] gap-4">
            {data.benefits.items.map((item, index) => (
              <div key={item.title} className="relative flex min-h-[340px] flex-col justify-between overflow-hidden rounded-3xl border border-gm-line bg-gm-paper p-[26px] transition-[transform,box-shadow] duration-[400ms] ease-gm hover:-translate-y-1.5 hover:shadow-[0_24px_50px_rgba(40,30,20,.12)]">
                <span className="font-serif text-[45.9px] leading-[1.08] text-gm-accent">{String(index + 1).padStart(2, "0")}</span>
                <div className="my-[18px] h-[120px] overflow-hidden rounded-[14px]"><img src={item.image} alt="" loading="lazy" className="size-full object-cover" /></div>
                <div>
                  <h3 className="mb-2! text-[20px] font-semibold tracking-[-0.01em]">{item.title}</h3>
                  {item.description ? <p className="text-[15px] leading-[1.55] text-pretty text-gm-muted">{item.description}</p> : null}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <LiveDemoBlock locale={locale} />
      <PlacementBlock locale={locale} />

      <section id="pricing" className="scroll-mt-20 px-[clamp(16px,4vw,48px)] py-[clamp(72px,9vw,128px)]">
        <div className="mx-auto max-w-[1180px]">
          <div data-reveal className="mx-auto mb-[clamp(40px,5vw,64px)] max-w-[760px] text-center">
            <div className={eyebrowClass}>{data.offer.eyebrow}</div>
            <Heading2 value={data.offer.heading} />
            <p className="mx-auto! mt-4! text-[18px] leading-[1.55] text-gm-muted">{data.offer.text}</p>
          </div>
          <div data-reveal className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,420px),1fr))] gap-5">
            <div className="flex flex-col gap-[26px] rounded-[28px] border border-gm-line bg-gm-paper p-[clamp(26px,3.4vw,44px)] shadow-[0_30px_60px_rgba(40,30,20,.08)]">
              <div className="flex flex-wrap items-baseline gap-2.5">
                <span className="font-serif text-[clamp(59px,6.6vw,78.7px)] leading-[.85]">{e.fromPrice}</span>
                <span className="text-[15px] text-gm-muted">{data.offer.priceNote}</span>
              </div>
              <ul className="m-0 grid list-none grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-x-6 gap-y-3.5 border-t border-gm-sand px-0 pt-[22px] pb-0">
                {data.offer.items.map((item) => (
                  <li key={item} className="flex gap-2.5 text-[15px] leading-[1.4]"><span aria-hidden="true" className={checkBadge}>✓</span>{item}</li>
                ))}
              </ul>
              <Link href={order} className="mt-auto flex items-center justify-between rounded-full bg-gm-accent px-[26px] py-5 text-[17px] font-semibold text-white! shadow-[0_10px_24px_rgba(168,69,58,.28)] transition-[background,transform] duration-200 hover:-translate-y-0.5 hover:bg-gm-accent-dark hover:text-white!">
                <span>{data.offer.cta}</span><span aria-hidden="true">→</span>
              </Link>
              <span className="-mt-3 text-center text-[13px] text-gm-muted">{site.finalCta.note}</span>
            </div>
            <div className="relative flex min-h-[460px] flex-col gap-[22px] overflow-hidden rounded-[28px] bg-gm-ink p-[clamp(26px,3.4vw,44px)] text-gm-bg">
              <img src={data.clarity.image} alt="" loading="lazy" className="absolute inset-0 size-full object-cover opacity-[.28]" />
              <span className="absolute inset-0 bg-[linear-gradient(180deg,rgba(29,27,25,.55),rgba(29,27,25,.95)_70%)]" />
              <div className="relative mt-auto flex flex-col gap-[18px]">
                <div className="text-[12px] font-semibold tracking-[.16em] text-[#e0b3aa] uppercase">{data.clarity.eyebrow}</div>
                <h3 className="font-serif text-[clamp(24.6px,2.5vw,34.4px)] leading-[1.05] font-normal">{data.clarity.heading}</h3>
                <p className="text-[16px] leading-[1.55] text-gm-line-strong">{data.clarity.text}</p>
                <ul className="m-0 flex list-none flex-col gap-2.5 p-0 text-[15px]">
                  {data.clarity.items.map((item) => <li key={item} className="flex gap-2.5"><span className="text-[#e0b3aa]">✓</span>{item}</li>)}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {data.comparison ? <ComparisonSection locale={locale} comparison={data.comparison} /> : null}

      <FaqBlock locale={locale} heading={data.faq.heading} items={data.faq.items.map(([q, a]) => ({ q, a }))} />

      {data.related && data.related.links.length ? (
        <section aria-label={data.related.heading} className="bg-gm-paper px-[clamp(16px,4vw,48px)] pb-[clamp(64px,8vw,104px)]">
          <div className="mx-auto grid max-w-[1180px] grid-cols-[repeat(auto-fit,minmax(min(100%,320px),1fr))] gap-4">
            <div className="col-span-full flex flex-wrap items-baseline justify-between gap-3">
              <h2 className="text-[13px] font-semibold tracking-[.1em] text-gm-muted uppercase">{data.related.heading}</h2>
              {data.related.action ? <Link href={data.related.action.href} className="text-[15px] font-semibold text-gm-accent!">{data.related.action.label} →</Link> : null}
            </div>
            {data.related.links.map((link) => (
              <Link key={link.href} href={link.href} className="flex items-center justify-between gap-4 rounded-[20px] border border-gm-line px-7 py-[26px] transition-[border-color,transform] duration-200 hover:-translate-y-[3px] hover:border-gm-ink hover:text-gm-ink!">
                <span>
                  <span className="block text-[13px] text-gm-muted">{link.kicker}</span>
                  <span className="font-serif text-[23px] leading-[1.1]">{link.title}</span>
                  {link.text ? <span className="mt-1 block text-[14px] text-gm-muted">{link.text}</span> : null}
                </span>
                <span aria-hidden="true" className="text-[20px]">→</span>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <FinalCtaBlock locale={locale} wedding={data.wedding} />
    </SitePage>
  );
}

export function ComparisonSection({ locale, comparison }: { locale: Locale; comparison: NonNullable<EventLandingData["comparison"]> }) {
  const order = orderPath(locale);
  const mark = guestBrandMark(locale);
  return (
        <section id="compare" className="scroll-mt-20 border-t border-gm-sand bg-gm-paper px-[clamp(16px,4vw,48px)] py-[clamp(72px,9vw,128px)]">
          <div className="mx-auto max-w-[1180px]">
            <div data-reveal className="mx-auto mb-[clamp(40px,5vw,56px)] max-w-[760px] text-center">
              <div className={eyebrowClass}>{comparison.eyebrow}</div>
              <Heading2 value={comparison.heading} />
              <p className="mx-auto! mt-4! text-[18px] leading-[1.55] text-pretty text-gm-muted">{comparison.text}</p>
            </div>
            <div data-reveal role="table" className="overflow-hidden rounded-3xl border border-gm-line bg-gm-bg">
              <div role="row" className="grid grid-cols-[minmax(0,.8fr)_minmax(0,1fr)_minmax(0,1fr)] text-[13px] font-semibold tracking-[.1em] uppercase max-[560px]:text-[11px]">
                <span role="columnheader" className="px-5 py-[18px] text-gm-muted max-[560px]:px-3">{comparison.task}</span>
                <span role="columnheader" className="flex items-center gap-2 bg-gm-accent px-5 py-[18px] text-white max-[560px]:px-3">
                  {mark ? <img src={mark} alt="" className="size-[18px] object-contain brightness-0 invert" /> : null}{comparison.product}
                </span>
                <span role="columnheader" className="px-5 py-[18px] text-gm-muted max-[560px]:px-3">{comparison.alternative}</span>
              </div>
              {comparison.rows.map(([task, ours, theirs]) => (
                <div key={task} role="row" className="grid grid-cols-[minmax(0,.8fr)_minmax(0,1fr)_minmax(0,1fr)] border-t border-gm-line transition-colors duration-200 hover:bg-gm-paper max-[560px]:text-[14px]">
                  <span role="rowheader" className="p-5 font-semibold max-[560px]:p-3">{task}</span>
                  <span role="cell" className="flex gap-2.5 bg-gm-blush-soft p-5 leading-[1.45] max-[560px]:p-3"><span aria-hidden="true" className={`${checkBadge} max-[560px]:hidden`}>✓</span>{ours}</span>
                  <span role="cell" className="p-5 leading-[1.45] text-gm-muted max-[560px]:p-3">{theirs}</span>
                </div>
              ))}
            </div>
            <div data-reveal className="mt-[clamp(48px,6vw,80px)] grid grid-cols-[repeat(auto-fit,minmax(min(100%,320px),1fr))] gap-4">
              <div className="col-span-full mb-2 flex flex-wrap items-end justify-between gap-x-12 gap-y-3">
                <div>
                  <div className={eyebrowClass}>{comparison.diy.eyebrow}</div>
                  <h3 className="mt-3! font-serif text-[clamp(24.6px,2.8vw,37.7px)] leading-[1.05] font-normal">{comparison.diy.heading}</h3>
                </div>
                <p className="max-w-[520px] text-[16px] leading-[1.55] text-pretty text-gm-muted">{comparison.diy.text}</p>
              </div>
              <div className="flex flex-col gap-2.5 rounded-[22px] border border-gm-line bg-gm-bg p-7">
                <span className="text-[13px] font-semibold tracking-[.1em] text-gm-muted uppercase">{comparison.diy.when}</span>
                <p className="text-[18px] leading-[1.5]">{comparison.diy.whenText}</p>
              </div>
              <div className="flex flex-col gap-2.5 rounded-[22px] bg-gm-accent p-7 text-white">
                <span className="text-[13px] font-semibold tracking-[.1em] text-[#f6dcd6] uppercase">{comparison.diy.paidWhen}</span>
                <p className="text-[18px] leading-[1.5]">{comparison.diy.paidWhenText}</p>
                <Link href={order} className="mt-2 self-start rounded-full bg-white px-[18px] py-3 text-[15px] font-semibold text-gm-ink! hover:text-gm-accent!">{comparison.diy.cta}</Link>
              </div>
            </div>
          </div>
        </section>
  );
}

/** Photo sets per occasion; only the Anna & Mark demo wedding ships with the app. */
export function eventPhotos(kind: "wedding" | "party" | "business") {
  const photo = (source: number | "table" | "menu-card" | "projection" | "welcome-sign") =>
    typeof source === "number" ? DEMO_PHOTO(source) : PLACEMENT_PHOTO(source);
  // Non-wedding pages lean on the crowd, table and QR-placement shots rather than the couple.
  const sets = {
    wedding: { hero: 5, benefits: [3, 6, 4, 7], clarity: 1, strip: [1, 2, 3, 4, 6, 7, 8, 9] },
    party: { hero: 8, benefits: [3, 2, "table", 6], clarity: 2, strip: [3, "table", 8, 2, "projection", 6, "menu-card", 8] },
    business: { hero: "projection", benefits: [8, "table", 2, 3], clarity: 8, strip: [8, "projection", 2, "table", 3, "menu-card", 6, 2] },
  }[kind] as { hero: Parameters<typeof photo>[0]; benefits: Parameters<typeof photo>[0][]; clarity: Parameters<typeof photo>[0]; strip: Parameters<typeof photo>[0][] };
  return {
    hero: photo(sets.hero),
    benefits: sets.benefits.map(photo),
    clarity: photo(sets.clarity),
    strip: sets.strip.map(photo),
  };
}

export { brandFill };
