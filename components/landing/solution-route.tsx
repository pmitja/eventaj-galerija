import type { Metadata } from "next";
import { EventLanding } from "@/components/site/event-landing";
import { solutionLandingData } from "@/components/site/event-landing-data";
import { getSolutionPage } from "./solution-pages";
import { JsonLd } from "@/components/seo/json-ld";
import { solutionLanguageAlternates } from "@/lib/i18n/alternates";
import { appUrlForLocale, intlLocale, openGraphLocale } from "@/lib/i18n/locale";
import { getPublicAppUrls } from "@/lib/i18n/server";
import { solutionPagePath, type SolutionPageId, type SolutionPageLocale } from "@/lib/i18n/routes";
import { absoluteUrl, ogImage, SITE_NAME } from "@/lib/seo";

export function solutionMetadata(locale: SolutionPageLocale, id: SolutionPageId): Metadata {
  const page = getSolutionPage(id, locale);
  const env = getPublicAppUrls();
  const path = solutionPagePath(locale, id);
  if (!path) return {};

  return {
    title: page.seoTitle,
    description: page.metaDescription,
    alternates: {
      canonical: `${appUrlForLocale(env, locale)}${path}`,
      languages: solutionLanguageAlternates(env, id),
    },
    openGraph: {
      title: page.seoTitle,
      description: page.metaDescription,
      url: path,
      siteName: SITE_NAME,
      locale: openGraphLocale(locale),
      type: "website",
      images: [ogImage(locale)],
    },
    twitter: {
      card: "summary_large_image",
      title: page.seoTitle,
      description: page.metaDescription,
      images: [ogImage(locale)],
    },
  };
}

export function SolutionRoute({ locale, id }: { locale: SolutionPageLocale; id: SolutionPageId }) {
  const env = getPublicAppUrls();
  const page = getSolutionPage(id, locale);
  const path = solutionPagePath(locale, id);
  if (!path) return null;

  const siteUrl = appUrlForLocale(env, locale);
  const pageUrl = absoluteUrl(path, siteUrl);
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${pageUrl}#webpage`,
        url: pageUrl,
        name: page.seoTitle,
        description: page.metaDescription,
        inLanguage: intlLocale(locale),
        isPartOf: { "@id": `${siteUrl}/#website` },
        about: { "@id": `${siteUrl}/#application` },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: SITE_NAME, item: siteUrl },
          { "@type": "ListItem", position: 2, name: page.navTitle, item: pageUrl },
        ],
      },
    ],
  };

  return (
    <>
      <JsonLd data={structuredData} />
      <EventLanding locale={locale} data={solutionLandingData(locale, id)} />
    </>
  );
}
