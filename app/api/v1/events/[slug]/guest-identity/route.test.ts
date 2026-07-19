import { beforeEach, describe, expect, it, vi } from "vitest";

const state = vi.hoisted(() => ({ findPublicEvent: vi.fn(), saveGuestIdentity: vi.fn() }));
vi.mock("@/lib/repositories/events", () => ({ findPublicEvent: state.findPublicEvent }));
vi.mock("@/lib/repositories/guest-identities", () => ({ saveGuestIdentity: state.saveGuestIdentity }));

import { POST } from "./route";

function saveIdentity(body: unknown) {
  return POST(new Request("https://example.test/api/v1/events/poroka/guest-identity", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  }), { params: Promise.resolve({ slug: "poroka" }) });
}

describe("guest identity route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    state.findPublicEvent.mockResolvedValue({ id: "event-1" });
    state.saveGuestIdentity.mockResolvedValue({
      status: "saved",
      guest: { id: "guest_0123456789abcdef", display_name: "Barbara", show_on_live_screen: 1 },
    });
  });

  it("creates an event-scoped pseudonymous identity without registration fields", async () => {
    const response = await saveIdentity({ guestId: "guest_0123456789abcdef", displayName: "Barbara", showOnLiveScreen: true });
    expect(response.status).toBe(201);
    expect(state.saveGuestIdentity).toHaveBeenCalledWith("event-1", {
      guestId: "guest_0123456789abcdef", displayName: "Barbara", showOnLiveScreen: true,
    });
  });

  it("returns editable suggestions instead of adding an automatic number", async () => {
    state.saveGuestIdentity.mockResolvedValue({ status: "name_taken", suggestions: ["Barbara K.", "Barbi"] });
    const response = await saveIdentity({ guestId: "guest_0123456789abcdef", displayName: "Barbara", showOnLiveScreen: true });
    expect(response.status).toBe(409);
    expect(await response.json()).toMatchObject({ code: "DISPLAY_NAME_TAKEN", suggestions: ["Barbara K.", "Barbi"] });
  });

  it("keeps a fully anonymous guest off the live screen", async () => {
    const response = await saveIdentity({ guestId: "guest_0123456789abcdef", displayName: null, showOnLiveScreen: true });
    expect(response.status).toBe(422);
    expect(state.saveGuestIdentity).not.toHaveBeenCalled();
  });
});
