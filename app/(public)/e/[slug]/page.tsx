import type { Metadata } from "next";
import { GuestGallery } from "@/components/guest/guest-gallery";

export const metadata: Metadata = {
  title: "Ana & Marko | Eventaj Galerija",
  description: "Dodaj fotografije in videe s poroke Ane in Marka.",
  robots: { index: false, follow: false },
};

type EventPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function EventPage({ params }: EventPageProps) {
  const { slug } = await params;
  return <GuestGallery eventSlug={slug} />;
}
