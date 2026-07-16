"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { EventUpload } from "@/components/event/event-upload";
import styles from "./guest-gallery.module.css";

const demoPhotos = [
  { src: "/gallery/ana-marko/photo-1.jpg", alt: "Ana in Marko na sprehodu po obredu" },
  { src: "/gallery/ana-marko/photo-2.jpg", alt: "Poročna prstana na rokah mladoporočencev" },
  { src: "/gallery/ana-marko/photo-3.jpg", alt: "Gostje se smejijo med poročno večerjo" },
  { src: "/gallery/ana-marko/photo-4.jpg", alt: "Nazdravljanje s penino" },
  { src: "/gallery/ana-marko/photo-5.jpg", alt: "Ana in Marko plešeta" },
  { src: "/gallery/ana-marko/photo-6.jpg", alt: "Cvetlični aranžma na poročni mizi" },
  { src: "/gallery/ana-marko/photo-7.jpg", alt: "Prijatelji se fotografirajo na poroki" },
  { src: "/gallery/ana-marko/photo-8.jpg", alt: "Poročna torta s cvetjem" },
  { src: "/gallery/ana-marko/photo-9.jpg", alt: "Gostje plešejo pod lučkami" },
] as const;

function CameraIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M8.5 5.5 10 3.75h4l1.5 1.75H19A2.5 2.5 0 0 1 21.5 8v9A2.5 2.5 0 0 1 19 19.5H5A2.5 2.5 0 0 1 2.5 17V8A2.5 2.5 0 0 1 5 5.5h3.5Z" />
      <circle cx="12" cy="12.5" r="3.5" />
    </svg>
  );
}

function HeartIcon({ filled = false }: { filled?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={filled ? styles.filledHeart : undefined}>
      <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z" />
    </svg>
  );
}

export function GuestGallery({ eventSlug = "ana-in-marko" }: { eventSlug?: string }) {
  const [selectedPhoto, setSelectedPhoto] = useState<number | null>(null);
  const [liked, setLiked] = useState<number[]>([4]);
  const [visiblePhotoCount, setVisiblePhotoCount] = useState(6);
  const [livePhotos, setLivePhotos] = useState<Array<{ src: string; alt: string }>>([]);
  const [eventInfo, setEventInfo] = useState({ name: "Ana & Marko", location: "Vila Bled", startsAt: "2026-07-12T12:00:00.000Z" });
  const photos = livePhotos.length > 0 || eventSlug !== "ana-in-marko" ? livePhotos : [...demoPhotos];

  useEffect(() => {
    let active = true;
    const load = async () => {
      const response = await fetch(`/api/v1/events/${encodeURIComponent(eventSlug)}/media`, { cache: "no-store" });
      if (!response.ok || !active) return;
      const body = await response.json() as { media: Array<{ imageUrl: string; filename: string }> };
      setLivePhotos(body.media.map((item) => ({ src: item.imageUrl, alt: item.filename })));
    };
    void load();
    const interval = window.setInterval(() => void load(), 5000);
    return () => { active = false; window.clearInterval(interval); };
  }, [eventSlug]);

  useEffect(() => {
    const loadEvent = async () => {
      const response = await fetch(`/api/v1/events/${encodeURIComponent(eventSlug)}`, { cache: "no-store" });
      if (!response.ok) return;
      const body = await response.json() as { event: { name: string; location: string | null; startsAt: string } };
      setEventInfo({ name: body.event.name, location: body.event.location ?? "", startsAt: body.event.startsAt });
    };
    void loadEvent();
  }, [eventSlug]);

  useEffect(() => {
    if (selectedPhoto === null) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelectedPhoto(null);
      if (event.key === "ArrowRight" && photos.length) setSelectedPhoto((current) => current === null ? null : (current + 1) % photos.length);
      if (event.key === "ArrowLeft" && photos.length) setSelectedPhoto((current) => current === null ? null : (current - 1 + photos.length) % photos.length);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [photos.length, selectedPhoto]);

  function toggleLike(index: number) {
    setLiked((current) => current.includes(index) ? current.filter((item) => item !== index) : [...current, index]);
  }

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <a className={styles.brand} href="#top" aria-label="Na vrh galerije">
          eventaj<span>.</span>
        </a>
        <button className={styles.shareButton} type="button" aria-label="Deli galerijo">
          <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="18" cy="5" r="2.5" /><circle cx="6" cy="12" r="2.5" /><circle cx="18" cy="19" r="2.5" /><path d="m8.2 10.8 7.6-4.5M8.2 13.2l7.6 4.5" /></svg>
        </button>
      </header>

      <section className={styles.hero} id="top">
        <div className={styles.heroBackdrop} aria-hidden="true">
          {photos[0] ? <Image src={photos[0].src} alt="" fill priority sizes="100vw" unoptimized={photos[0].src.startsWith("/api/")} /> : null}
        </div>
        <div className={styles.heroContent}>
          <p className={styles.kicker}>{new Intl.DateTimeFormat("sl-SI", { dateStyle: "long" }).format(new Date(eventInfo.startsAt))}{eventInfo.location ? ` · ${eventInfo.location}` : ""}</p>
          <h1>{eventInfo.name}</h1>
          <p className={styles.welcome}>Dobrodošli v skupni galeriji. Dodajte utrinke, ki ste jih ujeli, in podoživite dogodek skupaj.</p>
          <a className={styles.heroCta} href="#dodaj">
            <CameraIcon /> Dodaj fotografije
          </a>
          <p className={styles.uploadHint}>Brez aplikacije in brez prijave</p>
        </div>
      </section>

      <div className={styles.uploadSection}>
        <EventUpload eventSlug={eventSlug} />
      </div>

      <section className={styles.gallerySection} aria-labelledby="gallery-title">
        <div className={styles.galleryIntro}>
          <div>
            <p className={styles.sectionEyebrow}>Skupni spomini</p>
            <h2 id="gallery-title">Najlepši trenutki</h2>
          </div>
          <span className={styles.count}>{photos.length} fotografij</span>
        </div>

        <div className={styles.grid}>
          {photos.slice(0, visiblePhotoCount).map((photo, index) => (
            <article className={styles.photoCard} key={photo.src}>
              <button className={styles.photoButton} type="button" onClick={() => setSelectedPhoto(index)} aria-label={`Odpri fotografijo: ${photo.alt}`}>
                <Image src={photo.src} alt={photo.alt} fill sizes="(max-width: 767px) 50vw, (max-width: 1100px) 33vw, 25vw" unoptimized={photo.src.startsWith("/api/")} />
              </button>
              <button className={styles.likeButton} type="button" onClick={() => toggleLike(index)} aria-label={liked.includes(index) ? "Odstrani iz priljubljenih" : "Dodaj med priljubljene"} aria-pressed={liked.includes(index)}>
                <HeartIcon filled={liked.includes(index)} />
              </button>
            </article>
          ))}
        </div>
        {photos.length === 0 ? <p>Fotografij še ni. Bodi prvi in dodaj svoj utrinek.</p> : null}
        {visiblePhotoCount < photos.length ? (
          <button className={styles.moreButton} type="button" onClick={() => setVisiblePhotoCount(photos.length)}>Prikaži več fotografij</button>
        ) : null}
        <p className={styles.privacy}><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="10" width="14" height="10" rx="2" /><path d="M8.5 10V7.5a3.5 3.5 0 0 1 7 0V10" /></svg>Ta galerija je zasebna in dostopna samo gostom s povezavo.</p>
      </section>

      {selectedPhoto !== null ? (
        <div className={styles.lightbox} role="dialog" aria-modal="true" aria-label="Celozaslonski pregled fotografije" onClick={() => setSelectedPhoto(null)}>
          <button className={styles.closeButton} type="button" onClick={() => setSelectedPhoto(null)} aria-label="Zapri pregled">×</button>
          <button className={`${styles.lightboxNav} ${styles.previous}`} type="button" onClick={(event) => { event.stopPropagation(); setSelectedPhoto((selectedPhoto - 1 + photos.length) % photos.length); }} aria-label="Prejšnja fotografija">‹</button>
          <div className={styles.lightboxImage} onClick={(event) => event.stopPropagation()}>
            <Image src={photos[selectedPhoto].src} alt={photos[selectedPhoto].alt} fill priority sizes="100vw" unoptimized={photos[selectedPhoto].src.startsWith("/api/")} />
          </div>
          <button className={`${styles.lightboxNav} ${styles.next}`} type="button" onClick={(event) => { event.stopPropagation(); setSelectedPhoto((selectedPhoto + 1) % photos.length); }} aria-label="Naslednja fotografija">›</button>
          <span className={styles.lightboxCount}>{selectedPhoto + 1} / {photos.length}</span>
        </div>
      ) : null}
    </main>
  );
}
