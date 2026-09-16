import assert from "node:assert/strict";
import { chromium } from "playwright";
const base = process.env.REGIONAL_PREVIEW_URL || "http://en.localhost:3002";
const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage();
  const errors = [];
  page.on("pageerror", error => errors.push(error.message));
  for (const [prefix, symbol, language] of [["", "£", "en-GB"], ["/en-us", "$", "en-US"]]) {
    for (const width of [375, 768, 1024, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      for (const path of ["", "/features", "/order", "/terms-of-use", "/wedding-qr-code-for-photos", "/compare/guest-mosaic-vs-guestpix"]) {
        const response = await page.goto(`${base}${prefix}${path}`);
        assert.equal(response.status(), 200, `${prefix}${path}`);
        assert.equal(await page.locator("html").getAttribute("lang"), language);
        const text = await page.locator("body").innerText();
        assert.ok(!text.includes("€"), `${prefix}${path} must not display EUR`);
        assert.ok(text.includes(`${symbol}${path === "/terms-of-use" ? "15" : "35"}`), `${prefix}${path} price`);
        assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `${prefix}${path} overflow at ${width}`);
      }
    }
    // An invalid request exercises the real prefixed API rewrite without creating an order.
    const invalid = await page.request.post(`${base}${prefix}/api/v1/checkout`, { data: {} });
    assert.equal(invalid.status(), 422);
    await page.goto(`${base}${prefix}/order`);
    await page.getByRole("textbox").fill("regional@example.com");
    await page.getByRole("checkbox").check();
    let requestedPath;
    await page.route("**/api/v1/checkout", async route => {
      requestedPath = new URL(route.request().url()).pathname;
      await route.fulfill({ status: 503, contentType: "application/json", body: JSON.stringify({ title: "Test payment unavailable" }) });
    });
    await page.getByRole("button", { name: /Continue to secure payment/ }).click();
    await page.getByText("Test payment unavailable").waitFor();
    assert.equal(requestedPath, `${prefix}/api/v1/checkout`);
    await page.unroute("**/api/v1/checkout");
  }
  assert.deepEqual(errors, []);
  console.log("UK and US routes, prices, responsive layouts and checkout retry passed.");
} finally { await browser.close(); }
