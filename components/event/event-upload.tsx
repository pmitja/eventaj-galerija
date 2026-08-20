"use client";

import NextImage from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import type { ChangeEvent } from "react";
import { Upload as TusUpload } from "tus-js-client";
import { runWithConcurrency } from "@/lib/client/concurrency";
import { addLocalDemoMedia, videoPosterBlob } from "@/lib/demo/local-media";
import { CURRENT_UPLOAD_CONSENT_VERSION } from "@/lib/domain/legal";
import {
  CameraIcon,
  CheckIcon,
  CloseIcon,
  ImageIcon,
  MicrophoneIcon,
  PlusIcon,
  RetryIcon,
  UploadIcon,
} from "./event-icons";
import {
  DEFAULT_PUBLICATION_CONSENT,
  getUploadActionState,
} from "./event-upload-state";
import type { ClientUploadStatus } from "./event-upload-state";
import { cn } from "@/lib/utils";

import { useLocale } from "@/components/i18n/locale-provider";
import { privacyPath, termsPath } from "@/lib/i18n/routes";
import type { Locale } from "@/lib/i18n/locale";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { plural, pluralCount } from "@/lib/i18n/plural";

const cardShell =
  "mx-auto w-[min(100%,620px)] rounded-3xl border border-[rgba(108,47,76,.08)] bg-white px-5 pt-[26px] pb-5 text-[#2c1821] shadow-[0_16px_50px_rgba(91,32,60,.1)] md:rounded-[28px] md:p-[34px]";
const cardEyebrow = "mb-[7px] inline-block text-[11px] font-extrabold tracking-[.1em] text-[#9f1d52] uppercase";
const cardTitle = "m-0 text-[25px]/[1.2] tracking-[-.025em]";
const cardText = "mt-2 mb-[22px] text-[15px]/[1.5] text-[#705f66]";
const outlineButton =
  "flex min-h-[50px] cursor-pointer items-center justify-center gap-2 rounded-[14px] border border-[#ecdce3] bg-white px-[18px] py-3 text-[14px] font-[750] text-[#2c1821] [font-family:inherit] transition-[background,border-color] duration-200 hover:border-[#dca8bd] hover:bg-[#fff8fa] motion-reduce:transition-none";
const cameraPicker = cn(outlineButton, "md:min-h-[148px] md:flex-col md:border-dashed md:text-[15px]");
const addMoreButton = cn(outlineButton, "mt-2.5 w-full border-dashed disabled:cursor-not-allowed disabled:opacity-50");
const consentRow =
  "mt-4 flex min-h-[70px] cursor-pointer items-start gap-[11px] rounded-[14px] bg-[#faf5f7] p-[13px] has-[input:focus-visible]:outline-3 has-[input:focus-visible]:outline-offset-[3px] has-[input:focus-visible]:outline-[rgba(199,31,103,.28)]";
const consentTitle = "text-[13px]/[1.35]";
const consentNote = "mt-[3px] text-[11px]/[1.35] text-[#705f66]";
const iconButton =
  "grid size-11 cursor-pointer place-items-center rounded-xl border-0 bg-transparent p-0 text-[#705f66] enabled:hover:bg-[#f8eaf0] enabled:hover:text-[#2c1821] disabled:cursor-not-allowed disabled:opacity-45";
const uploadButtonClass =
  "mt-3.5 inline-flex min-h-[58px] w-full cursor-pointer items-center justify-center gap-2.5 rounded-2xl border-0 bg-[#9f1d52] px-[22px] py-4 text-[16px] font-extrabold text-white shadow-[0_10px_22px_rgba(199,31,103,.24)] [font-family:inherit] transition-[background,box-shadow,transform] duration-200 enabled:hover:-translate-y-px enabled:hover:bg-[#6f1239] enabled:hover:shadow-[0_13px_28px_rgba(151,21,76,.28)] disabled:cursor-not-allowed disabled:bg-[#ddd2d7] disabled:text-[#67555d] disabled:shadow-none motion-reduce:transition-none";

const ACCEPTED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
  "video/mp4",
  "video/quicktime",
  "video/webm",
]);
const IMAGE_LIMIT = 20 * 1024 * 1024;
const VIDEO_LIMIT = 500 * 1024 * 1024;
const MAX_CONCURRENT_UPLOADS = 3;

type UploadItem = {
  id: string;
  file: File;
  previewUrl: string;
  progress: number;
  status: ClientUploadStatus;
  error?: string;
  serverFileId?: string;
  uploadUrl?: string;
};

function validateFile(file: File, locale: Locale = "sl") {
  const t = getDictionary(locale).guest.upload;
  if (!ACCEPTED_TYPES.has(file.type)) {
    return t.unsupportedType;
  }

  if (file.type.startsWith("image/") && file.size > IMAGE_LIMIT) {
    return t.photoTooLarge;
  }
  if (file.type.startsWith("video/") && file.size > VIDEO_LIMIT) return t.videoTooLarge;

  return undefined;
}

function makeUploadItem(file: File, locale: Locale = "sl"): UploadItem {
  const error = validateFile(file, locale);
  return {
    id: `${file.name}-${file.lastModified}-${crypto.randomUUID()}`,
    file,
    previewUrl: URL.createObjectURL(file),
    progress: 0,
    status: error ? "error" : "ready",
    error,
  };
}

function formatFileSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

async function responseError(response: Response, fallback: string, locale: Locale = "sl"): Promise<Error> {
  const body = await response.json().catch(() => null) as {
    code?: string;
    title?: string;
    detail?: string;
  } | null;
  if (body?.code === "VIDEO_EVENT_LIMIT") {
    return new Error(getDictionary(locale).guest.upload.videoLimitReached);
  }
  if (body?.code === "VIDEO_FAIR_USE_LIMIT") {
    return new Error(getDictionary(locale).guest.upload.videoFairUseLimitReached);
  }
  return new Error(locale === "en" ? fallback : body?.detail || body?.title || fallback);
}

export function EventUpload({
  eventSlug,
  guestId,
  videoUploadsEnabled = false,
  onRequestVoiceMessage,
  localOnly = false,
}: {
  eventSlug: string;
  guestId: string;
  videoUploadsEnabled?: boolean;
  onRequestVoiceMessage?: () => void;
  /** Demo mode: files are kept on the visitor's device instead of being uploaded. */
  localOnly?: boolean;
}) {
  const locale = useLocale();
  const t = getDictionary(locale).guest.upload;
  const [items, setItems] = useState<UploadItem[]>([]);
  const [allowPublishing, setAllowPublishing] = useState(DEFAULT_PUBLICATION_CONSENT);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const itemsRef = useRef(items);
  const sessionTokenRef = useRef<string | null>(null);
  const sessionPromiseRef = useRef<Promise<string> | null>(null);

  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  useEffect(() => {
    return () => itemsRef.current.forEach((item) => URL.revokeObjectURL(item.previewUrl));
  }, []);

  const addFiles = useCallback((files: FileList | null) => {
    if (!files?.length) return;
    setItems((current) => [...current, ...Array.from(files, (file) => makeUploadItem(file, locale))]);
  }, [locale]);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    addFiles(event.target.files);
    event.target.value = "";
  };

  const removeItem = (id: string) => {
    setItems((current) => {
      const removed = current.find((item) => item.id === id);
      if (removed) URL.revokeObjectURL(removed.previewUrl);
      return current.filter((item) => item.id !== id);
    });
  };

  const getSessionToken = useCallback(async () => {
    if (sessionTokenRef.current) return sessionTokenRef.current;
    if (sessionPromiseRef.current) return sessionPromiseRef.current;

    sessionPromiseRef.current = (async () => {
      const response = await fetch(`/api/v1/events/${encodeURIComponent(eventSlug)}/upload-sessions`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ guestId }),
      });
      if (!response.ok) throw await responseError(response, t.unavailable, locale);
      const body = await response.json() as { token: string };
      sessionTokenRef.current = body.token;
      return body.token;
    })();

    try {
      return await sessionPromiseRef.current;
    } finally {
      sessionPromiseRef.current = null;
    }
  }, [eventSlug, guestId, locale, t]);

  const saveItemLocally = useCallback(async (id: string) => {
    const item = itemsRef.current.find((candidate) => candidate.id === id);
    if (!item) return;
    setItems((current) => current.map((candidate) => candidate.id === id ? { ...candidate, status: "uploading", progress: 20, error: undefined } : candidate));
    try {
      const isVideo = item.file.type.startsWith("video/");
      const poster = isVideo ? await videoPosterBlob(item.file) : null;
      await addLocalDemoMedia({
        kind: isVideo ? "video" : "image",
        mime: item.file.type,
        filename: item.file.name,
        durationMs: null,
        blob: item.file,
        poster,
      });
      setItems((current) => current.map((candidate) => candidate.id === id ? { ...candidate, status: "done", progress: 100 } : candidate));
    } catch {
      setItems((current) => current.map((candidate) => candidate.id === id ? { ...candidate, status: "error", error: t.transferFailed } : candidate));
    }
  }, [t]);

  const uploadItem = useCallback(async (id: string) => {
    if (localOnly) {
      await saveItemLocally(id);
      return;
    }
    if (!navigator.onLine) {
      setItems((current) => current.map((item) => (
        item.id === id
          ? { ...item, status: "error", error: t.offline }
          : item
      )));
      return;
    }

    setItems((current) => current.map((item) => (
      item.id === id ? { ...item, status: "uploading", progress: 4, error: undefined } : item
    )));

    try {
      const item = itemsRef.current.find((candidate) => candidate.id === id);
      if (!item) return;
      const token = await getSessionToken();
      let fileId = item.serverFileId;
      let uploadUrl = item.uploadUrl;
      if (!fileId || !uploadUrl) {
        const isVideo = item.file.type.startsWith("video/");
        const prepared = await fetch(`/api/v1/upload-sessions/${encodeURIComponent(token)}/${isVideo ? "videos" : "files"}`, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            filename: item.file.name,
            mime: item.file.type,
            sizeBytes: item.file.size,
            publicationConsent: allowPublishing,
            ...(isVideo ? { termsAccepted, consentVersion: CURRENT_UPLOAD_CONSENT_VERSION } : {}),
          }),
        });
        if (!prepared.ok) {
          if (prepared.status === 401) sessionTokenRef.current = null;
          throw await responseError(prepared, t.prepareFailed, locale);
        }
        const body = await prepared.json() as { fileId: string; uploadUrl: string };
        fileId = body.fileId;
        uploadUrl = body.uploadUrl;
        setItems((current) => current.map((candidate) => candidate.id === id ? { ...candidate, serverFileId: fileId, uploadUrl } : candidate));
      }

      if (item.file.type.startsWith("video/")) {
        await new Promise<void>((resolve, reject) => {
          const upload = new TusUpload(item.file, {
            uploadUrl,
            chunkSize: 25 * 1024 * 1024,
            retryDelays: [0, 1000, 3000, 5000, 10000],
            removeFingerprintOnSuccess: true,
            onProgress: (uploaded, total) => {
              const progress = Math.min(99, Math.round((uploaded / total) * 100));
              setItems((current) => current.map((candidate) => candidate.id === id ? { ...candidate, progress } : candidate));
            },
            onSuccess: () => resolve(),
            onError: (error) => reject(error),
          });
          upload.start();
        });
      } else {
        await new Promise<void>((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.open("PUT", uploadUrl);
          xhr.setRequestHeader("content-type", item.file.type);
          xhr.upload.onprogress = (event) => {
            if (!event.lengthComputable) return;
            const progress = Math.min(99, Math.round((event.loaded / event.total) * 100));
            setItems((current) => current.map((candidate) => candidate.id === id ? { ...candidate, progress } : candidate));
          };
          xhr.onload = () => xhr.status >= 200 && xhr.status < 300 ? resolve() : reject(new Error(t.transferFailed));
          xhr.onerror = () => reject(new Error(t.networkError));
          xhr.send(item.file);
        });
        const completed = await fetch(`/api/v1/upload-sessions/${encodeURIComponent(token)}/files/${fileId}/complete`, { method: "POST" });
        if (!completed.ok) throw await responseError(completed, t.completeFailed, locale);
      }
      setItems((current) => current.map((candidate) => candidate.id === id ? { ...candidate, status: "done", progress: 100 } : candidate));
    } catch (error) {
      setItems((current) => current.map((candidate) => candidate.id === id ? {
        ...candidate,
        status: "error",
        error: error instanceof Error ? error.message : t.transferFailed,
      } : candidate));
    }
  }, [allowPublishing, getSessionToken, locale, localOnly, saveItemLocally, t, termsAccepted]);

  const startUpload = () => {
    const uploadableItems = items.filter((item) => (
      item.status === "ready" || (item.status === "error" && !validateFile(item.file, locale))
    ));
    void runWithConcurrency(
      uploadableItems,
      MAX_CONCURRENT_UPLOADS,
      async (item) => uploadItem(item.id),
    );
  };

  const {
    readyCount,
    retryableCount,
    actionableCount,
    isUploading,
    doneCount,
    isComplete,
  } = getUploadActionState(items.map((item) => ({
    status: item.status,
    hasValidationError: Boolean(validateFile(item.file, locale)),
  })));

  useEffect(() => {
    if (!isUploading) return;

    let wakeLock: WakeLockSentinel | null = null;
    let stopped = false;

    const requestWakeLock = async () => {
      if (!("wakeLock" in navigator) || document.visibilityState !== "visible") return;
      try {
        const lock = await navigator.wakeLock.request("screen");
        if (stopped) {
          await lock.release();
          return;
        }
        wakeLock = lock;
        lock.addEventListener("release", () => {
          if (wakeLock === lock) wakeLock = null;
        });
      } catch {
        // Wake Lock is a best-effort enhancement and may be denied by the OS.
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && !wakeLock) {
        void requestWakeLock();
      }
    };
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = t.leaveWarning;
    };

    void requestWakeLock();
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      stopped = true;
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      void wakeLock?.release();
    };
  }, [isUploading, t]);

  if (isComplete) {
    return (
      <section className={cn(cardShell, "flex flex-col items-center pt-9 pb-[30px] text-center")} aria-live="polite">
        <span className="mb-[18px] grid size-[72px] place-items-center rounded-[22px] bg-[#fff1f6]"><NextImage className="size-[70px] object-contain drop-shadow-[0_9px_13px_rgba(159,29,82,.15)]" src="/icons/engagement/thanks.png" alt="" width={70} height={70} aria-hidden="true" /></span>
        <p className={cardEyebrow}>{t.successEyebrow}</p>
        <h2 className={cardTitle}>{plural(locale, doneCount, t.thanks)}</h2>
        <p className={cn(cardText, "max-w-[390px]")}>
          {pluralCount(locale, doneCount, t.addedCount)}
          {localOnly ? ` ${t.localOnlyNote}` : allowPublishing ? t.willAppear : t.storedForOrganiser}
        </p>
        <button
          className={cn(outlineButton, "min-w-[160px]")}
          type="button"
          onClick={() => {
            items.forEach((item) => URL.revokeObjectURL(item.previewUrl));
            setItems([]);
          }}
        >
          <PlusIcon className="size-5" /> {t.addMore}
        </button>
      </section>
    );
  }

  return (
    <section className={cardShell} id="dodaj" aria-labelledby="upload-title" aria-busy={isUploading}>
      <div className="text-center">
        <span className={cardEyebrow}>{t.eyebrow}</span>
        <h2 className={cardTitle} id="upload-title">{t.title}</h2>
        <p className={cardText}>{videoUploadsEnabled ? t.subtitleWithVideo : t.subtitlePhotosOnly}</p>
      </div>

      <input
        ref={galleryInputRef}
        className="sr-only"
        type="file"
        aria-label={t.choosePhotosLabel}
        accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
        multiple
        onChange={handleFileChange}
      />
      {videoUploadsEnabled ? <input
        ref={videoInputRef}
        className="sr-only"
        type="file"
        aria-label={t.chooseVideosLabel}
        accept="video/mp4,video/quicktime,video/webm"
        multiple
        onChange={handleFileChange}
      /> : null}
      <input
        ref={cameraInputRef}
        className="sr-only"
        type="file"
        aria-label={t.takePhotoLabel}
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
      />

      {items.length === 0 ? (
        <div className="grid gap-2.5 md:grid-cols-[1.7fr_1fr]">
          <button className="flex min-h-[148px] cursor-pointer flex-col items-center justify-center rounded-[20px] border-2 border-dashed border-[#eeb9d0] bg-[#fff7fa] p-5 text-[#2c1821] [font-family:inherit] transition-[border-color,background] duration-200 hover:border-[#9f1d52] hover:bg-[#fff0f6] motion-reduce:transition-none" type="button" onClick={() => galleryInputRef.current?.click()}>
            <span className="mb-2.5 grid size-[50px] place-items-center rounded-2xl bg-[#9f1d52] text-white shadow-[0_7px_18px_rgba(199,31,103,.2)]"><ImageIcon className="size-[25px]" /></span>
            <strong className="text-[17px]">{t.chooseFromPhone}</strong>
            <small className="mt-1 text-[12px] text-[#705f66]">{t.chooseFromPhoneHint}</small>
          </button>
          <button className={cameraPicker} type="button" onClick={() => cameraInputRef.current?.click()}>
            <CameraIcon className="size-5 md:size-[30px]" /> {t.takePhotoNow}
          </button>
          {videoUploadsEnabled ? <button className={cameraPicker} type="button" onClick={() => videoInputRef.current?.click()}>
            <span aria-hidden="true">▶</span> {t.addVideo}
          </button> : null}
          {onRequestVoiceMessage ? <button className={cameraPicker} type="button" onClick={onRequestVoiceMessage}>
            <MicrophoneIcon className="size-5 md:size-[30px]" /> {t.voiceMessage}
          </button> : null}
        </div>
      ) : (
        <>
          <div className="grid gap-2.5" aria-live="polite">
            {items.map((item) => (
              <article className="grid min-w-0 grid-cols-[60px_minmax(0,1fr)_44px] items-center gap-3 rounded-[14px] border border-[#f0e3e8] bg-[#fffafb] p-2" key={item.id}>
                <div className="size-[60px] overflow-hidden rounded-[10px] bg-[#f3e8ed]">
                  {item.file.type.startsWith("image/") ? (
                    // Blob URLs are local previews; next/image cannot optimize them.
                    // eslint-disable-next-line @next/next/no-img-element
                    <img className="size-full object-cover" src={item.previewUrl} alt={t.photoPreview} />
                  ) : (
                    <video className="size-full object-cover" src={item.previewUrl} aria-label={t.videoPreview} muted playsInline />
                  )}
                </div>
                <div className="min-w-0">
                  <strong className="block overflow-hidden text-[13px] text-ellipsis whitespace-nowrap">{item.file.name}</strong>
                  <span className="mt-[5px] block text-[11px]/[1.35] text-[#705f66]" role={item.status === "error" ? "alert" : undefined}>
                    {item.status === "ready" ? `${formatFileSize(item.file.size)} · ${t.ready}` : null}
                    {item.status === "uploading" ? `${t.uploading} · ${item.progress} %` : null}
                    {item.status === "done" ? t.added : null}
                    {item.status === "error" ? item.error : null}
                  </span>
                  {item.status === "uploading" ? (
                    <div className="mt-2 h-[5px] overflow-hidden rounded-full bg-[#efdee6]" role="progressbar" aria-label={`${t.uploading} ${item.file.name}`} aria-valuenow={item.progress} aria-valuemin={0} aria-valuemax={100}>
                      <span className="block h-full rounded-[inherit] bg-[#9f1d52] transition-[width] duration-200 motion-reduce:transition-none" style={{ width: `${item.progress}%` }} />
                    </div>
                  ) : null}
                </div>
                {item.status === "error" && !validateFile(item.file, locale) ? (
                  <button className={iconButton} type="button" onClick={() => uploadItem(item.id)} aria-label={`${t.tryAgain}: ${item.file.name}`}>
                    <RetryIcon className="size-5" />
                  </button>
                ) : (
                  <button className={iconButton} type="button" onClick={() => removeItem(item.id)} aria-label={`${t.remove} ${item.file.name}`} disabled={item.status === "uploading"}>
                    {item.status === "done" ? <CheckIcon className="size-5" /> : <CloseIcon className="size-5" />}
                  </button>
                )}
              </article>
            ))}
          </div>

          <button className={addMoreButton} type="button" onClick={() => galleryInputRef.current?.click()} disabled={isUploading}>
            <PlusIcon className="size-5" /> {t.addMore}
          </button>
          {videoUploadsEnabled ? <button className={addMoreButton} type="button" onClick={() => videoInputRef.current?.click()} disabled={isUploading}>
            <span aria-hidden="true">▶</span> {t.addVideo}
          </button> : null}
          {onRequestVoiceMessage ? <button className={addMoreButton} type="button" onClick={onRequestVoiceMessage} disabled={isUploading}>
            <MicrophoneIcon className="size-5" /> {t.voiceMessage}
          </button> : null}

          <label className={consentRow}>
            <input
              className="mt-px size-[22px] flex-none accent-[#9f1d52]"
              type="checkbox"
              checked={allowPublishing}
              onChange={(event) => setAllowPublishing(event.target.checked)}
            />
            <span className="flex flex-col">
              <strong className={consentTitle}>{t.publishLabel}</strong>
              <small className={consentNote}>{t.publishHint}</small>
            </span>
          </label>

          <label className={consentRow}>
            <input className="mt-px size-[22px] flex-none accent-[#9f1d52]" type="checkbox" checked={termsAccepted} onChange={(event) => setTermsAccepted(event.target.checked)} />
            <span className="flex flex-col">
              <strong className={consentTitle}>{t.termsLabel}</strong>
              <small className={consentNote}>{t.consentPrefix} <Link href={termsPath(locale)} target="_blank">{t.termsWord}</Link> {t.consentMiddle} <Link href={privacyPath(locale)} target="_blank">{t.privacyWord}</Link>.</small>
            </span>
          </label>

          <button className={uploadButtonClass} type="button" onClick={startUpload} disabled={actionableCount === 0 || isUploading || !termsAccepted}>
            {retryableCount > 0 && readyCount === 0 ? <RetryIcon className="size-[22px]" /> : <UploadIcon className="size-[22px]" />}
            {isUploading
              ? t.uploadingButton
              : retryableCount > 0 && readyCount === 0
                ? `${t.tryAgain} (${retryableCount})`
                : pluralCount(locale, actionableCount, t.addFiles)}
          </button>
        </>
      )}

      <p className="mx-1 mt-3.5 mb-0 text-center text-[10.5px]/[1.45] text-[#8d7180]">
        {localOnly
          ? t.localOnlyNote
          : isUploading
            ? t.keepOpen
            : t.consentNote}
      </p>
    </section>
  );
}
