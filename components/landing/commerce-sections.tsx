import Link from "next/link";
import { addOns, faqs, plans } from "./data";

export function Pricing() {
  return (
    <section className="pricing section-muted" id="cene">
      <div className="shell">
        <div className="section-heading">
          <h2>Preprosta cena</h2>
          <p className="desktop-only">Ena cena na dogodek. Brez naročnine, brez skritih stroškov.</p>
          <p className="mobile-only">Ena cena na dogodek. Brez naročnine.</p>
        </div>
        <div className="pricing-grid pricing-grid--single">
          {plans.map((plan) => (
            <article className={`price-card price-card--${plan.id} ${"featured" in plan ? "price-card--featured" : ""}`} key={plan.id}>
              {"featured" in plan ? <span className="popular">Vse za vaš dogodek</span> : null}
              <h3>{plan.name}</h3>
              <div className="price"><strong>{plan.price}</strong><span>/ dogodek</span></div>
              <p>{plan.description}</p>
              <div className="plan-features">
                {plan.features.map((feature) => <span key={feature}><i>✓</i>&nbsp; {feature}</span>)}
              </div>
              <Link className={"featured" in plan ? "button plan-button" : "plan-button"} href="/naroci">Ustvari galerijo</Link>
            </article>
          ))}
        </div>
        <div className="addons">
          <strong>Dodatek</strong>
          <div>{addOns.map(([name, price]) => <span key={name}>{name} <b>{price}</b></span>)}</div>
        </div>
      </div>
    </section>
  );
}

export function Faq() {
  return (
    <section className="faq section" id="faq">
      <div className="faq-shell">
        <div className="section-heading"><h2>Pogosta vprašanja</h2><p>Vse, kar morate vedeti pred prvim dogodkom.</p></div>
        <div className="faq-list">
          {faqs.map(([question, answer]) => (
            <details key={question}><summary>{question}<span aria-hidden="true">+</span></summary><p>{answer}</p></details>
          ))}
        </div>
      </div>
    </section>
  );
}
