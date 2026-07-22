// Generira realistične "guest" fotografije testnega dogodka prek fal.ai (openai/gpt-image-2).
//
// Uporaba:
//   FAL_KEY=... node scripts/generate-event-images.mjs
//   (ali dodaj FAL_KEY v .env.local)
//
// Slike se shranijo v public/gallery/test-event/photo-N.jpg.
// Originalni placeholderji (public/gallery/ana-marko/) ostanejo nedotaknjeni,
// dokler ne potrdiš zamenjave.

import { readFile, writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const OUT_DIR = path.join(ROOT, "public", "gallery", "test-event");
const PROMPTS_FILE = path.join(__dirname, "event-image-prompts.json");

const MODEL = "openai/gpt-image-2";
const SUBMIT_URL = `https://queue.fal.run/${MODEL}`;

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

// gpt-image-2 pri quality:high traja ~3–4 min na sliko, zato pustimo velik proračun.
const POLL_INTERVAL_MS = 3000;
const MAX_POLLS = 160; // ~8 min

async function generateOne(falKey, item) {
  const submit = await fetch(SUBMIT_URL, {
    method: "POST",
    headers: { Authorization: `Key ${falKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      prompt: item.prompt,
      image_size: item.image_size ?? "square_hd",
      quality: item.quality ?? "high",
      num_images: 1,
      output_format: "jpeg",
    }),
  });
  if (!submit.ok) {
    throw new Error(`submit ${item.id}: HTTP ${submit.status} ${await submit.text()}`);
  }
  const { request_id, status_url, response_url } = await submit.json();
  const statusUrl = status_url ?? `${SUBMIT_URL}/requests/${request_id}/status`;
  const responseUrl = response_url ?? `${SUBMIT_URL}/requests/${request_id}`;

  // Poll status until COMPLETED.
  let completed = false;
  for (let i = 0; i < MAX_POLLS; i++) {
    await sleep(POLL_INTERVAL_MS);
    const s = await fetch(statusUrl, { headers: { Authorization: `Key ${falKey}` } });
    const sj = await s.json();
    if (sj.status === "COMPLETED") { completed = true; break; }
    if (sj.status === "FAILED" || sj.status === "ERROR") {
      throw new Error(`generation failed ${item.id}: ${JSON.stringify(sj)}`);
    }
  }
  if (!completed) throw new Error(`timeout waiting for ${item.id}`);

  const r = await fetch(responseUrl, { headers: { Authorization: `Key ${falKey}` } });
  if (!r.ok) throw new Error(`result ${item.id}: HTTP ${r.status} ${await r.text()}`);
  const result = await r.json();
  const url = result?.images?.[0]?.url;
  if (!url) throw new Error(`no image url for ${item.id}: ${JSON.stringify(result)}`);

  const img = await fetch(url);
  const buf = Buffer.from(await img.arrayBuffer());
  const outPath = path.join(OUT_DIR, `${item.id}.jpg`);
  await writeFile(outPath, buf);
  return outPath;
}

async function main() {
  const falKey = await loadFalKey();
  if (!falKey) {
    console.error("✗ FAL_KEY ni nastavljen. Dodaj ga v okolje ali v .env.local (FAL_KEY=...).");
    process.exit(1);
  }
  await mkdir(OUT_DIR, { recursive: true });
  const prompts = JSON.parse(await readFile(PROMPTS_FILE, "utf8"));

  // Dovoli generiranje samo enega: node scripts/generate-event-images.mjs photo-1
  const only = process.argv[2];
  const items = only ? prompts.filter((p) => p.id === only) : prompts;
  if (items.length === 0) {
    console.error(`✗ Ni prompta z id "${only}".`);
    process.exit(1);
  }

  console.log(`Generiram ${items.length} slik vzporedno prek ${MODEL} (vsaka ~3–4 min) …`);
  const started = Date.now();
  const results = await Promise.allSettled(
    items.map(async (item) => {
      const out = await generateOne(falKey, item);
      const secs = ((Date.now() - started) / 1000).toFixed(0);
      console.log(`  ✓ ${item.id} → ${path.relative(ROOT, out)} (${secs}s)`);
      return item.id;
    }),
  );
  const failed = results.filter((r) => r.status === "rejected");
  for (const f of failed) console.error(`  ✗ ${f.reason?.message ?? f.reason}`);
  const ok = results.length - failed.length;
  console.log(`\nGotovo. ${ok}/${items.length} uspešnih. Slike so v ${path.relative(ROOT, OUT_DIR)}/`);
  if (failed.length) process.exitCode = 1;
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
