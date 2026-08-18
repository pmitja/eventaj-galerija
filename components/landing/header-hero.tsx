import { getDictionary } from "@/lib/i18n/dictionaries";
import type { Locale } from "@/lib/i18n/locale";
import { localizedMarketingScreenshot } from "@/lib/i18n/marketing-assets";
import { demoEventPath, orderPath } from "@/lib/i18n/routes";
import Image from "next/image";
import Link from "next/link";
import { VisualPlaceholder } from "./visual-placeholder";
export { Header } from "./header-server";

function PhoneGallery({ locale }: { locale: Locale }) {
  return (
    <div className="phone">
      <div className="phone-screen">
        <Image
          className={`phone-shot${locale === "sl" ? "" : " phone-shot--trim-scrollbar"}`}
          src={localizedMarketingScreenshot(locale, "/marketing/screenshots/gallery-mobile.png")}
          alt={getDictionary(locale).hero.phoneAlt}
          fill
          sizes="300px"
          priority
        />
      </div>
    </div>
  );
}

export function Hero({ locale = "sl" }: { locale?: Locale }) {
  const t = getDictionary(locale);
  const cards = [
    ["hero-card--one", 5],
    ["hero-card--two", 6],
    ["hero-card--three", 7],
    ["hero-card--four", 8],
    ["hero-card--five", 9],
    ["hero-card--six", 3],
  ] as const;

  return (
    <section className="hero" id="top">
      <div className="hero-copy shell">
        <div className="eyebrow">
          <span />
          {t.hero.eyebrow}
        </div>
        <h1>{t.hero.title}</h1>
        <p>{t.hero.subtitle}</p>
        <div className="hero-buttons">
          <Link
            className="button"
            href={orderPath(locale)}
            data-sticky-cta-trigger="create-event"
          >
            {t.hero.ctaPrimary}
          </Link>
          <Link
            className="button button--secondary"
            href={demoEventPath(locale)}
          >
            {t.hero.ctaSecondary}
          </Link>
        </div>
        <div className="hero-trust" aria-label={t.hero.trustLabel}>
          {t.hero.trust.map((item) => (
            <span key={item}>{item}</span>
          ))}
        </div>
      </div>
      <div className="hero-stage shell">
        {cards.map(([className, photo], index) => {
          const label = `${t.hero.guestPhotoAlt} ${index + 1}`;
          return (
            <div className={`hero-card ${className}`} key={className}>
              <VisualPlaceholder
                label={label}
                imageSrc={`/gallery/ana-marko/photo-${photo}.jpg`}
                imageAlt={label}
              />
            </div>
          );
        })}
        <PhoneGallery locale={locale} />
      </div>
    </section>
  );
}

export function QuickSteps({ locale = "sl" }: { locale?: Locale }) {
  const steps = getDictionary(locale).quickSteps;

  return (
    <section className="quick-steps">
      <div className="quick-steps-inner shell">
        {steps.map(([title, text], index) => (
          <div className="quick-step-wrap" key={title}>
            <div className="quick-step">
              <span>{index + 1}</span>
              <div>
                <strong>{title}</strong>
                <small>{text}</small>
              </div>
            </div>
            {index < 2 ? <b className="step-arrow">→</b> : null}
          </div>
        ))}
      </div>
    </section>
  );
}

/**
 * The band directly under the hero that answers the question the hero cannot:
 * what actually happens after the €35 payment. Price, delivery and the ZIP that
 * closes the loop, so nobody has to scroll to pricing to learn the model.
 */
export function HeroPromise({ locale = "sl" }: { locale?: Locale }) {
  const t = getDictionary(locale).heroPromise;

  return (
    <section className="hero-promise">
      <div className="hero-promise-inner shell">
        <div className="hero-promise-copy">
          <div className="section-pill">{t.pill}</div>
          <h2>{t.headline}</h2>
          <p>{t.text}</p>
        </div>
        <ol className="hero-promise-steps">
          {t.steps.map(([title, text], index) => (
            <li key={title}>
              <span aria-hidden="true">{index + 1}</span>
              <div>
                <strong>{title}</strong>
                <small>{text}</small>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
