import type { MetadataRoute } from "next";
import { eventUseCasesFor } from "@/components/landing/use-cases";
import { absoluteUrl, SEO_LAST_UPDATED } from "@/lib/seo";
import { LEGAL_LAST_UPDATED } from "@/lib/i18n/legal";
import { languageAlternates, solutionLanguageAlternates } from "@/lib/i18n/alternates";
import { getPublicAppUrls, getRequestLocale } from "@/lib/i18n/server";
import { PREFIXED_LOCALES, appUrlForLocale, localePathPrefix, type Locale } from "@/lib/i18n/locale";
import {
  SOLUTION_PAGE_LOCALES,
  SOLUTION_PAGE_PATHS,
  eventUseCasePath,
  featuresPath,
  orderPath,
  privacyPath,
  solutionPagePath,
  termsPath,
  type SolutionPageLocale,
} from "@/lib/i18n/routes";

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
      languages = languageAlternates(env, path || "/"),
    ) => ({
      // No trailing slash on a bare root: `loc` has to match the page's own
      // canonical and its self-referencing hreflang byte for byte.
      url: path === "/" ? siteUrl : absoluteUrl(path, siteUrl),
      lastModified,
      changeFrequency,
      priority,
      alternates: { languages },
    });

    const solutionEntries = SOLUTION_PAGE_LOCALES.includes(locale as SolutionPageLocale)
      ? Object.keys(SOLUTION_PAGE_PATHS).flatMap((id) => {
          const path = solutionPagePath(locale, id as keyof typeof SOLUTION_PAGE_PATHS);
          return path
            ? [entry(path, SEO_LAST_UPDATED, "monthly", 0.9, solutionLanguageAlternates(env, id as keyof typeof SOLUTION_PAGE_PATHS))]
            : [];
        })
      : [];

    return [
      entry(localePathPrefix(locale) || "/", SEO_LAST_UPDATED, "weekly", 1),
      entry(orderPath(locale), SEO_LAST_UPDATED, "monthly", 0.8),
      entry(featuresPath(locale), SEO_LAST_UPDATED, "monthly", 0.8),
      ...eventUseCasesFor(locale)
        .filter(({ slug }) => locale === "sl" || slug !== "poroke")
        .map(({ slug }) =>
          entry(eventUseCasePath(locale, slug), SEO_LAST_UPDATED, "monthly", 0.8),
        ),
      ...solutionEntries,
      entry(termsPath(locale), LEGAL_LAST_UPDATED, "monthly", 0.3),
      entry(privacyPath(locale), LEGAL_LAST_UPDATED, "monthly", 0.3),
    ];
  });
}
