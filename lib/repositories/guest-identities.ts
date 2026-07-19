import { getCloudflareEnv } from "@/lib/cloudflare";
import { cleanDisplayName, displayNameSuggestions, normalizeDisplayName } from "@/lib/domain/guest-identity";
import type { GuestIdentity } from "@/lib/validation/guest-identity";

export type GuestIdentityRow = {
  id: string;
  event_id: string;
  display_name: string | null;
  normalized_display_name: string | null;
  show_on_live_screen: number;
  created_at: string;
  updated_at: string;
};

export type SaveGuestIdentityResult =
  | { status: "saved"; guest: GuestIdentityRow }
  | { status: "name_taken"; suggestions: string[] }
  | { status: "guest_id_conflict" };

async function availableSuggestions(eventId: string, displayName: string): Promise<string[]> {
  const candidates = displayNameSuggestions(displayName);
  if (!candidates.length) return [];
  const normalized = candidates.map(normalizeDisplayName);
  const placeholders = normalized.map(() => "?").join(", ");
  const existing = await getCloudflareEnv().DB.prepare(
    `SELECT normalized_display_name FROM event_guests
     WHERE event_id = ? AND normalized_display_name IN (${placeholders})`,
  ).bind(eventId, ...normalized).all<{ normalized_display_name: string }>();
  const unavailable = new Set(existing.results.map((row) => row.normalized_display_name));
  return candidates.filter((candidate) => !unavailable.has(normalizeDisplayName(candidate)));
}

export async function saveGuestIdentity(eventId: string, input: GuestIdentity): Promise<SaveGuestIdentityResult> {
  const DB = getCloudflareEnv().DB;
  const existingGuest = await DB.prepare("SELECT * FROM event_guests WHERE id = ?")
    .bind(input.guestId).first<GuestIdentityRow>();
  if (existingGuest && existingGuest.event_id !== eventId) return { status: "guest_id_conflict" };

  const displayName = input.displayName === null ? null : cleanDisplayName(input.displayName);
  const normalizedDisplayName = displayName === null ? null : normalizeDisplayName(displayName);
  if (normalizedDisplayName) {
    const duplicate = await DB.prepare(
      "SELECT id FROM event_guests WHERE event_id = ? AND normalized_display_name = ? AND id != ?",
    ).bind(eventId, normalizedDisplayName, input.guestId).first<{ id: string }>();
    if (duplicate) {
      return { status: "name_taken", suggestions: await availableSuggestions(eventId, displayName!) };
    }
  }

  const now = new Date().toISOString();
  try {
    await DB.prepare(
      `INSERT INTO event_guests
        (id, event_id, display_name, normalized_display_name, show_on_live_screen, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET
         display_name = excluded.display_name,
         normalized_display_name = excluded.normalized_display_name,
         show_on_live_screen = excluded.show_on_live_screen,
         updated_at = excluded.updated_at
       WHERE event_guests.event_id = excluded.event_id`,
    ).bind(
      input.guestId,
      eventId,
      displayName,
      normalizedDisplayName,
      input.showOnLiveScreen ? 1 : 0,
      now,
      now,
    ).run();
  } catch (error) {
    if (normalizedDisplayName && error instanceof Error && /unique/i.test(error.message)) {
      return { status: "name_taken", suggestions: await availableSuggestions(eventId, displayName ?? "Gost") };
    }
    throw error;
  }

  const guest = await DB.prepare("SELECT * FROM event_guests WHERE id = ? AND event_id = ?")
    .bind(input.guestId, eventId).first<GuestIdentityRow>();
  if (!guest) return { status: "guest_id_conflict" };
  return { status: "saved", guest };
}

export async function guestBelongsToEvent(eventId: string, guestId: string): Promise<boolean> {
  const row = await getCloudflareEnv().DB.prepare(
    "SELECT 1 AS present FROM event_guests WHERE id = ? AND event_id = ?",
  ).bind(guestId, eventId).first<{ present: number }>();
  return Boolean(row);
}
