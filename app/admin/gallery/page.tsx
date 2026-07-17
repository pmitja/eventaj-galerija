import type { Metadata } from "next";
import { GalleryPage } from "@/components/admin/admin-pages";
export const metadata: Metadata = { title: "Galerija | Eventaj Galerija" };
export default async function Page({ searchParams }: { searchParams: Promise<{ eventId?: string; quality?: string; status?: string; q?: string }> }) {
  return <GalleryPage query={await searchParams} />;
}
