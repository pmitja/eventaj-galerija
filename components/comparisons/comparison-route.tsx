import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/seo/json-ld";
import { getPublicAppUrls, getRequestLocale } from "@/lib/i18n/server";
import { appUrlForLocale, intlLocale, openGraphLocale } from "@/lib/i18n/locale";
import { ogImage } from "@/lib/seo";
import { comparisonCopy } from "@/lib/comparisons/copy";
import { comparisonContent } from "@/lib/comparisons/content";
import { COMPARISONS } from "@/lib/comparisons/facts";
import { COMPARISON_LABELS, COMPARISON_UPDATED, comparisonAlternates, comparisonPath, type ComparisonId, type ComparisonLocale } from "@/lib/comparisons/routes";
import { ComparisonPage } from "./comparison-page";

export function comparisonMetadata(locale: ComparisonLocale, id?: ComparisonId): Metadata {
  const t = comparisonCopy[locale];
  const title = id ? `Guest Mosaic vs ${COMPARISONS[id].name} | ${t.seoTopic}` : `${t.seoTopic} | ${COMPARISON_LABELS[locale]} | Guest Mosaic`;
  const description = id ? comparisonContent[locale][id].intro : t.hubIntro;
  const env = getPublicAppUrls();
  const url = `${appUrlForLocale(env, locale)}${comparisonPath(locale, id)}`;
  return {
    title: { absolute: title }, description,
    alternates: { canonical: url, languages: comparisonAlternates(env, id) },
    robots: { index: true, follow: true },
    openGraph: { title, description, url, siteName: "Guest Mosaic", locale: openGraphLocale(locale), type: "website", images: [ogImage(locale)] },
    twitter: { card: "summary_large_image", title, description, images: [ogImage(locale)] },
  };
}

export function comparisonStructuredData(locale: ComparisonLocale, id?: ComparisonId) {
  const env = getPublicAppUrls();
  const origin = appUrlForLocale(env, locale);
  const url = `${origin}${comparisonPath(locale, id)}`;
  const name = id ? `Guest Mosaic vs ${COMPARISONS[id].name}` : comparisonCopy[locale].hubTitle;
  const crumbs = [
    { "@type": "ListItem", position: 1, name: "Guest Mosaic", item: `${origin}${(locale === "en" || locale === "en-us") ? "" : `/${locale}`}` },
    { "@type": "ListItem", position: 2, name: COMPARISON_LABELS[locale], item: `${origin}${comparisonPath(locale)}` },
    ...(id ? [{ "@type": "ListItem", position: 3, name, item: url }] : []),
  ];
  return { "@context": "https://schema.org", "@graph": [
    { "@type": "WebPage", "@id": `${url}#webpage`, url, name, inLanguage: intlLocale(locale), dateModified: COMPARISON_UPDATED, isPartOf: { "@id": `${origin}/#website` }, publisher: { "@type": "Organization", name: "Guest Mosaic", url: origin } },
    { "@type": "BreadcrumbList", itemListElement: crumbs },
  ] };
}

export async function ComparisonRoute({ locale, id }: { locale: ComparisonLocale; id?: ComparisonId }) {
  // These pages belong only to the international host and their physical locale path.
  if (await getRequestLocale() !== locale) notFound();
  return <><JsonLd data={comparisonStructuredData(locale, id)} /><ComparisonPage locale={locale} id={id} /></>;
}
