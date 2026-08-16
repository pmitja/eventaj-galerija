import Image from "next/image";
import Link from "next/link";
import type { SolutionPageLocale } from "@/lib/i18n/routes";
import {
  SOLUTION_PAGE_LOCALES,
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
import { getSolutionPage, type SolutionPageContent } from "./solution-pages";
import { LocalUploadDemo } from "./local-upload-demo";
import { weddingConversionCopy } from "./wedding-conversion-copy";

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
      <main className="landing-page use-case-page solution-page" id="top">
        <AnimationController />
        <Header
          howItWorksHref="#how-it-works"
          locale={locale}
          languageLocales={SOLUTION_PAGE_LOCALES}
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
                <Link className="button button--secondary" href={page.id === "wedding-qr" ? "#guest-upload-demo" : demoEventPath(locale)}>
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

        {page.id === "wedding-qr" ? <WeddingGuestDemo locale={locale} /> : null}

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

        {page.id === "wedding-qr" ? <WeddingOffer locale={locale} /> : null}

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

        {page.id === "wedding-qr" ? <WeddingComparison locale={locale} /> : <Showcase locale={locale} />}

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
                const label = getSolutionPage(id, locale).navTitle;
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
  );
}

function WeddingGuestDemo({ locale }: { locale: SolutionPageLocale }) {
  const copy = weddingConversionCopy[locale];
  return (
    <section className="section wedding-guest-demo" id="guest-upload-demo">
      <div className="shell wedding-guest-demo__inner">
        <div className="wedding-guest-demo__copy">
          <span className="section-pill">{copy.guestViewPill}</span>
          <h2>{copy.guestViewHeading}</h2>
          <p>{copy.guestViewText}</p>
          <ol>
            <li><span>1</span>QR</li>
            <li><span>2</span>{copy.uploadButton}</li>
            <li><span>3</span>{copy.uploadReady}</li>
          </ol>
        </div>
        <LocalUploadDemo copy={copy} />
      </div>
    </section>
  );
}

function WeddingOffer({ locale }: { locale: SolutionPageLocale }) {
  const copy = weddingConversionCopy[locale];
  return (
    <section className="section wedding-offer">
      <div className="shell wedding-offer__card">
        <div className="wedding-offer__heading">
          <span className="section-pill">{copy.offerPill}</span>
          <h2>{copy.offerHeading}</h2>
          <p>{copy.offerText}</p>
        </div>
        <div className="wedding-offer__details">
          <div className="wedding-offer__price"><strong>{copy.offerPrice}</strong><span>{copy.offerPriceNote}</span></div>
          <ul>{copy.offerItems.map((item) => <li key={item}>{item}</li>)}</ul>
          <Link className="button" href={orderPath(locale)}>{copy.offerCta}</Link>
        </div>
      </div>
    </section>
  );
}

function WeddingComparison({ locale }: { locale: SolutionPageLocale }) {
  const copy = weddingConversionCopy[locale];
  return (
    <>
      <section className="section-muted wedding-comparison">
        <div className="shell">
          <div className="section-heading">
            <span className="section-pill">{copy.comparisonPill}</span>
            <h2>{copy.comparisonHeading}</h2>
            <p>{copy.comparisonText}</p>
          </div>
          <div className="wedding-comparison__table" role="table" aria-label={copy.comparisonHeading}>
            <div className="wedding-comparison__row wedding-comparison__head" role="row">
              <strong role="columnheader">{copy.comparisonFeature}</strong>
              <strong role="columnheader">{copy.comparisonProduct}</strong>
              <strong role="columnheader">{copy.comparisonAlternative}</strong>
            </div>
            {copy.comparisonRows.map(([feature, product, alternative]) => (
              <div className="wedding-comparison__row" role="row" key={feature}>
                <strong role="cell">{feature}</strong><span role="cell">{product}</span><span role="cell">{alternative}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="section wedding-free-guide" id="free-wedding-photo-sharing">
        <div className="shell">
          <div className="section-heading">
            <span className="section-pill">{copy.freePill}</span>
            <h2>{copy.freeHeading}</h2>
            <p>{copy.freeText}</p>
          </div>
          <div className="wedding-free-guide__grid">
            <article><strong>{copy.freeGoodFor}</strong><p>{copy.freeGoodForText}</p></article>
            <article><strong>{copy.paidGoodFor}</strong><p>{copy.paidGoodForText}</p><Link href={orderPath(locale)}>{copy.offerCta} →</Link></article>
          </div>
        </div>
      </section>
    </>
  );
}
