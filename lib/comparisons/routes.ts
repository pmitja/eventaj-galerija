import { z } from "zod";
import { appUrlForLocale, intlLocale, localePathPrefix, stripLocalePrefix } from "@/lib/i18n/locale";

export const COMPARISON_IDS = ["whatsapp", "google-drive", "google-photos", "guestpix", "kululu", "weduploader"] as const;
export const COMPARISON_LOCALES = ["en", "en-us", "de", "nl", "es", "it", "fr"] as const;
export type ComparisonId = typeof COMPARISON_IDS[number];
export type ComparisonLocale = typeof COMPARISON_LOCALES[number];
export const comparisonSlugSchema = z.enum(COMPARISON_IDS.map(id => `guest-mosaic-vs-${id}` as const));
export const COMPARISON_UPDATED = "2026-09-11";
export const COMPARISON_LABELS: Record<ComparisonLocale, string> = {
  en: "Compare", "en-us": "Compare", de: "Vergleichen", nl: "Vergelijken", es: "Comparar", it: "Confronta", fr: "Comparer",
};

export function comparisonIdFromSlug(slug: string): ComparisonId | null {
  const parsed = comparisonSlugSchema.safeParse(slug);
  return parsed.success ? parsed.data.slice("guest-mosaic-vs-".length) as ComparisonId : null;
}

export function isComparisonPath(pathname: string): boolean {
  const path = stripLocalePrefix(pathname);
  return path === "/compare" || path.startsWith("/compare/");
}

export function comparisonPath(locale: ComparisonLocale, id?: ComparisonId): string {
  return `${localePathPrefix(locale)}/compare${id ? `/guest-mosaic-vs-${id}` : ""}`;
}

export function comparisonAlternates(env: { PUBLIC_APP_URL: string; PUBLIC_APP_URL_EN: string }, id?: ComparisonId) {
  return Object.fromEntries([
    ...COMPARISON_LOCALES.map(locale => [intlLocale(locale), `${appUrlForLocale(env, locale)}${comparisonPath(locale, id)}`]),
    ["x-default", `${appUrlForLocale(env, "en")}${comparisonPath("en", id)}`],
  ]);
}
