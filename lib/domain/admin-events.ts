import type { AdminEventStatus } from "./admin-dashboard";
import type { AdminEventsQuery } from "@/lib/validation/admin";

type FilterableEvent = {
  name: string;
  location: string | null;
  status: AdminEventStatus;
  starts_at: string;
  timezone: string;
  is_upcoming: number;
};

function monthIndex(date: Date, timeZone: string): number {
  const parts = new Intl.DateTimeFormat("en", { timeZone, year: "numeric", month: "numeric" }).formatToParts(date);
  return Number(parts.find((part) => part.type === "year")?.value) * 12
    + Number(parts.find((part) => part.type === "month")?.value) - 1;
}

export function filterAdminEvents<T extends FilterableEvent>(events: readonly T[], query: AdminEventsQuery, now = new Date()): T[] {
  const search = query.q?.toLocaleLowerCase("sl-SI");
  const filtered = events.filter((event) => {
    if (query.status === "upcoming") {
      if (!event.is_upcoming) return false;
    } else if (query.status !== "all" && event.status !== query.status) return false;
    if (search && !event.name.toLocaleLowerCase("sl-SI").includes(search)
      && !event.location?.toLocaleLowerCase("sl-SI").includes(search)) return false;
    if (query.period !== "all") {
      const targetMonth = monthIndex(now, event.timezone) - (query.period === "previous_month" ? 1 : 0);
      if (monthIndex(new Date(event.starts_at), event.timezone) !== targetMonth) return false;
    }
    return true;
  });
  return filtered.sort((left, right) => {
    switch (query.sort) {
      case "name_asc": return left.name.localeCompare(right.name, "sl-SI");
      case "name_desc": return right.name.localeCompare(left.name, "sl-SI");
      case "date_asc": return Date.parse(left.starts_at) - Date.parse(right.starts_at);
      case "date_desc": return Date.parse(right.starts_at) - Date.parse(left.starts_at);
    }
  });
}
