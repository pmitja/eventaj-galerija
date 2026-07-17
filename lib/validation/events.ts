import { z } from "zod";

export const packageCodeSchema = z.enum(["basic", "advanced", "premium"]);

export const createEventSchema = z.object({
  name: z.string().trim().min(2).max(120),
  location: z.string().trim().max(200).optional().default(""),
  startsAt: z.iso.datetime({ offset: true }),
  endsAt: z.iso.datetime({ offset: true }),
  timezone: z.string().trim().min(1).max(64).default("Europe/Ljubljana"),
  customerName: z.string().trim().min(2).max(120),
  customerEmail: z.email().trim().toLowerCase().max(254),
  packageCode: packageCodeSchema,
}).superRefine((value, context) => {
  if (new Date(value.endsAt) <= new Date(value.startsAt)) {
    context.addIssue({ code: "custom", path: ["endsAt"], message: "Konec dogodka mora biti po začetku." });
  }
});

export type CreateEventInput = z.infer<typeof createEventSchema>;
