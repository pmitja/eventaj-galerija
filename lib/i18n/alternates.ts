import {
  SUPPORTED_LOCALES,
  appUrlForLocale,
  intlLocale,
  type Locale,
} from "./locale";
import { localizedMarketingPath } from "./routes";
import {
  SOLUTION_PAGE_LOCALES,
  solutionPagePath,
  type SolutionPageId,
} from "./routes";

/**
 * Language a visitor gets when none of the hreflang tags match their own.
 * English rather than the Slovenian original: the product is sold in seven
 * languages and Slovenian is the least useful fallback for the other six
 * markets.
 */
const X_DEFAULT_LOCALE: Locale = "en";

/**
 * hreflang map for a marketing page. Keys are BCP-47 tags plus `x-default`.
 */
export function languageAlternates(
  env: { PUBLIC_APP_URL: string; PUBLIC_APP_URL_EN: string },
  pathname: string,
): Record<string, string> {
  const alternates: Record<string, string> = {};

  for (const locale of SUPPORTED_LOCALES) {
    alternates[intlLocale(locale)] = absoluteFor(env, locale, pathname);
  }

  alternates["x-default"] = absoluteFor(env, X_DEFAULT_LOCALE, pathname);
  return alternates;
}

/** hreflang map for an international solution page. */
export function solutionLanguageAlternates(
  env: { PUBLIC_APP_URL: string; PUBLIC_APP_URL_EN: string },
  id: SolutionPageId,
): Record<string, string> {
  const alternates: Record<string, string> = {};

  for (const locale of SOLUTION_PAGE_LOCALES) {
    const path = solutionPagePath(locale, id);
    if (path) alternates[intlLocale(locale)] = `${appUrlForLocale(env, locale)}${path}`;
  }

  const englishPath = solutionPagePath("en", id);
  if (englishPath) alternates["x-default"] = `${appUrlForLocale(env, "en")}${englishPath}`;
  return alternates;
}

function absoluteFor(
  env: { PUBLIC_APP_URL: string; PUBLIC_APP_URL_EN: string },
  locale: Locale,
  pathname: string,
): string {
  const path = localizedMarketingPath(pathname, locale);
  return `${appUrlForLocale(env, locale)}${path === "/" ? "" : path}`;
}

/** Absolute canonical URL of the current page in its own locale. */
export function canonicalUrl(
  env: { PUBLIC_APP_URL: string; PUBLIC_APP_URL_EN: string },
  locale: Locale,
  pathname: string,
): string {
  return absoluteFor(env, locale, pathname);
}
