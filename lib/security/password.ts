function decodeBase64Url(value: string): Uint8Array {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(value.length / 4) * 4, "=");
  return Uint8Array.from(atob(padded), (character) => character.charCodeAt(0));
}

function constantTimeEqual(left: Uint8Array, right: Uint8Array): boolean {
  if (left.length !== right.length) return false;
  let mismatch = 0;
  for (let index = 0; index < left.length; index += 1) {
    mismatch |= left[index] ^ right[index];
  }
  return mismatch === 0;
}

function encodeBase64Url(value: Uint8Array): string {
  let binary = "";
  value.forEach((byte) => { binary += String.fromCharCode(byte); });
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/, "");
}

// Cloudflare Workers caps Web Crypto PBKDF2 at 100,000 iterations.
const PASSWORD_HASH_ITERATIONS = 100_000;

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveBits"],
  );
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", hash: "SHA-256", salt, iterations: PASSWORD_HASH_ITERATIONS },
    key,
    256,
  );
  return `pbkdf2-sha256$${PASSWORD_HASH_ITERATIONS}$${encodeBase64Url(salt)}$${encodeBase64Url(new Uint8Array(bits))}`;
}

export async function verifyPassword(password: string, encodedHash: string): Promise<boolean> {
  const [algorithm, iterationsValue, saltValue, expectedValue] = encodedHash.split("$");
  const iterations = Number(iterationsValue);
  if (algorithm !== "pbkdf2-sha256" || iterations !== PASSWORD_HASH_ITERATIONS) {
    return false;
  }

  try {
    const key = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(password),
      "PBKDF2",
      false,
      ["deriveBits"],
    );
    const salt = Uint8Array.from(decodeBase64Url(saltValue)).buffer;
    const bits = await crypto.subtle.deriveBits(
      { name: "PBKDF2", hash: "SHA-256", salt, iterations },
      key,
      256,
    );
    return constantTimeEqual(new Uint8Array(bits), decodeBase64Url(expectedValue));
  } catch {
    return false;
  }
}
