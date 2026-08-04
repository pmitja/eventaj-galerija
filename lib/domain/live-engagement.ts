import type { EngagementSnapshot } from "@/lib/repositories/engagement";
import { intlLocale, type Locale } from "@/lib/i18n/locale";

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
  const en = locale === "en";
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
        title: en ? `${event.displayName} • ${formatPhotoCount(event.count, locale)} photo milestone` : `${event.displayName} • mejnik ${formatPhotoCount(event.count, locale)} fotografij`,
        detail: event.count >= 100 ? (en ? "An outstanding contribution to the shared album." : "Izjemen prispevek k skupnemu albumu.") : (en ? "Thank you for every captured moment." : "Hvala za vse ujete trenutke."),
        durationMs: 5_000,
      });
    } else if (event.type === "leader_changed" && event.displayName) {
      overlays.push({
        id: event.id,
        kind: "milestone",
        icon: "first-place",
        title: en ? "New leader" : "Novo prvo mesto",
        detail: en ? `${event.displayName} leads with ${formatPhotoCount(event.count, locale)} photos.` : `${event.displayName} vodi z ${formatPhotoCount(event.count, locale)} fotografijami.`,
        durationMs: 5_000,
      });
    } else if (event.type === "photo_total_milestone") {
      overlays.push({
        id: event.id,
        kind: "global",
        icon: "global-milestone",
        title: en ? `${formatPhotoCount(event.count, locale)} photos together` : `Skupaj že ${formatPhotoCount(event.count, locale)} fotografij`,
        detail: en ? "The event album grows with every moment you add." : "Album dogodka raste z vsakim vašim utrinkom.",
        durationMs: 5_000,
      });
    } else if (event.type === "contributor_total_milestone") {
      overlays.push({
        id: event.id,
        kind: "global",
        icon: "community",
        title: en ? `${formatPhotoCount(event.count, locale)} guests have contributed` : `Prispevalo je že ${formatPhotoCount(event.count, locale)} gostov`,
        detail: en ? "Thank you for creating the event memories together." : "Hvala, ker soustvarjate spomine dogodka.",
        durationMs: 5_000,
      });
    }
  }
  for (const group of uploads.values()) {
    overlays.unshift({
      id: `upload:${group.ids.join(":")}`,
      kind: "upload",
      icon: "camera",
      title: en ? `${group.displayName} • ${formatPhotoCount(group.count, locale)} new ${group.count === 1 ? "photo" : "photos"}` : `${group.displayName} • ${formatPhotoCount(group.count, locale)} ${group.count === 1 ? "nova fotografija" : "novih fotografij"}`,
      detail: en ? "Just added to the album." : "Pravkar sprejeto v album.",
      durationMs: 4_000,
    });
  }
  return overlays;
}
