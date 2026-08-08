import { describe, expect, it } from "vitest";
import { localizedMarketingScreenshot } from "./marketing-assets";

describe("localized marketing screenshots", () => {
  it("keeps Slovenian assets and inserts other locale folders", () => {
    const source = "/marketing/screenshots/gallery-mobile.png";

    expect(localizedMarketingScreenshot("sl", source)).toBe(source);
    expect(localizedMarketingScreenshot("de", source)).toBe("/marketing/screenshots/de/gallery-mobile.png");
  });
});
