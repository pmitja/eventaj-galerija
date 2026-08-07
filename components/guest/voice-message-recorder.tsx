"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { useLocale } from "@/components/i18n/locale-provider";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { pluralCount } from "@/lib/i18n/plural";
import { privacyPath, termsPath } from "@/lib/i18n/routes";
import { CURRENT_UPLOAD_CONSENT_VERSION } from "@/lib/domain/legal";
import {
  VOICE_MESSAGE_MAX_BYTES,
  VOICE_MESSAGE_MAX_DURATION_MS,
  VOICE_MESSAGE_MIN_DURATION_MS,
  type VoiceMessageMime,
} from "@/lib/domain/voice-messages";
import { useDialogTransition } from "@/lib/client/use-dialog-transition";
import styles from "./voice-message-recorder.module.css";

const MIME_CANDIDATES = ["audio/webm;codecs=opus", "audio/mp4", "audio/ogg;codecs=opus"];

type RecorderStep = "intro" | "recording" | "preview" | "uploading" | "success" | "error";

function MicrophoneIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="9" y="3" width="6" height="11" rx="3" /><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21M9 21h6" /></svg>;
}

function formatDuration(milliseconds: number) {
  const seconds = Math.max(0, Math.floor(milliseconds / 1000));
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}

function baseMime(value: string): VoiceMessageMime {
  return value.split(";", 1)[0] as VoiceMessageMime;
}

async function responseError(response: Response, fallback: string): Promise<Error> {
  const body = await response.json().catch(() => null) as { detail?: string; title?: string } | null;
  return new Error(body?.detail || body?.title || fallback);
}

export function VoiceMessageRecorder({
  eventSlug,
  guestId,
  onSubmitted,
  hideEntryCard,
  open: openProp,
  onOpenChange,
}: {
  eventSlug: string;
  guestId: string;
  onSubmitted: () => void;
  /** Renders only the dialog, for when the trigger lives somewhere else (the upload card). */
  hideEntryCard?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const locale = useLocale();
  const t = getDictionary(locale).guest.voice;
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const open = openProp ?? uncontrolledOpen;
  const setOpen = useCallback((next: boolean) => {
    if (openProp === undefined) setUncontrolledOpen(next);
    onOpenChange?.(next);
  }, [onOpenChange, openProp]);
  const { mounted: dialogMounted, closing: dialogClosing } = useDialogTransition(open);
  const [step, setStep] = useState<RecorderStep>("intro");
  const [elapsedMs, setElapsedMs] = useState(0);
  const [recording, setRecording] = useState<{ blob: Blob; url: string; mime: VoiceMessageMime; durationMs: number } | null>(null);
  const [allowPublishing, setAllowPublishing] = useState(true);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const startedAtRef = useRef(0);
  const stopRequestedRef = useRef(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const recordingRef = useRef(recording);
  useEffect(() => { recordingRef.current = recording; }, [recording]);

  function stopTracks() {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }

  function clearRecording() {
    if (recording) URL.revokeObjectURL(recording.url);
    setRecording(null);
    setElapsedMs(0);
  }

  useEffect(() => () => {
    stopTracks();
    if (recording) URL.revokeObjectURL(recording.url);
  }, [recording]);

  useEffect(() => {
    if (!open) return;
    setStep((current) => (current === "recording" || current === "uploading" ? current : recordingRef.current ? "preview" : "intro"));
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialogRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && step !== "uploading") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, setOpen, step]);

  useEffect(() => {
    if (step !== "recording") return;
    const timer = window.setInterval(() => {
      const next = Date.now() - startedAtRef.current;
      setElapsedMs(next);
      if (next >= VOICE_MESSAGE_MAX_DURATION_MS && !stopRequestedRef.current) {
        stopRequestedRef.current = true;
        recorderRef.current?.stop();
      }
    }, 200);
    return () => window.clearInterval(timer);
  }, [step]);

  function closeDialog() {
    if (step === "uploading") return;
    if (recorderRef.current?.state === "recording") recorderRef.current.stop();
    stopTracks();
    setOpen(false);
    if (step === "success") {
      clearRecording();
      setStep("intro");
      setTermsAccepted(false);
    }
  }

  async function startRecording() {
    setError(null);
    if (!("MediaRecorder" in window) || !navigator.mediaDevices?.getUserMedia) {
      setError(t.unsupported);
      setStep("error");
      return;
    }
    const selectedMime = MIME_CANDIDATES.find((mime) => MediaRecorder.isTypeSupported(mime));
    if (!selectedMime) {
      setError(t.noFormat);
      setStep("error");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { channelCount: 1, echoCancellation: true, noiseSuppression: true },
        video: false,
      });
      streamRef.current = stream;
      chunksRef.current = [];
      stopRequestedRef.current = false;
      const recorder = new MediaRecorder(stream, { mimeType: selectedMime, audioBitsPerSecond: 96_000 });
      recorderRef.current = recorder;
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };
      recorder.onerror = () => {
        stopTracks();
        setError(t.stoppedUnexpectedly);
        setStep("error");
      };
      recorder.onstop = () => {
        stopTracks();
        const durationMs = Math.min(VOICE_MESSAGE_MAX_DURATION_MS, Date.now() - startedAtRef.current);
        const mime = baseMime(recorder.mimeType || selectedMime);
        const blob = new Blob(chunksRef.current, { type: mime });
        if (durationMs < VOICE_MESSAGE_MIN_DURATION_MS || blob.size === 0) {
          setError(t.tooShort);
          setStep("error");
          return;
        }
        if (blob.size > VOICE_MESSAGE_MAX_BYTES) {
          setError(t.tooLarge);
          setStep("error");
          return;
        }
        clearRecording();
        setRecording({ blob, url: URL.createObjectURL(blob), mime, durationMs });
        setElapsedMs(durationMs);
        setStep("preview");
      };
      startedAtRef.current = Date.now();
      recorder.start(1000);
      setElapsedMs(0);
      setStep("recording");
    } catch (recordingError) {
      stopTracks();
      const denied = recordingError instanceof DOMException && recordingError.name === "NotAllowedError";
      setError(denied
        ? t.micDenied
        : t.micUnavailable);
      setStep("error");
    }
  }

  function stopRecording() {
    if (recorderRef.current?.state !== "recording") return;
    stopRequestedRef.current = true;
    recorderRef.current.stop();
  }

  function recordAgain() {
    clearRecording();
    setError(null);
    setStep("intro");
  }

  async function uploadRecording() {
    if (!recording || !termsAccepted) return;
    setStep("uploading");
    setProgress(4);
    setError(null);
    try {
      const sessionResponse = await fetch(`/api/v1/events/${encodeURIComponent(eventSlug)}/upload-sessions`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ guestId }),
      });
      if (!sessionResponse.ok) throw await responseError(sessionResponse, t.unavailable);
      const { token } = await sessionResponse.json() as { token: string };
      const prepared = await fetch(`/api/v1/upload-sessions/${encodeURIComponent(token)}/voice-messages`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          mime: recording.mime,
          sizeBytes: recording.blob.size,
          durationMs: recording.durationMs,
          publicationConsent: allowPublishing,
          termsAccepted: true,
          consentVersion: CURRENT_UPLOAD_CONSENT_VERSION,
        }),
      });
      if (!prepared.ok) throw await responseError(prepared, t.prepareFailed);
      const { messageId, uploadUrl } = await prepared.json() as { messageId: string; uploadUrl: string };
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("PUT", uploadUrl);
        xhr.setRequestHeader("content-type", recording.mime);
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) setProgress(Math.min(96, Math.round((event.loaded / event.total) * 100)));
        };
        xhr.onload = () => xhr.status >= 200 && xhr.status < 300 ? resolve() : reject(new Error(t.transferFailed));
        xhr.onerror = () => reject(new Error(t.networkError));
        xhr.send(recording.blob);
      });
      const completed = await fetch(`/api/v1/upload-sessions/${encodeURIComponent(token)}/voice-messages/${encodeURIComponent(messageId)}/complete`, { method: "POST" });
      if (!completed.ok) throw await responseError(completed, t.completeFailed);
      setProgress(100);
      setStep("success");
      onSubmitted();
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : t.transferFailed);
      setStep("error");
    }
  }

  const dialog = dialogMounted ? (
        <div className={`${styles.backdrop} ${dialogClosing ? styles.closing : ""}`} onMouseDown={(event) => { if (event.target === event.currentTarget) closeDialog(); }}>
          <div ref={dialogRef} className={styles.dialog} role="dialog" aria-modal="true" aria-labelledby="voice-dialog-title" tabIndex={-1}>
            <button className={styles.close} type="button" onClick={closeDialog} disabled={step === "uploading"} aria-label={t.close}>×</button>
            <span className={styles.dialogIcon}><MicrophoneIcon /></span>
            <p className={styles.eyebrow}>{t.eyebrow}</p>
            <h2 id="voice-dialog-title">{t.title}</h2>

            {step === "intro" ? <>
              <p>{t.introText}</p>
              <button className={styles.recordButton} type="button" onClick={() => void startRecording()}><MicrophoneIcon /><span>{t.startRecording}</span></button>
              <small>{t.maxLength}</small>
            </> : null}

            {step === "recording" ? <>
              <div className={styles.waveform} aria-hidden="true">{Array.from({ length: 22 }, (_, index) => <i key={index} />)}</div>
              <strong className={styles.timer}>{formatDuration(elapsedMs)}</strong>
              <span className={styles.recordingLabel}>{t.recording}</span>
              <button className={styles.stopButton} type="button" onClick={stopRecording} aria-label={t.stopRecording}><i /></button>
            </> : null}

            {step === "preview" && recording ? <>
              <p>{t.listenFirst}</p>
              <audio className={styles.audioPreview} src={recording.url} controls preload="metadata">{t.cannotPlayRecording}</audio>
              <span className={styles.duration}>{formatDuration(recording.durationMs)}</span>
              <label className={styles.choice}><input type="checkbox" checked={allowPublishing} onChange={(event) => setAllowPublishing(event.target.checked)} /><span><strong>{t.publishLabel}</strong><small>{t.publishHint}</small></span></label>
              <label className={styles.choice}><input type="checkbox" checked={termsAccepted} onChange={(event) => setTermsAccepted(event.target.checked)} /><span><strong>{t.termsLabel}</strong><small>{t.consentPrefix} <Link href={termsPath(locale)} target="_blank">{t.termsWord}</Link> {t.consentMiddle} <Link href={privacyPath(locale)} target="_blank">{t.privacyWord}</Link>.</small></span></label>
              <div className={styles.previewActions}><button type="button" onClick={recordAgain}>{t.recordAgain}</button><button type="button" onClick={() => void uploadRecording()} disabled={!termsAccepted}>{t.sendMessage}</button></div>
            </> : null}

            {step === "uploading" ? <div className={styles.status} aria-live="polite"><span className={styles.spinner} /><h3>{t.sending}</h3><div className={styles.progress} role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}><i style={{ width: `${progress}%` }} /></div><p>{progress} %</p></div> : null}
            {step === "success" ? <div className={styles.status} aria-live="polite"><span className={styles.success}>✓</span><h3>{t.sent}</h3><p>{allowPublishing ? t.sentPublic : t.sentPrivate}</p><button type="button" onClick={closeDialog}>{t.done}</button></div> : null}
            {step === "error" ? <div className={styles.status} role="alert"><span className={styles.errorIcon}>!</span><h3>{t.errorTitle}</h3><p>{error}</p><div className={styles.previewActions}>{recording ? <button type="button" onClick={() => setStep("preview")}>{t.backToPreview}</button> : null}<button type="button" onClick={() => { setError(null); setStep("intro"); }}>{t.tryAgain}</button></div></div> : null}
          </div>
        </div>
  ) : null;

  if (hideEntryCard) return dialog;

  return (
    <section className={styles.entryCard} id="glasovno-vosicilo" aria-labelledby="voice-entry-title">
      <span className={styles.entryIcon}><MicrophoneIcon /></span>
      <div>
        <p>{t.entryEyebrow}</p>
        <h2 id="voice-entry-title">{t.entryTitle}</h2>
        <span>{t.entryHint}</span>
      </div>
      <button type="button" onClick={() => setOpen(true)}>
        <MicrophoneIcon /> {t.entryCta}
      </button>
      {dialog}
    </section>
  );
}

export function VoiceGuestbook({ eventSlug, refreshKey, embedded, onCountChange }: {
  eventSlug: string;
  refreshKey: number;
  /** Drops the standalone card chrome and heading, for use inside the gallery tabs. */
  embedded?: boolean;
  onCountChange?: (count: number) => void;
}) {
  const locale = useLocale();
  const t = getDictionary(locale).guest.voice;
  const [messages, setMessages] = useState<Array<{ publicId: string; displayName: string | null; durationMs: number; playbackUrl: string }>>([]);
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");
  const countChange = useRef(onCountChange);
  useEffect(() => { countChange.current = onCountChange; }, [onCountChange]);

  async function load() {
    try {
      const response = await fetch(`/api/v1/events/${encodeURIComponent(eventSlug)}/voice-messages`, { cache: "no-store" });
      if (!response.ok) throw new Error();
      const body = await response.json() as { messages: typeof messages };
      setMessages(body.messages);
      setState("ready");
      countChange.current?.(body.messages.length);
    } catch {
      setState("error");
    }
  }

  useEffect(() => {
    let active = true;
    fetch(`/api/v1/events/${encodeURIComponent(eventSlug)}/voice-messages`, { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) throw new Error();
        return response.json() as Promise<{ messages: typeof messages }>;
      })
      .then((body) => {
        if (!active) return;
        setMessages(body.messages);
        setState("ready");
        countChange.current?.(body.messages.length);
      })
      .catch(() => { if (active) setState("error"); });
    return () => { active = false; };
  }, [eventSlug, refreshKey]);

  const shellClass = embedded ? styles.guestbookEmbedded : styles.guestbook;
  const heading = embedded ? null : <div className={styles.guestbookHeading}><p>{t.entryEyebrow}</p><h2 id="voice-guestbook-title">{t.guestbookHeading}</h2>{state === "ready" && messages.length ? <span>{pluralCount(locale, messages.length, t.messageCount)}</span> : null}</div>;

  if (state === "loading") return <section className={shellClass}>{heading}<div className={styles.skeleton} aria-label={t.loadingList} /></section>;
  if (state === "error") return <section className={shellClass}>{heading}<div className={styles.guestbookError} role="alert"><span>{t.loadError}</span><button type="button" onClick={() => { setState("loading"); void load(); }}>{t.tryAgain}</button></div></section>;
  if (!messages.length) return embedded ? <section className={shellClass}><p className={styles.guestbookEmpty}>{t.emptyList}</p></section> : null;

  return <section className={shellClass} aria-labelledby={embedded ? undefined : "voice-guestbook-title"}>{heading}<div className={styles.messageList}>{messages.map((message, index) => <article className={styles.message} key={message.publicId}><span className={styles.avatar}>{(message.displayName ?? t.guest).slice(0, 1).toUpperCase()}</span><div><strong>{message.displayName ?? t.guest}</strong><small>{`${t.messageLabel.replace("{number}", String(messages.length - index))} · ${formatDuration(message.durationMs)}`}</small><audio controls preload="none" src={message.playbackUrl}>{t.cannotPlayMessage}</audio></div></article>)}</div></section>;
}
