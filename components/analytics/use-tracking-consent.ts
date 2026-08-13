"use client";

import { useSyncExternalStore } from "react";
import { hasTrackingConsent, type TrackingConsentCategory } from "@/lib/client/tracking-consent";

function subscribe(): () => void {
  return () => undefined;
}

export function useTrackingConsent(category: TrackingConsentCategory): boolean {
  return useSyncExternalStore(
    subscribe,
    () => hasTrackingConsent(category),
    () => false,
  );
}
