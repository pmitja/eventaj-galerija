import { describe, expect, it } from "vitest";
import { hashPassword, verifyPassword } from "./password";

describe("organization passwords", () => {
  it("stores only a salted PBKDF2 hash and verifies it", async () => {
    const encoded = await hashPassword("VarnoGeslo42");
    expect(encoded).not.toContain("VarnoGeslo42");
    await expect(verifyPassword("VarnoGeslo42", encoded)).resolves.toBe(true);
    await expect(verifyPassword("NapacnoGeslo42", encoded)).resolves.toBe(false);
  });
});
