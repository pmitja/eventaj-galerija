import { describe, expect, it } from "vitest";
import {
  checkoutSuccessPath,
  eventUseCasePath,
  localizedMarketingPath,
  orderPath,
  privacyPath,
  slovenianRoutePath,
  termsPath,
} from "./routes";

describe("localized public routes", () => {
  it("uses English route segments on the English domain", () => {
    expect(orderPath("en")).toBe("/order");
    expect(checkoutSuccessPath("en")).toBe("/order/success");
    expect(termsPath("en")).toBe("/terms-of-use");
    expect(privacyPath("en")).toBe("/privacy");
    expect(eventUseCasePath("en", "poslovni-dogodki")).toBe("/for-events/corporate-events");
  });

  it("maps language-switch destinations in both directions", () => {
    expect(localizedMarketingPath("/za-dogodke/poroke", "en")).toBe("/for-events/weddings");
    expect(localizedMarketingPath("/for-events/weddings", "sl")).toBe("/za-dogodke/poroke");
    expect(localizedMarketingPath("/order", "sl")).toBe("/naroci");
  });

  it("reuses English slugs under a path prefix for the additional languages", () => {
    expect(orderPath("de")).toBe("/de/order");
    expect(checkoutSuccessPath("nl")).toBe("/nl/order/success");
    expect(termsPath("es")).toBe("/es/terms-of-use");
    expect(privacyPath("it")).toBe("/it/privacy");
    expect(eventUseCasePath("fr", "poslovni-dogodki")).toBe("/fr/for-events/corporate-events");
  });

  it("switches languages from and to a prefixed locale", () => {
    expect(localizedMarketingPath("/de/for-events/weddings", "sl")).toBe("/za-dogodke/poroke");
    expect(localizedMarketingPath("/de/for-events/weddings", "fr")).toBe("/fr/for-events/weddings");
    expect(localizedMarketingPath("/za-dogodke/poroke", "de")).toBe("/de/for-events/weddings");
    expect(localizedMarketingPath("/de/order", "en")).toBe("/order");
    expect(localizedMarketingPath("/", "de")).toBe("/de");
    expect(localizedMarketingPath("/de", "sl")).toBe("/");
  });

  it("reduces any localized path back to the internal Slovenian route", () => {
    expect(slovenianRoutePath("/de/order")).toBe("/naroci");
    expect(slovenianRoutePath("/nl/for-events/birthdays")).toBe("/za-dogodke/rojstni-dnevi");
    expect(slovenianRoutePath("/es/downloads/abc")).toBe("/prenosi/abc");
    expect(slovenianRoutePath("/naroci")).toBe("/naroci");
    expect(slovenianRoutePath("/de/unknown")).toBe("/unknown");
  });
});
