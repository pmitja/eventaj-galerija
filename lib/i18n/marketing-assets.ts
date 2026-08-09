import type { Locale } from "./locale";

export function localizedMarketingScreenshot(locale: Locale, source: string): string {
  if (locale === "sl") return source;
  const localizedSource = source.endsWith("/identity-gate.png")
    ? source.replace("/identity-gate.png", "/identity-gate-full.png")
    : source;
  return localizedSource.replace("/marketing/screenshots/", `/marketing/screenshots/${locale}/`);
}
