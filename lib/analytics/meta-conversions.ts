import { z } from "zod";
import { getCloudflareEnv } from "@/lib/cloudflare";

const META_DATASET_ID = "1024314580235586";
const META_GRAPH_API_VERSION = "v25.0";

const metaResponseSchema = z.object({
  events_received: z.number().int().nonnegative(),
  messages: z.array(z.unknown()).optional(),
  fbtrace_id: z.string().optional(),
});

export type MetaConversionName = "InitiateCheckout" | "Purchase";

export type MetaConversionInput = {
  name: MetaConversionName;
  eventId: string;
  occurredAt: Date;
  sourceUrl: string;
  email: string;
  amountCents: number;
  currency: string;
  orderId: string;
  fbp?: string | null;
  fbc?: string | null;
  clientIp?: string | null;
  clientUserAgent?: string | null;
};

async function sha256(value: string): Promise<string> {
  const bytes = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return [...new Uint8Array(bytes)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

function compact<T extends Record<string, unknown>>(value: T): Partial<T> {
  return Object.fromEntries(Object.entries(value).filter(([, item]) => item !== null && item !== undefined)) as Partial<T>;
}

export async function sendMetaConversion(input: MetaConversionInput): Promise<"sent" | "disabled"> {
  const token = getCloudflareEnv().META_CONVERSIONS_API_TOKEN;
  if (!token) return "disabled";

  const userData = compact({
    em: [await sha256(input.email.trim().toLowerCase())],
    client_ip_address: input.clientIp,
    client_user_agent: input.clientUserAgent,
    fbp: input.fbp,
    fbc: input.fbc,
  });
  const payload = {
    data: [{
      event_name: input.name,
      event_time: Math.floor(input.occurredAt.getTime() / 1000),
      event_id: input.eventId,
      event_source_url: input.sourceUrl,
      action_source: "website",
      user_data: userData,
      custom_data: {
        currency: input.currency.toUpperCase(),
        value: input.amountCents / 100,
        content_ids: ["guestmosaic_event_gallery"],
        content_type: "product",
        order_id: input.orderId,
      },
    }],
  };
  const endpoint = new URL(`https://graph.facebook.com/${META_GRAPH_API_VERSION}/${META_DATASET_ID}/events`);
  endpoint.searchParams.set("access_token", token);
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
  });
  const body = await response.json().catch(() => null);
  const parsed = metaResponseSchema.safeParse(body);
  if (!response.ok || !parsed.success || parsed.data.events_received < 1) {
    throw new Error(`META_CONVERSIONS_REQUEST_FAILED_${response.status}`);
  }
  return "sent";
}
