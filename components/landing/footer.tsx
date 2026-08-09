import Link from "next/link";
import { StickyCreateEventCta } from "./sticky-create-event-cta";
import type { Locale } from "@/lib/i18n/locale";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { eventUseCasePath, localizedMarketingPath, orderPath, privacyPath, solutionPagePath, termsPath } from "@/lib/i18n/routes";
import { brandMark } from "@/lib/seo";

export function Footer({ locale = "sl" }: { locale?: Locale }) {
  const t = getDictionary(locale);
  const home = localizedMarketingPath("/", locale);
  /** Slovenian carries the Eventaj brand, every other language Guest Mosaic. */
  const mark = brandMark(locale);
  const brandName = t.nav.brandWord;
  const weddingPath = solutionPagePath(locale, "wedding-qr") ?? eventUseCasePath(locale, "poroke");
  const qrGalleryPath = solutionPagePath(locale, "event-qr-gallery") ?? `${home}#${t.anchors.howItWorks}`;
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
              <img className="brand-logo" src={mark} alt="" width={44} height={44} />
              <b>{brandName}</b>
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
            <Link href={weddingPath}>{t.footer.weddings}</Link>
            <Link href={eventUseCasePath(locale, "poslovni-dogodki")}>{t.footer.corporateEvents}</Link>
            <Link href={eventUseCasePath(locale, "team-building")}>{t.footer.teamBuildings}</Link>
            <Link href={eventUseCasePath(locale, "praznovanja")}>{t.footer.celebrations}</Link>
          </div>
          <div className="footer-column">
            <strong>{brandName}</strong>
            <Link href={qrGalleryPath}>QR {t.footer.qrGallery}</Link>
            <Link href={`${home}#${t.anchors.faq}`}>{t.footer.help}</Link>
            <a href="mailto:info@eventaj.si">{t.footer.contact}</a>
          </div>
        </div>
        <div className="copyright shell">
          <span className="copyright-brand">
            <img className="brand-logo brand-logo--small" src={mark} alt="" width={28} height={28} />
            © 2026 {brandName}. {t.footer.rightsReserved}
          </span>
          <span><Link href={termsPath(locale)}>{t.footer.terms}</Link> · <Link href={privacyPath(locale)}>{t.footer.privacy}</Link></span>
        </div>
      </footer>
      <StickyCreateEventCta locale={locale} />
    </>
  );
}
