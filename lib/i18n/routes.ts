import type { Locale } from "./locale";

const USE_CASE_SLUGS = {
  "poroke": "weddings",
  "rojstni-dnevi": "birthdays",
  "praznovanja": "celebrations",
  "team-building": "team-building",
  "poslovni-dogodki": "corporate-events",
  "konference-in-sejmi": "conferences-and-trade-shows",
} as const;

type SlovenianUseCaseSlug = keyof typeof USE_CASE_SLUGS;

export function orderPath(locale: Locale): string {
  return locale === "en" ? "/order" : "/naroci";
}

export function checkoutSuccessPath(locale: Locale): string {
  return locale === "en" ? "/order/success" : "/nakup/uspesen";
}

export function termsPath(locale: Locale): string {
  return locale === "en" ? "/terms-of-use" : "/pogoji-uporabe";
}

export function privacyPath(locale: Locale): string {
  return locale === "en" ? "/privacy" : "/zasebnost";
}

export function downloadPath(locale: Locale, token: string): string {
  return `${locale === "en" ? "/downloads" : "/prenosi"}/${encodeURIComponent(token)}`;
}

export function demoEventPath(locale: Locale): string {
  return locale === "en" ? "/e/anna-and-mark" : "/e/ana-in-marko";
}

export function eventUseCasePath(locale: Locale, slovenianSlug: string): string {
  const prefix = locale === "en" ? "/for-events" : "/za-dogodke";
  const slug = locale === "en"
    ? USE_CASE_SLUGS[slovenianSlug as SlovenianUseCaseSlug] ?? slovenianSlug
    : slovenianSlug;
  return `${prefix}/${slug}`;
}

export function localizedMarketingPath(pathname: string, targetLocale: Locale): string {
  const path = pathname.replace(/\/$/, "") || "/";
  const reverseSlug = Object.entries(USE_CASE_SLUGS)
    .find(([, englishSlug]) => path === `/for-events/${englishSlug}`)?.[0];

  if (path.startsWith("/za-dogodke/")) {
    return eventUseCasePath(targetLocale, path.slice("/za-dogodke/".length));
  }
  if (reverseSlug) return eventUseCasePath(targetLocale, reverseSlug);

  const known: Record<string, (locale: Locale) => string> = {
    "/naroci": orderPath,
    "/order": orderPath,
    "/nakup/uspesen": checkoutSuccessPath,
    "/order/success": checkoutSuccessPath,
    "/pogoji-uporabe": termsPath,
    "/terms-of-use": termsPath,
    "/zasebnost": privacyPath,
    "/privacy": privacyPath,
    "/e/ana-in-marko": demoEventPath,
    "/e/anna-and-mark": demoEventPath,
  };

  return known[path]?.(targetLocale) ?? pathname;
}

export const englishRewriteEntries = [
  ["/order", "/naroci"],
  ["/order/success", "/nakup/uspesen"],
  ["/terms-of-use", "/pogoji-uporabe"],
  ["/privacy", "/zasebnost"],
  ["/e/anna-and-mark", "/e/ana-in-marko"],
  ...Object.entries(USE_CASE_SLUGS).map(([slovenian, english]) => [
    `/for-events/${english}`,
    `/za-dogodke/${slovenian}`,
  ]),
] as const;
