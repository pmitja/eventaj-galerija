"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useLocale } from "@/components/i18n/locale-provider";
import { privacyPath, termsPath } from "@/lib/i18n/routes";
import { CURRENT_UPLOAD_CONSENT_VERSION } from "@/lib/domain/legal";
import {
  VOICE_MESSAGE_MAX_BYTES,
  VOICE_MESSAGE_MAX_DURATION_MS,
  VOICE_MESSAGE_MIN_DURATION_MS,
  type VoiceMessageMime,
} from "@/lib/domain/voice-messages";
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
}: {
  eventSlug: string;
  guestId: string;
  onSubmitted: () => void;
}) {
  const locale = useLocale();
  const en = locale === "en";
  const [open, setOpen] = useState(false);
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
  }, [open, step]);

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
      setError(en ? "Voice recording is not supported by this browser." : "Ta brskalnik ne podpira snemanja glasu.");
      setStep("error");
      return;
    }
    const selectedMime = MIME_CANDIDATES.find((mime) => MediaRecorder.isTypeSupported(mime));
    if (!selectedMime) {
      setError(en ? "This browser does not support a compatible audio format." : "Brskalnik ne podpira združljivega zvočnega formata.");
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
        setError(en ? "Recording stopped unexpectedly. Please try again." : "Snemanje se je nepričakovano ustavilo. Poskusi znova.");
        setStep("error");
      };
      recorder.onstop = () => {
        stopTracks();
        const durationMs = Math.min(VOICE_MESSAGE_MAX_DURATION_MS, Date.now() - startedAtRef.current);
        const mime = baseMime(recorder.mimeType || selectedMime);
        const blob = new Blob(chunksRef.current, { type: mime });
        if (durationMs < VOICE_MESSAGE_MIN_DURATION_MS || blob.size === 0) {
          setError(en ? "The recording is too short. Record at least one second." : "Posnetek je prekratek. Posnemi vsaj eno sekundo.");
          setStep("error");
          return;
        }
        if (blob.size > VOICE_MESSAGE_MAX_BYTES) {
          setError(en ? "The recording is too large. Try a shorter message." : "Posnetek je prevelik. Poskusi s krajšim voščilom.");
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
        ? (en ? "Microphone access was denied. Allow it in your browser settings and try again." : "Dostop do mikrofona je zavrnjen. Dovoli ga v nastavitvah brskalnika in poskusi znova.")
        : (en ? "The microphone is currently unavailable." : "Mikrofon trenutno ni na voljo."));
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
      if (!sessionResponse.ok) throw await responseError(sessionResponse, en ? "Uploads are currently unavailable." : "Nalaganje trenutno ni na voljo.");
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
      if (!prepared.ok) throw await responseError(prepared, en ? "The voice message could not be prepared." : "Glasovnega voščila ni bilo mogoče pripraviti.");
      const { messageId, uploadUrl } = await prepared.json() as { messageId: string; uploadUrl: string };
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("PUT", uploadUrl);
        xhr.setRequestHeader("content-type", recording.mime);
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) setProgress(Math.min(96, Math.round((event.loaded / event.total) * 100)));
        };
        xhr.onload = () => xhr.status >= 200 && xhr.status < 300 ? resolve() : reject(new Error(en ? "The upload failed." : "Prenos ni uspel."));
        xhr.onerror = () => reject(new Error(en ? "Network error." : "Omrežna napaka."));
        xhr.send(recording.blob);
      });
      const completed = await fetch(`/api/v1/upload-sessions/${encodeURIComponent(token)}/voice-messages/${encodeURIComponent(messageId)}/complete`, { method: "POST" });
      if (!completed.ok) throw await responseError(completed, en ? "The upload could not be completed." : "Zaključevanje prenosa ni uspelo.");
      setProgress(100);
      setStep("success");
      onSubmitted();
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : (en ? "The upload failed." : "Nalaganje ni uspelo."));
      setStep("error");
    }
  }

  return (
    <section className={styles.entryCard} id="glasovno-vosicilo" aria-labelledby="voice-entry-title">
      <span className={styles.entryIcon}><MicrophoneIcon /></span>
      <div>
        <p>{en ? "Audio guestbook" : "Audio knjiga gostov"}</p>
        <h2 id="voice-entry-title">{en ? "Leave a voice message" : "Pusti glasovno voščilo"}</h2>
        <span>{en ? "Record up to 2 minutes — no app needed." : "Posnemi do 2 minuti — brez aplikacije."}</span>
      </div>
      <button type="button" onClick={() => { setOpen(true); setStep(recording ? "preview" : "intro"); }}>
        <MicrophoneIcon /> {en ? "Record message" : "Posnemi voščilo"}
      </button>

      {open ? (
        <div className={styles.backdrop} onMouseDown={(event) => { if (event.target === event.currentTarget) closeDialog(); }}>
          <div ref={dialogRef} className={styles.dialog} role="dialog" aria-modal="true" aria-labelledby="voice-dialog-title" tabIndex={-1}>
            <button className={styles.close} type="button" onClick={closeDialog} disabled={step === "uploading"} aria-label={en ? "Close" : "Zapri"}>×</button>
            <span className={styles.dialogIcon}><MicrophoneIcon /></span>
            <p className={styles.eyebrow}>{en ? "A memory in your voice" : "Spomin v tvojem glasu"}</p>
            <h2 id="voice-dialog-title">{en ? "Voice message" : "Glasovno voščilo"}</h2>

            {step === "intro" ? <>
              <p>{en ? "Find a quieter spot, then tap the button. Your browser will ask for microphone access." : "Poišči mirnejši kotiček in pritisni gumb. Brskalnik bo prosil za dostop do mikrofona."}</p>
              <button className={styles.recordButton} type="button" onClick={() => void startRecording()}><MicrophoneIcon /><span>{en ? "Start recording" : "Začni snemanje"}</span></button>
              <small>{en ? "Maximum length: 2 minutes" : "Najdaljši posnetek: 2 minuti"}</small>
            </> : null}

            {step === "recording" ? <>
              <div className={styles.waveform} aria-hidden="true">{Array.from({ length: 22 }, (_, index) => <i key={index} />)}</div>
              <strong className={styles.timer}>{formatDuration(elapsedMs)}</strong>
              <span className={styles.recordingLabel}>{en ? "Recording …" : "Snemanje …"}</span>
              <button className={styles.stopButton} type="button" onClick={stopRecording} aria-label={en ? "Stop recording" : "Končaj snemanje"}><i /></button>
            </> : null}

            {step === "preview" && recording ? <>
              <p>{en ? "Listen before sending it." : "Pred pošiljanjem poslušaj posnetek."}</p>
              <audio className={styles.audioPreview} src={recording.url} controls preload="metadata">{en ? "Your browser cannot play this recording." : "Brskalnik ne more predvajati posnetka."}</audio>
              <span className={styles.duration}>{formatDuration(recording.durationMs)}</span>
              <label className={styles.choice}><input type="checkbox" checked={allowPublishing} onChange={(event) => setAllowPublishing(event.target.checked)} /><span><strong>{en ? "Show it in the audio guestbook" : "Prikaži v audio knjigi gostov"}</strong><small>{en ? "Other guests with the gallery link can listen." : "Poslušajo ga lahko drugi gostje s povezavo do galerije."}</small></span></label>
              <label className={styles.choice}><input type="checkbox" checked={termsAccepted} onChange={(event) => setTermsAccepted(event.target.checked)} /><span><strong>{en ? "I may share this recording" : "Posnetek smem deliti"}</strong><small>{en ? <>I accept the <Link href={termsPath(locale)} target="_blank">terms</Link> and <Link href={privacyPath(locale)} target="_blank">privacy policy</Link>.</> : <>Sprejemam <Link href={termsPath(locale)} target="_blank">pogoje</Link> in <Link href={privacyPath(locale)} target="_blank">politiko zasebnosti</Link>.</>}</small></span></label>
              <div className={styles.previewActions}><button type="button" onClick={recordAgain}>{en ? "Record again" : "Posnemi znova"}</button><button type="button" onClick={() => void uploadRecording()} disabled={!termsAccepted}>{en ? "Send message" : "Pošlji voščilo"}</button></div>
            </> : null}

            {step === "uploading" ? <div className={styles.status} aria-live="polite"><span className={styles.spinner} /><h3>{en ? "Sending your message …" : "Pošiljam tvoje voščilo …"}</h3><div className={styles.progress} role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}><i style={{ width: `${progress}%` }} /></div><p>{progress} %</p></div> : null}
            {step === "success" ? <div className={styles.status} aria-live="polite"><span className={styles.success}>✓</span><h3>{en ? "Your message was sent!" : "Voščilo je poslano!"}</h3><p>{allowPublishing ? (en ? "It is now available in the audio guestbook." : "Zdaj je na voljo v audio knjigi gostov.") : (en ? "It was stored privately for the organiser." : "Zasebno je shranjeno za organizatorja.")}</p><button type="button" onClick={closeDialog}>{en ? "Done" : "Končano"}</button></div> : null}
            {step === "error" ? <div className={styles.status} role="alert"><span className={styles.errorIcon}>!</span><h3>{en ? "Something went wrong" : "Nekaj je šlo narobe"}</h3><p>{error}</p><div className={styles.previewActions}>{recording ? <button type="button" onClick={() => setStep("preview")}>{en ? "Back to preview" : "Nazaj na predogled"}</button> : null}<button type="button" onClick={() => { setError(null); setStep("intro"); }}>{en ? "Try again" : "Poskusi znova"}</button></div></div> : null}
          </div>
        </div>
      ) : null}
    </section>
  );
}

export function VoiceGuestbook({ eventSlug, refreshKey }: { eventSlug: string; refreshKey: number }) {
  const locale = useLocale();
  const en = locale === "en";
  const [messages, setMessages] = useState<Array<{ publicId: string; displayName: string | null; durationMs: number; playbackUrl: string }>>([]);
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");

  async function load() {
    try {
      const response = await fetch(`/api/v1/events/${encodeURIComponent(eventSlug)}/voice-messages`, { cache: "no-store" });
      if (!response.ok) throw new Error();
      const body = await response.json() as { messages: typeof messages };
      setMessages(body.messages);
      setState("ready");
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
      })
      .catch(() => { if (active) setState("error"); });
    return () => { active = false; };
  }, [eventSlug, refreshKey]);

  if (state === "loading") return <section className={styles.guestbook}><div className={styles.guestbookHeading}><p>{en ? "Audio guestbook" : "Audio knjiga gostov"}</p><h2>{en ? "Messages from the heart" : "Voščila iz srca"}</h2></div><div className={styles.skeleton} aria-label={en ? "Loading voice messages" : "Nalagam glasovna voščila"} /></section>;
  if (state === "error") return <section className={styles.guestbook}><div className={styles.guestbookHeading}><p>{en ? "Audio guestbook" : "Audio knjiga gostov"}</p><h2>{en ? "Messages from the heart" : "Voščila iz srca"}</h2></div><div className={styles.guestbookError} role="alert"><span>{en ? "Voice messages could not be loaded." : "Glasovnih voščil ni bilo mogoče naložiti."}</span><button type="button" onClick={() => { setState("loading"); void load(); }}>{en ? "Try again" : "Poskusi znova"}</button></div></section>;
  if (!messages.length) return null;

  return <section className={styles.guestbook} aria-labelledby="voice-guestbook-title"><div className={styles.guestbookHeading}><p>{en ? "Audio guestbook" : "Audio knjiga gostov"}</p><h2 id="voice-guestbook-title">{en ? "Messages from the heart" : "Voščila iz srca"}</h2><span>{en ? `${messages.length} voice ${messages.length === 1 ? "message" : "messages"}` : `${messages.length} ${messages.length === 1 ? "glasovno voščilo" : "glasovnih voščil"}`}</span></div><div className={styles.messageList}>{messages.map((message, index) => <article className={styles.message} key={message.publicId}><span className={styles.avatar}>{(message.displayName ?? (en ? "Guest" : "Gost")).slice(0, 1).toUpperCase()}</span><div><strong>{message.displayName ?? (en ? "Guest" : "Gost")}</strong><small>{en ? `Message ${messages.length - index} · ${formatDuration(message.durationMs)}` : `Voščilo ${messages.length - index} · ${formatDuration(message.durationMs)}`}</small><audio controls preload="none" src={message.playbackUrl}>{en ? "Your browser cannot play this message." : "Brskalnik ne more predvajati voščila."}</audio></div></article>)}</div></section>;
}
