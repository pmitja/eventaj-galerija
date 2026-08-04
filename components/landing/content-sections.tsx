import { landingData } from "./data";
import type { Locale } from "@/lib/i18n/locale";
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
  const en = locale === "en";
  return (
    <section className="how section-muted" id="kako-deluje">
      <div className="shell">
        <SectionHeading title={en ? "How does it work?" : "Kako deluje?"} desktopSubtitle={en ? "Effortless for you and your guests." : "Brez zapletov — za vas in vaše goste."} />
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
                    <span>✓ &nbsp;{en ? "Photos and videos straight from the browser" : "Fotografije in videi neposredno iz brskalnika"}</span>
                    <span>✓ &nbsp;{en ? "Messages and wishes alongside photos" : "Sporočila in čestitke ob fotografijah"}</span>
                    <span>✓ &nbsp;{en ? "Unlimited guests" : "Neomejeno število gostov"}</span>
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
  const en = locale === "en";
  return (
    <section className="features section" id="funkcije">
      <div className="shell">
        <div className="section-heading">
          <h2 className="desktop-only">{en ? "Everything you need for a memorable event" : "Vse, kar potrebujete za popoln dogodek"}</h2>
          <h2 className="mobile-only">{en ? "Everything for your event" : "Vse za popoln dogodek"}</h2>
          <p className="desktop-only">{en ? "Photos, short videos, voice messages, a QR code and a live display — all in one place." : "Fotografije, kratki videi, glasovna voščila, QR koda in predstavitev v živo — vse na enem mestu."}</p>
          <p className="mobile-only">{en ? "Photos, videos and voice messages in one place." : "Fotografije, videi in glasovna voščila na enem mestu."}</p>
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
  const en = locale === "en";
  return (
    <section className="ai section-muted">
      <div className="shell">
        <div className="section-heading">
          <div className="section-pill">{en ? "Artificial intelligence" : "Umetna inteligenca"}</div>
          <h2 className="desktop-only">{en ? "Review your best photos faster" : "Hitrejši pregled najboljših fotografij"}</h2>
          <h2 className="mobile-only">{en ? "Review photos faster" : "Hitrejši pregled fotografij"}</h2>
          <p>{en ? "An add-on for technical quality classification and duplicate detection." : "Dodatek za tehnično razvrščanje kakovosti in zaznavanje dvojnikov."}</p>
        </div>
        <div className="ai-grid ai-grid--single">
          <article className="ai-card">
            <h3>AI Best Photos</h3>
            <p className="desktop-only">{en ? "Assesses technical quality and detects blurry and duplicate photos so the organiser can review them more easily." : "Tehnično oceni kakovost posnetkov ter zazna zamegljene in podvojene fotografije, da jih organizator lažje pregleda."}</p>
            <p className="mobile-only">{en ? "Assesses technical quality and detects blurry and duplicate photos." : "Oceni tehnično kakovost ter zazna zamegljene in podvojene fotografije."}</p>
            <div className="tags"><span className="tag tag--green">✓ {en ? "Best" : "Najboljše"} · 96</span><span className="tag tag--yellow">{en ? "Blurry" : "Zamegljene"} · 14</span><span className="tag">{en ? "Duplicates" : "Podvojene"} · 22</span></div>
            <VisualPlaceholder label={en ? "Event photo gallery" : "Galerija fotografij dogodka"} imageSrc="/gallery/ana-marko/photo-8.jpg" className="ai-visual" />
            <strong className="ai-price">{en ? "+€15 per event · up to 3,000 photos" : "+15 € na dogodek · do 3.000 fotografij"}</strong>
          </article>
        </div>
      </div>
    </section>
  );
}

export function Slideshow({ priceHref = "#cene", locale = "sl" }: { priceHref?: string; locale?: Locale } = {}) {
  const en = locale === "en";
  return (
    <section className="slideshow-section">
      <div className="slideshow-inner shell">
        <div className="slideshow-copy">
          <div className="dark-pill">{en ? "Live at your event" : "V živo na dogodku"}</div>
          <h2>{en ? "Live Slideshow on the big screen" : "Live Slideshow na velikem platnu"}</h2>
          <p className="desktop-only">{en ? "New uploads appear live on a projector or TV — with smooth animation and a QR code that invites guests to join in." : "Novo naložene fotografije se sproti prikazujejo na projektorju ali TV zaslonu — z gladkimi animacijami in QR kodo, ki vabi goste k sodelovanju."}</p>
          <p className="mobile-only">{en ? "New uploads appear live on a projector or TV — with a QR code for guests." : "Novo naložene fotografije se sproti prikazujejo na projektorju ali TV zaslonu — s QR kodo za goste."}</p>
          <a className="dark-cta desktop-only" href={priceHref}>{en ? "See pricing" : "Poglej ceno"} →</a>
        </div>
        <div className="slideshow-visual-wrap">
          <VisualPlaceholder label={en ? "Event live slideshow on a large screen" : "Live slideshow dogodka na velikem zaslonu"} imageSrc="/marketing/screenshots/liveshow-desktop.png" imageAlt={en ? "Event live slideshow with guest wishes on a large screen" : "Live slideshow dogodka z voščili gostov na velikem zaslonu"} className="slideshow-visual" />
          <div className="qr-callout"><QrMark /><small>{en ? "Add your photos" : "Dodaj svoje fotografije"}</small></div>
        </div>
        <a className="dark-cta mobile-only" href={priceHref}>{en ? "See pricing" : "Poglej ceno"} →</a>
      </div>
    </section>
  );
}

export function Devices({ locale = "sl" }: { locale?: Locale }) {
  const en = locale === "en";
  return (
    <section className="devices section-muted desktop-only">
      <div className="shell">
        <h2>{en ? "Works on every device" : "Deluje na vseh napravah"}</h2>
        <p>{en ? "Any browser · no app · beautifully simple" : "V vsakem brskalniku · brez aplikacije · v Apple slogu preprosto"}</p>
        <div className="browser-mock">
          <div className="browser-bar"><span /><span /><span /><small>{en ? "gallery.eventaj.si/ana-in-marko" : "galerija.eventaj.si/ana-in-marko"}</small></div>
          <VisualPlaceholder label={en ? "Desktop gallery" : "Galerija na namizju"} imageSrc="/marketing/screenshots/gallery-desktop-frame.png" imageAlt={en ? "Event gallery on a desktop computer" : "Galerija dogodka na namiznem računalniku"} className="browser-visual" />
          <div className="device-phone"><VisualPlaceholder label={en ? "Mobile gallery" : "Mobilna galerija"} imageSrc="/marketing/screenshots/gallery-mobile.png" imageAlt={en ? "Event gallery on a phone" : "Galerija dogodka na telefonu"} /></div>
        </div>
      </div>
    </section>
  );
}
