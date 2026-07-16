import { pbkdf2Sync, randomBytes } from "node:crypto";
import { stdin, stdout } from "node:process";
import { createInterface } from "node:readline/promises";

const input = createInterface({ input: stdin, output: stdout });
const password = await input.question("Novo administratorsko geslo: ");
input.close();

if (password.length < 14) {
  throw new Error("Geslo mora imeti vsaj 14 znakov.");
}

// Cloudflare Workers currently caps Web Crypto PBKDF2 at 100,000 iterations.
const iterations = 100_000;
const salt = randomBytes(16);
const digest = pbkdf2Sync(password, salt, iterations, 32, "sha256");
const encoded = [
  "pbkdf2-sha256",
  iterations,
  salt.toString("base64url"),
  digest.toString("base64url"),
].join("$");

stdout.write(`\n${encoded}\n`);
