export const SITE_URL = "https://galerija.eventaj.si";
export const BRAND_URL = "https://eventaj.si";
export const SITE_NAME = "Eventaj Galerija";
export const SITE_LANGUAGE = "sl-SI";
export const SEO_LAST_UPDATED = "2026-07-23";

export const SITE_DESCRIPTION =
  "QR galerija za zbiranje fotografij s porok, praznovanj, team buildingov in poslovnih dogodkov. Gostje ne potrebujejo aplikacije ali registracije.";

export const PRIVATE_ROBOTS_PATHS = [
  "/admin/",
  "/api/",
  "/display/",
  "/e/",
  "/login",
  "/nakup/",
  "/prenosi/",
  "/qr/",
  "/t/",
  "/demo/",
] as const;

export const siteStructuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${BRAND_URL}/#organization`,
      name: "Eventaj.si",
      url: BRAND_URL,
      email: "info@eventaj.si",
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/logo.svg`,
      },
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: SITE_NAME,
      description: SITE_DESCRIPTION,
      inLanguage: SITE_LANGUAGE,
      publisher: {
        "@id": `${BRAND_URL}/#organization`,
      },
    },
    {
      "@type": "WebApplication",
      "@id": `${SITE_URL}/#application`,
      url: SITE_URL,
      name: SITE_NAME,
      description: SITE_DESCRIPTION,
      applicationCategory: "MultimediaApplication",
      operatingSystem: "Vsaka naprava s sodobnim spletnim brskalnikom",
      browserRequirements: "JavaScript in internetna povezava",
      inLanguage: SITE_LANGUAGE,
      provider: {
        "@id": `${BRAND_URL}/#organization`,
      },
      isPartOf: {
        "@id": `${SITE_URL}/#website`,
      },
      offers: {
        "@type": "Offer",
        price: "35.00",
        priceCurrency: "EUR",
        url: `${SITE_URL}/naroci`,
        availability: "https://schema.org/InStock",
      },
      featureList: [
        "QR dostop brez aplikacije",
        "Nalaganje fotografij brez registracije gostov",
        "Neomejeno število gostov",
        "Skupna zasebna galerija",
        "Live slideshow",
        "Komentarji in všečki",
        "ZIP izvoz fotografij",
        "90-dnevna hramba galerije",
      ],
    },
  ],
} as const;

export function absoluteUrl(path: string) {
  return new URL(path, SITE_URL).toString();
}
