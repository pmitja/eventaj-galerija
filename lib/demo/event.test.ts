import { describe, expect, it } from "vitest";
import { demoEventPhotosFor } from "./event";

describe("localized demo event", () => {
  it("keeps Slovenian comments and localizes curated comments elsewhere", () => {
    expect(demoEventPhotosFor("sl")[4].comments[0]?.body).toBe("Ta ples je bil tako lep.");
    expect(demoEventPhotosFor("de")[4].comments[0]?.body).toBe("Dieser Tanz war so schön.");
  });
});
