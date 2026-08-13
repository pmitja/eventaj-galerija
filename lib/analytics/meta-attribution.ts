import { z } from "zod";
import type { Locale } from "@/lib/i18n/locale";
import {
  isGuestMosaicTrackingHostname,
  parseTrackingConsent,
  TRACKING_CONSENT_COOKIE,
} from "@/lib/client/tracking-consent";

const metaBrowserId = z.string().trim().min(8).max(255).regex(/^fb\.1\.\d+\.[A-Za-z0-9._-]+$/);
const clientIp = z.union([z.ipv4(), z.ipv6()]);

export const checkoutMarketingAttributionSchema = z.object({
  consent: z.literal(true),
  consentVersion: z.string().min(1).max(40),
  fbp: metaBrowserId.nullable(),
  fbc: metaBrowserId.nullable(),
  clientIp: clientIp.nullable(),
  clientUserAgent: z.string().trim().min(1).max(512).nullable(),
});

export type CheckoutMarketingAttribution = z.infer<typeof checkoutMarketingAttributionSchema>;

function cookiesFromHeader(header: string | null): Map<string, string> {
  const cookies = new Map<string, string>();
  for (const part of header?.split(";") ?? []) {
    const separator = part.indexOf("=");
    if (separator < 1) continue;
    const name = part.slice(0, separator).trim();
    const rawValue = part.slice(separator + 1).trim();
    try { cookies.set(name, decodeURIComponent(rawValue)); } catch { /* Ignore malformed cookies. */ }
  }
  return cookies;
}

function nullableParsed<T>(schema: z.ZodType<T>, value: string | null | undefined): T | null {
  const parsed = schema.safeParse(value);
  return parsed.success ? parsed.data : null;
}

export function marketingAttributionFromRequest(request: Request, locale: Locale): CheckoutMarketingAttribution | null {
  const url = new URL(request.url);
  if (locale === "sl" || !isGuestMosaicTrackingHostname(url.hostname)) return null;

  const cookies = cookiesFromHeader(request.headers.get("cookie"));
  const consent = parseTrackingConsent(cookies.get(TRACKING_CONSENT_COOKIE));
  if (!consent?.marketing) return null;

  const forwardedIp = request.headers.get("cf-connecting-ip")
    ?? request.headers.get("x-forwarded-for")?.split(",", 1)[0]?.trim();
  return checkoutMarketingAttributionSchema.parse({
    consent: true,
    consentVersion: consent.version,
    fbp: nullableParsed(metaBrowserId, cookies.get("_fbp")),
    fbc: nullableParsed(metaBrowserId, cookies.get("_fbc")),
    clientIp: nullableParsed(clientIp, forwardedIp),
    clientUserAgent: nullableParsed(z.string().trim().min(1).max(512), request.headers.get("user-agent")),
  });
}
