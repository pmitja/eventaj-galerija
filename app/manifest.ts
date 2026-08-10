import type { MetadataRoute } from "next";
import { EVENTAJ_MARK, SEO_COPY, brandName } from "@/lib/seo";
import { getRequestLocale } from "@/lib/i18n/server";
import { intlLocale, localePathPrefix } from "@/lib/i18n/locale";

export const dynamic = "force-dynamic";

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const locale = await getRequestLocale();
  // A PWA installed from /de has to start on the German homepage, not the
  // English root the two share.
  const start = `${localePathPrefix(locale)}/`;
  const siteName = brandName(locale);
  return {
    id: start,
    name: siteName,
    short_name: siteName,
    description: SEO_COPY[locale].description,
    start_url: start,
    scope: start,
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#e11d48",
    lang: intlLocale(locale),
    icons: locale === "sl"
      ? [{ src: EVENTAJ_MARK, sizes: "any", type: "image/svg+xml" }]
      : [
          { src: "/icons/guest-mosaic/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
          { src: "/icons/guest-mosaic/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
        ],
  };
}
