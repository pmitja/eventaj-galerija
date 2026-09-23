import Link from "next/link";
import type { ReactNode } from "react";
import { comparisonPath } from "@/lib/comparisons/routes";
import type { Locale } from "@/lib/i18n/locale";
import { appUrlForLocale } from "@/lib/i18n/locale";
import {
  demoEventPath,
  eventUseCaseMarketingPath,
  eventUseCasePath,
  faqPath,
  featuresPath,
  homeSectionHref,
  marketingHomeHref,
  orderPath,
  pricingPath,
  privacyPath,
  solutionPagePath,
  termsPath,
} from "@/lib/i18n/routes";
import { getPublicAppUrls } from "@/lib/i18n/server";
import { getSiteCopy } from "@/lib/i18n/site";
import { brandName, guestBrandMark, supportEmail } from "@/lib/seo";
import { eventUseCaseGroupsFor, eventUseCasesFor } from "@/components/landing/use-cases";
import { SiteHeaderClient } from "./site-header-client";
import { StickyOrderBar } from "./sticky-order-bar";
import { DEMO_PHOTO } from "./demo-photos";
import { RevealController } from "./reveal-controller";


function Brand({ locale, size }: { locale: Locale; size: number }) {
  const mark = guestBrandMark(locale);
  return (
    <>
      {mark ? <img src={mark} alt="" width={size} height={size} style={{ width: size, height: size }} className="block object-contain" /> : null}
      <span className="whitespace-nowrap">{brandName(locale)}</span>
    </>
  );
}

export function SiteHeader({ locale }: { locale: Locale }) {
  const copy = getSiteCopy(locale);
  const groups = eventUseCaseGroupsFor(locale);
  const useCases = eventUseCasesFor(locale);
  const alternateOrigin = appUrlForLocale(getPublicAppUrls(), locale === "sl" ? "en" : "sl");
  return (
    <SiteHeaderClient
      locale={locale}
      alternateOrigin={alternateOrigin}
      brand={{ name: brandName(locale), mark: guestBrandMark(locale) ?? "", homeHref: marketingHomeHref(locale) }}
      copy={{ skipToContent: copy.skipToContent, ...copy.header }}
      links={{
        howItWorks: homeSectionHref(locale, "how-it-works"),
        liveDemo: homeSectionHref(locale, "demo"),
        pricing: pricingPath(locale),
        faq: faqPath(locale),
        demo: demoEventPath(locale),
        order: orderPath(locale),
      }}
      eventGroups={groups.map((label) => ({
        label,
        items: useCases.filter((item) => item.group === label).map((item) => ({
          href: eventUseCaseMarketingPath(locale, item.slug),
          title: item.navTitle,
          description: item.navDescription,
        })),
      }))}
      demoImage={DEMO_PHOTO(1)}
    />
  );
}

const footerHeading = "mb-1 text-[13px] font-semibold tracking-[.12em] text-gm-muted uppercase";

export function SiteFooter({ locale, sticky = true }: { locale: Locale; sticky?: boolean }) {
  const t = getSiteCopy(locale).footer;
  const useCases = eventUseCasesFor(locale);
  const title = (slug: string) => useCases.find((item) => item.slug === slug)?.navTitle ?? slug;
  const weddingPath = solutionPagePath(locale, "wedding-qr") ?? eventUseCasePath(locale, "poroke");
  const qrGalleryPath = solutionPagePath(locale, "event-qr-gallery");
  const noAppPath = solutionPagePath(locale, "no-app-sharing");
  const email = supportEmail(locale);
  return (
    <>
      <footer className="bg-gm-paper px-[clamp(16px,4vw,48px)] pt-[clamp(48px,6vw,80px)] pb-8">
        <div className="mx-auto grid max-w-[1320px] grid-cols-[repeat(auto-fit,minmax(min(100%,180px),1fr))] gap-9">
          <div className="flex max-w-[340px] min-w-0 flex-col gap-3.5 min-[400px]:col-span-2">
            <Link href={marketingHomeHref(locale)} className="flex items-center gap-2.5 text-[18px] font-bold">
              <Brand locale={locale} size={30} />
            </Link>
            <p className="text-[15px] leading-[1.55] text-gm-muted">{t.about}</p>
          </div>
          <div className="flex flex-col gap-2.5 text-[15px]">
            <strong className={footerHeading}>{t.product}</strong>
            <a href={homeSectionHref(locale, "how-it-works")}>{getSiteCopy(locale).header.howItWorks}</a>
            {locale !== "sl" ? <Link href={featuresPath(locale)}>{t.features}</Link> : null}
            <Link href={pricingPath(locale)}>{getSiteCopy(locale).header.pricing}</Link>
            {locale !== "sl" ? <Link href={comparisonPath(locale)}>{t.compare}</Link> : null}
            <Link href={faqPath(locale)}>{getSiteCopy(locale).header.faq}</Link>
          </div>
          <div className="flex flex-col gap-2.5 text-[15px]">
            <strong className={footerHeading}>{t.events}</strong>
            <Link href={weddingPath}>{title("poroke")}</Link>
            <Link href={eventUseCasePath(locale, "rojstni-dnevi")}>{title("rojstni-dnevi")}</Link>
            <Link href={eventUseCasePath(locale, "poslovni-dogodki")}>{title("poslovni-dogodki")}</Link>
            <Link href={eventUseCasePath(locale, "team-building")}>{title("team-building")}</Link>
            <Link href={eventUseCasePath(locale, "praznovanja")}>{title("praznovanja")}</Link>
          </div>
          <div className="flex flex-col gap-2.5 text-[15px]">
            <strong className={footerHeading}>{brandName(locale)}</strong>
            {qrGalleryPath ? <Link href={qrGalleryPath}>{t.qrGallery}</Link> : null}
            {noAppPath ? <Link href={noAppPath}>{t.noApp}</Link> : null}
            {locale !== "sl" ? <Link href={weddingPath}>{t.weddingQr}</Link> : null}
            <a href={`mailto:${email}`}>{t.contact}</a>
          </div>
        </div>
        <div className="mx-auto mt-12 flex max-w-[1320px] flex-wrap justify-between gap-x-6 gap-y-3 border-t border-gm-line pt-[22px] text-[14px] text-gm-muted">
          <span>© 2026 {brandName(locale)}. {t.rights}</span>
          <span className="flex gap-[18px]">
            <Link href={termsPath(locale)} className="text-gm-muted!">{t.terms}</Link>
            <Link href={privacyPath(locale)} className="text-gm-muted!">{t.privacy}</Link>
          </span>
        </div>
      </footer>
      {sticky ? <StickyOrderBar locale={locale} /> : null}
    </>
  );
}

/** Page frame for every redesigned marketing page: header, `<main>`, footer. */
export function SitePage({ locale, children, sticky = true }: { locale: Locale; children: ReactNode; sticky?: boolean }) {
  return (
    <div className="gm">
      <RevealController />
      <SiteHeader locale={locale} />
      <main id="main" tabIndex={-1} className="outline-none">
        <span id="top" />
        {children}
      </main>
      <SiteFooter locale={locale} sticky={sticky} />
    </div>
  );
}

export { Brand, DEMO_PHOTO };
