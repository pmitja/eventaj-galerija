import { z } from "zod";
import type { Locale } from "@/lib/i18n/locale";

export function checkoutFormSchemaFor(locale: Locale) {
  const en = locale === "en";
  const localDateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, en ? "Choose a date" : "Izberi datum");
  const localTimeSchema = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, en ? "Choose a time" : "Izberi čas");
  return z.object({
    ownerName: z.string().trim().min(2, en ? "Enter your full name" : "Vnesi ime in priimek").max(120),
    ownerEmail: z.email(en ? "Enter a valid email address" : "Vnesi veljaven e-poštni naslov"),
    eventName: z.string().trim().min(2, en ? "Enter the event name" : "Vnesi naziv dogodka").max(120),
    eventLocation: z.string().trim().max(160),
    startDate: localDateSchema,
    startTime: localTimeSchema,
    endDate: localDateSchema,
    endTime: localTimeSchema,
    commentsEnabled: z.boolean(),
    aiBestPhotos: z.boolean(),
    faceCollections: z.boolean(),
    videoUnlimited: z.boolean(),
    termsAccepted: z.boolean().refine((value) => value, en ? "Accept the terms of use to continue" : "Za nadaljevanje sprejmi pogoje uporabe"),
  }).superRefine((value, context) => {
    const startsAt = Date.parse(`${value.startDate}T${value.startTime}`);
    const endsAt = Date.parse(`${value.endDate}T${value.endTime}`);
    if (Number.isFinite(startsAt) && Number.isFinite(endsAt) && endsAt <= startsAt) {
      context.addIssue({ code: "custom", path: ["endDate"], message: en ? "The event must end after it starts" : "Konec dogodka mora biti po začetku" });
    }
  });
}

export const checkoutFormSchema = checkoutFormSchemaFor("sl");

export type CheckoutFormValues = z.infer<typeof checkoutFormSchema>;

export const createCheckoutSchema = z.object({
  organizationName: z.string().trim().min(2).max(120).optional(),
  ownerName: z.string().trim().min(2).max(120),
  ownerEmail: z.email().transform((value) => value.toLowerCase()),
  eventName: z.string().trim().min(2).max(120),
  eventLocation: z.string().trim().max(160).optional().default(""),
  startsAt: z.iso.datetime(),
  endsAt: z.iso.datetime(),
  timezone: z.literal("Europe/Ljubljana").default("Europe/Ljubljana"),
  commentsEnabled: z.boolean().default(true),
  aiBestPhotos: z.boolean().default(false),
  faceCollections: z.boolean().default(false),
  videoUnlimited: z.boolean().default(false),
  termsAccepted: z.literal(true),
}).superRefine((value, context) => {
  if (Date.parse(value.endsAt) <= Date.parse(value.startsAt)) {
    context.addIssue({ code: "custom", path: ["endsAt"], message: "Konec mora biti po začetku" });
  }
});

export const checkoutSessionIdSchema = z.string().regex(/^cs_(test|live)_[A-Za-z0-9]+$/).max(255);
