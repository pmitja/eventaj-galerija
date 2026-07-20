import { getCloudflareEnv } from "@/lib/cloudflare";

type StripeCheckoutSession = {
  id: string;
  object: "checkout.session";
  url: string | null;
  payment_status: "paid" | "unpaid" | "no_payment_required";
  amount_total: number | null;
  currency: string | null;
  customer: string | null;
  payment_intent: string | null;
  metadata: Record<string, string>;
};

type StripeEvent = { id: string; type: string; data: { object: StripeCheckoutSession } };

function stripeSecret(): string {
  const secret = getCloudflareEnv().STRIPE_SECRET_KEY;
  if (!secret) throw new Error("STRIPE_NOT_CONFIGURED");
  return secret;
}

async function stripeRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(`https://api.stripe.com/v1${path}`, {
    ...init,
    headers: {
      authorization: `Basic ${btoa(`${stripeSecret()}:`)}`,
      ...(init.body ? { "content-type": "application/x-www-form-urlencoded" } : {}),
      ...init.headers,
    },
  });
  const body = await response.json() as T & { error?: { code?: string } };
  if (!response.ok) throw new Error(body.error?.code ?? "STRIPE_REQUEST_FAILED");
  return body;
}

export async function createStripeCheckout(input: {
  orderId: string; email: string; amountCents: number; aiBestPhotos: boolean; faceCollections: boolean;
  successUrl: string; cancelUrl: string; customerId?: string | null;
}): Promise<StripeCheckoutSession> {
  const body = new URLSearchParams({
    mode: "payment",
    success_url: input.successUrl,
    cancel_url: input.cancelUrl,
    "metadata[orderId]": input.orderId,
    "line_items[0][price_data][currency]": "eur",
    "line_items[0][price_data][product_data][name]": "Eventaj Galerija · dogodek",
    "line_items[0][price_data][unit_amount]": "3500",
    "line_items[0][quantity]": "1",
    "payment_intent_data[metadata][orderId]": input.orderId,
  });
  if (input.customerId) body.set("customer", input.customerId);
  else {
    body.set("customer_email", input.email);
    body.set("customer_creation", "always");
  }
  let lineItemIndex = 1;
  const addLineItem = (name: string, unitAmount: string) => {
    body.set(`line_items[${lineItemIndex}][price_data][currency]`, "eur");
    body.set(`line_items[${lineItemIndex}][price_data][product_data][name]`, name);
    body.set(`line_items[${lineItemIndex}][price_data][unit_amount]`, unitAmount);
    body.set(`line_items[${lineItemIndex}][quantity]`, "1");
    lineItemIndex += 1;
  };
  if (input.aiBestPhotos) addLineItem("AI Best Photos · do 3.000 fotografij", "1500");
  if (input.faceCollections) addLineItem("AI iskanje po obrazu", "500");
  const session = await stripeRequest<StripeCheckoutSession>("/checkout/sessions", { method: "POST", body });
  if (!session.url || session.amount_total !== input.amountCents) throw new Error("STRIPE_INVALID_CHECKOUT");
  return session;
}

export async function retrieveStripeCheckout(sessionId: string): Promise<StripeCheckoutSession> {
  return stripeRequest<StripeCheckoutSession>(`/checkout/sessions/${encodeURIComponent(sessionId)}`);
}

function parseStripeSignature(header: string): { timestamp: number; signatures: string[] } | null {
  const parts = header.split(",").map((part) => part.split("=", 2));
  const timestamp = Number(parts.find(([key]) => key === "t")?.[1]);
  const signatures = parts.filter(([key]) => key === "v1").map(([, value]) => value);
  return Number.isSafeInteger(timestamp) && signatures.length ? { timestamp, signatures } : null;
}

function hex(bytes: ArrayBuffer): string {
  return [...new Uint8Array(bytes)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

function constantTimeTextEqual(left: string, right: string): boolean {
  if (left.length !== right.length) return false;
  let mismatch = 0;
  for (let index = 0; index < left.length; index += 1) mismatch |= left.charCodeAt(index) ^ right.charCodeAt(index);
  return mismatch === 0;
}

export async function verifyStripeWebhook(rawBody: string, signatureHeader: string): Promise<StripeEvent> {
  const parsed = parseStripeSignature(signatureHeader);
  if (!parsed || Math.abs(Math.floor(Date.now() / 1000) - parsed.timestamp) > 300) throw new Error("INVALID_STRIPE_SIGNATURE");
  const key = await crypto.subtle.importKey(
    "raw", new TextEncoder().encode(getCloudflareEnv().STRIPE_WEBHOOK_SECRET),
    { name: "HMAC", hash: "SHA-256" }, false, ["sign"],
  );
  const expected = hex(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(`${parsed.timestamp}.${rawBody}`)));
  if (!parsed.signatures.some((signature) => constantTimeTextEqual(signature, expected))) throw new Error("INVALID_STRIPE_SIGNATURE");
  return JSON.parse(rawBody) as StripeEvent;
}

export type { StripeCheckoutSession, StripeEvent };
