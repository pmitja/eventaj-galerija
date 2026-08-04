import type { Metadata } from "next";
import { SlideshowDisplay, type SlideshowSlide } from "@/components/display/slideshow-display";
import { DEMO_EVENT_NAME, DEMO_EVENT_SLUG, demoEventPhotos } from "@/lib/demo/event";
import { getRequestLocale } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  return { title: `Demo Live Show — ${locale === "en" ? "Anna & Mark" : DEMO_EVENT_NAME}`, description: locale === "en" ? "An interactive Eventaj Gallery live display with sample photos." : "Interaktivni prikaz Eventaj Galerije v živo z vzorčnimi fotografijami.", robots: { index: false, follow: false } };
}

const demoSlides: SlideshowSlide[] = demoEventPhotos.map((photo) => ({
  publicId: photo.id,
  filename: photo.alt,
  imageUrl: photo.src,
  comments: photo.comments.map((comment) => ({
    id: comment.id,
    displayName: comment.displayName,
    body: comment.body,
    createdAt: comment.createdAt,
    mediaPublicId: photo.id,
    mediaFilename: photo.alt,
  })),
}));

export default async function DemoLiveShowPage() {
  const locale = await getRequestLocale();
  return (
    <SlideshowDisplay
      initialEventName={locale === "en" ? "Anna & Mark" : DEMO_EVENT_NAME}
      initialSlides={demoSlides}
      backHref={`/e/${DEMO_EVENT_SLUG}`}
    />
  );
}
