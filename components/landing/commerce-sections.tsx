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
          <h2>{en ? "Simple pricing" : "Preprosta cena"}</h2>
          <p className="desktop-only">{en ? "One price per event. No subscription or hidden fees." : "Ena cena na dogodek. Brez naročnine, brez skritih stroškov."}</p>
          <p className="mobile-only">{en ? "One price per event. No subscription." : "Ena cena na dogodek. Brez naročnine."}</p>
        </div>
        <div className="pricing-grid pricing-grid--single">
          {plans.map((plan) => (
            <article className={`price-card price-card--${plan.id} ${"featured" in plan ? "price-card--featured" : ""}`} key={plan.id}>
              {"featured" in plan ? <span className="popular">{en ? "Everything for your event" : "Vse za vaš dogodek"}</span> : null}
              <h3>{plan.name}</h3>
              <div className="price"><strong>{plan.price}</strong><span>/ {en ? "event" : "dogodek"}</span></div>
              <p>{plan.description}</p>
              <div className="plan-features">
                {plan.features.map((feature) => <span key={feature}><i>✓</i>&nbsp; {feature}</span>)}
              </div>
              <Link className={"featured" in plan ? "button plan-button" : "plan-button"} href="/naroci">{en ? "Create gallery" : "Ustvari galerijo"}</Link>
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
