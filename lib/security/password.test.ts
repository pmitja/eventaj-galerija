import { describe, expect, it } from "vitest";
import { hashPassword, verifyPassword } from "./password";

describe("organization passwords", () => {
  it("stores only a salted PBKDF2 hash and verifies it", async () => {
    const encoded = await hashPassword("VarnoGeslo42");
    expect(encoded).not.toContain("VarnoGeslo42");
    expect(encoded).toMatch(/^pbkdf2-sha256\$100000\$/);
    await expect(verifyPassword("VarnoGeslo42", encoded)).resolves.toBe(true);
    await expect(verifyPassword("NapacnoGeslo42", encoded)).resolves.toBe(false);
  });

  it("rejects hashes with an iteration count unsupported by Cloudflare Workers", async () => {
    const encoded = await hashPassword("VarnoGeslo42");
    const unsupported = encoded.replace("$100000$", "$210000$");
    await expect(verifyPassword("VarnoGeslo42", unsupported)).resolves.toBe(false);
  });
});
