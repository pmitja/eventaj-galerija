import { describe, expect, it } from "vitest";
import sitemap from "@/app/sitemap";
import robots from "@/app/robots";
import { GET as getLlmsTxt } from "@/app/llms.txt/route";
import { GET as getLlmsFullTxt } from "@/app/llms-full.txt/route";
import { eventUseCases } from "@/components/landing/use-cases";
import { SITE_URL, siteStructuredData } from "@/lib/seo";

describe("public SEO discovery", () => {
  it("lists only canonical marketing pages in the sitemap", () => {
    const entries = sitemap();
    const urls = entries.map((entry) => entry.url);

    expect(urls).toHaveLength(eventUseCases.length + 2);
    expect(urls).toContain(`${SITE_URL}/`);
    expect(urls).toContain(`${SITE_URL}/naroci`);
    expect(urls).not.toContain(`${SITE_URL}/admin`);
    expect(urls).not.toContain(`${SITE_URL}/e/ana-in-marko`);

    for (const useCase of eventUseCases) {
      expect(urls).toContain(`${SITE_URL}/za-dogodke/${useCase.slug}`);
    }
  });

  it("allows public discovery and keeps private application paths out of crawlers", () => {
    const config = robots();
    const rules = Array.isArray(config.rules) ? config.rules : [config.rules];
    const openAiRule = rules.find((rule) => rule.userAgent === "OAI-SearchBot");

    expect(config.sitemap).toBe(`${SITE_URL}/sitemap.xml`);
    expect(openAiRule?.allow).toContain("/za-dogodke/");
    expect(openAiRule?.disallow).toContain("/admin/");
    expect(openAiRule?.disallow).toContain("/e/");
  });

  it("publishes concise and full AI-readable product facts", async () => {
    const conciseResponse = getLlmsTxt();
    const fullResponse = getLlmsFullTxt();
    const concise = await conciseResponse.text();
    const full = await fullResponse.text();

    expect(conciseResponse.headers.get("content-type")).toContain("text/plain");
    expect(concise).toContain(`# Eventaj Galerija`);
    expect(concise).toContain(`${SITE_URL}/llms-full.txt`);
    expect(full).toContain("Cena: 35 EUR");
    expect(full).toContain("trenutno nima objavljenih preverjenih ocen strank");

    for (const useCase of eventUseCases) {
      expect(concise).toContain(`${SITE_URL}/za-dogodke/${useCase.slug}`);
    }
  });

  it("does not claim ratings or reviews in structured data", () => {
    const serialized = JSON.stringify(siteStructuredData);

    expect(serialized).not.toContain("aggregateRating");
    expect(serialized).not.toContain('"review"');
  });
});
