import type { Metadata } from "next";
import { SlideshowDisplay, type SlideshowSlide } from "@/components/display/slideshow-display";
import { DEMO_EVENT_NAME, DEMO_EVENT_SLUG, demoEventPhotos } from "@/lib/demo/event";

export const metadata: Metadata = {
  title: `Demo Live Show — ${DEMO_EVENT_NAME}`,
  description: "Interaktivni prikaz Eventaj Galerije v živo z vzorčnimi fotografijami.",
  robots: { index: false, follow: false },
};

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

export default function DemoLiveShowPage() {
  return (
    <SlideshowDisplay
      initialEventName={DEMO_EVENT_NAME}
      initialSlides={demoSlides}
      backHref={`/e/${DEMO_EVENT_SLUG}`}
    />
  );
}
