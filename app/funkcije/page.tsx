import type { Metadata } from "next";
import { FeaturesPage } from "@/components/landing/features-page";
import { ogImage } from "@/lib/seo";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getPublicAppUrls, getRequestLocale } from "@/lib/i18n/server";
import { canonicalUrl, languageAlternates } from "@/lib/i18n/alternates";
import { featuresPath } from "@/lib/i18n/routes";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const env = getPublicAppUrls();
  const copy = getDictionary(locale).featuresPage;
  const shareImage = ogImage(locale);
  // Slovenian owns the internal route, so the hreflang map is built from the
  // Slovenian path and localized per locale by `languageAlternates`.
  const path = featuresPath("sl");
  return {
    title: copy.metaTitle,
    description: copy.metaDescription,
    alternates: {
      canonical: canonicalUrl(env, locale, path),
      languages: languageAlternates(env, path),
    },
    openGraph: {
      title: copy.metaTitle,
      description: copy.metaDescription,
      url: canonicalUrl(env, locale, path),
      images: [{ url: shareImage, width: 1200, height: 630, alt: copy.title }],
    },
    twitter: { card: "summary_large_image", title: copy.metaTitle, description: copy.metaDescription, images: [shareImage] },
  };
}

export default function Features() {
  return <FeaturesPage />;
}
