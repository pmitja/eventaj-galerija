import { describe, expect, it } from "vitest";
import {
  appUrlForLocale,
  localeFromHostAndPath,
  localeFromHostname,
  localeFromPathname,
  localeFromRequest,
  siteUrlForLocale,
  stripLocalePrefix,
  withLocalePrefix,
} from "./locale";

const env = {
  PUBLIC_APP_URL: "https://galerija.eventaj.si/",
  PUBLIC_APP_URL_EN: "https://guestmosaic.com/",
};

describe("domain locale", () => {
  it("keeps Slovenian as the safe default", () => {
    expect(localeFromHostname("galerija.eventaj.si", env.PUBLIC_APP_URL_EN)).toBe("sl");
    expect(localeFromHostname("unknown.example", env.PUBLIC_APP_URL_EN)).toBe("sl");
  });

  it("recognizes the configured English domain and local development host", () => {
    expect(localeFromHostname("www.guestmosaic.com", env.PUBLIC_APP_URL_EN)).toBe("en");
    expect(localeFromHostname("en.localhost:3000", env.PUBLIC_APP_URL_EN)).toBe("en");
    expect(localeFromRequest(new Request("https://guestmosaic.com/naroci"), env.PUBLIC_APP_URL_EN)).toBe("en");
  });

  it("builds links only from configured trusted origins", () => {
    expect(appUrlForLocale(env, "sl")).toBe("https://galerija.eventaj.si");
    expect(appUrlForLocale(env, "en")).toBe("https://guestmosaic.com");
  });
});

describe("prefixed marketing locales", () => {
  it("reads a locale prefix only from the first path segment", () => {
    expect(localeFromPathname("/de/order")).toBe("de");
    expect(localeFromPathname("/fr")).toBe("fr");
    expect(localeFromPathname("/order/de")).toBeNull();
    expect(localeFromPathname("/")).toBeNull();
    expect(localeFromPathname("/deutsch/order")).toBeNull();
  });

  it("adds and strips prefixes symmetrically", () => {
    expect(withLocalePrefix("de", "/order")).toBe("/de/order");
    expect(withLocalePrefix("de", "/")).toBe("/de");
    expect(withLocalePrefix("en", "/order")).toBe("/order");
    expect(withLocalePrefix("sl", "/naroci")).toBe("/naroci");
    expect(stripLocalePrefix("/de/order")).toBe("/order");
    expect(stripLocalePrefix("/de")).toBe("/");
    expect(stripLocalePrefix("/order")).toBe("/order");
  });

  it("serves the additional languages from the English host only", () => {
    expect(localeFromHostAndPath("guestmosaic.com", "/de/order", env.PUBLIC_APP_URL_EN)).toBe("de");
    expect(localeFromHostAndPath("guestmosaic.com", "/order", env.PUBLIC_APP_URL_EN)).toBe("en");
    // A /de path on the Slovenian host is not a language, just an unknown page.
    expect(localeFromHostAndPath("galerija.eventaj.si", "/de/order", env.PUBLIC_APP_URL_EN)).toBe("sl");
    expect(localeFromRequest(new Request("https://guestmosaic.com/it/order"), env.PUBLIC_APP_URL_EN)).toBe("it");
  });

  it("keeps prefixed locales on the English origin but prefixes their canonical root", () => {
    expect(appUrlForLocale(env, "de")).toBe("https://guestmosaic.com");
    expect(siteUrlForLocale(env, "de")).toBe("https://guestmosaic.com/de");
    expect(siteUrlForLocale(env, "en")).toBe("https://guestmosaic.com");
    expect(siteUrlForLocale(env, "sl")).toBe("https://galerija.eventaj.si");
  });
});
