import { type NextRequest, NextResponse } from "next/server";

const PRODUCTION_HOSTNAME = "galerija.eventaj.si";

export function middleware(request: NextRequest) {
  if (
    request.nextUrl.hostname !== PRODUCTION_HOSTNAME ||
    request.nextUrl.protocol !== "http:"
  ) {
    return NextResponse.next();
  }

  const destination = request.nextUrl.clone();
  destination.protocol = "https:";

  return NextResponse.redirect(destination, 308);
}
