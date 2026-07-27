import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const WWW_HOSTNAME = "www.galerija.eventaj.si";
const CANONICAL_ORIGIN = "https://galerija.eventaj.si";

export function middleware(request: NextRequest) {
  const hostname = (request.headers.get("host") ?? request.nextUrl.hostname)
    .split(":")[0]
    .toLowerCase();

  if (hostname !== WWW_HOSTNAME) {
    return NextResponse.next();
  }

  const destination = new URL(
    `${request.nextUrl.pathname}${request.nextUrl.search}`,
    CANONICAL_ORIGIN,
  );

  return NextResponse.redirect(destination, 308);
}
