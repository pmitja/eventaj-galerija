import "server-only";

import { headers } from "next/headers";
import {
  DEFAULT_PUBLIC_APP_URL,
  DEFAULT_PUBLIC_APP_URL_EN,
  appUrlForLocale,
  isLocale,
  localeFromHostname,
  siteUrlForLocale,
  type Locale,
} from "./locale";

export function getPublicAppUrls(): { PUBLIC_APP_URL: string; PUBLIC_APP_URL_EN: string } {
  return {
    PUBLIC_APP_URL: process.env.PUBLIC_APP_URL ?? DEFAULT_PUBLIC_APP_URL,
    PUBLIC_APP_URL_EN: process.env.PUBLIC_APP_URL_EN ?? DEFAULT_PUBLIC_APP_URL_EN,
  };
}

/**
 * The middleware resolves host + path prefix into `x-locale`; the hostname is
 * only a fallback for requests that never passed through it.
 */
export async function getRequestLocale(): Promise<Locale> {
  const requestHeaders = await headers();
  const headerLocale = requestHeaders.get("x-locale");
  if (isLocale(headerLocale)) return headerLocale;

  const hostname = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "";
  return localeFromHostname(hostname.split(",", 1)[0] ?? "", getPublicAppUrls().PUBLIC_APP_URL_EN);
}

export async function getRequestAppUrl(): Promise<string> {
  return appUrlForLocale(getPublicAppUrls(), await getRequestLocale());
}

/** Canonical root for the current locale, including any /de-style prefix. */
export async function getRequestSiteUrl(): Promise<string> {
  return siteUrlForLocale(getPublicAppUrls(), await getRequestLocale());
}
