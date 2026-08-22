import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { localeFromPathname, type Locale } from "@/lib/i18n/locale";
import {
  localizedMarketingPath,
  slovenianRoutePath,
  solutionPageIdFromPath,
  solutionPagePath,
  type SolutionPageId,
} from "@/lib/i18n/routes";

const CANONICAL_ORIGINS: Readonly<Record<string, string>> = {
  "www.galerija.eventaj.si": "https://galerija.eventaj.si",
  "gallery.eventaj.si": "https://guestmosaic.com",
  "www.gallery.eventaj.si": "https://guestmosaic.com",
  "www.guestmosaic.com": "https://guestmosaic.com",
};

const ENGLISH_HOSTNAMES = new Set([
  "guestmosaic.com",
  "www.guestmosaic.com",
  "gallery.eventaj.si",
  "www.gallery.eventaj.si",
  "en.localhost",
]);

/** Paths that are never marketing pages and must pass through untouched. */
function isInternalPath(pathname: string): boolean {
  return pathname.startsWith("/api/")
    || pathname.startsWith("/_next/")
    || pathname.startsWith("/admin")
    || pathname.startsWith("/login")
    || pathname.startsWith("/qr/");
}

function withMarketingCache(response: NextResponse, request: NextRequest): NextResponse {
  if (request.method !== "GET" && request.method !== "HEAD") return response;
  const internalPath = slovenianRoutePath(request.nextUrl.pathname);
  const cacheable = internalPath === "/"
    || internalPath === "/funkcije"
    || internalPath.startsWith("/za-dogodke/")
    || internalPath.startsWith("/solutions/");
  if (!cacheable) return response;

  // Public marketing HTML has no account- or cookie-specific server content.
  // Let the browser revalidate while Cloudflare/OpenNext can reuse a warm edge
  // response and serve stale content during a background refresh.
  response.headers.set("Cache-Control", "public, max-age=0, s-maxage=300, stale-while-revalidate=86400");
  response.headers.set("CDN-Cache-Control", "public, s-maxage=300, stale-while-revalidate=86400");
  return response;
}

// Keep the deprecated middleware convention until OpenNext supports the
// Node.js runtime used by Next.js 16 proxy.ts. Middleware remains Edge-based.
export function middleware(request: NextRequest) {
  const hostname = (request.headers.get("host") ?? request.nextUrl.hostname)
    .split(":")[0]
    .toLowerCase();

  const isEnglishHost = ENGLISH_HOSTNAMES.has(hostname);
  const canonicalOrigin = CANONICAL_ORIGINS[hostname];
  const redirectOrigin = canonicalOrigin ?? (request.nextUrl.protocol === "http:"
    ? hostname === "guestmosaic.com"
      ? "https://guestmosaic.com"
      : hostname === "galerija.eventaj.si"
        ? "https://galerija.eventaj.si"
        : undefined
    : undefined);
  const currentPath = request.nextUrl.pathname;

  // The English host also serves the prefixed languages (/de, /nl, /es, /it, /fr).
  const locale: Locale = isEnglishHost ? localeFromPathname(currentPath) ?? "en" : "sl";

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-locale", locale);

  if (isInternalPath(currentPath)) {
    if (!redirectOrigin) return NextResponse.next({ request: { headers: requestHeaders } });
    return NextResponse.redirect(
      new URL(`${currentPath}${request.nextUrl.search}`, redirectOrigin),
      308,
    );
  }

  // The legacy internal route is never canonical.
  if (currentPath.startsWith("/solutions/")) {
    const id = currentPath.slice("/solutions/".length) as SolutionPageId;
    const publicPath = solutionPagePath(locale, id);
    if (publicPath) return NextResponse.redirect(new URL(publicPath, request.url), 308);
  }


  // SEO solution pages are physical App Router routes. Avoid rewriting them to
  // one shared pathname, because the route cache must remain locale-specific.
  const solutionId = solutionPageIdFromPath(currentPath);
  if (solutionId && solutionPagePath(locale, solutionId) === currentPath) {
    if (!redirectOrigin) return withMarketingCache(NextResponse.next({ request: { headers: requestHeaders } }), request);
    return NextResponse.redirect(
      new URL(`${currentPath}${request.nextUrl.search}`, redirectOrigin),
      308,
    );
  }

  // One URL owns the international wedding intent. Keep the Slovenian Eventaj
  // use-case page unchanged, while every Guest Mosaic locale permanently
  // consolidates its legacy generic wedding URL into the focused solution.
  if (locale !== "sl" && slovenianRoutePath(currentPath) === "/za-dogodke/poroke") {
    const weddingPath = solutionPagePath(locale, "wedding-qr");
    if (weddingPath) {
      return NextResponse.redirect(
        new URL(`${weddingPath}${request.nextUrl.search}`, redirectOrigin ?? request.url),
        308,
      );
    }
  }

  const localizedPath = localizedMarketingPath(currentPath, locale);

  if (redirectOrigin || localizedPath !== currentPath) {
    const destination = new URL(
      `${localizedPath}${request.nextUrl.search}`,
      redirectOrigin ?? request.url,
    );
    return NextResponse.redirect(destination, 308);
  }

  // Slovenian paths are the internal route tree; every other locale rewrites onto it.
  const internalPath = slovenianRoutePath(currentPath);
  if (internalPath !== currentPath) {
    const destination = request.nextUrl.clone();
    destination.pathname = internalPath;
    return withMarketingCache(NextResponse.rewrite(destination, { request: { headers: requestHeaders } }), request);
  }

  return withMarketingCache(NextResponse.next({ request: { headers: requestHeaders } }), request);
}
