"use client";

import NextImage from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import type { ChangeEvent } from "react";
import { runWithConcurrency } from "@/lib/client/concurrency";
import {
  CameraIcon,
  CheckIcon,
  CloseIcon,
  ImageIcon,
  PlusIcon,
  RetryIcon,
  UploadIcon,
} from "./event-icons";
import { getUploadActionState } from "./event-upload-state";
import type { ClientUploadStatus } from "./event-upload-state";
import styles from "../../app/(public)/e/[slug]/event-page.module.css";

const ACCEPTED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
]);
const IMAGE_LIMIT = 20 * 1024 * 1024;
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

function validateFile(file: File) {
  if (!ACCEPTED_TYPES.has(file.type)) {
    return "Ta vrsta datoteke ni podprta.";
  }

  if (file.size > IMAGE_LIMIT) {
    return "Fotografija je večja od 20 MB.";
  }

  return undefined;
}

function makeUploadItem(file: File): UploadItem {
  const error = validateFile(file);
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

async function responseError(response: Response, fallback: string): Promise<Error> {
  const body = await response.json().catch(() => null) as {
    title?: string;
    detail?: string;
  } | null;
  return new Error(body?.detail || body?.title || fallback);
}

export function EventUpload({ eventSlug, guestId }: { eventSlug: string; guestId: string }) {
  const [items, setItems] = useState<UploadItem[]>([]);
  const [allowPublishing, setAllowPublishing] = useState(false);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
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
    setItems((current) => [...current, ...Array.from(files, makeUploadItem)]);
  }, []);

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
      if (!response.ok) throw await responseError(response, "Nalaganje trenutno ni na voljo.");
      const body = await response.json() as { token: string };
      sessionTokenRef.current = body.token;
      return body.token;
    })();

    try {
      return await sessionPromiseRef.current;
    } finally {
      sessionPromiseRef.current = null;
    }
  }, [eventSlug, guestId]);

  const uploadItem = useCallback(async (id: string) => {
    if (!navigator.onLine) {
      setItems((current) => current.map((item) => (
        item.id === id
          ? { ...item, status: "error", error: "Ni povezave. Poskusi znova, ko boš na spletu." }
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
        const prepared = await fetch(`/api/v1/upload-sessions/${encodeURIComponent(token)}/files`, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            filename: item.file.name,
            mime: item.file.type,
            sizeBytes: item.file.size,
            publicationConsent: allowPublishing,
          }),
        });
        if (!prepared.ok) {
          if (prepared.status === 401) sessionTokenRef.current = null;
          throw await responseError(prepared, "Datoteke ni bilo mogoče pripraviti.");
        }
        const body = await prepared.json() as { fileId: string; uploadUrl: string };
        fileId = body.fileId;
        uploadUrl = body.uploadUrl;
        setItems((current) => current.map((candidate) => candidate.id === id ? { ...candidate, serverFileId: fileId, uploadUrl } : candidate));
      }

      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("PUT", uploadUrl);
        xhr.setRequestHeader("content-type", item.file.type);
        xhr.upload.onprogress = (event) => {
          if (!event.lengthComputable) return;
          const progress = Math.min(99, Math.round((event.loaded / event.total) * 100));
          setItems((current) => current.map((candidate) => candidate.id === id ? { ...candidate, progress } : candidate));
        };
        xhr.onload = () => xhr.status >= 200 && xhr.status < 300 ? resolve() : reject(new Error("Prenos ni uspel."));
        xhr.onerror = () => reject(new Error("Omrežna napaka."));
        xhr.send(item.file);
      });

      const completed = await fetch(`/api/v1/upload-sessions/${encodeURIComponent(token)}/files/${fileId}/complete`, { method: "POST" });
      if (!completed.ok) throw await responseError(completed, "Zaključevanje prenosa ni uspelo.");
      setItems((current) => current.map((candidate) => candidate.id === id ? { ...candidate, status: "done", progress: 100 } : candidate));
    } catch (error) {
      setItems((current) => current.map((candidate) => candidate.id === id ? {
        ...candidate,
        status: "error",
        error: error instanceof Error ? error.message : "Nalaganje ni uspelo.",
      } : candidate));
    }
  }, [allowPublishing, getSessionToken]);

  const startUpload = () => {
    const uploadableItems = items.filter((item) => (
      item.status === "ready" || (item.status === "error" && !validateFile(item.file))
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
    hasValidationError: Boolean(validateFile(item.file)),
  })));

  if (isComplete) {
    return (
      <section className={styles.successCard} aria-live="polite">
        <span className={styles.successIcon}><NextImage src="/icons/engagement/thanks.png" alt="" width={70} height={70} aria-hidden="true" /></span>
        <p className={styles.successEyebrow}>Uspelo je!</p>
        <h2>Hvala za {doneCount === 1 ? "fotografijo" : "spomine"}.</h2>
        <p>
          {doneCount === 1 ? "Datoteka je varno dodana." : `${doneCount} datotek je varno dodanih.`}
          {allowPublishing ? " Kmalu se bodo prikazale v galeriji." : " Varno so shranjene za organizatorja."}
        </p>
        <button
          className={styles.secondaryButton}
          type="button"
          onClick={() => {
            items.forEach((item) => URL.revokeObjectURL(item.previewUrl));
            setItems([]);
          }}
        >
          <PlusIcon /> Dodaj še
        </button>
      </section>
    );
  }

  return (
    <section className={styles.uploadCard} id="dodaj" aria-labelledby="upload-title" aria-busy={isUploading}>
      <div className={styles.uploadHeading}>
        <span>Čisto preprosto</span>
        <h2 id="upload-title">Kaj želiš dodati?</h2>
        <p>Izberi eno ali več fotografij.</p>
      </div>

      <input
        ref={galleryInputRef}
        className={styles.visuallyHidden}
        type="file"
        aria-label="Izberi fotografije iz telefona"
        accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
        multiple
        onChange={handleFileChange}
      />
      <input
        ref={cameraInputRef}
        className={styles.visuallyHidden}
        type="file"
        aria-label="Posnemi fotografijo"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
      />

      {items.length === 0 ? (
        <div className={styles.pickerActions}>
          <button className={styles.primaryPicker} type="button" onClick={() => galleryInputRef.current?.click()}>
            <span><ImageIcon /></span>
            <strong>Izberi iz telefona</strong>
            <small>Lahko izbereš več fotografij</small>
          </button>
          <button className={styles.cameraPicker} type="button" onClick={() => cameraInputRef.current?.click()}>
            <CameraIcon /> Fotografiraj zdaj
          </button>
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
                    <img src={item.previewUrl} alt="Predogled izbrane fotografije" />
                  ) : null}
                </div>
                <div className={styles.fileInfo}>
                  <strong>{item.file.name}</strong>
                  <span role={item.status === "error" ? "alert" : undefined}>
                    {item.status === "ready" ? `${formatFileSize(item.file.size)} · Pripravljeno` : null}
                    {item.status === "uploading" ? `Nalaganje · ${item.progress} %` : null}
                    {item.status === "done" ? "Dodano" : null}
                    {item.status === "error" ? item.error : null}
                  </span>
                  {item.status === "uploading" ? (
                    <div className={styles.progressTrack} role="progressbar" aria-label={`Nalaganje ${item.file.name}`} aria-valuenow={item.progress} aria-valuemin={0} aria-valuemax={100}>
                      <span style={{ width: `${item.progress}%` }} />
                    </div>
                  ) : null}
                </div>
                {item.status === "error" && !validateFile(item.file) ? (
                  <button className={styles.iconButton} type="button" onClick={() => uploadItem(item.id)} aria-label={`Poskusi znova: ${item.file.name}`}>
                    <RetryIcon />
                  </button>
                ) : (
                  <button className={styles.iconButton} type="button" onClick={() => removeItem(item.id)} aria-label={`Odstrani ${item.file.name}`} disabled={item.status === "uploading"}>
                    {item.status === "done" ? <CheckIcon /> : <CloseIcon />}
                  </button>
                )}
              </article>
            ))}
          </div>

          <button className={styles.addMoreButton} type="button" onClick={() => galleryInputRef.current?.click()} disabled={isUploading}>
            <PlusIcon /> Dodaj še
          </button>

          <label className={styles.consentRow}>
            <input
              type="checkbox"
              checked={allowPublishing}
              onChange={(event) => setAllowPublishing(event.target.checked)}
            />
            <span>
              <strong>Naj se pokažejo tudi v galeriji</strong>
              <small>Objavljene bodo v skupni galeriji dogodka.</small>
            </span>
          </label>

          <button className={styles.uploadButton} type="button" onClick={startUpload} disabled={actionableCount === 0 || isUploading}>
            {retryableCount > 0 && readyCount === 0 ? <RetryIcon /> : <UploadIcon />}
            {isUploading
              ? "Nalaganje …"
              : retryableCount > 0 && readyCount === 0
                ? `Poskusi znova (${retryableCount})`
                : `Dodaj ${actionableCount} ${actionableCount === 1 ? "datoteko" : "datotek"}`}
          </button>
        </>
      )}

      <p className={styles.uploadPrivacy}>Z nadaljevanjem dovoliš varno obdelavo izbranih datotek za ta dogodek.</p>
    </section>
  );
}
