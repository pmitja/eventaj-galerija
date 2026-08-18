// Captures the localized marketing screenshots straight from the running app.
//   npm run dev                      # in another shell
//   node scripts/capture-marketing-screenshots.mjs            # -> scratchpad-shots/
//   node scripts/capture-marketing-screenshots.mjs --write    # -> public/marketing/screenshots/
//   node scripts/capture-marketing-screenshots.mjs --locale de,fr --shot gallery-mobile
//
// Sizes match the existing assets, because globals.css pins aspect ratios
// (.browser-visual is 1425/891) and a different ratio would reframe the page.
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const SL_ORIGIN = process.env.SL_ORIGIN ?? "http://localhost:3000";
const EN_ORIGIN = process.env.EN_ORIGIN ?? "http://en.localhost:3000";

const LOCALES = ["sl", "en", "de", "nl", "es", "it", "fr"];
/** Slovenian owns the unprefixed asset folder; every other locale gets its own. */
const outputDir = (locale) =>
  locale === "sl"
    ? path.join("public/marketing/screenshots")
    : path.join("public/marketing/screenshots", locale);

function demoEventUrl(locale) {
  if (locale === "sl") return `${SL_ORIGIN}/e/ana-in-marko`;
  if (locale === "en") return `${EN_ORIGIN}/e/anna-and-mark`;
  return `${EN_ORIGIN}/${locale}/e/anna-and-mark`;
}

function liveShowUrl(locale) {
  if (locale === "sl") return `${SL_ORIGIN}/demo/live-show`;
  if (locale === "en") return `${EN_ORIGIN}/demo/live-show`;
  return `${EN_ORIGIN}/${locale}/demo/live-show`;
}

const CONSENT_KEY = "guestmosaic_tracking_consent";
const CONSENT_VERSION = "2026-08-13";

/**
 * Seeds a declined tracking consent so the banner never covers the shot, and
 * hides the Next.js dev indicator, which the production assets do not show.
 */
async function prepare(context) {
  await context.addInitScript(({ key, version }) => {
    try {
      window.localStorage.setItem(key, JSON.stringify({
        analytics: false,
        marketing: false,
        updatedAt: new Date().toISOString(),
        version,
      }));
    } catch {}
  }, { key: CONSENT_KEY, version: CONSENT_VERSION });
}

/**
 * Hides the floating overlays the published assets never show: the cookie
 * settings pill and the demo "create event" CTA. Both are high z-index fixed
 * elements, while the gallery's own chrome sits below that threshold.
 */
async function hideOverlays(page) {
  await page.evaluate(() => {
    for (const element of document.querySelectorAll("body *")) {
      const styles = getComputedStyle(element);
      if (styles.position !== "fixed") continue;
      if ((parseInt(styles.zIndex, 10) || 0) < 30) continue;
      // The lightbox is a fixed, high z-index overlay too — it is the subject
      // of the comments shot, not chrome to strip.
      if (element.matches('[role="dialog"]') || element.closest('[role="dialog"]') || element.querySelector('[role="dialog"]')) continue;
      element.style.setProperty("display", "none", "important");
    }
  });
}

/** Waits for fonts and every <img> so a capture never lands mid-decode. */
async function settle(page, { extraMs = 900 } = {}) {
  await page.waitForLoadState("networkidle").catch(() => {});
  await page.evaluate(async () => {
    await document.fonts.ready;
    await Promise.all(
      [...document.images].filter((img) => !img.complete).map(
        (img) => new Promise((resolve) => { img.onload = img.onerror = resolve; }),
      ),
    );
  });
  await page.addStyleTag({ content: "nextjs-portal, [data-nextjs-toast] { display: none !important; }" }).catch(() => {});
  await hideOverlays(page);
  await page.waitForTimeout(extraMs);
}

const SHOTS = {
  "gallery-desktop-frame": {
    viewport: { width: 1425, height: 891 },
    async capture(page, locale, file) {
      await page.goto(demoEventUrl(locale), { waitUntil: "domcontentloaded" });
      await settle(page);
      await page.screenshot({ path: file });
    },
  },
  "gallery-mobile": {
    viewport: { width: 375, height: 812 },
    isMobile: true,
    async capture(page, locale, file) {
      await page.goto(demoEventUrl(locale), { waitUntil: "domcontentloaded" });
      await settle(page);
      // The existing asset is a tall full-page shot, cropped by CSS in the phone frame.
      await page.screenshot({ path: file, fullPage: true });
    },
  },
  "comments-desktop": {
    viewport: { width: 1440, height: 900 },
    async capture(page, locale, file) {
      await page.goto(demoEventUrl(locale), { waitUntil: "domcontentloaded" });
      await settle(page);
      // Photo 5 of 9 carries a sample comment, the same frame the published asset uses.
      await page.locator('button[class*="cursor-zoom-in"]').nth(4).click();
      await page.locator('[role="dialog"] button[aria-expanded]').first().click();
      await settle(page, { extraMs: 1200 });
      await page.screenshot({ path: file });
    },
  },
  "liveshow-desktop": {
    viewport: { width: 1440, height: 900 },
    async capture(page, locale, file) {
      await page.goto(liveShowUrl(locale), { waitUntil: "domcontentloaded" });
      await settle(page, { extraMs: 2500 });
      await page.screenshot({ path: file });
    },
  },
};

function parseList(flag, fallback) {
  const index = process.argv.indexOf(flag);
  if (index === -1) return fallback;
  return (process.argv[index + 1] ?? "").split(",").map((value) => value.trim()).filter(Boolean);
}

const locales = parseList("--locale", LOCALES);
const shots = parseList("--shot", Object.keys(SHOTS));
const write = process.argv.includes("--write");

const browser = await chromium.launch();
try {
  for (const locale of locales) {
    const dir = path.join(ROOT, write ? outputDir(locale) : path.join("scratchpad-shots", locale));
    await mkdir(dir, { recursive: true });

    for (const name of shots) {
      const shot = SHOTS[name];
      if (!shot) throw new Error(`Unknown shot: ${name}`);
      const context = await browser.newContext({
        viewport: shot.viewport,
        deviceScaleFactor: 1,
        isMobile: shot.isMobile ?? false,
        hasTouch: shot.isMobile ?? false,
        locale,
        colorScheme: "light",
        reducedMotion: "reduce",
      });
      await prepare(context);
      const page = await context.newPage();
      const file = path.join(dir, `${name}.png`);
      await shot.capture(page, locale, file);
      await context.close();
      console.log("✓", path.relative(ROOT, file));
    }
  }
} finally {
  await browser.close();
}
