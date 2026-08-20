import Image from "next/image";
import { getDictionary } from "@/lib/i18n/dictionaries";
import type { Locale } from "@/lib/i18n/locale";

/**
 * The QR code is the whole product, but "you get a QR code" never tells a
 * couple where the thing actually lives on the day. Four photographed
 * placements — table card, welcome sign, menu, projection — answer that
 * before it becomes a support question.
 */
export function QrPlacement({ locale = "sl", tone = "muted" }: { locale?: Locale; tone?: "muted" | "plain" }) {
  const t = getDictionary(locale).qrPlacement;

  return (
    <section className={`qr-placement ${tone === "plain" ? "section" : "section-muted"}`}>
      <div className="shell">
        <div className="section-heading">
          <span className="section-pill">{t.eyebrow}</span>
          <h2>{t.heading}</h2>
          <p>{t.subtitle}</p>
        </div>
        <div className="qr-placement-grid">
          {t.items.map((item) => (
            <figure className="qr-placement-card" key={item.title}>
              <div className="qr-placement-photo">
                <Image
                  src={item.image}
                  alt={item.alt}
                  fill
                  sizes="(max-width: 767px) 88vw, (max-width: 1023px) 45vw, 300px"
                />
              </div>
              <figcaption>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
