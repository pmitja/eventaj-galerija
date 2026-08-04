import type { Locale } from "@/lib/i18n/locale";

export const SITE_URL = "https://galerija.eventaj.si";
export const ENGLISH_SITE_URL = "https://gallery.eventaj.si";
export const BRAND_URL = "https://eventaj.si";
export const SITE_NAME = "Eventaj Galerija";
export const SITE_LANGUAGE = "sl-SI";
export const SEO_LAST_UPDATED = "2026-08-03";

export const SEO_COPY = {
  sl: {
    language: "sl-SI",
    openGraphLocale: "sl_SI",
    title: `${SITE_NAME} | QR galerija za dogodke`,
    description: "QR galerija za zbiranje fotografij in kratkih videov s porok, praznovanj, team buildingov in poslovnih dogodkov. Gostje ne potrebujejo aplikacije ali registracije.",
    imageAlt: "Eventaj.si Galerija – vse fotografije z dogodka na enem mestu.",
    operatingSystem: "Vsaka naprava s sodobnim spletnim brskalnikom",
    browserRequirements: "JavaScript in internetna povezava",
    featureList: [
      "QR dostop brez aplikacije",
      "Nalaganje fotografij in kratkih videov brez registracije gostov",
      "Neomejeno število gostov",
      "Skupna zasebna galerija",
      "Live slideshow",
      "Komentarji in všečki",
      "ZIP izvoz fotografij",
      "180-dnevna hramba galerije",
    ],
  },
  en: {
    language: "en-GB",
    openGraphLocale: "en_GB",
    title: `${SITE_NAME} | QR gallery for events`,
    description: "A QR gallery for collecting photos and short videos from weddings, celebrations, team buildings and corporate events. Guests need no app or account.",
    imageAlt: "Eventaj Gallery – every event photo in one place.",
    operatingSystem: "Any device with a modern web browser",
    browserRequirements: "JavaScript and an internet connection",
    featureList: [
      "QR access without an app",
      "Photo and short-video uploads without guest registration",
      "Unlimited guests",
      "Shared private gallery",
      "Live slideshow",
      "Comments and likes",
      "ZIP photo export",
      "180-day gallery retention",
    ],
  },
} as const;

export const SITE_DESCRIPTION = SEO_COPY.sl.description;

export const PRIVATE_ROBOTS_PATHS = [
  "/admin/", "/api/", "/display/", "/e/", "/login", "/nakup/", "/prenosi/", "/qr/", "/t/", "/demo/",
] as const;

export function siteStructuredDataFor(locale: Locale, siteUrl: string) {
  const copy = SEO_COPY[locale];
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${BRAND_URL}/#organization`,
        name: "Eventaj.si",
        url: BRAND_URL,
        email: "info@eventaj.si",
        logo: { "@type": "ImageObject", url: `${siteUrl}/logo.svg` },
      },
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        url: siteUrl,
        name: SITE_NAME,
        description: copy.description,
        inLanguage: copy.language,
        publisher: { "@id": `${BRAND_URL}/#organization` },
      },
      {
        "@type": "WebApplication",
        "@id": `${siteUrl}/#application`,
        url: siteUrl,
        name: SITE_NAME,
        description: copy.description,
        applicationCategory: "MultimediaApplication",
        operatingSystem: copy.operatingSystem,
        browserRequirements: copy.browserRequirements,
        inLanguage: copy.language,
        provider: { "@id": `${BRAND_URL}/#organization` },
        isPartOf: { "@id": `${siteUrl}/#website` },
        offers: {
          "@type": "Offer",
          price: "35.00",
          priceCurrency: "EUR",
          url: `${siteUrl}/naroci`,
          availability: "https://schema.org/InStock",
        },
        featureList: copy.featureList,
      },
    ],
  } as const;
}

export const siteStructuredData = siteStructuredDataFor("sl", SITE_URL);

export function absoluteUrl(path: string, siteUrl = SITE_URL) {
  return new URL(path, siteUrl).toString();
}

