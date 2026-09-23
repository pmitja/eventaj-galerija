import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FaqPage } from "@/components/site/faq-page";
import { canonicalUrl, internationalLanguageAlternates } from "@/lib/i18n/alternates";
import { getPublicAppUrls, getRequestLocale } from "@/lib/i18n/server";
import { getSiteCopy } from "@/lib/i18n/site";
import { brandName, ogImage } from "@/lib/seo";

const ROUTE = "/faq";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const env = getPublicAppUrls();
  const copy = getSiteCopy(locale).faqPage;
  const title = `${copy.metaTitle} | ${brandName(locale)}`;
  const shareImage = ogImage(locale);
  return {
    title,
    description: copy.metaDescription,
    alternates: {
      canonical: canonicalUrl(env, locale, ROUTE),
      languages: internationalLanguageAlternates(env, ROUTE),
    },
    openGraph: { title, description: copy.metaDescription, url: canonicalUrl(env, locale, ROUTE), images: [{ url: shareImage, width: 1200, height: 630 }] },
    twitter: { card: "summary_large_image", title, description: copy.metaDescription, images: [shareImage] },
  };
}

/** Guest Mosaic only; the Slovenian host redirects this path to eventaj.si in middleware. */
export default async function Route() {
  const locale = await getRequestLocale();
  if (locale === "sl") notFound();
  return <FaqPage locale={locale} />;
}
