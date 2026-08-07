import { llmsFullTxtFor } from "@/lib/llms-content";
import { appUrlForLocale } from "@/lib/i18n/locale";
import { getPublicAppUrls, getRequestLocale } from "@/lib/i18n/server";

// Both domains serve this route and the English domain serves five languages
// under a path prefix, so the body has to follow the request locale.
export const dynamic = "force-dynamic";

export async function GET() {
  const locale = await getRequestLocale();
  const body = llmsFullTxtFor(locale, appUrlForLocale(getPublicAppUrls(), locale));
  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
