import { describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { COMPARISON_IDS, COMPARISON_LOCALES, comparisonAlternates, comparisonIdFromSlug, comparisonPath } from './routes';
import { COMPARISONS, FACT_MARKS, FEATURE_IDS, GUEST_MOSAIC_FACTS } from './facts';
import { comparisonCopy } from './copy';
import { comparisonContent } from './content';
import { localizedMarketingPath } from '@/lib/i18n/routes';
import { intlLocale } from '@/lib/i18n/locale';
import { middleware } from '@/middleware';
import { llmsTxtFor, llmsFullTxtFor } from '@/lib/llms-content';

const env = { PUBLIC_APP_URL: 'https://galerija.eventaj.si', PUBLIC_APP_URL_EN: 'https://guestmosaic.com' };
vi.mock('@/lib/i18n/server', () => ({ getPublicAppUrls: () => env, getRequestLocale: vi.fn(async () => 'en') }));
import sitemap from '@/app/sitemap';
import { getRequestLocale } from '@/lib/i18n/server';

const pages = COMPARISON_LOCALES.flatMap(locale => [undefined, ...COMPARISON_IDS].map(id => ({ locale, id, path: comparisonPath(locale, id) })));

describe('international comparison discovery', () => {
  it('publishes exactly 49 distinct paths with reciprocal language alternates', async () => {
    const entries = await sitemap();
    expect(new Set(pages.map(p => p.path)).size).toBe(49);
    for (const { locale, id, path } of pages) {
      const url = `${env.PUBLIC_APP_URL_EN}${path}`;
      const alternates = comparisonAlternates(env, id);
      expect(alternates[intlLocale(locale)]).toBe(url);
      expect(Object.keys(alternates)).toHaveLength(8);
      expect(Object.keys(alternates)).not.toContain('sl-SI');
      expect(alternates['x-default']).toBe(`${env.PUBLIC_APP_URL_EN}${comparisonPath('en', id)}`);
      expect(entries.find(e => e.url === url)?.alternates?.languages).toEqual(alternates);
      for (const target of COMPARISON_LOCALES) expect(localizedMarketingPath(path, target)).toBe(comparisonPath(target, id));
      expect(llmsTxtFor(locale, env.PUBLIC_APP_URL_EN)).toContain(url);
      expect(llmsFullTxtFor(locale, env.PUBLIC_APP_URL_EN)).toContain(url);
    }
  });

  it('keeps physical locale routes without rewriting them to an English cache key', () => {
    for (const { path } of pages) {
      const response = middleware(new NextRequest(`${env.PUBLIC_APP_URL_EN}${path}`));
      expect(response.status).toBe(200);
      expect(response.headers.get('x-middleware-rewrite')).toBeNull();
      expect(response.headers.get('location')).toBeNull();
    }
  });

  it('preserves comparison paths and attribution through canonical domain redirects', () => {
    const response = middleware(new NextRequest('https://www.guestmosaic.com/de/compare/guest-mosaic-vs-kululu?utm_source=test'));
    expect(response.status).toBe(308);
    expect(response.headers.get('location')).toBe('https://guestmosaic.com/de/compare/guest-mosaic-vs-kululu?utm_source=test');
  });

  it('does not advertise comparison pages on Slovenian discovery endpoints', async () => {
    vi.mocked(getRequestLocale).mockResolvedValueOnce('sl');
    expect((await sitemap()).some(e => e.url.includes('/compare'))).toBe(false);
    expect(llmsTxtFor('sl', env.PUBLIC_APP_URL)).not.toContain('/compare');
  });

  it('validates the complete public slug before selecting a comparison', () => {
    for (const id of COMPARISON_IDS) expect(comparisonIdFromSlug(`guest-mosaic-vs-${id}`)).toBe(id);
    for (const slug of ['whatsapp', 'guest-mosaic-vs-unknown', 'guest-mosaic-vs-whatsapp/extra', '__proto__', 'guest-mosaic-vs-constructor']) expect(comparisonIdFromSlug(slug)).toBeNull();
  });
});

describe('comparison content integrity', () => {
  it('starts each Kululu description with the comparison query', () => {
    for (const locale of COMPARISON_LOCALES) expect(comparisonContent[locale].kululu.intro).toMatch(/^Guest Mosaic vs Kululu\b/);
  });
  it('has complete translated rows and distinct arguments for every alternative', () => {
    for (const locale of COMPARISON_LOCALES) {
      const copy = comparisonCopy[locale];
      expect(copy.features).toHaveLength(FEATURE_IDS.length);
      expect(new Set(COMPARISON_IDS.map(id => comparisonContent[locale][id].headline)).size).toBe(6);
      for (const id of COMPARISON_IDS) {
        expect(COMPARISONS[id].facts).toHaveLength(FEATURE_IDS.length);
        for (const fact of [...COMPARISONS[id].facts, ...GUEST_MOSAIC_FACTS]) expect(copy.facts[fact]?.length).toBeGreaterThan(5);
        for (const text of Object.values(comparisonContent[locale][id])) expect(text.length).toBeGreaterThan(20);
        for (const source of COMPARISONS[id].sources) expect(new URL(source.url).protocol).toBe('https:');
      }
    }
  });
  it('does not describe direct competitors as requiring a guest account', () => {
    for (const id of ['guestpix', 'kululu', 'weduploader'] as const) expect(COMPARISONS[id].facts[1]).toBe('noAccount');
  });
  it('uses status icons only for clear present or missing facts', () => {
    expect(FACT_MARKS.noAccount).toBe('check');
    expect(FACT_MARKS.whatsappAccount).toBe('x');
    expect(FACT_MARKS.googleAccount).toBe('x');
    expect(FACT_MARKS.googlePhotosAccount).toBe('x');
    expect(FACT_MARKS.noEventWall).toBe('x');
    for (const fact of ['gmPrice', 'googlePrice', 'livePrice', 'gmRetention', 'googleRetention'] as const) expect(FACT_MARKS[fact]).toBe('neutral');
  });
  it('separates Google Photos albums from Drive folders and leaves unverified prices unknown', () => {
    expect(COMPARISONS['google-drive'].facts[0]).toBe('folder');
    expect(COMPARISONS['google-photos'].facts[0]).toBe('album');
    expect(COMPARISONS.guestpix.facts.at(-1)).toBe('livePrice');
    expect(COMPARISONS.weduploader.facts.at(-1)).toBe('livePrice');
  });
});
