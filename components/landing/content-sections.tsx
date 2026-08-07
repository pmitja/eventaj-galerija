import { landingData } from "./data";
import type { Locale } from "@/lib/i18n/locale";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { QrMark, VisualPlaceholder } from "./visual-placeholder";

function SectionHeading({ title, desktopSubtitle, mobileSubtitle }: { title: string; desktopSubtitle: string; mobileSubtitle?: string }) {
  return (
    <div className="section-heading">
      <h2>{title}</h2>
      <p className={mobileSubtitle ? "desktop-only" : ""}>{desktopSubtitle}</p>
      {mobileSubtitle ? <p className="mobile-only">{mobileSubtitle}</p> : null}
    </div>
  );
}

export function HowItWorks({ locale = "sl" }: { locale?: Locale }) {
  const { howSteps } = landingData(locale);
  const t = getDictionary(locale);
  return (
    <section className="how section-muted" id={t.anchors.howItWorks}>
      <div className="shell">
        <SectionHeading title={t.howItWorks.heading} desktopSubtitle={t.howItWorks.subtitle} />
        <div className="how-list">
          {howSteps.map((step, index) => (
            <article className={`how-card how-card--${index + 1}`} key={step.n}>
              <div className="how-copy">
                <span className="how-number">{step.n}</span>
                <h3 className="desktop-only">{step.title}</h3>
                <h3 className="mobile-only">{"mobileTitle" in step ? step.mobileTitle : step.title}</h3>
                <p className="desktop-only">{step.description}</p>
                <p className="mobile-only">{step.mobileDescription}</p>
                {index === 2 ? (
                  <div className="how-checks desktop-only">
                    {t.howItWorks.checks.map((check) => <span key={check}>✓ &nbsp;{check}</span>)}
                  </div>
                ) : null}
              </div>
              <VisualPlaceholder label={step.imageAlt} imageSrc={step.imageSrc} imageAlt={step.imageAlt} className="how-visual" />
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Features({ locale = "sl" }: { locale?: Locale }) {
  const { features } = landingData(locale);
  const t = getDictionary(locale);
  return (
    <section className="features section" id={t.anchors.features}>
      <div className="shell">
        <div className="section-heading">
          <h2 className="desktop-only">{t.features.headingDesktop}</h2>
          <h2 className="mobile-only">{t.features.headingMobile}</h2>
          <p className="desktop-only">{t.features.subtitleDesktop}</p>
          <p className="mobile-only">{t.features.subtitleMobile}</p>
        </div>
        <div className="feature-grid">
          {features.map((feature) => (
            <article className="feature-card" key={feature.title}>
              <span className="feature-glyph" aria-hidden="true">
                <img src={feature.icon} alt="" width={22} height={22} loading="lazy" />
              </span>
              <h3 className={"mobileTitle" in feature ? "desktop-only" : ""}>{feature.title}</h3>
              {"mobileTitle" in feature ? <h3 className="mobile-only">{feature.mobileTitle}</h3> : null}
              <p className="desktop-only">{feature.description}</p>
              <p className="mobile-only">{feature.mobile}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function AiFeatures({ locale = "sl" }: { locale?: Locale }) {
  const t = getDictionary(locale);
  return (
    <section className="ai section-muted">
      <div className="shell">
        <div className="section-heading">
          <div className="section-pill">{t.ai.pill}</div>
          <h2 className="desktop-only">{t.ai.headingDesktop}</h2>
          <h2 className="mobile-only">{t.ai.headingMobile}</h2>
          <p>{t.ai.subtitle}</p>
        </div>
        <div className="ai-grid ai-grid--single">
          <article className="ai-card">
            <h3>{t.ai.cardTitle}</h3>
            <p className="desktop-only">{t.ai.cardDesktop}</p>
            <p className="mobile-only">{t.ai.cardMobile}</p>
            <div className="tags">
              <span className="tag tag--green">✓ {t.ai.tagBest} · 96</span>
              <span className="tag tag--yellow">{t.ai.tagBlurry} · 14</span>
              <span className="tag">{t.ai.tagDuplicates} · 22</span>
            </div>
            <VisualPlaceholder label={t.ai.visualLabel} imageSrc="/gallery/ana-marko/photo-8.jpg" className="ai-visual" />
            <strong className="ai-price">{t.ai.price}</strong>
          </article>
        </div>
      </div>
    </section>
  );
}

export function Slideshow({ priceHref, locale = "sl" }: { priceHref?: string; locale?: Locale } = {}) {
  const t = getDictionary(locale);
  const href = priceHref ?? `#${t.anchors.pricing}`;
  return (
    <section className="slideshow-section">
      <div className="slideshow-inner shell">
        <div className="slideshow-copy">
          <div className="dark-pill">{t.slideshow.pill}</div>
          <h2>{t.slideshow.heading}</h2>
          <p className="desktop-only">{t.slideshow.descriptionDesktop}</p>
          <p className="mobile-only">{t.slideshow.descriptionMobile}</p>
          <a className="dark-cta desktop-only" href={href}>{t.slideshow.cta} →</a>
        </div>
        <div className="slideshow-visual-wrap">
          <VisualPlaceholder label={t.slideshow.visualLabel} imageSrc="/marketing/screenshots/liveshow-desktop.png" imageAlt={t.slideshow.visualAlt} className="slideshow-visual" />
          <div className="qr-callout"><QrMark /><small>{t.slideshow.qrCallout}</small></div>
        </div>
        <a className="dark-cta mobile-only" href={href}>{t.slideshow.cta} →</a>
      </div>
    </section>
  );
}

export function Devices({ locale = "sl" }: { locale?: Locale }) {
  const t = getDictionary(locale);
  return (
    <section className="devices section-muted desktop-only">
      <div className="shell">
        <h2>{t.devices.heading}</h2>
        <p>{t.devices.subtitle}</p>
        <div className="browser-mock">
          <div className="browser-bar"><span /><span /><span /><small>{t.devices.exampleUrl}</small></div>
          <VisualPlaceholder label={t.devices.desktopLabel} imageSrc="/marketing/screenshots/gallery-desktop-frame.png" imageAlt={t.devices.desktopAlt} className="browser-visual" />
          <div className="device-phone"><VisualPlaceholder label={t.devices.mobileLabel} imageSrc="/marketing/screenshots/gallery-mobile.png" imageAlt={t.devices.mobileAlt} /></div>
        </div>
      </div>
    </section>
  );
}
