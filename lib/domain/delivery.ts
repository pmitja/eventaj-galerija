export const EVENT_END_GRACE_MINUTES = 15;
export const DELIVERY_DOWNLOAD_HOURS = 24;

function base64Url(bytes: Uint8Array): string {
  let binary = "";
  bytes.forEach((byte) => { binary += String.fromCharCode(byte); });
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/, "");
}

export async function hashDeliveryToken(token: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(token));
  return base64Url(new Uint8Array(digest));
}

export async function createDeliveryToken(now = new Date()): Promise<{
  token: string;
  hash: string;
  expiresAt: string;
}> {
  const token = base64Url(crypto.getRandomValues(new Uint8Array(32)));
  return {
    token,
    hash: await hashDeliveryToken(token),
    expiresAt: new Date(now.getTime() + DELIVERY_DOWNLOAD_HOURS * 60 * 60 * 1000).toISOString(),
  };
}

export function archiveSchedulingCutoff(now = new Date()): string {
  return new Date(now.getTime() - EVENT_END_GRACE_MINUTES * 60 * 1000).toISOString();
}
