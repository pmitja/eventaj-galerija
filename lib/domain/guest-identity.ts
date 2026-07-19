const WHITESPACE = /\s+/g;

export function cleanDisplayName(value: string): string {
  return value.trim().replace(WHITESPACE, " ");
}

export function normalizeDisplayName(value: string): string {
  return cleanDisplayName(value).normalize("NFKC").toLocaleLowerCase("sl-SI");
}

export function displayNameSuggestions(value: string): string[] {
  const name = cleanDisplayName(value);
  const firstName = name.split(" ")[0] ?? name;
  const nickname = firstName.length > 4 ? `${firstName.slice(0, Math.max(3, firstName.length - 2))}i` : `${firstName}i`;
  return [`${name} K.`, `${name} P.`, nickname].filter((item, index, items) => (
    normalizeDisplayName(item) !== normalizeDisplayName(name) &&
    items.findIndex((candidate) => normalizeDisplayName(candidate) === normalizeDisplayName(item)) === index
  ));
}

export const GUEST_PHOTO_MILESTONES = [25, 50, 100, 250, 500, 1_000] as const;
export const EVENT_PHOTO_MILESTONES = [100, 250, 500, 1_000, 2_500, 5_000] as const;
export const CONTRIBUTOR_MILESTONES = [10, 25, 50, 100, 250, 500] as const;

export function reachedMilestones(total: number, milestones: readonly number[]): number[] {
  return milestones.filter((milestone) => milestone <= total);
}

