export const SUPPORTED_LOCALES = ["sl", "en"] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "sl";
export const DEFAULT_PUBLIC_APP_URL = "https://galerija.eventaj.si";
export const DEFAULT_PUBLIC_APP_URL_EN = "https://gallery.eventaj.si";

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && SUPPORTED_LOCALES.includes(value as Locale);
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

export function localeFromHostname(hostname: string, englishAppUrl?: string): Locale {
  const normalized = normalizedHostname(hostname);
  const englishHostname = hostnameFromUrl(englishAppUrl);
  if (englishHostname && normalized === englishHostname) return "en";
  if (normalized === "en.localhost") return "en";
  return DEFAULT_LOCALE;
}

export function localeFromRequest(request: Request, englishAppUrl?: string): Locale {
  return localeFromHostname(new URL(request.url).hostname, englishAppUrl);
}

export function intlLocale(locale: Locale): "sl-SI" | "en-GB" {
  return locale === "en" ? "en-GB" : "sl-SI";
}

export function openGraphLocale(locale: Locale): "sl_SI" | "en_GB" {
  return locale === "en" ? "en_GB" : "sl_SI";
}

export function appUrlForLocale(
  env: { PUBLIC_APP_URL: string; PUBLIC_APP_URL_EN: string },
  locale: Locale,
): string {
  const value = locale === "en" ? env.PUBLIC_APP_URL_EN : env.PUBLIC_APP_URL;
  return value.replace(/\/$/, "");
}
