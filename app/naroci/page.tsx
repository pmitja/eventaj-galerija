import Link from "next/link";
import { ArrowLeft, Check, CreditCard, Images } from "lucide-react";
import { CheckoutForm } from "@/components/checkout/checkout-form";
import { getAuthContext } from "@/lib/auth/context";
import { getCloudflareEnv } from "@/lib/cloudflare";
import styles from "@/components/checkout/checkout.module.css";

export default async function OrderPage() {
  const context = await getAuthContext();
  const organization = context
    ? await getCloudflareEnv().DB.prepare("SELECT name FROM organizations WHERE id = ?").bind(context.organizationId).first<{ name: string }>()
    : null;
  const buyer = context && organization ? { name: context.name, email: context.email, organizationName: organization.name } : null;
  return <main className={styles.page}><div className={styles.shell}>
    <Link className={styles.back} href={context ? "/admin/events" : "/"}><ArrowLeft aria-hidden="true" /> Nazaj</Link>
    <header className={styles.heading}>
      <p className={styles.eyebrow}>NOV DOGODEK</p>
      <h1>Naroči svojo galerijo</h1>
      <span>Vnesi podatke o dogodku, nato plačilo varno zaključiš na Stripe. Galerijo in QR kodo pripravimo samodejno.</span>
    </header>
    <ol className={styles.steps} aria-label="Potek naročila">
      <li className={styles.active} aria-current="step"><span><Check aria-hidden="true" /></span><small>Podatki o dogodku</small></li>
      <li><span><CreditCard aria-hidden="true" /></span><small>Varno plačilo</small></li>
      <li><span><Images aria-hidden="true" /></span><small>Galerija pripravljena</small></li>
    </ol>
    <CheckoutForm buyer={buyer} />
  </div></main>;
}
