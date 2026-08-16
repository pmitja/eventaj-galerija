import { describe, expect, it } from "vitest";
import { SOLUTION_PAGE_LOCALES, SOLUTION_PAGE_PATHS } from "@/lib/i18n/routes";
import { getSolutionPage } from "./solution-pages";
import { weddingConversionCopy } from "./wedding-conversion-copy";

describe("international solution content", () => {
  it("has complete native content and wedding conversion copy in every international locale", () => {
    for (const locale of SOLUTION_PAGE_LOCALES) {
      expect(weddingConversionCopy[locale].offerPrice).toContain("35");
      for (const id of Object.keys(SOLUTION_PAGE_PATHS) as Array<keyof typeof SOLUTION_PAGE_PATHS>) {
        const page = getSolutionPage(id, locale);
        expect(page.id).toBe(id);
        expect(page.seoTitle.length).toBeGreaterThan(20);
        expect(page.metaDescription.length).toBeGreaterThan(80);
        expect(page.faq.length).toBeGreaterThanOrEqual(4);
      }
    }
  });
});
