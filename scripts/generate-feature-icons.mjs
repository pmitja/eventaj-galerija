// Generira ikone za "Funkcije" mrežo prek fal.ai (openai/gpt-image-2).
//
// Uporaba:
//   FAL_KEY=... node scripts/generate-feature-icons.mjs
//   (ali dodaj FAL_KEY v .env.local)
//
// Ikone se shranijo v public/marketing/icons/<id>.png (prosojno ozadje).
//
// Enoten slog za vseh 8 ikon; generira vzporedno (gpt-image-2 ~3–4 min/ikono).

import { readFile, writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const OUT_DIR = path.join(ROOT, "public", "marketing", "icons");
const PROMPTS_FILE = path.join(__dirname, "feature-icon-prompts.json");

const MODEL = "openai/gpt-image-2";
const SUBMIT_URL = `https://queue.fal.run/${MODEL}`;
const POLL_INTERVAL_MS = 3000;
const MAX_POLLS = 160;

// Skupni slog — enak za vse ikone, da so vizualno usklajene.
const STYLE = "Flat minimalist single-color line icon, drawn only in coral red (#e11d48) on a fully transparent background. Clean uniform rounded strokes of medium weight, simple geometric pictogram, centered with generous padding, modern app UI icon in the style of Lucide or Feather icons. No fill, no gradient, no shadow, no color other than coral red, no text, no frame, no background.";

async function loadFalKey() {
  if (process.env.FAL_KEY) return process.env.FAL_KEY.trim();
  const envPath = path.join(ROOT, ".env.local");
  if (existsSync(envPath)) {
    const txt = await readFile(envPath, "utf8");
    const m = txt.match(/^\s*FAL_KEY\s*=\s*(.+)\s*$/m);
    if (m) return m[1].replace(/^["']|["']$/g, "").trim();
  }
  return null;
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function generateOne(falKey, item) {
  const submit = await fetch(SUBMIT_URL, {
    method: "POST",
    headers: { Authorization: `Key ${falKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      prompt: `${STYLE} The icon depicts: ${item.subject}.`,
      image_size: "square_hd",
      quality: "high",
      num_images: 1,
      output_format: "png",
      background: "transparent",
    }),
  });
  if (!submit.ok) throw new Error(`submit ${item.id}: HTTP ${submit.status} ${await submit.text()}`);
  const { request_id, status_url, response_url } = await submit.json();
  const statusUrl = status_url ?? `${SUBMIT_URL}/requests/${request_id}/status`;
  const responseUrl = response_url ?? `${SUBMIT_URL}/requests/${request_id}`;

  let completed = false;
  for (let i = 0; i < MAX_POLLS; i++) {
    await sleep(POLL_INTERVAL_MS);
    const s = await fetch(statusUrl, { headers: { Authorization: `Key ${falKey}` } });
    const sj = await s.json();
    if (sj.status === "COMPLETED") { completed = true; break; }
    if (sj.status === "FAILED" || sj.status === "ERROR") throw new Error(`failed ${item.id}: ${JSON.stringify(sj)}`);
  }
  if (!completed) throw new Error(`timeout ${item.id}`);

  const r = await fetch(responseUrl, { headers: { Authorization: `Key ${falKey}` } });
  if (!r.ok) throw new Error(`result ${item.id}: HTTP ${r.status} ${await r.text()}`);
  const result = await r.json();
  const url = result?.images?.[0]?.url;
  if (!url) throw new Error(`no image url for ${item.id}: ${JSON.stringify(result)}`);
  const img = await fetch(url);
  const buf = Buffer.from(await img.arrayBuffer());
  const outPath = path.join(OUT_DIR, `${item.id}.png`);
  await writeFile(outPath, buf);
  return outPath;
}

async function main() {
  const falKey = await loadFalKey();
  if (!falKey) { console.error("✗ FAL_KEY ni nastavljen."); process.exit(1); }
  await mkdir(OUT_DIR, { recursive: true });
  const prompts = JSON.parse(await readFile(PROMPTS_FILE, "utf8"));
  const only = process.argv[2];
  const items = only ? prompts.filter((p) => p.id === only) : prompts;
  if (items.length === 0) { console.error(`✗ Ni ikone z id "${only}".`); process.exit(1); }

  console.log(`Generiram ${items.length} ikon vzporedno prek ${MODEL} …`);
  const started = Date.now();
  const results = await Promise.allSettled(items.map(async (item) => {
    const out = await generateOne(falKey, item);
    console.log(`  ✓ ${item.id} → ${path.relative(ROOT, out)} (${((Date.now() - started) / 1000).toFixed(0)}s)`);
    return item.id;
  }));
  const failed = results.filter((r) => r.status === "rejected");
  for (const f of failed) console.error(`  ✗ ${f.reason?.message ?? f.reason}`);
  console.log(`\nGotovo. ${results.length - failed.length}/${items.length} uspešnih. Ikone so v ${path.relative(ROOT, OUT_DIR)}/`);
  if (failed.length) process.exitCode = 1;
}

main().catch((e) => { console.error(e); process.exit(1); });
