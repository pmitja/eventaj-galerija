import { getDictionary } from "@/lib/i18n/dictionaries";
import type { Locale } from "@/lib/i18n/locale";

/**
 * A quiet one-line positioning band. No invented ratings or counts — the proof
 * is the promise itself: the photos the hired photographer is never there for.
 * Used under the hero on the landing and repeated once on every marketing
 * subpage so the reason to buy travels with the page.
 */
export function SocialProof({
  locale = "sl",
  tone = "soft",
}: {
  locale?: Locale;
  tone?: "soft" | "plain";
}) {
  const t = getDictionary(locale).socialProof;

  return (
    <section className={`social-proof social-proof--${tone}`} aria-label={t.label}>
      <div className="shell">
        <p className="social-proof-line">
          <span className="social-proof-mark" aria-hidden="true">
            &ldquo;
          </span>
          {t.line}
        </p>
      </div>
    </section>
  );
}
