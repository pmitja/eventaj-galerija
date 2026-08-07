import type { MetadataRoute } from "next";
import { eventUseCasesFor } from "@/components/landing/use-cases";
import { absoluteUrl, SEO_LAST_UPDATED } from "@/lib/seo";
import { LEGAL_LAST_UPDATED } from "@/lib/i18n/legal";
import { languageAlternates } from "@/lib/i18n/alternates";
import { getPublicAppUrls, getRequestLocale } from "@/lib/i18n/server";
import { PREFIXED_LOCALES, appUrlForLocale, localePathPrefix, type Locale } from "@/lib/i18n/locale";
import { eventUseCasePath, orderPath, privacyPath, termsPath } from "@/lib/i18n/routes";

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

    /**
     * Every entry declares the full hreflang set. A locale whose URLs live on
     * the other domain is still announced here, which is how Google ties the
     * two sitemaps together.
     */
    const entry = (
      path: string,
      lastModified: string,
      changeFrequency: "weekly" | "monthly",
      priority: number,
    ) => ({
      // No trailing slash on a bare root: `loc` has to match the page's own
      // canonical and its self-referencing hreflang byte for byte.
      url: path === "/" ? siteUrl : absoluteUrl(path, siteUrl),
      lastModified,
      changeFrequency,
      priority,
      alternates: { languages: languageAlternates(env, path || "/") },
    });

    return [
      entry(localePathPrefix(locale) || "/", SEO_LAST_UPDATED, "weekly", 1),
      entry(orderPath(locale), SEO_LAST_UPDATED, "monthly", 0.8),
      ...eventUseCasesFor(locale).map(({ slug }) =>
        entry(eventUseCasePath(locale, slug), SEO_LAST_UPDATED, "monthly", 0.8),
      ),
      entry(termsPath(locale), LEGAL_LAST_UPDATED, "monthly", 0.3),
      entry(privacyPath(locale), LEGAL_LAST_UPDATED, "monthly", 0.3),
    ];
  });
}
