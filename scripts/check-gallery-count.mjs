// Run against a local dev server: GALLERY_PREVIEW_URL=http://localhost:3010 node scripts/check-gallery-count.mjs
// The SQL integration test covers the API cap; this checks the mobile gallery can reveal the full response.
import assert from "node:assert/strict";
import { chromium } from "playwright";

const base = process.env.GALLERY_PREVIEW_URL ?? "http://localhost:3010";
assert.ok(["localhost", "127.0.0.1"].includes(new URL(base).hostname), "Use a local test server");
const slug = "gallery-count-regression";
const image = `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10"><rect width="10" height="10" fill="#a78bba"/></svg>')}`;
const media = Array.from({ length: 234 }, (_, index) => ({
  publicId: `photo-${index}`, filename: `photo-${index}.jpg`, kind: "image",
  imageUrl: image, thumbnailUrl: image, playbackUrl: null, downloadUrl: null, commentCount: 0,
}));
const browser = await chromium.launch({ headless: true });
try {
  for (const width of [375, 768, 1024, 1440]) {
    const page = await browser.newPage({ viewport: { width, height: 812 }, reducedMotion: "reduce" });
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.route(`**/api/v1/events/${slug}/media`, (route) => route.fulfill({ json: { media } }));
    await page.route(`**/api/v1/events/${slug}`, (route) => route.fulfill({ json: { event: {
      name: "Gallery regression", location: "", startsAt: "2026-09-21T12:00:00.000Z",
      commentsEnabled: false, uploadsOpen: false, faceSearchEnabled: false,
      faceSearchPolicyVersion: null, videoUploadsEnabled: false,
    } } }));
    await page.route(`**/api/v1/events/${slug}/voice-messages`, (route) => route.fulfill({ json: { messages: [] } }));
    await page.route(`**/api/v1/events/${slug}/guest-identity`, (route) => route.fulfill({ json: {
      guest: route.request().postDataJSON(),
    } }));
    const response = await page.goto(`${base}/e/${slug}`);
    assert.equal(response.status(), 200);
    await page.getByRole("button", { name: "Nadaljuj kot gost (anonimno)" }).click();
    await page.getByRole("dialog").waitFor({ state: "hidden" });
    const photos = page.getByRole("button", { name: /^Odpri fotografijo:/ });
    await photos.first().waitFor();
    for (let attempt = 0; attempt < 45 && await photos.count() < 234; attempt++) {
      const previous = await photos.count();
      const more = page.getByRole("button", { name: "Prikaži več fotografij" });
      await more.focus();
      await page.keyboard.press("Enter");
      await page.waitForFunction((count) => document.querySelectorAll('button[aria-label^="Odpri fotografijo:"]').length > count, previous);
    }
    assert.equal(await photos.count(), 234, `All photos must be reachable at ${width}px`);
    await photos.last().click();
    await page.getByText("234 / 234", { exact: true }).waitFor();
    await page.keyboard.press("ArrowRight");
    await page.getByText("1 / 234", { exact: true }).waitFor();
    await page.keyboard.press("Escape");
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `Overflow at ${width}px`);
    assert.deepEqual(errors, []);
    await page.close();
  }
  console.log("All 234 gallery photos, keyboard navigation and 375/768/1024/1440px layouts passed.");
} finally {
  await browser.close();
}
