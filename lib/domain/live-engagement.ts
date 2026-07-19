import type { EngagementSnapshot } from "@/lib/repositories/engagement";

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

export function formatPhotoCount(count: number): string {
  return new Intl.NumberFormat("sl-SI").format(count);
}

export function overlaysForNewEvents(events: EngagementSnapshot["events"]): LiveOverlay[] {
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
        title: `${event.displayName} • mejnik ${formatPhotoCount(event.count)} fotografij`,
        detail: event.count >= 100 ? "Izjemen prispevek k skupnemu albumu." : "Hvala za vse ujete trenutke.",
        durationMs: 5_000,
      });
    } else if (event.type === "leader_changed" && event.displayName) {
      overlays.push({
        id: event.id,
        kind: "milestone",
        icon: "first-place",
        title: "Novo prvo mesto",
        detail: `${event.displayName} vodi z ${formatPhotoCount(event.count)} fotografijami.`,
        durationMs: 5_000,
      });
    } else if (event.type === "photo_total_milestone") {
      overlays.push({
        id: event.id,
        kind: "global",
        icon: "global-milestone",
        title: `Skupaj že ${formatPhotoCount(event.count)} fotografij`,
        detail: "Album dogodka raste z vsakim vašim utrinkom.",
        durationMs: 5_000,
      });
    } else if (event.type === "contributor_total_milestone") {
      overlays.push({
        id: event.id,
        kind: "global",
        icon: "community",
        title: `Prispevalo je že ${formatPhotoCount(event.count)} gostov`,
        detail: "Hvala, ker soustvarjate spomine dogodka.",
        durationMs: 5_000,
      });
    }
  }
  for (const group of uploads.values()) {
    overlays.unshift({
      id: `upload:${group.ids.join(":")}`,
      kind: "upload",
      icon: "camera",
      title: `${group.displayName} • ${formatPhotoCount(group.count)} ${group.count === 1 ? "nova fotografija" : "novih fotografij"}`,
      detail: "Pravkar sprejeto v album.",
      durationMs: 4_000,
    });
  }
  return overlays;
}
