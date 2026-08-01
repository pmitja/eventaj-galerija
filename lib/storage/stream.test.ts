import { beforeEach, describe, expect, it, vi } from "vitest";

const state = vi.hoisted(() => ({
  env: {
    R2_ACCOUNT_ID: "account-1",
    CLOUDFLARE_STREAM_API_TOKEN: "stream-secret",
    STREAM_WEBHOOK_SECRET: "webhook-secret",
  },
}));

vi.mock("@/lib/cloudflare", () => ({ getCloudflareEnv: () => state.env }));

import { createTusVideoUpload, verifyStreamWebhook } from "./stream";

describe("Cloudflare Stream adapter", () => {
  beforeEach(() => vi.restoreAllMocks());

  it("creates a signed-only TUS upload without exposing the API token in the response", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(null, {
      status: 201,
      headers: { location: "https://upload.example.test/tus/1", "stream-media-id": "stream-1" },
    }));

    await expect(createTusVideoUpload({
      fileId: "media-1",
      eventId: "event-1",
      filename: "utrinek.mp4",
      sizeBytes: 1024,
      maxDurationSeconds: 60,
      expiresAt: "2026-07-31T15:30:00.000Z",
    })).resolves.toEqual({ uid: "stream-1", uploadUrl: "https://upload.example.test/tus/1" });

    const [, init] = fetchMock.mock.calls[0];
    const headers = new Headers(init?.headers);
    expect(headers.get("tus-resumable")).toBe("1.0.0");
    expect(headers.get("upload-length")).toBe("1024");
    expect(headers.get("upload-metadata")).toContain("requiresignedurls");
    expect(headers.get("authorization")).toBe("Bearer stream-secret");
  });

  it("accepts a current HMAC signature and rejects stale signatures", async () => {
    const body = JSON.stringify({ uid: "stream-1" });
    const timestamp = 1_785_516_000;
    const key = await crypto.subtle.importKey(
      "raw", new TextEncoder().encode("webhook-secret"), { name: "HMAC", hash: "SHA-256" }, false, ["sign"],
    );
    const signature = [...new Uint8Array(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(`${timestamp}.${body}`)))]
      .map((byte) => byte.toString(16).padStart(2, "0")).join("");
    const header = `time=${timestamp},sig1=${signature}`;

    await expect(verifyStreamWebhook(body, header, timestamp * 1000)).resolves.toBe(true);
    await expect(verifyStreamWebhook(body, header, timestamp * 1000 + 301_000)).resolves.toBe(false);
  });
});
