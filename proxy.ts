import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const CANONICAL_ORIGINS: Readonly<Record<string, string>> = {
  "www.galerija.eventaj.si": "https://galerija.eventaj.si",
  "www.gallery.eventaj.si": "https://gallery.eventaj.si",
};

export function proxy(request: NextRequest) {
  const hostname = (request.headers.get("host") ?? request.nextUrl.hostname)
    .split(":")[0]
    .toLowerCase();

  const canonicalOrigin = CANONICAL_ORIGINS[hostname];
  if (!canonicalOrigin) {
    return NextResponse.next();
  }

  const destination = new URL(
    `${request.nextUrl.pathname}${request.nextUrl.search}`,
    canonicalOrigin,
  );

  return NextResponse.redirect(destination, 308);
}
