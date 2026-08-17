import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { MinimalCheckoutForm } from "@/components/checkout/minimal-checkout-form";
import { getRequestLocale } from "@/lib/i18n/server";
import { localizedMarketingPath, orderPath } from "@/lib/i18n/routes";
import { getPublicAppUrls } from "@/lib/i18n/server";
import { canonicalUrl, languageAlternates } from "@/lib/i18n/alternates";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { brandName, guestBrandMark } from "@/lib/seo";
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
  const home = localizedMarketingPath("/", locale);
  const brandMarkSrc = guestBrandMark(locale);
  return <main className={checkoutPageClass}><div className={checkoutShellClass}>
    <div className="flex items-center justify-between gap-4">
      <Link className="inline-flex min-h-11 items-center gap-2 text-[14px] font-[750] text-[#7f3155]! hover:text-plum!" href={home}><ArrowLeft className="size-[18px]" aria-hidden="true" /> {t.back}</Link>
      {brandMarkSrc ? (
        <Link className="inline-flex items-center gap-[9px] text-[18px] font-extrabold tracking-[-.02em] whitespace-nowrap text-plum!" href={home}>
          <img className="block size-[30px] flex-none" src={brandMarkSrc} alt="" width={30} height={30} />
          <span>{brandName(locale)}</span>
        </Link>
      ) : null}
    </div>
    <header className={checkoutHeadingClass}>
      <p className={checkoutEyebrowClass}>{t.eyebrow}</p>
      <h1 className={checkoutHeadingTitleClass}>{t.title}</h1>
      <span className={checkoutHeadingTextClass}>{t.intro}</span>
    </header>
    <MinimalCheckoutForm />
  </div></main>;
}
