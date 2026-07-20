import { problem } from "@/lib/http/problem";
import { findPublicDeliveryDownload } from "@/lib/repositories/deliveries";
import { createPresignedDownloadUrl } from "@/lib/storage/r2";

const DELIVERY_TOKEN = /^[A-Za-z0-9_-]{43}$/;

export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  if (!DELIVERY_TOKEN.test(token)) {
    return problem(404, "DOWNLOAD_NOT_FOUND", "Povezava za prenos ni veljavna");
  }
  const download = await findPublicDeliveryDownload(token);
  if (!download) {
    return problem(410, "DOWNLOAD_EXPIRED", "Povezava za prenos je potekla", "ZIP povezava velja 24 ur po prejemu e-pošte.");
  }
  try {
    return Response.redirect(await createPresignedDownloadUrl(download.objectKey), 302);
  } catch {
    return problem(503, "DOWNLOAD_UNAVAILABLE", "Prenosa trenutno ni mogoče pripraviti", "Poskusi znova čez nekaj trenutkov.");
  }
}
