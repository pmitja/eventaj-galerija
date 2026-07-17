import { z } from "zod";

export const slideshowMediaActionSchema = z.object({
  state: z.enum(["approved", "hidden"]),
}).strict();
