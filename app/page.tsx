import type { Metadata } from "next";
import { LandingPage } from "@/components/landing/landing-page";
import { JsonLd } from "@/components/seo/json-ld";
import { siteUrlForLocale } from "@/lib/i18n/locale";
import { SEO_COPY, ogImage, productStructuredDataFor } from "@/lib/seo";
import { getPublicAppUrls, getRequestLocale } from "@/lib/i18n/server";
import { canonicalUrl, languageAlternates } from "@/lib/i18n/alternates";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const env = getPublicAppUrls();
  const copy = SEO_COPY[locale];
  const shareImage = ogImage(locale);
  // Page-level `alternates` and `openGraph` replace the layout's, so the
  // hreflang map and the share card have to be repeated here — omitting either
  // silently drops every alternate link, or the preview image.
  return {
    title: copy.title,
    description: copy.description,
    alternates: {
      canonical: canonicalUrl(env, locale, "/"),
      languages: languageAlternates(env, "/"),
    },
    openGraph: {
      title: copy.title,
      description: copy.description,
      url: canonicalUrl(env, locale, "/"),
      images: [{ url: shareImage, width: 1200, height: 630, alt: copy.imageAlt }],
    },
    twitter: { card: "summary_large_image", title: copy.title, description: copy.description, images: [shareImage] },
  };
}

export default async function Home() {
  const locale = await getRequestLocale();
  const siteUrl = siteUrlForLocale(getPublicAppUrls(), locale);
  return (
    <>
      <JsonLd data={productStructuredDataFor(locale, siteUrl) as unknown as Record<string, unknown>} />
      <LandingPage />
    </>
  );
}
