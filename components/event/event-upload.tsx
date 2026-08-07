"use client";

import NextImage from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import type { ChangeEvent } from "react";
import { Upload as TusUpload } from "tus-js-client";
import { runWithConcurrency } from "@/lib/client/concurrency";
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
import styles from "../../app/(public)/e/[slug]/event-page.module.css";
import { useLocale } from "@/components/i18n/locale-provider";
import { privacyPath, termsPath } from "@/lib/i18n/routes";
import type { Locale } from "@/lib/i18n/locale";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { plural, pluralCount } from "@/lib/i18n/plural";

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
    title?: string;
    detail?: string;
  } | null;
  return new Error(locale === "en" ? fallback : body?.detail || body?.title || fallback);
}

export function EventUpload({ eventSlug, guestId, videoUploadsEnabled = false, onRequestVoiceMessage }: { eventSlug: string; guestId: string; videoUploadsEnabled?: boolean; onRequestVoiceMessage?: () => void }) {
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

  const uploadItem = useCallback(async (id: string) => {
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
  }, [allowPublishing, getSessionToken, locale, t, termsAccepted]);

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
      <section className={styles.successCard} aria-live="polite">
        <span className={styles.successIcon}><NextImage src="/icons/engagement/thanks.png" alt="" width={70} height={70} aria-hidden="true" /></span>
        <p className={styles.successEyebrow}>{t.successEyebrow}</p>
        <h2>{plural(locale, doneCount, t.thanks)}</h2>
        <p>
          {pluralCount(locale, doneCount, t.addedCount)}
          {allowPublishing ? t.willAppear : t.storedForOrganiser}
        </p>
        <button
          className={styles.secondaryButton}
          type="button"
          onClick={() => {
            items.forEach((item) => URL.revokeObjectURL(item.previewUrl));
            setItems([]);
          }}
        >
          <PlusIcon /> {t.addMore}
        </button>
      </section>
    );
  }

  return (
    <section className={styles.uploadCard} id="dodaj" aria-labelledby="upload-title" aria-busy={isUploading}>
      <div className={styles.uploadHeading}>
        <span>{t.eyebrow}</span>
        <h2 id="upload-title">{t.title}</h2>
        <p>{videoUploadsEnabled ? t.subtitleWithVideo : t.subtitlePhotosOnly}</p>
      </div>

      {videoUploadsEnabled ? <input
        ref={galleryInputRef}
        className={styles.visuallyHidden}
        type="file"
        aria-label={t.choosePhotosLabel}
        accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
        multiple
        onChange={handleFileChange}
      /> : null}
      <input
        ref={videoInputRef}
        className={styles.visuallyHidden}
        type="file"
        aria-label={t.chooseVideosLabel}
        accept="video/mp4,video/quicktime,video/webm"
        multiple
        onChange={handleFileChange}
      />
      <input
        ref={cameraInputRef}
        className={styles.visuallyHidden}
        type="file"
        aria-label={t.takePhotoLabel}
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
      />

      {items.length === 0 ? (
        <div className={styles.pickerActions}>
          <button className={styles.primaryPicker} type="button" onClick={() => galleryInputRef.current?.click()}>
            <span><ImageIcon /></span>
            <strong>{t.chooseFromPhone}</strong>
            <small>{t.chooseFromPhoneHint}</small>
          </button>
          <button className={styles.cameraPicker} type="button" onClick={() => cameraInputRef.current?.click()}>
            <CameraIcon /> {t.takePhotoNow}
          </button>
          {videoUploadsEnabled ? <button className={styles.cameraPicker} type="button" onClick={() => videoInputRef.current?.click()}>
            <span aria-hidden="true">▶</span> {t.addVideo}
          </button> : null}
          {onRequestVoiceMessage ? <button className={styles.cameraPicker} type="button" onClick={onRequestVoiceMessage}>
            <MicrophoneIcon /> {t.voiceMessage}
          </button> : null}
        </div>
      ) : (
        <>
          <div className={styles.fileList} aria-live="polite">
            {items.map((item) => (
              <article className={styles.fileItem} key={item.id}>
                <div className={styles.filePreview}>
                  {item.file.type.startsWith("image/") ? (
                    // Blob URLs are local previews; next/image cannot optimize them.
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.previewUrl} alt={t.photoPreview} />
                  ) : (
                    <video src={item.previewUrl} aria-label={t.videoPreview} muted playsInline />
                  )}
                </div>
                <div className={styles.fileInfo}>
                  <strong>{item.file.name}</strong>
                  <span role={item.status === "error" ? "alert" : undefined}>
                    {item.status === "ready" ? `${formatFileSize(item.file.size)} · ${t.ready}` : null}
                    {item.status === "uploading" ? `${t.uploading} · ${item.progress} %` : null}
                    {item.status === "done" ? t.added : null}
                    {item.status === "error" ? item.error : null}
                  </span>
                  {item.status === "uploading" ? (
                    <div className={styles.progressTrack} role="progressbar" aria-label={`${t.uploading} ${item.file.name}`} aria-valuenow={item.progress} aria-valuemin={0} aria-valuemax={100}>
                      <span style={{ width: `${item.progress}%` }} />
                    </div>
                  ) : null}
                </div>
                {item.status === "error" && !validateFile(item.file, locale) ? (
                  <button className={styles.iconButton} type="button" onClick={() => uploadItem(item.id)} aria-label={`${t.tryAgain}: ${item.file.name}`}>
                    <RetryIcon />
                  </button>
                ) : (
                  <button className={styles.iconButton} type="button" onClick={() => removeItem(item.id)} aria-label={`${t.remove} ${item.file.name}`} disabled={item.status === "uploading"}>
                    {item.status === "done" ? <CheckIcon /> : <CloseIcon />}
                  </button>
                )}
              </article>
            ))}
          </div>

          <button className={styles.addMoreButton} type="button" onClick={() => galleryInputRef.current?.click()} disabled={isUploading}>
            <PlusIcon /> {t.addMore}
          </button>
          {videoUploadsEnabled ? <button className={styles.addMoreButton} type="button" onClick={() => videoInputRef.current?.click()} disabled={isUploading}>
            <span aria-hidden="true">▶</span> {t.addVideo}
          </button> : null}
          {onRequestVoiceMessage ? <button className={styles.addMoreButton} type="button" onClick={onRequestVoiceMessage} disabled={isUploading}>
            <MicrophoneIcon /> {t.voiceMessage}
          </button> : null}

          <label className={styles.consentRow}>
            <input
              type="checkbox"
              checked={allowPublishing}
              onChange={(event) => setAllowPublishing(event.target.checked)}
            />
            <span>
              <strong>{t.publishLabel}</strong>
              <small>{t.publishHint}</small>
            </span>
          </label>

          <label className={styles.consentRow}>
            <input type="checkbox" checked={termsAccepted} onChange={(event) => setTermsAccepted(event.target.checked)} />
            <span>
              <strong>{t.termsLabel}</strong>
              <small>{t.consentPrefix} <Link href={termsPath(locale)} target="_blank">{t.termsWord}</Link> {t.consentMiddle} <Link href={privacyPath(locale)} target="_blank">{t.privacyWord}</Link>.</small>
            </span>
          </label>

          <button className={styles.uploadButton} type="button" onClick={startUpload} disabled={actionableCount === 0 || isUploading || !termsAccepted}>
            {retryableCount > 0 && readyCount === 0 ? <RetryIcon /> : <UploadIcon />}
            {isUploading
              ? t.uploadingButton
              : retryableCount > 0 && readyCount === 0
                ? `${t.tryAgain} (${retryableCount})`
                : pluralCount(locale, actionableCount, t.addFiles)}
          </button>
        </>
      )}

      <p className={styles.uploadPrivacy}>
        {isUploading
          ? t.keepOpen
          : t.consentNote}
      </p>
    </section>
  );
}
