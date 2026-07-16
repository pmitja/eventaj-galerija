import { getCloudflareContext } from "@opennextjs/cloudflare";
import { NextResponse } from "next/server";
import { findActiveAccessPoint, recordAccessPointVisit } from "@/lib/repositories/access-points";
import { publicAccessPointCodeSchema } from "@/lib/validation/access-points";
import { problem } from "@/lib/http/problem";

function referrerHost(request: Request): string | null {
  const referrer = request.headers.get("referer");
  if (!referrer) return null;
  try {
    return new URL(referrer).hostname.slice(0, 253);
  } catch {
    return null;
  }
}

export async function GET(request: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  if (!publicAccessPointCodeSchema.safeParse(code).success) {
    return problem(404, "ACCESS_POINT_NOT_FOUND", "Dostopna točka ne obstaja");
  }
  const point = await findActiveAccessPoint(code);
  if (!point) return problem(404, "ACCESS_POINT_NOT_FOUND", "Dostopna točka ne obstaja");

  getCloudflareContext().ctx.waitUntil(recordAccessPointVisit(point, referrerHost(request)));

  const target = new URL(`/e/${encodeURIComponent(point.event_slug)}`, request.url);
  const response = NextResponse.redirect(target, 302);
  response.headers.set("cache-control", "private, no-store");
  response.cookies.set("eventaj_access_point", point.public_code, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60,
  });
  return response;
}
