import type { Metadata } from "next";
import { SlideshowDisplay, type SlideshowSlide } from "@/components/display/slideshow-display";
import { DEMO_EVENT_NAME, demoEventPhotosFor } from "@/lib/demo/event";
import { getRequestLocale } from "@/lib/i18n/server";
import { demoEventPath } from "@/lib/i18n/routes";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  return { title: `Demo Live Show — ${locale === "sl" ? DEMO_EVENT_NAME : "Anna & Mark"}`, description: locale === "en" ? "An interactive Guest Mosaic live display with sample photos." : "Interaktivni prikaz Guest Mosaic v živo z vzorčnimi fotografijami.", robots: { index: false, follow: false } };
}

export default async function DemoLiveShowPage() {
  const locale = await getRequestLocale();
  const demoSlides: SlideshowSlide[] = demoEventPhotosFor(locale).map((photo) => ({
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
  return (
    <SlideshowDisplay
      initialEventName={locale === "sl" ? DEMO_EVENT_NAME : "Anna & Mark"}
      initialSlides={demoSlides}
      backHref={demoEventPath(locale)}
    />
  );
}
