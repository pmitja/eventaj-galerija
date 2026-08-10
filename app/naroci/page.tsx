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
import { brandName, guestBrandMark } from "@/lib/seo";
import { cn } from "@/lib/utils";
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

const stepItem =
  "relative grid justify-items-center gap-[7px] text-center text-[12px] font-bold text-[#856b77] [&:not(:last-child)]:after:absolute [&:not(:last-child)]:after:top-[15px] [&:not(:last-child)]:after:left-[calc(50%+22px)] [&:not(:last-child)]:after:z-0 [&:not(:last-child)]:after:h-px [&:not(:last-child)]:after:w-[calc(100%-44px)] [&:not(:last-child)]:after:bg-[#e4d4dc] [&:not(:last-child)]:after:content-['']";
const stepBadge =
  "z-1 grid size-8 place-items-center rounded-full border border-[#dcc5d0] bg-white text-[#8b4966]";
const stepLabel = "max-w-[86px] text-[11px]/[1.25] min-[381px]:text-[12px] sm:max-w-none sm:leading-normal";

export default async function OrderPage() {
  const locale = await getRequestLocale();
  const t = getDictionary(locale).order;
  const videoUploadsEnabled = String(getCloudflareEnv().VIDEO_UPLOAD_ENABLED) === "true";
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
    <ol className="mx-auto mb-7 grid max-w-[670px] list-none grid-cols-3 gap-0 p-0 sm:mb-[38px]" aria-label={t.stepsLabel}>
      <li className={cn(stepItem, "text-plum")} aria-current="step"><span className={cn(stepBadge, "border-brand bg-brand text-white shadow-[0_0_0_5px_var(--brand-soft)]")}><Check className="size-4" aria-hidden="true" /></span><small className={stepLabel}>{t.stepDetails}</small></li>
      <li className={stepItem}><span className={stepBadge}><CreditCard className="size-4" aria-hidden="true" /></span><small className={stepLabel}>{t.stepPayment}</small></li>
      <li className={stepItem}><span className={stepBadge}><Images className="size-4" aria-hidden="true" /></span><small className={stepLabel}>{t.stepQr}</small></li>
    </ol>
    <CheckoutForm videoUploadsEnabled={videoUploadsEnabled} />
  </div></main>;
}
