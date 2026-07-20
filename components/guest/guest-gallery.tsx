"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { EventUpload } from "@/components/event/event-upload";
import { GuestIdentityGate } from "@/components/guest/guest-identity-gate";
import { PhotoComments } from "@/components/guest/photo-comments";
import { FaceSearch } from "@/components/guest/face-search";
import { shareGallery, type GalleryShareResult } from "@/lib/client/share-gallery";
import { faceSearchResultStorageKey, isFaceSearchLocalResultCurrent } from "@/lib/domain/face-search";
import { galleryLikesStorageKey, toggleMediaLike } from "@/lib/domain/media-comments";
import { storedFaceSearchResultSchema, type StoredFaceSearchResult } from "@/lib/validation/face-search";
import type { StoredGuestIdentity } from "@/lib/validation/guest-identity";
import { storedGalleryLikesSchema } from "@/lib/validation/media-comments";
import styles from "./guest-gallery.module.css";

const demoPhotos = [
  { key: "demo-1", publicId: null, src: "/gallery/ana-marko/photo-1.jpg", alt: "Ana in Marko na sprehodu po obredu", commentCount: 0 },
  { key: "demo-2", publicId: null, src: "/gallery/ana-marko/photo-2.jpg", alt: "Poročna prstana na rokah mladoporočencev", commentCount: 0 },
  { key: "demo-3", publicId: null, src: "/gallery/ana-marko/photo-3.jpg", alt: "Gostje se smejijo med poročno večerjo", commentCount: 0 },
  { key: "demo-4", publicId: null, src: "/gallery/ana-marko/photo-4.jpg", alt: "Nazdravljanje s penino", commentCount: 0 },
  { key: "demo-5", publicId: null, src: "/gallery/ana-marko/photo-5.jpg", alt: "Ana in Marko plešeta", commentCount: 0 },
  { key: "demo-6", publicId: null, src: "/gallery/ana-marko/photo-6.jpg", alt: "Cvetlični aranžma na poročni mizi", commentCount: 0 },
  { key: "demo-7", publicId: null, src: "/gallery/ana-marko/photo-7.jpg", alt: "Prijatelji se fotografirajo na poroki", commentCount: 0 },
  { key: "demo-8", publicId: null, src: "/gallery/ana-marko/photo-8.jpg", alt: "Poročna torta s cvetjem", commentCount: 0 },
  { key: "demo-9", publicId: null, src: "/gallery/ana-marko/photo-9.jpg", alt: "Gostje plešejo pod lučkami", commentCount: 0 },
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

function CommentIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 11.5a7.5 7.5 0 0 1-8 7.5 9 9 0 0 1-3.7-.8L4 20l1.4-3.8A7.4 7.4 0 0 1 4 11.5a7.5 7.5 0 0 1 8-7.5 7.5 7.5 0 0 1 8 7.5Z" /></svg>;
}

function copyWithLegacySelection(url: string) {
  const textArea = document.createElement("textarea");
  textArea.value = url;
  textArea.setAttribute("readonly", "");
  textArea.style.position = "fixed";
  textArea.style.opacity = "0";
  document.body.appendChild(textArea);
  textArea.select();

  try {
    return document.execCommand("copy");
  } finally {
    textArea.remove();
  }
}

const shareMessages: Record<Exclude<GalleryShareResult, "cancelled">, { message: string; tone: "success" | "error" }> = {
  shared: { message: "Galerija je bila deljena.", tone: "success" },
  copied: { message: "Povezava do galerije je kopirana.", tone: "success" },
  error: { message: "Povezave ni bilo mogoče deliti. Kopiraj naslov iz brskalnika.", tone: "error" },
};

export function GuestGallery({ eventSlug = "ana-in-marko" }: { eventSlug?: string }) {
  const [guestIdentity, setGuestIdentity] = useState<StoredGuestIdentity | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<number | null>(null);
  const [liked, setLiked] = useState<string[]>([]);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [visiblePhotoCount, setVisiblePhotoCount] = useState(6);
  const [livePhotos, setLivePhotos] = useState<Array<{ key: string; publicId: string; src: string; alt: string; commentCount: number }>>([]);
  const [faceSearchResult, setFaceSearchResult] = useState<StoredFaceSearchResult | null>(null);
  const [faceFilterActive, setFaceFilterActive] = useState(false);
  const [eventInfo, setEventInfo] = useState({ name: "Ana & Marko", location: "Vila Bled", startsAt: "2026-07-12T12:00:00.000Z", commentsEnabled: true, faceSearchEnabled: false, faceSearchPolicyVersion: null as string | null });
  const [isSharing, setIsSharing] = useState(false);
  const [shareFeedback, setShareFeedback] = useState<{ message: string; tone: "success" | "error" } | null>(null);
  const allPhotos = livePhotos.length > 0 || eventSlug !== "ana-in-marko" ? livePhotos : [...demoPhotos];
  const faceMatchIds = new Set(faceSearchResult?.mediaIds ?? []);
  const faceSearchPhotos = faceSearchResult ? allPhotos.filter((photo) => photo.publicId && faceMatchIds.has(photo.publicId)) : [];
  const photos = faceFilterActive && faceSearchResult ? faceSearchPhotos : allPhotos;
  const commentsVisible = eventInfo.commentsEnabled && commentsOpen;

  useEffect(() => {
    let active = true;
    const load = async () => {
      const response = await fetch(`/api/v1/events/${encodeURIComponent(eventSlug)}/media`, { cache: "no-store" });
      if (!response.ok || !active) return;
      const body = await response.json() as { media: Array<{ publicId: string; imageUrl: string; filename: string; commentCount: number }> };
      setLivePhotos(body.media.map((item) => ({ key: item.publicId, publicId: item.publicId, src: item.imageUrl, alt: item.filename, commentCount: item.commentCount })));
    };
    void load();
    const interval = window.setInterval(() => void load(), 5000);
    return () => { active = false; window.clearInterval(interval); };
  }, [eventSlug]);

  useEffect(() => {
    const guestId = guestIdentity?.guestId;
    const policyVersion = eventInfo.faceSearchPolicyVersion;
    if (!guestId || !policyVersion) return;
    const storageKey = faceSearchResultStorageKey(eventSlug, guestId);
    const timeout = window.setTimeout(() => {
      try {
        const raw = localStorage.getItem(storageKey);
        const parsed = storedFaceSearchResultSchema.safeParse(raw ? JSON.parse(raw) : null);
        if (parsed.success && isFaceSearchLocalResultCurrent(parsed.data.createdAt, parsed.data.policyVersion, policyVersion)) {
          setFaceSearchResult(parsed.data);
          setFaceFilterActive(true);
          setVisiblePhotoCount(parsed.data.mediaIds.length);
          return;
        }
        localStorage.removeItem(storageKey);
      } catch {
        // Face search remains available even when browser storage is blocked.
      }
      setFaceSearchResult(null);
      setFaceFilterActive(false);
    }, 0);
    return () => window.clearTimeout(timeout);
  }, [eventInfo.faceSearchPolicyVersion, eventSlug, guestIdentity?.guestId]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      try {
        const raw = localStorage.getItem(galleryLikesStorageKey(eventSlug));
        const parsed = storedGalleryLikesSchema.safeParse(raw ? JSON.parse(raw) : null);
        setLiked(parsed.success ? parsed.data.mediaIds : []);
      } catch {
        setLiked([]);
      }
    }, 0);
    return () => window.clearTimeout(timeout);
  }, [eventSlug]);

  useEffect(() => {
    const loadEvent = async () => {
      const response = await fetch(`/api/v1/events/${encodeURIComponent(eventSlug)}`, { cache: "no-store" });
      if (!response.ok) return;
      const body = await response.json() as { event: { name: string; location: string | null; startsAt: string; commentsEnabled: boolean; faceSearchEnabled: boolean; faceSearchPolicyVersion: string | null } };
      setEventInfo({ name: body.event.name, location: body.event.location ?? "", startsAt: body.event.startsAt, commentsEnabled: body.event.commentsEnabled, faceSearchEnabled: body.event.faceSearchEnabled, faceSearchPolicyVersion: body.event.faceSearchPolicyVersion });
    };
    void loadEvent();
  }, [eventSlug]);

  useEffect(() => {
    if (!shareFeedback) return;
    const timeout = window.setTimeout(() => setShareFeedback(null), 4000);
    return () => window.clearTimeout(timeout);
  }, [shareFeedback]);

  useEffect(() => {
    if (selectedPhoto === null) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (commentsVisible) setCommentsOpen(false);
        else setSelectedPhoto(null);
      }
      if (!commentsVisible && event.key === "ArrowRight" && photos.length) setSelectedPhoto((current) => current === null ? null : (current + 1) % photos.length);
      if (!commentsVisible && event.key === "ArrowLeft" && photos.length) setSelectedPhoto((current) => current === null ? null : (current - 1 + photos.length) % photos.length);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [commentsVisible, photos.length, selectedPhoto]);

  useEffect(() => {
    if (selectedPhoto !== null && selectedPhoto >= photos.length) {
      const timeout = window.setTimeout(() => {
        setCommentsOpen(false);
        setSelectedPhoto(null);
      }, 0);
      return () => window.clearTimeout(timeout);
    }
  }, [photos.length, selectedPhoto]);

  useEffect(() => {
    if (selectedPhoto === null) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previousOverflow; };
  }, [selectedPhoto]);

  function toggleLike(mediaId: string) {
    setLiked((current) => {
      const next = toggleMediaLike(current, mediaId);
      try {
        localStorage.setItem(galleryLikesStorageKey(eventSlug), JSON.stringify({ version: 1, mediaIds: next }));
      } catch {
        // The visual state still works for this page visit when storage is unavailable.
      }
      return next;
    });
  }

  function openPhoto(index: number) {
    setCommentsOpen(false);
    setSelectedPhoto(index);
  }

  function openPhotoComments(index: number) {
    setSelectedPhoto(index);
    setCommentsOpen(true);
  }

  function movePhoto(index: number) {
    setCommentsOpen(false);
    setSelectedPhoto(index);
  }

  function saveFaceSearchResult(mediaIds: string[]) {
    if (!guestIdentity || !eventInfo.faceSearchPolicyVersion) return;
    const next: StoredFaceSearchResult = {
      version: 1,
      policyVersion: eventInfo.faceSearchPolicyVersion,
      createdAt: new Date().toISOString(),
      mediaIds: [...new Set(mediaIds)].slice(0, 500),
    };
    try {
      localStorage.setItem(faceSearchResultStorageKey(eventSlug, guestIdentity.guestId), JSON.stringify(next));
    } catch {
      // Results still work for the current page visit when storage is unavailable.
    }
    setFaceSearchResult(next);
    setFaceFilterActive(true);
    setVisiblePhotoCount(next.mediaIds.length);
  }

  function forgetFaceSearchResult() {
    if (guestIdentity) {
      try {
        localStorage.removeItem(faceSearchResultStorageKey(eventSlug, guestIdentity.guestId));
      } catch {
        // Clearing in-memory state still removes the result for this page visit.
      }
    }
    setFaceSearchResult(null);
    setFaceFilterActive(false);
    setVisiblePhotoCount(6);
  }

  async function handleShare() {
    if (isSharing) return;
    setIsSharing(true);
    setShareFeedback(null);
    const shareUrl = new URL(window.location.href);
    shareUrl.search = "";
    shareUrl.hash = "";

    const result = await shareGallery({
      client: navigator,
      data: {
        title: `${eventInfo.name} | Eventaj Galerija`,
        text: `Oglej si fotografije dogodka ${eventInfo.name}.`,
        url: shareUrl.toString(),
      },
      legacyCopy: copyWithLegacySelection,
    });

    if (result !== "cancelled") setShareFeedback(shareMessages[result]);
    setIsSharing(false);
  }

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <a className={styles.brand} href="#top" aria-label="Na vrh galerije">
          eventaj<span>.</span>
        </a>
        <div className={styles.headerActions}>
        <GuestIdentityGate eventSlug={eventSlug} onIdentity={setGuestIdentity} />
        <button
          className={styles.shareButton}
          type="button"
          onClick={handleShare}
          disabled={isSharing}
          aria-label={isSharing ? "Odpiram možnosti deljenja" : "Deli galerijo"}
          aria-busy={isSharing}
          aria-describedby={shareFeedback ? "share-feedback" : undefined}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="18" cy="5" r="2.5" /><circle cx="6" cy="12" r="2.5" /><circle cx="18" cy="19" r="2.5" /><path d="m8.2 10.8 7.6-4.5M8.2 13.2l7.6 4.5" /></svg>
        </button>
        </div>
      </header>
      {shareFeedback ? (
        <p
          id="share-feedback"
          className={`${styles.shareFeedback} ${shareFeedback.tone === "error" ? styles.shareFeedbackError : ""}`}
          role={shareFeedback.tone === "error" ? "alert" : "status"}
        >
          {shareFeedback.message}
        </p>
      ) : null}

      <section className={styles.hero} id="top">
        <div className={styles.heroBackdrop} aria-hidden="true">
          {allPhotos[0] ? <Image src={allPhotos[0].src} alt="" fill priority sizes="100vw" unoptimized={allPhotos[0].src.startsWith("/api/")} /> : null}
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
        {guestIdentity ? <EventUpload eventSlug={eventSlug} guestId={guestIdentity.guestId} /> : null}
      </div>

      <section className={styles.gallerySection} aria-labelledby="gallery-title">
        <div className={styles.galleryIntro}>
          <div>
            <p className={styles.sectionEyebrow}>Skupni spomini</p>
            <h2 id="gallery-title">{faceFilterActive ? "Tvoje fotografije" : "Najlepši trenutki"}</h2>
          </div>
          <span className={styles.count}>{photos.length} fotografij</span>
        </div>

        {guestIdentity && eventInfo.faceSearchEnabled && eventInfo.faceSearchPolicyVersion ? (
          <div className={styles.galleryFilters} aria-label="Filtri galerije">
            <button
              className={`${styles.galleryFilter} ${!faceFilterActive ? styles.galleryFilterActive : ""}`}
              type="button"
              onClick={() => { setFaceFilterActive(false); setVisiblePhotoCount(6); }}
              aria-pressed={!faceFilterActive}
            >
              Vse fotografije
            </button>
            <FaceSearch
              eventSlug={eventSlug}
              guestIdentity={guestIdentity}
              policyVersion={eventInfo.faceSearchPolicyVersion}
              result={faceSearchResult}
              matchCount={faceSearchPhotos.length}
              active={faceFilterActive}
              onActivate={() => { setFaceFilterActive(true); setVisiblePhotoCount(faceSearchResult?.mediaIds.length ?? 6); }}
              onMatches={saveFaceSearchResult}
              onForget={forgetFaceSearchResult}
            />
          </div>
        ) : null}

        <div className={styles.grid} data-featured-layout={photos.length >= 5}>
          {photos.slice(0, visiblePhotoCount).map((photo, index) => (
            <article className={styles.photoCard} key={photo.key}>
              <button className={styles.photoButton} type="button" onClick={() => openPhoto(index)} aria-label={`Odpri fotografijo: ${photo.alt}`}>
                <Image src={photo.src} alt={photo.alt} fill sizes="(max-width: 767px) 50vw, (max-width: 1100px) 33vw, 25vw" unoptimized={photo.src.startsWith("/api/")} />
              </button>
              <button className={styles.likeButton} type="button" onClick={() => toggleLike(photo.key)} aria-label={liked.includes(photo.key) ? "Odstrani iz priljubljenih" : "Dodaj med priljubljene"} aria-pressed={liked.includes(photo.key)}>
                <HeartIcon filled={liked.includes(photo.key)} />
              </button>
              {eventInfo.commentsEnabled && photo.publicId ? (
                <button
                  className={styles.commentBadge}
                  type="button"
                  onClick={() => openPhotoComments(index)}
                  aria-label={`${photo.commentCount} ${photo.commentCount === 1 ? "komentar" : "komentarjev"} na fotografiji`}
                >
                  <CommentIcon /><span>{photo.commentCount}</span>
                </button>
              ) : null}
            </article>
          ))}
        </div>
        {photos.length === 0 ? <p className={styles.emptyGallery}>{faceFilterActive ? "Teh fotografij ni več v javni galeriji. Osveži iskanje z novim selfijem." : "Fotografij še ni. Bodi prvi in dodaj svoj utrinek."}</p> : null}
        {visiblePhotoCount < photos.length ? (
          <button className={styles.moreButton} type="button" onClick={() => setVisiblePhotoCount(photos.length)}>Prikaži več fotografij</button>
        ) : null}
        <p className={styles.privacy}><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="10" width="14" height="10" rx="2" /><path d="M8.5 10V7.5a3.5 3.5 0 0 1 7 0V10" /></svg>Ta galerija je zasebna in dostopna samo gostom s povezavo.</p>
      </section>

      {selectedPhoto !== null ? (
        <div className={styles.lightbox} role="dialog" aria-modal="true" aria-label="Celozaslonski pregled fotografije" onClick={() => setSelectedPhoto(null)}>
          <div className={`${styles.lightboxShell} ${commentsVisible ? styles.withComments : ""}`} onClick={(event) => event.stopPropagation()}>
            <div className={styles.lightboxStage}>
              <button className={styles.closeButton} type="button" onClick={() => setSelectedPhoto(null)} aria-label="Zapri pregled">×</button>
              <button className={`${styles.lightboxNav} ${styles.previous}`} type="button" onClick={() => movePhoto((selectedPhoto - 1 + photos.length) % photos.length)} aria-label="Prejšnja fotografija">‹</button>
              <div className={styles.lightboxImage}>
                <Image src={photos[selectedPhoto].src} alt={photos[selectedPhoto].alt} fill priority sizes={commentsVisible ? "(min-width: 768px) calc(100vw - 380px), 100vw" : "100vw"} unoptimized={photos[selectedPhoto].src.startsWith("/api/")} />
              </div>
              <button className={`${styles.lightboxNav} ${styles.next}`} type="button" onClick={() => movePhoto((selectedPhoto + 1) % photos.length)} aria-label="Naslednja fotografija">›</button>
              <span className={styles.lightboxCount}>{selectedPhoto + 1} / {photos.length}</span>
              <div className={styles.lightboxActions}>
                <button type="button" onClick={() => toggleLike(photos[selectedPhoto].key)} aria-label={liked.includes(photos[selectedPhoto].key) ? "Odstrani iz priljubljenih" : "Dodaj med priljubljene"} aria-pressed={liked.includes(photos[selectedPhoto].key)}>
                  <HeartIcon filled={liked.includes(photos[selectedPhoto].key)} /><span>{liked.includes(photos[selectedPhoto].key) ? "Všeč ti je" : "Všeč mi je"}</span>
                </button>
                {eventInfo.commentsEnabled ? <button type="button" onClick={() => setCommentsOpen((current) => !current)} aria-label="Komentarji" aria-expanded={commentsVisible}>
                  <CommentIcon /><span>Komentarji</span>
                </button> : null}
              </div>
            </div>
            {commentsVisible && guestIdentity ? (
              <PhotoComments eventSlug={eventSlug} publicMediaId={photos[selectedPhoto].publicId} guestIdentity={guestIdentity} onClose={() => setCommentsOpen(false)} />
            ) : null}
          </div>
        </div>
      ) : null}
    </main>
  );
}
