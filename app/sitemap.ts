import type { MetadataRoute } from "next";
import { eventUseCases } from "@/components/landing/use-cases";
import { absoluteUrl, SEO_LAST_UPDATED } from "@/lib/seo";
import { getPublicAppUrls, getRequestLocale } from "@/lib/i18n/server";
import { PREFIXED_LOCALES, appUrlForLocale, localePathPrefix, type Locale } from "@/lib/i18n/locale";
import { eventUseCasePath, orderPath } from "@/lib/i18n/routes";

export const dynamic = "force-dynamic";

/**
 * Each domain lists only the languages it serves. The English domain also hosts
 * the path-prefixed languages, so its sitemap has to cover all of them.
 */
function localesForHost(requestLocale: Locale): Locale[] {
  return requestLocale === "sl" ? ["sl"] : ["en", ...PREFIXED_LOCALES];
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const requestLocale = await getRequestLocale();
  const env = getPublicAppUrls();

  return localesForHost(requestLocale).flatMap((locale) => {
    const siteUrl = appUrlForLocale(env, locale);
    return [
      {
        url: absoluteUrl(localePathPrefix(locale) || "/", siteUrl),
        lastModified: SEO_LAST_UPDATED,
        changeFrequency: "weekly" as const,
        priority: 1,
      },
      {
        url: absoluteUrl(orderPath(locale), siteUrl),
        lastModified: SEO_LAST_UPDATED,
        changeFrequency: "monthly" as const,
        priority: 0.8,
      },
      ...eventUseCases.map(({ slug }) => ({
        url: absoluteUrl(eventUseCasePath(locale, slug), siteUrl),
        lastModified: SEO_LAST_UPDATED,
        changeFrequency: "monthly" as const,
        priority: 0.8,
      })),
    ];
  });
}
