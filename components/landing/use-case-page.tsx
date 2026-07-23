import Image from "next/image";
import Link from "next/link";
import { LoginModalProvider } from "@/components/auth/login-modal";
import { AnimationController } from "./animation-controller";
import { HowItWorks, Slideshow } from "./content-sections";
import { Footer } from "./footer";
import { Header } from "./header-hero";
import { Showcase } from "./showcase-sections";
import { eventUseCases, type EventUseCase } from "./use-cases";

export function EventUseCasesSection() {
  return (
    <section className="section-muted event-use-cases" id="za-dogodke">
      <div className="shell">
        <div className="section-heading">
          <span className="section-pill">Za vsako priložnost</span>
          <h2>Ni samo za poroke. Je za vsak dogodek.</h2>
          <p>Ena preprosta QR galerija, prilagojena načinu, kako se zberejo vaši gostje ali udeleženci.</p>
        </div>
        <div className="event-use-cases__grid">
          {eventUseCases.map((item) => (
            <Link href={`/za-dogodke/${item.slug}`} key={item.slug}>
              <span>{item.group}</span>
              <strong>{item.navTitle}</strong>
              <p>{item.navDescription}</p>
              <b aria-hidden="true">Preberi več →</b>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export function UseCasePage({ useCase }: { useCase: EventUseCase }) {
  const related = eventUseCases
    .filter((item) => item.group === useCase.group && item.slug !== useCase.slug)
    .slice(0, 2);

  return (
    <LoginModalProvider>
    <main className="landing-page use-case-page" id="top">
      <AnimationController />
      <Header howItWorksHref="#kako-deluje" />
      <section className="use-case-hero">
        <div className="use-case-hero__inner shell">
          <div className="use-case-hero__copy">
            <Link className="use-case-breadcrumb" href="/">Eventaj Galerija <span aria-hidden="true">/</span> {useCase.navTitle}</Link>
            <div className="eyebrow"><span />{useCase.eyebrow}</div>
            <h1>{useCase.title}</h1>
            <p>{useCase.description}</p>
            <div className="hero-buttons">
              <Link className="button" href="/naroci" data-sticky-cta-trigger="create-event">Ustvari dogodek — 35 €</Link>
              <Link className="button button--secondary" href="#kako-deluje">Kako deluje</Link>
            </div>
            <div className="use-case-trust">
              <span>Brez aplikacije</span>
              <span>Brez naročnine</span>
              <span>Neomejeno gostov</span>
            </div>
          </div>
          <div className="use-case-hero__visual">
            <div className="use-case-app-desktop">
              <Image
                src="/marketing/screenshots/gallery-desktop-frame.png"
                alt="Eventaj Galerija z vsemi fotografijami dogodka na računalniku"
                fill
                sizes="(max-width: 767px) 330px, 520px"
                priority
              />
            </div>
            <div className="use-case-app-mobile">
              <Image
                src="/marketing/screenshots/gallery-mobile.png"
                alt="Mobilna galerija, ki jo gost odpre prek QR kode"
                fill
                sizes="(max-width: 767px) 108px, 150px"
              />
            </div>
            <div className="use-case-app-note">
              <span>QR</span>
              <div>
                <strong>Gostje dodajo</strong>
                <small>brez aplikacije in prijave</small>
              </div>
            </div>
          </div>
        </div>
      </section>

      <HowItWorks />

      <section className="section use-case-benefits">
        <div className="shell">
          <div className="section-heading">
            <span className="section-pill">Narejeno za vaš dogodek</span>
            <h2>Manj usklajevanja. Več skupnih spominov.</h2>
            <p>Enostaven tok za organizatorja in za vsakega gosta s telefonom.</p>
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
            <span className="section-pill">Prilagodljivo</span>
            <h2>Ena galerija, različne priložnosti.</h2>
            <p>Isti preprost QR tok lahko uporabite za celoten dogodek ali njegov posamezni del.</p>
          </div>
          <ul>
            {useCase.scenarios.map((scenario) => <li key={scenario}>{scenario}</li>)}
          </ul>
        </div>
      </section>

      <Slideshow priceHref="/#cene" />
      <Showcase />

      <section className="section use-case-faq">
        <div className="faq-shell">
          <div className="section-heading">
            <span className="section-pill">Pogosta vprašanja</span>
            <h2>Preden ustvarite galerijo</h2>
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
              <h2>Oglejte si še</h2>
              <Link href="/#za-dogodke">Vse vrste dogodkov</Link>
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
      <Footer />
    </main>
    </LoginModalProvider>
  );
}
