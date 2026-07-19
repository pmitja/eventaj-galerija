import { describe, expect, it, vi } from "vitest";
import { deleteExpiredEvents } from "./retention";

describe("biometric retention barrier", () => {
  it("does not delete an event before provider face references are cleaned", async () => {
    vi.spyOn(console, "warn").mockImplementation(() => undefined);
    const preparedSql: string[] = [];
    const DB = {
      prepare: vi.fn((sql: string) => {
        preparedSql.push(sql);
        return {
          bind: vi.fn(() => ({
            all: vi.fn(async () => ({ results: [{ id: "event-1" }] })),
            first: vi.fn(async () => ({ count: 2 })),
          })),
        };
      }),
      batch: vi.fn(),
    };
    const MEDIA = { list: vi.fn(), delete: vi.fn() };

    await deleteExpiredEvents({ DB, MEDIA } as never);

    expect(MEDIA.list).not.toHaveBeenCalled();
    expect(MEDIA.delete).not.toHaveBeenCalled();
    expect(DB.batch).not.toHaveBeenCalled();
    expect(preparedSql.some((sql) => sql.includes("face_provider_faces"))).toBe(true);
  });
});
