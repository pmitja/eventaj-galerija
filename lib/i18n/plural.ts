import { intlLocale, type Locale } from "./locale";

/**
 * CLDR plural forms. Slovenian genuinely needs four (1 komentar, 2 komentarja,
 * 3 komentarji, 5 komentarjev), so a one/other pair is not enough — the
 * Romance and Germanic languages simply leave the extra keys out.
 */
export type PluralForms = Partial<Record<Intl.LDMLPluralRule, string>> & { other: string };

export function plural(locale: Locale, count: number, forms: PluralForms): string {
  const rule = new Intl.PluralRules(intlLocale(locale)).select(count);
  return forms[rule] ?? forms.other;
}

/** Same as `plural`, with `{count}` substituted in the chosen form. */
export function pluralCount(locale: Locale, count: number, forms: PluralForms): string {
  return plural(locale, count, forms).replace("{count}", String(count));
}
