import Image from "next/image";
import Link from "next/link";
import { LoginModalProvider } from "@/components/auth/login-modal";
import { AnimationController } from "./animation-controller";
import { HowItWorks, Slideshow } from "./content-sections";
import { Footer } from "./footer";
import { Header } from "./header-hero";
import { Showcase } from "./showcase-sections";
import { eventUseCasesFor, type EventUseCase } from "./use-cases";
import type { Locale } from "@/lib/i18n/locale";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { eventUseCasePath, localizedMarketingPath, orderPath } from "@/lib/i18n/routes";
import { brandName } from "@/lib/seo";
import { localizedMarketingScreenshot } from "@/lib/i18n/marketing-assets";

export function EventUseCasesSection({ locale = "sl" }: { locale?: Locale }) {
  const t = getDictionary(locale);
  const eventUseCases = eventUseCasesFor(locale);
  return (
    <section className="section-muted event-use-cases" id={t.anchors.forEvents}>
      <div className="shell">
        <div className="section-heading">
          <span className="section-pill">{t.useCases.pill}</span>
          <h2>{t.useCases.heading}</h2>
          <p>{t.useCases.subtitle}</p>
        </div>
        <div className="event-use-cases__grid">
          {eventUseCases.map((item) => (
            <Link href={eventUseCasePath(locale, item.slug)} key={item.slug}>
              <span>{item.group}</span>
              <strong>{item.navTitle}</strong>
              <p>{item.navDescription}</p>
              <b aria-hidden="true">{t.useCases.readMore} →</b>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export function UseCasePage({ useCase, locale = "sl", alternateOrigin }: { useCase: EventUseCase; locale?: Locale; alternateOrigin?: string }) {
  const t = getDictionary(locale);
  const home = localizedMarketingPath("/", locale);
  const eventUseCases = eventUseCasesFor(locale);
  const related = eventUseCases
    .filter((item) => item.group === useCase.group && item.slug !== useCase.slug)
    .slice(0, 2);

  return (
    <LoginModalProvider>
    <main className="landing-page use-case-page" id="top">
      <AnimationController />
      <Header howItWorksHref={`#${t.anchors.howItWorks}`} locale={locale} alternateOrigin={alternateOrigin} />
      <section className="use-case-hero">
        <div className="use-case-hero__inner shell">
          <div className="use-case-hero__copy">
            <Link className="use-case-breadcrumb" href={home}>{brandName(locale)} <span aria-hidden="true">/</span> {useCase.navTitle}</Link>
            <div className="eyebrow"><span />{useCase.eyebrow}</div>
            <h1>{useCase.title}</h1>
            <p>{useCase.description}</p>
            <div className="hero-buttons">
              <Link className="button" href={orderPath(locale)} data-sticky-cta-trigger="create-event">{t.useCasePage.ctaCreate}</Link>
              <Link className="button button--secondary" href={`#${t.anchors.howItWorks}`}>{t.nav.howItWorks}</Link>
            </div>
            <div className="use-case-trust">
              {t.useCasePage.trust.map((item) => <span key={item}>{item}</span>)}
            </div>
          </div>
          <div className="use-case-hero__visual">
            <div className="use-case-app-desktop">
              <Image
                src={localizedMarketingScreenshot(locale, "/marketing/screenshots/gallery-desktop-frame.png")}
                alt={t.useCasePage.desktopAlt}
                fill
                sizes="(max-width: 767px) 330px, 520px"
                priority
              />
            </div>
            <div className="use-case-app-mobile">
              <Image
                src={localizedMarketingScreenshot(locale, "/marketing/screenshots/gallery-mobile.png")}
                alt={t.useCasePage.mobileAlt}
                fill
                sizes="(max-width: 767px) 108px, 150px"
              />
            </div>
            <div className="use-case-app-note">
              <span>QR</span>
              <div>
                <strong>{t.useCasePage.guestsUpload}</strong>
                <small>{t.useCasePage.guestsUploadNote}</small>
              </div>
            </div>
          </div>
        </div>
      </section>

      <HowItWorks locale={locale} />

      <section className="section use-case-benefits">
        <div className="shell">
          <div className="section-heading">
            <span className="section-pill">{t.useCasePage.benefitsPill}</span>
            <h2>{t.useCasePage.benefitsHeading}</h2>
            <p>{t.useCasePage.benefitsSubtitle}</p>
          </div>
          <div className="use-case-benefit-grid">
            {useCase.highlights.map((highlight, index) => (
              <article className="use-case-benefit-card" key={highlight}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <p>{highlight}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section-muted use-case-scenarios">
        <div className="shell use-case-scenarios__inner">
          <div>
            <span className="section-pill">{t.useCasePage.flexiblePill}</span>
            <h2>{t.useCasePage.flexibleHeading}</h2>
            <p>{t.useCasePage.flexibleSubtitle}</p>
          </div>
          <ul>
            {useCase.scenarios.map((scenario) => <li key={scenario}>{scenario}</li>)}
          </ul>
        </div>
      </section>

      <Slideshow priceHref={`${home}#${t.anchors.pricing}`} locale={locale} />
      <Showcase locale={locale} />

      <section className="section use-case-faq">
        <div className="faq-shell">
          <div className="section-heading">
            <span className="section-pill">{t.useCasePage.faqPill}</span>
            <h2>{t.useCasePage.faqHeading}</h2>
          </div>
          <div className="faq-list">
            {useCase.faq.map(([question, answer]) => (
              <details key={question}>
                <summary>{question}<span aria-hidden="true">+</span></summary>
                <p>{answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {related.length ? (
        <section className="section-bottom use-case-related">
          <div className="shell">
            <div className="use-case-related__heading">
              <h2>{t.useCasePage.exploreMore}</h2>
              <Link href={`${home}#${t.anchors.forEvents}`}>{t.useCasePage.allEventTypes}</Link>
            </div>
            <div className="use-case-related__grid">
              {related.map((item) => (
                <Link href={eventUseCasePath(locale, item.slug)} key={item.slug}>
                  <span>{item.group}</span>
                  <strong>{item.navTitle}</strong>
                  <p>{item.navDescription}</p>
                  <b aria-hidden="true">→</b>
                </Link>
              ))}
            </div>
          </div>
        </section>
      ) : null}
      <Footer locale={locale} />
    </main>
    </LoginModalProvider>
  );
}
