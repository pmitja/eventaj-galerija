import Link from "next/link";
import { fulfillCheckout } from "@/lib/repositories/checkout";
import { checkoutSessionIdSchema } from "@/lib/validation/checkout";
import styles from "@/components/checkout/checkout.module.css";

export default async function CheckoutSuccessPage({ searchParams }: { searchParams: Promise<{ session_id?: string }> }) {
  const parsed = checkoutSessionIdSchema.safeParse((await searchParams).session_id);
  let ready = false;
  if (parsed.success) {
    try { ready = (await fulfillCheckout(parsed.data)).status === "provisioned"; } catch { ready = false; }
  }
  return <main className={styles.page}><div className={styles.shell}>
    <header className={styles.heading}>
      <p>{ready ? "PLAČILO USPEŠNO" : "PLAČILO V OBDELAVI"}</p>
      <h1>{ready ? "Tvoja galerija je pripravljena." : "Zaključujemo pripravo galerije."}</h1>
      <span>{ready ? "Prijavi se z e-pošto in geslom, ki si ju izbral pred plačilom." : "Stripe še potrjuje plačilo. Stran čez nekaj trenutkov osveži."}</span>
    </header>
    {ready ? <Link className={styles.submit} style={{display:"grid",placeItems:"center",textDecoration:"none"}} href="/login">Prijavi se v administracijo</Link> : <Link className={styles.submit} style={{display:"grid",placeItems:"center",textDecoration:"none"}} href={parsed.success ? `/nakup/uspesen?session_id=${encodeURIComponent(parsed.data)}` : "/naroci"}>Preveri znova</Link>}
  </div></main>;
}
