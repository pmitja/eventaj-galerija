import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { englishRewriteEntries, localizedMarketingPath } from "@/lib/i18n/routes";

const CANONICAL_ORIGINS: Readonly<Record<string, string>> = {
  "www.galerija.eventaj.si": "https://galerija.eventaj.si",
  "www.gallery.eventaj.si": "https://gallery.eventaj.si",
};

// Keep the deprecated middleware convention until OpenNext supports the
// Node.js runtime used by Next.js 16 proxy.ts. Middleware remains Edge-based.
export function middleware(request: NextRequest) {
  const hostname = (request.headers.get("host") ?? request.nextUrl.hostname)
    .split(":")[0]
    .toLowerCase();

  const isEnglish = hostname === "gallery.eventaj.si"
    || hostname === "www.gallery.eventaj.si"
    || hostname === "en.localhost";
  const canonicalOrigin = CANONICAL_ORIGINS[hostname];
  const currentPath = request.nextUrl.pathname;

  let localizedPath = localizedMarketingPath(currentPath, isEnglish ? "en" : "sl");
  if (isEnglish && currentPath.startsWith("/prenosi/")) {
    localizedPath = `/downloads/${currentPath.slice("/prenosi/".length)}`;
  } else if (!isEnglish && currentPath.startsWith("/downloads/")) {
    localizedPath = `/prenosi/${currentPath.slice("/downloads/".length)}`;
  }

  if (canonicalOrigin || localizedPath !== currentPath) {
    const destination = new URL(`${localizedPath}${request.nextUrl.search}`, canonicalOrigin ?? request.url);
    return NextResponse.redirect(destination, 308);
  }

  if (isEnglish) {
    let internalPath = englishRewriteEntries.find(([english]) => english === currentPath)?.[1];
    if (currentPath.startsWith("/downloads/")) {
      internalPath = `/prenosi/${currentPath.slice("/downloads/".length)}`;
    }
    if (internalPath) {
      const destination = request.nextUrl.clone();
      destination.pathname = internalPath;
      return NextResponse.rewrite(destination);
    }
  }

  return NextResponse.next();
}
