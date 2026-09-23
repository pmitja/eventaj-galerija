import Link from "next/link";
import type { Locale } from "@/lib/i18n/locale";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { localizedMarketingScreenshot } from "@/lib/i18n/marketing-assets";
import { demoEventPath, eventUseCaseMarketingPath, orderPath } from "@/lib/i18n/routes";
import { fill, getSiteCopy } from "@/lib/i18n/site";
import { brandName, supportEmail } from "@/lib/seo";
import { eventUseCasesFor } from "@/components/landing/use-cases";
import { cn } from "@/lib/utils";
import { FaqAccordion, type FaqEntry } from "./faq-accordion";
import { FinalCta } from "./final-cta";
import { HowItWorks } from "./how-it-works";
import { LiveDemo } from "./live-demo";
import { PricingSection } from "./pricing-section";
import { QrPlacementSection } from "./qr-placement";
import { DisplayText } from "./primitives";

export function screenshotsFor(locale: Locale) {
  return {
    gallery: localizedMarketingScreenshot(locale, "/marketing/screenshots/gallery-desktop-frame.png"),
    email: localizedMarketingScreenshot(locale, "/marketing/screenshots/email-qr.png"),
    live: localizedMarketingScreenshot(locale, "/marketing/screenshots/liveshow-desktop.png"),
  };
}

export function MadeForStrip({ locale, activeSlug }: { locale: Locale; activeSlug?: string }) {
  const t = getSiteCopy(locale).hero;
  return (
    <section aria-label={t.madeFor} className="px-[clamp(16px,4vw,48px)] pt-2 pb-[clamp(48px,6vw,80px)]">
      <div className="mx-auto flex max-w-[1320px] flex-wrap items-center justify-center gap-2.5">
        <span className="mr-1.5 text-[14px] text-gm-muted">{t.madeFor}</span>
        {eventUseCasesFor(locale).map((item, index) => {
          const active = activeSlug ? item.slug === activeSlug : index === 0;
          return (
            <Link
              key={item.slug}
              href={eventUseCaseMarketingPath(locale, item.slug)}
              className={cn(
                "rounded-full px-[18px] py-2.5 text-[15px] font-medium transition-[border-color,background] duration-200",
                active ? "bg-gm-ink text-gm-bg! hover:bg-gm-accent hover:text-white!" : "border border-gm-line-strong hover:border-gm-ink hover:text-gm-ink!",
              )}
            >
              {item.navTitle}
            </Link>
          );
        })}
      </div>
    </section>
  );
}

export function HowItWorksBlock({ locale, steps = 3, heading }: { locale: Locale; steps?: 3 | 4; heading?: string }) {
  const site = getSiteCopy(locale);
  return (
    <HowItWorks
      screenshots={screenshotsFor(locale)}
      copy={{
        ...site.steps,
        heading: heading ?? site.steps.heading,
        items: site.steps.items.slice(0, steps),
        liveAlt: site.demo.slideAlt,
        phone: site.phone,
        eventMeta: site.hero.eventMeta,
        eventName: site.hero.eventName,
      }}
    />
  );
}

export function LiveDemoBlock({ locale }: { locale: Locale }) {
  const site = getSiteCopy(locale);
  return (
    <LiveDemo
      demoHref={demoEventPath(locale)}
      liveshowShot={screenshotsFor(locale).live}
      copy={{
        ...site.demo,
        phone: site.phone,
        eventMeta: site.hero.eventMeta,
        eventName: site.hero.eventName,
        favourites: site.hero.favourites,
        moments: site.hero.moments,
      }}
    />
  );
}

export function PlacementBlock({ locale }: { locale: Locale }) {
  const site = getSiteCopy(locale);
  return <QrPlacementSection {...site.placement} items={getDictionary(locale).qrPlacement.items} />;
}

export function PricingBlock({ locale, wedding = true, headingLevel }: { locale: Locale; wedding?: boolean; headingLevel?: "h1" | "h2" }) {
  const copy = getSiteCopy(locale).pricing;
  return (
    <PricingSection
      locale={locale}
      copy={copy}
      heading={wedding ? copy.heading : copy.headingGeneral}
      orderHref={orderPath(locale)}
      headingLevel={headingLevel}
    />
  );
}

/** "Something we didn't cover? Write to {email}." with the address linked. */
export function ContactLine({ locale, template, className }: { locale: Locale; template: string; className?: string }) {
  const email = supportEmail(locale);
  const [before, after = ""] = template.split("{email}");
  return (
    <p className={className}>
      {before}<a href={`mailto:${email}`} className="text-gm-accent! underline! underline-offset-[3px]">{email}</a>{after}
    </p>
  );
}

export function FaqBlock({ locale, heading, items, eyebrow }: { locale: Locale; heading?: string; items: readonly FaqEntry[]; eyebrow?: string }) {
  const t = getSiteCopy(locale).faq;
  return (
    <section id="faq" className="scroll-mt-20 border-t border-gm-sand bg-gm-paper px-[clamp(16px,4vw,48px)] py-[clamp(72px,9vw,128px)]">
      <div data-reveal className="mx-auto grid max-w-[1180px] grid-cols-[repeat(auto-fit,minmax(min(100%,340px),1fr))] items-start gap-[clamp(32px,5vw,80px)]">
        <div className="flex flex-col gap-[18px]">
          <div className="text-[12px] font-semibold tracking-[.16em] whitespace-nowrap text-gm-accent uppercase">{eyebrow ?? t.eyebrow}</div>
          <h2 className="font-serif text-[clamp(31.2px,3.9vw,52.5px)] leading-[1.08] font-normal tracking-[-0.02em]"><DisplayText value={heading ?? t.heading} /></h2>
          <ContactLine locale={locale} template={t.contact} className="max-w-[380px] text-[17px] leading-[1.55] text-gm-muted" />
        </div>
        <FaqAccordion items={items} className="flex flex-col border-t border-gm-line" />
      </div>
    </section>
  );
}

/** The nine home-page questions, in the design's order. */
export function homeFaq(locale: Locale): FaqEntry[] {
  const t = getSiteCopy(locale).faq;
  return t.homeItems.map((index) => ({ q: t.items[index][0], a: t.items[index][1] }));
}

export function FinalCtaBlock({ locale, wedding = true, cta }: { locale: Locale; wedding?: boolean; cta?: string }) {
  const t = getSiteCopy(locale).finalCta;
  return (
    <FinalCta
      heading={wedding ? t.heading : t.headingGeneral}
      text={t.text}
      cta={cta ?? (wedding ? t.ctaWedding : t.ctaGeneral)}
      note={t.note}
      href={orderPath(locale)}
    />
  );
}

export function brandFill(locale: Locale, template: string) {
  return fill(template, { brand: brandName(locale) });
}
