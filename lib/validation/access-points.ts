import { z } from "zod";

export const publicAccessPointCodeSchema = z.string().regex(/^[A-Za-z0-9_-]{20,64}$/);

export const createAccessPointSchema = z.object({
  label: z.string().trim().min(2).max(80),
  type: z.enum(["qr", "nfc"]).default("qr"),
});
