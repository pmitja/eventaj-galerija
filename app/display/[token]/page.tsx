import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SlideshowDisplay } from "@/components/display/slideshow-display";
import { findPublicSlideshow } from "@/lib/repositories/slideshows";
import { hashToken } from "@/lib/security/tokens";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Projekcija | Eventaj Galerija",
  robots: { index: false, follow: false },
};

export default async function Page({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const slideshow = await findPublicSlideshow(await hashToken(token));
  if (!slideshow) notFound();
  return <SlideshowDisplay token={token} initialEventName={slideshow.event_name} />;
}
