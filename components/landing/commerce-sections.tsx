import Link from "next/link";
import { landingData } from "./data";
import type { Locale } from "@/lib/i18n/locale";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { orderPath } from "@/lib/i18n/routes";

export function Pricing({ locale = "sl" }: { locale?: Locale }) {
  const { addOns, plans } = landingData(locale);
  const t = getDictionary(locale);
  return (
    <section className="pricing section-muted" id={t.anchors.pricing}>
      <div className="shell">
        <div className="section-heading">
          <h2>{t.pricing.heading}</h2>
          <p className="desktop-only">{t.pricing.subtitleDesktop}</p>
          <p className="mobile-only">{t.pricing.subtitleMobile}</p>
        </div>
        <div className="pricing-grid pricing-grid--single">
          {plans.map((plan) => (
            <article className={`price-card price-card--${plan.id} ${"featured" in plan ? "price-card--featured" : ""}`} key={plan.id}>
              {"featured" in plan ? <span className="popular">{t.pricing.popular}</span> : null}
              <div className="price-card-summary">
                <h3>{plan.name}</h3>
                <div className="price"><strong>{plan.price}</strong><span className="price-unit">/ {t.pricing.perEvent}</span></div>
                <p>{plan.description}</p>
                <Link className={"featured" in plan ? "button plan-button" : "plan-button"} href={orderPath(locale)}>{t.pricing.cta}</Link>
                <small className="price-reassurance">{t.pricing.reassurance}</small>
              </div>
              <div className="plan-features">
                {plan.features.map((feature) => <span key={feature}><i>✓</i>&nbsp; {feature}</span>)}
              </div>
            </article>
          ))}
        </div>
        <div className="addons">
          <strong>{t.pricing.addOnsLabel}</strong>
          <div>{addOns.map((addOn) => (
            <span className="addon" key={addOn.name}>
              <span className="addon-name">{addOn.name}</span>
              <small className="addon-note">{addOn.note}</small>
              <b className="addon-price">{addOn.price}</b>
            </span>
          ))}</div>
        </div>
      </div>
    </section>
  );
}

export function Faq({ locale = "sl" }: { locale?: Locale }) {
  const { faqs } = landingData(locale);
  const t = getDictionary(locale);
  return (
    <section className="faq section" id={t.anchors.faq}>
      <div className="faq-shell">
        <div className="section-heading"><h2>{t.faq.heading}</h2><p>{t.faq.subtitle}</p></div>
        <div className="faq-list">
          {faqs.map(([question, answer]) => (
            <details key={question}><summary>{question}<span aria-hidden="true">+</span></summary><p>{answer}</p></details>
          ))}
        </div>
      </div>
    </section>
  );
}
