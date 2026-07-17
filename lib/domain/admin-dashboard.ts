export type AdminEventStatus = "draft" | "active" | "ended";
export const MAX_RECENT_ACTIVITY = 5;

const statusDetails: Record<AdminEventStatus, { label: string; tone: "draft" | "active" | "ended" }> = {
  draft: { label: "Osnutek", tone: "draft" },
  active: { label: "Aktiven", tone: "active" },
  ended: { label: "Zaključen", tone: "ended" },
};

export function presentEventStatus(status: AdminEventStatus) {
  return statusDetails[status];
}

export function presentCustomerStatus(status: AdminEventStatus | null) {
  if (!status) return { label: "Brez dogodka", tone: "ended" as const };
  const labels: Record<AdminEventStatus, string> = {
    draft: "Osnutek",
    active: "Aktivna",
    ended: "Zaključena",
  };
  return { label: labels[status], tone: statusDetails[status].tone };
}

export function scaleChart(values: number[]): number[] {
  const maximum = Math.max(0, ...values);
  if (maximum === 0) return values.map(() => 0);
  return values.map((value) => value === 0 ? 0 : Math.max(4, Math.round((value / maximum) * 100)));
}

export function formatRelativeTime(iso: string, now = new Date()): string {
  const seconds = Math.max(0, Math.floor((now.getTime() - new Date(iso).getTime()) / 1000));
  if (seconds < 60) return "pravkar";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `pred ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `pred ${hours} h`;
  const days = Math.floor(hours / 24);
  return `pred ${days} d`;
}

export function limitRecentActivity<T>(items: T[]): T[] {
  return items.slice(0, MAX_RECENT_ACTIVITY);
}

export function percentage(part: number, total: number): number {
  if (total <= 0) return 0;
  return Math.round((part / total) * 1000) / 10;
}
