import { withEnglishUS } from "@/lib/i18n/english-regions";
import type { Locale } from "@/lib/i18n/locale";
import { siteDe } from "./de";
import { siteEn, type SiteCopy } from "./en";
import { siteEs } from "./es";
import { siteFr } from "./fr";
import { siteIt } from "./it";
import { siteNl } from "./nl";
import { siteSl } from "./sl";

const SITE_COPY: Record<Locale, SiteCopy> = withEnglishUS({ sl: siteSl, en: siteEn, de: siteDe, nl: siteNl, es: siteEs, it: siteIt, fr: siteFr });

export function getSiteCopy(locale: Locale): SiteCopy {
  return SITE_COPY[locale] ?? SITE_COPY.en;
}

/** Replaces `{name}` placeholders. Unknown placeholders are left untouched. */
export function fill(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) => (key in values ? String(values[key]) : match));
}

export type { SiteCopy };
