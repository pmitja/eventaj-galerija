import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { UseCasePage } from "@/components/landing/use-case-page";
import { JsonLd } from "@/components/seo/json-ld";
import { eventUseCases, getEventUseCase } from "@/components/landing/use-cases";
import { absoluteUrl, SITE_NAME } from "@/lib/seo";
import { getPublicAppUrls, getRequestLocale } from "@/lib/i18n/server";
import { appUrlForLocale, intlLocale, openGraphLocale } from "@/lib/i18n/locale";
import { canonicalUrl, languageAlternates } from "@/lib/i18n/alternates";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { eventUseCasePath } from "@/lib/i18n/routes";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return eventUseCases.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const locale = await getRequestLocale();
  const useCase = getEventUseCase((await params).slug, locale);
  if (!useCase) return {};

  const env = getPublicAppUrls();
  const title = `${useCase.navTitle} – ${getDictionary(locale).seo.useCaseTitleSuffix} | ${SITE_NAME}`;
  const description = useCase.description;

  const routePath = eventUseCasePath(locale, useCase.slug);
  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl(env, locale, routePath),
      languages: languageAlternates(env, routePath),
    },
    openGraph: {
      title,
      description,
      url: routePath,
      siteName: SITE_NAME,
      locale: openGraphLocale(locale),
      type: "website",
      images: ["/og-image.png"],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/og-image.png"],
    },
  };
}

export default async function EventUseCaseRoute({ params }: PageProps) {
  const locale = await getRequestLocale();
  const env = getPublicAppUrls();
  const useCase = getEventUseCase((await params).slug, locale);
  if (!useCase) notFound();

  const siteUrl = appUrlForLocale(env, locale);
  const pageUrl = absoluteUrl(eventUseCasePath(locale, useCase.slug), siteUrl);
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${pageUrl}#webpage`,
        url: pageUrl,
        name: `${useCase.navTitle} – ${getDictionary(locale).seo.useCaseTitleSuffix}`,
        description: useCase.description,
        inLanguage: intlLocale(locale),
        isPartOf: { "@id": `${siteUrl}/#website` },
        about: { "@id": `${siteUrl}/#application` },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: SITE_NAME,
            item: siteUrl,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: useCase.navTitle,
            item: pageUrl,
          },
        ],
      },
    ],
  };

  return (
    <>
      <JsonLd data={structuredData} />
      <UseCasePage useCase={useCase} locale={locale} alternateOrigin={appUrlForLocale(env, locale === "sl" ? "en" : "sl")} />
    </>
  );
}
