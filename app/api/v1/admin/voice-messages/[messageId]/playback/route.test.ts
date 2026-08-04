import { beforeEach, describe, expect, it, vi } from "vitest";

const state = vi.hoisted(() => ({ auth: vi.fn(), first: vi.fn(), sign: vi.fn(), sql: "", bindings: [] as unknown[] }));

vi.mock("@/lib/auth/context", () => ({ getAuthContext: state.auth }));
vi.mock("@/lib/cloudflare", () => ({ getCloudflareEnv: () => ({ DB: { prepare: (sql: string) => {
  state.sql = sql;
  return { bind: (...bindings: unknown[]) => { state.bindings = bindings; return { first: state.first }; } };
} } }) }));
vi.mock("@/lib/storage/r2", () => ({ createPresignedDownloadUrl: state.sign }));

import { GET } from "./route";

describe("admin voice message playback", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    state.auth.mockResolvedValue({ organizationId: "org-1" });
    state.first.mockResolvedValue({ object_key: "voice-messages/event-1/message/original" });
    state.sign.mockResolvedValue("https://audio.example.test/signed");
  });

  it("scopes private playback to the authenticated organization", async () => {
    const response = await GET(new Request("https://example.test/playback"), { params: Promise.resolve({ messageId: "message-1" }) });
    expect(response.status).toBe(302);
    expect(state.sql).toContain("e.organization_id = ?");
    expect(state.bindings).toEqual(["message-1", "org-1"]);
    expect(state.sign).toHaveBeenCalledWith("voice-messages/event-1/message/original");
  });

  it("requires an authenticated admin session", async () => {
    state.auth.mockResolvedValue(null);
    const response = await GET(new Request("https://example.test/playback"), { params: Promise.resolve({ messageId: "message-1" }) });
    expect(response.status).toBe(401);
    expect(state.first).not.toHaveBeenCalled();
    expect(state.sign).not.toHaveBeenCalled();
  });
});
