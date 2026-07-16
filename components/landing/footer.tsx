import { LoginTrigger } from "@/components/auth/login-modal";

export function Footer() {
  return (
    <>
      <footer className="footer">
        <div className="footer-cta shell">
          <h2>Pripravljeni na svoj naslednji dogodek?</h2>
          <p className="desktop-only">Ustvarite galerijo v 2 minutah — plačate šele, ko ste pripravljeni.</p>
          <p className="mobile-only">Ustvarite galerijo v 2 minutah.</p>
          <LoginTrigger className="button" callbackUrl="/admin/events/new">Ustvari dogodek</LoginTrigger>
        </div>
        <div className="footer-links shell">
          <div className="footer-about">
            <div className="brand brand--footer">Eventaj.si <span>|</span> <b>Galerija</b></div>
            <p>QR + NFC galerija za poroke, poslovne dogodke, team buildinge in praznovanja. Del ekipe Eventaj.si.</p>
          </div>
          <div className="footer-column"><strong>Produkt</strong><a href="#kako-deluje">Kako deluje</a><a className="desktop-only" href="#funkcije">Funkcije</a><a href="#cene">Cene</a><a className="desktop-only" href="#faq">FAQ</a></div>
          <div className="footer-column desktop-only"><strong>Dogodki</strong><a href="#">Poroke</a><a href="#">Poslovni dogodki</a><a href="#">Team building</a><a href="#">Praznovanja</a></div>
          <div className="footer-column"><strong>Eventaj.si</strong><a href="#">Najem photo bootha</a><a href="#">NFC stojala</a><a href="#">Kontakt</a></div>
        </div>
        <div className="copyright shell"><span>© 2026 Eventaj.si. Vse pravice pridržane.</span><span className="desktop-only">Pogoji uporabe · Zasebnost</span></div>
      </footer>
      <div className="sticky-cta"><LoginTrigger className="button" callbackUrl="/admin/events/new">Ustvari dogodek — od 19 €</LoginTrigger></div>
    </>
  );
}
