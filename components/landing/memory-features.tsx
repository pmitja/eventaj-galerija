import Image from "next/image";
import Link from "next/link";
import type { Locale } from "@/lib/i18n/locale";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { orderPath } from "@/lib/i18n/routes";

function MicrophoneIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="8" y="3" width="8" height="12" rx="4" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <path d="M5.5 11.5a6.5 6.5 0 0 0 13 0M12 18v3M8.5 21h7" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 4v10m0 0 4-4m-4 4-4-4M5 19h14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function MemoryFeatures({ locale = "sl" }: { locale?: Locale }) {
  const t = getDictionary(locale);
  return (
    <section className="memory-features section-muted" id="spomini-v-glasu" aria-labelledby="memory-features-title">
      <div className="shell">
        <div className="section-heading">
          <div className="section-pill">{t.memories.pill}</div>
          <h2 id="memory-features-title">{t.memories.heading}</h2>
          <p>{t.memories.subtitle}</p>
        </div>

        <div className="memory-feature-grid">
          <article className="memory-feature-card">
            <div className="memory-feature-copy">
              <span className="memory-feature-icon" aria-hidden="true"><MicrophoneIcon /></span>
              <h3>{t.memories.voiceTitle}</h3>
              <p>{t.memories.voiceText}</p>
              <ul>
                {t.memories.voicePoints.map((point) => <li key={point}>{point}</li>)}
              </ul>
            </div>
            <div className="voice-feature-visual" aria-hidden="true">
              <span>{t.memories.voiceVisualEyebrow}</span>
              <strong>{t.memories.voiceVisualTitle}</strong>
              <div className="voice-feature-wave">
                {[10, 18, 28, 14, 34, 22, 40, 18, 30, 14, 24, 10].map((height, index) => <i key={index} style={{ height }} />)}
              </div>
              <b>0:24</b>
              <div className="voice-feature-record"><MicrophoneIcon /></div>
              <small>{t.memories.voiceVisualHint}</small>
            </div>
          </article>

          <article className="memory-feature-card memory-feature-card--download">
            <div className="memory-feature-copy">
              <span className="memory-feature-icon" aria-hidden="true"><DownloadIcon /></span>
              <h3>{t.memories.downloadTitle}</h3>
              <p>{t.memories.downloadText}</p>
              <ul>
                {t.memories.downloadPoints.map((point) => <li key={point}>{point}</li>)}
              </ul>
            </div>
            <div className="download-feature-visual" aria-hidden="true">
              <Image src="/gallery/ana-marko/photo-4.jpg" alt="" fill sizes="(max-width: 900px) 100vw, 520px" />
              <div className="download-feature-bar">
                <span>4 / 10</span>
                <span className="download-feature-action"><DownloadIcon /> {t.memories.downloadAction}</span>
              </div>
            </div>
          </article>
        </div>
        <div className="memory-feature-cta">
          <div>
            <strong>{t.memories.ctaHeading}</strong>
            <span>{t.memories.ctaText}</span>
          </div>
          <Link className="button" href={orderPath(locale)}>{t.hero.ctaPrimary}</Link>
        </div>
      </div>
    </section>
  );
}
