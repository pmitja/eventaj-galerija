import Link from "next/link";
import { StickyCreateEventCta } from "./sticky-create-event-cta";
import type { Locale } from "@/lib/i18n/locale";

export function Footer({ locale = "sl" }: { locale?: Locale }) {
  const en = locale === "en";
  return (
    <>
      <footer className="footer">
        <div className="footer-cta shell">
          <h2>{en ? "Do not let your guests' memories disappear." : "Ne pustite, da spomini vaših gostov izginejo."}</h2>
          <p>{en ? "Create your event gallery for a one-time €35 payment. No subscription." : "Ustvarite galerijo dogodka z enkratnim plačilom 35 €. Brez naročnine."}</p>
          <Link className="button" href="/naroci">{en ? "Create your event for €35" : "Ustvari dogodek za 35 €"}</Link>
        </div>
        <div className="footer-links shell">
          <div className="footer-about">
            <div className="brand brand--footer">
              <img className="brand-logo" src="/logo.svg" alt="Eventaj.si" width={44} height={44} />
              <span>|</span> <b>{en ? "Gallery" : "Galerija"}</b>
            </div>
            <p>{en ? "A QR gallery for weddings, corporate events, team buildings and celebrations. Part of Eventaj.si." : "QR galerija za poroke, poslovne dogodke, team buildinge in praznovanja. Del ekipe Eventaj.si."}</p>
          </div>
          <div className="footer-column"><strong>{en ? "Product" : "Produkt"}</strong><Link href="/#kako-deluje">{en ? "How it works" : "Kako deluje"}</Link><Link className="desktop-only" href="/#funkcije">{en ? "Features" : "Funkcije"}</Link><Link href="/#cene">{en ? "Pricing" : "Cene"}</Link><Link className="desktop-only" href="/#faq">FAQ</Link></div>
          <div className="footer-column desktop-only"><strong>{en ? "Events" : "Dogodki"}</strong><Link href="/za-dogodke/poroke">{en ? "Weddings" : "Poroke"}</Link><Link href="/za-dogodke/poslovni-dogodki">{en ? "Corporate events" : "Poslovni dogodki"}</Link><Link href="/za-dogodke/team-building">{en ? "Team buildings" : "Team buildingi"}</Link><Link href="/za-dogodke/praznovanja">{en ? "Celebrations" : "Praznovanja"}</Link></div>
          <div className="footer-column"><strong>Eventaj.si</strong><a href="https://eventaj.si">{en ? "Main website" : "Glavna stran"}</a><Link href="/#kako-deluje">QR {en ? "gallery" : "galerija"}</Link><Link href="/#faq">{en ? "Help" : "Pomoč"}</Link><a href="mailto:info@eventaj.si">{en ? "Contact" : "Kontakt"}</a></div>
        </div>
        <div className="copyright shell">
          <span className="copyright-brand">
            <img className="brand-logo brand-logo--small" src="/logo.svg" alt="Eventaj.si" width={28} height={28} />
            © 2026 Eventaj.si. {en ? "All rights reserved." : "Vse pravice pridržane."}
          </span>
          <span><Link href="/pogoji-uporabe">{en ? "Terms of Use" : "Pogoji uporabe"}</Link> · <Link href="/zasebnost">{en ? "Privacy" : "Zasebnost"}</Link></span>
        </div>
      </footer>
      <StickyCreateEventCta locale={locale} />
    </>
  );
}
