import { features, howSteps } from "./data";
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

export function HowItWorks() {
  return (
    <section className="how section-muted" id="kako-deluje">
      <div className="shell">
        <SectionHeading title="Kako deluje?" desktopSubtitle="Brez zapletov — za vas in vaše goste." />
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
                    <span>✓ &nbsp;Fotografije neposredno iz brskalnika</span>
                    <span>✓ &nbsp;Sporočila in čestitke ob fotografijah</span>
                    <span>✓ &nbsp;Neomejeno število gostov</span>
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

export function Features() {
  return (
    <section className="features section" id="funkcije">
      <div className="shell">
        <div className="section-heading">
          <h2 className="desktop-only">Vse, kar potrebujete za popoln dogodek</h2>
          <h2 className="mobile-only">Vse za popoln dogodek</h2>
          <p className="desktop-only">Od digitalnega albuma do QR kode in predstavitve v živo — vse na enem mestu.</p>
          <p className="mobile-only">Od digitalnega albuma do QR kode.</p>
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

export function AiFeatures() {
  return (
    <section className="ai section-muted">
      <div className="shell">
        <div className="section-heading">
          <div className="section-pill">Umetna inteligenca</div>
          <h2 className="desktop-only">Hitrejši pregled najboljših fotografij</h2>
          <h2 className="mobile-only">Hitrejši pregled fotografij</h2>
          <p>Dodatek za tehnično razvrščanje kakovosti in zaznavanje dvojnikov.</p>
        </div>
        <div className="ai-grid ai-grid--single">
          <article className="ai-card">
            <h3>AI Best Photos</h3>
            <p className="desktop-only">Tehnično oceni kakovost posnetkov ter zazna zamegljene in podvojene fotografije, da jih organizator lažje pregleda.</p>
            <p className="mobile-only">Oceni tehnično kakovost ter zazna zamegljene in podvojene fotografije.</p>
            <div className="tags"><span className="tag tag--green">✓ Najboljše · 96</span><span className="tag tag--yellow">Zamegljene · 14</span><span className="tag">Podvojene · 22</span></div>
            <VisualPlaceholder label="Galerija fotografij dogodka" imageSrc="/gallery/ana-marko/photo-8.jpg" className="ai-visual" />
            <strong className="ai-price">+15 € na dogodek · do 3.000 fotografij</strong>
          </article>
        </div>
      </div>
    </section>
  );
}

export function Slideshow() {
  return (
    <section className="slideshow-section">
      <div className="slideshow-inner shell">
        <div className="slideshow-copy">
          <div className="dark-pill">V živo na dogodku</div>
          <h2>Live Slideshow na velikem platnu</h2>
          <p className="desktop-only">Novo naložene fotografije se sproti prikazujejo na projektorju ali TV zaslonu — z gladkimi animacijami in QR kodo, ki vabi goste k sodelovanju.</p>
          <p className="mobile-only">Novo naložene fotografije se sproti prikazujejo na projektorju ali TV zaslonu — s QR kodo za goste.</p>
          <a className="dark-cta desktop-only" href="#cene">Poglej ceno →</a>
        </div>
        <div className="slideshow-visual-wrap">
          <VisualPlaceholder label="Live slideshow dogodka na velikem zaslonu" imageSrc="/marketing/screenshots/liveshow-desktop.png" imageAlt="Live slideshow dogodka z voščili gostov na velikem zaslonu" className="slideshow-visual" />
          <div className="qr-callout"><QrMark /><small>Dodaj svoje fotografije</small></div>
        </div>
        <a className="dark-cta mobile-only" href="#cene">Poglej ceno →</a>
      </div>
    </section>
  );
}

export function Devices() {
  return (
    <section className="devices section-muted desktop-only">
      <div className="shell">
        <h2>Deluje na vseh napravah</h2>
        <p>V vsakem brskalniku · brez aplikacije · v Apple slogu preprosto</p>
        <div className="browser-mock">
          <div className="browser-bar"><span /><span /><span /><small>galerija.eventaj.si/ana-in-marko</small></div>
          <VisualPlaceholder label="Galerija na namizju" imageSrc="/marketing/screenshots/gallery-desktop-frame.png" imageAlt="Galerija dogodka na namiznem računalniku" className="browser-visual" />
          <div className="device-phone"><VisualPlaceholder label="Mobilna galerija" imageSrc="/marketing/screenshots/gallery-mobile.png" imageAlt="Galerija dogodka na telefonu" /></div>
        </div>
      </div>
    </section>
  );
}
