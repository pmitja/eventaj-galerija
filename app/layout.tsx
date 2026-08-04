import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { JsonLd } from "@/components/seo/json-ld";
import { LocaleProvider } from "@/components/i18n/locale-provider";
import { appUrlForLocale } from "@/lib/i18n/locale";
import { getPublicAppUrls, getRequestLocale } from "@/lib/i18n/server";
import { ENGLISH_SITE_URL, SEO_COPY, SITE_NAME, SITE_URL, siteStructuredDataFor } from "@/lib/seo";
import "./globals.css";

const inter = Inter({
  subsets: ["latin", "latin-ext"],
  display: "swap",
  variable: "--font-inter",
});

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const siteUrl = appUrlForLocale(getPublicAppUrls(), locale);
  const copy = SEO_COPY[locale];
  return {
    metadataBase: new URL(siteUrl),
    title: copy.title,
    description: copy.description,
    applicationName: SITE_NAME,
    authors: [{ name: "Eventaj.si", url: "https://eventaj.si" }],
    creator: "Eventaj.si",
    publisher: "Eventaj.si",
    category: "event photo sharing",
    keywords: locale === "en"
      ? ["QR gallery", "event photos", "wedding photo gallery", "photo sharing without an app", "live slideshow", "team building photos"]
      : ["QR galerija", "fotografije z dogodka", "poročna galerija", "deljenje fotografij brez aplikacije", "live slideshow", "team building fotografije"],
    referrer: "origin-when-cross-origin",
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 },
    },
    icons: { icon: "/logo.svg", shortcut: "/logo.svg" },
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
      canonical: siteUrl,
      languages: { "sl-SI": SITE_URL, "en-GB": ENGLISH_SITE_URL, "x-default": SITE_URL },
    },
  };
}

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const locale = await getRequestLocale();
  const siteUrl = appUrlForLocale(getPublicAppUrls(), locale);
  return (
    <html lang={locale}>
      <body className={inter.variable}>
        <JsonLd data={siteStructuredDataFor(locale, siteUrl) as unknown as Record<string, unknown>} />
        <LocaleProvider locale={locale}>{children}</LocaleProvider>
      </body>
    </html>
  );
}
