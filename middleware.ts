import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { localeFromPathname, type Locale } from "@/lib/i18n/locale";
import { localizedMarketingPath, slovenianRoutePath } from "@/lib/i18n/routes";

const CANONICAL_ORIGINS: Readonly<Record<string, string>> = {
  "www.galerija.eventaj.si": "https://galerija.eventaj.si",
  "www.gallery.eventaj.si": "https://gallery.eventaj.si",
};

const ENGLISH_HOSTNAMES = new Set([
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

// Keep the deprecated middleware convention until OpenNext supports the
// Node.js runtime used by Next.js 16 proxy.ts. Middleware remains Edge-based.
export function middleware(request: NextRequest) {
  const hostname = (request.headers.get("host") ?? request.nextUrl.hostname)
    .split(":")[0]
    .toLowerCase();

  const isEnglishHost = ENGLISH_HOSTNAMES.has(hostname);
  const canonicalOrigin = CANONICAL_ORIGINS[hostname];
  const currentPath = request.nextUrl.pathname;

  // The English host also serves the prefixed languages (/de, /nl, /es, /it, /fr).
  const locale: Locale = isEnglishHost ? localeFromPathname(currentPath) ?? "en" : "sl";

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-locale", locale);

  if (isInternalPath(currentPath)) {
    if (!canonicalOrigin) return NextResponse.next({ request: { headers: requestHeaders } });
    return NextResponse.redirect(
      new URL(`${currentPath}${request.nextUrl.search}`, canonicalOrigin),
      308,
    );
  }

  const localizedPath = localizedMarketingPath(currentPath, locale);

  if (canonicalOrigin || localizedPath !== currentPath) {
    const destination = new URL(
      `${localizedPath}${request.nextUrl.search}`,
      canonicalOrigin ?? request.url,
    );
    return NextResponse.redirect(destination, 308);
  }

  // Slovenian paths are the internal route tree; every other locale rewrites onto it.
  const internalPath = slovenianRoutePath(currentPath);
  if (internalPath !== currentPath) {
    const destination = request.nextUrl.clone();
    destination.pathname = internalPath;
    return NextResponse.rewrite(destination, { request: { headers: requestHeaders } });
  }

  return NextResponse.next({ request: { headers: requestHeaders } });
}
