import type { Metadata } from "next";
import { GuestGallery } from "@/components/guest/guest-gallery";

export const metadata: Metadata = {
  title: "Ana & Marko — Galerija",
  description: "Skupna galerija poroke Ane in Marka.",
  robots: { index: false, follow: false },
};

export default function EventGalleryPage() {
  return <GuestGallery />;
}
