import type { Locale } from "../locale";
import { de } from "./de";
import { en, type Dictionary } from "./en";
import { es } from "./es";
import { fr } from "./fr";
import { it } from "./it";
import { nl } from "./nl";
import { sl } from "./sl";

const DICTIONARIES: Record<Locale, Dictionary> = { sl, en, de, nl, es, it, fr };

export function getDictionary(locale: Locale): Dictionary {
  return DICTIONARIES[locale] ?? en;
}

export type { Dictionary };
