import Image from "next/image";
import Link from "next/link";
import { LoginModalProvider } from "@/components/auth/login-modal";
import type { SolutionPageLocale } from "@/lib/i18n/routes";
import {
  SOLUTION_PAGE_PATHS,
  demoEventPath,
  localizedMarketingPath,
  orderPath,
  solutionPagePath,
} from "@/lib/i18n/routes";
import { localizedMarketingScreenshot } from "@/lib/i18n/marketing-assets";
import { SITE_NAME } from "@/lib/seo";
import { AnimationController } from "./animation-controller";
import { HowItWorks } from "./content-sections";
import { Footer } from "./footer";
import { Header } from "./header-hero";
import { Showcase } from "./showcase-sections";
import type { SolutionPageContent } from "./solution-pages";

export function SolutionPage({
  page,
  locale,
}: {
  page: SolutionPageContent;
  locale: SolutionPageLocale;
}) {
  const home = localizedMarketingPath("/", locale);
  const related = Object.keys(SOLUTION_PAGE_PATHS)
    .filter((id) => id !== page.id)
    .map((id) => id as keyof typeof SOLUTION_PAGE_PATHS);

  return (
    <LoginModalProvider>
      <main className="landing-page use-case-page solution-page" id="top">
        <AnimationController />
        <Header
          howItWorksHref="#how-it-works"
          locale={locale}
          languageLocales={["en", "de", "nl"]}
        />

        <section className="use-case-hero">
          <div className="use-case-hero__inner shell">
            <div className="use-case-hero__copy">
              <Link className="use-case-breadcrumb" href={home}>
                {SITE_NAME} <span aria-hidden="true">/</span> {page.navTitle}
              </Link>
              <div className="eyebrow"><span />{page.eyebrow}</div>
              <h1>{page.title}</h1>
              <p>{page.description}</p>
              <div className="hero-buttons">
                <Link className="button" href={orderPath(locale)} data-sticky-cta-trigger="create-event">
                  {page.primaryCta}
                </Link>
                <Link className="button button--secondary" href={demoEventPath(locale)}>
                  {page.secondaryCta}
                </Link>
              </div>
              <div className="use-case-trust">
                {page.trust.map((item) => <span key={item}>{item}</span>)}
              </div>
            </div>

            <div className="use-case-hero__visual">
              <div className="use-case-app-desktop">
                <Image
                  src={localizedMarketingScreenshot(locale, "/marketing/screenshots/gallery-desktop-frame.png")}
                  alt=""
                  fill
                  sizes="(max-width: 767px) 330px, 520px"
                  priority
                />
              </div>
              <div className="use-case-app-mobile">
                <Image
                  src={localizedMarketingScreenshot(locale, "/marketing/screenshots/gallery-mobile.png")}
                  alt=""
                  fill
                  sizes="(max-width: 767px) 108px, 150px"
                />
              </div>
              <div className="use-case-app-note" aria-hidden="true">
                <span>QR</span>
                <div><strong>{page.navTitle}</strong><small>{page.eyebrow}</small></div>
              </div>
            </div>
          </div>
        </section>

        <HowItWorks locale={locale} />

        <section className="section use-case-benefits">
          <div className="shell">
            <div className="section-heading">
              <span className="section-pill">{page.benefitsPill}</span>
              <h2>{page.benefitsHeading}</h2>
              <p>{page.benefitsIntro}</p>
            </div>
            <div className="use-case-benefit-grid">
              {page.benefits.map((benefit, index) => (
                <article className="use-case-benefit-card solution-benefit-card" key={benefit.title}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <div>
                    <h3>{benefit.title}</h3>
                    <p>{benefit.description}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section-muted use-case-scenarios solution-clarity">
          <div className="shell use-case-scenarios__inner">
            <div>
              <span className="section-pill">{page.clarityPill}</span>
              <h2>{page.clarityHeading}</h2>
              <p>{page.clarityText}</p>
            </div>
            <ul>
              {page.clarityItems.map((item) => <li key={item}>{item}</li>)}
            </ul>
          </div>
        </section>

        <Showcase locale={locale} />

        <section className="section use-case-faq">
          <div className="faq-shell">
            <div className="section-heading">
              <span className="section-pill">{page.faqPill}</span>
              <h2>{page.faqHeading}</h2>
            </div>
            <div className="faq-list">
              {page.faq.map(([question, answer]) => (
                <details key={question}>
                  <summary>{question}<span aria-hidden="true">+</span></summary>
                  <p>{answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="section-bottom use-case-related">
          <div className="shell">
            <div className="use-case-related__heading"><h2>{page.relatedHeading}</h2></div>
            <div className="use-case-related__grid">
              {related.map((id) => {
                const target = solutionPagePath(locale, id);
                const label = id === "wedding-qr"
                  ? { en: "Wedding photo QR code", de: "QR-Code für Hochzeitsfotos", nl: "QR-code voor trouwfoto’s" }[locale]
                  : id === "no-app-sharing"
                    ? { en: "Share photos without an app", de: "Fotos ohne App teilen", nl: "Foto’s delen zonder app" }[locale]
                    : { en: "Event photo QR gallery", de: "QR-Fotogalerie für Events", nl: "QR-fotogalerij voor evenementen" }[locale];
                return target ? (
                  <Link href={target} key={id}>
                    <span>{page.relatedLink}</span>
                    <strong>{label}</strong>
                    <b aria-hidden="true">→</b>
                  </Link>
                ) : null;
              })}
            </div>
          </div>
        </section>

        <Footer locale={locale} />
      </main>
    </LoginModalProvider>
  );
}
