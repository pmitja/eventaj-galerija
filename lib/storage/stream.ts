import { getCloudflareEnv } from "@/lib/cloudflare";

type StreamSecrets = CloudflareEnv & {
  CLOUDFLARE_STREAM_API_TOKEN?: string;
  STREAM_WEBHOOK_SECRET?: string;
};

function base64(value: string): string {
  const bytes = new TextEncoder().encode(value);
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

export type DirectVideoUpload = {
  uid: string;
  uploadUrl: string;
};

export async function createTusVideoUpload(input: {
  fileId: string;
  eventId: string;
  filename: string;
  sizeBytes: number;
  maxDurationSeconds: number;
  expiresAt: string;
}): Promise<DirectVideoUpload> {
  const env = getCloudflareEnv() as StreamSecrets;
  if (!env.CLOUDFLARE_STREAM_API_TOKEN) throw new Error("STREAM_NOT_CONFIGURED");
  const metadata = [
    `name ${base64(input.filename)}`,
    `eventId ${base64(input.eventId)}`,
    `mediaId ${base64(input.fileId)}`,
    `maxDurationSeconds ${base64(String(input.maxDurationSeconds))}`,
    `expiry ${base64(input.expiresAt)}`,
    "requiresignedurls",
  ].join(",");
  const response = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${encodeURIComponent(env.R2_ACCOUNT_ID)}/stream?direct_user=true`,
    {
      method: "POST",
      headers: {
        authorization: `Bearer ${env.CLOUDFLARE_STREAM_API_TOKEN}`,
        "tus-resumable": "1.0.0",
        "upload-length": String(input.sizeBytes),
        "upload-metadata": metadata,
      },
    },
  );
  const uploadUrl = response.headers.get("location");
  const uid = response.headers.get("stream-media-id");
  if (response.status !== 201 || !uploadUrl || !uid) throw new Error("STREAM_UPLOAD_CREATE_FAILED");
  return { uid, uploadUrl };
}

export async function createVideoPlaybackToken(uid: string): Promise<string> {
  return getCloudflareEnv().STREAM.video(uid).generateToken();
}

export async function deleteStreamVideo(uid: string): Promise<void> {
  await getCloudflareEnv().STREAM.video(uid).delete();
}

function toHex(bytes: ArrayBuffer): string {
  return [...new Uint8Array(bytes)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

export async function verifyStreamWebhook(rawBody: string, signatureHeader: string | null, now = Date.now()): Promise<boolean> {
  const env = getCloudflareEnv() as StreamSecrets;
  if (!env.STREAM_WEBHOOK_SECRET || !signatureHeader) return false;
  const values = Object.fromEntries(signatureHeader.split(",").map((part) => part.trim().split("=", 2)));
  const timestamp = Number(values.time);
  if (!Number.isFinite(timestamp) || Math.abs(now - timestamp * 1000) > 5 * 60 * 1000 || !values.sig1) return false;
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(env.STREAM_WEBHOOK_SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const expected = toHex(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(`${timestamp}.${rawBody}`)));
  if (expected.length !== values.sig1.length) return false;
  let mismatch = 0;
  for (let index = 0; index < expected.length; index += 1) mismatch |= expected.charCodeAt(index) ^ values.sig1.charCodeAt(index);
  return mismatch === 0;
}
