import "server-only";

import { headers } from "next/headers";
import {
  DEFAULT_PUBLIC_APP_URL,
  DEFAULT_PUBLIC_APP_URL_EN,
  appUrlForLocale,
  localeFromHostname,
  type Locale,
} from "./locale";

export function getPublicAppUrls(): { PUBLIC_APP_URL: string; PUBLIC_APP_URL_EN: string } {
  return {
    PUBLIC_APP_URL: process.env.PUBLIC_APP_URL ?? DEFAULT_PUBLIC_APP_URL,
    PUBLIC_APP_URL_EN: process.env.PUBLIC_APP_URL_EN ?? DEFAULT_PUBLIC_APP_URL_EN,
  };
}

export async function getRequestLocale(): Promise<Locale> {
  const requestHeaders = await headers();
  const hostname = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "";
  return localeFromHostname(hostname.split(",", 1)[0] ?? "", getPublicAppUrls().PUBLIC_APP_URL_EN);
}

export async function getRequestAppUrl(): Promise<string> {
  return appUrlForLocale(getPublicAppUrls(), await getRequestLocale());
}
