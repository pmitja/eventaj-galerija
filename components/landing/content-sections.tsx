import { features, howSteps, testimonials } from "./data";
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
                    <span>✓ &nbsp;Fotografije in videi v polni kakovosti</span>
                    <span>✓ &nbsp;Sporočila in čestitke ob fotografijah</span>
                    <span>✓ &nbsp;Neomejeno število gostov</span>
                  </div>
                ) : null}
              </div>
              <VisualPlaceholder label={step.placeholder} className="how-visual" />
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
          <p className="desktop-only">Od digitalnega albuma do QR predlog — vse na enem mestu.</p>
          <p className="mobile-only">Od digitalnega albuma do QR predlog.</p>
        </div>
        <div className="feature-grid">
          {features.map((feature) => (
            <article className="feature-card" key={feature.title}>
              <span className="feature-glyph" aria-hidden="true">{feature.glyph}</span>
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
          <h2 className="desktop-only">AI poskrbi za urejanje namesto vas</h2>
          <h2 className="mobile-only">AI poskrbi za urejanje</h2>
          <p className="desktop-only">Na stotine fotografij, urejenih v nekaj sekundah.</p>
          <p className="mobile-only">Na stotine fotografij, urejenih v sekundah.</p>
        </div>
        <div className="ai-grid">
          <article className="ai-card">
            <h3>AI Best Photos</h3>
            <p className="desktop-only">AI samodejno prepozna najboljše posnetke ter označi zamegljene in podvojene. Prenesite samo najboljše fotografije z enim klikom.</p>
            <p className="mobile-only">AI prepozna najboljše posnetke ter označi zamegljene in podvojene. Prenesite samo najboljše z enim klikom.</p>
            <div className="tags"><span className="tag tag--green">✓ Najboljše · 96</span><span className="tag tag--yellow">Zamegljene · 14</span><span className="tag">Podvojene · 22</span></div>
            <VisualPlaceholder label="posnetek: mreža najboljših fotografij" className="ai-visual" />
          </article>
          <article className="ai-card">
            <h3>AI Face Collections</h3>
            <p className="desktop-only">Vse fotografije posamezne osebe, samodejno zbrane na enem mestu. Vsak gost najde sebe v trenutku.</p>
            <p className="mobile-only">Vse fotografije posamezne osebe, samodejno zbrane na enem mestu.</p>
            <div className="faces">
              {[34, 28, 21].map((count) => <div className="face" key={count}><VisualPlaceholder label="" circle /><small>{count} foto</small></div>)}
              <div className="face"><span className="face-more">+84</span><small>oseb</small></div>
            </div>
            <VisualPlaceholder label="posnetek: galerija ene osebe" className="ai-visual" />
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
          <p className="desktop-only">Novo naložene fotografije se v realnem času prikazujejo na projektorju ali TV zaslonu — z gladkimi animacijami in QR kodo, ki vabi goste k sodelovanju.</p>
          <p className="mobile-only">Novo naložene fotografije se v realnem času prikazujejo na projektorju ali TV zaslonu — s QR kodo, ki vabi goste k sodelovanju.</p>
          <a className="dark-cta desktop-only" href="#cene">Oglej si primer v živo →</a>
        </div>
        <div className="slideshow-visual-wrap">
          <VisualPlaceholder label="posnetek: slideshow na projektorju" className="slideshow-visual" />
          <div className="qr-callout"><QrMark /><small>Dodaj svoje fotografije</small></div>
        </div>
        <a className="dark-cta mobile-only" href="#cene">Oglej si primer v živo →</a>
      </div>
    </section>
  );
}

export function Photobooth() {
  return (
    <section className="photobooth section">
      <div className="photobooth-inner shell">
        <VisualPlaceholder label="fotografija: Eventaj.si photo booth na dogodku" className="photobooth-visual" />
        <div className="photobooth-copy">
          <div className="section-pill">Eventaj.si integracija</div>
          <h2>Popolna kombinacija s fotoboothom</h2>
          <p className="desktop-only">Najemite naš photo booth in vse fotografije iz njega se samodejno prikažejo v isti galeriji — skupaj s posnetki vaših gostov.</p>
          <p className="mobile-only">Najemite naš photo booth in vse fotografije iz njega se samodejno prikažejo v isti galeriji.</p>
          <div className="checks"><span>✓ &nbsp;Samodejni prenos iz photo bootha v galerijo</span><span>✓ &nbsp;Enoten album za celoten dogodek</span><span>✓ &nbsp;Paketni popust ob najemu obojega</span></div>
          <a href="#">Več o najemu photo bootha →</a>
        </div>
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
          <VisualPlaceholder label="posnetek: galerija na namizju" className="browser-visual" />
          <div className="device-phone"><VisualPlaceholder label="mobilna galerija" /></div>
        </div>
      </div>
    </section>
  );
}

export function Testimonials() {
  return (
    <section className="testimonials section">
      <div className="shell">
        <SectionHeading title="Ne verjemite samo nam" desktopSubtitle="Pomagali smo že na stotine dogodkov narediti nepozabnih." mobileSubtitle="Na stotine nepozabnih dogodkov." />
        <div className="testimonial-grid">
          {testimonials.map((item) => (
            <article className="testimonial" key={item.name}>
              <div className="stars">★★★★★</div>
              <p>{item.quote}</p>
              <div className="person"><span>{item.initials}</span><div><strong>{item.name}</strong><small>{item.event}</small></div></div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
