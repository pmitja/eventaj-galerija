import { describe, expect, it } from "vitest";
import {
  checkoutSuccessPath,
  eventUseCasePath,
  localizedMarketingPath,
  orderPath,
  privacyPath,
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
});
