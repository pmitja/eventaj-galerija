export const SUPPORTED_LOCALES = ["sl", "en", "de", "nl", "es", "it", "fr"] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];

/**
 * Locales served from the English domain under a path prefix (/de, /nl, ...).
 * Slovenian and English keep their own domains and unprefixed paths so the
 * existing SEO and printed QR codes stay valid.
 */
export const PREFIXED_LOCALES = ["de", "nl", "es", "it", "fr"] as const;
export type PrefixedLocale = (typeof PREFIXED_LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "sl";
export const DEFAULT_PUBLIC_APP_URL = "https://galerija.eventaj.si";
export const DEFAULT_PUBLIC_APP_URL_EN = "https://gallery.eventaj.si";

const INTL_LOCALES = {
  sl: "sl-SI",
  en: "en-GB",
  de: "de-DE",
  nl: "nl-NL",
  es: "es-ES",
  it: "it-IT",
  fr: "fr-FR",
} as const;

const OPEN_GRAPH_LOCALES = {
  sl: "sl_SI",
  en: "en_GB",
  de: "de_DE",
  nl: "nl_NL",
  es: "es_ES",
  it: "it_IT",
  fr: "fr_FR",
} as const;

/** Endonyms — a language picker should always name a language in that language. */
export const LOCALE_LABELS = {
  sl: "Slovenščina",
  en: "English",
  de: "Deutsch",
  nl: "Nederlands",
  es: "Español",
  it: "Italiano",
  fr: "Français",
} as const satisfies Record<Locale, string>;

export const LOCALE_SHORT_LABELS = {
  sl: "SL",
  en: "EN",
  de: "DE",
  nl: "NL",
  es: "ES",
  it: "IT",
  fr: "FR",
} as const satisfies Record<Locale, string>;

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && SUPPORTED_LOCALES.includes(value as Locale);
}

export function isPrefixedLocale(value: unknown): value is PrefixedLocale {
  return typeof value === "string" && PREFIXED_LOCALES.includes(value as PrefixedLocale);
}

function normalizedHostname(value: string): string {
  return value.trim().toLowerCase().replace(/:\d+$/, "").replace(/^www\./, "");
}

export function hostnameFromUrl(value: string | undefined): string | null {
  if (!value) return null;
  try {
    return normalizedHostname(new URL(value).hostname);
  } catch {
    return null;
  }
}

/**
 * Resolves the locale a hostname serves by itself, ignoring any path prefix.
 * Prefixed locales all live on the English host, so this returns "en" for them.
 */
export function localeFromHostname(hostname: string, englishAppUrl?: string): Locale {
  const normalized = normalizedHostname(hostname);
  const englishHostname = hostnameFromUrl(englishAppUrl);
  if (englishHostname && normalized === englishHostname) return "en";
  if (normalized === "en.localhost") return "en";
  return DEFAULT_LOCALE;
}

/** Returns the "/de"-style prefix for a locale, or "" when the locale owns a domain. */
export function localePathPrefix(locale: Locale): string {
  return isPrefixedLocale(locale) ? `/${locale}` : "";
}

/** Reads a locale prefix off a pathname, e.g. "/de/order" -> "de". */
export function localeFromPathname(pathname: string): PrefixedLocale | null {
  const segment = pathname.split("/", 2)[1]?.toLowerCase();
  return isPrefixedLocale(segment) ? segment : null;
}

/** Removes a leading locale prefix: "/de/order" -> "/order", "/de" -> "/". */
export function stripLocalePrefix(pathname: string): string {
  const locale = localeFromPathname(pathname);
  if (!locale) return pathname;
  return pathname.slice(locale.length + 1) || "/";
}

/** Adds a locale prefix to an already-localized path. */
export function withLocalePrefix(locale: Locale, pathname: string): string {
  const prefix = localePathPrefix(locale);
  if (!prefix) return pathname;
  return pathname === "/" ? prefix : `${prefix}${pathname}`;
}

/**
 * Full request locale: the host decides sl/en, a path prefix on the English
 * host overrides it with one of the additional marketing languages.
 */
export function localeFromHostAndPath(hostname: string, pathname: string, englishAppUrl?: string): Locale {
  const hostLocale = localeFromHostname(hostname, englishAppUrl);
  if (hostLocale !== "en") return hostLocale;
  return localeFromPathname(pathname) ?? "en";
}

export function localeFromRequest(request: Request, englishAppUrl?: string): Locale {
  const url = new URL(request.url);
  return localeFromHostAndPath(url.hostname, url.pathname, englishAppUrl);
}

export function intlLocale(locale: Locale): (typeof INTL_LOCALES)[Locale] {
  return INTL_LOCALES[locale] ?? INTL_LOCALES[DEFAULT_LOCALE];
}

export function openGraphLocale(locale: Locale): (typeof OPEN_GRAPH_LOCALES)[Locale] {
  return OPEN_GRAPH_LOCALES[locale] ?? OPEN_GRAPH_LOCALES[DEFAULT_LOCALE];
}

/** Origin only — prefixed locales share the English origin. Use siteUrlForLocale for canonical roots. */
export function appUrlForLocale(
  env: { PUBLIC_APP_URL: string; PUBLIC_APP_URL_EN: string },
  locale: Locale,
): string {
  const value = locale === "sl" ? env.PUBLIC_APP_URL : env.PUBLIC_APP_URL_EN;
  return value.replace(/\/$/, "");
}

/** Canonical site root including any locale prefix, e.g. https://gallery.eventaj.si/de */
export function siteUrlForLocale(
  env: { PUBLIC_APP_URL: string; PUBLIC_APP_URL_EN: string },
  locale: Locale,
): string {
  return `${appUrlForLocale(env, locale)}${localePathPrefix(locale)}`;
}
