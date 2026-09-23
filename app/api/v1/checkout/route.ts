import { problem } from "@/lib/http/problem";
import { createCheckoutOrder } from "@/lib/repositories/checkout";
import { minimalCheckoutSchema } from "@/lib/validation/checkout";
import { getCloudflareEnv } from "@/lib/cloudflare";
import { isLocale, localeFromRequest } from "@/lib/i18n/locale";
import { marketingAttributionFromRequest } from "@/lib/analytics/meta-attribution";

export async function POST(request: Request) {
  const hostLocale = localeFromRequest(request, getCloudflareEnv().PUBLIC_APP_URL_EN);
  // Middleware overwrites x-locale from the trusted hostname and public path
  // before rewriting /en-us/api/... onto the shared API route.
  const headerLocale = request.headers.get("x-locale");
  const locale = hostLocale !== "sl" && isLocale(headerLocale) ? headerLocale : hostLocale;
  const copy = locale !== "sl" ? {
    invalid: "The order details are invalid",
    videoUnavailable: "The video add-on is currently unavailable",
    faceUnavailable: "Photo search by face is currently unavailable",
    rateLimit: "Too many payment attempts",
    retryHour: "Please try again in one hour.",
    unavailable: "Payment cannot be started right now",
    retrySoon: "Please try again in a few moments.",
  } : {
    invalid: "Podatki za naročilo niso veljavni",
    videoUnavailable: "Video dodatek trenutno ni na voljo",
    faceUnavailable: "Iskanje fotografij po obrazu trenutno ni na voljo",
    rateLimit: "Preveč poskusov plačila",
    retryHour: "Poskusi znova čez eno uro.",
    unavailable: "Plačila trenutno ni mogoče začeti",
    retrySoon: "Poskusi znova čez nekaj trenutkov.",
  };
  const parsed = minimalCheckoutSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return problem(422, "INVALID_CHECKOUT", copy.invalid, parsed.error.issues[0]?.message);
  }
  if (parsed.data.videoUnlimited && String(getCloudflareEnv().VIDEO_UPLOAD_ENABLED) !== "true") {
    return problem(422, "VIDEO_ADDON_UNAVAILABLE", copy.videoUnavailable);
  }
  try {
    const attribution = marketingAttributionFromRequest(request, locale);
    const checkout = await createCheckoutOrder(parsed.data, locale, attribution);
    return Response.json({ checkout }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "CHECKOUT_RATE_LIMIT") {
      return problem(429, "CHECKOUT_RATE_LIMIT", copy.rateLimit, copy.retryHour);
    }
    console.error(JSON.stringify({
      event: "checkout.create_failed",
      errorName: error instanceof Error ? error.name : "UnknownError",
      errorMessage: error instanceof Error ? error.message : "Unknown checkout error",
    }));
    return problem(503, "CHECKOUT_UNAVAILABLE", copy.unavailable, copy.retrySoon);
  }
}
