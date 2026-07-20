import type { CreateEventInput } from "@/lib/validation/events";

export const RETENTION_DAYS = 90;

/** Guests may keep uploading for this long after an event ends; afterwards the gallery stays visible but uploads close. */
export const UPLOAD_GRACE_PERIOD_MS = 24 * 60 * 60 * 1000;

export function uploadsCloseAt(endsAt: string): number {
  return new Date(endsAt).getTime() + UPLOAD_GRACE_PERIOD_MS;
}

export function areUploadsOpen(endsAt: string, now: number = Date.now()): boolean {
  return now < uploadsCloseAt(endsAt);
}

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
