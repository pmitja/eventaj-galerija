import { localePathPrefix, stripLocalePrefix, withLocalePrefix, type Locale } from "./locale";

const USE_CASE_SLUGS = {
  "poroke": "weddings",
  "rojstni-dnevi": "birthdays",
  "praznovanja": "celebrations",
  "team-building": "team-building",
  "poslovni-dogodki": "corporate-events",
  "konference-in-sejmi": "conferences-and-trade-shows",
} as const;

type SlovenianUseCaseSlug = keyof typeof USE_CASE_SLUGS;

export const SOLUTION_PAGE_PATHS = {
  "wedding-qr": {
    en: "/wedding-qr-code-for-photos",
    de: "/de/hochzeitsfotos-per-qr-code",
    nl: "/nl/trouwfotos-verzamelen-qr-code",
    es: "/es/codigo-qr-fotos-boda",
    it: "/it/codice-qr-foto-matrimonio",
    fr: "/fr/qr-code-photos-mariage",
  },
  "no-app-sharing": {
    en: "/share-event-photos-without-an-app",
    de: "/de/eventfotos-ohne-app-teilen",
    nl: "/nl/fotos-delen-zonder-app",
    es: "/es/compartir-fotos-evento-sin-app",
    it: "/it/condividere-foto-evento-senza-app",
    fr: "/fr/partager-photos-evenement-sans-application",
  },
  "event-qr-gallery": {
    en: "/event-photo-sharing-qr-code",
    de: "/de/qr-fotogalerie-events",
    nl: "/nl/qr-fotogalerij-evenement",
    es: "/es/codigo-qr-fotos-eventos",
    it: "/it/codice-qr-foto-evento",
    fr: "/fr/qr-code-partage-photos-evenement",
  },
} as const;

export type SolutionPageId = keyof typeof SOLUTION_PAGE_PATHS;
export type SolutionPageLocale = keyof (typeof SOLUTION_PAGE_PATHS)[SolutionPageId];
export const SOLUTION_PAGE_LOCALES: readonly SolutionPageLocale[] = ["en", "de", "nl", "es", "it", "fr"];

export function solutionPagePath(locale: Locale, id: SolutionPageId): string | null {
  if (!SOLUTION_PAGE_LOCALES.includes(locale as SolutionPageLocale)) return null;
  const paths = SOLUTION_PAGE_PATHS[id];
  return paths?.[locale as SolutionPageLocale] ?? null;
}

export function solutionPageIdFromPath(pathname: string): SolutionPageId | null {
  const normalized = pathname.replace(/\/$/, "") || "/";
  for (const [id, paths] of Object.entries(SOLUTION_PAGE_PATHS)) {
    if (Object.values(paths).includes(normalized as never)) return id as SolutionPageId;
  }
  return null;
}

/**
 * Slovenian owns its own translated slugs; every other locale reuses the
 * English slugs under its path prefix. Translating slugs per language would
 * multiply the redirect surface for very little SEO gain.
 */
function localized(locale: Locale, slovenian: string, english: string): string {
  return locale === "sl" ? slovenian : withLocalePrefix(locale, english);
}

export function orderPath(locale: Locale): string {
  return localized(locale, "/naroci", "/order");
}

export function checkoutSuccessPath(locale: Locale): string {
  return localized(locale, "/nakup/uspesen", "/order/success");
}

export function termsPath(locale: Locale): string {
  return localized(locale, "/pogoji-uporabe", "/terms-of-use");
}

export function privacyPath(locale: Locale): string {
  return localized(locale, "/zasebnost", "/privacy");
}

export function downloadPath(locale: Locale, token: string): string {
  const encoded = encodeURIComponent(token);
  return localized(locale, `/prenosi/${encoded}`, `/downloads/${encoded}`);
}

export function demoEventPath(locale: Locale): string {
  return localized(locale, "/e/ana-in-marko", "/e/anna-and-mark");
}

export function eventUseCasePath(locale: Locale, slovenianSlug: string): string {
  const englishSlug = USE_CASE_SLUGS[slovenianSlug as SlovenianUseCaseSlug] ?? slovenianSlug;
  return localized(locale, `/za-dogodke/${slovenianSlug}`, `/for-events/${englishSlug}`);
}

/**
 * Public link ownership for a use-case intent. Wedding searches on every
 * international locale belong to the focused commercial solution page;
 * Slovenian keeps the existing Eventaj information architecture.
 */
export function eventUseCaseMarketingPath(locale: Locale, slovenianSlug: string): string {
  if (locale !== "sl" && slovenianSlug === "poroke") {
    return solutionPagePath(locale, "wedding-qr") ?? eventUseCasePath(locale, slovenianSlug);
  }
  return eventUseCasePath(locale, slovenianSlug);
}

/** Maps the Slovenian internal path of a marketing route to its localized public path. */
const SLOVENIAN_ROUTE_BUILDERS: Readonly<Record<string, (locale: Locale) => string>> = {
  "/naroci": orderPath,
  "/nakup/uspesen": checkoutSuccessPath,
  "/pogoji-uporabe": termsPath,
  "/zasebnost": privacyPath,
  "/e/ana-in-marko": demoEventPath,
};

/** Reduces any localized marketing path back to its Slovenian internal path. */
export function slovenianRoutePath(pathname: string): string {
  const solutionId = solutionPageIdFromPath(pathname);
  if (solutionId) return `/solutions/${solutionId}`;

  const path = stripLocalePrefix(pathname).replace(/\/$/, "") || "/";

  if (path.startsWith("/za-dogodke/")) return path;
  if (path.startsWith("/for-events/")) {
    const englishSlug = path.slice("/for-events/".length);
    const slovenianSlug = Object.entries(USE_CASE_SLUGS)
      .find(([, english]) => english === englishSlug)?.[0];
    return slovenianSlug ? `/za-dogodke/${slovenianSlug}` : path;
  }
  if (path.startsWith("/downloads/")) return `/prenosi/${path.slice("/downloads/".length)}`;
  if (path.startsWith("/prenosi/")) return path;

  const englishToSlovenian: Readonly<Record<string, string>> = {
    "/order": "/naroci",
    "/order/success": "/nakup/uspesen",
    "/terms-of-use": "/pogoji-uporabe",
    "/privacy": "/zasebnost",
    "/e/anna-and-mark": "/e/ana-in-marko",
  };

  return englishToSlovenian[path] ?? path;
}

/** Destination for a language switch: same page, other language. */
export function localizedMarketingPath(pathname: string, targetLocale: Locale): string {
  const solutionId = solutionPageIdFromPath(pathname);
  if (solutionId) {
    return solutionPagePath(targetLocale, solutionId) ?? (localePathPrefix(targetLocale) || "/");
  }

  const slovenianPath = slovenianRoutePath(pathname);

  if (slovenianPath.startsWith("/za-dogodke/")) {
    return eventUseCaseMarketingPath(targetLocale, slovenianPath.slice("/za-dogodke/".length));
  }
  if (slovenianPath.startsWith("/prenosi/")) {
    return downloadPath(targetLocale, decodeURIComponent(slovenianPath.slice("/prenosi/".length)));
  }

  const builder = SLOVENIAN_ROUTE_BUILDERS[slovenianPath];
  if (builder) return builder(targetLocale);

  // Unknown page (including "/"): keep the path, swap only the locale prefix.
  return withLocalePrefix(targetLocale, stripLocalePrefix(pathname));
}

/** Public English path -> internal Slovenian path, used by the middleware rewrite. */
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

export const useCaseSlugPairs = Object.entries(USE_CASE_SLUGS) as ReadonlyArray<[SlovenianUseCaseSlug, string]>;

export { localePathPrefix };
