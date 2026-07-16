import type { Metadata } from "next";
import { GalleryPage } from "@/components/admin/admin-pages";
export const metadata: Metadata = { title: "Galerija | Eventaj Galerija" };
export default async function Page({ searchParams }: { searchParams: Promise<{ eventId?: string }> }) {
  const { eventId } = await searchParams;
  return <GalleryPage selectedEventId={eventId} />;
}
