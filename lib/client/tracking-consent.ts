export const TRACKING_CONSENT_VERSION = "2026-08-13";
export const TRACKING_CONSENT_STORAGE_KEY = "guestmosaic_tracking_consent";
export const TRACKING_CONSENT_COOKIE = "guestmosaic_tracking_consent";

export type TrackingConsentCategory = "analytics" | "marketing";

export type TrackingConsent = {
  analytics: boolean;
  marketing: boolean;
  updatedAt: string;
  version: typeof TRACKING_CONSENT_VERSION;
};

export function isGuestMosaicTrackingHostname(hostname: string): boolean {
  return hostname.trim().toLowerCase() === "guestmosaic.com";
}

export function isGuestMosaicConsentHostname(hostname: string): boolean {
  const normalized = hostname.trim().toLowerCase();
  return normalized === "guestmosaic.com" || normalized === "en.localhost";
}

const SENSITIVE_PATH_PREFIXES = [
  "/admin",
  "/display/",
  "/downloads/",
  "/e/",
  "/login",
  "/nakup/uspesen",
  "/prenosi/",
  "/qr/",
] as const;

export function isOptionalTrackingPathname(pathname: string): boolean {
  const normalized = pathname.startsWith("/") ? pathname.toLowerCase() : `/${pathname.toLowerCase()}`;
  const withoutLocale = normalized.replace(/^\/(de|nl|es|it|fr)(?=\/|$)/, "") || "/";
  return !SENSITIVE_PATH_PREFIXES.some((prefix) => (
    prefix.endsWith("/") ? withoutLocale.startsWith(prefix) : withoutLocale === prefix || withoutLocale.startsWith(`${prefix}/`)
  ));
}

export function parseTrackingConsent(value: string | null | undefined): TrackingConsent | null {
  if (!value) return null;

  try {
    const parsed = JSON.parse(value) as Partial<TrackingConsent>;
    if (
      parsed.version !== TRACKING_CONSENT_VERSION
      || typeof parsed.analytics !== "boolean"
      || typeof parsed.marketing !== "boolean"
      || typeof parsed.updatedAt !== "string"
      || Number.isNaN(Date.parse(parsed.updatedAt))
    ) return null;

    return parsed as TrackingConsent;
  } catch {
    return null;
  }
}

function consentCookieValue(): string | null {
  const prefix = `${TRACKING_CONSENT_COOKIE}=`;
  for (const part of document.cookie.split(";")) {
    const cookie = part.trim();
    if (cookie.startsWith(prefix)) return decodeURIComponent(cookie.slice(prefix.length));
  }
  return null;
}

export function readTrackingConsent(): TrackingConsent | null {
  const stored = parseTrackingConsent(window.localStorage.getItem(TRACKING_CONSENT_STORAGE_KEY));
  if (stored) return stored;
  return parseTrackingConsent(consentCookieValue());
}

export function saveTrackingConsent(input: Pick<TrackingConsent, "analytics" | "marketing">): TrackingConsent {
  const consent: TrackingConsent = {
    ...input,
    updatedAt: new Date().toISOString(),
    version: TRACKING_CONSENT_VERSION,
  };
  const serialized = JSON.stringify(consent);
  window.localStorage.setItem(TRACKING_CONSENT_STORAGE_KEY, serialized);
  document.cookie = `${TRACKING_CONSENT_COOKIE}=${encodeURIComponent(serialized)}; Path=/; Max-Age=15552000; SameSite=Lax; Secure`;
  document.cookie = input.analytics
    ? "__ls_optout=; Path=/; Max-Age=0; SameSite=Lax; Secure"
    : "__ls_optout=1; Path=/; Max-Age=15552000; SameSite=Lax; Secure";
  if (!input.marketing) {
    document.cookie = "_fbp=; Path=/; Max-Age=0; SameSite=Lax; Secure";
    document.cookie = "_fbc=; Path=/; Max-Age=0; SameSite=Lax; Secure";
  }
  return consent;
}

export function hasTrackingConsent(category: TrackingConsentCategory): boolean {
  return readTrackingConsent()?.[category] === true;
}
