import { describe, expect, it } from "vitest";
import { hasAllowedVoiceMessageSignature } from "./voice-messages";

describe("voice message content signatures", () => {
  it("accepts the supported WebM, Ogg and MP4 containers", () => {
    expect(hasAllowedVoiceMessageSignature(new Uint8Array([0x1a, 0x45, 0xdf, 0xa3]), "audio/webm")).toBe(true);
    expect(hasAllowedVoiceMessageSignature(new TextEncoder().encode("OggSvoice"), "audio/ogg")).toBe(true);
    expect(hasAllowedVoiceMessageSignature(new Uint8Array([0, 0, 0, 20, 0x66, 0x74, 0x79, 0x70, 0, 0, 0, 0]), "audio/mp4")).toBe(true);
  });

  it("rejects content whose bytes do not match its declared container", () => {
    expect(hasAllowedVoiceMessageSignature(new TextEncoder().encode("not audio"), "audio/webm")).toBe(false);
    expect(hasAllowedVoiceMessageSignature(new TextEncoder().encode("OggSvoice"), "audio/mp4")).toBe(false);
  });
});
