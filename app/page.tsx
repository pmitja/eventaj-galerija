import type { Metadata } from "next";
import { LandingPage } from "@/components/landing/landing-page";
import { SEO_COPY, ogImage } from "@/lib/seo";
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

export default function Home() {
  return <LandingPage />;
}
