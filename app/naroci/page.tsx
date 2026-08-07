import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Check, CreditCard, Images } from "lucide-react";
import { CheckoutForm } from "@/components/checkout/checkout-form";
import { getCloudflareEnv } from "@/lib/cloudflare";
import { getRequestLocale } from "@/lib/i18n/server";
import { localizedMarketingPath, orderPath } from "@/lib/i18n/routes";
import { getPublicAppUrls } from "@/lib/i18n/server";
import { canonicalUrl, languageAlternates } from "@/lib/i18n/alternates";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { SITE_NAME, guestBrandMark } from "@/lib/seo";
import styles from "@/components/checkout/checkout.module.css";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const env = getPublicAppUrls();
  const t = getDictionary(locale).order;
  const url = orderPath(locale);
  return {
    title: t.metaTitle,
    description: t.metaDescription,
    alternates: {
      canonical: canonicalUrl(env, locale, url),
      languages: languageAlternates(env, url),
    },
    openGraph: { title: t.metaTitle, description: t.metaDescription, url },
  };
}

export const dynamic = "force-dynamic";

export default async function OrderPage() {
  const locale = await getRequestLocale();
  const t = getDictionary(locale).order;
  const videoUploadsEnabled = String(getCloudflareEnv().VIDEO_UPLOAD_ENABLED) === "true";
  const home = localizedMarketingPath("/", locale);
  const brandMarkSrc = guestBrandMark(locale);
  return <main className={styles.page}><div className={styles.shell}>
    <div className={styles.topBar}>
      <Link className={styles.back} href={home}><ArrowLeft aria-hidden="true" /> {t.back}</Link>
      {brandMarkSrc ? (
        <Link className={styles.brand} href={home}>
          <img className={styles.brandMark} src={brandMarkSrc} alt="" width={30} height={30} />
          <span>{SITE_NAME}</span>
        </Link>
      ) : null}
    </div>
    <header className={styles.heading}>
      <p className={styles.eyebrow}>{t.eyebrow}</p>
      <h1>{t.title}</h1>
      <span>{t.intro}</span>
    </header>
    <ol className={styles.steps} aria-label={t.stepsLabel}>
      <li className={styles.active} aria-current="step"><span><Check aria-hidden="true" /></span><small>{t.stepDetails}</small></li>
      <li><span><CreditCard aria-hidden="true" /></span><small>{t.stepPayment}</small></li>
      <li><span><Images aria-hidden="true" /></span><small>{t.stepQr}</small></li>
    </ol>
    <CheckoutForm videoUploadsEnabled={videoUploadsEnabled} />
  </div></main>;
}
