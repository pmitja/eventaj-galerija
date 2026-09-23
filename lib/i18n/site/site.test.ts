import { describe, expect, it } from "vitest";
import { SUPPORTED_LOCALES } from "@/lib/i18n/locale";
import { faqPath, pricingPath } from "@/lib/i18n/routes";
import { fill, getSiteCopy } from "./index";

describe("redesigned site copy", () => {
  it("fills placeholders and leaves unknown ones in place", () => {
    expect(fill("Create your event · {total}", { total: "£50" })).toBe("Create your event · £50");
    expect(fill("{brand} or {other}", { brand: "Guest Mosaic" })).toBe("Guest Mosaic or {other}");
  });

  it.each(SUPPORTED_LOCALES)("keeps the %s FAQ consistent", (locale) => {
    const faq = getSiteCopy(locale).faq;
    const categories = Object.keys(getSiteCopy(locale).faqPage.categories);
    for (const [, , category] of faq.items) expect(categories).toContain(category);
    for (const index of faq.homeItems) expect(faq.items[index]).toBeDefined();
  });

  it.each(SUPPORTED_LOCALES)("keeps the %s price placeholders and accents intact", (locale) => {
    const copy = getSiteCopy(locale);
    expect(copy.pricing.cta).toContain("{total}");
    expect(copy.order.pay).toContain("{total}");
    expect(copy.compare.heading).toContain("{brand}");
    // Every accented display heading opens and closes its `*…*` pair.
    for (const heading of [copy.hero.title, copy.steps.heading, copy.pricing.heading, copy.finalCta.heading, copy.faqPage.heading]) {
      expect((heading.match(/\*/g) ?? []).length % 2).toBe(0);
    }
  });

  it("regionalises the English price", () => {
    expect(getSiteCopy("en").sticky.price).toBe("£35 once");
    expect(getSiteCopy("en-us").sticky.price).toBe("$35 once");
    expect(getSiteCopy("de").sticky.price).toBe("35 € einmalig");
  });

  it("keeps pricing and FAQ on the Guest Mosaic domain", () => {
    expect(pricingPath("en")).toBe("/pricing");
    expect(faqPath("de")).toBe("/de/faq");
    expect(pricingPath("sl")).toBe("https://www.eventaj.si/qr-galerija#cenik");
  });
});
