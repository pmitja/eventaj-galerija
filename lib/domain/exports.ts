export const EXPORT_RETENTION_HOURS = 24;
export const EXPORT_DOWNLOAD_TTL_SECONDS = 10 * 60;

function asciiSlug(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^A-Za-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function exportFileName(eventName: string, now = new Date()): string {
  const date = now.toISOString().slice(0, 10).replaceAll("-", "");
  return `${asciiSlug(eventName) || "eventaj-galerija"}-${date}.zip`;
}

export function exportExpiry(now = new Date()): string {
  return new Date(now.getTime() + EXPORT_RETENTION_HOURS * 60 * 60 * 1000).toISOString();
}

function safeEntryBase(originalFilename: string): string {
  const leaf = originalFilename.replaceAll("\\", "/").split("/").pop() ?? "fotografija";
  const withoutExtension = leaf.replace(/\.[^.]+$/, "");
  return asciiSlug(withoutExtension).slice(0, 100) || "fotografija";
}

export function uniqueWebpEntryNames(originalFilenames: string[]): string[] {
  const counts = new Map<string, number>();
  return originalFilenames.map((filename) => {
    const base = safeEntryBase(filename);
    const count = (counts.get(base) ?? 0) + 1;
    counts.set(base, count);
    return `${base}${count === 1 ? "" : `-${count}`}.webp`;
  });
}
