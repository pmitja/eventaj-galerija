import QRCode from "qrcode";
import { getCloudflareEnv } from "@/lib/cloudflare";
import { accessPointTarget } from "@/lib/domain/access-points";
import { problem } from "@/lib/http/problem";
import { findActiveAccessPoint } from "@/lib/repositories/access-points";
import { publicAccessPointCodeSchema } from "@/lib/validation/access-points";

const QR_FILENAME = /^([A-Za-z0-9_-]{20,64})\.(svg|png)$/;

export async function GET(request: Request, { params }: { params: Promise<{ filename: string }> }) {
  const { filename } = await params;
  const match = QR_FILENAME.exec(filename);
  if (!match || !publicAccessPointCodeSchema.safeParse(match[1]).success) {
    return problem(404, "QR_NOT_FOUND", "QR koda ne obstaja");
  }

  const [, publicCode, format] = match;
  const point = await findActiveAccessPoint(publicCode);
  if (!point) return problem(404, "QR_NOT_FOUND", "QR koda ne obstaja");

  const target = accessPointTarget(getCloudflareEnv().PUBLIC_APP_URL, publicCode);
  const options = {
    errorCorrectionLevel: "M" as const,
    margin: 4,
    color: { dark: "#211a1d", light: "#ffffff" },
  };
  const download = new URL(request.url).searchParams.get("download") === "1";
  const headers = new Headers({
    "cache-control": "public, max-age=86400, stale-while-revalidate=604800",
    "x-content-type-options": "nosniff",
  });
  if (download) {
    headers.set("content-disposition", `attachment; filename="eventaj-qr-${publicCode}.${format}"`);
  }

  if (format === "svg") {
    const svg = await QRCode.toString(target, { ...options, type: "svg", width: 1024 });
    headers.set("content-type", "image/svg+xml; charset=utf-8");
    headers.set("content-security-policy", "default-src 'none'; sandbox");
    return new Response(svg, { headers });
  }

  const png = await QRCode.toBuffer(target, { ...options, type: "png", width: 1024 });
  headers.set("content-type", "image/png");
  return new Response(new Uint8Array(png), { headers });
}
