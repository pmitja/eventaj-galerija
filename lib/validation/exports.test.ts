import { describe, expect, it } from "vitest";
import { eventExportParamsSchema, exportQueueMessageSchema } from "./exports";

describe("export validation", () => {
  it("accepts UUID identifiers", () => {
    expect(eventExportParamsSchema.safeParse({ eventId: "67c96e75-6a7a-4d5f-9a1e-b2cf38edc279" }).success).toBe(true);
    expect(exportQueueMessageSchema.safeParse({ exportId: "0a3fdaaa-684e-44a0-aa34-d6cdf3317699" }).success).toBe(true);
  });

  it("rejects malformed queue messages", () => {
    expect(exportQueueMessageSchema.safeParse({ exportId: "../event" }).success).toBe(false);
  });
});
