import { describe, expect, it } from "vitest";
import { getUploadActionState } from "./event-upload-state";

describe("getUploadActionState", () => {
  it("keeps recoverable upload failures available to the primary retry action", () => {
    expect(getUploadActionState([
      { status: "error", hasValidationError: false },
      { status: "done", hasValidationError: false },
    ])).toMatchObject({
      retryableCount: 1,
      actionableCount: 1,
      doneCount: 1,
      isComplete: false,
    });
  });

  it("does not retry files rejected by client validation", () => {
    expect(getUploadActionState([
      { status: "error", hasValidationError: true },
    ])).toMatchObject({
      retryableCount: 0,
      actionableCount: 0,
      isComplete: false,
    });
  });

  it("reports completion only when every selected file is done", () => {
    expect(getUploadActionState([
      { status: "done", hasValidationError: false },
      { status: "done", hasValidationError: false },
    ])).toMatchObject({ doneCount: 2, isComplete: true });
  });
});
