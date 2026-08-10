import type { Metadata } from "next";
import { LegalDocumentPage } from "@/components/legal/legal-document";
import { canonicalUrl, languageAlternates } from "@/lib/i18n/alternates";
import { getLegalCopy } from "@/lib/i18n/legal";
import { openGraphLocale } from "@/lib/i18n/locale";
import { privacyPath } from "@/lib/i18n/routes";
import { getPublicAppUrls, getRequestLocale } from "@/lib/i18n/server";
import { brandName, ogImage } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const env = getPublicAppUrls();
  const doc = getLegalCopy(locale).privacy;
  const routePath = privacyPath(locale);
  const siteName = brandName(locale);
  const title = `${doc.metaTitle} | ${siteName}`;
  return {
    title,
    description: doc.metaDescription,
    // Page-level `alternates` replaces the layout's, so the hreflang map has to
    // be repeated here — omitting it silently drops every alternate link.
    alternates: {
      canonical: canonicalUrl(env, locale, routePath),
      languages: languageAlternates(env, routePath),
    },
    openGraph: {
      title,
      description: doc.metaDescription,
      url: routePath,
      siteName,
      locale: openGraphLocale(locale),
      type: "article",
      images: [{ url: ogImage(locale), width: 1200, height: 630 }],
    },
    robots: { index: true, follow: true },
  };
}

export default async function PrivacyPage() {
  const locale = await getRequestLocale();
  return <LegalDocumentPage locale={locale} document={getLegalCopy(locale).privacy} />;
}
