import type { Metadata } from "next";
import { GuestGallery } from "@/components/guest/guest-gallery";
import { getRequestLocale } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  return { title: locale === "en" ? "Anna & Mark — Gallery" : "Ana & Marko — Galerija", description: locale === "en" ? "Anna and Mark's shared wedding gallery." : "Skupna galerija poroke Ane in Marka.", robots: { index: false, follow: false } };
}

export default function EventGalleryPage() {
  return <GuestGallery />;
}
