import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { JsonLd } from "@/components/seo/json-ld";
import {
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_URL,
  siteStructuredData,
} from "@/lib/seo";
import "./globals.css";

const inter = Inter({
  subsets: ["latin", "latin-ext"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: `${SITE_NAME} | QR galerija za dogodke`,
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  authors: [{ name: "Eventaj.si", url: "https://eventaj.si" }],
  creator: "Eventaj.si",
  publisher: "Eventaj.si",
  category: "event photo sharing",
  keywords: [
    "QR galerija",
    "fotografije z dogodka",
    "poročna galerija",
    "deljenje fotografij brez aplikacije",
    "live slideshow",
    "team building fotografije",
  ],
  referrer: "origin-when-cross-origin",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  icons: {
    icon: "/logo.svg",
    shortcut: "/logo.svg",
  },
  manifest: "/manifest.webmanifest",
  openGraph: {
    title: `${SITE_NAME} | QR galerija za dogodke`,
    description: SITE_DESCRIPTION,
    url: "/",
    siteName: SITE_NAME,
    locale: "sl_SI",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Eventaj.si Galerija – vse fotografije z dogodka na enem mestu.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} | QR galerija za dogodke`,
    description: SITE_DESCRIPTION,
    images: ["/og-image.png"],
  },
  alternates: {
    languages: {
      "sl-SI": "/",
    },
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="sl">
      <body className={inter.variable}>
        <JsonLd data={siteStructuredData as unknown as Record<string, unknown>} />
        {children}
      </body>
    </html>
  );
}
