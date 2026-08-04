export const VOICE_MESSAGE_MAX_BYTES = 5 * 1024 * 1024;
export const VOICE_MESSAGE_MAX_DURATION_MS = 120_000;
export const VOICE_MESSAGE_MIN_DURATION_MS = 1_000;
export const VOICE_MESSAGE_LIMIT_PER_SESSION = 5;

export const allowedVoiceMessageMimes = ["audio/webm", "audio/mp4", "audio/ogg"] as const;
export type VoiceMessageMime = (typeof allowedVoiceMessageMimes)[number];

function startsWith(bytes: Uint8Array, signature: number[]): boolean {
  return signature.every((value, index) => bytes[index] === value);
}

export function hasAllowedVoiceMessageSignature(bytes: Uint8Array, mime: VoiceMessageMime): boolean {
  if (mime === "audio/webm") return startsWith(bytes, [0x1a, 0x45, 0xdf, 0xa3]);
  if (mime === "audio/ogg") return startsWith(bytes, [0x4f, 0x67, 0x67, 0x53]);
  return bytes.length >= 12 && String.fromCharCode(...bytes.slice(4, 8)) === "ftyp";
}
