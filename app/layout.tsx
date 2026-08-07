import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { JsonLd } from "@/components/seo/json-ld";
import { LocaleProvider } from "@/components/i18n/locale-provider";
import { appUrlForLocale, intlLocale, siteUrlForLocale } from "@/lib/i18n/locale";
import { languageAlternates } from "@/lib/i18n/alternates";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getPublicAppUrls, getRequestLocale } from "@/lib/i18n/server";
import { EVENTAJ_MARK, SEO_COPY, SITE_NAME, siteStructuredDataFor } from "@/lib/seo";
import "./globals.css";

const inter = Inter({
  subsets: ["latin", "latin-ext"],
  display: "swap",
  variable: "--font-inter",
});

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const env = getPublicAppUrls();
  const siteUrl = appUrlForLocale(env, locale);
  const copy = SEO_COPY[locale];
  return {
    metadataBase: new URL(siteUrl),
    title: copy.title,
    description: copy.description,
    applicationName: SITE_NAME,
    authors: [{ name: SITE_NAME }],
    creator: SITE_NAME,
    publisher: SITE_NAME,
    category: "event photo sharing",
    keywords: getDictionary(locale).seo.keywords,
    referrer: "origin-when-cross-origin",
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 },
    },
    icons: locale === "sl"
      ? { icon: EVENTAJ_MARK, shortcut: EVENTAJ_MARK }
      : {
          icon: [
            { url: "/icons/guest-mosaic/icon-32.png", sizes: "32x32", type: "image/png" },
            { url: "/icons/guest-mosaic/icon-192.png", sizes: "192x192", type: "image/png" },
          ],
          shortcut: "/icons/guest-mosaic/icon-32.png",
          apple: { url: "/icons/guest-mosaic/icon-180.png", sizes: "180x180", type: "image/png" },
        },
    manifest: "/manifest.webmanifest",
    openGraph: {
      title: copy.title,
      description: copy.description,
      url: "/",
      siteName: SITE_NAME,
      locale: copy.openGraphLocale,
      type: "website",
      images: [{ url: "/og-image.png", width: 1200, height: 630, alt: copy.imageAlt }],
    },
    twitter: { card: "summary_large_image", title: copy.title, description: copy.description, images: ["/og-image.png"] },
    alternates: {
      canonical: siteUrlForLocale(env, locale),
      languages: languageAlternates(env, "/"),
    },
  };
}

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const locale = await getRequestLocale();
  const siteUrl = siteUrlForLocale(getPublicAppUrls(), locale);
  return (
    <html lang={intlLocale(locale)}>
      <body className={inter.variable}>
        <JsonLd data={siteStructuredDataFor(locale, siteUrl) as unknown as Record<string, unknown>} />
        <LocaleProvider locale={locale}>{children}</LocaleProvider>
      </body>
    </html>
  );
}
