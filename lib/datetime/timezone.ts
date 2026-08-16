const LOCAL_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;
const LOCAL_TIME = /^([01]\d|2[0-3]):([0-5]\d)$/;

export function isSupportedTimeZone(timeZone: string): boolean {
  try {
    new Intl.DateTimeFormat("en", { timeZone }).format(0);
    return timeZone.includes("/") || timeZone === "UTC";
  } catch {
    return false;
  }
}

export function detectedTimeZone(): string {
  const detected = Intl.DateTimeFormat().resolvedOptions().timeZone;
  return detected && isSupportedTimeZone(detected) ? detected : "UTC";
}

type LocalParts = {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
};

function partsAt(timestamp: number, timeZone: string): LocalParts {
  const values = Object.fromEntries(
    new Intl.DateTimeFormat("en-CA", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    }).formatToParts(new Date(timestamp)).map((part) => [part.type, part.value]),
  );
  return {
    year: Number(values.year),
    month: Number(values.month),
    day: Number(values.day),
    hour: Number(values.hour),
    minute: Number(values.minute),
  };
}

function sameParts(left: LocalParts, right: LocalParts): boolean {
  return left.year === right.year
    && left.month === right.month
    && left.day === right.day
    && left.hour === right.hour
    && left.minute === right.minute;
}

/** Converts a wall-clock date in an IANA zone to UTC without relying on the browser's own zone. */
export function zonedLocalDateTimeToIso(date: string, time: string, timeZone: string): string | null {
  const dateMatch = LOCAL_DATE.exec(date);
  const timeMatch = LOCAL_TIME.exec(time);
  if (!dateMatch || !timeMatch || !isSupportedTimeZone(timeZone)) return null;

  const target: LocalParts = {
    year: Number(dateMatch[1]),
    month: Number(dateMatch[2]),
    day: Number(dateMatch[3]),
    hour: Number(timeMatch[1]),
    minute: Number(timeMatch[2]),
  };
  const intendedUtc = Date.UTC(target.year, target.month - 1, target.day, target.hour, target.minute);
  let candidate = intendedUtc;

  // Two passes cover offset changes around DST boundaries; the round-trip below
  // rejects local times that do not exist when clocks move forward.
  for (let index = 0; index < 3; index += 1) {
    const represented = partsAt(candidate, timeZone);
    const representedAsUtc = Date.UTC(
      represented.year,
      represented.month - 1,
      represented.day,
      represented.hour,
      represented.minute,
    );
    const next = candidate + (intendedUtc - representedAsUtc);
    if (next === candidate) break;
    candidate = next;
  }

  return sameParts(partsAt(candidate, timeZone), target) ? new Date(candidate).toISOString() : null;
}
