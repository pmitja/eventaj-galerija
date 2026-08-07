import type { EngagementSnapshot } from "@/lib/repositories/engagement";
import { intlLocale, type Locale } from "@/lib/i18n/locale";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { plural } from "@/lib/i18n/plural";

export type LiveOverlay =
  | {
      id: string;
      kind: "upload" | "milestone" | "global";
      icon: "camera" | "milestone" | "first-place" | "global-milestone" | "community" | "on-fire";
      title: string;
      detail: string;
      durationMs: number;
    }
  | { id: string; kind: "leaderboard"; leaderboard: EngagementSnapshot["leaderboard"]; durationMs: number };

export function formatPhotoCount(count: number, locale: Locale = "sl"): string {
  return new Intl.NumberFormat(intlLocale(locale)).format(count);
}

export function overlaysForNewEvents(events: EngagementSnapshot["events"], locale: Locale = "sl"): LiveOverlay[] {
  const t = getDictionary(locale).guest.live;
  const overlays: LiveOverlay[] = [];
  const uploads = new Map<string, { ids: string[]; displayName: string; count: number }>();
  for (const event of events) {
    if (event.type === "upload_accepted" && event.displayName && event.uploadSessionId) {
      const key = `${event.uploadSessionId}:${event.guestId ?? "guest"}`;
      const group = uploads.get(key) ?? { ids: [], displayName: event.displayName, count: 0 };
      group.ids.push(event.id);
      group.count += event.count;
      uploads.set(key, group);
      continue;
    }
    if (event.type === "guest_milestone" && event.displayName) {
      overlays.push({
        id: event.id,
        kind: "milestone",
        icon: event.count >= 100 ? "on-fire" : "milestone",
        title: t.milestoneTitle.replace("{name}", event.displayName).replace("{count}", formatPhotoCount(event.count, locale)),
        detail: event.count >= 100 ? t.milestoneOutstanding : t.milestoneThanks,
        durationMs: 5_000,
      });
    } else if (event.type === "leader_changed" && event.displayName) {
      overlays.push({
        id: event.id,
        kind: "milestone",
        icon: "first-place",
        title: t.newLeader,
        detail: t.newLeaderDetail.replace("{name}", event.displayName).replace("{count}", formatPhotoCount(event.count, locale)),
        durationMs: 5_000,
      });
    } else if (event.type === "photo_total_milestone") {
      overlays.push({
        id: event.id,
        kind: "global",
        icon: "global-milestone",
        title: t.totalPhotos.replace("{count}", formatPhotoCount(event.count, locale)),
        detail: t.totalPhotosDetail,
        durationMs: 5_000,
      });
    } else if (event.type === "contributor_total_milestone") {
      overlays.push({
        id: event.id,
        kind: "global",
        icon: "community",
        title: t.totalGuests.replace("{count}", formatPhotoCount(event.count, locale)),
        detail: t.totalGuestsDetail,
        durationMs: 5_000,
      });
    }
  }
  for (const group of uploads.values()) {
    overlays.unshift({
      id: `upload:${group.ids.join(":")}`,
      kind: "upload",
      icon: "camera",
      title: plural(locale, group.count, t.uploadTitle).replace("{name}", group.displayName).replace("{count}", formatPhotoCount(group.count, locale)),
      detail: t.uploadDetail,
      durationMs: 4_000,
    });
  }
  return overlays;
}
