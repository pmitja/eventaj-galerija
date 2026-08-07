import {
  DEFAULT_LOCALE,
  SUPPORTED_LOCALES,
  appUrlForLocale,
  intlLocale,
  type Locale,
} from "./locale";
import { localizedMarketingPath } from "./routes";

/**
 * hreflang map for a marketing page. Keys are BCP-47 tags plus `x-default`,
 * which points at the Slovenian original — search engines use it when no
 * language matches the visitor.
 */
export function languageAlternates(
  env: { PUBLIC_APP_URL: string; PUBLIC_APP_URL_EN: string },
  pathname: string,
): Record<string, string> {
  const alternates: Record<string, string> = {};

  for (const locale of SUPPORTED_LOCALES) {
    alternates[intlLocale(locale)] = absoluteFor(env, locale, pathname);
  }

  alternates["x-default"] = absoluteFor(env, DEFAULT_LOCALE, pathname);
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
