import { describe, expect, it } from "vitest";
import { appUrlForLocale, localeFromHostname, localeFromRequest } from "./locale";

const env = {
  PUBLIC_APP_URL: "https://galerija.eventaj.si/",
  PUBLIC_APP_URL_EN: "https://gallery.eventaj.si/",
};

describe("domain locale", () => {
  it("keeps Slovenian as the safe default", () => {
    expect(localeFromHostname("galerija.eventaj.si", env.PUBLIC_APP_URL_EN)).toBe("sl");
    expect(localeFromHostname("unknown.example", env.PUBLIC_APP_URL_EN)).toBe("sl");
  });

  it("recognizes the configured English domain and local development host", () => {
    expect(localeFromHostname("www.gallery.eventaj.si", env.PUBLIC_APP_URL_EN)).toBe("en");
    expect(localeFromHostname("en.localhost:3000", env.PUBLIC_APP_URL_EN)).toBe("en");
    expect(localeFromRequest(new Request("https://gallery.eventaj.si/naroci"), env.PUBLIC_APP_URL_EN)).toBe("en");
  });

  it("builds links only from configured trusted origins", () => {
    expect(appUrlForLocale(env, "sl")).toBe("https://galerija.eventaj.si");
    expect(appUrlForLocale(env, "en")).toBe("https://gallery.eventaj.si");
  });
});
