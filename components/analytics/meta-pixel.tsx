"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { isGuestMosaicTrackingHostname, isOptionalTrackingPathname } from "@/lib/client/tracking-consent";
import { useTrackingConsent } from "./use-tracking-consent";

const META_PIXEL_ID = "1024314580235586";
const META_PIXEL_SCRIPT_URL = "https://connect.facebook.net/en_US/fbevents.js";

type MetaPixelCommand = {
  (...args: unknown[]): void;
  callMethod?: (...args: unknown[]) => void;
  loaded: boolean;
  push: MetaPixelCommand;
  queue: unknown[][];
  version: string;
};

declare global {
  interface Window {
    _fbq?: MetaPixelCommand;
    fbq?: MetaPixelCommand;
    guestMosaicMetaPixelInitialized?: boolean;
  }
}

export function isMetaPixelHostname(hostname: string): boolean {
  return isGuestMosaicTrackingHostname(hostname);
}

function initializeMetaPixel(): void {
  if (window.guestMosaicMetaPixelInitialized) return;

  if (!window.fbq) {
    const fbq = ((...args: unknown[]) => {
      if (fbq.callMethod) fbq.callMethod(...args);
      else fbq.queue.push(args);
    }) as MetaPixelCommand;
    fbq.loaded = true;
    fbq.push = fbq;
    fbq.queue = [];
    fbq.version = "2.0";
    window.fbq = fbq;
    window._fbq ??= fbq;

    const script = document.createElement("script");
    script.async = true;
    script.src = META_PIXEL_SCRIPT_URL;
    document.head.appendChild(script);
  }

  window.fbq("init", META_PIXEL_ID);
  window.guestMosaicMetaPixelInitialized = true;
}

export function MetaPixel(): null {
  const pathname = usePathname();
  const consent = useTrackingConsent("marketing");

  useEffect(() => {
    if (!consent || !isMetaPixelHostname(window.location.hostname) || !isOptionalTrackingPathname(pathname)) return;

    initializeMetaPixel();
    window.fbq?.("track", "PageView");
  }, [consent, pathname]);

  return null;
}
