import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SlideshowDisplay } from "@/components/display/slideshow-display";
import { findPublicSlideshow } from "@/lib/repositories/slideshows";
import { hashToken } from "@/lib/security/tokens";
import { getRequestLocale } from "@/lib/i18n/server";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ token: string }> }): Promise<Metadata> {
  const { token } = await params;
  const locale = await getRequestLocale();
  const slideshow = await findPublicSlideshow(await hashToken(token));
  const title = slideshow?.event_name ?? (locale === "en" ? "Live display" : "Projekcija");
  const description = slideshow
    ? [locale === "en" ? "Event" : "Dogodek", slideshow.event_location, slideshow.event_name].filter(Boolean).join(" | ")
    : locale === "en" ? "Event live display." : "Projekcija dogodka.";
  return {
    title,
    description,
    robots: { index: false, follow: false },
  };
}

export default async function Page({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const slideshow = await findPublicSlideshow(await hashToken(token));
  if (!slideshow) notFound();
  return <SlideshowDisplay token={token} initialEventName={slideshow.event_name} />;
}
