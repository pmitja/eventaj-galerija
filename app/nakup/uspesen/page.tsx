import type { Metadata } from "next";
import Link from "next/link";
import { Check, Download, Mail, MonitorPlay, QrCode } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { fulfillCheckout, findDeliveryLinks } from "@/lib/repositories/checkout";
import { checkoutSessionIdSchema } from "@/lib/validation/checkout";
import styles from "@/components/checkout/checkout.module.css";
import { getRequestLocale } from "@/lib/i18n/server";
import { checkoutSuccessPath, orderPath } from "@/lib/i18n/routes";
import { withLocalePrefix } from "@/lib/i18n/locale";
import { SITE_NAME } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  return { title: locale === "en" ? `Order status | ${SITE_NAME}` : `Status naročila | ${SITE_NAME}`, robots: { index: false, follow: false, nocache: true } };
}

export default async function CheckoutSuccessPage({ searchParams }: { searchParams: Promise<{ session_id?: string }> }) {
  const locale = await getRequestLocale();
  const en = locale === "en";
  const parsed = checkoutSessionIdSchema.safeParse((await searchParams).session_id);
  let eventId: string | null = null;
  if (parsed.success) {
    try { eventId = (await fulfillCheckout(parsed.data, locale)).provisioned_event_id; } catch { eventId = null; }
  }
  const ready = Boolean(eventId);
  const links = eventId ? await findDeliveryLinks(eventId) : null;
  const galleryUrl = links ? withLocalePrefix(locale, `/t/${encodeURIComponent(links.publicCode)}`) : null;
  const liveshowUrl = links?.slideshowToken ? withLocalePrefix(locale, `/display/${encodeURIComponent(links.slideshowToken)}`) : null;

  return <main className={styles.page}><div className={styles.shell}>
    <header className={styles.heading}>
      <p>{ready ? (en ? "PAYMENT SUCCESSFUL" : "PLAČILO USPEŠNO") : (en ? "PAYMENT PROCESSING" : "PLAČILO V OBDELAVI")}</p>
      <h1>{ready ? (en ? "Your payment is confirmed." : "Plačilo je potrjeno.") : (en ? "We are finishing your gallery." : "Zaključujemo pripravo galerije.")}</h1>
      <span>{ready ? (en ? "We are sending the QR code and event link to the email address from your order." : "QR kodo in povezavo do dogodka pošiljamo na e-poštni naslov iz naročila.") : (en ? "Stripe is still confirming the payment. Refresh this page in a few moments." : "Stripe še potrjuje plačilo. Stran čez nekaj trenutkov osveži.")}</span>
    </header>
    {ready ? <Card className={styles.successCard}><CardContent>
      <div className={styles.successIcon}><Check aria-hidden="true" /></div>
      {galleryUrl ? <div className={styles.successLinks}>
        <a className={`${styles.successLink} ${styles.successLinkPrimary}`} href={galleryUrl}><QrCode aria-hidden="true" />{en ? "Open gallery and QR" : "Odpri galerijo in QR"}</a>
        {liveshowUrl ? <a className={`${styles.successLink} ${styles.successLinkSecondary}`} href={liveshowUrl}><MonitorPlay aria-hidden="true" />{en ? "Open live display" : "Odpri prikaz v živo"}</a> : null}
      </div> : null}
      <div className={styles.nextSteps}>
        <div className={styles.nextStep}><Mail aria-hidden="true" /><span><strong>{en ? "Check your email" : "Preveri e-pošto"}</strong><small>{en ? "You will receive the QR code and a direct link. Check your spam folder too." : "Prejmeš QR kodo in neposredno povezavo. Poglej tudi med vsiljeno pošto."}</small></span></div>
        <div className={styles.nextStep}><Download aria-hidden="true" /><span><strong>{en ? "After the event" : "Po dogodku"}</strong><small>{en ? "We will send another email with a 24-hour link to the photo ZIP." : "Pošljemo ti novo sporočilo z 24-urno povezavo do ZIP-a fotografij."}</small></span></div>
      </div>
      {eventId ? <p className={styles.eventRef}><strong>{en ? "Event number" : "Številka dogodka"}</strong><code>{eventId}</code>{en ? "If anything goes wrong, send us this number and we will help." : "Če kaj ne deluje, nam pošlji to številko in ti pomagamo."}</p> : null}
      <p className={styles.successNote}>{en ? "We did not create an account and no sign-in is required. You can safely close this page." : "Računa nismo ustvarili in prijava ni potrebna. To stran lahko varno zapreš."}</p>
    </CardContent></Card> : <Link className={styles.submit} style={{display:"grid",placeItems:"center",textDecoration:"none",maxWidth:420,margin:"24px auto 0"}} href={parsed.success ? `${checkoutSuccessPath(locale)}?session_id=${encodeURIComponent(parsed.data)}` : orderPath(locale)}>{en ? "Check again" : "Preveri znova"}</Link>}
  </div></main>;
}
