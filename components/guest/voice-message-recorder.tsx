"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
import { addLocalDemoMedia, localDemoMediaUrl, useLocalDemoMedia } from "@/lib/demo/local-media";
import { useDialogTransition } from "@/lib/client/use-dialog-transition";
import { cn } from "@/lib/utils";

const MIME_CANDIDATES = ["audio/webm;codecs=opus", "audio/mp4", "audio/ogg;codecs=opus"];

type RecorderStep = "intro" | "recording" | "preview" | "uploading" | "success" | "error";

const micIconClass = "w-6 fill-none stroke-current [stroke-linecap:round] [stroke-linejoin:round] [stroke-width:1.8]";
const eyebrowClass = "m-0 mb-[3px] text-[11px] font-[850] tracking-[.12em] text-[#c42668] uppercase";
const circleIconClass = "grid size-[54px] place-items-center rounded-full bg-[#fbe2ec] text-[#d92d72]";
const pillButtonClass =
  "inline-flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-full border-0 bg-[#d92d72] px-[18px] text-[13px] font-extrabold text-white [font-family:inherit]";
const dialogTextClass = "mx-auto mb-[22px] max-w-[390px] leading-[1.55] text-[#766069]";
const choiceClass = "flex cursor-pointer gap-[11px] border-t border-[#eee3e7] py-[13px] text-left";
const choiceInputClass = "mt-0.5 size-[19px] flex-none accent-[#d92d72]";
const choiceNoteClass = "mt-[3px] block text-[11px]/[1.45] text-[#806b73]";
const choiceLinkClass = "text-[#bd1f60]! underline!";
const previewActionsClass = "mt-5 grid grid-cols-2 gap-2.5";
const previewButtonClass =
  "min-h-[50px] cursor-pointer rounded-[14px] border border-[#dfcdd4] bg-white text-[13px] font-extrabold text-[#563845] [font-family:inherit] disabled:cursor-not-allowed disabled:opacity-45";
const previewButtonPrimaryClass = "border-[#d92d72] bg-[#d92d72] text-white";
const statusClass = "pt-7 pb-2";
const statusTitleClass = "mt-4 mb-2 text-[22px]";
const statusTextClass = "mx-auto mb-[18px] leading-[1.5] text-[#806b73]";
const statusBadgeClass =
  "mx-auto grid size-[58px] place-items-center rounded-full bg-[#e4f7ed] text-[28px] font-[850] text-[#16844b]";

function MicrophoneIcon() {
  return <svg className={micIconClass} viewBox="0 0 24 24" aria-hidden="true"><rect x="9" y="3" width="6" height="11" rx="3" /><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21M9 21h6" /></svg>;
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
  localOnly = false,
}: {
  eventSlug: string;
  guestId: string;
  onSubmitted: () => void;
  /** Renders only the dialog, for when the trigger lives somewhere else (the upload card). */
  hideEntryCard?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Demo mode: the recording stays on the visitor's device instead of being sent. */
  localOnly?: boolean;
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
    if (localOnly) {
      try {
        await addLocalDemoMedia({
          kind: "voice",
          mime: recording.mime,
          filename: `${t.title}.${recording.mime.includes("mp4") ? "m4a" : "webm"}`,
          durationMs: recording.durationMs,
          blob: recording.blob,
          poster: null,
        });
        setProgress(100);
        setStep("success");
        onSubmitted();
      } catch {
        setError(t.transferFailed);
        setStep("error");
      }
      return;
    }
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
        <div className={cn("fixed inset-0 z-[55] grid place-items-center bg-[rgba(21,10,15,.72)] p-1.5 backdrop-blur-lg animate-[dialog-backdrop-in_.2s_ease_both] md:p-[18px] motion-reduce:animate-none", dialogClosing && "pointer-events-none animate-[dialog-backdrop-out_.2s_ease_both]")} onMouseDown={(event) => { if (event.target === event.currentTarget) closeDialog(); }}>
          <div ref={dialogRef} className={cn("relative max-h-[calc(100dvh-12px)] w-[min(100%,520px)] self-end overflow-y-auto rounded-[28px_28px_10px_10px] bg-white px-5 pt-[30px] pb-6 text-center text-plum shadow-[0_30px_90px_rgba(20,7,13,.34)] animate-[dialog-sheet-in_.26s_cubic-bezier(.22,1,.36,1)_both] focus:outline-none focus-visible:outline-3 focus-visible:outline-offset-[3px] focus-visible:outline-[#f59cbd] md:max-h-[calc(100dvh-36px)] md:self-auto md:rounded-[28px] md:p-[34px] md:animate-[dialog-pop-in_.26s_cubic-bezier(.22,1,.36,1)_both] motion-reduce:animate-none", dialogClosing && "animate-[dialog-sheet-out_.2s_cubic-bezier(.4,0,1,1)_both] md:animate-[dialog-pop-out_.2s_cubic-bezier(.4,0,1,1)_both]")} role="dialog" aria-modal="true" aria-labelledby="voice-dialog-title" tabIndex={-1}>
            <button className="absolute top-3 right-3 size-11 cursor-pointer rounded-full border-0 bg-[#f6eef1] text-[26px] text-[#5e4650]" type="button" onClick={closeDialog} disabled={step === "uploading"} aria-label={t.close}>×</button>
            <span className={cn(circleIconClass, "mx-auto mt-1 mb-3.5 size-[62px]")}><MicrophoneIcon /></span>
            <p className={eyebrowClass}>{t.eyebrow}</p>
            <h2 className="m-0 mb-2.5 text-[30px] tracking-[-.035em]" id="voice-dialog-title">{t.title}</h2>

            {step === "intro" ? <>
              <p className={dialogTextClass}>{t.introText}</p>
              <button className="mx-auto mt-2 mb-3.5 flex size-[136px] cursor-pointer flex-col items-center justify-center gap-2.5 rounded-full border-[10px] border-[#fde5ee] bg-[#dd3278] text-[13px] font-extrabold text-white shadow-[0_12px_30px_rgba(217,45,114,.25)] [font-family:inherit] md:size-[150px]" type="button" onClick={() => void startRecording()}><MicrophoneIcon /><span>{t.startRecording}</span></button>
              <small className="block text-[12px] text-[#927e86]">{t.maxLength}</small>
            </> : null}

            {step === "recording" ? <>
              <div className="mx-auto mt-[26px] mb-2.5 flex h-[74px] items-center justify-center gap-1 overflow-hidden" aria-hidden="true">{Array.from({ length: 22 }, (_, index) => {
                const position = index + 1;
                return <i className={cn("w-[3px] animate-voice-wave rounded-[9px] bg-[#dc3278] motion-reduce:animate-none", position % 3 === 0 ? "h-11 [animation-delay:-.3s]" : position % 4 === 0 ? "h-7 [animation-delay:-.55s]" : "h-[18px]")} key={index} />;
              })}</div>
              <strong className="block text-[42px] tracking-[-.04em] tabular-nums">{formatDuration(elapsedMs)}</strong>
              <span className="mt-1 mb-5 block text-[13px] font-[750] text-[#d92d72]">{t.recording}</span>
              <button className="size-[82px] cursor-pointer rounded-full border-[10px] border-[#fee7e7] bg-[#e33b45]" type="button" onClick={stopRecording} aria-label={t.stopRecording}><i className="m-auto block size-6 rounded-[5px] bg-white" /></button>
            </> : null}

            {step === "preview" && recording ? <>
              <p className={dialogTextClass}>{t.listenFirst}</p>
              <audio className="mt-0.5 mb-1 w-full accent-[#d92d72]" src={recording.url} controls preload="metadata">{t.cannotPlayRecording}</audio>
              <span className="mb-[18px] block text-[12px] text-[#806b73] tabular-nums">{formatDuration(recording.durationMs)}</span>
              <label className={choiceClass}><input className={choiceInputClass} type="checkbox" checked={allowPublishing} onChange={(event) => setAllowPublishing(event.target.checked)} /><span className="min-w-0"><strong className="block text-[13px]">{t.publishLabel}</strong><small className={choiceNoteClass}>{t.publishHint}</small></span></label>
              <label className={choiceClass}><input className={choiceInputClass} type="checkbox" checked={termsAccepted} onChange={(event) => setTermsAccepted(event.target.checked)} /><span className="min-w-0"><strong className="block text-[13px]">{t.termsLabel}</strong><small className={choiceNoteClass}>{t.consentPrefix} <Link className={choiceLinkClass} href={termsPath(locale)} target="_blank">{t.termsWord}</Link> {t.consentMiddle} <Link className={choiceLinkClass} href={privacyPath(locale)} target="_blank">{t.privacyWord}</Link>.</small></span></label>
              <div className={previewActionsClass}><button className={previewButtonClass} type="button" onClick={recordAgain}>{t.recordAgain}</button><button className={cn(previewButtonClass, previewButtonPrimaryClass)} type="button" onClick={() => void uploadRecording()} disabled={!termsAccepted}>{t.sendMessage}</button></div>
            </> : null}

            {step === "uploading" ? <div className={statusClass} aria-live="polite"><span className="mx-auto block size-[54px] animate-spin rounded-full border-[5px] border-[#f5dbe5] border-t-[#d92d72] motion-reduce:animate-none" /><h3 className={statusTitleClass}>{t.sending}</h3><div className="mt-[22px] mb-[7px] h-2 overflow-hidden rounded-[99px] bg-[#f1e6ea]" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}><i className="block h-full rounded-[inherit] bg-[#d92d72] transition-[width] duration-150 ease-linear motion-reduce:transition-none" style={{ width: `${progress}%` }} /></div><p className={statusTextClass}>{progress} %</p></div> : null}
            {step === "success" ? <div className={statusClass} aria-live="polite"><span className={statusBadgeClass}>✓</span><h3 className={statusTitleClass}>{t.sent}</h3><p className={statusTextClass}>{localOnly ? t.localOnlyNote : allowPublishing ? t.sentPublic : t.sentPrivate}</p><button className={pillButtonClass} type="button" onClick={closeDialog}>{t.done}</button></div> : null}
            {step === "error" ? <div className={statusClass} role="alert"><span className={cn(statusBadgeClass, "bg-[#fee8e8] text-[#c9343c]")}>!</span><h3 className={statusTitleClass}>{t.errorTitle}</h3><p className={statusTextClass}>{error}</p><div className={previewActionsClass}>{recording ? <button className={previewButtonClass} type="button" onClick={() => setStep("preview")}>{t.backToPreview}</button> : null}<button className={cn(previewButtonClass, previewButtonPrimaryClass)} type="button" onClick={() => { setError(null); setStep("intro"); }}>{t.tryAgain}</button></div></div> : null}
          </div>
        </div>
  ) : null;

  if (hideEntryCard) return dialog;

  return (
    <section className="mx-3.5 mt-[18px] grid max-w-[760px] grid-cols-[auto_1fr] items-center gap-4 rounded-3xl border border-[#ead7df] bg-[linear-gradient(135deg,#fff_0%,#fff7fa_100%)] p-[18px] text-plum shadow-[0_18px_45px_rgba(83,34,53,.08)] md:mx-auto md:grid-cols-[auto_1fr_auto] md:p-[22px]" id="glasovno-vosicilo" aria-labelledby="voice-entry-title">
      <span className={circleIconClass}><MicrophoneIcon /></span>
      <div>
        <p className={eyebrowClass}>{t.entryEyebrow}</p>
        <h2 className="m-0 text-[21px] tracking-[-.025em]" id="voice-entry-title">{t.entryTitle}</h2>
        <span className="mt-1 block text-[13px] text-[#806b73]">{t.entryHint}</span>
      </div>
      <button className={cn(pillButtonClass, "col-span-full w-full md:col-auto md:w-auto")} type="button" onClick={() => setOpen(true)}>
        <MicrophoneIcon /> {t.entryCta}
      </button>
      {dialog}
    </section>
  );
}

export function VoiceGuestbook({ eventSlug, refreshKey, embedded, onCountChange, localOnly = false }: {
  eventSlug: string;
  refreshKey: number;
  /** Drops the standalone card chrome and heading, for use inside the gallery tabs. */
  embedded?: boolean;
  onCountChange?: (count: number) => void;
  /** Demo mode: lists the recordings stored on this device. */
  localOnly?: boolean;
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

  const localMessages = useLocalDemoMedia("voice");
  const localList = useMemo(() => localMessages.map((message) => ({
    publicId: message.id,
    displayName: null as string | null,
    durationMs: message.durationMs ?? 0,
    playbackUrl: localDemoMediaUrl(message.id, message.blob),
  })), [localMessages]);
  const visibleMessages = localOnly ? localList : messages;
  const visibleState = localOnly ? "ready" as const : state;

  useEffect(() => {
    if (localOnly) countChange.current?.(localList.length);
  }, [localList, localOnly]);

  useEffect(() => {
    if (localOnly) return;
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
  }, [eventSlug, localOnly, refreshKey]);

  const shellClass = embedded
    ? "m-0 p-0"
    : "mx-3.5 mb-[38px] max-w-[1100px] rounded-[28px] border border-[#eadce1] bg-[#fff9fb] px-3.5 py-5 md:mx-auto md:p-7";
  const heading = embedded ? null : <div className="mb-[18px] flex flex-wrap items-baseline gap-3"><p className={cn(eyebrowClass, "w-full")}>{t.entryEyebrow}</p><h2 className="m-0 text-[26px] text-plum" id="voice-guestbook-title">{t.guestbookHeading}</h2>{visibleState === "ready" && visibleMessages.length ? <span className="text-[12px] text-[#8b747d]">{pluralCount(locale, visibleMessages.length, t.messageCount)}</span> : null}</div>;

  if (visibleState === "loading") return <section className={shellClass}>{heading}<div className="h-[84px] animate-[shimmer_1.2s_infinite] rounded-[18px] bg-[linear-gradient(90deg,#f4e9ed,#fff,#f4e9ed)] bg-[length:200%_100%] motion-reduce:animate-none" aria-label={t.loadingList} /></section>;
  if (visibleState === "error") return <section className={shellClass}>{heading}<div className="flex items-center justify-between gap-3 text-[#93404e]" role="alert"><span>{t.loadError}</span><button className="min-h-11 cursor-pointer rounded-full border border-[#dcbec9] bg-white px-[15px] font-[750] text-inherit" type="button" onClick={() => { setState("loading"); void load(); }}>{t.tryAgain}</button></div></section>;
  if (!visibleMessages.length) return embedded ? <section className={shellClass}><p className="mx-auto my-6 rounded-2xl border border-dashed border-[#ddcfd4] px-[18px] py-6 text-center text-[#705f66]">{t.emptyList}</p></section> : null;

  return <section className={shellClass} aria-labelledby={embedded ? undefined : "voice-guestbook-title"}>{heading}<div className="grid gap-2.5 md:grid-cols-[repeat(2,minmax(0,1fr))]">{visibleMessages.map((message, index) => <article className="flex min-w-0 gap-3 rounded-[18px] border border-[#eadce1] bg-white p-[15px]" key={message.publicId}><span className="grid size-[42px] flex-none place-items-center rounded-full bg-[#f7dce7] font-[850] text-[#b7205d]">{(message.displayName ?? t.guest).slice(0, 1).toUpperCase()}</span><div className="min-w-0 flex-1"><strong className="block overflow-hidden text-[13px] text-ellipsis whitespace-nowrap text-[#4b2434]">{message.displayName ?? t.guest}</strong><small className="mt-0.5 mb-2 block text-[10px] text-[#8b747d]">{`${t.messageLabel.replace("{number}", String(visibleMessages.length - index))} · ${formatDuration(message.durationMs)}`}</small><audio className="h-[34px] w-full accent-[#d92d72]" controls preload="none" src={message.playbackUrl}>{t.cannotPlayMessage}</audio></div></article>)}</div></section>;
}
