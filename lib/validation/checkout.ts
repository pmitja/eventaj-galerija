import { z } from "zod";

const passwordSchema = z.string()
  .min(10, "Geslo mora imeti najmanj 10 znakov")
  .max(128)
  .regex(/[a-zčšž]/, "Geslo mora vsebovati malo črko")
  .regex(/[A-ZČŠŽ]/, "Geslo mora vsebovati veliko črko")
  .regex(/[0-9]/, "Geslo mora vsebovati številko");

const localDateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Izberi datum");
const localTimeSchema = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Izberi čas");

export const checkoutFormSchema = z.object({
  requiresAccount: z.boolean(),
  organizationName: z.string().trim().min(2, "Vnesi naziv organizacije").max(120),
  ownerName: z.string().trim().min(2, "Vnesi ime in priimek").max(120),
  ownerEmail: z.email("Vnesi veljaven e-poštni naslov"),
  password: z.string().max(128),
  eventName: z.string().trim().min(2, "Vnesi naziv dogodka").max(120),
  eventLocation: z.string().trim().max(160),
  startDate: localDateSchema,
  startTime: localTimeSchema,
  endDate: localDateSchema,
  endTime: localTimeSchema,
  commentsEnabled: z.boolean(),
  aiBestPhotos: z.boolean(),
}).superRefine((value, context) => {
  if (value.requiresAccount) {
    const parsedPassword = passwordSchema.safeParse(value.password);
    for (const issue of parsedPassword.error?.issues ?? []) {
      context.addIssue({ code: "custom", path: ["password"], message: issue.message });
    }
  }

  const startsAt = Date.parse(`${value.startDate}T${value.startTime}`);
  const endsAt = Date.parse(`${value.endDate}T${value.endTime}`);
  if (Number.isFinite(startsAt) && Number.isFinite(endsAt) && endsAt <= startsAt) {
    context.addIssue({ code: "custom", path: ["endDate"], message: "Konec dogodka mora biti po začetku" });
  }
});

export type CheckoutFormValues = z.infer<typeof checkoutFormSchema>;

export const createCheckoutSchema = z.object({
  organizationName: z.string().trim().min(2).max(120),
  ownerName: z.string().trim().min(2).max(120),
  ownerEmail: z.email().transform((value) => value.toLowerCase()),
  password: passwordSchema.optional(),
  eventName: z.string().trim().min(2).max(120),
  eventLocation: z.string().trim().max(160).optional().default(""),
  startsAt: z.iso.datetime(),
  endsAt: z.iso.datetime(),
  timezone: z.literal("Europe/Ljubljana").default("Europe/Ljubljana"),
  commentsEnabled: z.boolean().default(true),
  aiBestPhotos: z.boolean().default(false),
}).superRefine((value, context) => {
  if (Date.parse(value.endsAt) <= Date.parse(value.startsAt)) {
    context.addIssue({ code: "custom", path: ["endsAt"], message: "Konec mora biti po začetku" });
  }
});

export const checkoutSessionIdSchema = z.string().regex(/^cs_(test|live)_[A-Za-z0-9]+$/).max(255);
