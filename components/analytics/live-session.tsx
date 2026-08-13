"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { isGuestMosaicTrackingHostname, isOptionalTrackingPathname } from "@/lib/client/tracking-consent";
import { useTrackingConsent } from "./use-tracking-consent";

const LIVE_SESSION_SCRIPT_URL = "https://cdn.livesession.io/track.js";
const LIVE_SESSION_TRACK_ID = "58d8c373.8d406488";

type LiveSessionCommand = (...args: unknown[]) => void;

declare global {
  interface Window {
    __ls?: LiveSessionCommand & { store?: unknown[][]; v?: string };
    __ls_namespace?: string;
    __ls_script_url?: string;
  }
}

export function isLiveSessionHostname(hostname: string): boolean {
  return isGuestMosaicTrackingHostname(hostname);
}

function initializeLiveSession(): void {
  if (window.__ls) return;

  window.__ls_namespace = "__ls";
  window.__ls_script_url = LIVE_SESSION_SCRIPT_URL;

  const liveSession = ((...args: unknown[]) => {
    liveSession.store?.push(args);
  }) as LiveSessionCommand & { store: unknown[][]; v: string };
  liveSession.store = [];
  liveSession.v = "1.1";
  window.__ls = liveSession;

  const script = document.createElement("script");
  script.async = true;
  script.src = LIVE_SESSION_SCRIPT_URL;
  document.head.appendChild(script);

  liveSession("init", LIVE_SESSION_TRACK_ID, { keystrokes: false });
}

export function LiveSession(): null {
  const pathname = usePathname();
  const consent = useTrackingConsent("analytics");

  useEffect(() => {
    if (!consent || !isLiveSessionHostname(window.location.hostname) || !isOptionalTrackingPathname(pathname)) return;

    initializeLiveSession();
    window.__ls?.("newPageView");
  }, [consent, pathname]);

  return null;
}
