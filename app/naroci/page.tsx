import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Check, CreditCard, Images } from "lucide-react";
import { CheckoutForm } from "@/components/checkout/checkout-form";
import styles from "@/components/checkout/checkout.module.css";

export const metadata: Metadata = {
  title: "Naroči QR galerijo za dogodek | Eventaj Galerija",
  description:
    "Ustvari QR galerijo za 35 EUR na dogodek. Brez naročnine, brez aplikacije za goste in z neomejenim številom gostov.",
  alternates: { canonical: "/naroci" },
  openGraph: {
    title: "Naroči QR galerijo za dogodek | Eventaj Galerija",
    description:
      "Ustvari QR galerijo za 35 EUR na dogodek. Brez naročnine in brez aplikacije za goste.",
    url: "/naroci",
  },
};

export default async function OrderPage() {
  return <main className={styles.page}><div className={styles.shell}>
    <Link className={styles.back} href="/"><ArrowLeft aria-hidden="true" /> Nazaj</Link>
    <header className={styles.heading}>
      <p className={styles.eyebrow}>NOV DOGODEK</p>
      <h1>Naroči svojo galerijo</h1>
      <span>Vnesi podatke o dogodku in varno plačaj na Stripe. QR prejmeš po e-pošti — brez računa in brez prijave.</span>
    </header>
    <ol className={styles.steps} aria-label="Potek naročila">
      <li className={styles.active} aria-current="step"><span><Check aria-hidden="true" /></span><small>Podatki o dogodku</small></li>
      <li><span><CreditCard aria-hidden="true" /></span><small>Varno plačilo</small></li>
      <li><span><Images aria-hidden="true" /></span><small>QR po e-pošti</small></li>
    </ol>
    <CheckoutForm />
  </div></main>;
}
