import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Check, CreditCard, Images } from "lucide-react";
import { CheckoutForm } from "@/components/checkout/checkout-form";
import { getCloudflareEnv } from "@/lib/cloudflare";
import { getRequestLocale } from "@/lib/i18n/server";
import styles from "@/components/checkout/checkout.module.css";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const title = locale === "en" ? "Order an event QR gallery | Eventaj Gallery" : "Naroči QR galerijo za dogodek | Eventaj Galerija";
  const description = locale === "en"
    ? "Create a QR gallery for €35 per event. No subscription, no guest app and unlimited guests."
    : "Ustvari QR galerijo za 35 EUR na dogodek. Brez naročnine, brez aplikacije za goste in z neomejenim številom gostov.";
  return { title, description, alternates: { canonical: "/naroci" }, openGraph: { title, description, url: "/naroci" } };
}

export const dynamic = "force-dynamic";

export default async function OrderPage() {
  const locale = await getRequestLocale();
  const en = locale === "en";
  const videoUploadsEnabled = String(getCloudflareEnv().VIDEO_UPLOAD_ENABLED) === "true";
  return <main className={styles.page}><div className={styles.shell}>
    <Link className={styles.back} href="/"><ArrowLeft aria-hidden="true" /> {en ? "Back" : "Nazaj"}</Link>
    <header className={styles.heading}>
      <p className={styles.eyebrow}>{en ? "NEW EVENT" : "NOV DOGODEK"}</p>
      <h1>{en ? "Order your gallery" : "Naroči svojo galerijo"}</h1>
      <span>{en ? "Enter your event details and pay securely with Stripe. You will receive the QR code by email — no account or sign-in required." : "Vnesi podatke o dogodku in varno plačaj na Stripe. QR prejmeš po e-pošti — brez računa in brez prijave."}</span>
    </header>
    <ol className={styles.steps} aria-label={en ? "Order steps" : "Potek naročila"}>
      <li className={styles.active} aria-current="step"><span><Check aria-hidden="true" /></span><small>{en ? "Event details" : "Podatki o dogodku"}</small></li>
      <li><span><CreditCard aria-hidden="true" /></span><small>{en ? "Secure payment" : "Varno plačilo"}</small></li>
      <li><span><Images aria-hidden="true" /></span><small>{en ? "QR by email" : "QR po e-pošti"}</small></li>
    </ol>
    <CheckoutForm videoUploadsEnabled={videoUploadsEnabled} />
  </div></main>;
}
