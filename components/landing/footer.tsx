import Link from "next/link";
import { StickyCreateEventCta } from "./sticky-create-event-cta";
import type { Locale } from "@/lib/i18n/locale";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { eventUseCasePath, localizedMarketingPath, orderPath, privacyPath, termsPath } from "@/lib/i18n/routes";
import { SITE_NAME } from "@/lib/seo";

export function Footer({ locale = "sl" }: { locale?: Locale }) {
  const t = getDictionary(locale);
  const home = localizedMarketingPath("/", locale);
  return (
    <>
      <footer className="footer">
        <div className="footer-cta shell">
          <h2>{t.footer.ctaHeading}</h2>
          <p>{t.footer.ctaText}</p>
          <Link className="button" href={orderPath(locale)}>{t.footer.ctaButton}</Link>
        </div>
        <div className="footer-links shell">
          <div className="footer-about">
            <div className="brand brand--footer">
              <img className="brand-logo" src="/guest-mosaic-mark.webp" alt="" width={44} height={44} />
              <b>{t.nav.brandWord}</b>
            </div>
            <p>{t.footer.about}</p>
          </div>
          <div className="footer-column">
            <strong>{t.footer.productColumn}</strong>
            <Link href={`${home}#${t.anchors.howItWorks}`}>{t.nav.howItWorks}</Link>
            <Link className="desktop-only" href={`${home}#${t.anchors.features}`}>{t.nav.features}</Link>
            <Link href={`${home}#${t.anchors.pricing}`}>{t.nav.pricing}</Link>
            <Link className="desktop-only" href={`${home}#${t.anchors.faq}`}>{t.nav.faq}</Link>
          </div>
          <div className="footer-column desktop-only">
            <strong>{t.footer.eventsColumn}</strong>
            <Link href={eventUseCasePath(locale, "poroke")}>{t.footer.weddings}</Link>
            <Link href={eventUseCasePath(locale, "poslovni-dogodki")}>{t.footer.corporateEvents}</Link>
            <Link href={eventUseCasePath(locale, "team-building")}>{t.footer.teamBuildings}</Link>
            <Link href={eventUseCasePath(locale, "praznovanja")}>{t.footer.celebrations}</Link>
          </div>
          <div className="footer-column">
            <strong>{SITE_NAME}</strong>
            <Link href={`${home}#${t.anchors.howItWorks}`}>QR {t.footer.qrGallery}</Link>
            <Link href={`${home}#${t.anchors.faq}`}>{t.footer.help}</Link>
            <a href="mailto:info@eventaj.si">{t.footer.contact}</a>
          </div>
        </div>
        <div className="copyright shell">
          <span className="copyright-brand">
            <img className="brand-logo brand-logo--small" src="/guest-mosaic-mark.webp" alt="" width={28} height={28} />
            © 2026 {SITE_NAME}. {t.footer.rightsReserved}
          </span>
          <span><Link href={termsPath(locale)}>{t.footer.terms}</Link> · <Link href={privacyPath(locale)}>{t.footer.privacy}</Link></span>
        </div>
      </footer>
      <StickyCreateEventCta locale={locale} />
    </>
  );
}
