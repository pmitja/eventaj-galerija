import Link from "next/link";
import { landingData } from "./data";
import type { Locale } from "@/lib/i18n/locale";

export function Pricing({ locale = "sl" }: { locale?: Locale }) {
  const { addOns, plans } = landingData(locale);
  const en = locale === "en";
  return (
    <section className="pricing section-muted" id="cene">
      <div className="shell">
        <div className="section-heading">
          <h2>{en ? "Everything for your event. €35 once." : "Vse za vaš dogodek. Enkratnih 35 €."}</h2>
          <p className="desktop-only">{en ? "One complete package. No subscription, no per-guest fees and no hidden costs." : "En celovit paket. Brez naročnine, doplačil na gosta ali skritih stroškov."}</p>
          <p className="mobile-only">{en ? "One complete package. No subscription or hidden costs." : "En celovit paket. Brez naročnine ali skritih stroškov."}</p>
        </div>
        <div className="pricing-grid pricing-grid--single">
          {plans.map((plan) => (
            <article className={`price-card price-card--${plan.id} ${"featured" in plan ? "price-card--featured" : ""}`} key={plan.id}>
              {"featured" in plan ? <span className="popular">{en ? "One package · everything included" : "En paket · vse vključeno"}</span> : null}
              <div className="price-card-summary">
                <h3>{plan.name}</h3>
                <div className="price"><strong>{plan.price}</strong><span>/ {en ? "event" : "dogodek"}</span></div>
                <p>{plan.description}</p>
                <Link className={"featured" in plan ? "button plan-button" : "plan-button"} href="/naroci">{en ? "Create your event for €35" : "Ustvari dogodek za 35 €"}</Link>
                <small className="price-reassurance">{en ? "One-time Stripe payment. Your gallery and QR code arrive by email." : "Enkratno plačilo prek Stripe. Galerijo in QR kodo prejmete po e-pošti."}</small>
              </div>
              <div className="plan-features">
                {plan.features.map((feature) => <span key={feature}><i>✓</i>&nbsp; {feature}</span>)}
              </div>
            </article>
          ))}
        </div>
        <div className="addons">
          <strong>{en ? "Add-ons" : "Dodatek"}</strong>
          <div>{addOns.map(([name, price]) => <span key={name}>{name} <b>{price}</b></span>)}</div>
        </div>
      </div>
    </section>
  );
}

export function Faq({ locale = "sl" }: { locale?: Locale }) {
  const { faqs } = landingData(locale);
  const en = locale === "en";
  return (
    <section className="faq section" id="faq">
      <div className="faq-shell">
        <div className="section-heading"><h2>{en ? "Frequently asked questions" : "Pogosta vprašanja"}</h2><p>{en ? "Everything you need to know before your first event." : "Vse, kar morate vedeti pred prvim dogodkom."}</p></div>
        <div className="faq-list">
          {faqs.map(([question, answer]) => (
            <details key={question}><summary>{question}<span aria-hidden="true">+</span></summary><p>{answer}</p></details>
          ))}
        </div>
      </div>
    </section>
  );
}
