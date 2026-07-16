import { createPublicToken } from "@/lib/security/tokens";

export const ACCESS_POINT_CODE_BYTES = 16;

export type AccessPointType = "qr" | "nfc" | "fotobooth" | "direct";

export function createAccessPointRecord(input: {
  eventId: string;
  label: string;
  type?: AccessPointType;
  publicCode?: string;
  now?: Date;
}) {
  const timestamp = (input.now ?? new Date()).toISOString();
  return {
    id: crypto.randomUUID(),
    eventId: input.eventId,
    publicCode: input.publicCode ?? createPublicToken(ACCESS_POINT_CODE_BYTES),
    type: input.type ?? "qr",
    label: input.label.trim(),
    active: true,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

export function accessPointTarget(publicAppUrl: string, publicCode: string): string {
  const url = new URL(publicAppUrl);
  url.pathname = `/t/${encodeURIComponent(publicCode)}`;
  url.search = "";
  url.hash = "";
  return url.toString();
}
