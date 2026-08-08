import type { Locale } from "./locale";

export function localizedMarketingScreenshot(locale: Locale, source: string): string {
  return locale === "sl"
    ? source
    : source.replace("/marketing/screenshots/", `/marketing/screenshots/${locale}/`);
}
