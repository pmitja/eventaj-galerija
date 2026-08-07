import type { Metadata } from "next";
import { LandingPage } from "@/components/landing/landing-page";
import { SEO_COPY } from "@/lib/seo";
import { getPublicAppUrls, getRequestLocale } from "@/lib/i18n/server";
import { canonicalUrl, languageAlternates } from "@/lib/i18n/alternates";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const env = getPublicAppUrls();
  const copy = SEO_COPY[locale];
  // Page-level `alternates` replaces the layout's, so the hreflang map has to be
  // repeated here — omitting it silently drops every alternate link.
  return {
    title: copy.title,
    description: copy.description,
    alternates: {
      canonical: canonicalUrl(env, locale, "/"),
      languages: languageAlternates(env, "/"),
    },
    openGraph: { title: copy.title, description: copy.description, url: canonicalUrl(env, locale, "/") },
  };
}

export default function Home() {
  return <LandingPage />;
}
