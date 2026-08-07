import type { Metadata } from "next";
import { LegalDocumentPage } from "@/components/legal/legal-document";
import { canonicalUrl, languageAlternates } from "@/lib/i18n/alternates";
import { getLegalCopy } from "@/lib/i18n/legal";
import { openGraphLocale } from "@/lib/i18n/locale";
import { privacyPath } from "@/lib/i18n/routes";
import { getPublicAppUrls, getRequestLocale } from "@/lib/i18n/server";
import { SITE_NAME } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const env = getPublicAppUrls();
  const doc = getLegalCopy(locale).privacy;
  const routePath = privacyPath(locale);
  const title = `${doc.metaTitle} | ${SITE_NAME}`;
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
      siteName: SITE_NAME,
      locale: openGraphLocale(locale),
      type: "article",
    },
    robots: { index: true, follow: true },
  };
}

export default async function PrivacyPage() {
  const locale = await getRequestLocale();
  return <LegalDocumentPage locale={locale} document={getLegalCopy(locale).privacy} />;
}
