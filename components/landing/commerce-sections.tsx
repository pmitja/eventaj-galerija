import { addOns, comparison, faqs, plans } from "./data";

export function Comparison() {
  return (
    <section className="comparison section-bottom">
      <div className="comparison-shell">
        <div className="section-heading">
          <h2>Zakaj Eventaj.si Galerija?</h2>
          <p className="desktop-only">Primerjava s tipičnimi tujimi ponudniki.</p>
          <p className="mobile-only">Primerjava s tujimi ponudniki.</p>
        </div>
        <div className="comparison-table" role="table" aria-label="Primerjava ponudnikov">
          <div className="comparison-row comparison-head" role="row"><span /><b>Eventaj.si</b><b>Tuji <span className="desktop-only">ponudniki</span></b></div>
          {comparison.map(([label, us, them]) => <div className="comparison-row" role="row" key={label}><span>{label}</span><b className="yes">{us}</b><b className="no">{them}</b></div>)}
          <div className="comparison-row comparison-price" role="row"><strong>Cena</strong><b className="yes">od 19 €</b><b className="no">37–99 $</b></div>
        </div>
      </div>
    </section>
  );
}

export function Pricing() {
  return (
    <section className="pricing section-muted" id="cene">
      <div className="shell">
        <div className="section-heading">
          <h2>Preprosti cenovni paketi</h2>
          <p className="desktop-only">Ena cena na dogodek. Brez naročnine, brez skritih stroškov.</p>
          <p className="mobile-only">Ena cena na dogodek. Brez naročnine.</p>
        </div>
        <div className="pricing-grid">
          {plans.map((plan) => (
            <article className={`price-card price-card--${plan.id} ${"featured" in plan ? "price-card--featured" : ""}`} key={plan.id}>
              {"featured" in plan ? <span className="popular">Najbolj priljubljen</span> : null}
              <h3>{plan.name}</h3>
              <div className="price"><strong>{plan.price}</strong><span>/ dogodek</span></div>
              <p>{plan.description}</p>
              <div className="plan-features">
                {"lead" in plan ? <b>{plan.lead}</b> : null}
                {plan.features.map((feature) => <span key={feature}><i>✓</i>&nbsp; {feature}</span>)}
              </div>
              <a className={"featured" in plan ? "button plan-button" : "plan-button"} href="#">Izberi {plan.name}</a>
            </article>
          ))}
        </div>
        <div className="addons">
          <strong>Dodatne možnosti (Add-ons)</strong>
          <div>{addOns.map(([name, price]) => <span key={name}>{name.replace(" galerije", "").replace(" vseh fotografij", "")} <b>{price}</b></span>)}</div>
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
