import type { Metadata } from "next";
import Link from "next/link";
import { Check, Download, Mail, MonitorPlay, QrCode } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { fulfillCheckout, findDeliveryLinks } from "@/lib/repositories/checkout";
import { checkoutSessionIdSchema } from "@/lib/validation/checkout";
import styles from "@/components/checkout/checkout.module.css";

export const metadata: Metadata = {
  title: "Status naročila | Eventaj Galerija",
  robots: { index: false, follow: false, nocache: true },
};

export default async function CheckoutSuccessPage({ searchParams }: { searchParams: Promise<{ session_id?: string }> }) {
  const parsed = checkoutSessionIdSchema.safeParse((await searchParams).session_id);
  let eventId: string | null = null;
  if (parsed.success) {
    try { eventId = (await fulfillCheckout(parsed.data)).provisioned_event_id; } catch { eventId = null; }
  }
  const ready = Boolean(eventId);
  const links = eventId ? await findDeliveryLinks(eventId) : null;
  const galleryUrl = links ? `/t/${encodeURIComponent(links.publicCode)}` : null;
  const liveshowUrl = links?.slideshowToken ? `/display/${encodeURIComponent(links.slideshowToken)}` : null;

  return <main className={styles.page}><div className={styles.shell}>
    <header className={styles.heading}>
      <p>{ready ? "PLAČILO USPEŠNO" : "PLAČILO V OBDELAVI"}</p>
      <h1>{ready ? "Plačilo je potrjeno." : "Zaključujemo pripravo galerije."}</h1>
      <span>{ready ? "QR kodo in povezavo do dogodka pošiljamo na e-poštni naslov iz naročila." : "Stripe še potrjuje plačilo. Stran čez nekaj trenutkov osveži."}</span>
    </header>
    {ready ? <Card className={styles.successCard}><CardContent>
      <div className={styles.successIcon}><Check aria-hidden="true" /></div>
      {galleryUrl ? <div className={styles.successLinks}>
        <a className={`${styles.successLink} ${styles.successLinkPrimary}`} href={galleryUrl}><QrCode aria-hidden="true" />Odpri galerijo in QR</a>
        {liveshowUrl ? <a className={`${styles.successLink} ${styles.successLinkSecondary}`} href={liveshowUrl}><MonitorPlay aria-hidden="true" />Odpri prikaz v živo</a> : null}
      </div> : null}
      <div className={styles.nextSteps}>
        <div className={styles.nextStep}><Mail aria-hidden="true" /><span><strong>Preveri e-pošto</strong><small>Prejmeš QR kodo in neposredno povezavo. Poglej tudi med vsiljeno pošto.</small></span></div>
        <div className={styles.nextStep}><Download aria-hidden="true" /><span><strong>Po dogodku</strong><small>Pošljemo ti novo sporočilo z 24-urno povezavo do ZIP-a fotografij.</small></span></div>
      </div>
      {eventId ? <p className={styles.eventRef}><strong>Številka dogodka</strong><code>{eventId}</code>Če kaj ne deluje, nam pošlji to številko in ti pomagamo.</p> : null}
      <p className={styles.successNote}>Računa nismo ustvarili in prijava ni potrebna. To stran lahko varno zapreš.</p>
    </CardContent></Card> : <Link className={styles.submit} style={{display:"grid",placeItems:"center",textDecoration:"none",maxWidth:420,margin:"24px auto 0"}} href={parsed.success ? `/nakup/uspesen?session_id=${encodeURIComponent(parsed.data)}` : "/naroci"}>Preveri znova</Link>}
  </div></main>;
}
