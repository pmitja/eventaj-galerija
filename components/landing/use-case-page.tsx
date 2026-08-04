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

export function EventUseCasesSection({ locale = "sl" }: { locale?: Locale }) {
  const en = locale === "en";
  const eventUseCases = eventUseCasesFor(locale);
  return (
    <section className="section-muted event-use-cases" id="za-dogodke">
      <div className="shell">
        <div className="section-heading">
          <span className="section-pill">{en ? "For every occasion" : "Za vsako priložnost"}</span>
          <h2>{en ? "Not only for weddings. For every event." : "Ni samo za poroke. Je za vsak dogodek."}</h2>
          <p>{en ? "One simple QR gallery, ready for the way your guests or participants come together." : "Ena preprosta QR galerija, prilagojena načinu, kako se zberejo vaši gostje ali udeleženci."}</p>
        </div>
        <div className="event-use-cases__grid">
          {eventUseCases.map((item) => (
            <Link href={`/za-dogodke/${item.slug}`} key={item.slug}>
              <span>{item.group}</span>
              <strong>{item.navTitle}</strong>
              <p>{item.navDescription}</p>
              <b aria-hidden="true">{en ? "Read more" : "Preberi več"} →</b>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export function UseCasePage({ useCase, locale = "sl", alternateOrigin }: { useCase: EventUseCase; locale?: Locale; alternateOrigin?: string }) {
  const en = locale === "en";
  const eventUseCases = eventUseCasesFor(locale);
  const related = eventUseCases
    .filter((item) => item.group === useCase.group && item.slug !== useCase.slug)
    .slice(0, 2);

  return (
    <LoginModalProvider>
    <main className="landing-page use-case-page" id="top">
      <AnimationController />
      <Header howItWorksHref="#kako-deluje" locale={locale} alternateOrigin={alternateOrigin} />
      <section className="use-case-hero">
        <div className="use-case-hero__inner shell">
          <div className="use-case-hero__copy">
            <Link className="use-case-breadcrumb" href="/">Eventaj Galerija <span aria-hidden="true">/</span> {useCase.navTitle}</Link>
            <div className="eyebrow"><span />{useCase.eyebrow}</div>
            <h1>{useCase.title}</h1>
            <p>{useCase.description}</p>
            <div className="hero-buttons">
              <Link className="button" href="/naroci" data-sticky-cta-trigger="create-event">{en ? "Create event — €35" : "Ustvari dogodek — 35 €"}</Link>
              <Link className="button button--secondary" href="#kako-deluje">{en ? "How it works" : "Kako deluje"}</Link>
            </div>
            <div className="use-case-trust">
              <span>{en ? "No app" : "Brez aplikacije"}</span>
              <span>{en ? "No subscription" : "Brez naročnine"}</span>
              <span>{en ? "Unlimited guests" : "Neomejeno gostov"}</span>
            </div>
          </div>
          <div className="use-case-hero__visual">
            <div className="use-case-app-desktop">
              <Image
                src="/marketing/screenshots/gallery-desktop-frame.png"
                alt={en ? "Eventaj Gallery with all event photos on a computer" : "Eventaj Galerija z vsemi fotografijami dogodka na računalniku"}
                fill
                sizes="(max-width: 767px) 330px, 520px"
                priority
              />
            </div>
            <div className="use-case-app-mobile">
              <Image
                src="/marketing/screenshots/gallery-mobile.png"
                alt={en ? "Mobile gallery opened by a guest through a QR code" : "Mobilna galerija, ki jo gost odpre prek QR kode"}
                fill
                sizes="(max-width: 767px) 108px, 150px"
              />
            </div>
            <div className="use-case-app-note">
              <span>QR</span>
              <div>
                <strong>{en ? "Guests upload" : "Gostje dodajo"}</strong>
                <small>{en ? "without an app or sign-in" : "brez aplikacije in prijave"}</small>
              </div>
            </div>
          </div>
        </div>
      </section>

      <HowItWorks locale={locale} />

      <section className="section use-case-benefits">
        <div className="shell">
          <div className="section-heading">
            <span className="section-pill">{en ? "Made for your event" : "Narejeno za vaš dogodek"}</span>
            <h2>{en ? "Less coordination. More shared memories." : "Manj usklajevanja. Več skupnih spominov."}</h2>
            <p>{en ? "A simple journey for the organiser and every guest with a phone." : "Enostaven tok za organizatorja in za vsakega gosta s telefonom."}</p>
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
            <span className="section-pill">{en ? "Flexible" : "Prilagodljivo"}</span>
            <h2>{en ? "One gallery, many occasions." : "Ena galerija, različne priložnosti."}</h2>
            <p>{en ? "Use the same simple QR journey for the whole event or one part of it." : "Isti preprost QR tok lahko uporabite za celoten dogodek ali njegov posamezni del."}</p>
          </div>
          <ul>
            {useCase.scenarios.map((scenario) => <li key={scenario}>{scenario}</li>)}
          </ul>
        </div>
      </section>

      <Slideshow priceHref="/#cene" locale={locale} />
      <Showcase locale={locale} />

      <section className="section use-case-faq">
        <div className="faq-shell">
          <div className="section-heading">
            <span className="section-pill">{en ? "Frequently asked questions" : "Pogosta vprašanja"}</span>
            <h2>{en ? "Before you create a gallery" : "Preden ustvarite galerijo"}</h2>
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
              <h2>{en ? "Explore more" : "Oglejte si še"}</h2>
              <Link href="/#za-dogodke">{en ? "All event types" : "Vse vrste dogodkov"}</Link>
            </div>
            <div className="use-case-related__grid">
              {related.map((item) => (
                <Link href={`/za-dogodke/${item.slug}`} key={item.slug}>
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
