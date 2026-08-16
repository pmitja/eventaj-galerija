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
import { cn } from "@/lib/utils";
import { useLocale } from "@/components/i18n/locale-provider";
import { ENGLISH_SITE_URL, SITE_URL, brandName, brandWordParts, guestBrandMark } from "@/lib/seo";
import { LOCALE_LABELS, LOCALE_SHORT_LABELS, intlLocale, type Locale } from "@/lib/i18n/locale";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { pluralCount } from "@/lib/i18n/plural";
import { usePathname } from "next/navigation";
import { localizedMarketingPath, orderPath } from "@/lib/i18n/routes";
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

const strokeIcon = "fill-none stroke-current [stroke-width:1.8]";
const roundStrokeIcon = `${strokeIcon} [stroke-linecap:round] [stroke-linejoin:round]`;
const outlineIcon = "fill-transparent stroke-current [stroke-width:1.8]";

function CameraIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M8.5 5.5 10 3.75h4l1.5 1.75H19A2.5 2.5 0 0 1 21.5 8v9A2.5 2.5 0 0 1 19 19.5H5A2.5 2.5 0 0 1 2.5 17V8A2.5 2.5 0 0 1 5 5.5h3.5Z" />
      <circle cx="12" cy="12.5" r="3.5" />
    </svg>
  );
}

function MicrophoneIcon({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" aria-hidden="true"><rect x="9" y="3" width="6" height="11" rx="3" /><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21M9 21h6" /></svg>;
}

function HeartIcon({ filled = false, className }: { filled?: boolean; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={cn(className, filled && "fill-[#ef6d9b] stroke-[#ef6d9b]")}>
      <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z" />
    </svg>
  );
}

function CommentIcon({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" aria-hidden="true"><path d="M20 11.5a7.5 7.5 0 0 1-8 7.5 9 9 0 0 1-3.7-.8L4 20l1.4-3.8A7.4 7.4 0 0 1 4 11.5a7.5 7.5 0 0 1 8-7.5 7.5 7.5 0 0 1 8 7.5Z" /></svg>;
}

function DownloadIcon({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v12m0 0 5-5m-5 5-5-5M5 19v2h14v-2" /></svg>;
}

const pageClass =
  "min-h-screen bg-[#fcfaf8] text-[#2c1821] [&_a:focus-visible]:outline-3 [&_a:focus-visible]:outline-offset-[3px] [&_a:focus-visible]:outline-[#ffd0e0] [&_button:focus-visible]:outline-3 [&_button:focus-visible]:outline-offset-[3px] [&_button:focus-visible]:outline-[#ffd0e0]";
const brandClass = "inline-flex items-center gap-[9px] text-[21px] font-extrabold tracking-[-.05em] text-white!";
const brandMarkClass = "block size-[30px] flex-none drop-shadow-[0_1px_3px_rgba(24,8,15,.35)]";
const heroCtaClass =
  "inline-flex min-h-[54px] w-[min(100%,360px)] cursor-pointer items-center justify-center gap-2.5 rounded-[14px] border-0 bg-white text-[16px] font-extrabold text-[#6f1239]! shadow-[0_12px_28px_rgba(31,10,19,.26)] transition-[transform,background] duration-200 hover:-translate-y-px hover:bg-[#fff6f8] motion-reduce:transition-none";
const uploadHintClass = "mt-3 mb-0 text-[12px] text-white/67";
const galleryFilterClass =
  "inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-full border border-[#ddcfd4] bg-white px-[15px] text-[13px] font-extrabold text-[#4b343e] [font-family:inherit] transition-[border-color,background,color] duration-[180ms] hover:border-[#bd7592] hover:bg-[#fff7fa] motion-reduce:transition-none";
const galleryFilterActiveClass = "border-[#8d1747] bg-[#8d1747] text-white hover:border-[#6f1239] hover:bg-[#6f1239]";
const lightboxNavClass =
  "absolute top-[42%] z-2 grid size-[52px] -translate-y-1/2 cursor-pointer place-items-center rounded-full border border-white/14 bg-[rgba(42,23,31,.68)] text-white backdrop-blur-md transition-[background,border-color,transform] duration-[180ms] hover:scale-[1.04] hover:border-white/35 hover:bg-[rgba(82,42,59,.88)] md:top-1/2 motion-reduce:transition-none";
const lightboxNavIconClass = "size-6 fill-none stroke-current [stroke-linecap:round] [stroke-linejoin:round] [stroke-width:2]";
const lightboxActionClass =
  "inline-flex min-h-12 min-w-[52px] cursor-pointer items-center justify-center gap-[7px] rounded-full border border-white/16 bg-[rgba(42,23,31,.7)] px-0 text-[12px] font-[750] text-white! backdrop-blur-lg transition-[background,border-color] duration-[180ms] hover:border-white/34 hover:bg-[rgba(74,37,52,.86)] md:px-[15px] motion-reduce:transition-none [&>span]:hidden md:[&>span]:inline";
const lightboxActionIconClass = "w-5 fill-transparent stroke-current [stroke-linecap:round] [stroke-linejoin:round] [stroke-width:1.8]";

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
  const createEventLabel = getDictionary(locale).useCasePage.ctaCreate;
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
        title: `${eventInfo.name} | ${brandName(locale)}`,
        text: t.shareText.replace("{event}", eventInfo.name),
        url: shareUrl.toString(),
      },
      legacyCopy: copyWithLegacySelection,
    });

    if (result !== "cancelled") setShareFeedback(shareMessages(locale)[result]);
    setIsSharing(false);
  }

  return (
    <main className={pageClass}>
      {isDemoEvent ? (
        <Link
          className="fixed bottom-20 left-1/2 z-30 min-h-12 -translate-x-1/2 rounded-full bg-brand px-5 py-3 text-center text-[14px] font-extrabold whitespace-nowrap text-white! shadow-[0_14px_34px_rgba(96,20,55,.32)] transition-transform hover:-translate-x-1/2 hover:-translate-y-0.5 focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-white sm:bottom-4 motion-reduce:transition-none"
          href={orderPath(locale)}
        >
          {createEventLabel}
        </Link>
      ) : null}
      <header className="absolute inset-x-0 top-0 z-10 flex h-[68px] items-center justify-between px-5 text-white md:h-[78px] md:px-9">
        <Link className={brandClass} href={homeHref} aria-label={t.backToSite}>
          {brandMarkSrc ? <img className={brandMarkClass} src={brandMarkSrc} alt="" width={30} height={30} /> : null}
          <span>{brandLead}<span className="text-[#f6a9c4]">{brandTail}</span></span>
        </Link>
        <div className="flex items-center gap-2">
        <a href={`${locale === "sl" ? ENGLISH_SITE_URL : SITE_URL}${pathname}`} aria-label={LOCALE_LABELS[alternateLocale]}>{LOCALE_SHORT_LABELS[alternateLocale]}</a>
        {!isDemoEvent ? <GuestIdentityGate eventSlug={eventSlug} onIdentity={setGuestIdentity} /> : null}
        <button
          className="grid size-11 cursor-pointer place-items-center rounded-full border border-white/32 bg-[rgba(37,17,26,.24)] text-white backdrop-blur-md transition-[background,opacity] duration-[180ms] enabled:hover:bg-[rgba(37,17,26,.44)] disabled:cursor-wait disabled:opacity-[.62] motion-reduce:transition-none"
          type="button"
          onClick={handleShare}
          disabled={isSharing}
          aria-label={isSharing ? t.sharing : t.share}
          aria-busy={isSharing}
          aria-describedby={shareFeedback ? "share-feedback" : undefined}
        >
          <svg className={cn(strokeIcon, "w-5")} viewBox="0 0 24 24" aria-hidden="true"><circle cx="18" cy="5" r="2.5" /><circle cx="6" cy="12" r="2.5" /><circle cx="18" cy="19" r="2.5" /><path d="m8.2 10.8 7.6-4.5M8.2 13.2l7.6 4.5" /></svg>
        </button>
        </div>
      </header>
      {shareFeedback ? (
        <p
          id="share-feedback"
          className={cn(
            "fixed top-[76px] right-4 z-20 m-0 max-w-[min(320px,calc(100%-32px))] rounded-xl border border-[#d8e9df] bg-[#f4fbf7] px-3.5 py-[11px] text-[13px]/[1.4] font-bold text-[#225c3e] shadow-[0_10px_28px_rgba(31,10,19,.18)] animate-[toast-in_.24s_cubic-bezier(.22,1,.36,1)_both] motion-reduce:animate-none",
            shareFeedback.tone === "error" && "border-[#f0ccd6] bg-[#fff4f6] text-[#8a2045]",
          )}
          role={shareFeedback.tone === "error" ? "alert" : "status"}
        >
          {shareFeedback.message}
        </p>
      ) : null}

      <section className="relative flex min-h-[560px] items-end overflow-hidden bg-[#392029] md:min-h-[640px]" id="top">
        <div className="absolute inset-0 after:absolute after:inset-0 after:bg-[linear-gradient(180deg,rgba(30,13,20,.2)_0%,rgba(30,13,20,.14)_32%,rgba(30,13,20,.9)_100%)] after:content-['']" aria-hidden="true">
          {allPhotos[0] ? <Image className="scale-[1.02] object-cover object-[42%_center]" src={allPhotos[0].src} alt="" fill priority sizes="100vw" unoptimized={allPhotos[0].src.startsWith("/api/")} /> : null}
        </div>
        <div className="relative z-1 w-full px-6 pt-[116px] pb-9 text-center text-white md:pb-[58px]">
          <p className="m-0 text-[11px] font-extrabold tracking-[.14em] text-[#f4c6d6] uppercase">{new Intl.DateTimeFormat(intlLocale(locale), { dateStyle: "long" }).format(new Date(eventInfo.startsAt))}{eventInfo.location ? ` · ${eventInfo.location}` : ""}</p>
          <h1 className="mt-2.5 mb-3.5 font-[Georgia,'Times_New_Roman',serif] text-[clamp(48px,14vw,70px)]/[.95] font-normal tracking-[-.055em] text-balance [&_i]:font-normal [&_i]:text-[#f2b5ca]">{eventInfo.name}</h1>
          <p className="mx-auto mb-6 max-w-[520px] text-[16px]/[1.55] text-white/88 text-pretty md:text-[17px]">{t.welcome}</p>
          {isDemoEvent ? (
            <>
              <a className={heroCtaClass} href="#gallery-title">
                <svg className={cn(strokeIcon, "w-[21px]")} viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
                {t.exploreDemo}
              </a>
              <p className={uploadHintClass}>{t.demoHint}</p>
            </>
          ) : eventInfo.uploadsOpen ? (
            <>
              <a className={heroCtaClass} href="#dodaj">
                <CameraIcon className={cn(strokeIcon, "w-[21px]")} /> {t.addPhotos}
              </a>
              <p className={uploadHintClass}>{t.addPhotosHint}</p>
            </>
          ) : (
            <p className={uploadHintClass}>{t.uploadsClosed}</p>
          )}
        </div>
      </section>

      {eventInfo.uploadsOpen && !isDemoEvent ? (
        <div className="relative z-2 mx-auto -mt-[18px] w-[min(100%-24px,620px)] md:-mt-[34px]">
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

      <section className="mx-auto w-[min(100%,1180px)] px-3 pt-[58px] pb-7 md:px-6 md:pt-[54px] md:pb-16" aria-labelledby="gallery-title">
        {isDemoEvent ? (
          <a className="mx-1 mb-[34px] flex min-h-[92px] items-center gap-[15px] rounded-[20px] border border-white/14 bg-[linear-gradient(135deg,#24131c_0%,#5d1838_100%)] px-[18px] py-[17px] text-white! shadow-[0_18px_38px_rgba(63,13,37,.2)] transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-[0_22px_46px_rgba(63,13,37,.27)] md:mx-0 md:min-h-[104px] md:px-6 md:py-5 motion-reduce:transition-none" href={localizedMarketingPath("/demo/live-show", locale)}>
            <span className="grid size-[54px] flex-none place-items-center rounded-2xl border border-white/20 bg-white/10" aria-hidden="true">
              <svg className="w-[27px] fill-none stroke-current [stroke-width:1.7]" viewBox="0 0 24 24"><path d="m9 7 8 5-8 5V7Z" /><rect x="3" y="3" width="18" height="18" rx="4" /></svg>
            </span>
            <span className="flex min-w-0 flex-1 flex-col gap-[3px]">
              <small className="text-[10px] font-extrabold tracking-[.08em] text-[#efb6cb] uppercase">{t.liveShowHint}</small>
              <strong className="text-[17px] tracking-[-.01em] md:text-[20px]">{t.liveShowCta}</strong>
            </span>
            <svg className={cn(roundStrokeIcon, "w-6 flex-none")} viewBox="0 0 24 24" aria-hidden="true"><path d="m9 5 7 7-7 7" /></svg>
          </a>
        ) : null}
        <div className="flex items-end justify-between gap-4 px-1.5 pb-[22px] md:px-0">
          <div>
            <p className="m-0 text-[11px] font-extrabold tracking-[.14em] text-[#9f1d52] uppercase">{voiceTabActive ? t.voiceEyebrow : t.photosEyebrow}</p>
            <h2 className="mt-[5px] mb-0 font-[Georgia,'Times_New_Roman',serif] text-[29px]/[1.05] font-normal tracking-[-.03em] md:text-[38px]" id="gallery-title">{voiceTabActive ? t.voiceHeading : faceFilterActive ? t.myPhotosHeading : t.photosHeading}</h2>
          </div>
          <span className="flex-none pb-[3px] text-[12px] text-[#705f66] md:text-[14px]">{voiceTabActive
            ? pluralCount(locale, voiceMessageCount, t.voiceCount)
            : pluralCount(locale, photos.length, t.momentCount)}</span>
        </div>

        {faceTabEnabled || voiceTabVisible ? (
          <div className="mx-1.5 -mt-[5px] mb-[18px] flex flex-wrap items-center gap-2 md:mx-0" role="tablist" aria-label={t.sectionsLabel}>
            <button
              className={cn(galleryFilterClass, !voiceTabActive && !faceFilterActive && galleryFilterActiveClass)}
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
                className={cn(galleryFilterClass, voiceTabActive && galleryFilterActiveClass)}
                type="button"
                role="tab"
                aria-selected={voiceTabActive}
                onClick={() => setGalleryTab("voice")}
              >
                <MicrophoneIcon className={cn(roundStrokeIcon, "w-[17px] flex-none")} />
                {t.voiceMessages}
                <span className={cn("min-w-5 rounded-full bg-[#f6e4ea] px-1.5 py-px text-[11px] font-extrabold text-[#8d1747]", voiceTabActive && "bg-white/22 text-white")}>{voiceMessageCount}</span>
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
        {/* Točke preloma so pisane kot min-[…], da jih Tailwind uredi po širini — mešanica `md:` in `min-[1100px]:` bi se razvrstila napačno. */}
        <div className="grid grid-cols-2 gap-1 min-[768px]:grid-cols-3 min-[768px]:gap-2 min-[1100px]:grid-cols-4" data-featured-layout={photos.length >= 5}>
          {photos.slice(0, visiblePhotoCount).map((photo, index) => {
            const position = index + 1;
            const squareOnMobile = position % 3 === 2 || position % 3 === 0;
            const featured = photos.length >= 5 && position % 5 === 1;
            return (
            <article
              className={cn(
                "relative overflow-hidden bg-[#eee8e4] [contain-intrinsic-size:180px_208px] [content-visibility:auto] min-[768px]:aspect-square min-[768px]:rounded",
                squareOnMobile ? "aspect-square" : "aspect-[1/1.16]",
                featured && "min-[1100px]:row-span-2 min-[1100px]:aspect-auto",
              )}
              key={photo.key}
            >
              <button className="group/photo absolute inset-0 block w-full cursor-zoom-in border-0 bg-none p-0" type="button" onClick={() => openPhoto(index)} aria-label={`${photo.kind === "video" ? t.openVideo : t.openPhoto}: ${photo.alt}`}>
                <Image className="object-cover transition-transform duration-[280ms] ease-[cubic-bezier(.22,1,.36,1)] group-hover/photo:scale-[1.025] motion-reduce:transition-none" src={photo.src} alt={photo.alt} fill sizes="(max-width: 767px) 50vw, (max-width: 1100px) 33vw, 25vw" unoptimized={photo.src.startsWith("/api/")} />
                {photo.kind === "video" ? <span className="absolute top-1/2 left-1/2 grid size-12 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-white/55 bg-[rgba(35,17,24,.58)] pl-[3px] text-[18px] text-white shadow-[0_8px_24px_rgba(0,0,0,.22)] backdrop-blur-sm" aria-hidden="true">▶</span> : null}
              </button>
              <button className="group/like absolute top-[7px] right-[7px] z-1 grid size-11 cursor-pointer place-items-center rounded-full border-0 bg-[rgba(35,17,24,.3)] text-white backdrop-blur-sm" type="button" onClick={() => toggleLike(photo.key)} aria-label={liked.includes(photo.key) ? t.removeFavourite : t.addFavourite} aria-pressed={liked.includes(photo.key)}>
                <HeartIcon className={cn(outlineIcon, "w-5 transition-[fill,transform] duration-[180ms] group-active/like:scale-[.88] motion-reduce:transition-none")} filled={liked.includes(photo.key)} />
              </button>
              {eventInfo.commentsEnabled && photo.publicId ? (
                <button
                  className="absolute right-[7px] bottom-[7px] z-1 inline-flex min-h-11 min-w-11 cursor-pointer items-center justify-center gap-[5px] rounded-full border border-white/20 bg-[rgba(35,17,24,.44)] px-[11px] text-[12px] font-extrabold text-white [font-family:inherit] backdrop-blur-[9px] transition-[background,transform] duration-[180ms] hover:bg-[rgba(35,17,24,.68)] active:scale-[.94] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#f8a7c5] motion-reduce:transition-none"
                  type="button"
                  onClick={() => openPhotoComments(index)}
                  aria-label={`${pluralCount(locale, photo.commentCount, t.commentCount)} ${t.onThePhoto}`}
                >
                  <CommentIcon className={cn(outlineIcon, "w-[18px]")} /><span>{photo.commentCount}</span>
                </button>
              ) : null}
            </article>
            );
          })}
        </div>
        {photos.length === 0 ? <p className="mx-auto my-6 rounded-2xl border border-dashed border-[#ddcfd4] px-[18px] py-6 text-center text-[#705f66]">{faceFilterActive ? t.emptyFaceSearch : t.emptyGallery}</p> : null}
        {hasMorePhotos ? (
          <>
            <div ref={loadMoreRef} className="h-px w-full" aria-hidden="true" />
            <button className="mx-auto mt-6 block min-h-12 cursor-pointer rounded-full border border-[#ddcfd4] bg-white px-[22px] text-[14px] font-[750] text-[#2c1821] [font-family:inherit]" type="button" onClick={showMorePhotos}>{t.showMore}</button>
          </>
        ) : null}
        </>}
        <p className="mx-auto mt-6 flex max-w-[420px] items-center justify-center gap-2 text-center text-[12px]/[1.45] text-[#89777e]"><svg className="w-[18px] flex-none fill-none stroke-current [stroke-width:1.7]" viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="10" width="14" height="10" rx="2" /><path d="M8.5 10V7.5a3.5 3.5 0 0 1 7 0V10" /></svg>{t.privacy}</p>
      </section>

      {lightboxMounted && photos.length ? (
        <div className={cn("fixed inset-0 z-40 bg-[rgba(18,10,13,.97)] animate-[dialog-backdrop-in_.22s_ease_both] motion-reduce:animate-none", lightboxClosing && "pointer-events-none animate-[dialog-backdrop-out_.2s_ease_both]")} role="dialog" aria-modal="true" aria-label={t.lightboxLabel} onClick={() => setSelectedPhoto(null)}>
          <div className={cn("grid h-full w-full grid-cols-[minmax(0,1fr)] overflow-hidden", commentsMounted && "md:grid-cols-[minmax(0,1fr)_380px]")} onClick={(event) => event.stopPropagation()}>
            <div className={cn("relative grid min-h-0 min-w-0 place-items-center animate-[dialog-pop-in_.28s_cubic-bezier(.22,1,.36,1)_both] motion-reduce:animate-none", lightboxClosing && "animate-[dialog-pop-out_.2s_cubic-bezier(.4,0,1,1)_both]")}>
              <Link className="absolute top-[max(18px,env(safe-area-inset-top))] left-5 z-3 inline-flex items-center gap-2 text-[21px] font-[850] tracking-[-.05em] text-white!" href={homeHref} aria-label={t.backToSite}>{brandMarkSrc ? <img className={cn(brandMarkClass, "size-7")} src={brandMarkSrc} alt="" width={28} height={28} /> : null}<span>{brandLead}<span className="text-[#ef6d9b]">{brandTail}</span></span></Link>
              <button className="absolute top-[max(14px,env(safe-area-inset-top))] right-3.5 z-2 size-12 cursor-pointer rounded-full border-0 bg-white/12 text-[30px]/none text-white" type="button" onClick={() => setSelectedPhoto(null)} aria-label={t.closeView}>×</button>
              <button className={cn(lightboxNavClass, "left-2.5 md:left-[max(12px,calc(50%-420px))]")} type="button" onClick={() => movePhoto((lightboxIndex - 1 + photos.length) % photos.length)} aria-label={t.previousPhoto}>
                <svg className={lightboxNavIconClass} viewBox="0 0 24 24" aria-hidden="true"><path d="m15 5-7 7 7 7" /></svg>
              </button>
              <div className="relative h-[70vh] w-full md:h-[min(76vh,760px)]">
                {photos[lightboxIndex].kind === "video" && photos[lightboxIndex].playbackUrl ? (
                  <video
                    className="size-full bg-[#120b0f] object-contain"
                    key={photos[lightboxIndex].publicId}
                    src={photos[lightboxIndex].playbackUrl ?? undefined}
                    poster={photos[lightboxIndex].src}
                    controls
                    autoPlay
                    playsInline
                    aria-label={photos[lightboxIndex].alt}
                  />
                ) : (
                  <Image className="object-contain" src={photos[lightboxIndex].src} alt={photos[lightboxIndex].alt} fill priority sizes={commentsVisible ? "(min-width: 768px) calc(100vw - 380px), 100vw" : "100vw"} unoptimized={photos[lightboxIndex].src.startsWith("/api/")} />
                )}
              </div>
              <button className={cn(lightboxNavClass, "right-2.5", commentsMounted ? "md:right-2.5" : "md:right-[max(12px,calc(50%-420px))]")} type="button" onClick={() => movePhoto((lightboxIndex + 1) % photos.length)} aria-label={t.nextPhoto}>
                <svg className={lightboxNavIconClass} viewBox="0 0 24 24" aria-hidden="true"><path d="m9 5 7 7-7 7" /></svg>
              </button>
              <span className={cn("absolute bottom-[max(22px,env(safe-area-inset-bottom))] text-[13px] text-white/72 tabular-nums", commentsMounted && "max-md:hidden")}>{lightboxIndex + 1} / {photos.length}</span>
              <div className={cn("absolute bottom-[max(44px,calc(env(safe-area-inset-bottom)+38px))] left-1/2 z-3 flex -translate-x-1/2 gap-2 md:bottom-[max(48px,calc(env(safe-area-inset-bottom)+42px))]", commentsMounted && "max-md:bottom-[min(63dvh,628px)]")}>
                <button className={lightboxActionClass} type="button" onClick={() => toggleLike(photos[lightboxIndex].key)} aria-label={liked.includes(photos[lightboxIndex].key) ? t.removeFavourite : t.addFavourite} aria-pressed={liked.includes(photos[lightboxIndex].key)}>
                  <HeartIcon className={lightboxActionIconClass} filled={liked.includes(photos[lightboxIndex].key)} /><span>{liked.includes(photos[lightboxIndex].key) ? t.liked : t.like}</span>
                </button>
                {eventInfo.commentsEnabled ? <button className={lightboxActionClass} type="button" onClick={() => setCommentsOpen((current) => !current)} aria-label={t.comments} aria-expanded={commentsVisible}>
                  <CommentIcon className={lightboxActionIconClass} /><span>{t.comments}</span>
                </button> : null}
                {photos[lightboxIndex].downloadUrl ? <a className={lightboxActionClass} href={photos[lightboxIndex].downloadUrl!} aria-label={t.downloadOriginal}>
                  <DownloadIcon className={lightboxActionIconClass} /><span>{t.download}</span>
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
