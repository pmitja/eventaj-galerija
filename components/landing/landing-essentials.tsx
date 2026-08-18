import Link from "next/link";
import type { Locale } from "@/lib/i18n/locale";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { localizedMarketingScreenshot } from "@/lib/i18n/marketing-assets";
import { featuresPath, orderPath } from "@/lib/i18n/routes";
import { VisualPlaceholder } from "./visual-placeholder";

/**
 * The compact QR / guest upload / live slideshow strip that replaces the long
 * feature sections on the ad landing. Everything it summarises lives in full on
 * the features page, which the trailing link owns.
 */
export function Essentials({ locale = "sl" }: { locale?: Locale }) {
  const t = getDictionary(locale);
  const visuals = [
    { src: "/marketing/screenshots/email-qr.png", alt: t.howItWorks.qrEmailAlt },
    { src: "/marketing/screenshots/gallery-mobile.png", alt: t.devices.mobileAlt },
    { src: "/marketing/screenshots/liveshow-desktop.png", alt: t.slideshow.visualAlt },
  ];

  return (
    <section className="essentials section" id={t.anchors.features}>
      <div className="shell">
        <div className="section-heading">
          <div className="section-pill">{t.essentials.pill}</div>
          <h2>{t.essentials.heading}</h2>
          <p>{t.essentials.subtitle}</p>
        </div>
        <div className="essentials-grid">
          {t.essentials.items.map(([title, text], index) => (
            <article className={`essentials-card essentials-card--${index + 1}`} key={title}>
              <VisualPlaceholder
                label={visuals[index].alt}
                imageSrc={localizedMarketingScreenshot(locale, visuals[index].src)}
                imageAlt={visuals[index].alt}
                className="essentials-visual"
              />
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
        <Link className="essentials-more" href={featuresPath(locale)}>
          {t.essentials.allFeatures} <span aria-hidden="true">→</span>
        </Link>
      </div>
    </section>
  );
}

export function FinalCta({ locale = "sl" }: { locale?: Locale }) {
  const t = getDictionary(locale);
  return (
    <section className="final-cta">
      <div className="shell">
        <div className="final-cta-inner">
          <h2>{t.finalCta.heading}</h2>
          <p>{t.finalCta.text}</p>
          <Link className="button" href={orderPath(locale)}>
            {t.hero.ctaPrimary}
          </Link>
          <small>{t.finalCta.note}</small>
        </div>
      </div>
    </section>
  );
}
