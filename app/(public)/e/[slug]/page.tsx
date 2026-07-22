import type { Metadata } from "next";
import { GuestGallery } from "@/components/guest/guest-gallery";
import { findPublicEvent } from "@/lib/repositories/events";

type EventPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: EventPageProps): Promise<Metadata> {
  const { slug } = await params;
  const event = await findPublicEvent(slug);
  const title = event?.name ?? "Eventaj Galerija";
  const description = event
    ? ["Dogodek", event.location, event.name].filter(Boolean).join(" | ")
    : "Dodaj fotografije in videe z dogodka.";
  return {
    title,
    description,
    robots: { index: false, follow: false },
  };
}

export default async function EventPage({ params }: EventPageProps) {
  const { slug } = await params;
  return <GuestGallery eventSlug={slug} />;
}
