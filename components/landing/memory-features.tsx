import Image from "next/image";
import Link from "next/link";
import type { Locale } from "@/lib/i18n/locale";

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
  const en = locale === "en";
  return (
    <section className="memory-features section-muted" id="spomini-v-glasu" aria-labelledby="memory-features-title">
      <div className="shell">
        <div className="section-heading">
          <div className="section-pill">{en ? "More than photos" : "Več kot fotografije"}</div>
          <h2 id="memory-features-title">{en ? "Keep every voice and every original" : "Shranite vsak glas in vsak original"}</h2>
          <p>{en ? "Guests can record a personal message and download a favourite photo directly from the gallery." : "Gostje lahko posnamejo osebno voščilo in najljubšo fotografijo prenesejo neposredno iz galerije."}</p>
        </div>

        <div className="memory-feature-grid">
          <article className="memory-feature-card">
            <div className="memory-feature-copy">
              <span className="memory-feature-icon" aria-hidden="true"><MicrophoneIcon /></span>
              <h3>{en ? "Audio guestbook" : "Audio knjiga gostov"}</h3>
              <p>{en ? "A laugh, a story or a heartfelt wish — recorded in the browser with no app or account." : "Smeh, zgodba ali iskreno voščilo — posneto v brskalniku brez aplikacije in uporabniškega računa."}</p>
              <ul>
                <li>{en ? "Preview before sending" : "Predogled pred pošiljanjem"}</li>
                <li>{en ? "Up to 2 minutes per message" : "Do 2 minuti na voščilo"}</li>
              </ul>
            </div>
            <div className="voice-feature-visual" aria-hidden="true">
              <span>{en ? "A memory in your voice" : "Spomin v tvojem glasu"}</span>
              <strong>{en ? "Voice message" : "Glasovno voščilo"}</strong>
              <div className="voice-feature-wave">
                {[10, 18, 28, 14, 34, 22, 40, 18, 30, 14, 24, 10].map((height, index) => <i key={index} style={{ height }} />)}
              </div>
              <b>0:24</b>
              <div className="voice-feature-record"><MicrophoneIcon /></div>
              <small>{en ? "Tap to record your message" : "Tapni za snemanje voščila"}</small>
            </div>
          </article>

          <article className="memory-feature-card memory-feature-card--download">
            <div className="memory-feature-copy">
              <span className="memory-feature-icon" aria-hidden="true"><DownloadIcon /></span>
              <h3>{en ? "Download any photo" : "Prenos posamezne fotografije"}</h3>
              <p>{en ? "Open a favourite moment and save the original immediately — no waiting for the complete ZIP archive." : "Odprite najljubši utrinek in takoj shranite original — brez čakanja na celoten ZIP arhiv."}</p>
              <ul>
                <li>{en ? "A download button on every photo" : "Gumb za prenos na vsaki fotografiji"}</li>
                <li>{en ? "Secure access to the original" : "Varen dostop do originala"}</li>
              </ul>
            </div>
            <div className="download-feature-visual" aria-hidden="true">
              <Image src="/gallery/ana-marko/photo-4.jpg" alt="" fill sizes="(max-width: 900px) 100vw, 520px" />
              <div className="download-feature-bar">
                <span>4 / 10</span>
                <span className="download-feature-action"><DownloadIcon /> {en ? "Download" : "Prenesi"}</span>
              </div>
            </div>
          </article>
        </div>
        <div className="memory-feature-cta">
          <div>
            <strong>{en ? "Your guests create the memories. You keep every one." : "Gostje ustvarijo spomine. Vi ohranite prav vsakega."}</strong>
            <span>{en ? "One event, unlimited guests, no subscription." : "En dogodek, neomejeno gostov, brez naročnine."}</span>
          </div>
          <Link className="button" href="/naroci">{en ? "Create your event for €35" : "Ustvari dogodek za 35 €"}</Link>
        </div>
      </div>
    </section>
  );
}
