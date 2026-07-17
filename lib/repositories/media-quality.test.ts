import { beforeEach, describe, expect, it, vi } from "vitest";

const database = vi.hoisted(() => ({ prepare: vi.fn() }));

vi.mock("@/lib/cloudflare", () => ({
  getCloudflareEnv: () => ({ DB: database }),
}));

import { findEarlierDuplicate } from "./media-quality";
import { requestTechnicalAnalysis, setMediaQualityOverride } from "./media-quality-admin";

const input = {
  organizationId: "org-1",
  eventId: "event-1",
  mediaId: "media-2",
  checksumSha256: "a".repeat(64),
  perceptualHash: "0000000000000000",
  createdAt: "2026-07-16T12:00:00.000Z",
};

describe("media quality repository duplicate lookup", () => {
  beforeEach(() => vi.clearAllMocks());

  it("prefers an earlier exact checksum match and keeps tenant scope in the query", async () => {
    const first = vi.fn().mockResolvedValue({ id: "media-1" });
    const bind = vi.fn(() => ({ first }));
    database.prepare.mockImplementation((sql: string) => {
      expect(sql).toContain("e.organization_id = ?");
      expect(sql).toContain("m.event_id = ?");
      return { bind };
    });

    await expect(findEarlierDuplicate(input, database as unknown as D1Database)).resolves.toEqual({
      mediaId: "media-1",
      kind: "checksum",
      distance: 0,
    });
    expect(bind).toHaveBeenCalledWith(
      "org-1",
      "event-1",
      input.checksumSha256,
      input.createdAt,
      input.createdAt,
      "media-2",
    );
    expect(database.prepare).toHaveBeenCalledOnce();
  });

  it("uses the closest earlier perceptual match when no checksum matches", async () => {
    database.prepare
      .mockImplementationOnce(() => ({
        bind: vi.fn(() => ({ first: vi.fn().mockResolvedValue(null) })),
      }))
      .mockImplementationOnce(() => ({
        bind: vi.fn(() => ({
          all: vi.fn().mockResolvedValue({
            results: [
              { id: "far", perceptual_hash: "00000000000000ff" },
              { id: "near", perceptual_hash: "0000000000000003" },
            ],
          }),
        })),
      }));

    await expect(findEarlierDuplicate(input, database as unknown as D1Database)).resolves.toEqual({
      mediaId: "near",
      kind: "perceptual",
      distance: 2,
    });
  });
});

describe("media quality admin rules", () => {
  beforeEach(() => vi.clearAllMocks());

  it("does not queue analysis for media outside the event and organization", async () => {
    const first = vi.fn().mockResolvedValue(null);
    const bind = vi.fn(() => ({ first }));
    database.prepare.mockImplementation((sql: string) => {
      expect(sql).toContain("m.event_id = ?");
      expect(sql).toContain("e.organization_id = ?");
      return { bind };
    });

    await expect(requestTechnicalAnalysis({ organizationId: "org-1", eventId: "event-1", mediaId: "media-1" }))
      .resolves.toBe("not_found");
    expect(bind).toHaveBeenCalledWith("media-1", "event-1", "org-1");
    expect(database.prepare).toHaveBeenCalledOnce();
  });

  it("keeps a pending retry idempotent", async () => {
    const changes = [undefined, 0, 0];
    database.prepare.mockImplementation(() => ({
      bind: vi.fn(() => ({
        first: vi.fn().mockResolvedValue({ id: "media-1" }),
        run: vi.fn().mockResolvedValue({ meta: { changes: changes.shift() ?? 0 } }),
      })),
    }));

    await expect(requestTechnicalAnalysis({ organizationId: "org-1", eventId: "event-1", mediaId: "media-1" }))
      .resolves.toBe("already_pending");
  });

  it("scopes a manual override and returns its effective category", async () => {
    const run = vi.fn().mockResolvedValue({ meta: { changes: 1 } });
    const first = vi.fn().mockResolvedValue({ automatic: "good", effective: "best" });
    database.prepare.mockImplementation((sql: string) => ({
      bind: vi.fn((...bindings: unknown[]) => {
        if (sql.startsWith("UPDATE")) {
          expect(sql).toContain("e.organization_id = ?");
          expect(bindings[0]).toBe("best");
          expect(bindings.at(-2)).toBe("event-1");
          expect(bindings.at(-1)).toBe("org-1");
        }
        return { run, first };
      }),
    }));

    await expect(setMediaQualityOverride({
      organizationId: "org-1",
      eventId: "event-1",
      mediaId: "media-1",
      category: "best",
      actorId: "admin@example.com",
    })).resolves.toEqual({ automatic: "good", effective: "best" });
  });
});
