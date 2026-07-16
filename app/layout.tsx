import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin", "latin-ext"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Eventaj.si Galerija",
  description:
    "QR + NFC galerija za poroke, poslovne dogodke, team buildinge in praznovanja.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="sl">
      <body className={inter.variable}>{children}</body>
    </html>
  );
}
