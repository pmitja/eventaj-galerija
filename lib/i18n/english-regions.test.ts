import { describe, expect, it } from "vitest";
import { getDictionary } from "./dictionaries";
import { getLegalCopy } from "./legal";
import { landingData } from "@/components/landing/data";
import { getSolutionPage } from "@/components/landing/solution-pages";
import { comparisonCopy } from "@/lib/comparisons/copy";
import { comparisonContent } from "@/lib/comparisons/content";
import { billingCurrency, formatPrice } from "@/lib/domain/billing";
import { productStructuredDataFor, siteStructuredDataFor } from "@/lib/seo";
import { LOCALE_LABELS, intlLocale } from "./locale";

describe("English regional pricing", () => {
  it.each([["en", "GBP", "£"], ["en-us", "USD", "$"]] as const)("uses %s prices across public content", (locale, currency, symbol) => {
    const content = JSON.stringify([getDictionary(locale), getLegalCopy(locale), landingData(locale),
      getSolutionPage("wedding-qr", locale), comparisonCopy[locale], comparisonContent[locale]]);
    expect(content).not.toMatch(/€|EUR/);
    expect(content).toContain(`${symbol}35`);
    expect(content).toContain(`${symbol}15`);
    expect(billingCurrency(locale)).toBe(currency);
    expect(formatPrice(3500, locale)).toBe(`${symbol}35`);
    expect(productStructuredDataFor(locale, "https://guestmosaic.com").offers.priceCurrency).toBe(currency);
  });
  it("labels both English regions and keeps European pricing", () => {
    expect(LOCALE_LABELS.en).toBe("English (UK)");
    expect(LOCALE_LABELS["en-us"]).toBe("English (US)");
    expect(intlLocale("en-us")).toBe("en-US");
    expect(billingCurrency("de")).toBe("EUR");
    expect(landingData("de").plans[0].price).toContain("€");
  });
});

it("uses the US canonical root and a single prefix in offer links", () => {
  const root = "https://guestmosaic.com/en-us";
  const product = productStructuredDataFor("en-us", root);
  expect(product.url).toBe(root);
  expect(product.offers.url).toBe(`${root}/order`);
  expect(product.image).toBe("https://guestmosaic.com/og-image-en.png");
  const app = siteStructuredDataFor("en-us", root)["@graph"].find(item => item["@type"] === "WebApplication");
  expect(app).toMatchObject({ offers: { url: `${root}/order`, priceCurrency: "USD" } });
});
