import type { Locale } from "@/lib/i18n/locale";
import { orderPath } from "@/lib/i18n/routes";

export const SITE_URL = "https://galerija.eventaj.si";
export const ENGLISH_SITE_URL = "https://guestmosaic.com";
export const BRAND_URL = "https://eventaj.si";
export const SITE_NAME = "Guest Mosaic";

/**
 * Slovenian keeps the original Eventaj mark; every other language carries the
 * Guest Mosaic mosaic-heart. Both live in /public and are referenced by path.
 */
export const EVENTAJ_MARK = "/logo.svg";
export const GUEST_MOSAIC_MARK = "/guest-mosaic-mark.webp";

export function brandMark(locale: Locale): string {
  return locale === "sl" ? EVENTAJ_MARK : GUEST_MOSAIC_MARK;
}

/**
 * Gallery, live show, order and legal pages carry the mark only outside
 * Slovenian; the Slovenian versions of those pages stay text-only.
 */
export function guestBrandMark(locale: Locale): string | null {
  return locale === "sl" ? null : GUEST_MOSAIC_MARK;
}
export const SITE_LANGUAGE = "sl-SI";
export const SEO_LAST_UPDATED = "2026-08-04";

export const SEO_COPY = {
  sl: {
    language: "sl-SI",
    openGraphLocale: "sl_SI",
    title: `${SITE_NAME} | QR galerija za dogodke`,
    description: "Zberite fotografije, kratke videe in glasovna voščila gostov v eni QR galeriji dogodka. Brez aplikacije, registracije ali naročnine.",
    imageAlt: "Guest Mosaic – vse fotografije z dogodka na enem mestu.",
    operatingSystem: "Vsaka naprava s sodobnim spletnim brskalnikom",
    browserRequirements: "JavaScript in internetna povezava",
    featureList: [
      "QR dostop brez aplikacije",
      "Nalaganje fotografij in kratkih videov brez registracije gostov",
      "Neomejeno število gostov",
      "Skupna zasebna galerija",
      "Live slideshow",
      "Komentarji in všečki",
      "Audio knjiga gostov z glasovnimi voščili",
      "Neposreden prenos originalne fotografije",
      "ZIP izvoz fotografij",
      "180-dnevna hramba galerije",
    ],
  },
  en: {
    language: "en-GB",
    openGraphLocale: "en_GB",
    title: `${SITE_NAME} | QR gallery for events`,
    description: "Collect guest photos, short videos and voice messages in one event QR gallery. No app, guest account or subscription required.",
    imageAlt: "Guest Mosaic – every event photo in one place.",
    operatingSystem: "Any device with a modern web browser",
    browserRequirements: "JavaScript and an internet connection",
    featureList: [
      "QR access without an app",
      "Photo and short-video uploads without guest registration",
      "Unlimited guests",
      "Shared private gallery",
      "Live slideshow",
      "Comments and likes",
      "Audio guestbook with voice messages",
      "Direct original-photo downloads",
      "ZIP photo export",
      "180-day gallery retention",
    ],
  },
  de: {
    language: "de-DE",
    openGraphLocale: "de_DE",
    title: `${SITE_NAME} | QR-Galerie für Events`,
    description: "Sammeln Sie Gästefotos, kurze Videos und Sprachnachrichten in einer QR-Galerie. Ohne App, ohne Gästekonto und ohne Abo.",
    imageAlt: "Guest Mosaic – alle Eventfotos an einem Ort.",
    operatingSystem: "Jedes Gerät mit einem modernen Webbrowser",
    browserRequirements: "JavaScript und eine Internetverbindung",
    featureList: [
      "QR-Zugang ohne App",
      "Foto- und Video-Uploads ohne Registrierung der Gäste",
      "Unbegrenzt Gäste",
      "Gemeinsame private Galerie",
      "Live-Slideshow",
      "Kommentare und Likes",
      "Audio-Gästebuch mit Sprachnachrichten",
      "Direkter Download der Originalfotos",
      "ZIP-Export der Fotos",
      "180 Tage Speicherung der Galerie",
    ],
  },
  nl: {
    language: "nl-NL",
    openGraphLocale: "nl_NL",
    title: `${SITE_NAME} | QR-galerij voor evenementen`,
    description: "Verzamel foto's, korte video's en spraakberichten van gasten in één QR-galerij. Zonder app, account of abonnement.",
    imageAlt: "Guest Mosaic – alle foto's van je evenement op één plek.",
    operatingSystem: "Elk apparaat met een moderne webbrowser",
    browserRequirements: "JavaScript en een internetverbinding",
    featureList: [
      "QR-toegang zonder app",
      "Foto's en korte video's uploaden zonder registratie van gasten",
      "Onbeperkt gasten",
      "Gedeelde privégalerij",
      "Live slideshow",
      "Reacties en likes",
      "Audiogastenboek met spraakberichten",
      "Rechtstreekse download van de originele foto",
      "ZIP-export van foto's",
      "180 dagen bewaartermijn van de galerij",
    ],
  },
  es: {
    language: "es-ES",
    openGraphLocale: "es_ES",
    title: `${SITE_NAME} | Galería QR para eventos`,
    description: "Reúne fotos, vídeos cortos y mensajes de voz de tus invitados en una galería QR. Sin aplicación, sin registro y sin suscripción.",
    imageAlt: "Guest Mosaic: todas las fotos del evento en un solo lugar.",
    operatingSystem: "Cualquier dispositivo con un navegador web moderno",
    browserRequirements: "JavaScript y conexión a internet",
    featureList: [
      "Acceso por QR sin aplicación",
      "Subida de fotos y vídeos cortos sin registro de los invitados",
      "Invitados ilimitados",
      "Galería privada compartida",
      "Slideshow en directo",
      "Comentarios y me gusta",
      "Libro de visitas de audio con mensajes de voz",
      "Descarga directa de la foto original",
      "Exportación de fotos en ZIP",
      "Conservación de la galería durante 180 días",
    ],
  },
  it: {
    language: "it-IT",
    openGraphLocale: "it_IT",
    title: `${SITE_NAME} | Galleria QR per eventi`,
    description: "Raccogli foto, brevi video e messaggi vocali dei tuoi ospiti in un'unica galleria QR. Senza app, senza registrazione e senza abbonamento.",
    imageAlt: "Guest Mosaic: tutte le foto dell'evento in un unico posto.",
    operatingSystem: "Qualsiasi dispositivo con un browser web moderno",
    browserRequirements: "JavaScript e una connessione a internet",
    featureList: [
      "Accesso con QR senza app",
      "Caricamento di foto e brevi video senza registrazione degli ospiti",
      "Ospiti illimitati",
      "Galleria privata condivisa",
      "Slideshow dal vivo",
      "Commenti e mi piace",
      "Guestbook audio con messaggi vocali",
      "Download diretto della foto originale",
      "Esportazione delle foto in ZIP",
      "Conservazione della galleria per 180 giorni",
    ],
  },
  fr: {
    language: "fr-FR",
    openGraphLocale: "fr_FR",
    title: `${SITE_NAME} | Galerie QR pour événements`,
    description: "Rassemblez les photos, courtes vidéos et messages vocaux de vos invités dans une galerie QR. Sans application, sans inscription et sans abonnement.",
    imageAlt: "Guest Mosaic – toutes les photos de l'événement au même endroit.",
    operatingSystem: "Tout appareil doté d'un navigateur web moderne",
    browserRequirements: "JavaScript et une connexion internet",
    featureList: [
      "Accès par QR code sans application",
      "Envoi de photos et de courtes vidéos sans inscription des invités",
      "Invités illimités",
      "Galerie privée partagée",
      "Diaporama en direct",
      "Commentaires et j'aime",
      "Livre d'or audio avec messages vocaux",
      "Téléchargement direct de la photo originale",
      "Export des photos en ZIP",
      "Conservation de la galerie pendant 180 jours",
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
        name: SITE_NAME,
        url: siteUrl,
        email: "info@eventaj.si",
        logo: { "@type": "ImageObject", url: `${siteUrl}${brandMark(locale)}` },
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
          url: `${siteUrl}${orderPath(locale)}`,
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
