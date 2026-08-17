import type { Metadata } from "next";
import { MinimalCheckoutForm } from "@/components/checkout/minimal-checkout-form";
import { CheckoutBrandBar } from "@/components/checkout/checkout-brand-bar";
import { getRequestLocale } from "@/lib/i18n/server";
import { orderPath } from "@/lib/i18n/routes";
import { getPublicAppUrls } from "@/lib/i18n/server";
import { canonicalUrl, languageAlternates } from "@/lib/i18n/alternates";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { checkoutEyebrowClass, checkoutHeadingClass, checkoutHeadingTextClass, checkoutHeadingTitleClass, checkoutPageClass, checkoutShellClass } from "@/components/checkout/checkout-styles";

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
  return <main className={checkoutPageClass}><div className={checkoutShellClass}>
    <CheckoutBrandBar locale={locale} back={t.back} />
    <header className={checkoutHeadingClass}>
      <p className={checkoutEyebrowClass}>{t.eyebrow}</p>
      <h1 className={checkoutHeadingTitleClass}>{t.title}</h1>
      <span className={checkoutHeadingTextClass}>{t.intro}</span>
    </header>
    <MinimalCheckoutForm />
  </div></main>;
}
