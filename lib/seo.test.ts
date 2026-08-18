import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it, vi } from "vitest";

const APP_URLS = {
  PUBLIC_APP_URL: "https://galerija.eventaj.si",
  PUBLIC_APP_URL_EN: "https://guestmosaic.com",
};

vi.mock("@/lib/i18n/server", () => ({
  getRequestLocale: vi.fn(async () => "sl"),
  getPublicAppUrls: () => APP_URLS,
}));
vi.mock("@/lib/cloudflare", () => ({ getCloudflareEnv: () => APP_URLS }));
import sitemap from "@/app/sitemap";
import robots from "@/app/robots";
import { GET as getLlmsTxt } from "@/app/llms.txt/route";
import { GET as getLlmTxt } from "@/app/llm.txt/route";
import { GET as getLlmsFullTxt } from "@/app/llms-full.txt/route";
import { eventUseCases } from "@/components/landing/use-cases";
import { languageAlternates } from "@/lib/i18n/alternates";
import { getRequestLocale } from "@/lib/i18n/server";
import { SUPPORTED_LOCALES, type Locale } from "@/lib/i18n/locale";
import {
  ENGLISH_SITE_URL,
  EVENTAJ_ORGANIZATION_ID,
  GUEST_MOSAIC_BRAND_ID,
  SITE_URL,
  SL_SITE_NAME,
  ogImage,
  siteStructuredData,
  siteStructuredDataFor,
} from "@/lib/seo";

const mockedLocale = vi.mocked(getRequestLocale);

async function withLocale<T>(locale: Locale, run: () => Promise<T>): Promise<T> {
  mockedLocale.mockResolvedValueOnce(locale);
  return run();
}

/** Home, order, features and the two legal documents, plus the use-case pages. */
const PAGES_PER_LOCALE = eventUseCases.length + 5;

describe("public SEO discovery", () => {
  it("lists only canonical marketing pages in the sitemap", async () => {
    const entries = await sitemap();
    const urls = entries.map((entry) => entry.url);

    expect(urls).toHaveLength(PAGES_PER_LOCALE);
    expect(urls).toContain(SITE_URL);
    expect(urls).toContain(`${SITE_URL}/naroci`);
    expect(urls).toContain(`${SITE_URL}/funkcije`);
    expect(urls).toContain(`${SITE_URL}/pogoji-uporabe`);
    expect(urls).toContain(`${SITE_URL}/zasebnost`);
    expect(urls).not.toContain(`${SITE_URL}/admin`);
    expect(urls).not.toContain(`${SITE_URL}/e/ana-in-marko`);

    for (const useCase of eventUseCases) {
      expect(urls).toContain(`${SITE_URL}/za-dogodke/${useCase.slug}`);
    }
  });

  it("covers every language the English domain serves and declares their hreflang", async () => {
    const entries = await withLocale("en", sitemap);
    const urls = entries.map((entry) => entry.url);

    // en + de, nl, es, it, fr
    // Every international locale has the base routes minus the consolidated
    // wedding use-case, plus three focused solution pages.
    expect(urls).toHaveLength((PAGES_PER_LOCALE - 1 + 3) * 6);
    expect(urls).toContain(ENGLISH_SITE_URL);
    expect(urls).toContain(`${ENGLISH_SITE_URL}/de`);
    expect(urls).toContain(`${ENGLISH_SITE_URL}/fr/order`);
    expect(urls).toContain(`${ENGLISH_SITE_URL}/features`);
    expect(urls).toContain(`${ENGLISH_SITE_URL}/de/features`);
    expect(urls).toContain(`${ENGLISH_SITE_URL}/es/privacy`);
    expect(urls).toContain(`${ENGLISH_SITE_URL}/wedding-qr-code-for-photos`);
    expect(urls).toContain(`${ENGLISH_SITE_URL}/de/hochzeitsfotos-per-qr-code`);
    expect(urls).toContain(`${ENGLISH_SITE_URL}/nl/trouwfotos-verzamelen-qr-code`);
    expect(urls).not.toContain(`${ENGLISH_SITE_URL}/fr/wedding-qr-code-for-photos`);

    const wedding = entries.find((entry) => entry.url === `${ENGLISH_SITE_URL}/wedding-qr-code-for-photos`);
    expect(wedding?.alternates?.languages).toEqual({
      "en-GB": `${ENGLISH_SITE_URL}/wedding-qr-code-for-photos`,
      "de-DE": `${ENGLISH_SITE_URL}/de/hochzeitsfotos-per-qr-code`,
      "nl-NL": `${ENGLISH_SITE_URL}/nl/trouwfotos-verzamelen-qr-code`,
      "es-ES": `${ENGLISH_SITE_URL}/es/codigo-qr-fotos-boda`,
      "it-IT": `${ENGLISH_SITE_URL}/it/codice-qr-foto-matrimonio`,
      "fr-FR": `${ENGLISH_SITE_URL}/fr/qr-code-photos-mariage`,
      "x-default": `${ENGLISH_SITE_URL}/wedding-qr-code-for-photos`,
    });

    const german = entries.find((entry) => entry.url === `${ENGLISH_SITE_URL}/de/terms-of-use`);
    expect(german?.alternates?.languages).toMatchObject({
      "sl-SI": `${SITE_URL}/pogoji-uporabe`,
      "de-DE": `${ENGLISH_SITE_URL}/de/terms-of-use`,
      "x-default": `${ENGLISH_SITE_URL}/terms-of-use`,
    });
  });

  it("points x-default at English rather than the Slovenian original", () => {
    expect(languageAlternates(APP_URLS, "/")["x-default"]).toBe(ENGLISH_SITE_URL);
  });

  it("allows public discovery and keeps private application paths out of crawlers", async () => {
    const config = await robots();
    const rules = Array.isArray(config.rules) ? config.rules : [config.rules];
    const openAiRule = rules.find((rule) => rule.userAgent === "OAI-SearchBot");

    expect(config.sitemap).toBe(`${SITE_URL}/sitemap.xml`);
    expect(openAiRule?.allow).toContain("/za-dogodke/");
    expect(openAiRule?.allow).toContain("/llm.txt");
    expect(openAiRule?.allow).toContain("/zasebnost");
    expect(openAiRule?.disallow).toContain("/admin/");
    expect(openAiRule?.disallow).toContain("/e/");
  });

  it("publishes concise and full AI-readable product facts", async () => {
    const concise = await (await getLlmsTxt()).text();
    const fullResponse = await getLlmsFullTxt();
    const full = await fullResponse.text();

    expect(fullResponse.headers.get("content-type")).toContain("text/plain");
    expect(concise).toContain(`# ${SL_SITE_NAME}`);
    expect(concise).toContain(`${SITE_URL}/llms-full.txt`);
    expect(full).toContain("Cena: 35 EUR");
    expect(full).toContain("trenutno nima objavljenih preverjenih ocen strank");

    for (const useCase of eventUseCases) {
      expect(concise).toContain(`${SITE_URL}/za-dogodke/${useCase.slug}`);
    }
  });

  it("keeps the requested singular llm.txt alias compatible with llms.txt", async () => {
    const singular = await withLocale("en", async () => (await getLlmTxt()).text());
    const standard = await withLocale("en", async () => (await getLlmsTxt()).text());

    expect(singular).toBe(standard);
    expect(singular).toContain(`${ENGLISH_SITE_URL}/wedding-qr-code-for-photos`);
  });

  it("serves the AI files in the request language, with that language's URLs", async () => {
    const german = await withLocale("de", async () => (await getLlmsTxt()).text());
    const french = await withLocale("fr", async () => (await getLlmsFullTxt()).text());

    expect(german).toContain(`${ENGLISH_SITE_URL}/de/order`);
    expect(german).toContain(`${ENGLISH_SITE_URL}/de/hochzeitsfotos-per-qr-code`);
    expect(german).toContain("## Eventarten");
    expect(german).not.toContain(SITE_URL);

    expect(french).toContain(`${ENGLISH_SITE_URL}/fr/qr-code-photos-mariage`);
    expect(french).toContain("Prix : 35 EUR par événement.");
    expect(french).not.toContain(SITE_URL);
  });

  it("gives every locale its own share card", () => {
    const cards = SUPPORTED_LOCALES.map(ogImage);

    expect(new Set(cards).size).toBe(SUPPORTED_LOCALES.length);
    expect(ogImage("sl")).toBe("/og-image.png");
    for (const card of cards) {
      expect(existsSync(join(process.cwd(), "public", card))).toBe(true);
    }
  });

  it("does not claim ratings or reviews in structured data", () => {
    const serialized = JSON.stringify(siteStructuredData);

    expect(serialized).not.toContain("aggregateRating");
    expect(serialized).not.toContain('"review"');
  });

  it("keeps Eventaj and Guest Mosaic as stable, separate structured-data entities", () => {
    const graph = siteStructuredDataFor("en", ENGLISH_SITE_URL)["@graph"];
    const serialized = JSON.stringify(graph);

    expect(serialized).toContain(EVENTAJ_ORGANIZATION_ID);
    expect(serialized).toContain(GUEST_MOSAIC_BRAND_ID);
    expect(serialized).toContain(`"parentOrganization":{"@id":"${EVENTAJ_ORGANIZATION_ID}"}`);
  });
});
