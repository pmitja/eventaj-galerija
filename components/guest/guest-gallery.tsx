"use client";

import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import { EventUpload } from "@/components/event/event-upload";
import { GuestIdentityGate } from "@/components/guest/guest-identity-gate";
import { PhotoComments } from "@/components/guest/photo-comments";
import { FaceSearch } from "@/components/guest/face-search";
import { shareGallery, type GalleryShareResult } from "@/lib/client/share-gallery";
import { DEMO_EVENT_SLUG, demoEventPhotosFor } from "@/lib/demo/event";
import { faceSearchResultStorageKey, isFaceSearchLocalResultCurrent } from "@/lib/domain/face-search";
import { galleryLikesStorageKey, toggleMediaLike } from "@/lib/domain/media-comments";
import { storedFaceSearchResultSchema, type StoredFaceSearchResult } from "@/lib/validation/face-search";
import type { StoredGuestIdentity } from "@/lib/validation/guest-identity";
import { storedGalleryLikesSchema } from "@/lib/validation/media-comments";
import { useDialogTransition } from "@/lib/client/use-dialog-transition";
import styles from "./guest-gallery.module.css";
import { useLocale } from "@/components/i18n/locale-provider";
import { ENGLISH_SITE_URL, SITE_NAME, SITE_URL, brandWordParts, guestBrandMark } from "@/lib/seo";
import { LOCALE_LABELS, LOCALE_SHORT_LABELS, intlLocale, type Locale } from "@/lib/i18n/locale";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { pluralCount } from "@/lib/i18n/plural";
import { usePathname } from "next/navigation";
import { localizedMarketingPath } from "@/lib/i18n/routes";
import { VoiceGuestbook } from "@/components/guest/voice-message-recorder";

const VoiceMessageRecorder = dynamic(
  () => import("@/components/guest/voice-message-recorder").then((module) => module.VoiceMessageRecorder),
  { ssr: false },
);

const PHOTO_PAGE_SIZE = 6;

type LiveGalleryMedia = {
  key: string;
  publicId: string;
  src: string;
  alt: string;
  commentCount: number;
  kind: "image" | "video";
  playbackUrl: string | null;
  downloadUrl: string | null;
  comments?: never;
};

function CameraIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M8.5 5.5 10 3.75h4l1.5 1.75H19A2.5 2.5 0 0 1 21.5 8v9A2.5 2.5 0 0 1 19 19.5H5A2.5 2.5 0 0 1 2.5 17V8A2.5 2.5 0 0 1 5 5.5h3.5Z" />
      <circle cx="12" cy="12.5" r="3.5" />
    </svg>
  );
}

function MicrophoneIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="9" y="3" width="6" height="11" rx="3" /><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21M9 21h6" /></svg>;
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

function DownloadIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v12m0 0 5-5m-5 5-5-5M5 19v2h14v-2" /></svg>;
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

type ShareMessages = Record<Exclude<GalleryShareResult, "cancelled">, { message: string; tone: "success" | "error" }>;

const SHARE_MESSAGES: Record<Locale, ShareMessages> = {
  sl: {
    shared: { message: "Galerija je bila deljena.", tone: "success" },
    copied: { message: "Povezava do galerije je kopirana.", tone: "success" },
    error: { message: "Povezave ni bilo mogoče deliti. Kopiraj naslov iz brskalnika.", tone: "error" },
  },
  en: {
    shared: { message: "The gallery was shared.", tone: "success" },
    copied: { message: "The gallery link was copied.", tone: "success" },
    error: { message: "The link could not be shared. Copy the address from your browser.", tone: "error" },
  },
  de: {
    shared: { message: "Die Galerie wurde geteilt.", tone: "success" },
    copied: { message: "Der Link zur Galerie wurde kopiert.", tone: "success" },
    error: { message: "Der Link konnte nicht geteilt werden. Kopiere die Adresse aus dem Browser.", tone: "error" },
  },
  nl: {
    shared: { message: "De galerij is gedeeld.", tone: "success" },
    copied: { message: "De link naar de galerij is gekopieerd.", tone: "success" },
    error: { message: "De link kon niet worden gedeeld. Kopieer het adres uit je browser.", tone: "error" },
  },
  es: {
    shared: { message: "Se ha compartido la galería.", tone: "success" },
    copied: { message: "Se ha copiado el enlace de la galería.", tone: "success" },
    error: { message: "No se ha podido compartir el enlace. Copia la dirección desde el navegador.", tone: "error" },
  },
  it: {
    shared: { message: "La galleria è stata condivisa.", tone: "success" },
    copied: { message: "Il link alla galleria è stato copiato.", tone: "success" },
    error: { message: "Non è stato possibile condividere il link. Copia l'indirizzo dal browser.", tone: "error" },
  },
  fr: {
    shared: { message: "La galerie a été partagée.", tone: "success" },
    copied: { message: "Le lien vers la galerie a été copié.", tone: "success" },
    error: { message: "Le lien n'a pas pu être partagé. Copiez l'adresse depuis votre navigateur.", tone: "error" },
  },
};

function shareMessages(locale: Locale): ShareMessages {
  return SHARE_MESSAGES[locale] ?? SHARE_MESSAGES.en;
}

export function GuestGallery({ eventSlug = "ana-in-marko" }: { eventSlug?: string }) {
  const locale = useLocale();
  const demoPhotos = demoEventPhotosFor(locale).map((photo) => ({
    key: photo.id,
    publicId: photo.id,
    src: photo.src,
    alt: photo.alt,
    commentCount: photo.comments.length,
    comments: photo.comments,
    kind: "image" as const,
    playbackUrl: null,
    downloadUrl: null,
  }));
  const t = getDictionary(locale).guest.gallery;
  const alternateLocale: Locale = locale === "sl" ? "en" : "sl";
  const homeHref = localizedMarketingPath("/", locale);
  const brandMarkSrc = guestBrandMark(locale);
  const [brandLead, brandTail] = brandWordParts(locale);
  const pathname = usePathname();
  const isDemoEvent = eventSlug === DEMO_EVENT_SLUG;
  const [guestIdentity, setGuestIdentity] = useState<StoredGuestIdentity | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<number | null>(null);
  const [liked, setLiked] = useState<string[]>([]);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [visiblePhotoCount, setVisiblePhotoCount] = useState(PHOTO_PAGE_SIZE);
  const [livePhotos, setLivePhotos] = useState<LiveGalleryMedia[]>([]);
  const [faceSearchResult, setFaceSearchResult] = useState<StoredFaceSearchResult | null>(null);
  const [faceFilterActive, setFaceFilterActive] = useState(false);
  const [eventInfo, setEventInfo] = useState({ name: t.demoEventName, location: "Vila Bled", startsAt: "2026-07-12T12:00:00.000Z", commentsEnabled: true, uploadsOpen: true, faceSearchEnabled: false, faceSearchPolicyVersion: null as string | null, videoUploadsEnabled: false });
  const [isSharing, setIsSharing] = useState(false);
  const [shareFeedback, setShareFeedback] = useState<{ message: string; tone: "success" | "error" } | null>(null);
  const [voiceMessagesRefreshKey, setVoiceMessagesRefreshKey] = useState(0);
  const [voiceMessageCount, setVoiceMessageCount] = useState(0);
  const [galleryTab, setGalleryTab] = useState<"photos" | "voice">("photos");
  const [voiceRecorderOpen, setVoiceRecorderOpen] = useState(false);
  const allPhotos = isDemoEvent ? [...demoPhotos] : livePhotos;
  const faceMatchIds = new Set(faceSearchResult?.mediaIds ?? []);
  const faceSearchPhotos = faceSearchResult ? allPhotos.filter((photo) => photo.publicId && faceMatchIds.has(photo.publicId)) : [];
  const photos = faceFilterActive && faceSearchResult ? faceSearchPhotos : allPhotos;
  const commentsVisible = eventInfo.commentsEnabled && commentsOpen;
  const faceTabEnabled = Boolean(guestIdentity && eventInfo.faceSearchEnabled && eventInfo.faceSearchPolicyVersion);
  const voiceTabVisible = !isDemoEvent && voiceMessageCount > 0;
  const voiceTabActive = voiceTabVisible && galleryTab === "voice";
  const hasMorePhotos = visiblePhotoCount < photos.length;
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const showMorePhotos = useCallback(() => setVisiblePhotoCount((count) => count + PHOTO_PAGE_SIZE), [setVisiblePhotoCount]);
  const { mounted: lightboxMounted, closing: lightboxClosing } = useDialogTransition(selectedPhoto !== null, 220);
  const { mounted: commentsMounted, closing: commentsClosing } = useDialogTransition(commentsVisible);
  // Remembered so the lightbox can keep rendering its photo while it animates out.
  const [lastPhotoIndex, setLastPhotoIndex] = useState(0);
  if (selectedPhoto !== null && selectedPhoto !== lastPhotoIndex) setLastPhotoIndex(selectedPhoto);
  const lightboxIndex = Math.min(selectedPhoto ?? lastPhotoIndex, Math.max(photos.length - 1, 0));

  useEffect(() => {
    const sentinel = loadMoreRef.current;
    if (!sentinel || !hasMorePhotos || typeof IntersectionObserver === "undefined") return;
    // Re-created after every batch so a sentinel that stays in view keeps loading.
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) showMorePhotos();
    }, { rootMargin: "400px 0px" });
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMorePhotos, showMorePhotos, visiblePhotoCount]);

  useEffect(() => {
    if (isDemoEvent) return;
    let active = true;
    const load = async () => {
      const response = await fetch(`/api/v1/events/${encodeURIComponent(eventSlug)}/media`, { cache: "no-store" });
      if (!response.ok || !active) return;
      const body = await response.json() as { media: Array<{ publicId: string; imageUrl: string | null; thumbnailUrl: string; playbackUrl: string | null; downloadUrl: string | null; kind: "image" | "video"; filename: string; commentCount: number }> };
      setLivePhotos(body.media.map((item) => ({
        key: item.publicId,
        publicId: item.publicId,
        src: item.imageUrl ?? item.thumbnailUrl,
        playbackUrl: item.playbackUrl,
        downloadUrl: item.downloadUrl,
        kind: item.kind,
        alt: item.filename,
        commentCount: item.commentCount,
      })));
    };
    void load();
    const interval = window.setInterval(() => void load(), 5000);
    return () => { active = false; window.clearInterval(interval); };
  }, [eventSlug, isDemoEvent]);

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
    if (isDemoEvent) return;
    const loadEvent = async () => {
      const response = await fetch(`/api/v1/events/${encodeURIComponent(eventSlug)}`, { cache: "no-store" });
      if (!response.ok) return;
      const body = await response.json() as { event: { name: string; location: string | null; startsAt: string; commentsEnabled: boolean; uploadsOpen: boolean; faceSearchEnabled: boolean; faceSearchPolicyVersion: string | null; videoUploadsEnabled: boolean } };
      setEventInfo({ name: body.event.name, location: body.event.location ?? "", startsAt: body.event.startsAt, commentsEnabled: body.event.commentsEnabled, uploadsOpen: body.event.uploadsOpen, faceSearchEnabled: body.event.faceSearchEnabled, faceSearchPolicyVersion: body.event.faceSearchPolicyVersion, videoUploadsEnabled: body.event.videoUploadsEnabled });
    };
    void loadEvent();
  }, [eventSlug, isDemoEvent]);

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
    setVisiblePhotoCount(PHOTO_PAGE_SIZE);
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
        title: `${eventInfo.name} | ${SITE_NAME}`,
        text: t.shareText.replace("{event}", eventInfo.name),
        url: shareUrl.toString(),
      },
      legacyCopy: copyWithLegacySelection,
    });

    if (result !== "cancelled") setShareFeedback(shareMessages(locale)[result]);
    setIsSharing(false);
  }

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <Link className={styles.brand} href={homeHref} aria-label={t.backToSite}>
          {brandMarkSrc ? <img className={styles.brandMark} src={brandMarkSrc} alt="" width={30} height={30} /> : null}
          <span className={styles.brandWord}>{brandLead}<span>{brandTail}</span></span>
        </Link>
        <div className={styles.headerActions}>
        <a href={`${locale === "sl" ? ENGLISH_SITE_URL : SITE_URL}${pathname}`} aria-label={LOCALE_LABELS[alternateLocale]}>{LOCALE_SHORT_LABELS[alternateLocale]}</a>
        {!isDemoEvent ? <GuestIdentityGate eventSlug={eventSlug} onIdentity={setGuestIdentity} /> : null}
        <button
          className={styles.shareButton}
          type="button"
          onClick={handleShare}
          disabled={isSharing}
          aria-label={isSharing ? t.sharing : t.share}
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
          <p className={styles.kicker}>{new Intl.DateTimeFormat(intlLocale(locale), { dateStyle: "long" }).format(new Date(eventInfo.startsAt))}{eventInfo.location ? ` · ${eventInfo.location}` : ""}</p>
          <h1>{eventInfo.name}</h1>
          <p className={styles.welcome}>{t.welcome}</p>
          {isDemoEvent ? (
            <>
              <a className={styles.heroCta} href="#gallery-title">
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
                {t.exploreDemo}
              </a>
              <p className={styles.uploadHint}>{t.demoHint}</p>
            </>
          ) : eventInfo.uploadsOpen ? (
            <>
              <a className={styles.heroCta} href="#dodaj">
                <CameraIcon /> {t.addPhotos}
              </a>
              <p className={styles.uploadHint}>{t.addPhotosHint}</p>
            </>
          ) : (
            <p className={styles.uploadHint}>{t.uploadsClosed}</p>
          )}
        </div>
      </section>

      {eventInfo.uploadsOpen && !isDemoEvent ? (
        <div className={styles.uploadSection}>
          {guestIdentity ? <>
            <EventUpload
              eventSlug={eventSlug}
              guestId={guestIdentity.guestId}
              videoUploadsEnabled={eventInfo.videoUploadsEnabled}
              onRequestVoiceMessage={() => setVoiceRecorderOpen(true)}
            />
            <VoiceMessageRecorder
              eventSlug={eventSlug}
              guestId={guestIdentity.guestId}
              onSubmitted={() => setVoiceMessagesRefreshKey((current) => current + 1)}
              hideEntryCard
              open={voiceRecorderOpen}
              onOpenChange={setVoiceRecorderOpen}
            />
          </> : null}
        </div>
      ) : null}

      <section className={styles.gallerySection} aria-labelledby="gallery-title">
        {isDemoEvent ? (
          <a className={styles.liveShowCta} href={localizedMarketingPath("/demo/live-show", locale)}>
            <span className={styles.liveShowIcon} aria-hidden="true">
              <svg viewBox="0 0 24 24"><path d="m9 7 8 5-8 5V7Z" /><rect x="3" y="3" width="18" height="18" rx="4" /></svg>
            </span>
            <span>
              <small>{t.liveShowHint}</small>
              <strong>{t.liveShowCta}</strong>
            </span>
            <svg className={styles.liveShowArrow} viewBox="0 0 24 24" aria-hidden="true"><path d="m9 5 7 7-7 7" /></svg>
          </a>
        ) : null}
        <div className={styles.galleryIntro}>
          <div>
            <p className={styles.sectionEyebrow}>{voiceTabActive ? t.voiceEyebrow : t.photosEyebrow}</p>
            <h2 id="gallery-title">{voiceTabActive ? t.voiceHeading : faceFilterActive ? t.myPhotosHeading : t.photosHeading}</h2>
          </div>
          <span className={styles.count}>{voiceTabActive
            ? pluralCount(locale, voiceMessageCount, t.voiceCount)
            : pluralCount(locale, photos.length, t.momentCount)}</span>
        </div>

        {faceTabEnabled || voiceTabVisible ? (
          <div className={styles.galleryFilters} role="tablist" aria-label={t.sectionsLabel}>
            <button
              className={`${styles.galleryFilter} ${!voiceTabActive && !faceFilterActive ? styles.galleryFilterActive : ""}`}
              type="button"
              role="tab"
              aria-selected={!voiceTabActive && !faceFilterActive}
              onClick={() => { setGalleryTab("photos"); setFaceFilterActive(false); setVisiblePhotoCount(PHOTO_PAGE_SIZE); }}
            >
              {t.allPhotos}
            </button>
            {faceTabEnabled && guestIdentity && eventInfo.faceSearchPolicyVersion ? (
              <FaceSearch
                eventSlug={eventSlug}
                guestIdentity={guestIdentity}
                policyVersion={eventInfo.faceSearchPolicyVersion}
                result={faceSearchResult}
                matchCount={faceSearchPhotos.length}
                active={!voiceTabActive && faceFilterActive}
                onActivate={() => { setGalleryTab("photos"); setFaceFilterActive(true); setVisiblePhotoCount(faceSearchResult?.mediaIds.length ?? 6); }}
                onMatches={saveFaceSearchResult}
                onForget={forgetFaceSearchResult}
              />
            ) : null}
            {voiceTabVisible ? (
              <button
                className={`${styles.galleryFilter} ${voiceTabActive ? styles.galleryFilterActive : ""}`}
                type="button"
                role="tab"
                aria-selected={voiceTabActive}
                onClick={() => setGalleryTab("voice")}
              >
                <MicrophoneIcon />
                {t.voiceMessages}
                <span className={styles.filterCount}>{voiceMessageCount}</span>
              </button>
            ) : null}
          </div>
        ) : null}

        {!isDemoEvent ? (
          <div hidden={!voiceTabActive}>
            <VoiceGuestbook eventSlug={eventSlug} refreshKey={voiceMessagesRefreshKey} embedded onCountChange={setVoiceMessageCount} />
          </div>
        ) : null}

        {voiceTabActive ? null : <>
        <div className={styles.grid} data-featured-layout={photos.length >= 5}>
          {photos.slice(0, visiblePhotoCount).map((photo, index) => (
            <article className={styles.photoCard} key={photo.key}>
              <button className={styles.photoButton} type="button" onClick={() => openPhoto(index)} aria-label={`${photo.kind === "video" ? t.openVideo : t.openPhoto}: ${photo.alt}`}>
                <Image src={photo.src} alt={photo.alt} fill sizes="(max-width: 767px) 50vw, (max-width: 1100px) 33vw, 25vw" unoptimized={photo.src.startsWith("/api/")} />
                {photo.kind === "video" ? <span className={styles.videoBadge} aria-hidden="true">▶</span> : null}
              </button>
              <button className={styles.likeButton} type="button" onClick={() => toggleLike(photo.key)} aria-label={liked.includes(photo.key) ? t.removeFavourite : t.addFavourite} aria-pressed={liked.includes(photo.key)}>
                <HeartIcon filled={liked.includes(photo.key)} />
              </button>
              {eventInfo.commentsEnabled && photo.publicId ? (
                <button
                  className={styles.commentBadge}
                  type="button"
                  onClick={() => openPhotoComments(index)}
                  aria-label={`${pluralCount(locale, photo.commentCount, t.commentCount)} ${t.onThePhoto}`}
                >
                  <CommentIcon /><span>{photo.commentCount}</span>
                </button>
              ) : null}
            </article>
          ))}
        </div>
        {photos.length === 0 ? <p className={styles.emptyGallery}>{faceFilterActive ? t.emptyFaceSearch : t.emptyGallery}</p> : null}
        {hasMorePhotos ? (
          <>
            <div ref={loadMoreRef} className={styles.loadMoreSentinel} aria-hidden="true" />
            <button className={styles.moreButton} type="button" onClick={showMorePhotos}>{t.showMore}</button>
          </>
        ) : null}
        </>}
        <p className={styles.privacy}><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="10" width="14" height="10" rx="2" /><path d="M8.5 10V7.5a3.5 3.5 0 0 1 7 0V10" /></svg>{t.privacy}</p>
      </section>

      {lightboxMounted && photos.length ? (
        <div className={`${styles.lightbox} ${lightboxClosing ? styles.closing : ""}`} role="dialog" aria-modal="true" aria-label={t.lightboxLabel} onClick={() => setSelectedPhoto(null)}>
          <div className={`${styles.lightboxShell} ${commentsMounted ? styles.withComments : ""}`} onClick={(event) => event.stopPropagation()}>
            <div className={styles.lightboxStage}>
              <Link className={styles.lightboxBrand} href={homeHref} aria-label={t.backToSite}>{brandMarkSrc ? <img className={styles.brandMark} src={brandMarkSrc} alt="" width={28} height={28} /> : null}<span className={styles.brandWord}>{brandLead}<span>{brandTail}</span></span></Link>
              <button className={styles.closeButton} type="button" onClick={() => setSelectedPhoto(null)} aria-label={t.closeView}>×</button>
              <button className={`${styles.lightboxNav} ${styles.previous}`} type="button" onClick={() => movePhoto((lightboxIndex - 1 + photos.length) % photos.length)} aria-label={t.previousPhoto}>
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m15 5-7 7 7 7" /></svg>
              </button>
              <div className={styles.lightboxImage}>
                {photos[lightboxIndex].kind === "video" && photos[lightboxIndex].playbackUrl ? (
                  <video
                    key={photos[lightboxIndex].publicId}
                    src={photos[lightboxIndex].playbackUrl ?? undefined}
                    poster={photos[lightboxIndex].src}
                    controls
                    autoPlay
                    playsInline
                    aria-label={photos[lightboxIndex].alt}
                  />
                ) : (
                  <Image src={photos[lightboxIndex].src} alt={photos[lightboxIndex].alt} fill priority sizes={commentsVisible ? "(min-width: 768px) calc(100vw - 380px), 100vw" : "100vw"} unoptimized={photos[lightboxIndex].src.startsWith("/api/")} />
                )}
              </div>
              <button className={`${styles.lightboxNav} ${styles.next}`} type="button" onClick={() => movePhoto((lightboxIndex + 1) % photos.length)} aria-label={t.nextPhoto}>
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 5 7 7-7 7" /></svg>
              </button>
              <span className={styles.lightboxCount}>{lightboxIndex + 1} / {photos.length}</span>
              <div className={styles.lightboxActions}>
                <button type="button" onClick={() => toggleLike(photos[lightboxIndex].key)} aria-label={liked.includes(photos[lightboxIndex].key) ? t.removeFavourite : t.addFavourite} aria-pressed={liked.includes(photos[lightboxIndex].key)}>
                  <HeartIcon filled={liked.includes(photos[lightboxIndex].key)} /><span>{liked.includes(photos[lightboxIndex].key) ? t.liked : t.like}</span>
                </button>
                {eventInfo.commentsEnabled ? <button type="button" onClick={() => setCommentsOpen((current) => !current)} aria-label={t.comments} aria-expanded={commentsVisible}>
                  <CommentIcon /><span>{t.comments}</span>
                </button> : null}
                {photos[lightboxIndex].downloadUrl ? <a href={photos[lightboxIndex].downloadUrl!} aria-label={t.downloadOriginal}>
                  <DownloadIcon /><span>{t.download}</span>
                </a> : null}
              </div>
            </div>
            {commentsMounted && (guestIdentity || isDemoEvent) ? (
              <PhotoComments
                key={photos[lightboxIndex].key}
                eventSlug={eventSlug}
                publicMediaId={photos[lightboxIndex].publicId}
                guestIdentity={guestIdentity ?? undefined}
                demoComments={isDemoEvent ? photos[lightboxIndex].comments : undefined}
                closing={commentsClosing}
                onClose={() => setCommentsOpen(false)}
              />
            ) : null}
          </div>
        </div>
      ) : null}
    </main>
  );
}
