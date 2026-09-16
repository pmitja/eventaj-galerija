import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { chromium } from 'playwright';

const base = process.env.COMPARISON_PREVIEW_URL || 'http://en.localhost:3001';
const output = process.env.COMPARISON_SCREENSHOT_DIR || '/tmp/guestmosaic-comparisons';
const locales = ['en', 'en-us', 'de', 'nl', 'es', 'it', 'fr'];
const ids = ['whatsapp', 'google-drive', 'google-photos', 'guestpix', 'kululu', 'weduploader'];
const prefix = locale => locale === 'en' ? '' : `/${locale}`;
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
await mkdir(output, { recursive: true });
try {
  // HTTP checks cover every page including SSR metadata, without triggering a purchase.
  let count = 0;
  for (const locale of locales) {
    for (const id of [undefined, ...ids]) {
      const path = `${prefix(locale)}/compare${id ? `/guest-mosaic-vs-${id}` : ''}`;
      const response = await context.request.get(`${base}${path}`);
      assert.equal(response.status(), 200, path);
      const html = await response.text();
      assert.ok(html.includes(`href="https://guestmosaic.com${path}"`), `canonical ${path}`);
      assert.equal((html.match(/rel="alternate" hrefLang=/g) || []).length, 8, `alternates ${path}`);
      assert.ok(html.includes('BreadcrumbList'), `schema ${path}`);
      assert.ok(html.includes(`${prefix(locale)}/order`), `checkout ${path}`);
      assert.ok(!html.includes('noindex'), `indexable ${path}`);
      count++;
    }
    console.log(`SSR verified: ${locale}`);
  }
  for (const locale of locales) {
    const response = await context.request.get(`${base}${prefix(locale)}/compare/guest-mosaic-vs-unknown`);
    assert.equal(response.status(), 404);
  }
  const slResponse = await context.request.get(`${base}/compare`, { headers: { host: 'galerija.eventaj.si' } });
  assert.equal(slResponse.status(), 404, 'Slovenian host must not publish comparisons');
  const page = await context.newPage();
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(`${base}/compare/guest-mosaic-vs-whatsapp`);
  await page.getByRole('button', { name: 'Reject all', exact: true }).click();
  assert.ok(await page.locator('.compare-table .compare-fact--check svg').count() > 0, 'comparison table should show check icons');
  assert.ok(await page.locator('.compare-table .compare-fact--x svg').count() > 0, 'comparison table should show x icons when a capability is missing');
  assert.equal(await page.locator('.compare-table .compare-fact svg:not([aria-hidden="true"])').count(), 0, 'status icons are decorative beside complete text');
  for (const [index, locale] of locales.entries()) {
    const path = `${prefix(locale)}/compare/guest-mosaic-vs-${ids[index]}`;
    await page.goto(`${base}${path}`);
    await page.locator('.compare-product img').evaluate(img => img.decode());
    assert.equal(await page.locator('h1').count(), 1);
    for (const width of [375, 768, 1024, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, `overflow ${path} ${width}`);
      if (width === 375 || width === 1440) {
        await page.screenshot({ path: `${output}/${locale}-${width}-hero.png` });
        await page.locator('#comparison').evaluate(el => el.scrollIntoView({ block: 'start', behavior: 'instant' }));
        await page.screenshot({ path: `${output}/${locale}-${width}-table.png` });
        await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }));
      }
    }
    // Every language switch points to the same comparison, and never Slovenian.
    const switches = await page.locator('a[hreflang]').evaluateAll(links => links.map(a => a.getAttribute('href')));
    for (const target of locales) assert.ok(switches.some(href => href?.endsWith(`${prefix(target)}/compare/guest-mosaic-vs-${ids[index]}`)), `language switch ${target}`);
    await page.goto(`${base}${prefix(locale)}/compare`);
    assert.equal(await page.locator('.compare-card').count(), 6);
    for (const width of [375, 768, 1024, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, `hub overflow ${locale} ${width}`);
      const primary = page.locator('.compare-actions .button').first();
      assert.equal(await primary.evaluate(el => getComputedStyle(el).backgroundColor), 'rgb(225, 29, 72)', 'primary CTA must have a solid brand background');
      assert.equal(await primary.evaluate(el => getComputedStyle(el).color), 'rgb(255, 255, 255)', 'primary CTA contrast');
      if (locale === 'en' && [375, 1440].includes(width)) {
        await page.screenshot({ path: `${output}/hub-${width}.png`, fullPage: true });
        await page.screenshot({ path: `${output}/hub-${width}-hero.png` });
        await page.locator('#guest-upload-demo').screenshot({ path: `${output}/hub-${width}-demo.png` });
        await page.locator('.compare-directory').screenshot({ path: `${output}/hub-${width}-directory.png` });
        await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }));
      }
    }
    console.log(`Responsive verified: ${locale}, hub and comparison`);
  }
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto(`${base}/compare/guest-mosaic-vs-whatsapp`);
  await page.locator('#comparison').scrollIntoViewIfNeeded();
  await page.waitForFunction(() => getComputedStyle(document.querySelector('.sticky-cta')).visibility === 'visible');
  // A cookie preferences dialog must hide the mobile purchase CTA.
  await page.getByRole('button', { name: 'Cookie settings', exact: true }).click();
  await page.getByRole('dialog').waitFor({ state: 'visible' });
  await page.waitForFunction(() => getComputedStyle(document.querySelector('.sticky-cta')).visibility === 'hidden');
  await page.getByRole('button', { name: 'Reject all', exact: true }).click();
  await page.locator('.compare-accordion button').first().focus();
  await page.keyboard.press('Enter');
  assert.equal(await page.locator('.compare-accordion button').first().getAttribute('aria-expanded'), 'true');
  const faqHeadingBox = await page.locator('.compare-faq .compare-heading').boundingBox();
  const accordionBox = await page.locator('.compare-accordion').boundingBox();
  assert.ok(faqHeadingBox && accordionBox && accordionBox.y >= faqHeadingBox.y + faqHeadingBox.height, 'FAQ accordion must sit below its title');
  await page.locator('.compare-faq').screenshot({ path: `${output}/en-375-faq.png` });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.locator('.compare-faq').screenshot({ path: `${output}/en-1440-faq.png` });
  await page.setViewportSize({ width: 375, height: 812 });
  // A local demo photo must not create an upload session, sign an upload or send media.
  const networkWrites = [];
  page.on('request', request => { if (['POST', 'PUT', 'PATCH'].includes(request.method())) networkWrites.push(request.url()); });
  await page.locator('#guest-upload-demo').scrollIntoViewIfNeeded();
  // Opening the native picker also proves this client island is hydrated.
  const [picker] = await Promise.all([
    page.waitForEvent('filechooser'),
    page.locator('#guest-upload-demo').getByRole('button', { name: /Choose from your phone/ }).click(),
  ]);
  await picker.setFiles('public/gallery/ana-marko/photo-1.jpg');
  await page.locator('#guest-upload-demo input[type=checkbox]').last().check();
  await page.locator('#guest-upload-demo').getByRole('button', { name: /^Add 1 / }).click();
  await page.locator('.local-upload-demo__link').waitFor({ state: 'visible' });
  assert.deepEqual(networkWrites, [], 'demo must remain local');
  await page.locator('.compare-sources summary').focus();
  await page.keyboard.press('Enter');
  assert.equal(await page.locator('.compare-sources details').getAttribute('open'), '');
  assert.ok(await page.locator('.compare-sources__groups a').first().isVisible(), 'sources accessible by keyboard');
  assert.deepEqual(errors, [], 'browser errors');
  const motionPage = await context.newPage();
  await motionPage.emulateMedia({ reducedMotion: 'no-preference' });
  await motionPage.goto(`${base}/compare`);
  assert.equal(await motionPage.locator('.compare-hero__copy').evaluate(el => getComputedStyle(el).animationName), 'comparison-hero-in');
  assert.equal(await motionPage.locator('.compare-section > .shell').first().evaluate(el => getComputedStyle(el).animationName), 'comparison-section-in');
  await motionPage.emulateMedia({ reducedMotion: 'reduce' });
  assert.equal(await motionPage.locator('.compare-hero__copy').evaluate(el => getComputedStyle(el).animationName), 'none');
  await motionPage.close();
  await page.goto(`${base}/compare`);
  assert.equal(await page.locator('.compare-card').count(), 6);
  console.log(JSON.stringify({ pages: count, notFound: 7, responsiveScenarios: 48, demo: 'local only', stickyCta: 'verified', keyboard: 'verified', motion: 'verified with reduced-motion fallback', screenshots: output }));
} finally { await browser.close(); }
