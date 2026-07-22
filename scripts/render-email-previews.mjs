// Renders the transactional emails to standalone HTML files for screenshotting.
//   node scripts/render-email-previews.mjs
// Output: scratchpad/email-qr.html, scratchpad/email-archive.html
import { writeFile, mkdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import QRCode from "qrcode";
import ts from "typescript";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const OUT = path.resolve(ROOT, "scratchpad-email");
await mkdir(OUT, { recursive: true });

// Transpile the real email module (has TS param-properties, so strip-only mode can't load it).
const emailSrc = await readFile(path.join(ROOT, "lib/notifications/email.ts"), "utf8");
const emailJs = ts.transpileModule(emailSrc, {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
}).outputText;
const tmpEmail = path.join(OUT, "_email.mjs");
await writeFile(tmpEmail, emailJs);
const { qrDeliveryEmail, archiveDeliveryEmail } = await import(pathToFileURL(tmpEmail).href);

const qrDataUrl = await QRCode.toDataURL("https://galerija.eventaj.si/e/ana-in-marko", {
  width: 520,
  margin: 1,
  color: { dark: "#401326", light: "#ffffff" },
});

const qr = qrDeliveryEmail({
  deliveryId: "demo",
  recipientEmail: "ana@example.com",
  recipientName: "Ana",
  eventName: "Poroka Ane in Marka",
  eventDate: "14. junij 2026",
  qrImageUrl: qrDataUrl,
  eventUrl: "https://galerija.eventaj.si/e/ana-in-marko",
  qrDownloadUrl: "https://galerija.eventaj.si/qr/ana-in-marko.png",
  liveshowUrl: "https://galerija.eventaj.si/display/demo",
});

const archive = archiveDeliveryEmail({
  deliveryId: "demo",
  recipientEmail: "ana@example.com",
  recipientName: "Ana",
  eventName: "Poroka Ane in Marka",
  mediaCount: 214,
  downloadUrl: "https://galerija.eventaj.si/prenosi/demo",
  expiresAtLabel: "20. junij 2026",
});

await writeFile(path.join(OUT, "email-qr.html"), qr.html);
await writeFile(path.join(OUT, "email-archive.html"), archive.html);
console.log("Napisano:");
console.log("  •", path.join(OUT, "email-qr.html"), "—", qr.subject);
console.log("  •", path.join(OUT, "email-archive.html"), "—", archive.subject);
