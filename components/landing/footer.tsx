import Link from "next/link";
import { StickyCreateEventCta } from "./sticky-create-event-cta";

export function Footer() {
  return (
    <>
      <footer className="footer">
        <div className="footer-cta shell">
          <h2>Pripravljeni na svoj naslednji dogodek?</h2>
          <p>Ustvarite QR galerijo za 35 € na dogodek — brez naročnine.</p>
          <Link className="button" href="/naroci">Ustvari dogodek</Link>
        </div>
        <div className="footer-links shell">
          <div className="footer-about">
            <div className="brand brand--footer">
              <img className="brand-logo" src="/logo.svg" alt="Eventaj.si" width={44} height={44} />
              <span>|</span> <b>Galerija</b>
            </div>
            <p>QR galerija za poroke, poslovne dogodke, team buildinge in praznovanja. Del ekipe Eventaj.si.</p>
          </div>
          <div className="footer-column"><strong>Produkt</strong><Link href="/#kako-deluje">Kako deluje</Link><Link className="desktop-only" href="/#funkcije">Funkcije</Link><Link href="/#cene">Cene</Link><Link className="desktop-only" href="/#faq">FAQ</Link></div>
          <div className="footer-column desktop-only"><strong>Dogodki</strong><Link href="/za-dogodke/poroke">Poroke</Link><Link href="/za-dogodke/poslovni-dogodki">Poslovni dogodki</Link><Link href="/za-dogodke/team-building">Team buildingi</Link><Link href="/za-dogodke/praznovanja">Praznovanja</Link></div>
          <div className="footer-column"><strong>Eventaj.si</strong><a href="https://eventaj.si">Glavna stran</a><Link href="/#kako-deluje">QR galerija</Link><Link href="/#faq">Pomoč</Link><a href="mailto:info@eventaj.si">Kontakt</a></div>
        </div>
        <div className="copyright shell">
          <span className="copyright-brand">
            <img className="brand-logo brand-logo--small" src="/logo.svg" alt="Eventaj.si" width={28} height={28} />
            © 2026 Eventaj.si. Vse pravice pridržane.
          </span>
          <span className="desktop-only">Pogoji uporabe · Zasebnost</span>
        </div>
      </footer>
      <StickyCreateEventCta />
    </>
  );
}
