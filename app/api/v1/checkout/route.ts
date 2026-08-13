import { problem } from "@/lib/http/problem";
import { createCheckoutOrder } from "@/lib/repositories/checkout";
import { createCheckoutSchema } from "@/lib/validation/checkout";
import { getCloudflareEnv } from "@/lib/cloudflare";
import { localeFromRequest } from "@/lib/i18n/locale";
import { marketingAttributionFromRequest } from "@/lib/analytics/meta-attribution";

export async function POST(request: Request) {
  const env = getCloudflareEnv();
  const locale = localeFromRequest(request, env.PUBLIC_APP_URL_EN);
  const copy = locale === "en" ? {
    invalid: "The order details are invalid",
    videoUnavailable: "The video add-on is currently unavailable",
    rateLimit: "Too many payment attempts",
    retryHour: "Please try again in one hour.",
    unavailable: "Payment cannot be started right now",
    retrySoon: "Please try again in a few moments.",
  } : {
    invalid: "Podatki za naročilo niso veljavni",
    videoUnavailable: "Video dodatek trenutno ni na voljo",
    rateLimit: "Preveč poskusov plačila",
    retryHour: "Poskusi znova čez eno uro.",
    unavailable: "Plačila trenutno ni mogoče začeti",
    retrySoon: "Poskusi znova čez nekaj trenutkov.",
  };
  const parsed = createCheckoutSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return problem(422, "INVALID_CHECKOUT", copy.invalid, parsed.error.issues[0]?.message);
  }
  if (parsed.data.videoUnlimited && String(env.VIDEO_UPLOAD_ENABLED) !== "true") {
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
