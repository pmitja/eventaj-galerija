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
  const en = locale === "en";
  if (!ACCEPTED_TYPES.has(file.type)) {
    return en ? "This file type is not supported." : "Ta vrsta datoteke ni podprta.";
  }

  if (file.type.startsWith("image/") && file.size > IMAGE_LIMIT) {
    return en ? "The photo is larger than 20 MB." : "Fotografija je večja od 20 MB.";
  }
  if (file.type.startsWith("video/") && file.size > VIDEO_LIMIT) return en ? "The video is larger than 500 MB." : "Video je večji od 500 MB.";

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

export function EventUpload({ eventSlug, guestId, videoUploadsEnabled = false }: { eventSlug: string; guestId: string; videoUploadsEnabled?: boolean }) {
  const locale = useLocale();
  const en = locale === "en";
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
      if (!response.ok) throw await responseError(response, en ? "Uploads are currently unavailable." : "Nalaganje trenutno ni na voljo.", locale);
      const body = await response.json() as { token: string };
      sessionTokenRef.current = body.token;
      return body.token;
    })();

    try {
      return await sessionPromiseRef.current;
    } finally {
      sessionPromiseRef.current = null;
    }
  }, [en, eventSlug, guestId, locale]);

  const uploadItem = useCallback(async (id: string) => {
    if (!navigator.onLine) {
      setItems((current) => current.map((item) => (
        item.id === id
          ? { ...item, status: "error", error: en ? "You are offline. Try again when you are connected." : "Ni povezave. Poskusi znova, ko boš na spletu." }
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
          throw await responseError(prepared, en ? "The file could not be prepared." : "Datoteke ni bilo mogoče pripraviti.", locale);
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
          xhr.onload = () => xhr.status >= 200 && xhr.status < 300 ? resolve() : reject(new Error(en ? "The upload failed." : "Prenos ni uspel."));
          xhr.onerror = () => reject(new Error(en ? "Network error." : "Omrežna napaka."));
          xhr.send(item.file);
        });
        const completed = await fetch(`/api/v1/upload-sessions/${encodeURIComponent(token)}/files/${fileId}/complete`, { method: "POST" });
        if (!completed.ok) throw await responseError(completed, en ? "The upload could not be completed." : "Zaključevanje prenosa ni uspelo.", locale);
      }
      setItems((current) => current.map((candidate) => candidate.id === id ? { ...candidate, status: "done", progress: 100 } : candidate));
    } catch (error) {
      setItems((current) => current.map((candidate) => candidate.id === id ? {
        ...candidate,
        status: "error",
        error: error instanceof Error ? error.message : en ? "The upload failed." : "Nalaganje ni uspelo.",
      } : candidate));
    }
  }, [allowPublishing, en, getSessionToken, locale, termsAccepted]);

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
      event.returnValue = en ? "Your photos are still uploading." : "Fotografije se še nalagajo.";
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
  }, [en, isUploading]);

  if (isComplete) {
    return (
      <section className={styles.successCard} aria-live="polite">
        <span className={styles.successIcon}><NextImage src="/icons/engagement/thanks.png" alt="" width={70} height={70} aria-hidden="true" /></span>
        <p className={styles.successEyebrow}>{en ? "Success!" : "Uspelo je!"}</p>
        <h2>{en ? `Thank you for ${doneCount === 1 ? "the photo" : "the memories"}.` : <>Hvala za {doneCount === 1 ? "fotografijo" : "spomine"}.</>}</h2>
        <p>
          {en ? (doneCount === 1 ? "The file was added securely." : `${doneCount} files were added securely.`) : (doneCount === 1 ? "Datoteka je varno dodana." : `${doneCount} datotek je varno dodanih.`)}
          {allowPublishing ? (en ? " They will appear in the gallery shortly." : " Kmalu se bodo prikazale v galeriji.") : (en ? " They are stored securely for the organiser." : " Varno so shranjene za organizatorja.")}
        </p>
        <button
          className={styles.secondaryButton}
          type="button"
          onClick={() => {
            items.forEach((item) => URL.revokeObjectURL(item.previewUrl));
            setItems([]);
          }}
        >
          <PlusIcon /> {en ? "Add more" : "Dodaj še"}
        </button>
      </section>
    );
  }

  return (
    <section className={styles.uploadCard} id="dodaj" aria-labelledby="upload-title" aria-busy={isUploading}>
      <div className={styles.uploadHeading}>
        <span>{en ? "Nice and simple" : "Čisto preprosto"}</span>
        <h2 id="upload-title">{en ? "What would you like to add?" : "Kaj želiš dodati?"}</h2>
        <p>{videoUploadsEnabled ? (en ? "Choose photos or a video up to 60 seconds." : "Izberi fotografije ali video do 60 sekund.") : (en ? "Choose one or more photos." : "Izberi eno ali več fotografij.")}</p>
      </div>

      {videoUploadsEnabled ? <input
        ref={galleryInputRef}
        className={styles.visuallyHidden}
        type="file"
        aria-label={en ? "Choose photos from your phone" : "Izberi fotografije iz telefona"}
        accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
        multiple
        onChange={handleFileChange}
      /> : null}
      <input
        ref={videoInputRef}
        className={styles.visuallyHidden}
        type="file"
        aria-label={en ? "Choose videos from your phone" : "Izberi videe iz telefona"}
        accept="video/mp4,video/quicktime,video/webm"
        multiple
        onChange={handleFileChange}
      />
      <input
        ref={cameraInputRef}
        className={styles.visuallyHidden}
        type="file"
        aria-label={en ? "Take a photo" : "Posnemi fotografijo"}
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
      />

      {items.length === 0 ? (
        <div className={styles.pickerActions}>
          <button className={styles.primaryPicker} type="button" onClick={() => galleryInputRef.current?.click()}>
            <span><ImageIcon /></span>
            <strong>{en ? "Choose from your phone" : "Izberi iz telefona"}</strong>
            <small>{en ? "You can select several photos" : "Lahko izbereš več fotografij"}</small>
          </button>
          <button className={styles.cameraPicker} type="button" onClick={() => cameraInputRef.current?.click()}>
            <CameraIcon /> {en ? "Take a photo now" : "Fotografiraj zdaj"}
          </button>
          {videoUploadsEnabled ? <button className={styles.cameraPicker} type="button" onClick={() => videoInputRef.current?.click()}>
            <span aria-hidden="true">▶</span> {en ? "Add video" : "Dodaj video"}
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
                    <img src={item.previewUrl} alt={en ? "Selected photo preview" : "Predogled izbrane fotografije"} />
                  ) : (
                    <video src={item.previewUrl} aria-label={en ? "Selected video preview" : "Predogled izbranega videa"} muted playsInline />
                  )}
                </div>
                <div className={styles.fileInfo}>
                  <strong>{item.file.name}</strong>
                  <span role={item.status === "error" ? "alert" : undefined}>
                    {item.status === "ready" ? `${formatFileSize(item.file.size)} · ${en ? "Ready" : "Pripravljeno"}` : null}
                    {item.status === "uploading" ? `${en ? "Uploading" : "Nalaganje"} · ${item.progress} %` : null}
                    {item.status === "done" ? (en ? "Added" : "Dodano") : null}
                    {item.status === "error" ? item.error : null}
                  </span>
                  {item.status === "uploading" ? (
                    <div className={styles.progressTrack} role="progressbar" aria-label={`${en ? "Uploading" : "Nalaganje"} ${item.file.name}`} aria-valuenow={item.progress} aria-valuemin={0} aria-valuemax={100}>
                      <span style={{ width: `${item.progress}%` }} />
                    </div>
                  ) : null}
                </div>
                {item.status === "error" && !validateFile(item.file, locale) ? (
                  <button className={styles.iconButton} type="button" onClick={() => uploadItem(item.id)} aria-label={`${en ? "Try again" : "Poskusi znova"}: ${item.file.name}`}>
                    <RetryIcon />
                  </button>
                ) : (
                  <button className={styles.iconButton} type="button" onClick={() => removeItem(item.id)} aria-label={`${en ? "Remove" : "Odstrani"} ${item.file.name}`} disabled={item.status === "uploading"}>
                    {item.status === "done" ? <CheckIcon /> : <CloseIcon />}
                  </button>
                )}
              </article>
            ))}
          </div>

          <button className={styles.addMoreButton} type="button" onClick={() => galleryInputRef.current?.click()} disabled={isUploading}>
            <PlusIcon /> {en ? "Add more" : "Dodaj še"}
          </button>
          {videoUploadsEnabled ? <button className={styles.addMoreButton} type="button" onClick={() => videoInputRef.current?.click()} disabled={isUploading}>
            <span aria-hidden="true">▶</span> {en ? "Add video" : "Dodaj video"}
          </button> : null}

          <label className={styles.consentRow}>
            <input
              type="checkbox"
              checked={allowPublishing}
              onChange={(event) => setAllowPublishing(event.target.checked)}
            />
            <span>
              <strong>{en ? "Also show them in the gallery" : "Naj se pokažejo tudi v galeriji"}</strong>
              <small>{en ? "They will appear in the shared event gallery." : "Objavljene bodo v skupni galeriji dogodka."}</small>
            </span>
          </label>

          <label className={styles.consentRow}>
            <input type="checkbox" checked={termsAccepted} onChange={(event) => setTermsAccepted(event.target.checked)} />
            <span>
              <strong>{en ? "I agree to the upload terms" : "Strinjam se s pogoji nalaganja"}</strong>
              <small>{en ? <>I confirm that I may share these files and accept the <Link href={termsPath(locale)} target="_blank">terms</Link> and <Link href={privacyPath(locale)} target="_blank">privacy policy</Link>.</> : <>Potrjujem, da smem deliti datoteke, ter sprejemam <Link href={termsPath(locale)} target="_blank">pogoje</Link> in <Link href={privacyPath(locale)} target="_blank">politiko zasebnosti</Link>.</>}</small>
            </span>
          </label>

          <button className={styles.uploadButton} type="button" onClick={startUpload} disabled={actionableCount === 0 || isUploading || !termsAccepted}>
            {retryableCount > 0 && readyCount === 0 ? <RetryIcon /> : <UploadIcon />}
            {isUploading
              ? (en ? "Uploading …" : "Nalaganje …")
              : retryableCount > 0 && readyCount === 0
                ? `${en ? "Try again" : "Poskusi znova"} (${retryableCount})`
                : en ? `Add ${actionableCount} ${actionableCount === 1 ? "file" : "files"}` : `Dodaj ${actionableCount} ${actionableCount === 1 ? "datoteko" : "datotek"}`}
          </button>
        </>
      )}

      <p className={styles.uploadPrivacy}>
        {isUploading
          ? (en ? "Keep this page open until the upload finishes. The screen will stay awake if your device supports it." : "Pusti to stran odprto do konca nalaganja. Zaslon bo ostal prižgan, če naprava to podpira.")
          : (en ? "By continuing, you allow the selected files to be processed securely for this event." : "Z nadaljevanjem dovoliš varno obdelavo izbranih datotek za ta dogodek.")}
      </p>
    </section>
  );
}
