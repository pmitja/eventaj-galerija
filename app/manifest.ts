import type { MetadataRoute } from "next";
import { SEO_COPY, SITE_NAME } from "@/lib/seo";
import { getRequestLocale } from "@/lib/i18n/server";

export const dynamic = "force-dynamic";

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const locale = await getRequestLocale();
  return {
    name: SITE_NAME,
    short_name: "Eventaj Galerija",
    description: SEO_COPY[locale].description,
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#e11d48",
    lang: locale,
    icons: [
      {
        src: "/logo.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}
