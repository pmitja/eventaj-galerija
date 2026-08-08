import { expireCheckout, fulfillCheckout } from "@/lib/repositories/checkout";
import { verifyStripeWebhook } from "@/lib/billing/stripe";
import { getCloudflareEnv } from "@/lib/cloudflare";
import { localeFromRequest } from "@/lib/i18n/locale";

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");
  if (!signature) return new Response("Missing signature", { status: 400 });
  const rawBody = await request.text();
  const locale = localeFromRequest(request, getCloudflareEnv().PUBLIC_APP_URL_EN);
  try {
    const event = await verifyStripeWebhook(rawBody, signature, locale);
    if (["checkout.session.completed", "checkout.session.async_payment_succeeded"].includes(event.type)) {
      try {
        await fulfillCheckout(event.data.object.id, locale);
      } catch (error) {
        if (!(error instanceof Error && ["CHECKOUT_PROVISIONING_IN_PROGRESS", "CHECKOUT_NOT_PAID"].includes(error.message))) throw error;
      }
    }
    if (event.type === "checkout.session.expired") await expireCheckout(event.data.object.id);
    return new Response(null, { status: 204 });
  } catch {
    return new Response("Invalid webhook", { status: 400 });
  }
}
