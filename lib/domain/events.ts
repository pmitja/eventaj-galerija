import type { CreateEventInput } from "@/lib/validation/events";

export const RETENTION_DAYS = 90;

export function retentionDate(endsAt: string, days = RETENTION_DAYS): string {
  const result = new Date(endsAt);
  result.setUTCDate(result.getUTCDate() + days);
  return result.toISOString();
}

export function createEventRecord(input: CreateEventInput, now = new Date()) {
  return {
    id: crypto.randomUUID(),
    publicSlug: crypto.randomUUID().replaceAll("-", ""),
    name: input.name,
    location: input.location,
    startsAt: input.startsAt,
    endsAt: input.endsAt,
    timezone: input.timezone,
    status: "active" as const,
    retentionUntil: retentionDate(input.endsAt),
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  };
}
